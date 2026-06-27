import { AI_KNOWLEDGE_ENTRIES } from './ai-knowledge-pack.js';

const INTENT_KEYWORDS = {
  next_match: ['مباراة قادمة', 'المباراة القادمة', 'متى المباراة', 'موعد المباراة', 'ساعة المباراة', 'الملعب', 'الفريقين'],
  archive: ['أرشيف', 'اخر مباراة', 'آخر مباراة', 'نتيجة', 'فاز', 'تاريخ', 'مباريات سابقة'],
  injuries: ['إصابة', 'إصابات', 'مصاب', 'تعافي', 'جاهز', 'دواء', 'علاج'],
  tactical: ['رادار', 'تكتيك', 'تشكيلة', 'خطة', 'توزيع', 'ضغط', 'مرتدات', 'DM', 'CB', 'GK'],
  security: ['حماية', 'خصوصية', 'كوكيز', 'cookies', 'رابط مشبوه', 'طوارئ', 'API key', 'مفتاح', 'تسريب'],
  ai_help: ['المساعد', 'شو بتقدر', 'ماذا تستطيع', 'تساعدني', 'AI'],
  writing: ['اكتب', 'رسالة', 'إعلان', 'واتساب', 'صياغة', 'تنبيه', 'release note', 'تحذير'],
  study: ['اشرح', 'ادرس', 'دراسة', 'تعلم', 'لخص', 'امتحان', 'JavaScript'],
  technical: ['كود', 'API', 'GitHub', 'VS Code', 'Replit', 'frontend', 'backend', 'localStorage', 'service worker'],
  site_info: ['الموقع', 'المنصة', 'صفحات', 'تحديث', 'إصدار', 'حالة تأمين', 'أقسام']
};

const TOPIC_KEYWORDS = {
  taamen: ['تأمين', 'الموقع', 'المنصة'],
  football: ['خماسي', 'كرة', 'لاعب', 'دفاع', 'هجوم', 'ضغط'],
  security: ['حماية', 'خصوصية', 'كوكيز', 'مفتاح', 'تصيد'],
  writing: ['اكتب', 'رسالة', 'إعلان', 'صياغة'],
  tech: ['API', 'GitHub', 'VS Code', 'كود', 'frontend', 'backend'],
  study: ['دراسة', 'تعلم', 'اشرح', 'لخص'],
  health: ['إصابة', 'دواء', 'ألم', 'علاج']
};

const UNSAFE_PATTERNS = [
  'اختراق', 'اخترق', 'اهكر', 'هكر', 'سرقة حساب', 'اسرق', 'phishing', 'تصيد',
  'malware', 'فيروس', 'payload', 'bypass', 'تجاوز كلمة المرور', 'سرقة api', 'اسرق مفتاح',
  'token', 'دكس', 'dox', 'ابتزاز', 'إيذاء'
];

const MEDICAL_SENSITIVE = ['دواء', 'علاج', 'تشخيص', 'وصفة', 'حبوب', 'مسكن', 'مضاد'];

const INTENT_PRIORITY = [
  'next_match',
  'archive',
  'injuries',
  'tactical',
  'security',
  'technical',
  'writing',
  'study',
  'ai_help',
  'site_info'
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
    .replace(/[^\u0600-\u06FFa-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(value) {
  return normalizeArabic(value)
    .split(' ')
    .filter(token => token.length > 1);
}

function includesAny(text, keywords) {
  const normalized = normalizeArabic(text);
  return keywords.some(keyword => normalized.includes(normalizeArabic(keyword)));
}

export function analyzeQuestion(question) {
  const normalized = normalizeArabic(question);
  const topics = Object.entries(TOPIC_KEYWORDS)
    .filter(([, keywords]) => includesAny(normalized, keywords))
    .map(([topic]) => topic);
  const tasks = splitTasks(question);
  const unsafe = includesAny(normalized, UNSAFE_PATTERNS);
  const medicalSensitive = includesAny(normalized, MEDICAL_SENSITIVE) && includesAny(normalized, INTENT_KEYWORDS.injuries);
  const intent = unsafe
    ? 'unsafe_or_sensitive'
    : detectIntent(normalized);

  return {
    intent,
    topics,
    tasks,
    needsSiteData: ['site_info', 'next_match', 'archive', 'injuries', 'tactical', 'security', 'ai_help'].includes(intent) || topics.includes('taamen'),
    needsGeneralKnowledge: ['general', 'writing', 'study', 'technical'].includes(intent) || topics.some(topic => topic !== 'taamen'),
    needsWriting: intent === 'writing' || includesAny(normalized, INTENT_KEYWORDS.writing),
    safetyLevel: unsafe ? 'unsafe' : (medicalSensitive || intent === 'security' ? 'sensitive' : 'safe'),
    medicalSensitive
  };
}

function detectIntent(normalized) {
  for (const intent of INTENT_PRIORITY) {
    const keywords = INTENT_KEYWORDS[intent] || [];
    if (includesAny(normalized, keywords)) return intent;
  }
  return 'general';
}

function splitTasks(question) {
  const raw = String(question || '').trim();
  if (!raw) return [];
  const parts = raw
    .split(/(?:[؟?!.\n]+|،\s+|؛\s+)/)
    .map(part => part.trim())
    .filter(Boolean);

  if (parts.length > 1) return parts.slice(0, 6);

  const connectorSplit = raw
    .split(/\s+(?:و(?=اكتب|اشرح|اعطيني|كيف|متى|شو|ما|ساعدني|قارن)|ثم|وبعدين)\s*/i)
    .map(part => part.trim())
    .filter(Boolean);
  return connectorSplit.length > 1 ? connectorSplit.slice(0, 6) : [raw];
}

export function retrieveKnowledge(question, options = {}) {
  const maxEntries = options.maxEntries || 8;
  const maxCharacters = options.maxCharacters || 3500;
  const analysis = options.analysis || analyzeQuestion(question);
  const questionTokens = tokenize(question);
  const intentCategoryBoosts = categoryBoostsFor(analysis.intent);

  const scored = AI_KNOWLEDGE_ENTRIES
    .map(item => {
      const title = normalizeArabic(item.title);
      const content = normalizeArabic(item.content);
      const tags = (item.tags || []).map(normalizeArabic);
      const tagMatches = questionTokens.filter(token => tags.some(tag => tag.includes(token) || token.includes(tag))).length;
      const titleMatches = questionTokens.filter(token => title.includes(token)).length;
      const contentMatches = questionTokens.filter(token => content.includes(token)).length;
      const categoryBoost = intentCategoryBoosts.includes(item.category) ? 10 : 0;
      const topicBoost = analysis.topics.some(topic => categoryMatchesTopic(item.category, topic)) ? 6 : 0;
      const score = categoryBoost + topicBoost + tagMatches * 7 + titleMatches * 5 + contentMatches * 2 + Number(item.priority || 0);
      return { item, score };
    })
    .filter(result => result.score > 4)
    .sort((a, b) => b.score - a.score || Number(b.item.priority || 0) - Number(a.item.priority || 0));

  const entries = [];
  let size = 0;
  for (const result of scored) {
    const text = `${result.item.title}: ${result.item.content}`;
    if (entries.length >= maxEntries || size + text.length > maxCharacters) break;
    entries.push(result.item);
    size += text.length;
  }

  const summaryText = entries
    .map(item => `- [${item.category}] ${item.title}: ${item.content}`)
    .join('\n')
    .slice(0, maxCharacters);

  return {
    intent: analysis.intent,
    topics: analysis.topics,
    entries,
    summaryText
  };
}

function categoryBoostsFor(intent) {
  const map = {
    next_match: ['taamen_match_management_general', 'writing_and_announcements'],
    archive: ['football_basics'],
    injuries: ['sports_daily_life', 'ai_behavior_and_answering'],
    tactical: ['football_basics'],
    security: ['privacy_and_security_defensive', 'ai_behavior_and_answering'],
    ai_help: ['ai_behavior_and_answering'],
    writing: ['writing_and_announcements'],
    study: ['study_and_learning'],
    technical: ['technology_basics', 'privacy_and_security_defensive'],
    site_info: ['ai_behavior_and_answering', 'technology_basics'],
    general: ['general_daily_help']
  };
  return map[intent] || ['general_daily_help'];
}

function categoryMatchesTopic(category, topic) {
  const map = {
    taamen: ['taamen_match_management_general', 'ai_behavior_and_answering'],
    football: ['football_basics', 'sports_daily_life'],
    security: ['privacy_and_security_defensive'],
    writing: ['writing_and_announcements'],
    tech: ['technology_basics'],
    study: ['study_and_learning'],
    health: ['sports_daily_life']
  };
  return (map[topic] || []).includes(category);
}
