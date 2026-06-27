import { AI_RESPONSE_TEMPLATES } from './ai-response-templates.js';

export const MISSING_TAAMEN_INFO = 'المعلومة غير متوفرة في بيانات الموقع الحالية.';

const INTENT_LABELS = {
  greeting: 'تحية',
  smalltalk: 'حديث خفيف',
  site_info: 'تأمين',
  next_match: 'المباراة القادمة',
  archive: 'الأرشيف',
  injuries: 'الإصابات',
  tactical: 'تكتيك',
  security: 'حماية',
  cookies_privacy: 'كوكيز وخصوصية',
  ai_help: 'مساعدة AI',
  writing: 'كتابة',
  sports_general: 'رياضة',
  daily_life: 'حياة يومية',
  study: 'دراسة',
  technical: 'تقنية',
  planning: 'تخطيط',
  comparison: 'مقارنة',
  multi_topic: 'متعدد',
  unsafe_or_sensitive: 'حساس',
  unknown: 'غير واضح'
};

const INTENT_KEYWORDS = {
  greeting: ['مرحبا', 'هلا', 'هاي', 'السلام عليكم', 'اهلا', 'أهلا', 'شلونك', 'كيفك', 'يو', 'صباح الخير', 'مساء الخير'],
  smalltalk: ['شو الوضع', 'شو الاخبار', 'شو الأخبار', 'تمام', 'وينك', 'موجود', 'كيف الامور', 'كيف الأمور'],
  next_match: ['المباراة القادمة', 'متى المباراة', 'موعد المباراة', 'ساعة المباراة', 'وين المباراة', 'المباراة الجاي', 'القادمة'],
  archive: ['الأرشيف', 'ارشيف', 'آخر مباراة', 'اخر مباراة', 'نتيجة', 'نتائج', 'فاز', 'آخر 5', 'احدث مباراة'],
  injuries: ['إصابة', 'اصابة', 'إصابات', 'مصاب', 'جاهز', 'تعافي', 'رجوع لاعب', 'الحالات المتعافية'],
  tactical: ['رادار', 'تكتيك', 'تشكيلة', 'خطة', 'توزيع', 'مرتدات', 'ضغط', 'تمركز', 'DM', 'CB', 'GK', '1-2-1', '2-2'],
  cookies_privacy: ['كوكيز', 'cookies', 'cookie', 'خصوصية', 'التخزين المحلي', 'حذف بيانات', 'إدارة الكوكيز'],
  security: ['حماية', 'أمان', 'امن', 'رابط مشبوه', 'بلاغ', 'طوارئ', 'تسريب', 'API key', 'مفتاح', 'كلمة مرور', 'تحقق'],
  ai_help: ['المساعد', 'الذكاء', 'AI', 'شو بتقدر', 'ماذا تستطيع', 'تساعدني', 'Gemini'],
  writing: ['اكتب', 'رسالة', 'إعلان', 'اعلان', 'واتساب', 'صياغة', 'اختصر', 'حولها', 'حوّلها', 'نص جاهز', 'تنبيه'],
  sports_general: ['خماسي', 'كرة', 'لاعب', 'كابتن', 'تمرين', 'إحماء', 'اتحسن', 'أتحسن', 'لياقة', 'تسديد'],
  technical: ['كود', 'برمجة', 'API', 'GitHub', 'VS Code', 'Replit', 'frontend', 'backend', 'localStorage', 'service worker', 'جافاسكريبت', 'JavaScript'],
  study: ['ادرس', 'دراسة', 'تعلم', 'أتعلم', 'اشرح', 'لخص', 'لخّص', 'امتحان', 'درس', 'مراجعة'],
  planning: ['خطة', 'خطوات', 'رتب', 'تنظيم', 'جدول', 'برنامج', 'اعمل خطة'],
  comparison: ['قارن', 'مقارنة', 'الأفضل', 'افضل', 'الفرق بين', 'ولا', 'أم'],
  site_info: ['تأمين', 'الموقع', 'المنصة', 'الأقسام', 'الصفحات', 'التحديث', 'حالة الموقع', 'النظام']
};

const UNSAFE_KEYWORDS = [
  'اختراق', 'اخترق', 'اهكر', 'هكر', 'تهكير', 'اسرق', 'سرقة حساب', 'تصيد', 'phishing',
  'malware', 'فيروس', 'payload', 'bypass', 'تجاوز كلمة المرور', 'سرقة api', 'اسرق مفتاح',
  'token theft', 'dox', 'ابتزاز', 'إيذاء'
];

const MEDICAL_KEYWORDS = ['دواء', 'علاج', 'تشخيص', 'وصفة', 'حبوب', 'مسكن', 'مضاد', 'جرعة'];

const TINY_HINTS = ['مرحبا', 'هلا', 'هاي', 'شكرا', 'تمام', 'شو الوضع', 'كيفك', 'وينك', 'يو'];
const DETAILED_HINTS = ['شرح مفصل', 'طويل', 'عميق', 'بالتفصيل', 'خطة كاملة', 'برومبت طويل', 'تقرير', 'تحليل شامل'];
const MEDIUM_HINTS = ['اشرحلي', 'اشرح', 'وضح', 'اعطيني فكرة', 'كيف أعمل', 'كيف اعمل', 'شو الأفضل', 'شو افضل'];

const PRIORITY = [
  'unsafe_or_sensitive',
  'greeting',
  'next_match',
  'archive',
  'injuries',
  'cookies_privacy',
  'security',
  'site_info',
  'ai_help',
  'writing',
  'technical',
  'tactical',
  'sports_general',
  'study',
  'planning',
  'comparison',
  'daily_life'
];

export function normalizeArabic(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[ًٌٍَُِّْـ]/g, '')
    .replace(/[^\u0600-\u06FFa-z0-9\s.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function detectAnswerLength(question) {
  const normalized = normalizeArabic(question);
  if (!normalized) return 'short';
  if (hasAny(normalized, DETAILED_HINTS)) return 'detailed';
  if (hasAny(normalized, TINY_HINTS) && normalized.split(' ').length <= 4) return 'tiny';
  if (hasAny(normalized, MEDIUM_HINTS)) return 'medium';
  return normalized.split(' ').length > 18 ? 'medium' : 'short';
}

export function detectIntent(question) {
  const normalized = normalizeArabic(question);
  if (!normalized) return 'unknown';
  if (hasAny(normalized, UNSAFE_KEYWORDS)) return 'unsafe_or_sensitive';

  const exactGreeting = INTENT_KEYWORDS.greeting.some(word => normalizeArabic(word) === normalized);
  if (exactGreeting || (hasAny(normalized, INTENT_KEYWORDS.greeting) && normalized.split(' ').length <= 4)) {
    return 'greeting';
  }

  const matches = Object.entries(INTENT_KEYWORDS)
    .filter(([intent]) => intent !== 'greeting')
    .map(([intent, keywords]) => ({
      intent,
      score: keywords.reduce((sum, keyword) => sum + (normalized.includes(normalizeArabic(keyword)) ? keywordWeight(keyword) : 0), 0)
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || PRIORITY.indexOf(a.intent) - PRIORITY.indexOf(b.intent));

  if (!matches.length) return 'unknown';
  if (matches.length > 1 && matches[1].score >= 3 && differentFamilies(matches[0].intent, matches[1].intent)) {
    return 'multi_topic';
  }
  return matches[0].intent;
}

export function analyzeQuestion(question) {
  const rawQuestion = String(question || '').trim();
  const normalizedQuestion = normalizeArabic(rawQuestion);
  const tasks = splitTasks(rawQuestion);
  const taskIntents = tasks.map(detectIntent).filter(intent => intent !== 'unknown');
  const unsafe = hasAny(normalizedQuestion, UNSAFE_KEYWORDS);
  const medicalSensitive = hasAny(normalizedQuestion, MEDICAL_KEYWORDS) && hasAny(normalizedQuestion, INTENT_KEYWORDS.injuries);
  const intent = unsafe
    ? 'unsafe_or_sensitive'
    : tasks.length > 1 && new Set(taskIntents).size > 1
      ? 'multi_topic'
      : detectIntent(rawQuestion);
  const topics = detectTopics(normalizedQuestion, intent, taskIntents);
  const answerLength = detectAnswerLength(rawQuestion);
  const category = categoryFor(intent, topics, taskIntents);

  return {
    rawQuestion,
    normalizedQuestion,
    category,
    intent,
    intentLabel: INTENT_LABELS[intent] || INTENT_LABELS.unknown,
    topics,
    tasks,
    answerLength,
    needsSiteData: needsSiteData(intent, topics, taskIntents),
    needsGeneralKnowledge: needsGeneralKnowledge(intent, topics, taskIntents),
    needsWriting: intent === 'writing' || taskIntents.includes('writing'),
    needsRemoteAI: needsRemoteAI(category),
    needsSafetyRefusal: unsafe,
    safetyLevel: unsafe ? 'unsafe' : (medicalSensitive || ['security', 'cookies_privacy'].includes(intent) ? 'sensitive' : 'safe'),
    medicalSensitive,
    confidence: confidenceFor(intent, normalizedQuestion, taskIntents)
  };
}

export function selectTemplate({ question = '', analysis = null } = {}) {
  const resolved = analysis || analyzeQuestion(question);
  const groups = AI_RESPONSE_TEMPLATES.groups;
  const normalized = normalizeArabic(question);
  const preferredIntent = resolved.intent === 'multi_topic' ? 'unknown' : resolved.intent;
  const candidates = groups
    .flatMap(group => group.templates.map(template => ({ ...template, groupId: group.id })))
    .map(template => ({ template, score: scoreTemplate(template, preferredIntent, resolved.answerLength, normalized) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || b.template.priority - a.template.priority);
  return candidates[0]?.template || groups.find(group => group.id === 'fallback_unknown')?.templates[0] || null;
}

export function fillTemplate(template, variables = {}) {
  if (!template?.text) return '';
  return template.text.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => String(variables[key] ?? ''));
}

export function generateSmartLocalResponse(context = {}) {
  const question = String(context.question || '').trim();
  const siteKnowledge = context.siteKnowledge || {};
  const analysis = context.analysis || analyzeQuestion(question);
  const tasks = normalizeTasks(analysis.tasks, question);

  if (analysis.intent === 'multi_topic' && tasks.length > 1) {
    return tasks.slice(0, 5).map(task => {
      const taskAnalysis = analyzeQuestion(task);
      return `**${headingFor(taskAnalysis.intent, task)}**\n${answerSingle(task, siteKnowledge, taskAnalysis)}`;
    }).join('\n\n');
  }

  return answerSingle(question, siteKnowledge, analysis);
}

function answerSingle(question, siteKnowledge, analysis) {
  if (analysis.needsSafetyRefusal) return safetyRefusal();
  if (analysis.medicalSensitive) return injurySafety(siteKnowledge);

  switch (analysis.intent) {
    case 'greeting':
      return pickText(question, analysis);
    case 'smalltalk':
      return pickText(question, analysis);
    case 'next_match':
      return answerNextMatch(siteKnowledge, analysis);
    case 'archive':
      return answerArchive(siteKnowledge);
    case 'injuries':
      return answerInjuries(siteKnowledge);
    case 'tactical':
      return answerTactical(question, siteKnowledge, analysis);
    case 'cookies_privacy':
      return answerCookies();
    case 'security':
      return answerSecurity(siteKnowledge, question);
    case 'ai_help':
      return answerAIHelp();
    case 'site_info':
      return answerSiteInfo(siteKnowledge);
    case 'writing':
      return answerWriting(question, siteKnowledge);
    case 'sports_general':
      return answerSports(question, analysis);
    case 'technical':
      return answerTechnical(question, analysis);
    case 'study':
      return answerStudy(question, analysis);
    case 'planning':
      return answerPlanning(question);
    case 'comparison':
      return answerComparison(question);
    case 'daily_life':
      return pickText(question, analysis);
    default:
      return pickText(question, { ...analysis, intent: 'unknown' });
  }
}

function answerNextMatch(siteKnowledge, analysis) {
  const match = siteKnowledge?.nextMatch;
  if (!match) return MISSING_TAAMEN_INFO;
  const lines = [
    'حسب بيانات الموقع الحالية:',
    `- المباراة: ${match.title || `${match.team1 || 'فريق'} ضد ${match.team2 || 'فريق'}`}`,
    `- الموعد: ${match.dateLabel || match.day || 'غير محدد'}، الساعة ${match.time || 'غير محددة'}`,
    `- المكان: ${match.location || 'غير محدد'}`
  ];
  if (match.notes && analysis.answerLength !== 'tiny') lines.push(`- ملاحظة: ${match.notes}`);
  return limitLines(lines, analysis.answerLength);
}

function answerArchive(siteKnowledge) {
  const archive = siteKnowledge?.archive;
  const matches = archive?.recentMatches || [];
  if (!matches.length) return MISSING_TAAMEN_INFO;
  return [
    `الأرشيف يحتوي حاليا على ${archive.total || matches.length} مباراة محفوظة.`,
    archive.latestMatch ? `آخر مباراة: ${formatMatch(archive.latestMatch)}.` : '',
    ...matches.slice(0, 4).map(match => `- ${formatMatch(match)}`)
  ].filter(Boolean).join('\n');
}

function answerInjuries(siteKnowledge) {
  const injuries = siteKnowledge?.injuries;
  if (!injuries) return MISSING_TAAMEN_INFO;
  const active = injuries.active || [];
  const recovered = injuries.recovered || [];
  if (!active.length && !recovered.length) return MISSING_TAAMEN_INFO;
  return [
    'بيانات الإصابات في تأمين تنظيمية وليست تشخيصا طبيا.',
    active.length ? 'الحالات النشطة:' : 'لا توجد إصابات نشطة محفوظة حاليا.',
    ...active.slice(0, 5).map(item => `- ${item.player}: ${item.caseName || 'حالة غير محددة'}، العودة: ${item.expectedReturn || 'غير محددة'}`),
    recovered.length ? `الحالات المتعافية المحفوظة: ${recovered.slice(0, 4).map(item => item.player).join('، ')}.` : '',
    'لأي ألم قوي أو حالة غير واضحة، الأفضل مراجعة شخص بالغ أو طبيب أو صيدلي.'
  ].filter(Boolean).join('\n');
}

function answerTactical(question, siteKnowledge, analysis) {
  const normalized = normalizeArabic(question);
  const formations = siteKnowledge?.tactical?.formations || [];
  if (normalized.includes('1-2-1')) {
    return 'خطة 1-2-1 في الخماسي تعطي توازنا واضحا: لاعب خلفي يحمي العمق، لاعبان وسط يفتحان زوايا التمرير، ومهاجم محطة يثبت الكرة. أهم شرط: عند فقدان الكرة يرجع أحد لاعبي الوسط بسرعة حتى لا تنكشف المرتدة.';
  }
  if (normalized.includes('مرتد')) {
    return 'لمنع المرتدات: لا يصعد الجميع معا، اترك لاعبا يغطي العمق، واطلب تمريرات آمنة عند الهجوم. إذا ضاعت الكرة، أول لاعب يضغط والثاني يغلق خط التمرير.';
  }
  const base = pickText(question, { ...analysis, intent: 'tactical' });
  const extra = formations.length ? `\nتشكيلات الرادار المتاحة: ${formations.slice(0, 3).map(item => item.name).join('، ')}.` : '';
  return `${base}${extra}`;
}

function answerCookies() {
  return [
    'الكوكيز تفيد بحفظ تفضيلات بسيطة مثل الموافقة، اللغة، وحالة الواجهة.',
    'لا يجب استخدامها لحفظ كلمات مرور أو مفاتيح API أو أسرار.',
    'تقدر تديرها من زر إدارة الكوكيز في مركز الحماية.'
  ].join('\n');
}

function answerSecurity(siteKnowledge, question) {
  const normalized = normalizeArabic(question);
  if (normalized.includes('مفتاح') || normalized.includes('api key')) {
    return 'مفاتيح AI لا يجب أن تظهر في ملفات الواجهة العامة. الأفضل أن تبقى في Backend أو إعدادات خادم آمنة، وأن يرسل المتصفح طلبا محدودا بدون أسرار.';
  }
  const status = siteKnowledge?.security?.status || 'غير محددة';
  return [
    `حالة الحماية حسب بيانات الموقع: ${status}.`,
    'القاعدة المختصرة: لا تشارك كلمات مرور أو أكواد تحقق، لا تفتح روابط مشبوهة، وأبلغ الإدارة عند أي رسالة غريبة.',
    'هذا شرح دفاعي فقط بدون خطوات اختراق أو تجاوز.'
  ].join('\n');
}

function answerAIHelp() {
  return [
    'أقدر أساعدك في:',
    '- بيانات تأمين: المباراة، الأرشيف، الإصابات، الحماية، والرادار.',
    '- أسئلة عامة: كتابة، دراسة، تقنية، تخطيط، ونصائح خماسي.',
    'إذا المعلومة تخص تأمين وغير موجودة في بيانات الموقع، سأقول إنها غير متوفرة بدل التخمين.'
  ].join('\n');
}

function answerSiteInfo(siteKnowledge) {
  const meta = siteKnowledge?.meta || {};
  const pages = siteKnowledge?.pages || [];
  if (!meta.name && !pages.length) return MISSING_TAAMEN_INFO;
  return [
    `${meta.name || 'تأمين'} منصة لتنظيم المباراة، الأرشيف، الرادار، الإصابات، الحماية، والمساعد الذكي.`,
    pages.length ? `الصفحات المتاحة: ${pages.slice(0, 8).map(page => typeof page === 'string' ? page : page.label).join('، ')}.` : '',
    meta.version ? `الإصدار الحالي: ${meta.version}.` : ''
  ].filter(Boolean).join('\n');
}

function answerWriting(question, siteKnowledge) {
  const normalized = normalizeArabic(question);
  if (normalized.includes('مباراه') || normalized.includes('المباراه')) {
    const match = siteKnowledge?.nextMatch;
    if (!match) return MISSING_TAAMEN_INFO;
    return [
      'يا شباب، المباراة القادمة جاهزة حسب بيانات تأمين:',
      `${match.team1 || 'الفريق الأول'} ضد ${match.team2 || 'الفريق الثاني'}.`,
      `الموعد: ${match.dateLabel || match.day || 'غير محدد'} الساعة ${match.time || 'غير محددة'}.`,
      `المكان: ${match.location || 'غير محدد'}.`,
      'الرجاء تأكيد الحضور والالتزام بالموعد.'
    ].join('\n');
  }
  if (normalized.includes('تحديث')) {
    return 'تم تنفيذ تحديث جديد على منصة تأمين. الرجاء مراجعة المعلومات داخل الموقع، والاعتماد على البيانات الظاهرة هناك عند تنظيم المباراة أو مشاركة أي إعلان.';
  }
  if (normalized.includes('تحذير') || normalized.includes('رابط')) {
    return 'تنبيه للأعضاء: الرجاء عدم فتح أي رابط غير واضح المصدر، وعدم مشاركة روابط المجموعة خارج النطاق المسموح. عند وصول رسالة غريبة، أرسلها للإدارة مباشرة بدون نشرها للعامة.';
  }
  return 'نص جاهز للنسخ: مرحبا شباب، تم تحديث المعلومات. الرجاء مراجعة التفاصيل، تأكيد المطلوب، وعدم مشاركة أي روابط أو بيانات خارج المجموعة الرسمية.';
}

function answerSports(question, analysis) {
  const normalized = normalizeArabic(question);
  if (normalized.includes('اتحسن') || normalized.includes('اتحسن')) {
    return [
      'لتتحسن بالخماسي ركز على 3 أشياء:',
      '- تمريرة أسرع بدل الاحتفاظ الطويل بالكرة.',
      '- تمركز أهدأ قبل استلام الكرة.',
      '- رجوع مباشر بعد فقدان الكرة.',
      'اختبر نفسك كل مباراة: هل قراري صار أسرع؟'
    ].join('\n');
  }
  return limitLines([
    pickText(question, { ...analysis, intent: 'sports_general' }),
    'ابدأ بعادة واحدة في المباراة القادمة بدل تغيير كل شيء مرة واحدة.'
  ], analysis.answerLength);
}

function answerTechnical(question, analysis) {
  const normalized = normalizeArabic(question);
  if (normalized.includes('api key') || normalized.includes('مفتاح')) {
    return 'لحماية API key: لا تضعه في JavaScript العام، لا ترفعه إلى GitHub، استخدم Backend أو متغيرات بيئة، ودوّر المفتاح إذا ظهر بالخطأ.';
  }
  if (normalized.includes('unexpected token')) {
    return 'خطأ Unexpected token < غالبا يعني أن المتصفح طلب ملف JS أو CSS لكن الخادم أعاد HTML. افحص مسار الملف، service worker، وقائمة الكاش حتى لا يرجع index.html لملفات السكربت.';
  }
  return limitLines([
    'تقنيا، ابدأ بتحديد المكان الذي يحدث فيه الخطأ، ثم الرسالة الظاهرة، ثم آخر تغيير عملته.',
    'ولا تخزن أسرارا أو مفاتيح داخل ملفات عامة.'
  ], analysis.answerLength);
}

function answerStudy(question, analysis) {
  return limitLines([
    'طريقة بسيطة للتعلم:',
    '- قسم الموضوع إلى أجزاء صغيرة.',
    '- افهم مثالا واحدا بوضوح.',
    '- اختبر نفسك بسؤالين أو ثلاثة.',
    '- راجع الخطأ بدل إعادة القراءة فقط.'
  ], analysis.answerLength);
}

function answerPlanning() {
  return [
    'خطة مختصرة:',
    '1. حدد الهدف بجملة واحدة.',
    '2. اكتب أول 3 خطوات فقط.',
    '3. نفذ أول خطوة اليوم.',
    '4. راجع النتيجة وعدل الخطة.'
  ].join('\n');
}

function answerComparison() {
  return [
    'للمقارنة السريعة استخدم 3 معايير:',
    '- الفائدة.',
    '- الوقت والجهد.',
    '- المخاطر.',
    'أرسل الخيارين إذا بدك أحولها لجدول مختصر.'
  ].join('\n');
}

function safetyRefusal() {
  return 'ما بقدر أساعد بهذا النوع من الطلبات، لكن أقدر أساعدك بحماية الحسابات، تفعيل المصادقة الثنائية، أو معرفة علامات الروابط المشبوهة.';
}

function injurySafety(siteKnowledge) {
  return `${answerInjuries(siteKnowledge)}\n\nلا أقدم تشخيصا أو دواء. عند ألم قوي أو تورم أو صعوبة مشي، الأفضل مراجعة شخص بالغ أو طبيب أو صيدلي.`;
}

function pickText(question, analysis) {
  const template = selectTemplate({ question, analysis });
  return fillTemplate(template) || MISSING_TAAMEN_INFO;
}

function splitTasks(question) {
  const raw = String(question || '').trim();
  if (!raw) return [];
  const punctuationParts = raw.split(/[؟?!.\n]+/).map(part => part.trim()).filter(Boolean);
  if (punctuationParts.length > 1) return punctuationParts.slice(0, 6);
  const parts = raw
    .split(/\s+(?:و(?=اكتب|اشرح|اعطيني|كيف|متى|شو|ما|قارن|لخص|اختصر)|ثم|وبعدين)\s*/i)
    .map(part => part.trim())
    .filter(Boolean);
  return parts.length > 1 ? parts.slice(0, 6) : [raw];
}

function normalizeTasks(tasks, question) {
  const list = Array.isArray(tasks) ? tasks.filter(Boolean) : [];
  return list.length ? list : [String(question || '').trim()].filter(Boolean);
}

function detectTopics(normalized, intent, taskIntents) {
  const topics = new Set();
  if (['site_info', 'next_match', 'archive', 'injuries', 'tactical', 'security', 'cookies_privacy', 'ai_help'].includes(intent)) topics.add('taamen');
  if (['tactical', 'sports_general'].includes(intent) || hasAny(normalized, ['خماسي', 'كرة', 'لاعب'])) topics.add('sports');
  if (['security', 'cookies_privacy', 'unsafe_or_sensitive'].includes(intent)) topics.add('security');
  if (['technical'].includes(intent)) topics.add('technical');
  if (['study'].includes(intent)) topics.add('study');
  if (['writing'].includes(intent)) topics.add('writing');
  taskIntents.forEach(taskIntent => {
    if (['next_match', 'archive', 'injuries', 'site_info'].includes(taskIntent)) topics.add('taamen');
    if (taskIntent === 'technical') topics.add('technical');
    if (taskIntent === 'writing') topics.add('writing');
  });
  return [...topics];
}

function needsSiteData(intent, topics, taskIntents) {
  return topics.includes('taamen') || ['site_info', 'next_match', 'archive', 'injuries', 'tactical', 'security', 'cookies_privacy', 'ai_help'].includes(intent) || taskIntents.some(item => ['site_info', 'next_match', 'archive', 'injuries'].includes(item));
}

function needsGeneralKnowledge(intent, topics, taskIntents) {
  return ['writing', 'sports_general', 'daily_life', 'study', 'technical', 'planning', 'comparison', 'unknown', 'multi_topic'].includes(intent) || topics.some(topic => topic !== 'taamen') || taskIntents.some(item => ['writing', 'sports_general', 'study', 'technical'].includes(item));
}

function confidenceFor(intent, normalized, taskIntents) {
  if (!normalized) return 0;
  if (intent === 'unknown') return 0.35;
  if (intent === 'multi_topic') return 0.74;
  if (taskIntents.length) return 0.82;
  return 0.7;
}

function scoreTemplate(template, intent, answerLength, normalized) {
  let score = 0;
  if (template.intent === intent) score += 40;
  if (template.length === answerLength) score += 10;
  if (template.length === 'short' && answerLength === 'tiny') score += 3;
  const triggerMatches = (template.triggers || []).filter(trigger => normalized.includes(normalizeArabic(trigger))).length;
  score += triggerMatches * 12;
  score += Number(template.priority || 0);
  return score;
}

function keywordWeight(keyword) {
  return normalizeArabic(keyword).split(' ').length > 1 ? 5 : 2;
}

function differentFamilies(a, b) {
  const site = ['site_info', 'next_match', 'archive', 'injuries', 'tactical', 'security', 'cookies_privacy', 'ai_help'];
  const general = ['writing', 'sports_general', 'daily_life', 'study', 'technical', 'planning', 'comparison'];
  return (site.includes(a) && general.includes(b)) || (general.includes(a) && site.includes(b)) || (a !== b && (a === 'writing' || b === 'writing'));
}

function headingFor(intent, task) {
  return INTENT_LABELS[intent] || shortHeading(task);
}

function shortHeading(value) {
  const clean = String(value || '').replace(/\s+/g, ' ').trim();
  return clean.length > 42 ? `${clean.slice(0, 42)}...` : clean;
}

function formatMatch(match) {
  if (!match) return '';
  return `${match.team1 || 'فريق'} ${match.score1 ?? '-'} - ${match.score2 ?? '-'} ${match.team2 || 'فريق'} (${match.dateLabel || 'بدون تاريخ'})`;
}

function limitLines(lines, length) {
  const filtered = Array.isArray(lines) ? lines.filter(Boolean) : String(lines || '').split('\n').filter(Boolean);
  if (length === 'tiny') return filtered.slice(0, 2).join('\n');
  if (length === 'short') return filtered.slice(0, 5).join('\n');
  return filtered.join('\n');
}

function hasAny(normalizedText, keywords) {
  const normalized = normalizeArabic(normalizedText);
  return keywords.some(keyword => normalized.includes(normalizeArabic(keyword)));
}

function categoryFor(intent, topics, taskIntents) {
  if (intent === 'unsafe_or_sensitive') return 'unsafe_sensitive';
  if (intent === 'greeting' || intent === 'smalltalk') return 'greeting_smalltalk';
  if (intent === 'writing' || taskIntents.includes('writing')) return 'writing_actions';
  if (intent === 'technical') return 'technical_help';
  if (intent === 'sports_general') return 'sports_tactical';
  if (intent === 'tactical' && !topics.includes('taamen')) return 'sports_tactical';
  if (['site_info', 'next_match', 'archive', 'injuries', 'tactical', 'security', 'cookies_privacy', 'ai_help'].includes(intent)) return 'taamen_site';
  return 'general_help';
}

function needsRemoteAI(category) {
  return ['writing_actions', 'sports_tactical', 'technical_help', 'general_help'].includes(category);
}
