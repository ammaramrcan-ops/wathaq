import { Book as BookIcon, Globe, Languages } from "lucide-react";
import { motion } from "motion/react";

const subjects = [
  {
    title: "مواد شرعية",
    icon: BookIcon,
    id: "islamic"
  },
  {
    title: "مواد عربية",
    icon: Languages,
    id: "arabic"
  },
  {
    title: "مواد ثقافية",
    icon: Globe,
    id: "cultural"
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

export default function Subjects() {
  return (
    <div className="flex-grow flex flex-col items-center justify-center gap-stack-lg">
      <div className="text-center space-y-stack-sm w-full max-w-2xl mx-auto mb-stack-md">
        <h1 className="font-display-ar text-display-ar text-on-surface">اختر المادة</h1>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-gutter w-full"
      >
        {subjects.map((sub) => (
          <motion.button 
            key={sub.id}
            variants={item}
            className="group relative block bg-surface-container-low border border-outline-variant/30 rounded-xl p-[3rem] flex flex-col items-center justify-center gap-stack-md transition-all duration-500 hover:border-primary hover:bg-surface-container overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10 flex flex-col items-center gap-stack-sm">
              <sub.icon className="w-12 h-12 text-on-surface-variant group-hover:text-primary transition-colors duration-300 stroke-[1.5]" />
              <h2 className="font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors duration-300">
                {sub.title}
              </h2>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
