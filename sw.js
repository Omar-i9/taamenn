const cacheName = 'taamen-2026-v3-final';
const assets = [
  './',
  './index.html',
  './manifest.json',
  './assets/favicon.png',
  './css/00-tokens.css',
  './css/01-base.css',
  './css/02-layout.css',
  './css/03-components.css',
  './css/04-home.css',
  './css/05-match-center.css',
  './css/06-radar.css',
  './css/07-archive.css',
  './css/08-weather-prayer.css',
  './css/09-about.css',
  './css/10-mobile.css',
  './css/11-v2-polish.css',
  './css/12-v3-final.css',
  './js/app.js',
  './js/config.js',
  './js/modules/router.js',
  './js/modules/storage.js',
  './js/modules/ui.js',
  './js/modules/weather.js',
  './js/modules/prayer.js',
  './js/modules/matches.js',
  './js/modules/tactical.js',
  './data/site-data.js'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName).then(cache => cache.addAll(assets)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== cacheName).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.hostname.includes('api.open-meteo.com') || url.hostname.includes('api.aladhan.com')) {
    event.respondWith(fetch(request).catch(() => caches.match(request)));
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(response => {
      const copy = response.clone();
      caches.open(cacheName).then(cache => cache.put(request, copy));
      return response;
    }).catch(() => caches.match('./index.html')))
  );
});
