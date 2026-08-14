import { useState, useEffect, FormEvent } from "react";
import { motion } from "motion/react";
import { 
  Users, UserCheck, Eye, RefreshCw, HardDrive, Video, Layers, 
  Trash2, ExternalLink, Plus, ShieldCheck, BarChart3, TrendingUp, CheckCircle, Clock, Lock, Award, Star, BookOpen, FolderPlus, GraduationCap, Check
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AddContentModal } from "@/components/AddContentModal";
import { getStoredCurriculum, saveStoredCurriculum } from "@/lib/subjectsData";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  visitCount: number;
  status: "نشط" | "جديد";
}

interface CustomContent {
  id: string;
  title: string;
  subject: string;
  contentType: "book" | "video" | "flashcards" | "mindmaps";
  linkUrl: string;
  description: string;
  createdAt: string;
  status?: "approved" | "pending";
  uploaderName?: string;
}

interface TeacherEvaluation {
  id: string;
  name: string;
  subjectId: string;
  subjectTitle: string;
  category: "scientific" | "arabic" | "islamic";
  rating: number;
  reviewsCount: number;
  experience: string;
  strengths: string[];
  weaknesses: string[];
  summary: string;
}

const initialTeachers: TeacherEvaluation[] = [
  {
    id: "t-phys-1",
    name: "أ. محمد عبدالسلام",
    subjectId: "physics",
    subjectTitle: "الفيزياء",
    category: "scientific",
    rating: 4.9,
    reviewsCount: 142,
    experience: "15 عاماً في تدريس الفيزياء للثانوية العامة والأزهرية",
    summary: "خبير ومتمكن في ربط الفيزياء بالحياة الواقعية وتيسير مسائل الميكانيكا والكهرباء.",
    strengths: ["تبسيط المفاهيم المعقدة.", "حل أعقد مسائل الامتحانات بأسلوب متسلسل."],
    weaknesses: ["سرعة الشرح أحياناً في الدروس المتقدمة."]
  },
  {
    id: "t-chem-1",
    name: "أ. سارة حسن",
    subjectId: "chemistry",
    subjectTitle: "الكيمياء",
    category: "scientific",
    rating: 4.8,
    reviewsCount: 115,
    experience: "10 سنوات في تدريس الكيمياء العضوية والتحليلية",
    summary: "مبدعة في تسمية وتفاعلات المركبات العضوية وتلخيص المعادلات الصعبة.",
    strengths: ["خرائط ذهنية رائعة تجمع التفاعلات.", "متابعة دورية واختبارات قصيرة."],
    weaknesses: ["الإطالة أحياناً في شرح الأجزاء التأسيسية."]
  }
];

const ADMIN_EMAIL = "ammaramrcan@gmail.com";

export default function Admin() {
  const { user, loginWithGoogle, logout } = useAuth();
  // No mock users - start clean
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [contentList, setContentList] = useState<CustomContent[]>([]);
  const [teachers, setTeachers] = useState<TeacherEvaluation[]>([]);

  // Curriculum Management State
  const [curriculum, setCurriculum] = useState<Record<string, string[]>>(getStoredCurriculum());
  const [selectedSystem, setSelectedSystem] = useState<"azhar" | "general">("general");
  const [selectedBranchKey, setSelectedBranchKey] = useState<string>("general_science");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");

  const [activeTab, setActiveTab] = useState<"overview" | "pending" | "teachers" | "subjects" | "users" | "content">("overview");

  // New Teacher Form State
  const [tName, setTName] = useState("");
  const [tSubject, setTSubject] = useState("الفيزياء");
  const [tCategory, setTCategory] = useState<"scientific" | "arabic" | "islamic">("scientific");
  const [tRating, setTRating] = useState("4.9");
  const [tExperience, setTExperience] = useState("");
  const [tSummary, setTSummary] = useState("");

  const loadData = () => {
    try {
      const savedContent = JSON.parse(localStorage.getItem("wathaq_custom_content") || "[]");
      setContentList(savedContent);

      const savedTeachers = localStorage.getItem("wathaq_teachers");
      if (savedTeachers) {
        setTeachers(JSON.parse(savedTeachers));
      } else {
        setTeachers(initialTeachers);
        localStorage.setItem("wathaq_teachers", JSON.stringify(initialTeachers));
      }

      setCurriculum(getStoredCurriculum());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteContent = (id: string) => {
    const updated = contentList.filter((c) => c.id !== id);
    setContentList(updated);
    localStorage.setItem("wathaq_custom_content", JSON.stringify(updated));
  };

  const handleApproveContent = (id: string) => {
    const updated = contentList.map((c) => (c.id === id ? { ...c, status: "approved" as const } : c));
    setContentList(updated);
    localStorage.setItem("wathaq_custom_content", JSON.stringify(updated));
  };

  const handleDeleteTeacher = (id: string) => {
    const updated = teachers.filter((t) => t.id !== id);
    setTeachers(updated);
    localStorage.setItem("wathaq_teachers", JSON.stringify(updated));
  };

  // Add subject specifically to the selected branch key
  const handleAddSubjectToBranch = (e: FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;

    const currentBranchSubjects = curriculum[selectedBranchKey] || [];
    if (currentBranchSubjects.includes(newSubjectName.trim())) {
      alert("هذه المادة موجودة بالفعل في هذه الشعبة!");
      return;
    }

    const updatedBranchSubjects = [...currentBranchSubjects, newSubjectName.trim()];
    const updatedCurriculum = { ...curriculum, [selectedBranchKey]: updatedBranchSubjects };

    setCurriculum(updatedCurriculum);
    saveStoredCurriculum(updatedCurriculum);
    setIsAddSubjectOpen(false);
    setNewSubjectName("");
  };

  // Delete subject specifically from selected branch key
  const handleDeleteSubjectFromBranch = (subjectName: string) => {
    if (window.confirm(`هل أنت تأكد من رغبتك في حذف مادة (${subjectName}) من هذه الشعبة؟`)) {
      const currentBranchSubjects = curriculum[selectedBranchKey] || [];
      const updatedBranchSubjects = currentBranchSubjects.filter((s) => s !== subjectName);
      const updatedCurriculum = { ...curriculum, [selectedBranchKey]: updatedBranchSubjects };

      setCurriculum(updatedCurriculum);
      saveStoredCurriculum(updatedCurriculum);
    }
  };

  const handleAddTeacherSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!tName || !tSummary) return;

    const newTeacher: TeacherEvaluation = {
      id: "t-custom-" + Date.now(),
      name: tName,
      subjectId: tSubject,
      subjectTitle: tSubject,
      category: tCategory,
      rating: parseFloat(tRating) || 4.9,
      reviewsCount: 1,
      experience: tExperience || "مدرس معتمد في المنصة",
      summary: tSummary,
      strengths: ["تبسيط الشرح وتسهيل المفاهيم."],
      weaknesses: ["ملاحظة: الشرح يتطلب التركيز."]
    };

    const updated = [newTeacher, ...teachers];
    setTeachers(updated);
    localStorage.setItem("wathaq_teachers", JSON.stringify(updated));
    setIsAddTeacherOpen(false);
    setTName("");
    setTExperience("");
    setTSummary("");
  };

  const isAuthorizedAdmin = user?.email === ADMIN_EMAIL;

  if (!isAuthorizedAdmin) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center my-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-surface-container-low border border-outline-variant/30 rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary" />
          </div>

          <div>
            <h1 className="text-headline-lg font-headline-lg text-on-surface mb-2">تسجيل دخول الأدمن المصرح</h1>
            <p className="text-body-md text-on-surface-variant font-light leading-relaxed">
              هذه لوحة التحكم الإدارية الخاصة بمنصة وثاق. يرجى تسجيل الدخول بحساب جوجل المعتمد:
            </p>
            <span className="mt-2 inline-block font-mono text-sm bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full dir-ltr">
              ammaramrcan@gmail.com
            </span>
          </div>

          {user && user.email !== ADMIN_EMAIL && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-label-sm w-full">
              أنت مسجل حالياً بـ ({user.email}). هذا الحساب غير مصرح له بالدخول كـ أدمن.
            </div>
          )}

          <button
            onClick={loginWithGoogle}
            className="w-full py-3.5 px-4 rounded-xl bg-surface-container-high border border-outline-variant/40 hover:border-primary text-on-surface transition-all font-medium text-body-md flex items-center justify-center gap-3 cursor-pointer shadow-lg active:scale-98"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>تسجيل الدخول بـ Google للأدمن</span>
          </button>

          {user && (
            <button
              onClick={logout}
              className="text-label-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            >
              تسجيل الخروج من الحساب الحالي
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  const pendingContent = contentList.filter((c) => c.status === "pending");
  const approvedContent = contentList.filter((c) => c.status !== "pending");

  const getBranchLabel = (key: string) => {
    switch (key) {
      case "azhar_scientific": return "أزهري - علمي 🕌";
      case "azhar_literary": return "أزهري - أدبي 🕌";
      case "general_science": return "ثانوي عام - علمي علوم 🎓";
      case "general_math": return "ثانوي عام - علمي رياضة 🎓";
      case "general_literary": return "ثانوي عام - أدبي 🎓";
      default: return key;
    }
  };

  const currentBranchSubjects = curriculum[selectedBranchKey] || [];

  return (
    <div className="flex flex-col gap-stack-lg">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-outline-variant/10 pb-6 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 text-primary flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-display-ar font-display-ar text-on-surface">لوحة تحكم الأدمن والسيطرة الشاملة</h1>
            <p className="text-body-md text-on-surface-variant">مرحباً الأدمن ({user.displayName || user.email}). التحكم الكامل بالمواد حسب الشعب والأزهر والعام.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-on-primary hover:bg-primary/90 px-4 py-2.5 rounded-xl text-label-sm font-medium flex items-center gap-2 shadow-lg shadow-primary/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة محتوى كـ أدمن</span>
          </button>

          <button
            onClick={logout}
            className="bg-surface-container-high border border-outline-variant/30 text-on-surface hover:text-error transition-colors px-3 py-2.5 rounded-xl text-label-sm cursor-pointer"
          >
            خروج الأدمن
          </button>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex gap-2 sm:gap-3 border-b border-outline-variant/10 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 sm:px-5 py-2.5 rounded-lg text-label-sm font-medium transition-all flex items-center gap-2 border whitespace-nowrap cursor-pointer ${
            activeTab === "overview"
              ? "bg-primary text-on-primary border-primary"
              : "bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:border-primary/50"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>نظرة عامة والزيارات</span>
        </button>

        <button
          onClick={() => setActiveTab("subjects")}
          className={`px-4 sm:px-5 py-2.5 rounded-lg text-label-sm font-medium transition-all flex items-center gap-2 border whitespace-nowrap cursor-pointer ${
            activeTab === "subjects"
              ? "bg-primary text-on-primary border-primary"
              : "bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:border-primary/50"
          }`}
        >
          <GraduationCap className="w-4 h-4 text-primary" />
          <span>إدارة مناهج الأزهر والعام حسب الشعبة</span>
        </button>

        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 sm:px-5 py-2.5 rounded-lg text-label-sm font-medium transition-all flex items-center gap-2 border whitespace-nowrap cursor-pointer ${
            activeTab === "pending"
              ? "bg-primary text-on-primary border-primary"
              : "bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:border-primary/50"
          }`}
        >
          <Clock className="w-4 h-4 text-amber-400" />
          <span>طلبات المراجعة ({pendingContent.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("teachers")}
          className={`px-4 sm:px-5 py-2.5 rounded-lg text-label-sm font-medium transition-all flex items-center gap-2 border whitespace-nowrap cursor-pointer ${
            activeTab === "teachers"
              ? "bg-primary text-on-primary border-primary"
              : "bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:border-primary/50"
          }`}
        >
          <Award className="w-4 h-4 text-amber-400" />
          <span>إدارة المدرسين ({teachers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("content")}
          className={`px-4 sm:px-5 py-2.5 rounded-lg text-label-sm font-medium transition-all flex items-center gap-2 border whitespace-nowrap cursor-pointer ${
            activeTab === "content"
              ? "bg-primary text-on-primary border-primary"
              : "bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:border-primary/50"
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>المحتوى المنشور ({approvedContent.length})</span>
        </button>
      </div>

      {/* DEEP HIERARCHICAL SUBJECTS & CURRICULUM MANAGEMENT TAB */}
      {activeTab === "subjects" && (
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-xl">
          <div>
            <h3 className="text-headline-md font-bold text-on-surface flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-primary" />
              <span>إدارة وتعديل مواد كل شعبة في المنهج الأزهري والعام</span>
            </h3>
            <p className="text-label-sm text-on-surface-variant mt-1">
              اختر النظام الأكاديمي والشعبة، ثم أضف أو احذف أية مادة تظهر للطلاب في ذلك القسم تحديداً.
            </p>
          </div>

          {/* Step 1: System Selector (Azhar vs General) */}
          <div className="flex flex-col gap-3">
            <label className="text-label-sm font-bold text-on-surface">1. اختر نظام التعليم لتعديل مواده:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setSelectedSystem("azhar");
                  setSelectedBranchKey("azhar_scientific");
                }}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                  selectedSystem === "azhar"
                    ? "bg-primary/10 border-primary text-primary font-bold shadow-md"
                    : "bg-surface-container text-on-surface border-outline-variant/30"
                }`}
              >
                <span>🕌 التعليم الأزهري الشريف</span>
                {selectedSystem === "azhar" && <Check className="w-5 h-5 text-primary" />}
              </button>

              <button
                onClick={() => {
                  setSelectedSystem("general");
                  setSelectedBranchKey("general_science");
                }}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                  selectedSystem === "general"
                    ? "bg-primary/10 border-primary text-primary font-bold shadow-md"
                    : "bg-surface-container text-on-surface border-outline-variant/30"
                }`}
              >
                <span>🎓 الثانوي العام (تربية وتعليم)</span>
                {selectedSystem === "general" && <Check className="w-5 h-5 text-primary" />}
              </button>
            </div>
          </div>

          {/* Step 2: Branch Selector */}
          <div className="flex flex-col gap-3 pt-3 border-t border-outline-variant/10">
            <label className="text-label-sm font-bold text-on-surface">2. اختر الشعبة المستهدفة:</label>
            {selectedSystem === "azhar" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setSelectedBranchKey("azhar_scientific")}
                  className={`p-3.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                    selectedBranchKey === "azhar_scientific"
                      ? "bg-primary text-on-primary border-primary shadow-md"
                      : "bg-surface-container text-on-surface border-outline-variant/30"
                  }`}
                >
                  قسم علمي أزهري ({curriculum.azhar_scientific?.length || 0} مادة)
                </button>
                <button
                  onClick={() => setSelectedBranchKey("azhar_literary")}
                  className={`p-3.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                    selectedBranchKey === "azhar_literary"
                      ? "bg-primary text-on-primary border-primary shadow-md"
                      : "bg-surface-container text-on-surface border-outline-variant/30"
                  }`}
                >
                  قسم أدبي أزهري ({curriculum.azhar_literary?.length || 0} مادة)
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => setSelectedBranchKey("general_science")}
                  className={`p-3.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                    selectedBranchKey === "general_science"
                      ? "bg-primary text-on-primary border-primary shadow-md"
                      : "bg-surface-container text-on-surface border-outline-variant/30"
                  }`}
                >
                  علمي علوم ({curriculum.general_science?.length || 0} مواد)
                </button>
                <button
                  onClick={() => setSelectedBranchKey("general_math")}
                  className={`p-3.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                    selectedBranchKey === "general_math"
                      ? "bg-primary text-on-primary border-primary shadow-md"
                      : "bg-surface-container text-on-surface border-outline-variant/30"
                  }`}
                >
                  علمي رياضة ({curriculum.general_math?.length || 0} مواد)
                </button>
                <button
                  onClick={() => setSelectedBranchKey("general_literary")}
                  className={`p-3.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                    selectedBranchKey === "general_literary"
                      ? "bg-primary text-on-primary border-primary shadow-md"
                      : "bg-surface-container text-on-surface border-outline-variant/30"
                  }`}
                >
                  قسم أدبي ({curriculum.general_literary?.length || 0} مواد)
                </button>
              </div>
            )}
          </div>

          {/* Step 3: Subjects List for Selected Branch */}
          <div className="flex flex-col gap-4 pt-4 border-t border-outline-variant/10">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <h4 className="text-body-lg font-bold text-on-surface flex items-center gap-2">
                <span>المواد الحالية المقررة في ({getBranchLabel(selectedBranchKey)}):</span>
              </h4>

              <button
                onClick={() => setIsAddSubjectOpen(true)}
                className="bg-primary text-on-primary hover:bg-primary/90 px-4 py-2 rounded-xl text-label-sm font-medium flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة مادة جديدة لـ {getBranchLabel(selectedBranchKey)}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-stack-md">
              {currentBranchSubjects.map((sub, idx) => (
                <div key={idx} className="bg-surface-container p-4 rounded-2xl border border-outline-variant/20 flex justify-between items-center shadow-sm hover:border-primary/50 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-body-md text-on-surface">{sub}</span>
                  </div>

                  <button
                    onClick={() => handleDeleteSubjectFromBranch(sub)}
                    className="text-error hover:bg-error/10 p-2 rounded-lg transition-colors cursor-pointer"
                    title="حذف هذه المادة من الشعبة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TEACHERS MANAGEMENT TAB */}
      {activeTab === "teachers" && (
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 flex flex-col gap-6">
          <div className="flex justify-between items-center flex-wrap gap-4 border-b border-outline-variant/10 pb-4">
            <div>
              <h3 className="text-headline-md font-headline-md text-on-surface flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>إدارة تقييمات المدرسين (خالية من صور الاستوك العشوائية)</span>
              </h3>
            </div>

            <button
              onClick={() => setIsAddTeacherOpen(true)}
              className="bg-primary text-on-primary hover:bg-primary/90 px-4 py-2 rounded-lg text-label-sm font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة مدرس جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
            {teachers.map((t) => (
              <div key={t.id} className="bg-surface-container p-5 rounded-2xl border border-outline-variant/20 flex flex-col justify-between gap-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 text-primary flex items-center justify-center text-body-lg font-bold">
                      {t.name.replace("أ. ", "").replace("د. ", "")[0]}
                    </div>
                    <div>
                      <h4 className="text-body-lg font-bold text-on-surface">{t.name}</h4>
                      <span className="text-label-sm text-primary">{t.subjectTitle} • {t.experience}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteTeacher(t.id)}
                    className="text-error hover:bg-error/10 p-2 rounded-lg transition-colors cursor-pointer"
                    title="حذف هذا المدرس"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-label-sm text-on-surface-variant font-light bg-surface-container-high p-3 rounded-xl">
                  "{t.summary}"
                </p>

                <div className="flex justify-between items-center pt-2 border-t border-outline-variant/10 text-label-sm">
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-4 h-4 fill-amber-400" /> {t.rating}
                  </span>
                  <span className="text-xs text-on-surface-variant">القسم: {t.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PENDING APPROVAL TAB */}
      {activeTab === "pending" && (
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 flex flex-col gap-4 overflow-x-auto">
          <div className="flex justify-between items-center flex-wrap gap-4 mb-2">
            <div>
              <h3 className="text-headline-md font-headline-md text-on-surface flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <span>طلبات المحتوى المعلقة بانتظار موافقة الأدمن</span>
              </h3>
            </div>
          </div>

          {pendingContent.length > 0 ? (
            <table className="w-full text-right border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-outline-variant/20 text-label-sm text-on-surface-variant">
                  <th className="py-3 px-4">عنوان المحتوى</th>
                  <th className="py-3 px-4">المرفِع</th>
                  <th className="py-3 px-4 text-left">قرار الأدمن</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-body-md">
                {pendingContent.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-container/50 transition-colors">
                    <td className="py-4 px-4 font-medium text-on-surface">{c.title}</td>
                    <td className="py-4 px-4 text-on-surface-variant text-sm">{c.uploaderName || "طالب مسجل"}</td>
                    <td className="py-4 px-4 text-left">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApproveContent(c.id)}
                          className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white px-3 py-1.5 rounded-lg text-label-sm font-medium transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>موافقة ونشر</span>
                        </button>
                        <button
                          onClick={() => handleDeleteContent(c.id)}
                          className="bg-error/10 text-error border border-error/30 hover:bg-error hover:text-white p-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-3 border border-dashed border-outline-variant/30 rounded-xl">
              <CheckCircle className="w-12 h-12 text-emerald-400 mb-1" />
              <h4 className="text-headline-md text-on-surface">لا توجد طلبات معلقة حالياً</h4>
            </div>
          )}
        </div>
      )}

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 flex flex-col gap-4">
          <h3 className="text-headline-md font-headline-md text-on-surface">الطلاب المسجلون حالياً</h3>
          {users.length > 0 ? (
            <div className="flex flex-col gap-3">
              {users.map((u) => (
                <div key={u.id} className="flex justify-between items-center p-3 bg-surface-container rounded-xl border border-outline-variant/10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-label-sm font-bold">
                      {u.name[0]}
                    </div>
                    <div>
                      <h4 className="text-body-md text-on-surface font-medium">{u.name}</h4>
                      <p className="text-[12px] text-on-surface-variant">{u.email}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center opacity-60">
              <Users className="w-10 h-10 text-on-surface-variant mb-2" />
              <p className="text-body-md text-on-surface-variant">لا يوجد طلاب افتراضيون حالياً. القائمة تنشأ تلقائياً مع تسجيل الطلاب.</p>
            </div>
          )}
        </div>
      )}

      {/* Add Subject Modal */}
      {isAddSubjectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-md bg-surface-container rounded-3xl border border-outline-variant/30 p-6 sm:p-8 shadow-2xl text-right"
          >
            <h3 className="text-headline-md font-bold text-on-surface mb-2">
              إضافة مادة جديدة لـ ({getBranchLabel(selectedBranchKey)})
            </h3>
            <p className="text-xs text-on-surface-variant mb-4">ستظهر هذه المادة مباشرة للطلاب المسجلين في هذا المنهج والشعبة.</p>

            <form onSubmit={handleAddSubjectToBranch} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-label-sm text-on-surface-variant">اسم المادة</label>
                <input
                  type="text"
                  required
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="مثال: الفلسفة، الفرنسية، أو التفاضل"
                  className="bg-surface-container-high border border-outline-variant/40 rounded-xl p-3 text-body-md"
                />
              </div>

              <div className="flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsAddSubjectOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-outline-variant/30 text-on-surface-variant cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-medium cursor-pointer"
                >
                  حفظ المادة
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Add Teacher Modal */}
      {isAddTeacherOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-lg bg-surface-container rounded-3xl border border-outline-variant/30 p-6 shadow-2xl text-right max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-headline-md font-bold text-on-surface mb-4">إضافة مدرس جديد</h3>
            <form onSubmit={handleAddTeacherSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-label-sm text-on-surface-variant">اسم المدرس</label>
                <input
                  type="text"
                  required
                  value={tName}
                  onChange={(e) => setTName(e.target.value)}
                  placeholder="مثال: أ. أحمد العوضي"
                  className="bg-surface-container-high border border-outline-variant/40 rounded-xl p-3 text-body-md"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-label-sm text-on-surface-variant">المادة</label>
                <input
                  type="text"
                  required
                  value={tSubject}
                  onChange={(e) => setTSubject(e.target.value)}
                  placeholder="مثال: الفيزياء"
                  className="bg-surface-container-high border border-outline-variant/40 rounded-xl p-3 text-body-md"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-label-sm text-on-surface-variant">نبذة عن المدرس</label>
                <textarea
                  rows={2}
                  required
                  value={tSummary}
                  onChange={(e) => setTSummary(e.target.value)}
                  className="bg-surface-container-high border border-outline-variant/40 rounded-xl p-3 text-body-md"
                />
              </div>

              <div className="flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsAddTeacherOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-outline-variant/30 text-on-surface-variant"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-medium"
                >
                  حفظ المدرس
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <AddContentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}
