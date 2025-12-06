// 물 섭취 트래커
let waterCount = 0;

// 물 컵 클릭 이벤트
document.addEventListener('DOMContentLoaded', () => {
    const cups = document.querySelectorAll('.water-cup');
    const waterCountEl = document.getElementById('water-count');
    const resetBtn = document.getElementById('btn-reset-water');

    // localStorage에서 오늘 물 섭취량 불러오기
    const today = new Date().toISOString().split('T')[0];
    const savedWater = localStorage.getItem(`water-${today}`);
    if (savedWater) {
        waterCount = parseInt(savedWater);
        updateWaterDisplay();
    }

    cups.forEach((cup, index) => {
        cup.addEventListener('click', () => {
            if (index < waterCount) {
                // 이미 채워진 컵 클릭 시 그 컵부터 비우기
                waterCount = index;
            } else {
                // 빈 컵 클릭 시 그 컵까지 채우기
                waterCount = index + 1;
            }
            updateWaterDisplay();
            saveWaterCount();
        });
    });

    resetBtn.addEventListener('click', () => {
        waterCount = 0;
        updateWaterDisplay();
        saveWaterCount();
        showToast('물 섭취량이 초기화되었습니다.', 'success');
    });

    function updateWaterDisplay() {
        cups.forEach((cup, index) => {
            if (index < waterCount) {
                cup.classList.add('filled');
            } else {
                cup.classList.remove('filled');
            }
        });
        waterCountEl.textContent = `${waterCount} / 8`;

        // 목표 달성 시 축하 메시지
        if (waterCount === 8) {
            showToast('🎉 오늘의 물 섭취 목표 달성!', 'success');
        }
    }

    function saveWaterCount() {
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem(`water-${today}`, waterCount.toString());
    }
});
