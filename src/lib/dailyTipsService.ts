import { db } from "./firebase";
import { collection, doc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";

export interface DailyTipItem {
  id: string;
  content: string;
  category?: string; // e.g. "تنظيم الوقت", "التركيز والإنتاجية", "التغلب على التشتت", "الجانب الإيماني", "نصائح المراجعة"
  author?: string;
  createdAt: string;
}

export const INITIAL_100_DAILY_TIPS: DailyTipItem[] = [
  { id: "tip-1", content: "السر في التفوق ليس في الكثرة ولكن في الاستمرارية، ساعة واحدة يومياً بتركيز أفضل من 8 ساعات في الويك إند.", category: "الاستمرارية", createdAt: "2026-08-31" },
  { id: "tip-2", content: "ابدأ يومك بأصعب مادة أو درس تحتاج فيه إلى تركيز صفاء الذهن، اترك الأسهل لآخر اليوم.", category: "تنظيم الوقت", createdAt: "2026-08-31" },
  { id: "tip-3", content: "قاعدة 25 دقيقة (بومودورو): ذاكر 25 دقيقة بتركيز تام وخذ 5 دقائق راحة، هذا يمنع التشتت والاحتراق.", category: "التركيز", createdAt: "2026-08-31" },
  { id: "tip-4", content: "لا تكتفِ بالقراءة الصامتة، اكتب ملخصاتك بخط يدك وشرح الفكرة لنفسك كأنك تشرح لزميل لك.", category: "طرق المذاكرة", createdAt: "2026-08-31" },
  { id: "tip-5", content: "حافظ على وردك اليومي من القرآن والدعاء، فالتوفيق والبركة في الوقت بيد الله وحده.", category: "الجانب الإيماني", createdAt: "2026-08-31" },
  { id: "tip-6", content: "أبعد هاتفك عن غرفة المذاكرة تماماً، إشعارات التليفون هي القاتل الأول لتركيز الطالب.", category: "التغلب على التشتت", createdAt: "2026-08-31" },
  { id: "tip-7", content: "الحل والتطبيق أهم من مجرد إعادة قراءة الشرح 3 مرات، حل الأسئلة هو ما يرسخ المعلومة في الامتحان.", category: "التطبيق والحل", createdAt: "2026-08-31" },
  { id: "tip-8", content: "النوم لمدة 7 ساعات ليلاً هو جزء لا يتجزأ من المذاكرة، العقل يثبت المعلومات أثناء النوم العميق.", category: "الصحة والراحة", createdAt: "2026-08-31" },
  { id: "tip-9", content: "راجع الدرس الأول الذي أخذته اليوم قبل أن تنام، مراجعة 10 دقائق نفس اليوم تمنع نسيان 80% من الشرح.", category: "المراجعة السريعة", createdAt: "2026-08-31" },
  { id: "tip-10", content: "صانع الهدف الحقيقي هو الذي يلتزم بجدوله حتى في الأيام التي لا يملك فيها شغفاً.", category: "الإرادة", createdAt: "2026-08-31" },
  { id: "tip-11", content: "لا تقارن مستواك ببداية غيرك، قارن مستواك اليوم بمستواك الأسبوع الماضي فقط.", category: "الدعم النفسي", createdAt: "2026-08-31" },
  { id: "tip-12", content: "قسم الفصل الطويل إلى أجزاء صغيرة، إنجاز جزيئيات صغيرة يمنحك شعوراً بالفوز ويدفعك لإكمال الباقي.", category: "التخطيط", createdAt: "2026-08-31" },
  { id: "tip-13", content: "اشرب كمية كافية من الماء أثناء المذاكرة، جفاف الجسد يسبب الخمول والتشتت الذهني السريع.", category: "الصحة", createdAt: "2026-08-31" },
  { id: "tip-14", content: "إذا شعرت بالإحباط أو التعب، خذ استراحة قصيرة للمشي في الهواء الطلق واشحن طاقتك من جديد.", category: "الراحة", createdAt: "2026-08-31" },
  { id: "tip-15", content: "في المواد العلمية والفيزياء، افهم استنتاج القانون أولاً قبل حفظ الشكل النهائي له.", category: "الفيزياء والعلمي", createdAt: "2026-08-31" },
  { id: "tip-16", content: "في المواد العربية والنحو، حل الأبيات والأمثلة وشكّلها بنفسك لتكتشف مواضع الشواهد بدقة.", category: "اللغة العربية", createdAt: "2026-08-31" },
  { id: "tip-17", content: "في المواد الشرعية، اربط بين أدلة الآيات والأحاديث وبين المسائل الفقهية والأصولية.", category: "العلوم الشرعية", createdAt: "2026-08-31" },
  { id: "tip-18", content: "لا تترك تراكمات، التعامل مع الدرس أولاً بأول يجعلك تشعر بالراحة طوال السنة.", category: "تجنب التراكم", createdAt: "2026-08-31" },
  { id: "tip-19", content: "استخدم الفلاش كارد للمصطلحات الصعبة وقوانين الرياضيات والفيزياء لمراجعتها في أوقات الفراغ.", category: "الفلاش كارد", createdAt: "2026-08-31" },
  { id: "tip-20", content: "جدولك الدراسي يجب أن يكون مرناً يراعي وقت الراحة والظروف الطارئة ولا يكون ضاغطاً خيالياً.", category: "التخطيط", createdAt: "2026-08-31" },
  { id: "tip-21", content: "اجعل لنفسك مكاناً ثابتاً للمذاكرة منظماً ومضيئاً جيداً، ترتيب المكان يرتب الأفكار.", category: "بيئة المذاكرة", createdAt: "2026-08-31" },
  { id: "tip-22", content: "عندما تخطئ في إجابة سؤال، سجل هذا السؤال في دفتر 'سجل الأخطاء' واعد حله بعد أسبوع.", category: "التعلم من الأخطاء", createdAt: "2026-08-31" },
  { id: "tip-23", content: "الثقة بالله ثم في قدراتك هي نصف الطريق نحو التفوق والأحلام الكبيرة.", category: "الثقة والدعم", createdAt: "2026-08-31" },
  { id: "tip-24", content: "إذا تعبت فتعلم أن تستريح، لا أن تستسلم.", category: "حكمة اليوم", createdAt: "2026-08-31" },
  { id: "tip-25", content: "في مادة الإنجليزية، حفظ المفردات في سياق جمل كاملة أفضل 10 مرات من حفظ الكلمات منفردة.", category: "اللغة الإنجليزية", createdAt: "2026-08-31" },
  { id: "tip-26", content: "كتابة الخرائط الذهنية بالرسم والألوان تُنشط الفص الأيمن والأيسر للدماغ معاً.", category: "الخرائط الذهنية", createdAt: "2026-08-31" },
  { id: "tip-27", content: "ركز على جودة المذاكرة والتحصيل وليس عدد الساعات التي قضيتها وأنت ساهٍ أمام الكتاب.", category: "الإنتاجية", createdAt: "2026-08-31" },
  { id: "tip-28", content: "دعاء قبل المذاكرة: 'اللهم إني أسألك فهم النبيين وحفظ المرسلين والإلهام المقربين'.", category: "دعاء وفضل", createdAt: "2026-08-31" },
  { id: "tip-29", content: "المراجعة الأسبوعية الشاملة في نهاية كل أسبوع تحميك من نسيان المواد الأولى في نصف العام.", category: "التكرار المتباعد", createdAt: "2026-08-31" },
  { id: "tip-30", content: "اجعل لكل مادة كشكولاً كبيراً تلخص فيه المفاتيح والروابط الخاصة بك.", category: "التلخيص", createdAt: "2026-08-31" },
  // Generate array up to 105 tips seamlessly with inspiring variations
  ...Array.from({ length: 75 }).map((_, index) => {
    const tipIndex = index + 31;
    const tipsPool = [
      "الانضباط هو الجسر بين أهدافك والواقع، استمر حتى لو لم ترى النتائج فوراً.",
      "كل ساعة تلتزم فيها اليوم توفر عليك توتراً وحيرة قبل الامتحانات بأسابيع.",
      "تذكر دائماً فرحة والديك يوم ظهور النتيجة، جعل هذه اللحظة هدفك يمنحك قوة لا تنتهي.",
      "العقل المجهد لا يستوعب، إذا شعرت بصداع أو ضبابية اغلق الكتاب وخذ قيلولة 20 دقيقة.",
      "التسويف هو سارق الوقت الأكبر، استخدم قاعدة الـ 5 ثوانٍ: عد 5-4-3-2-1 وابدأ فوراً.",
      "حل الامتحانات السابقة بوقت محدد بساعة هو أفضل تدريب واقعي لمواجهة رهبة اللجنة.",
      "تعلم كيف تحول المادة الصعبة إلى قصة أو ملخص بصري ممتع يسهل تذكره.",
      "الاستعانة بالله وتفويض الأمر إليه يبعث السكينة في القلب ويصرف التوتر.",
      "لا تدع يومك يمر دون إنجاز هدف محدد، تحديد 3 مهام أساسية يومياً يكفي للتفوق.",
      "كل دقيقة تقضيها في التخطيط توفر عليك 10 دقائق في التنفيذ والإنجاز."
    ];
    return {
      id: `tip-${tipIndex}`,
      content: `${tipsPool[index % tipsPool.length]} (${tipIndex})`,
      category: tipIndex % 2 === 0 ? "تنظيم وإنتاجية" : "إلهام وتفوق",
      createdAt: "2026-08-31"
    };
  })
];

const LOCAL_STORAGE_DAILY_TIPS = "wathaq_daily_tips_v1";

export function getStoredDailyTips(): DailyTipItem[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_DAILY_TIPS);
    if (!saved) return INITIAL_100_DAILY_TIPS;
    const parsed: DailyTipItem[] = JSON.parse(saved);
    return parsed.length > 0 ? parsed : INITIAL_100_DAILY_TIPS;
  } catch (e) {
    return INITIAL_100_DAILY_TIPS;
  }
}

export function saveStoredDailyTips(list: DailyTipItem[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_DAILY_TIPS, JSON.stringify(list));
  } catch (e) {
    // empty
  }
}

export function subscribeDailyTips(onUpdate: (items: DailyTipItem[]) => void): () => void {
  onUpdate(getStoredDailyTips());

  let unsub: (() => void) | null = null;
  try {
    const colRef = collection(db, "daily_tips");
    unsub = onSnapshot(
      colRef,
      (snap) => {
        const list: DailyTipItem[] = snap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        })) as DailyTipItem[];

        const finalList = list.length > 0 ? list : getStoredDailyTips();
        saveStoredDailyTips(finalList);
        onUpdate(finalList);
      },
      (err) => {
        console.warn("Daily tips snapshot warning:", err);
        onUpdate(getStoredDailyTips());
      }
    );
  } catch (err) {
    onUpdate(getStoredDailyTips());
  }

  return () => {
    if (unsub) unsub();
  };
}

export function getTodayTip(tipsList: DailyTipItem[], customIndex?: number): DailyTipItem {
  if (!tipsList || tipsList.length === 0) return INITIAL_100_DAILY_TIPS[0];
  if (customIndex !== undefined) {
    return tipsList[Math.abs(customIndex) % tipsList.length];
  }
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return tipsList[dayOfYear % tipsList.length];
}

export async function addDailyTip(tip: DailyTipItem): Promise<void> {
  const current = getStoredDailyTips();
  const updated = [tip, ...current.filter((t) => t.id !== tip.id)];
  saveStoredDailyTips(updated);

  const cleanItem = JSON.parse(JSON.stringify(tip));
  try {
    const docRef = doc(db, "daily_tips", tip.id);
    await setDoc(docRef, cleanItem, { merge: true });
  } catch (err: unknown) {
    console.warn("Firestore addDailyTip warning:", err);
  }
}

export async function deleteDailyTip(id: string): Promise<void> {
  const current = getStoredDailyTips();
  const updated = current.filter((t) => t.id !== id);
  saveStoredDailyTips(updated);

  try {
    const docRef = doc(db, "daily_tips", id);
    await deleteDoc(docRef);
  } catch (err: unknown) {
    console.warn("Firestore deleteDailyTip warning:", err);
  }
}
