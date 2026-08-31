import { db, auth } from "./firebase";
import { collection, doc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";

export interface CustomContentItem {
  id: string;
  title: string;
  subject: string;
  contentType: "book" | "video" | "flashcards" | "mindmaps";
  linkUrl: string;
  image?: string;
  description?: string;
  status: "approved" | "pending";
  uploaderName: string;
  createdAt: string;
  userId?: string;
}

const LOCAL_STORAGE_CUSTOM = "wathaq_custom_content";
const LOCAL_STORAGE_DELETED_VIDEOS = "wathaq_deleted_videos";
const LOCAL_STORAGE_DELETED_BOOKS = "wathaq_deleted_books";

// Native IndexedDB durable persistence helper
const IDB_NAME = "wathaq_durable_storage";
const IDB_STORE = "deleted_items_store";
const IDB_USERS_STORE = "users_store";

function openIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) return reject("No IndexedDB");
    const req = window.indexedDB.open(IDB_NAME, 2);
    req.onupgradeneeded = (e: any) => {
      const idb = req.result;
      if (!idb.objectStoreNames.contains(IDB_STORE)) {
        idb.createObjectStore(IDB_STORE, { keyPath: "itemId" });
      }
      if (!idb.objectStoreNames.contains(IDB_USERS_STORE)) {
        idb.createObjectStore(IDB_USERS_STORE, { keyPath: "emailKey" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveIDBDeletedItem(itemId: string, itemType: "video" | "book"): Promise<void> {
  try {
    const idb = await openIDB();
    const tx = idb.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).put({ itemId, itemType, timestamp: Date.now() });
  } catch (e) {
    // empty
  }
}

export async function loadIDBDeletedItems(itemType: "video" | "book"): Promise<string[]> {
  try {
    const idb = await openIDB();
    return new Promise((resolve) => {
      const tx = idb.transaction(IDB_STORE, "readonly");
      const req = tx.objectStore(IDB_STORE).getAll();
      req.onsuccess = () => {
        const records = req.result || [];
        const ids = records
          .filter((r: any) => !r.itemType || r.itemType === itemType)
          .map((r: any) => r.itemId);
        resolve(ids);
      };
      req.onerror = () => resolve([]);
    });
  } catch (e) {
    return [];
  }
}

export async function saveIDBUser(userRec: { uid: string; displayName: string; email: string; photoURL?: string | null; provider: string; lastLogin?: string }): Promise<void> {
  try {
    if (!userRec.email) return;
    const idb = await openIDB();
    const tx = idb.transaction(IDB_USERS_STORE, "readwrite");
    tx.objectStore(IDB_USERS_STORE).put({ ...userRec, emailKey: userRec.email.toLowerCase() });
  } catch (e) {
    // empty
  }
}

export async function loadIDBUsers(): Promise<any[]> {
  try {
    const idb = await openIDB();
    return new Promise((resolve) => {
      const tx = idb.transaction(IDB_USERS_STORE, "readonly");
      const req = tx.objectStore(IDB_USERS_STORE).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch (e) {
    return [];
  }
}

export async function deleteIDBUser(email: string): Promise<void> {
  try {
    if (!email) return;
    const idb = await openIDB();
    const tx = idb.transaction(IDB_USERS_STORE, "readwrite");
    tx.objectStore(IDB_USERS_STORE).delete(email.toLowerCase());
  } catch (e) {
    // empty
  }
}

export async function clearLocalUserSessionData(): Promise<void> {
  try {
    localStorage.removeItem(LOCAL_STORAGE_CUSTOM);
    localStorage.removeItem(LOCAL_STORAGE_DELETED_VIDEOS);
    localStorage.removeItem(LOCAL_STORAGE_DELETED_BOOKS);
    localStorage.removeItem("wathaq_deleted_teachers");
    localStorage.removeItem("wathaq_teachers");
    localStorage.removeItem("wathaq_users_permissions_map");
    localStorage.removeItem("wathaq_persisted_user");
    localStorage.removeItem("wathaq_registered_google_users");
  } catch (e) {
    // empty
  }

  try {
    const idb = await openIDB();
    const tx = idb.transaction([IDB_STORE, IDB_USERS_STORE], "readwrite");
    tx.objectStore(IDB_STORE).clear();
    tx.objectStore(IDB_USERS_STORE).clear();
  } catch (e) {
    // empty
  }

  // Notify UI subscribers to immediately reset active state upon logout
  try {
    notifyDeletedSubscribers("video");
    notifyDeletedSubscribers("book");
    notifyCustomSubscribers();
  } catch (e) {
    // empty
  }
}

// In-memory UI subscriber registry for instant local updates
type DeletedSubscriber = (ids: string[]) => void;
type CustomSubscriber = (items: CustomContentItem[]) => void;

const deletedSubscribers = {
  video: new Set<DeletedSubscriber>(),
  book: new Set<DeletedSubscriber>()
};
const customSubscribers = new Set<CustomSubscriber>();

function notifyDeletedSubscribers(itemType: "video" | "book") {
  const currentIds = getLocalDeletedIds(itemType);
  deletedSubscribers[itemType].forEach((cb) => {
    try {
      cb(currentIds);
    } catch {
      // empty
    }
  });
}

function notifyCustomSubscribers() {
  const currentItems = getLocalCustomContent();
  customSubscribers.forEach((cb) => {
    try {
      cb(currentItems);
    } catch {
      // empty
    }
  });
}

/**
 * Get locally stored deleted IDs for quick initial render
 */
export function getLocalDeletedIds(itemType: "video" | "book"): string[] {
  try {
    const key = itemType === "video" ? LOCAL_STORAGE_DELETED_VIDEOS : LOCAL_STORAGE_DELETED_BOOKS;
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

/**
 * Get locally stored custom content items
 */
export function getLocalCustomContent(): CustomContentItem[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_CUSTOM) || "[]");
  } catch {
    return [];
  }
}

/**
 * Save a deleted item (video or book) to Firestore & IndexedDB & LocalStorage
 */
export async function markItemAsDeleted(
  itemId: string,
  itemType: "video" | "book",
  userId?: string,
  isAdmin: boolean = false
): Promise<void> {
  // 1. Update LocalStorage & IndexedDB durable storage & notify UI state instantly
  try {
    const key = itemType === "video" ? LOCAL_STORAGE_DELETED_VIDEOS : LOCAL_STORAGE_DELETED_BOOKS;
    const current = getLocalDeletedIds(itemType);
    if (!current.includes(itemId)) {
      const updated = [...current, itemId];
      localStorage.setItem(key, JSON.stringify(updated));
    }

    // Save to IndexedDB durable store
    await saveIDBDeletedItem(itemId, itemType);

    // Also remove from custom content if it was a custom content item
    const custom = getLocalCustomContent();
    const updatedCustom = custom.filter((item) => item.id !== itemId);
    localStorage.setItem(LOCAL_STORAGE_CUSTOM, JSON.stringify(updatedCustom));

    // Instantly notify active React UI subscribers
    notifyDeletedSubscribers(itemType);
    notifyCustomSubscribers();
  } catch (err) {
    console.warn("LocalStorage delete write warning:", err);
  }

  // 2. Persist asynchronously to Firestore cloud database if user UID exists
  try {
    const effectiveUid = userId || auth.currentUser?.uid;
    if (!effectiveUid) return;

    const deleteRecord = {
      itemId,
      itemType,
      deletedAt: new Date().toISOString(),
      deletedBy: effectiveUid
    };

    // Global deletion in Firestore (ONLY succeeds if user is Admin, otherwise isolated locally)
    try {
      const globalDeletedRef = doc(db, "global_deleted_items", itemId);
      await setDoc(globalDeletedRef, deleteRecord);
    } catch (gErr: any) {
      if (gErr?.code === "permission-denied" || gErr?.message?.includes("permission")) {
        console.warn("🔒 عملية الحذف العام متوقفة للضيوف وغير المسؤولين (تتطلب صلاحية الأدمن في Firestore Rules).");
      } else {
        console.warn("Global deleted Firestore write error:", gErr);
      }
    }

    // User-isolated deletion record
    try {
      const userDeletedRef = doc(db, "users", effectiveUid, "deleted_items", itemId);
      await setDoc(userDeletedRef, deleteRecord);
    } catch (uErr) {
      console.warn("User deleted Firestore write error:", uErr);
    }

    // If custom content, attempt to remove from custom_content collection
    const customDocRef = doc(db, "custom_content", itemId);
    await deleteDoc(customDocRef).catch(() => {});
  } catch (err) {
    console.warn("Firestore sync markItemAsDeleted warning:", err);
  }
}

/**
 * Subscribe to deleted IDs from Firestore & IndexedDB & LocalStorage
 */
export function subscribeDeletedItems(
  itemType: "video" | "book",
  userId: string | undefined,
  onUpdate: (deletedIds: string[]) => void
): () => void {
  const key = itemType === "video" ? LOCAL_STORAGE_DELETED_VIDEOS : LOCAL_STORAGE_DELETED_BOOKS;

  // Register in-memory subscriber
  deletedSubscribers[itemType].add(onUpdate);

  // Immediately notify caller with cached IDs
  const localIds = getLocalDeletedIds(itemType);
  onUpdate(localIds);

  const collectedIds = new Set<string>(localIds);
  const effectiveUid = userId || auth.currentUser?.uid;

  // Check IndexedDB durable backup (restores deleted IDs if LocalStorage was cleared)
  loadIDBDeletedItems(itemType).then((idbIds) => {
    let changed = false;
    idbIds.forEach((id) => {
      if (!collectedIds.has(id)) {
        collectedIds.add(id);
        changed = true;
      }
    });

    if (changed) {
      const combined = Array.from(collectedIds);
      try {
        localStorage.setItem(key, JSON.stringify(combined));
      } catch {
        // empty
      }
      onUpdate(combined);
    }
  });

  let unsubGlobal: (() => void) | null = null;
  let unsubUser: (() => void) | null = null;

  try {
    // 1. Subscribe to Global Deleted Items from Firestore
    const globalCol = collection(db, "global_deleted_items");
    unsubGlobal = onSnapshot(
      globalCol,
      (snap) => {
        snap.docs.forEach((docSnap) => {
          const data = docSnap.data();
          if (!data.itemType || data.itemType === itemType) {
            collectedIds.add(docSnap.id);
            // Backup cloud deletion to IndexedDB
            saveIDBDeletedItem(docSnap.id, itemType);
          }
        });
        const combined = Array.from(collectedIds);
        try {
          localStorage.setItem(key, JSON.stringify(combined));
        } catch { /* empty */ }
        onUpdate(combined);
      },
      (err) => console.warn("Firestore global deleted listener warning:", err)
    );

    // 2. Subscribe to User Isolated Deleted Items from Firestore ONLY if a valid UID exists
    if (effectiveUid) {
      const userDeletedCol = collection(db, "users", effectiveUid, "deleted_items");
      unsubUser = onSnapshot(
        userDeletedCol,
        (snap) => {
          snap.docs.forEach((docSnap) => {
            const data = docSnap.data();
            if (!data.itemType || data.itemType === itemType) {
              collectedIds.add(docSnap.id);
              saveIDBDeletedItem(docSnap.id, itemType);
            }
          });
          const combined = Array.from(collectedIds);
          try {
            localStorage.setItem(key, JSON.stringify(combined));
          } catch {
            // empty
          }
          onUpdate(combined);
        },
        (err) => console.warn("Firestore user deleted listener warning:", err)
      );
    }
  } catch (err) {
    console.warn("Firestore listener setup warning:", err);
  }

  return () => {
    deletedSubscribers[itemType].delete(onUpdate);
    if (unsubGlobal) unsubGlobal();
    if (unsubUser) unsubUser();
  };
}

/**
 * Add custom content to Firestore & LocalStorage & notify subscribers
 */
export async function addCustomContent(
  item: CustomContentItem,
  userId?: string
): Promise<void> {
  const effectiveUid = userId || auth.currentUser?.uid;
  const itemWithUser: CustomContentItem = {
    ...item,
    ...(effectiveUid ? { userId: effectiveUid } : {})
  };

  // 1. Save to Cloud Firestore FIRST
  try {
    const docRef = doc(db, "custom_content", itemWithUser.id);
    await setDoc(docRef, itemWithUser);

    if (itemWithUser.userId) {
      const userDocRef = doc(db, "users", itemWithUser.userId, "custom_content", itemWithUser.id);
      await setDoc(userDocRef, itemWithUser).catch((e) => console.warn("User custom content subcollection write warning:", e));
    }
  } catch (err: any) {
    console.error("Firestore addCustomContent error:", err);
    throw new Error("فشل حفظ المحتوى على السيرفر سحابياً. يرجى التأكد من صلاحية الحساب أو إعادة المحاولة.");
  }

  // 2. Save to LocalStorage & notify React UI state ONLY after Firestore succeeds
  try {
    const existing = getLocalCustomContent();
    const updated = [itemWithUser, ...existing.filter((i) => i.id !== item.id)];
    localStorage.setItem(LOCAL_STORAGE_CUSTOM, JSON.stringify(updated));
    notifyCustomSubscribers();
  } catch (err) {
    console.warn("LocalStorage custom content write warning:", err);
  }
}

/**
 * Subscribe to custom content from Firestore & LocalStorage with instant local updates
 */
export function subscribeCustomContent(
  userId: string | undefined,
  onUpdate: (items: CustomContentItem[]) => void
): () => void {
  // Register in-memory subscriber
  customSubscribers.add(onUpdate);

  // Immediately notify with local cache
  const localItems = getLocalCustomContent();
  onUpdate(localItems);

  let unsub: (() => void) | null = null;

  try {
    const customCol = collection(db, "custom_content");
    unsub = onSnapshot(
      customCol,
      (snap) => {
        const fetchedItems: CustomContentItem[] = snap.docs.map((d) => d.data() as CustomContentItem);
        // Combine with local items (prioritizing remote fresh data)
        const combinedMap = new Map<string, CustomContentItem>();
        localItems.forEach((item) => combinedMap.set(item.id, item));
        fetchedItems.forEach((item) => combinedMap.set(item.id, item));

        const resultList = Array.from(combinedMap.values());
        try {
          localStorage.setItem(LOCAL_STORAGE_CUSTOM, JSON.stringify(resultList));
        } catch {
          // empty
        }
        onUpdate(resultList);
      },
      (err) => console.warn("Firestore custom content listener warning:", err)
    );
  } catch (err) {
    console.warn("Firestore custom content setup warning:", err);
  }

  return () => {
    customSubscribers.delete(onUpdate);
    if (unsub) unsub();
  };
}

/**
 * Approve a pending custom content item in Firestore & LocalStorage
 */
export async function approveCustomContent(id: string): Promise<void> {
  // 1. Persist status: "approved" to Firestore Cloud FIRST
  try {
    const docRef = doc(db, "custom_content", id);
    await setDoc(docRef, { status: "approved" }, { merge: true });
  } catch (err: any) {
    console.error("Firestore approveCustomContent error:", err);
    throw new Error("فشل الموافقة على المحتوى سحابياً (تتطلب صلاحية الأدمن).");
  }

  // 2. Update LocalStorage & notify React UI state
  try {
    const current = getLocalCustomContent();
    const updated = current.map((item) => (item.id === id ? { ...item, status: "approved" as const } : item));
    localStorage.setItem(LOCAL_STORAGE_CUSTOM, JSON.stringify(updated));
    notifyCustomSubscribers();
  } catch (err) {
    console.warn("LocalStorage approveCustomContent warning:", err);
  }
}

/**
 * Delete a custom content item from Firestore & LocalStorage
 */
export async function deleteCustomContent(id: string): Promise<void> {
  // 1. Delete document from Firestore Cloud FIRST
  try {
    const docRef = doc(db, "custom_content", id);
    await deleteDoc(docRef);
  } catch (err: any) {
    console.error("Firestore deleteCustomContent error:", err);
    throw new Error("فشل حذف المحتوى سحابياً (تتطلب صلاحية الأدمن أو المالك).");
  }

  // 2. Update LocalStorage & notify React UI state
  try {
    const current = getLocalCustomContent();
    const updated = current.filter((item) => item.id !== id);
    localStorage.setItem(LOCAL_STORAGE_CUSTOM, JSON.stringify(updated));
    notifyCustomSubscribers();
  } catch (err) {
    console.warn("LocalStorage deleteCustomContent warning:", err);
  }
}
