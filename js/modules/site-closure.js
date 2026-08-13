export const TIME_ZONE = 'Asia/Jerusalem';
export const CLOSURE_START = '2026-09-01';
export const REOPEN_DATE = '2027-01-07';

export const SITE_PHASES = {
  NORMAL: 'NORMAL',
  ANNOUNCEMENT: 'ANNOUNCEMENT',
  CLOSED: 'CLOSED',
  RETURN: 'RETURN'
};

const NOTICE_SESSION_KEY = 'taamen.lifecycle.notice.seen.v1';
const RETURN_SESSION_KEY = 'taamen.lifecycle.return.seen.v1';
const DEV_TEST_ENABLE_KEY = 'taamen.lifecycle.dev.enabled';
const ROOT_ID = 'siteLifecycleRoot';
const NOTICE_ID = 'siteAnnouncementOverlay';
const COUNTDOWN_INTERVAL_MS = 1000;

const DATE_LABELS = {
  closureEnglish: 'September 1, 2026',
  reopenEnglish: 'January 7, 2027',
  closureArabic: '1 سبتمبر 2026',
  reopenArabic: '7 يناير 2027'
};

const formatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23'
});

const closureTargetMs = zonedDateStringToUtcMs(CLOSURE_START);
const reopenTargetMs = zonedDateStringToUtcMs(REOPEN_DATE);
let phaseWatcher = null;
let routeBlockListenerBound = false;
let developerClock = null;

export function getSitePhase(options = {}) {
  const includeAnnouncement = options.includeAnnouncement === true;
  const includeReturn = options.includeReturn !== false;
  const override = getDeveloperPhaseOverride();

  if (override) {
    if (override === SITE_PHASES.ANNOUNCEMENT && hasSessionFlag(NOTICE_SESSION_KEY)) return SITE_PHASES.NORMAL;
    if (override === SITE_PHASES.RETURN && hasSessionFlag(RETURN_SESSION_KEY)) return SITE_PHASES.NORMAL;
    return override;
  }

  const datePhase = getLifecycleDatePhase(options.now);
  if (datePhase === SITE_PHASES.NORMAL) {
    return includeAnnouncement && !hasSessionFlag(NOTICE_SESSION_KEY)
      ? SITE_PHASES.ANNOUNCEMENT
      : SITE_PHASES.NORMAL;
  }

  if (datePhase === SITE_PHASES.RETURN) {
    return includeReturn && !hasSessionFlag(RETURN_SESSION_KEY)
      ? SITE_PHASES.RETURN
      : SITE_PHASES.NORMAL;
  }

  return datePhase;
}

export function getLifecycleDatePhase(now = getEffectiveNow()) {
  const current = zonedComparable(now);
  const closure = dateStringComparable(CLOSURE_START);
  const reopen = dateStringComparable(REOPEN_DATE);
  if (current < closure) return SITE_PHASES.NORMAL;
  if (current < reopen) return SITE_PHASES.CLOSED;
  return SITE_PHASES.RETURN;
}

export function getLifecycleDatePhaseForWallTime(value) {
  const date = parseZonedWallTime(value);
  if (!date) throw new Error(`Invalid lifecycle wall time: ${value}`);
  return getLifecycleDatePhase(date);
}

export function getTimeRemaining(targetDateString, now = getEffectiveNow()) {
  const targetMs = targetDateString === CLOSURE_START ? closureTargetMs : zonedDateStringToUtcMs(targetDateString);
  return splitDuration(targetMs - now.getTime());
}

export function getClosureSystemSnapshot(now = getEffectiveNow()) {
  return {
    phase: getSitePhase({ now, includeAnnouncement: true, includeReturn: true }),
    datePhase: getLifecycleDatePhase(now),
    timeZone: TIME_ZONE,
    closureStart: CLOSURE_START,
    reopenDate: REOPEN_DATE,
    closureTargetMs,
    reopenTargetMs,
    currentParts: getZonedParts(now),
    labels: { ...DATE_LABELS },
    testMode: Boolean(getDeveloperPhaseOverride() || getDeveloperNowOverride())
  };
}

export function isNormalNavigationAllowed() {
  const phase = getSitePhase({ includeAnnouncement: false, includeReturn: true });
  return phase !== SITE_PHASES.CLOSED && phase !== SITE_PHASES.RETURN;
}

export function initSiteLifecycle() {
  const phase = getSitePhase({ includeAnnouncement: true, includeReturn: true });
  document.body.dataset.sitePhase = phase.toLowerCase();
  bindRouteBlockListener();
  setNormalShellHidden(false);

  if (phase === SITE_PHASES.CLOSED) {
    renderClosureScreen();
    startLifecycleWatcher();
    return { phase, blockNormalBoot: true, delayNormalBoot: false, ready: Promise.resolve() };
  }

  if (phase === SITE_PHASES.RETURN) {
    const ready = renderReturnExperience();
    return { phase, blockNormalBoot: false, delayNormalBoot: true, ready };
  }

  if (phase === SITE_PHASES.ANNOUNCEMENT) {
    renderAnnouncement();
  }

  startLifecycleWatcher();
  return { phase, blockNormalBoot: false, delayNormalBoot: false, ready: Promise.resolve() };
}

function renderAnnouncement() {
  if (document.getElementById(NOTICE_ID)) return;
  const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const overlay = document.createElement('div');
  overlay.id = NOTICE_ID;
  overlay.className = 'site-announcement-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'siteAnnouncementTitle');
  overlay.innerHTML = `
    <div class="site-life-particles" aria-hidden="true">${particleSpans(14)}</div>
    <section class="site-announcement-panel" tabindex="-1">
      <div class="site-life-logo-ring" aria-hidden="true">
        <img src="assets/favicon.png" alt="" />
      </div>
      <span class="site-life-kicker">Official Notice / إشعار رسمي</span>
      <h2 id="siteAnnouncementTitle">Important Administrative Notice</h2>
      <p>Taamen will be temporarily closed starting September 1, 2026 as part of ongoing development, restructuring, and system improvements.</p>
      <p class="site-life-arabic">سيتم إغلاق تأمين مؤقتاً ابتداءً من 1 سبتمبر 2026 ضمن أعمال التطوير وإعادة الهيكلة وتحسين النظام.</p>
      <div class="site-life-date-grid">
        <div>
          <span>Closure date</span>
          <strong>${DATE_LABELS.closureEnglish}</strong>
          <small>${DATE_LABELS.closureArabic}</small>
        </div>
        <div>
          <span>Reopening date</span>
          <strong>${DATE_LABELS.reopenEnglish}</strong>
          <small>${DATE_LABELS.reopenArabic}</small>
        </div>
      </div>
      <div class="site-life-countdown" data-countdown="closure" aria-label="Countdown until closure">
        ${countdownCells()}
      </div>
      <button id="siteAnnouncementConfirm" class="site-life-primary-btn" type="button">Understood</button>
    </section>
  `;
  document.body.appendChild(overlay);
  document.body.classList.add('site-announcement-open');
  bindCountdown(overlay, CLOSURE_START);

  const panel = overlay.querySelector('.site-announcement-panel');
  const button = overlay.querySelector('#siteAnnouncementConfirm');
  requestAnimationFrame(() => {
    overlay.classList.add('is-visible');
    button?.focus({ preventScroll: true });
  });

  const close = () => {
    setSessionFlag(NOTICE_SESSION_KEY);
    overlay.classList.add('is-closing');
    document.body.classList.remove('site-announcement-open');
    window.setTimeout(() => {
      overlay.remove();
      previousFocus?.focus?.({ preventScroll: true });
      document.body.dataset.sitePhase = SITE_PHASES.NORMAL.toLowerCase();
    }, reducedMotion() ? 80 : 260);
  };

  button?.addEventListener('click', close);
  overlay.addEventListener('keydown', event => {
    if (event.key === 'Escape') close();
    if (event.key !== 'Tab') return;
    trapFocus(event, panel);
  });
}

function renderClosureScreen() {
  clearLifecycleRoot();
  setNormalShellHidden(true);
  document.body.classList.add('site-lifecycle-locked');
  document.body.dataset.sitePhase = SITE_PHASES.CLOSED.toLowerCase();
  document.title = 'Taamen 2026 is Temporarily Closed';

  const root = document.createElement('main');
  root.id = ROOT_ID;
  root.className = 'site-closure-screen';
  root.setAttribute('aria-label', 'Taamen temporary closure');
  root.setAttribute('tabindex', '-1');
  root.innerHTML = `
    <div class="site-life-particles" aria-hidden="true">${particleSpans(22)}</div>
    <div class="site-closure-lightlines" aria-hidden="true"><span></span><span></span><span></span></div>
    <div class="site-closure-football" aria-hidden="true"><i class="fa-solid fa-futbol"></i></div>
    <section class="site-closure-card">
      <div class="site-life-logo-ring site-life-logo-ring-large" aria-hidden="true">
        <img src="assets/favicon.png" alt="" />
      </div>
      <span class="site-life-kicker">Taamen Lifecycle / دورة تأمين</span>
      <h1>Taamen 2026 is Temporarily Closed</h1>
      <p>Taamen is currently unavailable while the system undergoes development, restructuring, and improvements.</p>
      <div class="site-life-reopen-block">
        <span>Reopening</span>
        <strong>${DATE_LABELS.reopenEnglish}</strong>
        <small>${DATE_LABELS.reopenArabic}</small>
      </div>
      <div class="site-life-countdown site-life-countdown-closure" data-countdown="reopen" aria-label="Countdown until reopening">
        ${countdownCells()}
      </div>
      <div class="site-life-status-grid">
        <div><span>System status</span><strong>Temporarily Closed</strong></div>
        <div><span>Current phase</span><strong>Development &amp; Restructuring</strong></div>
        <div><span>Reopening</span><strong>${DATE_LABELS.reopenEnglish}</strong></div>
      </div>
    </section>
  `;
  document.body.appendChild(root);
  bindCountdown(root, REOPEN_DATE, () => {
    renderReturnExperience({ reloadAfter: true });
  });
  root.focus({ preventScroll: true });
}

function renderReturnExperience(options = {}) {
  clearLifecycleRoot();
  setNormalShellHidden(true);
  document.body.classList.add('site-lifecycle-returning');
  document.body.dataset.sitePhase = SITE_PHASES.RETURN.toLowerCase();
  document.title = 'Taamen is back';

  const root = document.createElement('div');
  root.id = ROOT_ID;
  root.className = 'site-return-screen';
  root.setAttribute('role', 'status');
  root.setAttribute('aria-live', 'polite');
  root.innerHTML = `
    <div class="site-return-light" aria-hidden="true"></div>
    <div class="site-return-trails" aria-hidden="true"><span></span><span></span><span></span></div>
    <div class="site-return-logo" aria-hidden="true"><img src="assets/favicon.png" alt="" /></div>
    <div class="site-return-ball" aria-hidden="true"><i class="fa-solid fa-futbol"></i></div>
    <div class="site-return-copy">
      <strong>Taamen is back.</strong>
      <span>A new version. A different experience.</span>
    </div>
  `;
  document.body.appendChild(root);

  const duration = reducedMotion() ? 500 : 2200;
  return new Promise(resolve => {
    window.setTimeout(() => {
      setSessionFlag(RETURN_SESSION_KEY);
      root.classList.add('is-leaving');
      window.setTimeout(() => {
        root.remove();
        document.body.classList.remove('site-lifecycle-returning', 'site-lifecycle-locked');
        document.body.dataset.sitePhase = SITE_PHASES.NORMAL.toLowerCase();
        setNormalShellHidden(false);
        if (options.reloadAfter) {
          location.hash = '#home';
          location.reload();
          return;
        }
        resolve();
      }, reducedMotion() ? 80 : 360);
    }, duration);
  });
}

function setNormalShellHidden(hidden) {
  ['.main-header', '.app-shell'].forEach(selector => {
    const node = document.querySelector(selector);
    if (!node) return;
    if (hidden) node.setAttribute('aria-hidden', 'true');
    else node.removeAttribute('aria-hidden');
  });
}

function startLifecycleWatcher() {
  if (phaseWatcher) return;
  phaseWatcher = window.setInterval(() => {
    const phase = getSitePhase({ includeAnnouncement: false, includeReturn: true });
    if (phase === SITE_PHASES.CLOSED && !document.getElementById(ROOT_ID)) {
      renderClosureScreen();
    }
  }, 30000);
}

function bindCountdown(root, targetDateString, onComplete) {
  const host = root.querySelector('[data-countdown]');
  if (!host) return;
  let completed = false;
  const update = () => {
    const remaining = targetDateString === REOPEN_DATE
      ? splitDuration(reopenTargetMs - getEffectiveNow().getTime())
      : getTimeRemaining(targetDateString);
    updateCountdownCells(host, remaining);
    if (remaining.total <= 0 && typeof onComplete === 'function' && !completed) {
      completed = true;
      onComplete();
    }
  };
  update();
  const timer = window.setInterval(() => {
    if (!document.body.contains(root)) {
      window.clearInterval(timer);
      return;
    }
    update();
  }, COUNTDOWN_INTERVAL_MS);
}

function bindRouteBlockListener() {
  if (routeBlockListenerBound) return;
  routeBlockListenerBound = true;
  document.addEventListener('taamen:lifecycle-route-blocked', () => {
    if (getSitePhase({ includeAnnouncement: false, includeReturn: true }) === SITE_PHASES.CLOSED) {
      renderClosureScreen();
    }
  });
}

function updateCountdownCells(host, remaining) {
  ['days', 'hours', 'minutes', 'seconds'].forEach(key => {
    const node = host.querySelector(`[data-unit="${key}"] strong`);
    if (!node) return;
    const value = key === 'days' ? String(remaining[key]) : String(remaining[key]).padStart(2, '0');
    if (node.textContent === value) return;
    node.textContent = value;
    node.classList.remove('is-changing');
    void node.offsetWidth;
    node.classList.add('is-changing');
  });
}

function countdownCells() {
  return [
    ['days', 'Days'],
    ['hours', 'Hours'],
    ['minutes', 'Minutes'],
    ['seconds', 'Seconds']
  ].map(([unit, label]) => `<div class="site-life-count-cell" data-unit="${unit}"><strong>--</strong><span>${label}</span></div>`).join('');
}

function particleSpans(count) {
  return Array.from({ length: count }, (_, index) => `<span style="--i:${index + 1}"></span>`).join('');
}

function clearLifecycleRoot() {
  document.getElementById(ROOT_ID)?.remove();
  document.getElementById(NOTICE_ID)?.remove();
  document.body.classList.remove('site-announcement-open');
}

function trapFocus(event, scope) {
  if (!scope) return;
  const focusable = [...scope.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
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

function getEffectiveNow() {
  const override = getDeveloperNowOverride();
  return override || new Date();
}

function getDeveloperPhaseOverride() {
  if (!isDeveloperTestAllowed()) return '';
  const value = getSearchParams().get('closureTest')?.toLowerCase();
  const map = {
    normal: SITE_PHASES.NORMAL,
    announcement: SITE_PHASES.ANNOUNCEMENT,
    closed: SITE_PHASES.CLOSED,
    return: SITE_PHASES.RETURN
  };
  return map[value] || '';
}

function getDeveloperNowOverride() {
  if (!isDeveloperTestAllowed()) return null;
  const explicit = getSearchParams().get('closureNow') || getSearchParams().get('closureAt');
  if (explicit) return getDeveloperClock(explicit);
  const phase = getSearchParams().get('closureTest')?.toLowerCase();
  const byPhase = {
    normal: '2026-08-31T23:59:59',
    announcement: '2026-08-15T12:00:00',
    closed: '2026-09-15T12:00:00',
    return: '2027-01-07T00:00:00'
  };
  return byPhase[phase] ? getDeveloperClock(byPhase[phase]) : null;
}

function getDeveloperClock(wallTime) {
  const parsed = parseZonedWallTime(wallTime);
  if (!parsed) return null;
  if (!developerClock || developerClock.wallTime !== wallTime) {
    developerClock = {
      wallTime,
      baseMs: parsed.getTime(),
      startedAtMs: Date.now()
    };
  }
  return new Date(developerClock.baseMs + (Date.now() - developerClock.startedAtMs));
}

function isDeveloperTestAllowed() {
  if (typeof window === 'undefined') return true;
  const { hostname, protocol } = window.location;
  return protocol === 'file:' ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname.endsWith('.local') ||
    hasSessionFlag(DEV_TEST_ENABLE_KEY);
}

function getSearchParams() {
  if (typeof window === 'undefined') return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

function parseZonedWallTime(value) {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?$/);
  if (!match) return null;
  const [, year, month, day, hour = '00', minute = '00', second = '00'] = match;
  return new Date(zonedPartsToUtcMs({
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hour: Number(hour),
    minute: Number(minute),
    second: Number(second)
  }));
}

function zonedDateStringToUtcMs(value) {
  const [year, month, day] = value.split('-').map(Number);
  return zonedPartsToUtcMs({ year, month, day, hour: 0, minute: 0, second: 0 });
}

function zonedPartsToUtcMs(parts) {
  const utcGuess = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  const firstOffset = getTimeZoneOffsetMs(new Date(utcGuess));
  const first = utcGuess - firstOffset;
  const secondOffset = getTimeZoneOffsetMs(new Date(first));
  return utcGuess - secondOffset;
}

function getTimeZoneOffsetMs(date) {
  const parts = getZonedParts(date);
  const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  return asUtc - date.getTime();
}

function getZonedParts(date) {
  const values = {};
  formatter.formatToParts(date).forEach(part => {
    if (part.type !== 'literal') values[part.type] = Number(part.value);
  });
  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour,
    minute: values.minute,
    second: values.second
  };
}

function zonedComparable(date) {
  const parts = getZonedParts(date);
  return parts.year * 10000000000 +
    parts.month * 100000000 +
    parts.day * 1000000 +
    parts.hour * 10000 +
    parts.minute * 100 +
    parts.second;
}

function dateStringComparable(value) {
  const [year, month, day] = value.split('-').map(Number);
  return year * 10000000000 + month * 100000000 + day * 1000000;
}

function splitDuration(ms) {
  const total = Math.max(0, Number(ms) || 0);
  const days = Math.floor(total / 86400000);
  const hours = Math.floor((total % 86400000) / 3600000);
  const minutes = Math.floor((total % 3600000) / 60000);
  const seconds = Math.floor((total % 60000) / 1000);
  return { total, days, hours, minutes, seconds };
}

function hasSessionFlag(key) {
  try {
    return sessionStorage.getItem(key) === '1';
  } catch (_) {
    return false;
  }
}

function setSessionFlag(key) {
  try {
    sessionStorage.setItem(key, '1');
  } catch (_) {
    // Session storage is optional; the lifecycle remains usable without it.
  }
}

function reducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}
