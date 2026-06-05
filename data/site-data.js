export const siteMeta = {
  name: 'تأمين 2026',
  edition: 'Legacy Edition',
  version: 'v3.0.0-final-sunset-nav',
  maintainer: 'Omar System',
  programmerPages: 'https://omar-i9.github.io/omar-i9/',
  releaseMode: 'شبه نهائي مع صيانة مستقبلية'
};

export const sources = [
  { title: 'Open-Meteo', text: 'مصدر الطقس الحالي والتوقعات بدون مفتاح API مكشوف.' },
  { title: 'Aladhan Prayer Times', text: 'مصدر مواقيت الصلاة حسب إحداثيات الخليل أو القدس.' },
  { title: 'Font Awesome', text: 'مصدر الأيقونات المستخدمة في الواجهة.' },
  { title: 'Google Fonts', text: 'مصدر خطوط Tajawal وReem Kufi وOrbitron.' },
  { title: 'GitHub Pages', text: 'استضافة الموقع كواجهة ثابتة سهلة النشر.' }
];

export const teams = {
  home: {
    id: 'home',
    name: 'فريق النخبة',
    shortName: 'النخبة',
    colorClass: 'team-home'
  },
  away: {
    id: 'away',
    name: 'فريق التحدي',
    shortName: 'التحدي',
    colorClass: 'team-away'
  }
};

export const defaultPlayers = [
  { id: 'H1', team: 'home', name: 'محمد علي', x: 8, y: 50, role: 'GK', teamRole: '', instruction: '', captain: false },
  { id: 'H2', team: 'home', name: 'مؤيد', x: 25, y: 25, role: 'CB', teamRole: '', instruction: '', captain: false },
  { id: 'H3', team: 'home', name: 'هاني', x: 25, y: 75, role: 'CB', teamRole: '', instruction: '', captain: false },
  { id: 'H4', team: 'home', name: 'عمر', x: 42, y: 35, role: 'CM', teamRole: 'صانع ألعاب', instruction: 'يتحرك بين الخطوط', captain: true },
  { id: 'H5', team: 'home', name: 'يوسف', x: 48, y: 68, role: 'ST', teamRole: '', instruction: '', captain: false },
  { id: 'A1', team: 'away', name: 'محمد', x: 92, y: 50, role: 'GK', teamRole: '', instruction: '', captain: false },
  { id: 'A2', team: 'away', name: 'سنقرط', x: 75, y: 25, role: 'CB', teamRole: '', instruction: '', captain: false },
  { id: 'A3', team: 'away', name: 'أحمد', x: 75, y: 75, role: 'CB', teamRole: '', instruction: '', captain: false },
  { id: 'A4', team: 'away', name: 'كريم', x: 58, y: 35, role: 'CM', teamRole: 'قائد الهجوم', instruction: 'يضغط للأمام', captain: true },
  { id: 'A5', team: 'away', name: 'خضر', x: 52, y: 68, role: 'ST', teamRole: '', instruction: '', captain: false }
];

export const playerStats = [
  { name: 'يوسف', goals: 2, assists: 3, saves: 0, rating: 9.7 },
  { name: 'عمر', goals: 2, assists: 1, saves: 1, rating: 9.8 },
  { name: 'كريم', goals: 1, assists: 4, saves: 0, rating: 9.9 },
  { name: 'سكافي', goals: 0, assists: 0, saves: 5, rating: 8.8 },
  { name: 'خضر', goals: 4, assists: 1, saves: 0, rating: 9.9 },
  { name: 'أبو تركي', goals: 2, assists: 2, saves: 0, rating: 9.8 },
  { name: 'سويركي', goals: 4, assists: 5, saves: 0, rating: 10 },
  { name: 'زيد', goals: 5, assists: 3, saves: 0, rating: 10 },
  { name: 'أبو زغير', goals: 0, assists: 0, saves: 6, rating: 9.6 },
  { name: 'محمد علي', goals: 1, assists: 2, saves: 7, rating: 9.4 }
];

export const roleOptions = [
  { value: '', label: 'بدون دور خاص', hint: 'يبقى مركز اللاعب حسب مكانه في الملعب.' },
  { value: 'كابتن', label: 'كابتن', hint: 'قائد الفريق. لاعب واحد فقط لكل فريق.' },
  { value: 'قائد الدفاع', label: 'قائد الدفاع', hint: 'ينظم الخط الخلفي ويغطي العمق.' },
  { value: 'قائد الهجوم', label: 'قائد الهجوم', hint: 'يقود الضغط والتحرك الهجومي.' },
  { value: 'صانع ألعاب', label: 'صانع ألعاب', hint: 'يستلم بين الخطوط ويفتح اللعب.' },
  { value: 'لاعب حر', label: 'لاعب حر', hint: 'يتحرك بدون مركز ثابت.' },
  { value: 'منفذ الركلات', label: 'منفذ الركلات', hint: 'مسؤول عن الركلات الثابتة والجزاء.' },
  { value: 'محور توازن', label: 'محور توازن', hint: 'يربط الدفاع بالهجوم ويمنع المرتدات.' }
];

export const instructionOptions = [
  { value: '', label: 'بدون تعليمات', hint: 'يعتمد على مركزه الحالي فقط.' },
  { value: 'يضغط للأمام', label: 'يضغط للأمام', hint: 'يبدأ الضغط أول ما تخسروا الكرة.' },
  { value: 'يغطي العمق', label: 'يغطي العمق', hint: 'يمنع التمريرات المباشرة في الوسط.' },
  { value: 'يفتح على الخط', label: 'يفتح على الخط', hint: 'يوسع الملعب ويطلب الكرة على الطرف.' },
  { value: 'يسقط للخلف', label: 'يسقط للخلف', hint: 'يرجع لاستلام الكرة وبناء اللعب.' },
  { value: 'يتحرك بين الخطوط', label: 'يتحرك بين الخطوط', hint: 'يستغل المساحات بين الدفاع والوسط.' },
  { value: 'يدخل للعمق', label: 'يدخل للعمق', hint: 'يترك الطرف ويدخل لمنطقة التسجيل.' },
  { value: 'راقب أخطر لاعب', label: 'راقب أخطر لاعب', hint: 'مراقبة فردية لأقوى لاعب عند الخصم.' }
];

export const tactics = {
  diamond: {
    id: 'diamond',
    name: 'الماسة 1-2-1',
    description: 'توازن بين الخروج بالكرة وفتح الأطراف.',
    positions: {
      home: [{ x: 8, y: 50 }, { x: 26, y: 50 }, { x: 48, y: 24 }, { x: 48, y: 76 }, { x: 72, y: 50 }],
      away: [{ x: 92, y: 50 }, { x: 74, y: 50 }, { x: 52, y: 24 }, { x: 52, y: 76 }, { x: 28, y: 50 }]
    }
  },
  square: {
    id: 'square',
    name: 'المربع 2-2',
    description: 'إغلاق العمق والاعتماد على المرتدات.',
    positions: {
      home: [{ x: 8, y: 50 }, { x: 30, y: 28 }, { x: 30, y: 72 }, { x: 62, y: 28 }, { x: 62, y: 72 }],
      away: [{ x: 92, y: 50 }, { x: 70, y: 28 }, { x: 70, y: 72 }, { x: 38, y: 28 }, { x: 38, y: 72 }]
    }
  },
  pyramid: {
    id: 'pyramid',
    name: 'الهرم 2-1-1',
    description: 'ارتكاز واضح يربط الدفاع بالهجوم.',
    positions: {
      home: [{ x: 8, y: 50 }, { x: 28, y: 30 }, { x: 28, y: 70 }, { x: 48, y: 50 }, { x: 72, y: 50 }],
      away: [{ x: 92, y: 50 }, { x: 72, y: 30 }, { x: 72, y: 70 }, { x: 52, y: 50 }, { x: 28, y: 50 }]
    }
  },
  yPress: {
    id: 'yPress',
    name: 'ضغط Y',
    description: 'ضغط عالي لإجبار الخصم على الغلط.',
    positions: {
      home: [{ x: 8, y: 50 }, { x: 36, y: 50 }, { x: 60, y: 24 }, { x: 60, y: 76 }, { x: 82, y: 50 }],
      away: [{ x: 92, y: 50 }, { x: 64, y: 50 }, { x: 40, y: 24 }, { x: 40, y: 76 }, { x: 18, y: 50 }]
    }
  }
};

export const upcomingMatches = [
  {
    id: 'UP-001',
    title: 'الملحمة الأسبوعية',
    team1: 'تأمين',
    team2: 'التحدي',
    location: 'ملعب سيدات الخليل',
    weekday: 5,
    hour: 19,
    minute: 0,
    durationMinutes: 60,
    note: 'الحجز يفتح كل جمعة من 7:00 إلى 8:00 مساءً.',
    heatLabel: 'موعد رئيسي'
  },
  {
    id: 'UP-002',
    title: 'تدريب تكتيكي اختياري',
    team1: 'النخبة',
    team2: 'التحدي',
    location: 'ملعب الحارة',
    weekday: 2,
    hour: 18,
    minute: 30,
    durationMinutes: 45,
    note: 'موعد تجريبي للتمرين، عدله أو احذفه من ملف data/site-data.js.',
    heatLabel: 'اختياري'
  }
];

export const matchArchive = [
  { id: 'M-101', type: 'normal', team1: 'كريم', team2: 'عمر', score1: 6, score2: 9, status: 'انتهت', dateLabel: 'الجمعة 16 يناير', dateKey: 20260116, story: 'افتتاحية قوية وانقلبت لصالح عمر في آخر الدقائق.' },
  { id: 'M-102', type: 'normal', team1: 'عمر', team2: 'كريم', score1: 7, score2: 10, status: 'انتهت', dateLabel: 'الجمعة 23 يناير', dateKey: 20260123, story: 'كريم رد الدين بطريقة مزعجة للخصوم، وممتعة للذين يحبون الفوضى.' },
  { id: 'M-103', type: 'strong', team1: 'كريم التميمي', team2: 'عمر وكريم', score1: 8, score2: 7, status: 'انتهت', dateLabel: 'الجمعة 30 يناير', dateKey: 20260130, story: 'مباراة قوية انتهت بفارق هدف، يعني ضغط أعصاب مجاني.' },
  { id: 'M-104', type: 'normal', team1: 'خضر', team2: 'عمر وكريم', score1: 4, score2: 5, status: 'انتهت', dateLabel: 'الجمعة 13 فبراير', dateKey: 20260213, story: 'مباراة متوازنة حسمها فارق بسيط.' },
  { id: 'M-105', type: 'normal', team1: 'كريم', team2: 'عمر', score1: 3, score2: 3, status: 'انتهت', dateLabel: 'الجمعة 20 فبراير', dateKey: 20260220, story: 'تعادل دفاعي نسبيًا مقارنة بباقي المجازر الرقمية.' },
  { id: 'M-106', type: 'normal', team1: 'عمر', team2: 'كريم', score1: 6, score2: 8, status: 'انتهت', dateLabel: 'الجمعة 27 فبراير', dateKey: 20260227, story: 'كريم خرج بنتيجة قوية بعد مباراة مفتوحة.' },
  { id: 'M-107', type: 'strong', team1: 'خضر', team2: 'كريم', score1: 13, score2: 7, status: 'انتهت', dateLabel: 'الجمعة 6 مارس', dateKey: 20260306, story: 'مهرجان أهداف لخضر. الدفاع قرر يأخذ إجازة مبكرة.' },
  { id: 'M-108', type: 'friendly', team1: 'عمر', team2: 'كريم', score1: 5, score2: 7, status: 'انتهت', dateLabel: 'الخميس 12 مارس', dateKey: 20260312, story: 'ودية على الورق، بس النتيجة تقول إن الهدوء كان إشاعة.' },
  { id: 'M-109', type: 'strong', team1: 'عمر وكريم', team2: 'كريم التميمي', score1: 9, score2: 7, status: 'انتهت', dateLabel: 'الجمعة 13 مارس', dateKey: 20260313, story: 'فوز ثنائي بعد مباراة مكثفة.' },
  { id: 'M-110', type: 'normal', team1: 'عمر', team2: 'كريم', score1: 6, score2: 4, status: 'انتهت', dateLabel: 'الجمعة 21 أبريل', dateKey: 20260421, story: 'انتصار نظيف نسبيًا، وهذا نادر في أرشيف فيه أرقام كرة يد.' },
  { id: 'M-111', type: 'friendly', team1: 'عمر', team2: 'محمد علي', score1: 5, score2: 5, status: 'انتهت', dateLabel: 'الجمعة 1 مايو', dateKey: 20260501, story: 'تعادل ودي بنهاية مفتوحة.' },
  {
    id: 'M-201', type: 'strong', team1: 'عمر', team2: 'كريم', score1: 5, score2: 6, status: 'انتهت', dateLabel: 'الجمعة 8 مايو', dateKey: 20260508, story: 'تفاصيل كثيرة ومباراة بفارق هدف واحد.',
    details: {
      team1: { possession: 56, shots: 11, onTarget: 7, saves: 5, assists: 4, passes: 89, fouls: 2, corners: 5 },
      team2: { possession: 44, shots: 8, onTarget: 4, saves: 4, assists: 2, passes: 76, fouls: 3, corners: 3 }
    }
  },
  {
    id: 'M-202', type: 'strong', team1: 'عمر', team2: 'أبو تركي', score1: 9, score2: 12, status: 'انتهت', dateLabel: 'الجمعة 8 مايو', dateKey: 20260508, story: 'مباراة قوية جدًا بأهداف كثيرة ونسق سريع.',
    details: {
      team1: { possession: 60, shots: 25, onTarget: 17, saves: 7, assists: 11, passes: 112, fouls: 3, corners: 5 },
      team2: { possession: 40, shots: 17, onTarget: 13, saves: 4, assists: 8, passes: 91, fouls: 2, corners: 6 }
    }
  },
  {
    id: 'M-203', type: 'strong', team1: 'عمر', team2: 'كريم', score1: 11, score2: 8, status: 'انتهت', dateLabel: 'الجمعة 15 مايو', dateKey: 20260515, story: 'واحدة من أوضح مباريات السيطرة الهجومية.',
    details: {
      team1: { possession: 65, shots: 25, onTarget: 18, saves: 7, assists: 7, passes: 80, fouls: 5, corners: 5 },
      team2: { possession: 35, shots: 15, onTarget: 11, saves: 7, assists: 8, passes: 122, fouls: 3, corners: 7 }
    }
  }
];

export const guideSections = [
  {
    title: 'الرئيسية',
    icon: 'fa-house',
    text: 'تعطيك ملخص سريع: المباراة القادمة، جاهزية الطقس، الصلاة القادمة، آخر نتيجة، والـ MVP الحالي.',
    actions: ['زر ابدأ من المباراة القادمة ينقلك لمركز المباراة.', 'زر جهز التشكيلة يفتح الرادار مباشرة.', 'كروت الدخول السريع تنقلك للأقسام الأساسية.']
  },
  {
    title: 'المباراة القادمة',
    icon: 'fa-calendar-check',
    text: 'تعرض الموعد القادم، الملعب، العد التنازلي، وحالة الجاهزية. إذا اقترب الموعد خلال 24 ساعة يتحول التوقيت لشكل ساخن أحمر.',
    actions: ['مشاركة الموعد يفتح مشاركة الجهاز أو ينسخ النص.', 'نسخ النص يعطيك رسالة جاهزة للواتساب.', 'فتح الرادار ينقلك لتحضير التشكيلة.']
  },
  {
    title: 'الرادار التكتيكي',
    icon: 'fa-users-viewfinder',
    text: 'ملعب تفاعلي واسع للجوال والكمبيوتر. اسحب اللاعب لتغيير مركزه، واضغط مرتين لتعديل الاسم والدور والتعليمات والكابتن.',
    actions: ['الماسة/المربع/الهرم/ضغط Y تطبق تشكيلات جاهزة.', 'حفظ التشكيلة ينزل صورة للملعب.', 'كل فريق يسمح بكابتن واحد فقط. لو اخترت كابتن ثاني بتطلع رسالة تنبيه.']
  },
  {
    title: 'الأرشيف',
    icon: 'fa-box-archive',
    text: 'يعرض كل المباريات القديمة والجديدة والودية والقوية والعادية بطريقة واضحة مع ألوان هادئة لا تحول عينك لكشاف سيارة.',
    actions: ['فلتر الكل/قوية/عادية/ودية يغير نوع العرض.', 'البحث يدور بالاسم والنتيجة والـ ID.', 'اضغط عرض التفاصيل لفتح إحصائيات المباراة.']
  },
  {
    title: 'الطقس والصلاة',
    icon: 'fa-cloud-sun',
    text: 'يعرض طقس الخليل أو القدس، جاهزية اللعب، ومواقيت الصلاة حسب المدينة المختارة.',
    actions: ['اختيار المدينة يغير الطقس والصلاة.', 'زر تحديث يعيد طلب البيانات.', 'مواقيت الصلاة محسوبة حسب إحداثيات المدينة.']
  },
  {
    title: 'عن المنصة وروابط المبرمج',
    icon: 'fa-circle-info',
    text: 'قسم يعرض فكرة الموقع، مصادر البيانات، حالة الإصدار، وروابط التواصل وصفحات المبرمج.',
    actions: ['زر صفحات المبرمج يفتح الرابط الخارجي.', 'زر قناة تأمين يفتح واتساب.', 'زر الدعم الفني يفتح محادثة الدعم.']
  }
];

export const dhikrList = [
  'اللهم إنك عفو تحب العفو فاعف عنا',
  'سبحان الله وبحمده، عدد خلقه ورضا نفسه',
  'لا إله إلا الله وحده لا شريك له',
  'أستغفر الله العظيم وأتوب إليه',
  'اللهم صل وسلم على نبينا محمد',
  'اللهم آتنا في الدنيا حسنة وفي الآخرة حسنة'
];
