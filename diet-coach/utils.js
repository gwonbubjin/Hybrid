// ==========================================
// PRODUCTION-LEVEL UTILITIES
// ==========================================

// 입력 유효성 검사
export const validateNumber = (value, min, max, fieldName) => {
    const num = Number(value);
    if (isNaN(num)) {
        return { valid: false, message: `${fieldName}은(는) 숫자여야 합니다.` };
    }
    if (num < min || num > max) {
        return { valid: false, message: `${fieldName}은(는) ${min}~${max} 사이여야 합니다.` };
    }
    return { valid: true };
};

// 네트워크 에러 핸들링
export const handleNetworkError = (error, context) => {
    console.error(`❌ Error in ${context}:`, error);

    if (!navigator.onLine) {
        return '⚠️ 인터넷 연결을 확인해주세요.';
    } else if (error.message?.includes('fetch')) {
        return '⚠️ 서버 연결에 실패했습니다.';
    } else {
        return `오류가 발생했습니다: ${error.message}`;
    }
};

// 숫자 카운트업 애니메이션
export const animateNumber = (element, start, end, duration = 1000) => {
    if (!element) return;

    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            element.textContent = Math.round(end);
            clearInterval(timer);
        } else {
            element.textContent = Math.round(current);
        }
    }, 16);
};

// 한국 시간 가져오기
export const getKoreanDate = () => {
    const now = new Date();
    const koreaOffset = 9 * 60;
    const koreaTime = new Date(now.getTime() + (koreaOffset + now.getTimezoneOffset()) * 60000);
    return koreaTime.toISOString().split('T')[0];
};

// 날짜 포맷팅
export const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// 빈 상태 메시지 생성
export const createEmptyState = (icon, message, subMessage = '') => {
    return `
        <div style="text-align: center; padding: 40px 20px; color: var(--text-sub);">
            <div style="font-size: 48px; margin-bottom: 16px;">${icon}</div>
            <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px; color: var(--text-main);">
                ${message}
            </div>
            ${subMessage ? `<div style="font-size: 14px; opacity: 0.7;">${subMessage}</div>` : ''}
        </div>
    `;
};
