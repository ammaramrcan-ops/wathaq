import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { 
  Atom, BookOpen, Compass, Star, CheckCircle2, AlertTriangle, 
  ChevronLeft, ArrowRight, Play, Award, Sparkles, ThumbsUp, ThumbsDown
} from "lucide-react";

interface TeacherEvaluation {
  id: string;
  name: string;
  subjectId: string;
  subjectTitle: string;
  category: "scientific" | "arabic" | "islamic";
  rating: number;
  reviewsCount: number;
  avatar: string;
  experience: string;
  strengths: string[];
  weaknesses: string[];
  summary: string;
}

const teachersData: TeacherEvaluation[] = [
  // الفيزياء
  {
    id: "t-phys-1",
    name: "أ. محمد عبدالسلام",
    subjectId: "physics",
    subjectTitle: "الفيزياء",
    category: "scientific",
    rating: 4.9,
    reviewsCount: 142,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
    experience: "15 عاماً في تدريس الفيزياء للثانوية العامة",
    summary: "خبير ومتمكن في ربط الفيزياء بالحياة الواقعية وتيسير مسائل الميكانيكا والكهرباء.",
    strengths: [
      "تبسيط المفاهيم المعقدة ورسم توضيحي بصري لكل قانون.",
      "حل أعقد مسائل الامتحانات بأسلوب متسلسل ومنطقي.",
      "توفير تجارب افتراضية ممتعة تثبت المعلومة بسهولة."
    ],
    weaknesses: [
      "سرعة الشرح أحياناً في الدروس المتقدمة والفيزياء الحديثة.",
      "قلة الملازم والمذكرات الورقية المطبوعة (يركز أكثر على الشرح الشفهي والمرئي)."
    ]
  },
  {
    id: "t-phys-2",
    name: "د. أحمد سامي",
    subjectId: "physics",
    subjectTitle: "الفيزياء",
    category: "scientific",
    rating: 4.7,
    reviewsCount: 98,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
    experience: "12 عاماً، دكتوراه في الفيزياء التطبيقية",
    summary: "شرح أكاديمي دقيق جداً مناسب للطلاب الراغبين في الفهم العميق والدرجات النهائية.",
    strengths: [
      "إحاطة كاملة بكافة الأفكار الاستثنائية والمسائل النادرة في الامتحانات.",
      "إيقاع هادئ ومنظم جداً في استعراض خطوات الإثباتات الرياضية."
    ],
    weaknesses: [
      "تحتاج المحاضرة إلى تركيز شديد نظراً لجديّة وطول وقت الشرح.",
      "عدم تنويع وسائل التوضيح التفاعلية."
    ]
  },

  // الكيمياء
  {
    id: "t-chem-1",
    name: "أ. سارة حسن",
    subjectId: "chemistry",
    subjectTitle: "الكيمياء",
    category: "scientific",
    rating: 4.8,
    reviewsCount: 115,
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop",
    experience: "10 سنوات في تدريس الكيمياء العضوية والتحليلية",
    summary: "مبدعة في تسمية وتفاعلات المركبات العضوية وتلخيص المعادلات الصعبة.",
    strengths: [
      "خرائط ذهنية رائعة تجمع كافة تفاعلات الكيمياء العضوية في ورقة واحدة.",
      "متابعة دورية واختبارات قصيرة لتقييم استيعاب الطالب أولاً بأول."
    ],
    weaknesses: [
      "الإطالة أحياناً في شرح الأجزاء التأسيسية البسيطة.",
      "ندرة الحصص المباشرة للرد الفوري على استفسارات الطلاب."
    ]
  },

  // النحو واللغة العربية
  {
    id: "t-arb-1",
    name: "أ. محمود الشنقيطي",
    subjectId: "grammar",
    subjectTitle: "النحو والصرف",
    category: "arabic",
    rating: 4.9,
    reviewsCount: 160,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
    experience: "18 عاماً في تدريس لغة الضاد والبلاغة",
    summary: "أسلوب أعرابي ممتع يعتمد على التذوق اللغوي وفهم المعنى قبل تطبيق القواعد.",
    strengths: [
      "قدرة فائقة على جعل مادة النحو ممتعة وسلسة لأي طالب.",
      "تطبيقات مكثفة على شواهد القرآن الكريم والأبيات الشعرية."
    ],
    weaknesses: [
      "يتوسع أحياناً في الخلافات النحوية القديمة بين البصريين والكوفيين.",
      "وقت الشرح قد يكون طويلاً على الطلاب الراغبين في المراجعة السريعة."
    ]
  },

  // التوحيد والشرعيات
  {
    id: "t-isl-1",
    name: "الشيخ د. عبدالرحمن",
    subjectId: "tawheed",
    subjectTitle: "التوحيد والعقيدة",
    category: "islamic",
    rating: 5.0,
    reviewsCount: 130,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop",
    experience: "20 عاماً في العلوم الشرعية والتربوية",
    summary: "شرح ميسر ومؤصل لأبواب العقيدة والفقه مع استخراج الدروس والفوائد التربوية.",
    strengths: [
      "هدوء تام وسلاسة في عرض الأدلة والترتيب المنهجي للأفكار.",
      "ربط المسائل الشرعية بالجانب الإيماني والأخلاقي للطالب."
    ],
    weaknesses: [
      "الإيقاع هادئ جداً قد يتطلب زيادة سرعة الفيديو للبعض."
    ]
  }
];

export default function Teachers() {
  const [step, setStep] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<TeacherEvaluation[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("wathaq_teachers");
      if (saved) {
        setTeachers(JSON.parse(saved));
      } else {
        setTeachers(teachersData);
        localStorage.setItem("wathaq_teachers", JSON.stringify(teachersData));
      }
    } catch (err) {
      setTeachers(teachersData);
    }
  }, []);

  const availableTeachers = teachers.filter((t) => t.subjectId === selectedSubject);

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
      {/* Page Header */}
      <section className="flex flex-col gap-stack-sm items-start max-w-3xl border-b border-outline-variant/10 pb-6 w-full">
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full text-label-sm font-medium mb-1">
          <Award className="w-4 h-4" />
          <span>دليل وتقييم المدرسين الشامل</span>
        </div>

        <div className="flex justify-between items-center w-full flex-wrap gap-4">
          <div>
            <h1 className="text-display-ar font-display-ar text-on-surface">تقييم ونقاط قوة/ضعف المدرسين</h1>
            <p className="text-body-lg font-body-lg text-on-surface-variant">
              دليل موضوعي شفاف يساعدك في اختيار المدرس الأنسب لأسلوب تعلمك.
            </p>
          </div>

          {step > 1 && (
            <button
              onClick={() => {
                setStep(1);
                setSelectedCategory(null);
                setSelectedSubject(null);
              }}
              className="text-label-sm font-label-sm text-on-surface-variant hover:text-primary border border-outline-variant/30 px-4 py-2 rounded-lg transition-colors"
            >
              إعادة الاختيار من البداية
            </button>
          )}
        </div>

        {/* Stepper Progress */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
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
            <span>1. نوع القسم</span>
          </div>

          <ChevronLeft className="w-4 h-4 text-on-surface-variant/40" />

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
            <span>2. المادة ({selectedSubject ? getSubjectTitle(selectedSubject) : "اختر"})</span>
          </div>

          <ChevronLeft className="w-4 h-4 text-on-surface-variant/40" />

          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-label-sm transition-all border ${
              step === 3
                ? "bg-primary text-on-primary border-primary font-medium"
                : "bg-surface-container/50 text-on-surface-variant/50 border-outline-variant/10"
            }`}
          >
            <span>3. بطاقات وتقييم المدرسين</span>
          </div>
        </div>
      </section>

      {/* STEP 1: Main Category */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-stack-lg max-w-4xl mx-auto w-full my-auto"
        >
          <button
            onClick={() => {
              setSelectedCategory("scientific");
              setStep(2);
            }}
            className="group text-right p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 hover:border-primary hover:bg-surface-container transition-all cursor-pointer shadow-lg flex flex-col gap-4"
          >
            <div className="w-14 h-14 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
              <Atom className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-headline-lg font-headline-lg text-on-surface group-hover:text-primary transition-colors mb-1">
                مدرسو المواد العلمية
              </h3>
              <p className="text-body-md text-on-surface-variant font-light">الفيزياء، الكيمياء، الأحياء، والرياضيات</p>
            </div>
          </button>

          <button
            onClick={() => {
              setSelectedCategory("arabic");
              setStep(2);
            }}
            className="group text-right p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 hover:border-primary hover:bg-surface-container transition-all cursor-pointer shadow-lg flex flex-col gap-4"
          >
            <div className="w-14 h-14 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-headline-lg font-headline-lg text-on-surface group-hover:text-primary transition-colors mb-1">
                مدرسو المواد العربية
              </h3>
              <p className="text-body-md text-on-surface-variant font-light">النحو والصرف، الأدب والنصوص، البلاغة</p>
            </div>
          </button>

          <button
            onClick={() => {
              setSelectedCategory("islamic");
              setStep(2);
            }}
            className="group text-right p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 hover:border-primary hover:bg-surface-container transition-all cursor-pointer shadow-lg flex flex-col gap-4"
          >
            <div className="w-14 h-14 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 group-hover:scale-110 transition-transform">
              <Compass className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-headline-lg font-headline-lg text-on-surface group-hover:text-primary transition-colors mb-1">
                مدرسو المواد الشرعية
              </h3>
              <p className="text-body-md text-on-surface-variant font-light">التوحيد، الفقه، التفسير، والحديث</p>
            </div>
          </button>
        </motion.div>
      )}

      {/* STEP 2: Subject */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-stack-md"
        >
          {selectedCategory === "scientific" && (
            <>
              <button onClick={() => { setSelectedSubject("physics"); setStep(3); }} className="p-6 bg-surface-container-low rounded-xl border border-outline-variant/30 hover:border-primary text-right cursor-pointer">
                <h4 className="text-headline-md text-on-surface mb-1">مدرسو الفيزياء</h4>
                <p className="text-label-sm text-on-surface-variant">الكهربية، الحركة والفيزياء الحديثة</p>
              </button>
              <button onClick={() => { setSelectedSubject("chemistry"); setStep(3); }} className="p-6 bg-surface-container-low rounded-xl border border-outline-variant/30 hover:border-primary text-right cursor-pointer">
                <h4 className="text-headline-md text-on-surface mb-1">مدرسو الكيمياء</h4>
                <p className="text-label-sm text-on-surface-variant">الكيمياء العضوية والتحليلية</p>
              </button>
              <button onClick={() => { setSelectedSubject("biology"); setStep(3); }} className="p-6 bg-surface-container-low rounded-xl border border-outline-variant/30 hover:border-primary text-right cursor-pointer">
                <h4 className="text-headline-md text-on-surface mb-1">مدرسو الأحياء</h4>
                <p className="text-label-sm text-on-surface-variant">الوراثة، الخلايا ووظائف الأعضاء</p>
              </button>
              <button onClick={() => { setSelectedSubject("math"); setStep(3); }} className="p-6 bg-surface-container-low rounded-xl border border-outline-variant/30 hover:border-primary text-right cursor-pointer">
                <h4 className="text-headline-md text-on-surface mb-1">مدرسو الرياضيات</h4>
                <p className="text-label-sm text-on-surface-variant">التفاضل والتكامل والهندسة</p>
              </button>
            </>
          )}

          {selectedCategory === "arabic" && (
            <>
              <button onClick={() => { setSelectedSubject("grammar"); setStep(3); }} className="p-6 bg-surface-container-low rounded-xl border border-outline-variant/30 hover:border-primary text-right cursor-pointer">
                <h4 className="text-headline-md text-on-surface mb-1">مدرسو النحو والصرف</h4>
                <p className="text-label-sm text-on-surface-variant">القواعد والإعراب والبلاغة</p>
              </button>
            </>
          )}

          {selectedCategory === "islamic" && (
            <>
              <button onClick={() => { setSelectedSubject("tawheed"); setStep(3); }} className="p-6 bg-surface-container-low rounded-xl border border-outline-variant/30 hover:border-primary text-right cursor-pointer">
                <h4 className="text-headline-md text-on-surface mb-1">مدرسو التوحيد والعقيدة</h4>
                <p className="text-label-sm text-on-surface-variant">العقيدة وأصول الدين</p>
              </button>
            </>
          )}
        </motion.div>
      )}

      {/* STEP 3: Display Teachers Evaluation Cards */}
      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-stack-lg"
        >
          <div className="flex justify-between items-center flex-wrap gap-4 border-b border-outline-variant/10 pb-4">
            <h2 className="text-headline-lg font-headline-lg text-on-surface">
              دليل معلمي مادة: {getSubjectTitle(selectedSubject || "")}
            </h2>
            <Link
              to={`/videos?subject=${selectedSubject}`}
              className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-on-primary px-4 py-2 rounded-lg text-label-sm font-medium flex items-center gap-2 transition-colors"
            >
              <Play className="w-4 h-4" />
              <span>مشاهدة شروحات المدرسين المرئية ←</span>
            </Link>
          </div>

          {availableTeachers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-lg">
              {availableTeachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 flex flex-col justify-between gap-6 shadow-xl hover:border-primary/50 transition-all"
                >
                  {/* Top Profile Header */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex gap-4 items-center">
                      <img
                        src={teacher.avatar}
                        alt={teacher.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-primary/40"
                      />
                      <div>
                        <h3 className="text-headline-md font-bold text-on-surface mb-1">{teacher.name}</h3>
                        <p className="text-label-sm text-primary">{teacher.subjectTitle} • {teacher.experience}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="flex items-center gap-1 text-amber-400 font-bold text-headline-md">
                        <Star className="w-5 h-5 fill-amber-400" /> {teacher.rating}
                      </span>
                      <span className="text-[11px] text-on-surface-variant/70">
                        {teacher.reviewsCount} تقييم طالب
                      </span>
                    </div>
                  </div>

                  {/* Summary */}
                  <p className="text-body-md text-on-surface-variant leading-relaxed font-light bg-surface-container p-4 rounded-xl border border-outline-variant/10">
                    "{teacher.summary}"
                  </p>

                  {/* Strengths (نقاط القوة والميزات) */}
                  <div className="flex flex-col gap-2">
                    <h4 className="text-label-sm font-bold text-emerald-400 flex items-center gap-1.5">
                      <ThumbsUp className="w-4 h-4 text-emerald-400" />
                      <span>نقاط القوة والميزات الممتازة:</span>
                    </h4>
                    <ul className="flex flex-col gap-1.5 pl-2">
                      {teacher.strengths.map((str, idx) => (
                        <li key={idx} className="text-body-md text-on-surface flex items-start gap-2 text-sm font-light">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses (نقاط الضعف والملاحظات) */}
                  <div className="flex flex-col gap-2 pt-3 border-t border-outline-variant/10">
                    <h4 className="text-label-sm font-bold text-amber-400 flex items-center gap-1.5">
                      <ThumbsDown className="w-4 h-4 text-amber-400" />
                      <span>نقاط الضعف والملاحظات التي يجب الانتباه لها:</span>
                    </h4>
                    <ul className="flex flex-col gap-1.5 pl-2">
                      {teacher.weaknesses.map((weak, idx) => (
                        <li key={idx} className="text-body-md text-on-surface-variant flex items-start gap-2 text-sm font-light">
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-1" />
                          <span>{weak}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Link */}
                  <div className="pt-2">
                    <Link
                      to={`/videos?subject=${teacher.subjectId}`}
                      className="w-full py-3 rounded-xl bg-surface-container-high border border-outline-variant/30 hover:border-primary text-on-surface hover:text-primary transition-colors text-label-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      <span>مشاهدة شروحات {teacher.name} المرئية</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 flex flex-col items-center justify-center text-center gap-3 bg-surface-container-low border border-outline-variant/20 rounded-2xl">
              <Sparkles className="w-12 h-12 text-primary/40 mb-1" />
              <h3 className="text-headline-md text-on-surface">جارٍ إضافة المزيد من تقييمات المدرسين لمادة {getSubjectTitle(selectedSubject || "")}</h3>
              <p className="text-body-md text-on-surface-variant max-w-md">
                يمكنك الانتقال لقسم الفيديوهات لاستكشاف دروس هذه المادة.
              </p>
              <Link
                to={`/videos?subject=${selectedSubject}`}
                className="mt-2 bg-primary text-on-primary px-5 py-2.5 rounded-lg text-label-sm font-medium flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                <span>الانتقال لفيديوهات المادة</span>
              </Link>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
