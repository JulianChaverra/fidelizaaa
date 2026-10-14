const CACHE_NAME = 'fideliza-usuario-v1';
const urlsToCache = [
  '/u/tarjetas',
  '/icon-192.png',
  '/icon-512.png',
  // Puedes agregar más rutas si es necesario
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
