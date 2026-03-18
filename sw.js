const cacheName = 'taamen-v1';
const assets = [
  '/taamenn/',
  '/taamenn/index.html',
  '/taamenn/style.css',
  '/taamenn/script.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      cache.addAll(assets);
    })
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request);
    })
  );
});
