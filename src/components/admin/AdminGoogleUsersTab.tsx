import React, { useState, useEffect } from "react";
import { Users, Search, CheckCircle2, UserCheck, RefreshCw, Trash2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc, deleteDoc, setDoc } from "firebase/firestore";
import { loadIDBUsers, saveIDBUser } from "@/lib/contentService";

export interface GoogleRegisteredUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  provider: string;
  lastLogin?: string;
}

export function AdminGoogleUsersTab() {
  const [googleUsers, setGoogleUsers] = useState<GoogleRegisteredUser[]>(() => {
    try {
      const saved = localStorage.getItem("wathaq_registered_google_users");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  const [newEmailInput, setNewEmailInput] = useState("");
  const [isAddManualOpen, setIsAddManualOpen] = useState(false);

  useEffect(() => {
    const userMap = new Map<string, GoogleRegisteredUser>();

    // Seed accounts from Firebase Console directly into Cloud Firestore & Local Map
    const firebaseConsoleAccounts: GoogleRegisteredUser[] = [
      {
        uid: "fZRozjpgrZMZhiJyLPjGqMfW",
        displayName: "عمار الشامي",
        email: "proammarelshamy@gmail.com",
        provider: "Google 🔵",
        lastLogin: "مُزامن سحابياً"
      },
      {
        uid: "n63NjR2AAeaQh86G2gO2vO",
        displayName: "عمار الشامي",
        email: "ammargr40@gmail.com",
        provider: "Google 🔵",
        lastLogin: "مُزامن سحابياً"
      },
      {
        uid: "34Nfyd2n6RgFmAxHU8OB28",
        displayName: "عمار الشامي",
        email: "ammarahmedelshamy@gmail.com",
        provider: "Google 🔵",
        lastLogin: "مُزامن سحابياً"
      }
    ];

    firebaseConsoleAccounts.forEach((u) => {
      userMap.set(u.email.toLowerCase(), u);
      try {
        setDoc(doc(db, "global_registered_users", u.uid), u, { merge: true });
        setDoc(doc(db, "google_registered_users", u.uid), u, { merge: true });
        setDoc(doc(db, "users", u.uid), u, { merge: true });
        saveIDBUser(u);
      } catch {}
    });

    // Load initial local storage users into map
    try {
      const saved = JSON.parse(localStorage.getItem("wathaq_registered_google_users") || "[]");
      saved.forEach((u: GoogleRegisteredUser) => {
        if (u.email) userMap.set(u.email.toLowerCase(), u);
      });
    } catch {}

    // Load durable IndexedDB users
    loadIDBUsers().then((idbUsers) => {
      let changed = false;
      idbUsers.forEach((u) => {
        if (u.email && !userMap.has(u.email.toLowerCase())) {
          userMap.set(u.email.toLowerCase(), u);
          changed = true;
        }
      });
      if (changed) updateUserList();
    });

    const updateUserList = () => {
      const list = Array.from(userMap.values());
      setGoogleUsers(list);
      try {
        localStorage.setItem("wathaq_registered_google_users", JSON.stringify(list));
      } catch {}

      // Auto-persist all loaded users into Cloud Firestore to resist browser clearing
      list.forEach((u) => {
        if (u.uid && u.email) {
          try {
            setDoc(doc(db, "global_registered_users", u.uid), u, { merge: true });
            setDoc(doc(db, "google_registered_users", u.uid), u, { merge: true });
          } catch {}
        }
      });

      setLoading(false);
    };

    const processSnapshot = (snap: any) => {
      snap.docs.forEach((docSnap: any) => {
        const d = docSnap.data();
        const email = d.email || d.userEmail || d.mail;
        if (email) {
          const userObj: GoogleRegisteredUser = {
            uid: d.uid || docSnap.id || email,
            displayName: d.displayName || d.name || d.userName || email.split("@")[0],
            email: email,
            photoURL: d.photoURL || d.avatar || d.picture || null,
            provider: d.provider || "Google 🔵",
            lastLogin: d.lastLogin || d.createdAt || d.joinDate || "مسجل في المنصة"
          };
          userMap.set(email.toLowerCase(), userObj);
        }
      });
      updateUserList();
    };

    // Subscriptions to all potential user collections in Firestore
    const unsubs: (() => void)[] = [];

    const collectionsToListen = ["global_registered_users", "google_registered_users", "users", "registered_users", "students"];

    collectionsToListen.forEach((colName) => {
      try {
        const colRef = collection(db, colName);
        const unsub = onSnapshot(
          colRef,
          (snap) => processSnapshot(snap),
          (err) => console.warn(`Snapshot listener for ${colName} warning:`, err)
        );
        unsubs.push(unsub);
      } catch (e) {}
    });

    // Fallback timer if no snapshots respond
    const timer = setTimeout(() => setLoading(false), 2000);

    return () => {
      clearTimeout(timer);
      unsubs.forEach((unsub) => unsub());
    };
  }, []);

  const handleAddManualUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmailInput.trim()) return;

    const email = newEmailInput.trim();
    const newUser: GoogleRegisteredUser = {
      uid: "manual-" + Date.now(),
      displayName: email.split("@")[0] + " (Google)",
      email: email,
      provider: "Google 🔵",
      lastLogin: new Date().toLocaleDateString("ar-SA")
    };

    const updated = [newUser, ...googleUsers.filter((u) => u.email.toLowerCase() !== email.toLowerCase())];
    setGoogleUsers(updated);
    try {
      localStorage.setItem("wathaq_registered_google_users", JSON.stringify(updated));
      saveIDBUser(newUser);
      setDoc(doc(db, "global_registered_users", newUser.uid), newUser, { merge: true });
      setDoc(doc(db, "google_registered_users", newUser.uid), newUser, { merge: true });
      setDoc(doc(db, "users", newUser.uid), newUser, { merge: true });
    } catch (err) {}

    setNewEmailInput("");
    setIsAddManualOpen(false);
  };

  const handleDeleteUser = async (userObj: GoogleRegisteredUser) => {
    if (!window.confirm(`هل أنت تأكد من رغبتك في حذف المستخدم (${userObj.email}) من لوحة التحكم وقواعد البيانات؟`)) {
      return;
    }

    const updated = googleUsers.filter((u) => u.email.toLowerCase() !== userObj.email.toLowerCase());
    setGoogleUsers(updated);

    try {
      localStorage.setItem("wathaq_registered_google_users", JSON.stringify(updated));
      if (userObj.uid) {
        await deleteDoc(doc(db, "global_registered_users", userObj.uid)).catch(() => {});
        await deleteDoc(doc(db, "google_registered_users", userObj.uid)).catch(() => {});
        await deleteDoc(doc(db, "users", userObj.uid)).catch(() => {});
        await deleteDoc(doc(db, "registered_users", userObj.uid)).catch(() => {});
      }
    } catch (err) {
      console.warn("Delete user warning:", err);
    }
  };

  const filteredUsers = googleUsers.filter(
    (u) =>
      u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-surface-container-low border border-outline-variant/30 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-xl text-right">
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-outline-variant/10 pb-4">
        <div>
          <h3 className="text-headline-md font-bold text-on-surface flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            <span>المستخدمون المسجلون بالحسابات الحقيقية عبر Firebase / Google 🔵</span>
          </h3>
          <p className="text-label-sm text-on-surface-variant mt-1">
            يتم فحص وجلب جميع مجموعات المستخدمين المسجلين سابقاً في قواعد البيانات سحابياً تلقائياً.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setIsAddManualOpen(!isAddManualOpen)}
            className="bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-on-primary px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            + إضافة / مزامنة بريد من Firebase
          </button>

          <div className="relative">
            <input
              type="text"
              placeholder="بحث بالاسم أو البريد..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-surface-container border border-outline-variant/40 rounded-xl px-9 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
            />
            <Search className="w-4 h-4 text-on-surface-variant absolute right-3 top-2.5" />
          </div>

          <span className="bg-primary/10 text-primary border border-primary/30 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>إجمالي الحسابات المسجلة: {googleUsers.length} مستخدم</span>
          </span>
        </div>
      </div>

      {/* Manual User Input Form */}
      {isAddManualOpen && (
        <form onSubmit={handleAddManualUser} className="bg-surface-container p-4 rounded-2xl border border-primary/30 flex items-center gap-3 animate-fadeIn">
          <input
            type="email"
            required
            placeholder="أدخل بريد الحساب المسجل بـ Firebase Auth (مثال: user@gmail.com)"
            value={newEmailInput}
            onChange={(e) => setNewEmailInput(e.target.value)}
            className="flex-grow bg-surface-container-high border border-outline-variant/40 rounded-xl p-2.5 text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
            dir="ltr"
          />
          <button
            type="submit"
            className="bg-primary text-on-primary px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-primary/90 transition-all cursor-pointer whitespace-nowrap"
          >
            تأكيد المزامنة
          </button>
        </form>
      )}

      {/* Users Grid or Loading / Empty State */}
      {loading && googleUsers.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center gap-3 bg-surface-container rounded-2xl">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mb-1" />
          <p className="text-body-md text-on-surface-variant">جاري جلب حسابات المستخدمين من قواعد البيانات...</p>
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => (
            <div
              key={user.uid || user.email}
              className="bg-surface-container border border-outline-variant/30 hover:border-primary/50 rounded-2xl p-5 flex items-center justify-between gap-3 transition-all hover:shadow-lg relative group"
            >
              <div className="flex items-center gap-4 overflow-hidden">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="w-14 h-14 rounded-full object-cover border-2 border-primary/40 shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-primary/20 text-primary border-2 border-primary/40 flex items-center justify-center font-bold text-xl shrink-0">
                    {user.displayName ? user.displayName[0] : "G"}
                  </div>
                )}

                <div className="flex flex-col gap-1 overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-body-md text-on-surface truncate">{user.displayName}</h4>
                    <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-medium shrink-0">
                      {user.provider || "Google 🔵"}
                    </span>
                  </div>

                  <p className="text-xs text-on-surface-variant font-mono truncate" dir="ltr">{user.email}</p>

                  <div className="flex items-center gap-2 mt-1 text-[11px] text-on-surface-variant/80">
                    <span>التاريخ / الدخول: {user.lastLogin || "مسجل"}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDeleteUser(user)}
                title="حذف هذا المستخدم من القائمة وقواعد البيانات"
                className="p-2 text-on-surface-variant hover:text-error bg-surface-container-high hover:bg-error/10 border border-outline-variant/20 rounded-xl transition-all cursor-pointer shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 flex flex-col items-center justify-center text-center gap-3 bg-surface-container border border-dashed border-outline-variant/30 rounded-2xl">
          <UserCheck className="w-12 h-12 text-primary/40 mb-1" />
          <h4 className="text-headline-md text-on-surface font-bold">لا يوجد مستخدمون مسجلون حالياً</h4>
          <p className="text-body-md text-on-surface-variant max-w-md">
            يتم فحص واستجلاء المستندات فور قيام أي طالب بدخول المنصة بـ Google أو إنشائه حساباً.
          </p>
        </div>
      )}
    </div>
  );
}
