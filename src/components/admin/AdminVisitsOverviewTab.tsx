import React, { useEffect, useState } from "react";
import { 
  Eye, Calendar, Activity, Repeat, Users, TrendingUp, Sparkles, RefreshCw, HardDrive, Clock 
} from "lucide-react";
import { subscribeVisitsAnalytics, VisitAnalytics } from "@/lib/visitService";

interface AdminVisitsOverviewTabProps {
  approvedCount: number;
  pendingCount: number;
}

export function AdminVisitsOverviewTab({ approvedCount, pendingCount }: AdminVisitsOverviewTabProps) {
  const [analytics, setAnalytics] = useState<VisitAnalytics>({
    totalVisits: 0,
    dailyVisits: 0,
    weeklyVisits: 0,
    recurringVisits: 0,
    uniqueVisitorsCount: 0,
    repeatVisitorRate: 0,
    lastVisitTimestamp: ""
  });

  useEffect(() => {
    const unsub = subscribeVisitsAnalytics((data) => {
      setAnalytics(data);
    });
    return () => unsub();
  }, []);

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* Top Metrics Banner */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-3xl p-6 sm:p-8 flex justify-between items-center flex-wrap gap-4 shadow-xl">
        <div>
          <h3 className="text-headline-md font-bold text-on-surface flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            <span>نظرة عامة وإحصائيات الزيارات التفصيلية 📊</span>
          </h3>
          <p className="text-label-sm text-on-surface-variant mt-1">
            متابعة حية للزيارات اليومية والأسبوعية وحساب نسبة الزوار المتكررين في منصة وثاق.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-4 py-2 rounded-2xl text-xs font-bold">
          <Sparkles className="w-4 h-4" />
          <span>آخر تحديث: {analytics.lastVisitTimestamp || "الآن"}</span>
        </div>
      </div>

      {/* Grid of Key Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Visits */}
        <div className="bg-surface-container border border-outline-variant/30 hover:border-primary/50 rounded-2xl p-5 flex items-center gap-4 transition-all shadow-md">
          <div className="w-13 h-13 rounded-2xl bg-primary/10 border border-primary/30 text-primary flex items-center justify-center shrink-0">
            <Eye className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-1 overflow-hidden">
            <span className="text-xs text-on-surface-variant font-medium">إجمالي الزيارات</span>
            <h4 className="text-headline-md font-bold text-on-surface">{analytics.totalVisits} زيارة</h4>
            <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>متابعة نشطة</span>
            </span>
          </div>
        </div>

        {/* Daily Visits */}
        <div className="bg-surface-container border border-outline-variant/30 hover:border-emerald-500/50 rounded-2xl p-5 flex items-center gap-4 transition-all shadow-md">
          <div className="w-13 h-13 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-1 overflow-hidden">
            <span className="text-xs text-on-surface-variant font-medium">زيارات اليوم (Daily)</span>
            <h4 className="text-headline-md font-bold text-emerald-400">{analytics.dailyVisits} زيارة</h4>
            <span className="text-[11px] text-on-surface-variant">اليوم الحالي</span>
          </div>
        </div>

        {/* Weekly Visits */}
        <div className="bg-surface-container border border-outline-variant/30 hover:border-purple-500/50 rounded-2xl p-5 flex items-center gap-4 transition-all shadow-md">
          <div className="w-13 h-13 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-1 overflow-hidden">
            <span className="text-xs text-on-surface-variant font-medium">زيارات الأسبوع (Weekly)</span>
            <h4 className="text-headline-md font-bold text-purple-400">{analytics.weeklyVisits} زيارة</h4>
            <span className="text-[11px] text-on-surface-variant">خلال هذا الأسبوع</span>
          </div>
        </div>

        {/* Recurring Visits & Rate */}
        <div className="bg-surface-container border border-outline-variant/30 hover:border-amber-500/50 rounded-2xl p-5 flex items-center gap-4 transition-all shadow-md">
          <div className="w-13 h-13 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <Repeat className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-1 overflow-hidden">
            <span className="text-xs text-on-surface-variant font-medium">الزيارات المتكررة</span>
            <h4 className="text-headline-md font-bold text-amber-400">{analytics.recurringVisits} زيارة</h4>
            <span className="text-[11px] text-amber-400 font-bold">
              نسبة العودة: {analytics.repeatVisitorRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Quick Overview Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-medium">الزوار الفريدون (Unique)</p>
              <h5 className="text-headline-sm font-bold text-on-surface">{analytics.uniqueVisitorsCount} متصفح فريد</h5>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-medium">المحتوى المنشور والمعتمد</p>
              <h5 className="text-headline-sm font-bold text-on-surface">{approvedCount} عناصر</h5>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-medium">طلبات المراجعة المعلقة</p>
              <h5 className="text-headline-sm font-bold text-on-surface">{pendingCount} طلبات</h5>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
