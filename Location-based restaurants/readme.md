# 🍽️ FoodMap — 위치 기반 맛집 탐색/추천 올인원 웹앱

## ⭐ 프로젝트 소개

FoodMap은 **실시간 위치 기반 맛집 탐색**, **상세 정보 조회**, **검색·경로 최적화**, **커뮤니티**, **인사이트 분석**, **마이페이지 기능**까지 포함한 **종합 맛집 탐색 웹앱**입니다.

React + TypeScript + Vite 환경에서 구축되었으며, 지도 기반 서비스를 중심으로 사용자의 이동·검색·저장·분석 경험을 하나의 앱에서 제공하도록 설계되었습니다.

## 📌 프로젝트 개요

React + Vite 기반의 **위치 기반 음식점 탐색/추천 웹앱**입니다. 지도 기반 UI, 검색, 상세 정보, 길찾기, 커뮤니티, 마이페이지 등 핵심 기능을 포함합니다.

---

## 📁 폴더 구조

아래는 실제 프로덕션 수준 구조로 설계된 FoodMap 전체 구조입니다 — 기능별 폴더 분리가 명확하여 유지보수 및 확장성이 뛰어납니다.

```
FoodMap/
├── index.html
├── package.json
├── vite.config.ts
├── .env
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── config.ts
│   ├── utils/
│   ├── styles/
│   ├── components/
│   │   ├── MapView.tsx
│   │   ├── RestaurantCard.tsx
│   │   ├── RestaurantDetail.tsx
│   │   ├── WalkingTracker.tsx
│   │   ├── RouteOptimizer.tsx
│   │   ├── FavoritesList.tsx
│   │   └── ui/
│   └── pages/
│       ├── HomePage.tsx
│       ├── SearchPage.tsx
│       ├── CommunityPage.tsx
│       ├── InsightsPage.tsx
│       └── MyPage.tsx
```

---

## 🚀 핵심 기능 상세

FoodMap은 단순 맛집 검색 앱이 아니라, 사용자 행동 기반 추천과 이동 분석까지 포함한 **엔드 투 엔드 맛집 탐색 플랫폼**입니다.

### 🔍 1. 위치 기반 맛집 탐색

* 지도(MapView) 기반 위치 탐색
* 마커 클릭 → 상세 모달(RestaurantDetail)
* 현재 위치 자동 가져오기 지원

### 📝 2. 맛집 상세 정보

* 영업시간, 메뉴, 연락처, 사진 등 상세 정보
* 즐겨찾기 추가/삭제 기능

### 🗺️ 3. 길찾기 & 경로 최적화

* RouteOptimizer.tsx에서 최단거리 계산 로직 제공
* 사용자 위치 기반 이동 경로 시각화

### 🚶 4. 워킹 트래커 (WalkingTracker)

* 지도 위에서 이동 경로 기록
* 총 이동 거리 계산

### 🔎 5. 검색(SearchPage)

* 키워드 기반 음식점 검색
* 빠른 필터링 & 검색 결과 카드 UI(RestaurantCard)

### ⭐ 6. 즐겨찾기(FavoritesList)

* 로컬 저장 기반 즐겨찾기 리스트 관리
* 카드 형태 UI 제공

### 📊 7. 인사이트(InsightsPage)

* 방문 기록/선호도 기반 분석 페이지

### 💬 8. 커뮤니티(CommunityPage)

* 사용자 후기/리뷰 공유 페이지

### 👤 9. 마이페이지(MyPage)

* 사용자 정보, 방문 기록, 즐겨찾기 조회

---

## 🧩 기술 스택

FoodMap은 최신 프론트엔드 기술과 지도 기반 API를 활용해 제작되었습니다.

| 영역       | 기술                                     |
| -------- | -------------------------------------- |
| Frontend | React, TypeScript, Vite                |
| 지도       | (예상) Leaflet / Mapbox / Kakao Maps API |
| 스타일      | TailwindCSS or Custom CSS              |
| 상태관리     | useState + 자체 로직 기반                    |
| 유틸리티     | geolocation, 거리 계산, 경로 최적화             |

---

## 🔐 환경 변수 (.env)

API Key를 포함한 민감한 정보는 반드시 .env 파일에 설정합니다. (프로덕션에서는 서버 프록시 권장)
(.env)
지도/외부 API 사용 시 아래 형태로 구성

```
VITE_MAP_API_KEY=your_key
```

---

## 🏃 실행 및 빌드 방법

```
npm install
npm run dev
```

→ [http://localhost:5173](http://localhost:5173) 실행

---

## 📄 프로젝트 요약

FoodMap은 단순 맛집 리스트를 보여주는 수준을 넘어서, **실제 상용 앱 수준의 구조·기능·확장성**을 갖추고 있습니다.

FoodMap은 **지도 기반 맛집 탐색**을 위한 React 앱으로, 검색·길찾기·즐겨찾기·워킹트래커 등 실제 서비스 수준의 기능 구조를 갖추고 있습니다.
