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
 * Get permissions for a specific user
 */
export function getUserPermissions(uid: string, email: string): UserPermissions {
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
    return map[key];
  }

  // Default permissions for new users
  return {
    uid,
    email,
    role: "student",
    canDirectPublish: false,
    canAccessAdmin: false
  };
}

/**
 * Update user permissions in LocalStorage & Firestore
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

  // 1. Save to LocalStorage map
  try {
    const map = getPermissionsMap();
    map[email.toLowerCase()] = updated;
    localStorage.setItem(LOCAL_STORAGE_PERMISSIONS, JSON.stringify(map));
  } catch (err) {}

  // 2. Save to Cloud Firestore user document
  try {
    const userDocRef = doc(db, "users", uid || email);
    await setDoc(userDocRef, { permissions: updated, role: updated.role, canDirectPublish: updated.canDirectPublish, canAccessAdmin: updated.canAccessAdmin }, { merge: true });

    const globalUserDocRef = doc(db, "global_registered_users", uid || email);
    await setDoc(globalUserDocRef, { permissions: updated, role: updated.role, canDirectPublish: updated.canDirectPublish, canAccessAdmin: updated.canAccessAdmin }, { merge: true });
  } catch (err) {
    console.warn("Firestore permissions update warning:", err);
  }

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

  let unsub: (() => void) | null = null;
  if (uid || email) {
    try {
      const userDocRef = doc(db, "users", uid || email);
      unsub = onSnapshot(
        userDocRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            if (data.permissions) {
              onUpdate(data.permissions as UserPermissions);
            } else if (data.role || data.canDirectPublish !== undefined || data.canAccessAdmin !== undefined) {
              const perm: UserPermissions = {
                uid: data.uid || uid,
                email: data.email || email,
                role: data.role || "student",
                canDirectPublish: !!data.canDirectPublish,
                canAccessAdmin: !!data.canAccessAdmin
              };
              onUpdate(perm);
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
