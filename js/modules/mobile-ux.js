import { $ } from './ui.js';
import { read, write } from './storage.js';

const MOBILE_QUERY = '(max-width: 820px)';

function syncMobileClass() {
  const mobile = window.matchMedia(MOBILE_QUERY).matches;
  document.body.classList.toggle('is-mobile-ui', mobile);
  document.body.classList.toggle('is-desktop-ui', !mobile);
}

function markMenuSeen() {
  write('mobile-menu-seen', true);
  document.body.classList.add('mobile-menu-seen');
}

function updateRouteClass(route) {
  document.body.dataset.route = route || 'home';
}

export function initMobileUX() {
  syncMobileClass();

  if (read('mobile-menu-seen', false)) {
    document.body.classList.add('mobile-menu-seen');
  }

  const mq = window.matchMedia(MOBILE_QUERY);
  if (typeof mq.addEventListener === 'function') mq.addEventListener('change', syncMobileClass);
  else mq.addListener(syncMobileClass);

  $('#menuToggle')?.addEventListener('click', () => {
    // نخفي التلميح بعد أول استخدام، لأنه شرح الزر كل مرة جريمة نفسية صغيرة.
    setTimeout(markMenuSeen, 180);
  }, { once: true });

  $('#mobileMenu')?.addEventListener('click', event => {
    if (event.target.closest('[data-route], a')) markMenuSeen();
  });

  document.addEventListener('taamen:route', event => {
    updateRouteClass(event.detail?.route || 'home');
  });

  const hashRoute = location.hash.replace('#', '') || 'home';
  updateRouteClass(hashRoute);
}
