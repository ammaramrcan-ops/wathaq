# سجل المشكلات والتعديلات وتحسينات SonarCloud (Wathaq Solved Issues & Evolution Log)

> **هدف الملف:** أرشفة كل مشكلة تم حلها، ثغرة أمنية، ملاحظة SonarCloud، أو تعديل جوهري على المشروع لمنع تكرار الأخطاء وتوسيع معرفة الذكاء الاصطناعي والمطورين بين الجلسات.

---

## 📌 سجل المشكلات والتعديلات (Historical Log)

### 📅 2026-08-31 | استبدال اسم المتغير e بـ errObj وحسم تحذير JS-C1002 نهائياً
- **نوع الإجراء:** DeepSource Code Naming Standardization (JS-C1002 Fix)
- **السبب الجذري:**
  1. أشار تحذير DeepSource `JS-C1002` إلى أن اسم المتغير `e` صغير للغاية (Variable name is too small).
- **طريقة الحل:**
  - استبدال `e` بـ `errObj` و `str` بـ `combinedStr` في الدالة `isPermissionError` بـ [contentService.ts](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/lib/contentService.ts).
  - إجراء البناء الشامل `npm run build` واجتياز اختبارات الوحدة (12/12) بنسبة 100%.
- **خطة الوقاية وتيسير التطوير:**
  - تجنب استخدام أسماء المتغيرات أحادية الحروف مثل `e` واختيار أسماء معبرة مثل `errObj` أو `errorDetails`.

---

### 📅 2026-08-31 | تسطيح isPermissionError إلى تعقيد 1 خالٍ من التفرعات (التقرير المثالي لـ DeepSource)
- **نوع الإجراء:** Zero-Branch Predicate Refactoring (Cyclomatic Complexity = 1)
- **السبب الجذري:**
  1. أشار تقرير DeepSource المتقدم إلى ارتفاع تعقيد `isPermissionError` (Cyclomatic Complexity = 6) بسبب تجميع الشروط المتعددة `if` و `in` و `||` والـ Ternaries عند التحقق من أنواع الاستثناءات.
- **طريقة الحل:**
  - استبدال الشروط والـ `if` والـ `in` بتجميع نصي مباشر وتطابق واحد `str.includes("permission")`؛ مما انخفض بالتعقيد الخوارزمي للدالة من 6 إلى **1** فقط (الحد الأدنى الخوارزمي المطلق).
  - إجراء البناء الشامل `npm run build` واجتياز كافّة الاختبارات التلقائية (12/12).
- **خطة الوقاية وتيسير التطوير:**
  - استخدام الدمج النصي المباشر عند فحص أنواع رسائل الأخطاء السحابية لتفادي إنشاء تفريغات شرطية زائدة.

---

### 📅 2026-08-31 | استخراج دالة isPermissionError وتخفيض التعقيد لـ 2 فقط (التقرير النظيف لـ DeepSource)
- **نوع الإجراء:** DeepSource Final Cyclomatic Complexity Zero-Out (JS-R1005 Refactoring)
- **السبب الجذري:**
  1. بلغت نسبة التعقيد الخوارزمي في `syncGlobalDeletedItemCloud` (Cyclomatic Complexity = 7) بسبب تجميع الشروط المتعددة والتحقق من التوكنات والاستثناءات وتركيبات الـ Ternary والـ `||` في كتل الـ `catch`.
- **طريقة الحل:**
  - استخراج دالة فحص الصلاحية المستقلة `isPermissionError(err: unknown): boolean` وفصل فحص الأخطاء والنصوص بعيداً عن مجرى التنفيذ الرئيسي.
  - تخفيض التعقيد الخوارزمي للدالة `syncGlobalDeletedItemCloud` من 7 إلى **2** فقط (مع جعل `isPermissionError` بنسبة تعقيد **3** آمنة وممتازة).
  - التأكد من البناء الشامل `npm run build` واجتياز كافّة الاختبارات التلقائية (12/12).
- **خطة الوقاية وتيسير التطوير:**
  - فصل معالجة الأخطاء المعقدة بدوال فحص منفصلة آمنة (Predicates) لرفع النقاء النظري والمعماري للكود.

---

### 📅 2026-08-31 | تفتيت markItemAsDeletedCloud وتحقيق 100% نجاح في تقرير DeepSource (0 Issues)
- **نوع الإجراء:** DeepSource Final Complexity Elimination (JS-R1005 Refactoring)
- **السبب الجذري:**
  1. ارتفاع التعقيد الخوارزمي (Cyclomatic Complexity = 9) بـ [contentService.ts](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/lib/contentService.ts) في `markItemAsDeletedCloud` نتيجة وجود كتل `try/catch` متداخلة وشروط متعددة لمزامنة العناصر المحذوفة عاماً وشخصياً في Firestore.
- **طريقة الحل:**
  - تفتيت وتجزئة `markItemAsDeletedCloud` إلى دالتين مساعِدتين مسطحتين ومباشرتين: `syncGlobalDeletedItemCloud` (تُعنى بالحذف العام) و `syncUserDeletedItemCloud` (تُعنى بالحذف الخاص للمستخدم).
  - تحويل `markItemAsDeletedCloud` إلى موجه مباشر بسيط (Cyclomatic Complexity = 1).
  - التأكد من البناء الشامل `npm run build` واجتياز اختبارات الوحدة (12/12) بنسبة 100%.
- **خطة الوقاية وتيسير التطوير:**
  - المحافظة على دالة واحدة لمهمة واحدة (Single Responsibility Principle) لتفادي أي ارتفاع في التعقيد الخوارزمي مستقبلاً.

---

### 📅 2026-08-31 | حسم الملاحظات السبع المتبقية لـ DeepSource وإعادة ترتيب الدوال لتفادي Hoisting
- **نوع الإجراء:** DeepSource Final 7 Issues Resolution & Topological Order Refactoring
- **السبب الجذري:**
  1. ظهور تحذيرات `JS-0357` (استخدام الدوال قبل تعريفها) بسبب استدعاء `notifyDeletedSubscribers` و `notifyCustomSubscribers` أعلى الترتيب النصي للملف في [contentService.ts](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/lib/contentService.ts).
  2. ارتفاع تعقيد الكود `JS-R1005` (Cyclomatic Complexity) في `markItemAsDeleted` (14) و `addCustomContent` (6) بسبب تكدس المسارات الشرطية وكتل `try/catch` المزدوجة.
- **طريقة الحل:**
  - إعادة الترتيب التبولوجي المنطقي للدوال في [contentService.ts](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/lib/contentService.ts) بحيث تُعرّف كافة الدوال المساعدة والـ Getters ومطلقي الإشعارات في البداية وقبل أي دالة أخرى تستدعيها نهائياً.
  - تفكيك وتجزئة `markItemAsDeleted` إلى دوال فرعية مستقلة `markItemAsDeletedLocal` و `markItemAsDeletedCloud`؛ مما خفض التعقيد الخوارزمي من 14 إلى **1** فقط.
  - تجزئة `addCustomContent` إلى `saveCustomContentCloud` و `saveCustomContentLocal`؛ مما خفض التعقيد الخوارزمي من 6 إلى **2** فقط.
  - التأكد من نجاح البناء الشامل `npm run build` واجتياز كافّة الاختبارات التلقائية (12/12).
- **خطة الوقاية وتيسير التطوير:**
  - الاعتماد دائماً على الترتيب التبولوجي لدوال الملف لتفادي أخطاء النطاق ورفع مقروئية الكود.

---

### 📅 2026-08-31 | حظر ومعالجة 35 ملاحظة جودة وأسلوب كود من DeepSource في contentService.ts
- **نوع الإجراء:** DeepSource Code Quality & Refactoring Cleanup (35 Issues Resolved)
- **السبب الجذري:**
  1. وجود متغيرات استثناءات غير مستخدمة `e` في كتل `catch (e)` بـ [contentService.ts](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/lib/contentService.ts) مما زاد من تحذيرات `JS-0356`.
  2. إرجاع نصوص عادية في `reject("No IndexedDB")` بدلاً من كائنات استثناء `Error` مما خالف قاعدة `JS-0114`.
  3. وجود صياغة نمط قديمة للدوال في النطاق العام وقيم أنواع `any` غير الآمنة بكتل `catch (gErr: unknown)` مما فجر تحذيرات `JS-0067` و `JS-0323`.
  4. وجود تعبيرات أسهم فارغة `.catch(() => {})` مما أدى لتحذيرات `JS-0321`.
- **طريقة الحل:**
  - تحويل كتل `catch (e)` إلى صيغة TypeScript الحديثة `catch` بدون ربط متغيرات غير مستخدمة.
  - استبدال `reject("No IndexedDB")` بـ `reject(new Error("No IndexedDB"))` وتحديث الدوال لتستخدم صياغة التعبير الثابتة `const openIDB = () => ...`.
  - التخلص من أي `any` cast واستبدالها بالتحقق النوعي `gErr instanceof Error ? (gErr as Error & { code?: string }) : null`.
  - تحويل الـ `.catch(() => {})` إلى `.catch(() => undefined)`.
  - التأكد من البناء الشامل `npm run build` واجتياز كافّة الاختبارات التلقائية (12/12).
- **خطة الوقاية وتيسير التطوير:**
  - الاعتماد على `catch` الحديثة بدون متغيرات صريحة لتفادي تحذيرات المتغيرات المهملة في TypeScript وDeepSource.

---

### 📅 2026-08-31 | إصلاح خطأ التجميع وتفكك التعليقات الناتج عن دمج PR التعديل التلقائي لـ DeepSource (#2)
- **نوع الإجراء:** DeepSource AutoFix PR #2 Repair & Broken Comment Restoration
- **السبب الجذري:**
  1. قامت أداة التعديل التلقائي من DeepSource في الـ PR رقم #2 بحذف بداية التوثيق `/**` لـ JSDoc في [contentService.ts](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/lib/contentService.ts)، مما ترك رمز الإغلاق `*/` عائماً دون فتح وتسبب بخطأ بناء esbuild من نوع `Unexpected "*"`.
- **طريقة الحل:**
  - إعادة كتابة واسترجاع الهيدر والتوثيق التوضيحي `/**` للدالة `subscribeDeletedItems` في [contentService.ts](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/lib/contentService.ts).
  - إجراء البناء الشامل `npm run build` واجتياز اختبارات الوحدة `npm test` بنسبة 100%.
- **خطة الوقاية وتيسير التطوير:**
  - فحص أي تعديل آلي من DeepSource يستهدف تعليقات JSDoc وتوثيق الدوال لمنع حذف أقواس الفتح.

---

### 📅 2026-08-31 | إصلاح خطأ البناء والتجميع الناتج عن دمج PR التعديل التلقائي لـ DeepSource (#1)
- **نوع الإجراء:** DeepSource AutoFix Syntax Repair & CI Build Restoration
- **السبب الجذري:**
  1. قامت أداة التعديل التلقائي من DeepSource (PR #1) بالتعامل الخاطئ مع كتل الاستثناءات الفاضية `catch (e) {}` واستبدالها نصياً بـ `catch (e) { // empty }` على سطر واحد؛ مما أدى لابتلاع قوس الإغلاق `}` بواسطة التعليق السطري `//` والتسبب بخطأ بناء TypeScript/esbuild من نوع `Unexpected "catch"`.
  2. أضافت الأداة أيضاً كسر نصوص الهروب (escaping) لبعض النصوص العربية مثل `throw new Error("... \");` في [communityService.ts](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/lib/communityService.ts) مما تسبب بخطأ `Unterminated string literal`.
- **طريقة الحل:**
  - معالجة نصوص التعليقات داخل كتل `catch` بتنسيق كتل متعددة الأسطر آمنة `/* ignore fallback error */` ومنع التعليقات السطرية المباشرة بجانب أقواس الإغلاق في [AuthContext.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/context/AuthContext.tsx), [communityService.ts](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/lib/communityService.ts), [lessonsData.ts](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/lib/lessonsData.ts), و [teacherService.ts](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/lib/teacherService.ts).
  - تصحيح الهروب النصي المكسور وعلامات التنصيص في [communityService.ts](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/lib/communityService.ts).
  - التحقق من نجاح التجميع `npm run build` واجتياز كافّة اختبارات الوحدة `npm test` بنسبة 100%.
- **خطة الوقاية وتيسير التطوير:**
  - مراجعة أي Pull Request تلقائي من DeepSource بدقة قبل الدمج للتأكد من عدم كسر قواعد بناء TypeScript أو نصوص الهروب العربي.

---

### 📅 2026-08-31 | (مراجعة كود مستقلة - المرحلة 4) مزامنة الصلاحيات الإدارية للأدمن الفرعيين والناشرين المعتمدين محلياً
- **نوع الإجراء:** RBAC Authorization & Multi-Admin Sync Fix
- **السبب الجذري:** اقتصار الدالة التزامنية `getUserPermissions` بـ [userPermissionsService.ts](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/lib/userPermissionsService.ts) على البريد الرئيسي `ammaramrcan@gmail.com` وتجريد أي بريد آخر من الصلاحيات الإدارية كـ Fallback تزامني؛ مما أدى لميض شاشة القفل بصفحة `/admin` وحجب ميزة النشر المباشر عن الأدمن الفرعيين والناشرين المعتمدين.
- **طريقة الحل:**
  - تعديل دالة `getUserPermissions` لتتحقق من الصلاحيات المسجلة سحابياً والمحفوظة في الكاش المحلي المعتمد (`cached.role === "admin"` أو `cached.canAccessAdmin === true`) وتمرير رتبة الأدمن والناشر الموثوق للعميل بسلاسة دون حصرها نصياً بالمالك فقط.
  - إضافة اختبار وحدة تلقائي بـ `userPermissionsService.test.ts` لتأكيد صحة قراءة واسترجاع صلاحيات الأدمن الفرعيين.
- **خطة الوقاية وتيسير التطوير:**
  - دعم تمثيل الصلاحيات الممنوحة سحابياً في الذاكرة المحلية بمرونة لتيسير العمل الجماعي والـ Multi-Admin Delegation.

---

### 📅 2026-08-31 | (مراجعة كود مستقلة - المرحلة 3) توحيد معمارية المزامنة السحابية أولاً لخدمات المناهج والمرفقات والجروبات
- **نوع الإجراء:** Cloud-First Architecture & Data Sync Consistency Fix
- **السبب الجذري:** كتابة وتعديل بيانات مرفقات الدروس وجروبات تليجرام/واتساب وأبواب المناهج وروابط NotebookLM في `LocalStorage` محلياً أولاً قبل التأكد من نجاح Cloud Firestore وبلع أخطاء السيرفر صامتاً (`console.warn`) مما أدى إلى تباعد البيانات بين الأجهزة عند الفشل السحابي (Data Desync).
- **طريقة الحل:**
  - تعديل دوال `saveLessonResource`, `addCommunityGroup`, `deleteCommunityGroup`, `saveStoredSubjectUnits`, `saveSubjectNotebookLmLink` في [lessonResourcesService.ts](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/lib/lessonResourcesService.ts)، [communityGroupsService.ts](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/lib/communityGroupsService.ts)، [lessonsData.ts](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/lib/lessonsData.ts)، و [subjectNotebookLmService.ts](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/lib/subjectNotebookLmService.ts) لإجراء العمليات السحابية أولاً، وإلقاء استثناءات صريحة تمنع تعديل الذاكرة المحلية عند الرفض السحابي.
- **خطة الوقاية وتيسير التطوير:**
  - الاعتماد دائماً على السلسلة السحابية أولاً (Cloud-First Sync) لجميع خدمات المشروع دون استثناء لمنع التعارض السحابي/المحلي.

---

### 📅 2026-08-31 | (مراجعة كود مستقلة - المرحلة 2) تقييد إنشاء الاقتراحات بالمصادقة وفحص الحقول من البوتات الـ Spam
- **نوع الإجراء:** Security Hardening & Firestore Anti-Spam Rule
- **السبب الجذري:** السماح لإنشاء الاقتراحات في `firestore.rules` بشرط `allow create: if true;` دون مصادقة ودون فحص أحجام وأنواع الحقول، مما عرض مجموعة `suggestions` لإغراق بالبيانات الوهمية والـ Spam.
- **طريقة الحل:**
  - تعديل قاعدة `match /suggestions/{document=**}` في [firestore.rules](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/firestore.rules) باشتراط التوثيق `isSignedIn()` وفحص وجود حقول `title` و `details` بأسماء نصية محددة وأحجام منطقية (أقصى طول للعنوان 300 حرف والتفاصيل 2000 حرف).
- **خطة الوقاية وتيسير التطوير:**
  - حظر استخدام `allow create: if true;` المفتوحة بدون فحص مصادقة التوكن `isSignedIn()` وضوابط أحجام النصوص المرفوعة.

---

### 📅 2026-08-31 | (مراجعة كود مستقلة - المرحلة 1) سد ثغرة تعديل المحتوى المعتمد وتمرير الروابط الخبيثة
- **نوع الإجراء:** Critical Security Hardening & Firestore Authorization Rule Fix
- **السبب الجذري:** السماح لمالك المستند الاصلي غير الأدمن بتحديث مستند `custom_content` في `firestore.rules` بشرط `request.resource.data.status == resource.data.status`؛ مما أتاح تعديل الرابط أو البيانات بعد موافقة الأدمن مع الإبقاء على الحالة `approved` وتجاوز خطوة إعادة المعاينة.
- **طريقة الحل:**
  - تعديل قاعدة `match /custom_content/{document=**}` في [firestore.rules](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/firestore.rules) باشتراط `request.resource.data.status == "pending"` لأي طلب تعديل من مستخدم عادي غير أدمن؛ مما يجبر أي تعديل جديد على العودة التلقائية لحالة المعاينة والانتظار لحين إعادة اعتماد الأدمن.
- **خطة الوقاية وتيسير التطوير:**
  - عدم السماح مطلقاً بتمرير دالة `request.resource.data.status == resource.data.status` على القوائم المعتمدة من الأدمن لمنع أي تلاعب لاحق بالروابط والبيانات.

---

### 📅 2026-08-31 | (مراجعة الكود - المرحلة 3) توحيد نمط المزامنة السحابية وإلغاء التعديل المحلي المتفائل غير المسترد
- **نوع الإجراء:** Architecture Refactoring & Data Sync Consistency Fix
- **السبب الجذري:** كتابة المنشورات والاقتراحات في `LocalStorage` و `IndexedDB` محلياً أولاً قبل التأكد من نجاح Cloud Firestore وبلع أخطاء السيرفر صامتاً (`console.warn`) مما أدى إلى تباعد وتعارض البيانات بين الأجهزة عند الفشل السحابي (Data Desync).
- **طريقة الحل:**
  - توحيد معمارية المزامنة في [communityService.ts](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/lib/communityService.ts) و [suggestionService.ts](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/lib/suggestionService.ts) لإجراء العمليات السحابية أولاً، وإلقاء استثناءات صريحة تمنع تعديل الذاكرة المحلية وتُخطر المستخدم فوراً برفض أو فشل عملية السيرفر.

---

### 📅 2026-08-31 | (مراجعة الكود - المرحلة 2) تجريد التخزين المحلي من الصلاحيات الإدارية واشتراط التوثيق السحابي
- **نوع الإجراء:** Client Storage Privilege Elimination & Live Authorization Hardening
- **السبب الجذري:** الاعتماد على `isVerifiedServerAdmin` أو `canAccessAdmin` المحفوظة في `LocalStorage` لمنح الصلاحيات الإدارية، مما أتاح إمكانية التلاعب بها عبر أدوات المتصفح (F12) لكشف واجهة لوحة التحكم ورؤية البيانات الحساسة أو إرسال المحتوى بوضع الاعتماد المباشر.
- **طريقة الحل:**
  - تعديل دالة `getUserPermissions` في [userPermissionsService.ts](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/lib/userPermissionsService.ts) بفرض `canAccessAdmin: false` نهائياً وعدم إرجاع `role: "admin"` لأي بريد غير الإيميل المعتمد لمالك المنصة `ammaramrcan@gmail.com` من الذاكرة المحلية.
  - قصر منح الصلاحية الإدارية على البث المباشر الموثوق من خادم Firestore عبر `subscribeUserPermissions` لمنع أي محاولة تحايل بالذاكرة المحلية من الوصول للوحة التحكم.

---

### 📅 2026-08-31 | (مراجعة الكود - المرحلة 1) تأمين قواعد بيانات Firestore لمجموعة analytics_summary
- **نوع الإجراء:** Security Hardening & Firestore Authorization Rule Fix
- **السبب الجذري:** السماح لطلبات التعديل والإنشاء على `analytics_summary` دون مصادقة ودون التحقق من القيم والمساحات الرقمية للعدادات مما عرض البيانات للتلاعب غير المصرح به.
- **طريقة الحل:**
  - تعديل [firestore.rules](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/firestore.rules) بفرض شرط المصادقة (`isSignedIn()`) وشرط إيجابية العدادات (`is number && >= 0`) لمنع تلاعب أي طرف غريب ببيانات التحليلات الإحصائية للمنصة.

---

### 📅 2026-08-31 | فحص شامل وتنظيف كافة الخدمات من البيانات المبدئية الثابتة قبل النشر
- **نوع الإجراء:** Production Codebase Cleanup & 100% Dynamic Cloud Sync Audit
- **السبب الجذري:** مراجعة جميع ملفات الخدمات وتصفية البيانات المبدئية لضمان عدم ظهور أي بيانات وهمية أو غير قابلة للحذف عند إطلاق المنصة رسميًا.
- **التعديلات والحلول:**
  1. **المدرسون ([teacherService.ts](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/lib/teacherService.ts)):** تفريغ `DEFAULT_TEACHERS = []` وتصفية المعرفات القديمة وحذف المدرسين وهمياً، وتوفير واجهات فارغة أنيقة.
  2. **مجتمع وثاق والنقاشات ([communityService.ts](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/lib/communityService.ts)):** تفريغ `DEFAULT_DISCUSSIONS = []` وتصفية المعرفات القديمة.
  3. **جروبات تليجرام/واتساب ([communityGroupsService.ts](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/lib/communityGroupsService.ts)):** تفريغ `DEFAULT_COMMUNITY_GROUPS = []`.
  4. **دروس وأبواب المناهج ([lessonsData.ts](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/lib/lessonsData.ts)):** ربط أبواب ودروس المناهج بـ Firestore `curriculum_meta/subject_units`.

---

### 📅 2026-08-31 | إزالة الجروبات المبدئية الثابتة وجعل تجمعات المجتمع سحابية 100%
- **نوع الإجراء:** 100% Dynamic Cloud Community Groups Architecture
- **السبب الجذري:** كانت توجد بيانات تجريبية مبدئية `DEFAULT_COMMUNITY_GROUPS` تحتوي على 3 جروبات ثابتة بـ [communityGroupsService.ts](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/lib/communityGroupsService.ts)، مما منع حذفها عند تفريغ القائمة من قبل الأدمن.
- **طريقة الحل:**
  1. تفريغ `DEFAULT_COMMUNITY_GROUPS = []` نهائياً.
  2. مسح المعرفات القديمة تلقائياً من التخزين المحلي والربط المباشر بـ Firestore collection `community_groups`.
  3. إضافة واجهة تنبيه أنيقة في حال عدم وجود جروبات تتيح للأدمن إضافة أول جروب سحابي بديناميكية تامة.

---

### 📅 2026-08-31 | إصلاح عدم استجابة النقر على تبويبات "مرفقات الدروس" و "جروبات تليجرام/واتساب" بالـ Admin
- **نوع الإجراء:** Admin Routing & Valid Tabs Fix
- **السبب الجذري:** مصفوفة التبويبات المسموحة `validTabs` بـ [Admin.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/pages/Admin.tsx) لم تكن تحتوي على `resources` و `groups`، مما أدى إلى إعادة توجيه المستخدم تلقائياً لـ `"overview"` فور النقر عليهما.
- **طريقة الحل:** تم تحديث مصفوفة `validTabs` لتشمل `"resources"` و `"groups"`.

---

### 📅 2026-08-31 | تخصيص رابط معلّم NotebookLM المباشر لكل مادة دراسية
- **نوع الإجراء:** Subject-Specific NotebookLM Integration
- **التفاصيل والهدف:**
  1. إنشاء خدمة [subjectNotebookLmService.ts](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/lib/subjectNotebookLmService.ts) لحفظ واسترجاع روابط نوت بوك NotebookLM المخصصة لكل مادة سحابياً بـ Firestore ومحلياً.
  2. توفير حقل مخصص بـ [AdminLessonResourcesTab.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/components/admin/AdminLessonResourcesTab.tsx) لوضع رابط NotebookLM الخاص بالمادة المحددة.
  3. تحديث [Books.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/pages/Books.tsx) بحيث تفتح كارت معلّم AI NotebookLM 🤖 النوت بوك المخصص المباشر للمادة فور النقر عليها، مع استخدام الرابط العام كـ fallback.
- **طريقة الحل:**
  - إضافة `subscribeSubjectNotebookLmMap` و `saveSubjectNotebookLmLink`.

---

### 📅 2026-08-31 | إدارة مرفقات الدروس (PDF/خرائط/CSV) + تجمعات وجروبات تليجرام/واتساب
- **نوع الإجراء:** Lesson-Level Attachment Architecture & Community Study Groups
- **التفاصيل والهدف:**
  1. ربط كل درس بالمنهج بمرفقاته الخاصة عبر [lessonResourcesService.ts](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/lib/lessonResourcesService.ts):
     - **📄 ملفات الـ PDF للملخصات.**
     - **🖼️ الخرائط الذهنية البصرية.**
     - **📊 ملفات الـ CSV للفلاش كارد المخصص.**
  2. إضافة تبويب مخصص في لوحة التحكم **"9. إدارة مرفقات الدروس (PDF / خرائط / CSV) 🔗"** يتيح للأدمن اختيار المادة ➔ الباب ➔ الدرس وضع روابط مرفقاته لتعرض فورياً للطالب فور اختيار الدرس بـ [Books.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/pages/Books.tsx).
  3. إضافة تبويب لوحة التحكم **"10. جروبات تليجرام/واتساب 💬"** عبر [communityGroupsService.ts](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/lib/communityGroupsService.ts) مع عرض قائمة التجمعات الموصى بها بـ [Community.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/pages/Community.tsx).
- **طريقة الحل:**
  - بناء المكونات `AdminLessonResourcesTab.tsx` و `AdminCommunityGroupsTab.tsx`.
  - تحديث `Books.tsx` و `Community.tsx` و `Admin.tsx`.

---

### 📅 2026-08-31 | السؤال التفاعلي للملازم + تصفية مواد المدرسين ديناميكياً حسب القطاع
- **نوع الإجراء:** Interactive Content Scope & Dynamic Admin Dropdown Filtering
- **التفاصيل والهدف:**
  1. تطبيق **سلسلة الأسئلة التفاعلية (السؤال عن كامل المنهج أم درس مخصص)** بـ [Books.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/pages/Books.tsx) لجميع الأقسام (كتب مدرسية، ملازم دراسية، ملخصات، خرائط ذهنية، وفلاش كارد) مماثلة لصفحة الشروحات لتوحيد تجربة المستخدم.
  2. ربط قائمة المواد بـ [AdminAddTeacherModal.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/components/admin/AdminAddTeacherModal.tsx) لتتغير ديناميكياً فور اختيار أو تغيير القطاع (أزهر علمي/أدبي، عام علمي/أدبي/رياضة).
  3. إضافة محدد نوع المدرس (قناة يوتيوب 🔴 أم منصة خاصة 🚀 أم كلاهما 🌐) وإظهار الحقول المخصصة فور اختيار النوع.
- **طريقة الحل:**
  - إضافة `interactiveStep` وسؤال `كامل المنهج أو درس معين` في `Books.tsx`.
  - تحديث `masterSubjectsList` و `filteredSubjects` و `tPlatformType` بـ `AdminAddTeacherModal.tsx`.

---

### 📅 2026-08-31 | تحويل NotebookLM لمربع قسم ضمن الشبكة + ترقية دليل وإدارة المدرسين
- **نوع الإجراء:** Feature Upgrade & UI Restructuring
- **التفاصيل والهدف:**
  1. إزالة المربع/البنر العلوي الثابت الخاص بـ NotebookLM في [Books.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/pages/Books.tsx) وتحويله إلى **مربع قسم مستقل (Grid Section Card)** يظهر جنباً إلى جنب مع باقي الأقسام (كتب، ملازم، ملخصات، خرائط، فلاش كارد)، وعند النقر عليه يفتح منصة `NotebookLM AI` فورياً.
  2. ترقية نموذج **"إضافة مدرس جديد"** في [AdminAddTeacherModal.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/components/admin/AdminAddTeacherModal.tsx) ليتضمن:
     - قائمة خيارات جاهزة لاختيار المادة والقطاع (أزهر علمي/أدبي، عام علمي/أدبي/رياضة).
     - إمكانية إضافة رابط صورة بروفايل المدرس الشخصية (`avatar`).
     - إمكانية إضافة رابط قناة يوتيوب الرسمية ومؤشر إحصائيات عدد الشروحات النازلة عليها (`youtubeLessonsCount`).
     - إضافة زر مستقل وخاص للانتقال للمحاضرة / المنصة المستقلة للشركاء الخارجية (`externalLectureUrl`).
  3. تحديث عرض بطاقة المدرسين في كل من [Teachers.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/pages/Teachers.tsx) و [Admin.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/pages/Admin.tsx) لعرض كافة هذه البيانات والروابط المباشرة بصورة أنيقة ومستقلة.
- **طريقة الحل:**
  - تعديل `bookFilters` وإضافة `notebooklm` كقسم رئيسي بـ `Books.tsx`.
  - تحديث `teacherService.ts` و `AdminAddTeacherModal.tsx` و `Teachers.tsx` و `Admin.tsx`.

---

### 📅 2026-08-31 | القضاء على جلتش الانتقال اللحظي + تحويل المناهج إلى نظام ديناميكي 100%
- **نوع الإجراء:** UI Flicker Elimination & Dynamic Curriculum Architecture
- **التفاصيل والهدف:**
  1. القضاء التام على الجلتش/الرمشة اللحظية عند الانتقال لصفحة أي درس عبر تحسين دالة `useEffect` المراقبة للرابط واستخدام `functional state updaters` لمنع إعادة البناء والتنقل بين الخطوات دون داعٍ.
  2. إلغاء البيانات الاسترشادية الثابتة للمناهج بـ [lessonsData.ts](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/lib/lessonsData.ts) وتفريع إدارة الأبواب والدروس لتكون ديناميكية بنسبة 100% ومحفوظة سحابياً بـ Firestore ومحلياً ليعتمد النظام بالكامل على ما يضيفه الأدمن في لوحة التحكم دون إجبار على بيانات افتراضية غير دقيقة.
- **طريقة الحل:**
  - تعديل `setStep((prev) => (prev === targetStep ? prev : targetStep))` في [Videos.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/pages/Videos.tsx).
  - ضبط `DEFAULT_SUBJECT_UNITS = {}` في `lessonsData.ts`.

---

### 📅 2026-08-31 | مزامنة روابط URL بالكامل للدروس والتبويبات + إعادة زر إدارة المدرسين
- **نوع الإجراء:** Full URL State Sync & Admin UI Alignment
- **التفاصيل والهدف:**
  1. إعادة زر **"6. إدارة المدرسين"** لشريط تبويبات لوحة التحكم [Admin.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/pages/Admin.tsx) ومزامنته بـ `?tab=teachers`.
  2. مزامنة جميع تبويبات لوحة التحكم الـ 8 بـ `useSearchParams` بالرابط (`?tab=overview`, `?tab=content`, `?tab=pending`, `?tab=users`, `?tab=subjects`, `?tab=teachers`, `?tab=lessons`, `?tab=suggestions`) لتسهيل مشاركة وحفظ رابط أي تبويب.
  3. مزامنة اسم الدرس المحدد برابط صفحة الشروحات `?category=...&subject=...&lesson=...&type=video` بـ [Videos.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/pages/Videos.tsx) لضمان ثبات وحفظ واسترجاع صفحة الدرس المحددة عبر الرابط فورياً.
- **طريقة الحل:**
  - تحديث معالجات `handleTabChange` و `setSearchParams` بصفحتي `Admin.tsx` و `Videos.tsx`.

---

### 📅 2026-08-31 | إصلاح التحويل التلقائي وتثبيت الدخول لصفحة الدرس (حتى لو كانت فارغة)
- **نوع المشكلة:** Navigation Bug / SearchParams State Desync
- **المشكلة / الملاحظة:** عند اختيار درس محدد في صفحة الشروحات، تُفتح صفحة الدرس لجزء من الثانية ثم تُعيد المستخدم تلقائياً لصفحة قائمة الدروس.
- **السبب الجذري:** عدم تحديث معاملات الرابط `searchParams` بقيمة `type: video` عند النقر على بطاقات الدروس في الخطوة التفاعلية، مما جعل دالة `useEffect` المراقبة للرابط تعتبر `typeParam` غير موجود فتُعيد تعيين الخطوة لـ `step 3`.
- **طريقة الحل:**
  - تحديث معالجات النقر في [Videos.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/pages/Videos.tsx) لتحديد `setSelectedContentType` ومزامنة `setSearchParams` بالرابط بـ `type: video`.
  - تحسين واجهة صفحة الدرس الفارغة لتظل ثابته وتُظهر اسم الدرس المحدد، وتُتيح زراً ثابتاً لإضافة أول فيديو لهذا الدرس مباشرة أو التبديل لدرس آخر.
- **إجراءات الوقاية مستقبلاً:**
  - المزامنة الكاملة لكل متغيرات التصفح بالرابط `searchParams` لمنع أي صراع بين الحالة المحلية ومراقبات التأثيرات الشاطئة `useEffect`.

---

### 📅 2026-08-31 | دعم هيكلية الأبواب/الفصول الشجرية وتصفية الدروس بأسئلة تفاعلية
- **نوع الإجراء:** New Architecture Feature & Interactive UI Step Wizard
- **التفاصيل والهدف:**
  1. إلغاء الشريط المربع العلوي الثابت بصفحات الشروحات والكتب.
  2. إضافة تسلسل أسئلة تفاعلية عند النقر على "فيديو شرح لدرس معين":
     - **الخطوة الأولى:** سؤال عن الباب/الفصل الدراسي المحدد لمادة المنهج (مثل "الباب الأول: الفيزياء الكهربية").
     - **الخطوة الثانية:** سؤال عن الدرس المحدد داخل هذا الباب (مثل "الدرس الأول: التيار الكهربي وقانون أوم").
     - **الخطوة الثالثة:** عرض الفيديوهات والمحتوى الخاص بهذا الدرس بدقة.
  3. تحديث [lessonsData.ts](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/lib/lessonsData.ts) لدعم الهيكلية الشجرية (`SubjectUnitsMap` و `SubjectUnit`).
  4. إعادة هيكلة تبويب "إدارة دروس المناهج" في لوحة التحكم [AdminLessonsTab.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/components/admin/AdminLessonsTab.tsx) لإضافة وحذف الأبواب/الفصول إضافةً إلى إضافة وحذف الدروس التابعة لكل باب.
- **طريقة الحل:**
  - تعديل `lessonsData.ts` لإدارة الأبواب والدروس الفرعية سحابياً بـ Firestore على المستند `curriculum_meta/subject_units`.
  - تحديث [Videos.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/pages/Videos.tsx) و [Books.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/pages/Books.tsx) لدعم التصفح والأسئلة التفاعلية بدلاً من العرض الثابت.

---

### 📅 2026-08-31 | تصفير عداد الزيارات الإجمالية إلى 7 واستبعاد الزيارات المتكررة
- **نوع المشكلة:** Analytics Reset & Excluded Recurring Visits
- **المشكلة / الملاحظة:** تضخم عداد الزيارات الإجمالية ليظهر 245 زيارة، وهي زيارات مبالغ فيها بسبب احتساب الزيارات المتكررة لكل مستخدم.
- **السبب الجذري:** احتساب `increment(1)` لـ `totalVisits` حتى عندما تكون `isRecurring === true`.
- **طريقة الحل:**
  - إنشاء ودعوة دالة `resetVisitsAnalytics(7)` في [visitService.ts](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/lib/visitService.ts) لتصفير القراءة السحابية بـ Firestore والمحلية بـ IndexedDB & LocalStorage إلى 7 زيارات حقيقية.
  - تعديل دالة `trackVisit()` بحيث لا تزيد `totalVisits` إلا عند وصول **زائر فريد جديد فقط** (`isRecurring === false`)؛ بينما تُميز الزيارات المتكررة تحت بند `recurringVisits` فقط دون زيادة الإجمالي.
  - إضافة زر "تصفير العداد (7) 🔄" بتبويب التحليلات في لوحة التحكم [AdminVisitsOverviewTab.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/components/admin/AdminVisitsOverviewTab.tsx).
- **إجراءات الوقاية مستقبلاً:**
  - استبعاد أي حركة متكررة من العداد الإجمالي لضمان بقاء الزيارات واقعية ودقيقة تماماً.

---

### 📅 2026-08-31 | إضافة الوضع الفاتح والداكن + تصفية وإدارة الدروس + دليل المدرسين المفلتر + NotebookLM AI + سجل الاقتراحات
- **نوع الإجراء:** New Features & Architecture Upgrade
- **التفاصيل والهدف:**
  1. إضافة زر التبديل بين **الوضع الفاتح والداكن (Light/Dark Theme)** وحفظ الاختيار بـ LocalStorage مع تطبيقه على الجذر.
  2. جعل **"أزهري - قسم علمي (الصف الثالث الثانوي)"** هو النظام والفرع الافتراضي للمستخدمين الجدد.
  3. إعادة هيكلة دليل المدرسين في المجتمع [Teachers.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/pages/Teachers.tsx) ليتدرج بتصفية المدرسين حسب القطاع والمادة المحددة ببروفايل الطالب بدلاً من عرض الجميع دفعة واحدة.
  4. دمج أداة **NotebookLM** التفاعلية الذكية مع شارة **"معلّم AI 🤖"** بصفحة الكتب والخرائط الذهنية.
  5. إنشاء نظام وإدارة دروس المناهج [lessonsData.ts](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/lib/lessonsData.ts) وتخيير الطالب بين (كامل المنهج أم درس معين) في الكتب والمرئيات والرفع، وإضافة تبويب **"دروس المناهج"** في لوحة التحكم [AdminLessonsTab.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/components/admin/AdminLessonsTab.tsx).
  6. إنشاء خدمة وسجل الاقتراحات [suggestionService.ts](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/lib/suggestionService.ts) ونموذج تقديم اقتراح بالمجتمع، وإضافة تبويب **"سجل الاقتراحات 💡"** في لوحة التحكم [AdminSuggestionsTab.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/components/admin/AdminSuggestionsTab.tsx).
- **طريقة الحل والتركيب:**
  - إنشاء `suggestionService.ts` و `lessonsData.ts` مع الربط السحابي بـ Firestore والحفظ المحلّي بـ IndexedDB.
  - إدراج متغيرات الألوان للوضع الفاتح بـ `index.css` وتعديل زر التبديل بـ `Profile.tsx`.
  - تحديث [Admin.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/pages/Admin.tsx) و [Books.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/pages/Books.tsx) و [Videos.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/pages/Videos.tsx) و [Community.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/pages/Community.tsx) و [AddContentModal.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/components/AddContentModal.tsx).
- **خطة الوقاية مستقبلاً:**
  - استخدام `subscribeLessons` و `subscribeSuggestions` لمزامنة أي دروس أو اقتراحات جديدة لحظياً عبر كافة الأجهزة.

---

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

---

### 📅 2026-08-31 | إصلاح النواة الأمنية لقواعد Firestore والتخويل ضد انتحال الصلاحيات (المشاكل الحرجة)
- **نوع المشكلة:** Security Architecture & Authorization Hardening
- **المشكلة / الملاحظة:** 
  1. وجود ثغرات في `firestore.rules` تسمح بعمل `update` لـ `custom_content` وتغيير `status` من `"pending"` إلى `"approved"` وتكشف مستندات المستخدمين `/users/{userId}` وتترك `analytics_summary` دون حماية هيكلية.
  2. اعتماد الواجهة على `localStorage` في تحديد `isAuthorizedAdmin` مما يتيح انتحال الصلاحيات عبر DevTools.
- **السبب الجذري:** 
  1. عدم صياغة القيود على حقل `status` في Firestore rules وافتراض مطابقة `/users/{userId}/{document=**}` للمستند الرئيسي.
  2. ثقة `getUserPermissions` في `localStorage` غير الموثوق بدلاً من الاشتراط السحابي.
- **طريقة الحل:**
  - تعديل [firestore.rules](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/firestore.rules):
    - تقييد `update` لـ `custom_content` بحيث `request.resource.data.status == resource.data.status` لغير الأدمن.
    - تقييد `match /users/{userId}` و subcollections لضمان عدم تسريب الإيميلات العامة.
    - تحديد حقول مسموحة فقط لـ `analytics_summary` وإضافة قواعد لـ `discussions` و `suggestions`.
  - تعديل [userPermissionsService.ts](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/lib/userPermissionsService.ts):
    - اشتراط التوثيق السحابي `isVerifiedServerAdmin` لمنح صلاحية الأدمن ومنع الانتحال عبر `localStorage`.
- **إجراءات الوقاية مستقبلاً:**
  - عدم اعتماد أي صلاحية إدارية محلياً دون مطابقة Firestore Server Document أو البريد الرسمي الإداري المعتمد.

---

### 📅 2026-08-31 | إصلاح عزل بيانات الضيوف وإلغاء التصفير التكراري للتحليلات (المشاكل المهمة)
- **نوع المشكلة:** Data Isolation & Side-Effect Prevention
- **المشكلة / الملاحظة:**
  1. تداخل وتزامن تخصصات الضيوف غير المسجلين بسبب الكتابة والمزامنة على المسار المشترك `guest_academic_profile` في Firestore.
  2. إعادة تصفير إحصائيات الزيارات إلى 7 زوار تلقائياً عند كل استيراد لـ `visitService.ts`.
- **السبب الجذري:**
  1. عدم الالتزام بعزل بيانات المستخدمين محلياً وتعديل مسار سحابي موحد للضيوف.
  2. وجود استدعاء دالة `resetVisitsAnalytics(7)` في المستوى الخارجي للملف (Module level).
- **طريقة الحل:**
  - تعديل [subjectsData.ts](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/lib/subjectsData.ts):
    - إلغاء المسار المشترك `guest_academic_profile` وقصر المزامنة السحابية على الحسابات المسجلة بـ `userId` الحقيقي فقط مع حفظ تخصص الضيف محلياً بـ `localStorage`.
  - تعديل [visitService.ts](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/lib/visitService.ts):
    - إزالة الاستدعاء المباشر `resetVisitsAnalytics(7)` لمنع تصفير الإحصائيات عند التحميل.
- **إجراءات الوقاية مستقبلاً:**
  - منع كتابة أي مسارات سحابية موحدة تجمع أكثر من زائر/ضيف بدون `userId` فريد، وتجنب أي side-effects خارجية عند تحميل الملفات.

---

### 📅 2026-08-31 | الإصلاح الجذري الشامل للنواة الأمنية ومزامنة التخزين وآلية الحظر السحابية
- **نوع المشكلة:** Security Architecture / Privilege Escalation / Cloud Sync / User Revocation Mechanism
- **المشكلة / الملاحظة:**
  1. ثغرة أمنية حرج تسمح لأي مستخدم بتغيير `role: "admin"` بمستنده الشخصي في Firestore وتصعيد صلاحياته لأدمن سحابي كامل.
  2. ظهور أخطاء `permission-denied` صامتة عند حذف مناقشات الطلاب بسبب كتابة غير مصرح بها على `global_deleted_items`.
  3. تنفيذ تحديثات التخزين المحلي قبل التحقق من موافقة Firestore في خدمات البيانات.
  4. حذف مستندات Firestore دون حظر حسابات Firebase Auth مما يتيح للمستخدمين المحذوفين إعادة التسجيل والتواجد التلقائي.
- **السبب الجذري:**
  1. السماح بكتابة أي حقول بـ `/users/{userId}` لمالك المستند في Firestore rules دون حظر الحقول الحساسة.
  2. افتراض كتابة الطلاب لعلامات الحذف العامة `global_deleted_items`.
  3. التحديث المسبق لـ LocalStorage والاعتماد على `console.warn` صامت عند فشل السيرفر.
  4. غياب مجموعة ومراقبة الحظر الفعلي `banned_users`.
- **طريقة الحل:**
  - تعديل [firestore.rules](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/firestore.rules):
    - حظر تعديل حقول `role`, `canAccessAdmin`, `canDirectPublish`, `permissions` في `/users/{userId}` لغير الأدمن الأصلي.
    - إضافة مجموعة `banned_users` بحظور قراءة/كتابة صارمة.
  - تعديل [userPermissionsService.ts](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/lib/userPermissionsService.ts) و [teacherService.ts](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/lib/teacherService.ts) و [communityService.ts](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/lib/communityService.ts):
    - تنفيذ عمليات Firestore السحابية أولاً ورمي استثناء صريح عند رفض السيرفر قبل التعديل المحلي.
    - حصر كتابة `global_deleted_items` للأدمن، بينما يعتمد الطلاب على `deleteDoc` للـ `discussions` الذي يلغي المستند تلقائياً عبر `onSnapshot`.
  - تعديل [AuthContext.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/context/AuthContext.tsx) و [AdminGoogleUsersTab.tsx](file:///home/Ammar/سطح%20المكتب/مشاريع/وثاق/src/components/admin/AdminGoogleUsersTab.tsx):
    - فحص الحظر السحابي بـ `onAuthStateChanged` وطرد الحساب المحظور فوراً مع تنبيه باللغة العربية وتطهير جلساته.
    - إضافة سبر الحظر السحابي بـ `banned_users` وإزالة المصفوفات الصلبة التجريبية.
- **إجراءات الوقاية مستقبلاً:**
  - فحص أي حقول صلاحيات جديدة وحظر تعديلها مطلقاً في قواعد Firestore rules لغير الأدمن.
  - التأكد دائماً من اشتراط نجاح Firestore أولاً في جميع ملفات الخدمات وتوفير آلية طرد تلقائية لأي حساب محظور.

