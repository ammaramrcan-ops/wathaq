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

const openIDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("No IndexedDB"));
      return;
    }
    const req = window.indexedDB.open(IDB_NAME, 2);
    req.onupgradeneeded = () => {
      const idb = req.result;
      if (!idb.objectStoreNames.contains(IDB_STORE)) {
        idb.createObjectStore(IDB_STORE, { keyPath: "itemId" });
      }
      if (!idb.objectStoreNames.contains(IDB_USERS_STORE)) {
        idb.createObjectStore(IDB_USERS_STORE, { keyPath: "emailKey" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error("IndexedDB request failed"));
  });
};

export const saveIDBDeletedItem = async (itemId: string, itemType: "video" | "book"): Promise<void> => {
  try {
    const idb = await openIDB();
    const tx = idb.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).put({ itemId, itemType, timestamp: Date.now() });
  } catch {
    /* ignore IDB storage error */
  }
};

export const loadIDBDeletedItems = async (itemType: "video" | "book"): Promise<string[]> => {
  try {
    const idb = await openIDB();
    return new Promise((resolve) => {
      const tx = idb.transaction(IDB_STORE, "readonly");
      const req = tx.objectStore(IDB_STORE).getAll();
      req.onsuccess = () => {
        const records = req.result || [];
        const ids = records
          .filter((r: { itemType?: string }) => !r.itemType || r.itemType === itemType)
          .map((r: { itemId: string }) => r.itemId);
        resolve(ids);
      };
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
};

export const saveIDBUser = async (userRec: { uid: string; displayName: string; email: string; photoURL?: string | null; provider: string; lastLogin?: string }): Promise<void> => {
  try {
    if (!userRec.email) return;
    const idb = await openIDB();
    const tx = idb.transaction(IDB_USERS_STORE, "readwrite");
    tx.objectStore(IDB_USERS_STORE).put({ ...userRec, emailKey: userRec.email.toLowerCase() });
  } catch {
    /* ignore IDB user save error */
  }
};

export const loadIDBUsers = async (): Promise<unknown[]> => {
  try {
    const idb = await openIDB();
    return new Promise((resolve) => {
      const tx = idb.transaction(IDB_USERS_STORE, "readonly");
      const req = tx.objectStore(IDB_USERS_STORE).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
};

export const deleteIDBUser = async (email: string): Promise<void> => {
  try {
    if (!email) return;
    const idb = await openIDB();
    const tx = idb.transaction(IDB_USERS_STORE, "readwrite");
    tx.objectStore(IDB_USERS_STORE).delete(email.toLowerCase());
  } catch {
    /* ignore IDB user delete error */
  }
};

/**
 * Get locally stored deleted IDs for quick initial render
 */
export const getLocalDeletedIds = (itemType: "video" | "book"): string[] => {
  try {
    const key = itemType === "video" ? LOCAL_STORAGE_DELETED_VIDEOS : LOCAL_STORAGE_DELETED_BOOKS;
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
};

/**
 * Get locally stored custom content items
 */
export const getLocalCustomContent = (): CustomContentItem[] => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_CUSTOM) || "[]");
  } catch {
    return [];
  }
};

// In-memory UI subscriber registry for instant local updates
type DeletedSubscriber = (ids: string[]) => void;
type CustomSubscriber = (items: CustomContentItem[]) => void;

const deletedSubscribers = {
  video: new Set<DeletedSubscriber>(),
  book: new Set<DeletedSubscriber>()
};
const customSubscribers = new Set<CustomSubscriber>();

const notifyDeletedSubscribers = (itemType: "video" | "book"): void => {
  const currentIds = getLocalDeletedIds(itemType);
  deletedSubscribers[itemType].forEach((cb) => {
    try {
      cb(currentIds);
    } catch {
      /* ignore subscriber error */
    }
  });
};

const notifyCustomSubscribers = (): void => {
  const currentItems = getLocalCustomContent();
  customSubscribers.forEach((cb) => {
    try {
      cb(currentItems);
    } catch {
      /* ignore subscriber error */
    }
  });
};

export const clearLocalUserSessionData = async (): Promise<void> => {
  try {
    localStorage.removeItem(LOCAL_STORAGE_CUSTOM);
    localStorage.removeItem(LOCAL_STORAGE_DELETED_VIDEOS);
    localStorage.removeItem(LOCAL_STORAGE_DELETED_BOOKS);
    localStorage.removeItem("wathaq_deleted_teachers");
    localStorage.removeItem("wathaq_teachers");
    localStorage.removeItem("wathaq_users_permissions_map");
    localStorage.removeItem("wathaq_persisted_user");
    localStorage.removeItem("wathaq_registered_google_users");
  } catch {
    /* ignore storage cleanup error */
  }

  try {
    const idb = await openIDB();
    const tx = idb.transaction([IDB_STORE, IDB_USERS_STORE], "readwrite");
    tx.objectStore(IDB_STORE).clear();
    tx.objectStore(IDB_USERS_STORE).clear();
  } catch {
    /* ignore IDB cleanup error */
  }

  // Notify UI subscribers to immediately reset active state upon logout
  try {
    notifyDeletedSubscribers("video");
    notifyDeletedSubscribers("book");
    notifyCustomSubscribers();
  } catch {
    /* ignore notification error */
  }
};

// Helper: Local storage & IndexedDB state update for item deletion
const markItemAsDeletedLocal = async (itemId: string, itemType: "video" | "book"): Promise<void> => {
  try {
    const key = itemType === "video" ? LOCAL_STORAGE_DELETED_VIDEOS : LOCAL_STORAGE_DELETED_BOOKS;
    const current = getLocalDeletedIds(itemType);
    if (!current.includes(itemId)) {
      const updated = [...current, itemId];
      localStorage.setItem(key, JSON.stringify(updated));
    }

    await saveIDBDeletedItem(itemId, itemType);

    const custom = getLocalCustomContent();
    const updatedCustom = custom.filter((item) => item.id !== itemId);
    localStorage.setItem(LOCAL_STORAGE_CUSTOM, JSON.stringify(updatedCustom));

    notifyDeletedSubscribers(itemType);
    notifyCustomSubscribers();
  } catch (err: unknown) {
    console.warn("LocalStorage delete write warning:", err);
  }
};

// Helper: Cloud Firestore sync for item deletion
const markItemAsDeletedCloud = async (itemId: string, itemType: "video" | "book", effectiveUid: string): Promise<void> => {
  try {
    const deleteRecord = {
      itemId,
      itemType,
      deletedAt: new Date().toISOString(),
      deletedBy: effectiveUid
    };

    try {
      const globalDeletedRef = doc(db, "global_deleted_items", itemId);
      await setDoc(globalDeletedRef, deleteRecord);
    } catch (gErr: unknown) {
      const errObj = gErr instanceof Error ? (gErr as Error & { code?: string }) : null;
      const errCode = errObj?.code;
      const errMessage = errObj?.message || (typeof gErr === "string" ? gErr : "");
      if (errCode === "permission-denied" || errMessage.includes("permission")) {
        console.warn("🔒 عملية الحذف العام متوقفة للضيوف وغير المسؤولين (تتطلب صلاحية الأدمن في Firestore Rules).");
      } else {
        console.warn("Global deleted Firestore write error:", gErr);
      }
    }

    try {
      const userDeletedRef = doc(db, "users", effectiveUid, "deleted_items", itemId);
      await setDoc(userDeletedRef, deleteRecord);
    } catch (uErr: unknown) {
      console.warn("User deleted Firestore write error:", uErr);
    }

    const customDocRef = doc(db, "custom_content", itemId);
    await deleteDoc(customDocRef).catch(() => undefined);
  } catch (err: unknown) {
    console.warn("Firestore sync markItemAsDeleted warning:", err);
  }
};

/**
 * Save a deleted item (video or book) to Firestore & IndexedDB & LocalStorage
 */
export const markItemAsDeleted = async (
  itemId: string,
  itemType: "video" | "book",
  userId?: string,
  _isAdmin = false
): Promise<void> => {
  await markItemAsDeletedLocal(itemId, itemType);
  const effectiveUid = userId || auth.currentUser?.uid;
  if (effectiveUid) {
    await markItemAsDeletedCloud(itemId, itemType, effectiveUid);
  }
};

/**
 * Subscribe to deleted IDs from Firestore & IndexedDB & LocalStorage
 */
export const subscribeDeletedItems = (
  itemType: "video" | "book",
  userId: string | undefined,
  onUpdate: (deletedIds: string[]) => void
): (() => void) => {
  const key = itemType === "video" ? LOCAL_STORAGE_DELETED_VIDEOS : LOCAL_STORAGE_DELETED_BOOKS;

  deletedSubscribers[itemType].add(onUpdate);

  const localIds = getLocalDeletedIds(itemType);
  onUpdate(localIds);

  const collectedIds = new Set<string>(localIds);
  const effectiveUid = userId || auth.currentUser?.uid;

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
        /* ignore storage write error */
      }
      onUpdate(combined);
    }
  });

  let unsubGlobal: (() => void) | null = null;
  let unsubUser: (() => void) | null = null;

  try {
    const globalCol = collection(db, "global_deleted_items");
    unsubGlobal = onSnapshot(
      globalCol,
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
          /* ignore storage write error */
        }
        onUpdate(combined);
      },
      (err) => console.warn("Firestore global deleted listener warning:", err)
    );

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
            /* ignore storage write error */
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
};

// Helper: Save custom content to Cloud Firestore
const saveCustomContentCloud = async (itemWithUser: CustomContentItem): Promise<void> => {
  try {
    const docRef = doc(db, "custom_content", itemWithUser.id);
    await setDoc(docRef, itemWithUser);

    if (itemWithUser.userId) {
      const userDocRef = doc(db, "users", itemWithUser.userId, "custom_content", itemWithUser.id);
      await setDoc(userDocRef, itemWithUser).catch((e) => console.warn("User custom content subcollection write warning:", e));
    }
  } catch (err: unknown) {
    console.error("Firestore addCustomContent error:", err);
    throw new Error("فشل حفظ المحتوى على السيرفر سحابياً. يرجى التأكد من صلاحية الحساب أو إعادة المحاولة.");
  }
};

// Helper: Save custom content to LocalStorage
const saveCustomContentLocal = (itemWithUser: CustomContentItem): void => {
  try {
    const existing = getLocalCustomContent();
    const updated = [itemWithUser, ...existing.filter((i) => i.id !== itemWithUser.id)];
    localStorage.setItem(LOCAL_STORAGE_CUSTOM, JSON.stringify(updated));
    notifyCustomSubscribers();
  } catch (err) {
    console.warn("LocalStorage custom content write warning:", err);
  }
};

/**
 * Add custom content to Firestore & LocalStorage & notify subscribers
 */
export const addCustomContent = async (
  item: CustomContentItem,
  userId?: string
): Promise<void> => {
  const effectiveUid = userId || auth.currentUser?.uid;
  const itemWithUser: CustomContentItem = {
    ...item,
    ...(effectiveUid ? { userId: effectiveUid } : {})
  };

  await saveCustomContentCloud(itemWithUser);
  saveCustomContentLocal(itemWithUser);
};

/**
 * Subscribe to custom content from Firestore & LocalStorage with instant local updates
 */
export const subscribeCustomContent = (
  userId: string | undefined,
  onUpdate: (items: CustomContentItem[]) => void
): (() => void) => {
  customSubscribers.add(onUpdate);

  const localItems = getLocalCustomContent();
  onUpdate(localItems);

  let unsub: (() => void) | null = null;

  try {
    const customCol = collection(db, "custom_content");
    unsub = onSnapshot(
      customCol,
      (snap) => {
        const fetchedItems: CustomContentItem[] = snap.docs.map((d) => d.data() as CustomContentItem);
        const combinedMap = new Map<string, CustomContentItem>();
        localItems.forEach((item) => combinedMap.set(item.id, item));
        fetchedItems.forEach((item) => combinedMap.set(item.id, item));

        const resultList = Array.from(combinedMap.values());
        try {
          localStorage.setItem(LOCAL_STORAGE_CUSTOM, JSON.stringify(resultList));
        } catch {
          /* ignore storage write error */
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
};

/**
 * Approve a pending custom content item in Firestore & LocalStorage
 */
export const approveCustomContent = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, "custom_content", id);
    await setDoc(docRef, { status: "approved" }, { merge: true });
  } catch (err: unknown) {
    console.error("Firestore approveCustomContent error:", err);
    throw new Error("فشل الموافقة على المحتوى سحابياً (تتطلب صلاحية الأدمن).");
  }

  try {
    const current = getLocalCustomContent();
    const updated = current.map((item) => (item.id === id ? { ...item, status: "approved" as const } : item));
    localStorage.setItem(LOCAL_STORAGE_CUSTOM, JSON.stringify(updated));
    notifyCustomSubscribers();
  } catch (err: unknown) {
    console.warn("LocalStorage approveCustomContent warning:", err);
  }
};

/**
 * Delete a custom content item from Firestore & LocalStorage
 */
export const deleteCustomContent = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, "custom_content", id);
    await deleteDoc(docRef);
  } catch (err: unknown) {
    console.error("Firestore deleteCustomContent error:", err);
    throw new Error("فشل حذف المحتوى سحابياً (تتطلب صلاحية الأدمن أو المالك).");
  }

  try {
    const current = getLocalCustomContent();
    const updated = current.filter((item) => item.id !== id);
    localStorage.setItem(LOCAL_STORAGE_CUSTOM, JSON.stringify(updated));
    notifyCustomSubscribers();
  } catch (err: unknown) {
    console.warn("LocalStorage deleteCustomContent warning:", err);
  }
};
