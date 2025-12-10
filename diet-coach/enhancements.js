// ==========================================
// PRODUCTION ENHANCEMENTS INTEGRATION
// ==========================================
// 이 파일은 기존 app.js를 건드리지 않고 새로운 기능을 추가합니다

// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Production Enhancements Loading...');

    // Streak 표시 추가
    await initStreakDisplay();

    // 빈 상태 처리 개선
    enhanceEmptyStates();

    // 입력 검증 추가
    addInputValidation();

    // 목표 달성 체크
    addGoalAchievementCheck();

    console.log('✅ Production Enhancements Loaded!');
});

// ==========================================
// STREAK DISPLAY
// ==========================================
async function initStreakDisplay() {
    // state.user가 로드될 때까지 대기
    const checkUser = setInterval(async () => {
        if (window.state && window.state.user) {
            clearInterval(checkUser);

            try {
                const streak = await calculateStreakLocal(window.state.user.id);
                if (streak > 0) {
                    displayStreakBadgeLocal(streak);
                }
            } catch (error) {
                console.error('Streak display error:', error);
            }
        }
    }, 500);
}

async function calculateStreakLocal(userId) {
    try {
        const { data: logs } = await window.supabase
            .from('food_logs')
            .select('date')
            .eq('user_id', userId)
            .order('date', { ascending: false });

        if (!logs || logs.length === 0) return 0;

        const uniqueDates = [...new Set(logs.map(log => log.date))].sort().reverse();
        let streak = 0;
        const today = new Date();

        for (let i = 0; i < uniqueDates.length; i++) {
            const expectedDate = new Date(today);
            expectedDate.setDate(today.getDate() - i);

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
        console.error('Streak calculation error:', error);
        return 0;
    }
}

function displayStreakBadgeLocal(streak) {
    const dashboard = document.querySelector('#tab-home');
    if (!dashboard) return;

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

    const badge = document.createElement('div');
    badge.className = 'streak-badge';
    badge.innerHTML = `
        <div style="
            background: linear-gradient(135deg, ${color}22, ${color}11);
            border: 2px solid ${color};
            border-radius: 16px;
            padding: 12px 16px;
            margin: 16px 16px 0 16px;
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

    // 첫 번째 카드 앞에 삽입
    const firstCard = dashboard.querySelector('.card');
    if (firstCard) {
        firstCard.parentNode.insertBefore(badge, firstCard);
    }
}

// ==========================================
// EMPTY STATE ENHANCEMENT
// ==========================================
function enhanceEmptyStates() {
    // 최근 기록 빈 상태
    const observer = new MutationObserver(() => {
        const recentList = document.querySelector('#list-recent');
        if (recentList && recentList.children.length === 0) {
            recentList.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: var(--text-sub);">
                    <div style="font-size: 48px; margin-bottom: 16px;">🍽️</div>
                    <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px; color: var(--text-main);">
                        아직 기록된 식사가 없어요
                    </div>
                    <div style="font-size: 14px; opacity: 0.7;">
                        오늘 무엇을 드셨나요?
                    </div>
                </div>
            `;
        }
    });

    const recentList = document.querySelector('#list-recent');
    if (recentList) {
        observer.observe(recentList, { childList: true });
    }
}

// ==========================================
// INPUT VALIDATION
// ==========================================
function addInputValidation() {
    // 프로필 입력 검증
    const heightInput = document.querySelector('#p-height');
    const weightInput = document.querySelector('#p-weight');
    const ageInput = document.querySelector('#p-age');

    if (heightInput) {
        heightInput.addEventListener('blur', () => {
            const value = Number(heightInput.value);
            if (value < 100 || value > 250) {
                showToastLocal('키는 100~250cm 사이여야 합니다.', 'error');
                heightInput.value = '';
            }
        });
    }

    if (weightInput) {
        weightInput.addEventListener('blur', () => {
            const value = Number(weightInput.value);
            if (value < 30 || value > 300) {
                showToastLocal('체중은 30~300kg 사이여야 합니다.', 'error');
                weightInput.value = '';
            }
        });
    }

    if (ageInput) {
        ageInput.addEventListener('blur', () => {
            const value = Number(ageInput.value);
            if (value < 10 || value > 120) {
                showToastLocal('나이는 10~120세 사이여야 합니다.', 'error');
                ageInput.value = '';
            }
        });
    }
}

function showToastLocal(msg, type = 'success') {
    if (window.showToast) {
        window.showToast(msg, type);
    } else {
        console.log(`[${type}] ${msg}`);
    }
}

// ==========================================
// GOAL ACHIEVEMENT CHECK
// ==========================================
function addGoalAchievementCheck() {
    // 도넛 차트 업데이트 시 목표 달성 체크
    const originalUpdateDoughnut = window.updateDoughnutChart;
    if (originalUpdateDoughnut) {
        window.updateDoughnutChart = function (consumed, target) {
            originalUpdateDoughnut.call(this, consumed, target);

            const percentage = (consumed / target) * 100;
            const diff = Math.abs(consumed - target);
            const diffPercentage = (diff / target) * 100;

            // ±10% 이내면 목표 달성
            if (diffPercentage <= 10 && consumed > 0) {
                const centerDiv = document.querySelector('.chart-center');
                if (centerDiv && !centerDiv.querySelector('.achievement-badge')) {
                    const badge = document.createElement('div');
                    badge.className = 'achievement-badge';
                    badge.innerHTML = `
                        <div style="font-size: 32px; margin-top: 8px;">🏆</div>
                    `;
                    centerDiv.appendChild(badge);

                    // 축하 메시지
                    setTimeout(() => {
                        showToastLocal('🎉 오늘의 목표 달성!', 'success');
                    }, 500);
                }
            }
        };
    }
}

// ==========================================
// NETWORK STATUS MONITORING
// ==========================================
window.addEventListener('online', () => {
    showToastLocal('✅ 인터넷 연결이 복구되었습니다.', 'success');
});

window.addEventListener('offline', () => {
    showToastLocal('⚠️ 인터넷 연결이 끊어졌습니다.', 'error');
});

console.log('📦 Production Enhancements Module Loaded');
