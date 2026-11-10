// RESIBOOTH service worker: makes the app installable and lets it open offline.
const CACHE = 'resibooth-v6';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return; // never touch uploads
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const isLib = /fonts\.(googleapis|gstatic)\.com|cdnjs\.cloudflare\.com/.test(url.hostname);
  if (!sameOrigin && !isLib) return; // e.g. Google Apps Script calls go straight to network

  // Network first (so updates show), fall back to cache when offline.
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok || res.type === 'opaque') {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    }).catch(() => caches.match(req).then(r => r || (req.mode === 'navigate' ? caches.match('./index.html') : undefined)))
  );
});
