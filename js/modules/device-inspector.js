import { $ } from './ui.js';

function yesNo(value) {
  return value ? 'مدعوم' : 'غير مدعوم';
}

function getConnectionLabel() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!connection) return 'غير معروف';
  return `${connection.effectiveType || 'اتصال'}${connection.saveData ? ' • توفير بيانات' : ''}`;
}

export function getDeviceCapabilities() {
  let storage = false;
  try {
    const testKey = 'taamen-legacy:device-test';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    storage = true;
  } catch (_) {}

  return {
    screen: `${window.innerWidth}×${window.innerHeight}`,
    geolocation: 'geolocation' in navigator,
    orientation: 'DeviceOrientationEvent' in window,
    share: 'share' in navigator,
    fileShare: Boolean(navigator.canShare),
    touch: navigator.maxTouchPoints > 0,
    online: navigator.onLine,
    connection: getConnectionLabel(),
    storage,
    serviceWorker: 'serviceWorker' in navigator,
    standalone: window.matchMedia('(display-mode: standalone)').matches
  };
}

export function renderDeviceSignals() {
  const host = $('#deviceSignals');
  const homeHost = $('#homeDeviceMini');
  const cap = getDeviceCapabilities();

  const rows = [
    ['المتصفح', cap.screen, 'fa-window-maximize'],
    ['مستشعرات الحركة', yesNo(cap.orientation), 'fa-compass'],
    ['الموقع', yesNo(cap.geolocation), 'fa-location-crosshairs'],
    ['localStorage', yesNo(cap.storage), 'fa-database'],
    ['Service Worker', yesNo(cap.serviceWorker), 'fa-rotate'],
    ['وضع العرض', cap.standalone ? 'تطبيق مثبت' : 'متصفح عادي', 'fa-display'],
    ['الشبكة', cap.online ? cap.connection : 'غير متصل', 'fa-wifi'],
    ['اللمس', yesNo(cap.touch), 'fa-hand-pointer']
  ];

  const html = rows.map(([label, value, icon]) => `
    <li><i class="fa-solid ${icon}"></i><span>${label}</span><strong>${value}</strong></li>
  `).join('');

  if (host) host.innerHTML = html;
  if (homeHost) homeHost.innerHTML = '';
}

export function initTinyScreenWarning() {
  $('#tinyScreenNotice')?.remove();
  document.body.classList.remove('tiny-notice-open');
}

export function initDeviceInspector() {
  renderDeviceSignals();
  initTinyScreenWarning();
  window.addEventListener('resize', renderDeviceSignals);
  window.addEventListener('online', renderDeviceSignals);
  window.addEventListener('offline', renderDeviceSignals);
}
