import React, { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Plus, Link as LinkIcon, FileText, Video, Layers, Share2, HardDrive, CheckCircle2 } from "lucide-react";

interface AddContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newContent: any) => void;
  defaultContentType?: "book" | "video" | "flashcards" | "mindmaps";
  defaultSubject?: string;
  lockType?: boolean;
}

export function AddContentModal({
  isOpen,
  onClose,
  onSuccess,
  defaultContentType = "book",
  defaultSubject = "physics",
  lockType = false
}: AddContentModalProps) {
  const [contentType, setContentType] = useState<"book" | "video" | "flashcards" | "mindmaps">(defaultContentType);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState(defaultSubject);
  const [linkUrl, setLinkUrl] = useState("");
  const [description, setDescription] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setContentType(defaultContentType);
      setSubject(defaultSubject);
    }
  }, [isOpen, defaultContentType, defaultSubject]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title || !linkUrl) return;

    const newContentItem = {
      id: "user-item-" + Date.now(),
      title,
      subject,
      contentType,
      linkUrl,
      description,
      createdAt: new Date().toLocaleDateString("ar-SA")
    };

    // Save to local storage for persistence across pages
    try {
      const existing = JSON.parse(localStorage.getItem("wathaq_custom_content") || "[]");
      localStorage.setItem("wathaq_custom_content", JSON.stringify([newContentItem, ...existing]));
    } catch (err) {
      console.error("LocalStorage error:", err);
    }

    setSuccess(true);
    if (onSuccess) onSuccess(newContentItem);

    setTimeout(() => {
      setSuccess(false);
      setTitle("");
      setLinkUrl("");
      setDescription("");
      onClose();
    }, 1500);
  };

  const getLinkFieldLabel = () => {
    switch (contentType) {
      case "book":
        return { label: "رابط Google Drive للملف", placeholder: "https://drive.google.com/file/d/...", icon: HardDrive };
      case "video":
        return { label: "رابط الفيديو أو قائمة التشغيل", placeholder: "https://www.youtube.com/watch?v=...", icon: Video };
      case "flashcards":
      case "mindmaps":
        return { label: "رابط تحميل مباشر (Direct Download URL)", placeholder: "https://example.com/files/card.pdf", icon: LinkIcon };
    }
  };

  const linkConfig = getLinkFieldLabel();
  const LinkFieldIcon = linkConfig.icon;

  const getModalTitle = () => {
    switch (contentType) {
      case "video":
        return "إضافة فيديو / قائمة تشغيل جديدة";
      case "book":
        return "إضافة كتاب / ملزمة (Google Drive)";
      case "flashcards":
        return "إضافة بطاقة فلاش كارد جديدة";
      case "mindmaps":
        return "إضافة خريطة ذهنية جديدة";
      default:
        return "إضافة محتوى تعليمي جديد";
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-surface-container rounded-2xl border border-outline-variant/30 p-5 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto text-right"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 left-6 text-on-surface-variant hover:text-primary transition-colors p-1.5 rounded-lg bg-surface-container-high cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-headline-md font-headline-md text-on-surface">{getModalTitle()}</h2>
              <p className="text-label-sm text-on-surface-variant font-light">إضافة محتوى مخصص لهذا القسم</p>
            </div>
          </div>

          {success ? (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
              <CheckCircle2 className="w-16 h-16 text-primary animate-bounce" />
              <h3 className="text-headline-md text-on-surface">تمت إضافة المحتوى بنجاح!</h3>
              <p className="text-body-md text-on-surface-variant">تم حفظ الرابط وسيكون متاحاً لجميع الطلاب.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Content Type Selector (Only if not locked) */}
              {!lockType ? (
                <div className="flex flex-col gap-2">
                  <label className="text-label-sm text-on-surface-variant">نوع المحتوى</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setContentType("book")}
                      className={`py-2.5 px-3 rounded-lg border text-label-sm font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        contentType === "book"
                          ? "bg-primary text-on-primary border-primary"
                          : "bg-surface-container-high text-on-surface-variant border-outline-variant/30 hover:border-primary/50"
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      <span>كتاب / ملزمة (Drive)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setContentType("video")}
                      className={`py-2.5 px-3 rounded-lg border text-label-sm font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        contentType === "video"
                          ? "bg-primary text-on-primary border-primary"
                          : "bg-surface-container-high text-on-surface-variant border-outline-variant/30 hover:border-primary/50"
                      }`}
                    >
                      <Video className="w-4 h-4" />
                      <span>فيديو / قائمة تشغيل</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setContentType("flashcards")}
                      className={`py-2.5 px-3 rounded-lg border text-label-sm font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        contentType === "flashcards"
                          ? "bg-primary text-on-primary border-primary"
                          : "bg-surface-container-high text-on-surface-variant border-outline-variant/30 hover:border-primary/50"
                      }`}
                    >
                      <Layers className="w-4 h-4" />
                      <span>بطاقة فلاش كارد</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setContentType("mindmaps")}
                      className={`py-2.5 px-3 rounded-lg border text-label-sm font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        contentType === "mindmaps"
                          ? "bg-primary text-on-primary border-primary"
                          : "bg-surface-container-high text-on-surface-variant border-outline-variant/30 hover:border-primary/50"
                      }`}
                    >
                      <Share2 className="w-4 h-4" />
                      <span>خريطة ذهنية</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-surface-container-high border border-primary/20 rounded-xl p-3 flex items-center justify-between text-label-sm">
                  <span className="text-on-surface-variant">القسم المستهدف:</span>
                  <span className="text-primary font-medium flex items-center gap-1.5">
                    <LinkFieldIcon className="w-4 h-4" />
                    {contentType === "video" && "فيديوهات وشروحات مرئية"}
                    {contentType === "book" && "كتب وملازم (Google Drive)"}
                    {contentType === "flashcards" && "بطاقات فلاش كارد (رابط مباشر)"}
                  </span>
                </div>
              )}

              {/* Title */}
              <div className="flex flex-col gap-2">
                <label className="text-label-sm text-on-surface-variant">عنوان المحتوى</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: شرح درس الحركة والقوانين النيوتنية"
                  className="bg-surface-container-high text-on-surface border border-outline-variant/50 rounded-lg p-3 text-body-md focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Subject */}
              <div className="flex flex-col gap-2">
                <label className="text-label-sm text-on-surface-variant">المادة الدراسية</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="bg-surface-container-high text-on-surface border border-outline-variant/50 rounded-lg p-3 text-body-md focus:outline-none focus:border-primary transition-colors"
                >
                  <optgroup label="المواد العلمية">
                    <option value="physics">الفيزياء</option>
                    <option value="chemistry">الكيمياء</option>
                    <option value="biology">الأحياء</option>
                    <option value="math">الرياضيات</option>
                  </optgroup>
                  <optgroup label="المواد العربية">
                    <option value="grammar">النحو والصرف</option>
                    <option value="literature">الأدب والنصوص</option>
                    <option value="rhetoric">البلاغة والتعبير</option>
                  </optgroup>
                  <optgroup label="المواد الشرعية">
                    <option value="tawheed">التوحيد والعقيدة</option>
                    <option value="fiqh">الفقه وأصوله</option>
                    <option value="tafseer">التفسير وعلوم القرآن</option>
                    <option value="hadith">الحديث الشريف</option>
                  </optgroup>
                </select>
              </div>

              {/* Link Input (Drive / Video / Direct Download) */}
              <div className="flex flex-col gap-2">
                <label className="text-label-sm text-on-surface-variant flex items-center gap-1.5">
                  <LinkFieldIcon className="w-4 h-4 text-primary" />
                  <span>{linkConfig.label}</span>
                </label>
                <input
                  type="url"
                  required
                  dir="ltr"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder={linkConfig.placeholder}
                  className="bg-surface-container-high text-on-surface border border-outline-variant/50 rounded-lg p-3 text-body-md focus:outline-none focus:border-primary transition-colors font-mono text-xs"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2">
                <label className="text-label-sm text-on-surface-variant">الوصف والتفاصيل (اختياري)</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ملخص قصير أو ملاحظات هامة للطلاب..."
                  className="bg-surface-container-high text-on-surface border border-outline-variant/50 rounded-lg p-3 text-body-md focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="mt-2 py-3 rounded-xl bg-primary text-on-primary hover:bg-primary/90 transition-colors text-body-md font-medium flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/10"
              >
                <Plus className="w-5 h-5" />
                <span>حفظ ونشر المحتوى</span>
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
