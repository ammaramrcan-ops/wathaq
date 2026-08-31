import { db } from "./firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";

export interface UserPermissions {
  uid: string;
  email: string;
  role: "admin" | "trusted_publisher" | "student";
  canDirectPublish: boolean;
  canAccessAdmin: boolean;
}

const LOCAL_STORAGE_PERMISSIONS = "wathaq_users_permissions_map";
const HARDCODED_ADMIN_EMAIL = "ammaramrcan@gmail.com";

// Native IndexedDB helper for user permissions
const IDB_NAME = "wathaq_durable_storage";
const IDB_PERM_STORE = "user_permissions_store";

function openIDBPermissions(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) return reject("No IndexedDB");
    const req = window.indexedDB.open(IDB_NAME, 3);
    req.onupgradeneeded = (e: any) => {
      const idb = req.result;
      if (!idb.objectStoreNames.contains(IDB_PERM_STORE)) {
        idb.createObjectStore(IDB_PERM_STORE, { keyPath: "emailKey" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveIDBPermission(perm: UserPermissions): Promise<void> {
  try {
    if (!perm.email) return;
    const idb = await openIDBPermissions();
    const tx = idb.transaction(IDB_PERM_STORE, "readwrite");
    tx.objectStore(IDB_PERM_STORE).put({ ...perm, emailKey: perm.email.toLowerCase() });
  } catch (e) {}
}

export async function loadIDBPermissions(): Promise<Record<string, UserPermissions>> {
  try {
    const idb = await openIDBPermissions();
    return new Promise((resolve) => {
      const tx = idb.transaction(IDB_PERM_STORE, "readonly");
      const req = tx.objectStore(IDB_PERM_STORE).getAll();
      req.onsuccess = () => {
        const records = req.result || [];
        const map: Record<string, UserPermissions> = {};
        records.forEach((r: any) => {
          if (r.emailKey) {
            map[r.emailKey] = {
              uid: r.uid,
              email: r.email,
              role: r.role || "student",
              canDirectPublish: !!r.canDirectPublish,
              canAccessAdmin: !!r.canAccessAdmin
            };
          }
        });
        resolve(map);
      };
      req.onerror = () => resolve({});
    });
  } catch (e) {
    return {};
  }
}

/**
 * Get local permissions map for all users
 */
export function getPermissionsMap(): Record<string, UserPermissions> {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_PERMISSIONS);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

/**
 * Save permissions map to LocalStorage & IndexedDB
 */
export function savePermissionsMap(map: Record<string, UserPermissions>): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_PERMISSIONS, JSON.stringify(map));
  } catch (e) {}

  Object.values(map).forEach((perm) => {
    saveIDBPermission(perm);
  });
}

/**
 * Get permissions for a specific user
 */
export function getUserPermissions(uid: string, email: string): UserPermissions {
  if (!email) {
    return {
      uid: uid || "guest",
      email: "",
      role: "student",
      canDirectPublish: false,
      canAccessAdmin: false
    };
  }

  const isDefaultAdmin = email.toLowerCase() === HARDCODED_ADMIN_EMAIL.toLowerCase();

  if (isDefaultAdmin) {
    return {
      uid,
      email,
      role: "admin",
      canDirectPublish: true,
      canAccessAdmin: true
    };
  }

  const map = getPermissionsMap();
  const key = email.toLowerCase();
  if (map[key]) {
    const cached = map[key] as UserPermissions;
    const isAdminRole = cached.role === "admin" || cached.canAccessAdmin === true;
    const isTrustedPublisher = cached.role === "trusted_publisher" || cached.canDirectPublish === true;
    return {
      uid: cached.uid || uid,
      email: cached.email || email,
      role: isAdminRole ? "admin" : isTrustedPublisher ? "trusted_publisher" : "student",
      canDirectPublish: isAdminRole || isTrustedPublisher,
      canAccessAdmin: isAdminRole
    };
  }

  return {
    uid,
    email,
    role: "student",
    canDirectPublish: false,
    canAccessAdmin: false
  };
}

/**
 * Update user permissions in LocalStorage, IndexedDB & Cloud Firestore
 */
export async function updateUserPermissions(
  uid: string,
  email: string,
  updates: Partial<UserPermissions>
): Promise<UserPermissions> {
  const current = getUserPermissions(uid, email);
  const updated: UserPermissions = {
    ...current,
    ...updates,
    uid: uid || current.uid,
    email: email || current.email
  };

  // 1. Cloud Firestore sync FIRST (ensures server authorization)
  try {
    const userDocRef = doc(db, "users", uid || email);
    await setDoc(userDocRef, { permissions: updated, role: updated.role, canDirectPublish: updated.canDirectPublish, canAccessAdmin: updated.canAccessAdmin }, { merge: true });

    const globalUserDocRef = doc(db, "global_registered_users", uid || email);
    await setDoc(globalUserDocRef, { permissions: updated, role: updated.role, canDirectPublish: updated.canDirectPublish, canAccessAdmin: updated.canAccessAdmin }, { merge: true });
  } catch (err: any) {
    console.error("Firestore permissions update error:", err);
    throw new Error("فشل تعديل الصلاحيات سحابياً (تتطلب صلاحية الأدمن المصرح له).");
  }

  // 2. Save to LocalStorage & IndexedDB ONLY after Cloud Firestore succeeds
  try {
    const map = getPermissionsMap();
    map[email.toLowerCase()] = updated;
    savePermissionsMap(map);
  } catch (err) {}

  return updated;
}

/**
 * Subscribe to user permissions changes
 */
export function subscribeUserPermissions(
  uid: string,
  email: string,
  onUpdate: (perm: UserPermissions) => void
): () => void {
  onUpdate(getUserPermissions(uid, email));

  // Also check IndexedDB backup if LocalStorage was cleared
  loadIDBPermissions().then((idbMap) => {
    if (email && idbMap[email.toLowerCase()]) {
      const localMap = getPermissionsMap();
      if (!localMap[email.toLowerCase()]) {
        localMap[email.toLowerCase()] = idbMap[email.toLowerCase()];
        savePermissionsMap(localMap);
        onUpdate(idbMap[email.toLowerCase()]);
      }
    }
  });

  let unsub: (() => void) | null = null;
  if (uid || email) {
    try {
      const userDocRef = doc(db, "users", uid || email);
      unsub = onSnapshot(
        userDocRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            let perm: UserPermissions | null = null;
            if (data.permissions) {
              perm = data.permissions as UserPermissions;
            } else if (data.role || data.canDirectPublish !== undefined || data.canAccessAdmin !== undefined) {
              perm = {
                uid: data.uid || uid,
                email: data.email || email,
                role: data.role || "student",
                canDirectPublish: !!data.canDirectPublish,
                canAccessAdmin: !!data.canAccessAdmin
              };
            }
            if (perm && email) {
              const isServerAdmin = perm.role === "admin" || perm.canAccessAdmin === true;
              const permToStore = { ...perm, isVerifiedServerAdmin: isServerAdmin };
              const map = getPermissionsMap();
              map[email.toLowerCase()] = permToStore;
              savePermissionsMap(map);
              onUpdate(permToStore);
            }
          }
        },
        (err) => console.warn("User permissions snapshot warning:", err)
      );
    } catch (e) {}
  }

  return () => {
    if (unsub) unsub();
  };
}
