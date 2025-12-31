// Service Worker for aggressive 3D model caching
// Models are cached permanently after first download

const CACHE_NAME = 'porsche-models-v1';
const MODEL_CACHE = 'porsche-models-permanent';

// Files to cache immediately
const urlsToCache = [
  '/',
  '/index.html',
  '/static/css/main.c88314b8.css',
  '/static/js/main.076c50e1.js'
];

// Large model files - cache permanently
const modelFiles = [
  '/models/porsche.glb',
  '/models/porsche.usdz'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
  // Skip waiting to activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== MODEL_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Special handling for 3D models - cache first, network fallback
  if (modelFiles.some(model => url.pathname.endsWith(model.split('/').pop()))) {
    event.respondWith(
      caches.open(MODEL_CACHE).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            console.log('Serving model from cache:', url.pathname);
            return cachedResponse;
          }
          
          // Not in cache, fetch and store permanently
          console.log('Downloading and caching model:', url.pathname);
          return fetch(event.request).then((networkResponse) => {
            // Clone the response before caching
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }
  
  // For other requests, network first, cache fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request);
      })
  );
});

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Clear model cache if requested
  if (event.data && event.data.type === 'CLEAR_MODEL_CACHE') {
    caches.delete(MODEL_CACHE).then(() => {
      event.ports[0].postMessage({ cleared: true });
    });
  }
});
