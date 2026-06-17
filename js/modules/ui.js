export function $(selector, scope = document) {
  return scope.querySelector(selector);
}

export function $all(selector, scope = document) {
  return [...scope.querySelectorAll(selector)];
}

export function safeText(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function formatClock(date = new Date()) {
  let hours = date.getHours();
  const suffix = hours >= 12 ? 'مساءً' : 'صباحًا';
  hours = hours % 12 || 12;
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds} ${suffix}`;
}

export function formatCountdown(ms) {
  const safe = Math.max(0, Number(ms) || 0);
  const days = Math.floor(safe / 86400000);
  const hours = Math.floor((safe % 86400000) / 3600000);
  const minutes = Math.floor((safe % 3600000) / 60000);
  const seconds = Math.floor((safe % 60000) / 1000);
  if (days > 0) {
    return `${days} يوم ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function toast(message, options = {}) {
  const host = $('#toastHost');
  if (!host) return;
  const node = document.createElement('div');
  node.className = `toast ${options.kind || ''}`.trim();
  node.innerHTML = `<i class="fa-solid ${options.icon || 'fa-bolt'}"></i><span>${safeText(message)}</span>`;
  host.appendChild(node);
  requestAnimationFrame(() => node.classList.add('show'));
  setTimeout(() => {
    node.classList.remove('show');
    setTimeout(() => node.remove(), 260);
  }, options.duration || 3400);
}

export function copyText(text, successMessage = 'تم النسخ') {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).then(() => toast(successMessage, { icon: 'fa-copy' }));
  }
  const area = document.createElement('textarea');
  area.value = text;
  document.body.appendChild(area);
  area.select();
  document.execCommand('copy');
  area.remove();
  toast(successMessage, { icon: 'fa-copy' });
  return Promise.resolve();
}

export function debounce(fn, delay = 120) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function createStars() {
  const layer = $('#starsLayer');
  if (!layer || layer.dataset.ready === '1') return;
  layer.dataset.ready = '1';
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < 130; i++) {
    const star = document.createElement('span');
    star.className = 'star';
    const size = Math.random() * 2.6 + 0.8;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.setProperty('--d', `${Math.random() * 3 + 2}s`);
    fragment.appendChild(star);
  }
  layer.appendChild(fragment);

  const makeMeteor = () => {
    if (document.body.classList.contains('theme-day')) return;
    const meteor = document.createElement('span');
    meteor.className = 'meteor';
    meteor.style.top = `${Math.random() * 48 + 4}%`;
    meteor.style.left = `${Math.random() * 80 + 10}%`;
    meteor.style.setProperty('--meteor-speed', `${Math.random() * 1.4 + 1.3}s`);
    layer.appendChild(meteor);
    setTimeout(() => meteor.remove(), 3200);
  };

  setInterval(makeMeteor, 2600);
  setTimeout(makeMeteor, 650);
}

export function revealOnScroll() {
  const items = $all('.reveal-up');
  if (!('IntersectionObserver' in window)) {
    items.forEach(item => item.classList.add('visible'));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.12 });
  items.forEach(item => observer.observe(item));
}
