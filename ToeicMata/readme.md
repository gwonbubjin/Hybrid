# 📘 TOEIC Mate — 토익 학습 AI 웹앱

이 프로젝트는 **React + Vite + TailwindCSS** 기반으로 구현된 토익 학습 보조 웹앱입니다.

단순한 문제 풀이 앱을 넘어서,

* 파트별 학습 (Part 1 ~ Part 7)
* AI 기반 문제 생성
* 오답 단어 자동 추출
* AI 약점 분석 리포트
* 모의고사 모드 & 학습 통계 대시보드
* AI 채팅 튜터

까지 포함한 **올인원 TOEIC 학습 코치**를 목표로 설계되었습니다.

---

## 📌 프로젝트 개요

* **앱 이름**: TOEIC Mate
* **목표**: 토익 학습 전 과정을 "기록 → 분석 → 피드백 → 재학습" 흐름으로 자동화
* **구현 방식**:

  * SPA(Single Page Application) 구조의 React 앱
  * TailwindCSS 유틸리티 기반 디자인
  * Recharts를 활용한 학습 통계 시각화
  * Anthropic Claude API를 활용한 AI 문제 생성 / 약점 분석 / 튜터링 (프론트엔드에서 직접 호출 예시 포함)

---

## 📁 폴더 구조

```bash
toeicmate/
├── index.html                # 메인 HTML 템플릿
├── package.json              # 의존성 & 스크립트 정의
├── package-lock.json
├── vite.config.js            # Vite 설정
├── tailwind.config.js        # TailwindCSS 설정
├── postcss.config.js         # PostCSS 설정
├── eslint.config.js          # ESLint 설정
├── .env                      # (선택) API Key 등 환경 변수
├── public/
│   └── vite.svg              # 기본 아이콘
└── src/
    ├── main.jsx              # React 엔트리 (StrictMode + <App />)
    ├── index.jsx             # 렌더링 엔트리 (createRoot)
    ├── index.css             # 전역 스타일 (Tailwind base/components/utilities, 스크롤바 스타일 등)
    ├── App.css               # 기본 샘플 스타일 (일부만 사용)
    ├── App.jsx               # ▶ 핵심 로직이 모두 들어있는 메인 컴포넌트
    └── assets/               # 이미지 및 정적 리소스
```

📌 실제 핵심은 **`src/App.jsx`** 하나에 대부분의 비즈니스 로직이 모여 있는 형태입니다.

---

## ✨ 주요 기능 요약

### 1️⃣ 홈 대시보드

* 현재 레벨: **Bronze / Silver / Gold / Platinum** 구간
* 누적 포인트, 연속 학습 일수(streak), 목표 점수/현재 점수 표시
* 오늘 푼 문제 수, 파트별 정확도, 학습 추천 영역
* Recharts 기반 차트로 **점수 추이, 파트별 정확도, 시간 대비 학습량** 시각화

### 2️⃣ 파트별 연습 모드 (Practice)

* TOEIC Part 1 ~ Part 7에 해당하는 파트 리스트
* 각 파트별로:

  * 기본 내장 문제(questionBank)
  * AI가 생성한 문제(aiGeneratedQuestions)
  * 난이도, 문제 수, 간단한 설명, 이모지 아이콘 등 표시
* 문제 풀이 화면에서 제공되는 기능:

  * 보기 선택 → 정오 판단 & 해설 출력
  * 정답/오답 UI 피드백
  * 오답 시 단어 추출 로직과 연계
  * "AI에게 질문" 버튼으로 해당 문제를 AI 튜터에게 바로 넘겨 추가 설명 요청

### 3️⃣ 모의고사 모드 (Mock Test)

* 2시간 실전 모드 느낌의 타이머(Clock 아이콘 + 남은 시간 표시)
* 파트 전체를 한 번에 묶어 연속 문제 풀이 가능
* 마지막에 요약 결과 제공 (정답 수, 정답률 등)

### 4️⃣ AI 문제 생성 (Generate AI Question)

* 모든 파트에서 **AI 문제 생성 버튼** 제공
* Anthropic Messages API를 호출해 파트별 포맷에 맞는 JSON 문제를 생성
* 생성된 문제는 `aiGeneratedQuestions[partId]`에 누적 저장되어 기존 문제 뒤에 이어서 출제
* 각 파트별로 시스템 프롬프트를 세분화:

  * Part 1: 사진/상황 묘사
  * Part 2: 질의응답 형식
  * Part 3,4: 대화/지문 기반 듣기
  * Part 5,6,7: 문법/공란/독해 문제

> ⚠️ 실제 서비스에서는 **API 키 노출 방지**를 위해 프론트에서 바로 Anthropic API를 호출하지 말고,
> **백엔드 프록시 서버**를 두는 것을 권장합니다.

### 5️⃣ 오답 단어 자동 추출 (Vocabulary Builder)

* 사용자가 문제를 틀릴 때마다 해당 문제를 AI에 넘겨 **핵심 단어 2~3개를 JSON 형태로 추출**
* 이 단어 리스트를 `vocabulary` 상태로 관리
* "나만의 단어장" 화면에서:

  * 오답에서 모인 단어 리스트
  * 품사, 뜻, 예문, 난이도 등(프롬프트 설계에 따라 확장 가능)

### 6️⃣ AI 약점 분석 리포트

* 파트별 정답률, 오답 패턴, 소요 시간 등을 기반으로 한 약점 분석 요청
* AI가 리포트 JSON을 반환한다고 가정하고, UI에서 다음을 보여줌:

  * 가장 취약한 파트 & 유형
  * 추천 학습 전략
  * 예상 점수 향상 폭
  * 예상 향상 기간
  * 한국어 응원 메시지
* 결과는 모달 형태의 **"AI 약점 분석 리포트"**로 보여줌

### 7️⃣ AI 튜터 채팅 화면 (Chat)

* 일반적인 Q&A + 토익 학습 관련 질문을 처리하는 **채팅 UI**
* 사용자가 입력한 메시지를 Anthropic API로 전달하고, 응답을 말풍선 형태로 렌더링
* 추천 질문 버튼: "Part 5 문법 팁", "듣기 향상 방법" 등 프리셋

### 8️⃣ 학습 통계 & 추천 (Stats)

* Recharts를 사용하여:

  * 파트별 정답률 레이더 차트
  * 날짜별 학습량/점수 추이 라인 차트
  * 문제 유형별 정확도 바 차트 등
* 통계를 바탕으로 **"AI 추천 학습" 카드**에서 가장 약한 파트를 골라 집중 연습 버튼 제공

### 9️⃣ 사용자 계정 & 설정 (Settings)

* 로그인/회원가입 모달 레이아웃 구현
* 로그인 전/후 다른 UI 노출
* 계정 정보, 목표(하루 학습 문제 수), 데이터 초기화 버튼 등 제공
* `window.storage`와 백엔드 동기화를 염두에 둔 `syncDataToBackend` 구조 존재

---

## 🧠 상태 관리 & 데이터 구조 개요

주요 상태 값 예시:

* `currentScreen`: 현재 화면 (home / practice / stats / vocabulary / settings / chat)
* `userLevel`, `streak`, `totalPoints`, `currentScore`, `targetScore`
* `toeicParts`: Part 1~7 메타데이터 (이름, 타입, 문제 수, 설명, 컬러 등)
* `questionBank`: 파트별 기본 문제 세트 (리딩/리스닝 텍스트, 보기, 정답, 해설)
* `aiGeneratedQuestions`: 파트별 AI 생성 문제 배열
* `practiceHistory`: 날짜별/파트별 풀이 기록
* `vocabulary`: 오답에서 추출된 단어 데이터
* `weaknessAnalysis`: AI 약점 분석 결과(JSON)

데이터는 로컬 상태 + (선택적으로) `window.storage` / 백엔드에 저장하는 구조로 작성되어 있어,
추후 DB 연동/회원 시스템으로 확장하기 좋게 설계되어 있습니다.

---

## 🧩 사용 기술 스택

| 영역        | 기술                                           |
| --------- | -------------------------------------------- |
| 프론트엔드     | React 18, Vite                               |
| 스타일링      | TailwindCSS, Custom CSS(index.css, App.css)  |
| 차트        | Recharts (LineChart, RadarChart, BarChart 등) |
| 아이콘       | lucide-react                                 |
| 번들러/도구    | Vite, PostCSS, Autoprefixer                  |
| 품질 관리     | ESLint                                       |
| AI 연동(예시) | Anthropic Messages API (Claude 기반)           |

---

## 🚀 로컬 실행 방법

### 1️⃣ 의존성 설치

```bash
npm install
```

### 2️⃣ 개발 서버 실행

```bash
npm run dev
```

* 기본적으로 `http://localhost:5173`에서 앱 실행

### 3️⃣ 프로덕션 빌드

```bash
npm run build
```

### 4️⃣ 빌드 결과 미리보기

```bash
npm run preview
```

---

## 🔐 환경 변수 (.env) 예시 (추천)

현재 코드에서는 API 헤더/키 부분이 샘플 형태로만 들어가 있으므로,
실제 서비스로 사용할 경우 다음과 같이 `.env` + 백엔드 프록시를 활용하는 것을 권장합니다.

```bash
VITE_ANTHROPIC_API_KEY=your_api_key_here
VITE_API_BASE_URL=https://your-backend.example.com
```

프론트엔드에서는 직접 키를 쓰지 말고, 백엔드 엔드포인트로만 요청을 보내는 구조로 변경하는 것이 안전합니다.

---

## 🌐 배포 아이디어

* Vercel / Netlify에 바로 배포 가능 (Vite + React 기본 구조)
* GitHub Pages 사용 시:

  * `vite.config.js`에 `base: '/repo-name/'` 설정
  * `npm run build` 후 `dist/`를 Pages에 연결

---

## 📌 향후 확장 아이디어

* Firebase/Auth0 등을 통한 실제 회원가입/로그인 구현
* 서버 DB(MySQL, PostgreSQL 등) + Prisma/TypeORM을 활용한 학습 기록 영구 저장
* TTS/STT 연동으로 **리스닝 파트 실제 음성 재생** 지원
* 모바일 PWA 지원 (서비스워커 + manifest.json 추가)
* 랜덤 데일리 미션, 출석 체크 시스템, 친구와 경쟁하는 랭킹 보드 등 게이미피케이션 요소

---

## 📝 정리

TOEIC Mate는 **UI/UX + AI 연동 + 학습 데이터 구조**까지 하나의 파일(App.jsx)에 잘 녹여 둔 토익 학습 웹앱 템플릿입니다.

* 토익 포트폴리오용 프로젝트로 발전시키거나,
* 백엔드와 연동해 실제 서비스 수준으로 확장하거나,
* 다른 시험(토플, 오픽 등)으로 문제 데이터/프롬프트만 바꾸어 재사용하기에도 좋은 구조입니다.

필요하다면 이 README에 맞춰 **영문 버전**이나 **배포 전용 간소화 버전**도 따로 만들어 줄 수 있습니다.

