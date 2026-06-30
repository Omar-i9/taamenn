import { $, safeText, toast } from './ui.js';
import { CONFIG } from '../config.js';
import { read, write } from './storage.js';

const KAABA = { lat: 21.422487, lon: 39.826206 };
let qiblaState = {
  coords: null,
  bearing: null,
  heading: null,
  watching: false,
  permissionAsked: false
};

function toRad(deg) { return deg * Math.PI / 180; }
function toDeg(rad) { return rad * 180 / Math.PI; }
function normalize(deg) { return ((deg % 360) + 360) % 360; }

function calculateQiblaBearing(lat, lon) {
  const phi1 = toRad(lat);
  const phi2 = toRad(KAABA.lat);
  const delta = toRad(KAABA.lon - lon);
  const y = Math.sin(delta);
  const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(delta);
  return normalize(toDeg(Math.atan2(y, x)));
}

function compassLabel(deg) {
  const dirs = ['شمال', 'شمال شرقي', 'شرق', 'جنوب شرقي', 'جنوب', 'جنوب غربي', 'غرب', 'شمال غربي'];
  return dirs[Math.round(normalize(deg) / 45) % 8];
}

function status(message, kind = '') {
  const node = $('#qiblaStatus');
  const home = $('#homeQiblaStatus');
  if (node) node.className = `qibla-status ${kind}`.trim(), node.textContent = message;
  if (home) home.textContent = message;
}

function render() {
  const compass = $('#qiblaCompass');
  const needle = $('#qiblaNeedle');
  const degree = $('#qiblaDegree');
  const direction = $('#qiblaDirection');
  const miniNeedle = $('#homeQiblaNeedle');
  const miniDegree = $('#homeQiblaDegree');

  const { bearing, heading } = qiblaState;
  const hasBearing = Number.isFinite(bearing);
  const hasHeading = Number.isFinite(heading);

  if (degree) degree.textContent = hasBearing ? `${Math.round(bearing)}°` : '--°';
  if (direction) direction.textContent = hasBearing ? compassLabel(bearing) : 'بانتظار الموقع';
  if (miniDegree) miniDegree.textContent = hasBearing ? `${Math.round(bearing)}°` : '--°';

  const rotation = hasBearing ? normalize(bearing - (hasHeading ? heading : 0)) : 0;
  if (needle) needle.style.transform = `rotate(${rotation}deg)`;
  if (miniNeedle) miniNeedle.style.transform = `rotate(${rotation}deg)`;

  compass?.classList.toggle('is-live', hasBearing);
  compass?.classList.toggle('no-sensor', !hasHeading);

  if (hasBearing && hasHeading) status('البوصلة تعمل: لف الجهاز حتى يتجه السهم للأعلى.', 'ok');
  else if (hasBearing) status('البوصلة غير متاحة على هذا الجهاز. يمكنك استخدام الاتجاه اليدوي أو تفعيل صلاحيات الحركة إن كانت مدعومة.', 'warn');
}

function updatePosition(position) {
  const { latitude, longitude, accuracy } = position.coords;
  qiblaState.coords = { latitude, longitude, accuracy };
  qiblaState.bearing = calculateQiblaBearing(latitude, longitude);
  write('last-qibla-coords', qiblaState.coords);
  const accuracyNode = $('#qiblaAccuracy');
  if (accuracyNode) accuracyNode.textContent = accuracy ? `دقة الموقع تقريبًا ${Math.round(accuracy)} متر` : 'دقة الموقع غير معروفة';
  render();
}

function handlePositionError(error) {
  const map = {
    1: 'تم رفض إذن الموقع. فعّل GPS أو اسمح للموقع من إعدادات المتصفح.',
    2: 'تعذر تحديد الموقع حاليًا. جرّب تفعيل الموقع أو الاتصال بالإنترنت.',
    3: 'تأخر الجهاز في تحديد الموقع. جرّب مرة ثانية.'
  };
  status(map[error.code] || 'لا يمكن تحديد الموقع الآن.', 'bad');
  toast('تعذر تشغيل القبلة بسبب الموقع', { kind: 'error', icon: 'fa-location-crosshairs' });
}

async function requestOrientationPermission() {
  if (!('DeviceOrientationEvent' in window)) return false;
  const api = window.DeviceOrientationEvent;
  if (typeof api.requestPermission === 'function') {
    try {
      const permission = await api.requestPermission();
      return permission === 'granted';
    } catch {
      return false;
    }
  }
  return true;
}

function handleOrientation(event) {
  let heading = null;
  if (typeof event.webkitCompassHeading === 'number') {
    heading = event.webkitCompassHeading;
  } else if (event.absolute === true && typeof event.alpha === 'number') {
    heading = normalize(360 - event.alpha);
  } else if (typeof event.alpha === 'number') {
    heading = normalize(360 - event.alpha);
  }

  if (heading !== null) {
    qiblaState.heading = heading;
    const headingNode = $('#qiblaHeading');
    if (headingNode) headingNode.textContent = `${Math.round(heading)}°`;
    render();
  }
}

async function startCompass() {
  if (qiblaState.permissionAsked) return;
  qiblaState.permissionAsked = true;
  const ok = await requestOrientationPermission();
  if (!ok) {
    status('جهازك أو متصفحك لا يسمح بقراءة البوصلة. سيتم عرض درجة القبلة بدون سهم حي.', 'warn');
    render();
    return;
  }
  window.addEventListener('deviceorientationabsolute', handleOrientation, true);
  window.addEventListener('deviceorientation', handleOrientation, true);
  status('تم تفعيل مستشعر البوصلة، حرّك الجهاز بهدوء للمعايرة.', 'ok');
}

export function activateQibla() {
  status('جاري طلب الموقع وتشغيل البوصلة...', 'loading');
  startCompass();

  if (!('geolocation' in navigator)) {
    const fallback = read('city', 'hebron');
    const city = CONFIG.cities[fallback] || CONFIG.cities.hebron;
    qiblaState.bearing = calculateQiblaBearing(city.lat, city.lon);
    status('لا يوجد GPS في هذا الجهاز. استخدمت المدينة المختارة كحل احتياطي.', 'warn');
    render();
    return;
  }

  navigator.geolocation.getCurrentPosition(updatePosition, handlePositionError, {
    enableHighAccuracy: true,
    timeout: 9000,
    maximumAge: 60000
  });
}

function initFromFallback() {
  const saved = read('last-qibla-coords', null);
  if (saved?.latitude && saved?.longitude) {
    qiblaState.coords = saved;
    qiblaState.bearing = calculateQiblaBearing(saved.latitude, saved.longitude);
  } else {
    const cityKey = read('city', 'hebron');
    const city = CONFIG.cities[cityKey] || CONFIG.cities.hebron;
    qiblaState.bearing = calculateQiblaBearing(city.lat, city.lon);
  }
  render();
}

export function initQibla() {
  initFromFallback();
  $('#qiblaStart')?.addEventListener('click', activateQibla);
  $('#homeQiblaCard')?.addEventListener('click', () => {
    if (!Number.isFinite(qiblaState.coords?.latitude)) setTimeout(activateQibla, 350);
  });
  document.addEventListener('taamen:route', event => {
    if (event.detail?.route === 'qibla' && !qiblaState.watching) {
      qiblaState.watching = true;
      render();
    }
  });
}
