import { useState, useEffect, FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  MessageSquare, User, Plus, Sparkles, Lightbulb, 
  HelpCircle, Award, ChevronLeft, ArrowRight, Atom, 
  BookOpen, Compass, CheckCircle2, Star, ThumbsUp, Send, Trash2, ExternalLink
} from "lucide-react";
import Teachers from "@/pages/Teachers";
import { useAuth } from "@/context/AuthContext";
import { 
  subscribeDiscussions, 
  addDiscussion, 
  deleteDiscussion, 
  Discussion 
} from "@/lib/communityService";
import { 
  subscribeStudentProfile, 
  filterCategoriesForProfile, 
  filterSubjectsForProfile, 
  StudentAcademicProfile 
} from "@/lib/subjectsData";
import { addSuggestion } from "@/lib/suggestionService";
import { subscribeCommunityGroups, CommunityGroupItem } from "@/lib/communityGroupsService";

const mainCategories = [
  { id: "scientific", title: "مواد علمية", icon: Atom },
  { id: "arabic", title: "اللغة العربية", icon: BookOpen },
  { id: "islamic", title: "العلوم الشرعية", icon: Compass }
];

const subjects = [
  { id: "physics", title: "الفيزياء", categoryId: "scientific" },
  { id: "chemistry", title: "الكيمياء", categoryId: "scientific" },
  { id: "biology", title: "الأحياء", categoryId: "scientific" },
  { id: "math", title: "الرياضيات", categoryId: "scientific" },
  { id: "grammar", title: "النحو والصرف", categoryId: "arabic" },
  { id: "literature", title: "الأدب والنصوص", categoryId: "arabic" },
  { id: "english", title: "اللغة الإنجليزية", categoryId: "arabic" },
  { id: "tawheed", title: "التوحيد والعقيدة", categoryId: "islamic" },
  { id: "fiqh", title: "الفقه وأصوله", categoryId: "islamic" }
];

export default function Community() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [mode, setMode] = useState<"select" | "advice" | "question_wizard" | "teachers">("select");
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);

  const [academicProfile, setAcademicProfile] = useState<StudentAcademicProfile | null>(null);

  useEffect(() => {
    const unsubProf = subscribeStudentProfile(user?.uid, (prof) => {
      setAcademicProfile(prof);
    });
    return () => unsubProf();
  }, [user?.uid]);

  const availableCategories = filterCategoriesForProfile(academicProfile, mainCategories);
  const availableSubjects = filterSubjectsForProfile(academicProfile, subjects);

  const [communityGroups, setCommunityGroups] = useState<CommunityGroupItem[]>([]);

  useEffect(() => {
    const unsub = subscribeDiscussions((list) => {
      setDiscussions(list);
    });
    const unsubGroups = subscribeCommunityGroups((list) => {
      setCommunityGroups(list);
    });
    return () => {
      unsub();
      unsubGroups();
    };
  }, []);

  useEffect(() => {
    const modeParam = searchParams.get("mode") as any;
    const catParam = searchParams.get("category");
    const subParam = searchParams.get("subject");

    if (modeParam && ["select", "advice", "question_wizard", "teachers"].includes(modeParam)) {
      setMode(modeParam);
    } else {
      setMode("select");
    }

    if (catParam) setSelectedCategory(catParam);
    if (subParam) {
      setSelectedSubject(subParam);
      setWizardStep(3);
    }
  }, [searchParams]);

  const updateUrlMode = (newMode: "select" | "advice" | "question_wizard" | "teachers", extraParams?: Record<string, string>) => {
    setMode(newMode);
    if (newMode === "select") {
      setSearchParams({});
    } else {
      setSearchParams({ mode: newMode, ...extraParams });
    }
  };

  // New Question Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newExcerpt, setNewExcerpt] = useState("");
  const [newCategory, setNewCategory] = useState<"advice" | "question">("advice");
  const [newSubject, setNewSubject] = useState("physics");

  // Suggestion Modal State
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
  const [suggestionTitle, setSuggestionTitle] = useState("");
  const [suggestionDetails, setSuggestionDetails] = useState("");
  const [isSubmittingSuggestion, setIsSubmittingSuggestion] = useState(false);

  const handleAddSuggestionSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!suggestionTitle.trim() || !suggestionDetails.trim()) return;

    setIsSubmittingSuggestion(true);
    try {
      await addSuggestion({
        id: "sug-" + Date.now(),
        title: suggestionTitle.trim(),
        details: suggestionDetails.trim(),
        userName: user?.displayName || user?.email?.split("@")[0] || "طالب وثاق",
        userEmail: user?.email || undefined,
        createdAt: new Date().toISOString(),
        status: "new"
      });
      alert("تم إرسال اقتراحك للإدارة بنجاح، شكراً لمساهمتك في تطوير المنصة! 💡");
      setIsSuggestionModalOpen(false);
      setSuggestionTitle("");
      setSuggestionDetails("");
    } finally {
      setIsSubmittingSuggestion(false);
    }
  };

  const handleAddDiscussion = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newExcerpt.trim()) return;

    const authorName = user?.displayName || user?.email?.split("@")[0] || "طالب وثاق";

    const newPost: Discussion = {
      id: "d-" + Date.now(),
      title: newTitle.trim(),
      author: authorName,
      authorEmail: user?.email || undefined,
      authorUid: user?.uid || undefined,
      category: newCategory,
      subjectId: newCategory === "question" ? newSubject : undefined,
      replies: 0,
      time: "الآن",
      excerpt: newExcerpt.trim(),
      tags: [newCategory === "advice" ? "نصيحة جديدة" : "سؤال جديد"]
    };

    await addDiscussion(newPost);
    setIsModalOpen(false);
    setNewTitle("");
    setNewExcerpt("");
  };

  const handleDeleteDiscussion = async (discId: string) => {
    if (!window.confirm("هل أنت تأكد من رغبتك في حذف هذا المنشور والتسجيل السحابي له؟")) {
      return;
    }
    await deleteDiscussion(discId);
  };

  const getSubjectTitle = (code: string) => {
    const map: Record<string, string> = {
      physics: "الفيزياء",
      chemistry: "الكيمياء",
      biology: "الأحياء",
      math: "الرياضيات",
      grammar: "النحو والصرف",
      literature: "الأدب والنصوص",
      tawheed: "التوحيد والعقيدة",
      fiqh: "الفقه وأصوله"
    };
    return map[code] || code;
  };

  return (
    <div className="flex flex-col gap-stack-lg min-h-[75vh]">
      {/* Header Banner */}
      <section className="bg-surface-container-low border border-outline-variant/30 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-display-ar font-display-ar text-on-surface">مجتمع وثاق والنقاشات الأكاديمية</h1>
              <p className="text-body-md text-on-surface-variant font-light mt-1">
                مساحة مخصصة للتركيز الأكاديمي، تبادل النصائح، وطرح أسئلة المنهج بعيداً عن المشتتات.
              </p>
            </div>
          </div>

          {mode !== "select" ? (
              <button
                onClick={() => {
                  setMode("select");
                  setWizardStep(1);
                  setSelectedCategory(null);
                  setSelectedSubject(null);
                }}
                className="text-label-sm font-label-sm text-on-surface-variant hover:text-primary border border-outline-variant/30 px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                ← العودة للخيارات الرئيسية
              </button>
            ) : (
              <button
                onClick={() => setIsSuggestionModalOpen(true)}
                className="bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 px-4 py-2 rounded-xl text-label-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <Lightbulb className="w-4 h-4" />
                <span>لديك اقتراح لتحسين المنصة؟</span>
              </button>
            )}
        </div>
      </section>

      {/* MODE SELECTOR: Initial Screen with 3 Distinct Cards */}
      {mode === "select" && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-stack-lg my-auto items-center"
        >
          <div className="text-center max-w-lg mb-2">
            <h2 className="text-headline-lg font-headline-lg text-on-surface mb-2">ما هو هدف زيارتك للمجتمع اليوم؟</h2>
            <p className="text-body-md text-on-surface-variant font-light">اختر المسار المناسب لطلب نصيحة، طرح سؤال في المنهج، أو تصفح دليل المدرسين.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-stack-md w-full max-w-5xl">
            {/* Option 1: Advice & General Discussion */}
            <button
              onClick={() => updateUrlMode("advice")}
              className="group text-right p-6 sm:p-8 rounded-3xl bg-surface-container-low border border-outline-variant/30 hover:border-amber-400 hover:bg-surface-container transition-all duration-300 flex flex-col justify-between h-[250px] cursor-pointer shadow-xl"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 group-hover:scale-110 transition-transform mb-4">
                <Lightbulb className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-headline-md font-headline-md text-on-surface group-hover:text-amber-400 transition-colors mb-2">
                  نصيحة ونقاش عام
                </h3>
                <p className="text-body-md text-on-surface-variant font-light leading-relaxed">
                  تصفح نصائح تنظيم الوقت، طرق المراجعة، وتبادل الخبُرات الدراسية بين الطلاب.
                </p>
              </div>
            </button>

            {/* Option 2: Subject & Lesson Questions */}
            <button
              onClick={() => {
                updateUrlMode("question_wizard");
                setWizardStep(1);
              }}
              className="group text-right p-6 sm:p-8 rounded-3xl bg-surface-container-low border border-outline-variant/30 hover:border-primary hover:bg-surface-container transition-all duration-300 flex flex-col justify-between h-[250px] cursor-pointer shadow-xl"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform mb-4">
                <HelpCircle className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-headline-md font-headline-md text-on-surface group-hover:text-primary transition-colors mb-2">
                  سؤال في درس أو مادة معينة
                </h3>
                <p className="text-body-md text-on-surface-variant font-light leading-relaxed">
                  اختر المجال والمادة الدراسية لتصفح وطرح الأسئلة الأكاديمية والتطبيقات الشارحة.
                </p>
              </div>
            </button>

            {/* Option 3: Dedicated Teachers Evaluation Directory */}
            <button
              onClick={() => updateUrlMode("teachers")}
              className="group text-right p-6 sm:p-8 rounded-3xl bg-surface-container-low border border-outline-variant/30 hover:border-emerald-400 hover:bg-surface-container transition-all duration-300 flex flex-col justify-between h-[250px] cursor-pointer shadow-xl"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform mb-4">
                <Award className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-headline-md font-headline-md text-on-surface group-hover:text-emerald-400 transition-colors mb-2">
                  دليل وتقييم المدرسين
                </h3>
                <p className="text-body-md text-on-surface-variant font-light leading-relaxed">
                  تصفح تقييمات المدرسين، نقاط القوة، ودليل أفضل المرشحين لكل مادة.
                </p>
              </div>
            </button>
          </div>

          {/* Recommended Study Groups Section */}
          {communityGroups.length > 0 && (
            <div className="flex flex-col gap-6 border-t border-outline-variant/10 pt-8 w-full max-w-5xl text-right mt-4">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold w-fit mb-2">
                    <Send className="w-3.5 h-3.5" />
                    <span>تجمعات ومجتمعات الطلاب 📡</span>
                  </div>
                  <h3 className="text-headline-md font-bold text-on-surface">جروبات ومجتمعات موصى بها (تليجرام / واتساب)</h3>
                  <p className="text-body-md text-on-surface-variant font-light mt-0.5">
                    تجمعات موثوقة ونشطة نوصي الطلاب بالانضمام إليها لتبادل الملخصات والحلول والمراجعات.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {communityGroups.map((group) => (
                  <div
                    key={group.id}
                    className="bg-surface-container-low border border-outline-variant/30 hover:border-primary/50 p-5 rounded-2xl flex flex-col justify-between gap-4 transition-all shadow-lg text-right"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${
                        group.platform === "telegram"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      }`}>
                        {group.platform === "telegram" ? <Send className="w-5 h-5 text-blue-400" /> : <MessageSquare className="w-5 h-5 text-emerald-400" />}
                      </div>

                      <div>
                        <h4 className="font-bold text-body-lg text-on-surface line-clamp-1">{group.title}</h4>
                        <span className="text-xs text-on-surface-variant font-medium">
                          منصة: {group.platform === "telegram" ? "تليجرام 📡" : "واتساب 💬"} {group.membersCount ? `• ${group.membersCount}` : ""}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-on-surface-variant font-light line-clamp-2 leading-relaxed bg-surface-container-high/60 p-3 rounded-xl">
                      {group.description}
                    </p>

                    <a
                      href={group.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-primary/10 hover:bg-primary text-primary hover:text-on-primary border border-primary/20 p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer mt-auto"
                    >
                      <span>الانضمام للمجموعة المباشرة</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* OPTION 3: DEDICATED TEACHERS DIRECTORY */}
      {mode === "teachers" && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-stack-lg"
        >
          <Teachers />
        </motion.div>
      )}

      {/* OPTION 1: GENERAL ADVICE & DISCUSSIONS */}
      {mode === "advice" && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-stack-lg"
        >
          <div className="flex justify-between items-center flex-wrap gap-4 border-b border-outline-variant/10 pb-4">
            <div>
              <h2 className="text-headline-lg font-headline-lg text-on-surface flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-amber-400" />
                <span>قسم النصائح العامة والمراجعة</span>
              </h2>
              <p className="text-body-md text-on-surface-variant font-light mt-1">
                تجارب الطلاب السابقة، جداول التلخيص، ونصائح التميز الصامت.
              </p>
            </div>

            <button
              onClick={() => {
                setNewCategory("advice");
                setIsModalOpen(true);
              }}
              className="bg-primary text-on-primary hover:bg-primary/90 px-4 py-2.5 rounded-xl text-label-sm font-medium flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة نصيحة أو تجربة</span>
            </button>
          </div>

          {/* Advice List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
            {discussions.filter((d) => d.category === "advice").map((disc) => {
              const canDelete = 
                user?.email === "ammaramrcan@gmail.com" || 
                (user?.email && disc.authorEmail && user.email.toLowerCase() === disc.authorEmail.toLowerCase()) || 
                (user?.uid && disc.authorUid && user.uid === disc.authorUid);

              return (
                <div key={disc.id} className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 flex flex-col justify-between gap-4 hover:border-amber-400/50 transition-all shadow-lg relative">
                  <div>
                    <div className="flex justify-between items-center gap-2 mb-2">
                      <span className="text-label-sm font-medium text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                        نصيحة ومراجعة
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-on-surface-variant">{disc.time}</span>
                        {canDelete && (
                          <button
                            onClick={() => handleDeleteDiscussion(disc.id)}
                            title="حذف هذا المنشور"
                            className="p-1.5 text-on-surface-variant hover:text-error bg-surface-container-high hover:bg-error/10 border border-outline-variant/20 rounded-xl transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <h3 className="text-headline-md font-bold text-on-surface mb-2">{disc.title}</h3>
                    <p className="text-body-md text-on-surface-variant font-light leading-relaxed">
                      {disc.excerpt}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-outline-variant/10 text-label-sm text-on-surface-variant">
                    <span>الكاتب: {disc.author}</span>
                    <span>{disc.replies} مشاركة</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* OPTION 2: QUESTION WIZARD (BY SUBJECT & LESSON) */}
      {mode === "question_wizard" && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-stack-lg"
        >
          {/* Wizard Stepper Banner */}
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 flex flex-col gap-3">
            <h2 className="text-headline-md font-bold text-on-surface flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              <span>الأسئلة الأكاديمية حسب المجال والمادة</span>
            </h2>

            {/* Stepper Progress */}
            <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-1 text-label-sm">
              <span className={`px-3 py-1 rounded-full border ${wizardStep >= 1 ? "bg-primary text-on-primary border-primary" : "bg-surface-container text-on-surface-variant border-outline-variant/30"}`}>
                1. اختر المجال
              </span>
              <span>←</span>
              <span className={`px-3 py-1 rounded-full border ${wizardStep >= 2 ? "bg-primary text-on-primary border-primary" : "bg-surface-container text-on-surface-variant border-outline-variant/30"}`}>
                2. اختر المادة {selectedCategory ? `(${mainCategories.find((c) => c.id === selectedCategory)?.title})` : ""}
              </span>
              <span>←</span>
              <span className={`px-3 py-1 rounded-full border ${wizardStep >= 3 ? "bg-primary text-on-primary border-primary" : "bg-surface-container text-on-surface-variant border-outline-variant/30"}`}>
                3. تصفح الأسئلة {selectedSubject ? `(${getSubjectTitle(selectedSubject)})` : ""}
              </span>
            </div>
          </div>

          {/* STEP 1: CATEGORY */}
          {wizardStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-stack-md">
              {availableCategories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setWizardStep(2);
                    }}
                    className="p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 hover:border-primary hover:bg-surface-container transition-all flex flex-col items-center text-center gap-4 cursor-pointer shadow-lg"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                      <Icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-headline-md font-bold text-on-surface">{cat.title}</h3>
                  </button>
                );
              })}
            </div>
          )}

          {/* STEP 2: SUBJECT */}
          {wizardStep === 2 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-stack-md">
              {availableSubjects.filter((s) => s.categoryId === selectedCategory).map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => {
                    setSelectedSubject(sub.id);
                    setWizardStep(3);
                  }}
                  className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 hover:border-primary hover:bg-surface-container transition-all text-center font-bold text-headline-md text-on-surface cursor-pointer shadow-lg"
                >
                  {sub.title}
                </button>
              ))}
            </div>
          )}

          {/* STEP 3: QUESTIONS LIST & ADD QUESTION */}
          {wizardStep === 3 && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <h3 className="text-headline-md font-bold text-on-surface">
                  أسئلة مادة ({getSubjectTitle(selectedSubject || "")})
                </h3>
                <button
                  onClick={() => {
                    setNewCategory("question");
                    if (selectedSubject) setNewSubject(selectedSubject);
                    setIsModalOpen(true);
                  }}
                  className="bg-primary text-on-primary hover:bg-primary/90 px-4 py-2 rounded-xl text-label-sm font-medium flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>اطرح سؤالاً في {getSubjectTitle(selectedSubject || "")}</span>
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {discussions.filter((d) => d.category === "question" && (!d.subjectId || d.subjectId === selectedSubject)).map((disc) => {
                  const canDelete = 
                    user?.email === "ammaramrcan@gmail.com" || 
                    (user?.email && disc.authorEmail && user.email.toLowerCase() === disc.authorEmail.toLowerCase()) || 
                    (user?.uid && disc.authorUid && user.uid === disc.authorUid);

                  return (
                    <div key={disc.id} className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 flex flex-col gap-3 hover:border-primary/50 transition-all shadow-lg relative">
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-label-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                          سؤال أكاديمي • {getSubjectTitle(disc.subjectId || "عام")}
                        </span>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-on-surface-variant">{disc.time}</span>
                          {canDelete && (
                            <button
                              onClick={() => handleDeleteDiscussion(disc.id)}
                              title="حذف هذا السؤال"
                              className="p-1.5 text-on-surface-variant hover:text-error bg-surface-container-high hover:bg-error/10 border border-outline-variant/20 rounded-xl transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <h4 className="text-headline-md font-bold text-on-surface">{disc.title}</h4>
                      <p className="text-body-md text-on-surface-variant font-light leading-relaxed">{disc.excerpt}</p>
                      
                      <div className="flex justify-between items-center pt-3 border-t border-outline-variant/10 text-label-sm text-on-surface-variant">
                        <span>السائل: {disc.author}</span>
                        <span>{disc.replies} إجابة</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Add Discussion / Question Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-lg bg-surface-container rounded-3xl border border-outline-variant/30 p-6 sm:p-8 shadow-2xl text-right"
          >
            <h3 className="text-headline-md font-bold text-on-surface mb-4">
              {newCategory === "advice" ? "إضافة نصيحة أو تجربة مراجعة" : "اطرح سؤالك الأكاديمي"}
            </h3>

            <form onSubmit={handleAddDiscussion} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-label-sm text-on-surface-variant">عنوان السؤال أو النصيحة</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: كيف أراجع الترانزستور قبل الامتحان؟"
                  className="bg-surface-container-high border border-outline-variant/40 rounded-xl p-3 text-body-md text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              {newCategory === "question" && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-label-sm text-on-surface-variant">المادة</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="bg-surface-container-high border border-outline-variant/40 rounded-xl p-3 text-body-md text-on-surface focus:outline-none focus:border-primary font-bold"
                  >
                    {availableSubjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-label-sm text-on-surface-variant">تفاصيل التوضيح</label>
                <textarea
                  rows={4}
                  required
                  value={newExcerpt}
                  onChange={(e) => setNewExcerpt(e.target.value)}
                  placeholder="اكتب تفاصيل سؤالك أو التجربة بالتفصيل..."
                  className="bg-surface-container-high border border-outline-variant/40 rounded-xl p-3 text-body-md text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-outline-variant/30 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold hover:bg-primary/90 transition-all cursor-pointer shadow-lg shadow-primary/20"
                >
                  نشر الآن
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Suggestion Submission Modal */}
      {isSuggestionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface-container-low border border-amber-500/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl flex flex-col gap-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <Lightbulb className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-headline-md font-bold text-on-surface">تقديم اقتراح لتحسين المنصة</h3>
                <p className="text-xs text-on-surface-variant font-light mt-0.5">رأيك واقتراحاتك تصل مباشرة لمطورة المنصة للتحسين المستمر.</p>
              </div>
            </div>

            <form onSubmit={handleAddSuggestionSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface">عنوان الاقتراح / التحسين:</label>
                <input
                  type="text"
                  required
                  value={suggestionTitle}
                  onChange={(e) => setSuggestionTitle(e.target.value)}
                  placeholder="مثال: إدراج قسم اختبارات تفاعلية، تحسين الخطوط..."
                  className="bg-surface-container-high border border-outline-variant/40 rounded-xl p-3 text-body-md text-on-surface focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface">تفاصيل الاقتراح وسياق الفكرة:</label>
                <textarea
                  required
                  rows={4}
                  value={suggestionDetails}
                  onChange={(e) => setSuggestionDetails(e.target.value)}
                  placeholder="اكتب شرحاً متكاملاً لاقتراحك ولماذا يخدم زملائك الطلاب..."
                  className="bg-surface-container-high border border-outline-variant/40 rounded-xl p-3 text-body-md text-on-surface focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsSuggestionModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-outline-variant/30 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSuggestion}
                  className="px-6 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold hover:bg-amber-300 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  إرسال الاقتراح 💡
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
