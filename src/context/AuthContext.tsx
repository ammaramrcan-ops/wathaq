import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "@/lib/firebase";
import { saveIDBUser, clearLocalUserSessionData } from "@/lib/contentService";

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isFirebaseConfigured: boolean;
  login: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (name: string, photoURL?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem("wathaq_persisted_user");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Helper setter to also persist in localStorage for instant reload
  const setUser = (u: AuthUser | null) => {
    setUserState(u);
    if (u) {
      localStorage.setItem("wathaq_persisted_user", JSON.stringify(u));
    } else {
      localStorage.removeItem("wathaq_persisted_user");
    }
  };

  useEffect(() => {
    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser && !fbUser.isAnonymous) {
        // Check if user account is banned in Cloud Firestore
        try {
          const bannedRef = doc(db, "banned_users", fbUser.uid);
          const bannedSnap = await getDoc(bannedRef).catch(() => null);

          const userRef = doc(db, "users", fbUser.uid);
          const userSnap = await getDoc(userRef).catch(() => null);

          if ((bannedSnap && bannedSnap.exists()) || (userSnap && userSnap.exists() && userSnap.data()?.banned === true)) {
            alert("تم حظر هذا الحساب من استخدام منصة وثاق. للتواصل مع الإدارة يرجى مراسلة الدعم الفني.");
            await signOut(auth);
            await clearLocalUserSessionData();
            setUser(null);
            setLoading(false);
            return;
          }
        } catch (bErr) {
          console.warn("Banned user check warning:", bErr);
        }

        const u = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || fbUser.email?.split("@")[0] || "طالب وثاق",
          photoURL: fbUser.photoURL
        };
        setUser(u);

        // Record user in Firestore, IndexedDB & LocalStorage
        if (fbUser.email) {
          const userRec = {
            uid: fbUser.uid,
            displayName: fbUser.displayName || fbUser.email.split("@")[0],
            email: fbUser.email,
            photoURL: fbUser.photoURL || null,
            provider: "Google",
            lastLogin: new Date().toLocaleDateString("ar-SA")
          };
          try {
            // Un-blacklist email if user actively logs in with Google
            const deletedStr = localStorage.getItem("wathaq_deleted_user_emails") || "[]";
            const deletedArr: string[] = JSON.parse(deletedStr);
            const updatedDeleted = deletedArr.filter((e) => e !== fbUser.email?.toLowerCase());
            localStorage.setItem("wathaq_deleted_user_emails", JSON.stringify(updatedDeleted));

            const saved = JSON.parse(localStorage.getItem("wathaq_registered_google_users") || "[]");
            const filtered = saved.filter((item: any) => item.email !== fbUser.email);
            localStorage.setItem("wathaq_registered_google_users", JSON.stringify([userRec, ...filtered]));
            await saveIDBUser(userRec);
          } catch (e) {
            // empty
          }

          // Cloud Firestore persistence (Isolated so local cache works even if rules fail)
          try {
            await setDoc(doc(db, "google_registered_users", fbUser.uid), userRec, { merge: true });
            await setDoc(doc(db, "users", fbUser.uid), userRec, { merge: true });
            await setDoc(doc(db, "global_registered_users", fbUser.uid), userRec, { merge: true });
          } catch (e) {
            console.warn("Firestore Cloud user write warning:", e);
          }
        }
      } else {
        // If user is anonymous or signed out, maintain Guest UI state (user = null)
        setUser(null);
        if (!fbUser) {
          // Auto-authenticate guest user anonymously in background so Firestore write/read rules pass
          try {
            await signInAnonymously(auth);
          } catch (anonErr) {
            console.warn("Anonymous auth initialization warning:", anonErr);
          }
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      const u = {
        uid: res.user.uid,
        email: res.user.email,
        displayName: res.user.displayName || res.user.email?.split("@")[0] || "طالب وثاق",
        photoURL: res.user.photoURL
      };
      setUser(u);

      if (res.user.email) {
        const userRec = {
          uid: res.user.uid,
          displayName: res.user.displayName || res.user.email.split("@")[0],
          email: res.user.email,
          photoURL: res.user.photoURL || null,
          provider: "البريد الإلكتروني",
          lastLogin: new Date().toLocaleDateString("ar-SA")
        };
        const saved = JSON.parse(localStorage.getItem("wathaq_registered_google_users") || "[]");
        const filtered = saved.filter((item: any) => item.email !== res.user.email);
        localStorage.setItem("wathaq_registered_google_users", JSON.stringify([userRec, ...filtered]));
        await saveIDBUser(userRec);
        await setDoc(doc(db, "users", res.user.uid), userRec, { merge: true });
      }
    } catch (err: any) {
      console.error("Firebase Login Error:", err.message);
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      const u = {
        uid: res.user.uid,
        email: res.user.email,
        displayName: res.user.displayName || "طالب وثاق (Google)",
        photoURL: res.user.photoURL
      };
      setUser(u);

      if (res.user.email) {
        const userRec = {
          uid: res.user.uid,
          displayName: res.user.displayName || res.user.email.split("@")[0],
          email: res.user.email,
          photoURL: res.user.photoURL || null,
          provider: "Google",
          lastLogin: new Date().toLocaleDateString("ar-SA")
        };
        try {
          const saved = JSON.parse(localStorage.getItem("wathaq_registered_google_users") || "[]");
          const filtered = saved.filter((item: any) => item.email !== res.user.email);
          localStorage.setItem("wathaq_registered_google_users", JSON.stringify([userRec, ...filtered]));
          await saveIDBUser(userRec);
        } catch (e) {
          /* ignore fallback error */
        }

        try {
          await setDoc(doc(db, "google_registered_users", res.user.uid), userRec, { merge: true });
          await setDoc(doc(db, "users", res.user.uid), userRec, { merge: true });
          await setDoc(doc(db, "global_registered_users", res.user.uid), userRec, { merge: true });
        } catch (e) {
          /* ignore fallback error */
        }
      }
    } catch (err: any) {
      console.error("Google Auth Error:", err.message);
      throw err;
    }
  };

  const register = async (name: string, email: string, pass: string) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      if (res.user) {
        await updateProfile(res.user, { displayName: name });
      }
      setUser({
        uid: res.user.uid,
        email: res.user.email,
        displayName: name,
        photoURL: res.user.photoURL
      });
    } catch (err: any) {
      console.error("Firebase Registration Error:", err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Signout error", err);
    }
    await clearLocalUserSessionData();
    setUser(null);
  };

  const updateUserProfile = async (name: string, photoURL?: string) => {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName: name,
        photoURL: photoURL || auth.currentUser.photoURL
      });
    }
    setUser(user ? { ...user, displayName: name, photoURL: photoURL || user.photoURL } : null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isFirebaseConfigured,
        login,
        loginWithGoogle,
        register,
        logout,
        updateUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
