const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/index.js',
    'style.css',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
   
  ];
  
  const CACHE_NAME = 'static-cache-v2';
  const DATA_CACHE= 'data-cache-v1';
  
  // 1) install
  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches
        .open(CACHE_NAME)
        .then((cache) => cache.addAll(FILES_TO_CACHE))
        .then(self.skipWaiting())
    );
  });
  
  // 2)activate
  self.addEventListener('activate', (event) => {
    const currentCaches = [CACHE_NAME, DATA_CACHE];
    event.waitUntil(
      caches
        .keys()
        .then((cacheNames) => {
          return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
        })
        .then((cachesToDelete) => {
          return Promise.all(
            cachesToDelete.map((cacheToDelete) => {
              return caches.delete(cacheToDelete);
            })
          );
        })
        .then(() => self.clients.claim())
    );
  });
  
  // 3) fetch
  self.addEventListener('fetch', (event) => {
    if (event.request.url.startsWith(self.location.origin)) {
      event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
  
          return caches.open(DATA_CACHE).then((cache) => {
            return fetch(event.request)
            .then((response) => {
              return cache.put(event.request, response.clone()).then(() => {
                return response;
              })
              .catch(err => console.log(err))
            });
            return;
          });
        })
      );
    }
  });
