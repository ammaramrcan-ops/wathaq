import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { 
  Atom, BookOpen, Compass, Star, CheckCircle2, AlertTriangle, 
  ChevronLeft, ArrowRight, Play, Award, Sparkles, ThumbsUp, ThumbsDown,
  Youtube, PlayCircle, ExternalLink
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { subscribeTeachers, TeacherEvaluation } from "@/lib/teacherService";
import { 
  subscribeStudentProfile, 
  filterCategoriesForProfile, 
  filterSubjectsForProfile, 
  StudentAcademicProfile 
} from "@/lib/subjectsData";

const teacherMainCategories = [
  {
    id: "scientific",
    title: "مدرسو المواد العلمية",
    subtitle: "الفيزياء، الكيمياء، الأحياء، والرياضيات",
    icon: Atom,
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20"
  },
  {
    id: "arabic",
    title: "مدرسو المواد العربية والثقافية",
    subtitle: "النحو والصرف، الأدب والنصوص، البلاغة، والإنجليزية",
    icon: BookOpen,
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
  },
  {
    id: "islamic",
    title: "مدرسو المواد الشرعية",
    subtitle: "التوحيد، الفقه، التفسير، والحديث الشريف",
    icon: Compass,
    color: "bg-amber-500/10 text-amber-400 border-amber-500/20"
  }
];

const teacherSubjects = [
  { id: "physics", title: "مدرسو الفيزياء", categoryId: "scientific", description: "الكهربية، الحركة والفيزياء الحديثة" },
  { id: "chemistry", title: "مدرسو الكيمياء", categoryId: "scientific", description: "الكيمياء العضوية والتحليلية والحرارية" },
  { id: "biology", title: "مدرسو الأحياء", categoryId: "scientific", description: "الوراثة، الخلايا ووظائف الأعضاء" },
  { id: "math", title: "مدرسو الرياضيات", categoryId: "scientific", description: "التفاضل والتكامل، الديناميكا والهندسة" },
  { id: "grammar", title: "مدرسو النحو والصرف", categoryId: "arabic", description: "قواعد الإعراب والصرف والأساليب" },
  { id: "literature", title: "مدرسو الأدب والنصوص", categoryId: "arabic", description: "شرح المدارس الأدبية والنصوص" },
  { id: "rhetoric", title: "مدرسو البلاغة والتعبير", categoryId: "arabic", description: "البيان، البديع، والمعاني" },
  { id: "english", title: "مدرسو اللغة الإنجليزية", categoryId: "arabic", description: "الجرامر والمفردات والترجمة والمهارات" },
  { id: "tawheed", title: "مدرسو التوحيد والعقيدة", categoryId: "islamic", description: "أصول العقيدة الإسلامية والإلهيات" },
  { id: "fiqh", title: "مدرسو الفقه وأصوله", categoryId: "islamic", description: "أحكام المعاملات والعبادات المذهبية" },
  { id: "tafseer", title: "مدرسو التفسير وعلوم القرآن", categoryId: "islamic", description: "تدبر السور وعلوم نزول القرآن" },
  { id: "hadith", title: "مدرسو الحديث الشريف", categoryId: "islamic", description: "مصطلح الحديث وشرح الأحاديث المقررة" }
];

export default function Teachers() {
  const { user } = useAuth();
  const [step, setStep] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<TeacherEvaluation[]>([]);
  const [academicProfile, setAcademicProfile] = useState<StudentAcademicProfile | null>(null);

  useEffect(() => {
    const unsubTeachers = subscribeTeachers((list) => {
      setTeachers(list);
    });
    const unsubProf = subscribeStudentProfile(user?.uid, (prof) => {
      setAcademicProfile(prof);
    });

    return () => {
      unsubTeachers();
      unsubProf();
    };
  }, [user?.uid]);

  const availableCategories = filterCategoriesForProfile(academicProfile, teacherMainCategories);
  const availableSubjects = filterSubjectsForProfile(academicProfile, teacherSubjects);
  const availableTeachers = teachers.filter((t) => t.subjectId === selectedSubject);

  const getSubjectTitle = (code: string) => {
    const found = teacherSubjects.find((s) => s.id === code);
    return found ? found.title : code;
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
              دليل موضوعي شفاف يساعدك في اختيار المدرس الأنسب لشعبتك ومادتك الدراسية.
            </p>
          </div>

          {step > 1 && (
            <button
              onClick={() => {
                setStep(1);
                setSelectedCategory(null);
                setSelectedSubject(null);
              }}
              className="text-label-sm font-label-sm text-on-surface-variant hover:text-primary border border-outline-variant/30 px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              إعادة الاختيار من البداية
            </button>
          )}
        </div>

        {/* Stepper Progress */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 text-label-sm">
          <div
            onClick={() => setStep(1)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer transition-all border ${
              step === 1
                ? "bg-primary text-on-primary border-primary font-medium"
                : selectedCategory
                ? "bg-surface-container-high text-primary border-primary/30"
                : "bg-surface-container text-on-surface-variant border-outline-variant/20"
            }`}
          >
            <span>1. المجال الأكاديمي</span>
          </div>

          <ChevronLeft className="w-4 h-4 text-on-surface-variant/40 shrink-0" />

          <div
            onClick={() => selectedCategory && setStep(2)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border ${
              step === 2
                ? "bg-primary text-on-primary border-primary font-medium cursor-pointer"
                : selectedSubject
                ? "bg-surface-container-high text-primary border-primary/30 cursor-pointer"
                : "bg-surface-container/50 text-on-surface-variant/50 border-outline-variant/10 cursor-not-allowed"
            }`}
          >
            <span>2. المادة ({selectedSubject ? getSubjectTitle(selectedSubject) : "اختر"})</span>
          </div>

          <ChevronLeft className="w-4 h-4 text-on-surface-variant/40 shrink-0" />

          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border ${
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
          {availableCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setStep(2);
                }}
                className="group text-right p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 hover:border-primary hover:bg-surface-container transition-all cursor-pointer shadow-lg flex flex-col gap-4"
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center border group-hover:scale-110 transition-transform ${cat.color}`}>
                  <Icon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-headline-lg font-headline-lg text-on-surface group-hover:text-primary transition-colors mb-1">
                    {cat.title}
                  </h3>
                  <p className="text-body-md text-on-surface-variant font-light">{cat.subtitle}</p>
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
          {availableSubjects.filter((s) => s.categoryId === selectedCategory).map((sub) => (
            <button
              key={sub.id}
              onClick={() => {
                setSelectedSubject(sub.id);
                setStep(3);
              }}
              className="p-6 bg-surface-container-low rounded-2xl border border-outline-variant/30 hover:border-primary hover:bg-surface-container transition-all text-right cursor-pointer shadow-md flex flex-col justify-between h-[150px]"
            >
              <div>
                <h4 className="text-headline-md text-on-surface mb-1 font-bold">{sub.title}</h4>
                <p className="text-label-sm text-on-surface-variant/80 font-light">{sub.description}</p>
              </div>
              <span className="text-xs text-primary font-bold flex items-center gap-1">
                <span>تصفح المدرسين</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </span>
            </button>
          ))}
        </motion.div>
      )}

      {/* STEP 3: Teacher Cards List */}
      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-stack-md"
        >
          <div className="flex justify-between items-center flex-wrap gap-4 border-b border-outline-variant/10 pb-4">
            <h2 className="text-headline-lg font-headline-lg text-on-surface">
              دليل مدرسين مادة ({getSubjectTitle(selectedSubject || "")})
            </h2>

            <button
              onClick={() => setStep(2)}
              className="text-label-sm text-primary hover:underline flex items-center gap-1 cursor-pointer font-bold"
            >
              <span>اختر مادة أخرى</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {availableTeachers.length === 0 ? (
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-12 text-center">
              <p className="text-body-lg text-on-surface-variant font-light">
                لا يوجد مدرسون مضافون لهذه المادة حالياً. يمكنك الإضافة من لوحة التحكم.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
              {availableTeachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 flex flex-col justify-between gap-6 hover:border-primary/50 transition-all shadow-xl"
                >
                  <div className="flex items-start gap-4">
                    {teacher.avatar ? (
                      <img
                        src={teacher.avatar}
                        alt={teacher.name}
                        className="w-16 h-16 rounded-2xl object-cover border border-outline-variant/30 shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-2xl shrink-0">
                        {teacher.name[0]}
                      </div>
                    )}
                    <div className="flex flex-col gap-1.5 overflow-hidden">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-headline-md font-bold text-on-surface">{teacher.name}</h3>
                        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400" /> {teacher.rating}
                        </span>
                      </div>
                      <p className="text-label-sm text-on-surface-variant font-light">{teacher.experience}</p>

                      {teacher.youtubeLessonsCount ? (
                        <div className="mt-1">
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5">
                            <PlayCircle className="w-3.5 h-3.5" />
                            <span>{teacher.youtubeLessonsCount} شرح مرئي نازل على يوتيوب 🎥</span>
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <p className="text-body-md text-on-surface-variant leading-relaxed font-light">
                    {teacher.summary}
                  </p>

                  <div className="grid grid-cols-1 gap-3 pt-4 border-t border-outline-variant/10">
                    <div>
                      <h4 className="text-label-sm font-bold text-emerald-400 flex items-center gap-1.5 mb-1.5">
                        <ThumbsUp className="w-4 h-4" /> نقاط القوة المميزة:
                      </h4>
                      <ul className="list-disc list-inside text-body-sm text-on-surface-variant space-y-1 font-light">
                        {teacher.strengths.map((st) => (
                          <li key={st}>{st}</li>
                        ))}
                      </ul>
                    </div>

                    {teacher.weaknesses && teacher.weaknesses.length > 0 && (
                      <div>
                        <h4 className="text-label-sm font-bold text-amber-400 flex items-center gap-1.5 mb-1.5">
                          <ThumbsDown className="w-4 h-4" /> ملاحظات ونقاط الانتباه:
                        </h4>
                        <ul className="list-disc list-inside text-body-sm text-on-surface-variant space-y-1 font-light">
                          {teacher.weaknesses.map((wk) => (
                            <li key={wk}>{wk}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Direct Action Buttons: YouTube Channel & Separate Lecture Platform */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-outline-variant/10">
                    {teacher.youtubeChannelUrl ? (
                      <a
                        href={teacher.youtubeChannelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
                      >
                        <Youtube className="w-4 h-4 text-red-500" />
                        <span>قناة اليوتيوب الرسمية</span>
                      </a>
                    ) : (
                      <div className="bg-surface-container-high/50 border border-outline-variant/20 p-3 rounded-xl text-xs text-on-surface-variant/60 text-center">
                        قناة يوتيوب غير مضافة
                      </div>
                    )}

                    {teacher.externalLectureUrl ? (
                      <a
                        href={teacher.externalLectureUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-primary text-on-primary hover:bg-primary/90 p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-primary/20 cursor-pointer"
                      >
                        <span>{teacher.externalLectureTitle || "دخول إلى المحاضرة المنفصلة 🚀"}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <div className="bg-surface-container-high/50 border border-outline-variant/20 p-3 rounded-xl text-xs text-on-surface-variant/60 text-center">
                        محاضرة منفصلة غير مضافة
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
