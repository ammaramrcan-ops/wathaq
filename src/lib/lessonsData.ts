import { db } from "./firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";

export interface SubjectUnit {
  id: string;
  unitTitle: string; // e.g. "الباب الأول: الفيزياء الكهربية"
  lessons: string[]; // e.g. ["التيار الكهربي وقانون أوم", "قوانين كيرشوف"]
}

export interface SubjectUnitsMap {
  [subjectId: string]: SubjectUnit[];
}

// All units & lessons are 100% dynamic and managed via Admin Panel or Cloud Firestore
export const DEFAULT_SUBJECT_UNITS: SubjectUnitsMap = {};

const LOCAL_STORAGE_UNITS_MAP = "wathaq_subject_units_map";

export function getStoredSubjectUnits(): SubjectUnitsMap {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_UNITS_MAP);
    return saved ? JSON.parse(saved) : DEFAULT_SUBJECT_UNITS;
  } catch (e) {
    return DEFAULT_SUBJECT_UNITS;
  }
}

export function getStoredLessons(): Record<string, string[]> {
  const unitsMap = getStoredSubjectUnits();
  const flatMap: Record<string, string[]> = {};

  Object.keys(unitsMap).forEach((subId) => {
    const units = unitsMap[subId] || [];
    const allLessons: string[] = [];
    units.forEach((u) => {
      if (u.lessons) allLessons.push(...u.lessons);
    });
    flatMap[subId] = allLessons;
  });

  return flatMap;
}

export async function saveStoredSubjectUnits(unitsMap: SubjectUnitsMap): Promise<void> {
  // 1. Cloud Firestore write FIRST (server authorization check)
  try {
    const docRef = doc(db, "curriculum_meta", "subject_units");
    await setDoc(docRef, { unitsMap, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err: any) {
    console.error("Firestore save units error:", err);
    throw new Error("فشل حفظ دروس وأبواب المناهج سحابياً (تتطلب صلاحية الأدمن المصرح له).");
  }

  // 2. Save to LocalStorage ONLY after Cloud Firestore succeeds
  try {
    localStorage.setItem(LOCAL_STORAGE_UNITS_MAP, JSON.stringify(unitsMap));
  } catch (e) {}
}

export async function addUnitToSubject(subjectId: string, unitTitle: string): Promise<SubjectUnitsMap> {
  const current = getStoredSubjectUnits();
  const currentUnits = current[subjectId] || [];
  const newUnit: SubjectUnit = {
    id: "u-" + Date.now(),
    unitTitle,
    lessons: []
  };

  const updatedUnits = [...currentUnits, newUnit];
  const updatedMap = { ...current, [subjectId]: updatedUnits };
  await saveStoredSubjectUnits(updatedMap);
  return updatedMap;
}

export async function removeUnitFromSubject(subjectId: string, unitId: string): Promise<SubjectUnitsMap> {
  const current = getStoredSubjectUnits();
  const currentUnits = current[subjectId] || [];
  const updatedUnits = currentUnits.filter((u) => u.id !== unitId);

  const updatedMap = { ...current, [subjectId]: updatedUnits };
  await saveStoredSubjectUnits(updatedMap);
  return updatedMap;
}

export async function addLessonToUnit(subjectId: string, unitId: string, lessonTitle: string): Promise<SubjectUnitsMap> {
  const current = getStoredSubjectUnits();
  const currentUnits = current[subjectId] || [];

  const updatedUnits = currentUnits.map((unit) => {
    if (unit.id === unitId) {
      if (unit.lessons.includes(lessonTitle)) return unit;
      return { ...unit, lessons: [...unit.lessons, lessonTitle] };
    }
    return unit;
  });

  const updatedMap = { ...current, [subjectId]: updatedUnits };
  await saveStoredSubjectUnits(updatedMap);
  return updatedMap;
}

export async function removeLessonFromUnit(subjectId: string, unitId: string, lessonTitle: string): Promise<SubjectUnitsMap> {
  const current = getStoredSubjectUnits();
  const currentUnits = current[subjectId] || [];

  const updatedUnits = currentUnits.map((unit) => {
    if (unit.id === unitId) {
      return { ...unit, lessons: unit.lessons.filter((l) => l !== lessonTitle) };
    }
    return unit;
  });

  const updatedMap = { ...current, [subjectId]: updatedUnits };
  await saveStoredSubjectUnits(updatedMap);
  return updatedMap;
}

export function subscribeUnits(onUpdate: (unitsMap: SubjectUnitsMap) => void): () => void {
  onUpdate(getStoredSubjectUnits());

  let unsub: (() => void) | null = null;
  try {
    const docRef = doc(db, "curriculum_meta", "subject_units");
    unsub = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists() && snap.data()?.unitsMap) {
          const cloudUnitsMap = snap.data().unitsMap as SubjectUnitsMap;
          try {
            localStorage.setItem(LOCAL_STORAGE_UNITS_MAP, JSON.stringify(cloudUnitsMap));
          } catch (e) {}
          onUpdate(cloudUnitsMap);
        } else {
          onUpdate(getStoredSubjectUnits());
        }
      },
      (err) => console.warn("Units snapshot warning:", err)
    );
  } catch (e) {}

  return () => {
    if (unsub) unsub();
  };
}

export function subscribeLessons(onUpdate: (lessons: Record<string, string[]>) => void): () => void {
  onUpdate(getStoredLessons());
  return subscribeUnits((unitsMap) => {
    const flatMap: Record<string, string[]> = {};
    Object.keys(unitsMap).forEach((subId) => {
      const units = unitsMap[subId] || [];
      const allLessons: string[] = [];
      units.forEach((u) => {
        if (u.lessons) allLessons.push(...u.lessons);
      });
      flatMap[subId] = allLessons;
    });
    onUpdate(flatMap);
  });
}
