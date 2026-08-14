import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { 
  User, Mail, Calendar, Award, BookOpen, Video, Layers, 
  MessageSquare, Trash2, ExternalLink, Plus, CheckCircle, Clock, 
  LogOut, Edit3, Save, ShieldCheck, GraduationCap, Sparkles, Check
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { 
  StudentAcademicProfile, 
  getSubjectsForProfile, 
  getProfileLabel 
} from "@/lib/subjectsData";
import { StageWizardModal } from "@/components/StageWizardModal";

interface UserContribution {
  id: string;
  title: string;
  subject: string;
  contentType: "book" | "video" | "flashcards" | "mindmaps";
  linkUrl: string;
  description: string;
  createdAt: string;
  status?: "approved" | "pending";
}

export default function Profile() {
  const { user, logout, updateUserProfile } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"contributions" | "curriculum" | "discussions">("contributions");
  const [myContent, setMyContent] = useState<UserContribution[]>([]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.displayName || "");
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Academic Profile State (Azhar vs General & Branch Selection)
  const [academicProfile, setAcademicProfile] = useState<StudentAcademicProfile>(() => {
    try {
      const saved = localStorage.getItem("wathaq_student_academic_profile");
      return saved ? JSON.parse(saved) : { system: "general", branch: "science", grade: "3rd" };
    } catch (e) {
      return { system: "general", branch: "science", grade: "3rd" };
    }
  });

  // Save academic profile
  const handleSaveAcademicProfile = (updated: StudentAcademicProfile) => {
    setAcademicProfile(updated);
    localStorage.setItem("wathaq_student_academic_profile", JSON.stringify(updated));
  };

  // Load custom content created by user
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("wathaq_custom_content") || "[]");
      setMyContent(saved);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleDeleteContent = (id: string) => {
    const updated = myContent.filter((item) => item.id !== id);
    setMyContent(updated);
    localStorage.setItem("wathaq_custom_content", JSON.stringify(updated));
  };

  const handleSaveName = async () => {
    if (!newName.trim()) return;
    await updateUserProfile(newName);
    setIsEditingName(false);
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
        <User className="w-16 h-16 text-primary/40 mb-3 animate-pulse" />
        <h2 className="text-headline-md text-on-surface mb-2">يرجى تسجيل الدخول لعرض حسابك ومساهماتك</h2>
        <Link to="/login" className="mt-2 bg-primary text-on-primary px-6 py-2.5 rounded-xl font-medium text-label-sm">
          تسجيل الدخول بـ Google
        </Link>
      </div>
    );
  }

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

  const currentSubjects = getSubjectsForProfile(academicProfile);

  return (
    <div className="flex flex-col gap-stack-lg">
      {/* Profile Banner */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="relative">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-primary/30" />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary/10 border-4 border-primary/30 text-primary flex items-center justify-center text-3xl font-bold">
                {user.displayName ? user.displayName[0] : "ط"}
              </div>
            )}
            <span className="absolute bottom-0 right-0 bg-primary text-on-primary p-1.5 rounded-full shadow-lg">
              <Award className="w-4 h-4" />
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3 flex-wrap">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="bg-surface-container-high border border-primary px-3 py-1 rounded-lg text-headline-md font-bold text-on-surface focus:outline-none"
                  />
                  <button onClick={handleSaveName} className="text-primary hover:bg-primary/10 p-1.5 rounded-lg">
                    <Save className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <h1 className="text-headline-lg font-bold text-on-surface flex items-center gap-2">
                  <span>{user.displayName || "طالب وثاق"}</span>
                  <button onClick={() => setIsEditingName(true)} className="text-on-surface-variant hover:text-primary p-1 rounded-lg" title="تعديل الاسم">
                    <Edit3 className="w-4 h-4" />
                  </button>
                </h1>
              )}

              {user.email === "ammaramrcan@gmail.com" ? (
                <span className="bg-primary/10 text-primary border border-primary/30 px-3 py-0.5 rounded-full text-label-sm font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> أدمن المنصة
                </span>
              ) : (
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-0.5 rounded-full text-label-sm font-medium">
                  {getProfileLabel(academicProfile)}
                </span>
              )}
            </div>

            <p className="text-body-md text-on-surface-variant font-mono text-xs" dir="ltr">{user.email}</p>
            <p className="text-label-sm text-on-surface-variant/70 flex items-center gap-1 mt-1">
              <Calendar className="w-3.5 h-3.5 text-primary" /> مسار النظام: <span className="font-bold text-on-surface">{getProfileLabel(academicProfile)}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {user.email === "ammaramrcan@gmail.com" && (
            <Link
              to="/admin"
              className="flex-1 md:flex-initial bg-primary text-on-primary hover:bg-primary/90 px-4 py-2.5 rounded-xl text-label-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-lg shadow-primary/10"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>لوحة الأدمن</span>
            </Link>
          )}

          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="flex-1 md:flex-initial bg-surface-container-high border border-error/30 text-error hover:bg-error/10 px-4 py-2.5 rounded-xl text-label-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>

      {/* Interactive Academic Stage Selector Card & Button */}
      <div className="bg-surface-container-low border border-primary/30 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-xl relative overflow-hidden">
        <div className="flex justify-between items-center flex-wrap gap-4 border-b border-outline-variant/10 pb-4">
          <div>
            <h2 className="text-headline-md font-bold text-on-surface flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-primary" />
              <span>تحديد المرحلة والتخصص الأكاديمي</span>
            </h2>
            <p className="text-label-sm text-on-surface-variant mt-1">
              انقر على الزر لتحديد أو تغيير شعبتك ومرحلتك الدراسية عبر معالج تفاعلي بـ 3 أسئلة.
            </p>
          </div>

          <button
            onClick={() => setIsWizardOpen(true)}
            className="bg-primary text-on-primary hover:bg-primary/90 px-5 py-3 rounded-2xl font-bold text-label-md flex items-center gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-105 cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span>تغيير المرحلة بـ 3 أسئلة تفاعلية</span>
          </button>
        </div>

        {/* Current Active Stage Display */}
        <div className="bg-gradient-to-r from-primary/10 via-surface-container to-surface-container border border-primary/40 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 text-primary flex items-center justify-center text-2xl border border-primary/30">
              {academicProfile.system === "azhar" ? "🕌" : "🎓"}
            </div>
            <div>
              <span className="text-xs text-on-surface-variant block mb-0.5">مرحلتك الحالية المفعلة:</span>
              <h3 className="text-headline-md font-extrabold text-primary">
                {getProfileLabel(academicProfile)}
              </h3>
            </div>
          </div>

          <button
            onClick={() => setIsWizardOpen(true)}
            className="text-label-sm text-primary hover:underline border border-primary/30 px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            إعادة التحديد أو التبديل ←
          </button>
        </div>

        {/* Display Current Track Subjects */}
        <div className="flex flex-col gap-3 pt-3 border-t border-outline-variant/10">
          <span className="text-label-sm font-bold text-on-surface flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>قائمة المواد المقررة عليك في منهج ({getProfileLabel(academicProfile)}):</span>
          </span>

          <div className="flex flex-wrap gap-2">
            {currentSubjects.map((sub, idx) => (
              <span
                key={idx}
                className="bg-surface-container-high text-on-surface border border-outline-variant/30 px-3.5 py-1.5 rounded-xl text-label-sm font-medium flex items-center gap-1 shadow-sm"
              >
                <BookOpen className="w-3.5 h-3.5 text-primary" />
                <span>{sub}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-stack-md">
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5 flex flex-col gap-1">
          <span className="text-label-sm text-on-surface-variant">إجمالي المساهمات</span>
          <span className="text-headline-lg font-bold text-on-surface">{myContent.length} مساهمة</span>
        </div>
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5 flex flex-col gap-1">
          <span className="text-label-sm text-on-surface-variant">المحتوى المنشور</span>
          <span className="text-headline-lg font-bold text-emerald-400">
            {myContent.filter((c) => c.status !== "pending").length} مقبول
          </span>
        </div>
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5 flex flex-col gap-1">
          <span className="text-label-sm text-on-surface-variant">بانتظار مراجعة الأدمن</span>
          <span className="text-headline-lg font-bold text-amber-400">
            {myContent.filter((c) => c.status === "pending").length} معلق
          </span>
        </div>
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5 flex flex-col gap-1">
          <span className="text-label-sm text-on-surface-variant">وسام التميز</span>
          <span className="text-headline-lg font-bold text-primary">نشط 🌟</span>
        </div>
      </div>

      {/* Profile Navigation Tabs */}
      <div className="flex gap-2 border-b border-outline-variant/10 pb-3">
        <button
          onClick={() => setActiveTab("contributions")}
          className={`px-4 py-2 rounded-lg text-label-sm font-medium transition-all flex items-center gap-2 border cursor-pointer ${
            activeTab === "contributions"
              ? "bg-primary text-on-primary border-primary"
              : "bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:border-primary/50"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>مساهماتي المرفوعة ({myContent.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("discussions")}
          className={`px-4 py-2 rounded-lg text-label-sm font-medium transition-all flex items-center gap-2 border cursor-pointer ${
            activeTab === "discussions"
              ? "bg-primary text-on-primary border-primary"
              : "bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:border-primary/50"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>أسئلتي في المجتمع</span>
        </button>
      </div>

      {/* TAB 1: MY CONTRIBUTIONS */}
      {activeTab === "contributions" && (
        <div className="flex flex-col gap-4">
          {myContent.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
              {myContent.map((item) => (
                <div key={item.id} className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 flex flex-col justify-between gap-4 hover:border-primary/50 transition-all">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <h3 className="text-headline-md font-bold text-on-surface mb-1">{item.title}</h3>
                      <p className="text-label-sm text-primary">المادة: {getSubjectTitle(item.subject)}</p>
                    </div>

                    {item.status === "pending" ? (
                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full text-[11px] flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3 animate-spin" /> قيد مراجعة الأدمن
                      </span>
                    ) : (
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[11px] flex items-center gap-1 shrink-0">
                        <CheckCircle className="w-3 h-3" /> مقبول ومُنشر
                      </span>
                    )}
                  </div>

                  {item.description && (
                    <p className="text-body-md text-on-surface-variant font-light bg-surface-container p-3 rounded-xl border border-outline-variant/10">
                      {item.description}
                    </p>
                  )}

                  <div className="flex justify-between items-center pt-3 border-t border-outline-variant/10 text-label-sm">
                    <a
                      href={item.linkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline font-mono text-xs flex items-center gap-1 truncate max-w-[220px]"
                      dir="ltr"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="truncate">{item.linkUrl}</span>
                    </a>

                    <button
                      onClick={() => handleDeleteContent(item.id)}
                      className="text-error hover:bg-error/10 p-2 rounded-lg transition-colors cursor-pointer"
                      title="حذف هذه المساهمة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 flex flex-col items-center justify-center text-center gap-3 bg-surface-container-low border border-dashed border-outline-variant/30 rounded-2xl">
              <BookOpen className="w-12 h-12 text-primary/40 mb-1" />
              <h3 className="text-headline-md text-on-surface">لم تقم بإضافة مساهمات بعد</h3>
              <p className="text-body-md text-on-surface-variant max-w-md">
                شارِك الكتب، الفيديوهات، والخرائط الذهنية لـ إفادة جميع الطلاب في المنصة.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY COMMUNITY DISCUSSIONS */}
      {activeTab === "discussions" && (
        <div className="py-12 flex flex-col items-center justify-center text-center gap-3 bg-surface-container-low border border-outline-variant/20 rounded-2xl">
          <MessageSquare className="w-12 h-12 text-primary/40 mb-1" />
          <h3 className="text-headline-md text-on-surface">قسم الأسئلة والاستفسارات في المجتمع</h3>
          <p className="text-body-md text-on-surface-variant max-w-md">
            يمكنك الانتقال لقسم المجتمع لتصفح نصائح المراجعة وطرح أسئلتك الأكاديمية.
          </p>
          <Link to="/community" className="mt-2 bg-primary text-on-primary px-5 py-2.5 rounded-lg text-label-sm font-medium">
            الانتقال إلى مجتمع وثاق
          </Link>
        </div>
      )}

      {/* Stage Wizard 3-Questions Modal */}
      <StageWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        currentProfile={academicProfile}
        onSaveProfile={handleSaveAcademicProfile}
      />
    </div>
  );
}
