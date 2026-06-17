# دليل تعديل بيانات موقع تأمين 2026

هذا الملف مخصص للمطور أو صاحب الموقع فقط. لا يوجد داخل واجهة المستخدم العامة زر يشرح طريقة تعديل البيانات، لأن المستخدم العادي لا يحتاج يشوف خريطة الأسلاك الداخلية للمشروع.

## 1. أين أعدل بيانات الموقع؟

معظم البيانات موجودة في:

```txt
data/site-data.js
```

بيانات الإصابات موجودة في:

```txt
data/injuries-data.js
```

لا تعدل ملفات CSS أو JS إذا كان المطلوب فقط تغيير أسماء، نتائج، مواعيد، إصابات، أو قصص.

---

# 2. تعديل المباريات القادمة

افتح:

```txt
data/site-data.js
```

وابحث عن:

```js
export const upcomingMatches = [ ... ];
```

مثال مباراة قادمة:

```js
{
  id: 'UP-008',
  title: 'مواجهة الجمعة',
  team1: 'عمر',
  team2: 'كريم',
  location: 'ملعب سيدات الخليل',
  dateLabel: '17/07/2026',
  dateKey: 20260717,
  dateISO: '2026-07-17T19:00:00',
  exactDate: true,
  isPlaceholder: true,
  priority: 6,
  scheduleStatus: 'pending',
  weekday: 5,
  hour: 19,
  minute: 0,
  durationMinutes: 60,
  note: 'ملاحظة تظهر داخل كرت المباراة.',
  heatLabel: 'قادم'
}
```

## شرح الحقول

- `id`: رقم فريد للمباراة. لا تكرر نفس الرقم.
- `title`: عنوان المباراة.
- `team1`: الفريق الأول.
- `team2`: الفريق الثاني.
- `location`: اسم الملعب.
- `dateLabel`: التاريخ الظاهر للمستخدم.
- `dateKey`: رقم التاريخ للترتيب، مثل 20260717.
- `dateISO`: التاريخ الحقيقي الذي يعتمد عليه العداد.
- `hour`: الساعة.
- `minute`: الدقيقة.
- `durationMinutes`: مدة المباراة.
- `note`: ملاحظة قصيرة.
- `heatLabel`: شارة صغيرة مثل قادم، قريبًا، رئيسية.

المهم جدًا: العداد يعتمد على `dateISO` أولًا، لذلك لا تتركه غلط.

---

# 3. تعديل أرشيف المباريات

في نفس الملف:

```txt
data/site-data.js
```

ابحث عن:

```js
export const matchArchive = [ ... ];
```

مثال:

```js
{
  id: 'M-206',
  type: 'strong',
  team1: 'عمر',
  team2: 'كريم',
  score1: 8,
  score2: 6,
  status: 'انتهت',
  dateLabel: '19/06/2026',
  dateKey: 20260619,
  story: 'مباراة قوية انتهت بحسم واضح.',
  details: {
    team1: { possession: 55, shots: 18, onTarget: 11, saves: 4, assists: 6, passes: 90, fouls: 3, corners: 5 },
    team2: { possession: 45, shots: 13, onTarget: 8, saves: 5, assists: 4, passes: 78, fouls: 4, corners: 3 }
  }
}
```

## أنواع المباراة

```txt
normal   مباراة عادية
strong   مباراة قوية
friendly مباراة ودية
```

---

# 4. تعديل الإصابات

افتح:

```txt
data/injuries-data.js
```

وابحث عن:

```js
export const injuryCases = [ ... ];
```

مثال إصابة نشطة:

```js
{
  id: 'INJ-003',
  player: 'اسم اللاعب',
  caseName: 'التواء الكاحل',
  type: 'التواء',
  icon: 'fa-shoe-prints',
  bodyPart: 'الكاحل الأيمن',
  severity: 'medium',
  riskPercent: 54,
  status: 'تحت المتابعة',
  beforeStatus: 'انتفاخ وألم عند المشي.',
  startDate: '2026-06-16',
  expectedReturn: '2026-06-30',
  recoveryDate: '',
  autoArchive: true,
  afterStatus: 'بانتظار التحسن',
  effect: 'تأثير متوسط على المشي والتسارع.',
  description: 'شرح مختصر للحالة.',
  care: [
    'راحة من اللعب',
    'تبريد عند الانتفاخ',
    'الرجوع تدريجيًا'
  ],
  history: [
    { date: '2026-06-16', title: 'ظهور الإصابة', text: 'ملاحظة مختصرة.' }
  ]
}
```

## متى تتحول الإصابة إلى السجل السابق؟

تنتقل تلقائيًا إلى **سجل الإصابات السابقة والمتعافين** إذا تحقق واحد من التالي:

```txt
severity = healed
severity = recovery
status يحتوي كلمة تعافى
recoveryDate انتهى
expectedReturn انتهى
```

إذا لا تريدها تنتقل تلقائيًا حتى بعد انتهاء التاريخ، أضف:

```js
autoArchive: false
```

## مستويات الخطورة

```txt
low       خفيفة
medium    متوسطة
high      عالية
critical  حرجة
illness   مرض أو تعب
recovery  مرحلة تعافي
healed    تعافى
```

## نسبة الخطورة

```txt
0-25    خفيفة
26-55   متوسطة
56-80   عالية
81-100  خطيرة جدًا
```

## أمثلة أيقونات Font Awesome

```txt
fa-shoe-prints        كاحل / قدم
fa-bandage            جرح / ضماد
fa-bone               عظم / كسر
fa-heart-pulse        حالة قوية أو متابعة
fa-dumbbell           عضلة / رضة
fa-head-side-cough    مرض
fa-kit-medical        علاج عام
fa-person-running     جاهزية وحركة
fa-circle-check       تعافي
```

---

# 5. تعديل اللاعبين في الرادار

افتح:

```txt
data/site-data.js
```

وابحث عن:

```js
export const defaultPlayers = [ ... ];
```

مثال لاعب:

```js
{ id: 'H4', team: 'home', name: 'عمر', x: 42, y: 35, role: 'CM', teamRole: 'صانع ألعاب', instruction: 'يتحرك بين الخطوط', captain: true }
```

## شرح الحقول

- `id`: رقم فريد للاعب.
- `team`: إما `home` أو `away`.
- `name`: اسم اللاعب.
- `x`: مكانه أفقيًا في الملعب بالنسبة المئوية.
- `y`: مكانه عموديًا في الملعب بالنسبة المئوية.
- `teamRole`: دوره داخل الفريق.
- `instruction`: تعليمته التكتيكية.
- `captain`: هل هو الكابتن؟

ملاحظة: الموقع يسمح بكابتن واحد لكل فريق. إذا جعلت لاعبين كباتن في نفس الفريق، الكود سيحاول تصحيحها.

---

# 6. تعديل أدوار وتعليمات الرادار

في:

```txt
data/site-data.js
```

ابحث عن:

```js
export const roleOptions = [ ... ];
export const instructionOptions = [ ... ];
```

أضف دورًا جديدًا بهذا الشكل:

```js
{ value: 'محور دفاعي', label: 'محور دفاعي', hint: 'يغطي المساحات أمام الدفاع.' }
```

أضف تعليمة جديدة بهذا الشكل:

```js
{ value: 'لا تندفع', label: 'لا تندفع', hint: 'يحافظ على مركزه ولا يترك العمق.' }
```

---

# 7. تعديل مصادر المنصة

في:

```txt
data/site-data.js
```

ابحث عن:

```js
export const sources = [ ... ];
```

أضف مصدرًا:

```js
{ title: 'اسم المصدر', text: 'شرح مختصر للمصدر.' }
```

---

# 8. تعديل دليل الاستخدام

في:

```txt
data/site-data.js
```

ابحث عن:

```js
export const guideSections = [ ... ];
```

كل عنصر يمثل بطاقة شرح داخل صفحة دليل الاستخدام.

---

# 9. أهم ملاحظات النشر

بعد أي تعديل ورفع على GitHub Pages:

```txt
Ctrl + Shift + R
```

إذا ظل الموقع يعرض نسخة قديمة، امسح بيانات الموقع أو افتحه من نافذة خفية، لأن Service Worker قد يحتفظ بنسخة مخزنة.

---

# 10. ملفات لا تعدلها إلا إذا تعرف ماذا تفعل

```txt
js/modules/router.js
js/modules/tactical.js
js/modules/injuries.js
css/*.css
sw.js
index.html
```

هذه ملفات تشغيل وتصميم. تعديل البيانات غالبًا يكفي من مجلد `data`.
