import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, GraduationCap, CheckCircle2, ChevronRight, Sparkles, BookOpen, Compass, Award } from "lucide-react";
import { StudentAcademicProfile, SystemType, getProfileLabel } from "@/lib/subjectsData";

interface StageWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: StudentAcademicProfile;
  onSaveProfile: (profile: StudentAcademicProfile) => void;
}

export function StageWizardModal({
  isOpen,
  onClose,
  currentProfile,
  onSaveProfile
}: StageWizardModalProps) {
  const [step, setStep] = useState<number>(1);
  const [selectedSystem, setSelectedSystem] = useState<SystemType>(currentProfile.system || "general");
  const [selectedBranch, setSelectedBranch] = useState<string>(currentProfile.branch || "science");
  const [selectedGrade, setSelectedGrade] = useState<string>(currentProfile.grade || "3rd");
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSelectSystem = (sys: SystemType) => {
    setSelectedSystem(sys);
    // Set default branch for chosen system
    if (sys === "azhar") {
      setSelectedBranch("scientific");
    } else {
      setSelectedBranch("science");
    }
    setStep(2);
  };

  const handleSelectBranch = (br: string) => {
    setSelectedBranch(br);
    setStep(3);
  };

  const handleSelectGrade = (gr: string) => {
    setSelectedGrade(gr);
    const finalProfile: StudentAcademicProfile = {
      system: selectedSystem,
      branch: selectedBranch,
      grade: gr
    };

    setIsCompleted(true);
    onSaveProfile(finalProfile);

    setTimeout(() => {
      setIsCompleted(false);
      setStep(1);
      onClose();
    }, 1800);
  };

  const handleReset = () => {
    setStep(1);
    setIsCompleted(false);
  };

  const calculatePreviewProfile = (): StudentAcademicProfile => ({
    system: selectedSystem,
    branch: selectedBranch,
    grade: selectedGrade
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl bg-surface-container-low border border-primary/40 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden flex flex-col gap-6 text-right"
        >
          {/* Top Bar */}
          <div className="flex justify-between items-center border-b border-outline-variant/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/30">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-headline-md font-bold text-on-surface">معالج تحديد المرحلة بـ 3 أسئلة</h3>
                <p className="text-label-sm text-on-surface-variant">أجب عن الأسئلة البسيطة لتخصيص منهجك تلقائياً</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-on-surface-variant hover:text-primary rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!isCompleted ? (
            <>
              {/* Stepper Progress Bar */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs text-on-surface-variant font-medium">
                  <span>الخطوة {step} من 3</span>
                  <span>{step === 1 ? "النظام التعليمي" : step === 2 ? "التخصص والشعبة" : "الصف الدراسي"}</span>
                </div>
                <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    animate={{ width: `${(step / 3) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Step 1: System */}
              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-4">
                  <h4 className="text-body-lg font-bold text-on-surface">1. ما هو النظام التعليمي الذي تدرس به؟</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <motion.button
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleSelectSystem("general")}
                      className={`p-5 rounded-2xl border text-right flex flex-col gap-3 transition-all cursor-pointer ${
                        selectedSystem === "general"
                          ? "bg-primary/15 border-primary text-primary shadow-lg shadow-primary/10"
                          : "bg-surface-container border-outline-variant/30 text-on-surface hover:border-primary/50"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-3xl">🎓</span>
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h5 className="font-bold text-body-lg">الثانوية العامة (التعليم العام)</h5>
                        <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                          شعب علمي علوم، علمي رياضة، أو أدبي لمختلف الصفوف الثانوية.
                        </p>
                      </div>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleSelectSystem("azhar")}
                      className={`p-5 rounded-2xl border text-right flex flex-col gap-3 transition-all cursor-pointer ${
                        selectedSystem === "azhar"
                          ? "bg-primary/15 border-primary text-primary shadow-lg shadow-primary/10"
                          : "bg-surface-container border-outline-variant/30 text-on-surface hover:border-primary/50"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-3xl">🕌</span>
                        <Compass className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h5 className="font-bold text-body-lg">التعليم الأزهري الشريف</h5>
                        <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                          يشمل المواد الشرعية، التفسير، التوحيد، الفقه، والعلوم الشاملة.
                        </p>
                      </div>
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Branch */}
              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-body-lg font-bold text-on-surface">2. ما هي الشعبة والتخصص الدقيق لدرساتك؟</h4>
                    <button onClick={() => setStep(1)} className="text-xs text-primary flex items-center gap-1 hover:underline">
                      <ChevronRight className="w-4 h-4" /> العودة للخطوة الأولى
                    </button>
                  </div>

                  {selectedSystem === "azhar" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        onClick={() => handleSelectBranch("scientific")}
                        className="p-5 rounded-2xl bg-surface-container border border-outline-variant/30 hover:border-primary hover:bg-primary/10 transition-all text-right cursor-pointer"
                      >
                        <span className="text-2xl block mb-2">🔬</span>
                        <h5 className="font-bold text-body-lg text-on-surface">قسم علمي أزهري</h5>
                        <p className="text-xs text-on-surface-variant mt-1">14 مادة تشمل الفيزياء والشرعي والعربي</p>
                      </button>

                      <button
                        onClick={() => handleSelectBranch("literary")}
                        className="p-5 rounded-2xl bg-surface-container border border-outline-variant/30 hover:border-primary hover:bg-primary/10 transition-all text-right cursor-pointer"
                      >
                        <span className="text-2xl block mb-2">📚</span>
                        <h5 className="font-bold text-body-lg text-on-surface">قسم أدبي أزهري</h5>
                        <p className="text-xs text-on-surface-variant mt-1">14 مادة تشمل التاريخ والمطالعة والشرعي</p>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        onClick={() => handleSelectBranch("science")}
                        className="p-4 rounded-2xl bg-surface-container border border-outline-variant/30 hover:border-primary hover:bg-primary/10 transition-all text-right cursor-pointer"
                      >
                        <span className="text-2xl block mb-1">🧬</span>
                        <h5 className="font-bold text-body-md text-on-surface">علمي علوم</h5>
                        <p className="text-[11px] text-on-surface-variant mt-0.5">أحياء، كيمياء، فيزياء</p>
                      </button>

                      <button
                        onClick={() => handleSelectBranch("math")}
                        className="p-4 rounded-2xl bg-surface-container border border-outline-variant/30 hover:border-primary hover:bg-primary/10 transition-all text-right cursor-pointer"
                      >
                        <span className="text-2xl block mb-1">📐</span>
                        <h5 className="font-bold text-body-md text-on-surface">علمي رياضة</h5>
                        <p className="text-[11px] text-on-surface-variant mt-0.5">رياضيات، كيمياء، فيزياء</p>
                      </button>

                      <button
                        onClick={() => handleSelectBranch("literary")}
                        className="p-4 rounded-2xl bg-surface-container border border-outline-variant/30 hover:border-primary hover:bg-primary/10 transition-all text-right cursor-pointer"
                      >
                        <span className="text-2xl block mb-1">📜</span>
                        <h5 className="font-bold text-body-md text-on-surface">قسم أدبي</h5>
                        <p className="text-[11px] text-on-surface-variant mt-0.5">تاريخ، جغرافيا، لغات</p>
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Step 3: Grade */}
              {step === 3 && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-body-lg font-bold text-on-surface">3. في أي صف دراسي تدرس الآن؟</h4>
                    <button onClick={() => setStep(2)} className="text-xs text-primary flex items-center gap-1 hover:underline">
                      <ChevronRight className="w-4 h-4" /> تغيير الشعبة
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={() => handleSelectGrade("3rd")}
                      className="p-5 rounded-2xl bg-primary/10 border-2 border-primary text-right flex items-center justify-between cursor-pointer shadow-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">🎓</span>
                        <div>
                          <h5 className="font-bold text-body-lg text-on-surface">الصف الثالث الثانوي (الشهادة الثانوية)</h5>
                          <p className="text-xs text-on-surface-variant mt-0.5">الصف المفعل حالياً لجميع المواد والمراجعات والشعب</p>
                        </div>
                      </div>
                      <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                    </button>
                  </div>
                </motion.div>
              )}
            </>
          ) : (
            /* Success State */
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-8 flex flex-col items-center justify-center text-center gap-4"
            >
              <div className="w-20 h-20 rounded-full bg-primary/20 text-primary flex items-center justify-center animate-bounce border-2 border-primary">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-headline-md font-bold text-on-surface">تم تحديث مرحلتك بنجاح!</h4>
              <div className="bg-surface-container p-4 rounded-2xl border border-primary/30 max-w-md w-full">
                <span className="text-xs text-on-surface-variant block mb-1">المرحلة المفعلة الآن:</span>
                <span className="text-body-lg font-bold text-primary">
                  {getProfileLabel(calculatePreviewProfile())}
                </span>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
