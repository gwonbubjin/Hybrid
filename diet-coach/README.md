# 🍽️ AI Diet Coach Pro

AI 기반 퍼스널 영양 코치 웹앱

## ✨ 주요 기능

- 🤖 **AI 식단 분석**: Gemini AI로 음식 사진/텍스트 분석
- 📊 **영양 추적**: 칼로리, 탄수화물, 단백질, 지방 자동 계산
- 📅 **캘린더**: 식사 기록 달력 뷰
- 📈 **통계**: 7일 칼로리 추이, 체중 변화, 영양 밸런스
- 💧 **물 섭취 트래커**: 하루 8잔 목표 관리
- 🔥 **연속 기록 배지**: 게이미피케이션 요소
- 📱 **PWA**: 모바일 앱처럼 설치 가능

## 🚀 설치 방법

### 1. 저장소 클론
```bash
git clone https://github.com/사용자명/저장소명.git
cd 저장소명
```

### 2. API 키 설정
```bash
# config.example.js를 config.js로 복사
cp config.example.js config.js
```

`config.js` 파일을 열어서 실제 API 키 입력:
```javascript
const CONFIG = {
    SUPABASE_URL: 'your-supabase-url',
    SUPABASE_KEY: 'your-supabase-anon-key',
    GEMINI_API_KEY: 'your-gemini-api-key'
};
```

### 3. Supabase 데이터베이스 설정

Supabase SQL Editor에서 다음 SQL 실행:

```sql
-- users 테이블
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  gender TEXT DEFAULT 'male',
  age INTEGER DEFAULT 25,
  height NUMERIC,
  weight NUMERIC,
  activity_level NUMERIC DEFAULT 1.2,
  goal TEXT DEFAULT 'maintain',
  target_weight NUMERIC,
  daily_calorie_target INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- food_logs 테이블
CREATE TABLE public.food_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  food_name TEXT NOT NULL,
  calories INTEGER,
  carbs NUMERIC,
  protein NUMERIC,
  fat NUMERIC,
  health_score INTEGER,
  ai_feedback TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 활성화 및 정책 설정
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;

-- 트리거 생성 (회원가입 시 자동으로 users 테이블에 추가)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, gender, age, height, weight, activity_level, goal)
  VALUES (
    NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'gender', 'male'),
    COALESCE((NEW.raw_user_meta_data->>'age')::INTEGER, 25),
    COALESCE((NEW.raw_user_meta_data->>'height')::NUMERIC, 170),
    COALESCE((NEW.raw_user_meta_data->>'weight')::NUMERIC, 70),
    COALESCE((NEW.raw_user_meta_data->>'activity_level')::NUMERIC, 1.2),
    COALESCE(NEW.raw_user_meta_data->>'goal', 'maintain')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 4. 로컬 실행
```bash
# 간단한 HTTP 서버 실행
npx serve .

# 또는
python -m http.server 3000
```

브라우저에서 `http://localhost:3000` 접속

## 🌐 GitHub Pages 배포

1. GitHub 저장소 → **Settings**
2. **Pages** 메뉴
3. **Source**: `main` 브랜치 선택
4. **Save**

5분 후 `https://사용자명.github.io/저장소명/` 에서 접속 가능!

## 🛠️ 기술 스택

- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Backend**: Supabase (PostgreSQL)
- **AI**: Google Gemini API
- **Charts**: Chart.js
- **Calendar**: FullCalendar
- **PWA**: Service Worker, Web Manifest

## 📱 PWA 설치

1. 모바일 브라우저에서 접속
2. 브라우저 메뉴 → "홈 화면에 추가"
3. 앱처럼 사용 가능!

## 📄 라이선스

MIT License

## 👨‍💻 개발자

- GitHub: [@사용자명](https://github.com/사용자명)

---

⭐ 이 프로젝트가 도움이 되었다면 Star를 눌러주세요!
