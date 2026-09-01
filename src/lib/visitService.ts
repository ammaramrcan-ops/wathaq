import { db } from "./firebase";
import { doc, setDoc, getDoc, onSnapshot, increment } from "firebase/firestore";

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
const LOCAL_STORAGE_SESSION_TIME = "wathaq_last_session_time";
const LOCAL_STORAGE_VISIT_DATE = "wathaq_last_visit_date";
const SESSION_THROTTLE_MS = 15 * 60 * 1000; // 15 minutes session throttle window

// IndexedDB helper for visit analytics durable storage
const IDB_NAME = "wathaq_durable_storage";
const IDB_VISITS_STORE = "visits_analytics_store";

function openIDBVisits(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) return reject("No IndexedDB");
    const req = window.indexedDB.open(IDB_NAME, 4);
    req.onupgradeneeded = (e: IDBVersionChangeEvent) => {
      const idb = req.result;
      if (!idb.objectStoreNames.contains(IDB_VISITS_STORE)) {
        idb.createObjectStore(IDB_VISITS_STORE, { keyPath: "key" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveIDBAnalytics(data: VisitAnalytics): Promise<void> {
  try {
    const idb = await openIDBVisits();
    const tx = idb.transaction(IDB_VISITS_STORE, "readwrite");
    tx.objectStore(IDB_VISITS_STORE).put({ key: "general_analytics", ...data });
  } catch (e) {
    // empty
  }
}

async function loadIDBAnalytics(): Promise<VisitAnalytics | null> {
  try {
    const idb = await openIDBVisits();
    return new Promise((resolve) => {
      const tx = idb.transaction(IDB_VISITS_STORE, "readonly");
      const req = tx.objectStore(IDB_VISITS_STORE).get("general_analytics");
      req.onsuccess = () => resolve(req.result ? (req.result as VisitAnalytics) : null);
      req.onerror = () => resolve(null);
    });
  } catch (e) {
    return null;
  }
}

async function saveIDBVisitorId(id: string): Promise<void> {
  try {
    const idb = await openIDBVisits();
    const tx = idb.transaction(IDB_VISITS_STORE, "readwrite");
    tx.objectStore(IDB_VISITS_STORE).put({ key: "visitor_id", id });
  } catch (e) {
    // empty
  }
}

async function loadIDBVisitorId(): Promise<string | null> {
  try {
    const idb = await openIDBVisits();
    return new Promise((resolve) => {
      const tx = idb.transaction(IDB_VISITS_STORE, "readonly");
      const req = tx.objectStore(IDB_VISITS_STORE).get("visitor_id");
      req.onsuccess = () => resolve(req.result ? req.result.id : null);
      req.onerror = () => resolve(null);
    });
  } catch (e) {
    return null;
  }
}

export function getLocalVisitsAnalytics(): VisitAnalytics {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_VISITS);
    if (saved) return JSON.parse(saved);
  } catch {
    // empty
  }

  return {
    totalVisits: 7,
    dailyVisits: 1,
    weeklyVisits: 7,
    recurringVisits: 0,
    uniqueVisitorsCount: 7,
    repeatVisitorRate: 0,
    lastVisitTimestamp: new Date().toLocaleTimeString("ar-SA")
  };
}

/**
 * Reset visits analytics in Cloud Firestore, LocalStorage & IndexedDB to a clean baseline (e.g. 7 visits)
 */
export async function resetVisitsAnalytics(newTotal: number = 7): Promise<VisitAnalytics> {
  const todayDate = new Date().toISOString().split("T")[0];
  const resetData: VisitAnalytics = {
    totalVisits: newTotal,
    dailyVisits: 1,
    weeklyVisits: newTotal,
    recurringVisits: 0,
    uniqueVisitorsCount: newTotal,
    repeatVisitorRate: 0,
    lastVisitTimestamp: new Date().toLocaleTimeString("ar-SA")
  };

  try {
    localStorage.setItem(LOCAL_STORAGE_VISITS, JSON.stringify(resetData));
    await saveIDBAnalytics(resetData);
  } catch (e) {
    // empty
  }

  try {
    const analyticsDocRef = doc(db, "analytics_summary", "general");
    await setDoc(
      analyticsDocRef,
      {
        totalVisits: newTotal,
        dailyVisits: 1,
        weeklyVisits: newTotal,
        recurringVisits: 0,
        uniqueVisitorsCount: newTotal,
        repeatVisitorRate: 0,
        lastDate: todayDate,
        lastVisitTimestamp: resetData.lastVisitTimestamp
      },
      { merge: false } // Overwrite inflated numbers
    );
  } catch (err) {
    console.warn("Firestore reset analytics warning:", err);
  }

  return resetData;
}

/**
 * Track a page visit accurately:
 * - Session Throttled (15 mins)
 * - Recurring visits do NOT increment totalVisits
 */
export async function trackVisit(): Promise<VisitAnalytics> {
  const now = Date.now();
  const todayDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  // 1. Session Throttling: If navigating within active 15-minute session, skip double-counting
  try {
    const lastSession = localStorage.getItem(LOCAL_STORAGE_SESSION_TIME);
    if (lastSession) {
      const elapsed = now - parseInt(lastSession, 10);
      if (elapsed < SESSION_THROTTLE_MS) {
        return getLocalVisitsAnalytics();
      }
    }
  } catch {
    // empty
  }

  // Update session timestamp & date
  try {
    localStorage.setItem(LOCAL_STORAGE_SESSION_TIME, now.toString());
    localStorage.setItem(LOCAL_STORAGE_VISIT_DATE, todayDate);
  } catch {
    // empty
  }

  let visitorId = "";
  let isRecurring = false;

  try {
    const storedId = localStorage.getItem(LOCAL_STORAGE_VISITOR_ID);
    if (storedId) {
      visitorId = storedId;
      isRecurring = true;
    } else {
      const idbId = await loadIDBVisitorId();
      if (idbId) {
        visitorId = idbId;
        isRecurring = true;
        localStorage.setItem(LOCAL_STORAGE_VISITOR_ID, visitorId);
      } else {
        visitorId = `v-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        localStorage.setItem(LOCAL_STORAGE_VISITOR_ID, visitorId);
        await saveIDBVisitorId(visitorId);
        isRecurring = false;
      }
    }
  } catch {
    // empty
  }

  // Atomically update metrics in Cloud Firestore
  try {
    const analyticsDocRef = doc(db, "analytics_summary", "general");
    
    const currentSnap = await getDoc(analyticsDocRef);
    let prevTotal = 7;
    let prevRecurring = 0;
    let prevUnique = 7;
    let prevDaily = 1;
    let storedCloudDate = "";

    if (currentSnap.exists()) {
      const data = currentSnap.data();
      prevTotal = data.totalVisits || 7;
      prevRecurring = data.recurringVisits || 0;
      prevUnique = data.uniqueVisitorsCount || 7;
      storedCloudDate = data.lastDate || "";
      prevDaily = storedCloudDate === todayDate ? (data.dailyVisits || 1) : 1;
    }

    // Do NOT increment totalVisits for recurring visits
    const newTotal = isRecurring ? prevTotal : prevTotal + 1;
    const newRecurring = prevRecurring + (isRecurring ? 1 : 0);
    const newUnique = isRecurring ? prevUnique : prevUnique + 1;
    const newDaily = isRecurring ? prevDaily : (prevDaily + 1);
    const repeatVisitorRate = newTotal > 0 ? Math.round((newRecurring / newTotal) * 100) : 0;

    const updatedAnalytics: VisitAnalytics = {
      totalVisits: newTotal,
      dailyVisits: newDaily,
      weeklyVisits: newTotal,
      recurringVisits: newRecurring,
      uniqueVisitorsCount: newUnique,
      repeatVisitorRate,
      lastVisitTimestamp: new Date().toLocaleTimeString("ar-SA")
    };

    // Atomic cloud update
    await setDoc(
      analyticsDocRef,
      {
        totalVisits: isRecurring ? increment(0) : increment(1),
        dailyVisits: storedCloudDate === todayDate ? (isRecurring ? increment(0) : increment(1)) : 1,
        weeklyVisits: isRecurring ? increment(0) : increment(1),
        recurringVisits: increment(isRecurring ? 1 : 0),
        uniqueVisitorsCount: isRecurring ? increment(0) : increment(1),
        repeatVisitorRate,
        lastDate: todayDate,
        lastVisitTimestamp: updatedAnalytics.lastVisitTimestamp
      },
      { merge: true }
    );

    // Save to LocalStorage & IndexedDB durable backup
    try {
      localStorage.setItem(LOCAL_STORAGE_VISITS, JSON.stringify(updatedAnalytics));
      await saveIDBAnalytics(updatedAnalytics);
    } catch {
      // empty
    }

    return updatedAnalytics;
  } catch (err) {
    console.warn("Firestore trackVisit cloud write warning:", err);
  }

  // Fallback to IndexedDB or LocalStorage if offline
  const idbAnalytics = await loadIDBAnalytics();
  if (idbAnalytics) {
    try {
      localStorage.setItem(LOCAL_STORAGE_VISITS, JSON.stringify(idbAnalytics));
    } catch {
      // empty
    }
    return idbAnalytics;
  }

  return getLocalVisitsAnalytics();
}

/**
 * Subscribe to visit analytics snapshot from Cloud Firestore & IndexedDB
 */
export function subscribeVisitsAnalytics(onUpdate: (analytics: VisitAnalytics) => void): () => void {
  onUpdate(getLocalVisitsAnalytics());

  loadIDBAnalytics().then((idbAnalytics) => {
    if (idbAnalytics) {
      try {
        localStorage.setItem(LOCAL_STORAGE_VISITS, JSON.stringify(idbAnalytics));
      } catch {
        // empty
      }
      onUpdate(idbAnalytics);
    }
  });

  let unsub: (() => void) | null = null;
  try {
    const analyticsDocRef = doc(db, "analytics_summary", "general");
    unsub = onSnapshot(
      analyticsDocRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as VisitAnalytics;
          const totalVisits = data.totalVisits || 7;
          const recurringVisits = data.recurringVisits || 0;
          const repeatVisitorRate = totalVisits > 0 ? Math.round((recurringVisits / totalVisits) * 100) : 0;

          const updated: VisitAnalytics = {
            ...data,
            repeatVisitorRate
          };

          try {
            localStorage.setItem(LOCAL_STORAGE_VISITS, JSON.stringify(updated));
            saveIDBAnalytics(updated);
          } catch {
            // intentionally left empty
          }
          onUpdate(updated);
        }
      },
      (err) => console.warn("Visits snapshot warning:", err)
    );
  } catch (err) {
    // empty
  }

  return () => {
    if (unsub) unsub();
  };
}
