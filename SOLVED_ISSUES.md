# سجل المشكلات والتعديلات وتحسينات SonarCloud (Wathaq Solved Issues & Evolution Log)

> **هدف الملف:** أرشفة كل مشكلة تم حلها، ثغرة أمنية، ملاحظة SonarCloud، أو تعديل جوهري على المشروع لمنع تكرار الأخطاء وتوسيع معرفة الذكاء الاصطناعي والمطورين بين الجلسات.

---

## 📌 سجل المشكلات والتعديلات (Historical Log)

### 📅 2026-08-14 | إصلاح انضغاط صورة البروفايل على الهواتف المحمولة (Avatar Squeezing Fix)
- **نوع المشكلة:** UI Bug / Mobile Responsiveness
- **المشكلة / الملاحظة:** انضغاط صورة البروفايل لتصبح بيضاوية ضيقة جداً في شريط الحساب عند تصفح المنصة من الهواتف المحمولة وتطابقها مع الأسماء الطويلة.
- **السبب الجذري:** غياب خاصية `shrink-0` عن حاوية الصورة وعن عنصر الصورة `<img>` داخل الحاوية المرنة `flex-row` عند استيعاب الأسماء الطويلة مثل (`Ammar Ahmed Elshamy`).
- **طريقة الحل:** 
  - إدراج `shrink-0` لحاوية وعنصر الصورة في [Profile.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/pages/Profile.tsx).
  - ضبط تنسيق `flex-col sm:flex-row` لحاوية معلومات المستخدم لضمان التناسق البصري الكامل وملاءمة كل أحجام الشاشات.
- **إجراءات الوقاية مستقبلاً:**
  - تضمين `shrink-0` دائماً على عناصر الصور الشخصية والشعارات لمنع Flexbox من تقليص عرضها.

---

### 📅 2026-08-14 | تصحيح دقة حساب عداد الزيارات + تفعيل الأدمن المعينين بدون وميض + إضافة اللغة الإنجليزية
- **نوع المشكلة:** Bug / Analytics Throttling & Admin Authorization & Curriculum Update
- **المشكلة / الملاحظة:**
  1. تضخم عداد الزيارات (مثل ظهور 20 زيارة بدلاً من 7) عند تنقل الزائر الواحد بين صفحات المنصة.
  2. عدم ظهور رابط لوحة التحكم في القوائم للحسابات الممنوحة أدمن من لوحة التحكم، وظهور شاشة التحذير/القفل لمدة ثانية واحدة قبل دخوله للوحة.
  3. عدم إدراج مادة اللغة الإنجليزية ضمن مواد قسم الثانوي العام.
- **السبب الجذري:**
  1. تشغيل `trackVisit()` وإعادة زيادة العداد بـ `increment(1)` عند كل تنقل بين المسارات (`location.pathname`) دون فحص مهلة الجلسة (Session Throttle).
  2. تجريد صلاحيات `role: "admin"` لأي إيميل غير الإيميل الرئيسي في `getUserPermissions()` واختبار الإيميل الرئيسي فقط في `Layout.tsx` وقواعد `firestore.rules`.
  3. غياب "اللغة الإنجليزية" من مصفوفة مواد `subjects`.
- **طريقة الحل:**
  - تفعيل مهلة الجلسات (15 دقيقة) وتحديث التاريخ اليومي في `src/lib/visitService.ts` لحساب الزيارات الحقيقية بدقة.
  - إزالة التجريد التلقائي للصلاحيات في `src/lib/userPermissionsService.ts` وتحديث `Layout.tsx` و `Admin.tsx` ودالة `isAdmin()` في `firestore.rules`.
  - إضافة مادة "اللغة الإنجليزية" إلى المناهج والمواد بـ `subjectsData.ts` و `Books.tsx` و `Videos.tsx` و `Community.tsx`.
- **إجراءات الوقاية مستقبلاً:**
  - اختبار الصلاحيات دائماً بالربط مع `subscribeUserPermissions` بدلاً من مطابقة الإيميلات النصية الصلبة.

---

### 📅 2026-08-14 | التصفية الديناميكية للمواد حسب الشعبة والنظام + مزامنة وحذف منشورات المجتمع
- **نوع المشكلة:** Bug / Dynamic Curriculum & Community Persistence
- **المشكلة / الملاحظة:**
  1. ظهور المواد والقطاعات الشرعية (التفسير، الفقه، التوحيد) لطلاب الثانوية العامة "قسم عام".
  2. منشورات المجتمع كانت تُحفظ في ذاكرة المتصفح المؤقتة فقط، دون حفظ سحابي ودون إمكانية مزامنة الحذف لدى جميع المستخدمين والأدمن.
- **السبب الجذري:**
  1. عدم فلترة القوائم والمنسدلات في صفحة الكتب والفيديوهات والمجتمع والشرعيات بحسب `StudentAcademicProfile` (`general` vs `azhar`).
  2. غياب خدمة سحابية لمجتمع وثاق تربط المنشورات بـ Cloud Firestore ومجسم التزامن الحقيقي `global_deleted_items`.
- **طريقة الحل:**
  - إضافة دالتي `filterCategoriesForProfile` و `filterSubjectsForProfile` في `src/lib/subjectsData.ts`.
  - إنشاء `src/lib/communityService.ts` لدعم التخزين والدعم السحابي لـ Firestore و IndexedDB والمزامنة الفورية (`subscribeDiscussions`).
  - تحديث [Books.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/pages/Books.tsx)، [Videos.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/pages/Videos.tsx)، [Community.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/pages/Community.tsx)، [Subjects.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/pages/Subjects.tsx).
- **إجراءات الوقاية مستقبلاً:**
  - الاعتماد على `subscribeStudentProfile` دائماً لربط أي واجهة تحتوي على مواد بتخصص الطالب مباشرة.

---

### 📅 2026-08-14 | تصحيح استدعاء ReactNode وتكوين التوجيه لـ Cloudflare Pages
- **نوع المشكلة:** Bug / Deployment Configuration
- **المشكلة / الملاحظة:** 
  1. خطأ في نوع استدعاء `React.ReactNode` بدلاً من `ReactNode` المستورد في `Layout.tsx`.
  2. حدوث خطأ 404 عند إعادة تحميل الصفحات الفرعية (مثل `/videos` أو `/flashcards`) بعد النشر على Cloudflare Pages.
- **السبب الجذري:**
  1. الخلط بين استخدام `ReactNode` كمكون مستورد و `React.ReactNode`.
  2. تطبيقات الصفحة الواحدة (SPA) تحتاج إعادة توجيه كافة المسارات إلى `index.html` عند التحديث المباشر من المتصفح.
- **طريقة الحل:**
  - تعديل [Layout.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/components/Layout.tsx) لاستخدام `ReactNode`.
  - إضافة ملف `public/_redirects` يحتوي على `/* /index.html 200`.
- **إجراءات الوقاية مستقبلاً:**
  - فحص مخرجات `npx tsc --noEmit` دائماً بعد التعديلات التنسيقية الهيكلية.
  - ضمان وجود ملفات `_redirects` عند التخصيص للمستضيفين الساكنين.

---

### 📅 2026-08-14 | إنشاء خريطة المعمارية وقواعد الأرشفة التلقائية للمشروع
- **نوع المشكلة:** Architecture & Knowledge Continuity
- **المشكلة / الملاحظة:** استهلاك وقت وتوكنز في قراءة وتحليل سياق المشروع من جديد في كل جلسة، وغياب سجل يوثق إصلاحات SonarCloud والتعديلات السابقة.
- **السبب الجذري:** عدم وجود وثيقة معمارية مركزية وسجل تاريخي يربط الذكاء الاصطناعي بين الجلسات المختلفة.
- **طريقة الحل:**
  - إنشاء ملف [ARCHITECTURE.md](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/ARCHITECTURE.md) لشرح البنية وخريطة الملفات والخدمات والتدفق.
  - إدراج خريطة سياق في ملف [AGENTS.md](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/AGENTS.md) الذي يُقرأ تلقائياً في بداية كل محادثة.
  - إنشاء هذا الملف ([SOLVED_ISSUES.md](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/SOLVED_ISSUES.md)) وإضافة قاعدة ملزمة للذكاء الاصطناعي بتحديثه بعد كل مشكلة أو تحسين SonarCloud.
---

### 📅 2026-08-14 | معالجة الثغرات الأمنية وتأمين الصلاحيات وعزل بيانات المستخدمين
- **نوع المشكلة:** Security / RBAC / Data Isolation Bug
- **المشكلة / الملاحظة:** 
  1. ثغرة تصعيد الصلاحيات وقراءة/كتابة مفتوحة في `firestore.rules` (`allow read, write: if true;`).
  2. تسريب بيانات وحذوفات وكاش المستخدم السابق إلى المستخدم الجديد عند تسجيل الخروج.
  3. كشف مفاتيح Firebase API و Cloudinary fallback صريحة في الشفرة المصدرية.
- **السبب الجذري:**
  1. الاعتماد الشكلي على الفحص المحلي بالعميل دون فحص سياق التوكن على السيرفر في قواعد Firestore.
  2. عدم تفريغ `LocalStorage` و `IndexedDB` عند تسجيل الخروج `logout()`.
  3. وجود قيم افتراضية صريحة (Hardcoded Fallbacks) في كود التجهيز بدلاً من فرض الاستدعاء من `.env`.
- **طريقة الحل:**
  - إعادة كتابة [firestore.rules](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/firestore.rules) لاستخدام دوال `isAdmin()`, `isOwner()`, `isSignedIn()` وتأمين المستندات.
  - إنشاء ودعوة دالة `clearLocalUserSessionData()` في [AuthContext.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/context/AuthContext.tsx) و [contentService.ts](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/lib/contentService.ts) لتصفير التخزين كلياً عند تسجيل الخروج.
  - إزالة القيم الصريحة من [firebase.ts](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/lib/firebase.ts) و [cloudinary.ts](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/lib/cloudinary.ts).
- **إجراءات الوقاية مستقبلاً:**
  - فحص أي قواعد Firestore جديدة وتأكيد ربط الكتابة دائماً بـ `request.auth`.
  - التأكد من تفريغ كافة المتاجر المحلية عند كل عملية خروج أو تغيير حساب.
  - حظر كتابة أي مفاتيح صريحة في ملفات الشفرة المصدرية المتبعة.

---

### 📅 2026-08-14 | فحص دقيق للسيناريوهات وإصلاح خلل مصادقة الزائر والروابط وعزل الضيوف
- **نوع المشكلة:** Logic Flaws / Edge Cases / Security Whitelist / Memory Leak Fix
- **المشكلة / الملاحظة:** 
  1. تلقي التوكن المجهول (Anonymous Auth) في [AuthContext.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/context/AuthContext.tsx) وتحديث الواجهة باسم زائر كأنه مستخدم مسجل (`user = { displayName: "طالب وثاق" }`) مما حجب زر "دخول بـ Google" في الهيدر والـ Navbar للضيوف.
  2. اعتماد النص الثابت `"guest_user"` في [contentService.ts](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/lib/contentService.ts) مما خرق قاعدة عزل بيانات الضيوف وتسبب في تلوث بياناتهم في Firestore.
  3. قبول أي رابط دون التحقق من النطاق في [AddContentModal.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/components/AddContentModal.tsx)، مما خرق قاعدة النطاقات الموثوقة (Whitelist).
  4. بقاء المشتركين في الذاكرة الحية (In-Memory Subscribers) دون تحديث عند تسجيل الخروج.
- **السبب الجذري:**
  1. غياب فحص الشرط `!fbUser.isAnonymous` في `onAuthStateChanged`.
  2. افتراض مسار نصي موحد للضيوف بدلاً من استخدام الـ UID المجهول الفريد أو الاقتصار على التخزين المحلي.
  3. غياب دالة التحقق من نطاقات الروابط `validateUrlDomain`.
  4. عدم استدعاء دالة إشعار التصفير للمشتركين داخل `clearLocalUserSessionData`.
- **طريقة الحل:**
  - تعديل [AuthContext.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/context/AuthContext.tsx) لتعيين `setUser` فقط إذا كان المستخدم غير مجهول (`!fbUser.isAnonymous`) مع الإبقاء على الجلسة الخلفية مجهولة لصالح Firestore Rules.
  - تعديل [contentService.ts](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/lib/contentService.ts) لاستخدام `auth.currentUser?.uid` وتأمين عدم الكتابة بمسار مشترك للضيوف، مع إضافة إشعار تصفير المشتركين عند الخروج.
  - إضافة دالة `validateUrlDomain` في [AddContentModal.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/components/AddContentModal.tsx) وتنبيه المستخدم عند إدخال رابط خارج القائمة الموثوقة.
- **إجراءات الوقاية مستقبلاً:**
  - التثبت دائماً من تفكيك الـ Anonymous Tokens عن الـ Auth UI State.
  - إخضاع أي مدخلات روابط خارجية لفحص الـ Domain Whitelist.

---

### 📅 2026-08-14 | الإصلاح الجذري الشامل لمعمارية الأمان والمصادقة (المرحلة 1)
- **نوع المشكلة:** Security / Critical Architecture Fix (RBAC & Auth Bypass)
- **المشكلة / الملاحظة:**
  1. إنشاء حسابات وهمية عند فشل المصادقة في `AuthContext.tsx`.
  2. ثغرة قراءة بيانت كافة الحسابات والتحليلات ونشر المحتوى المباشر بدون تدقيق في `firestore.rules`.
  3. تجاوز الصلاحيات عبر `localStorage` ووجود كلمة `admin` في المسار `pathname`.
- **السبب الجذري:** اعتماد حلول العميل المحلية (Client-side fallbacks & localstorage cache) بدلاً من الفحص السحابي الصارم على السيرفر ورمي استثناءات المصادقة الفعالة.
- **طريقة الحل:**
  - تعديل [AuthContext.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/context/AuthContext.tsx) لرمي الأخطاء الحقيقية من `login` و `register` وإلغاء إنشاء حسابات وهمية عند الفشل.
  - تحديث [firestore.rules](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/firestore.rules) لتقييد قراءة حسابات المستخدمين للمالك أو الأدمن فقط، واشتراط حالة `pending` لإنشاء `custom_content` ما لم يكن الكاتب أدمن، وحظر حذف `analytics_summary`.
  - تحديث [AddContentModal.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/components/AddContentModal.tsx) بإزالة شرط المسار `window.location.pathname.includes("admin")`.
  - تحديث [userPermissionsService.ts](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/lib/userPermissionsService.ts) و [Admin.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/pages/Admin.tsx) لتطهير الكاش المحلي وحظر التلاعب بـ `localStorage` لمنح صلاحيات الأدمن دون بريد إلكتروني معتمد أو اشتراك سحابي موثق.
- **إجراءات الوقاية مستقبلاً:**
  - حظر مطلق لكتل `catch` التي تُنشئ حسابات وهمية محلياً عند فشل السيرفر.
  - التأكد دائماً من أن أي فحص أدمن في الواجهة يرتبط مباشرة بـ Primary Admin Email أو FireStore Verified snapshot.

---

### 📅 2026-08-14 | الإصلاح الجذري لمعمارية المزامنة والتخزين ومعالجة الأخطاء (المرحلة 2)
- **نوع المشكلة:** Architecture / Data Sync & Error Handling Fix
- **المشكلة / الملاحظة:**
  1. تحديث الـ LocalStorage و IndexedDB محلياً قبل التأكد من نجاح عمليات الحذف أو الإضافة أو التعديل سحابياً في Firestore.
  2. ابتلاع الأخطاء ووجود عشرات كتل `catch (e) {}` الفارغة في خدمات البيانات (`contentService.ts`, `teacherService.ts`, `visitService.ts`).
- **السبب الجذري:** تنفيذ التحديثات المحلية مسبقاً (Premature Optimistic Updates) دون وجود آلية تراجع (Rollback Mechanism) عند رفض Firestore للعمليات، وإخفاء الاستثناءات المرتجعة كلياً.
- **طريقة الحل:**
  - تعديل [teacherService.ts](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/lib/teacherService.ts) بجعل استدائيات Firestore Cloud تتم أولاً وتلقي الاستثناءات بوضوح عند غياب الصلاحية قبل تعديل التخزين المحلي.
  - تعديل [contentService.ts](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/lib/contentService.ts) لربط دوال `addCustomContent`, `approveCustomContent`, `deleteCustomContent` بنجاح Firestore أولاً ورمي الأخطاء التوضيحية عند الفشل.
  - إزالة كتل ابتلاع الأخطاء الصامتة وإبدالها بـ `console.error` وتنبيهات الاستثناءات الصريحة.
- **إجراءات الوقاية مستقبلاً:**
  - اشتراط تنفيذ العمليات السحابية أولاً أو توفير آلية Rollback موثوقة عند فشل Firestore.
  - منع استخدام كتل `catch (e) {}` الفارغة بدون تسجيل أو معالجة صريحة للخطأ.

---

### 📅 2026-08-14 | بناء وتفعيل نظام الفحص البرمجي الأوتوماتيكي (Automated Testing & Error Boundary)
- **نوع المشكلة:** Automated Quality Assurance / Failure Prevention / Error Catching
- **المشكلة / الملاحظة:** غياب الفحص التلقائي لوظائف الكود (Unit Testing) وعدم وجود واجهة حماية (Error Boundary) لاصطياد الأخطاء البرمجية المفاجئة في React قبل وصولها للزائر.
- **السبب الجذري:** الاعتماد الصرف على الفحص اليدوي واقتصار السكريبتات على `vite build` و `tsc`.
- **طريقة الحل:**
  1. تثبيت وتكوين مكتبة الاختبارات السريعة `vitest` في [vite.config.ts](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/vite.config.ts).
  2. إنشاء مكون الحماية من الانهيار [ErrorBoundary.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/components/ErrorBoundary.tsx) وتغليف [main.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/main.tsx) به لاصطياد أخطاء الواجهة بأمان.
  3. إنشاء ملفات الاختبارات التلقائية لدوال ومستويات الصلاحيات والأدوات:
     - `src/lib/__tests__/utils.test.ts` (6 اختبارات نجحت بنسبة 100%).
     - `src/lib/__tests__/userPermissionsService.test.ts` (3 اختبارات نجحت بنسبة 100%).
  4. إضافة أمر الفحص الشامل الموحد قبل النشر في [package.json](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/package.json):
     `npm run test:all` (يقوم بفحص أنواع TypeScript + تشغيل اختبارات Vitest التلقائية + تجميع Vite للإنتاج في 7 ثوانٍ).
- **إجراءات الوقاية مستقبلاً:**
  - تشغيل `npm run test:all` دائماً بعد كل تعديل رئيسي للتحقق من سلامة كافة الدوال بنقرة واحدة.

---

### 📅 2026-08-14 | الإصلاح الجذري لنمط أخطاء تصاريح الضيوف وعزل البيانات (المرحلة 1)
- **نوع المشكلة:** Architecture / Security / Data Isolation Bug Fix
- **المشكلة / الملاحظة:** ظهور أخطاء `FirebaseError: [code=permission-denied]` صامتة في Console للضيوف، وفشل كتابة المحتوى وسجلات الحذف الخاصة بالضيوف سحابياً.
- **السبب الجذري:** الاعتماد على السلاسل النصية الثابتة (`guest_user` و `anonymous_user`) التي ترفضها قواعد Firestore لأن `request.auth.uid` للزائر المجهول ينشأ مجهولاً بـ UID مختلف ديناميكياً.
- **طريقة الحل:**
  - تعديل [contentService.ts](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/lib/contentService.ts) لاستخراج `auth.currentUser?.uid` ديناميكياً وعزل اشتراك المجموعة الفرعية للمستخدمين فقط عندما يتوفر UID حقيقي.
  - تعديل [AddContentModal.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/components/AddContentModal.tsx) لتمرير `effectiveUserId` الديناميكي دون نصوص ثابتة.
- **إجراءات الوقاية مستقبلاً:**
  - حظر مطلق لاستخدام نصوص ثابتة مثل `guest_user` في استعلامات المستندات والمجموعات الشخصية.

---

### 📅 2026-08-14 | الإصلاح الجذري لحلقات الكتابة السحابية التكرارية في تبويب المستخدمين (المرحلة 2)
- **نوع المشكلة:** Cloud Performance & Write Side-Effects Fix
- **المشكلة / الملاحظة:** إرسال طلبات كتابة سحابية حية (`setDoc`) بشكل تكراري عند فتح تبويب مستخدمي Google وداخل مستمعي `onSnapshot`.
- **السبب الجذري:** استدعاك `setDoc` قسري داخل دالة `useEffect` لمصفوفات حسابات ثابتة وتحديث القائمة.
- **طريقة الحل:**
  - تعديل [AdminGoogleUsersTab.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/components/admin/AdminGoogleUsersTab.tsx) بإزالة استدعاءات `setDoc` القسرية في `useEffect` و `updateUserList` والاقتصار على القراءة المباشرة من Firestore والتخزين المحلي.
- **إجراءات الوقاية مستقبلاً:**
  - منع تنفيذ أي دالة كتابة `setDoc` داخل `useEffect` للعرض دون إجراء صريح من المستخدم.

---

### 📅 2026-08-14 | إعادة الهيكلة وتجزئة ملفات الصفحات الكبيرة لتلتزم بالحجم المعماري (المرحلة 3)
- **نوع المشكلة:** Code Quality & Modular Architecture Refactoring
- **المشكلة / الملاحظة:** تضخم حجم ملفي `Admin.tsx` (941 سطرًا) و `Videos.tsx` (738 سطرًا) وتجاوزهما القواعد المعمارية للمشروع (~400 سطر).
- **السبب الجذري:** دمج المكونات المنبثقة وبطاقات العرض المعقدة داخل المكونات الرئيسية للصفحات.
- **طريقة الحل:**
  - إنشاء مكونات مستقلة: [AdminAddSubjectModal.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/components/admin/AdminAddSubjectModal.tsx)، [AdminAddTeacherModal.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/components/admin/AdminAddTeacherModal.tsx)، [AdminCurriculumTab.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/components/admin/AdminCurriculumTab.tsx)، و [VideoCard.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/components/VideoCard.tsx).
  - اختصار [Admin.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/pages/Admin.tsx) ليصبح ~320 سطرًا واختصار [Videos.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/pages/Videos.tsx) ليصبح ~340 سطرًا.
- **إجراءات الوقاية مستقبلاً:**
  - التقيد التلقائي بإنشاء مكونات فرعية فور اقتراب أي ملف من سقف ~400 سطر.






