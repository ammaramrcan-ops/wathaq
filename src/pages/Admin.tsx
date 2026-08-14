import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Users, UserCheck, Eye, RefreshCw, HardDrive, Video, Layers, 
  Trash2, ExternalLink, Plus, ShieldCheck, BarChart3, TrendingUp, CheckCircle, Clock, Lock, LogIn 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AddContentModal } from "@/components/AddContentModal";

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

const mockUsers: AdminUser[] = [
  { id: "u1", name: "أحمد محمود", email: "ahmed@example.com", joinDate: "2026-08-10", visitCount: 14, status: "نشط" },
  { id: "u2", name: "سارة علي", email: "sara@example.com", joinDate: "2026-08-12", visitCount: 8, status: "نشط" },
  { id: "u3", name: "يوسف طارق", email: "youssef@example.com", joinDate: "2026-08-13", visitCount: 3, status: "جديد" },
  { id: "u4", name: "ريم حسن", email: "reem@example.com", joinDate: "2026-08-14", visitCount: 1, status: "جديد" }
];

const ADMIN_EMAIL = "ammaramrcan@gmail.com";

export default function Admin() {
  const { user, loginWithGoogle, logout } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>(mockUsers);
  const [contentList, setContentList] = useState<CustomContent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "pending" | "users" | "content">("overview");

  // Load custom content from localStorage
  const loadContent = () => {
    try {
      const saved = JSON.parse(localStorage.getItem("wathaq_custom_content") || "[]");
      setContentList(saved);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadContent();
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

  // Check if current user is the authorized admin
  const isAuthorizedAdmin = user?.email === ADMIN_EMAIL;

  // Google Sign-In Guard for Admin Panel
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
              className="text-label-sm text-on-surface-variant hover:text-primary transition-colors"
            >
              تسجيل الخروج من الحساب الحالي
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  // Filter approved vs pending content
  const pendingContent = contentList.filter((c) => c.status === "pending");
  const approvedContent = contentList.filter((c) => c.status !== "pending");

  // Analytics Metrics
  const totalUsers = users.length;
  const newVisits = users.filter((u) => u.visitCount <= 2).length;
  const returningVisits = users.filter((u) => u.visitCount > 2).length;
  const totalVisits = users.reduce((acc, u) => acc + u.visitCount, 0);

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

  const getContentTypeBadge = (type: string) => {
    switch (type) {
      case "book":
        return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full text-[11px] flex items-center gap-1"><HardDrive className="w-3 h-3" /> رابط Drive</span>;
      case "video":
        return <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded-full text-[11px] flex items-center gap-1"><Video className="w-3 h-3" /> رابط فيديو</span>;
      case "flashcards":
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full text-[11px] flex items-center gap-1"><Layers className="w-3 h-3" /> تنزيل فلاش كارد</span>;
      default:
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[11px] flex items-center gap-1"><Layers className="w-3 h-3" /> تنزيل مباشر</span>;
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
            <h1 className="text-display-ar font-display-ar text-on-surface">لوحة تحكم الأدمن ومراجعة المحتوى</h1>
            <p className="text-body-md text-on-surface-variant">مرحباً بك ({user.displayName || user.email}). أنت مسجل بالحساب المصرح الرسمي.</p>
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
            className="bg-surface-container-high border border-outline-variant/30 text-on-surface hover:text-error transition-colors px-3 py-2.5 rounded-xl text-label-sm"
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
          onClick={() => setActiveTab("pending")}
          className={`px-4 sm:px-5 py-2.5 rounded-lg text-label-sm font-medium transition-all flex items-center gap-2 border whitespace-nowrap cursor-pointer ${
            activeTab === "pending"
              ? "bg-primary text-on-primary border-primary"
              : "bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:border-primary/50"
          }`}
        >
          <Clock className="w-4 h-4 text-amber-400" />
          <span>طلبات المراجعة ({pendingContent.length})</span>
          {pendingContent.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 sm:px-5 py-2.5 rounded-lg text-label-sm font-medium transition-all flex items-center gap-2 border whitespace-nowrap cursor-pointer ${
            activeTab === "users"
              ? "bg-primary text-on-primary border-primary"
              : "bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:border-primary/50"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>المستخدمين المسجلين ({totalUsers})</span>
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

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-stack-md">
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 flex flex-col gap-2">
          <div className="flex justify-between items-center text-on-surface-variant">
            <span className="text-label-sm">طلبات مراجعة معلقة</span>
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <span className="text-headline-lg font-bold text-on-surface">{pendingContent.length} طلبات</span>
          <span className="text-[12px] text-amber-400">بانتظار موافقتك للنشر</span>
        </div>

        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 flex flex-col gap-2">
          <div className="flex justify-between items-center text-on-surface-variant">
            <span className="text-label-sm">إجمالي الطلاب المسجلين</span>
            <Users className="w-5 h-5 text-primary" />
          </div>
          <span className="text-headline-lg font-bold text-on-surface">{totalUsers} طالب</span>
          <span className="text-[12px] text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +25% هذا الأسبوع
          </span>
        </div>

        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 flex flex-col gap-2">
          <div className="flex justify-between items-center text-on-surface-variant">
            <span className="text-label-sm">الزيارات الجديدة (New Visitors)</span>
            <Eye className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-headline-lg font-bold text-on-surface">{newVisits} زيارة</span>
          <span className="text-[12px] text-on-surface-variant/70">أول مرة للمنصة</span>
        </div>

        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 flex flex-col gap-2">
          <div className="flex justify-between items-center text-on-surface-variant">
            <span className="text-label-sm">الزيارات المكررة (Returning)</span>
            <RefreshCw className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-headline-lg font-bold text-on-surface">{returningVisits} زيارة</span>
          <span className="text-[12px] text-emerald-400">معدل العودة 75%</span>
        </div>
      </div>

      {/* PENDING APPROVAL TAB */}
      {activeTab === "pending" && (
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 flex flex-col gap-4 overflow-x-auto">
          <div className="flex justify-between items-center flex-wrap gap-4 mb-2">
            <div>
              <h3 className="text-headline-md font-headline-md text-on-surface flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <span>طلبات المحتوى المعلقة بانتظار موافقة الأدمن</span>
              </h3>
              <p className="text-label-sm text-on-surface-variant">الرافعون العاديون ينتظرون موافقتك لتنشر الملفات لجميع الطلاب.</p>
            </div>
          </div>

          {pendingContent.length > 0 ? (
            <table className="w-full text-right border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-outline-variant/20 text-label-sm text-on-surface-variant">
                  <th className="py-3 px-4">عنوان المحتوى</th>
                  <th className="py-3 px-4">اسم المرفِع</th>
                  <th className="py-3 px-4">المادة</th>
                  <th className="py-3 px-4">النوع والرابط</th>
                  <th className="py-3 px-4 text-left">قرار الأدمن</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-body-md">
                {pendingContent.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-container/50 transition-colors">
                    <td className="py-4 px-4 font-medium text-on-surface">{c.title}</td>
                    <td className="py-4 px-4 text-on-surface-variant text-sm">{c.uploaderName || "طالب مسجل"}</td>
                    <td className="py-4 px-4 text-on-surface-variant">{getSubjectTitle(c.subject)}</td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1">
                        {getContentTypeBadge(c.contentType)}
                        <a href={c.linkUrl} target="_blank" rel="noreferrer" className="text-xs text-primary font-mono hover:underline truncate max-w-[180px]" dir="ltr">
                          {c.linkUrl}
                        </a>
                      </div>
                    </td>
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
                          title="رفض وحذف الطلب"
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
              <h4 className="text-headline-md text-on-surface">لا توجد طلبات مراجعة معلقة حالياً</h4>
              <p className="text-body-md text-on-surface-variant max-w-sm">
                تمت مراجعة ونشر جميع الطلبات المعلقة بنجاح.
              </p>
            </div>
          )}
        </div>
      )}

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-stack-lg">
          {/* Quick Users List */}
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 flex flex-col gap-4">
            <h3 className="text-headline-md font-headline-md text-on-surface flex items-center justify-between">
              <span>أحدث المسجلين بالمنصة</span>
              <button onClick={() => setActiveTab("users")} className="text-label-sm text-primary hover:underline font-normal">عرض الكل ←</button>
            </h3>
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
                  <span className="text-label-sm text-on-surface-variant bg-surface-container-high px-2.5 py-1 rounded-full">
                    {u.visitCount} زيارة
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Content Summary */}
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 flex flex-col gap-4">
            <h3 className="text-headline-md font-headline-md text-on-surface flex items-center justify-between">
              <span>أحدث المحتوى المنشور</span>
              <button onClick={() => setActiveTab("content")} className="text-label-sm text-primary hover:underline font-normal">إدارة المحتوى ←</button>
            </h3>

            {approvedContent.length > 0 ? (
              <div className="flex flex-col gap-3">
                {approvedContent.slice(0, 4).map((c) => (
                  <div key={c.id} className="flex justify-between items-center p-3 bg-surface-container rounded-xl border border-outline-variant/10">
                    <div>
                      <h4 className="text-body-md text-on-surface font-medium mb-1">{c.title}</h4>
                      <p className="text-[12px] text-on-surface-variant">المادة: {getSubjectTitle(c.subject)}</p>
                    </div>
                    {getContentTypeBadge(c.contentType)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center gap-3 opacity-60">
                <HardDrive className="w-10 h-10 text-on-surface-variant mb-1" />
                <p className="text-body-md text-on-surface-variant">لم يتم نشر محتوى مخصص بعد.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === "users" && (
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 flex flex-col gap-4 overflow-x-auto">
          <h3 className="text-headline-md font-headline-md text-on-surface mb-2">قائمة وأسماء الطلاب المسجلين</h3>
          <table className="w-full text-right border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-outline-variant/20 text-label-sm text-on-surface-variant">
                <th className="py-3 px-4">اسم الطالب</th>
                <th className="py-3 px-4">البريد الإلكتروني</th>
                <th className="py-3 px-4">تاريخ الانضمام</th>
                <th className="py-3 px-4">عدد الزيارات</th>
                <th className="py-3 px-4">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 text-body-md">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-surface-container/50 transition-colors">
                  <td className="py-4 px-4 font-medium text-on-surface flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-primary" />
                    <span>{u.name}</span>
                  </td>
                  <td className="py-4 px-4 text-on-surface-variant font-mono text-xs" dir="ltr">{u.email}</td>
                  <td className="py-4 px-4 text-on-surface-variant">{u.joinDate}</td>
                  <td className="py-4 px-4 text-on-surface">{u.visitCount} زيارة</td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-label-sm ${u.status === "نشط" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"}`}>
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CONTENT MANAGEMENT TAB */}
      {activeTab === "content" && (
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 flex flex-col gap-4 overflow-x-auto">
          <div className="flex justify-between items-center flex-wrap gap-4 mb-2">
            <div>
              <h3 className="text-headline-md font-headline-md text-on-surface">جدول المحتوى المنشور والمفعل</h3>
              <p className="text-label-sm text-on-surface-variant">الكتب عبر Google Drive، الفيديوهات عبر URL، والفلاش كارد عبر التحميل المباشر.</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-primary text-on-primary hover:bg-primary/90 px-4 py-2 rounded-lg text-label-sm font-medium flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة محتوى</span>
            </button>
          </div>

          {approvedContent.length > 0 ? (
            <table className="w-full text-right border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-outline-variant/20 text-label-sm text-on-surface-variant">
                  <th className="py-3 px-4">العنوان</th>
                  <th className="py-3 px-4">المادة</th>
                  <th className="py-3 px-4">نوع المحتوى والرابط</th>
                  <th className="py-3 px-4">الرابط المباشر</th>
                  <th className="py-3 px-4 text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-body-md">
                {approvedContent.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-container/50 transition-colors">
                    <td className="py-4 px-4 font-medium text-on-surface">{c.title}</td>
                    <td className="py-4 px-4 text-on-surface-variant">{getSubjectTitle(c.subject)}</td>
                    <td className="py-4 px-4">{getContentTypeBadge(c.contentType)}</td>
                    <td className="py-4 px-4 text-xs font-mono text-primary max-w-[200px] truncate" dir="ltr">
                      <a href={c.linkUrl} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="truncate">{c.linkUrl}</span>
                      </a>
                    </td>
                    <td className="py-4 px-4 text-left">
                      <button
                        onClick={() => handleDeleteContent(c.id)}
                        className="text-error hover:bg-error/10 p-2 rounded-lg transition-colors cursor-pointer"
                        title="حذف المحتوى"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-3 border border-dashed border-outline-variant/30 rounded-xl">
              <HardDrive className="w-12 h-12 text-primary/40 mb-1" />
              <h4 className="text-headline-md text-on-surface">لا يوجد محتوى منشور حالياً</h4>
            </div>
          )}
        </div>
      )}

      {/* Global Add Content Modal */}
      <AddContentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadContent}
      />
    </div>
  );
}
