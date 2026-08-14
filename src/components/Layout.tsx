import { ReactNode, useState, useEffect } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Plus, User, LogOut, ShieldCheck, ChevronDown, Home, PlayCircle, BookOpen, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/context/AuthContext";
import { AddContentModal } from "@/components/AddContentModal";
import { trackVisit } from "@/lib/visitService";

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loginWithGoogle, logout } = useAuth();
  const isHome = location.pathname === "/";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

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
          <nav className="hidden md:flex items-center gap-6 text-label-sm font-medium text-on-surface-variant">
            <NavLink to="/" className={({ isActive }) => cn("hover:text-primary transition-colors", isActive && "text-primary font-bold")}>الرئيسية</NavLink>
            <NavLink to="/videos" className={({ isActive }) => cn("hover:text-primary transition-colors", isActive && "text-primary font-bold")}>الفيديوهات</NavLink>
            <NavLink to="/books" className={({ isActive }) => cn("hover:text-primary transition-colors", isActive && "text-primary font-bold")}>الكتب والملازم</NavLink>
            <NavLink to="/community" className={({ isActive }) => cn("hover:text-primary transition-colors", isActive && "text-primary font-bold")}>المجتمع والنقاشات</NavLink>
          </nav>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {!isHome && (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.93 }}
              onClick={() => navigate(-1)}
              className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-lg text-label-sm font-label-sm flex items-center gap-1 bg-surface-container-high md:bg-transparent cursor-pointer"
              title="العودة للصفحة السابقة"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">العودة</span>
            </motion.button>
          )}

          {/* Dynamic Login / My Account Menu */}
          {user ? (
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="bg-surface-container-high text-on-surface border border-primary/30 hover:border-primary px-3 py-2 rounded-xl text-label-sm font-medium flex items-center gap-2 cursor-pointer transition-all shadow-sm hover:shadow-md"
              >
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                  {user.displayName ? user.displayName[0] : "ط"}
                </div>
                <span className="max-w-[100px] truncate">{user.displayName || "حسابي"}</span>
                <ChevronDown className="w-3.5 h-3.5 text-on-surface-variant" />
              </motion.button>

              {/* User Dropdown Menu */}
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 mt-2 w-56 bg-surface-container rounded-2xl border border-outline-variant/30 shadow-2xl p-2 z-50 text-right"
                  >
                    <div className="p-3 border-b border-outline-variant/10">
                      <p className="text-body-md font-medium text-on-surface truncate">{user.displayName || "طالب مسجل"}</p>
                      <p className="text-xs text-on-surface-variant font-mono truncate" dir="ltr">{user.email}</p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 p-2.5 rounded-lg text-label-sm text-on-surface hover:text-primary hover:bg-surface-container-high transition-colors my-1 font-medium"
                    >
                      <User className="w-4 h-4 text-primary" />
                      <span>ملفي الشخصي ومساهماتي</span>
                    </Link>

                    {user.email === "ammaramrcan@gmail.com" && (
                      <Link
                        to="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 p-2.5 rounded-lg text-label-sm text-primary hover:bg-primary/10 transition-colors my-1 font-medium"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>لوحة التحكم (الأدمن)</span>
                      </Link>
                    )}

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 p-2.5 rounded-lg text-label-sm text-error hover:bg-error/10 transition-colors cursor-pointer font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>تسجيل الخروج</span>
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              onClick={loginWithGoogle}
              className="bg-surface-container-high text-on-surface border border-outline-variant/40 hover:border-primary transition-all px-3 sm:px-4 py-2 rounded-xl text-label-sm font-medium flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>دخول بـ Google</span>
            </motion.button>
          )}
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

function MobileBottomNav() {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "الرئيسية", icon: Home },
    { path: "/videos", label: "فيديوهات", icon: PlayCircle },
    { path: "/books", label: "كتب وملازم", icon: BookOpen },
    { path: "/community", label: "المجتمع", icon: MessageSquare },
    { path: "/profile", label: "حسابي", icon: User }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur-xl border-t border-outline-variant/20 px-2 py-1.5 shadow-[0_-5px_25px_rgba(0,0,0,0.4)] flex justify-around items-center">
      {navItems.map((item) => {
        const isActive = item.path === "/" 
          ? location.pathname === "/" 
          : location.pathname.startsWith(item.path);
        const Icon = item.icon;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className="relative flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all cursor-pointer"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.88 }}
              className={`flex flex-col items-center justify-center transition-colors ${
                isActive ? "text-primary font-bold" : "text-on-surface-variant/70 hover:text-on-surface"
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[11px] font-medium tracking-tight">{item.label}</span>
            </motion.div>

            {isActive && (
              <motion.div
                layoutId="mobileActiveIndicator"
                className="absolute -bottom-1 w-8 h-1 bg-primary rounded-full shadow-[0_0_10px_rgba(181,205,182,0.8)]"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </NavLink>
        );
      })}
    </div>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();

  useEffect(() => {
    trackVisit();

    const path = location.pathname;
    if (path === "/") {
      document.title = "وثاق - المنصة التعليمية المجمعة للكتب والملازم والشروحات";
    } else if (path.startsWith("/videos")) {
      document.title = "الفيديوهات والشروحات المرئية | وثاق";
    } else if (path.startsWith("/books")) {
      document.title = "مكتبة الكتب والملازم والخرائط الذهنية | وثاق";
    } else if (path.startsWith("/community")) {
      document.title = "مجتمع وثاق والأسئلة الأكاديمية ودليل المدرسين | وثاق";
    } else if (path.startsWith("/profile")) {
      document.title = "حسابي وتخصيص المنهج والمساهمات | وثاق";
    } else if (path.startsWith("/admin")) {
      document.title = "لوحة تحكم الأدمن | وثاق";
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface pb-16 md:pb-0">
      <Header />
      <motion.main 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex-grow w-full max-w-container-max mx-auto px-4 sm:px-gutter py-6 sm:py-section-padding flex flex-col"
      >
        {children}
      </motion.main>
      <MobileBottomNav />
    </div>
  );
}
