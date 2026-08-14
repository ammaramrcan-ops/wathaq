import { db } from "./firebase";
import { collection, doc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";

export interface Discussion {
  id: string;
  title: string;
  author: string;
  authorEmail?: string;
  authorUid?: string;
  subjectId?: string;
  category: "advice" | "question";
  replies: number;
  time: string;
  createdAt?: string;
  excerpt: string;
  tags: string[];
}

export const DEFAULT_DISCUSSIONS: Discussion[] = [
  {
    id: "d1",
    title: "أفضل جدول مراجعة نهائية للثانوية في 60 يوماً؟",
    author: "أحمد طارق",
    category: "advice",
    replies: 18,
    time: "منذ ساعتين",
    excerpt: "كيف تقسم يومك بين المواد العلمية والنظرية بدون توتر؟ إليك التجربة النمطية المثبتة...",
    tags: ["نصائح مراجعة", "تنظيم الوقت"]
  },
  {
    id: "d2",
    title: "طريقة إتقان قوانين كيرشوف في الفيزياء بدون تلعثم؟",
    author: "سارة علي",
    category: "question",
    subjectId: "physics",
    replies: 12,
    time: "منذ 4 ساعات",
    excerpt: "عند تطبيق القانون الثاني على العروة المغلقة، متى نختار الإشارة الموجبة والسالبة بدقة؟",
    tags: ["فيزياء", "قوانين كيرشوف"]
  }
];

const LOCAL_STORAGE_DISCUSSIONS = "wathaq_community_discussions";
const LOCAL_STORAGE_DELETED_DISCUSSIONS = "wathaq_deleted_discussions";

// IndexedDB Helper for Community Discussions
const IDB_NAME = "wathaq_durable_storage";
const IDB_DISCUSSIONS_STORE = "community_discussions_store";

function openIDBCommunity(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) return reject("No IndexedDB");
    const req = window.indexedDB.open(IDB_NAME, 5);
    req.onupgradeneeded = (e: any) => {
      const idb = req.result;
      if (!idb.objectStoreNames.contains(IDB_DISCUSSIONS_STORE)) {
        idb.createObjectStore(IDB_DISCUSSIONS_STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveIDBDiscussion(item: Discussion): Promise<void> {
  try {
    const idb = await openIDBCommunity();
    const tx = idb.transaction(IDB_DISCUSSIONS_STORE, "readwrite");
    tx.objectStore(IDB_DISCUSSIONS_STORE).put(item);
  } catch (e) {}
}

export async function deleteIDBDiscussion(id: string): Promise<void> {
  try {
    const idb = await openIDBCommunity();
    const tx = idb.transaction(IDB_DISCUSSIONS_STORE, "readwrite");
    tx.objectStore(IDB_DISCUSSIONS_STORE).delete(id);
  } catch (e) {}
}

export async function loadIDBDiscussions(): Promise<Discussion[]> {
  try {
    const idb = await openIDBCommunity();
    return new Promise((resolve) => {
      const tx = idb.transaction(IDB_DISCUSSIONS_STORE, "readonly");
      const req = tx.objectStore(IDB_DISCUSSIONS_STORE).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch (e) {
    return [];
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
    const deleted = getStoredDeletedDiscussions();
    if (!deleted.includes(id)) {
      const updated = [...deleted, id];
      localStorage.setItem(LOCAL_STORAGE_DELETED_DISCUSSIONS, JSON.stringify(updated));
    }
  } catch (e) {}
}

export function getStoredDiscussions(): Discussion[] {
  const deletedIds = getStoredDeletedDiscussions();
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_DISCUSSIONS);
    const customList: Discussion[] = saved ? JSON.parse(saved) : [];
    
    // Merge custom list and default discussions while filtering deleted IDs
    const mergedMap = new Map<string, Discussion>();
    DEFAULT_DISCUSSIONS.forEach((d) => {
      if (!deletedIds.includes(d.id)) mergedMap.set(d.id, d);
    });
    customList.forEach((d) => {
      if (!deletedIds.includes(d.id)) mergedMap.set(d.id, d);
    });

    return Array.from(mergedMap.values());
  } catch (e) {
    return DEFAULT_DISCUSSIONS.filter((d) => !deletedIds.includes(d.id));
  }
}

/**
 * Add a new community discussion/question and sync to Cloud Firestore
 */
export async function addDiscussion(post: Discussion): Promise<Discussion> {
  // 1. Save to LocalStorage & IndexedDB
  try {
    const current = getStoredDiscussions();
    const updated = [post, ...current.filter((d) => d.id !== post.id)];
    localStorage.setItem(LOCAL_STORAGE_DISCUSSIONS, JSON.stringify(updated));
    await saveIDBDiscussion(post);
  } catch (e) {}

  // 2. Save to Cloud Firestore
  try {
    const docRef = doc(db, "discussions", post.id);
    await setDoc(docRef, { ...post, createdAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.warn("Firestore add discussion warning:", err);
  }

  return post;
}

/**
 * Delete a community discussion and sync deletion to Cloud Firestore
 */
export async function deleteDiscussion(id: string): Promise<void> {
  // 1. Blacklist locally & delete from IndexedDB
  markDiscussionAsDeleted(id);
  await deleteIDBDiscussion(id);

  try {
    const current = getStoredDiscussions();
    const updated = current.filter((d) => d.id !== id);
    localStorage.setItem(LOCAL_STORAGE_DISCUSSIONS, JSON.stringify(updated));
  } catch (e) {}

  // 2. Delete from Cloud Firestore
  try {
    await deleteDoc(doc(db, "discussions", id));

    // Save global deletion marker in Firestore
    await setDoc(doc(db, "global_deleted_items", `disc-${id}`), {
      itemId: `disc-${id}`,
      discussionId: id,
      itemType: "discussion",
      deletedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn("Firestore delete discussion warning:", err);
  }
}

/**
 * Subscribe to real-time community discussions from Cloud Firestore
 */
export function subscribeDiscussions(onUpdate: (discussions: Discussion[]) => void): () => void {
  // Emit initial local state
  onUpdate(getStoredDiscussions());

  // Restore IndexedDB backup if LocalStorage was cleared
  loadIDBDiscussions().then((idbList) => {
    if (idbList.length > 0) {
      const deletedIds = getStoredDeletedDiscussions();
      const current = getStoredDiscussions();
      const mergedMap = new Map<string, Discussion>();
      current.forEach((d) => mergedMap.set(d.id, d));
      idbList.forEach((d) => {
        if (!deletedIds.includes(d.id)) mergedMap.set(d.id, d);
      });
      const finalArr = Array.from(mergedMap.values());
      try {
        localStorage.setItem(LOCAL_STORAGE_DISCUSSIONS, JSON.stringify(finalArr));
      } catch (e) {}
      onUpdate(finalArr);
    }
  });

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

        // Load default items
        DEFAULT_DISCUSSIONS.forEach((d) => {
          if (!deletedIds.includes(d.id)) cloudMap.set(d.id, d);
        });

        // Merge Firestore snapshot items
        snap.docs.forEach((docSnap) => {
          const data = docSnap.data() as Discussion;
          const docId = data.id || docSnap.id;
          if (!deletedIds.includes(docId)) {
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
        } catch (e) {}

        onUpdate(updatedList);
      },
      (err) => console.warn("Discussions snapshot warning:", err)
    );
  } catch (e) {}

  return () => {
    if (unsubDiscussions) unsubDiscussions();
    if (unsubDeleted) unsubDeleted();
  };
}
