import { PlayCircle, BookOpen, MessageSquare, Compass, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

const modules = [
  {
    title: "فيديوهات وشروحات",
    icon: PlayCircle,
    path: "/videos",
    id: "module-videos",
    description: "شروحات مرئية منظمة ومصنفة بحسب المدرسين والمواد"
  },
  {
    title: "كتب وملازم",
    icon: BookOpen,
    path: "/books",
    id: "module-books",
    description: "ملفات دراسية معتمدة وروابط مباشرة وسريعة للمعاينة"
  },
  {
    title: "مجتمع ونقاشات",
    icon: MessageSquare,
    path: "/community",
    id: "module-community",
    description: "مساحة آمنة لطرح الأسئلة وتبادل التقييمات العلمية"
  }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Home() {
  return (
    <div className="flex-grow flex flex-col items-center justify-center py-section-padding px-4">
      {/* Brand / Logo Area */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: -20 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mb-stack-lg flex flex-col items-center text-center"
        id="home-brand"
      >
        <motion.div
          whileHover={{ rotate: 90, scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="w-24 h-24 mb-stack-sm flex items-center justify-center cursor-pointer"
        >
          <div className="w-16 h-16 border-2 border-primary rotate-45 flex items-center justify-center shadow-[0_0_25px_rgba(181,205,182,0.25)] bg-surface-container/60 backdrop-blur-md rounded-2xl">
            <div className="w-4 h-4 bg-primary rounded-full animate-pulse"></div>
          </div>
        </motion.div>

        <h1 className="text-display-ar font-display-ar text-on-surface tracking-wide flex items-center gap-2">
          <span>وثاق</span>
          <Sparkles className="w-6 h-6 text-primary animate-bounce" />
        </h1>
      </motion.div>

      {/* Central Interactive Action Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl"
        id="home-modules-grid"
      >
        {modules.map((mod) => (
          <motion.div key={mod.path} variants={item}>
            <Link
              to={mod.path}
              id={mod.id}
            >
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="group relative flex flex-col items-center justify-between p-8 text-center rounded-3xl bg-surface-container-low border border-outline-variant/30 hover:border-primary/60 hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)] transition-colors duration-300 ease-out cursor-pointer overflow-hidden h-full"
              >
                {/* Subtle Gradient Glow Background */}
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div className="w-16 h-16 rounded-2xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center mb-6 group-hover:border-primary/40 group-hover:bg-primary/10 transition-all duration-300">
                  <mod.icon className="w-8 h-8 text-on-surface-variant group-hover:text-primary transition-transform duration-300 group-hover:scale-110" />
                </div>

                <div className="flex flex-col gap-2">
                  <h3 className="text-headline-md font-bold text-on-surface group-hover:text-primary transition-colors duration-300">
                    {mod.title}
                  </h3>
                  <p className="text-body-md text-on-surface-variant/80 text-xs leading-relaxed">
                    {mod.description}
                  </p>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Intro Text */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="mt-16 text-center max-w-lg"
      >
        <h2 className="text-display-ar font-display-ar text-on-surface mb-stack-sm text-[26px]">نقاشات هادئة، أفكار عميقة.</h2>
        <p className="text-body-lg font-body-lg text-on-surface-variant">مساحة مخصصة للتركيز الأكاديمي وتبادل المعرفة بعيداً عن صخب المشتتات.</p>
      </motion.div>
    </div>
  );
}
