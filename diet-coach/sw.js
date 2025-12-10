const CACHE_NAME = 'diet-coach-v999'; // 개발 중 - 캐시 비활성화

self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker 설치 - 캐시 비활성화 모드');
    self.skipWaiting(); // 즉시 활성화
});

// 옛날 캐시 모두 삭제
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    console.log('🗑️ 캐시 삭제:', cacheName);
                    return caches.delete(cacheName);
                })
            );
        })
    );
    return self.clients.claim();
});

// 항상 네트워크에서 최신 파일 가져오기 (캐시 사용 안 함)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => {
            // 네트워크 실패 시에만 캐시 확인
            return caches.match(event.request);
        })
    );
});
