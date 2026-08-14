import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useSearchParams } from "react-router-dom";
import { 
  Atom, BookOpen, Compass, PlayCircle, ListVideo, 
  ArrowRight, Sparkles, Clock, ChevronLeft, Play, User
} from "lucide-react";

// Interfaces
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

interface VideoResource {
  id: string;
  title: string;
  subjectId: string;
  type: "playlist" | "video";
  duration?: string;
  lessonsCount?: number;
  author: string;
  description: string;
  image: string;
  lessonsList?: { title: string; duration: string }[];
}

// Data Definitions
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
  // العلمية
  { id: "physics", title: "الفيزياء", categoryId: "scientific", description: "الميكانيكا، الكهربية، والفيزياء الحديثة", icon: Atom },
  { id: "chemistry", title: "الكيمياء", categoryId: "scientific", description: "الكيمياء العضوية والتحليلية والحرارية", icon: Atom },
  { id: "biology", title: "الأحياء", categoryId: "scientific", description: "الوراثة، الأحياء الخلوية، وأجهزة الجسم", icon: Atom },
  { id: "math", title: "الرياضيات", categoryId: "scientific", description: "التفاضل والتكامل، الهندسة، والاحتمالات", icon: Atom },

  // العربية
  { id: "grammar", title: "النحو والصرف", categoryId: "arabic", description: "قواعد الإعراب والإحكام الصرفي", icon: BookOpen },
  { id: "literature", title: "الأدب والنصوص", categoryId: "arabic", description: "العصور الأدبية وتحليل النصوص الشعرية", icon: BookOpen },
  { id: "rhetoric", title: "البلاغة والتعبير", categoryId: "arabic", description: "البيان، البديع، والمعاني", icon: BookOpen },

  // الشرعية
  { id: "tawheed", title: "التوحيد والعقيدة", categoryId: "islamic", description: "أركان الإيمان وأصول العقيدة الإسلامية", icon: Compass },
  { id: "fiqh", title: "الفقه وأصوله", categoryId: "islamic", description: "أحكام العبادات والمعاملات الشرعية", icon: Compass },
  { id: "tafseer", title: "التفسير وعلوم القرآن", categoryId: "islamic", description: "تدبر الآيات وعلوم نزول القرآن", icon: Compass },
  { id: "hadith", title: "الحديث الشريف", categoryId: "islamic", description: "دراسة مصطلح الحديث والأحاديث النبوية", icon: Compass }
];

const contentTypes: ContentType[] = [
  { id: "playlist", title: "قائمة تشغيل (Playlist)", subtitle: "سلسلة فيديوهات متكاملة ترتب الفصل أو الوحدة بالكامل", icon: ListVideo },
  { id: "video", title: "فيديو شرح لدرس معين", subtitle: "شرح مركز ومباشر لمفهوم أو درس مخصص في المنهج", icon: PlayCircle }
];

// Mock Videos DB
const videoResourcesData: VideoResource[] = [
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
      { title: "الدرس 3: تأثير كومتون", duration: "25:10" },
      { title: "الدرس 4: الطبيعة المزدوجة للموجة والجسيم", duration: "30:00" }
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
    image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?q=80&w=800&auto=format&fit=crop",
    lessonsList: [
      { title: "الدرس 1: تسمية الألكانات وحلقات الكربون", duration: "20:10" },
      { title: "الدرس 2: تفاعلات الاحتراق والهلجنة", duration: "15:45" },
      { title: "الدرس 3: الألكينات والمجموعة الوظيفية", duration: "22:30" }
    ]
  },
  {
    id: "v4",
    title: "شرح درس تفاعلات الاستبدال النيوكليوفيلي",
    subjectId: "chemistry",
    type: "video",
    duration: "19 دقيقة",
    author: "أ. سارة حسن",
    description: "فيديو مخصص لشرح ميكانيكية تفاعلات SN1 و SN2 بأسلوب بصري مبسط.",
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
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop",
    lessonsList: [
      { title: "الدرس 1: أحكام تقديم الخبر على المبتدأ", duration: "18:20" },
      { title: "الدرس 2: مواضع حذف المبتدأ وجوباً", duration: "21:00" }
    ]
  },
  {
    id: "v6",
    title: "درس إعراب الجمل التي لها محل من الإعراب",
    subjectId: "grammar",
    type: "video",
    duration: "28 دقيقة",
    author: "أ. محمود الشنقيطي",
    description: "فيديو تطبيقي شامل لإعراب الجمل السبع المشهورة مع أمثلة الامتحانات.",
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "v7",
    title: "شرح كتاب التوحيد - باب الإخلاص والنية",
    subjectId: "tawheed",
    type: "video",
    duration: "35 دقيقة",
    author: "الشيخ د. عبدالرحمن",
    description: "درس مرئي في تحقيق توحيد العبادة والتحذير من الشرك الأصغر والرياء.",
    image: "https://images.unsplash.com/photo-1585036156171-384164a8c675?q=80&w=800&auto=format&fit=crop"
  }
];

export default function Videos() {
  const [searchParams, setSearchParams] = useSearchParams();
  // Stepper State (1: Category, 2: Subject, 3: Type (Playlist vs Video), 4: Results)
  const [step, setStep] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<MainCategory | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<SubjectItem | null>(null);
  const [selectedContentType, setSelectedContentType] = useState<ContentType | null>(null);
  const [activeVideo, setActiveVideo] = useState<VideoResource | null>(null);

  // Auto-detect Subject or Category from URL searchParams
  useEffect(() => {
    const subjectParam = searchParams.get("subject");
    const categoryParam = searchParams.get("category");

    if (subjectParam) {
      const foundSub = subjects.find((s) => s.id === subjectParam);
      if (foundSub) {
        const foundCat = mainCategories.find((c) => c.id === foundSub.categoryId);
        if (foundCat) setSelectedCategory(foundCat);
        setSelectedSubject(foundSub);
        setStep(3);
      }
    } else if (categoryParam) {
      const foundCat = mainCategories.find((c) => c.id === categoryParam);
      if (foundCat) {
        setSelectedCategory(foundCat);
        setStep(2);
      }
    }
  }, [searchParams]);

  // Available subjects for category
  const availableSubjects = subjects.filter(
    (s) => s.categoryId === selectedCategory?.id
  );

  const handleGoBack = () => {
    if (activeVideo) {
      setActiveVideo(null);
      return;
    }
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const handleResetAll = () => {
    setStep(1);
    setSelectedCategory(null);
    setSelectedSubject(null);
    setSelectedContentType(null);
    setActiveVideo(null);
  };

  // Filtered Video Resources
  const finalVideos = videoResourcesData.filter(
    (v) =>
      v.subjectId === selectedSubject?.id &&
      v.type === selectedContentType?.id
  );

  return (
    <div className="flex flex-col gap-stack-lg min-h-[75vh]">
      {/* Header & Step Indicator */}
      <div className="flex flex-col gap-stack-sm border-b border-outline-variant/10 pb-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                onClick={handleGoBack}
                className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface-variant hover:text-primary transition-all"
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

          {step > 1 && (
            <button
              onClick={handleResetAll}
              className="text-label-sm font-label-sm text-on-surface-variant hover:text-primary border border-outline-variant/30 px-4 py-2 rounded-lg transition-colors"
            >
              إعادة الاختيار من البداية
            </button>
          )}
        </div>

        {/* Stepper Progress Badges */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2">
          {/* Step 1 Badge */}
          <div
            onClick={() => setStep(1)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-label-sm cursor-pointer transition-all border ${
              step === 1
                ? "bg-primary text-on-primary border-primary font-medium"
                : selectedCategory
                ? "bg-surface-container-high text-primary border-primary/30"
                : "bg-surface-container text-on-surface-variant border-outline-variant/20"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center text-[11px]">1</span>
            <span>{selectedCategory ? selectedCategory.title : "المجال"}</span>
          </div>

          <ChevronLeft className="w-4 h-4 text-on-surface-variant/40" />

          {/* Step 2 Badge */}
          <div
            onClick={() => selectedCategory && setStep(2)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-label-sm transition-all border ${
              step === 2
                ? "bg-primary text-on-primary border-primary font-medium cursor-pointer"
                : selectedSubject
                ? "bg-surface-container-high text-primary border-primary/30 cursor-pointer"
                : "bg-surface-container/50 text-on-surface-variant/50 border-outline-variant/10 cursor-not-allowed"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center text-[11px]">2</span>
            <span>{selectedSubject ? selectedSubject.title : "المادة"}</span>
          </div>

          <ChevronLeft className="w-4 h-4 text-on-surface-variant/40" />

          {/* Step 3 Badge */}
          <div
            onClick={() => selectedSubject && setStep(3)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-label-sm transition-all border ${
              step === 3
                ? "bg-primary text-on-primary border-primary font-medium cursor-pointer"
                : selectedContentType
                ? "bg-surface-container-high text-primary border-primary/30 cursor-pointer"
                : "bg-surface-container/50 text-on-surface-variant/50 border-outline-variant/10 cursor-not-allowed"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center text-[11px]">3</span>
            <span>{selectedContentType ? selectedContentType.title : "نوع الفيديو"}</span>
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
          {mainCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat);
                  setStep(2);
                }}
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
          {availableSubjects.map((sub) => {
            const Icon = sub.icon;
            return (
              <button
                key={sub.id}
                onClick={() => {
                  setSelectedSubject(sub);
                  setStep(3);
                }}
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

      {/* STEP 3: Content Type (Playlist vs Video) */}
      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-stack-lg max-w-3xl mx-auto w-full my-auto"
        >
          {contentTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => {
                  setSelectedContentType(type);
                  setStep(4);
                }}
                className="group text-right p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 hover:border-primary hover:bg-surface-container transition-all duration-300 flex flex-col gap-4 cursor-pointer"
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
        </motion.div>
      )}

      {/* STEP 4: Results & Video Player */}
      {step === 4 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-stack-lg"
        >
          {/* Active Video Player Modal/View */}
          {activeVideo && (
            <div className="bg-surface-container-low border border-primary/40 rounded-2xl p-6 flex flex-col gap-4 mb-6 shadow-2xl">
              <div className="flex justify-between items-center">
                <h3 className="text-headline-md font-headline-md text-on-surface flex items-center gap-2">
                  <PlayCircle className="w-5 h-5 text-primary" />
                  <span>{activeVideo.title}</span>
                </h3>
                <button
                  onClick={() => setActiveVideo(null)}
                  className="text-label-sm text-on-surface-variant hover:text-primary px-3 py-1 rounded bg-surface-container"
                >
                  إغلاق المشغل ✕
                </button>
              </div>

              {/* Mock Player */}
              <div className="aspect-video w-full bg-black rounded-xl overflow-hidden relative flex items-center justify-center border border-outline-variant/20 group">
                <img
                  src={activeVideo.image}
                  alt={activeVideo.title}
                  className="w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="w-20 h-20 rounded-full bg-primary text-on-primary flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-2xl">
                    <Play className="w-8 h-8 translate-x-[-2px]" />
                  </div>
                  <span className="text-body-md font-medium text-white bg-black/60 px-4 py-1.5 rounded-full backdrop-blur-md">
                    جاري تشغيل الدرس المرئي
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center text-label-sm text-on-surface-variant">
                <span className="flex items-center gap-1"><User className="w-4 h-4" /> المحاضر: {activeVideo.author}</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> المدة: {activeVideo.duration}</span>
              </div>
            </div>
          )}

          {/* Videos Grid */}
          {finalVideos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-stack-lg">
              {finalVideos.map((vid) => (
                <div
                  key={vid.id}
                  className="group flex flex-col bg-surface-container-low rounded-2xl border border-outline-variant/30 overflow-hidden hover:border-primary transition-all duration-300"
                >
                  <div className="aspect-video w-full relative overflow-hidden bg-surface flex items-center justify-center">
                    <img
                      src={vid.image}
                      alt={vid.title}
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent"></div>

                    <button
                      onClick={() => setActiveVideo(vid)}
                      className="absolute w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                    >
                      <Play className="w-6 h-6 translate-x-[-1px]" />
                    </button>

                    {vid.duration && (
                      <span className="absolute bottom-3 right-3 bg-black/80 px-2.5 py-1 rounded text-[11px] text-white flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {vid.duration}
                      </span>
                    )}
                  </div>

                  <div className="p-stack-md flex flex-col justify-between flex-grow gap-stack-sm">
                    <div>
                      <h3 className="text-body-lg font-headline-md text-on-surface group-hover:text-primary transition-colors duration-300 mb-2">
                        {vid.title}
                      </h3>
                      <p className="text-label-sm text-on-surface-variant font-light line-clamp-2 leading-relaxed">
                        {vid.description}
                      </p>
                    </div>

                    {vid.lessonsList && (
                      <div className="mt-2 pt-3 border-t border-outline-variant/10 flex flex-col gap-1.5">
                        <span className="text-[12px] text-primary font-medium">الدروس في السلسلة:</span>
                        {vid.lessonsList.slice(0, 3).map((lesson, idx) => (
                          <div key={idx} className="flex justify-between items-center text-[11px] text-on-surface-variant">
                            <span className="truncate">{lesson.title}</span>
                            <span>{lesson.duration}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-outline-variant/10 flex justify-between items-center text-label-sm text-on-surface-variant">
                      <span>{vid.author}</span>
                      <button
                        onClick={() => setActiveVideo(vid)}
                        className="text-primary hover:underline text-label-sm font-medium"
                      >
                        تشغيل الشرح ←
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-[6rem] flex flex-col items-center justify-center text-center gap-4 bg-surface-container-low rounded-2xl border border-outline-variant/20">
              <Sparkles className="w-12 h-12 text-primary/40 mb-2" />
              <h3 className="text-headline-md text-on-surface">لا تتوفر فيديوهات متطابقة لخياراتك حالياً</h3>
              <p className="text-body-md text-on-surface-variant max-w-md">
                جرّب اختيار مادة أخرى أو التبديل بين قائمة التشغيل والشرح المباشر.
              </p>
              <button
                onClick={() => setStep(2)}
                className="mt-2 px-6 py-2.5 rounded-lg border border-primary text-primary hover:bg-primary hover:text-on-primary transition-colors text-label-sm font-medium"
              >
                تغيير المادة أو خيارات الفيديو
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
