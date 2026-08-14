import { ReactNode, useState } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Plus, ShieldCheck } from "lucide-react";
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
      return { type: "video" as const, label: "إضافة فيديو +", lock: true };
    }
    if (location.pathname.startsWith("/books")) {
      return { type: "book" as const, label: "إضافة كتاب / ملزمة +", lock: true };
    }
    if (location.pathname.startsWith("/flashcards")) {
      return { type: "flashcards" as const, label: "إضافة فلاش كارد +", lock: true };
    }
    return { type: "book" as const, label: "إضافة محتوى +", lock: false };
  };

  const sectionConfig = getSectionConfig();

  return (
    <header className="bg-surface sticky top-0 z-50 border-b border-outline-variant/10">
      <div className="max-w-container-max mx-auto flex justify-between items-center px-gutter py-stack-md w-full">
        <div className="flex items-center gap-8">
          <Link 
            to="/" 
            className="flex items-center gap-3 text-display-ar font-display-ar text-on-surface hover:text-primary transition-all duration-300 ease-in-out"
          >
            <div className="w-8 h-8 border border-on-surface rotate-45 flex items-center justify-center">
              <div className="w-2 h-2 bg-on-surface rounded-full"></div>
            </div>
            وثاق
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/teachers"
            className="text-on-surface-variant hover:text-primary border border-outline-variant/30 hover:border-primary/50 transition-colors px-3 py-2 rounded-lg text-label-sm font-medium flex items-center gap-1.5"
          >
            <span>المدرسين</span>
          </Link>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-on-primary hover:bg-primary/90 transition-colors px-3.5 py-2 rounded-lg text-label-sm font-medium flex items-center gap-1.5 shadow-md shadow-primary/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{sectionConfig.label}</span>
          </button>

          {!isHome && (
            <button 
              onClick={() => navigate(-1)}
              className="text-on-surface-variant hover:text-primary transition-colors duration-500 text-label-sm font-label-sm flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>العودة</span>
            </button>
          )}

          <Link 
            to="/login"
            className="bg-surface-container-high text-on-surface border border-outline-variant/30 hover:border-primary transition-colors px-4 py-2 rounded-lg text-label-sm font-medium"
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
        <nav className="flex gap-6 mb-stack-md">
          <Link to="/" className="text-on-surface-variant hover:text-primary transition-colors text-label-sm font-label-sm opacity-80 hover:opacity-100">الرئيسية</Link>
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
    <div className="min-h-screen flex flex-col">
      <Header />
      <motion.main 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex-grow w-full max-w-container-max mx-auto px-gutter py-section-padding flex flex-col"
      >
        {children}
      </motion.main>
      <Footer />
    </div>
  );
}
