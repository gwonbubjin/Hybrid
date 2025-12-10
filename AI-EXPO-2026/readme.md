📡 AI EXPO KOREA 2026 — PWA 홍보 웹앱

👥 팀원 구성

이름

역할

임선우

프론트엔드 개발 / UI 인터랙션

권법진

프로젝트 총괄 / 메인 개발 / PWA 구조 설계

김종현

디자인 / 이미지 리소스 관리

이동현

문서화 / 기능 검증 및 테스트

📌 프로젝트 개요

AI EXPO KOREA 2026 행사 정보를 소개하는 반응형 + PWA 기반 웹앱입니다.행사 일정, 로고 애니메이션, 배경 이미지 전환, 모바일 설치(PWA), 오프라인 접근 등을 모두 지원하며실제 행사 홍보용 랜딩 페이지 형태로 제작되었습니다.

이 프로젝트는 100% HTML/CSS/JS 기반이며 GitHub Pages 또는 Netlify에 즉시 배포 가능합니다.

🖼 프로젝트 스크린샷

아래 영역에 실제 앱 실행 화면을 넣으면 됩니다.파일명 예: screenshot-main.png

![메인 화면 스크린샷](./screenshot-main.png)

📁 폴더 및 파일 구조

AI-EXPO-2026/
├── index.html         # 메인 페이지 (행사 소개 UI)
├── style.css          # 전체 스타일
├── sw.js              # PWA 서비스 워커 (오프라인 캐싱)
├── manifest.json      # PWA 메타 정보
├── icon-192.png       # 앱 아이콘 (Android 설치 용)
├── icon-512.png       # 앱 아이콘
├── bg1.jpg            # 배경 이미지
├── bg2.jpg
├── bg3.jpg
├── 1.jpg
├── poster.jpg         # 행사 포스터
├── screenshot-main.png  # <- 스크린샷(필요 시 추가)

🎨 주요 UI 구성 요소

✅ 1. Hero Section

행사 로고 "AI EXPO KOREA 2026"

한국어 부제: 2026 국제인공지능대전

행사 일정: 5.6(수) ~ 5.8(금), COEX Hall A

풀스크린 배경 이미지 적용

✅ 2. 배경 전환 효과

bg1, bg2, bg3 이미지가 순환 재생

페이드 애니메이션으로 자연스럽게 전환

✅ 3. 카운트다운 UI

행사일까지 남은 시간을 실시간 계산하여 표시

📱 PWA 기능 (설치 가능한 웹앱)

✔ manifest.json

앱 이름, 아이콘, 테마 컬러 포함

홈 화면 설치 지원

✔ sw.js 서비스워커

정적 리소스 캐싱

오프라인 환경에서도 동작

install / activate / fetch 이벤트 구성

✔ 실제 설치 기능

Android Chrome: “홈 화면에 추가”

PC Chrome: 주소창 설치 아이콘 표시

🛠 기술 스택

기술

설명

HTML5

페이지 구조

CSS3

배경 전환, 반응형, 애니메이션

JavaScript

카운트다운/전환/PWA

Service Worker

캐싱 및 오프라인 처리

Web Manifest

PWA 구성

📦 핵심 파일 설명

🔹 manifest.json

{
  "name": "AI EXPO KOREA 2026",
  "short_name": "AIEXPO",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#ffffff",
  "icons": [
    { "src": "icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}

🔹 sw.js 구조

self.addEventListener('install', ...)
self.addEventListener('activate', ...)
self.addEventListener('fetch', ...)

🚀 로컬 실행 방법

방법 1 — 파일 직접 실행

index.html을 브라우저로 열기만 하면 됩니다.

방법 2 — VSCode Live Server

Right click → Open with Live Server

🌐 GitHub Pages 배포

Repository 생성 후 파일 업로드

Settings → Pages 이동

Branch: main / Folder: /root

저장

자동 배포됨 → URL 접속하면 PWA 정상 작동

🧩 확장 아이디어

다국어(영·한) 지원

행사 일정표 / 프로그램 세션 추가

참가 기업 리스트 & 부스 안내

스폰서 로고 슬라이드

인터랙티브 지도

모바일 UI 강화 애니메이션

📄 요약

AI EXPO KOREA 2026 웹앱은 행사 홍보를 위한 완전한 PWA 기반 랜딩 페이지로,모바일 설치, 오프라인 접근, 반응형 디자인까지 구현된 실전형 프로젝트입니다.

