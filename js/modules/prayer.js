import { CONFIG } from '../config.js';
import { $, safeText, formatCountdown, toast } from './ui.js';
import { read } from './storage.js';

const prayerNames = {
  Fajr: 'الفجر',
  Sunrise: 'الشروق',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء'
};

const prayerIcons = {
  Fajr: 'fa-cloud-moon',
  Sunrise: 'fa-sun',
  Dhuhr: 'fa-sun',
  Asr: 'fa-cloud-sun',
  Maghrib: 'fa-moon',
  Isha: 'fa-star-and-crescent'
};

let prayerState = null;
let ticker = null;

export function getPrayerState() {
  return prayerState;
}

export async function updatePrayer(cityKey = read('city', CONFIG.defaultCity)) {
  const city = CONFIG.cities[cityKey] || CONFIG.cities[CONFIG.defaultCity];
  const grid = $('#prayerGrid');
  if (grid) grid.innerHTML = '<div class="loading-line">جاري تحميل المواقيت...</div>';

  try {
    const response = await fetch(CONFIG.prayer.buildUrl(city));
    if (!response.ok) throw new Error(`Prayer HTTP ${response.status}`);
    const data = await response.json();
    const timings = data?.data?.timings || {};
    const hijri = data?.data?.date?.hijri;
    const list = Object.keys(prayerNames).map(id => ({
      id,
      name: prayerNames[id],
      icon: prayerIcons[id],
      time: normalizePrayerTime(timings[id])
    }));

    prayerState = { city, list, hijri, updatedAt: Date.now() };
    renderPrayer();
    startPrayerTicker();
    return prayerState;
  } catch (error) {
    console.warn('Prayer failed:', error);
    if (grid) {
      grid.innerHTML = `
        <div class="service-error full-grid">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <strong>تعذر تحميل مواقيت الصلاة</strong>
          <p>تأكد من الاتصال بالإنترنت أو جرّب مدينة ثانية.</p>
        </div>
      `;
    }
    toast('تعذر تحديث مواقيت الصلاة', { kind: 'error', icon: 'fa-triangle-exclamation' });
    return null;
  }
}

function normalizePrayerTime(value) {
  return String(value || '--:--').split(' ')[0];
}

function toPrayerDate(time, addDay = 0) {
  const [h, m] = String(time || '00:00').split(':').map(Number);
  const date = new Date();
  date.setDate(date.getDate() + addDay);
  date.setHours(Number.isFinite(h) ? h : 0, Number.isFinite(m) ? m : 0, 0, 0);
  return date;
}

export function getNextPrayer() {
  if (!prayerState?.list?.length) return null;
  const now = new Date();
  for (const prayer of prayerState.list) {
    if (prayer.id === 'Sunrise') continue;
    const target = toPrayerDate(prayer.time);
    if (target > now) return { ...prayer, target };
  }
  const first = prayerState.list.find(p => p.id === 'Fajr') || prayerState.list[0];
  return { ...first, target: toPrayerDate(first.time, 1) };
}

function renderPrayer() {
  const grid = $('#prayerGrid');
  const title = $('#prayerCityTitle');
  const note = $('#prayerNote');
  const activeCityName = $('#activeCityName');
  if (!prayerState || !grid) return;

  const next = getNextPrayer();
  const nextId = next?.id;
  if (title) title.textContent = `${prayerState.city.name} - ${prayerState.city.country}`;
  if (activeCityName) activeCityName.textContent = prayerState.city.name;
  if (note) {
    const hijri = prayerState.hijri ? `${prayerState.hijri.day} ${prayerState.hijri.month?.ar || ''} ${prayerState.hijri.year} هـ` : '';
    note.textContent = `طريقة الحساب: ${prayerState.city.prayerMethodLabel}. ${hijri}`;
  }

  grid.innerHTML = prayerState.list.map(prayer => `
    <div class="prayer-unit ${prayer.id === nextId ? 'active' : ''}">
      <i class="fa-solid ${prayer.icon}"></i>
      <span>${safeText(prayer.name)}</span>
      <strong>${safeText(prayer.time)}</strong>
    </div>
  `).join('');
}

function startPrayerTicker() {
  if (ticker) clearInterval(ticker);
  const tick = () => {
    const next = getNextPrayer();
    if (!next) return;
    const diff = next.target - new Date();
    const countdown = formatCountdown(diff);

    const nextPrayerName = $('#nextPrayerName');
    const nextPrayerCountdown = $('#nextPrayerCountdown');
    const homeNextPrayer = $('#homeNextPrayer');
    const homePrayerCountdown = $('#homePrayerCountdown');
    const label = next.id === 'Maghrib' ? `الوقت المتبقي لأذان ${next.name}` : `الوقت المتبقي لصلاة ${next.name}`;

    if ($('#nextPrayerLabel')) $('#nextPrayerLabel').textContent = label;
    if (nextPrayerName) nextPrayerName.textContent = next.name;
    if (nextPrayerCountdown) nextPrayerCountdown.textContent = countdown;
    if (homeNextPrayer) homeNextPrayer.textContent = next.name;
    if (homePrayerCountdown) homePrayerCountdown.textContent = countdown;
  };
  tick();
  ticker = setInterval(tick, 1000);
}
