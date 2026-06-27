import { $, safeText } from './ui.js';

const SESSION_KEY = 'taamen.ai.session.v2';
const FLOAT_KEY = 'taamen.ai.floatState.v1';
const SOUND_KEY = 'taamen.ai.soundEnabled.v1';

const state = {
  bound: false,
  ui: 'hidden',
  userInteracted: false,
  soundEnabled: false,
  snapshot: null,
  audioContext: null
};

export function initAIFloatingChat() {
  if (state.bound) return;
  state.bound = true;
  state.ui = readFloatState();
  state.soundEnabled = getAiSoundEnabled();
  state.snapshot = readSnapshot();

  window.addEventListener('pointerdown', markInteracted, { once: true, passive: true });
  window.addEventListener('keydown', markInteracted, { once: true });
  document.addEventListener('taamen:ai-session-updated', event => {
    state.snapshot = event.detail || readSnapshot();
    renderFloatingChat();
  });
  document.addEventListener('taamen:route', event => {
    state.snapshot = readSnapshot();
    if (event.detail?.route === 'ai') renderFloatingChat();
    else renderFloatingChat();
  });
  document.addEventListener('taamen:site-data-cleared', () => {
    state.snapshot = null;
    renderFloatingChat();
  });
  window.addEventListener('storage', event => {
    if (event.key === SESSION_KEY || event.key === FLOAT_KEY) {
      state.snapshot = readSnapshot();
      state.ui = readFloatState();
      renderFloatingChat();
    }
  });

  renderFloatingChat();
}

export function setAiSoundEnabled(enabled) {
  state.soundEnabled = Boolean(enabled);
  try {
    localStorage.setItem(SOUND_KEY, state.soundEnabled ? '1' : '0');
  } catch (_) {
    // Sound preference is optional.
  }
}

export function getAiSoundEnabled() {
  try {
    return localStorage.getItem(SOUND_KEY) === '1';
  } catch (_) {
    return false;
  }
}

function renderFloatingChat() {
  const existing = $('#aiFloatingChat');
  const snapshot = state.snapshot || readSnapshot();
  const onAIPage = (document.body.dataset.route || '') === 'ai';
  const blocked = isOverlayBlocking();

  if (!snapshot?.hasConversation || onAIPage || blocked || state.ui === 'closed') {
    existing?.remove();
    return;
  }

  if (!existing) {
    const node = document.createElement('aside');
    node.id = 'aiFloatingChat';
    node.className = 'ai-floating-chat';
    node.setAttribute('aria-label', 'نافذة محادثة تأمين المصغرة');
    document.body.appendChild(node);
  }

  const node = $('#aiFloatingChat');
  if (!node) return;

  node.dataset.state = state.ui === 'minimized' ? 'minimized' : 'expanded';
  const minimized = node.dataset.state === 'minimized';
  const preview = snapshot.lastAssistantPreview || 'المحادثة جاهزة للمتابعة.';
  const provider = providerLabel(snapshot);

  node.innerHTML = minimized ? renderBubble(provider) : renderPanel(preview, provider);
  bindFloatingActions(node);
}

function renderPanel(preview, provider) {
  return `
    <div class="ai-float-panel" role="dialog" aria-label="متابعة محادثة تأمين">
      <div class="ai-float-head">
        <span class="ai-float-mark"><i class="fa-solid fa-brain"></i></span>
        <div>
          <strong>مساعد تأمين</strong>
          <small>${safeText(provider)}</small>
        </div>
        <button type="button" data-ai-float-sound aria-label="تبديل الصوت"><i class="fa-solid ${state.soundEnabled ? 'fa-volume-high' : 'fa-volume-xmark'}"></i></button>
        <button type="button" data-ai-float-minimize aria-label="تصغير"><i class="fa-solid fa-minus"></i></button>
        <button type="button" data-ai-float-close aria-label="إغلاق"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <p>${safeText(shortPreview(preview))}</p>
      <button class="primary-btn ai-float-continue" type="button" data-ai-float-open>
        <i class="fa-solid fa-comments"></i>
        متابعة المحادثة
      </button>
    </div>
  `;
}

function renderBubble(provider) {
  return `
    <button class="ai-float-bubble" type="button" data-ai-float-expand aria-label="فتح محادثة تأمين">
      <i class="fa-solid fa-brain"></i>
      <span>AI</span>
      <small>${safeText(provider)}</small>
    </button>
  `;
}

function bindFloatingActions(node) {
  node.addEventListener('click', event => {
    if (event.target.closest('[data-ai-float-open]')) {
      playUiSound('open');
      location.hash = '#ai';
      return;
    }

    if (event.target.closest('[data-ai-float-expand]')) {
      state.ui = 'expanded';
      writeFloatState(state.ui);
      playUiSound('open');
      renderFloatingChat();
      return;
    }

    if (event.target.closest('[data-ai-float-minimize]')) {
      state.ui = 'minimized';
      writeFloatState(state.ui);
      playUiSound('minimize');
      renderFloatingChat();
      return;
    }

    if (event.target.closest('[data-ai-float-close]')) {
      state.ui = 'closed';
      writeFloatState(state.ui);
      playUiSound('close');
      renderFloatingChat();
      return;
    }

    if (event.target.closest('[data-ai-float-sound]')) {
      setAiSoundEnabled(!state.soundEnabled);
      playUiSound('open');
      renderFloatingChat();
    }
  }, { once: true });
}

function readSnapshot() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SESSION_KEY) || '{}');
    const messages = Array.isArray(parsed.messages) ? parsed.messages : [];
    const lastAssistant = [...messages].reverse().find(message => message.role === 'assistant');
    return {
      hasConversation: messages.some(message => message.role === 'user'),
      messages,
      mode: lastAssistant?.meta?.mode || '',
      provider: lastAssistant?.meta?.provider || '',
      lastAssistantPreview: lastAssistant?.content || ''
    };
  } catch (_) {
    return null;
  }
}

function readFloatState() {
  try {
    const saved = localStorage.getItem(FLOAT_KEY);
    return ['expanded', 'minimized', 'closed'].includes(saved) ? saved : 'expanded';
  } catch (_) {
    return 'expanded';
  }
}

function writeFloatState(value) {
  try {
    localStorage.setItem(FLOAT_KEY, value);
  } catch (_) {
    // Floating state is optional.
  }
}

function providerLabel(snapshot) {
  if (snapshot?.provider === 'gemini' || snapshot?.mode === 'remote') return 'Gemini';
  return 'محلي';
}

function shortPreview(value) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return text.length > 135 ? `${text.slice(0, 135)}...` : text;
}

function markInteracted() {
  state.userInteracted = true;
}

function isOverlayBlocking() {
  return Boolean(
    $('#cookieSettingsOverlay') ||
    $('.cookie-modal-overlay') ||
    $('.security-modal[open]') ||
    $('.mobile-menu.open') ||
    document.body.classList.contains('nav-open') ||
    document.querySelector('[aria-modal="true"]')
  );
}

function playUiSound(type) {
  if (!state.soundEnabled || !state.userInteracted || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    state.audioContext ||= new AudioContext();
    const ctx = state.audioContext;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    const frequencies = { open: 520, minimize: 360, close: 240, send: 440, receive: 620 };
    oscillator.frequency.value = frequencies[type] || 420;
    oscillator.type = 'sine';
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.025, ctx.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.09);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.1);
  } catch (_) {
    // Browsers may block audio; the UI still works.
  }
}
