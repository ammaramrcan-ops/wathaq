import { useState, FormEvent } from "react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function Register() {
  const { register, loginWithGoogle } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMsg("يرجى تعبئة كافة الحقول المطلوبة");
      return;
    }
    setErrorMsg("");
    setLoading(true);
    try {
      await register(name, email, password);
      navigate("/");
    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ أثناء إنشاء الحساب");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setErrorMsg("");
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate("/");
    } catch (err: any) {
      setErrorMsg(err.message || "فشل التسجيل باستخدام Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center py-section-padding">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-surface-container rounded-2xl p-8 border border-outline-variant/30 shadow-xl"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 mb-4 border border-on-surface rotate-45 flex items-center justify-center">
            <div className="w-3 h-3 bg-on-surface rounded-full"></div>
          </div>
          <h1 className="text-headline-lg text-on-surface">إنشاء حساب جديد</h1>
          <p className="text-body-md text-on-surface-variant mt-2">انضم إلى مجتمع وثاق للتميز الأكاديمي</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded text-error text-label-sm text-center">
            {errorMsg}
          </div>
        )}

        {/* Google Sign Up Button */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-xl bg-surface-container-high border border-outline-variant/50 hover:border-primary hover:bg-surface-container-highest transition-all duration-300 flex items-center justify-center gap-3 text-on-surface text-body-md font-medium cursor-pointer mb-6"
        >
          {/* Official Google G Logo SVG */}
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>التسجيل بواسطة Google</span>
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-6">
          <div className="border-t border-outline-variant/30 w-full"></div>
          <span className="bg-surface-container px-3 text-label-sm text-on-surface-variant/60 absolute">أو</span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-label-sm text-on-surface-variant">الاسم الكامل</label>
            <input 
              type="text" 
              id="name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-surface-container-high text-on-surface border border-outline-variant/50 rounded-lg p-3 focus:outline-none focus:border-primary transition-colors"
              placeholder="الاسم"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-label-sm text-on-surface-variant">البريد الإلكتروني</label>
            <input 
              type="email" 
              id="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-surface-container-high text-on-surface border border-outline-variant/50 rounded-lg p-3 focus:outline-none focus:border-primary transition-colors"
              placeholder="example@email.com"
              dir="ltr"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-label-sm text-on-surface-variant">كلمة المرور</label>
            <input 
              type="password" 
              id="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-surface-container-high text-on-surface border border-outline-variant/50 rounded-lg p-3 focus:outline-none focus:border-primary transition-colors"
              placeholder="••••••••"
              dir="ltr"
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="mt-4 bg-primary text-on-primary py-3 rounded-xl hover:bg-primary/90 transition-colors text-body-md font-medium cursor-pointer"
          >
            {loading ? "جاري التسجيل..." : "تسجيل"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-body-md text-on-surface-variant">
            لديك حساب بالفعل؟{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
