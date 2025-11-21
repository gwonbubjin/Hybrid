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

// 설치 단계: 처음 접속할 때 파일들 캐시에 저장
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 오래된 캐시 정리 (버전 바뀔 때)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    })
  );
});

// 요청 들어오면 캐시 먼저 확인 후, 없으면 네트워크 요청
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});
