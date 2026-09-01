import { db } from "./firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";

export interface SubjectUnit {
  id: string;
  unitTitle: string; // e.g. "الباب الأول: الفيزياء الكهربية"
  lessons: string[]; // e.g. ["التيار الكهربي وقانون أوم", "قوانين كيرشوف"]
}

export interface SubjectUnitsMap {
  [subjectId: string]: SubjectUnit[];
}

// All units & lessons are 100% dynamic and managed via Admin Panel or Cloud Firestore
export const DEFAULT_SUBJECT_UNITS: SubjectUnitsMap = {
  physics: [
    {
      id: "u-phys-1",
      unitTitle: "الوحدة الأولى: الكهربية التيارية والكهرومغناطيسية - الفصل 1: التيار الكهربي وقانون أوم وقانونا كيرشوف",
      lessons: [
        "الدرس الأول: التيار الكهربي وقانون أوم",
        "الدرس الثاني: توصيل المقاومات",
        "الدرس الثالث: قانون أوم للدائرة المغلقة",
        "الدرس الرابع: قانونا كيرشوف"
      ]
    },
    {
      id: "u-phys-2",
      unitTitle: "الفصل 2: التأثير المغناطيسي للتيار الكهربي وأجهزة القياس الكهربي",
      lessons: [
        "الدرس الأول: التأثير المغناطيسي للتيار الكهربي",
        "الدرس الثاني: تابع التأثير المغناطيسي للتيار الكهربي",
        "الدرس الثالث: القوة المغناطيسية - عزم الازدواج",
        "الدرس الرابع: أجهزة القياس الكهربي"
      ]
    },
    {
      id: "u-phys-3",
      unitTitle: "الفصل 3: الحث الكهرومغناطيسي",
      lessons: [
        "الدرس الأول: قانون فاراداي - القوة الدافعة الكهربية المستحثة في سلك مستقيم",
        "الدرس الثاني: الحث المتبادل بين ملفين - الحث الذاتي لملف",
        "الدرس الثالث: المولد الكهربي",
        "الدرس الرابع: المحول الكهربي - المحرك الكهربي"
      ]
    },
    {
      id: "u-phys-4",
      unitTitle: "الفصل 4: دوائر التيار المتردد",
      lessons: [
        "الدرس الأول: دوائر التيار المتردد",
        "الدرس الثاني: تابع دوائر التيار المتردد",
        "الدرس الثالث: الدائرة المهتزة - دائرة الرنين"
      ]
    },
    {
      id: "u-phys-5",
      unitTitle: "الوحدة الثانية: مقدمة في الفيزياء الحديثة - الفصل 5: ازدواجية الموجة والجسيم",
      lessons: [
        "الدرس الأول: إشعاع الجسم الأسود - الانبعاث الحراري والتأثير الكهروضوئي",
        "الدرس الثاني: ظاهرة كومتون - الطبيعة الموجية للجسيم - المجهر الإلكتروني"
      ]
    },
    {
      id: "u-phys-6",
      unitTitle: "الفصل 6 و 7 و 8: الأطياف الذرية والليزر والإلكترونيات الحديثة",
      lessons: [
        "الأطياف الذرية",
        "الليزر",
        "الدرس الأول: أشباه الموصلات - الوصلة الثنائية",
        "الدرس الثاني: الترانزستور - الإلكترونيات التناظرية والرقمية"
      ]
    }
  ],

  chemistry: [
    {
      id: "u-chem-1",
      unitTitle: "الباب 1: العناصر الانتقالية",
      lessons: [
        "الدرس الأول: من بداية الباب إلى ما قبل الخصائص العامة لعناصر السلسلة الانتقالية الأولى",
        "الدرس الثاني: من الخصائص العامة لعناصر السلسلة الانتقالية الأولى إلى ما قبل فلز الحديد",
        "الدرس الثالث: من فلز الحديد إلى ما قبل خواص الحديد",
        "الدرس الرابع: من خواص الحديد إلى نهاية الباب"
      ]
    },
    {
      id: "u-chem-2",
      unitTitle: "الباب 2: التحليل الكيميائي",
      lessons: [
        "الدرس الأول: من بداية الباب إلى ما قبل الكشف عن الكاتيونات",
        "الدرس الثاني: من الكشف عن الكاتيونات إلى ما قبل التحليل الكيميائي الكمي",
        "الدرس الثالث: من التحليل الكيميائي الكمي إلى نهاية الباب"
      ]
    },
    {
      id: "u-chem-3",
      unitTitle: "الباب 3: الاتزان الكيميائي",
      lessons: [
        "الدرس الأول: من بداية الباب إلى ما قبل تأثير تركيز المواد المتفاعلة على معدل التفاعل الكيميائي",
        "الدرس الثاني: من تأثير تركيز المواد المتفاعلة إلى ما قبل تأثير درجة الحرارة",
        "الدرس الثالث: من تأثير درجة الحرارة إلى ما قبل الاتزان الأيوني",
        "الدرس الرابع: من الاتزان الأيوني إلى نهاية الباب"
      ]
    },
    {
      id: "u-chem-4",
      unitTitle: "الباب 4: الكيمياء الكهربية",
      lessons: [
        "الدرس الأول: من بداية الباب إلى ما قبل الخلايا الجلفانية وإنتاج الطاقة الكهربية",
        "الدرس الثاني: من الخلايا الجلفانية إلى ما قبل تآكل المعادن",
        "الدرس الثالث: من تآكل المعادن إلى ما قبل الخلايا الإلكتروليتية",
        "الدرس الرابع: من الخلايا الإلكتروليتية إلى ما قبل تطبيقات على التحليل الكهربي",
        "الدرس الخامس: من تطبيقات على التحليل الكهربي إلى نهاية الباب"
      ]
    },
    {
      id: "u-chem-5",
      unitTitle: "الباب 5: الكيمياء العضوية",
      lessons: [
        "الدرس الأول: من بداية الباب إلى ما قبل الألكانات",
        "الدرس الثاني: الألكانات",
        "الدرس الثالث: الميثان",
        "الدرس الرابع: الألكينات (الأوليفينات)",
        "الدرس الخامس: الألكاينات (الأسيتيلينات)",
        "الدرس السادس: الهيدروكربونات الحلقية",
        "الدرس السابع: البنزين العطري",
        "الدرس الثامن: مشتقات الهيدروكربونات",
        "الدرس التاسع: الإيثانول",
        "الدرس العاشر: الفينولات",
        "الدرس الحادي عشر: الأحماض الكربوكسيلية",
        "الدرس الثاني عشر: الإسترات"
      ]
    }
  ],

  biology: [
    {
      id: "u-bio-1",
      unitTitle: "الفصل 1: الدعامة والحركة في الكائنات الحية",
      lessons: [
        "الدرس الأول: الدعامة في الكائنات الحية",
        "الدرس الثاني: الحركة في الكائنات الحية"
      ]
    },
    {
      id: "u-bio-2",
      unitTitle: "الفصل 2: التنسيق الهرموني في الكائنات الحية",
      lessons: [
        "الدرس الأول: التنسيق الهرموني في الكائنات الحية",
        "الدرس الثاني: تابع الغدد في الإنسان"
      ]
    },
    {
      id: "u-bio-3",
      unitTitle: "الفصل 3: التكاثر في الكائنات الحية",
      lessons: [
        "الدرس الأول: طرق التكاثر في الكائنات الحية",
        "الدرس الثاني: تابع طرق التكاثر في الكائنات الحية",
        "الدرس الثالث: التكاثر في النباتات الزهرية",
        "الدرس الرابع: التكاثر في الإنسان",
        "الدرس الخامس: تابع التكاثر في الإنسان"
      ]
    },
    {
      id: "u-bio-4",
      unitTitle: "الفصل 4: المناعة في الكائنات الحية",
      lessons: [
        "الدرس الأول: المناعة في النبات",
        "الدرس الثاني: المناعة في الإنسان",
        "الدرس الثالث: آلية عمل الجهاز المناعي في الإنسان"
      ]
    },
    {
      id: "u-bio-5",
      unitTitle: "الفصل 5: الحمض النووي DNA والمعلومات الوراثية",
      lessons: [
        "الدرس الأول: جهود العلماء لمعرفة المادة الوراثية للكائن الحي",
        "الدرس الثاني: الحمض النووي DNA",
        "الدرس الثالث: DNA في أوليات وحقيقيات النواة - تركيب المحتوى الجيني - الطفرات"
      ]
    },
    {
      id: "u-bio-6",
      unitTitle: "الفصل 6: الأحماض النووية وتخليق البروتين والتكنولوجيا الجزيئية",
      lessons: [
        "الدرس الأول: RNA وتخليق البروتين",
        "الدرس الثاني: التكنولوجيا الجزيئية «الهندسة الوراثية»"
      ]
    },
    {
      id: "u-bio-7",
      unitTitle: "الفصل 7: الأحياء وعلوم الأرض (الجيولوجيا)",
      lessons: [
        "الدرس الأول: علم الجيولوجيا ومادة الأرض - مكونات كوكب الأرض",
        "الدرس الثاني: التراكيب الجيولوجية لصخور القشرة الأرضية",
        "الدرس الثالث: المعادن والخواص الفيزيائية للمعادن",
        "الدرس الرابع: أنواع الصخور (النارية، الرسوبية، المتحولة) ودورة الصخور"
      ]
    }
  ],

  math: [
    {
      id: "u-math-1",
      unitTitle: "الرياضيات البحتة: الجبر والهندسة الفراغية",
      lessons: [
        "الوحدة الأولى: نظرية ذات الحدين",
        "الوحدة الثانية: الأعداد المركبة",
        "الوحدة الثالثة: الهندسة والقياس في ثلاثة أبعاد",
        "الوحدة الرابعة: الخطوط المستقيمة والمستويات في الفراغ"
      ]
    },
    {
      id: "u-math-2",
      unitTitle: "الرياضيات البحتة: التفاضل والتكامل",
      lessons: [
        "الوحدة الأولى: الاشتقاق وتطبيقاته",
        "الوحدة الثانية: سلوك الدالة ورسم المنحنيات",
        "الوحدة الثالثة: التكامل المحدد وتطبيقاته"
      ]
    },
    {
      id: "u-math-3",
      unitTitle: "الرياضيات التطبيقية: الاستاتيكا",
      lessons: [
        "الوحدة الأولى: العزوم",
        "الوحدة الثانية: القوى المستوية",
        "الوحدة الثالثة: الازدواجات"
      ]
    },
    {
      id: "u-math-4",
      unitTitle: "الرياضيات التطبيقية: الديناميكا",
      lessons: [
        "الوحدة الأولى: الحركة في خط مستقيم",
        "الوحدة الثانية: تطبيقات على قوانين نيوتن للحركة",
        "الوحدة الثالثة: الشغل - الطاقة - القدرة"
      ]
    }
  ],

  grammar: [
    {
      id: "u-gram-1",
      unitTitle: "النحو: التوابع (النعت، التوكيد، البدل، العطف)",
      lessons: [
        "النعت: تعريفه وأقسامه وتعدده وإعرابه",
        "التوكيد: التوكيد المعنوي واللفظي وأحكامهما",
        "عطف البيان وعطف النسق وأحرف العطف",
        "البدل: تعريفه وأقسامه وإبدال الظاهر من الضمير"
      ]
    },
    {
      id: "u-gram-2",
      unitTitle: "النحو: النداء والاختصاص والتحذير والإغراء وأسماء الأفعال",
      lessons: [
        "النداء: أقسام المنادى وأحكامه وحذف حرف النداء",
        "أساليب الاختصاص والتحذير والإغراء",
        "أسماء الأفعال والأصوات",
        "الممنوع من الصرف: علل المنع وإعرابه"
      ]
    },
    {
      id: "u-gram-3",
      unitTitle: "النحو: إعراب الفعل والعدد وكناياته",
      lessons: [
        "إعراب الفعل: رفع ونواصب وجوازم المضارع",
        "أحكام الشرط وجوابه واجتماع الشرط والقسم",
        "العدد: أقسامه وصياغته وتمييزه",
        "كنايات العدد (كم، كذا، كأين)"
      ]
    },
    {
      id: "u-sarf-1",
      unitTitle: "الصرف: همزتا الوصل والقطع والإبدال والإعلال",
      lessons: [
        "همزتا الوصل والقطع",
        "الإبدال والإعلال: إبدال أحرف العلة همزة والهمزتان الملتقيتان",
        "الإبدال بين أحرف العلة وفي صيغة (الافتِعال)",
        "الإعلال بالنقل والحذف والإدغام والكلمات الشاذة"
      ]
    }
  ],

  rhetoric: [
    {
      id: "u-rhet-1",
      unitTitle: "الوحدة الأولى: المجاز اللغوي والاستعارة",
      lessons: [
        "الحقيقة والمجاز اللغويان والمجاز المرسل",
        "الاستعارة: تعريفها، أركانها، قرينتها",
        "تقسيم الاستعارة إلى تصريحية ومكنية، وأصلية وتبيعية",
        "مرشحة ومجردة ومطلقة ومفردة وتمثيلية"
      ]
    },
    {
      id: "u-rhet-2",
      unitTitle: "الوحدة الثانية والثالثة: الكناية وعلم البديع",
      lessons: [
        "الكناية: تعريفها، أقسامها، بلاغتها",
        "المحسنات المعنوية: الطباق، المقابلة، التورية، مراعاة النظير، المبالغة، حسن التعليل",
        "المحسنات اللفظية: الجناس والسجع"
      ]
    }
  ],

  literature: [
    {
      id: "u-lit-1",
      unitTitle: "الأدب: النهضة الأدبية، والمدارس الشعرية، وفنون النثر",
      lessons: [
        "عوامل النهضة الأدبية الحديثة ودور الأزهر الشريف",
        "مدارس الشعر الحديث: الإحياء والبعث، الوجداني، الديوان، المهجر، أبولو",
        "فنون النثر الحديث: الخطابة، الكتابة، المقالة، القصة، المسرحية"
      ]
    },
    {
      id: "u-lit-2",
      unitTitle: "النصوص الشعرية والنثرية المقررة",
      lessons: [
        "طيف سميرة - محمود سامي البارودي",
        "رحلة عابسة - أحمد محرم",
        "نهج البردة ومسرحية كليوباترا - أحمد شوقي",
        "آه من التراب (رثاء مي زيادة) - إسماعيل صبري",
        "قصيدة (أنا) - إيليا أبو ماضي",
        "صخرة الملتقى - د. إبراهيم ناجي",
        "خطبة الشيخ المراغي ومقال الزيات (يا هادي الطريق جرت)"
      ]
    }
  ],

  fiqh: [
    {
      id: "u-fiqh-1",
      unitTitle: "الفقه: أحكام الأسرة والأحوال الشخصية",
      lessons: [
        "فصل في الخُلع",
        "فصل في الطلاق",
        "فصل في الرجعة",
        "فصل في الظهار",
        "فصل في العِدَد",
        "فصل في الرضاع",
        "فصل في الحضانة"
      ]
    }
  ],

  tafseer: [
    {
      id: "u-taf-1",
      unitTitle: "سورة الذاريات وسورة الطور",
      lessons: [
        "سورة الذاريات: من الآية (1) إلى الآية (55)",
        "سورة الذاريات: من الآية (56) إلى نهاية السورة",
        "سورة الطور: من الآية (1) إلى الآية (29)",
        "سورة الطور: من الآية (30) إلى نهاية السورة"
      ]
    },
    {
      id: "u-taf-2",
      unitTitle: "سورة النجم وسورة القمر",
      lessons: [
        "سورة النجم: من الآية (1) إلى الآية (26)",
        "سورة النجم: من الآية (27) إلى نهاية السورة",
        "سورة القمر: من الآية (1) إلى الآية (42)",
        "سورة القمر: من الآية (43) إلى نهاية السورة"
      ]
    }
  ],

  hadith: [
    {
      id: "u-had-1",
      unitTitle: "الأحاديث الشريفة المقررة (القسم الأول: 1 - 10)",
      lessons: [
        "1- فضل إطعام الطعام وإفشاء السلام",
        "2- حرمة المسلم",
        "3- حرمة تقاتل المسلمين",
        "4- تحريم قتال المسلمين والتشديد فيه",
        "5- فضل الشهادتين",
        "6- حرمة الدماء",
        "7- وجوب طاعة النبي ﷺ",
        "8- لن يدخل أحداً عمله الجنة",
        "9- صفة الجنة ونعيمها",
        "10- حسن خلقه ﷺ"
      ]
    },
    {
      id: "u-had-2",
      unitTitle: "الأحاديث الشريفة المقررة (القسم الثاني: 11 - 20)",
      lessons: [
        "11- بر الوالدين",
        "12- البر بالآباء ولو كانوا مشركين",
        "13- فضل تلاوة القرآن وتعهده",
        "14- الزهد في الدنيا",
        "15- من جوامع دعاء النبي ﷺ",
        "16- الرضا بنعم الله تعالى",
        "17- مراعاة شعور الغير",
        "18- سعة رحمة الله تعالى",
        "19- الرحمة بالصبيان",
        "20- حسن الظن بالله تعالى"
      ]
    }
  ],

  tawheed: [
    {
      id: "u-taw-1",
      unitTitle: "التوحيد: السمعيات والغيبيات (القسم الأول)",
      lessons: [
        "الملائكة والجن والشياطين",
        "الموت وأجل المقتول والنفخ في الصور والروح",
        "سؤال القبر ونعيمه وعذابه والبعث واليوم الآخر",
        "الشفاعة والحسنات والسيئات والتوبة والتكفير"
      ]
    },
    {
      id: "u-taw-2",
      unitTitle: "التوحيد: السمعيات والآثار الإيمانية (القسم الثاني)",
      lessons: [
        "الذنوب كبائر وصغائر وحكم مرتكب الكبيرة",
        "صحائف الأعمال والوزن والميزان والصراط والحوض",
        "الإيمان بالعرش والكرسي والقلم واللوح والجنة والنار",
        "الكليات الخمس والمعلوم من الدين بالضرورة والإمامة"
      ]
    }
  ],

  english: [
    {
      id: "u-eng-1",
      unitTitle: "English: Units 1 to 3 & Review 1",
      lessons: [
        "Unit 1: Past Simple",
        "Unit 2: Past Continuous",
        "Unit 3: Subjunctive, Regret, Blame & Wishing",
        "Review 1: Linking Words"
      ]
    },
    {
      id: "u-eng-2",
      unitTitle: "English: Units 4 to 6 & Review 2",
      lessons: [
        "Unit 4: Future Forms",
        "Unit 5: 'If' Conditionals",
        "Unit 6: Conditional Alternatives",
        "Review 2: So / Such / Too / Enough"
      ]
    },
    {
      id: "u-eng-3",
      unitTitle: "English: Novel, Writing & Vocabulary",
      lessons: [
        "The Novel: The Count of Monte Cristo",
        "Writing Skills: Punctuation, Paragraph, Essay & Email",
        "Vocabulary: Translation & Comprehension Skills"
      ]
    }
  ],

  quran: [
    {
      id: "u-qur-1",
      unitTitle: "القرآن الكريم والتلاوة والتجويد",
      lessons: [
        "مراجعة السور المقررة حفظاً وتلاوة",
        "أحكام التجويد وقواعد التلاوة الفرعية"
      ]
    }
  ]
};

const LOCAL_STORAGE_UNITS_MAP = "wathaq_subject_units_map";

export function getStoredSubjectUnits(): SubjectUnitsMap {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_UNITS_MAP);
    if (!saved) return DEFAULT_SUBJECT_UNITS;
    const parsed: SubjectUnitsMap = JSON.parse(saved);

    // Merge default subject units for any missing keys to ensure full coverage
    const merged: SubjectUnitsMap = { ...DEFAULT_SUBJECT_UNITS };
    Object.keys(parsed).forEach((key) => {
      if (parsed[key] && parsed[key].length > 0) {
        merged[key] = parsed[key];
      }
    });
    return merged;
  } catch (e) {
    return DEFAULT_SUBJECT_UNITS;
  }
}

export function getStoredLessons(): Record<string, string[]> {
  const unitsMap = getStoredSubjectUnits();
  const flatMap: Record<string, string[]> = {};

  Object.keys(unitsMap).forEach((subId) => {
    const units = unitsMap[subId] || [];
    const allLessons: string[] = [];
    units.forEach((u) => {
      if (u.lessons) allLessons.push(...u.lessons);
    });
    flatMap[subId] = allLessons;
  });

  return flatMap;
}

export async function saveStoredSubjectUnits(unitsMap: SubjectUnitsMap): Promise<void> {
  // 1. Cloud Firestore write FIRST (server authorization check)
  try {
    const docRef = doc(db, "curriculum_meta", "subject_units");
    await setDoc(docRef, { unitsMap, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err: unknown) {
    console.error("Firestore save units error:", err);
    throw new Error("فشل حفظ دروس وأبواب المناهج سحابياً (تتطلب صلاحية الأدمن المصرح له).");
  }

  // 2. Save to LocalStorage ONLY after Cloud Firestore succeeds
  try {
    localStorage.setItem(LOCAL_STORAGE_UNITS_MAP, JSON.stringify(unitsMap));
  } catch (e: unknown) {
    // empty
  }
}

export async function addUnitToSubject(subjectId: string, unitTitle: string): Promise<SubjectUnitsMap> {
  const current = getStoredSubjectUnits();
  const currentUnits = current[subjectId] || [];
  const newUnit: SubjectUnit = {
    id: `u-${Date.now()}`,
    unitTitle,
    lessons: []
  };

  const updatedUnits = [...currentUnits, newUnit];
  const updatedMap = { ...current, [subjectId]: updatedUnits };
  await saveStoredSubjectUnits(updatedMap);
  return updatedMap;
}

export async function removeUnitFromSubject(subjectId: string, unitId: string): Promise<SubjectUnitsMap> {
  const current = getStoredSubjectUnits();
  const currentUnits = current[subjectId] || [];
  const updatedUnits = currentUnits.filter((u) => u.id !== unitId);

  const updatedMap = { ...current, [subjectId]: updatedUnits };
  await saveStoredSubjectUnits(updatedMap);
  return updatedMap;
}

export async function addLessonToUnit(subjectId: string, unitId: string, lessonTitle: string): Promise<SubjectUnitsMap> {
  const current = getStoredSubjectUnits();
  const currentUnits = current[subjectId] || [];

  const updatedUnits = currentUnits.map((unit) => {
    if (unit.id === unitId) {
      if (unit.lessons.includes(lessonTitle)) return unit;
      return { ...unit, lessons: [...unit.lessons, lessonTitle] };
    }
    return unit;
  });

  const updatedMap = { ...current, [subjectId]: updatedUnits };
  await saveStoredSubjectUnits(updatedMap);
  return updatedMap;
}

export async function removeLessonFromUnit(subjectId: string, unitId: string, lessonTitle: string): Promise<SubjectUnitsMap> {
  const current = getStoredSubjectUnits();
  const currentUnits = current[subjectId] || [];

  const updatedUnits = currentUnits.map((unit) => {
    if (unit.id === unitId) {
      return { ...unit, lessons: unit.lessons.filter((l) => l !== lessonTitle) };
    }
    return unit;
  });

  const updatedMap = { ...current, [subjectId]: updatedUnits };
  await saveStoredSubjectUnits(updatedMap);
  return updatedMap;
}

export function subscribeUnits(onUpdate: (unitsMap: SubjectUnitsMap) => void): () => void {
  onUpdate(getStoredSubjectUnits());

  let unsub: (() => void) | null = null;
  try {
    const docRef = doc(db, "curriculum_meta", "subject_units");
    unsub = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists() && snap.data()?.unitsMap) {
          const cloudUnitsMap = snap.data().unitsMap as SubjectUnitsMap;
          try {
            localStorage.setItem(LOCAL_STORAGE_UNITS_MAP, JSON.stringify(cloudUnitsMap));
          } catch (e) {
            /* ignore storage error */
          }
          onUpdate(cloudUnitsMap);
        } else {
          onUpdate(getStoredSubjectUnits());
        }
      },
      (err) => console.warn("Units snapshot warning:", err)
    );
  } catch (e) {
    /* ignore subscription error */
  }

  return () => {
    if (unsub) unsub();
  };
}

export function subscribeLessons(onUpdate: (lessons: Record<string, string[]>) => void): () => void {
  onUpdate(getStoredLessons());
  return subscribeUnits((unitsMap) => {
    const flatMap: Record<string, string[]> = {};
    Object.keys(unitsMap).forEach((subId) => {
      const units = unitsMap[subId] || [];
      const allLessons: string[] = [];
      units.forEach((u) => {
        if (u.lessons) allLessons.push(...u.lessons);
      });
      flatMap[subId] = allLessons;
    });
    onUpdate(flatMap);
  });
}
