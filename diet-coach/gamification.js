// ==========================================
// GAMIFICATION MODULE
// ==========================================

// 연속 기록 계산 (Streak)
export const calculateStreak = async (supabase, userId) => {
    try {
        const { data: logs, error } = await supabase
            .from('food_logs')
            .select('date')
            .eq('user_id', userId)
            .order('date', { ascending: false });

        if (error) throw error;
        if (!logs || logs.length === 0) return 0;

        const uniqueDates = [...new Set(logs.map(log => log.date))].sort().reverse();
        let streak = 0;
        const today = new Date();

        for (let i = 0; i < uniqueDates.length; i++) {
            const expectedDate = new Date(today);
            expectedDate.setDate(today.getDate() - i);

            // 한국 시간으로 변환
            const koreaOffset = 9 * 60;
            const koreaTime = new Date(expectedDate.getTime() + (koreaOffset + expectedDate.getTimezoneOffset()) * 60000);
            const expectedStr = koreaTime.toISOString().split('T')[0];

            if (uniqueDates[i] === expectedStr) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    } catch (error) {
        console.error('❌ Streak calculation error:', error);
        return 0;
    }
};

// Streak 배지 표시
export const displayStreakBadge = (streak) => {
    if (streak === 0) return '';

    let emoji = '🔥';
    let message = `${streak}일 연속 기록 중!`;
    let color = '#FF6D00';

    if (streak >= 30) {
        emoji = '🏆';
        message = `${streak}일 연속! 대단해요!`;
        color = '#FFD700';
    } else if (streak >= 14) {
        emoji = '⭐';
        message = `${streak}일 연속! 멋져요!`;
        color = '#FFA500';
    } else if (streak >= 7) {
        emoji = '💪';
        message = `${streak}일 연속! 잘하고 있어요!`;
        color = '#FF8C00';
    }

    return `
        <div style="
            background: linear-gradient(135deg, ${color}22, ${color}11);
            border: 2px solid ${color};
            border-radius: 16px;
            padding: 12px 16px;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            animation: pulse 2s ease-in-out infinite;
        ">
            <span style="font-size: 32px;">${emoji}</span>
            <div>
                <div style="font-weight: 700; font-size: 16px; color: ${color};">
                    ${message}
                </div>
                <div style="font-size: 12px; color: var(--text-sub); margin-top: 4px;">
                    계속 이어가세요!
                </div>
            </div>
        </div>
    `;
};

// 목표 달성 체크
export const checkGoalAchievement = (consumed, target) => {
    const percentage = (consumed / target) * 100;
    const diff = Math.abs(consumed - target);
    const diffPercentage = (diff / target) * 100;

    // ±10% 이내면 목표 달성
    if (diffPercentage <= 10) {
        return {
            achieved: true,
            message: '🎉 오늘의 목표 달성!',
            icon: '🏆'
        };
    } else if (percentage < 90) {
        return {
            achieved: false,
            message: `${Math.round(target - consumed)}kcal 더 필요해요`,
            icon: '💪'
        };
    } else if (percentage > 110) {
        return {
            achieved: false,
            message: `${Math.round(consumed - target)}kcal 초과했어요`,
            icon: '⚠️'
        };
    }

    return {
        achieved: false,
        message: '조금만 더!',
        icon: '🔥'
    };
};

// 축하 애니메이션 트리거
export const triggerCelebration = () => {
    // 간단한 confetti 효과 (CSS 애니메이션)
    const celebration = document.createElement('div');
    celebration.className = 'celebration-overlay';
    celebration.innerHTML = `
        <div class="celebration-content">
            <div class="trophy-icon">🏆</div>
            <div class="celebration-text">목표 달성!</div>
            <div class="celebration-subtext">훌륭해요! 계속 이어가세요!</div>
        </div>
    `;
    document.body.appendChild(celebration);

    setTimeout(() => {
        celebration.style.opacity = '0';
        setTimeout(() => celebration.remove(), 500);
    }, 3000);
};
