```md
# 📡 AI EXPO KOREA 2026 — PWA 홍보 웹앱

## 👥 팀원 구성
- 임선우: 프론트엔드 개발 / UI 인터랙션
- 권법진: 프로젝트 총괄 / 메인 개발 / PWA 구조 설계
- 김종현: 디자인 / 이미지 리소스 관리
- 이동현: 문서화 / 기능 검증 및 테스트

---

## 🖼 프로젝트 스크린샷
![메인 화면 스크린샷](./screenshot-main.png)

---

## 📌 프로젝트 개요
AI EXPO KOREA 2026 행사 정보를 소개하는 **반응형 + PWA 기반** 웹앱입니다.
행사 일정, 로고 애니메이션, 배경 이미지 전환, 모바일 설치(PWA), 오프라인 접근 등을 포함합니다.
이 프로젝트는 **100% HTML/CSS/JS 기반**으로 GitHub Pages 또는 Netlify에서 즉시 배포 가능합니다.

---

## 📁 폴더 및 파일 구조
```

AI-EXPO-2026/
├── index.html
├── style.css
├── sw.js
├── manifest.json
├── icon-192.png
├── icon-512.png
├── bg1.jpg
├── bg2.jpg
├── bg3.jpg
├── 1.jpg
├── poster.jpg
├── screenshot-main.png

````

---

## 🎨 주요 UI 구성 요소
### 1. Hero Section
- 행사 로고 및 일정 표시
- 풀스크린 배경 이미지 적용

### 2. 배경 전환 효과
- bg1, bg2, bg3 이미지 전환

### 3. 카운트다운 UI
- 행사일까지 남은 시간을 표시

---

## 📱 PWA 기능
### manifest.json
- 앱 이름, 아이콘, 테마 정의

### sw.js
- 오프라인 캐싱
- install / activate / fetch 이벤트 처리

---

## 🛠 기술 스택
| 기술 | 설명 |
|------|------|
| HTML5 | 페이지 구조 |
| CSS3 | 반응형 / 애니메이션 |
| JavaScript | 기능 로직 |
| Service Worker | 오프라인 처리 |
| Manifest | PWA 설정 |

---

## 📦 핵심 파일 설명
### manifest.json
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
````

### sw.js

```js
self.addEventListener('install', ...)
self.addEventListener('activate', ...)
self.addEventListener('fetch', ...)
```

---

## 🚀 로컬 실행 방법

### 1) 파일 직접 실행

index.html을 브라우저로 열기

### 2) VSCode Live Server

오른쪽 클릭 → Open with Live Server

---

## 🌐 GitHub Pages 배포 방법

1. 레포 생성 후 파일 업로드
2. Settings → Pages 이동
3. Branch: main / Folder: root 선택
4. 저장 후 자동 배포

---

## 🧩 확장 아이디어

* 다국어 지원
* 일정표 추가
* 참가 기업 리스트
* 스폰서 섹션
* 모바일 인터랙션 강화

---

## 📄 요약

AI EXPO KOREA 2026 웹앱은 행사 홍보를 위한 **완전한 PWA 랜딩 페이지**입니다.

```
```
