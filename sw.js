const CACHE_NAME = 'qtools-cache-v1';

// Archivos exactos que utiliza tu proyecto
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './pages/bottle-reception-form.html',
  './pages/caramele-calculate.html',
  './dist/output.css',
  './media/icon-app.png',
  './media/logolyv.png',
  './media/screenshot-desktop.png',
  './media/screenshot-mobile.png'   
];

// Instalación: Cargar recursos en caché
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activación: Limpieza de cachés viejas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Intercepción de peticiones (Offline First)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});