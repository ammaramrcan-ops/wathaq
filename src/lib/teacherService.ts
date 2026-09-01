import { db } from "./firebase";
import { collection, doc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";

export interface TeacherEvaluation {
  id: string;
  name: string; // اسم المدرس
  subjectId: string; // كود المادة المرتبطة (مثل physics, chemistry, grammar)
  subjectTitle: string; // اسم المادة بالعربي
  category: "scientific" | "arabic" | "islamic";
  systemCategory?: "azhar_scientific" | "azhar_literary" | "general_scientific" | "general_math" | "general_literary" | "all";
  platformType?: "youtube" | "platform" | "both"; // نوع تواجد المدرس (يوتيوب / منصة مستقلة / كلاهما)
  rating: number; // متوسط التقييم من 5
  reviewsCount: number; // عدد الطلاب المقيّمين
  avatar: string; // صورة المدرس
  experience: string; // خبرة المدرس (مثلاً 15 عاماً في تدريس...)
  summary: string; // ملخص أو وصف أسلوب الشرح
  strengths: string[]; // نقاط القوة والمميزات
  weaknesses: string[]; // الملاحظات أو النقاط التي يحتاج الطالب مراعاتها
  youtubeChannelUrl?: string; // رابط قناة يوتيوب المدرس
  youtubeLessonsCount?: number; // عدد الشروحات المتاحة على يوتيوب
  externalLectureUrl?: string; // رابط المحاضرة / المنصة الخاصة المستقلة
  externalLectureTitle?: string; // اسم المنصة أو المحاضرة الخارجية
}

// 100% Dynamic - No Hardcoded Default Teachers
export const DEFAULT_TEACHERS: TeacherEvaluation[] = [];

const LOCAL_STORAGE_TEACHERS = "wathaq_teacher_evaluations_list_v2";

export function getStoredTeachers(): TeacherEvaluation[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_TEACHERS);
    if (!saved) return [];
    const parsed: TeacherEvaluation[] = JSON.parse(saved);
    // Filter out old mock IDs
    return parsed.filter((t) => !["t-phys-1", "t-chem-1", "t-arb-1"].includes(t.id));
  } catch {
    return [];
  }
}

export function saveStoredTeachers(list: TeacherEvaluation[]): void {
  try {
    const clean = list.filter((t) => !["t-phys-1", "t-chem-1", "t-arb-1"].includes(t.id));
    localStorage.setItem(LOCAL_STORAGE_TEACHERS, JSON.stringify(clean));
  } catch {
    // empty
  }
}

export function subscribeTeachers(onUpdate: (teachers: TeacherEvaluation[]) => void): () => void {
  try {
    localStorage.removeItem("wathaq_teacher_evaluations_list");
  } catch {
    /* ignore storage error */
  }

  onUpdate(getStoredTeachers());

  let unsub: (() => void) | null = null;
  try {
    const colRef = collection(db, "teacher_evaluations");
    unsub = onSnapshot(
      colRef,
      (snap) => {
        const list: TeacherEvaluation[] = snap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        })) as TeacherEvaluation[];

        const cleanList = list.filter((t) => !["t-phys-1", "t-chem-1", "t-arb-1"].includes(t.id));
        saveStoredTeachers(cleanList);
        onUpdate(cleanList);
      },
      (err) => {
        console.warn("Teachers snapshot warning:", err);
        onUpdate(getStoredTeachers());
      }
    );
  } catch {
    onUpdate(getStoredTeachers());
  }

  return () => {
    if (unsub) unsub();
  };
}

export async function addTeacher(teacher: TeacherEvaluation): Promise<void> {
  // 1. Cloud Firestore write FIRST (server authorization check)
  try {
    const docRef = doc(db, "teacher_evaluations", teacher.id);
    await setDoc(docRef, teacher, { merge: true });
  } catch (err: unknown) {
    console.error("Firestore addTeacher error:", err);
    throw new Error("فشل إضافة المدرس سحابياً (تتطلب صلاحية الأدمن المصرح له).");
  }

  // 2. Save to LocalStorage ONLY after Cloud succeeds
  const current = getStoredTeachers();
  const updated = [teacher, ...current.filter((t) => t.id !== teacher.id)];
  saveStoredTeachers(updated);
}

export async function deleteTeacher(id: string): Promise<void> {
  // 1. Delete from Cloud Firestore FIRST (server authorization check)
  try {
    const docRef = doc(db, "teacher_evaluations", id);
    await deleteDoc(docRef);
  } catch (err: unknown) {
    console.error("Firestore deleteTeacher error:", err);
    throw new Error("فشل حذف المدرس سحابياً (تتطلب صلاحية الأدمن المصرح له).");
  }

  // 2. Update LocalStorage ONLY after Cloud succeeds
  const current = getStoredTeachers();
  const updated = current.filter((t) => t.id !== id);
  saveStoredTeachers(updated);
}
