import { db } from "./firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";

export interface SubjectNotebookLmMap {
  [subjectId: string]: string; // e.g. physics -> "https://notebooklm.google.com/notebook/..."
}

const LOCAL_STORAGE_SUBJECT_NOTEBOOKLM_MAP = "wathaq_subject_notebooklm_links";

export function getStoredSubjectNotebookLmMap(): SubjectNotebookLmMap {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_SUBJECT_NOTEBOOKLM_MAP);
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    return {};
  }
}

export function saveStoredSubjectNotebookLmMap(map: SubjectNotebookLmMap): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_SUBJECT_NOTEBOOKLM_MAP, JSON.stringify(map));
  } catch (e) {
    // empty
  }
}

export function subscribeSubjectNotebookLmMap(onUpdate: (map: SubjectNotebookLmMap) => void): () => void {
  onUpdate(getStoredSubjectNotebookLmMap());

  let unsub: (() => void) | null = null;
  try {
    const docRef = doc(db, "curriculum_meta", "subject_notebooklm_links");
    unsub = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists() && snap.data()?.notebookLmMap) {
          const map = snap.data().notebookLmMap as SubjectNotebookLmMap;
          saveStoredSubjectNotebookLmMap(map);
          onUpdate(map);
        } else {
          onUpdate(getStoredSubjectNotebookLmMap());
        }
      },
      (err) => console.warn("NotebookLM map snapshot warning:", err)
    );
  } catch (err) {
    // empty
  }

  return () => {
    if (unsub) unsub();
  };
}

export async function saveSubjectNotebookLmLink(subjectId: string, url: string): Promise<void> {
  const current = getStoredSubjectNotebookLmMap();
  const updatedMap = {
    ...current,
    [subjectId]: url.trim()
  };

  // 1. Cloud Firestore write FIRST (server authorization check)
  try {
    const docRef = doc(db, "curriculum_meta", "subject_notebooklm_links");
    await setDoc(docRef, { notebookLmMap: updatedMap, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error: unknown) {
    console.error("Firestore saveSubjectNotebookLmLink error:", error);
    throw new Error("فشل حفظ رابط معلّم AI للمادة سحابياً (تتطلب صلاحية الأدمن المصرح له).");
  }

  // 2. Save to LocalStorage ONLY after Cloud Firestore succeeds
  saveStoredSubjectNotebookLmMap(updatedMap);
}
