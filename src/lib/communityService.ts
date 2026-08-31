import { db } from "./firebase";
import { collection, doc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";

export interface Discussion {
  id: string;
  title: string;
  author: string;
  authorEmail?: string;
  authorUid?: string;
  category: "advice" | "question";
  subjectId?: string;
  replies: number;
  time: string;
  excerpt: string;
  tags: string[];
}

// 100% Dynamic - No Hardcoded Default Discussions
export const DEFAULT_DISCUSSIONS: Discussion[] = [];

const LOCAL_STORAGE_DISCUSSIONS = "wathaq_community_discussions_v2";
const LOCAL_STORAGE_DELETED_DISCUSSIONS = "wathaq_deleted_discussions";

// IndexedDB Helper for Community Discussions
const IDB_NAME = "wathaq_durable_storage";
const IDB_DISCUSSIONS_STORE = "community_discussions_store";

function openIDBCommunity(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) return reject("No IndexedDB");
    const req = window.indexedDB.open(IDB_NAME, 5);
    req.onupgradeneeded = (e: IDBVersionChangeEvent) => {
      const idb = req.result;
      if (!idb.objectStoreNames.contains(IDB_DISCUSSIONS_STORE)) {
        idb.createObjectStore(IDB_DISCUSSIONS_STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveIDBDiscussion(post: Discussion): Promise<void> {
  try {
    const idb = await openIDBCommunity();
    const tx = idb.transaction(IDB_DISCUSSIONS_STORE, "readwrite");
    tx.objectStore(IDB_DISCUSSIONS_STORE).put(post);
  } catch (e) {
    // empty
  }
}

async function deleteIDBDiscussion(id: string): Promise<void> {
  try {
    const idb = await openIDBCommunity();
    const tx = idb.transaction(IDB_DISCUSSIONS_STORE, "readwrite");
    tx.objectStore(IDB_DISCUSSIONS_STORE).delete(id);
  } catch (e) {
    /* ignore IDB error */
  }
}

export function getStoredDeletedDiscussions(): string[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_DELETED_DISCUSSIONS);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

export function markDiscussionAsDeleted(id: string): void {
  try {
    const current = getStoredDeletedDiscussions();
    if (!current.includes(id)) {
      const updated = [...current, id];
      localStorage.setItem(LOCAL_STORAGE_DELETED_DISCUSSIONS, JSON.stringify(updated));
    }
  } catch (e) {
    // empty
  }
}

/**
 * Retrieve saved discussions from LocalStorage
 */
export function getStoredDiscussions(): Discussion[] {
  const deletedIds = getStoredDeletedDiscussions();
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_DISCUSSIONS);
    if (!saved) return [];
    const customList: Discussion[] = JSON.parse(saved);
    return customList.filter((d) => !deletedIds.includes(d.id) && !["d1", "d2"].includes(d.id));
  } catch (e) {
    return [];
  }
}

/**
 * Add a new community discussion/question and sync to Cloud Firestore
 */
export async function addDiscussion(post: Discussion): Promise<Discussion> {
  // 1. Save to Cloud Firestore FIRST (server authorization check)
  try {
    const docRef = doc(db, "discussions", post.id);
    await setDoc(docRef, { ...post, createdAt: new Date().toISOString() }, { merge: true });
  } catch (err: unknown) {
    console.error("Firestore add discussion error:", err);
    throw new Error("فشل إرسال السؤال سحابياً. يرجى التأكد من تسجيل الدخول أو قوة الاتصال.");
  }

  // 2. Save to LocalStorage & IndexedDB ONLY after Cloud Firestore succeeds
  try {
    const current = getStoredDiscussions();
    const updated = [post, ...current.filter((d) => d.id !== post.id)];
    localStorage.setItem(LOCAL_STORAGE_DISCUSSIONS, JSON.stringify(updated));
    await saveIDBDiscussion(post);
  } catch (e: unknown) {
    console.warn("LocalStorage discussion write warning:", e);
  }

  return post;
}

/**
 * Delete a community discussion and sync deletion to Cloud Firestore */
export async function deleteDiscussion(id: string): Promise<void> {
  // 1. Delete from Cloud Firestore FIRST (Server authorization check)
  try {
    await deleteDoc(doc(db, "discussions", id));

    // Save global deletion marker in Firestore ONLY if authorized (Admin), fail silently for standard users
    try {
      const globalMarkerRef = doc(db, "global_deleted_items", `disc-${id}`);
      await setDoc(globalMarkerRef, {
        itemId: `disc-${id}`,
        discussionId: id,
        itemType: "discussion",
        timestamp: new Date().toISOString()
      });
    } catch (gErr) {
      // Non-admins cannot write to global_deleted_items; snapshot on 'discussions' handles deletion across clients natively
    }
  } catch (err: unknown) {
    console.error("Firestore delete discussion error:", err);
    throw new Error("فشل حذف المنشور سحابياً (تتطلب ملكية المنشور أو صلاحية الأدمن).");
  }

  // 2. Update LocalStorage & IndexedDB ONLY after Cloud deletion succeeds
  markDiscussionAsDeleted(id);
  await deleteIDBDiscussion(id);

  try {
    const current = getStoredDiscussions();
    const updated = current.filter((d) => d.id !== id);
    localStorage.setItem(LOCAL_STORAGE_DISCUSSIONS, JSON.stringify(updated));
  } catch (e) {
    // empty
  }
}

/**
 * Real-time subscription to community discussions from Cloud Firestore
 */
export function subscribeDiscussions(onUpdate: (discussions: Discussion[]) => void): () => void {
  try {
    localStorage.removeItem("wathaq_community_discussions");
  } catch (e) {
    // empty
  }

  onUpdate(getStoredDiscussions());

  let unsubDiscussions: (() => void) | null = null;
  let unsubDeleted: (() => void) | null = null;

  try {
    // 1. Listen to global deleted items snapshot
    const deletedCol = collection(db, "global_deleted_items");
    unsubDeleted = onSnapshot(deletedCol, (snap) => {
      let changed = false;
      snap.docs.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.itemType === "discussion" && data.discussionId) {
          markDiscussionAsDeleted(data.discussionId);
          changed = true;
        }
      });
      if (changed) {
        onUpdate(getStoredDiscussions());
      }
    });

    // 2. Listen to discussions Firestore collection snapshot
    const discCol = collection(db, "discussions");
    unsubDiscussions = onSnapshot(
      discCol,
      (snap) => {
        const deletedIds = getStoredDeletedDiscussions();
        const cloudMap = new Map<string, Discussion>();

        // Merge Firestore snapshot items
        snap.docs.forEach((docSnap) => {
          const data = docSnap.data() as Discussion;
          const docId = data.id || docSnap.id;
          if (!deletedIds.includes(docId) && !["d1", "d2"].includes(docId)) {
            cloudMap.set(docId, {
              ...data,
              id: docId
            });
          }
        });

        const updatedList = Array.from(cloudMap.values());
        try {
          localStorage.setItem(LOCAL_STORAGE_DISCUSSIONS, JSON.stringify(updatedList));
          updatedList.forEach((d) => saveIDBDiscussion(d));
        } catch (e) {
          // empty
        }

        onUpdate(updatedList);
      },
      (err) => {
        console.warn("Discussions snapshot warning:", err);
        onUpdate(getStoredDiscussions());
      }
    );
  } catch (e) {
    onUpdate(getStoredDiscussions());
  }

  return () => {
    if (unsubDiscussions) unsubDiscussions();
    if (unsubDeleted) unsubDeleted();
  };
}
