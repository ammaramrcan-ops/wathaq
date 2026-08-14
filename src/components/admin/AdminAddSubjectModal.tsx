import React, { useState, FormEvent } from "react";
import { motion } from "motion/react";

interface AdminAddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBranchKey: string;
  getBranchLabel: (key: string) => string;
  onAddSubject: (subjectName: string) => void;
}

export function AdminAddSubjectModal({
  isOpen,
  onClose,
  selectedBranchKey,
  getBranchLabel,
  onAddSubject
}: AdminAddSubjectModalProps) {
  const [newSubjectName, setNewSubjectName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    onAddSubject(newSubjectName.trim());
    setNewSubjectName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md bg-surface-container rounded-3xl border border-outline-variant/30 p-6 sm:p-8 shadow-2xl text-right"
      >
        <h3 className="text-headline-md font-bold text-on-surface mb-2">
          إضافة مادة جديدة لـ ({getBranchLabel(selectedBranchKey)})
        </h3>
        <p className="text-xs text-on-surface-variant mb-4">
          ستظهر هذه المادة مباشرة للطلاب المسجلين في هذا المنهج والشعبة.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-label-sm text-on-surface-variant">اسم المادة</label>
            <input
              type="text"
              required
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              placeholder="مثال: الفلسفة، الفرنسية، أو التفاضل"
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
              className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-medium cursor-pointer"
            >
              حفظ المادة
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
