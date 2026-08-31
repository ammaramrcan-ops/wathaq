import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { BookOpen, Plus, Trash2, CheckCircle2, Layers, FolderPlus, FileText, Sparkles } from "lucide-react";
import { 
  subscribeUnits, 
  addUnitToSubject, 
  removeUnitFromSubject, 
  addLessonToUnit, 
  removeLessonFromUnit, 
  SubjectUnitsMap 
} from "@/lib/lessonsData";

const subjectsList = [
  { id: "physics", title: "الفيزياء", category: "علمي" },
  { id: "chemistry", title: "الكيمياء", category: "علمي" },
  { id: "biology", title: "الأحياء", category: "علمي" },
  { id: "math", title: "الرياضيات", category: "علمي" },
  { id: "grammar", title: "النحو والصرف", category: "عربي" },
  { id: "literature", title: "الأدب والنصوص", category: "عربي" },
  { id: "rhetoric", title: "البلاغة والتعبير", category: "عربي" },
  { id: "english", title: "اللغة الإنجليزية", category: "ثقافي" },
  { id: "fiqh", title: "الفقه وأصوله", category: "شرعي" },
  { id: "tawheed", title: "التوحيد والعقيدة", category: "شرعي" },
  { id: "tafseer", title: "التفسير وعلوم القرآن", category: "شرعي" },
  { id: "hadith", title: "الحديث الشريف", category: "شرعي" }
];

export function AdminLessonsTab() {
  const [unitsMap, setUnitsMap] = useState<SubjectUnitsMap>({});
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("physics");
  const [newUnitTitle, setNewUnitTitle] = useState<string>("");
  const [addingLessonUnitId, setAddingLessonUnitId] = useState<string | null>(null);
  const [newLessonTitleMap, setNewLessonTitleMap] = useState<Record<string, string>>({});
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const unsub = subscribeUnits((map) => {
      setUnitsMap(map);
    });
    return () => unsub();
  }, []);

  const currentUnits = unitsMap[selectedSubjectId] || [];

  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitTitle.trim()) return;

    setIsAdding(true);
    try {
      const updated = await addUnitToSubject(selectedSubjectId, newUnitTitle.trim());
      setUnitsMap(updated);
      setNewUnitTitle("");
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveUnit = async (unitId: string, unitTitle: string) => {
    if (!window.confirm(`هل أنت تأكد من رغبتك في حذف الباب/الفصل "${unitTitle}" بما يحتويه من دروس؟`)) return;
    const updated = await removeUnitFromSubject(selectedSubjectId, unitId);
    setUnitsMap(updated);
  };

  const handleAddLesson = async (unitId: string, e: React.FormEvent) => {
    e.preventDefault();
    const lessonTitle = (newLessonTitleMap[unitId] || "").trim();
    if (!lessonTitle) return;

    const updated = await addLessonToUnit(selectedSubjectId, unitId, lessonTitle);
    setUnitsMap(updated);
    setNewLessonTitleMap((prev) => ({ ...prev, [unitId]: "" }));
  };

  const handleRemoveLesson = async (unitId: string, lessonTitle: string) => {
    if (!window.confirm(`هل أنت تأكد من رغبتك في حذف درس "${lessonTitle}"؟`)) return;
    const updated = await removeLessonFromUnit(selectedSubjectId, unitId, lessonTitle);
    setUnitsMap(updated);
  };

  const selectedSubjectObj = subjectsList.find((s) => s.id === selectedSubjectId);

  const getTotalSubjectLessonsCount = (subId: string) => {
    const units = unitsMap[subId] || [];
    let count = 0;
    units.forEach((u) => { if (u.lessons) count += u.lessons.length; });
    return count;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Banner */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-3xl p-6 flex justify-between items-center flex-wrap gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
            <Layers className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-headline-md font-bold text-on-surface">إدارة أبواب وفصول ودروس المناهج</h2>
            <p className="text-body-md text-on-surface-variant font-light mt-1">
              إضافة الفصول/الأبواب والدروس لكل مادة لتوفير التصفية التفاعلية للطلاب.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject Selector Sidebar */}
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-3xl p-6 flex flex-col gap-3 shadow-lg">
          <h3 className="text-headline-sm font-bold text-on-surface mb-2 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <span>اختر المادة الدراسية</span>
          </h3>

          <div className="flex flex-col gap-2 max-h-[550px] overflow-y-auto pr-1">
            {subjectsList.map((sub) => {
              const isSelected = sub.id === selectedSubjectId;
              const count = getTotalSubjectLessonsCount(sub.id);
              const unitsCount = (unitsMap[sub.id] || []).length;

              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubjectId(sub.id)}
                  className={`flex justify-between items-center p-3.5 rounded-2xl border text-right transition-all cursor-pointer ${
                    isSelected 
                      ? "bg-primary text-on-primary border-primary font-bold shadow-md" 
                      : "bg-surface-container hover:bg-surface-container-high border-outline-variant/20 text-on-surface"
                  }`}
                >
                  <span className="text-body-md">{sub.title}</span>
                  <div className="flex items-center gap-1">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full border ${
                      isSelected ? "bg-on-primary/20 border-on-primary/30 text-on-primary" : "bg-surface-container-high text-on-surface-variant border-outline-variant/30"
                    }`}>
                      {unitsCount} أبواب | {count} درس
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Units & Lessons Manager for Selected Subject */}
        <div className="lg:col-span-2 bg-surface-container-low border border-outline-variant/30 rounded-3xl p-6 flex flex-col gap-6 shadow-lg">
          <div className="flex justify-between items-center border-b border-outline-variant/10 pb-4 flex-wrap gap-2">
            <div>
              <h3 className="text-headline-md font-bold text-on-surface">
                أبواب ودروس مادة ({selectedSubjectObj?.title})
              </h3>
              <p className="text-body-md text-on-surface-variant font-light mt-0.5">
                إضافة الأبواب/الفصول ثم إضافة الدروس التابعة لكل باب.
              </p>
            </div>
            <span className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-label-sm font-bold">
              {currentUnits.length} أبواب ومجموع {getTotalSubjectLessonsCount(selectedSubjectId)} دروس
            </span>
          </div>

          {/* Add New Unit Form */}
          <form onSubmit={handleAddUnit} className="flex gap-3 bg-surface-container border border-outline-variant/30 p-4 rounded-2xl shadow-sm">
            <input
              type="text"
              required
              value={newUnitTitle}
              onChange={(e) => setNewUnitTitle(e.target.value)}
              placeholder="اكتب اسم الباب / الفصل الجديد (مثال: الباب الأول: الفيزياء الكهربية...)"
              className="flex-1 bg-surface-container-high border border-outline-variant/40 rounded-xl p-3 text-body-md text-on-surface focus:outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={isAdding}
              className="bg-primary text-on-primary hover:bg-primary/90 px-5 py-3 rounded-xl text-label-sm font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-primary/20 shrink-0"
            >
              <FolderPlus className="w-4 h-4" />
              <span>إضافة الباب</span>
            </button>
          </form>

          {/* Units and Nested Lessons List */}
          <div className="flex flex-col gap-6">
            {currentUnits.length === 0 ? (
              <div className="p-8 text-center bg-surface-container rounded-2xl border border-outline-variant/20 text-on-surface-variant font-light">
                لا توجد أبواب مضافة لهذه المادة بعد. قم بإضافة الباب الأول عبر النموذج أعلاه.
              </div>
            ) : (
              currentUnits.map((unit, uIdx) => (
                <div
                  key={unit.id || uIdx}
                  className="bg-surface-container border border-outline-variant/30 rounded-2xl p-5 flex flex-col gap-4 shadow-md"
                >
                  <div className="flex justify-between items-center border-b border-outline-variant/10 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 border border-primary/20">
                        {uIdx + 1}
                      </span>
                      <h4 className="text-headline-sm font-bold text-on-surface">{unit.unitTitle}</h4>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveUnit(unit.id, unit.unitTitle)}
                      className="p-2 rounded-xl text-on-surface-variant hover:text-error bg-surface-container-high hover:bg-error/10 border border-outline-variant/20 transition-all cursor-pointer"
                      title="حذف هذا الباب بالكامل"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Add Lesson to this Unit Form */}
                  <form onSubmit={(e) => handleAddLesson(unit.id, e)} className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={newLessonTitleMap[unit.id] || ""}
                      onChange={(e) => setNewLessonTitleMap((prev) => ({ ...prev, [unit.id]: e.target.value }))}
                      placeholder={`أضف درساً جديداً داخل (${unit.unitTitle})...`}
                      className="flex-1 bg-surface-container-high border border-outline-variant/30 rounded-xl px-3.5 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                    />
                    <button
                      type="submit"
                      className="bg-primary/20 border border-primary/30 text-primary hover:bg-primary hover:text-on-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة درس</span>
                    </button>
                  </form>

                  {/* Nested Lessons List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                    {(!unit.lessons || unit.lessons.length === 0) ? (
                      <p className="text-xs text-on-surface-variant/70 italic p-2 col-span-2">
                        لا توجد دروس مضافة داخل هذا الباب بعد.
                      </p>
                    ) : (
                      unit.lessons.map((lesson) => (
                        <div
                          key={lesson}
                          className="bg-surface-container-high border border-outline-variant/20 rounded-xl p-3 flex justify-between items-center gap-2 text-xs font-medium text-on-surface"
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="truncate">{lesson}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveLesson(unit.id, lesson)}
                            className="p-1 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors shrink-0"
                            title="حذف هذا الدرس"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
