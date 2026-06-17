import {
  siteMeta,
  sources,
  teams,
  defaultPlayers,
  playerStats,
  upcomingMatches,
  matchArchive,
  guideSections,
  dhikrList
} from '../../data/site-data.js';
import { injuryCases, injuryMeta, injurySeverity } from '../../data/injuries-data.js';
import { $, safeText, copyText, toast } from './ui.js';
import { hasAIEndpoint, requestAIAnswer, testAIConnection } from './api-client.js';

const ROUTE_LABELS = [
  ['home', 'الرئيسية'],
  ['match-center', 'المباراة القادمة'],
  ['archive', 'الأرشيف'],
  ['ai', 'المساعد الذكي'],
  ['radar', 'الرادار التكتيكي'],
  ['weather-prayer', 'الطقس والصلاة'],
  ['injuries', 'الإصابات'],
  ['qibla', 'القبلة'],
  ['guide', 'دليل الاستخدام'],
  ['about', 'عن المنصة']
];

const state = {
  bound: false,
  messages: [],
  knowledge: null,
  lastMode: hasAIEndpoint() ? 'ready' : 'local'
};

export function initAIAssistant() {
  const root = $('#aiAssistant');
  if (!root || state.bound) return;

  state.bound = true;
  state.knowledge = buildSiteKnowledge();
  renderStatus();
  renderKnowledgeMeta();
  renderSuggestions();
  resetChat();
  bindAIEvents();
}

export function buildSiteKnowledge() {
  const archived = [...matchArchive].sort((a, b) => Number(b.dateKey || 0) - Number(a.dateKey || 0));
  const upcoming = [...upcomingMatches].sort((a, b) => getMatchTime(a) - getMatchTime(b));
  const now = Date.now();
  const futureUpcoming = upcoming.find(match => getMatchTime(match) >= now) || upcoming[0] || null;
  const injuries = splitInjuries(injuryCases);
  const topPlayer = [...playerStats].sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))[0] || null;
  const availablePages = ROUTE_LABELS.filter(([id]) => Boolean(document.getElementById(id)))
    .map(([id, label]) => ({ id, label }));

  return {
    meta: { ...siteMeta },
    teams: { ...teams },
    playersCount: defaultPlayers.length,
    latestMatch: archived[0] || null,
    upcomingMatch: futureUpcoming,
    archiveSummary: {
      total: matchArchive.length,
      latestFive: archived.slice(0, 5)
    },
    injuriesSummary: {
      meta: { ...injuryMeta },
      active: injuries.active,
      recovered: injuries.recovered,
      severityLabels: Object.fromEntries(Object.entries(injurySeverity).map(([key, value]) => [key, value.label]))
    },
    playerStatsSummary: {
      total: playerStats.length,
      topPlayer,
      leaders: [...playerStats].sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0)).slice(0, 5)
    },
    pagesSummary: {
      available: availablePages,
      guideCount: guideSections.length,
      radarEnabled: Boolean(document.getElementById('radar'))
    },
    releaseSummary: {
      version: siteMeta.version,
      mode: siteMeta.releaseMode,
      sources: sources.map(source => source.title),
      dhikrCount: dhikrList.length
    }
  };
}

function bindAIEvents() {
  const form = $('#aiForm');
  const prompt = $('#aiPrompt');
  const suggestions = $('#aiSuggestions');
  const messages = $('#aiMessages');
  const root = $('#aiAssistant');

  form?.addEventListener('submit', event => {
    event.preventDefault();
    submitQuestion();
  });

  prompt?.addEventListener('keydown', event => {
    if (event.key !== 'Enter' || event.shiftKey) return;
    event.preventDefault();
    submitQuestion();
  });

  suggestions?.addEventListener('click', event => {
    const button = event.target.closest('[data-ai-question]');
    if (!button || !prompt) return;
    prompt.value = button.dataset.aiQuestion || '';
    submitQuestion();
  });

  messages?.addEventListener('click', event => {
    const copyButton = event.target.closest('[data-ai-copy]');
    if (copyButton) {
      const message = state.messages[Number(copyButton.dataset.aiCopy)];
      if (message) copyText(message.content, 'تم نسخ رد المساعد');
      return;
    }

    const shareButton = event.target.closest('[data-ai-share]');
    if (shareButton) {
      const message = state.messages[Number(shareButton.dataset.aiShare)];
      if (message) shareAnswer(message.content);
    }
  });

  root?.addEventListener('click', event => {
    const testButton = event.target.closest('#aiTestConnection');
    if (testButton) {
      event.preventDefault();
      event.stopPropagation();
      testBackendConnection();
      return;
    }

    const clearButton = event.target.closest('#aiClearChat');
    if (!clearButton) return;
    event.preventDefault();
    event.stopPropagation();
    resetChat();
    toast('تم مسح محادثة المساعد', { icon: 'fa-eraser' });
  });
}

async function submitQuestion() {
  const prompt = $('#aiPrompt');
  const value = String(prompt?.value || '').trim();
  if (!value) return;

  addMessage('user', value);
  prompt.value = '';
  setTyping(true);

  const knowledge = state.knowledge || buildSiteKnowledge();
  const pageContext = getCurrentPageContext();
  let answer = '';

  if (hasAIEndpoint()) {
    const remote = await requestAIAnswer({
      question: value,
      siteKnowledge: knowledge,
      pageContext
    });

    if (remote.ok) {
      setConnectionStatus('online');
      answer = remote.answer;
    } else {
      setConnectionStatus('fallback');
      answer = `${localStatusMessage()}\n\n${generateLocalAnswer(value, knowledge)}`;
      console.warn('[Taamen AI] Backend unavailable, using local fallback:', remote.reason);
    }
  } else {
    setConnectionStatus('local');
    answer = generateLocalAnswer(value, knowledge);
  }

  setTyping(false);
  addMessage('assistant', answer);
}

function resetChat() {
  state.messages = [];
  const messages = $('#aiMessages');
  if (messages) messages.innerHTML = '';
  const intro = `${introStatusMessage()}\n\nأنا أقرأ بيانات الموقع فقط: المباريات، الأرشيف، الإصابات، الصفحات، وحالة الإصدار. اسألني وسأعطيك جوابًا من المساعد الذكي، وإذا تعذر الاتصال أرجع للوضع المحلي تلقائيًا.`;
  addMessage('assistant', intro);
}

function renderStatus() {
  setConnectionStatus(hasAIEndpoint() ? 'ready' : 'local');
}

function setConnectionStatus(mode = 'local') {
  const status = $('#aiConnectionStatus');
  state.lastMode = mode;

  if (!status) return;

  const map = {
    ready: {
      icon: 'fa-tower-broadcast',
      text: 'جاهز للاتصال بالذكاء الاصطناعي'
    },
    online: {
      icon: 'fa-circle-check',
      text: 'متصل بالذكاء الاصطناعي'
    },
    fallback: {
      icon: 'fa-triangle-exclamation',
      text: 'تعذر الاتصال، تم الرجوع للوضع المحلي'
    },
    local: {
      icon: 'fa-house-signal',
      text: 'يعمل محليًا'
    },
    testing: {
      icon: 'fa-spinner fa-spin',
      text: 'يتم اختبار الاتصال'
    }
  };

  const current = map[mode] || map.local;
  status.dataset.status = mode;
  status.innerHTML = `
    <i class="fa-solid ${current.icon}"></i>
    <span>${current.text}</span>
  `;
}

function renderKnowledgeMeta() {
  const node = $('#aiKnowledgeMeta');
  if (!node || !state.knowledge) return;
  const knowledge = state.knowledge;
  node.textContent = `${knowledge.archiveSummary.total} مباراة محفوظة - ${knowledge.injuriesSummary.active.length} حالة نشطة - ${knowledge.pagesSummary.available.length} صفحات`;
}

function renderSuggestions() {
  const host = $('#aiSuggestions');
  if (!host || !state.knowledge) return;
  host.innerHTML = buildSuggestions(state.knowledge).map(question => `
    <button class="ai-suggestion-chip" data-ai-question="${safeText(question)}" type="button">
      <i class="fa-solid fa-sparkles"></i>
      <span>${safeText(question)}</span>
    </button>
  `).join('');
}

function buildSuggestions(knowledge) {
  const suggestions = [
    'ما حالة الموقع وآخر تحديث؟',
    'ما الصفحات الموجودة في الموقع؟',
    'أعطني تقريرًا سريعًا للفريق.'
  ];

  if (knowledge.upcomingMatch) suggestions.unshift('متى المباراة القادمة؟');
  if (knowledge.latestMatch) suggestions.splice(1, 0, 'ما آخر مباراة تم لعبها؟', 'ما نتيجة آخر مباراة؟');
  if (knowledge.playerStatsSummary.topPlayer) suggestions.push('من أكثر لاعب تقييمًا؟');
  if (knowledge.injuriesSummary.active.length) suggestions.push('ما الإصابات الحالية؟');
  if (knowledge.injuriesSummary.recovered.length) suggestions.push('هل يوجد لاعبون تعافوا؟');
  if (knowledge.archiveSummary.total) suggestions.push('أعطني ملخص آخر 5 مباريات.', 'ماذا يوجد داخل الأرشيف؟');
  if (knowledge.upcomingMatch) suggestions.push('اكتب رسالة واتساب للمباراة القادمة.');

  return [...new Set(suggestions)].slice(0, 12);
}

function addMessage(role, content) {
  const messages = $('#aiMessages');
  if (!messages) return;
  const index = state.messages.push({ role, content }) - 1;
  const node = document.createElement('article');
  node.className = `ai-message ${role === 'user' ? 'from-user' : 'from-assistant'}`;
  node.innerHTML = `
    <div class="ai-message-avatar">
      <i class="fa-solid ${role === 'user' ? 'fa-user' : 'fa-brain'}"></i>
    </div>
    <div class="ai-message-body">
      <p>${safeText(content).replace(/\n/g, '<br>')}</p>
      ${role === 'assistant' ? `
        <div class="ai-message-actions">
          <button type="button" data-ai-copy="${index}"><i class="fa-solid fa-copy"></i> نسخ</button>
          <button type="button" data-ai-share="${index}"><i class="fa-solid fa-share-nodes"></i> مشاركة</button>
        </div>
      ` : ''}
    </div>
  `;
  messages.appendChild(node);
  messages.scrollTop = messages.scrollHeight;
}

function setTyping(show) {
  const typing = $('#aiTyping');
  const button = $('#aiForm button[type="submit"]');
  if (typing) typing.hidden = !show;
  if (button) button.disabled = show;
}

async function shareAnswer(text) {
  if (navigator.share) {
    try {
      await navigator.share({ title: 'المساعد الذكي - تأمين 2026', text });
      return;
    } catch (_) {
      return;
    }
  }
  await copyText(text, 'المشاركة غير مدعومة، تم نسخ الرد');
}

function generateLocalAnswer(question, knowledge) {
  const q = normalize(question);

  if (hasAny(q, ['قادمه', 'القادمه', 'موعد', 'متى المباراة', 'next', 'upcoming'])) {
    return answerUpcoming(knowledge);
  }

  if (hasAny(q, ['اخر مباراه', 'اخر مباراة', 'نتيجه اخر', 'نتيجة آخر', 'latest', 'last match'])) {
    return answerLatestMatch(knowledge);
  }

  if (hasAny(q, ['اصابه', 'اصابات', 'مصاب', 'injury', 'injuries'])) {
    return answerInjuries(knowledge);
  }

  if (hasAny(q, ['تعاف', 'recovered', 'healed'])) {
    return answerRecovered(knowledge);
  }

  if (hasAny(q, ['صفحات', 'الصفحات', 'routes', 'pages'])) {
    return answerPages(knowledge);
  }

  if (hasAny(q, ['تحديث', 'اصدار', 'إصدار', 'حاله الموقع', 'حالة الموقع', 'الرادار', 'version', 'status'])) {
    return answerRelease(knowledge);
  }

  if (hasAny(q, ['افضل', 'أفضل', 'تقييم', 'mvp', 'لاعب'])) {
    return answerTopPlayer(knowledge);
  }

  if (hasAny(q, ['واتساب', 'رساله', 'رسالة', 'whatsapp'])) {
    return answerWhatsapp(knowledge);
  }

  if (hasAny(q, ['ارشيف', 'أرشيف', 'archive'])) {
    return answerArchive(knowledge);
  }

  return answerQuickReport(knowledge);
}

function answerUpcoming(knowledge) {
  const match = knowledge.upcomingMatch;
  if (!match) return 'لا توجد مباراة قادمة محفوظة حاليًا في بيانات الموقع.';
  return [
    'المباراة القادمة:',
    `- العنوان: ${match.title || 'غير محدد'}`,
    `- الأطراف: ${match.team1 || 'غير محدد'} ضد ${match.team2 || 'غير محدد'}`,
    `- التاريخ: ${match.dateLabel || formatDateFromMatch(match)}`,
    `- الساعة: ${formatMatchTime(match)}`,
    `- المكان: ${match.location || 'غير محدد'}`,
    match.note ? `- ملاحظة: ${match.note}` : ''
  ].filter(Boolean).join('\n');
}

function answerLatestMatch(knowledge) {
  const match = knowledge.latestMatch;
  if (!match) return 'لا توجد مباريات محفوظة في الأرشيف حتى الآن.';
  return [
    'آخر مباراة محفوظة:',
    formatMatch(match),
    match.story ? `القصة: ${match.story}` : '',
    match.details ? 'تتوفر تفاصيل إحصائية داخل الأرشيف لهذه المباراة.' : ''
  ].filter(Boolean).join('\n');
}

function answerArchive(knowledge) {
  const latest = knowledge.archiveSummary.latestFive;
  if (!latest.length) return 'الأرشيف فارغ حاليًا.';
  return [
    `داخل الأرشيف يوجد ${knowledge.archiveSummary.total} مباراة محفوظة.`,
    'آخر 5 مباريات:',
    ...latest.map(match => `- ${formatMatch(match)}`)
  ].join('\n');
}

function answerInjuries(knowledge) {
  const active = knowledge.injuriesSummary.active;
  if (!active.length) {
    return 'لا توجد إصابات نشطة حاليًا حسب بيانات الموقع. توجد حالات متعافية محفوظة في السجل السابق إذا أردت عرضها.';
  }
  return [
    'الإصابات الحالية:',
    ...active.map(item => `- ${item.player}: ${item.caseName} - ${severityLabel(item, knowledge)} - ${item.status || 'تحت المتابعة'} - الرجوع المتوقع: ${item.expectedReturn || 'غير محدد'}`),
    'تنبيه: هذه معلومات تنظيمية من الموقع وليست تشخيصًا طبيًا.'
  ].join('\n');
}

function answerRecovered(knowledge) {
  const recovered = knowledge.injuriesSummary.recovered;
  if (!recovered.length) return 'لا توجد حالات تعافٍ محفوظة حاليًا.';
  return [
    'الحالات المتعافية:',
    ...recovered.map(item => `- ${item.player}: ${item.caseName} - ${item.recoveryDate || item.expectedReturn || 'بدون تاريخ محدد'}`)
  ].join('\n');
}

function answerPages(knowledge) {
  return [
    'الصفحات الموجودة في الموقع:',
    ...knowledge.pagesSummary.available.map(page => `- ${page.label} (#${page.id})`),
    knowledge.pagesSummary.radarEnabled ? 'الرادار موجود كصفحة فعالة داخل المشروع.' : 'الرادار غير ظاهر كصفحة فعالة حاليًا.'
  ].join('\n');
}

function answerRelease(knowledge) {
  return [
    'حالة الموقع:',
    `- الاسم: ${knowledge.meta.name || 'تأمين 2026'}`,
    `- الإصدار: ${knowledge.releaseSummary.version || 'غير محدد'}`,
    `- الوضع: ${knowledge.meta.edition || 'Legacy Edition'}`,
    `- آخر وصف إصدار: ${knowledge.releaseSummary.mode || 'غير محدد'}`,
    `- الرادار: ${knowledge.pagesSummary.radarEnabled ? 'مفعّل كصفحة داخل الموقع' : 'غير مفعّل'}`,
    `- مصادر ظاهرة: ${knowledge.releaseSummary.sources.join('، ')}`
  ].join('\n');
}

function answerTopPlayer(knowledge) {
  const player = knowledge.playerStatsSummary.topPlayer;
  if (!player) return 'لا توجد إحصائيات لاعبين محفوظة حاليًا.';
  return [
    'أعلى لاعب تقييمًا حسب البيانات:',
    `- ${player.name}: تقييم ${player.rating}`,
    `- أهداف: ${player.goals ?? 0}`,
    `- أسيست: ${player.assists ?? 0}`,
    `- تصديات: ${player.saves ?? 0}`
  ].join('\n');
}

function answerWhatsapp(knowledge) {
  const match = knowledge.upcomingMatch;
  if (!match) return 'لا توجد مباراة قادمة حتى أبني رسالة واتساب دقيقة.';
  return [
    'رسالة واتساب جاهزة:',
    `يا شباب، المباراة القادمة: ${match.team1 || 'الفريق الأول'} ضد ${match.team2 || 'الفريق الثاني'}.`,
    `الموعد: ${match.dateLabel || formatDateFromMatch(match)} الساعة ${formatMatchTime(match)}.`,
    `المكان: ${match.location || 'غير محدد'}.`,
    match.note ? `ملاحظة: ${match.note}` : 'الحضور والجاهزية مهمين.'
  ].filter(Boolean).join('\n');
}

function answerQuickReport(knowledge) {
  const next = knowledge.upcomingMatch;
  const latest = knowledge.latestMatch;
  const top = knowledge.playerStatsSummary.topPlayer;
  return [
    'تقرير سريع لتأمين 2026:',
    next ? `- القادم: ${next.team1} ضد ${next.team2} بتاريخ ${next.dateLabel || formatDateFromMatch(next)}.` : '- لا توجد مباراة قادمة محفوظة.',
    latest ? `- آخر نتيجة: ${formatMatch(latest)}.` : '- لا توجد نتيجة أخيرة محفوظة.',
    top ? `- أعلى تقييم: ${top.name} (${top.rating}).` : '- لا توجد إحصائيات لاعبين.',
    `- الإصابات النشطة: ${knowledge.injuriesSummary.active.length}.`,
    `- صفحات الموقع المتاحة: ${knowledge.pagesSummary.available.length}.`
  ].join('\n');
}

function splitInjuries(items) {
  const active = [];
  const recovered = [];
  items.forEach(item => {
    if (isRecovered(item)) recovered.push(item);
    else active.push(item);
  });
  return { active, recovered };
}

function isRecovered(item) {
  const status = String(item?.status || '');
  const severity = String(item?.severity || '');
  const recovery = getDayTime(item?.recoveryDate);
  const expected = getDayTime(item?.expectedReturn);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return severity === 'healed' ||
    severity === 'recovery' ||
    status.includes('تعاف') ||
    (Number.isFinite(recovery) && recovery <= today.getTime()) ||
    (Number.isFinite(expected) && expected < today.getTime());
}

function getMatchTime(match) {
  if (!match) return Number.MAX_SAFE_INTEGER;
  if (match.dateISO) {
    const value = new Date(match.dateISO).getTime();
    if (Number.isFinite(value)) return value;
  }
  const key = String(match.dateKey || '');
  if (!/^\d{8}$/.test(key)) return Number.MAX_SAFE_INTEGER;
  const year = Number(key.slice(0, 4));
  const month = Number(key.slice(4, 6)) - 1;
  const day = Number(key.slice(6, 8));
  return new Date(year, month, day, Number(match.hour || 19), Number(match.minute || 0), 0, 0).getTime();
}

function getDayTime(value) {
  if (!value) return NaN;
  const date = new Date(`${value}T12:00:00`);
  return date.getTime();
}

function formatMatch(match) {
  return `${match.team1 || 'فريق'} ${match.score1 ?? '-'} - ${match.score2 ?? '-'} ${match.team2 || 'فريق'} (${match.dateLabel || formatDateFromMatch(match)})`;
}

function formatMatchTime(match) {
  const date = new Date(getMatchTime(match));
  const hourValue = Number.isFinite(Number(match?.hour)) ? Number(match.hour) : date.getHours();
  const minuteValue = Number.isFinite(Number(match?.minute)) ? Number(match.minute) : date.getMinutes();
  const hour = String(Number.isFinite(hourValue) ? hourValue : 0).padStart(2, '0');
  const minute = String(Number.isFinite(minuteValue) ? minuteValue : 0).padStart(2, '0');
  return `${hour}:${minute}`;
}

function formatDateFromMatch(match) {
  const time = getMatchTime(match);
  if (!Number.isFinite(time)) return 'غير محدد';
  return new Intl.DateTimeFormat('ar-PS', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(time));
}

function severityLabel(item, knowledge) {
  return knowledge.injuriesSummary.severityLabels[item.severity] || item.severity || 'غير محدد';
}

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/[^\u0600-\u06FFa-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasAny(text, keywords) {
  return keywords.some(keyword => text.includes(normalize(keyword)));
}

async function testBackendConnection() {
  if (!hasAIEndpoint()) {
    setConnectionStatus('local');
    toast('لا يوجد رابط Backend مضبوط، يعمل المساعد محليًا', { icon: 'fa-house-signal' });
    return;
  }

  setConnectionStatus('testing');
  const result = await testAIConnection();

  if (result.ok) {
    setConnectionStatus('online');
    toast('الاتصال بالمساعد الذكي شغال', { icon: 'fa-circle-check' });
  } else {
    setConnectionStatus('fallback');
    toast('تعذر الاتصال، سيعمل المساعد محليًا', { icon: 'fa-triangle-exclamation' });
    console.warn('[Taamen AI] Health check failed:', result.reason);
  }
}

function getCurrentPageContext() {
  const active = document.querySelector('section.page.active');
  if (!active) return 'unknown';
  const route = active.id || 'unknown';
  const label = ROUTE_LABELS.find(([id]) => id === route)?.[1] || route;
  return `${label} (#${route})`;
}

function introStatusMessage() {
  if (hasAIEndpoint()) {
    return 'المساعد الذكي جاهز للاتصال عبر Replit Backend، وسيعود للوضع المحلي تلقائيًا إذا تعذر الاتصال.';
  }

  return 'المساعد الذكي غير متصل حاليًا، لكن يمكن عرض ملخص محلي من بيانات الموقع.';
}

function localStatusMessage() {
  if (hasAIEndpoint()) {
    return 'تعذر الاتصال بالمساعد الذكي عبر Replit، لذلك سأستخدم الوضع المحلي من بيانات الموقع بدل تعطيل الصفحة.';
  }

  return 'المساعد الذكي غير متصل حاليًا، لكن يمكن عرض ملخص محلي من بيانات الموقع.';
}
