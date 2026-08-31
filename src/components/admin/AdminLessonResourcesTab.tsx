import React, { useState, useEffect } from "react";
import { 
  subscribeUnits, SubjectUnitsMap, SubjectUnit 
} from "@/lib/lessonsData";
import { 
  subscribeLessonResources, saveLessonResource, LessonResourcesMap, LessonResourceAttachment 
} from "@/lib/lessonResourcesService";
import { 
  FileText, Image as ImageIcon, Layers, BookOpen, Save, CheckCircle2, Link as LinkIcon, Sparkles 
} from "lucide-react";
import { 
  subscribeSubjectNotebookLmMap, saveSubjectNotebookLmLink, SubjectNotebookLmMap 
} from "@/lib/subjectNotebookLmService";

const availableSubjectsList = [
  { id: "physics", title: "الفيزياء" },
  { id: "chemistry", title: "الكيمياء" },
  { id: "biology", title: "الأحياء" },
  { id: "math", title: "الرياضيات" },
  { id: "grammar", title: "النحو والصرف" },
  { id: "literature", title: "الأدب والنصوص" },
  { id: "rhetoric", title: "البلاغة والتعبير" },
  { id: "english", title: "اللغة الإنجليزية" },
  { id: "quran", title: "القرآن الكريم" },
  { id: "fiqh", title: "الفقه وأصوله" },
  { id: "tawheed", title: "التوحيد والعقيدة" },
  { id: "tafseer", title: "التفسير وعلوم القرآن" },
  { id: "hadith", title: "الحديث الشريف" }
];

export function AdminLessonResourcesTab() {
  const [unitsMap, setUnitsMap] = useState<SubjectUnitsMap>({});
  const [resourcesMap, setResourcesMap] = useState<LessonResourcesMap>({});

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("physics");
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [selectedLessonTitle, setSelectedLessonTitle] = useState<string>("");

  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [mindmapUrl, setMindmapUrl] = useState<string>("");
  const [csvUrl, setCsvUrl] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const [subjectNotebookLmMap, setSubjectNotebookLmMap] = useState<SubjectNotebookLmMap>({});
  const [subjectNotebookLmUrl, setSubjectNotebookLmUrl] = useState<string>("");

  useEffect(() => {
    const unsubUnits = subscribeUnits((map) => setUnitsMap(map));
    const unsubRes = subscribeLessonResources((map) => setResourcesMap(map));
    const unsubNb = subscribeSubjectNotebookLmMap((map) => setSubjectNotebookLmMap(map));
    return () => {
      unsubUnits();
      unsubRes();
      unsubNb();
    };
  }, []);

  const currentSubjectUnits = unitsMap[selectedSubjectId] || [];

  // Update selected NotebookLM link when subject changes
  useEffect(() => {
    if (selectedSubjectId) {
      setSubjectNotebookLmUrl(subjectNotebookLmMap[selectedSubjectId] || "");
    }
  }, [selectedSubjectId, subjectNotebookLmMap]);

  // Update selected unit when subject changes
  useEffect(() => {
    if (currentSubjectUnits.length > 0) {
      const firstUnit = currentSubjectUnits[0];
      setSelectedUnitId(firstUnit.id);
      if (firstUnit.lessons && firstUnit.lessons.length > 0) {
        setSelectedLessonTitle(firstUnit.lessons[0]);
      } else {
        setSelectedLessonTitle("");
      }
    } else {
      setSelectedUnitId("");
      setSelectedLessonTitle("");
    }
  }, [selectedSubjectId, unitsMap]);

  // Update selected lesson when unit changes
  useEffect(() => {
    const unitObj = currentSubjectUnits.find((u) => u.id === selectedUnitId);
    if (unitObj && unitObj.lessons && unitObj.lessons.length > 0) {
      setSelectedLessonTitle(unitObj.lessons[0]);
    } else {
      setSelectedLessonTitle("");
    }
  }, [selectedUnitId]);

  // Load existing URLs when selected lesson changes
  useEffect(() => {
    if (selectedSubjectId && selectedLessonTitle) {
      const key = `${selectedSubjectId}__${selectedLessonTitle}`;
      const existing = resourcesMap[key];
      if (existing) {
        setPdfUrl(existing.pdfUrl || "");
        setMindmapUrl(existing.mindmapImageUrl || "");
        setCsvUrl(existing.flashcardsCsvUrl || "");
      } else {
        setPdfUrl("");
        setMindmapUrl("");
        setCsvUrl("");
      }
    } else {
      setPdfUrl("");
      setMindmapUrl("");
      setCsvUrl("");
    }
    setSavedSuccess(false);
  }, [selectedSubjectId, selectedLessonTitle, resourcesMap]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId) return;

    setIsSaving(true);
    try {
      if (subjectNotebookLmUrl.trim()) {
        await saveSubjectNotebookLmLink(selectedSubjectId, subjectNotebookLmUrl.trim());
      }

      if (selectedLessonTitle) {
        const unitObj = currentSubjectUnits.find((u) => u.id === selectedUnitId);
        await saveLessonResource({
          id: `${selectedSubjectId}__${selectedLessonTitle}`,
          subjectId: selectedSubjectId,
          unitId: selectedUnitId,
          unitTitle: unitObj?.unitTitle,
          lessonTitle: selectedLessonTitle,
          pdfUrl: pdfUrl.trim() || undefined,
          mindmapImageUrl: mindmapUrl.trim() || undefined,
          flashcardsCsvUrl: csvUrl.trim() || undefined
        });
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const selectedSubjectObj = availableSubjectsList.find((s) => s.id === selectedSubjectId);

  return (
    <div className="bg-surface-container-low border border-outline-variant/30 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 text-right shadow-xl">
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-outline-variant/10 pb-4">
        <div>
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold w-fit mb-2">
            <LinkIcon className="w-4 h-4" />
            <span>إدارة روابط المرفقات لكل درس</span>
          </div>
          <h3 className="text-headline-md font-bold text-on-surface">ربط ملفات PDF، الخرائط الذهنية، و CSV للدروس</h3>
          <p className="text-body-md text-on-surface-variant font-light mt-1">
            اختر المادة والدرس المضاف في المنهج، ثم ضع روابط المرفقات الخاصة به مباشرة.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* Selectors: Subject -> Unit -> Lesson */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-surface-container/60 p-5 rounded-2xl border border-outline-variant/20">
          {/* Subject Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-primary" />
              <span>1. اختر المادة:</span>
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="bg-surface-container-high border border-outline-variant/40 rounded-xl p-3 text-body-md text-on-surface font-bold focus:outline-none focus:border-primary"
            >
              {availableSubjectsList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          {/* Unit Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-primary" />
              <span>2. اختر الباب / الفصل:</span>
            </label>
            <select
              value={selectedUnitId}
              onChange={(e) => setSelectedUnitId(e.target.value)}
              disabled={currentSubjectUnits.length === 0}
              className="bg-surface-container-high border border-outline-variant/40 rounded-xl p-3 text-body-md text-on-surface font-bold focus:outline-none focus:border-primary disabled:opacity-50"
            >
              {currentSubjectUnits.length === 0 ? (
                <option value="">لا توجد أبواب مضافة لهذه المادة</option>
              ) : (
                currentSubjectUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.unitTitle}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Lesson Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>3. اختر الدرس المحدد:</span>
            </label>
            <select
              value={selectedLessonTitle}
              onChange={(e) => setSelectedLessonTitle(e.target.value)}
              disabled={!selectedUnitId || (currentSubjectUnits.find((u) => u.id === selectedUnitId)?.lessons || []).length === 0}
              className="bg-surface-container-high border border-outline-variant/40 rounded-xl p-3 text-body-md text-on-surface font-bold focus:outline-none focus:border-primary disabled:opacity-50"
            >
              {(currentSubjectUnits.find((u) => u.id === selectedUnitId)?.lessons || []).length === 0 ? (
                <option value="">لا توجد دروس مضافة بهذا الباب</option>
              ) : (
                (currentSubjectUnits.find((u) => u.id === selectedUnitId)?.lessons || []).map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Subject NotebookLM Dedicated Link */}
        <div className="flex flex-col gap-1.5 bg-gradient-to-r from-emerald-500/10 via-primary/10 to-blue-500/10 p-5 rounded-2xl border border-primary/30">
          <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>رابط معلّم AI (NotebookLM) المخصص لمادة ({selectedSubjectObj?.title}):</span>
          </label>
          <input
            type="url"
            value={subjectNotebookLmUrl}
            onChange={(e) => setSubjectNotebookLmUrl(e.target.value)}
            placeholder="https://notebooklm.google.com/notebook/... (ضع رابط النوت بوك المخصص لهذه المادة هنا)"
            className="bg-surface-container-high border border-outline-variant/40 rounded-xl p-3 text-body-md text-on-surface focus:outline-none focus:border-primary font-medium"
          />
          <span className="text-[11px] text-on-surface-variant font-light">
            💡 عند تحديد هذا الرابط، سيفتح للطلاب نوت بوك المادة المخصص مباشرة فور النقر على قسم معلّم AI NotebookLM بـ ({selectedSubjectObj?.title}).
          </span>
        </div>

        {selectedLessonTitle ? (
          <div className="flex flex-col gap-5 bg-surface-container p-6 rounded-3xl border border-outline-variant/20">
            <div className="border-b border-outline-variant/10 pb-3">
              <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                إضافة روابط مرفقات الدرس 🔗
              </span>
              <h4 className="text-headline-md font-bold text-on-surface mt-2">
                الدرس المحدد: ({selectedLessonTitle}) - مادة {selectedSubjectObj?.title}
              </h4>
            </div>

            {/* PDF Summary Link */}
            <div className="flex flex-col gap-1.5">
              <label className="text-label-sm font-bold text-on-surface flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>1. رابط ملف الـ PDF (ملخص ومراجعة الدرس):</span>
              </label>
              <input
                type="url"
                value={pdfUrl}
                onChange={(e) => setPdfUrl(e.target.value)}
                placeholder="https://drive.google.com/file/d/... (رابط ملف PDF الملخص)"
                className="bg-surface-container-high border border-outline-variant/40 rounded-xl p-3 text-body-md text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            {/* Mindmap Image Link */}
            <div className="flex flex-col gap-1.5">
              <label className="text-label-sm font-bold text-on-surface flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                <span>2. رابط صورة الخريطة الذهنية البصرية للدرس:</span>
              </label>
              <input
                type="url"
                value={mindmapUrl}
                onChange={(e) => setMindmapUrl(e.target.value)}
                placeholder="https://images.unsplash.com/... (رابط صورة الخريطة الذهنية)"
                className="bg-surface-container-high border border-outline-variant/40 rounded-xl p-3 text-body-md text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            {/* Flashcards CSV File Link */}
            <div className="flex flex-col gap-1.5">
              <label className="text-label-sm font-bold text-on-surface flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <span>3. رابط ملف الـ CSV للفلاش كارد للدرس:</span>
              </label>
              <input
                type="url"
                value={csvUrl}
                onChange={(e) => setCsvUrl(e.target.value)}
                placeholder="https://drive.google.com/... (رابط ملف CSV للفلاش كارد)"
                className="bg-surface-container-high border border-outline-variant/40 rounded-xl p-3 text-body-md text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              {savedSuccess ? (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4" /> تم حفظ كافة روابط المرفقات بهذا الدرس بنجاح!
                </span>
              ) : (
                <span className="text-xs text-on-surface-variant font-light">
                  يتم إتاحة الروابط فورياً للطلاب عند اختيار قسم الملفات أو الخرائط أو الفلاش كارد للدرس.
                </span>
              )}

              <button
                type="submit"
                disabled={isSaving}
                className="bg-primary text-on-primary hover:bg-primary/90 px-6 py-3 rounded-xl font-bold text-label-sm transition-all shadow-lg shadow-primary/20 flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>حفظ مرفقات الدرس</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-surface-container rounded-2xl border border-outline-variant/20 text-on-surface-variant font-light">
            الرجاء إضافة أبواب ودروس لهذه المادة أولاً من تبويب (إدارة دروس المناهج) لربط المرفقات بها.
          </div>
        )}
      </form>
    </div>
  );
}
