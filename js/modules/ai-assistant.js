import {
  security,
  tactics,
  roleOptions,
  instructionOptions,
  siteMeta,
  sources,
  teams,
  defaultPlayers,
  playerStats,
  upcomingMatches,
  matchArchive,
  guideSections
} from '../../data/site-data.js';
import { injuryCases, injuryMeta, injurySeverity } from '../../data/injuries-data.js';
import { $, safeText, copyText, toast } from './ui.js';
import { hasAIEndpoint, requestAIAnswer, testAIConnection } from './api-client.js';
import { AI_KNOWLEDGE_ENTRIES, AI_KNOWLEDGE_PACK } from './ai-knowledge-pack.js';
import { AI_SUGGESTION_GROUPS } from './ai-response-templates.js';
import { buildAIRequestPayload, generateLocalAnswer } from './ai-answer-engine.js';

const MEMORY_KEY = 'taamen.ai.session.v2';
const MAX_STORED_MESSAGES = 20;
const SUGGESTION_SOUND_ENABLED = false;

const ROUTE_LABELS = [
  ['home', 'الرئيسية', 'ملخص المنصة والعدادات السريعة'],
  ['match-center', 'المباراة القادمة', 'موعد المباراة القادمة وتفاصيلها'],
  ['archive', 'الأرشيف', 'نتائج المباريات السابقة'],
  ['ai', 'المساعد الذكي', 'مساعد تأمين الذكي'],
  ['radar', 'الرادار التكتيكي', 'خطط وتمركز لاعبي الخماسي'],
  ['security', 'مركز الحماية', 'خصوصية وأمان المنصة'],
  ['weather-prayer', 'الطقس والصلاة', 'الطقس ومواقيت الصلاة'],
  ['injuries', 'الإصابات', 'سجل الإصابات والحالات'],
  ['qibla', 'القبلة', 'اتجاه القبلة'],
  ['guide', 'دليل الاستخدام', 'شرح صفحات المنصة'],
  ['about', 'عن المنصة', 'هوية المنصة ومصادرها']
];

const INTENT_LABELS = {
  site_info: 'بيانات الموقع',
  next_match: 'المباراة',
  archive: 'الأرشيف',
  injuries: 'الإصابات',
  tactical: 'تكتيك',
  security: 'حماية',
  ai_help: 'مساعدة AI',
  writing: 'كتابة',
  study: 'دراسة',
  technical: 'تقنية',
  general: 'عام',
  unsafe_or_sensitive: 'حساس'
};

const SOURCE_LABELS = {
  'site-data': 'بيانات تأمين',
  'local-knowledge-pack': 'معرفة محلية',
  'local-rules': 'قواعد محلية',
  gemini: 'Gemini',
  backend: 'Backend',
  remote: 'AI خارجي'
};

const state = {
  bound: false,
  pending: false,
  messages: [],
  knowledge: null,
  memory: null,
  lastMode: hasAIEndpoint() ? 'ready' : 'local'
};

let suggestionAudioContext = null;

export function initAIAssistant() {
  const root = $('#aiAssistant');
  if (!root || state.bound) return;

  state.bound = true;
  state.memory = loadMemory();
  state.knowledge = buildSiteKnowledge();
  renderStatus();
  renderKnowledgeMeta();
  renderSuggestions();
  startChat();
  bindAIEvents();
}

export function buildSiteKnowledge() {
  const archived = [...matchArchive].sort((a, b) => Number(b.dateKey || 0) - Number(a.dateKey || 0));
  const upcoming = [...upcomingMatches].sort((a, b) => getMatchTime(a) - getMatchTime(b));
  const now = Date.now();
  const futureUpcoming = upcoming.find(match => getMatchTime(match) >= now) || upcoming[0] || null;
  const injuries = splitInjuries(injuryCases);
  const topPlayer = [...playerStats].sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))[0] || null;
  const availablePages = ROUTE_LABELS
    .filter(([id]) => Boolean(document.getElementById(id)))
    .map(([id, label, description]) => ({
      id,
      label: cleanRouteLabel(id, label),
      description: cleanRouteDescription(id, description),
      route: `#${id}`
    }));

  return {
    meta: {
      name: siteMeta.name,
      edition: siteMeta.edition,
      version: siteMeta.version,
      aiStatus: hasAIEndpoint() ? 'backend-ready' : 'local-fallback',
      lastUpdate: siteMeta.releaseMode,
      environment: location.hostname || 'local'
    },
    pages: availablePages,
    teams: { ...teams },
    nextMatch: formatNextMatch(futureUpcoming),
    archive: {
      total: matchArchive.length,
      latestMatch: archived[0] || null,
      recentMatches: archived.slice(0, 5),
      champions: summarizeArchiveChampions(matchArchive),
      summary: `${matchArchive.length} مباراة محفوظة`
    },
    injuries: {
      active: injuries.active.map(compactInjury),
      recovered: injuries.recovered.map(compactInjury).slice(0, 8),
      notes: injuryMeta.note,
      lastUpdated: injuryMeta.updatedAt
    },
    tactical: {
      available: Boolean(document.getElementById('radar')),
      formations: Object.values(tactics).map(item => ({
        id: item.id,
        name: item.name,
        description: item.description
      })),
      roles: roleOptions.filter(item => item.value).map(item => item.label),
      instructions: instructionOptions.filter(item => item.value).map(item => item.label),
      savedPlayersCount: defaultPlayers.length,
      notes: 'الرادار يعرض تمركزات خماسية قابلة للحفظ محليا.'
    },
    security: {
      status: security.status,
      privacyMode: security.privacyMode,
      emergencyMode: security.emergencyMode,
      cookiePolicy: { ...security.cookiePolicy },
      aiProtection: { ...security.aiProtection },
      lastReviewLabel: security.lastReviewLabel
    },
    ai: {
      mode: hasAIEndpoint() ? 'remote-with-local-fallback' : 'local-only',
      backendProvider: hasAIEndpoint() ? 'Replit proxy' : 'none',
      fallbackEnabled: true,
      capabilities: [
        'أسئلة تأمين من بيانات الموقع',
        'أسئلة عامة من حزمة معرفة محلية',
        'تقسيم الأسئلة المركبة',
        'رفض الطلبات الضارة',
        'رجوع محلي عند فشل الخادم'
      ],
      limitations: [
        'لا يخترع مباريات أو إصابات غير موجودة',
        'لا يقدم تشخيصا طبيا أو أدوية',
        'لا يقدم خطوات اختراق أو تجاوز'
      ]
    },
    playerStats: {
      total: playerStats.length,
      topPlayer,
      leaders: [...playerStats].sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0)).slice(0, 5)
    },
    quickFacts: [
      `${matchArchive.length} مباراة في الأرشيف`,
      `${injuries.active.length} إصابة نشطة`,
      `${availablePages.length} صفحة متاحة`,
      `${Object.keys(tactics).length} تشكيلات تكتيكية`,
      `${AI_KNOWLEDGE_PACK.categories.length} مجالات معرفة عامة`
    ],
    sources: sources.map(source => source.title)
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
    if (handleSuggestionClick(event)) return;
    handleSuggestionToggle(event);
  });

  suggestions?.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    closeAllSuggestionGroups();
  });

  window.addEventListener('resize', syncSuggestionPanelHeights, { passive: true });
  messages?.addEventListener('click', event => {
    if (handleSuggestionClick(event)) return;

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
      testBackendConnection();
      return;
    }

    const clearButton = event.target.closest('#aiClearChat');
    if (!clearButton) return;
    event.preventDefault();
    clearChat();
    toast('تم مسح محادثة المساعد', { icon: 'fa-eraser' });
  });
}

function handleSuggestionClick(event) {
  const button = event.target.closest('[data-suggestion-question], [data-ai-question]');
  const prompt = $('#aiPrompt');
  if (!button || !prompt) return false;
  playSuggestionUiSound('select');
  prompt.value = button.dataset.suggestionQuestion || button.dataset.aiQuestion || '';
  state.memory.lastSelectedCategory = button.dataset.aiCategory || '';
  saveMemory();
  prompt.focus();
  submitQuestion();
  return true;
}

function handleSuggestionToggle(event) {
  const button = event.target.closest('[data-suggestion-group-trigger], [data-ai-suggestion-toggle]');
  const host = $('#aiSuggestions');
  if (!button || !host) return false;

  const groupId = button.dataset.suggestionGroupTrigger || button.dataset.aiSuggestionToggle;
  toggleSuggestionGroup(groupId);
  return true;
}

function closeAllSuggestionGroups(exceptId = '') {
  const host = $('#aiSuggestions');
  if (!host) return;
  host.querySelectorAll('[data-suggestion-group-trigger], [data-ai-suggestion-toggle]').forEach(trigger => {
    const groupId = trigger.dataset.suggestionGroupTrigger || trigger.dataset.aiSuggestionToggle;
    if (exceptId && groupId === exceptId) return;
    closeSuggestionGroup(groupId, { silent: true });
  });
}

function openSuggestionGroup(groupId, options = {}) {
  const host = $('#aiSuggestions');
  const trigger = host?.querySelector(`[data-suggestion-group-trigger="${CSS.escape(groupId)}"]`);
  const panel = trigger ? document.getElementById(trigger.getAttribute('aria-controls')) : null;
  if (!trigger || !panel) return;

  closeAllSuggestionGroups(groupId);
  trigger.setAttribute('aria-expanded', 'true');
  panel.setAttribute('aria-hidden', 'false');
  panel.style.maxHeight = `${panel.scrollHeight}px`;
  trigger.closest('.ai-suggestion-group')?.classList.add('is-open', 'open');
  if (!options.silent) playSuggestionUiSound('open');
}

function closeSuggestionGroup(groupId, options = {}) {
  const host = $('#aiSuggestions');
  const trigger = host?.querySelector(`[data-suggestion-group-trigger="${CSS.escape(groupId)}"]`);
  const panel = trigger ? document.getElementById(trigger.getAttribute('aria-controls')) : null;
  if (!trigger || !panel) return;

  trigger.setAttribute('aria-expanded', 'false');
  panel.setAttribute('aria-hidden', 'true');
  panel.style.maxHeight = '0px';
  trigger.closest('.ai-suggestion-group')?.classList.remove('is-open', 'open');
  if (!options.silent) playSuggestionUiSound('close');
}

function toggleSuggestionGroup(groupId) {
  const trigger = $(`[data-suggestion-group-trigger="${CSS.escape(groupId)}"]`);
  const isOpen = trigger?.getAttribute('aria-expanded') === 'true';
  if (isOpen) closeSuggestionGroup(groupId);
  else openSuggestionGroup(groupId);
}

function syncSuggestionPanelHeights() {
  const host = $('#aiSuggestions');
  if (!host) return;
  host.querySelectorAll('.ai-suggestion-panel[aria-hidden="false"]').forEach(panel => {
    panel.style.maxHeight = `${panel.scrollHeight}px`;
  });
}

function playSuggestionUiSound(type = 'open') {
  if (!SUGGESTION_SOUND_ENABLED) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    suggestionAudioContext ||= new AudioContext();
    if (suggestionAudioContext.state === 'suspended') suggestionAudioContext.resume();

    const now = suggestionAudioContext.currentTime;
    const oscillator = suggestionAudioContext.createOscillator();
    const gain = suggestionAudioContext.createGain();
    const frequency = {
      open: 520,
      close: 320,
      select: 440
    }[type] || 420;

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, now);
    if (type === 'open') oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.18, now + 0.07);
    if (type === 'close') oscillator.frequency.exponentialRampToValueAtTime(Math.max(160, frequency * 0.78), now + 0.07);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(type === 'select' ? 0.018 : 0.024, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

    oscillator.connect(gain);
    gain.connect(suggestionAudioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.1);
  } catch (_) {
    // Browser audio restrictions should never affect the assistant UI.
  }
}

async function submitQuestion() {
  if (state.pending) return;
  const prompt = $('#aiPrompt');
  const value = String(prompt?.value || '').trim();
  if (!value) return;

  state.pending = true;
  addMessage('user', value);
  rememberQuestion(value);
  prompt.value = '';
  setTyping(true);

  const knowledge = buildSiteKnowledge();
  state.knowledge = knowledge;
  renderKnowledgeMeta();
  const pageContext = getCurrentPageContext();
  state.memory.currentPage = pageContext.label;

  try {
    const { payload, analysis, retrieval } = buildAIRequestPayload({
      question: value,
      siteKnowledge: knowledge,
      pageContext,
      conversationContext: state.memory
    });

    let result;
    const mustStayLocal = analysis.safetyLevel === 'unsafe' || analysis.medicalSensitive;

    if (mustStayLocal) {
      setConnectionStatus('local');
      result = generateLocalAnswer({ question: value, siteKnowledge: knowledge, analysis, retrieval });
    } else if (hasAIEndpoint()) {
      const remote = await requestAIAnswer(payload);
      if (remote.ok) {
        setConnectionStatus('online');
        state.memory.remoteRecentlySucceeded = true;
        result = {
          answer: remote.answer,
          mode: 'remote',
          provider: remote.provider,
          model: remote.model,
          intent: analysis.intent,
          topics: analysis.topics,
          sources: makeRemoteSources(remote, analysis, retrieval),
          followups: fallbackFollowups(analysis.intent),
          reason: ''
        };
      } else {
        setConnectionStatus('fallback');
        state.memory.remoteRecentlySucceeded = false;
        result = generateLocalAnswer({
          question: value,
          siteKnowledge: knowledge,
          analysis,
          retrieval,
          failureReason: remote.reason
        });
        console.warn('[Taamen AI] Backend unavailable, using local fallback:', remote.reason, remote);
      }
    } else {
      setConnectionStatus('local');
      result = generateLocalAnswer({ question: value, siteKnowledge: knowledge, analysis, retrieval });
    }

    addMessage('assistant', result.answer, result);
  } catch (error) {
    setConnectionStatus('fallback');
    const fallback = generateLocalAnswer({
      question: value,
      siteKnowledge: knowledge,
      failureReason: error?.message || 'LOCAL_ENGINE_ERROR'
    });
    addMessage('assistant', fallback.answer, fallback);
    console.warn('[Taamen AI] Local answer engine error:', error);
  } finally {
    setTyping(false);
    state.pending = false;
    saveMemory();
  }
}

function startChat() {
  state.messages = [];
  const messages = $('#aiMessages');
  if (messages) messages.innerHTML = '';
  if (state.memory?.messages?.length) {
    state.memory.messages.forEach(message => {
      addMessage(message.role, message.content, message.meta || {}, { skipMemory: true });
    });
    document.dispatchEvent(new CustomEvent('taamen:ai-session-updated', { detail: getConversationSnapshot() }));
    return;
  }
  addMessage('assistant', cleanIntroMessage(), {
    mode: hasAIEndpoint() ? 'ready' : 'local',
    provider: 'taamen-local',
    intent: 'ai_help',
    topics: ['taamen', 'general'],
    sources: ['site-data', 'local-knowledge-pack'],
    followups: ['متى المباراة القادمة؟', 'اشرحلي توزيع 1-2-1', 'اكتب إعلان واتساب قصير']
  }, { skipMemory: true });
}

function clearChat() {
  state.memory = emptyMemory();
  localStorage.removeItem(MEMORY_KEY);
  startChat();
  document.dispatchEvent(new CustomEvent('taamen:ai-session-updated', { detail: getConversationSnapshot() }));
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
      text: 'تعذر الاتصال، تم الرجوع للمحلي'
    },
    local: {
      icon: 'fa-house-signal',
      text: 'يعمل محليا'
    },
    testing: {
      icon: 'fa-spinner fa-spin',
      text: 'يتم اختبار الاتصال'
    }
  };

  const cleanStatusText = {
    ready: 'جاهز للاتصال بالذكاء الاصطناعي',
    online: 'متصل بالذكاء الاصطناعي',
    fallback: 'تعذر الاتصال، تم الرجوع للمحلي',
    local: 'يعمل محليا',
    testing: 'يتم اختبار الاتصال'
  };
  const current = { ...(map[mode] || map.local), text: cleanStatusText[mode] || cleanStatusText.local };
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
  node.textContent = `${knowledge.archive.total} مباراة محفوظة - ${knowledge.injuries.active.length} إصابة نشطة - ${AI_KNOWLEDGE_ENTRIES.length} مقطع معرفة محلي`;
}

function renderSuggestions() {
  const host = $('#aiSuggestions');
  if (!host) return;
  const openFirst = !window.matchMedia('(max-width: 520px)').matches;
  host.innerHTML = `
    <div class="ai-suggestions-quick-head">
      <span><i class="fa-solid fa-bolt"></i> وصول سريع</span>
      <small>اختر نوع السؤال وافتح مجموعة واحدة فقط</small>
    </div>
    <div class="ai-suggestions-accordion ai-suggestion-accordion" role="list">
      ${AI_SUGGESTION_GROUPS.map((group, index) => {
        const panelId = `aiSuggestionPanel-${safeText(group.id)}`;
        const triggerId = `aiSuggestionTrigger-${safeText(group.id)}`;
        const open = openFirst && index === 0;
        return `
        <article class="ai-suggestion-group ${open ? 'is-open open' : ''}" role="listitem">
          <button id="${triggerId}" class="ai-suggestion-trigger ai-suggestion-group-toggle" type="button" aria-expanded="${open}" aria-controls="${panelId}" data-suggestion-group-trigger="${safeText(group.id)}" data-ai-suggestion-toggle="${safeText(group.id)}">
            <span class="ai-suggestion-group-icon"><i class="fa-solid ${safeText(group.icon || 'fa-sparkles')}"></i></span>
            <span>
              <strong>${safeText(group.title || group.label)}</strong>
              <small>${safeText(group.description || '')}</small>
            </span>
            <b>${Number(group.questions?.length || 0)}</b>
            <i class="fa-solid fa-chevron-down ai-suggestion-arrow" aria-hidden="true"></i>
          </button>
          <div class="ai-suggestion-panel" id="${panelId}" role="region" aria-labelledby="${triggerId}" aria-hidden="${!open}" style="max-height:${open ? '420px' : '0px'}">
            <div class="ai-suggestion-options ai-suggestion-group-list">
              ${(group.questions || []).slice(0, 12).map(question => `
                <button class="ai-suggestion-chip" data-ai-category="${safeText(group.id)}" data-suggestion-question="${safeText(question)}" data-ai-question="${safeText(question)}" type="button">
                  <span>${safeText(question)}</span>
                </button>
              `).join('')}
            </div>
          </div>
        </article>
      `;
      }).join('')}
    </div>
  `;
  requestAnimationFrame(syncSuggestionPanelHeights);
}

function addMessage(role, content, meta = {}, options = {}) {
  const messages = $('#aiMessages');
  if (!messages) return;

  const index = state.messages.push({ role, content, meta }) - 1;
  const node = document.createElement('article');
  node.className = `ai-message ${role === 'user' ? 'from-user' : 'from-assistant'}`;
  node.innerHTML = `
    <div class="ai-message-avatar">
      <i class="fa-solid ${role === 'user' ? 'fa-user' : 'fa-brain'}"></i>
    </div>
    <div class="ai-message-body">
      ${renderMessageText(content)}
      ${role === 'assistant' ? renderAssistantMeta(meta, index) : ''}
    </div>
  `;
  messages.appendChild(node);
  messages.scrollTop = messages.scrollHeight;

  if (!options.skipMemory) {
    rememberMessage(role, content, meta);
    if (role === 'assistant') rememberAnswer(content, meta.intent);
    saveMemory();
    document.dispatchEvent(new CustomEvent('taamen:ai-session-updated', { detail: getConversationSnapshot() }));
  }
}

function renderMessageText(content) {
  const html = safeText(content)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
  return `<p>${html}</p>`;
}

function renderAssistantMeta(meta, index) {
  const intent = cleanIntentLabel(meta.intent);
  const provider = meta.provider || (meta.mode === 'remote' ? 'remote' : 'taamen-local');
  const sourceBadges = [...new Set([provider, ...(meta.sources || [])])].filter(Boolean);
  const topics = Array.isArray(meta.topics) ? meta.topics : [];
  const followups = Array.isArray(meta.followups) ? meta.followups.slice(0, 3) : [];

  return `
    <div class="ai-message-meta">
      <span class="ai-source-badge">${safeText(meta.mode === 'remote' ? 'AI خارجي' : 'محلي')}</span>
      <span class="ai-source-badge">${safeText(intent)}</span>
      ${meta.model ? `<span class="ai-source-badge">${safeText(meta.model)}</span>` : ''}
      ${sourceBadges.slice(0, 4).map(source => `<span class="ai-source-badge">${safeText(cleanSourceLabel(source))}</span>`).join('')}
    </div>
    ${topics.length ? `<div class="ai-topic-row">${topics.slice(0, 5).map(topic => `<span>${safeText(topic)}</span>`).join('')}</div>` : ''}
    ${followups.length ? `
      <div class="ai-followups">
        ${followups.map(question => `<button type="button" data-ai-question="${safeText(question)}">${safeText(question)}</button>`).join('')}
      </div>
    ` : ''}
    <div class="ai-message-actions">
      <button type="button" data-ai-copy="${index}"><i class="fa-solid fa-copy"></i> نسخ</button>
      <button type="button" data-ai-share="${index}"><i class="fa-solid fa-share-nodes"></i> مشاركة</button>
    </div>
  `;
}

function cleanRouteLabel(id, fallback = '') {
  const labels = {
    home: 'الرئيسية',
    'match-center': 'المباراة القادمة',
    archive: 'الأرشيف',
    ai: 'المساعد الذكي',
    radar: 'الرادار التكتيكي',
    security: 'مركز الحماية',
    'weather-prayer': 'الطقس والصلاة',
    injuries: 'الإصابات',
    qibla: 'القبلة',
    guide: 'دليل الاستخدام',
    about: 'عن المنصة'
  };
  return labels[id] || fallback;
}

function cleanRouteDescription(id, fallback = '') {
  const descriptions = {
    home: 'ملخص المنصة والعدادات السريعة',
    'match-center': 'موعد المباراة القادمة وتفاصيلها',
    archive: 'نتائج المباريات السابقة',
    ai: 'مساعد تأمين الذكي',
    radar: 'خطط وتمركز لاعبي الخماسي',
    security: 'خصوصية وأمان المنصة',
    'weather-prayer': 'الطقس ومواقيت الصلاة',
    injuries: 'سجل الإصابات والحالات',
    qibla: 'اتجاه القبلة',
    guide: 'شرح صفحات المنصة',
    about: 'هوية المنصة ومصادرها'
  };
  return descriptions[id] || fallback;
}

function cleanIntentLabel(intent) {
  const labels = {
    greeting: 'تحية',
    smalltalk: 'حديث خفيف',
    site_info: 'بيانات تأمين',
    next_match: 'المباراة',
    archive: 'الأرشيف',
    injuries: 'الإصابات',
    tactical: 'تكتيك',
    security: 'حماية',
    cookies_privacy: 'كوكيز وخصوصية',
    ai_help: 'مساعدة AI',
    writing: 'كتابة',
    sports_general: 'رياضة',
    daily_life: 'عام',
    study: 'دراسة',
    technical: 'تقنية',
    planning: 'تخطيط',
    comparison: 'مقارنة',
    multi_topic: 'مختلط',
    unsafe_or_sensitive: 'حساس',
    unknown: 'غير واضح'
  };
  return labels[intent] || 'عام';
}

function cleanSourceLabel(source) {
  const labels = {
    'site-data': 'بيانات تأمين',
    'local-templates': 'قوالب محلية',
    'local-knowledge-pack': 'معرفة عامة',
    'local-rules': 'قواعد محلية',
    'taamen-local': 'محلي',
    backend: 'Backend',
    gemini: 'Gemini',
    remote: 'AI خارجي'
  };
  return labels[source] || source;
}

function setTyping(show) {
  const typing = $('#aiTyping');
  const button = $('#aiForm button[type="submit"]');
  const prompt = $('#aiPrompt');
  if (typing) typing.hidden = !show;
  if (button) button.disabled = show;
  if (prompt) prompt.disabled = show;
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

async function testBackendConnection() {
  if (!hasAIEndpoint()) {
    setConnectionStatus('local');
    toast('لا يوجد رابط Backend مضبوط، يعمل المساعد محليا', { icon: 'fa-house-signal' });
    return;
  }

  setConnectionStatus('testing');
  const result = await testAIConnection();

  if (result.ok) {
    setConnectionStatus('online');
    toast('الاتصال بالمساعد الذكي شغال', { icon: 'fa-circle-check' });
  } else {
    setConnectionStatus('fallback');
    toast('تعذر الاتصال، سيعمل المساعد محليا', { icon: 'fa-triangle-exclamation' });
    console.warn('[Taamen AI] Health check failed:', result.reason, result);
  }
}

function getCurrentPageContext() {
  const active = document.querySelector('section.page.active') || document.querySelector('section.page:not([hidden])');
  const route = active?.id || 'unknown';
  const found = ROUTE_LABELS.find(([id]) => id === route);
  return {
    id: route,
    label: cleanRouteLabel(route, found?.[1] || route),
    title: active?.dataset?.pageTitle || cleanRouteLabel(route, found?.[1] || route),
    route: route === 'unknown' ? '' : `#${route}`
  };
}

function cleanIntroMessage() {
  const endpoint = hasAIEndpoint()
    ? 'أستخدم الخادم الذكي عند توفره، وأرجع للمحلي إذا تعذر الاتصال.'
    : 'أعمل محليا الآن بدون خادم خارجي.';
  return [
    'أهلا، أنا مساعد تأمين.',
    endpoint,
    'اسألني عن المباراة، الأرشيف، الرادار، الحماية، الكوكيز، أو أي سؤال عام مثل الكتابة والدراسة والتقنية.'
  ].join('\n');
}

function introMessage() {
  const endpoint = hasAIEndpoint()
    ? 'أحاول استخدام الخادم الذكي عند توفره، وأرجع محليا إذا تعذر الاتصال.'
    : 'أعمل محليا الآن بدون خادم خارجي.';
  return [
    'أهلا، أنا مساعد تأمين.',
    endpoint,
    'أستطيع الإجابة عن بيانات الموقع الرسمية، وأيضا عن أسئلة عامة مثل الكتابة، الدراسة، التقنية، والتكتيك، مع فصل واضح بين المصدرين.'
  ].join('\n');
}

function makeRemoteSources(remote, analysis, retrieval) {
  const sources = Array.isArray(remote.sources) ? remote.sources : [];
  if (remote.provider) sources.push(remote.provider);
  if (analysis.needsSiteData) sources.push('site-data');
  if (retrieval.entries.length) sources.push('local-knowledge-pack');
  return [...new Set(sources)];
}

function fallbackFollowups(intent) {
  const map = {
    next_match: ['اكتب رسالة واتساب للمباراة', 'ما آخر مباراة في الأرشيف؟'],
    archive: ['اعطني ملخص آخر 5 مباريات', 'من أعلى لاعب تقييما؟'],
    injuries: ['ما الحالات المتعافية؟', 'اكتب تنبيه إصابة بدون تشخيص'],
    tactical: ['اشرح توزيع 1-2-1', 'كيف نمنع المرتدات؟'],
    security: ['كيف أبلغ عن رابط مشبوه؟', 'ما فائدة الكوكيز؟'],
    writing: ['اختصرها أكثر', 'حولها لرسالة واتساب'],
    study: ['حولها لخطة دراسة', 'اشرحها بمثال'],
    technical: ['اشرح الفرق بين frontend و backend', 'كيف أحمي مفتاح API؟'],
    general: ['حولها لخطة عملية', 'اعطني نسخة مختصرة']
  };
  return map[intent] || map.general;
}

function formatNextMatch(match) {
  if (!match) return null;
  return {
    id: match.id,
    title: match.title,
    team1: match.team1,
    team2: match.team2,
    location: match.location,
    dateLabel: match.dateLabel,
    day: match.dateLabel || formatDateFromMatch(match),
    time: formatMatchTime(match),
    teams: [match.team1, match.team2].filter(Boolean),
    rules: match.scheduleStatus || '',
    notes: match.note || '',
    heatLabel: match.heatLabel || ''
  };
}

function summarizeArchiveChampions(matches) {
  const scores = new Map();
  matches.forEach(match => {
    const score1 = Number(match.score1);
    const score2 = Number(match.score2);
    if (!Number.isFinite(score1) || !Number.isFinite(score2) || score1 === score2) return;
    const winner = score1 > score2 ? match.team1 : match.team2;
    if (!winner) return;
    scores.set(winner, (scores.get(winner) || 0) + 1);
  });
  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, wins]) => ({ name, wins }));
}

function compactInjury(item) {
  return {
    id: item.id,
    player: item.player,
    caseName: item.caseName,
    severity: item.severity,
    severityLabel: injurySeverity[item.severity]?.label || item.severity || '',
    status: item.status,
    expectedReturn: item.expectedReturn,
    recoveryDate: item.recoveryDate,
    effect: item.effect
  };
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

function loadMemory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(MEMORY_KEY) || '{}');
    return {
      ...emptyMemory(),
      ...parsed,
      lastQuestions: Array.isArray(parsed.lastQuestions) ? parsed.lastQuestions.slice(0, 10) : [],
      lastAnswerSummaries: Array.isArray(parsed.lastAnswerSummaries) ? parsed.lastAnswerSummaries.slice(0, 10) : [],
      messages: Array.isArray(parsed.messages) ? parsed.messages.slice(-MAX_STORED_MESSAGES) : []
    };
  } catch (_) {
    return emptyMemory();
  }
}

function emptyMemory() {
  return {
    version: 2,
    lastQuestions: [],
    lastAnswerSummaries: [],
    messages: [],
    currentPage: '',
    lastSelectedCategory: '',
    lastIntent: '',
    remoteRecentlySucceeded: false
  };
}

function rememberQuestion(question) {
  state.memory.lastQuestions = uniqueRecent([sanitizeMemoryText(question), ...state.memory.lastQuestions], 10);
}

function rememberMessage(role, content, meta = {}) {
  state.memory.messages = [
    ...(state.memory.messages || []),
    {
      role,
      content: sanitizeMemoryText(content),
      meta: {
        mode: meta.mode || '',
        provider: meta.provider || '',
        intent: meta.intent || '',
        intentLabel: meta.intentLabel || '',
        answerLength: meta.answerLength || '',
        sources: Array.isArray(meta.sources) ? meta.sources.slice(0, 5) : []
      },
      savedAt: new Date().toISOString()
    }
  ].slice(-MAX_STORED_MESSAGES);
}

function rememberAnswer(answer, intent = '') {
  state.memory.lastAnswerSummaries = uniqueRecent([sanitizeMemoryText(answer).slice(0, 220), ...state.memory.lastAnswerSummaries], 10);
  state.memory.lastIntent = intent || state.memory.lastIntent;
}

function saveMemory() {
  try {
    state.memory.messages = (state.memory.messages || []).slice(-MAX_STORED_MESSAGES);
    localStorage.setItem(MEMORY_KEY, JSON.stringify(state.memory));
  } catch (_) {
    // Ignore storage failures; the assistant still works without memory.
  }
}

function sanitizeMemoryText(value) {
  return String(value || '')
    .replace(/(password|secret|token)\s*[:=]\s*\S+/gi, '$1=[محذوف]')
    .replace(/(كلمة مرور|مفتاح|سر)\s*[:=]\s*\S+/gi, '$1=[محذوف]')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500);
}

function uniqueRecent(items, limit) {
  return [...new Set(items.filter(Boolean))].slice(0, limit);
}

function getConversationSnapshot() {
  const messages = (state.memory?.messages || []).slice(-MAX_STORED_MESSAGES);
  const lastAssistant = [...messages].reverse().find(message => message.role === 'assistant');
  return {
    key: MEMORY_KEY,
    hasConversation: messages.some(message => message.role === 'user'),
    route: document.body.dataset.route || '',
    mode: state.lastMode,
    lastAssistantPreview: lastAssistant?.content || '',
    messages
  };
}
