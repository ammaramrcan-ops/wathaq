import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MessageSquare, User, Plus, Sparkles, Lightbulb, 
  HelpCircle, Award, ChevronLeft, ArrowRight, Atom, 
  BookOpen, Compass, CheckCircle2, Star, ThumbsUp, Send
} from "lucide-react";
import Teachers from "@/pages/Teachers";

// Types
interface Teacher {
  id: string;
  name: string;
  subject: string;
  rating: number;
  reviewsCount: number;
  bio: string;
  avatar: string;
  tag: string;
}

interface Discussion {
  id: string;
  title: string;
  author: string;
  subjectId?: string;
  category: "advice" | "question";
  replies: number;
  time: string;
  excerpt: string;
  tags: string[];
}

// Top Teachers Mock Data
const topTeachers: Teacher[] = [
  {
    id: "t1",
    name: "أ. محمد عبدالسلام",
    subject: "الفيزياء",
    rating: 4.9,
    reviewsCount: 128,
    bio: "خبير تبسيط الميكانيكا والفيزياء الحديثة بأسلوب بصري وممتع.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
    tag: "الأعلى تقييماً في الفيزياء"
  },
  {
    id: "t2",
    name: "أ. محمود الشنقيطي",
    subject: "النحو واللغة العربية",
    rating: 4.9,
    reviewsCount: 95,
    bio: "متخصص في تيسير قواعد الإعراب البلاغي وتحليل النصوص الأدبية.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
    tag: "الأكثر ترشيحاً في العربية"
  },
  {
    id: "t3",
    name: "أ. سارة حسن",
    subject: "الكيمياء",
    rating: 4.8,
    reviewsCount: 84,
    bio: "شرح مبتكر لميكانيكية تفاعلات الكيمياء العضوية والتحليلية.",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop",
    tag: "مرشح تميز كيمياء"
  },
  {
    id: "t4",
    name: "الشيخ د. عبدالرحمن",
    subject: "التوحيد والشرعيات",
    rating: 5.0,
    reviewsCount: 110,
    bio: "شرح فقه العبادات وأصول العقيدة بأسلوب تربوي مبسط وميسر.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
    tag: "خبير المواد الشرعية"
  }
];

// General Advice & Discussions
const adviceDiscussions: Discussion[] = [
  {
    id: "ad1",
    title: "أفضل استراتيجية لمراجعة مادة الفيزياء والكيمياء قبل الامتحان بحساب الوقت",
    author: "أحمد محمود",
    category: "advice",
    replies: 18,
    time: "منذ ساعتين",
    excerpt: "طريقة تقسيم الفصول على مدار 5 أيام مع حل الامتحانات السابقة وتثبيت القوانين في بطاقات سريعة.",
    tags: ["استراتيجية ذاكرة", "تنظيم الوقت"]
  },
  {
    id: "ad2",
    title: "ترشيحات المدرسين: من أفضل من يشرح البلاغة والنحو المتقدم؟",
    author: "سارة علي",
    category: "advice",
    replies: 32,
    time: "أمس",
    excerpt: "شاركونا تجاربكم مع مدرسي اللغة العربية ومن الشارح الأفضل لتيسير الإعراب وتحليل الأبيات الشعريّة.",
    tags: ["ترشيحات مدرسين", "اللغة العربية"]
  },
  {
    id: "ad3",
    title: "تجارب متفوقين: كيف تغلبت على التشتت وقمت بالتركيز لـ 4 ساعات متواصلة؟",
    author: "يوسف طارق",
    category: "advice",
    replies: 24,
    time: "منذ 3 أيام",
    excerpt: "استخدام تقنية البومودورو مع بيئة هادئة بعيدة عن الهاتف والشبكات الاجتماعية.",
    tags: ["تركيز عميق", "نصائح دراسية"]
  }
];

// Subject Specific Questions DB
const subjectQuestionsData: Discussion[] = [
  {
    id: "q1",
    title: "سؤال في الفيزياء: كيف نحسب القوة المحصلة في السطح المائل بدون احتكاك؟",
    author: "ريم حسن",
    subjectId: "physics",
    category: "question",
    replies: 9,
    time: "منذ ساعتين",
    excerpt: "في المسألة رقم 4 الصفحة 85، هل نستخدم mg sin(θ) أم mg cos(θ) للتحليل الأفقي؟",
    tags: ["الفيزياء", "قوانين نيوتن"]
  },
  {
    id: "q2",
    title: "سؤال كيمياء عضوية: ما الفارق في ناتج أكسدة الكحول الأولي والكحول الثانوي؟",
    author: "عمر خالد",
    subjectId: "chemistry",
    category: "question",
    replies: 14,
    time: "منذ 5 ساعات",
    excerpt: "الكحول الأولي يعطي ألديهيد ثم حمض كربوكسيلي، فهل الكحول الثانوي يتوقف عند الكيتون؟",
    tags: ["الكيمياء", "العضوية"]
  },
  {
    id: "q3",
    title: "سؤال نحو: ما إعراب 'كلما' في قول الشاعر وما نوع جملة جواب الشرط؟",
    author: "فاطمة أحمد",
    subjectId: "grammar",
    category: "question",
    replies: 7,
    time: "أمس",
    excerpt: "أحتاج توضيح الفرق بين كلما الشرطية الحينية وغيرها في قواعد الجمل.",
    tags: ["النحو والصرف", "إعراب"]
  },
  {
    id: "q4",
    title: "سؤال توحيد: ما الفرق بين التوحيد في الربوبية والألوهية بالدليل؟",
    author: "محمد طاهر",
    subjectId: "tawheed",
    category: "question",
    replies: 11,
    time: "منذ يومين",
    excerpt: "هل كفار قريش كانوا يقرون بتوحيد الربوبية أم الألوهية؟ الرجاء الشرح من الكتاب.",
    tags: ["التوحيد", "عقيدة"]
  }
];

export default function Community() {
  // Navigation Modes: "select" | "advice" | "question_wizard"
  const [mode, setMode] = useState<"select" | "advice" | "question_wizard">("select");
  
  // Question Wizard state (Step 1: Category, Step 2: Subject, Step 3: Questions list)
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  // New Post Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newExcerpt, setNewExcerpt] = useState("");
  const [postedSuccess, setPostedSuccess] = useState(false);

  // Filtered Questions for Subject
  const currentQuestions = subjectQuestionsData.filter((q) => q.subjectId === selectedSubject);

  const handlePostSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newExcerpt) return;

    setPostedSuccess(true);
    setTimeout(() => {
      setPostedSuccess(false);
      setNewTitle("");
      setNewExcerpt("");
      setIsModalOpen(false);
    }, 1500);
  };

  const getSubjectTitle = (code: string) => {
    const map: Record<string, string> = {
      physics: "الفيزياء",
      chemistry: "الكيمياء",
      biology: "الأحياء",
      math: "الرياضيات",
      grammar: "النحو والصرف",
      literature: "الأدب والنصوص",
      rhetoric: "البلاغة والتعبير",
      tawheed: "التوحيد والعقيدة",
      fiqh: "الفقه وأصوله",
      tafseer: "التفسير وعلوم القرآن",
      hadith: "الحديث الشريف"
    };
    return map[code] || code;
  };

  return (
    <div className="flex flex-col gap-section-padding min-h-[75vh]">
      {/* Top Banner Header */}
      <section className="flex flex-col gap-stack-sm items-start max-w-3xl border-b border-outline-variant/10 pb-6 w-full">
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full text-label-sm font-medium mb-1">
          <MessageSquare className="w-4 h-4" />
          <span>المجتمع الأكاديمي والتبادل المعرفي</span>
        </div>
        
        <div className="flex justify-between items-center w-full flex-wrap gap-4">
          <div>
            <h1 className="text-display-ar font-display-ar text-on-surface">مجتمع وثاق الأكاديمي</h1>
            <p className="text-body-lg font-body-lg text-on-surface-variant">
              مساحة هادئة وموجهة للتبادل المعرفي والاستفسار عن الدروس والنصائح وترشيحات المعلمين.
            </p>
          </div>

          {mode !== "select" && (
            <button
              onClick={() => {
                setMode("select");
                setWizardStep(1);
                setSelectedCategory(null);
                setSelectedSubject(null);
              }}
              className="text-label-sm font-label-sm text-on-surface-variant hover:text-primary border border-outline-variant/30 px-4 py-2 rounded-lg transition-colors"
            >
              العودة للخيارات الرئيسية
            </button>
          )}
        </div>
      </section>

      {/* MODE SELECTOR: Initial Screen */}
      {mode === "select" && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-stack-lg my-auto items-center"
        >
          <div className="text-center max-w-lg mb-2">
            <h2 className="text-headline-lg text-on-surface mb-2">ما هو هدف زيارتك للمجتمع اليوم؟</h2>
            <p className="text-body-md text-on-surface-variant font-light">اختر المسار المناسب لطلب نصيحة أو طرح سؤال في المنهج الدراسي.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-lg w-full max-w-3xl">
            {/* Option A: Advice & Top Teachers */}
            <button
              onClick={() => setMode("advice")}
              className="group text-right p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 hover:border-primary hover:bg-surface-container transition-all duration-300 flex flex-col justify-between h-[240px] cursor-pointer shadow-xl"
            >
              <div className="w-14 h-14 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 group-hover:scale-110 transition-transform mb-4">
                <Lightbulb className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-headline-lg font-headline-lg text-on-surface group-hover:text-primary transition-colors mb-2">
                  نصيحة ونقاش عام / ترشيحات المدرسين
                </h3>
                <p className="text-body-md text-on-surface-variant font-light leading-relaxed">
                  تصفح نصائح تنظيم الوقت، طرق المراجعة، ودليل أفضل المدرسين والمرشحين لكل مادة.
                </p>
              </div>
            </button>

            {/* Option B: Subject & Lesson Questions */}
            <button
              onClick={() => {
                setMode("question_wizard");
                setWizardStep(1);
              }}
              className="group text-right p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 hover:border-primary hover:bg-surface-container transition-all duration-300 flex flex-col justify-between h-[240px] cursor-pointer shadow-xl"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform mb-4">
                <HelpCircle className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-headline-lg font-headline-lg text-on-surface group-hover:text-primary transition-colors mb-2">
                  سؤال في درس أو مادة معينة
                </h3>
                <p className="text-body-md text-on-surface-variant font-light leading-relaxed">
                  اختر المجال والمادة الدراسية لتصفح وطرح الأسئلة الأكاديمية والتطبيقات الشارحة.
                </p>
              </div>
            </button>
          </div>
        </motion.div>
      )}

      {/* BRANCH A: ADVICE & TOP TEACHERS */}
      {mode === "advice" && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-stack-lg"
        >
          {/* Top Teachers Directory Section */}
          <div className="flex flex-col gap-stack-md bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 sm:p-8">
            <Teachers />
          </div>

          {/* Advice Discussions List */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-headline-lg font-headline-lg text-on-surface flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-primary" />
                <span>أهم النصائح والنقاشات الدراسية</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-primary text-on-primary hover:bg-primary/90 px-4 py-2 rounded-lg text-label-sm font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>كتابة نصيحة جديدة</span>
              </button>
            </div>

            <div className="flex flex-col gap-4 mt-2">
              {adviceDiscussions.map((disc) => (
                <div key={disc.id} className="p-6 bg-surface-container-low border border-outline-variant/30 rounded-2xl flex flex-col gap-3 hover:border-primary/50 transition-all">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <h3 className="text-headline-md text-on-surface font-headline-md">{disc.title}</h3>
                    <span className="text-label-sm text-on-surface-variant">{disc.time}</span>
                  </div>
                  <p className="text-body-md text-on-surface-variant font-light leading-relaxed">{disc.excerpt}</p>
                  
                  <div className="flex justify-between items-center pt-3 border-t border-outline-variant/10 text-label-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" />
                      <span className="text-on-surface font-medium">{disc.author}</span>
                    </div>
                    <div className="flex items-center gap-4 text-on-surface-variant">
                      <span>💬 {disc.replies} ردود</span>
                      <span className="flex gap-1">
                        {disc.tags.map((t, idx) => (
                          <span key={idx} className="bg-surface-container-high px-2 py-0.5 rounded text-[11px] text-primary">#{t}</span>
                        ))}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* BRANCH B: SUBJECT & LESSON QUESTIONS WIZARD */}
      {mode === "question_wizard" && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-stack-lg"
        >
          {/* Stepper Badges */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-outline-variant/10 pb-4">
            <div
              onClick={() => setWizardStep(1)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-label-sm cursor-pointer transition-all border ${
                wizardStep === 1
                  ? "bg-primary text-on-primary border-primary font-medium"
                  : selectedCategory
                  ? "bg-surface-container-high text-primary border-primary/30"
                  : "bg-surface-container text-on-surface-variant border-outline-variant/20"
              }`}
            >
              <span>1. القسم</span>
            </div>

            <ChevronLeft className="w-4 h-4 text-on-surface-variant/40" />

            <div
              onClick={() => selectedCategory && setWizardStep(2)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-label-sm transition-all border ${
                wizardStep === 2
                  ? "bg-primary text-on-primary border-primary font-medium cursor-pointer"
                  : selectedSubject
                  ? "bg-surface-container-high text-primary border-primary/30 cursor-pointer"
                  : "bg-surface-container/50 text-on-surface-variant/50 border-outline-variant/10 cursor-not-allowed"
              }`}
            >
              <span>2. المادة ({selectedSubject ? getSubjectTitle(selectedSubject) : "اختر"})</span>
            </div>

            <ChevronLeft className="w-4 h-4 text-on-surface-variant/40" />

            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-label-sm transition-all border ${
                wizardStep === 3
                  ? "bg-primary text-on-primary border-primary font-medium"
                  : "bg-surface-container/50 text-on-surface-variant/50 border-outline-variant/10"
              }`}
            >
              <span>3. الأسئلة والنقاشات</span>
            </div>
          </div>

          {/* STEP 1: Select Category */}
          {wizardStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-stack-lg max-w-4xl mx-auto w-full my-auto">
              <button
                onClick={() => {
                  setSelectedCategory("scientific");
                  setWizardStep(2);
                }}
                className="group text-right p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 hover:border-primary hover:bg-surface-container transition-all cursor-pointer shadow-lg flex flex-col gap-4"
              >
                <div className="w-14 h-14 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
                  <Atom className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-headline-lg font-headline-lg text-on-surface group-hover:text-primary transition-colors mb-1">
                    أسئلة المواد العلمية
                  </h3>
                  <p className="text-body-md text-on-surface-variant font-light">الفيزياء، الكيمياء، الأحياء، والرياضيات</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setSelectedCategory("arabic");
                  setWizardStep(2);
                }}
                className="group text-right p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 hover:border-primary hover:bg-surface-container transition-all cursor-pointer shadow-lg flex flex-col gap-4"
              >
                <div className="w-14 h-14 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-headline-lg font-headline-lg text-on-surface group-hover:text-primary transition-colors mb-1">
                    أسئلة المواد العربية
                  </h3>
                  <p className="text-body-md text-on-surface-variant font-light">النحو والصرف، الأدب والبلاغة</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setSelectedCategory("islamic");
                  setWizardStep(2);
                }}
                className="group text-right p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 hover:border-primary hover:bg-surface-container transition-all cursor-pointer shadow-lg flex flex-col gap-4"
              >
                <div className="w-14 h-14 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 group-hover:scale-110 transition-transform">
                  <Compass className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-headline-lg font-headline-lg text-on-surface group-hover:text-primary transition-colors mb-1">
                    أسئلة المواد الشرعية
                  </h3>
                  <p className="text-body-md text-on-surface-variant font-light">التوحيد، الفقه، التفسير، والحديث</p>
                </div>
              </button>
            </div>
          )}

          {/* STEP 2: Select Subject */}
          {wizardStep === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-stack-md">
              {selectedCategory === "scientific" && (
                <>
                  <button onClick={() => { setSelectedSubject("physics"); setWizardStep(3); }} className="p-6 bg-surface-container-low rounded-xl border border-outline-variant/30 hover:border-primary text-right cursor-pointer">
                    <h4 className="text-headline-md text-on-surface mb-1">الفيزياء</h4>
                    <p className="text-label-sm text-on-surface-variant">الكهربية، الحركة، والفيزياء الحديثة</p>
                  </button>
                  <button onClick={() => { setSelectedSubject("chemistry"); setWizardStep(3); }} className="p-6 bg-surface-container-low rounded-xl border border-outline-variant/30 hover:border-primary text-right cursor-pointer">
                    <h4 className="text-headline-md text-on-surface mb-1">الكيمياء</h4>
                    <p className="text-label-sm text-on-surface-variant">الكيمياء العضوية والتحليلية</p>
                  </button>
                  <button onClick={() => { setSelectedSubject("biology"); setWizardStep(3); }} className="p-6 bg-surface-container-low rounded-xl border border-outline-variant/30 hover:border-primary text-right cursor-pointer">
                    <h4 className="text-headline-md text-on-surface mb-1">الأحياء</h4>
                    <p className="text-label-sm text-on-surface-variant">الوراثة والخلايا وأجهزة الجسم</p>
                  </button>
                  <button onClick={() => { setSelectedSubject("math"); setWizardStep(3); }} className="p-6 bg-surface-container-low rounded-xl border border-outline-variant/30 hover:border-primary text-right cursor-pointer">
                    <h4 className="text-headline-md text-on-surface mb-1">الرياضيات</h4>
                    <p className="text-label-sm text-on-surface-variant">التفاضل والتكامل والهندسة</p>
                  </button>
                </>
              )}

              {selectedCategory === "arabic" && (
                <>
                  <button onClick={() => { setSelectedSubject("grammar"); setWizardStep(3); }} className="p-6 bg-surface-container-low rounded-xl border border-outline-variant/30 hover:border-primary text-right cursor-pointer">
                    <h4 className="text-headline-md text-on-surface mb-1">النحو والصرف</h4>
                    <p className="text-label-sm text-on-surface-variant">الإعراب وأبواب النحو الصرفية</p>
                  </button>
                  <button onClick={() => { setSelectedSubject("literature"); setWizardStep(3); }} className="p-6 bg-surface-container-low rounded-xl border border-outline-variant/30 hover:border-primary text-right cursor-pointer">
                    <h4 className="text-headline-md text-on-surface mb-1">الأدب والنصوص</h4>
                    <p className="text-label-sm text-on-surface-variant">تحليل الأبيات والشعر العربي</p>
                  </button>
                </>
              )}

              {selectedCategory === "islamic" && (
                <>
                  <button onClick={() => { setSelectedSubject("tawheed"); setWizardStep(3); }} className="p-6 bg-surface-container-low rounded-xl border border-outline-variant/30 hover:border-primary text-right cursor-pointer">
                    <h4 className="text-headline-md text-on-surface mb-1">التوحيد والعقيدة</h4>
                    <p className="text-label-sm text-on-surface-variant">أركان الإيمان والتوحيد</p>
                  </button>
                  <button onClick={() => { setSelectedSubject("fiqh"); setWizardStep(3); }} className="p-6 bg-surface-container-low rounded-xl border border-outline-variant/30 hover:border-primary text-right cursor-pointer">
                    <h4 className="text-headline-md text-on-surface mb-1">الفقه وأصوله</h4>
                    <p className="text-label-sm text-on-surface-variant">أحكام العبادات والمعاملات</p>
                  </button>
                </>
              )}
            </div>
          )}

          {/* STEP 3: Display Subject Questions */}
          {wizardStep === 3 && (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <h2 className="text-headline-lg font-headline-lg text-on-surface flex items-center gap-2">
                  <HelpCircle className="w-6 h-6 text-primary" />
                  <span>الأسئلة والنقاشات الخاصة بمادة: {getSubjectTitle(selectedSubject || "")}</span>
                </h2>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-primary text-on-primary hover:bg-primary/90 px-4 py-2 rounded-lg text-label-sm font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>طرح سؤال في هذه المادة</span>
                </button>
              </div>

              {currentQuestions.length > 0 ? (
                <div className="flex flex-col gap-4 mt-2">
                  {currentQuestions.map((q) => (
                    <div key={q.id} className="p-6 bg-surface-container-low border border-outline-variant/30 rounded-2xl flex flex-col gap-3 hover:border-primary/50 transition-all">
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <h3 className="text-headline-md text-on-surface font-headline-md">{q.title}</h3>
                        <span className="text-label-sm text-on-surface-variant">{q.time}</span>
                      </div>
                      <p className="text-body-md text-on-surface-variant font-light leading-relaxed">{q.excerpt}</p>
                      
                      <div className="flex justify-between items-center pt-3 border-t border-outline-variant/10 text-label-sm">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-primary" />
                          <span className="text-on-surface font-medium">{q.author}</span>
                        </div>
                        <div className="flex items-center gap-3 text-on-surface-variant">
                          <span>💬 {q.replies} إجابات</span>
                          <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-[11px]">
                            {getSubjectTitle(q.subjectId || "")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 flex flex-col items-center justify-center text-center gap-3 bg-surface-container-low border border-outline-variant/20 rounded-2xl">
                  <Sparkles className="w-12 h-12 text-primary/40 mb-1" />
                  <h3 className="text-headline-md text-on-surface">كن أول من يطرح سؤالاً في مادة {getSubjectTitle(selectedSubject || "")}!</h3>
                  <p className="text-body-md text-on-surface-variant max-w-md">
                    المساحة هادئة ومخصصة للأسئلة الأكاديمية والتمارين المعقدة.
                  </p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="mt-2 bg-primary text-on-primary px-5 py-2.5 rounded-lg text-label-sm font-medium flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>طرح سؤال الآن</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Post Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-surface-container rounded-2xl border border-outline-variant/30 p-8 shadow-2xl text-right"
            >
              <h2 className="text-headline-md font-headline-md text-on-surface mb-2">
                {mode === "advice" ? "إضافة نصيحة أو نقاش عام" : `طرح سؤال جديد في ${getSubjectTitle(selectedSubject || "المادة")}`}
              </h2>
              <p className="text-label-sm text-on-surface-variant mb-6">اكتب سؤالك أو استفسارك بوضوح ليصلك الرد السريع من زملائك والمدرسين.</p>

              {postedSuccess ? (
                <div className="py-8 flex flex-col items-center justify-center text-center gap-2">
                  <CheckCircle2 className="w-12 h-12 text-primary animate-bounce" />
                  <h3 className="text-headline-md text-on-surface">تم نشر سؤالك بنجاح!</h3>
                </div>
              ) : (
                <form onSubmit={handlePostSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-label-sm text-on-surface-variant">عنوان السؤال / التساؤل</label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="مثال: استفسار حول حل مسألة السطح المائل رقم 5"
                      className="bg-surface-container-high text-on-surface border border-outline-variant/50 rounded-lg p-3 text-body-md focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-label-sm text-on-surface-variant">تفاصيل وتضحيح السؤال</label>
                    <textarea
                      rows={4}
                      required
                      value={newExcerpt}
                      onChange={(e) => setNewExcerpt(e.target.value)}
                      placeholder="اكتب التفاصيل المعقدة أو خطوات الحل التي واجهت فيها مشكلة..."
                      className="bg-surface-container-high text-on-surface border border-outline-variant/50 rounded-lg p-3 text-body-md focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2.5 rounded-lg border border-outline-variant/30 text-on-surface-variant text-label-sm"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-lg bg-primary text-on-primary text-label-sm font-medium flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>نشر السؤال</span>
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
