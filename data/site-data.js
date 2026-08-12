export const siteMeta = {
  name: 'تأمين 2026',
  edition: 'Taamen Tactical Core',
  version: 'Taamen Tactical Core Update',
  maintainer: 'Omar System',
  programmerPages: 'https://omar-i9.github.io/omar-i9/',
  releaseMode: 'المساعد الذكي المحلي مع تثبيت الرادار التكتيكي'
};

export const sources = [
  { title: 'Open-Meteo', text: 'مصدر الطقس الحالي والتوقعات بدون مفتاح API مكشوف.' },
  { title: 'Aladhan Prayer Times', text: 'مصدر مواقيت الصلاة حسب إحداثيات الخليل أو القدس.' },
  { title: 'Font Awesome', text: 'مصدر الأيقونات المستخدمة في الواجهة.' },
  { title: 'Google Fonts', text: 'مصدر خطوط Tajawal وReem Kufi وOrbitron.' },
  { title: 'GitHub Pages', text: 'استضافة الموقع كواجهة ثابتة سهلة النشر.' },
  { title: 'Geolocation API', text: 'قراءة موقع الجهاز بعد موافقة المستخدم لحساب اتجاه القبلة.' },
  { title: 'Device Orientation API', text: 'قراءة اتجاه الجهاز عند توفر البوصلة الحقيقية، خصوصًا على الهواتف.' },
  { title: 'Web Share API', text: 'مشاركة النصوص أو الصور من النظام مباشرة عند دعم المتصفح.' }
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
  { name: 'يوسف', goals: 0, assists: 1, saves: 3, rating: 7.9 },
  { name: 'عمر', goals: 2, assists: 3, saves: 4, rating: 9.4 },
  { name: 'كريم', goals: 2, assists: 1, saves: 1, rating: 8.9 },
  { name: 'سكافي', goals: 2, assists: 0, saves: 0, rating: 6.8 },
  { name: 'مؤمن', goals: 2, assists: 1, saves: 2, rating: 9.2 },
  { name: 'هاني', goals: 0, assists: 2, saves: 9, rating: 9.1 },
  { name: 'عمرو', goals: 0, assists: 1, saves: 5, rating: 7.7 },
  { name: 'ابراهيم', goals: 0, assists: 1, saves: 7, rating: 8.5 },
  { name: 'أبو زغير', goals: 0, assists: 0, saves: 2, rating: 7.1 },
  { name: 'محمد علي', goals: 6, assists: 0, saves: 0, rating: 9.7 }
];


export const playerPool = [
  { name: 'عمر', tag: 'صانع لعب', preferredRole: 'صانع ألعاب' },
  { name: 'كريم', tag: 'قائد هجوم', preferredRole: 'قائد الهجوم' },
  { name: 'خضر', tag: 'مهاجم', preferredRole: 'مهاجم محطة' },
  { name: 'محمد علي', tag: 'حارس', preferredRole: 'حارس قائد' },
  { name: 'مؤيد', tag: 'دفاع', preferredRole: 'قائد الدفاع' },
  { name: 'هاني', tag: 'دفاع', preferredRole: 'قاطع كرات' },
  { name: 'يوسف', tag: 'هجوم', preferredRole: 'جناح سريع' },
  { name: 'سكافي', tag: 'حارس/دفاع', preferredRole: 'محور توازن' },
  { name: 'أبو تركي', tag: 'هجوم', preferredRole: 'قائد الهجوم' },
  { name: 'كريم التميمي', tag: 'منافس', preferredRole: 'صانع ألعاب' },
  { name: 'سويركي', tag: 'ضغط', preferredRole: 'لاعب حر' },
  { name: 'زيد', tag: 'تسديد', preferredRole: 'منفذ الركلات' },
  { name: 'أبو زغير', tag: 'حارس', preferredRole: 'حارس قائد' },
  { name: 'محمد', tag: 'حارس', preferredRole: 'حارس قائد' },
  { name: 'سنقرط', tag: 'دفاع', preferredRole: 'قاطع كرات' },
  { name: 'أحمد', tag: 'دفاع', preferredRole: 'قائد الدفاع' }
];

export const roleOptions = [
  { value: '', label: 'بدون دور خاص', hint: 'يبقى مركز اللاعب حسب مكانه في الملعب.' },
  { value: 'كابتن', label: 'كابتن', hint: 'قائد الفريق. لاعب واحد فقط لكل فريق.' },
  { value: 'قائد الدفاع', label: 'قائد الدفاع', hint: 'ينظم الخط الخلفي ويغطي العمق.' },
  { value: 'قائد الهجوم', label: 'قائد الهجوم', hint: 'يقود الضغط والتحرك الهجومي.' },
  { value: 'صانع ألعاب', label: 'صانع ألعاب', hint: 'يستلم بين الخطوط ويفتح اللعب.' },
  { value: 'لاعب حر', label: 'لاعب حر', hint: 'يتحرك بدون مركز ثابت.' },
  { value: 'منفذ الركلات', label: 'منفذ الركلات', hint: 'مسؤول عن الركلات الثابتة والجزاء.' },
  { value: 'محور توازن', label: 'محور توازن', hint: 'يربط الدفاع بالهجوم ويمنع المرتدات.' },
  { value: 'حارس قائد', label: 'حارس قائد', hint: 'ينظم الخروج من الخلف ويبدأ بناء اللعب.' },
  { value: 'قاطع كرات', label: 'قاطع كرات', hint: 'يركز على افتكاك الكرة وكسر المرتدات.' },
  { value: 'جناح سريع', label: 'جناح سريع', hint: 'يفتح الخط ويستغل المساحات بسرعة.' },
  { value: 'مهاجم محطة', label: 'مهاجم محطة', hint: 'يثبت الكرة ويهيئها للقادمين من الخلف.' }
];

export const instructionOptions = [
  { value: '', label: 'بدون تعليمات', hint: 'يعتمد على مركزه الحالي فقط.' },
  { value: 'يضغط للأمام', label: 'يضغط للأمام', hint: 'يبدأ الضغط أول ما تخسروا الكرة.' },
  { value: 'يغطي العمق', label: 'يغطي العمق', hint: 'يمنع التمريرات المباشرة في الوسط.' },
  { value: 'يفتح على الخط', label: 'يفتح على الخط', hint: 'يوسع الملعب ويطلب الكرة على الطرف.' },
  { value: 'يسقط للخلف', label: 'يسقط للخلف', hint: 'يرجع لاستلام الكرة وبناء اللعب.' },
  { value: 'يتحرك بين الخطوط', label: 'يتحرك بين الخطوط', hint: 'يستغل المساحات بين الدفاع والوسط.' },
  { value: 'يدخل للعمق', label: 'يدخل للعمق', hint: 'يترك الطرف ويدخل لمنطقة التسجيل.' },
  { value: 'راقب أخطر لاعب', label: 'راقب أخطر لاعب', hint: 'مراقبة فردية لأقوى لاعب عند الخصم.' },
  { value: 'ارتد بسرعة', label: 'ارتد بسرعة', hint: 'يرجع فورًا بعد خسارة الكرة.' },
  { value: 'اقطع خط التمرير', label: 'اقطع خط التمرير', hint: 'يغلق زاوية التمرير بدل مطاردة اللاعب فقط.' },
  { value: 'ادعم الحارس', label: 'ادعم الحارس', hint: 'ينزل قريبًا من الحارس وقت البناء.' },
  { value: 'هاجم القائم الثاني', label: 'هاجم القائم الثاني', hint: 'يدخل خلف المدافع عند العرضيات والكرات السريعة.' }
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
  },
  counter: {
    id: 'counter',
    name: 'مرتدة 2-1-1',
    description: 'كتلة منخفضة ثم خروج سريع خلف الخصم.',
    positions: {
      home: [{ x: 8, y: 50 }, { x: 24, y: 34 }, { x: 24, y: 66 }, { x: 42, y: 50 }, { x: 66, y: 50 }],
      away: [{ x: 92, y: 50 }, { x: 76, y: 34 }, { x: 76, y: 66 }, { x: 58, y: 50 }, { x: 34, y: 50 }]
    }
  }
};

export const upcomingMatches = [
  {
    id: 'UP-005',
    title: 'رد الثأر',
    team1: 'عمر',
    team2: 'كريم',
    location: 'ملعب سيدات الخليل',
    dateLabel: '26/06/2026',
    dateKey: 20260626,
    dateISO: '2026-06-26T19:00:00',
    exactDate: true,
    isPlaceholder: true,
    priority: 3,
    scheduleStatus: 'pending',
    weekday: 5,
    hour: 19,
    minute: 0,
    durationMinutes: 60,
    note: 'مواجهة قد تكون الأعنف',
    heatLabel: 'قريباً'
  },

  {
    id: 'UP-008',
    title: 'المواجهة الحاسمة',
    team1: 'عمر',
    team2: 'كريم',
    location: 'ملعب سيدات الخليل',
    dateLabel: '03/17/2026',
    dateKey: 20261703,
    dateISO: '2026-17-03T19:00:00',
    exactDate: true,
    isPlaceholder: true,
    priority: 4,
    scheduleStatus: 'pending',
    weekday: 5,
    hour: 19,
    minute: 0,
    durationMinutes: 60,
    note: 'مواجهة تحمل في طياتها الكثير من التحدي والإثارة.',
    heatLabel: 'قادم'
  },

  
];

export const matchArchive = [
  { id: 'M-100', type: 'strong', team1: 'عمر', team2: 'خضر', score1: 22, score2: 7, status: 'انتهت', dateLabel: '28/11/2025', dateKey: 20251128, story: 'بديكتاتورية كروية لا ترحم، أُمطر المرمى بوابل أهدافٍ حوّل النتيجة إلى بيان سيطرة.' },
  { id: 'M-101', type: 'normal', team1: 'كريم', team2: 'عمر', score1: 6, score2: 9, status: 'انتهت', dateLabel: '16/01/2026', dateKey: 20260116, story: 'بداية مشتعلة… والنهاية كتبت لعمر.' },
  { id: 'M-102', type: 'normal', team1: 'عمر', team2: 'كريم', score1: 7, score2: 10, status: 'انتهت', dateLabel: '23/01/2026', dateKey: 20260123, story: 'ردٌّ ثقيل… أعاد للكفة صوتها.' },
  { id: 'M-103', type: 'strong', team1: 'كريم التميمي', team2: 'عمر وكريم', score1: 8, score2: 7, status: 'انتهت', dateLabel: '30/01/2026', dateKey: 20260130, story: 'هدفٌ واحد… وكان كافيًا لكسر الحكاية.' },
  { id: 'M-104', type: 'normal', team1: 'خضر', team2: 'عمر وكريم', score1: 4, score2: 5, status: 'انتهت', dateLabel: '13/02/2026', dateKey: 20260213, story: 'فوزٌ خُطف من بين الزحام.' },
  { id: 'M-105', type: 'normal', team1: 'كريم', team2: 'عمر', score1: 3, score2: 3, status: 'انتهت', dateLabel: '20/02/2026', dateKey: 20260220, story: 'تعادلٌ بلا ملك… وملعب بلا حسم.' },
  { id: 'M-106', type: 'normal', team1: 'عمر', team2: 'كريم', score1: 6, score2: 8, status: 'انتهت', dateLabel: '27/02/2026', dateKey: 20260227, story: 'ضربة حاسمة… والميزان مال لكريم.' },
  { id: 'M-107', type: 'strong', team1: 'خضر', team2: 'كريم', score1: 13, score2: 7, status: 'انتهت', dateLabel: '06/03/2026', dateKey: 20260306, story: 'خضر أشعل الجبهة… وخرج بثقل الانتصار.' },
  { id: 'M-108', type: 'friendly', team1: 'عمر', team2: 'كريم', score1: 5, score2: 7, status: 'انتهت', dateLabel: '12/03/2026', dateKey: 20260312, story: 'ودية بالاسم… وحسمٌ واضح بالنتيجة.' },
  { id: 'M-109', type: 'strong', team1: 'عمر وكريم', team2: 'كريم التميمي', score1: 9, score2: 7, status: 'انتهت', dateLabel: '13/03/2026', dateKey: 20260313, story: 'ثنائيةٌ فرضت الإيقاع… وأنهت المشهد.' },
  { id: 'M-110', type: 'normal', team1: 'عمر', team2: 'كريم', score1: 6, score2: 4, status: 'انتهت', dateLabel: '21/04/2026', dateKey: 20260421, story: 'عودة هادئة… وانتصار بلا ضجيج.' },
  { id: 'M-111', type: 'friendly', team1: 'عمر', team2: 'محمد علي', score1: 5, score2: 5, status: 'انتهت', dateLabel: '01/05/2026', dateKey: 20260501, story: 'تعادلٌ ترك الباب مفتوحًا.' },

  {
    id: 'M-201', type: 'strong', team1: 'عمر', team2: 'كريم', score1: 5, score2: 6, status: 'انتهت', dateLabel: '08/05/2026', dateKey: 20260508, story: 'أملٌ عاد متأخرًا… ثم سقط برصاصة الرحمة.',
    details: {
      team1: { possession: 56, shots: 11, onTarget: 7, saves: 5, assists: 4, passes: 89, fouls: 2, corners: 5 },
      team2: { possession: 44, shots: 8, onTarget: 4, saves: 4, assists: 2, passes: 76, fouls: 3, corners: 3 }
    }
  },
  {
    id: 'M-202', type: 'strong', team1: 'عمر', team2: 'أبو تركي', score1: 9, score2: 12, status: 'انتهت', dateLabel: '08/05/2026', dateKey: 20260508, story: 'معركة مفتوحة… الهجوم حضر، لكن الحسم اختار الجهة الأخرى.',
    details: {
      team1: { possession: 60, shots: 25, onTarget: 17, saves: 7, assists: 11, passes: 112, fouls: 3, corners: 5 },
      team2: { possession: 40, shots: 17, onTarget: 13, saves: 4, assists: 8, passes: 91, fouls: 2, corners: 6 }
    }
  },
  {
    id: 'M-203', type: 'strong', team1: 'عمر', team2: 'كريم', score1: 11, score2: 8, status: 'انتهت', dateLabel: '15/05/2026', dateKey: 20260515, story: 'سيطرة هجومية… وانتصار وُقّع بالقوة.',
    details: {
      team1: { possession: 65, shots: 25, onTarget: 18, saves: 7, assists: 7, passes: 80, fouls: 5, corners: 5 },
      team2: { possession: 35, shots: 15, onTarget: 11, saves: 7, assists: 8, passes: 122, fouls: 3, corners: 7 }
    }
  },
  {
    id: 'M-204', type: 'strong', team1: 'عمر', team2: 'ال سكافي', score1: 7, score2: 8, status: 'انتهت', dateLabel: '05/06/2026', dateKey: 20260605, story: 'تعادلٌ وُلد من المستحيل… ثم مات في آخر النبض.',
    details: {
      team1: { possession: 52, shots: 25, onTarget: 17, saves: 7, assists: 6, passes: 90, fouls: 4, corners: 6 },
      team2: { possession: 48, shots: 19, onTarget: 12, saves: 9, assists: 8, passes: 100, fouls: 2, corners: 4 }
    }
  },
    {
    id: 'M-205', type: 'strong', team1: 'عمر', team2: 'كريم التميمي', score1: 6, score2: 6, status: 'انتهت', dateLabel: '12/06/2026', dateKey: 20260612, story: ' مبارة تعتبر من أقوى اللقاءات واعنفها، انتهت بتعادل درامي بعد تبادل الأهداف حتى اللحظات الأخيرة.',
    details: {
      team1: { possession: 60, shots: 27, onTarget: 17, saves: 4, assists: 5, passes: 140, fouls: 5, corners: 8 },
      team2: { possession: 40, shots: 20, onTarget: 9, saves: 9, assists: 3, passes: 90, fouls: 8, corners: 5 }
    }
  },
      {
    id: 'M-206', type: 'normal', team1: 'عمر', team2: 'كريم', score1: 9, score2: 4, status: 'انتهت', dateLabel: '19/06/2026', dateKey: 20260619, story: 'لم تكن مباراةً عابرة… كانت إثباتَ مقام، وكسرةَ عين، وانتصارًا يُروى.',
    details: {
      team1: { possession: 61, shots: 27, onTarget: 20, saves: 6, assists: 5, passes: 120, fouls: 2, corners: 7 },
      team2: { possession: 39, shots: 18, onTarget: 10, saves: 11, assists: 3, passes: 90, fouls: 5, corners: 5 }
    }
  },
        {
    id: 'M-207', type: 'friendly', team1: 'هاني', team2: 'غطاشة', score1: 7, score2: 1, status: 'انتهت', dateLabel: '3/07/2026', dateKey: 20260703, story: 'مباراة كانت تعاني من نقص عددي حيث صنفت من أزنى المباريات.',
    details: {
      team1: { possession: 50, shots: 13, onTarget: 11, saves: 1, assists: 5, passes: 100, fouls: 1, corners: 5 },
      team2: { possession: 50, shots: 5, onTarget: 3, saves: 3, assists: 3, passes: 92, fouls: 3, corners: 4 }
    }
  },
      {
    id: 'M-208', type: 'normal', team1: 'عمر & كريم', team2: 'علامة', score1: 7, score2: 6, status: 'انتهت', dateLabel: '10/07/2026', dateKey: 20260710, story: 'لم تكن مباراةً عابرة… كانت إثباتَ مقام، وكسرةَ عين، وانتصارًا يُروى.',
    details: {
      team1: { possession: 55, shots: 21, onTarget: 16, saves: 6, assists: 5, passes: 122, fouls: 4, corners: 8 },
      team2: { possession: 45, shots: 15, onTarget: 7, saves: 11, assists: 3, passes: 88, fouls: 6, corners: 6 }
    }
  },
        {
    id: 'M-209', type: 'normal', team1: 'عمر & كريم', team2: 'كريم تميمي', score1: 10, score2: 11, status: 'انتهت', dateLabel: '17/7/2026', dateKey: 20260710, story: 'قتال دام حتى آخر لحظات المباراة بنتجية لم ترضي المستضيف.',
    details: {
      team1: { possession: 51, shots: 21, onTarget: 16, saves: 12, assists: 7, passes: 110, fouls: 4, corners: 5 },
      team2: { possession: 49, shots: 25, onTarget: 17, saves: 13, assists: 8, passes: 108, fouls: 6, corners: 4 }
      }
    },
      {
    id: 'M-210', type: 'normal', team1: 'عمر', team2: 'كريم', score1: 12, score2: 11, status: 'انتهت', dateLabel: '24/7/2026', dateKey: 20260710, story: 'تسجيل 4 اهداف بعد التاخر بـ3 اهداف والفوز بآخر الأنفاس!.',
    details: {
      team1: { possession: 54, shots: 20, onTarget: 16, saves: 4, assists: 9, passes: 77, fouls: 4, corners: 5 },
      team2: { possession: 46, shots: 18, onTarget: 8, saves: 10, assists: 8, passes: 80, fouls: 6, corners: 4 }
      }
    },
      {
    id: 'M-211', type: 'normal', team1: 'عمر', team2: 'كريم', score1: 2, score2: 2, status: 'انتهت', dateLabel: '31/10/2026', dateKey: 20260710, story: 'مبارة بدفاع وهجوم قوي من كلا الطرفين انتهت بالتعادل بعد محاولات كثيرة',
    details: {
      team1: { possession: 50, shots: 17, onTarget: 8, saves: 6, assists: 2, passes: 85, fouls: 2, corners: 5 },
      team2: { possession: 50, shots: 14, onTarget: 9, saves: 7, assists: 2, passes: 79, fouls: 4, corners: 6 }
      }
    },
      {
    id: 'M-212', type: 'normal', team1: 'عمر', team2: 'كريم', score1: 7, score2: 8, status: 'انتهت', dateLabel: '7/08/2026', dateKey: 20260710, story: 'كان التعادل قريباً ولكن قريباً وحده لم يكن كافياً.',
    details: {
      team1: { possession: 51, shots: 19, onTarget: 16, saves: 7, assists: 5, passes: 110, fouls: 2, corners: 9 },
      team2: { possession: 49, shots: 22, onTarget: 18, saves: 9, assists: 6, passes: 104, fouls: 7, corners: 10 }
      }
    },

];

export const guideSections = [
    {
    title: 'الرئيسية',
    icon: 'fa-house',
    text: 'هنا تبدأ الحكاية. الصفحة الرئيسية ليست مجرد واجهة دخول، بل لوحة قيادة مختصرة تجمع نبض المنصة كله في مكان واحد. من خلالها ترى المباراة القادمة، حالة جاهزية الطقس، الصلاة القادمة، آخر نتيجة محفوظة، واللاعب الأبرز MVP. كل شيء أمامك بسرعة ووضوح، بدون أن تضيع بين الصفحات كأنك تبحث عن زر في ريموت قديم.',
    actions: [
      'زر ابدأ من المباراة القادمة يأخذك مباشرة إلى مركز المباراة، حيث الموعد، الملعب، العد التنازلي، وحالة الجاهزية.',
      'زر افتح الأرشيف ينقلك إلى نتائج الفريق وسجل المباريات بعد إيقاف صفحة التخطيط مؤقتًا للصيانة.',
      'كروت الدخول السريع تختصر الطريق إلى أهم أقسام الموقع مثل الأرشيف، الطقس، الصلاة، الإصابات، والقبلة.',
      'الملخصات السريعة تمنحك نظرة فورية على حالة الفريق بدون الحاجة للتنقل بين الصفحات.'
    ]
  },

  {
    title: 'المباراة القادمة',
    icon: 'fa-calendar-check',
    text: 'هذا القسم هو ساعة الانتظار قبل المعركة. يعرض لك كل ما تحتاجه قبل المباراة: الموعد، الملعب، العد التنازلي، وحالة جاهزية اللعب. ومع اقتراب الموعد خلال آخر 24 ساعة، يتحول التوقيت إلى شكل ساخن أحمر وكأنه شرار يعلن أن وقت اللعب اقترب، وأن الأعذار بدأت تنتهي رسميًا.',
    actions: [
      'زر مشاركة الموعد يفتح مشاركة الجهاز إذا كانت مدعومة، أو ينسخ نصًا جاهزًا لإرساله مباشرة.',
      'زر نسخ النص يعطيك رسالة مرتبة مناسبة للواتساب تحتوي على تفاصيل المباراة والموعد والمكان.',
      'زر فتح الأرشيف ينقلك إلى سجل المواجهات السابقة ونتائج الفريق.',
      'العداد التنازلي يساعدك تعرف كم بقي على البداية بالدقائق والثواني، بدل حسابات الرأس اللي غالبًا تخون في أسوأ وقت.'
    ]
  },
  {
    title: 'الأرشيف',
    icon: 'fa-box-archive',
    text: 'الأرشيف هو ذاكرة تأمين التي لا تنسى. هنا لا تضيع المباريات القديمة ولا تختلط النتائج في الكلام. كل مواجهة محفوظة بنوعها ونتيجتها وتفاصيلها، سواء كانت قوية، عادية، أو ودية. طريقة العرض مصممة بألوان هادئة وواضحة، حتى تقرأ التاريخ بدون أن تشعر أن الشاشة تحاول تحويل عينك إلى كشاف سيارة.',
    actions: [
      'فلتر الكل يعرض جميع المباريات بدون تمييز.',
      'فلتر قوية يركز على المواجهات الكبيرة ذات الطابع الحماسي والتنافسي.',
      'فلتر عادية يعرض المباريات الأساسية اليومية أو الأسبوعية.',
      'فلتر ودية يعرض المباريات الخفيفة أو التجريبية.',
      'حقل البحث يسمح لك بالبحث باسم اللاعب، اسم الفريق، النتيجة، أو رقم المباراة ID.',
      'زر عرض التفاصيل يفتح إحصائيات المباراة مثل الاستحواذ، التسديدات، التصديات، التمريرات، والمقارنة بين الطرفين.'
    ]
  },

  {
    title: 'الطقس والصلاة',
    icon: 'fa-cloud-sun',
    text: 'هذا القسم يجمع بين جاهزية الملعب وروح الوقت. يعرض طقس الخليل أو القدس حسب المدينة المختارة، مع الحرارة، الرياح، الرطوبة، وتقييم مناسب لحالة اللعب. وفي نفس المكان تظهر مواقيت الصلاة بدقة حسب إحداثيات المدينة، حتى تعرف وقتك داخل الملعب وخارجه. تنظيم عملي ومحترم، بدل التنقل بين خمسة تطبيقات كأنك تدير محطة فضاء.',
    actions: [
      'اختيار المدينة يغير بيانات الطقس ومواقيت الصلاة بين الخليل والقدس.',
      'زر تحديث يعيد طلب البيانات ويحدث حالة الطقس والصلاة.',
      'قسم جاهزية اللعب يوضح هل الأجواء مناسبة للمباراة أم تحتاج انتباهًا أكثر.',
      'مواقيت الصلاة محسوبة حسب إحداثيات المدينة المختارة، وليست مجرد أرقام عامة مرمية على الشاشة.',
      'عرض الصلاة القادمة يساعدك تعرف الوقت المتبقي للصلاة التالية بشكل مباشر.'
    ]
  },

  {
    title: 'الإصابات والحالات',
    icon: 'fa-kit-medical',
    text: 'صفحة الإصابات تعرض حالة كل لاعب بطريقة واضحة: اسم اللاعب، نوع الإصابة أو المرض، درجة الخطورة، مدة الرجوع، التأثير على اللعب، وخطة متابعة مختصرة. الهدف تنظيم الحالة وليس لعب دور الطبيب، لأن الإنترنت أصلًا مكتظ بالعباقرة الذين يشخصون من صورة حذاء.',
    actions: [
      'كروت الحالة تعرض اللون حسب الخطورة: منخفضة، متوسطة، عالية، أو مرض.',
      'كل حالة لها أيقونة مناسبة مثل عظم، كاحل، عضلة، حرارة، أو علاج.',
      'سجل الإصابة مخفي داخل تفاصيل مطوية حتى لا تزحم الصفحة إلا عند الحاجة.',
      'أي ألم شديد أو تورم واضح أو أعراض قوية يحتاج مراجعة شخص بالغ أو مختص، والموقع لا يعطي تشخيصًا طبيًا.'
    ]
  },

  {
    title: 'القبلة والبوصلة',
    icon: 'fa-compass',
    text: 'صفحة القبلة تستخدم موقع الجهاز لحساب الاتجاه نحو الكعبة، وتستخدم بوصلة الهاتف إذا كانت متوفرة. على اللابتوب غالبًا لن توجد بوصلة، لذلك يعرض الموقع رسالة واضحة بدل أن يتظاهر بالذكاء مثل بعض الأجهزة.',
    actions: [
      'زر تفعيل القبلة يطلب إذن الموقع أولًا، ثم يحاول قراءة مستشعر البوصلة.',
      'إذا كان الجهاز لا يدعم البوصلة، تظهر الدرجة المحسوبة فقط مع تنبيه مناسب.',
      'إذا كان الموقع غير مفعل، تظهر رسالة تطلب تفعيل GPS أو السماح للموقع.',
      'الصفحة تعرض تشخيصًا صغيرًا لقدرات الجهاز مثل الموقع، البوصلة، المشاركة، والاتصال.'
    ]
  },

  {
    title: 'عن المنصة وروابط المبرمج',
    icon: 'fa-circle-info',
    text: 'هذا القسم هو هوية الموقع ومركزه التعريفي. يشرح فكرة تأمين 2026، سبب وجود المنصة، مصادر البيانات المستخدمة، حالة الإصدار، وروابط التواصل. هنا يعرف الزائر أن الموقع ليس مجرد واجهة شكلها جميل، بل مشروع منظم يجمع الفريق، التكتيك، النتائج، الطقس، الصلاة، والتواصل في تجربة واحدة.',
    actions: [
      'زر صفحات المبرمج يفتح الرابط الخارجي الخاص بالمطور ومشاريعه.',
      'زر قناة تأمين يفتح قناة واتساب لمتابعة الأخبار أو الروابط المرتبطة بالفريق.',
      'زر الدعم الفني يفتح محادثة مباشرة للمساعدة أو التبليغ عن مشكلة.',
      'قسم مصادر البيانات يوضح من أين تأتي معلومات الطقس والصلاة والخدمات المستخدمة.',
      'قسم حالة الإصدار يوضح أن النسخة الحالية هي نسخة Legacy شبه نهائية مخصصة للاستقرار والصيانة.'
    ]
  }
];

export const security = {
  status: 'active',
  privacyMode: 'enabled',
  emergencyMode: 'watch',
  lastReviewLabel: 'مراجعة دورية',
  aiProtection: {
    backendProxy: true,
    publicApiKeys: false,
    fallbackEnabled: true
  },
  cookiePolicy: {
    version: 1,
    necessary: true,
    preferences: true,
    experience: true,
    analytics: false
  },
  links: [
    {
      label: 'التواصل مع الآدمن',
      type: 'admin',
      url: 'https://wa.me/972594054750',
      note: 'قناة مباشرة للتبليغ عن مشكلة أو طلب مساعدة.'
    },
    {
      label: 'مجموعة واتساب',
      type: 'group',
      url: '#',
      note: 'لا يتم نشر الرابط إلا للأعضاء المسموح لهم.'
    },
    {
      label: 'مجموعة Discord',
      type: 'group',
      url: '#',
      note: 'رابط اختياري يتم تحديثه من ملف البيانات عند الحاجة.'
    },
    {
      label: 'بلاغ أمني',
      type: 'security-report',
      url: 'https://wa.me/972594054750',
      note: 'استخدمه فقط للإبلاغ عن نشاط غير طبيعي أو رابط مشبوه.'
    }
  ]
};

export const dhikrList = [
  'اللهم إنك عفو تحب العفو فاعف عنا',
  'سبحان الله وبحمده، عدد خلقه ورضا نفسه',
  'لا إله إلا الله وحده لا شريك له',
  'أستغفر الله العظيم وأتوب إليه',
  'اللهم صل وسلم على نبينا محمد',
  'اللهم آتنا في الدنيا حسنة وفي الآخرة حسنة'
];
