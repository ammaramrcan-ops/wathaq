import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useSearchParams } from "react-router-dom";
import { 
  BookOpen, Atom, Compass, FileText, LayoutList, Share2, Layers, 
  ArrowRight, Sparkles, ChevronLeft, ExternalLink, Trash2, Plus 
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

interface MainCategory {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  color: string;
}

interface SubjectItem {
  id: string;
  title: string;
  categoryId: string;
  description: string;
  icon: any;
}

interface FilterType {
  id: string;
  label: string;
  subtitle: string;
  icon: any;
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
  { id: "grammar", title: "النحو والصرف", categoryId: "arabic", description: "ملازم إعراب وشرح ألفية ابن مالك", icon: BookOpen },
  { id: "literature", title: "الأدب والنصوص", categoryId: "arabic", description: "ملخصات العصور الأدبية والنصوص", icon: BookOpen },
  { id: "rhetoric", title: "البلاغة والتعبير", categoryId: "arabic", description: "خرائط البديع والبيان والمعاني", icon: BookOpen },
  { id: "english", title: "اللغة الإنجليزية", categoryId: "arabic", description: "قواعد الجرامر والقراءة وشرح الكلمات وترجمة المقاطع", icon: BookOpen },
  { id: "tawheed", title: "التوحيد والعقيدة", categoryId: "islamic", description: "كتب وأصول التوحيد المقررة", icon: Compass },
  { id: "fiqh", title: "الفقه وأصوله", categoryId: "islamic", description: "ملازم وأحكام الفقه المذهبي", icon: Compass }
];

const bookFilters: FilterType[] = [
  { id: "school", label: "كتب مدرسية", subtitle: "الكتب الرسمية المقررة وزارياً وأزهرياً", icon: BookOpen },
  { id: "notes", label: "ملازم دراسية", subtitle: "ملازم وشروحات الأساتذة وأسئلة التدريب", icon: FileText },
  { id: "summaries", label: "ملخصات مراجعة", subtitle: "كبسولات وملخصات سريعة قبل الامتحانات", icon: LayoutList },
  { id: "mindmaps", label: "خرائط ذهنية", subtitle: "مخططات بصرية لتسهيل الحفظ والفهم", icon: Share2 },
  { id: "flashcards", label: "فلاش كارد", subtitle: "بطاقات التكرار المتباعد للمراجعة", icon: Layers }
];

const defaultBooks: BookResource[] = [
  {
    id: "b1",
    title: "ملزمة الفيزياء العميقة الشاملة",
    subtitle: "الفصل الدراسي الأول - الكهربية والفيزياء الحديثة",
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

  const [academicProfile, setAcademicProfile] = useState<StudentAcademicProfile | null>(null);

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

    return () => {
      unsubProf();
      unsubDeleted();
      unsubCustom();
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

    setSelectedCategory(cat);
    setSelectedSubject(sub);
    setSelectedFilter(filterItem);

    if (sub && filterItem) {
      setStep(4);
    } else if (sub) {
      setStep(3);
    } else if (cat) {
      setStep(2);
    } else {
      setStep(1);
    }
  }, [searchParams]);

  const handleSelectCategory = (cat: MainCategory) => {
    setSearchParams({ category: cat.id });
  };

  const handleSelectSubject = (sub: SubjectItem) => {
    setSearchParams({ category: sub.categoryId, subject: sub.id });
  };

  const handleSelectFilterType = (filterItem: FilterType) => {
    if (!selectedSubject) {
      setSearchParams({ filter: filterItem.id });
      return;
    }
    setSearchParams({
      category: selectedSubject.categoryId,
      subject: selectedSubject.id,
      filter: filterItem.id
    });
  };

  const handleGoBack = () => {
    if (step === 4) {
      setSearchParams({
        category: selectedCategory?.id || "",
        subject: selectedSubject?.id || ""
      });
    } else if (step === 3) {
      setSearchParams({ category: selectedCategory?.id || "" });
    } else if (step === 2) {
      setSearchParams({});
    }
  };

  const handleResetAll = () => {
    setSearchParams({});
  };

  const handleDeleteBook = async (id: string, e: any) => {
    e.preventDefault();
    e.stopPropagation();

    if (window.confirm("هل أنت تأكد من رغبتك في حذف هذا الكتاب/الملزمة نهائياً؟")) {
      await markItemAsDeleted(id, "book", user?.uid, true);
    }
  };

  // Filter books matching current selection
  const finalFilteredBooks = allBooks.filter((b) => {
    const matchesSubject =
      !selectedSubject ||
      b.subjectId === selectedSubject.id ||
      b.subjectId === selectedSubject.title ||
      (selectedSubject.id === "physics" && (b.subjectId === "الفيزياء" || b.subjectId === "physics")) ||
      (selectedSubject.id === "chemistry" && (b.subjectId === "الكيمياء" || b.subjectId === "chemistry")) ||
      (selectedSubject.id === "math" && (b.subjectId === "الرياضيات" || b.subjectId === "math")) ||
      (selectedSubject.id === "biology" && (b.subjectId === "الأحياء" || b.subjectId === "biology")) ||
      (selectedSubject.id === "grammar" && (b.subjectId === "النحو" || b.subjectId === "grammar"));

    const matchesFilter = !selectedFilter || b.category === selectedFilter.id || selectedFilter.id === "school";

    return matchesSubject && matchesFilter;
  });

  return (
    <div className="flex flex-col gap-stack-lg min-h-[75vh]">
      {/* Header & Step Wizard Indicator */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-outline-variant/10 pb-4">
        <div>
          <h1 className="text-headline-lg font-headline-lg text-on-surface flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-primary" />
            <span>مكتبة وثاق للكتب والملازم والخرائط الذهنية</span>
          </h1>
          <p className="text-body-md text-on-surface-variant font-light mt-1">
            استعرض الكتب الرسمية والملازم والخرائط الذهنية حسب شعبتك ومادتك الدراسية.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {step > 1 && (
            <button
              onClick={handleGoBack}
              className="bg-surface-container-high border border-outline-variant/30 text-on-surface hover:text-primary transition-colors px-3 py-2 rounded-xl text-label-sm font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>رجوع للخطوة السابقة</span>
            </button>
          )}

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-primary text-on-primary hover:bg-primary/90 transition-all px-4 py-2.5 rounded-xl text-label-sm font-medium flex items-center gap-1.5 cursor-pointer shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة كتاب / ملزمة جديدة</span>
          </button>
        </div>
      </div>

      {/* Step Breadcrumbs Progress */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 text-label-sm">
        <button
          onClick={handleResetAll}
          className={`hover:text-primary transition-colors flex items-center gap-1 cursor-pointer ${
            step === 1 ? "text-primary font-bold" : "text-on-surface-variant"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>الأقسام الأكاديمية</span>
        </button>

        {selectedCategory && (
          <>
            <ChevronLeft className="w-4 h-4 text-outline-variant shrink-0" />
            <button
              onClick={() => setSearchParams({ category: selectedCategory.id })}
              className={`hover:text-primary transition-colors cursor-pointer ${
                step === 2 ? "text-primary font-bold" : "text-on-surface-variant"
              }`}
            >
              {selectedCategory.title}
            </button>
          </>
        )}

        {selectedSubject && (
          <>
            <ChevronLeft className="w-4 h-4 text-outline-variant shrink-0" />
            <button
              onClick={() => setSearchParams({ category: selectedCategory?.id || "", subject: selectedSubject.id })}
              className={`hover:text-primary transition-colors cursor-pointer ${
                step === 3 ? "text-primary font-bold" : "text-on-surface-variant"
              }`}
            >
              مادة: {selectedSubject.title}
            </button>
          </>
        )}

        {selectedFilter && (
          <>
            <ChevronLeft className="w-4 h-4 text-outline-variant shrink-0" />
            <span className="text-primary font-bold">{selectedFilter.label}</span>
          </>
        )}
      </div>

      {/* STEP 1: Main Category Selection (العلمية، العربية، الشرعية) */}
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

      {/* STEP 2: Subject Selection (الفيزياء، الكيمياء، النحو...) */}
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

      {/* STEP 3: Reference Type Selection (كتب، ملازم، ملخصات، خرائط ذهنية، فلاش كارد) */}
      {step === 3 && selectedSubject && (
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
                  className="group bg-surface-container border border-outline-variant/30 hover:border-primary rounded-2xl p-6 flex flex-col justify-between gap-4 cursor-pointer hover:shadow-xl transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
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
                    <span>تصفح الملفات</span>
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              );
            })}
          </div>
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
                <p className="text-xs text-on-surface-variant mt-1">اضغط على أي ملف لفتحه مباشرة عبر Google Drive.</p>
              </div>
            </div>

            {finalFilteredBooks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {finalFilteredBooks.map((book, idx) => (
                  <motion.a
                    key={book.id || idx}
                    href={book.linkUrl || "https://drive.google.com"}
                    target="_blank"
                    rel="noreferrer"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="group flex flex-col bg-surface-container-low rounded-2xl border border-outline-variant/30 overflow-hidden hover:border-primary transition-all shadow-lg relative"
                  >
                    <div className="aspect-[4/3] overflow-hidden relative">
                      <img
                        src={book.image}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
                        <ExternalLink className="w-3.5 h-3.5" /> Google Drive
                      </span>

                      {/* Direct Delete Button */}
                      <button
                        onClick={(e) => handleDeleteBook(book.id, e)}
                        className="absolute top-3 right-3 bg-error/90 text-white p-2 rounded-xl shadow-lg hover:bg-error transition-all z-20 cursor-pointer"
                        title="حذف هذا الكتاب أو الملزمة نهائياً"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-4 flex flex-col gap-1 text-right">
                      <h3 className="text-body-lg font-bold text-on-surface group-hover:text-primary transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-xs text-on-surface-variant opacity-80">{book.subtitle}</p>
                      {book.author && (
                        <span className="text-[11px] text-primary mt-1 font-medium">المصدر / الكاتب: {book.author}</span>
                      )}
                    </div>
                  </motion.a>
                ))}
              </div>
            ) : (
              <div className="py-16 flex flex-col items-center justify-center text-center gap-3 border border-dashed border-outline-variant/30 rounded-2xl bg-surface-container">
                <BookOpen className="w-12 h-12 text-primary/40 mb-1" />
                <h4 className="text-headline-md text-on-surface font-bold">لا يوجد ملازم أو كتب في هذا القسم حالياً</h4>
                <p className="text-body-md text-on-surface-variant max-w-md">
                  يمكنك إضافة كتاب أو ملزمة جديدة لهذه المادة عبر زر "+ إضافة كتاب / ملزمة جديدة" أعلى الصفحة.
                </p>
              </div>
            )}
          </div>
        )
      )}

      {/* Add Content Modal */}
      <AddContentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        defaultContentType="book"
        defaultSubject={selectedSubject?.id || "physics"}
      />
    </div>
  );
}
