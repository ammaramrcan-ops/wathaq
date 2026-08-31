import React, { useState, useEffect, FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, Plus, Link as LinkIcon, FileText, Video, Layers, Share2, 
  HardDrive, CheckCircle2, ChevronRight, ChevronLeft, HelpCircle, Sparkles, ShieldCheck 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { addCustomContent } from "@/lib/contentService";
import { getUserPermissions } from "@/lib/userPermissionsService";
import { extractYouTubeThumbnail, getSubjectTitle, getContentTypeTitle } from "@/lib/utils";
import { getStoredLessons } from "@/lib/lessonsData";

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
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  // Wizard Step state (1: Title/Name, 2: Link, 3: Description, 4: Confirmation)
  const [wizardStep, setWizardStep] = useState<number>(1);

  const [contentType, setContentType] = useState<"book" | "video" | "flashcards" | "mindmaps">(defaultContentType);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState(defaultSubject);
  const [selectedLesson, setSelectedLesson] = useState<string>("all");
  const [linkUrl, setLinkUrl] = useState("");
  const [description, setDescription] = useState("");
  const [success, setSuccess] = useState(false);
  const [submittedStatus, setSubmittedStatus] = useState<"approved" | "pending">("approved");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [urlError, setUrlError] = useState<string>("");

  const validateUrlDomain = (urlStr: string): { isValid: boolean; reason?: string } => {
    if (!urlStr.trim()) return { isValid: false, reason: "رابط الوصول مطلوب" };
    try {
      const parsed = new URL(urlStr.trim());
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return { isValid: false, reason: "يجب أن يبدأ الرابط بـ http:// أو https://" };
      }
      const hostname = parsed.hostname.toLowerCase();
      const pathname = parsed.pathname.toLowerCase();
      const isWhitelisted = 
        hostname.endsWith("youtube.com") ||
        hostname.endsWith("youtu.be") ||
        hostname.endsWith("drive.google.com") ||
        hostname.endsWith("docs.google.com") ||
        hostname.endsWith("archive.org") ||
        hostname.endsWith("res.cloudinary.com") ||
        hostname.endsWith("telegram.org") ||
        hostname.endsWith("t.me") ||
        hostname.endsWith("dropbox.com") ||
        hostname.endsWith("mediafire.com") ||
        hostname.endsWith("github.com") ||
        pathname.endsWith(".pdf");

      if (!isWhitelisted) {
        return { 
          isValid: false, 
          reason: "الرابط يجب أن ينتمي لنطاق موثوق (مثل YouTube, Google Drive, Archive, Cloudinary, Telegram, أو ملف PDF)." 
        };
      }
      return { isValid: true };
    } catch (e) {
      return { isValid: false, reason: "صيغة الرابط غير صحيحة، يرجى كتابة رابط كامل يبدأ بـ http:// أو https://" };
    }
  };

  useEffect(() => {
    if (isOpen) {
      setWizardStep(1);
      // Auto-detect Subject from URL searchParams or props
      const urlSubject = searchParams.get("subject");
      if (urlSubject) {
        setSubject(urlSubject);
      } else {
        setSubject(defaultSubject);
      }

      // Auto-detect ContentType from URL pathname, searchParams or props
      const path = window.location.pathname;
      const urlType = searchParams.get("type");
      const urlFilter = searchParams.get("filter");

      if (path.startsWith("/videos") || urlType === "video" || urlType === "playlist") {
        setContentType("video");
      } else if (path.startsWith("/flashcards") || urlFilter === "flashcards") {
        setContentType("flashcards");
      } else if (path.startsWith("/books") || urlFilter === "school" || urlFilter === "notes" || urlFilter === "summaries") {
        setContentType("book");
      } else if (urlFilter === "mindmaps") {
        setContentType("mindmaps");
      } else {
        setContentType(defaultContentType);
      }
    }
  }, [isOpen, defaultContentType, defaultSubject, searchParams]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !title.trim() || !linkUrl.trim()) return;

    const urlCheck = validateUrlDomain(linkUrl);
    if (!urlCheck.isValid) {
      setUrlError(urlCheck.reason || "الرابط غير موثوق");
      setWizardStep(2);
      return;
    }

    setIsSubmitting(true);
    try {
      // Check user permissions for direct publishing
      const effectiveUserId = user?.uid || auth.currentUser?.uid;
      const userPerms = effectiveUserId ? getUserPermissions(effectiveUserId, user?.email || "") : null;
      const isUserAdmin = 
        (user?.email && user.email.toLowerCase() === "ammaramrcan@gmail.com") || 
        userPerms?.canDirectPublish === true || 
        userPerms?.role === "admin" || 
        userPerms?.role === "trusted_publisher";

      const status: "approved" | "pending" = isUserAdmin ? "approved" : "pending";
      setSubmittedStatus(status);

      const ytThumb = contentType === "video" ? extractYouTubeThumbnail(linkUrl) : null;
      const finalDescription = selectedLesson !== "all" 
        ? `[درس: ${selectedLesson}] ${description}`.trim()
        : description;

      const newContentItem = {
        id: "user-item-" + Date.now(),
        title,
        subject,
        contentType,
        linkUrl,
        image: ytThumb || "",
        description: finalDescription,
        status,
        uploaderName: isUserAdmin ? (userPerms?.role === "admin" ? "أدمن المنصة" : "ناشر معتمد") : "طالب مسجل",
        createdAt: new Date().toLocaleDateString("ar-SA"),
        ...(effectiveUserId ? { userId: effectiveUserId } : {})
      };

      await addCustomContent(newContentItem, effectiveUserId);

      setSuccess(true);
      if (onSuccess) onSuccess(newContentItem);

      setTimeout(() => {
        setSuccess(false);
        setTitle("");
        setLinkUrl("");
        setDescription("");
        setWizardStep(1);
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Content creation error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-surface-container rounded-3xl border border-outline-variant/30 p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto text-right"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 left-6 text-on-surface-variant hover:text-primary transition-colors p-2 rounded-xl bg-surface-container-high cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Title */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-headline-md font-headline-md text-on-surface">إضافة محتوى خوارزمي متسلسل</h2>
              <p className="text-label-sm text-on-surface-variant font-light">
                إجابة سريعة على الأسئلة دون تعقيد الواجهات المزدحمة
              </p>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          {!success && (
            <div className="flex items-center justify-between gap-1 mb-8 bg-surface-container-high p-2 rounded-2xl border border-outline-variant/20">
              {[
                { step: 1, label: "1. اسم المصدر" },
                { step: 2, label: "2. الرابط" },
                { step: 3, label: "3. الوصف" },
                { step: 4, label: "4. التأكيد" }
              ].map((s) => (
                <div
                  key={s.step}
                  onClick={() => s.step < wizardStep && setWizardStep(s.step)}
                  className={`flex-1 text-center py-1.5 px-1 rounded-xl text-xs font-bold transition-all ${
                    wizardStep === s.step
                      ? "bg-primary text-on-primary shadow-md"
                      : wizardStep > s.step
                      ? "bg-primary/20 text-primary cursor-pointer hover:bg-primary/30"
                      : "text-on-surface-variant/50"
                  }`}
                >
                  {s.label}
                </div>
              ))}
            </div>
          )}

          {success ? (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-4 animate-fadeIn">
              <CheckCircle2 className="w-16 h-16 text-primary animate-bounce" />
              {submittedStatus === "approved" ? (
                <>
                  <h3 className="text-headline-md font-bold text-on-surface">تم النشر والموافقة الفورية! 🚀</h3>
                  <p className="text-body-md text-on-surface-variant max-w-sm">
                    تمت إضافة المحتوى واعتماده بشكل مباشر في منصة وثاق.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-headline-md font-bold text-on-surface">تم تقديم الطلب بنجاح! 📋</h3>
                  <p className="text-body-md text-on-surface-variant max-w-sm">
                    تم إرسال محتواك إلى قائمة مراجعة المشرفين وسيتم اعتماده قريباً.
                  </p>
                </>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* STEP 1: Content Title & Source Name Question */}
              {wizardStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-1.5">
                    <label className="text-headline-sm font-bold text-on-surface flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-primary" />
                      <span>السؤال 1: ما هو اسم المصدر أو عنوان الدرس؟</span>
                    </label>
                    <p className="text-body-sm text-on-surface-variant">
                      اكتب عنواناً واضحاً ومختصراً يساعد الطلاب في العثور عليه بسرعة.
                    </p>
                  </div>

                  <input
                    type="text"
                    required
                    autoFocus
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: شرح باب النيوتنية والتطبيقات العملية"
                    className="w-full bg-surface-container-high text-on-surface border border-outline-variant/50 rounded-2xl p-4 text-body-lg focus:outline-none focus:border-primary transition-all shadow-inner"
                  />

                  {/* Content Type Select or Locked Badge */}
                  {lockType || window.location.pathname.startsWith("/videos") || window.location.pathname.startsWith("/books") || window.location.pathname.startsWith("/flashcards") ? (
                    <div className="bg-surface-container-high border border-primary/20 rounded-2xl p-3.5 flex items-center justify-between text-xs mt-1">
                      <span className="text-on-surface-variant font-medium">القسم المستهدف (مكتشف تلقائياً):</span>
                      <span className="text-primary font-bold flex items-center gap-1.5 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
                        {contentType === "video" && "🎬 قسم الفيديوهات والشروحات المرئية"}
                        {contentType === "book" && "📚 قسم الكتب والملازم الدراسية"}
                        {contentType === "flashcards" && "🗂️ قسم بطاقات الفلاش كارد"}
                        {contentType === "mindmaps" && "🧠 قسم الخرائط الذهنية"}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 mt-2">
                      <label className="text-xs text-on-surface-variant font-bold">نوع المصدر (اختر ما يمثله المحتوى):</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setContentType("book")}
                          className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                            contentType === "book" ? "bg-primary text-on-primary border-primary" : "bg-surface-container-high text-on-surface-variant border-outline-variant/30"
                          }`}
                        >
                          <FileText className="w-4 h-4" />
                          <span>كتاب / ملزمة (Drive)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setContentType("video")}
                          className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                            contentType === "video" ? "bg-primary text-on-primary border-primary" : "bg-surface-container-high text-on-surface-variant border-outline-variant/30"
                          }`}
                        >
                          <Video className="w-4 h-4" />
                          <span>فيديو / شرح مرئي</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end mt-4">
                    <button
                      type="button"
                      disabled={!title.trim()}
                      onClick={() => setWizardStep(2)}
                      className="bg-primary text-on-primary px-6 py-3 rounded-2xl text-body-md font-bold hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-primary/10"
                    >
                      <span>التالي: إضافة الرابط</span>
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Link URL Question */}
              {wizardStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-1.5">
                    <label className="text-headline-sm font-bold text-on-surface flex items-center gap-2">
                      <LinkIcon className="w-5 h-5 text-primary" />
                      <span>السؤال 2: ما هو رابط الوصول لهذا المصدر؟</span>
                    </label>
                    <p className="text-body-sm text-on-surface-variant">
                      أدخل رابط Google Drive للمستندات أو رابط YouTube للشروحات.
                    </p>
                  </div>

                  <input
                    type="url"
                    required
                    autoFocus
                    dir="ltr"
                    value={linkUrl}
                    onChange={(e) => {
                      setLinkUrl(e.target.value);
                      if (urlError) setUrlError("");
                    }}
                    placeholder={contentType === "video" ? "https://www.youtube.com/watch?v=..." : "https://drive.google.com/file/d/..."}
                    className={`w-full bg-surface-container-high text-on-surface border rounded-2xl p-4 text-body-md focus:outline-none transition-all font-mono text-xs shadow-inner ${
                      urlError ? "border-error focus:border-error" : "border-outline-variant/50 focus:border-primary"
                    }`}
                  />
                  {urlError && (
                    <div className="bg-error/10 border border-error/30 text-error p-3 rounded-xl text-xs font-medium">
                      ⚠️ {urlError}
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-4">
                    <button
                      type="button"
                      onClick={() => setWizardStep(1)}
                      className="bg-surface-container-high text-on-surface-variant hover:text-on-surface px-5 py-3 rounded-2xl text-body-md font-medium transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                      <span>السابق</span>
                    </button>

                    <button
                      type="button"
                      disabled={!linkUrl.trim()}
                      onClick={() => {
                        const check = validateUrlDomain(linkUrl);
                        if (!check.isValid) {
                          setUrlError(check.reason || "الرابط غير موثوق");
                          return;
                        }
                        setUrlError("");
                        setWizardStep(3);
                      }}
                      className="bg-primary text-on-primary px-6 py-3 rounded-2xl text-body-md font-bold hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-primary/10"
                    >
                      <span>التالي: الوصف للتفاصيل</span>
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Optional Description Question */}
              {wizardStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-1.5">
                    <label className="text-headline-sm font-bold text-on-surface flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-primary" />
                      <span>السؤال 3: هل هذا محتوى لكامل المنهج أم درس معين؟</span>
                    </label>
                    <p className="text-body-sm text-on-surface-variant">
                      اختر نطاق المادة للتسهيل على زملائك العثور على الدرس المحدد.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-on-surface">نطاق المحتوى:</label>
                    <select
                      value={selectedLesson}
                      onChange={(e) => setSelectedLesson(e.target.value)}
                      className="w-full bg-surface-container-high text-on-surface border border-outline-variant/50 rounded-2xl p-3 text-body-md focus:outline-none focus:border-primary"
                    >
                      <option value="all">كامل المنهج الشامل</option>
                      {(getStoredLessons()[subject] || []).map((les) => (
                        <option key={les} value={les}>
                          درس معين: {les}
                        </option>
                      ))}
                    </select>
                  </div>

                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="ملاحظات توضيحية إضافية للطلاب (اختياري)..."
                    className="w-full bg-surface-container-high text-on-surface border border-outline-variant/50 rounded-2xl p-4 text-body-md focus:outline-none focus:border-primary transition-all shadow-inner mt-1"
                  />

                  <div className="flex justify-between items-center mt-4">
                    <button
                      type="button"
                      onClick={() => setWizardStep(2)}
                      className="bg-surface-container-high text-on-surface-variant hover:text-on-surface px-5 py-3 rounded-2xl text-body-md font-medium transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                      <span>السابق</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setWizardStep(4)}
                      className="bg-primary text-on-primary px-6 py-3 rounded-2xl text-body-md font-bold hover:bg-primary/90 transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-primary/10"
                    >
                      <span>التالي: مراجعة الاكتشاف والتأكيد</span>
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: Automatic Subject & Section Review & Final Confirmation */}
              {wizardStep === 4 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col gap-5"
                >
                  <div className="flex flex-col gap-1">
                    <h3 className="text-headline-sm font-bold text-on-surface flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-primary" />
                      <span>المراجعة والتأكيد النهائي</span>
                    </h3>
                    <p className="text-body-sm text-on-surface-variant">
                      تم الاكتشاف والتعرف على المادة والقسم المباشر تلقائياً:
                    </p>
                  </div>

                  {/* Summary Card */}
                  <div className="bg-surface-container-high border border-primary/30 rounded-2xl p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-center border-b border-outline-variant/20 pb-2">
                      <span className="text-xs text-on-surface-variant font-medium">المادة المستهدفة:</span>
                      <span className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
                        {getSubjectTitle(subject)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center border-b border-outline-variant/20 pb-2">
                      <span className="text-xs text-on-surface-variant font-medium">القسم المكتشف:</span>
                      <span className="text-xs font-bold text-on-surface">
                        {getContentTypeTitle(contentType)}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 pt-1">
                      <span className="text-xs text-on-surface-variant font-medium">عنوان المحتوى:</span>
                      <p className="text-body-md font-bold text-on-surface">{title}</p>
                    </div>

                    {linkUrl && (
                      <div className="flex flex-col gap-1 pt-1">
                        <span className="text-xs text-on-surface-variant font-medium">الرابط المرفق:</span>
                        <p className="text-xs font-mono text-primary truncate" dir="ltr">{linkUrl}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => setWizardStep(3)}
                      className="bg-surface-container-high text-on-surface-variant hover:text-on-surface px-5 py-3 rounded-2xl text-body-md font-medium transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                      <span>تعديل الإجابات</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.04, y: -1 }}
                      whileTap={{ scale: 0.94 }}
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-primary text-on-primary px-7 py-3.5 rounded-2xl text-body-md font-bold hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-primary/20"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                          <span>جاري النشر...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5" />
                          <span>🚀 تأكيد ونشر المحتوى</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
