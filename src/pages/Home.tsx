import { PlayCircle, BookOpen, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

const modules = [
  {
    title: "فيديوهات",
    icon: PlayCircle,
    path: "/videos",
    id: "module-videos"
  },
  {
    title: "كتب",
    icon: BookOpen,
    path: "/books",
    id: "module-books"
  },
  {
    title: "مجتمع",
    icon: MessageSquare,
    path: "/community",
    id: "module-community"
  }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const item = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1 }
};

export default function Home() {
  return (
    <div className="flex-grow flex flex-col items-center justify-center py-section-padding">
      {/* Brand / Logo Area */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 0.8, y: 0 }}
        className="mb-stack-lg flex flex-col items-center"
        id="home-brand"
      >
        <div className="w-24 h-24 mb-stack-sm flex items-center justify-center">
            {/* Minimalist diamond/dot logo */}
            <div className="w-16 h-16 border-2 border-on-surface rotate-45 flex items-center justify-center">
                <div className="w-4 h-4 bg-on-surface rounded-full"></div>
            </div>
        </div>
        <h1 className="text-display-ar font-display-ar text-on-surface tracking-wide">وثاق</h1>
      </motion.div>

      {/* Central Action Cards */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-stack-md w-full max-w-3xl"
        id="home-modules-grid"
      >
        {modules.map((mod) => (
          <motion.div key={mod.path} variants={item}>
            <Link 
              to={mod.path}
              id={mod.id}
              className="ghost-card group flex flex-col items-center justify-center py-[4rem] px-gutter text-center rounded border border-outline-variant/30 hover:border-primary transition-all duration-300 ease-in-out cursor-pointer"
            >
              <mod.icon className="w-10 h-10 text-on-surface-variant group-hover:text-primary transition-colors duration-300 mb-stack-sm" />
              <span className="text-headline-md font-headline-md text-on-surface group-hover:text-primary transition-colors duration-300">
                {mod.title}
              </span>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Original Intro Text */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="mt-[5rem] text-center max-w-lg"
      >
         <h2 className="text-display-ar font-display-ar text-on-surface mb-stack-sm text-[28px]">نقاشات هادئة، أفكار عميقة.</h2>
         <p className="text-body-lg font-body-lg text-on-surface-variant">مساحة مخصصة للتركيز الأكاديمي وتبادل المعرفة بعيداً عن صخب المشتتات.</p>
      </motion.div>
    </div>
  );
}
