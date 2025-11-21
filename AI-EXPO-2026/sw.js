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

self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install');
  self.skipWaiting(); // 설치 즉시 활성화
});

self.addEventListener('activate', (e) => {
  console.log('[Service Worker] Activate');
  e.waitUntil(self.clients.claim()); // 즉시 제어권 가져오기
});

self.addEventListener('fetch', (e) => {
  // 기본적으로 네트워크 요청을 그대로 수행 (설치 조건 충족용)
  e.respondWith(fetch(e.request)); 
});