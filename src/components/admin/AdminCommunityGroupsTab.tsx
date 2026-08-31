import React, { useState, useEffect, FormEvent } from "react";
import { 
  subscribeCommunityGroups, addCommunityGroup, deleteCommunityGroup, CommunityGroupItem 
} from "@/lib/communityGroupsService";
import { 
  Users, Plus, Trash2, Globe, MessageSquare, Send, ExternalLink, ShieldCheck 
} from "lucide-react";

export function AdminCommunityGroupsTab() {
  const [groups, setGroups] = useState<CommunityGroupItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState<"telegram" | "whatsapp" | "facebook" | "discord" | "other">("telegram");
  const [linkUrl, setLinkUrl] = useState("");
  const [description, setDescription] = useState("");
  const [membersCount, setMembersCount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsub = subscribeCommunityGroups((list) => setGroups(list));
    return () => unsub();
  }, []);

  const handleAddGroup = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !linkUrl.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const newGroup: CommunityGroupItem = {
        id: "g-" + Date.now(),
        title: title.trim(),
        platform,
        linkUrl: linkUrl.trim(),
        description: description.trim() || "جروب وقناة دراسية موصى بها للطلاب.",
        membersCount: membersCount.trim() || undefined
      };

      await addCommunityGroup(newGroup);
      setTitle("");
      setLinkUrl("");
      setDescription("");
      setMembersCount("");
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("هل أنت تأكد من رغبتك في حذف هذا الجروب الموصى به؟")) {
      await deleteCommunityGroup(id);
    }
  };

  return (
    <div className="bg-surface-container-low border border-outline-variant/30 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 text-right shadow-xl">
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-outline-variant/10 pb-4">
        <div>
          <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold w-fit mb-2">
            <MessageSquare className="w-4 h-4" />
            <span>إدارة جروبات ومجتمعات الطلاب 💬</span>
          </div>
          <h3 className="text-headline-md font-bold text-on-surface">إدارة قنوات وتجمعات التليجرام والواتساب الموصى بها</h3>
          <p className="text-body-md text-on-surface-variant font-light mt-1">
            إضافة أو حذف الجروبات الدراسية والتجمعات الأكاديمية التي تظهر في صفحة المجتمع للمستخدمين.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-on-primary hover:bg-primary/90 px-5 py-3 rounded-2xl font-bold text-label-sm flex items-center gap-2 transition-all shadow-lg shadow-primary/20 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>إضافة جروب أو قناة جديدة ➕</span>
        </button>
      </div>

      {/* Groups Grid */}
      {groups.length === 0 ? (
        <div className="p-12 text-center bg-surface-container rounded-3xl border border-outline-variant/20 text-on-surface-variant flex flex-col items-center gap-3">
          <MessageSquare className="w-12 h-12 text-on-surface-variant/40" />
          <h4 className="text-headline-md font-bold text-on-surface">لا توجد جروبات أو قنوات مضافة حالياً 💬</h4>
          <p className="text-body-md text-on-surface-variant font-light">
            جميع البيانات ديناميكية وسحابية 100%. يمكنك إضافة أي جروب تليجرام أو واتساب الآن عبر زر الإضافة أعلاه.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-2 bg-primary text-on-primary hover:bg-primary/90 px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة أول جروب الآن</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map((group) => (
            <div
              key={group.id}
              className="bg-surface-container p-5 rounded-2xl border border-outline-variant/20 flex flex-col justify-between gap-4 hover:border-primary/40 transition-all shadow-md"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold border ${
                    group.platform === "telegram"
                      ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  }`}>
                    {group.platform === "telegram" ? <Send className="w-6 h-6 text-blue-400" /> : <MessageSquare className="w-6 h-6 text-emerald-400" />}
                  </div>

                  <div>
                    <h4 className="text-body-lg font-bold text-on-surface">{group.title}</h4>
                    <span className="text-xs text-on-surface-variant font-medium">
                      منصة: {group.platform === "telegram" ? "تليجرام 📡" : "واتساب 💬"} {group.membersCount ? `• ${group.membersCount}` : ""}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(group.id)}
                  className="text-error hover:bg-error/10 p-2 rounded-xl transition-colors cursor-pointer"
                  title="حذف هذا الجروب"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-on-surface-variant font-light bg-surface-container-high p-3 rounded-xl leading-relaxed">
                "{group.description}"
              </p>

              <div className="pt-2 border-t border-outline-variant/10">
                <a
                  href={group.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5"
                >
                  <span>فتح رابط الانضمام للجروب</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Group Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="bg-surface-container border border-outline-variant/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-right flex flex-col gap-4">
            <h4 className="text-headline-md font-bold text-on-surface border-b border-outline-variant/10 pb-3">
              إضافة جروب أو قناة موصى بها
            </h4>

            <form onSubmit={handleAddGroup} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface">اسم الجروب أو القناة:</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: قناة تليجرام فيزياء الأزهر"
                  className="bg-surface-container-high border border-outline-variant/40 rounded-xl p-3 text-body-md text-on-surface"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface">منصة الجروب:</label>
                <select
                  value={platform}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPlatform(e.target.value)}
                  className="bg-surface-container-high border border-outline-variant/40 rounded-xl p-3 text-body-md text-on-surface font-bold"
                >
                  <option value="telegram">تليجرام 📡</option>
                  <option value="whatsapp">واتساب 💬</option>
                  <option value="facebook">فيسبوك 🌐</option>
                  <option value="other">منصة أخرى</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface">رابط الانضمام (URL):</label>
                <input
                  type="url"
                  required
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://t.me/..."
                  className="bg-surface-container-high border border-outline-variant/40 rounded-xl p-3 text-body-md text-on-surface"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface">وصف الجروب وما يقدمه:</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="وصف مختصر للجروب والفوائد التي يحصل عليها الطالب..."
                  className="bg-surface-container-high border border-outline-variant/40 rounded-xl p-3 text-body-md text-on-surface"
                />
              </div>

              <div className="flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-outline-variant/30 text-on-surface-variant font-bold text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg"
                >
                  حفظ الجروب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
