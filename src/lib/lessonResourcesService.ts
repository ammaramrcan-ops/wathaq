import { db } from "./firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";

export interface LessonResourceAttachment {
  id: string; // e.g. "physics__التيار الكهربي وقانون أوم"
  subjectId: string;
  unitId?: string;
  unitTitle?: string;
  lessonTitle: string;
  pdfUrl?: string; // رابط ملف PDF للملخص
  mindmapImageUrl?: string; // رابط صورة الخريطة الذهنية
  flashcardsCsvUrl?: string; // رابط ملف CSV للفلاش كارد
  updatedAt?: string;
}

export interface LessonResourcesMap {
  [key: string]: LessonResourceAttachment; // key: subjectId + "__" + lessonTitle
}

const LOCAL_STORAGE_LESSON_RESOURCES = "wathaq_lesson_resources_map";

export function getStoredLessonResources(): LessonResourcesMap {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_LESSON_RESOURCES);
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    return {};
  }
}

export function saveStoredLessonResources(map: LessonResourcesMap): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_LESSON_RESOURCES, JSON.stringify(map));
  } catch (e) {
    // empty
  }
}

export function subscribeLessonResources(onUpdate: (map: LessonResourcesMap) => void): () => void {
  onUpdate(getStoredLessonResources());

  let unsub: (() => void) | null = null;
  try {
    const docRef = doc(db, "curriculum_meta", "lesson_resources");
    unsub = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists() && snap.data()?.resourcesMap) {
          const map = snap.data().resourcesMap as LessonResourcesMap;
          saveStoredLessonResources(map);
          onUpdate(map);
        } else {
          onUpdate(getStoredLessonResources());
        }
      },
      (err) => console.warn("Lesson resources snapshot warning:", err)
    );
  } catch (err) {
    // empty
  }

  return () => {
    if (unsub) unsub();
  };
}

export async function saveLessonResource(resource: LessonResourceAttachment): Promise<void> {
  const current = getStoredLessonResources();
  const key = `${resource.subjectId}__${resource.lessonTitle}`;
  const updatedMap = {
    ...current,
    [key]: { ...resource, id: key, updatedAt: new Date().toISOString() }
  };

  // 1. Cloud Firestore write FIRST (server authorization check)
  try {
    const docRef = doc(db, "curriculum_meta", "lesson_resources");
    await setDoc(docRef, { resourcesMap: updatedMap, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err: any) {
    console.error("Firestore saveLessonResource error:", err);
    throw new Error("فشل حفظ مرفقات الدرس سحابياً (تتطلب صلاحية الأدمن المصرح له).");
  }

  // 2. Save to LocalStorage ONLY after Cloud Firestore succeeds
  saveStoredLessonResources(updatedMap);
}
