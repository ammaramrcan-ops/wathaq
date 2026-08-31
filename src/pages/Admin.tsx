import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  HardDrive, Trash2, ExternalLink, Plus, ShieldCheck, BarChart3, 
  CheckCircle, Clock, Lock, Award, Users, GraduationCap, Star, Layers, Lightbulb
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AddContentModal } from "@/components/AddContentModal";
import { getStoredCurriculum, saveStoredCurriculum } from "@/lib/subjectsData";
import { AdminGoogleUsersTab } from "@/components/admin/AdminGoogleUsersTab";
import { AdminVisitsOverviewTab } from "@/components/admin/AdminVisitsOverviewTab";
import { AdminAddSubjectModal } from "@/components/admin/AdminAddSubjectModal";
import { AdminAddTeacherModal } from "@/components/admin/AdminAddTeacherModal";
import { AdminCurriculumTab } from "@/components/admin/AdminCurriculumTab";
import { AdminSuggestionsTab } from "@/components/admin/AdminSuggestionsTab";
import { AdminLessonsTab } from "@/components/admin/AdminLessonsTab";
import { AdminLessonResourcesTab } from "@/components/admin/AdminLessonResourcesTab";
import { AdminCommunityGroupsTab } from "@/components/admin/AdminCommunityGroupsTab";
import { 
  subscribeCustomContent, 
  approveCustomContent, 
  deleteCustomContent 
} from "@/lib/contentService";
import { subscribeTeachers, deleteTeacher, addTeacher, TeacherEvaluation } from "@/lib/teacherService";
import { getUserPermissions, subscribeUserPermissions, UserPermissions } from "@/lib/userPermissionsService";

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

const ADMIN_EMAIL = "ammaramrcan@gmail.com";

export default function Admin() {
  const { user, loginWithGoogle, logout } = useAuth();
  const [contentList, setContentList] = useState<CustomContent[]>([]);
  const [teachers, setTeachers] = useState<TeacherEvaluation[]>([]);
  const [userPermsState, setUserPermsState] = useState<UserPermissions | null>(null);

  useEffect(() => {
    if (user?.email) {
      const unsub = subscribeUserPermissions(user.uid, user.email, (perm) => {
        setUserPermsState(perm);
      });
      return () => unsub();
    }
  }, [user?.uid, user?.email]);

  // Curriculum Management State
  const [curriculum, setCurriculum] = useState<Record<string, string[]>>(getStoredCurriculum());
  const [selectedSystem, setSelectedSystem] = useState<"azhar" | "general">("general");
  const [selectedBranchKey, setSelectedBranchKey] = useState<string>("general_science");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const validTabs = ["overview", "pending", "teachers", "subjects", "users", "content", "lessons", "suggestions", "resources", "groups"];
  const tabParam = searchParams.get("tab");
  const activeTab = (tabParam && validTabs.includes(tabParam)) ? tabParam : "overview";

  const handleTabChange = (tabKey: string) => {
    setSearchParams({ tab: tabKey });
  };
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    setCurriculum(getStoredCurriculum());
    const unsubContent = subscribeCustomContent(user?.uid, (items) => {
      setContentList(items as CustomContent[]);
    });
    const unsubTeachers = subscribeTeachers((list) => {
      setTeachers(list);
    });
    return () => {
      unsubContent();
      unsubTeachers();
    };
  }, [user?.uid]);

  const handleDeleteContent = async (id: string) => {
    await deleteCustomContent(id);
  };

  const handleApproveContent = async (id: string) => {
    if (processingId === id) return;
    setProcessingId(id);
    try {
      await approveCustomContent(id);
    } finally {
      setTimeout(() => setProcessingId(null), 500);
    }
  };

  const handleDeleteTeacher = async (id: string) => {
    await deleteTeacher(id);
  };

  const handleAddSubjectToBranch = (newSubjectName: string) => {
    const currentBranchSubjects = curriculum[selectedBranchKey] || [];
    if (currentBranchSubjects.includes(newSubjectName)) {
      alert("هذه المادة موجودة بالفعل في هذه الشعبة!");
      return;
    }
    const updatedBranchSubjects = [...currentBranchSubjects, newSubjectName];
    const updatedCurriculum = { ...curriculum, [selectedBranchKey]: updatedBranchSubjects };
    setCurriculum(updatedCurriculum);
    saveStoredCurriculum(updatedCurriculum);
  };

  const fallbackPerms = user ? getUserPermissions(user.uid, user.email || "") : null;
  const activePerms = userPermsState || fallbackPerms;
  const isAuthorizedAdmin = 
    Boolean(user?.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) || 
    Boolean(activePerms?.canAccessAdmin === true || activePerms?.role === "admin");

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
            <h1 className="text-headline-lg font-headline-lg text-on-surface mb-2">تسجيل دخول الأدمن المصرح له</h1>
            <p className="text-body-md text-on-surface-variant font-light leading-relaxed">
              هذه لوحة التحكم الإدارية الخاصة بمنصة وثاق. يرجى تسجيل الدخول بحساب Google المعتمد الخاص بإدارة المنصة.
            </p>
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
          onClick={() => handleTabChange("overview")}
          className={`px-4 sm:px-5 py-2.5 rounded-lg text-label-sm font-medium transition-all flex items-center gap-2 border whitespace-nowrap cursor-pointer ${
            activeTab === "overview" ? "bg-primary text-on-primary border-primary" : "bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:border-primary/50"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>1. نظرة عامة والزيارات</span>
        </button>

        <button
          onClick={() => handleTabChange("content")}
          className={`px-4 sm:px-5 py-2.5 rounded-lg text-label-sm font-medium transition-all flex items-center gap-2 border whitespace-nowrap cursor-pointer ${
            activeTab === "content" ? "bg-primary text-on-primary border-primary" : "bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:border-primary/50"
          }`}
        >
          <HardDrive className="w-4 h-4 text-emerald-400" />
          <span>2. المحتوى المنشور ({approvedContent.length})</span>
        </button>

        <button
          onClick={() => handleTabChange("pending")}
          className={`px-4 sm:px-5 py-2.5 rounded-lg text-label-sm font-medium transition-all flex items-center gap-2 border whitespace-nowrap cursor-pointer ${
            activeTab === "pending" ? "bg-primary text-on-primary border-primary" : "bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:border-primary/50"
          }`}
        >
          <Clock className="w-4 h-4 text-amber-400" />
          <span>3. طلبات المراجعة ({pendingContent.length})</span>
        </button>

        <button
          onClick={() => handleTabChange("users")}
          className={`px-4 sm:px-5 py-2.5 rounded-lg text-label-sm font-medium transition-all flex items-center gap-2 border whitespace-nowrap cursor-pointer ${
            activeTab === "users" ? "bg-primary text-on-primary border-primary" : "bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:border-primary/50"
          }`}
        >
          <Users className="w-4 h-4 text-blue-400" />
          <span>4. المستخدمون المسجلون بـ Google 🔵</span>
        </button>

        <button
          onClick={() => handleTabChange("subjects")}
          className={`px-4 sm:px-5 py-2.5 rounded-lg text-label-sm font-medium transition-all flex items-center gap-2 border whitespace-nowrap cursor-pointer ${
            activeTab === "subjects" ? "bg-primary text-on-primary border-primary" : "bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:border-primary/50"
          }`}
        >
          <GraduationCap className="w-4 h-4 text-primary" />
          <span>5. إدارة مناهج الأزهر والعام</span>
        </button>

        <button
          onClick={() => handleTabChange("teachers")}
          className={`px-4 sm:px-5 py-2.5 rounded-lg text-label-sm font-medium transition-all flex items-center gap-2 border whitespace-nowrap cursor-pointer ${
            activeTab === "teachers" ? "bg-primary text-on-primary border-primary" : "bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:border-primary/50"
          }`}
        >
          <Award className="w-4 h-4 text-amber-400" />
          <span>6. إدارة المدرسين ({teachers.length})</span>
        </button>

        <button
          onClick={() => handleTabChange("lessons")}
          className={`px-4 sm:px-5 py-2.5 rounded-lg text-label-sm font-medium transition-all flex items-center gap-2 border whitespace-nowrap cursor-pointer ${
            activeTab === "lessons" ? "bg-primary text-on-primary border-primary" : "bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:border-primary/50"
          }`}
        >
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>7. إدارة دروس المناهج</span>
        </button>

        <button
          onClick={() => handleTabChange("suggestions")}
          className={`px-4 sm:px-5 py-2.5 rounded-lg text-label-sm font-medium transition-all flex items-center gap-2 border whitespace-nowrap cursor-pointer ${
            activeTab === "suggestions" ? "bg-primary text-on-primary border-primary" : "bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:border-primary/50"
          }`}
        >
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <span>8. سجل الاقتراحات 💡</span>
        </button>

        <button
          onClick={() => handleTabChange("resources")}
          className={`px-4 sm:px-5 py-2.5 rounded-lg text-label-sm font-medium transition-all flex items-center gap-2 border whitespace-nowrap cursor-pointer ${
            activeTab === "resources" ? "bg-primary text-on-primary border-primary" : "bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:border-primary/50"
          }`}
        >
          <ExternalLink className="w-4 h-4 text-blue-400" />
          <span>9. إدارة مرفقات الدروس (PDF / خرائط / CSV) 🔗</span>
        </button>

        <button
          onClick={() => handleTabChange("groups")}
          className={`px-4 sm:px-5 py-2.5 rounded-lg text-label-sm font-medium transition-all flex items-center gap-2 border whitespace-nowrap cursor-pointer ${
            activeTab === "groups" ? "bg-primary text-on-primary border-primary" : "bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:border-primary/50"
          }`}
        >
          <Users className="w-4 h-4 text-emerald-400" />
          <span>10. جروبات تليجرام/واتساب 💬</span>
        </button>
      </div>

      {/* LESSON RESOURCES TAB */}
      {activeTab === "resources" && <AdminLessonResourcesTab />}

      {/* COMMUNITY GROUPS TAB */}
      {activeTab === "groups" && <AdminCommunityGroupsTab />}

      {/* LESSONS TAB */}
      {activeTab === "lessons" && <AdminLessonsTab />}

      {/* SUGGESTIONS TAB */}
      {activeTab === "suggestions" && <AdminSuggestionsTab />}

      {/* CURRICULUM TAB */}
      {activeTab === "subjects" && (
        <AdminCurriculumTab
          curriculum={curriculum}
          setCurriculum={setCurriculum}
          onOpenAddSubject={() => setIsAddSubjectOpen(true)}
          selectedSystem={selectedSystem}
          setSelectedSystem={setSelectedSystem}
          selectedBranchKey={selectedBranchKey}
          setSelectedBranchKey={setSelectedBranchKey}
          getBranchLabel={getBranchLabel}
        />
      )}

      {/* TEACHERS TAB */}
      {activeTab === "teachers" && (
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 flex flex-col gap-6 text-right">
          <div className="flex justify-between items-center flex-wrap gap-4 border-b border-outline-variant/10 pb-4">
            <h3 className="text-headline-md font-bold text-on-surface flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>إدارة تقييمات المدرسين</span>
            </h3>
            <button
              onClick={() => setIsAddTeacherOpen(true)}
              className="bg-primary text-on-primary hover:bg-primary/90 px-4 py-2 rounded-lg text-label-sm font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة مدرس جديد</span>
            </button>
          </div>

          {teachers.length === 0 ? (
            <div className="p-12 text-center bg-surface-container rounded-3xl border border-outline-variant/20 text-on-surface-variant flex flex-col items-center gap-3">
              <Award className="w-12 h-12 text-on-surface-variant/40" />
              <h4 className="text-headline-md font-bold text-on-surface">لا يوجد مدرسون مضافون حالياً 👨‍🏫</h4>
              <p className="text-body-md text-on-surface-variant font-light">
                جميع المدرسين ديناميكيون ومحفوظون سحابياً 100%. يمكنك إضافة أي مدرس جديد الآن عبر زر الإضافة أعلاه.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teachers.map((t) => (
                <div key={t.id} className="bg-surface-container p-5 rounded-2xl border border-outline-variant/20 flex flex-col justify-between gap-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      {t.avatar ? (
                        <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-xl object-cover border border-outline-variant/30 shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 text-primary flex items-center justify-center text-body-lg font-bold shrink-0">
                          {t.name.replace("أ. ", "").replace("د. ", "")[0]}
                        </div>
                      )}
                      <div>
                        <h4 className="text-body-lg font-bold text-on-surface">{t.name}</h4>
                        <span className="text-label-sm text-primary font-bold">{t.subjectTitle} • {t.experience}</span>
                        {t.youtubeLessonsCount ? (
                          <span className="text-[11px] text-emerald-400 font-bold block mt-0.5">
                            🎥 {t.youtubeLessonsCount} شرح مرئي على يوتيوب
                          </span>
                        ) : null}
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
                  <div className="flex items-center gap-3 flex-wrap text-xs pt-1 border-t border-outline-variant/10">
                    {t.youtubeChannelUrl ? (
                      <a href={t.youtubeChannelUrl} target="_blank" rel="noreferrer" className="text-red-400 hover:underline flex items-center gap-1 font-bold">
                        <ExternalLink className="w-3.5 h-3.5" /> قناة يوتيوب
                      </a>
                    ) : null}
                    {t.externalLectureUrl ? (
                      <a href={t.externalLectureUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1 font-bold">
                        <ExternalLink className="w-3.5 h-3.5" /> {t.externalLectureTitle || "المحاضرة المنفصلة"}
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PENDING APPROVAL TAB */}
      {activeTab === "pending" && (
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 flex flex-col gap-4 overflow-x-auto text-right">
          <h3 className="text-headline-md font-bold text-on-surface flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <span>طلبات المحتوى المعلقة بانتظار موافقة الأدمن</span>
          </h3>

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
                          disabled={processingId === c.id}
                          className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white px-3 py-1.5 rounded-lg text-label-sm font-medium transition-colors cursor-pointer"
                        >
                          <span>{processingId === c.id ? "جاري الاعتماد..." : "موافقة ونشر"}</span>
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

      {/* PUBLISHED CONTENT TAB */}
      {activeTab === "content" && (
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 flex flex-col gap-6 text-right">
          <h3 className="text-headline-md font-bold text-on-surface flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-emerald-400" />
            <span>المحتوى المنشور والمعتمد في المنصة ({approvedContent.length})</span>
          </h3>

          {approvedContent.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {approvedContent.map((item) => (
                <div key={item.id} className="bg-surface-container border border-outline-variant/30 rounded-2xl p-5 flex flex-col justify-between gap-3 shadow-md">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1 overflow-hidden">
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full w-fit font-bold">
                        {item.contentType}
                      </span>
                      <h4 className="font-bold text-body-md text-on-surface truncate mt-1">{item.title}</h4>
                      <span className="text-xs text-primary font-medium">المادة: {item.subject}</span>
                    </div>
                    <button onClick={() => handleDeleteContent(item.id)} className="text-error hover:bg-error/10 p-2 rounded-xl border border-outline-variant/20 cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-outline-variant/10 text-xs">
                    <a href={item.linkUrl} target="_blank" rel="noreferrer" className="text-primary font-bold inline-flex items-center gap-1">
                      <span>فتح الرابط</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 flex flex-col items-center justify-center text-center gap-3 border border-dashed border-outline-variant/30 rounded-2xl">
              <HardDrive className="w-12 h-12 text-primary/40 mb-1" />
              <h4 className="text-headline-md text-on-surface font-bold">لا يوجد محتوى منشور مخصص حالياً</h4>
            </div>
          )}
        </div>
      )}

      {/* GOOGLE REGISTERED USERS TAB */}
      {activeTab === "users" && <AdminGoogleUsersTab />}

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <AdminVisitsOverviewTab
          approvedCount={approvedContent.length}
          pendingCount={pendingContent.length}
        />
      )}

      {/* Modals */}
      <AdminAddSubjectModal
        isOpen={isAddSubjectOpen}
        onClose={() => setIsAddSubjectOpen(false)}
        selectedBranchKey={selectedBranchKey}
        getBranchLabel={getBranchLabel}
        onAddSubject={handleAddSubjectToBranch}
      />

      <AdminAddTeacherModal
        isOpen={isAddTeacherOpen}
        onClose={() => setIsAddTeacherOpen(false)}
        onAddTeacher={async (t) => { await addTeacher(t); }}
      />

      <AddContentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
