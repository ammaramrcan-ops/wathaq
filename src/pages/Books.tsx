import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useSearchParams } from "react-router-dom";
import {
  BookOpen,
  Atom,
  Compass,
  FileText,
  LayoutList,
  Share2,
  Layers,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ExternalLink,
  Trash2,
  Plus,
  CheckCircle2,
  LucideIcon
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AddContentModal } from "@/components/AddContentModal";
import Flashcards from "@/pages/Flashcards";
import {
  subscribeDeletedItems,
  subscribeCustomContent,
  markItemAsDeleted,
  CustomContentItem
} from "@/lib/contentService";
import {
  subscribeStudentProfile,
  filterCategoriesForProfile,
  filterSubjectsForProfile,
  StudentAcademicProfile
} from "@/lib/subjectsData";
import { subscribeLessons, subscribeUnits, SubjectUnitsMap, SubjectUnit } from "@/lib/lessonsData";
import { subscribeLessonResources, LessonResourcesMap } from "@/lib/lessonResourcesService";
import { subscribeSubjectNotebookLmMap, SubjectNotebookLmMap } from "@/lib/subjectNotebookLmService";

interface MainCategory {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  color: string;
}

interface SubjectItem {
  id: string;
  title: string;
  categoryId: string;
  description: string;
  icon: React.ReactNode;
}

interface FilterType {
  id: string;
  label: string;
  subtitle: string;
  icon: LucideIcon;
}

interface BookResource {
  id: string;
  title: string;
  subtitle: string;
  subjectId: string;
  category: "school" | "notes" | "summaries" | "mindmaps" | "flashcards" | string;
  linkUrl: string;
  image: string;
  author?: string;
}

const mainCategories: MainCategory[] = [
  {
    id: "scientific",
    title: "مواد علمية",
    subtitle: "كتب وملازم الفيزياء، الكيمياء، الأحياء، والرياضيات",
    icon: Atom,
    color: "from-blue-500/10 to-indigo-500/10 border-blue-500/30 text-blue-400"
  },
  {
    id: "arabic",
    title: "مواد عربية",
    subtitle: "ملازم النحو، البلاغة، والأدب والنصوص",
    icon: BookOpen,
    color: "from-emerald-500/10 to-teal-500/10 border-emerald-500/30 text-emerald-400"
  },
  {
    id: "islamic",
    title: "مواد شرعية",
    subtitle: "كتب التوحيد، الفقه، التفسير، والحديث الشريف",
    icon: Compass,
    color: "from-amber-500/10 to-orange-500/10 border-amber-500/30 text-amber-400"
  }
];

const subjects: SubjectItem[] = [
  { id: "physics", title: "الفيزياء", categoryId: "scientific", description: "كتب وملازم الفيزياء والتمارين", icon: Atom },
  { id: "chemistry", title: "الكيمياء", categoryId: "scientific", description: "ملخصات وتجارب الكيمياء", icon: Atom },
  { id: "biology", title: "الأحياء", categoryId: "scientific", description: "رسومات وملازم أحياء الثانوية", icon: Atom },
  { id: "math", title: "الرياضيات", categoryId: "scientific", description: "تمارين وتفاضل وتكامل وملازم الشرح", icon: Atom },
  { id: "english", title: "اللغة الإنجليزية", categoryId: "scientific", description: "قواعد الجرامر والقراءة وشرح الكلمات وترجمة المقاطع", icon: BookOpen },
  { id: "grammar", title: "النحو والصرف", categoryId: "arabic", description: "ملازم إعراب وشرح ألفية ابن مالك", icon: BookOpen },
  { id: "literature", title: "الأدب والنصوص", categoryId: "arabic", description: "ملخصات العصور الأدبية والنصوص", icon: BookOpen },
  { id: "rhetoric", title: "البلاغة والتعبير", categoryId: "arabic", description: "خرائط البديع والبيان والمعاني", icon: BookOpen },
  { id: "tawheed", title: "التوحيد والعقيدة", categoryId: "islamic", description: "كتب وأصول التوحيد المقررة", icon: Compass },
  { id: "fiqh", title: "الفقه وأصوله", categoryId: "islamic", description: "ملازم وأحكام الفقه المذهبي", icon: Compass },
  { id: "tafseer", title: "التفسير وعلوم القرآن", categoryId: "islamic", description: "كتب وشروح التفسير لجميع السور المقررة", icon: Compass },
  { id: "hadith", title: "الحديث الشريف", categoryId: "islamic", description: "شرح أحاديث النبي ﷺ المقررة", icon: Compass }
];

const bookFilters: FilterType[] = [
  { id: "school", label: "كتب مدرسية", subtitle: "الكتب الرسمية المقررة وزارياً وأزهرياً", icon: BookOpen },
  { id: "notes", label: "ملازم دراسية", subtitle: "ملازم وشروحات الأساتذة وأسئلة التدريب", icon: FileText },
  { id: "summaries", label: "ملخصات مراجعة", subtitle: "كبسولات وملخصات سريعة قبل الامتحانات", icon: LayoutList },
  { id: "mindmaps", label: "خرائط ذهنية", subtitle: "مخططات بصرية لمادة الشرح لتسهيل الفهم", icon: Share2 },
  { id: "notebooklm", label: "معلّم AI (NotebookLM 🤖)", subtitle: "المساعد الذكي لإنشاء خرائط وملاحظات صوتية لمادة الشرح", icon: Sparkles },
  { id: "flashcards", label: "فلاش كارد", subtitle: "بطاقات التكرار المتباعد للمراجعة والتدريب", icon: Layers }
];

const defaultBooks: BookResource[] = [
  {
    id: "b1",
    title: "مذكرة الفيزياء الشاملة - الكهربية",
    subtitle: "شرح قانون أوم وقوانين كيرشوف وتطبيقات الامتحان",
    subjectId: "physics",
    category: "notes",
    author: "أ. محمد عبدالسلام",
    linkUrl: "https://drive.google.com",
    image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "b2",
    title: "الكتاب المدرسي الوزاري للرياضيات",
    subtitle: "الجبر والتفاضل والتكامل",
    subjectId: "math",
    category: "school",
    author: "وزارة التربية والتعليم",
    linkUrl: "https://drive.google.com",
    image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "b3",
    title: "خريطة الكيمياء العضوية الذهنية",
    subtitle: "مخطط تفاعلات الألكانات والألكينات في ورقة واحدة",
    subjectId: "chemistry",
    category: "mindmaps",
    author: "أ. سارة حسن",
    linkUrl: "https://drive.google.com",
    image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "b4",
    title: "ملخص النحو والصرف للتفوق",
    subtitle: "قواعد الإعراب الشاملة وأمثلة الامتحانات",
    subjectId: "grammar",
    category: "summaries",
    author: "أ. محمود الشنقيطي",
    linkUrl: "https://drive.google.com",
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop"
  }
];

export default function Books() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customBooks, setCustomBooks] = useState<CustomContentItem[]>([]);
  const [deletedBookIds, setDeletedBookIds] = useState<string[]>([]);

  // Wizard state
  const [selectedCategory, setSelectedCategory] = useState<MainCategory | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<SubjectItem | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterType | null>(null);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Interactive Curriculum & Lesson Scope Wizard
  const [unitsMap, setUnitsMap] = useState<SubjectUnitsMap>({});
  const [interactiveStep, setInteractiveStep] = useState<"section" | "scope" | "unit" | "lesson">("section");
  const [selectedUnit, setSelectedUnit] = useState<SubjectUnit | null>(null);
  const [selectedLessonScope, setSelectedLessonScope] = useState<string>("all");

  const [academicProfile, setAcademicProfile] = useState<StudentAcademicProfile | null>(null);
  const [lessonsMap, setLessonsMap] = useState<Record<string, string[]>>({});

  const [lessonResourcesMap, setLessonResourcesMap] = useState<LessonResourcesMap>({});

  useEffect(() => {
    const unsubProf = subscribeStudentProfile(user?.uid, (prof) => {
      setAcademicProfile(prof);
    });

    const unsubDeleted = subscribeDeletedItems("book", user?.uid, (ids) => {
      setDeletedBookIds(ids);
    });

    const unsubCustom = subscribeCustomContent(user?.uid, (items) => {
      const approved = items.filter(
        (item) => item.status !== "pending" && (item.contentType === "book" || item.contentType === "mindmaps")
      );
      setCustomBooks(approved);
    });

    const unsubLessons = subscribeLessons((map) => {
      setLessonsMap(map);
    });

    const unsubUnits = subscribeUnits((uMap) => {
      setUnitsMap(uMap);
    });

    const unsubResources = subscribeLessonResources((resMap) => {
      setLessonResourcesMap(resMap);
    });

    return () => {
      unsubProf();
      unsubDeleted();
      unsubCustom();
      unsubLessons();
      unsubUnits();
      unsubResources();
    };
  }, [user?.uid]);

  const availableCategories = filterCategoriesForProfile(academicProfile, mainCategories);
  const availableSubjects = filterSubjectsForProfile(academicProfile, subjects);

  // Convert custom items into BookResource array
  const userCustomBooks: BookResource[] = customBooks.map((item) => ({
    id: item.id,
    title: item.title,
    subtitle: item.description || "محتوى مخصص معتمد",
    subjectId: item.subject,
    category: item.contentType === "mindmaps" ? "mindmaps" : "notes",
    linkUrl: item.linkUrl,
    author: item.uploaderName || "طالب مسجل",
    image: item.image || "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop"
  }));

  const allBooks = [...userCustomBooks, ...defaultBooks].filter(
    (b) => !deletedBookIds.includes(b.id)
  );

  // Sync URL parameters with Wizard State
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const subjectParam = searchParams.get("subject");
    const filterParam = searchParams.get("filter");
    const lessonParam = searchParams.get("lesson");

    let cat: MainCategory | null = null;
    let sub: SubjectItem | null = null;
    let filterItem: FilterType | null = null;

    if (subjectParam) {
      sub = subjects.find((s) => s.id === subjectParam || s.title === subjectParam) || null;
      if (sub) {
        cat = mainCategories.find((c) => c.id === sub!.categoryId) || null;
      }
    } else if (categoryParam) {
      cat = mainCategories.find((c) => c.id === categoryParam) || null;
    }

    if (filterParam) {
      filterItem = bookFilters.find((f) => f.id === filterParam) || null;
    }

    if (lessonParam) {
      setSelectedLessonScope(lessonParam);
    }

    setSelectedCategory((prev) => (prev?.id === cat?.id ? prev : cat));
    setSelectedSubject((prev) => (prev?.id === sub?.id ? prev : sub));
    setSelectedFilter((prev) => (prev?.id === filterItem?.id ? prev : filterItem));

    const targetStep = (sub && (filterItem || lessonParam)) ? 4 : sub ? 3 : cat ? 2 : 1;
    setStep((prev) => (prev === targetStep ? prev : targetStep));
  }, [searchParams]);

  const [subjectNotebookLmMap, setSubjectNotebookLmMap] = useState<SubjectNotebookLmMap>({});

  useEffect(() => {
    const unsubNb = subscribeSubjectNotebookLmMap((map) => {
      setSubjectNotebookLmMap(map);
    });
    return () => unsubNb();
  }, []);

  const handleSelectCategory = (cat: MainCategory) => {
    setSearchParams({ category: cat.id });
  };

  const handleSelectSubject = (sub: SubjectItem) => {
    setSelectedSubject(sub);
    setInteractiveStep("section");
    setSearchParams({ category: sub.categoryId, subject: sub.id });
  };

  const handleSelectFilterType = (filterItem: FilterType) => {
    if (filterItem.id === "notebooklm") {
      const customUrl = selectedSubject ? subjectNotebookLmMap[selectedSubject.id] : null;
      window.open(customUrl || "https://notebooklm.google.com/", "_blank", "noopener,noreferrer");
      return;
    }
    setSelectedFilter(filterItem);
    setInteractiveStep("scope");
    if (selectedSubject) {
      setSearchParams({
        category: selectedSubject.categoryId,
        subject: selectedSubject.id,
        filter: filterItem.id
      });
    }
  };

  const handleResetFilters = () => {
    setSelectedCategory(null);
    setSelectedSubject(null);
    setSelectedFilter(null);
    setSelectedLessonScope("all");
    setInteractiveStep("section");
    setSearchParams({});
  };

  const handleDeleteBook = async (bookId: string) => {
    if (!user?.uid) return;
    try {
      await markItemAsDeleted(bookId, "book", user.uid);
      setDeletedBookIds((prev) => [...prev, bookId]);
    } catch (e) {
      console.error("Error deleting book item:", e);
    }
  };

  const filteredBooks = allBooks.filter((book) => {
    const matchesSubject = selectedSubject ? book.subjectId === selectedSubject.id : true;
    const matchesCategory = selectedFilter ? book.category === selectedFilter.id : true;
    const matchesLesson = selectedLessonScope && selectedLessonScope !== "all"
      ? book.title.includes(selectedLessonScope) || book.subtitle.includes(selectedLessonScope)
      : true;
    return matchesSubject && matchesCategory && matchesLesson;
  });

  return (
    <div className="flex flex-col gap-8 min-h-[80vh] text-right">
      {/* Top Header */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-outline-variant/10 pb-6">
        <div>
          <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold w-fit mb-2">
            <BookOpen className="w-4 h-4" />
            <span>مكتبة وثاق الرقمية والملازم 📚</span>
          </div>
          <h1 className="text-display-ar font-bold text-on-surface">مكتبة الكتب، الملازم، والخرائط الذهنية</h1>
          <p className="text-body-md text-on-surface-variant font-light mt-1">
            استعرض المراجع الرسمية، ملازم المعلمين المعتمدين، والخرائط الذهنية حسب شعبتك ومادتك الدراسية.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary text-on-primary hover:bg-primary/90 px-5 py-3 rounded-2xl font-bold text-label-sm flex items-center gap-2 transition-all shadow-lg shadow-primary/20 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>إضافة كتاب / ملزمة جديدة ➕</span>
        </button>
      </div>

      {/* Dynamic Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant flex-wrap bg-surface-container-low p-3 rounded-2xl border border-outline-variant/20">
        <button onClick={handleResetFilters} className="hover:text-primary transition-colors cursor-pointer font-bold">
          المكتبة الرئيسية
        </button>
        {selectedCategory && (
          <>
            <ChevronLeft className="w-4 h-4 text-outline-variant shrink-0" />
            <button
              onClick={() => setSearchParams({ category: selectedCategory.id })}
              className="hover:text-primary transition-colors cursor-pointer"
            >
              {selectedCategory.title}
            </button>
          </>
        )}
        {selectedSubject && (
          <>
            <ChevronLeft className="w-4 h-4 text-outline-variant shrink-0" />
            <button
              onClick={() => setSearchParams({ category: selectedSubject.categoryId, subject: selectedSubject.id })}
              className="hover:text-primary transition-colors cursor-pointer"
            >
              {selectedSubject.title}
            </button>
          </>
        )}
        {selectedFilter && (
          <>
            <ChevronLeft className="w-4 h-4 text-outline-variant shrink-0" />
            <span className="text-primary font-bold">{selectedFilter.label}</span>
          </>
        )}
        {selectedLessonScope && selectedLessonScope !== "all" && (
          <>
            <ChevronLeft className="w-4 h-4 text-outline-variant shrink-0" />
            <span className="text-emerald-400 font-bold">الدرس: {selectedLessonScope}</span>
          </>
        )}
      </div>

      {/* STEP 1: Main Category Selection */}
      {step === 1 && (
        <div className="flex flex-col gap-6 my-auto">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-headline-md font-bold text-on-surface mb-2">اختر القسم والمسار الأكاديمي</h2>
            <p className="text-body-md text-on-surface-variant font-light">تصفح الملازم والكتب المخصصة لكل تخصص دراسي.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {availableCategories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                  onClick={() => handleSelectCategory(cat)}
                  className={`group bg-surface-container-low border rounded-3xl p-6 sm:p-8 flex flex-col justify-between gap-6 cursor-pointer hover:scale-[1.02] transition-all duration-300 shadow-xl bg-gradient-to-br ${cat.color}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="w-14 h-14 rounded-2xl bg-surface-container border border-outline-variant/30 flex items-center justify-center text-primary group-hover:rotate-6 transition-transform">
                      <Icon className="w-7 h-7" />
                    </div>
                    <Sparkles className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <div>
                    <h3 className="text-headline-md font-bold text-on-surface group-hover:text-primary transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-body-md text-on-surface-variant mt-2 font-light">
                      {cat.subtitle}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-label-sm font-medium text-primary pt-4 border-t border-outline-variant/10">
                    <span>استعراض المواد والكتب</span>
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2: Subject Selection */}
      {step === 2 && selectedCategory && (
        <div className="flex flex-col gap-6">
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-3xl p-6 flex flex-col gap-2">
            <h2 className="text-headline-md font-bold text-on-surface">مواد {selectedCategory.title}</h2>
            <p className="text-body-md text-on-surface-variant font-light">اختر المادة لتصفح كافة الكتب والملازم والخرائط الذهنية المتاحة بها.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {availableSubjects.filter((sub) => sub.categoryId === selectedCategory.id).map((sub, idx) => {
              const Icon = sub.icon;
              return (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25, delay: idx * 0.05 }}
                  onClick={() => handleSelectSubject(sub)}
                  className="group bg-surface-container border border-outline-variant/30 hover:border-primary rounded-2xl p-5 flex flex-col justify-between gap-4 cursor-pointer hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-body-lg text-on-surface group-hover:text-primary transition-colors">
                        {sub.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-on-surface-variant font-light line-clamp-2">
                    {sub.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-primary pt-2 border-t border-outline-variant/10">
                    <span>دخول المكتبة</span>
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 3: Reference Type & Interactive Curriculum/Lesson Scope Wizard */}
      {step === 3 && selectedSubject && (
        <div className="flex flex-col gap-6">
          {/* Sub-step 1: Select Section Type */}
          {interactiveStep === "section" && (
            <div className="flex flex-col gap-6">
              <div className="bg-surface-container-low border border-outline-variant/30 rounded-3xl p-6 flex flex-col gap-2">
                <h2 className="text-headline-md font-bold text-on-surface">قسم المراجع والملازم لمادة ({selectedSubject.title})</h2>
                <p className="text-body-md text-on-surface-variant font-light">اختر نوع المصدر الأكاديمي المطلوب لتصفح الملفات.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {bookFilters.map((filter, idx) => {
                  const Icon = filter.icon;
                  return (
                    <motion.div
                      key={filter.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: idx * 0.05 }}
                      onClick={() => handleSelectFilterType(filter)}
                      className={`group border rounded-2xl p-6 flex flex-col justify-between gap-4 cursor-pointer hover:shadow-xl transition-all ${
                        filter.id === "notebooklm"
                          ? "bg-gradient-to-br from-emerald-500/10 via-primary/10 to-blue-500/10 border-primary/40 hover:border-primary shadow-lg"
                          : "bg-surface-container border-outline-variant/30 hover:border-primary"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border group-hover:scale-110 transition-transform ${
                          filter.id === "notebooklm" ? "bg-primary text-on-primary border-primary shadow-md" : "bg-primary/10 text-primary border-primary/20"
                        }`}>
                          <Icon className="w-6 h-6" />
                        </div>

                        {filter.id === "notebooklm" && (
                          <span className="bg-primary text-on-primary text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                            Google AI 🤖
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="font-bold text-body-lg text-on-surface group-hover:text-primary transition-colors">
                          {filter.label}
                        </h3>
                        <p className="text-xs text-on-surface-variant mt-1 font-light">
                          {filter.subtitle}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs text-primary pt-3 border-t border-outline-variant/10 font-bold">
                        <span>{filter.id === "notebooklm" ? "افتح معلّم AI 🚀" : "تصفح الملفات"}</span>
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sub-step 2: Question: Full Curriculum or Specific Lesson */}
          {interactiveStep === "scope" && selectedFilter && (
            <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
              <div className="text-center">
                <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                  السؤال التفاعلي 🎯
                </span>
                <h2 className="text-headline-lg font-bold text-on-surface mt-3 mb-1">
                  نطاق مادة ({selectedSubject.title}) - قسم ({selectedFilter.label})
                </h2>
                <p className="text-body-md text-on-surface-variant font-light">
                  هل تريد تصفح كامل ملفات المنهج الشامل أم الاستعراض حسب درس وباب معين؟
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-2">
                <button
                  onClick={() => {
                    setSelectedLessonScope("all");
                    setStep(4);
                  }}
                  className="group p-8 rounded-3xl bg-surface-container-low border border-outline-variant/30 hover:border-primary hover:bg-surface-container transition-all cursor-pointer shadow-xl text-right flex flex-col justify-between h-[200px]"
                >
                  <div className="flex justify-between items-start">
                    <span className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl font-bold border border-primary/20">
                      🌐
                    </span>
                    <CheckCircle2 className="w-5 h-5 text-primary opacity-40 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <div>
                    <h3 className="text-headline-md font-bold text-on-surface group-hover:text-primary transition-colors">
                      كامل المنهج الشامل
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-1 font-light">
                      عرض جميع الملازم والكتب الخاصة بهذه المادة دفعة واحدة دون تقييد بدرس
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setInteractiveStep("unit")}
                  className="group p-8 rounded-3xl bg-surface-container-low border border-outline-variant/30 hover:border-primary hover:bg-surface-container transition-all cursor-pointer shadow-xl text-right flex flex-col justify-between h-[200px]"
                >
                  <div className="flex justify-between items-start">
                    <span className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl font-bold border border-emerald-500/20">
                      🎯
                    </span>
                    <ChevronLeft className="w-5 h-5 text-emerald-400 group-hover:-translate-x-1 transition-transform" />
                  </div>

                  <div>
                    <h3 className="text-headline-md font-bold text-on-surface group-hover:text-emerald-400 transition-colors">
                      تحديد درس وباب معين
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-1 font-light">
                      استعراض الأبواب والفصول الأكاديمية لاختيار الدرس المطلوب بتركيز
                    </p>
                  </div>
                </button>
              </div>

              <button
                onClick={() => setInteractiveStep("section")}
                className="text-xs text-on-surface-variant hover:text-primary mx-auto flex items-center gap-1 font-bold mt-2"
              >
                <span>العودة لاختيار قسم آخر</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Sub-step 3: Select Unit / Chapter */}
          {interactiveStep === "unit" && selectedSubject && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-outline-variant/10 pb-4">
                <div>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                    الخطوة 3.1: تحديد الباب
                  </span>
                  <h2 className="text-headline-lg font-bold text-on-surface mt-2">
                    اختر الباب الأكاديمي لمادة ({selectedSubject.title})
                  </h2>
                </div>

                <button
                  onClick={() => setInteractiveStep("scope")}
                  className="text-label-sm text-primary hover:underline flex items-center gap-1 font-bold cursor-pointer"
                >
                  <span>رجوع للخيارات</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(unitsMap[selectedSubject.id] || []).map((unit) => (
                  <button
                    key={unit.id}
                    onClick={() => {
                      setSelectedUnit(unit);
                      setInteractiveStep("lesson");
                    }}
                    className="group text-right p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 hover:border-primary hover:bg-surface-container transition-all cursor-pointer shadow-lg flex justify-between items-center"
                  >
                    <div>
                      <h3 className="text-headline-md font-bold text-on-surface group-hover:text-primary transition-colors mb-1">
                        {unit.unitTitle}
                      </h3>
                      <p className="text-label-sm text-on-surface-variant font-light">
                        يحتوي على {(unit.lessons || []).length} دروس مقررة
                      </p>
                    </div>
                    <ChevronLeft className="w-5 h-5 text-primary group-hover:-translate-x-1 transition-transform" />
                  </button>
                ))}
              </div>

              {(!unitsMap[selectedSubject.id] || unitsMap[selectedSubject.id].length === 0) && (
                <div className="p-8 text-center bg-surface-container rounded-2xl border border-outline-variant/20 text-on-surface-variant text-sm font-light flex flex-col items-center gap-3">
                  <p>لم يتم إضافة أبواب أو دروس لـ ({selectedSubject.title}) من لوحة التحكم بعد.</p>
                  <button
                    onClick={() => {
                      setSelectedLessonScope("all");
                      setStep(4);
                    }}
                    className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold text-xs"
                  >
                    عرض كامل المنهج المتاح الآن 🌐
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Sub-step 4: Select Specific Lesson */}
          {interactiveStep === "lesson" && selectedUnit && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-outline-variant/10 pb-4">
                <div>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                    الخطوة 3.2: تحديد الدرس
                  </span>
                  <h2 className="text-headline-lg font-bold text-on-surface mt-2">
                    اختر الدرس المحدد في ({selectedUnit.unitTitle})
                  </h2>
                </div>

                <button
                  onClick={() => setInteractiveStep("unit")}
                  className="text-label-sm text-primary hover:underline flex items-center gap-1 font-bold cursor-pointer"
                >
                  <span>العودة لاختيار باب آخر</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedUnit.lessons.map((lesson, idx) => (
                  <button
                    key={lesson}
                    onClick={() => {
                      setSelectedLessonScope(lesson);
                      setStep(4);
                      if (selectedSubject && selectedFilter) {
                        setSearchParams({
                          category: selectedSubject.categoryId,
                          subject: selectedSubject.id,
                          filter: selectedFilter.id,
                          lesson: lesson
                        });
                      }
                    }}
                    className="group text-right p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 hover:border-primary hover:bg-surface-container transition-all cursor-pointer shadow-lg flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 border border-primary/20">
                        {idx + 1}
                      </span>
                      <h3 className="text-headline-md font-bold text-on-surface group-hover:text-primary transition-colors">
                        {lesson}
                      </h3>
                    </div>
                    <ChevronLeft className="w-5 h-5 text-primary group-hover:-translate-x-1 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 4 / FLASHCARDS: Displaying Files & Flashcards */}
      {selectedFilter?.id === "flashcards" ? (
        <div className="flex flex-col gap-6">
          <Flashcards />
        </div>
      ) : (
        step === 4 && (
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-outline-variant/10 pb-4">
              <div>
                <h3 className="text-headline-md font-bold text-on-surface">
                  {selectedFilter?.label || "جميع الملازم والكتب"} - مادة {selectedSubject?.title}
                </h3>
                <p className="text-xs text-on-surface-variant mt-1">
                  نطاق المحتوى: {selectedLessonScope === "all" ? "كامل المنهج الشامل 🌐" : `الدرس: ${selectedLessonScope} 🎯`}
                </p>
              </div>

              <button
                onClick={() => {
                  setStep(3);
                  setInteractiveStep("section");
                }}
                className="text-label-sm text-primary hover:underline flex items-center gap-1 font-bold cursor-pointer"
              >
                <span>تغيير القسم أو الدرس</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Lesson Specific Attachments Banners (PDF Summary, Mindmap Image, Flashcards CSV) */}
            {(() => {
              const lessonKey = selectedSubject && selectedLessonScope !== "all" ? `${selectedSubject.id}__${selectedLessonScope}` : null;
              const lessonRes = lessonKey ? lessonResourcesMap[lessonKey] : null;

              if (!lessonRes) return null;

              return (
                <div className="flex flex-col gap-4">
                  {lessonRes.pdfUrl && (selectedFilter?.id === "summaries" || !selectedFilter) && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl text-right">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xl shrink-0">
                          📄
                        </div>
                        <div>
                          <h4 className="text-headline-md font-bold text-on-surface">ملخص الـ PDF المباشر لدرس ({selectedLessonScope})</h4>
                          <p className="text-xs text-on-surface-variant font-light mt-0.5">تم اعتماده وربطه بدرس المنهج من لوحة التحكم</p>
                        </div>
                      </div>
                      <a
                        href={lessonRes.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-amber-500 text-black hover:bg-amber-400 px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer"
                      >
                        <span>فتح ملف الـ PDF</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}

                  {lessonRes.mindmapImageUrl && (selectedFilter?.id === "mindmaps" || !selectedFilter) && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl text-right">
                      <div className="flex items-center gap-4">
                        <img src={lessonRes.mindmapImageUrl} alt="خريطة ذهنية" className="w-20 h-20 rounded-2xl object-cover border border-emerald-500/30 shrink-0" />
                        <div>
                          <h4 className="text-headline-md font-bold text-on-surface">الخريطة الذهنية البصرية لدرس ({selectedLessonScope})</h4>
                          <p className="text-xs text-on-surface-variant font-light mt-0.5">مخطط بصري تفاعلي يجمع كافة نقاط وقوانين الدرس</p>
                        </div>
                      </div>
                      <a
                        href={lessonRes.mindmapImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-emerald-500 text-black hover:bg-emerald-400 px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer"
                      >
                        <span>عرض الصورة بالحجم الكامل</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}

                  {lessonRes.flashcardsCsvUrl && (selectedFilter?.id === "flashcards" || !selectedFilter) && (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl text-right">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xl shrink-0">
                          📊
                        </div>
                        <div>
                          <h4 className="text-headline-md font-bold text-on-surface">ملف الـ CSV للفلاش كارد لدرس ({selectedLessonScope})</h4>
                          <p className="text-xs text-on-surface-variant font-light mt-0.5">ملف مفاهيم وأسئلة الفلاش كارد الجاهز للتحميل والمراجعة</p>
                        </div>
                      </div>
                      <a
                        href={lessonRes.flashcardsCsvUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-500 text-white hover:bg-blue-400 px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer"
                      >
                        <span>تحميل ملف الـ CSV</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>
              );
            })()}

            {filteredBooks.length === 0 ? (
              <div className="bg-surface-container-low border border-outline-variant/30 rounded-3xl p-12 text-center flex flex-col items-center gap-4">
                <FileText className="w-12 h-12 text-on-surface-variant/40" />
                <div>
                  <h4 className="text-headline-md font-bold text-on-surface">لا توجد ملفات مرفوعة حالياً</h4>
                  <p className="text-body-md text-on-surface-variant font-light mt-1">
                    {selectedLessonScope !== "all"
                      ? `لم يتم رفع كتب أو ملازم مخصصة لدرس (${selectedLessonScope}) بعد.`
                      : "لم يتم رفع ملفات لهذا التخصص بعد. كن أول من يشارك ملزمة أو كتاباً!"}
                  </p>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg cursor-pointer"
                >
                  إضافة أول ملف لهذا الدرس الآن ➕
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBooks.map((book) => (
                  <motion.div
                    key={book.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="group bg-surface-container border border-outline-variant/30 hover:border-primary/50 rounded-3xl overflow-hidden shadow-lg flex flex-col justify-between transition-all"
                  >
                    <div className="relative h-44 overflow-hidden bg-surface-container-high">
                      <img
                        src={book.image}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
                        <span className="bg-primary/90 text-on-primary text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-md">
                          {book.author || "مصدر معتمد"}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 flex flex-col gap-2 flex-grow">
                      <h4 className="text-headline-md font-bold text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
                        {book.title}
                      </h4>
                      <p className="text-xs text-on-surface-variant font-light line-clamp-2 leading-relaxed">
                        {book.subtitle}
                      </p>
                    </div>

                    <div className="p-5 pt-0 flex items-center justify-between gap-3 border-t border-outline-variant/10 mt-auto">
                      <a
                        href={book.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-grow bg-surface-container-high hover:bg-primary hover:text-on-primary border border-outline-variant/30 p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <span>فتح الملف مباشرة</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      {userCustomBooks.some((cb) => cb.id === book.id) && (
                        <button
                          onClick={() => handleDeleteBook(book.id)}
                          className="p-2.5 text-error hover:bg-error/10 border border-error/20 rounded-xl transition-colors cursor-pointer"
                          title="حذف هذا الملف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )
      )}

      {/* Add Content Modal */}
      <AddContentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
