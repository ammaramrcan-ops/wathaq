import React, { useState, useEffect, FormEvent } from "react";
import {
  subscribeDailyTips,
  addDailyTip,
  deleteDailyTip,
  DailyTipItem
} from "@/lib/dailyTipsService";
import {
  Lightbulb,
  Plus,
  Trash2,
  Sparkles,
  Search,
  BookOpen
} from "lucide-react";

export function AdminDailyTipsTab() {
  const [tips, setTips] = useState<DailyTipItem[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("تنظيم الوقت والإنتاجية");
  const [author, setAuthor] = useState("منصة وثاق 💡");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsub = subscribeDailyTips((list) => setTips(list));
    return () => unsub();
  }, []);

  const filteredTips = tips.filter((t) =>
    t.content.includes(search) || (t.category && t.category.includes(search))
  );

  const handleAddTip = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const newTip: DailyTipItem = {
        id: "tip-" + Date.now(),
        content: content.trim(),
        category: category.trim() || "عام",
        author: author.trim() || "منصة وثاق 💡",
        createdAt: new Date().toLocaleDateString("ar-SA")
      };

      await addDailyTip(newTip);
      setContent("");
      setIsModalOpen(false);
    } catch (err: unknown) {
      console.error("Error adding daily tip:", err);
      alert("حدث خطأ أثناء إضافة النصيحة.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("هل أنت تأكد من رغبتك في حذف هذه النصيحة من بنك نصائح اليوم؟")) {
      setTips((prev) => prev.filter((t) => t.id !== id));
      await deleteDailyTip(id);
    }
  };

  return (
    <div className="bg-surface-container-low border border-outline-variant/30 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 text-right shadow-xl">
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-outline-variant/10 pb-4">
        <div>
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-xs font-bold w-fit mb-2">
            <Lightbulb className="w-4 h-4" />
            <span>بنك نصائح اليوم المتغيرة 💡 ({tips.length} نصيحة)</span>
          </div>
          <h3 className="text-headline-md font-bold text-on-surface">إدارة نصائح اليوم في الرئيسية</h3>
          <p className="text-body-md text-on-surface-variant font-light mt-1">
            إضافة وتعديل وحذف النصائح والإرشادات اليومية التي تظهر للطلاب في الصفحة الرئيسية وتتغير تلقائياً كل يوم.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-400 text-slate-950 hover:bg-amber-300 px-5 py-3 rounded-2xl font-bold text-label-sm flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>إضافة نصيحة جديدة 💡</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-5 h-5 absolute right-4 top-3.5 text-on-surface-variant/50" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث في نصائح اليوم بكلمة..."
          className="w-full bg-surface-container border border-outline-variant/40 rounded-2xl pr-12 pl-4 py-3 text-body-md text-on-surface focus:outline-none focus:border-amber-400"
        />
      </div>

      {/* Tips List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTips.slice(0, 50).map((t, idx) => (
          <div
            key={t.id}
            className="bg-surface-container p-5 rounded-2xl border border-outline-variant/20 flex flex-col justify-between gap-3 hover:border-amber-400/40 transition-all shadow-sm"
          >
            <div className="flex justify-between items-start gap-2">
              <span className="text-[11px] bg-amber-500/10 text-amber-400 font-bold px-2.5 py-0.5 rounded-md">
                {t.category || "نصيحة عامة"} #{idx + 1}
              </span>

              <button
                onClick={() => handleDelete(t.id)}
                className="text-error hover:bg-error/10 p-1.5 rounded-lg transition-colors cursor-pointer"
                title="حذف هذه النصيحة"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <p className="text-body-md text-on-surface font-medium leading-relaxed">
              "{t.content}"
            </p>

            {t.author && (
              <span className="text-xs text-on-surface-variant/70 font-light border-t border-outline-variant/10 pt-2">
                المصدر: {t.author}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="bg-surface-container border border-outline-variant/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-right flex flex-col gap-4">
            <h4 className="text-headline-md font-bold text-on-surface border-b border-outline-variant/10 pb-3">
              إضافة نصيحة يومية جديدة 💡
            </h4>

            <form onSubmit={handleAddTip} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface">محتوى النصيحة:</label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="اكتب حكمة أو نصيحة دراسية مشجعة للطلاب..."
                  className="bg-surface-container-high border border-outline-variant/40 rounded-xl p-3 text-body-md text-on-surface focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface">التصنيف:</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="مثال: تنظيم الوقت، التركيز، الجانب الإيماني..."
                  className="bg-surface-container-high border border-outline-variant/40 rounded-xl p-3 text-body-md text-on-surface"
                />
              </div>

              <div className="flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-outline-variant/30 text-on-surface-variant font-bold text-xs cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-amber-400 text-slate-950 px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg cursor-pointer"
                >
                  حفظ النصيحة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
