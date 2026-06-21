import { $, $all } from './ui.js';

const validRoutes = ['home', 'match-center', 'archive', 'ai', 'radar', 'weather-prayer', 'injuries', 'qibla', 'security', 'guide', 'about'];
let currentRoute = 'home';
let routerBound = false;

export function getRoute() {
  return currentRoute;
}

export function isValidRoute(route) {
  return validRoutes.includes(route);
}

export function navigate(route, options = {}) {
  const next = validRoutes.includes(route) ? route : 'home';
  currentRoute = next;

  $all('.page').forEach(page => page.classList.toggle('active', page.id === next));
  $all('[data-route]').forEach(btn => btn.classList.toggle('active', btn.dataset.route === next));

  const page = $(`#${next}`);
  document.title = page?.dataset?.pageTitle ? `${page.dataset.pageTitle} | تأمين 2026` : 'تأمين 2026';
  document.body.dataset.route = next;

  if (!options.silent) {
    history.replaceState(null, '', `#${next}`);
    window.scrollTo({ top: 0, behavior: options.instant ? 'auto' : 'smooth' });
  }

  closeMobileMenu();
  closeMoreNav();
  document.dispatchEvent(new CustomEvent('taamen:route', { detail: { route: next } }));
}

export function initRouter() {
  if (routerBound) return;
  routerBound = true;

  const hash = location.hash.replace('#', '');
  navigate(validRoutes.includes(hash) ? hash : 'home', { silent: true, instant: true });
  bindMobileMenu();
  bindMoreNav();
  bindRouteClicks();

  window.addEventListener('hashchange', () => {
    const hashRoute = location.hash.replace('#', '');
    if (validRoutes.includes(hashRoute)) navigate(hashRoute, { silent: true, instant: true });
    else navigate('home', { silent: true, instant: true });
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeMobileMenu();
      closeMoreNav();
    }
  });
}

function bindRouteClicks() {
  // Capture mode مقصود: يخلي أزرار الهيرو والكروت تشتغل حتى لو طبقة زخرفية حاولت تتفلسف فوقها.
  document.addEventListener('click', event => {
    const moreToggle = event.target.closest('[data-more-toggle], #moreNavToggle');
    if (moreToggle) return;

    const trigger = event.target.closest('[data-route]');
    if (!trigger) return;
    if (trigger === document.body) return;

    const route = trigger.dataset.route;
    if (!validRoutes.includes(route)) return;

    event.preventDefault();
    event.stopPropagation();
    navigate(route);
  }, true);
}

function bindMobileMenu() {
  const menuToggle = $('#menuToggle');
  if (!menuToggle) return;

  menuToggle.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    toggleMobileMenu();
  });

  document.addEventListener('click', event => {
    const menu = $('#mobileMenu');
    const toggle = $('#menuToggle');
    if (!menu || !toggle || !menu.classList.contains('open')) return;
    if (!menu.contains(event.target) && !toggle.contains(event.target)) closeMobileMenu();
  });
}

function toggleMobileMenu(force) {
  const menu = $('#mobileMenu');
  const toggle = $('#menuToggle');
  if (!menu || !toggle) return;

  const open = typeof force === 'boolean' ? force : !menu.classList.contains('open');
  menu.classList.toggle('open', open);
  toggle.classList.toggle('active', open);
  toggle.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-hidden', String(!open));
  document.body.classList.toggle('nav-open', open);

  if (open) closeMoreNav();
}

export function closeMobileMenu() {
  const menu = $('#mobileMenu');
  const toggle = $('#menuToggle');
  if (!menu || !toggle) return;
  menu.classList.remove('open');
  toggle.classList.remove('active');
  toggle.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('nav-open');
}

function bindMoreNav() {
  const moreNav = $('#moreNav');
  const toggle = $('#moreNavToggle');
  const panel = $('#moreNavPanel');
  if (!moreNav || !toggle || !panel) return;

  const toggleHandler = event => {
    event.preventDefault();
    event.stopPropagation();
    const open = !moreNav.classList.contains('open');
    toggleMoreNav(open);
  };

  toggle.addEventListener('click', toggleHandler);
  toggle.addEventListener('pointerup', event => {
    // fallback للموبايل/التتش لو click اتأخر أو انبلع من طبقة ثانية.
    if (event.pointerType === 'mouse') return;
    toggleHandler(event);
  });

  panel.addEventListener('click', event => {
    const routeButton = event.target.closest('[data-route]');
    if (routeButton) closeMoreNav();
  });

  document.addEventListener('click', event => {
    if (!moreNav.contains(event.target)) closeMoreNav();
  });
}

function toggleMoreNav(open) {
  const moreNav = $('#moreNav');
  const toggle = $('#moreNavToggle');
  const panel = $('#moreNavPanel');
  if (!moreNav || !toggle || !panel) return;

  moreNav.classList.toggle('open', open);
  toggle.classList.toggle('active', open);
  toggle.setAttribute('aria-expanded', String(open));
  panel.setAttribute('aria-hidden', String(!open));

  if (open) closeMobileMenu();
}

export function closeMoreNav() {
  const moreNav = $('#moreNav');
  const toggle = $('#moreNavToggle');
  const panel = $('#moreNavPanel');
  if (!moreNav || !toggle || !panel) return;
  moreNav.classList.remove('open');
  toggle.classList.remove('active');
  toggle.setAttribute('aria-expanded', 'false');
  panel.setAttribute('aria-hidden', 'true');
}

export function initHeader() {
  const header = $('#mainHeader');
  window.addEventListener('scroll', () => {
    header?.classList.toggle('scrolled', window.scrollY > 24);
  }, { passive: true });
}
