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
import { initAIAssistant } from './modules/ai-assistant.js';

let currentCity = read('city', CONFIG.defaultCity);

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
  createStars();
  revealOnScroll();
  initClock();
  initTheme();
  initHeader();
  initMobileUX();
  initDeviceInspector();
  initRouter();
  initCitySwitcher();
  initSources();
  initGuide();
  initMatchCenter();
  initAIAssistant();
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
