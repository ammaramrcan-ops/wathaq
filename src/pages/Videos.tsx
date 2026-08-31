import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useSearchParams } from "react-router-dom";
import { 
  Atom, BookOpen, Compass, PlayCircle, ListVideo, 
  ArrowRight, Sparkles, Clock, ChevronLeft, Play, User, Plus
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AddContentModal } from "@/components/AddContentModal";
import { extractYouTubeThumbnail } from "@/lib/utils";
import { VideoCard, VideoResourceItem } from "@/components/VideoCard";
import { 
  subscribeDeletedItems, 
  subscribeCustomContent, 
  markItemAsDeleted, 
  getLocalDeletedIds,
  getLocalCustomContent,
  CustomContentItem 
} from "@/lib/contentService";
import { 
  subscribeStudentProfile, 
  filterCategoriesForProfile, 
  filterSubjectsForProfile, 
  StudentAcademicProfile 
} from "@/lib/subjectsData";
import { subscribeLessons, subscribeUnits, SubjectUnitsMap, SubjectUnit } from "@/lib/lessonsData";

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

interface ContentType {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
}

const mainCategories: MainCategory[] = [
  {
    id: "scientific",
    title: "مواد علمية",
    subtitle: "شروحات الفيزياء، الكيمياء، الأحياء، والرياضيات",
    icon: Atom,
    color: "from-blue-500/10 to-indigo-500/10 border-blue-500/30 text-blue-400"
  },
  {
    id: "arabic",
    title: "مواد عربية",
    subtitle: "دروس النحو، البلاغة، والأدب والنصوص",
    icon: BookOpen,
    color: "from-emerald-500/10 to-teal-500/10 border-emerald-500/30 text-emerald-400"
  },
  {
    id: "islamic",
    title: "مواد شرعية",
    subtitle: "مرئيات التوحيد، الفقه، التفسير، والحديث",
    icon: Compass,
    color: "from-amber-500/10 to-orange-500/10 border-amber-500/30 text-amber-400"
  }
];

const subjects: SubjectItem[] = [
  { id: "physics", title: "الفيزياء", categoryId: "scientific", description: "الميكانيكا، الكهربية، والفيزياء الحديثة", icon: Atom },
  { id: "chemistry", title: "الكيمياء", categoryId: "scientific", description: "الكيمياء العضوية والتحليلية والحرارية", icon: Atom },
  { id: "biology", title: "الأحياء", categoryId: "scientific", description: "الوراثة، الأحياء الخلوية، وأجهزة الجسم", icon: Atom },
  { id: "math", title: "الرياضيات", categoryId: "scientific", description: "التفاضل والتكامل، الهندسة، والاحتمالات", icon: Atom },
  { id: "grammar", title: "النحو والصرف", categoryId: "arabic", description: "قواعد الإعراب والإحكام الصرفي", icon: BookOpen },
  { id: "literature", title: "الأدب والنصوص", categoryId: "arabic", description: "العصور الأدبية وتحليل النصوص الشعرية", icon: BookOpen },
  { id: "rhetoric", title: "البلاغة والتعبير", categoryId: "arabic", description: "البيان، البديع، والمعاني", icon: BookOpen },
  { id: "english", title: "اللغة الإنجليزية", categoryId: "arabic", description: "شروحات الجرامر والقراءة وشرح الكلمات وتدريبات الامتحانات", icon: BookOpen },
  { id: "tawheed", title: "التوحيد والعقيدة", categoryId: "islamic", description: "أركان الإيمان وأصول العقيدة الإسلامية", icon: Compass },
  { id: "fiqh", title: "الفقه وأصوله", categoryId: "islamic", description: "أحكام العبادات والمعاملات الشرعية", icon: Compass },
  { id: "tafseer", title: "التفسير وعلوم القرآن", categoryId: "islamic", description: "تدبر الآيات وعلوم نزول القرآن", icon: Compass },
  { id: "hadith", title: "الحديث الشريف", categoryId: "islamic", description: "دراسة مصطلح الحديث والأحاديث النبوية", icon: Compass }
];

const contentTypes: ContentType[] = [
  { id: "playlist", title: "قائمة تشغيل (Playlist)", subtitle: "سلسلة فيديوهات متكاملة ترتب الفصل أو الوحدة بالكامل", icon: ListVideo },
  { id: "video", title: "فيديو شرح لدرس معين", subtitle: "شرح مركز ومباشر لمفهوم أو درس مخصص في المنهج", icon: PlayCircle }
];

const defaultVideoResources: VideoResourceItem[] = [
  {
    id: "v1",
    title: "سلسلة شروحات الفيزياء الحديثة المتكاملة",
    subjectId: "physics",
    type: "playlist",
    lessonsCount: 12,
    duration: "4 ساعات و30 دقيقة",
    author: "أ. محمد عبدالسلام",
    description: "قائمة تشغيل تشمل جميع دروس الفيزياء الحديثة من الظاهرة الكهروضوئية إلى النظرية الذرية.",
    image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?q=80&w=800&auto=format&fit=crop",
    lessonsList: [
      { title: "الدرس 1: إشعاع الجسم الأسود", duration: "22:15" },
      { title: "الدرس 2: الظاهرة الكهروضوئية", duration: "18:40" },
      { title: "الدرس 3: تأثير كومتون", duration: "25:10" }
    ]
  },
  {
    id: "v2",
    title: "درس تفصيلي: قانون نيوتن الثاني وتطبيقاته",
    subjectId: "physics",
    type: "video",
    duration: "24 دقيقة",
    author: "د. أحمد سامي",
    description: "شرح مبسط ومركز لحل مسألة الحركة والتسارع والقوة المحصلة.",
    image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "v3",
    title: "كورس الكيمياء العضوية التأسيسي",
    subjectId: "chemistry",
    type: "playlist",
    lessonsCount: 8,
    duration: "3 ساعات",
    author: "أ. سارة حسن",
    description: "قائمة تشغيل شاملة لتسمية المركبات العضوية وتفاعلات الألكانات والألكينات.",
    image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "v5",
    title: "شرح أبواب المبتدأ والخبر في النحو",
    subjectId: "grammar",
    type: "playlist",
    lessonsCount: 6,
    duration: " ساعتان و15 دقيقة",
    author: "أ. محمود الشنقيطي",
    description: "سلسلة دراسية مرئية لشرح حالات تقديم الخبر وجوباً وجوازاً وحذف المبتدأ.",
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop"
  }
];

export default function Videos() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [step, setStep] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<MainCategory | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<SubjectItem | null>(null);
  const [selectedContentType, setSelectedContentType] = useState<ContentType | null>(null);
  const [activeVideo, setActiveVideo] = useState<VideoResourceItem | null>(null);

  const [deletedVideoIds, setDeletedVideoIds] = useState<string[]>(() => getLocalDeletedIds("video"));
  const [customItems, setCustomItems] = useState<CustomContentItem[]>(() => getLocalCustomContent());
  const [isDeletedLoaded, setIsDeletedLoaded] = useState(false);

  const [academicProfile, setAcademicProfile] = useState<StudentAcademicProfile | null>(null);
  const [lessonsMap, setLessonsMap] = useState<Record<string, string[]>>({});
  const [unitsMap, setUnitsMap] = useState<SubjectUnitsMap>({});
  const [selectedUnit, setSelectedUnit] = useState<SubjectUnit | null>(null);
  const [selectedLessonScope, setSelectedLessonScope] = useState<string>("all");
  const [interactiveStep, setInteractiveStep] = useState<"type" | "unit" | "lesson">("type");

  useEffect(() => {
    const unsubProf = subscribeStudentProfile(user?.uid, (prof) => {
      setAcademicProfile(prof);
    });

    const unsubDeleted = subscribeDeletedItems("video", user?.uid, (ids) => {
      setDeletedVideoIds(ids);
      setIsDeletedLoaded(true);
    });

    const unsubCustom = subscribeCustomContent(user?.uid, (items) => {
      setCustomItems(items);
    });

    const unsubLessons = subscribeLessons((map) => {
      setLessonsMap(map);
    });

    const unsubUnits = subscribeUnits((map) => {
      setUnitsMap(map);
    });

    return () => {
      unsubProf();
      unsubDeleted();
      unsubCustom();
      unsubLessons();
      unsubUnits();
    };
  }, [user?.uid]);

  const availableCategories = filterCategoriesForProfile(academicProfile, mainCategories);
  const availableSubjects = filterSubjectsForProfile(academicProfile, subjects);

  const userCustomVideos: VideoResourceItem[] = customItems
    .filter((item) => item.status !== "pending" && item.contentType === "video")
    .map((item) => {
      const ytThumb = extractYouTubeThumbnail(item.linkUrl);
      const isPlaylist = item.linkUrl.includes("playlist") || item.linkUrl.includes("list=");
      return {
        id: item.id,
        title: item.title,
        subjectId: item.subject,
        type: isPlaylist ? "playlist" : "video",
        author: item.uploaderName || "مساهمة معتمدة من وثاق",
        description: item.description || "فيديو شرح مخصص",
        videoUrl: item.linkUrl,
        image: ytThumb || item.image || ""
      } as VideoResourceItem;
    });

  const allVideos = [...userCustomVideos, ...defaultVideoResources].filter(
    (v) => !deletedVideoIds.includes(v.id)
  );

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const subjectParam = searchParams.get("subject");
    const typeParam = searchParams.get("type");
    const videoParam = searchParams.get("video");

    let cat: MainCategory | null = null;
    let sub: SubjectItem | null = null;
    let typeItem: ContentType | null = null;
    let vid: VideoResourceItem | null = null;

    if (subjectParam) {
      sub = subjects.find((s) => s.id === subjectParam) || null;
      if (sub) {
        cat = mainCategories.find((c) => c.id === sub!.categoryId) || null;
      }
    } else if (categoryParam) {
      cat = mainCategories.find((c) => c.id === categoryParam) || null;
    }

    const lessonParam = searchParams.get("lesson");
    if (lessonParam) {
      setSelectedLessonScope(lessonParam);
    }

    if (typeParam) {
      typeItem = contentTypes.find((t) => t.id === typeParam) || null;
    }

    if (videoParam) {
      vid = allVideos.find((v) => v.id === videoParam) || null;
    }

    setSelectedCategory((prev) => (prev?.id === cat?.id ? prev : cat));
    setSelectedSubject((prev) => (prev?.id === sub?.id ? prev : sub));
    setSelectedContentType((prev) => (prev?.id === typeItem?.id ? prev : typeItem));
    setActiveVideo((prev) => (prev?.id === vid?.id ? prev : vid));

    const targetStep = (sub && (typeItem || lessonParam)) ? 4 : sub ? 3 : cat ? 2 : 1;
    setStep((prev) => (prev === targetStep ? prev : targetStep));
  }, [searchParams, allVideos]);

  const handleSelectCategory = (cat: MainCategory) => setSearchParams({ category: cat.id });

  const handleSelectSubject = (sub: SubjectItem) => setSearchParams({ category: sub.categoryId, subject: sub.id });

  const handleSelectType = (typeItem: ContentType) => {
    if (!selectedSubject) return;
    setSearchParams({ category: selectedSubject.categoryId, subject: selectedSubject.id, type: typeItem.id });
  };

  const handleSelectVideo = (vid: VideoResourceItem) => {
    const targetUrl = (vid as any).videoUrl || (vid as any).linkUrl || `https://www.youtube.com/results?search_query=${encodeURIComponent(vid.title)}`;
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  const handleCloseVideo = () => {
    const params: Record<string, string> = {};
    if (selectedCategory) params.category = selectedCategory.id;
    if (selectedSubject) params.subject = selectedSubject.id;
    if (selectedContentType) params.type = selectedContentType.id;
    setSearchParams(params);
  };

  const handleGoBack = () => {
    if (activeVideo) {
      handleCloseVideo();
      return;
    }
    if (step === 4) {
      setSearchParams({ category: selectedCategory?.id || "", subject: selectedSubject?.id || "" });
      setInteractiveStep("type");
    } else if (step === 3) {
      if (interactiveStep === "lesson") {
        setInteractiveStep("unit");
      } else if (interactiveStep === "unit") {
        setInteractiveStep("type");
      } else {
        setSearchParams({ category: selectedCategory?.id || "" });
      }
    } else if (step === 2) {
      setSearchParams({});
    }
  };

  const handleResetAll = () => {
    setSearchParams({});
    setSelectedLessonScope("all");
    setInteractiveStep("type");
    setSelectedUnit(null);
  };

  const handleDeleteVideo = async (id: string) => {
    if (window.confirm("هل أنت تأكد من رغبتك في حذف هذا الفيديو أو قائمة التشغيل نهائياً؟")) {
      await markItemAsDeleted(id, "video", user?.uid, true);
      if (activeVideo?.id === id) handleCloseVideo();
    }
  };

  const finalVideos = allVideos.filter((v) => {
    const matchesSubject =
      !selectedSubject ||
      v.subjectId === selectedSubject.id ||
      v.subjectId === selectedSubject.title ||
      (selectedSubject.id === "physics" && (v.subjectId === "الفيزياء" || v.subjectId === "physics")) ||
      (selectedSubject.id === "chemistry" && (v.subjectId === "الكيمياء" || v.subjectId === "chemistry")) ||
      (selectedSubject.id === "math" && (v.subjectId === "الرياضيات" || v.subjectId === "math")) ||
      (selectedSubject.id === "biology" && (v.subjectId === "الأحياء" || v.subjectId === "biology")) ||
      (selectedSubject.id === "grammar" && (v.subjectId === "النحو" || v.subjectId === "grammar"));

    const matchesType =
      !selectedContentType ||
      v.type === selectedContentType.id ||
      (v.type as string) === "single" ||
      (selectedContentType.id === "video" && (v.type === "video" || (v as any).type === "single")) ||
      (selectedContentType.id === "playlist" && v.type === "playlist");

    return matchesSubject && matchesType;
  });

  return (
    <div className="flex flex-col gap-stack-lg min-h-[75vh]">
      {/* Header & Step Indicator */}
      <div className="flex flex-col gap-stack-sm border-b border-outline-variant/10 pb-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                onClick={handleGoBack}
                className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface-variant hover:text-primary transition-all cursor-pointer"
              >
                <ArrowRight className="w-5 h-5 rotate-180" />
              </button>
            )}
            <div>
              <h1 className="text-headline-lg font-headline-lg text-on-surface">
                {step === 1 && "مكتبة الفيديوهات: اختر نوع المجال"}
                {step === 2 && `الخطوة 2: اختر المادة (${selectedCategory?.title})`}
                {step === 3 && `الخطوة 3: قائمة تشغيل أم فيديو درس؟ (${selectedSubject?.title})`}
                {step === 4 && `المرئيات: ${selectedSubject?.title} - ${selectedContentType?.title}`}
              </h1>
              <p className="text-body-md text-on-surface-variant mt-1">
                تصفح مرئي هادئ يقودك فوراً للشرح المخصص بالدرس أو السلسلة الشاملة.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-primary text-on-primary hover:bg-primary/90 px-4 py-2 rounded-lg text-label-sm font-medium flex items-center gap-1.5 cursor-pointer shadow-lg shadow-primary/10"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة فيديو / قائمة تشغيل جديدة</span>
            </button>

            {step > 1 && (
              <button
                onClick={handleResetAll}
                className="text-label-sm font-label-sm text-on-surface-variant hover:text-primary border border-outline-variant/30 px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                إعادة الاختيار من البداية
              </button>
            )}
          </div>
        </div>
      </div>

      {/* STEP 1: Main Category */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-stack-lg my-auto"
        >
          {availableCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat)}
                className={`group text-right p-8 rounded-2xl bg-gradient-to-b border transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between h-[240px] cursor-pointer ${cat.color}`}
              >
                <div className="w-14 h-14 rounded-xl bg-surface-container/80 flex items-center justify-center border border-outline-variant/20 mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-headline-lg font-headline-lg text-on-surface mb-2 group-hover:text-primary transition-colors">
                    {cat.title}
                  </h2>
                  <p className="text-body-md text-on-surface-variant leading-relaxed font-light">
                    {cat.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </motion.div>
      )}

      {/* STEP 2: Subject */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-stack-md"
        >
          {availableSubjects.filter((sub) => sub.categoryId === selectedCategory?.id).map((sub) => {
            const Icon = sub.icon;
            return (
              <button
                key={sub.id}
                onClick={() => handleSelectSubject(sub)}
                className="group text-right p-6 rounded-xl bg-surface-container-low border border-outline-variant/30 hover:border-primary hover:bg-surface-container transition-all duration-300 flex flex-col justify-between h-[200px] cursor-pointer"
              >
                <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary mb-3 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-headline-md font-headline-md text-on-surface group-hover:text-primary transition-colors mb-1">
                    {sub.title}
                  </h3>
                  <p className="text-label-sm text-on-surface-variant/80 font-light line-clamp-2">
                    {sub.description}
                  </p>
                </div>
              </button>
            );
          })}
        </motion.div>
      )}

      {/* STEP 3: Interactive Question Wizard for Content Type, Units & Lessons */}
      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-6 max-w-4xl mx-auto w-full my-auto"
        >
          {/* Sub-step 1: Select Type (Playlist vs Lesson Video) */}
          {interactiveStep === "type" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-lg w-full">
              {contentTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => {
                      if (type.id === "video") {
                        setSelectedContentType(type);
                        setInteractiveStep("unit");
                      } else {
                        handleSelectType(type);
                        setSelectedLessonScope("all");
                      }
                    }}
                    className="group text-right p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 hover:border-primary hover:bg-surface-container transition-all duration-300 flex flex-col gap-4 cursor-pointer shadow-xl"
                  >
                    <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
                      <Icon className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-headline-lg font-headline-lg text-on-surface group-hover:text-primary transition-colors mb-2">
                        {type.title}
                      </h3>
                      <p className="text-body-md text-on-surface-variant font-light leading-relaxed">
                        {type.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Sub-step 2: Select Unit / Chapter */}
          {interactiveStep === "unit" && selectedSubject && (
            <div className="flex flex-col gap-6">
              <div className="text-center max-w-xl mx-auto">
                <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                  الخطوة 3.1: تحديد الباب أو الفصل
                </span>
                <h2 className="text-headline-lg font-bold text-on-surface mt-2 mb-1">
                  اختر الباب أو الفصل الأكاديمي لمادة ({selectedSubject.title})
                </h2>
                <p className="text-body-md text-on-surface-variant font-light">
                  حدد الباب لتضييق نطاق الشروحات والوصول للدرس المطلوب مباشرة.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Curriculum Card */}
                <button
                  onClick={() => {
                    const videoTypeObj = contentTypes.find((t) => t.id === "video") || contentTypes[0];
                    setSelectedContentType(videoTypeObj);
                    setSelectedLessonScope("all");
                    setStep(4);
                    if (selectedSubject) {
                      setSearchParams({
                        category: selectedSubject.categoryId,
                        subject: selectedSubject.id,
                        type: videoTypeObj.id
                      });
                    }
                  }}
                  className="group text-right p-6 rounded-2xl bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-all cursor-pointer shadow-lg flex justify-between items-center"
                >
                  <div>
                    <h3 className="text-headline-md font-bold text-primary mb-1">شروحات كامل المنهج الشامل</h3>
                    <p className="text-label-sm text-on-surface-variant">عرض جميع الفيديوهات المتاحة دون تقييد بدرس معين</p>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-primary group-hover:-translate-x-1 transition-transform" />
                </button>

                {/* Unit Cards */}
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
            </div>
          )}

          {/* Sub-step 3: Select Specific Lesson inside Unit */}
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
                    key={lesson + idx}
                    onClick={() => {
                      const videoTypeObj = contentTypes.find((t) => t.id === "video") || contentTypes[0];
                      setSelectedContentType(videoTypeObj);
                      setSelectedLessonScope(lesson);
                      setStep(4);
                      if (selectedSubject) {
                        setSearchParams({
                          category: selectedSubject.categoryId,
                          subject: selectedSubject.id,
                          lesson: lesson,
                          type: videoTypeObj.id
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
        </motion.div>
      )}

      {/* STEP 4: Results */}
      {step === 4 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-stack-lg"
        >
          {selectedLessonScope !== "all" && (
            <div className="bg-primary/10 border border-primary/30 rounded-2xl p-4 flex justify-between items-center flex-wrap gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="bg-primary text-on-primary text-xs font-bold px-3 py-1 rounded-xl">
                  صفحة الدرس الحالي
                </span>
                <h3 className="text-headline-sm font-bold text-on-surface">
                  عرض محتوى درس: ({selectedLessonScope})
                </h3>
              </div>
              <button
                onClick={() => {
                  setStep(3);
                  setInteractiveStep("unit");
                }}
                className="text-xs text-primary hover:underline font-bold cursor-pointer flex items-center gap-1"
              >
                <span>اختيار درس آخر</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {finalVideos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-stack-lg">
              {finalVideos.map((vid) => (
                <VideoCard
                  key={vid.id}
                  vid={vid}
                  onSelectVideo={handleSelectVideo}
                  onDeleteVideo={handleDeleteVideo}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 px-6 flex flex-col items-center justify-center text-center gap-4 bg-surface-container-low rounded-3xl border border-outline-variant/30 shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                <PlayCircle className="w-8 h-8" />
              </div>
              <h3 className="text-headline-md font-bold text-on-surface">
                {selectedLessonScope !== "all" 
                  ? `صفحة درس (${selectedLessonScope})` 
                  : "لا تتوفر فيديوهات متطابقة لخياراتك حالياً"}
              </h3>
              <p className="text-body-md text-on-surface-variant font-light max-w-md">
                {selectedLessonScope !== "all"
                  ? `لا تتوفر فيديوهات مضافة لهذا الدرس بعد. يمكنك التكرم بإضافة أول فيديو لمساعدة زملائك.`
                  : "تغيير المادة أو خيارات الفيديو للبحث مجدداً."}
              </p>
              <div className="flex items-center gap-3 flex-wrap justify-center mt-2">
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-primary text-on-primary hover:bg-primary/90 px-5 py-2.5 rounded-xl font-bold text-label-sm flex items-center gap-2 cursor-pointer shadow-lg shadow-primary/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة فيديو لهذا الدرس الآن</span>
                </button>
                <button
                  onClick={() => {
                    setStep(3);
                    setInteractiveStep("unit");
                  }}
                  className="bg-surface-container-high border border-outline-variant/40 text-on-surface hover:text-primary px-5 py-2.5 rounded-xl font-bold text-label-sm flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <span>اختيار درس أو باب آخر</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      <AddContentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        defaultContentType="video"
        defaultSubject={selectedSubject?.id || "physics"}
      />
    </div>
  );
}
