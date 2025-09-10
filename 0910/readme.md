# 🚀 자기소개 & 포트폴리오 사이트

## 📌 프로젝트 개요

* **이름**: 권법진 자기소개 웹사이트
* **목적**: 반응형 자기소개 페이지 제작 (HTML/CSS/JS)
* **특징**: 오디오, 비디오 포함 · 4개 이상의 페이지 구성 · 네비게이션 연결
* **배포**: [GitHub Pages](https://gwonbubjin.github.io/)

---

## 🗂️ 페이지 구성

### 1) 소개 (`index.html`)

* 자기소개 히어로 섹션
* "프로젝트 보러가기", "레포트 보기" 버튼 CTA
* 오디오(`profile.mp3`), 비디오(`intro.mp4`) 포함
* 기술 스택, 바로가기 링크 카드 구성

### 2) 성장기록 (`timeline.html`)

* **타임라인 형식**
* 출생(2003) → 초/중/고교 → 대학 입학 → 군복무(2023 입대, 2024 전역)
* 카드 스타일로 주요 이벤트 정리
* `timeline.css` 별도 스타일 적용

### 3) 자격증 (`certificates.html`)

* 보유/예정 자격증 카드형 보드
* **취득**: 정보처리기능사, 컴활, ITQ(엑셀/한글), GTQ 포토샵
* **합격예정/준비중**: SQLD, ADsP
* 진행률 바, 배지(Badge) 스타일 표시
* `cert.css` 별도 스타일 적용

### 4) 프로젝트 (`project.html`)

* 블로그 카드 스타일 프로젝트 모음
* 대표 프로젝트:

  * ⚾ **HittoStore**: JSP 기반 야구용품 쇼핑몰
  * 💊 **Pilly**: Android 복약 관리 앱 (Firebase 연동)
  * 🛠 **시스템 설계 및 구축**: 요구분석 → ERD → DB 설계 → 배포 자동화
* 검색(Search) + 필터(Chips) 기능
* `project.css` 별도 스타일 적용

### 5) 포트폴리오 (`portfolio.html`)

* 외부 GitHub Pages(`https://gwonbubjin.github.io/`)로 연결
* 리다이렉트 or 네비 직접 링크 처리

---

## 🎨 스타일 가이드

* 전역 스타일: `style.css`
* 다크 테마, 반응형 레이아웃 적용
* 컴포넌트화된 카드 디자인
* 버튼 스타일: `.btn.primary`, `.btn.outline`
* 네비게이션: sticky header, 모바일 토글 지원

---

## 📁 폴더 구조

```
📦 프로젝트 루트
 ┣ 📜 index.html
 ┣ 📜 timeline.html
 ┣ 📜 project.html
 ┣ 📜 certificates.html
 ┣ 📜 portfolio.html (외부 링크 또는 리다이렉트)
 ┣ 📂 assets
 ┃ ┣ 📂 css
 ┃ ┃ ┣ style.css
 ┃ ┃ ┣ timeline.css
 ┃ ┃ ┣ project.css
 ┃ ┃ ┗ cert.css
 ┃ ┣ 📂 js
 ┃ ┃ ┗ main.js
 ┃ ┣ 📂 img
 ┃ ┃ ┣ profile.jpg
 ┃ ┃ ┣ hitto-thumb.jpg
 ┃ ┃ ┣ pilly-thumb.jpg
 ┃ ┃ ┗ system-thumb.jpg
 ┃ ┗ 📂 media
 ┃   ┣ profile.mp3
 ┃   ┗ intro.mp4 (10MB 테스트 영상)
```

---

## 🛠️ 기술 스택

* **Frontend**: HTML5, CSS3, JavaScript
* **Deploy**: GitHub Pages
* **Assets**: 오디오/비디오, 이미지 리소스 포함

---

## 🌟 추가 구현 사항

* 반응형 지원 (모바일/PC 자동 최적화)
* 오디오/비디오 플레이어 다크 테마 스타일링
* 프로젝트 카드 검색 및 필터 기능 (JavaScript)
* 자격증 카드 진행률(Progress bar) 구현

---

## 📌 향후 개선 아이디어

* Contact 페이지 (이메일, GitHub, LinkedIn)
* 블로그/학습노트 섹션 추가 (SQLD/ADsP 학습 기록)
* 라이트/다크 모드 토글
* 프로젝트별 상세 페이지 연결

