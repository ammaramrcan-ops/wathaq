import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Users, UserCheck, Eye, RefreshCw, HardDrive, Video, Layers, 
  Trash2, ExternalLink, Plus, ShieldCheck, BarChart3, TrendingUp 
} from "lucide-react";
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
}

const mockUsers: AdminUser[] = [
  { id: "u1", name: "أحمد محمود", email: "ahmed@example.com", joinDate: "2026-08-10", visitCount: 14, status: "نشط" },
  { id: "u2", name: "سارة علي", email: "sara@example.com", joinDate: "2026-08-12", visitCount: 8, status: "نشط" },
  { id: "u3", name: "يوسف طارق", email: "youssef@example.com", joinDate: "2026-08-13", visitCount: 3, status: "جديد" },
  { id: "u4", name: "ريم حسن", email: "reem@example.com", joinDate: "2026-08-14", visitCount: 1, status: "جديد" }
];

export default function Admin() {
  const [users, setUsers] = useState<AdminUser[]>(mockUsers);
  const [contentList, setContentList] = useState<CustomContent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "content">("overview");

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
            <h1 className="text-display-ar font-display-ar text-on-surface">لوحة تحكم الأدمن والتحليلات</h1>
            <p className="text-body-md text-on-surface-variant">متابعة حسابات الطلاب والزيارات وإدارة محتوى Drive والفيديوهات والتحميل المباشر.</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-on-primary hover:bg-primary/90 px-5 py-3 rounded-xl text-body-md font-medium flex items-center gap-2 shadow-lg shadow-primary/10 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>إضافة محتوى جديد</span>
        </button>
      </div>

      {/* Tabs Selector */}
      <div className="flex gap-3 border-b border-outline-variant/10 pb-3">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-5 py-2.5 rounded-lg text-label-sm font-medium transition-all flex items-center gap-2 border ${
            activeTab === "overview"
              ? "bg-primary text-on-primary border-primary"
              : "bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:border-primary/50"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>نظرة عامة والزيارات</span>
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`px-5 py-2.5 rounded-lg text-label-sm font-medium transition-all flex items-center gap-2 border ${
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
          className={`px-5 py-2.5 rounded-lg text-label-sm font-medium transition-all flex items-center gap-2 border ${
            activeTab === "content"
              ? "bg-primary text-on-primary border-primary"
              : "bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:border-primary/50"
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>إدارة المحتوى المرفوع ({contentList.length})</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-stack-md">
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

        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 flex flex-col gap-2">
          <div className="flex justify-between items-center text-on-surface-variant">
            <span className="text-label-sm">إجمالي المشاهدات والتفاعل</span>
            <BarChart3 className="w-5 h-5 text-amber-400" />
          </div>
          <span className="text-headline-lg font-bold text-on-surface">{totalVisits * 12} مشاهدة</span>
          <span className="text-[12px] text-on-surface-variant/70">نشاط مرتفع وسلس</span>
        </div>
      </div>

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
              <span>أحدث المحتوى المرفوع</span>
              <button onClick={() => setActiveTab("content")} className="text-label-sm text-primary hover:underline font-normal">إدارة المحتوى ←</button>
            </h3>

            {contentList.length > 0 ? (
              <div className="flex flex-col gap-3">
                {contentList.slice(0, 4).map((c) => (
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
                <p className="text-body-md text-on-surface-variant">لم يتم إضافة محتوى مخصص بعد.</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-label-sm text-primary underline"
                >
                  اضغط هنا لإضافة رابط Drive أو فيديو أو فلاش كارد
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === "users" && (
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 flex flex-col gap-4 overflow-x-auto">
          <h3 className="text-headline-md font-headline-md text-on-surface mb-2">قائمة وأسماء الطلاب المسجلين</h3>
          <table className="w-full text-right border-collapse">
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
              <h3 className="text-headline-md font-headline-md text-on-surface">جدول المحتوى المرفوع والروابط</h3>
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

          {contentList.length > 0 ? (
            <table className="w-full text-right border-collapse">
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
                {contentList.map((c) => (
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
                        className="text-error hover:bg-error/10 p-2 rounded-lg transition-colors"
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
              <h4 className="text-headline-md text-on-surface">لا يوجد محتوى مخصص حالياً</h4>
              <p className="text-body-md text-on-surface-variant max-w-sm">
                يمكنك رفع أي كتاب برابط Google Drive أو فيديو برابط YouTube أو فلاش كارد برابط مباشر.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-2 bg-primary text-on-primary px-5 py-2.5 rounded-lg text-label-sm font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة أول محتوى الآن</span>
              </button>
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
