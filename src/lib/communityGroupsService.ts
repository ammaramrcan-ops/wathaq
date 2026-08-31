import { db } from "./firebase";
import { collection, doc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";

export interface CommunityGroupItem {
  id: string;
  title: string; // اسم القناة أو الجروب (مثلاً: قناة تليجرام فيزياء الأزهر)
  platform: "telegram" | "whatsapp" | "facebook" | "discord" | "other";
  linkUrl: string; // رابط الانضمام للجروب
  description: string; // نبذة أو وصف للجروب
  subjectId?: string; // المادة المرتبطة (اختياري)
  subjectTitle?: string;
  category?: "scientific" | "arabic" | "islamic" | "all";
  membersCount?: string; // مثلاً "15.4K عضو"
}

// 100% Dynamic - No Hardcoded Default Mock Groups
export const DEFAULT_COMMUNITY_GROUPS: CommunityGroupItem[] = [];

const LOCAL_STORAGE_COMMUNITY_GROUPS = "wathaq_community_groups_list_v2";

export function getStoredCommunityGroups(): CommunityGroupItem[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_COMMUNITY_GROUPS);
    if (!saved) return [];
    const parsed: CommunityGroupItem[] = JSON.parse(saved);
    // Filter out old hardcoded mock IDs if present
    return parsed.filter((g) => !["g-tg-1", "g-wa-1", "g-tg-2"].includes(g.id));
  } catch (e) {
    return [];
  }
}

export function saveStoredCommunityGroups(list: CommunityGroupItem[]): void {
  try {
    const cleanList = list.filter((g) => !["g-tg-1", "g-wa-1", "g-tg-2"].includes(g.id));
    localStorage.setItem(LOCAL_STORAGE_COMMUNITY_GROUPS, JSON.stringify(cleanList));
  } catch (e) {
    // empty
  }
}

export function subscribeCommunityGroups(onUpdate: (groups: CommunityGroupItem[]) => void): () => void {
  // Clear legacy local storage key if it exists
  try {
    localStorage.removeItem("wathaq_community_groups_list");
  } catch (e) {
    // empty
  }

  onUpdate(getStoredCommunityGroups());

  let unsub: (() => void) | null = null;
  try {
    const colRef = collection(db, "community_groups");
    unsub = onSnapshot(
      colRef,
      (snap) => {
        const list: CommunityGroupItem[] = snap.docs
          .map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data()
          })) as CommunityGroupItem[];

        const cleanList = list.filter((g) => !["g-tg-1", "g-wa-1", "g-tg-2"].includes(g.id));
        saveStoredCommunityGroups(cleanList);
        onUpdate(cleanList);
      },
      (err) => {
        console.warn("Community groups snapshot warning:", err);
        onUpdate(getStoredCommunityGroups());
      }
    );
  } catch (err) {
    onUpdate(getStoredCommunityGroups());
  }

  return () => {
    if (unsub) unsub();
  };
}

export async function addCommunityGroup(group: CommunityGroupItem): Promise<void> {
  const current = getStoredCommunityGroups();
  const updated = [group, ...current.filter((g) => g.id !== group.id)];

  // 1. Cloud Firestore write FIRST (server authorization check)
  try {
    const docRef = doc(db, "community_groups", group.id);
    await setDoc(docRef, group, { merge: true });
  } catch (err: unknown) {
    console.error("Firestore addCommunityGroup error:", err);
    throw new Error("فشل إضافة التجمع سحابياً (تتطلب صلاحية الأدمن المصرح له).");
  }

  // 2. Save to LocalStorage ONLY after Cloud Firestore succeeds
  saveStoredCommunityGroups(updated);
}

export async function deleteCommunityGroup(id: string): Promise<void> {
  // 1. Delete from Cloud Firestore FIRST (server authorization check)
  try {
    const docRef = doc(db, "community_groups", id);
    await deleteDoc(docRef);
  } catch (err: unknown) {
    console.error("Firestore deleteCommunityGroup error:", err);
    throw new Error("فشل حذف التجمع سحابياً (تتطلب صلاحية الأدمن المصرح له).");
  }

  // 2. Update LocalStorage ONLY after Cloud Firestore succeeds
  const current = getStoredCommunityGroups();
  const updated = current.filter((g) => g.id !== id);
  saveStoredCommunityGroups(updated);
}
