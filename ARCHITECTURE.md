# خريطة ودليل المعمارية الكاملة - منصة وثاق (Wathaq Architecture Blueprint)

> **ملاحظة مهمة للأجهزة والذكاء الاصطناعي (AI Context Map):**
> تم إعداد هذا الملف ليكون مرجعاً شاملاً وسريعاً لسياق المشروع الكامل، لمنع الحاجة لإعادة قراءة وتحليل ملفات الكود في كل جلسة جديدة.

---

## 1. نظرة عامة على المشروع (Project Overview)
- **اسم المشروع:** منصة وثاق (Wathaq)
- **الهدف:** منصة تعليمية وتفاعلية متكاملة للمناهج التعليمية والجامعية اليمنية، تقدم الكتب الدراسية، الفيديوهات الشارحة، بطاقات الاستذكار السريعة (Flashcards)، دليل المعلمين، ومجتمع النقاشات التعليمي.

---

## 2. البنية التقنية (Tech Stack)
| الطبقة (Layer) | التقنية / المكتبة (Technology) | الوصف |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 + TypeScript | بناء الواجهات بأداء عالٍ وطباعة أنواع آمنة |
| **Build Tool** | Vite | تجميع سريع ودعم HMR للبيئة التطويرية |
| **Styling** | Tailwind CSS v4 + Lucide React | تصميم حديث ومستجيب مع أيقونات غنية |
| **Animations** | Motion (`motion/react`) | انتقالات سلسة ومؤثرات حركية بين الصفحات |
| **Routing** | React Router v7 | إدارة المسارات مع `AnimatePresence` للانتقالات |
| **Authentication** | Firebase Authentication | إدارة هوية المستخدمين وتسجيل الدخول |
| **Database** | Firebase Firestore | تخزين بيانات الكتب، الفيديوهات، المعلمين والمشاركات |
| **Storage & Media** | Cloudinary Unsigned Upload | رفع الصور والملفات بدون حاجة لسيرفر خلفي مخصص |
| **Hosting Deployment** | Cloudflare Pages | استضافة سريعة مع ملف `_redirects` لمنع خطأ 404 |

---

## 3. خريطة المجلدات والملفات بالتفصيل (Directory & File Map)

```text
wathaq/
├── public/                # الملفات الساكنة والأيقونات وملف _redirects
├── src/
│   ├── main.tsx           # نقطة إدخال التطبيق والربط بـ React DOM
│   ├── App.tsx            # موجه المسارات الرئيسي (Router & AnimatedRoutes)
│   ├── index.css          # التنسيقات العامة وقواعد Tailwind CSS v4 والخطوط
│   ├── vite-env.d.ts      # تعريف متغيرات البيئة والأشكال العالمية
│   │
│   ├── context/           # إدارة الحالة العامة للتطبيق
│   │   └── AuthContext.tsx # إدارة هوية المستخدم، حالة التسجيل، وصلاحيات Admin/User
│   │
│   ├── lib/               # الخدمات البرمجية والاتصال بالخلفية
│   │   ├── firebase.ts              # تهيئة Firebase مع وضع Fallback آمن
│   │   ├── cloudinary.ts            # رفع الصور والملفات غير الموقعة
│   │   ├── contentService.ts        # إدارة عمليات التخزين والجلب للكتب والفيديوهات والبطاقات
│   │   ├── teacherService.ts        # إدارة بيانات وتقييمات وطلبات المعلمين
│   │   ├── userPermissionsService.ts# إدارة الصلاحيات والأدوار (Admin, Teacher, Student)
│   │   ├── visitService.ts          # تتبع وتحليل زيارات الصفحات والتفاعلات
│   │   ├── subjectsData.ts          # المناهج والمواد اليمنية والجامعية الثابتة
│   │   └── utils.ts                 # دمج الفئات والتنسيقات (clsx + tailwind-merge)
│   │
│   ├── components/        # المكونات العامة والمجمعة
│   │   ├── Layout.tsx               # الهيكل العام (الهيدر، الفوتر، الشريط الجانبي)
│   │   ├── PageTransition.tsx       # مغلف الانتقال الحركي بين الصفحات
│   │   ├── AddContentModal.tsx      # نافذة إضافة كتاب/فيديو/بطاقة جديدة
│   │   ├── StageWizardModal.tsx     # نافذة تحديد المرحلة والصف والمادة
│   │   └── admin/                   # أدوات لوحة التحكم والتحليل
│   │
│   └── pages/             # الصفحات الرئيسية للتطبيق
│       ├── Home.tsx                 # الصفحة الرئيسية (العرض، الإحصائيات، البداية)
│       ├── Books.tsx                # مكتبة الكتب والمراجع والتصفية
│       ├── Videos.tsx               # المكتبة المرئية والفيديوهات التعليمية
│       ├── Flashcards.tsx           # بطاقات الاستذكار السريعة وتقييم الفهم
│       ├── Teachers.tsx             # دليل المعلمين والتواصل والتقييمات
│       ├── Community.tsx            # مجتمع المنشورات والأسئلة والحلول
│       ├── Subjects.tsx             # تصفح المواد الدراسية حسب الصف
│       ├── Profile.tsx              # الملف الشخصي للمستخدم والمفضلة
│       ├── Admin.tsx                # لوحة التحكم الإدارية الكاملة
│       ├── Login.tsx                # صفحة تسجيل الدخول
│       └── Register.tsx             # صفحة إنشاء حساب جديد
│
├── .env / .env.example    # متغيرات البيئة ومفاتيح API
├── firestore.rules        # قواعد أمان وقراءة/كتابة قواعد بيانات Firestore
├── AGENTS.md              # القواعد والارشادات الدائمة للذكاء الاصطناعي
└── ARCHITECTURE.md        # خريطة المشروع والـ Blueprint الشامل
```

---

## 4. تدفق البيانات والحالة (Data Flow & Architecture Patterns)

### أ) إدارة المستخدمين والصلاحيات (Auth & Roles)
1. يتابع [AuthContext.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/context/AuthContext.tsx) حالة `onAuthStateChanged` من Firebase.
2. يتم جلب دور المستخدم من Firestore عبر [userPermissionsService.ts](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/lib/userPermissionsService.ts).
3. توجد وضعية زائر (Guest Fallback) تضمن عدم انهيار الموقع في حال عدم تسجيل الدخول أو غياب مفاتيح Firebase.

### ب) المحتوى والبطاقات والمكتبة (Content Management)
1. يتم التعامل مع المواد الدراسية والكتب والفيديوهات والبطاقات عبر [contentService.ts](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/lib/contentService.ts).
2. عند إضافة محتوى جديد عبر [AddContentModal.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/components/AddContentModal.tsx)، يتم رفع الصور عبر [cloudinary.ts](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/lib/cloudinary.ts)، ثم حفظ المستند في Firestore مع دعم fallback محلي في حالة الانقطاع.

---

## 5. قواعد ضابطة للتطوير المستقبلي (Development Rules)

1. **عزل البيانات:** ربط كل سجل بـ `user.uid` الخاص بالمنشئ لمنع تداخل البيانات بين المستخدمين.
2. **منع تكرار المنطق (DRY):** استخدام الخدمات الموجودة في `src/lib/` بدلاً من إعادة كتابة الاستعلامات.
3. **الحد الأقصى للملفات:** ألا يتجاوز أي ملف ~400 سطر، وفي حال التجاوز يتم التقسيم لمكونات فرعية.
4. **الأمان ومسارات الخادم:** عدم استخدام روابط خارجية غير موثوقة أو قبول مدخلات خام دون التحقق منها.

---

## 6. أوامر التشغيل والتحقق السريعة (Quick Commands)
- **تشغيل خادم التطوير:** `npm run dev`
- **فحص الأنواع وتكامل TypeScript:** `npx tsc --noEmit`
- **بناء النسخة الإنتاجية:** `npm run build`
