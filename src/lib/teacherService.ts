import { db } from "./firebase";
import { collection, doc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";

export interface TeacherEvaluation {
  id: string;
  name: string;
  subjectId: string;
  subjectTitle: string;
  category: "scientific" | "arabic" | "islamic";
  rating: number;
  reviewsCount: number;
  avatar?: string;
  experience: string;
  strengths: string[];
  weaknesses: string[];
  summary: string;
}

export const DEFAULT_TEACHERS: TeacherEvaluation[] = [
  {
    id: "t-phys-1",
    name: "أ. محمد عبدالسلام",
    subjectId: "physics",
    subjectTitle: "الفيزياء",
    category: "scientific",
    rating: 4.9,
    reviewsCount: 142,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
    experience: "15 عاماً في تدريس الفيزياء للثانوية العامة والأزهرية",
    summary: "خبير ومتمكن في ربط الفيزياء بالحياة الواقعية وتيسير مسائل الميكانيكا والكهرباء.",
    strengths: [
      "تبسيط المفاهيم المعقدة ورسم توضيحي بصري لكل قانون.",
      "حل أعقد مسائل الامتحانات بأسلوب متسلسل ومنطقي.",
      "توفير تجارب افتراضية ممتعة تثبت المعلومة بسهولة."
    ],
    weaknesses: [
      "سرعة الشرح أحياناً في الدروس المتقدمة والفيزياء الحديثة.",
      "قلة الملازم والمذكرات الورقية المطبوعة (يركز أكثر على الشرح الشفهي والمرئي)."
    ]
  },
  {
    id: "t-phys-2",
    name: "د. أحمد سامي",
    subjectId: "physics",
    subjectTitle: "الفيزياء",
    category: "scientific",
    rating: 4.7,
    reviewsCount: 98,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
    experience: "12 عاماً، دكتوراه في الفيزياء التطبيقية",
    summary: "شرح أكاديمي دقيق جداً مناسب للطلاب الراغبين في الفهم العميق والدرجات النهائية.",
    strengths: [
      "إحاطة كاملة بكافة الأفكار الاستثنائية والمسائل النادرة في الامتحانات.",
      "إيقاع هادئ ومنظم جداً في استعراض خطوات الإثباتات الرياضية."
    ],
    weaknesses: [
      "تحتاج المحاضرة إلى تركيز شديد نظراً لجديّة وطول وقت الشرح.",
      "عدم تنويع وسائل التوضيح التفاعلية."
    ]
  },
  {
    id: "t-chem-1",
    name: "أ. سارة حسن",
    subjectId: "chemistry",
    subjectTitle: "الكيمياء",
    category: "scientific",
    rating: 4.8,
    reviewsCount: 115,
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop",
    experience: "10 سنوات في تدريس الكيمياء العضوية والتحليلية",
    summary: "مبدعة في تسمية وتفاعلات المركبات العضوية وتلخيص المعادلات الصعبة.",
    strengths: [
      "خرائط ذهنية رائعة تجمع كافة تفاعلات الكيمياء العضوية في ورقة واحدة.",
      "متابعة دورية وااختبارات قصيرة لتقييم استيعاب الطالب أولاً بأول."
    ],
    weaknesses: [
      "الإطالة أحياناً في شرح الأجزاء التأسيسية البسيطة.",
      "ندرة الحصص المباشرة للرد الفوري على استفسارات الطلاب."
    ]
  },
  {
    id: "t-arb-1",
    name: "أ. محمود الشنقيطي",
    subjectId: "grammar",
    subjectTitle: "النحو والصرف",
    category: "arabic",
    rating: 4.9,
    reviewsCount: 160,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
    experience: "18 عاماً في تدريس لغة الضاد والبلاغة",
    summary: "أسلوب أعرابي ممتع يعتمد على التذوق اللغوي وفهم المعنى قبل تطبيق القواعد.",
    strengths: [
      "قدرة فائقة على جعل مادة النحو ممتعة وسلسة لأي طالب.",
      "تطبيقات مكثفة على شواهد القرآن الكريم والأبيات الشعرية."
    ],
    weaknesses: [
      "يتوسع أحياناً في الخلافات النحوية القديمة بين البصريين والكوفيين.",
      "وقت الشرح قد يكون طويلاً على الطلاب الراغبين في المراجعة السريعة."
    ]
  },
  {
    id: "t-isl-1",
    name: "الشيخ د. عبدالرحمن",
    subjectId: "tawheed",
    subjectTitle: "التوحيد والعقيدة",
    category: "islamic",
    rating: 5.0,
    reviewsCount: 130,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop",
    experience: "20 عاماً في العلوم الشرعية والتربوية",
    summary: "شرح ميسر ومؤصل لأبواب العقيدة والفقه مع استخراج الدروس والفوائد التربوية.",
    strengths: [
      "هدوء تام وسلاسة في عرض الأدلة والترتيب المنهجي للأفكار.",
      "ربط المسائل الشرعية بالجانب الإيماني والأخلاقي للطالب."
    ],
    weaknesses: [
      "الإيقاع هادئ جداً قد يتطلب زيادة سرعة الفيديو للبعض."
    ]
  }
];

const LOCAL_STORAGE_TEACHERS = "wathaq_teachers";
const LOCAL_STORAGE_DELETED_TEACHERS = "wathaq_deleted_teachers";

/**
 * Get locally saved deleted teacher IDs
 */
export function getLocalDeletedTeacherIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_DELETED_TEACHERS) || "[]");
  } catch {
    return [];
  }
}

/**
 * Get active teachers list filtered against deleted IDs
 */
export function getLocalTeachers(): TeacherEvaluation[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_TEACHERS);
    const rawList: TeacherEvaluation[] = saved ? JSON.parse(saved) : DEFAULT_TEACHERS;
    const deletedIds = getLocalDeletedTeacherIds();
    return rawList.filter((t) => !deletedIds.includes(t.id));
  } catch {
    return DEFAULT_TEACHERS;
  }
}

/**
 * Mark a teacher as deleted permanently across Cloud Firestore & LocalStorage
 */
export async function deleteTeacher(teacherId: string): Promise<void> {
  // 1. Cloud Firestore sync FIRST (requires Admin permissions)
  try {
    const globalDeletedRef = doc(db, "global_deleted_items", teacherId);
    await setDoc(globalDeletedRef, {
      itemId: teacherId,
      itemType: "teacher",
      deletedAt: new Date().toISOString()
    });

    const teacherDocRef = doc(db, "teachers", teacherId);
    await deleteDoc(teacherDocRef);
  } catch (err: any) {
    console.error("Firestore teacher delete error:", err);
    throw new Error("فشل حذف المعلم سحابياً (تتطلب صلاحية الأدمن والاتصال).");
  }

  // 2. Local storage & state sync ONLY after Cloud Firestore succeeds
  try {
    const deletedIds = getLocalDeletedTeacherIds();
    if (!deletedIds.includes(teacherId)) {
      const updatedDeleted = [...deletedIds, teacherId];
      localStorage.setItem(LOCAL_STORAGE_DELETED_TEACHERS, JSON.stringify(updatedDeleted));
    }

    const currentTeachers = getLocalTeachers();
    const updatedTeachers = currentTeachers.filter((t) => t.id !== teacherId);
    localStorage.setItem(LOCAL_STORAGE_TEACHERS, JSON.stringify(updatedTeachers));
  } catch (err) {
    console.warn("Local teacher delete cache update warning:", err);
  }
}

/**
 * Add or update a teacher in Cloud Firestore & LocalStorage
 */
export async function addTeacher(teacher: TeacherEvaluation): Promise<void> {
  // 1. Cloud Firestore sync FIRST
  try {
    await setDoc(doc(db, "teachers", teacher.id), teacher, { merge: true });
  } catch (err: any) {
    console.error("Firestore addTeacher error:", err);
    throw new Error("فشل إضافة المعلم سحابياً (تتطلب صلاحية الأدمن والاتصال).");
  }

  // 2. Local storage sync ONLY after Firestore succeeds
  try {
    const current = getLocalTeachers();
    const updated = [teacher, ...current.filter((t) => t.id !== teacher.id)];
    localStorage.setItem(LOCAL_STORAGE_TEACHERS, JSON.stringify(updated));
  } catch (err) {
    console.warn("LocalStorage teacher add cache update warning:", err);
  }
}

/**
 * Subscribe to live teachers list with instant local updates and Firestore sync
 */
export function subscribeTeachers(onUpdate: (teachers: TeacherEvaluation[]) => void): () => void {
  // Immediately emit current local state
  onUpdate(getLocalTeachers());

  let unsubDeleted: (() => void) | null = null;
  let unsubTeachers: (() => void) | null = null;

  try {
    // 1. Listen for deleted teacher IDs in Cloud Firestore
    const deletedCol = collection(db, "global_deleted_items");
    unsubDeleted = onSnapshot(
      deletedCol,
      (snap) => {
        const localDeleted = getLocalDeletedTeacherIds();
        const deletedSet = new Set<string>(localDeleted);

        snap.docs.forEach((d) => {
          const data = d.data();
          if (data.itemType === "teacher" || d.id.startsWith("t-")) {
            deletedSet.add(d.id);
          }
        });

        const updatedDeletedList = Array.from(deletedSet);
        try {
          localStorage.setItem(LOCAL_STORAGE_DELETED_TEACHERS, JSON.stringify(updatedDeletedList));
        } catch {}

        const activeTeachers = getLocalTeachers().filter((t) => !updatedDeletedList.includes(t.id));
        onUpdate(activeTeachers);
      },
      (err) => console.warn("Firestore deleted teachers listener warning:", err)
    );

    // 2. Listen for teachers collection in Cloud Firestore
    const teachersCol = collection(db, "teachers");
    unsubTeachers = onSnapshot(
      teachersCol,
      (snap) => {
        const remoteTeachers: TeacherEvaluation[] = snap.docs.map((d) => d.data() as TeacherEvaluation);
        const deletedIds = getLocalDeletedTeacherIds();

        const combinedMap = new Map<string, TeacherEvaluation>();
        // Add defaults first
        DEFAULT_TEACHERS.forEach((t) => {
          if (!deletedIds.includes(t.id)) combinedMap.set(t.id, t);
        });
        // Add local cached teachers
        getLocalTeachers().forEach((t) => {
          if (!deletedIds.includes(t.id)) combinedMap.set(t.id, t);
        });
        // Add remote Firestore teachers
        remoteTeachers.forEach((t) => {
          if (!deletedIds.includes(t.id)) combinedMap.set(t.id, t);
        });

        const finalTeachers = Array.from(combinedMap.values());
        try {
          localStorage.setItem(LOCAL_STORAGE_TEACHERS, JSON.stringify(finalTeachers));
        } catch {}
        onUpdate(finalTeachers);
      },
      (err) => console.warn("Firestore teachers listener warning:", err)
    );
  } catch (e) {}

  return () => {
    if (unsubDeleted) unsubDeleted();
    if (unsubTeachers) unsubTeachers();
  };
}
