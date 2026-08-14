import { db } from "./firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";

export interface VisitAnalytics {
  totalVisits: number;
  dailyVisits: number;
  weeklyVisits: number;
  recurringVisits: number;
  uniqueVisitorsCount: number;
  repeatVisitorRate: number; // percentage (e.g., 65.5)
  lastVisitTimestamp: string;
}

const LOCAL_STORAGE_VISITS = "wathaq_visit_analytics";
const LOCAL_STORAGE_VISITOR_ID = "wathaq_visitor_id";
const LOCAL_STORAGE_VISITOR_COUNT = "wathaq_visitor_count";

function getTodayKey(): string {
  const d = new Date();
  return d.toISOString().split("T")[0]; // YYYY-MM-DD
}

function getWeekKey(): string {
  const d = new Date();
  const year = d.getFullYear();
  // Simple week calculation
  const firstJan = new Date(year, 0, 1);
  const dayOfYear = Math.floor((d.getTime() - firstJan.getTime()) / 86400000);
  const weekNum = Math.ceil((dayOfYear + firstJan.getDay() + 1) / 7);
  return `${year}-W${weekNum}`;
}

export function getLocalVisitsAnalytics(): VisitAnalytics {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_VISITS);
    if (saved) return JSON.parse(saved);
  } catch {}

  return {
    totalVisits: 1,
    dailyVisits: 1,
    weeklyVisits: 1,
    recurringVisits: 0,
    uniqueVisitorsCount: 1,
    repeatVisitorRate: 0,
    lastVisitTimestamp: new Date().toLocaleTimeString("ar-SA")
  };
}

/**
 * Track a page visit automatically
 */
export async function trackVisit(): Promise<VisitAnalytics> {
  let visitorId = "";
  let isRecurring = false;
  let visitorCount = 1;

  try {
    const storedId = localStorage.getItem(LOCAL_STORAGE_VISITOR_ID);
    if (storedId) {
      visitorId = storedId;
      const countStr = localStorage.getItem(LOCAL_STORAGE_VISITOR_COUNT) || "1";
      visitorCount = parseInt(countStr, 10) + 1;
      localStorage.setItem(LOCAL_STORAGE_VISITOR_COUNT, visitorCount.toString());
      isRecurring = true;
    } else {
      visitorId = "v-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);
      localStorage.setItem(LOCAL_STORAGE_VISITOR_ID, visitorId);
      localStorage.setItem(LOCAL_STORAGE_VISITOR_COUNT, "1");
      isRecurring = false;
    }
  } catch {}

  const current = getLocalVisitsAnalytics();
  const todayKey = getTodayKey();
  const weekKey = getWeekKey();

  // Load dates map
  let dailyMap: Record<string, number> = {};
  let weeklyMap: Record<string, number> = {};
  let uniqueVisitorsSet = new Set<string>();

  try {
    const savedDaily = localStorage.getItem("wathaq_daily_visits");
    if (savedDaily) dailyMap = JSON.parse(savedDaily);

    const savedWeekly = localStorage.getItem("wathaq_weekly_visits");
    if (savedWeekly) weeklyMap = JSON.parse(savedWeekly);

    const savedUnique = localStorage.getItem("wathaq_unique_visitors");
    if (savedUnique) uniqueVisitorsSet = new Set(JSON.parse(savedUnique));
  } catch {}

  // Update counts
  dailyMap[todayKey] = (dailyMap[todayKey] || 0) + 1;
  weeklyMap[weekKey] = (weeklyMap[weekKey] || 0) + 1;
  uniqueVisitorsSet.add(visitorId);

  const totalVisits = (current.totalVisits || 0) + 1;
  const recurringVisits = (current.recurringVisits || 0) + (isRecurring ? 1 : 0);
  const uniqueVisitorsCount = uniqueVisitorsSet.size;
  const repeatVisitorRate = totalVisits > 0 ? Math.round((recurringVisits / totalVisits) * 100) : 0;

  const updatedAnalytics: VisitAnalytics = {
    totalVisits,
    dailyVisits: dailyMap[todayKey],
    weeklyVisits: weeklyMap[weekKey],
    recurringVisits,
    uniqueVisitorsCount,
    repeatVisitorRate,
    lastVisitTimestamp: new Date().toLocaleTimeString("ar-SA")
  };

  // Save locally
  try {
    localStorage.setItem(LOCAL_STORAGE_VISITS, JSON.stringify(updatedAnalytics));
    localStorage.setItem("wathaq_daily_visits", JSON.stringify(dailyMap));
    localStorage.setItem("wathaq_weekly_visits", JSON.stringify(weeklyMap));
    localStorage.setItem("wathaq_unique_visitors", JSON.stringify(Array.from(uniqueVisitorsSet)));
  } catch {}

  // Save to Cloud Firestore
  try {
    const analyticsDocRef = doc(db, "analytics_summary", "general");
    await setDoc(analyticsDocRef, updatedAnalytics, { merge: true });
  } catch (err) {}

  return updatedAnalytics;
}

/**
 * Subscribe to visit analytics snapshot
 */
export function subscribeVisitsAnalytics(onUpdate: (analytics: VisitAnalytics) => void): () => void {
  onUpdate(getLocalVisitsAnalytics());

  let unsub: (() => void) | null = null;
  try {
    const analyticsDocRef = doc(db, "analytics_summary", "general");
    unsub = onSnapshot(
      analyticsDocRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as VisitAnalytics;
          onUpdate(data);
        }
      },
      (err) => console.warn("Visits snapshot warning:", err)
    );
  } catch (err) {}

  return () => {
    if (unsub) unsub();
  };
}
