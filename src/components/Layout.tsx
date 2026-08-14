import { ReactNode, useState } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Plus, Home as HomeIcon, Video, BookOpen, Users, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { AddContentModal } from "@/components/AddContentModal";

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Determine section-specific content type & button label
  const getSectionConfig = () => {
    if (location.pathname.startsWith("/videos")) {
      return { type: "video" as const, label: "فيديو +", fullLabel: "إضافة فيديو +", lock: true };
    }
    if (location.pathname.startsWith("/books")) {
      return { type: "book" as const, label: "كتاب +", fullLabel: "إضافة كتاب / ملزمة +", lock: true };
    }
    if (location.pathname.startsWith("/flashcards")) {
      return { type: "flashcards" as const, label: "فلاش كارد +", fullLabel: "إضافة فلاش كارد +", lock: true };
    }
    return { type: "book" as const, label: "إضافة +", fullLabel: "إضافة محتوى +", lock: false };
  };

  const sectionConfig = getSectionConfig();

  return (
    <header className="bg-surface sticky top-0 z-50 border-b border-outline-variant/10 shadow-sm">
      <div className="max-w-container-max mx-auto flex justify-between items-center px-4 sm:px-gutter py-3.5 w-full">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link 
            to="/" 
            className="flex items-center gap-2.5 text-display-ar font-display-ar text-on-surface hover:text-primary transition-all duration-300 ease-in-out"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 border border-on-surface rotate-45 flex items-center justify-center">
              <div className="w-2 h-2 bg-on-surface rounded-full"></div>
            </div>
            <span className="text-xl sm:text-2xl font-bold">وثاق</span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-5 text-label-sm font-medium text-on-surface-variant">
            <NavLink to="/" className={({ isActive }) => cn("hover:text-primary transition-colors", isActive && "text-primary font-bold")}>الرئيسية</NavLink>
            <NavLink to="/videos" className={({ isActive }) => cn("hover:text-primary transition-colors", isActive && "text-primary font-bold")}>الفيديوهات</NavLink>
            <NavLink to="/books" className={({ isActive }) => cn("hover:text-primary transition-colors", isActive && "text-primary font-bold")}>الكتب والملازم</NavLink>
            <NavLink to="/teachers" className={({ isActive }) => cn("hover:text-primary transition-colors", isActive && "text-primary font-bold")}>المدرسين</NavLink>
            <NavLink to="/community" className={({ isActive }) => cn("hover:text-primary transition-colors", isActive && "text-primary font-bold")}>المجتمع</NavLink>
          </nav>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-on-primary hover:bg-primary/90 transition-all px-3 sm:px-4 py-2 rounded-xl text-label-sm font-medium flex items-center gap-1.5 shadow-md shadow-primary/10 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{sectionConfig.fullLabel}</span>
            <span className="sm:hidden">{sectionConfig.label}</span>
          </button>

          {!isHome && (
            <button 
              onClick={() => navigate(-1)}
              className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-lg text-label-sm font-label-sm flex items-center gap-1 bg-surface-container-high md:bg-transparent"
              title="العودة للصفحة السابقة"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">العودة</span>
            </button>
          )}

          <Link 
            to="/login"
            className="bg-surface-container-high text-on-surface border border-outline-variant/30 hover:border-primary transition-colors px-3 sm:px-4 py-2 rounded-lg text-label-sm font-medium"
          >
            دخول
          </Link>
        </div>
      </div>

      {/* Global Context-Aware Add Content Modal */}
      <AddContentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultContentType={sectionConfig.type}
        lockType={sectionConfig.lock}
      />
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-background border-t border-outline-variant/10 w-full mt-auto">
      <div className="max-w-container-max mx-auto flex flex-col items-center gap-stack-sm py-section-padding px-gutter">
        <h2 className="text-headline-md font-headline-md text-on-surface mb-stack-md text-center">وثاق</h2>
        <nav className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-stack-md">
          <Link to="/" className="text-on-surface-variant hover:text-primary transition-colors text-label-sm font-label-sm opacity-80 hover:opacity-100">الرئيسية</Link>
          <Link to="/videos" className="text-on-surface-variant hover:text-primary transition-colors text-label-sm font-label-sm opacity-80 hover:opacity-100">الفيديوهات</Link>
          <Link to="/books" className="text-on-surface-variant hover:text-primary transition-colors text-label-sm font-label-sm opacity-80 hover:opacity-100">الكتب والملازم</Link>
          <Link to="/teachers" className="text-on-surface-variant hover:text-primary transition-colors text-label-sm font-label-sm opacity-80 hover:opacity-100">دليل المدرسين</Link>
          <Link to="/community" className="text-on-surface-variant hover:text-primary transition-colors text-label-sm font-label-sm opacity-80 hover:opacity-100">المجتمع</Link>
        </nav>
        <p className="text-body-md font-body-md text-on-surface-variant opacity-80 text-center">© وثاق للتميز الصامت</p>
      </div>
    </footer>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      <Header />
      <motion.main 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex-grow w-full max-w-container-max mx-auto px-4 sm:px-gutter py-6 sm:py-section-padding flex flex-col"
      >
        {children}
      </motion.main>
      <Footer />
    </div>
  );
}
