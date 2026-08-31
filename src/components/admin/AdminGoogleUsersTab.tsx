import React, { useState, useEffect } from "react";
import { Users, Search, CheckCircle2, UserCheck, RefreshCw, Trash2, ShieldCheck, Zap, Lock, Unlock } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc, deleteDoc, setDoc, QuerySnapshot, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { loadIDBUsers, saveIDBUser, deleteIDBUser } from "@/lib/contentService";
import { 
  getUserPermissions, 
  updateUserPermissions, 
  UserPermissions, 
  getPermissionsMap, 
  savePermissionsMap,
  loadIDBPermissions 
} from "@/lib/userPermissionsService";

export interface GoogleRegisteredUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  provider: string;
  lastLogin?: string;
}

const LOCAL_STORAGE_DELETED_USERS = "wathaq_deleted_user_emails";

export function getLocalDeletedUserEmails(): string[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_DELETED_USERS) || "[]");
  } catch {
    return [];
  }
}

export function markUserEmailAsDeleted(email: string): void {
  try {
    const deleted = getLocalDeletedUserEmails();
    const key = email.toLowerCase();
    if (!deleted.includes(key)) {
      const updated = [...deleted, key];
      localStorage.setItem(LOCAL_STORAGE_DELETED_USERS, JSON.stringify(updated));
    }
  } catch {
    // empty
  }
}

export function AdminGoogleUsersTab() {
  const [googleUsers, setGoogleUsers] = useState<GoogleRegisteredUser[]>(() => {
    try {
      const saved: GoogleRegisteredUser[] = JSON.parse(localStorage.getItem("wathaq_registered_google_users") || "[]");
      const deleted = getLocalDeletedUserEmails();
      return saved.filter((u) => u.email && !deleted.includes(u.email.toLowerCase()));
    } catch {
      return [];
    }
  });

  const [permissionsMap, setPermissionsMap] = useState<Record<string, UserPermissions>>(getPermissionsMap());
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  const [newEmailInput, setNewEmailInput] = useState("");
  const [isAddManualOpen, setIsAddManualOpen] = useState(false);

  useEffect(() => {
    const userMap = new Map<string, GoogleRegisteredUser>();
    const cloudPermissionsMap: Record<string, UserPermissions> = {};

    const deletedEmails = getLocalDeletedUserEmails();

    try {
      const saved = JSON.parse(localStorage.getItem("wathaq_registered_google_users") || "[]");
      saved.forEach((u: GoogleRegisteredUser) => {
        if (u.email && !deletedEmails.includes(u.email.toLowerCase())) {
          userMap.set(u.email.toLowerCase(), u);
        }
      });
    } catch {
      // empty
    }

    // Restore durable IndexedDB backups if LocalStorage was cleared
    loadIDBPermissions().then((idbPerms) => {
      const currentMap = getPermissionsMap();
      let changed = false;
      Object.keys(idbPerms).forEach((key) => {
        if (!currentMap[key]) {
          currentMap[key] = idbPerms[key];
          changed = true;
        }
      });
      if (changed) {
        savePermissionsMap(currentMap);
        setPermissionsMap({ ...currentMap });
      }
    });

    loadIDBUsers().then((idbUsers) => {
      let changed = false;
      const currentDeleted = getLocalDeletedUserEmails();
      idbUsers.forEach((u) => {
        const key = u.email ? u.email.toLowerCase() : "";
        if (key && !currentDeleted.includes(key) && !userMap.has(key)) {
          userMap.set(key, u);
          changed = true;
        }
      });
      if (changed) updateUserList();
    });

    const updateUserList = () => {
      const currentDeleted = getLocalDeletedUserEmails();
      const list = Array.from(userMap.values()).filter((u) => u.email && !currentDeleted.includes(u.email.toLowerCase()));
      setGoogleUsers(list);

      // Load merged permissions
      const localMap = getPermissionsMap();
      const pMap: Record<string, UserPermissions> = { ...localMap, ...cloudPermissionsMap };
      list.forEach((u) => {
        if (u.email) {
          const key = u.email.toLowerCase();
          if (!pMap[key]) {
            pMap[key] = getUserPermissions(u.uid, u.email);
          }
        }
      });

      savePermissionsMap(pMap);
      setPermissionsMap(pMap);

      try {
        localStorage.setItem("wathaq_registered_google_users", JSON.stringify(list));
      } catch {
        // empty
      }

      setLoading(false);
    };

    const processSnapshot = (snap: QuerySnapshot<DocumentData>): void => {
      const currentDeleted = getLocalDeletedUserEmails();

      snap.docs.forEach((docSnap: QueryDocumentSnapshot<DocumentData>) => {
        const d = docSnap.data();
        const email = d.email || d.userEmail || d.mail;
        if (email) {
          const emailKey = email.toLowerCase();

          // Skip blacklisted deleted users
          if (currentDeleted.includes(emailKey) || d.deletedAt) {
            userMap.delete(emailKey);
            return;
          }

          const userObj: GoogleRegisteredUser = {
            uid: d.uid || docSnap.id || email,
            displayName: d.displayName || d.name || d.userName || email.split("@")[0],
            email: email,
            photoURL: d.photoURL || d.avatar || d.picture || null,
            provider: d.provider || "Google 🔵",
            lastLogin: d.lastLogin || d.createdAt || d.joinDate || "مسجل في المنصة"
          };
          userMap.set(emailKey, userObj);

          // Extract Cloud Firestore permissions
          if (d.permissions) {
            cloudPermissionsMap[emailKey] = d.permissions as UserPermissions;
          } else if (d.role || d.canDirectPublish !== undefined || d.canAccessAdmin !== undefined) {
            cloudPermissionsMap[emailKey] = {
              uid: d.uid || docSnap.id || email,
              email: email,
              role: d.role || "student",
              canDirectPublish: !!d.canDirectPublish,
              canAccessAdmin: !!d.canAccessAdmin
            };
          }
        }
      });
      updateUserList();
    };

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
      } catch (e) {
        // empty
      }
    });

    // Subscriptions to deleted users markers
    try {
      const deletedCol = collection(db, "global_deleted_items");
      const unsubDel = onSnapshot(deletedCol, (snap) => {
        let changed = false;
        snap.docs.forEach((d) => {
          const data = d.data();
          if (data.itemType === "user" && data.email) {
            markUserEmailAsDeleted(data.email);
            if (userMap.has(data.email.toLowerCase())) {
              userMap.delete(data.email.toLowerCase());
              changed = true;
            }
          }
        });
        if (changed) updateUserList();
      });
      unsubs.push(unsubDel);
    } catch (e) {
      // empty
    }

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

    // Remove from deleted list if re-added manually
    try {
      const currentDeleted = getLocalDeletedUserEmails();
      const updatedDeleted = currentDeleted.filter((item) => item !== email.toLowerCase());
      localStorage.setItem(LOCAL_STORAGE_DELETED_USERS, JSON.stringify(updatedDeleted));
    } catch {
      // empty
    }

    const updated = [newUser, ...googleUsers.filter((u) => u.email.toLowerCase() !== email.toLowerCase())];
    setGoogleUsers(updated);
    try {
      localStorage.setItem("wathaq_registered_google_users", JSON.stringify(updated));
      saveIDBUser(newUser);
      setDoc(doc(db, "global_registered_users", newUser.uid), newUser, { merge: true });
      setDoc(doc(db, "google_registered_users", newUser.uid), newUser, { merge: true });
      setDoc(doc(db, "users", newUser.uid), newUser, { merge: true });
    } catch (err) {
      // empty
    }

    setNewEmailInput("");
    setIsAddManualOpen(false);
  };

  const handleDeleteUser = async (userObj: GoogleRegisteredUser) => {
    if (!window.confirm(`هل أنت تأكد من رغبتك في حظر وتجريد المستخدم (${userObj.email}) من المنصة وقواعد البيانات؟`)) {
      return;
    }

    const emailKey = userObj.email.toLowerCase();
    
    // 1. Mark email as blacklisted in local state & durable storage
    markUserEmailAsDeleted(userObj.email);
    await deleteIDBUser(userObj.email);

    // 2. Instantly update UI list
    const updated = googleUsers.filter((u) => u.email.toLowerCase() !== emailKey);
    setGoogleUsers(updated);

    // 3. Persist Cloud Ban Record in banned_users collection & delete user docs from Firestore
    try {
      localStorage.setItem("wathaq_registered_google_users", JSON.stringify(updated));

      if (userObj.uid) {
        // Record server ban marker so AuthContext auto-rejects future logins
        await setDoc(doc(db, "banned_users", userObj.uid), {
          uid: userObj.uid,
          email: userObj.email,
          bannedAt: new Date().toISOString()
        }, { merge: true }).catch(() => {});

        await deleteDoc(doc(db, "global_registered_users", userObj.uid)).catch(() => {});
        await deleteDoc(doc(db, "google_registered_users", userObj.uid)).catch(() => {});
        await deleteDoc(doc(db, "users", userObj.uid)).catch(() => {});
        await deleteDoc(doc(db, "registered_users", userObj.uid)).catch(() => {});
      }

      await deleteDoc(doc(db, "global_registered_users", emailKey)).catch(() => {});
      await deleteDoc(doc(db, "google_registered_users", emailKey)).catch(() => {});
      await deleteDoc(doc(db, "users", emailKey)).catch(() => {});

      // Record global deletion marker in Firestore
      await setDoc(doc(db, "global_deleted_items", `user-${emailKey}`), {
        itemId: `user-${emailKey}`,
        email: emailKey,
        itemType: "user",
        deletedAt: new Date().toISOString()
      }).catch(() => {});
    } catch (err) {
      console.warn("Delete user warning:", err);
    }
  };

  const handleToggleDirectPublish = async (userObj: GoogleRegisteredUser) => {
    const current = getUserPermissions(userObj.uid, userObj.email);
    const updated = await updateUserPermissions(userObj.uid, userObj.email, {
      canDirectPublish: !current.canDirectPublish
    });
    setPermissionsMap((prev) => ({ ...prev, [userObj.email.toLowerCase()]: updated }));
  };

  const handleToggleAdminAccess = async (userObj: GoogleRegisteredUser) => {
    const current = getUserPermissions(userObj.uid, userObj.email);
    const updated = await updateUserPermissions(userObj.uid, userObj.email, {
      canAccessAdmin: !current.canAccessAdmin,
      role: !current.canAccessAdmin ? "admin" : current.role === "admin" ? "student" : current.role
    });
    setPermissionsMap((prev) => ({ ...prev, [userObj.email.toLowerCase()]: updated }));
  };

  const handleChangeRole = async (userObj: GoogleRegisteredUser, newRole: "admin" | "trusted_publisher" | "student") => {
    const updated = await updateUserPermissions(userObj.uid, userObj.email, {
      role: newRole,
      canDirectPublish: newRole === "admin" || newRole === "trusted_publisher",
      canAccessAdmin: newRole === "admin"
    });
    setPermissionsMap((prev) => ({ ...prev, [userObj.email.toLowerCase()]: updated }));
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
            <span>المستخدمون ورتب الصلاحيات والنشر المباشر 🔵</span>
          </h3>
          <p className="text-label-sm text-on-surface-variant mt-1">
            إدارة صلاحية النشر بدون مراجعة وصلاحية دخول لوحة التحكم لجميع الحسابات المسجلة.
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

      {/* Users Grid */}
      {loading && googleUsers.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center gap-3 bg-surface-container rounded-2xl">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mb-1" />
          <p className="text-body-md text-on-surface-variant">جاري جلب حسابات المستخدمين من قواعد البيانات...</p>
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((userObj) => {
            const perm = permissionsMap[userObj.email.toLowerCase()] || getUserPermissions(userObj.uid, userObj.email);
            return (
              <div
                key={userObj.uid || userObj.email}
                className="bg-surface-container border border-outline-variant/30 hover:border-primary/50 rounded-2xl p-5 flex flex-col gap-3 transition-all hover:shadow-lg relative"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    {userObj.photoURL ? (
                      <img
                        src={userObj.photoURL}
                        alt={userObj.displayName}
                        className="w-12 h-12 rounded-full object-cover border-2 border-primary/40 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/20 text-primary border-2 border-primary/40 flex items-center justify-center font-bold text-lg shrink-0">
                        {userObj.displayName ? userObj.displayName[0] : "G"}
                      </div>
                    )}

                    <div className="flex flex-col gap-0.5 overflow-hidden">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-body-md text-on-surface truncate">{userObj.displayName}</h4>
                      </div>
                      <p className="text-xs text-on-surface-variant font-mono truncate" dir="ltr">{userObj.email}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteUser(userObj)}
                    title="حذف هذا المستخدم"
                    className="p-2 text-on-surface-variant hover:text-error bg-surface-container-high hover:bg-error/10 border border-outline-variant/20 rounded-xl transition-all cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Role Selector & Controls */}
                <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/10">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-on-surface-variant font-medium">رتبة الحساب:</span>
                    <select
                      value={perm.role}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChangeRole(userObj, e.target.value)}
                      className="bg-surface-container-high text-on-surface border border-outline-variant/40 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-primary font-bold"
                    >
                      <option value="student">طالب 🎓</option>
                      <option value="trusted_publisher">ناشر موثوق 🌟</option>
                      <option value="admin">مدير أدمن 👑</option>
                    </select>
                  </div>

                  {/* Direct Publish Permission Toggle */}
                  <button
                    type="button"
                    onClick={() => handleToggleDirectPublish(userObj)}
                    className={`w-full py-1.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                      perm.canDirectPublish
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-surface-container-high text-on-surface-variant border-outline-variant/20 hover:border-primary/40"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      <span>نشر مباشر (بدون مراجعة)</span>
                    </span>
                    <span>{perm.canDirectPublish ? "مُفعل ✅" : "معطل ❌"}</span>
                  </button>

                  {/* Admin Panel Access Toggle */}
                  <button
                    type="button"
                    onClick={() => handleToggleAdminAccess(userObj)}
                    className={`w-full py-1.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                      perm.canAccessAdmin
                        ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                        : "bg-surface-container-high text-on-surface-variant border-outline-variant/20 hover:border-primary/40"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>دخول لوحة التحكم (أدمن)</span>
                    </span>
                    <span>{perm.canAccessAdmin ? "مسموح 🔓" : "مغلق 🔒"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 flex flex-col items-center justify-center text-center gap-3 bg-surface-container border border-dashed border-outline-variant/30 rounded-2xl">
          <UserCheck className="w-12 h-12 text-primary/40 mb-1" />
          <h4 className="text-headline-md text-on-surface font-bold">لا يوجد مستخدمون مسجلون حالياً</h4>
        </div>
      )}
    </div>
  );
}
