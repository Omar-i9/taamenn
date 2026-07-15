const DIACRITICS_RE = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g;
const INVISIBLE_RE = /[\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g;
const TATWEEL_RE = /\u0640/g;
const EMOJI_ONLY_RE = /^[\p{Extended_Pictographic}\s!?؟.,،؛:ـ-]+$/u;
const MAX_MESSAGE_LENGTH = 500;
const CACHE_LIMIT = 24;

const INTENTS = [
  'ARCHIVE_QUERY',
  'ARCHIVE_SORT',
  'SITE_HELP',
  'FOOTBALL_STATS',
  'CHITCHAT',
  'REAL_TIME',
  'DEEP_QUESTION',
  'FOLLOW_UP'
];

const QUESTION_WORDS = ['ما', 'من', 'مين', 'كيف', 'هل', 'كم', 'شو', 'ليش', 'لماذا', 'اي', 'أي', 'وين', 'متى'];
const ORDINALS = new Map([
  ['اول', 1], ['الاول', 1], ['اولا', 1], ['اولي', 1],
  ['ثاني', 2], ['الثاني', 2], ['تاني', 2], ['التاني', 2],
  ['ثالث', 3], ['الثالث', 3], ['تالت', 3],
  ['رابع', 4], ['الرابع', 4], ['خامس', 5], ['الخامس', 5]
]);

const SYNONYM_GRAPH = {
  GOALS: ['هدف', 'اهداف', 'الاهداف', 'تسجيل', 'تسجيلا', 'تهديف', 'جاب', 'سجل', 'score', 'goals'],
  WINS: ['فوز', 'فاز', 'الفائز', 'انتصار', 'حسم', 'غلب'],
  SORT: ['رتب', 'ترتيب', 'فرز', 'sort', 'الاكثر', 'اكتر', 'اعلى', 'top'],
  DATE: ['تاريخ', 'موعد', 'احدث', 'اخر', 'قديم', 'الاقدم'],
  TEAM: ['فريق', 'الفريق', 'لاعب', 'اللاعب', 'خصم'],
  ARCHIVE: ['ارشيف', 'الارشيف', 'نتائج', 'مباريات', 'مباراه', 'مباراة'],
  RATING: ['تقييم', 'تقييما', 'تقييمات', 'افضل'],
  HELP: ['ساعدني', 'اشرح', 'كيف', 'استخدم', 'طريقة'],
  REALTIME: ['الان', 'هسا', 'اليوم', 'مباشر', 'حاليا'],
  DEEP: ['حلل', 'لماذا', 'استراتيجية', 'تكتيك', 'قارن', 'توقع']
};

const VOCABULARY = [
  ...QUESTION_WORDS,
  ...Object.values(SYNONYM_GRAPH).flat(),
  'ممتاز', 'مسؤول', 'مسئول', 'اللاعب', 'لللاعب', 'الارشيف', 'الأرشيف',
  'عمر', 'كريم', 'خضر', 'محمد', 'علي', 'ابو', 'تركي', 'التميمي'
];

const RESPONSE_TEMPLATES = {
  ARCHIVE_QUERY: [
    'قرأت الأرشيف من زاوية {focus}. {summary}\n{list}\n{action}',
    'تمام، هذه لقطة ذكية من الأرشيف: {summary}\n{list}\n{action}',
    'خلينا نمسكها بالأرقام: {summary}\n{list}\n{action}',
    'الأرشيف يلمّح لنتيجة واضحة: {summary}\n{list}\n{action}',
    'من بين البطاقات الحالية، الصورة الأقوى هي: {summary}\n{list}\n{action}',
    'التحليل السريع يقول: {summary}\n{list}\n{action}',
    'فتشت في الذاكرة الرياضية، وطلعت بهذه الخلاصة: {summary}\n{list}\n{action}',
    'إذا بدنا جواب عملي بدون لف: {summary}\n{list}\n{action}',
    'الأرقام هنا مش خجولة: {summary}\n{list}\n{action}',
    'حسب سياق الأرشيف الحالي: {summary}\n{list}\n{action}',
    'هذه قراءة مركزة، لا خطبة ملعب: {summary}\n{list}\n{action}',
    'أمسكت الخيط من {focus}: {summary}\n{list}\n{action}'
  ],
  ARCHIVE_SORT: [
    'رتبت الأرشيف حسب {focus}. {summary}\n{action}',
    'تم، خليت الترتيب يخدم سؤالك: {summary}\n{action}',
    'حركت البطاقات حسب {focus}، والنتيجة أوضح الآن. {summary}',
    'فرزت المشهد بسرعة: {summary}\n{action}',
    'الأرشيف الآن واقف على معيار {focus}. {summary}',
    'ضبطت الترتيب، وشغلت اللمعة على الأهم. {summary}',
    'تغيير الترتيب تم بهدوء: {summary}\n{action}',
    'تمام، صار العرض مبني على {focus}. {summary}',
    'الفرز اشتغل، والبطاقات الأبرز صار عليها ضوء. {summary}',
    'رتبتها لك كأنها لوحة عمليات صغيرة: {summary}',
    'أعدت ترتيب الذاكرة حسب طلبك: {summary}\n{action}',
    'تم الفرز. الآن السؤال التالي أسهل بكثير: {summary}'
  ],
  SITE_HELP: [
    'استخدم شريط الأرشيف بطريقتين: اكتب كلمة للفلترة، أو اسأل سؤالاً كاملاً للتحليل.',
    'إذا كتبت “كريم” يفلتر النتائج، وإذا كتبت “من الأكثر تسجيلاً؟” أفتح بطاقة ذكاء مباشرة.',
    'القاعدة بسيطة: بحث عادي = فلترة، سؤال = تحليل ذكي فوق القائمة.',
    'اسأل عن الأهداف، الفائزين، آخر مباراة، أو المقارنات، وسأبقيك داخل الأرشيف نفسه.',
    'الأرشيف الآن يعمل كبحث ومحادثة في نفس المكان.',
    'اكتب سؤالاً بعلامة ؟ أو بكلمة مثل “من” و“كيف” و“كم” لتفعيل الذكاء.',
    'زر AI Lens يعطيك تلميحات عند المرور فوق أسماء الفرق.',
    'اضغط أيقونة الذكاء الصغيرة على بطاقة مباراة لتحليل فريق داخل تلك البطاقة.',
    'استخدم الفرز للأهداف أو التاريخ، والذكاء سيؤكد الحركة بالكرة الذهبية.',
    'لو سألت سؤال متابعة مثل “ومن الثاني؟” سأرجع لآخر ترتيب فهمته.',
    'الشريط ذكي لكنه هادئ: لا ينقلك لصفحة ثانية ولا يخفي الأرشيف.',
    'ابدأ بسؤال قصير، وسأحوّله إلى ترتيب أو لمعة أو جواب حسب السياق.'
  ],
  FOOTBALL_STATS: [
    'إحصائياً، {summary}\n{list}',
    'بلغة الأرقام: {summary}\n{list}',
    'المؤشر الرياضي الأقوى هنا: {summary}\n{list}',
    'لو نحسبها كمدربين: {summary}\n{list}',
    'الأرقام تميل إلى هذا الحكم: {summary}\n{list}',
    'الملعب لا يكذب كثيراً هنا: {summary}\n{list}',
    'من زاوية الأداء: {summary}\n{list}',
    'القراءة الإحصائية السريعة: {summary}\n{list}',
    'هذا ملخص الأثر الرياضي: {summary}\n{list}',
    'الأداء يقول كلمته: {summary}\n{list}',
    'بالأهداف والحسم، {summary}\n{list}',
    'هذه ليست نبوءة، فقط أرقام مرتبة: {summary}\n{list}'
  ],
  CHITCHAT: [
    'هلا، أنا حاضر داخل الأرشيف. اسألني عن الأهداف أو الفائزين أو آخر مباراة.',
    'أهلاً، جاهز نفتش في ذاكرة المباريات بدون ضجة.',
    'مرحبا، الأرشيف مفتوح والعدسة جاهزة.',
    'يا هلا، أعطني سؤالاً قصيراً وسأحوّله لقراءة واضحة.',
    'أهلاً فيك، اليوم نشتغل بهدوء وبأرقام.',
    'هلا، بدك ترتيب؟ مقارنة؟ أو قصة مباراة؟',
    'جاهز. قل لي: من الأكثر تسجيلاً؟ أو رتّب حسب الأهداف.',
    'مرحبا، خلينا نخلي الأرشيف يتكلم.',
    'أهلاً، اسألني كأنك تسأل محلل بجانب الملعب.',
    'تمام، أنا صاحي على بيانات الأرشيف.',
    'هلا، نبدأ بسؤال صغير ونطلع بنتيجة كبيرة.',
    'أهلاً، الأرقام تنتظر أول سؤال.'
  ],
  REAL_TIME: [
    'الوقت الحالي داخل الجلسة هو {time}. للأرشيف أقدر أقرأ النتائج المخزنة، لا أحداثاً مباشرة خارج الموقع.',
    'أقدر أتعامل مع سياق اليوم والصفحة، لكن الأرشيف نفسه يعتمد على البيانات المحفوظة.',
    'بالنسبة للآن: أستخدم حالة الصفحة الحالية والوقت المحلي، ثم أربطها بالأرشيف.',
    'هذا طلب لحظي؛ سأبقى ضمن بيانات الموقع المخزنة كي لا أخترع نتيجة.',
    'أستطيع قراءة ما يظهر هنا الآن: فلتر، ترتيب، وبطاقات الأرشيف.',
    'سياق الآن محفوظ عندي: الصفحة والفرز والبحث والوقت.',
    'لا يوجد بث حي هنا، لكن عندي ذاكرة المباريات المحفوظة جاهزة للتحليل.',
    'أتعامل مع “اليوم” كوقت سياقي، لا كمصدر نتائج خارجية.',
    'أقدر أقول لك ماذا يظهر الآن في الأرشيف، لا ما يحدث خارج الموقع.',
    'القراءة اللحظية تعتمد على حالة الواجهة الحالية.',
    'سأستخدم الوقت والجهاز والفلتر الحالي لتفسير السؤال.',
    'إذا تقصد نتيجة مباشرة خارج الأرشيف، الأفضل تأكيد المصدر أولاً.'
  ],
  DEEP_QUESTION: [
    'السؤال عميق، فخليني أجاوب بطبقتين: {summary}\n{list}',
    'تحليلياً، لا يكفي رقم واحد. {summary}\n{list}',
    'لو نقرأ النمط بدل النتيجة فقط: {summary}\n{list}',
    'الجواب المختصر: {summary}\nوالدليل: {list}',
    'في العمق، الأرشيف يشير إلى هذا الاتجاه: {summary}\n{list}',
    'هذا سؤال يحتاج عين مدرب: {summary}\n{list}',
    'الخيط التكتيكي هنا واضح: {summary}\n{list}',
    'ليس كل فوز يشبه الآخر؛ {summary}\n{list}',
    'أقوى قراءة من البيانات: {summary}\n{list}',
    'الزاوية الأذكى هي: {summary}\n{list}',
    'أقرأها كالتالي: {summary}\n{list}',
    'النتيجة وحدها لا تكفي، لذلك ركزت على النمط: {summary}\n{list}'
  ],
  FOLLOW_UP: [
    'بناءً على السؤال السابق: {summary}\n{list}',
    'أمسكت المتابعة. {summary}\n{list}',
    'نعم، إذا نقصد نفس القائمة السابقة: {summary}\n{list}',
    'حسب آخر ترتيب فهمته: {summary}\n{list}',
    'المقصود واضح من السياق السابق: {summary}\n{list}',
    'أكمل على نفس الخط: {summary}\n{list}',
    'من القائمة السابقة تحديداً: {summary}\n{list}',
    'تمام، هذه متابعة على آخر نتيجة: {summary}\n{list}',
    'إذا ظللنا على نفس المعيار: {summary}\n{list}',
    'الجواب الثاني من السياق السابق هو: {summary}\n{list}',
    'أربطها بالذاكرة القصيرة: {summary}\n{list}',
    'لا حاجة تعيد السؤال كله؛ {summary}\n{list}'
  ]
};

const MICRO_TONES = [
  'بهدوء', 'بسرعة', 'بمزاج محلل', 'بدون ضجيج', 'بثقة', 'بلمسة تكتيكية',
  'بروح خفيفة', 'بتركيز', 'بصراحة', 'بأرقام نظيفة', 'بقراءة عملية',
  'بعين المدرب', 'بإحساس المباراة', 'بشكل واضح', 'بذكاء هادئ',
  'بترتيب', 'بنبض الأرشيف', 'بلا مبالغة', 'بلمعة صغيرة', 'بأسلوب مباشر'
];

const retrievalCache = new Map();
const shortMemory = {
  lastIntent: null,
  lastEntities: null,
  lastResult: null,
  lastTemplate: new Map(),
  lastResponses: []
};
const environmentalMemory = {
  pagesVisited: [],
  filtersApplied: [],
  startedAt: Date.now()
};

export function isArchiveQuestion(value = '') {
  const text = sanitizeInput(value);
  if (!text) return false;
  const normalized = normalizeArabicDeep(text);
  return /[؟?]$/.test(text) || QUESTION_WORDS.some(word => normalized.startsWith(normalizeArabicDeep(word) + ' '));
}

export async function runArchivePipeline(payload = {}) {
  const environment = sampleEnvironment(payload.environment);
  const rawInput = String(payload.rawInput || '');
  const sanitized = sanitizeInput(rawInput);
  const normalized = normalizeArabicDeep(sanitized);
  const tokens = tokenize(normalized);
  const ngrams = buildNgrams(tokens);
  const correctedTokens = correctTokens(tokens, payload.matches || []);
  const synonymNodes = resolveSynonymNodes(correctedTokens);
  const entities = extractEntities({ sanitized, normalized, tokens: correctedTokens, matches: payload.matches || [], forcedTeam: payload.forcedTeam });
  const intentScores = classifyIntent({ sanitized, normalized, tokens: correctedTokens, ngrams, synonymNodes, entities, environment });
  const topIntent = bestIntent(intentScores);
  const context = weaveContext({ environment, journey: payload.journey, intentScores, entities, synonymNodes });
  const confidence = assessConfidence(intentScores, entities, sanitized);
  const cacheKey = makeCacheKey({ normalized, topIntent, entities, environment });
  const cachedFacts = getCache(cacheKey);
  const facts = cachedFacts || retrieveKnowledge({ intent: topIntent, entities, matches: payload.matches || [], context });
  if (!cachedFacts) setCache(cacheKey, facts);

  const answer = synthesizeResponse({ intent: topIntent, facts, entities, context, confidence });
  const result = {
    answer,
    intent: topIntent,
    confidence,
    entities,
    action: facts.action || null,
    highlights: facts.highlights || [],
    followups: buildFollowups(topIntent, facts),
    needsRemote: confidence < 0.5,
    trace: {
      stages: 12,
      tokens: correctedTokens.slice(0, 16),
      synonymNodes: [...synonymNodes],
      elapsedMs: Math.max(1, Date.now() - environment.sampledAt)
    }
  };

  updateMemory({ intent: topIntent, entities, result, environment });
  return result;
}

export function getArchiveTeamInsight({ teamName, matchId, matches = [], environment = {} } = {}) {
  const environmentSample = sampleEnvironment(environment);
  const stats = buildTeamStats(matches);
  const normalizedTeam = normalizeArabicDeep(teamName);
  const item = stats.find(row => normalizeArabicDeep(row.name) === normalizedTeam) ||
    stats.find(row => normalizeArabicDeep(row.name).includes(normalizedTeam) || normalizedTeam.includes(normalizeArabicDeep(row.name)));

  if (!item) {
    return {
      answer: `لم أجد بيانات كافية عن ${teamName || 'هذا الفريق'} داخل الأرشيف الحالي.`,
      intent: 'ARCHIVE_QUERY',
      confidence: 0.62,
      entities: { teams: teamName ? [teamName] : [] },
      action: matchId ? { highlightIds: [matchId] } : null,
      followups: ['اعطني أفضل فريق بالأهداف', 'رتب حسب الأهداف']
    };
  }

  const recent = item.recent.slice(0, 3);
  const trend = recent.length ? `آخر ${recent.length} مباريات له سجّلت ${recent.reduce((sum, match) => sum + match.goalsFor, 0)} هدف.` : 'لا توجد عينة حديثة كافية.';
  const answer = freshSentence('ARCHIVE_QUERY', {
    focus: item.name,
    summary: `${item.name} لديه ${item.goalsFor} هدف، ${item.wins} فوز، ومتوسط ${item.averageGoals.toFixed(1)} هدف في المباراة.`,
    list: trend,
    action: 'أضأت البطاقة المرتبطة به لتبقى عينك على السياق.'
  });

  return {
    answer,
    intent: 'ARCHIVE_QUERY',
    confidence: 0.88,
    entities: { teams: [item.name] },
    action: { highlightIds: matchId ? [matchId] : item.matchIds.slice(0, 3) },
    followups: [`ومن أقرب منافس لـ ${item.name}؟`, 'رتب حسب الأهداف']
  };
}

export function getArchiveLensInsight({ teamName, matches = [] } = {}) {
  const stats = buildTeamStats(matches);
  const normalizedTeam = normalizeArabicDeep(teamName);
  const item = stats.find(row => normalizeArabicDeep(row.name) === normalizedTeam);
  if (!item) return `لا توجد قراءة كافية عن ${teamName || 'هذا الفريق'} بعد.`;
  const topAverage = Math.max(...stats.map(row => row.averageGoals), 0);
  const edge = topAverage ? Math.round((item.averageGoals / topAverage) * 100) : 0;
  const lastThreeGoals = item.recent.slice(0, 3).reduce((sum, match) => sum + match.goalsFor, 0);
  return `${item.name}: ${item.goalsFor} هدف، ${item.wins} فوز. آخر 3 مباريات: ${lastThreeGoals} هدف. قوة التهديف ${edge}% من أعلى معدل.`;
}

export { normalizeArabicDeep, sanitizeInput };

function sampleEnvironment(environment = {}) {
  const sampled = {
    url: environment.url || '',
    route: environment.route || 'archive',
    filter: environment.filter || 'all',
    sort: environment.sort || 'newest',
    search: environment.search || '',
    selectedItems: Array.isArray(environment.selectedItems) ? environment.selectedItems.slice(0, 8) : [],
    timeOfDay: environment.timeOfDay || timeLabel(new Date()),
    device: environment.device || 'unknown',
    sampledAt: Date.now()
  };
  environmentalMemory.pagesVisited.push({ route: sampled.route, at: sampled.sampledAt });
  if (sampled.filter || sampled.sort) environmentalMemory.filtersApplied.push({ filter: sampled.filter, sort: sampled.sort, at: sampled.sampledAt });
  environmentalMemory.pagesVisited = environmentalMemory.pagesVisited.slice(-24);
  environmentalMemory.filtersApplied = environmentalMemory.filtersApplied.slice(-24);
  return sampled;
}

function sanitizeInput(value) {
  let text = String(value || '').replace(INVISIBLE_RE, '').replace(TATWEEL_RE, '').trim();
  text = text.replace(/[!?؟.،,؛:]{3,}/g, match => match.slice(0, 2));
  if (EMOJI_ONLY_RE.test(text)) return '';
  return text.slice(0, MAX_MESSAGE_LENGTH);
}

function normalizeArabicDeep(value) {
  return String(value || '')
    .replace(INVISIBLE_RE, '')
    .replace(TATWEEL_RE, '')
    .replace(DIACRITICS_RE, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/[ؤئء]/g, 'ء')
    .replace(/ى/g, 'ي')
    .replace(/ة\b/g, 'ه')
    .replace(/ة/g, 'ه')
    .replace(/[گ]/g, 'ك')
    .replace(/[پ]/g, 'ب')
    .replace(/[چ]/g, 'ج')
    .replace(/[^\p{Letter}\p{Number}\s؟?]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function tokenize(normalized) {
  return normalized
    .split(/\s+/)
    .map(stripArabicAffixes)
    .filter(token => token.length > 1);
}

function stripArabicAffixes(token) {
  let value = token;
  value = value.replace(/^(وال|فال|بال|كال|لل|ولل|فلل)/, '');
  value = value.replace(/^(و|ف|ب|ك|ل)/, '');
  value = value.replace(/^ال/, '');
  value = value.replace(/(ها|هم|نا|كم|ك|ه)$/u, '');
  return value || token;
}

function buildNgrams(tokens) {
  const grams = [];
  for (let size = 1; size <= 3; size += 1) {
    for (let index = 0; index <= tokens.length - size; index += 1) {
      grams.push(tokens.slice(index, index + size).join(' '));
    }
  }
  return grams;
}

function correctTokens(tokens, matches) {
  const teams = [...new Set(matches.flatMap(match => [match.team1, match.team2]).filter(Boolean))]
    .flatMap(name => normalizeArabicDeep(name).split(/\s+/));
  const vocab = [...new Set([...VOCABULARY.map(normalizeArabicDeep), ...teams].map(stripArabicAffixes).filter(Boolean))];
  return tokens.map(token => {
    if (vocab.includes(token)) return token;
    const phonetic = phoneticKey(token);
    const candidate = vocab.find(item => phoneticKey(item) === phonetic && Math.abs(item.length - token.length) <= 2);
    if (candidate) return candidate;
    return vocab.find(item => levenshtein(token, item) <= (token.length > 5 ? 2 : 1)) || token;
  });
}

function phoneticKey(value) {
  return normalizeArabicDeep(value)
    .replace(/[ذزظض]/g, 'ز')
    .replace(/[ثسص]/g, 'س')
    .replace(/[تط]/g, 'ت')
    .replace(/[قك]/g, 'ك')
    .replace(/[حهخ]/g, 'ح')
    .replace(/[ةه]/g, 'ه');
}

function resolveSynonymNodes(tokens) {
  const nodes = new Set();
  Object.entries(SYNONYM_GRAPH).forEach(([node, words]) => {
    const normalizedWords = words.map(word => stripArabicAffixes(normalizeArabicDeep(word)));
    if (tokens.some(token => normalizedWords.includes(token) || normalizedWords.some(word => word.includes(token) || token.includes(word)))) {
      nodes.add(node);
    }
  });
  return nodes;
}

function classifyIntent({ sanitized, normalized, tokens, synonymNodes, entities, environment }) {
  const scores = Object.fromEntries(INTENTS.map(intent => [intent, 0.04]));
  const hasQuestion = isArchiveQuestion(sanitized);
  if (hasQuestion) scores.ARCHIVE_QUERY += 0.32;
  if (synonymNodes.has('ARCHIVE')) scores.ARCHIVE_QUERY += 0.26;
  if (synonymNodes.has('GOALS') || synonymNodes.has('WINS') || synonymNodes.has('RATING')) scores.FOOTBALL_STATS += 0.3;
  if (synonymNodes.has('SORT') || entities.sortField) scores.ARCHIVE_SORT += 0.35;
  if (synonymNodes.has('HELP')) scores.SITE_HELP += 0.28;
  if (synonymNodes.has('REALTIME')) scores.REAL_TIME += 0.22;
  if (synonymNodes.has('DEEP')) scores.DEEP_QUESTION += 0.24;
  if (/^(مرحبا|هلا|اهلا|السلام|هاي|hi|hello)\b/i.test(normalized)) scores.CHITCHAT += 0.42;
  if (detectFollowUp(tokens, normalized)) scores.FOLLOW_UP += 0.56;
  if (entities.teams.length) scores.ARCHIVE_QUERY += 0.14;
  if (entities.numbers.length) scores.FOOTBALL_STATS += 0.08;
  if (environment.route === 'archive') {
    scores.ARCHIVE_QUERY += 0.1;
    if (environment.sort === 'goals') scores.ARCHIVE_SORT += 0.08;
  }
  if (!sanitized) scores.CHITCHAT += 0.5;
  return normalizeScores(scores);
}

function extractEntities({ sanitized, normalized, tokens, matches, forcedTeam }) {
  const teams = [...new Set(matches.flatMap(match => [match.team1, match.team2]).filter(Boolean))];
  const foundTeams = forcedTeam ? [forcedTeam] : teams.filter(team => {
    const normalizedTeam = normalizeArabicDeep(team);
    return normalized.includes(normalizedTeam) || normalizedTeam.split(' ').some(part => part.length > 2 && tokens.includes(stripArabicAffixes(part)));
  });
  const numbers = [...sanitized.matchAll(/\d+/g)].map(match => Number(match[0])).filter(Number.isFinite);
  const arabicNumber = detectArabicNumber(normalized);
  if (arabicNumber) numbers.push(arabicNumber);
  const sortField = detectSortField(tokens, normalized);
  const ordinal = detectOrdinal(tokens, normalized);
  const comparisons = tokens.filter(token => ['اكثر', 'اكتر', 'اعلي', 'اقل', 'افضل', 'ثاني', 'اول'].includes(token));
  return {
    teams: [...new Set(foundTeams)],
    numbers: [...new Set(numbers)].slice(0, 5),
    topN: numbers.find(number => number > 0 && number < 20) || 3,
    sortField,
    ordinal,
    comparisons,
    dates: [...sanitized.matchAll(/\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g)].map(match => match[0])
  };
}

function detectSortField(tokens, normalized) {
  if (tokens.some(token => ['هدف', 'اهداف', 'تسجيل', 'تهديف', 'جاب'].includes(token))) return 'goals';
  if (tokens.some(token => ['قديم', 'الاقدم'].includes(token))) return 'oldest';
  if (tokens.some(token => ['احدث', 'اخر', 'جديد'].includes(token))) return 'newest';
  if (tokens.some(token => ['فوز', 'فاز', 'انتصار'].includes(token))) return 'wins';
  if (normalized.includes('تقييم')) return 'rating';
  return '';
}

function detectArabicNumber(normalized) {
  const map = new Map([
    ['واحد', 1], ['اول', 1], ['اثنين', 2], ['اثنان', 2], ['ثاني', 2], ['تاني', 2],
    ['ثلاثه', 3], ['ثلاث', 3], ['تلاته', 3], ['اربع', 4], ['اربعه', 4], ['خمس', 5], ['خمسه', 5]
  ]);
  for (const [word, number] of map) if (normalized.includes(word)) return number;
  return null;
}

function detectOrdinal(tokens, normalized) {
  for (const token of tokens) {
    const value = ORDINALS.get(token);
    if (value) return value;
  }
  for (const [word, value] of ORDINALS) if (normalized.includes(word)) return value;
  return null;
}

function detectFollowUp(tokens, normalized) {
  if (!shortMemory.lastResult) return false;
  return Boolean(detectOrdinal(tokens, normalized)) || ['هو', 'هي', 'الثاني', 'التاني', 'بعده', 'ومن', 'طيب'].some(word => normalized.startsWith(word));
}

function weaveContext({ environment, journey, intentScores, entities, synonymNodes }) {
  return {
    environment,
    journey: journey || {},
    memory: {
      lastIntent: shortMemory.lastIntent,
      lastEntities: shortMemory.lastEntities,
      lastResult: shortMemory.lastResult
    },
    entities,
    intentScores,
    synonymNodes: [...synonymNodes],
    timeWarmth: environment.timeOfDay
  };
}

function assessConfidence(scores, entities, sanitized) {
  const top = Math.max(...Object.values(scores));
  let confidence = top;
  if (entities.teams.length || entities.sortField) confidence += 0.08;
  if (isArchiveQuestion(sanitized)) confidence += 0.08;
  if (sanitized.length < 3) confidence -= 0.2;
  return Math.max(0, Math.min(0.98, confidence));
}

function retrieveKnowledge({ intent, entities, matches, context }) {
  const stats = buildTeamStats(matches);
  const sortedMatchesByGoals = [...matches].sort((a, b) => totalGoals(b) - totalGoals(a));
  if (intent === 'FOLLOW_UP') return retrieveFollowUp(entities, context);
  if (entities.teams.length) return retrieveTeamKnowledge(entities.teams[0], stats, matches);
  if (entities.sortField === 'goals' || intent === 'ARCHIVE_SORT') {
    const topN = Math.max(1, Math.min(entities.topN || 3, 6));
    const topTeams = [...stats].sort((a, b) => b.goalsFor - a.goalsFor || b.wins - a.wins).slice(0, topN);
    return {
      focus: 'الأهداف',
      summary: `أعلى ${topN} فرق تهديفياً جاهزة، وأقوى ${topN} بطاقات تم تمييزها بعد الفرز.`,
      list: formatRankedList(topTeams, item => `${item.name}: ${item.goalsFor} هدف عبر ${item.matches} مباراة`),
      action: { sort: 'goals', highlightTopRows: topN },
      highlights: sortedMatchesByGoals.slice(0, topN).map(match => match.id),
      ranking: topTeams
    };
  }
  if (entities.sortField === 'oldest' || entities.sortField === 'newest') {
    const sort = entities.sortField;
    const sorted = [...matches].sort((a, b) => sort === 'oldest' ? Number(a.dateKey || 0) - Number(b.dateKey || 0) : Number(b.dateKey || 0) - Number(a.dateKey || 0));
    return {
      focus: sort === 'oldest' ? 'الأقدم' : 'الأحدث',
      summary: sort === 'oldest' ? 'أقدم مباراة ظهرت في بداية القائمة.' : 'أحدث مباراة صارت في أعلى القائمة.',
      list: sorted[0] ? formatMatchLine(sorted[0]) : '',
      action: { sort, highlightIds: sorted[0] ? [sorted[0].id] : [] },
      ranking: sorted.slice(0, 5)
    };
  }
  if (intent === 'SITE_HELP') {
    return {
      focus: 'طريقة الاستخدام',
      summary: 'الشريط يجمع الفلترة والذكاء في نفس المكان.',
      list: 'اكتب كلمة للبحث، أو سؤالاً بعلامة استفهام لفتح التحليل.',
      action: null
    };
  }
  const topTeams = [...stats].sort((a, b) => b.goalsFor - a.goalsFor || b.wins - a.wins).slice(0, 3);
  return {
    focus: 'الأرشيف',
    summary: `يوجد ${matches.length} مباراة محفوظة، بإجمالي ${matches.reduce((sum, match) => sum + totalGoals(match), 0)} هدف.`,
    list: formatRankedList(topTeams, item => `${item.name}: ${item.goalsFor} هدف، ${item.wins} فوز`),
    action: null,
    ranking: topTeams
  };
}

function retrieveTeamKnowledge(teamName, stats, matches) {
  const normalizedTeam = normalizeArabicDeep(teamName);
  const item = stats.find(row => normalizeArabicDeep(row.name) === normalizedTeam) ||
    stats.find(row => normalizeArabicDeep(row.name).includes(normalizedTeam) || normalizedTeam.includes(normalizeArabicDeep(row.name)));
  if (!item) {
    return {
      focus: teamName,
      summary: `لم أجد سجلًا واضحًا باسم ${teamName}.`,
      list: 'جرّب الاسم كما يظهر على البطاقة.',
      action: null
    };
  }
  return {
    focus: item.name,
    summary: `${item.name} سجّل ${item.goalsFor} هدف، واستقبل ${item.goalsAgainst}، وفاز ${item.wins} مرة.`,
    list: formatRankedList(item.recent.slice(0, 3), match => formatMatchLine(match.match)),
    action: { highlightIds: item.matchIds.slice(0, 3) },
    highlights: item.matchIds.slice(0, 3),
    ranking: [item]
  };
}

function retrieveFollowUp(entities, context) {
  const previous = context.memory.lastResult;
  const ranking = previous?.facts?.ranking || previous?.result?.ranking || previous?.ranking || [];
  const ordinal = entities.ordinal || 2;
  const item = ranking[ordinal - 1];
  if (!item) {
    return {
      focus: 'المتابعة',
      summary: 'أحتاج قائمة سابقة أو رقم أوضح حتى أحدد المقصود.',
      list: 'اسأل مثلاً: أعلى 3 فرق بالأهداف.',
      action: null
    };
  }
  const line = item.name ? `${item.name}: ${item.goalsFor ?? totalGoals(item)} هدف` : formatMatchLine(item);
  return {
    focus: 'متابعة',
    summary: `العنصر رقم ${ordinal} في آخر قائمة هو ${line}.`,
    list: line,
    action: item.id ? { highlightIds: [item.id] } : { highlightIds: item.matchIds?.slice(0, 2) || [] },
    highlights: item.id ? [item.id] : item.matchIds?.slice(0, 2) || [],
    ranking
  };
}

function synthesizeResponse({ intent, facts, entities, context, confidence }) {
  const selectedIntent = confidence < 0.5 ? 'SITE_HELP' : intent;
  const slots = {
    focus: facts.focus || entities.sortField || 'الأرشيف',
    summary: facts.summary || 'البيانات الحالية جاهزة للقراءة.',
    list: facts.list || '',
    action: actionSentence(facts.action),
    time: context.environment.timeOfDay,
    tone: pick(MICRO_TONES)
  };
  let answer = freshSentence(selectedIntent, slots);
  for (let attempt = 0; attempt < 8 && tooSimilar(answer); attempt += 1) {
    answer = freshSentence(selectedIntent, { ...slots, tone: pick(MICRO_TONES) });
  }
  rememberResponse(answer);
  shortMemory.lastResult = { facts, ranking: facts.ranking || [] };
  return answer;
}

function freshSentence(intent, slots) {
  const pool = RESPONSE_TEMPLATES[intent] || RESPONSE_TEMPLATES.ARCHIVE_QUERY;
  const lastIndex = shortMemory.lastTemplate.get(intent);
  let index = Math.floor(Math.random() * pool.length);
  if (pool.length > 1 && index === lastIndex) index = (index + 1) % pool.length;
  shortMemory.lastTemplate.set(intent, index);
  const phrase = pool[index].replace(/\{(\w+)\}/g, (_, key) => slots[key] || '');
  return injectVariation(phrase, slots.tone);
}

function injectVariation(text, tone = '') {
  const alternatives = [
    [/\bتمام\b/g, pick(['تمام', 'حاضر', 'جاهز'])],
    [/الأرشيف/g, pick(['الأرشيف', 'ذاكرة المباريات', 'سجل المباريات'])],
    [/الأرقام/g, pick(['الأرقام', 'المؤشرات', 'القراءة'])],
    [/بسرعة/g, pick(['بسرعة', 'بهدوء', 'بشكل مختصر'])]
  ];
  let output = text;
  alternatives.forEach(([pattern, replacement]) => { output = output.replace(pattern, replacement); });
  if (tone && Math.random() > 0.45) output = `${tone}: ${output}`;
  return output.replace(/\n{3,}/g, '\n\n').trim();
}

function actionSentence(action) {
  if (!action) return '';
  if (action.sort === 'goals') return 'طبّقت فرز الأهداف ووضعت توهجًا خفيفًا على الصفوف الأبرز.';
  if (action.sort) return 'طبّقت الفرز المناسب داخل الأرشيف.';
  if (action.highlightIds?.length) return 'أضأت البطاقات الأقرب للسؤال.';
  return '';
}

function buildTeamStats(matches) {
  const stats = new Map();
  const ensure = name => {
    if (!stats.has(name)) {
      stats.set(name, { name, matches: 0, wins: 0, draws: 0, goalsFor: 0, goalsAgainst: 0, matchIds: [], recent: [] });
    }
    return stats.get(name);
  };
  [...matches].sort((a, b) => Number(b.dateKey || 0) - Number(a.dateKey || 0)).forEach(match => {
    const left = ensure(match.team1);
    const right = ensure(match.team2);
    addTeamMatch(left, match, match.score1, match.score2);
    addTeamMatch(right, match, match.score2, match.score1);
  });
  return [...stats.values()].map(item => ({
    ...item,
    averageGoals: item.matches ? item.goalsFor / item.matches : 0
  }));
}

function addTeamMatch(item, match, goalsFor, goalsAgainst) {
  item.matches += 1;
  item.goalsFor += Number(goalsFor || 0);
  item.goalsAgainst += Number(goalsAgainst || 0);
  item.matchIds.push(match.id);
  item.recent.push({ match, goalsFor: Number(goalsFor || 0), goalsAgainst: Number(goalsAgainst || 0) });
  if (goalsFor > goalsAgainst) item.wins += 1;
  else if (goalsFor === goalsAgainst) item.draws += 1;
}

function formatRankedList(items, formatter) {
  return items.map((item, index) => `${index + 1}. ${formatter(item)}`).join('\n');
}

function formatMatchLine(match) {
  if (!match) return '';
  return `${match.team1} ضد ${match.team2} (${match.score2} - ${match.score1})`;
}

function totalGoals(match) {
  return Number(match?.score1 || 0) + Number(match?.score2 || 0);
}

function buildFollowups(intent, facts) {
  if (intent === 'FOLLOW_UP') return ['اعطني القائمة كاملة', 'غيّر المعيار للأهداف'];
  if (facts.action?.sort === 'goals') return ['ومن الثاني؟', 'أرني أفضل 5', 'قارن أول فريقين'];
  return ['من الأكثر تسجيلاً؟', 'رتب حسب الأهداف', 'ما آخر مباراة؟'];
}

function normalizeScores(scores) {
  const max = Math.max(...Object.values(scores), 0.01);
  return Object.fromEntries(Object.entries(scores).map(([intent, value]) => [intent, Math.min(0.98, value / max)]));
}

function bestIntent(scores) {
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] || 'ARCHIVE_QUERY';
}

function makeCacheKey({ normalized, topIntent, entities, environment }) {
  return JSON.stringify({
    normalized,
    topIntent,
    teams: entities.teams,
    sortField: entities.sortField,
    filter: environment.filter,
    sort: environment.sort
  });
}

function getCache(key) {
  const value = retrievalCache.get(key);
  if (!value) return null;
  retrievalCache.delete(key);
  retrievalCache.set(key, value);
  return value;
}

function setCache(key, value) {
  retrievalCache.set(key, value);
  while (retrievalCache.size > CACHE_LIMIT) retrievalCache.delete(retrievalCache.keys().next().value);
}

function updateMemory({ intent, entities, result, environment }) {
  shortMemory.lastIntent = intent;
  shortMemory.lastEntities = entities;
  shortMemory.lastResult = {
    intent,
    entities,
    result,
    ranking: result?.ranking || shortMemory.lastResult?.ranking || [],
    facts: shortMemory.lastResult?.facts
  };
  environmentalMemory.lastEnvironment = environment;
}

function rememberResponse(answer) {
  shortMemory.lastResponses.unshift(answer);
  shortMemory.lastResponses = shortMemory.lastResponses.slice(0, 5);
}

function tooSimilar(answer) {
  return shortMemory.lastResponses.some(previous => similarity(previous, answer) > 0.72);
}

function similarity(a, b) {
  const left = new Set(tokenize(normalizeArabicDeep(a)));
  const right = new Set(tokenize(normalizeArabicDeep(b)));
  const intersection = [...left].filter(token => right.has(token)).length;
  const union = new Set([...left, ...right]).size || 1;
  return intersection / union;
}

function levenshtein(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i += 1) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
    }
  }
  return matrix[a.length][b.length];
}

function timeLabel(date) {
  const hour = date.getHours();
  if (hour < 12) return 'صباح';
  if (hour < 18) return 'مساء مبكر';
  return 'مساء';
}

function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}
