const CACHE_NAME = 'ai-expo-v1';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './bg1.jpg',
  './bg2.jpg',
  './bg3.jpg',
  './poster.jpg'
];

// 설치 시 캐시 채우기
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 오래된 캐시 정리 + 즉시 제어권
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// 캐시 우선 + 네트워크 백업
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse; // 캐시에 있으면 그걸 사용
      }
      return fetch(event.request); // 없으면 네트워크로
    })
  );
});
