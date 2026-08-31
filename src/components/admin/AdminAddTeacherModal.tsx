import React, { useState, FormEvent, useEffect } from "react";
import { motion } from "motion/react";
import { TeacherEvaluation } from "@/lib/teacherService";
import { 
  UserCheck, BookOpen, Layers, Image as ImageIcon, 
  Youtube, PlayCircle, ExternalLink, Award, X, Globe, Tv
} from "lucide-react";

interface AdminAddTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTeacher: (teacher: TeacherEvaluation) => Promise<void>;
}

// Master subjects database with sector mappings
const masterSubjectsList = [
  // المواد العلمية (أزهر وعام)
  { id: "physics", title: "الفيزياء", category: "scientific" as const, catName: "علمي", sectors: ["azhar_scientific", "general_scientific", "general_math", "all"] },
  { id: "chemistry", title: "الكيمياء", category: "scientific" as const, catName: "علمي", sectors: ["azhar_scientific", "general_scientific", "general_math", "all"] },
  { id: "biology", title: "الأحياء", category: "scientific" as const, catName: "علمي", sectors: ["azhar_scientific", "general_scientific", "all"] },
  { id: "math", title: "الرياضيات التطبيقية والبحتة", category: "scientific" as const, catName: "علمي", sectors: ["azhar_scientific", "general_math", "all"] },

  // المواد العربية (أزهر وعام)
  { id: "grammar", title: "النحو والصرف", category: "arabic" as const, catName: "عربي", sectors: ["azhar_scientific", "azhar_literary", "all"] },
  { id: "literature", title: "الأدب والنصوص والشعر", category: "arabic" as const, catName: "عربي", sectors: ["azhar_scientific", "azhar_literary", "general_literary", "all"] },
  { id: "rhetoric", title: "البلاغة والتعبير", category: "arabic" as const, catName: "عربي", sectors: ["azhar_scientific", "azhar_literary", "all"] },
  { id: "english", title: "اللغة الإنجليزية", category: "arabic" as const, catName: "ثقافي", sectors: ["azhar_scientific", "azhar_literary", "general_scientific", "general_math", "general_literary", "all"] },

  // المواد الشرعية (أزهر فقط)
  { id: "quran", title: "القرآن الكريم وعلومه", category: "islamic" as const, catName: "شرعي", sectors: ["azhar_scientific", "azhar_literary", "all"] },
  { id: "fiqh", title: "الفقه وأصوله (مذهبي)", category: "islamic" as const, catName: "شرعي", sectors: ["azhar_scientific", "azhar_literary", "all"] },
  { id: "tawheed", title: "التوحيد والعقيدة الإسلامية", category: "islamic" as const, catName: "شرعي", sectors: ["azhar_scientific", "azhar_literary", "all"] },
  { id: "tafseer", title: "التفسير وعلوم القرآن", category: "islamic" as const, catName: "شرعي", sectors: ["azhar_scientific", "azhar_literary", "all"] },
  { id: "hadith", title: "الحديث الشريف ومصطلحه", category: "islamic" as const, catName: "شرعي", sectors: ["azhar_scientific", "azhar_literary", "all"] },

  // المواد الأدبية والإنسانية (عام وأزهر أدبي)
  { id: "history", title: "التاريخ والنشأة", category: "arabic" as const, catName: "أدبي", sectors: ["azhar_literary", "general_literary", "all"] },
  { id: "geography", title: "الجغرافيا السياسية والطبوع", category: "arabic" as const, catName: "أدبي", sectors: ["azhar_literary", "general_literary", "all"] },
  { id: "philosophy", title: "الفلسفة والمنطق", category: "arabic" as const, catName: "أدبي", sectors: ["general_literary", "all"] },
  { id: "psychology", title: "علم النفس والاجتماع", category: "arabic" as const, catName: "أدبي", sectors: ["general_literary", "all"] }
];

export function AdminAddTeacherModal({
  isOpen,
  onClose,
  onAddTeacher
}: AdminAddTeacherModalProps) {
  const [tName, setTName] = useState("");
  const [tSystemCategory, setTSystemCategory] = useState<"azhar_scientific" | "azhar_literary" | "general_scientific" | "general_literary" | "general_math" | "all">("azhar_scientific");
  
  // Filter subjects dynamically based on chosen sector
  const filteredSubjects = masterSubjectsList.filter(
    (s) => tSystemCategory === "all" || s.sectors.includes(tSystemCategory)
  );

  const [selectedSubjectId, setSelectedSubjectId] = useState("physics");
  const [tSubjectTitle, setTSubjectTitle] = useState("الفيزياء");
  const [tCategory, setTCategory] = useState<"scientific" | "arabic" | "islamic">("scientific");

  // Platform type toggle ("youtube" | "platform" | "both")
  const [tPlatformType, setTPlatformType] = useState<"youtube" | "platform" | "both">("both");

  const [tRating, setTRating] = useState("4.9");
  const [tAvatar, setTAvatar] = useState("");
  const [tExperience, setTExperience] = useState("");
  const [tSummary, setTSummary] = useState("");

  const [tYoutubeUrl, setTYoutubeUrl] = useState("");
  const [tYoutubeCount, setTYoutubeCount] = useState("12");

  const [tExternalUrl, setTExternalUrl] = useState("");
  const [tExternalTitle, setTExternalTitle] = useState("منصة المحاضرات المباشرة الخاصة");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update selected subject when sector changes
  useEffect(() => {
    if (filteredSubjects.length > 0) {
      const first = filteredSubjects[0];
      setSelectedSubjectId(first.id);
      setTSubjectTitle(first.title);
      setTCategory(first.category);
    }
  }, [tSystemCategory]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!tName.trim() || !tSummary.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const newTeacher: TeacherEvaluation = {
        id: "t-custom-" + Date.now(),
        name: tName.trim(),
        subjectId: selectedSubjectId,
        subjectTitle: tSubjectTitle,
        category: tCategory,
        systemCategory: tSystemCategory,
        platformType: tPlatformType,
        rating: parseFloat(tRating) || 4.9,
        reviewsCount: 1,
        avatar: tAvatar.trim() || undefined,
        experience: tExperience.trim() || "مدرس معتمد في المنصة",
        summary: tSummary.trim(),
        youtubeChannelUrl: tPlatformType !== "platform" ? tYoutubeUrl.trim() || undefined : undefined,
        youtubeLessonsCount: tPlatformType !== "platform" ? parseInt(tYoutubeCount, 10) || 0 : undefined,
        externalLectureUrl: tPlatformType !== "youtube" ? tExternalUrl.trim() || undefined : undefined,
        externalLectureTitle: tPlatformType !== "youtube" ? tExternalTitle.trim() || "منصة المحاضرات المنفصلة" : undefined,
        strengths: ["شرح مبسط وتفاعلي على سبورة مجهزة."],
        weaknesses: ["يتطلب متابعة المحاضرات بانتظام."]
      };

      await onAddTeacher(newTeacher);
      setTName("");
      setTExperience("");
      setTSummary("");
      setTAvatar("");
      setTYoutubeUrl("");
      setTExternalUrl("");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-xl bg-surface-container rounded-3xl border border-outline-variant/30 p-6 sm:p-8 shadow-2xl text-right max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center border-b border-outline-variant/10 pb-4 mb-4">
          <h3 className="text-headline-md font-bold text-on-surface flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-primary" />
            <span>إضافة مدرس وتحديد كافة بياناته</span>
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Teacher Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-label-sm font-bold text-on-surface">اسم المدرس ثلاثي:</label>
            <input
              type="text"
              required
              value={tName}
              onChange={(e) => setTName(e.target.value)}
              placeholder="مثال: أ. أحمد العوضي"
              className="bg-surface-container-high border border-outline-variant/40 rounded-xl p-3 text-body-md text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          {/* Sector Selector & Dynamic Subject Dropdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-label-sm font-bold text-on-surface flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-primary" />
                <span>1. قطاع ونظام المدرس:</span>
              </label>
              <select
                value={tSystemCategory}
                onChange={(e) => setTSystemCategory(e.target.value)}
                className="bg-surface-container-high border border-outline-variant/40 rounded-xl p-3 text-body-md text-on-surface focus:outline-none focus:border-primary font-bold"
              >
                <option value="azhar_scientific">الأزهر - قسم علمي 🕌</option>
                <option value="azhar_literary">الأزهر - قسم أدبي 📜</option>
                <option value="general_scientific">عام - علمي علوم 🧬</option>
                <option value="general_math">عام - علمي رياضة 📐</option>
                <option value="general_literary">عام - قسم أدبي 🏛️</option>
                <option value="all">كافة القطاعات والأقسام 🌐</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-label-sm font-bold text-on-surface flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-primary" />
                <span>2. المادة الدراسية (تتغير حسب القطاع):</span>
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => {
                  const subId = e.target.value;
                  setSelectedSubjectId(subId);
                  const subObj = filteredSubjects.find((s) => s.id === subId);
                  if (subObj) {
                    setTSubjectTitle(subObj.title);
                    setTCategory(subObj.category);
                  }
                }}
                className="bg-surface-container-high border border-outline-variant/40 rounded-xl p-3 text-body-md text-on-surface focus:outline-none focus:border-primary font-bold"
              >
                {filteredSubjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({s.catName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Teacher Platform Type Radio Selector */}
          <div className="flex flex-col gap-2 bg-surface-container-high/60 p-4 rounded-2xl border border-outline-variant/20">
            <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-primary" />
              <span>نوع تواجد المدرس والشروحات (يوتيوب أم منصة خاصة):</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTPlatformType("youtube")}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  tPlatformType === "youtube"
                    ? "bg-red-500/20 text-red-400 border-red-500/50 shadow-md"
                    : "bg-surface-container text-on-surface-variant border-outline-variant/20 hover:border-red-500/30"
                }`}
              >
                <Youtube className="w-3.5 h-3.5 text-red-500" />
                <span>قناة يوتيوب 🔴</span>
              </button>

              <button
                type="button"
                onClick={() => setTPlatformType("platform")}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  tPlatformType === "platform"
                    ? "bg-primary/20 text-primary border-primary/50 shadow-md"
                    : "bg-surface-container text-on-surface-variant border-outline-variant/20 hover:border-primary/30"
                }`}
              >
                <Tv className="w-3.5 h-3.5 text-primary" />
                <span>منصة خاصة 🚀</span>
              </button>

              <button
                type="button"
                onClick={() => setTPlatformType("both")}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  tPlatformType === "both"
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-md"
                    : "bg-surface-container text-on-surface-variant border-outline-variant/20 hover:border-emerald-500/30"
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>كلاهما 🌐</span>
              </button>
            </div>
          </div>

          {/* Teacher Avatar Image URL */}
          <div className="flex flex-col gap-1.5">
            <label className="text-label-sm font-bold text-on-surface flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-primary" />
              <span>رابط صورة المدرس الشخصية (Avatar Image URL):</span>
            </label>
            <input
              type="url"
              value={tAvatar}
              onChange={(e) => setTAvatar(e.target.value)}
              placeholder="https://images.unsplash.com/photo-... (رابط الصورة)"
              className="bg-surface-container-high border border-outline-variant/40 rounded-xl p-3 text-body-md text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          {/* YouTube Details (Visible if youtube or both) */}
          {(tPlatformType === "youtube" || tPlatformType === "both") && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-red-500/5 p-4 rounded-2xl border border-red-500/20">
              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                  <Youtube className="w-4 h-4 text-red-400" />
                  <span>رابط قناة اليوتيوب الرسمية:</span>
                </label>
                <input
                  type="url"
                  value={tYoutubeUrl}
                  onChange={(e) => setTYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/@teacher"
                  className="bg-surface-container border border-outline-variant/30 rounded-xl p-2.5 text-xs text-on-surface"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                  <PlayCircle className="w-4 h-4 text-emerald-400" />
                  <span>عدد الشروحات:</span>
                </label>
                <input
                  type="number"
                  value={tYoutubeCount}
                  onChange={(e) => setTYoutubeCount(e.target.value)}
                  placeholder="12"
                  className="bg-surface-container border border-outline-variant/30 rounded-xl p-2.5 text-xs text-on-surface"
                />
              </div>
            </div>
          )}

          {/* External Lecture / Platform Details (Visible if platform or both) */}
          {(tPlatformType === "platform" || tPlatformType === "both") && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-primary/5 p-4 rounded-2xl border border-primary/20">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                  <ExternalLink className="w-4 h-4 text-primary" />
                  <span>رابط المنصة / المحاضرة الخارجية:</span>
                </label>
                <input
                  type="url"
                  value={tExternalUrl}
                  onChange={(e) => setTExternalUrl(e.target.value)}
                  placeholder="https://teacher-platform.com/lecture"
                  className="bg-surface-container border border-outline-variant/30 rounded-xl p-2.5 text-xs text-on-surface"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>اسم المنصة أو المحاضرة:</span>
                </label>
                <input
                  type="text"
                  value={tExternalTitle}
                  onChange={(e) => setTExternalTitle(e.target.value)}
                  placeholder="منصة المحاضرات المباشرة المخصصة"
                  className="bg-surface-container border border-outline-variant/30 rounded-xl p-2.5 text-xs text-on-surface"
                />
              </div>
            </div>
          )}

          {/* Experience & Summary */}
          <div className="flex flex-col gap-1.5">
            <label className="text-label-sm font-bold text-on-surface">خبرة وتفاصيل المدرس:</label>
            <input
              type="text"
              value={tExperience}
              onChange={(e) => setTExperience(e.target.value)}
              placeholder="مثال: خبرة 15 عاماً في تدريس الثانوية والأزهر"
              className="bg-surface-container-high border border-outline-variant/40 rounded-xl p-3 text-body-md text-on-surface"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-label-sm font-bold text-on-surface">نبذة وملاحظات عن أسلوب الشرح:</label>
            <textarea
              rows={2}
              required
              value={tSummary}
              onChange={(e) => setTSummary(e.target.value)}
              placeholder="اكتب نبذة مختصرة عن أهم ما يميز أسلوب هذا المدرس..."
              className="bg-surface-container-high border border-outline-variant/40 rounded-xl p-3 text-body-md text-on-surface"
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high transition-colors font-bold text-label-sm cursor-pointer"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-on-primary hover:bg-primary/90 px-6 py-3 rounded-xl font-bold text-label-sm transition-all shadow-lg shadow-primary/20 cursor-pointer"
            >
              حفظ المدرس وبياناته
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
