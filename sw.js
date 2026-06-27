const cacheName = 'taamen-2026-v5-6-ai-mobile-quality';

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
  './css/07-archive.css',
  './css/08-weather-prayer.css',
  './css/09-about.css',
  './css/10-mobile.css',
  './css/11-v2-polish.css',
  './css/12-v3-final.css',
  './css/13-mobile-ux-pro.css',
  './css/14-mobile-adaptive.css',
  './css/15-health-qibla.css',
  './css/16-mobile-superfit.css',
  './css/17-recovery-tactical-fix.css',
  './css/18-maintenance-pro-fix.css',
  './css/19-radar-injury-final.css',
  './css/21-navigation-stability.css',
  './css/22-radar-rebuild.css',
  './css/23-ai-assistant.css',
  './css/24-security-privacy.css',
  './css/25-ai-floating-chat.css',
  './js/app.js',
  './js/config.js',
  './js/modules/router.js',
  './js/modules/cookies.js',
  './js/modules/security-center.js',
  './js/modules/tactical.js',
  './js/modules/ai-assistant.js',
  './js/modules/ai-answer-engine.js',
  './js/modules/ai-response-templates.js',
  './js/modules/ai-template-engine.js',
  './js/modules/ai-floating-chat.js',
  './js/modules/ai-knowledge-pack.js',
  './js/modules/ai-retrieval.js',
  './js/modules/api-client.js',
  './js/modules/storage.js',
  './js/modules/ui.js',
  './js/modules/weather.js',
  './js/modules/prayer.js',
  './js/modules/matches.js',
  './js/modules/mobile-ux.js',
  './js/modules/injuries.js',
  './js/modules/qibla.js',
  './js/modules/device-inspector.js',
  './js/modules/share-capture.js',
  './data/site-data.js',
  './data/injuries-data.js',
  './docs/INJURIES_GUIDE.md',
  './docs/QIBLA_GUIDE.md',
  './docs/V3_5_UPDATE_NOTES.md',
  './docs/TAAMEN_DATA_EDITING_GUIDE.md',
  './docs/V3_6_MAINTENANCE_NOTES.md',
  './docs/V3_7_FIX_NOTES.md',
  './docs/V3_8_RADAR_PRO_NOTES.md',
  './docs/V3_9_RADAR_PAUSED_NOTES.md',
  './docs/V4_0_NAVIGATION_STABILITY_NOTES.md',
  './docs/V5_RADAR_REBUILD_NOTES.md',
  './docs/AI_ASSISTANT_GUIDE.md',
  './docs/V5_2_SECURITY_PRIVACY_NOTES.md',
  './docs/V5_3_MAINTENANCE_SECURITY_STABILITY_NOTES.md',
  './docs/V5_4_AI_INTELLIGENCE_UPGRADE_NOTES.md',
  './docs/V5_6_AI_ASSISTANT_INTERACTION_MOBILE_QUALITY_UPGRADE.md'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(cacheName)
      .then(cache => cache.addAll(assets))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys => Promise.all(keys.filter(key => key !== cacheName).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (url.pathname.includes('/api/')) {
    event.respondWith(fetch(request));
    return;
  }

  // External services: never fall back to index.html for scripts/CSS/API files.
  if (url.origin !== self.location.origin) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request).then(cached => cached || Response.error()))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request)
        .then(response => {
          if (response.ok && response.type !== 'opaque') {
            const copy = response.clone();
            caches.open(cacheName).then(cache => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => {
          // Only document navigation may use the app shell.
          // Do not return HTML for JS/CSS/images, or the browser will throw syntax errors.
          if (request.mode === 'navigate' || request.destination === 'document') {
            return caches.match('./index.html');
          }

          return Response.error();
        });
    })
  );
});
