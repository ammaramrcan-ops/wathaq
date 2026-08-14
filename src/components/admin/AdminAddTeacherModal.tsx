import React, { useState, FormEvent } from "react";
import { motion } from "motion/react";
import { TeacherEvaluation } from "@/lib/teacherService";

interface AdminAddTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTeacher: (teacher: TeacherEvaluation) => Promise<void>;
}

export function AdminAddTeacherModal({
  isOpen,
  onClose,
  onAddTeacher
}: AdminAddTeacherModalProps) {
  const [tName, setTName] = useState("");
  const [tSubject, setTSubject] = useState("الفيزياء");
  const [tCategory, setTCategory] = useState<"scientific" | "arabic" | "islamic">("scientific");
  const [tRating, setTRating] = useState("4.9");
  const [tExperience, setTExperience] = useState("");
  const [tSummary, setTSummary] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!tName.trim() || !tSummary.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const newTeacher: TeacherEvaluation = {
        id: "t-custom-" + Date.now(),
        name: tName.trim(),
        subjectId: tSubject.trim(),
        subjectTitle: tSubject.trim(),
        category: tCategory,
        rating: parseFloat(tRating) || 4.9,
        reviewsCount: 1,
        experience: tExperience.trim() || "مدرس معتمد في المنصة",
        summary: tSummary.trim(),
        strengths: ["تبسيط الشرح وتسهيل المفاهيم."],
        weaknesses: ["ملاحظة: الشرح يتطلب التركيز."]
      };

      await onAddTeacher(newTeacher);
      setTName("");
      setTExperience("");
      setTSummary("");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-lg bg-surface-container rounded-3xl border border-outline-variant/30 p-6 shadow-2xl text-right max-h-[90vh] overflow-y-auto"
      >
        <h3 className="text-headline-md font-bold text-on-surface mb-4">إضافة مدرس جديد</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-label-sm text-on-surface-variant">اسم المدرس</label>
            <input
              type="text"
              required
              value={tName}
              onChange={(e) => setTName(e.target.value)}
              placeholder="مثال: أ. أحمد العوضي"
              className="bg-surface-container-high border border-outline-variant/40 rounded-xl p-3 text-body-md text-on-surface"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-label-sm text-on-surface-variant">المادة</label>
            <input
              type="text"
              required
              value={tSubject}
              onChange={(e) => setTSubject(e.target.value)}
              placeholder="مثال: الفيزياء"
              className="bg-surface-container-high border border-outline-variant/40 rounded-xl p-3 text-body-md text-on-surface"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-label-sm text-on-surface-variant">نبذة عن المدرس</label>
            <textarea
              rows={2}
              required
              value={tSummary}
              onChange={(e) => setTSummary(e.target.value)}
              className="bg-surface-container-high border border-outline-variant/40 rounded-xl p-3 text-body-md text-on-surface"
            />
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-outline-variant/30 text-on-surface-variant cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-medium cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "جاري الحفظ..." : "حفظ المدرس"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
