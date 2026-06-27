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
  return {
    screen: `${window.innerWidth}×${window.innerHeight}`,
    geolocation: 'geolocation' in navigator,
    orientation: 'DeviceOrientationEvent' in window,
    share: 'share' in navigator,
    fileShare: Boolean(navigator.canShare),
    touch: navigator.maxTouchPoints > 0,
    online: navigator.onLine,
    connection: getConnectionLabel(),
    standalone: window.matchMedia('(display-mode: standalone)').matches
  };
}

export function renderDeviceSignals() {
  const host = $('#deviceSignals');
  const homeHost = $('#homeDeviceMini');
  const cap = getDeviceCapabilities();

  const rows = [
    ['حجم الشاشة', cap.screen, 'fa-mobile-screen-button'],
    ['الموقع GPS', yesNo(cap.geolocation), 'fa-location-crosshairs'],
    ['البوصلة', yesNo(cap.orientation), 'fa-compass'],
    ['مشاركة النظام', yesNo(cap.share), 'fa-share-nodes'],
    ['اللمس', yesNo(cap.touch), 'fa-hand-pointer'],
    ['الاتصال', cap.online ? cap.connection : 'غير متصل', 'fa-wifi']
  ];

  const html = rows.map(([label, value, icon]) => `
    <li><i class="fa-solid ${icon}"></i><span>${label}</span><strong>${value}</strong></li>
  `).join('');

  if (host) host.innerHTML = html;
  if (homeHost) {
    homeHost.innerHTML = `
      <div class="mini-device-row"><i class="fa-solid fa-microchip"></i><strong>${cap.screen}</strong><span>${cap.touch ? 'جهاز لمس' : 'حاسوب/متصفح'}</span></div>
      <small class="tap-note">اضغط للانتقال لصفحة القبلة والفحص</small>
    `;
  }
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
