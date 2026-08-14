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
