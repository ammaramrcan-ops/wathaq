import React, { useState } from "react";
import { GraduationCap, Check, Plus, BookOpen, Edit3, Save, Trash2 } from "lucide-react";
import { saveStoredCurriculum } from "@/lib/subjectsData";

interface AdminCurriculumTabProps {
  curriculum: Record<string, string[]>;
  setCurriculum: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  onOpenAddSubject: () => void;
  selectedSystem: "azhar" | "general";
  setSelectedSystem: (sys: "azhar" | "general") => void;
  selectedBranchKey: string;
  setSelectedBranchKey: (key: string) => void;
  getBranchLabel: (key: string) => string;
}

export function AdminCurriculumTab({
  curriculum,
  setCurriculum,
  onOpenAddSubject,
  selectedSystem,
  setSelectedSystem,
  selectedBranchKey,
  setSelectedBranchKey,
  getBranchLabel
}: AdminCurriculumTabProps) {
  const [editingSubjectOldName, setEditingSubjectOldName] = useState<string | null>(null);
  const [editingSubjectNewValue, setEditingSubjectNewValue] = useState<string>("");

  const currentBranchSubjects = curriculum[selectedBranchKey] || [];

  const handleEditSubjectInBranch = (oldName: string, newName: string) => {
    if (!newName.trim() || oldName === newName.trim()) {
      setEditingSubjectOldName(null);
      return;
    }
    const updatedBranchSubjects = currentBranchSubjects.map((s) => (s === oldName ? newName.trim() : s));
    const updatedCurriculum = { ...curriculum, [selectedBranchKey]: updatedBranchSubjects };

    setCurriculum(updatedCurriculum);
    saveStoredCurriculum(updatedCurriculum);
    setEditingSubjectOldName(null);
  };

  const handleDeleteSubjectFromBranch = (subjectName: string) => {
    if (window.confirm(`هل أنت تأكد من رغبتك في حذف مادة (${subjectName}) من هذه الشعبة؟`)) {
      const updatedBranchSubjects = currentBranchSubjects.filter((s) => s !== subjectName);
      const updatedCurriculum = { ...curriculum, [selectedBranchKey]: updatedBranchSubjects };

      setCurriculum(updatedCurriculum);
      saveStoredCurriculum(updatedCurriculum);
    }
  };

  return (
    <div className="bg-surface-container-low border border-outline-variant/30 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-xl text-right">
      <div>
        <h3 className="text-headline-md font-bold text-on-surface flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-primary" />
          <span>إدارة وتعديل مواد كل شعبة في المنهج الأزهري والعام</span>
        </h3>
        <p className="text-label-sm text-on-surface-variant mt-1">
          اختر النظام الأكاديمي والشعبة، ثم أضف أو احذف أية مادة تظهر للطلاب في ذلك القسم تحديداً.
        </p>
      </div>

      {/* Step 1: System Selector */}
      <div className="flex flex-col gap-3">
        <label className="text-label-sm font-bold text-on-surface">1. اختر نظام التعليم لتعديل مواده:</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => {
              setSelectedSystem("azhar");
              setSelectedBranchKey("azhar_scientific");
            }}
            className={`p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
              selectedSystem === "azhar"
                ? "bg-primary/10 border-primary text-primary font-bold shadow-md"
                : "bg-surface-container text-on-surface border-outline-variant/30"
            }`}
          >
            <span>🕌 التعليم الأزهري الشريف</span>
            {selectedSystem === "azhar" && <Check className="w-5 h-5 text-primary" />}
          </button>

          <button
            onClick={() => {
              setSelectedSystem("general");
              setSelectedBranchKey("general_science");
            }}
            className={`p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
              selectedSystem === "general"
                ? "bg-primary/10 border-primary text-primary font-bold shadow-md"
                : "bg-surface-container text-on-surface border-outline-variant/30"
            }`}
          >
            <span>🎓 الثانوي العام (تربية وتعليم)</span>
            {selectedSystem === "general" && <Check className="w-5 h-5 text-primary" />}
          </button>
        </div>
      </div>

      {/* Step 2: Branch Selector */}
      <div className="flex flex-col gap-3 pt-3 border-t border-outline-variant/10">
        <label className="text-label-sm font-bold text-on-surface">2. اختر الشعبة المستهدفة:</label>
        {selectedSystem === "azhar" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedBranchKey("azhar_scientific")}
              className={`p-3.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                selectedBranchKey === "azhar_scientific"
                  ? "bg-primary text-on-primary border-primary shadow-md"
                  : "bg-surface-container text-on-surface border-outline-variant/30"
              }`}
            >
              قسم علمي أزهري ({curriculum.azhar_scientific?.length || 0} مادة)
            </button>
            <button
              onClick={() => setSelectedBranchKey("azhar_literary")}
              className={`p-3.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                selectedBranchKey === "azhar_literary"
                  ? "bg-primary text-on-primary border-primary shadow-md"
                  : "bg-surface-container text-on-surface border-outline-variant/30"
              }`}
            >
              قسم أدبي أزهري ({curriculum.azhar_literary?.length || 0} مادة)
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => setSelectedBranchKey("general_science")}
              className={`p-3.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                selectedBranchKey === "general_science"
                  ? "bg-primary text-on-primary border-primary shadow-md"
                  : "bg-surface-container text-on-surface border-outline-variant/30"
              }`}
            >
              علمي علوم ({curriculum.general_science?.length || 0} مواد)
            </button>
            <button
              onClick={() => setSelectedBranchKey("general_math")}
              className={`p-3.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                selectedBranchKey === "general_math"
                  ? "bg-primary text-on-primary border-primary shadow-md"
                  : "bg-surface-container text-on-surface border-outline-variant/30"
              }`}
            >
              علمي رياضة ({curriculum.general_math?.length || 0} مواد)
            </button>
            <button
              onClick={() => setSelectedBranchKey("general_literary")}
              className={`p-3.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                selectedBranchKey === "general_literary"
                  ? "bg-primary text-on-primary border-primary shadow-md"
                  : "bg-surface-container text-on-surface border-outline-variant/30"
              }`}
            >
              قسم أدبي ({curriculum.general_literary?.length || 0} مواد)
            </button>
          </div>
        )}
      </div>

      {/* Step 3: Subjects List */}
      <div className="flex flex-col gap-4 pt-4 border-t border-outline-variant/10">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h4 className="text-body-lg font-bold text-on-surface flex items-center gap-2">
            <span>المواد الحالية المقررة في ({getBranchLabel(selectedBranchKey)}):</span>
          </h4>

          <button
            onClick={onOpenAddSubject}
            className="bg-primary text-on-primary hover:bg-primary/90 px-4 py-2 rounded-xl text-label-sm font-medium flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مادة جديدة لـ {getBranchLabel(selectedBranchKey)}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {currentBranchSubjects.map((sub) => (
            <div key={sub} className="bg-surface-container p-4 rounded-2xl border border-outline-variant/20 flex justify-between items-center shadow-sm hover:border-primary/50 transition-all">
              <div className="flex items-center gap-3 flex-grow overflow-hidden">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>

                {editingSubjectOldName === sub ? (
                  <div className="flex items-center gap-1.5 flex-grow">
                    <input
                      type="text"
                      value={editingSubjectNewValue}
                      onChange={(e) => setEditingSubjectNewValue(e.target.value)}
                      className="bg-surface-container-high border border-primary px-2.5 py-1 rounded-lg text-body-md text-on-surface w-full focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => handleEditSubjectInBranch(sub, editingSubjectNewValue)}
                      className="text-primary hover:bg-primary/10 p-1.5 rounded-lg cursor-pointer"
                      title="حفظ التعديل"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <span className="font-bold text-body-md text-on-surface truncate">{sub}</span>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {editingSubjectOldName !== sub && (
                  <button
                    onClick={() => {
                      setEditingSubjectOldName(sub);
                      setEditingSubjectNewValue(sub);
                    }}
                    className="text-on-surface-variant hover:text-primary hover:bg-surface-container-high p-1.5 rounded-lg transition-colors cursor-pointer"
                    title="تعديل اسم المادة"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => handleDeleteSubjectFromBranch(sub)}
                  className="text-error hover:bg-error/10 p-1.5 rounded-lg transition-colors cursor-pointer"
                  title="حذف هذه المادة"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
