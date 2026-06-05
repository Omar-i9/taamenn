import { CONFIG } from '../config.js';
import { $, safeText, toast } from './ui.js';
import { read, write } from './storage.js';

const weatherCodeMap = {
  0: ['صافي', 'fa-sun'],
  1: ['غالبًا صافي', 'fa-cloud-sun'],
  2: ['غائم جزئيًا', 'fa-cloud-sun'],
  3: ['غائم', 'fa-cloud'],
  45: ['ضباب', 'fa-smog'],
  48: ['ضباب متجمد', 'fa-smog'],
  51: ['رذاذ خفيف', 'fa-cloud-rain'],
  53: ['رذاذ متوسط', 'fa-cloud-rain'],
  55: ['رذاذ قوي', 'fa-cloud-showers-heavy'],
  61: ['مطر خفيف', 'fa-cloud-rain'],
  63: ['مطر متوسط', 'fa-cloud-showers-heavy'],
  65: ['مطر قوي', 'fa-cloud-showers-heavy'],
  71: ['ثلج خفيف', 'fa-snowflake'],
  73: ['ثلج متوسط', 'fa-snowflake'],
  75: ['ثلج قوي', 'fa-snowflake'],
  80: ['زخات خفيفة', 'fa-cloud-rain'],
  81: ['زخات متوسطة', 'fa-cloud-showers-heavy'],
  82: ['زخات قوية', 'fa-cloud-showers-heavy'],
  95: ['عواصف رعدية', 'fa-cloud-bolt'],
  96: ['عواصف مع برد', 'fa-cloud-bolt'],
  99: ['عواصف قوية مع برد', 'fa-cloud-bolt']
};

let latestWeather = null;

export function getLatestWeather() {
  return latestWeather;
}

export function weatherDescription(code) {
  return weatherCodeMap[code] || ['غير معروف', 'fa-cloud'];
}

export function calculatePlayability(current = {}) {
  const temp = Number(current.temperature_2m);
  const wind = Number(current.wind_speed_10m);
  const humidity = Number(current.relative_humidity_2m);
  const code = Number(current.weather_code);

  let score = 100;
  const notes = [];

  if (Number.isFinite(temp)) {
    if (temp < 7) { score -= 18; notes.push('الجو بارد، لازم تسخين أطول.'); }
    else if (temp > 30) { score -= 22; notes.push('حرارة عالية، خفف الرتم واشرب مي.'); }
    else if (temp >= 14 && temp <= 25) { notes.push('الحرارة مناسبة للعب.'); }
  }

  if (Number.isFinite(wind)) {
    if (wind > 32) { score -= 28; notes.push('الرياح قوية وقد تخرب التسديدات.'); }
    else if (wind > 20) { score -= 12; notes.push('في رياح ملحوظة، انتبه للكرات العالية.'); }
    else { notes.push('الرياح مقبولة.'); }
  }

  if (Number.isFinite(humidity)) {
    if (humidity > 82) { score -= 10; notes.push('الرطوبة عالية شوي.'); }
  }

  if ([63, 65, 80, 81, 82, 95, 96, 99].includes(code)) {
    score -= 25;
    notes.push('احتمال مطر أو عواصف، افحص الملعب قبل اللعب.');
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  let label = 'ممتازة';
  if (score < 45) label = 'ضعيفة';
  else if (score < 70) label = 'متوسطة';
  else if (score < 88) label = 'جيدة';

  return {
    score,
    label,
    text: notes.slice(0, 2).join(' ') || 'البيانات غير كافية للحكم.'
  };
}

export async function updateWeather(cityKey = read('city', CONFIG.defaultCity)) {
  const city = CONFIG.cities[cityKey] || CONFIG.cities[CONFIG.defaultCity];
  const card = $('#weatherCard');
  if (card) card.innerHTML = '<div class="loading-line">جاري تحميل الطقس...</div>';

  try {
    const response = await fetch(CONFIG.weather.buildUrl(city));
    if (!response.ok) throw new Error(`Weather HTTP ${response.status}`);
    const data = await response.json();
    latestWeather = { city, data, updatedAt: Date.now() };
    renderWeather(latestWeather);
    syncHomeWeather(latestWeather);
    return latestWeather;
  } catch (error) {
    console.error('Weather failed:', error);
    if (card) {
      card.innerHTML = `
        <div class="service-error">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <strong>تعذر تحميل الطقس الآن</strong>
          <p>تأكد من الاتصال بالإنترنت، أو جرّب التحديث لاحقًا.</p>
        </div>
      `;
    }
    toast('تعذر تحديث الطقس', { kind: 'error', icon: 'fa-triangle-exclamation' });
    return null;
  }
}

function renderWeather(state) {
  const { city, data } = state;
  const card = $('#weatherCard');
  if (!card) return;

  const current = data.current || {};
  const [desc, icon] = weatherDescription(current.weather_code);
  const play = calculatePlayability(current);
  const hourly = data.hourly || {};
  const times = hourly.time || [];
  const temps = hourly.temperature_2m || [];
  const codes = hourly.weather_code || [];

  const hourlyHtml = times.slice(0, 12).map((time, index) => {
    const date = new Date(time);
    const hour = `${String(date.getHours()).padStart(2, '0')}:00`;
    const [hDesc, hIcon] = weatherDescription(codes[index]);
    return `
      <div class="hour-card" title="${safeText(hDesc)}">
        <span>${hour}</span>
        <i class="fa-solid ${hIcon}"></i>
        <strong>${Math.round(temps[index] ?? 0)}°</strong>
      </div>
    `;
  }).join('');

  card.innerHTML = `
    <div class="service-head">
      <div>
        <span class="eyebrow">طقس الملعب</span>
        <h2>${safeText(city.name)} - ${safeText(city.country)}</h2>
      </div>
      <i class="fa-solid ${icon}"></i>
    </div>

    <div class="weather-hero-row">
      <div>
        <strong class="weather-temp">${Math.round(current.temperature_2m ?? 0)}°C</strong>
        <p>${safeText(desc)}</p>
      </div>
      <div class="playability-pill ${play.score >= 70 ? 'good' : play.score >= 45 ? 'mid' : 'bad'}">
        <span>جاهزية اللعب</span>
        <strong>${play.label}</strong>
        <small>${play.score}%</small>
      </div>
    </div>

    <div class="weather-metrics">
      <div><i class="fa-solid fa-wind"></i><span>الرياح</span><strong>${Math.round(current.wind_speed_10m ?? 0)} كم/س</strong></div>
      <div><i class="fa-solid fa-droplet"></i><span>الرطوبة</span><strong>${Math.round(current.relative_humidity_2m ?? 0)}%</strong></div>
      <div><i class="fa-solid fa-location-dot"></i><span>المصدر</span><strong>Open-Meteo</strong></div>
    </div>

    <p class="service-note">${safeText(play.text)}</p>
    <div class="hourly-strip">${hourlyHtml}</div>
  `;
}

function syncHomeWeather(state) {
  const current = state?.data?.current || {};
  const play = calculatePlayability(current);
  const scoreEl = $('#playabilityScore');
  const textEl = $('#playabilityText');
  if (scoreEl) scoreEl.textContent = play.label;
  if (textEl) textEl.textContent = `${play.score}% - ${play.text}`;
}
