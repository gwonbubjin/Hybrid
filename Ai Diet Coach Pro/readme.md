# 🍽️ AI Diet Coach Pro

AI Diet Coach Pro는 **AI 기반 식단 분석 + 칼로리/체중 관리 + 물 섭취 트래킹 + 게이미피케이션**을 한 번에 제공하는 모바일 최적화 PWA(Progressive Web App)입니다.
Supabase를 백엔드로 사용하고, Google Gemini API를 통해 사용자의 식단을 자동 분석해 건강 점수와 피드백을 제공합니다.

---

## ✨ 주요 기능

### 1. 회원가입 · 로그인 · 온보딩

* Supabase Auth 기반 이메일 회원가입/로그인
* 성별, 나이, 키, 몸무게, 활동량, 목표(체중 감량/유지/증가) 입력
* 입력값을 기반으로 BMR/TDEE/목표 칼로리 자동 계산
* 자동 로그인 토글 기능 (`localStorage`에 `autoLogin` 저장)

### 2. 홈 탭 – 오늘 식단 & 요약

* 오늘 날짜 기준 식단 카드 리스트 표시
* 아침/점심/저녁/간식 등 식사별 로그 조회
* 각 식단에 대해:

  * 섭취 칼로리, 탄단지 비율, 메모, 태그 등 표시
  * AI 분석 결과(장점, 단점, 권장 활동, health_score) 표시
* 상단 카드에서 **오늘 섭취 칼로리 vs 목표 칼로리** 한 눈에 확인

### 3. 기록 탭 – 캘린더 기반 히스토리

* 달력 형태로 날짜별 섭취 칼로리/로그 개수 요약
* 날짜 클릭 시 해당 날짜 식단 리스트를 우측 패널/하단에 표시
* 빈 날짜에 대한 “첫 기록 유도” 빈 상태(Empty State) 처리

### 4. 통계 탭 – 시각화 대시보드

* Chart.js 기반 통계 차트

  * 도넛 차트: 오늘/기간별 탄수화물·단백질·지방 비율
  * 칼로리 추이 차트: 날짜별 총 섭취 칼로리
  * 체중 변화 차트: `weight_logs` 기반 몸무게 변화
  * 레이더 차트: AI 건강 점수, 규칙성, 수분, 칼로리 관리 등 종합 지표
* 스켈레톤 UI, 빈 상태 메시지로 UX 강화

### 5. 물 섭취 트래커 (`water-tracker.js`)

* 8잔 기준 물 섭취 목표 관리
* 컵 아이콘 클릭 시 카운트 증가/감소
* **오늘 날짜 기준** 물 섭취량을 `localStorage`에 저장 (`water-YYYY-MM-DD`)
* 목표 달성 시 토스트 알림: `🎉 오늘의 물 섭취 목표 달성!`

### 6. AI 식단 코치 (Gemini 연동)

* 사용자가 입력한 식단 텍스트/정보를 기반으로:

  * 건강 점수(`health_score`)
  * 장점(pros) / 단점(cons)
  * 추천 활동(burn_activity)
  * 요약 코멘트
* 결과는 Supabase `food_logs` 테이블에 저장 후 UI에 표시

### 7. 게이미피케이션 & 연속 기록 (Streak)

* `gamification.js`, `enhancements.js` 기반 기능
* 연속 기록 일수(Streak) 계산

  * Supabase `food_logs`에서 날짜 목록 조회 후 한국 시간 기준으로 연속성 체크
* Streak에 따라 칭호/배지, 동기부여 메시지(이모지 카드) 생성
* 홈/프로필 영역에 “오늘도 기록 중입니다!” 등 피드백 제공

### 8. 프로필/마이 탭

* 현재 프로필 정보(성별, 나이, 키, 몸무게, 활동량, 목표 등) 조회
* 목표 칼로리, 활동량 설정값을 다시 확인/수정 가능 (구현 수준에 따라 제한적일 수 있음)
* 로그아웃, 자동 로그인 설정 토글

---

## 🗂️ 파일 구조

```bash
.
├─ index.html           # 메인 진입 페이지 (모바일 최적화 UI + 탭 구조)
├─ style.css            # 전체 테마/레이아웃/컴포넌트 스타일
├─ enhancements.css     # 게이미피케이션, 빈 상태, 스켈레톤 스타일
├─ app.js               # 핵심 로직 (Auth, 온보딩, 식단/통계/차트/네비게이션)
├─ water-tracker.js     # 물 섭취 트래커 전용 로직
├─ gamification.js      # Streak, 칭호, 동기부여 카드 등 게이미피케이션
├─ enhancements.js      # 프로덕션용 UX 개선(빈 상태 처리, 검증, Streak 표시 등)
├─ utils.js             # 공통 유틸(유효성 검사, 날짜 포맷, Empty State 생성 등)
├─ manifest.json        # PWA 메니페스트 (앱 이름/아이콘/테마색 등)
├─ sw.js                # Service Worker (개발용 - 캐시 비활성화 모드)
├─ test-modal.html      # 모달 디버깅용 테스트 페이지
├─ schema.sql           # Supabase 초기 스키마 (users, food_logs, policies)
├─ schema_v2.sql        # 스키마 확장 (gender, activity_level, weight_logs 등)
├─ trigger.sql          # auth.users → public.users 동기화 트리거 (v1)
└─ trigger_v2.sql       # 트리거 확장 버전 (프로필/체중 로그 자동 삽입)
```

---

## 🏗️ 기술 스택

### 프론트엔드

* HTML5, CSS3, JavaScript(ES6+)
* Chart.js (통계 차트)
* PWA:

  * `manifest.json`
  * `sw.js` (Service Worker, 현재는 캐시 비활성화 + 네트워크 우선)

### 백엔드 · 데이터

* Supabase

  * Auth (이메일 기반 로그인/회원가입)
  * Postgres DB (`users`, `food_logs`, `weight_logs` 등)
  * Row Level Security(행 단위 보안) 정책
* SQL 스키마 & 트리거

  * `schema.sql`, `schema_v2.sql`
  * `trigger.sql`, `trigger_v2.sql`

### AI

* Google Gemini API (식단 텍스트 분석 및 건강 피드백 생성)

---

## 🗄️ 데이터베이스 설계 (요약)

### 1. `public.users`

* `id (uuid, PK)` – `auth.users.id` 참조
* `height (numeric)`
* `weight (numeric)`
* `goal (text)` – `gain / lose / maintain`
* `daily_calorie_target (int)`
* `gender (text)` – `male / female`
* `age (int)`
* `activity_level (numeric)`
* `target_weight (numeric)`
* `updated_at (timestamptz)`

### 2. `public.food_logs`

* `id (bigserial, PK)`
* `user_id (uuid)` – `auth.users.id` 참조
* `date (date)`
* `meal_type (text)` – 아침/점심/저녁/간식 등
* `description (text)` – 식단 설명
* `calories (int)`
* `carbs / protein / fat (numeric)` – macro 비율
* `health_score (int)` – AI 분석 점수
* `burn_activity (text)` – 추천 활동
* `pros / cons (text)` – 장점/단점 코멘트
* RLS 정책: 각 유저는 자신의 로그만 조회/삽입/삭제 가능

### 3. `public.weight_logs`

* `id (bigserial, PK)`
* `user_id (uuid)`
* `weight (numeric)`
* `date (date)`
* `created_at (timestamptz)`

### 4. 트리거 (`trigger_v2.sql`)

* `auth.users`에 새 유저 생성 시:

  * `public.users`에 프로필 기본값 자동 삽입
  * `public.weight_logs`에 초기 체중 기록 자동 삽입

---

## 🚀 실행 방법

> 이 프로젝트는 **정적 파일 기반 PWA**이므로, 간단한 정적 서버만 있으면 됩니다.

### 1) 로컬 개발 환경

1. 이 리포지토리를 클론 또는 ZIP 다운로드 후 압축 해제
2. VS Code 기준:

   * Live Server 확장 프로그램 설치 후 `index.html`을 “Open with Live Server”
   * 또는 아래 명령으로 간단 서버 실행:

     ```bash
     # Node가 설치되어 있다면
     npx serve .
     # 또는
     python -m http.server 8000
     ```
3. 브라우저에서 `http://localhost:8000` (또는 Live Server가 알려주는 주소) 접속

### 2) Supabase 설정

1. [Supabase](https://supabase.com/) 프로젝트 생성
2. Project Settings → **API** 탭에서

   * Project URL
   * anon/public key 확인
3. SQL Editor에서 아래 파일을 순서대로 실행

   1. `schema.sql`
   2. `schema_v2.sql`
   3. `trigger.sql` 또는 `trigger_v2.sql` (최신 버전 권장)
4. RLS 정책과 테이블이 정상적으로 생성되었는지 확인

### 3) 환경 변수 & 키 설정

현재 `app.js`에는 예시용으로 다음 값이 하드코딩되어 있습니다:

```js
const SUPABASE_URL = '...';
const SUPABASE_KEY = '...';     // Supabase anon key
const GEMINI_API_KEY = '...';   // Google Gemini API key
```

실제 운영/배포 시에는 **반드시 다음 방식으로 보안 강화**가 필요합니다.

* 프론트에 직접 API Key를 노출하지 말 것
* 추천 방식:

  * 백엔드(Cloud Functions, 서버리스 함수 등)를 두고 거기에서 Gemini 호출
  * `.env` 파일 + 빌드 도구(Vite/Next 등)를 사용해 환경 변수를 주입
  * Supabase anon key만 프론트에 두고, 나머지 민감한 키는 서버에서 관리

---

## 📱 PWA 동작 방식

* `manifest.json`

  * 앱 이름, 아이콘, 테마 색, 시작 URL 설정
  * `display: "standalone"`으로 설치 시 네이티브 앱처럼 동작
* `sw.js`

  * 개발 편의를 위해 현재는 **기존 캐시를 모두 삭제하고 네트워크 우선**으로 동작
  * `install` 단계에서 `skipWaiting()` 호출 → 즉시 활성화
  * `activate` 단계에서 모든 캐시 삭제
  * `fetch` 이벤트에서 네트워크 실패 시에만 캐시 fallback

> 실제 배포 시에는 `sw.js`에 정적 리소스 프리캐시 전략을 적용하면 오프라인에서도 더 안정적으로 동작하게 만들 수 있습니다.

---

## ✅ 유효성 검사 & UX 디테일

* `utils.js`

  * 숫자 범위 검증 (`validateNumber`)
  * 날짜 포맷 헬퍼 (`formatDate`)
  * 공통 Empty State 컴포넌트 생성 (`createEmptyState`)
* `enhancements.js`

  * DOM 로드 후 Streak 영역 초기화
  * 빈 리스트일 때 안내 메시지/아이콘 표시
  * 한국 시간대(KST) 기준 날짜 계산 (UTC 오차 보정)

---

## 🔮 향후 개선 아이디어

* AI 추천 식단/레시피 자동 생성 기능
* 사진 업로드 + 이미지 인식 기반 식단 분석
* 친구/커뮤니티 랭킹, 주간 챌린지 시스템
* 알림(Push Notification)으로 식단 기록/물 섭취/운동 리마인드
* 다국어 지원(한국어/영어 등) 및 접근성(Accessibility) 개선

---

## 📌 요약

AI Diet Coach Pro는 **“매일 기록하고, AI가 분석해주며, 게이미피케이션으로 습관을 유지하게 만드는”** 식단 관리 PWA입니다.
Supabase + Gemini + Chart.js 조합으로, 데이터 저장·AI 분석·시각화까지 한 번에 경험할 수 있도록 설계되었습니다.
