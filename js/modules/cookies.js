import { $, safeText, toast } from './ui.js';

const CONSENT_KEY = 'taamen.cookieConsent.v1';
const CONSENT_COOKIE = 'taamen_cookie_consent';
const COOKIE_DAYS = 180;
const TAAMEN_PREFIXES = ['taamen.', 'taamen_', 'TAAMEN_', 'taamen-legacy:'];

let initialized = false;
let escapeBound = false;
let lastFocused = null;

const defaultConsent = {
  version: 1,
  acceptedAt: '',
  necessary: true,
  preferences: false,
  experience: false,
  analytics: false
};

export function setCookie(name, value, days = COOKIE_DAYS) {
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax${secure}`;
}

export function getCookie(name) {
  const encoded = `${encodeURIComponent(name)}=`;
  const value = document.cookie
    .split(';')
    .map(part => part.trim())
    .find(part => part.startsWith(encoded))
    ?.slice(encoded.length) || '';
  return value ? decodeURIComponent(value) : '';
}

export function deleteCookie(name) {
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax${secure}`;
}

export function getConsent() {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== 1 || parsed.necessary !== true) return null;
    return { ...defaultConsent, ...parsed, analytics: false };
  } catch (error) {
    console.warn('Cookie consent read failed:', error);
    return null;
  }
}

export function saveConsent(consent = {}) {
  const { acceptAll = false, ...preferences } = consent;
  const next = {
    ...defaultConsent,
    ...preferences,
    version: 1,
    acceptedAt: new Date().toISOString(),
    necessary: true,
    analytics: false
  };

  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(next));
  } catch (error) {
    console.warn('Cookie consent save failed:', error);
  }

  const status = next.preferences || next.experience
    ? 'custom'
    : 'rejected_optional';
  setCookie(CONSENT_COOKIE, acceptAll ? 'accepted' : status);
  applyConsentPreferences(next);
  hideBanner();
  closeCookieSettings();
  document.dispatchEvent(new CustomEvent('taamen:cookie-consent', { detail: next }));
  return next;
}

export function hasConsent() {
  return Boolean(getConsent() || getCookie(CONSENT_COOKIE));
}

export function applyConsentPreferences(consent = getConsent()) {
  const next = consent || defaultConsent;
  document.documentElement.dataset.cookiePreferences = String(Boolean(next.preferences));
  document.documentElement.dataset.cookieExperience = String(Boolean(next.experience));
  document.documentElement.dataset.cookieAnalytics = 'false';
}

export function clearTaamenSiteData() {
  const removed = [];
  try {
    Object.keys(localStorage)
      .filter(key => TAAMEN_PREFIXES.some(prefix => key.startsWith(prefix)))
      .forEach(key => {
        localStorage.removeItem(key);
        removed.push(key);
      });
  } catch (error) {
    console.warn('Taamen data cleanup failed:', error);
  }

  deleteCookie(CONSENT_COOKIE);
  applyConsentPreferences(defaultConsent);
  showCookieBanner();
  document.dispatchEvent(new CustomEvent('taamen:site-data-cleared', { detail: { removed } }));
  return removed;
}

export function openCookieSettings() {
  renderSettingsModal();
}

export function initCookieConsent() {
  if (initialized) return;
  initialized = true;

  window.TaamenCookies = {
    setCookie,
    getCookie,
    deleteCookie,
    getConsent,
    saveConsent,
    hasConsent,
    clearTaamenSiteData,
    openCookieSettings,
    applyConsentPreferences
  };

  document.addEventListener('taamen:open-cookie-settings', openCookieSettings);
  applyConsentPreferences();
  if (!hasConsent()) showCookieBanner();
}

function showCookieBanner() {
  if (hasConsent() || $('#cookieConsentBanner')) return;

  const banner = document.createElement('aside');
  banner.id = 'cookieConsentBanner';
  banner.className = 'cookie-banner glass-panel';
  banner.setAttribute('aria-label', 'تنبيه ملفات الكوكيز والخصوصية');
  banner.innerHTML = `
    <div class="cookie-banner-copy">
      <strong><i class="fa-solid fa-cookie-bite"></i> خصوصية ملفات Cookies</strong>
      <p>تستخدم منصة تأمين ملفات Cookies والتخزين المحلي لحفظ تفضيلات بسيطة مثل اللغة وحالة الواجهة والموافقة على الخصوصية. لا يتم جمع كلمات مرور أو بيانات حساسة.</p>
    </div>
    <div class="cookie-banner-actions">
      <button class="primary-btn" type="button" data-cookie-action="accept-all">قبول الكل</button>
      <button class="ghost-btn" type="button" data-cookie-action="reject-optional">رفض الاختياري</button>
      <button class="ghost-btn" type="button" data-cookie-action="settings">إدارة الإعدادات</button>
    </div>
  `;

  banner.addEventListener('click', event => {
    const action = event.target.closest('[data-cookie-action]')?.dataset.cookieAction;
    if (!action) return;
    if (action === 'accept-all') saveConsent({ preferences: true, experience: true, analytics: false, acceptAll: true });
    if (action === 'reject-optional') saveConsent({ preferences: false, experience: false, analytics: false });
    if (action === 'settings') openCookieSettings();
  });

  document.body.appendChild(banner);
}

function hideBanner() {
  $('#cookieConsentBanner')?.remove();
}

function renderSettingsModal() {
  closeCookieSettings();
  lastFocused = document.activeElement;
  const consent = getConsent() || { ...defaultConsent, preferences: true, experience: true };

  const overlay = document.createElement('div');
  overlay.id = 'cookieSettingsOverlay';
  overlay.className = 'cookie-modal-overlay';
  overlay.innerHTML = `
    <section class="cookie-modal glass-panel" role="dialog" aria-modal="true" aria-labelledby="cookieSettingsTitle">
      <button class="cookie-modal-close" type="button" aria-label="إغلاق إعدادات الكوكيز" data-cookie-modal-close>
        <i class="fa-solid fa-xmark"></i>
      </button>
      <span class="eyebrow"><i class="fa-solid fa-sliders"></i> مركز الخصوصية</span>
      <h2 id="cookieSettingsTitle">إدارة تفضيلات الكوكيز</h2>
      <p>اختر ما تسمح بحفظه على هذا الجهاز. التحليلات غير مفعلة حاليًا، ولن يتم تشغيلها من هذه اللوحة.</p>
      <div class="cookie-toggle-list">
        ${toggleRow('necessary', 'ضرورية', 'تحفظ الموافقة الأساسية وتمنع تكرار التنبيه في كل زيارة.', true, true)}
        ${toggleRow('preferences', 'تفضيلات', 'اللغة، الثيم، وحالة بعض التنبيهات داخل الواجهة.', consent.preferences)}
        ${toggleRow('experience', 'تحسين التجربة', 'إعدادات عرض بسيطة ولا تشمل بيانات حساسة.', consent.experience)}
        ${toggleRow('analytics', 'تحليلات', 'غير مفعلة حاليًا في هذا المشروع الثابت.', false, false, true)}
      </div>
      <div class="cookie-modal-actions">
        <button class="primary-btn" type="button" data-cookie-modal-save>حفظ التفضيلات</button>
        <button class="ghost-btn" type="button" data-cookie-modal-reject>رفض الاختياري</button>
        <button class="ghost-btn" type="button" data-cookie-modal-accept>قبول الكل</button>
      </div>
    </section>
  `;

  overlay.addEventListener('click', event => {
    if (event.target === overlay || event.target.closest('[data-cookie-modal-close]')) closeCookieSettings();
    if (event.target.closest('[data-cookie-modal-reject]')) saveConsent({ preferences: false, experience: false, analytics: false });
    if (event.target.closest('[data-cookie-modal-accept]')) saveConsent({ preferences: true, experience: true, analytics: false, acceptAll: true });
    if (event.target.closest('[data-cookie-modal-save]')) {
      saveConsent({
        preferences: Boolean($('#cookieTogglePreferences')?.checked),
        experience: Boolean($('#cookieToggleExperience')?.checked),
        analytics: false
      });
      toast('تم حفظ تفضيلات الخصوصية', { icon: 'fa-shield-halved' });
    }
  });

  overlay.addEventListener('keydown', trapFocus);
  document.body.appendChild(overlay);
  bindEscape();
  overlay.querySelector('[data-cookie-modal-save]')?.focus();
}

function toggleRow(name, title, description, checked, disabled = false, inactive = false) {
  const id = `cookieToggle${name[0].toUpperCase()}${name.slice(1)}`;
  return `
    <label class="cookie-toggle-row ${inactive ? 'is-muted' : ''}" for="${safeText(id)}">
      <span>
        <strong>${safeText(title)}</strong>
        <small>${safeText(description)}</small>
      </span>
      <input id="${safeText(id)}" type="checkbox" ${checked ? 'checked' : ''} ${disabled || inactive ? 'disabled' : ''} />
      <i aria-hidden="true"></i>
    </label>
  `;
}

function closeCookieSettings() {
  $('#cookieSettingsOverlay')?.remove();
  if (lastFocused?.focus) lastFocused.focus();
  lastFocused = null;
}

function bindEscape() {
  if (escapeBound) return;
  escapeBound = true;
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeCookieSettings();
  });
}

function trapFocus(event) {
  if (event.key !== 'Tab') return;
  const focusable = [...event.currentTarget.querySelectorAll('button, input, [href], [tabindex]:not([tabindex="-1"])')]
    .filter(node => !node.disabled && node.offsetParent !== null);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}
