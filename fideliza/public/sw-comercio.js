const CACHE_NAME = 'fideliza-comercio-v1';
const urlsToCache = [
  '/panel',
  '/icon-192.png',
  '/icon-512.png',
  // Agrega más recursos estáticos si lo deseas
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});
