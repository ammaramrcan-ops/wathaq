import { PlayCircle, BookOpen, Users, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

const modules = [
  {
    title: "الكتب والملازم",
    subtitle: "Google Drive وملخصات",
    icon: BookOpen,
    path: "/books",
    id: "module-books"
  },
  {
    title: "فيديوهات وشروحات",
    subtitle: "قوائم تشغيل ودروس",
    icon: PlayCircle,
    path: "/videos",
    id: "module-videos"
  },
  {
    title: "دليل المدرسين",
    subtitle: "تقييمات ونقاط القوة",
    icon: Users,
    path: "/teachers",
    id: "module-teachers"
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
  hidden: { opacity: 0, scale: 0.95, y: 15 },
  show: { opacity: 1, scale: 1, y: 0 }
};

export default function Home() {
  return (
    <div className="flex-grow flex flex-col items-center justify-center py-section-padding">
      {/* Brand / Logo Area */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 0.9, y: 0 }}
        className="mb-stack-lg flex flex-col items-center text-center"
        id="home-brand"
      >
        <div className="w-20 h-20 mb-stack-sm flex items-center justify-center">
            {/* Minimalist diamond/dot logo */}
            <div className="w-14 h-14 border-2 border-on-surface rotate-45 flex items-center justify-center shadow-lg">
                <div className="w-3.5 h-3.5 bg-on-surface rounded-full"></div>
            </div>
        </div>
        <h1 className="text-display-ar font-display-ar text-on-surface tracking-wide">وثاق</h1>
      </motion.div>

      {/* Central Action Cards */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-stack-md w-full max-w-4xl"
        id="home-modules-grid"
      >
        {modules.map((mod) => (
          <motion.div key={mod.path} variants={item}>
            <Link 
              to={mod.path}
              id={mod.id}
              className="ghost-card group flex flex-col items-center justify-center py-10 px-gutter text-center rounded-2xl border border-outline-variant/30 hover:border-primary hover:bg-surface-container transition-all duration-300 ease-in-out cursor-pointer shadow-lg"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 mb-3 group-hover:scale-110 transition-transform">
                <mod.icon className="w-6 h-6 text-primary" />
              </div>
              <span className="text-headline-md font-headline-md text-on-surface group-hover:text-primary transition-colors duration-300">
                {mod.title}
              </span>
              <span className="text-label-sm text-on-surface-variant/80 mt-1 font-light">
                {mod.subtitle}
              </span>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Resource Centric Intro Text */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="mt-[4rem] text-center max-w-xl px-4"
      >
         <h2 className="text-display-ar font-display-ar text-on-surface mb-stack-sm text-[26px] sm:text-[30px] font-bold">
           مصادر تعليمية مجمعة، لتميزٍ أكاديمي عميق.
         </h2>
         <p className="text-body-lg font-body-lg text-on-surface-variant font-light leading-relaxed">
           مكتبة شاملة تجمع أفضل الكتب، الشروحات المرئية، والملازم الدراسية المنظمة بعيداً عن صخب المشتتات.
         </p>
      </motion.div>
    </div>
  );
}
