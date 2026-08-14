import { useState } from "react";
import { motion } from "motion/react";
import { RotateCw, CheckCircle2, XCircle, Sparkles, Layers, RefreshCw } from "lucide-react";

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  category: string;
  hint?: string;
}

interface Deck {
  id: string;
  title: string;
  subject: string;
  count: number;
  cards: Flashcard[];
}

const sampleDecks: Deck[] = [
  {
    id: "physics-1",
    title: "قوانين الحركة والنيوتنية",
    subject: "الفيزياء",
    count: 5,
    cards: [
      {
        id: "c1",
        category: "الفيزياء",
        question: "ما هو قانون نيوتن الثاني للحركة؟",
        answer: "تسارع الجسم يتناسب طردياً مع القوة المحصلة المؤثرة عليه وعكسياً مع كتلته (F = m × a).",
        hint: "يتعلق بالعلاقة بين القوة والكتلة والتسارع."
      },
      {
        id: "c2",
        category: "الفيزياء",
        question: "ما هي وحدة قياس القوة في النظام الدولي للوحدات؟",
        answer: "النيوتن (Newton)، وتكافئ 1 kg·m/s².",
        hint: "سميت تيمناً بالعالم إسحاق نيوتن."
      },
      {
        id: "c3",
        category: "الفيزياء",
        question: "ما هو الفرق بين السرعة المتجهة والسرعة القياسية؟",
        answer: "السرعة القياسية كمية عدادية تعبر عن المقدار فقط، بينما السرعة المتجهة تحدد المقدار والاتجاه معاً.",
        hint: "إحداهما تتطلب اتجاهاً والأخرى لا."
      },
      {
        id: "c4",
        category: "الفيزياء",
        question: "ما المقصود بالقصور الذاتي؟",
        answer: "خاصية مقاومة الجسم للتغيير في حالته الحركية من السكون أو الحركة في خط مستقيم وبسرعة ثابتة.",
        hint: "قانون نيوتن الأول."
      },
      {
        id: "c5",
        category: "الفيزياء",
        question: "ما هي الطاقة الحركية وكيف تُحسب؟",
        answer: "هي الطاقة التي يمتلكها الجسم بسبب حركته، وتُحسب بالقانون: KE = ½ × m × v².",
        hint: "تعتمد على النصف والكتلة ومربع السرعة."
      }
    ]
  },
  {
    id: "chem-1",
    title: "أساسيات الكيمياء العضوية",
    subject: "الكيمياء",
    count: 4,
    cards: [
      {
        id: "ch1",
        category: "الكيمياء",
        question: "ما هي الألكانات وما صيغتها العامة؟",
        answer: "هيدروكربونات مشبعة تحتوي على روابط أحادية فقط، وصيغتها العامة CₙH₂ₙ₊₂.",
        hint: "أبسط مثال عليها هو الميثان CH₄."
      },
      {
        id: "ch2",
        category: "الكيمياء",
        question: "ما هي المجموعة الوظيفية المميزة للكحولات؟",
        answer: "مجموعة الهيدروكسيل (-OH).",
        hint: "تتكون من الأكسجين والهيدروجين."
      },
      {
        id: "ch3",
        category: "الكيمياء",
        question: "ما الفرق بين الألكينات والألكاينات؟",
        answer: "الألكينات تحتوي على رابطة ثنائية (C=C)، بينما الألكاينات تحتوي على رابطة ثلاثية (C≡C).",
        hint: "الفرق في عدد الروابط بين ذرات الكربون."
      },
      {
        id: "ch4",
        category: "الكيمياء",
        question: "ما هي الصيغة البنائية للبنزين العطري؟",
        answer: "حلقة سداسية كربونية متبادلة الروابط الأحادية والثنائية C₆H₆.",
        hint: "حلقة كيكولي المشهورة."
      }
    ]
  },
  {
    id: "math-1",
    title: "المتطابقات المثلثية الأساسية",
    subject: "الرياضيات",
    count: 4,
    cards: [
      {
        id: "m1",
        category: "الرياضيات",
        question: "ما هي متطابقة فيثاغورس المثلثية الرئيسية؟",
        answer: "sin²(x) + cos²(x) = 1",
        hint: "مجموع مربعي الجيب وجيب التمام."
      },
      {
        id: "m2",
        category: "الرياضيات",
        question: "ما هو قانون tan(x) بدلالة sin(x) و cos(x)؟",
        answer: "tan(x) = sin(x) / cos(x) بشرط cos(x) ≠ 0.",
        hint: "قسمة الجيب على جيب التمام."
      },
      {
        id: "m3",
        category: "الرياضيات",
        question: "ما هي المتطابقة لـ sin(2x)؟",
        answer: "sin(2x) = 2 × sin(x) × cos(x)",
        hint: "ضعف الزاوية للجيب."
      },
      {
        id: "m4",
        category: "الرياضيات",
        question: "ما هو مقلوب جيب التمام cos(x)؟",
        answer: "القاطع sec(x) = 1 / cos(x).",
        hint: "يبدأ بحرف السين بالعربية / القاطع بالإنجليزية."
      }
    ]
  }
];

export default function Flashcards() {
  const [selectedDeck, setSelectedDeck] = useState<Deck>(sampleDecks[0]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [knownCount, setKnownCount] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [showSummary, setShowSummary] = useState<boolean>(false);

  const currentCard = selectedDeck.cards[currentIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = (known: boolean) => {
    if (known) {
      setKnownCount((prev) => prev + 1);
    } else {
      setReviewCount((prev) => prev + 1);
    }

    setIsFlipped(false);

    if (currentIndex + 1 < selectedDeck.cards.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnownCount(0);
    setReviewCount(0);
    setShowSummary(false);
  };

  const handleSelectDeck = (deck: Deck) => {
    setSelectedDeck(deck);
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnownCount(0);
    setReviewCount(0);
    setShowSummary(false);
  };

  const progressPercent = Math.round(((currentIndex + (showSummary ? 1 : 0)) / selectedDeck.cards.length) * 100);

  return (
    <div className="flex flex-col gap-section-padding min-h-[75vh] items-center">
      {/* Header Info */}
      <section className="flex flex-col items-center text-center max-w-2xl gap-stack-sm">
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full text-label-sm font-medium mb-2">
          <Layers className="w-4 h-4" />
          <span>المراجعة التفاعلية السريعة</span>
        </div>
        <h1 className="text-display-ar font-display-ar text-on-surface">بطاقات الفلاش كارد</h1>
        <p className="text-body-lg font-body-lg text-on-surface-variant">
          استحضر المفاهيم والقوانين والتعاريف بسرعة عبر تقنية التذكر الفعال والتكرار المتباعد.
        </p>
      </section>

      {/* Deck Selector Tabs */}
      <div className="flex flex-wrap justify-center gap-3 w-full max-w-3xl">
        {sampleDecks.map((deck) => {
          const isActive = deck.id === selectedDeck.id;
          return (
            <button
              key={deck.id}
              onClick={() => handleSelectDeck(deck)}
              className={`px-5 py-2.5 rounded-lg text-label-sm font-medium transition-all duration-300 flex items-center gap-2 border ${
                isActive
                  ? "bg-primary text-on-primary border-primary shadow-lg shadow-primary/10 scale-105"
                  : "bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:border-primary/50 hover:text-on-surface"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{deck.title}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full ${isActive ? "bg-on-primary/20 text-on-primary" : "bg-surface-container-high text-on-surface-variant"}`}>
                {deck.cards.length} بطاقات
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Flashcard Container */}
      {!showSummary ? (
        <div className="w-full max-w-xl flex flex-col items-center gap-stack-md mt-4">
          {/* Progress Bar & Counter */}
          <div className="w-full flex items-center justify-between text-label-sm text-on-surface-variant mb-1">
            <span>البطاقة {currentIndex + 1} من {selectedDeck.cards.length}</span>
            <span>التقدم: {progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* 3D Flip Card */}
          <div className="w-full perspective-1000 my-4">
            <motion.div
              onClick={handleFlip}
              className="relative w-full h-[320px] cursor-pointer rounded-2xl border border-outline-variant/30 bg-surface-container-low shadow-xl p-8 flex flex-col justify-between items-center text-center transition-all duration-500 hover:border-primary/60 group"
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Front Side */}
              <div
                className="absolute inset-0 p-8 flex flex-col justify-between items-center backface-hidden"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="flex justify-between items-center w-full text-label-sm text-on-surface-variant/70">
                  <span className="bg-surface-container-high px-3 py-1 rounded-full text-primary border border-primary/10 font-medium">
                    {currentCard.category}
                  </span>
                  <span className="flex items-center gap-1 text-[12px]">
                    <RotateCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" /> انقر للقلب
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center my-auto px-4">
                  <span className="text-body-md text-on-surface-variant mb-2">السؤال:</span>
                  <h3 className="text-headline-lg font-headline-lg text-on-surface leading-relaxed">
                    {currentCard.question}
                  </h3>
                </div>

                {currentCard.hint && (
                  <p className="text-label-sm text-on-surface-variant/60 bg-surface-container/60 px-4 py-1.5 rounded-lg border border-outline-variant/10">
                    💡 تلميح: {currentCard.hint}
                  </p>
                )}
              </div>

              {/* Back Side (Answer) */}
              <div
                className="absolute inset-0 p-8 flex flex-col justify-between items-center bg-surface-container rounded-2xl border border-primary/40 backface-hidden"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)"
                }}
              >
                <div className="flex justify-between items-center w-full text-label-sm text-on-surface-variant/70">
                  <span className="bg-primary/20 text-primary px-3 py-1 rounded-full font-medium">
                    الإجابة الصحيحة
                  </span>
                  <span className="flex items-center gap-1 text-[12px] text-primary">
                    <RotateCw className="w-3.5 h-3.5" /> انقر للقلب
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center my-auto px-4">
                  <p className="text-headline-md font-headline-md text-on-surface leading-relaxed">
                    {currentCard.answer}
                  </p>
                </div>

                <div className="text-label-sm text-primary/80">
                  قم بتقييم حفظك للبطاقة أدناه ↓
                </div>
              </div>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 w-full justify-center mt-2">
            <button
              onClick={() => handleNext(false)}
              className="flex-1 py-3.5 px-6 rounded-xl border border-error/40 text-error bg-error/5 hover:bg-error/15 transition-all duration-300 flex items-center justify-center gap-2 text-body-md font-medium"
            >
              <XCircle className="w-5 h-5" />
              <span>بحاجة للمراجعة</span>
            </button>

            <button
              onClick={() => handleNext(true)}
              className="flex-1 py-3.5 px-6 rounded-xl border border-primary/40 text-primary bg-primary/10 hover:bg-primary/20 transition-all duration-300 flex items-center justify-center gap-2 text-body-md font-medium"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>أعرفها جيداً</span>
            </button>
          </div>
        </div>
      ) : (
        /* Summary Section when deck completes */
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg bg-surface-container-low border border-outline-variant/30 rounded-2xl p-8 flex flex-col items-center text-center gap-6 mt-6 shadow-2xl"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mb-2">
            <Sparkles className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-headline-lg text-on-surface mb-2">أحسنت! أكملت هذه المجموعة</h2>
            <p className="text-body-md text-on-surface-variant">مراجعة هادئة ومستمرة تحقق الإتقان التام.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full my-2">
            <div className="bg-surface-container p-4 rounded-xl border border-primary/20 flex flex-col items-center">
              <span className="text-headline-lg font-bold text-primary">{knownCount}</span>
              <span className="text-label-sm text-on-surface-variant">مستوعبة تماماً</span>
            </div>
            <div className="bg-surface-container p-4 rounded-xl border border-error/20 flex flex-col items-center">
              <span className="text-headline-lg font-bold text-error">{reviewCount}</span>
              <span className="text-label-sm text-on-surface-variant">تحتاج إعادة مراجعة</span>
            </div>
          </div>

          <button
            onClick={handleRestart}
            className="w-full py-3.5 rounded-xl bg-primary text-on-primary hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 text-body-md font-medium"
          >
            <RefreshCw className="w-5 h-5" />
            <span>إعادة مراجعة المجموعة</span>
          </button>
        </motion.div>
      )}
    </div>
  );
}
