import { db } from "./firebase";
import { collection, doc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";

export interface SuggestionItem {
  id: string;
  title: string;
  details: string;
  userName: string;
  userEmail?: string;
  createdAt: string;
  status?: "new" | "reviewed";
}

const LOCAL_STORAGE_SUGGESTIONS = "wathaq_student_suggestions";
const LOCAL_STORAGE_DELETED_SUGGESTIONS = "wathaq_deleted_suggestions";

const IDB_NAME = "wathaq_durable_storage";
const IDB_SUGGESTIONS_STORE = "suggestions_store";

function openIDBSuggestions(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) return reject("No IndexedDB");
    const req = window.indexedDB.open(IDB_NAME, 6);
    req.onupgradeneeded = (e: IDBVersionChangeEvent) => {
      const idb = req.result;
      if (!idb.objectStoreNames.contains(IDB_SUGGESTIONS_STORE)) {
        idb.createObjectStore(IDB_SUGGESTIONS_STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveIDBSuggestion(item: SuggestionItem): Promise<void> {
  try {
    const idb = await openIDBSuggestions();
    const tx = idb.transaction(IDB_SUGGESTIONS_STORE, "readwrite");
    tx.objectStore(IDB_SUGGESTIONS_STORE).put(item);
  } catch (e) { /* empty */ }
}

export async function deleteIDBSuggestion(id: string): Promise<void> {
  try {
    const idb = await openIDBSuggestions();
    const tx = idb.transaction(IDB_SUGGESTIONS_STORE, "readwrite");
    tx.objectStore(IDB_SUGGESTIONS_STORE).delete(id);
  } catch (e) {
    // empty
  }
}

export async function loadIDBSuggestions(): Promise<SuggestionItem[]> {
  try {
    const idb = await openIDBSuggestions();
    return new Promise((resolve) => {
      const tx = idb.transaction(IDB_SUGGESTIONS_STORE, "readonly");
      const req = tx.objectStore(IDB_SUGGESTIONS_STORE).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch (e) {
    return [];
  }
}

export function getStoredDeletedSuggestions(): string[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_DELETED_SUGGESTIONS);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

export function markSuggestionAsDeleted(id: string): void {
  try {
    const deleted = getStoredDeletedSuggestions();
    if (!deleted.includes(id)) {
      const updated = [...deleted, id];
      localStorage.setItem(LOCAL_STORAGE_DELETED_SUGGESTIONS, JSON.stringify(updated));
    }
  } catch (e) {
    // empty
  }
}

export function getStoredSuggestions(): SuggestionItem[] {
  const deletedIds = getStoredDeletedSuggestions();
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_SUGGESTIONS);
    const list: SuggestionItem[] = saved ? JSON.parse(saved) : [];
    return list.filter((s) => !deletedIds.includes(s.id));
  } catch (e) {
    return [];
  }
}

/**
 * Submit a new student suggestion for platform improvement
 */
export async function addSuggestion(suggestion: SuggestionItem): Promise<SuggestionItem> {
  // 1. Save to Cloud Firestore FIRST (server authorization check)
  try {
    const docRef = doc(db, "suggestions", suggestion.id);
    await setDoc(docRef, { ...suggestion, createdAt: new Date().toISOString() }, { merge: true });
  } catch (err: unknown) {
    console.error("Firestore add suggestion error:", err);
    throw new Error("فشل إرسال الاقتراح سحابياً. يرجى إعادة المحاولة.");
  }

  // 2. Save to LocalStorage & IndexedDB ONLY after Cloud Firestore succeeds
  try {
    const current = getStoredSuggestions();
    const updated = [suggestion, ...current.filter((s) => s.id !== suggestion.id)];
    localStorage.setItem(LOCAL_STORAGE_SUGGESTIONS, JSON.stringify(updated));
    await saveIDBSuggestion(suggestion);
  } catch (e: unknown) {
    console.warn("LocalStorage suggestion write warning:", e);
  }

  return suggestion;
}

/**
 * Delete a student suggestion
 */
export async function deleteSuggestion(id: string): Promise<void> {
  // 1. Delete from Cloud Firestore FIRST (server authorization check)
  try {
    await deleteDoc(doc(db, "suggestions", id));
    await setDoc(doc(db, "global_deleted_items", `sug-${id}`), {
      itemId: `sug-${id}`,
      suggestionId: id,
      itemType: "suggestion",
      deletedAt: new Date().toISOString()
    }, { merge: true }).catch(() => {
      // empty
    });
  } catch (err: unknown) {
    console.error("Firestore delete suggestion error:", err);
    throw new Error("فشل حذف الاقتراح سحابياً (تتطلب صلاحية الأدمن المصرح له).");
  }

  // 2. Update LocalStorage & IndexedDB ONLY after Cloud deletion succeeds
  markSuggestionAsDeleted(id);
  await deleteIDBSuggestion(id);

  try {
    const current = getStoredSuggestions();
    const updated = current.filter((s) => s.id !== id);
    localStorage.setItem(LOCAL_STORAGE_SUGGESTIONS, JSON.stringify(updated));
  } catch (e) {
    // empty
  }
}

/**
 * Subscribe to real-time student suggestions from Cloud Firestore
 */
export function subscribeSuggestions(onUpdate: (list: SuggestionItem[]) => void): () => void {
  onUpdate(getStoredSuggestions());

  loadIDBSuggestions().then((idbList) => {
    if (idbList.length > 0) {
      const deletedIds = getStoredDeletedSuggestions();
      const current = getStoredSuggestions();
      const map = new Map<string, SuggestionItem>();
      current.forEach((s) => map.set(s.id, s));
      idbList.forEach((s) => {
        if (!deletedIds.includes(s.id)) map.set(s.id, s);
      });
      const finalArr = Array.from(map.values());
      try {
        localStorage.setItem(LOCAL_STORAGE_SUGGESTIONS, JSON.stringify(finalArr));
      } catch (e) {
        // empty
      }
      onUpdate(finalArr);
    }
  });

  let unsubSuggestions: (() => void) | null = null;
  let unsubDeleted: (() => void) | null = null;

  try {
    const deletedCol = collection(db, "global_deleted_items");
    unsubDeleted = onSnapshot(deletedCol, (snap) => {
      let changed = false;
      snap.docs.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.itemType === "suggestion" && data.suggestionId) {
          markSuggestionAsDeleted(data.suggestionId);
          changed = true;
        }
      });
      if (changed) {
        onUpdate(getStoredSuggestions());
      }
    });

    const sugCol = collection(db, "suggestions");
    unsubSuggestions = onSnapshot(
      sugCol,
      (snap) => {
        const deletedIds = getStoredDeletedSuggestions();
        const sugMap = new Map<string, SuggestionItem>();

        snap.docs.forEach((docSnap) => {
          const data = docSnap.data() as SuggestionItem;
          const docId = data.id || docSnap.id;
          if (!deletedIds.includes(docId)) {
            sugMap.set(docId, {
              ...data,
              id: docId
            });
          }
        });

        const updatedList = Array.from(sugMap.values());
        try {
          localStorage.setItem(LOCAL_STORAGE_SUGGESTIONS, JSON.stringify(updatedList));
          updatedList.forEach((s) => saveIDBSuggestion(s));
        } catch (e) {
          // empty
        }

        onUpdate(updatedList);
      },
      (err) => console.warn("Suggestions snapshot warning:", err)
    );
  } catch (e) {
    // empty
  }

  return () => {
    if (unsubSuggestions) unsubSuggestions();
    if (unsubDeleted) unsubDeleted();
  };
}
