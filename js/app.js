import { CONFIG } from './config.js';
import { sources, guideSections } from '../data/site-data.js';
import { $, safeText, formatClock, createStars, revealOnScroll, toast } from './modules/ui.js';
import { read, write } from './modules/storage.js';
import { initRouter, initHeader } from './modules/router.js';
import { updateWeather } from './modules/weather.js';
import { updatePrayer } from './modules/prayer.js';
import { initMatchCenter, renderMatchCenter, renderHomeStats } from './modules/matches.js';
import { initMobileUX } from './modules/mobile-ux.js';
import { initInjuries } from './modules/injuries.js';
import { initQibla } from './modules/qibla.js';
import { initDeviceInspector } from './modules/device-inspector.js';
import { initShareCapture } from './modules/share-capture.js';
import { initTactical } from './modules/tactical.js';
import { initTacticalCoreShell } from './modules/tactical-core.js';
import { initAIAssistant } from './modules/ai-assistant.js';
import { initCookieConsent } from './modules/cookies.js';
import { initSecurityCenter } from './modules/security-center.js';
import { initAIFloatingChat } from './modules/ai-floating-chat.js';

let currentCity = read('city', CONFIG.defaultCity);
const BOOT_SPLASH_KEY = 'taamen.boot.seen.v1';

function initBootSplash() {
  try {
    if (sessionStorage.getItem(BOOT_SPLASH_KEY) === '1') return;
    sessionStorage.setItem(BOOT_SPLASH_KEY, '1');
  } catch (_) {
    return;
  }

  const splash = document.createElement('div');
  splash.className = 'taamen-boot-splash';
  splash.setAttribute('aria-hidden', 'true');
  splash.innerHTML = `
    <div class="boot-core">
      <div class="boot-ball"><i class="fa-solid fa-futbol"></i></div>
      <div class="boot-line"><span></span></div>
      <div class="boot-text" id="bootSplashText">Initializing system</div>
    </div>
  `;
  document.body.appendChild(splash);

  const steps = ['Initializing system', 'Loading match core', 'Syncing AI', 'Ready'];
  const label = splash.querySelector('#bootSplashText');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const interval = reduced ? 45 : 250;
  steps.forEach((step, index) => {
    window.setTimeout(() => {
      if (label) label.textContent = step;
    }, index * interval);
  });
  window.setTimeout(() => splash.remove(), reduced ? 260 : 1180);
}

function initClock() {
  const clock = $('#headerClock');
  const tick = () => { if (clock) clock.textContent = formatClock(); };
  tick();
  setInterval(tick, 1000);
}

function initTheme() {
  const saved = read('theme', CONFIG.defaultTheme);
  applyTheme(saved);
  $('#themeToggle')?.addEventListener('click', () => {
    const next = document.body.classList.contains('theme-night') ? 'sunset' : 'night';
    applyTheme(next);
    write('theme', next);
  });
}

function applyTheme(theme) {
  const sunset = theme === 'sunset';
  const night = !sunset;
  document.body.classList.toggle('theme-night', night);
  document.body.classList.toggle('theme-sunset', sunset);
  document.body.classList.remove('theme-day');
  const icon = $('#themeToggle i');
  if (icon) icon.className = `fa-solid ${night ? 'fa-moon' : 'fa-sun'}`;
  const meta = document.querySelector('meta[name="theme-color"]');
  meta?.setAttribute('content', night ? '#07111f' : '#26101a');
}

function initCitySwitcher() {
  const select = $('#citySelect');
  if (select) select.value = currentCity;
  select?.addEventListener('change', () => {
    currentCity = select.value;
    write('city', currentCity);
    refreshServices();
  });
  $('#refreshServices')?.addEventListener('click', refreshServices);
}

async function refreshServices() {
  const city = CONFIG.cities[currentCity] || CONFIG.cities[CONFIG.defaultCity];
  if ($('#activeCityName')) $('#activeCityName').textContent = city.name;
  await Promise.allSettled([
    updateWeather(currentCity),
    updatePrayer(currentCity)
  ]);
  document.dispatchEvent(new CustomEvent('taamen:services-refreshed'));
  renderMatchCenter(false);
  toast(`تم تحديث بيانات ${city.name}`, { icon: 'fa-rotate' });
}

function initSources() {
  const list = $('#sourcesList');
  if (!list) return;
  list.innerHTML = sources.map(source => `
    <li><strong>${safeText(source.title)}</strong><span>${safeText(source.text)}</span></li>
  `).join('');
}


function initGuide() {
  const grid = $('#guideGrid');
  if (!grid) return;
  grid.innerHTML = guideSections.map(section => `
    <article class="guide-card glass-panel">
      <div class="guide-card-head">
        <i class="fa-solid ${safeText(section.icon)}"></i>
        <h3>${safeText(section.title)}</h3>
      </div>
      <p>${safeText(section.text)}</p>
      <ul>
        ${(section.actions || []).map(action => `<li>${safeText(action)}</li>`).join('')}
      </ul>
    </article>
  `).join('');
}

function initServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(error => {
      console.warn('Service worker registration failed:', error);
    });
  });
}

async function boot() {
  initBootSplash();
  createStars();
  revealOnScroll();
  initClock();
  initTheme();
  initHeader();
  initCookieConsent();
  initMobileUX();
  initDeviceInspector();
  initTacticalCoreShell();
  initRouter();
  initCitySwitcher();
  initSources();
  initGuide();
  initSecurityCenter();
  initMatchCenter();
  initAIAssistant();
  initAIFloatingChat();
  initTactical();
  initInjuries();
  initQibla();
  initShareCapture();
  initServiceWorker();
  await refreshServices();
  renderHomeStats();
}

boot().catch(error => {
  console.error('Taamen boot failed:', error);
  toast('حدث خطأ في تشغيل المنصة', { kind: 'error', icon: 'fa-triangle-exclamation' });
});
