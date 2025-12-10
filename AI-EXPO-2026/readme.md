# 📡 AI EXPO KOREA 2026 — PWA 홍보 웹앱

## 📌 프로젝트 개요

AI EXPO KOREA 2026 행사 정보를 소개하는 **반응형 + PWA 기반** 웹앱입니다.
행사 일정, 로고 애니메이션, 배경 이미지, 설치 가능한 앱(PWA), 오프라인 접근 등을 포함하여 실제 전시회 홍보용 랜딩 페이지 형태로 제작되었습니다.

이 프로젝트는 **100% HTML/CSS/JS 기반**으로 구성되어 GitHub Pages 또는 Netlify 등에서 즉시 배포 가능합니다.

---

## 📁 폴더 및 파일 구조

```
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
```

---

## 👥 팀원 구성
- 임선우 — 프론트엔드 개발 / UI 인터랙션
- 권법진 — 프로젝트 총괄 / 메인 개발 / PWA 구조 설계
- 김종현 — 디자인 / 이미지 리소스 관리
- 이동현 — 문서화 / 기능 검증 및 테스트

 ## 👥 팀원 구성
| 이름 | 역할 |
|------|-----------------------------|
| 임선우 | 프론트엔드 개발 / UI 인터랙션 |
| 권법진 | 프로젝트 총괄 / 메인 개발 / PWA 구조 설계 |
| 김종현 | 디자인 / 이미지 리소스 관리 |
| 이동현 | 문서화 / 기능 검증 및 테스트 |

## 🖼 프로젝트 스크린샷
![메인 화면](./screenshot-main.png)

## 🎨 주요 UI 구성 요소

### ✅ 1. Hero Section

* 행사 로고 "AI EXPO KOREA 2026" 표시
* 한국어 부제: **2026 국제인공지능대전**
* 행사 일정: **5.6(수) ~ 5.8(금), COEX Hall A**
* 전체 화면 배경 이미지 적용

### ✅ 2. 배경 전환 효과

* bg1, bg2, bg3 이미지가 번갈아 표시되는 비주얼 섹션
* 페이드 인/아웃 애니메이션으로 전환

### ✅ 3. 카운트다운 UI

* 행사일까지 남은 **D-Day 카운트다운 기능**

---

## 📱 PWA 기능 (모바일 설치 가능)

### ✔ manifest.json 구성

* 앱 이름, 아이콘, PWA 테마 컬러 정의
* 홈화면 설치 지원

### ✔ sw.js 서비스워커

* 캐시 대상 파일 목록 관리
* 오프라인에서도 **페이지 로딩 가능**
* install / activate / fetch 이벤트 적용

### ✔ 설치 가능한 웹앱

* Android Chrome: **"홈 화면에 추가"** 버튼 활성화
* 데스크톱 Chrome: 주소창 우측 설치 아이콘 표시

---

## 🛠 기술 스택

| 기술             | 설명                   |
| -------------- | -------------------- |
| HTML5          | 앱 구조 및 콘텐츠           |
| CSS3           | 애니메이션, 레이아웃, 반응형 디자인 |
| JavaScript     | 카운트다운, 배경전환, PWA 로직  |
| Service Worker | 오프라인 캐싱, 설치 지원       |
| Web Manifest   | PWA 설정               |

---

## 📦 PWA 동작 파일 설명

### 🔹 manifest.json

```json
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
```

### 🔹 sw.js (서비스워커)

* 정적 파일 캐싱
* 네트워크 요청 실패 시 캐시에서 제공
* 오프라인 환경 대응

대략 구조:

```js
self.addEventListener('install', ...)
self.addEventListener('activate', ...)
self.addEventListener('fetch', ...)
```

---

## 🚀 로컬 실행 방법

* 브라우저로 `index.html` 실행
* 또는 VSCode **Live Server** 사용

---

## 🌐 GitHub Pages 배포 방법

1. 레포 생성 → 파일 업로드
2. Settings → Pages 이동
3. Branch: `main` / Folder: `/root` 선택
4. 저장 → 자동 배포

배포 후 PWA 기능 정상 동작

---

## 🧩 개선 및 확장 아이디어

* 영어/한국어 다국어 지원
* 일정표 / 부스 안내 추가
* 참가 기업 리스트
* AI 세션 소개 페이지
* 스폰서 로고 슬라이드 추가
* 모바일 최적화 인터랙션 추가

---

## 📄 요약

AI EXPO 2026 웹앱은 행사를 효과적으로 홍보하고, 모바일에서도 앱처럼 설치해서 사용할 수 있는 **완전한 PWA 랜딩 페이지**입니다.
