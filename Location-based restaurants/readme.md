# 🍽️ FoodMap — 위치 기반 맛집 탐색 웹앱

## 📌 프로젝트 개요

React + Vite 기반의 **위치 기반 음식점 탐색/추천 웹앱**입니다. 지도 기반 UI, 검색, 상세 정보, 길찾기, 커뮤니티, 마이페이지 등 핵심 기능을 포함합니다.

---

## 📁 폴더 구조

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

## 🚀 주요 기능

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

| 영역       | 기술                                     |
| -------- | -------------------------------------- |
| Frontend | React, TypeScript, Vite                |
| 지도       | (예상) Leaflet / Mapbox / Kakao Maps API |
| 스타일      | TailwindCSS or Custom CSS              |
| 상태관리     | useState + 자체 로직 기반                    |
| 유틸리티     | geolocation, 거리 계산, 경로 최적화             |

---

## 🔐 환경 변수 (.env)

지도/외부 API 사용 시 아래 형태로 구성

```
VITE_MAP_API_KEY=your_key
```

---

## 🏃 실행 방법

```
npm install
npm run dev
```

→ [http://localhost:5173](http://localhost:5173) 실행

---

## 📄 요약

FoodMap은 **지도 기반 맛집 탐색**을 위한 React 앱으로, 검색·길찾기·즐겨찾기·워킹트래커 등 실제 서비스 수준의 기능 구조를 갖추고 있습니다.
