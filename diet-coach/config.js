// config.js
const CONFIG = {
    // VITE_ 환경변수에서 키를 가져옵니다.
    SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    SUPABASE_KEY: import.meta.env.VITE_SUPABASE_KEY,
    GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY,
};

export default CONFIG;