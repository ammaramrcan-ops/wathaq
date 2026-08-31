import { db } from "./firebase";
import { collection, doc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";

export interface CommunityMediaItem {
  id: string;
  title: string;
  category: string; // e.g. "نادي القراءة والروايات 📚", "فيديوهات وتطوير ذات 🎬", "قنوات يوتيوب ننصح بها 📺", "ترفيه وثقافة 🍿"
  type: "youtube" | "book" | "link";
  linkUrl: string;
  description: string;
  author?: string;
  thumbnailUrl?: string; // Cover image URL or extracted YouTube thumbnail
  createdAt: string;
}

export const DEFAULT_COMMUNITY_CATEGORIES = [
  "نادي القراءة والروايات 📚",
  "فيديوهات وتطوير ذات 🎬",
  "قنوات يوتيوب ننصح بها 📺",
  "ترفيه وثقافة 🍿"
];

export function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export function getYouTubeThumbnail(url: string): string | null {
  const videoId = getYouTubeVideoId(url);
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
}

export const DEFAULT_COMMUNITY_MEDIA: CommunityMediaItem[] = [
  {
    id: "m-1",
    title: "كيف تنظم وقتك وتدرس بإنتاجية عالية في الثانوية والأزهر 🧠",
    category: "فيديوهات وتطوير ذات 🎬",
    type: "youtube",
    linkUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: "فيديو ممتع ورائع يشرح خطط تنظيم الوقت والاسترسال الذهني وحل مشكلة التشتت.",
    author: "أحمد أبو زيد (دروس أونلاين)",
    createdAt: "2026-08-31"
  },
  {
    id: "m-2",
    title: "ملخص ومناقشة رواية البؤساء (فيكتور هوجو) 📚",
    category: "نادي القراءة والروايات 📚",
    type: "book",
    linkUrl: "https://drive.google.com",
    description: "مراجعة وترشيح ممتع لإحدى أعظم الروايات العالمية للترويح عن النفس واستلهام الإرادة.",
    author: "مكتبة وثاق الثقافية",
    thumbnailUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
    createdAt: "2026-08-31"
  },
  {
    id: "m-3",
    title: "نصائح الجرأة والإرادة والنجاح للتفوق الدراسي 🌟",
    category: "ترفيه وثقافة 🍿",
    type: "youtube",
    linkUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: "مقاطع تحفيزية خفيفة ومشجعة للتجديد وشحن الطاقة الإيجابية للطلاب.",
    author: "صنّاع الأمل",
    createdAt: "2026-08-31"
  },
  {
    id: "m-4",
    title: "قناة دروس أونلاين (أحمد أبو زيد) 📺",
    category: "قنوات يوتيوب ننصح بها 📺",
    type: "youtube",
    linkUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: "قناة متميزة تقدم نصائح واستراتيجيات مذاكرة، تنظيم الوقت والتغلب على التسويف.",
    author: "أحمد أبو زيد",
    createdAt: "2026-08-31"
  }
];

const LOCAL_STORAGE_COMMUNITY_MEDIA = "wathaq_community_media_items_v1";
const LOCAL_STORAGE_DELETED_COMMUNITY_MEDIA = "wathaq_deleted_community_media_ids_v1";
const LOCAL_STORAGE_COMMUNITY_CATEGORIES = "wathaq_community_media_categories_v1";

export function normalizeMediaCategory(cat: string): string {
  if (!cat) return "فيديوهات وتطوير ذات 🎬";
  if (cat === "تطوير ذات") return "فيديوهات وتطوير ذات 🎬";
  if (cat === "روايات وكتب") return "نادي القراءة والروايات 📚";
  if (cat === "ترفيه وثقافة") return "ترفيه وثقافة 🍿";
  if (cat === "قنوات يوتيوب" || cat.includes("قنوات")) return "قنوات يوتيوب ننصح بها 📺";
  return cat;
}

export function getStoredDeletedMediaIds(): string[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_DELETED_COMMUNITY_MEDIA);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

export function markMediaAsDeleted(id: string): void {
  try {
    const current = getStoredDeletedMediaIds();
    if (!current.includes(id)) {
      const updated = [...current, id];
      localStorage.setItem(LOCAL_STORAGE_DELETED_COMMUNITY_MEDIA, JSON.stringify(updated));
    }
  } catch (e) {
    // empty
  }
}

export function getStoredCommunityCategories(): string[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_COMMUNITY_CATEGORIES);
    if (!saved) return DEFAULT_COMMUNITY_CATEGORIES;
    const parsed: string[] = JSON.parse(saved);
    const normalized = parsed.map(normalizeMediaCategory);
    return normalized.length > 0 ? Array.from(new Set(normalized)) : DEFAULT_COMMUNITY_CATEGORIES;
  } catch (e) {
    return DEFAULT_COMMUNITY_CATEGORIES;
  }
}

export function saveStoredCommunityCategories(categories: string[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_COMMUNITY_CATEGORIES, JSON.stringify(categories));
  } catch (e) {
    // empty
  }
}

export function subscribeCommunityCategories(onUpdate: (cats: string[]) => void): () => void {
  onUpdate(getStoredCommunityCategories());

  let unsub: (() => void) | null = null;
  try {
    const docRef = doc(db, "curriculum_meta", "community_categories");
    unsub = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists() && snap.data().list) {
          const list = (snap.data().list as string[]).map(normalizeMediaCategory);
          const cleanList = Array.from(new Set(list));
          saveStoredCommunityCategories(cleanList);
          onUpdate(cleanList);
        } else {
          onUpdate(getStoredCommunityCategories());
        }
      },
      (err) => {
        console.warn("Categories snapshot warning:", err);
        onUpdate(getStoredCommunityCategories());
      }
    );
  } catch (err) {
    onUpdate(getStoredCommunityCategories());
  }

  return () => {
    if (unsub) unsub();
  };
}

export async function addCommunityCategory(categoryName: string): Promise<void> {
  const norm = normalizeMediaCategory(categoryName);
  const current = getStoredCommunityCategories();
  if (current.includes(norm)) return;

  const updated = [...current, norm];
  saveStoredCommunityCategories(updated);

  try {
    const docRef = doc(db, "curriculum_meta", "community_categories");
    await setDoc(docRef, { list: updated }, { merge: true });
  } catch (err: unknown) {
    console.warn("Firestore addCategory warning:", err);
  }
}

export async function deleteCommunityCategory(categoryName: string): Promise<void> {
  const norm = normalizeMediaCategory(categoryName);
  const current = getStoredCommunityCategories();
  const updated = current.filter((c) => c !== norm);
  saveStoredCommunityCategories(updated);

  try {
    const docRef = doc(db, "curriculum_meta", "community_categories");
    await setDoc(docRef, { list: updated }, { merge: true });
  } catch (err: unknown) {
    console.warn("Firestore deleteCategory warning:", err);
  }
}

export function getStoredCommunityMedia(): CommunityMediaItem[] {
  const deletedIds = getStoredDeletedMediaIds();
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_COMMUNITY_MEDIA);
    const list: CommunityMediaItem[] = saved !== null ? JSON.parse(saved) : DEFAULT_COMMUNITY_MEDIA;
    return list
      .filter((item) => !deletedIds.includes(item.id))
      .map((item) => ({
        ...item,
        category: normalizeMediaCategory(item.category)
      }));
  } catch (e) {
    return DEFAULT_COMMUNITY_MEDIA.filter((item) => !deletedIds.includes(item.id)).map((item) => ({
      ...item,
      category: normalizeMediaCategory(item.category)
    }));
  }
}

export function saveStoredCommunityMedia(list: CommunityMediaItem[]): void {
  try {
    const deletedIds = getStoredDeletedMediaIds();
    const cleanList = list.filter((item) => !deletedIds.includes(item.id));
    const normalized = cleanList.map((item) => ({
      ...item,
      category: normalizeMediaCategory(item.category)
    }));
    localStorage.setItem(LOCAL_STORAGE_COMMUNITY_MEDIA, JSON.stringify(normalized));
  } catch (e) {
    // empty
  }
}

export function subscribeCommunityMedia(onUpdate: (items: CommunityMediaItem[]) => void): () => void {
  onUpdate(getStoredCommunityMedia());

  let unsub: (() => void) | null = null;
  try {
    const colRef = collection(db, "community_media");
    unsub = onSnapshot(
      colRef,
      (snap) => {
        const deletedIds = getStoredDeletedMediaIds();
        const list: CommunityMediaItem[] = snap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        })) as CommunityMediaItem[];

        const savedLocal = localStorage.getItem(LOCAL_STORAGE_COMMUNITY_MEDIA);
        const rawList = list.length > 0
          ? list
          : (savedLocal !== null ? JSON.parse(savedLocal) : DEFAULT_COMMUNITY_MEDIA);

        const finalList = rawList
          .filter((item: CommunityMediaItem) => !deletedIds.includes(item.id))
          .map((item: CommunityMediaItem) => ({
            ...item,
            category: normalizeMediaCategory(item.category)
          }));

        saveStoredCommunityMedia(finalList);
        onUpdate(finalList);
      },
      (err) => {
        console.warn("Community media snapshot warning:", err);
        onUpdate(getStoredCommunityMedia());
      }
    );
  } catch (err) {
    onUpdate(getStoredCommunityMedia());
  }

  return () => {
    if (unsub) unsub();
  };
}

export async function addCommunityMediaItem(item: CommunityMediaItem): Promise<void> {
  const normItem = { ...item, category: normalizeMediaCategory(item.category) };
  const current = getStoredCommunityMedia();
  const updated = [normItem, ...current.filter((m) => m.id !== normItem.id)];
  saveStoredCommunityMedia(updated);

  const cleanItem = JSON.parse(JSON.stringify(normItem));
  try {
    const docRef = doc(db, "community_media", normItem.id);
    await setDoc(docRef, cleanItem, { merge: true });
  } catch (err: unknown) {
    console.warn("Firestore addCommunityMediaItem warning:", err);
  }
}

export async function updateCommunityMediaItem(item: CommunityMediaItem): Promise<void> {
  await addCommunityMediaItem(item);
}

export async function deleteCommunityMediaItem(id: string): Promise<void> {
  markMediaAsDeleted(id);
  const current = getStoredCommunityMedia();
  const updated = current.filter((m) => m.id !== id);
  saveStoredCommunityMedia(updated);

  try {
    const docRef = doc(db, "community_media", id);
    await deleteDoc(docRef);
  } catch (err: unknown) {
    console.warn("Firestore deleteCommunityMediaItem warning:", err);
  }
}
