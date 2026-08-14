import { db } from "./firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";

export type SystemType = "azhar" | "general";

export interface StudentAcademicProfile {
  system: SystemType;
  branch: string; // "scientific" | "literary" | "science" | "math"
  grade?: string; // "3rd" | "2nd" | "1st"
}

export const DEFAULT_CURRICULUM: Record<string, string[]> = {
  azhar_scientific: [
    "الفقه", "التفسير", "الحديث", "التوحيد", "النحو", "الصرف", "البلاغة", 
    "الأدب والنصوص", "اللغة الأجنبية", "الرياضيات البحتة", "الرياضيات التطبيقية", 
    "الفيزياء", "الكيمياء", "الأحياء"
  ],
  azhar_literary: [
    "الفقه", "التفسير", "الحديث", "التوحيد", "النحو", "الصرف", "البلاغة", 
    "الأدب والنصوص والمطالعة", "اللغة الأجنبية الأولى", "اللغة الأجنبية الثانية", 
    "التاريخ", "الجغرافيا", "الإحصاء", "الإنشاء"
  ],
  general_science: [
    "العربي", "اللغة الأجنبية الأولى", "الأحياء", "الكيمياء", "الفيزياء"
  ],
  general_math: [
    "العربي", "اللغة الأجنبية الأولى", "الرياضيات", "الكيمياء", "الفيزياء"
  ],
  general_literary: [
    "العربي", "اللغة الأجنبية الأولى", "التاريخ", "الجغرافيا", "الإحصاء"
  ]
};

const LOCAL_STORAGE_ACADEMIC_PROFILE = "wathaq_student_academic_profile";

export const DEFAULT_ACADEMIC_PROFILE: StudentAcademicProfile = {
  system: "general",
  branch: "science",
  grade: "3rd"
};

export function getStoredCurriculum(): Record<string, string[]> {
  try {
    const saved = localStorage.getItem("wathaq_curriculum_subjects");
    return saved ? JSON.parse(saved) : DEFAULT_CURRICULUM;
  } catch (e) {
    return DEFAULT_CURRICULUM;
  }
}

export function saveStoredCurriculum(data: Record<string, string[]>) {
  try {
    localStorage.setItem("wathaq_curriculum_subjects", JSON.stringify(data));
  } catch (e) {}
}

export function getStoredStudentProfile(): StudentAcademicProfile {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_ACADEMIC_PROFILE);
    return saved ? JSON.parse(saved) : DEFAULT_ACADEMIC_PROFILE;
  } catch {
    return DEFAULT_ACADEMIC_PROFILE;
  }
}

/**
 * Save student academic profile to LocalStorage & Cloud Firestore
 */
export async function saveStoredStudentProfile(
  profile: StudentAcademicProfile,
  userId?: string
): Promise<void> {
  // 1. LocalStorage update
  try {
    localStorage.setItem(LOCAL_STORAGE_ACADEMIC_PROFILE, JSON.stringify(profile));
  } catch (e) {}

  // 2. Firestore Cloud sync
  try {
    const effectiveUid = userId || "guest_academic_profile";
    const profileDocRef = doc(db, "academic_profiles", effectiveUid);
    await setDoc(profileDocRef, { ...profile, updatedAt: new Date().toISOString() }, { merge: true });

    if (userId) {
      const userDocRef = doc(db, "users", userId);
      await setDoc(userDocRef, { academicProfile: profile }, { merge: true });
    }
  } catch (err) {
    console.warn("Firestore academic profile save warning:", err);
  }
}

/**
 * Subscribe to student academic profile changes from Cloud Firestore
 */
export function subscribeStudentProfile(
  userId: string | undefined,
  onUpdate: (profile: StudentAcademicProfile) => void
): () => void {
  // Emit current local state
  onUpdate(getStoredStudentProfile());

  let unsubGlobal: (() => void) | null = null;
  let unsubUser: (() => void) | null = null;

  const effectiveUid = userId || "guest_academic_profile";

  try {
    const profileDocRef = doc(db, "academic_profiles", effectiveUid);
    unsubGlobal = onSnapshot(
      profileDocRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.system && data.branch) {
            const prof: StudentAcademicProfile = {
              system: data.system,
              branch: data.branch,
              grade: data.grade || "3rd"
            };
            try {
              localStorage.setItem(LOCAL_STORAGE_ACADEMIC_PROFILE, JSON.stringify(prof));
            } catch {}
            onUpdate(prof);
          }
        }
      },
      (err) => console.warn("Firestore academic profile listener warning:", err)
    );

    if (userId) {
      const userDocRef = doc(db, "users", userId);
      unsubUser = onSnapshot(
        userDocRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            if (data.academicProfile) {
              const prof = data.academicProfile as StudentAcademicProfile;
              try {
                localStorage.setItem(LOCAL_STORAGE_ACADEMIC_PROFILE, JSON.stringify(prof));
              } catch {}
              onUpdate(prof);
            }
          }
        },
        (err) => console.warn("User document profile listener warning:", err)
      );
    }
  } catch (e) {}

  return () => {
    if (unsubGlobal) unsubGlobal();
    if (unsubUser) unsubUser();
  };
}

export function getSubjectsForProfile(profile: StudentAcademicProfile | null): string[] {
  const curriculum = getStoredCurriculum();
  if (!profile) return curriculum.general_science;

  let key = "general_science";
  if (profile.system === "azhar") {
    key = profile.branch === "literary" ? "azhar_literary" : "azhar_scientific";
  } else {
    if (profile.branch === "math") key = "general_math";
    else if (profile.branch === "literary") key = "general_literary";
    else key = "general_science";
  }

  return curriculum[key] || DEFAULT_CURRICULUM[key] || [];
}

export function getProfileLabel(profile: StudentAcademicProfile | null): string {
  if (!profile) return "ثانوي عام (علمي علوم)";

  let gradeLabel = "";
  if (profile.grade === "3rd") gradeLabel = " (الصف الثالث الثانوي)";
  else if (profile.grade === "2nd") gradeLabel = " (الصف الثاني الثانوي)";
  else if (profile.grade === "1st") gradeLabel = " (الصف الأول الثانوي)";

  if (profile.system === "azhar") {
    const base = profile.branch === "literary" ? "أزهري - قسم أدبي 🕌" : "أزهري - قسم علمي 🕌";
    return `${base}${gradeLabel}`;
  } else {
    let base = "ثانوي عام - علمي علوم 🎓";
    if (profile.branch === "math") base = "ثانوي عام - علمي رياضة 🎓";
    else if (profile.branch === "literary") base = "ثانوي عام - قسم أدبي 🎓";
    return `${base}${gradeLabel}`;
  }
}
