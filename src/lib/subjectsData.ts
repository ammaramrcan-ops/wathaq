export type SystemType = "azhar" | "general";

export type AzharBranch = "scientific" | "literary";
export type GeneralBranch = "science" | "math" | "literary";

export interface StudentAcademicProfile {
  system: SystemType;
  branch: string;
}

export const AZHAR_SCIENTIFIC_SUBJECTS = [
  "الفقه", "التفسير", "الحديث", "التوحيد", "النحو", "الصرف", "البلاغة", 
  "الأدب والنصوص", "اللغة الأجنبية", "الرياضيات البحتة", "الرياضيات التطبيقية", 
  "الفيزياء", "الكيمياء", "الأحياء"
];

export const AZHAR_LITERARY_SUBJECTS = [
  "الفقه", "التفسير", "الحديث", "التوحيد", "النحو", "الصرف", "البلاغة", 
  "الأدب والنصوص والمطالعة", "اللغة الأجنبية الأولى", "اللغة الأجنبية الثانية", 
  "التاريخ", "الجغرافيا", "الإحصاء", "الإنشاء"
];

export const GENERAL_SCIENCE_SUBJECTS = [
  "العربي", "اللغة الأجنبية الأولى", "الأحياء", "الكيمياء", "الفيزياء"
];

export const GENERAL_MATH_SUBJECTS = [
  "العربي", "اللغة الأجنبية الأولى", "الرياضيات", "الكيمياء", "الفيزياء"
];

export const GENERAL_LITERARY_SUBJECTS = [
  "العربي", "اللغة الأجنبية الأولى", "التاريخ", "الجغرافيا", "الإحصاء"
];

export function getSubjectsForProfile(profile: StudentAcademicProfile | null): string[] {
  if (!profile) return GENERAL_SCIENCE_SUBJECTS;

  if (profile.system === "azhar") {
    if (profile.branch === "literary") return AZHAR_LITERARY_SUBJECTS;
    return AZHAR_SCIENTIFIC_SUBJECTS;
  } else {
    if (profile.branch === "math") return GENERAL_MATH_SUBJECTS;
    if (profile.branch === "literary") return GENERAL_LITERARY_SUBJECTS;
    return GENERAL_SCIENCE_SUBJECTS;
  }
}

export function getProfileLabel(profile: StudentAcademicProfile | null): string {
  if (!profile) return "ثانوي عام (علمي علوم)";
  if (profile.system === "azhar") {
    return profile.branch === "literary" ? "أزهري - قسم أدبي 🕌" : "أزهري - قسم علمي 🕌";
  } else {
    if (profile.branch === "math") return "ثانوي عام - علمي رياضة 🎓";
    if (profile.branch === "literary") return "ثانوي عام - قسم أدبي 🎓";
    return "ثانوي عام - علمي علوم 🎓";
  }
}
