import { AI_KNOWLEDGE_PACK } from './ai-knowledge-pack.js';
import { retrieveKnowledge } from './ai-retrieval.js';
import {
  MISSING_TAAMEN_INFO,
  analyzeQuestion,
  generateSmartLocalResponse
} from './ai-template-engine.js';

export const ASSISTANT_INSTRUCTIONS = `
أنت مساعد تأمين الذكي. أجب بالعربية الطبيعية وباختصار افتراضيا.
- صنف السؤال قبل الإجابة: تحية، موقع تأمين، مباراة، أرشيف، إصابات، رادار، حماية، كوكيز، كتابة، رياضة، تقنية، دراسة، تخطيط، مقارنة، سؤال مركب، أو طلب غير آمن.
- إذا كان السؤال عن تأمين، استخدم siteKnowledge فقط ولا تخترع مباراة أو إصابة أو نتيجة.
- إذا كانت المعلومة غير موجودة في بيانات الموقع، قل: ${MISSING_TAAMEN_INFO}
- إذا كان السؤال عاما، أجب كمعلومة عامة مفيدة ولا ترفضه لمجرد أنه خارج تأمين.
- اجعل التحيات والرسائل الصغيرة من سطر أو سطرين.
- لا تقدم خطوات اختراق أو سرقة أو تجاوز أو جمع أسرار. حوّل الطلب إلى حماية دفاعية.
- لا تشخص الإصابات ولا تصف أدوية أو جرعات.
- لا تعرض مفاتيح API أو أسرارا أو بيانات تخزين محلية كاملة.
`.trim();

export function buildAIRequestPayload({
  question,
  siteKnowledge = {},
  pageContext = '',
  conversationContext = {}
} = {}) {
  const analysis = analyzeQuestion(question);
  const retrieval = safeRetrieve(question, analysis);
  const payload = {
    question: String(question || '').trim(),
    siteKnowledge: compactSiteKnowledge(siteKnowledge),
    pageContext,
    questionAnalysis: compactAnalysis(analysis),
    generalKnowledge: {
      packVersion: AI_KNOWLEDGE_PACK.version,
      ruleSummary: AI_KNOWLEDGE_PACK.quickRules,
      retrievedEntries: retrieval.entries.map(entry => ({
        id: entry.id,
        category: entry.category,
        title: entry.title,
        content: entry.content
      })),
      retrievedSummary: retrieval.summaryText
    },
    conversationContext: compactConversation(conversationContext),
    assistantInstructions: ASSISTANT_INSTRUCTIONS
  };

  return { payload, analysis, retrieval };
}

export function generateLocalAnswer({
  question,
  siteKnowledge = {},
  analysis = null,
  retrieval = null,
  failureReason = ''
} = {}) {
  const resolvedAnalysis = analysis || analyzeQuestion(question);
  const resolvedRetrieval = retrieval || safeRetrieve(question, resolvedAnalysis);
  const answer = generateSmartLocalResponse({
    question,
    siteKnowledge,
    analysis: resolvedAnalysis,
    retrieval: resolvedRetrieval
  });
  const prefix = failureReason
    ? 'ملاحظة: تعذر الاتصال بالخادم، لذلك استخدمت الرد المحلي المتاح.'
    : '';

  return {
    answer: [prefix, answer].filter(Boolean).join('\n\n'),
    mode: 'local',
    provider: 'taamen-local',
    intent: resolvedAnalysis.intent,
    intentLabel: resolvedAnalysis.intentLabel,
    answerLength: resolvedAnalysis.answerLength,
    topics: resolvedAnalysis.topics,
    sources: makeSources(resolvedAnalysis, resolvedRetrieval),
    followups: followupsFor(resolvedAnalysis.intent),
    reason: failureReason
  };
}

function safeRetrieve(question, analysis) {
  try {
    return retrieveKnowledge(question, { analysis, maxEntries: 6, maxCharacters: 2200 });
  } catch (error) {
    console.warn('[Taamen AI] Retrieval failed, continuing with templates:', error);
    return { intent: analysis.intent, topics: analysis.topics, entries: [], summaryText: '' };
  }
}

function compactSiteKnowledge(siteKnowledge) {
  return {
    meta: siteKnowledge.meta || {},
    pages: trimArray(siteKnowledge.pages, 12),
    nextMatch: siteKnowledge.nextMatch || null,
    archive: {
      total: siteKnowledge.archive?.total || 0,
      latestMatch: siteKnowledge.archive?.latestMatch || null,
      recentMatches: trimArray(siteKnowledge.archive?.recentMatches, 5)
    },
    injuries: {
      active: trimArray(siteKnowledge.injuries?.active, 6),
      recovered: trimArray(siteKnowledge.injuries?.recovered, 5),
      lastUpdated: siteKnowledge.injuries?.lastUpdated || ''
    },
    tactical: {
      available: Boolean(siteKnowledge.tactical?.available),
      formations: trimArray(siteKnowledge.tactical?.formations, 5),
      roles: trimArray(siteKnowledge.tactical?.roles, 8)
    },
    security: siteKnowledge.security || {},
    ai: siteKnowledge.ai || {},
    quickFacts: trimArray(siteKnowledge.quickFacts, 8),
    playerStats: siteKnowledge.playerStats || {}
  };
}

function compactAnalysis(analysis) {
  return {
    rawQuestion: analysis.rawQuestion,
    normalizedQuestion: analysis.normalizedQuestion,
    intent: analysis.intent,
    intentLabel: analysis.intentLabel,
    topics: analysis.topics,
    tasks: analysis.tasks,
    answerLength: analysis.answerLength,
    needsSiteData: analysis.needsSiteData,
    needsGeneralKnowledge: analysis.needsGeneralKnowledge,
    needsWriting: analysis.needsWriting,
    needsSafetyRefusal: analysis.needsSafetyRefusal,
    safetyLevel: analysis.safetyLevel,
    medicalSensitive: analysis.medicalSensitive,
    confidence: analysis.confidence
  };
}

function compactConversation(conversationContext) {
  return {
    lastQuestions: trimArray(conversationContext.lastQuestions, 5),
    lastAnswerSummaries: trimArray(conversationContext.lastAnswerSummaries, 5),
    currentPage: conversationContext.currentPage || '',
    lastIntent: conversationContext.lastIntent || '',
    remoteRecentlySucceeded: Boolean(conversationContext.remoteRecentlySucceeded)
  };
}

function makeSources(analysis, retrieval) {
  const sources = [];
  if (analysis.needsSiteData) sources.push('site-data');
  if (analysis.needsGeneralKnowledge) sources.push('local-templates');
  if (retrieval?.entries?.length) sources.push('local-knowledge-pack');
  if (!sources.length) sources.push('local-rules');
  return [...new Set(sources)];
}

function followupsFor(intent) {
  const map = {
    greeting: ['شو أقدر أسألك؟', 'عرفني على الموقع بسرعة'],
    smalltalk: ['شو حالة الموقع؟', 'متى المباراة القادمة؟'],
    next_match: ['اكتب إعلان واتساب للمباراة', 'ما آخر مباراة في الأرشيف؟'],
    archive: ['اعطني ملخص آخر 5 مباريات', 'مين أعلى لاعب تقييما؟'],
    injuries: ['ما الحالات المتعافية؟', 'اكتب تنبيه إصابة بدون تشخيص'],
    tactical: ['اشرح توزيع 1-2-1', 'كيف نمنع المرتدات؟'],
    security: ['كيف أبلغ عن رابط مشبوه؟', 'كيف أحمي API key؟'],
    cookies_privacy: ['إدارة الكوكيز', 'حذف بيانات تأمين من الجهاز'],
    ai_help: ['ما الذي تستطيع فعله؟', 'اسألني سؤالا مركبا'],
    writing: ['اختصرها أكثر', 'حولها لرسالة واتساب'],
    sports_general: ['كيف أتحسن بالخماسي؟', 'كيف أكون كابتن أفضل؟'],
    study: ['حولها لخطة دراسة', 'اشرحها بمثال'],
    technical: ['كيف أحمي API key؟', 'ما الفرق بين frontend و backend؟'],
    planning: ['حولها إلى خطوات', 'رتبها حسب الأولوية'],
    comparison: ['اعمل جدول مقارنة', 'اختصر النتيجة'],
    unsafe_or_sensitive: ['كيف أحمي حسابي؟', 'اكتب تنبيها أمنيا']
  };
  return map[intent] || ['اسألني بطريقة أوضح', 'اختر موضوعا من الاقتراحات'];
}

function trimArray(value, limit) {
  return Array.isArray(value) ? value.slice(0, limit) : [];
}
