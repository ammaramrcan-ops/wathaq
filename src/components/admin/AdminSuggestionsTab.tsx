import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Lightbulb, Trash2, CheckCircle2, User, Clock, MessageSquare, AlertCircle } from "lucide-react";
import { 
  subscribeSuggestions, 
  deleteSuggestion, 
  SuggestionItem 
} from "@/lib/suggestionService";

export function AdminSuggestionsTab() {
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeSuggestions((list) => {
      setSuggestions(list);
    });
    return () => unsub();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("هل أنت تأكد من رغبتك في حذف هذا الاقتراح؟")) return;
    setDeletingId(id);
    try {
      await deleteSuggestion(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Tab Header Banner */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-3xl p-6 flex justify-between items-center flex-wrap gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Lightbulb className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-headline-md font-bold text-on-surface">سجل واقتراحات تحسين المنصة</h2>
            <p className="text-body-md text-on-surface-variant font-light mt-1">
              مراجعة ومتابعة الاقتراحات والملاحظات الواردة من الطلاب لمطورة المنصة.
            </p>
          </div>
        </div>

        <div className="bg-surface-container border border-outline-variant/30 px-4 py-2 rounded-xl text-label-sm font-bold text-primary flex items-center gap-2">
          <span>إجمالي الاقتراحات: {suggestions.length}</span>
        </div>
      </div>

      {/* Suggestions List */}
      {suggestions.length === 0 ? (
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-3xl p-12 text-center flex flex-col items-center gap-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-400/50" />
          <h3 className="text-headline-sm font-bold text-on-surface">لا توجد اقتراحات حالية</h3>
          <p className="text-body-md text-on-surface-variant font-light">لم يرسل الطلاب أي اقتراحات جديدة بعد.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestions.map((sug) => (
            <motion.div
              key={sug.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface-container-low border border-outline-variant/30 hover:border-amber-400/40 rounded-2xl p-6 flex flex-col justify-between gap-4 shadow-lg relative"
            >
              <div>
                <div className="flex justify-between items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 flex items-center gap-1">
                    <Lightbulb className="w-3.5 h-3.5" /> اقتراح طالب
                  </span>
                  <span className="text-xs text-on-surface-variant/70 font-mono" dir="ltr">
                    {new Date(sug.createdAt).toLocaleDateString("ar-EG")}
                  </span>
                </div>

                <h3 className="text-headline-sm font-bold text-on-surface mb-2">{sug.title}</h3>
                <p className="text-body-md text-on-surface-variant font-light leading-relaxed whitespace-pre-wrap">
                  {sug.details}
                </p>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-outline-variant/10 text-xs text-on-surface-variant">
                <div className="flex items-center gap-1.5 font-medium">
                  <User className="w-4 h-4 text-primary" />
                  <span>{sug.userName}</span>
                  {sug.userEmail && <span className="font-mono text-on-surface-variant/60">({sug.userEmail})</span>}
                </div>

                <button
                  onClick={() => handleDelete(sug.id)}
                  disabled={deletingId === sug.id}
                  className="p-2 rounded-xl text-on-surface-variant hover:text-error bg-surface-container-high hover:bg-error/10 border border-outline-variant/20 transition-all cursor-pointer"
                  title="حذف هذا الاقتراح"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
