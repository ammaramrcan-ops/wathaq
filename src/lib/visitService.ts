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
const LOCAL_STORAGE_VISITOR_COUNT = "wathaq_visitor_count";

// IndexedDB helper for visit analytics durable storage
const IDB_NAME = "wathaq_durable_storage";
const IDB_VISITS_STORE = "visits_analytics_store";

function openIDBVisits(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) return reject("No IndexedDB");
    const req = window.indexedDB.open(IDB_NAME, 4);
    req.onupgradeneeded = (e: any) => {
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
  } catch (e) {}
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
  } catch (e) {}
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
 * Track a page visit automatically using Cloud Atomic Increments and Durable Backups
 */
export async function trackVisit(): Promise<VisitAnalytics> {
  let visitorId = "";
  let isRecurring = false;

  try {
    const storedId = localStorage.getItem(LOCAL_STORAGE_VISITOR_ID);
    if (storedId) {
      visitorId = storedId;
      isRecurring = true;
    } else {
      // Check durable IndexedDB backup for visitor ID before generating new one
      const idbId = await loadIDBVisitorId();
      if (idbId) {
        visitorId = idbId;
        isRecurring = true;
        localStorage.setItem(LOCAL_STORAGE_VISITOR_ID, visitorId);
      } else {
        visitorId = "v-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);
        localStorage.setItem(LOCAL_STORAGE_VISITOR_ID, visitorId);
        await saveIDBVisitorId(visitorId);
        isRecurring = false;
      }
    }
  } catch {}

  // Atomically increment metrics in Cloud Firestore
  try {
    const analyticsDocRef = doc(db, "analytics_summary", "general");
    
    // Read existing doc to calculate repeat rate accurately
    const currentSnap = await getDoc(analyticsDocRef);
    let prevTotal = 0;
    let prevRecurring = 0;
    let prevUnique = 0;

    if (currentSnap.exists()) {
      const data = currentSnap.data();
      prevTotal = data.totalVisits || 0;
      prevRecurring = data.recurringVisits || 0;
      prevUnique = data.uniqueVisitorsCount || 1;
    }

    const newTotal = prevTotal + 1;
    const newRecurring = prevRecurring + (isRecurring ? 1 : 0);
    const newUnique = isRecurring ? prevUnique : prevUnique + 1;
    const repeatVisitorRate = newTotal > 0 ? Math.round((newRecurring / newTotal) * 100) : 0;

    const updatedAnalytics: VisitAnalytics = {
      totalVisits: newTotal,
      dailyVisits: (currentSnap.data()?.dailyVisits || 0) + 1,
      weeklyVisits: (currentSnap.data()?.weeklyVisits || 0) + 1,
      recurringVisits: newRecurring,
      uniqueVisitorsCount: newUnique,
      repeatVisitorRate,
      lastVisitTimestamp: new Date().toLocaleTimeString("ar-SA")
    };

    // Atomic cloud update
    await setDoc(
      analyticsDocRef,
      {
        totalVisits: increment(1),
        dailyVisits: increment(1),
        weeklyVisits: increment(1),
        recurringVisits: increment(isRecurring ? 1 : 0),
        uniqueVisitorsCount: isRecurring ? increment(0) : increment(1),
        repeatVisitorRate,
        lastVisitTimestamp: updatedAnalytics.lastVisitTimestamp
      },
      { merge: true }
    );

    // Save to LocalStorage & IndexedDB durable backup
    try {
      localStorage.setItem(LOCAL_STORAGE_VISITS, JSON.stringify(updatedAnalytics));
      await saveIDBAnalytics(updatedAnalytics);
    } catch {}

    return updatedAnalytics;
  } catch (err) {
    console.warn("Firestore trackVisit cloud write warning:", err);
  }

  // Fallback to IndexedDB or LocalStorage if offline
  const idbAnalytics = await loadIDBAnalytics();
  if (idbAnalytics) {
    try {
      localStorage.setItem(LOCAL_STORAGE_VISITS, JSON.stringify(idbAnalytics));
    } catch {}
    return idbAnalytics;
  }

  return getLocalVisitsAnalytics();
}

/**
 * Subscribe to visit analytics snapshot from Cloud Firestore & IndexedDB
 */
export function subscribeVisitsAnalytics(onUpdate: (analytics: VisitAnalytics) => void): () => void {
  // Emit current local state
  onUpdate(getLocalVisitsAnalytics());

  // Restore from IndexedDB backup if LocalStorage was cleared
  loadIDBAnalytics().then((idbAnalytics) => {
    if (idbAnalytics) {
      try {
        localStorage.setItem(LOCAL_STORAGE_VISITS, JSON.stringify(idbAnalytics));
      } catch {}
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
          const totalVisits = data.totalVisits || 1;
          const recurringVisits = data.recurringVisits || 0;
          const repeatVisitorRate = totalVisits > 0 ? Math.round((recurringVisits / totalVisits) * 100) : 0;

          const updated: VisitAnalytics = {
            ...data,
            repeatVisitorRate
          };

          try {
            localStorage.setItem(LOCAL_STORAGE_VISITS, JSON.stringify(updated));
            saveIDBAnalytics(updated);
          } catch {}

          onUpdate(updated);
        }
      },
      (err) => console.warn("Visits snapshot warning:", err)
    );
  } catch (err) {}

  return () => {
    if (unsub) unsub();
  };
}
