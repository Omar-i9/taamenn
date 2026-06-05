import { $, $all, toast } from './ui.js';
import { read, write } from './storage.js';

const validRoutes = ['home', 'match-center', 'radar', 'archive', 'weather-prayer', 'guide', 'about'];
let currentRoute = 'home';

export function getRoute() {
  return currentRoute;
}

export function navigate(route, options = {}) {
  const next = validRoutes.includes(route) ? route : 'home';
  currentRoute = next;

  $all('.page').forEach(page => page.classList.toggle('active', page.id === next));
  $all('[data-route]').forEach(btn => btn.classList.toggle('active', btn.dataset.route === next));

  const page = $(`#${next}`);
  document.title = page?.dataset?.pageTitle ? `${page.dataset.pageTitle} | تأمين 2026` : 'تأمين 2026';

  if (!options.silent) {
    write('last-route', next);
    history.replaceState(null, '', `#${next}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  closeMobileMenu();
  closeMoreNav();
  document.dispatchEvent(new CustomEvent('taamen:route', { detail: { route: next } }));
}

export function initRouter() {
  const saved = read('last-route', 'home');
  const hash = location.hash.replace('#', '');
  navigate(validRoutes.includes(hash) ? hash : saved, { silent: true });

  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-route]');
    if (!trigger) return;
    event.preventDefault();
    navigate(trigger.dataset.route);
  });

  window.addEventListener('hashchange', () => {
    const hashRoute = location.hash.replace('#', '');
    if (validRoutes.includes(hashRoute)) navigate(hashRoute, { silent: true });
  });

  const menuToggle = $('#menuToggle');
  menuToggle?.addEventListener('click', toggleMobileMenu);
  initMoreNav();

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMobileMenu();
  });

  document.addEventListener('click', event => {
    const menu = $('#mobileMenu');
    const toggle = $('#menuToggle');
    if (!menu || !toggle || !menu.classList.contains('open')) return;
    if (!menu.contains(event.target) && !toggle.contains(event.target)) closeMobileMenu();
  });
}

function toggleMobileMenu() {
  const menu = $('#mobileMenu');
  const toggle = $('#menuToggle');
  if (!menu || !toggle) return;
  const open = !menu.classList.contains('open');
  menu.classList.toggle('open', open);
  toggle.classList.toggle('active', open);
  menu.setAttribute('aria-hidden', String(!open));
}

export function closeMobileMenu() {
  const menu = $('#mobileMenu');
  const toggle = $('#menuToggle');
  if (!menu || !toggle) return;
  menu.classList.remove('open');
  toggle.classList.remove('active');
  menu.setAttribute('aria-hidden', 'true');
}

function initMoreNav() {
  const moreNav = $('#moreNav');
  const toggle = $('#moreNavToggle');
  const panel = $('#moreNavPanel');
  if (!moreNav || !toggle || !panel) return;

  toggle.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    const open = !moreNav.classList.contains('open');
    moreNav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    panel.setAttribute('aria-hidden', String(!open));
  });

  panel.addEventListener('click', event => {
    if (event.target.closest('[data-route]')) closeMoreNav();
  });

  document.addEventListener('click', event => {
    if (!moreNav.contains(event.target)) closeMoreNav();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMoreNav();
  });
}

export function closeMoreNav() {
  const moreNav = $('#moreNav');
  const toggle = $('#moreNavToggle');
  const panel = $('#moreNavPanel');
  if (!moreNav || !toggle || !panel) return;
  moreNav.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
  panel.setAttribute('aria-hidden', 'true');
}

export function initHeader() {
  const header = $('#mainHeader');
  window.addEventListener('scroll', () => {
    header?.classList.toggle('scrolled', window.scrollY > 24);
  });
}
