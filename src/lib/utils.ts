import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Extract YouTube thumbnail image from YouTube URL automatically
 */
export function extractYouTubeThumbnail(url: string | undefined | null): string | null {
  if (!url) return null;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regExp);

  if (match && match[1]) {
    return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
  }

  return null;
}

/**
 * Get Arabic human readable subject name from subject key
 */
export function getSubjectTitle(code: string): string {
  const map: Record<string, string> = {
    physics: "الفيزياء",
    chemistry: "الكيمياء",
    biology: "الأحياء",
    math: "الرياضيات",
    grammar: "النحو والصرف",
    literature: "الأدب والنصوص",
    rhetoric: "البلاغة والتعبير",
    tawheed: "التوحيد والعقيدة",
    fiqh: "الفقه وأصوله",
    tafseer: "التفسير وعلوم القرآن",
    hadith: "الحديث الشريف"
  };
  return map[code] || code;
}

/**
 * Get Arabic human readable content type title
 */
export function getContentTypeTitle(type: string): string {
  switch (type) {
    case "video": return "فيديو / قائمة تشغيل مرئية";
    case "book": return "كتاب / ملزمة دراسية (Drive)";
    case "flashcards": return "بطاقة فلاش كارد للمراجعة";
    case "mindmaps": return "خريطة ذهنية تفاهمية";
    default: return "محتوى تعليمي";
  }
}
