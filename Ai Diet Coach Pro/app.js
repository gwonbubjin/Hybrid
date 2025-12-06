// ==========================================
// CONFIGURATION
// ==========================================
const SUPABASE_URL = 'https://tnrfpbwnqvlubietduqq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_dHjEvGvoXGMvai5HPwpMjQ_9F49C7xo';
const GEMINI_API_KEY = 'AIzaSyDvTQAYNfxoEwsJx1_qKQhfUaq_P5zatxQ';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// State
let state = {
    user: null,
    profile: null,
    charts: { doughnut: null, calorie: null, weight: null, radar: null },
    calendar: null,
    foodLogs: [] // Initialize empty array
};

// ==========================================
// 1. UI UTILITIES (Toast, Loading)
// ==========================================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function showLoading(show = true) {
    if (show) $('#loading-overlay').classList.remove('hidden');
    else $('#loading-overlay').classList.add('hidden');
}

function showToast(msg, type = 'success') {
    const container = $('#toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = msg;
    container.appendChild(toast);

    // Auto remove
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ==========================================
// 2. SCIENTIFIC LOGIC (Mifflin-St Jeor)
// ==========================================
function calculateMetrics(weight, height, age, gender, activity, goal) {
    // BMR Calculation
    const s = gender === 'male' ? 5 : -161;
    const bmr = (10 * weight) + (6.25 * height) - (5 * age) + s;

    // TDEE
    const tdee = Math.round(bmr * activity);

    // Target
    let target = tdee;
    if (goal === 'lose') target -= 500;
    if (goal === 'gain') target += 300;

    return { bmr, tdee, target };
}

// ==========================================
// 3. AUTHENTICATION & ONBOARDING
// ==========================================
async function initApp() {
    console.log('🚀 앱 시작...');

    // 자동 로그인 설정 확인
    const autoLoginEnabled = localStorage.getItem('autoLogin') === 'true';
    console.log('🔐 자동 로그인 설정:', autoLoginEnabled ? '활성화' : '비활성화');

    const { data: { session } } = await supabase.auth.getSession();

    if (session && autoLoginEnabled) {
        // 자동 로그인 활성화 + 세션 있음 → 자동 로그인
        console.log('✅ 자동 로그인 중...');
        state.user = session.user;
        await loadUserProfile();
        switchScreen('app-container');
        $('#tab-home').classList.add('active');
        loadDashboard();
    } else {
        // 자동 로그인 비활성화 또는 세션 없음 → 로그인 화면
        if (session && !autoLoginEnabled) {
            // 세션은 있지만 자동 로그인 비활성화 → 로그아웃
            console.log('⚠️ 자동 로그인 비활성화 - 로그아웃 처리');
            await supabase.auth.signOut();
        }
        console.log('🔑 로그인 화면 표시');
        switchScreen('entry-screen');
    }
}

function switchScreen(screenId) {
    $('#entry-screen').style.display = 'none';
    $('#app-container').classList.add('hidden');

    if (screenId === 'app-container') {
        $('#app-container').classList.remove('hidden');
    } else {
        $('#entry-screen').style.display = 'flex';
    }
}


// Login
$('#btn-login').onclick = async () => {
    const email = $('#email').value;
    const password = $('#password').value;
    const autoLogin = $('#auto-login').checked;

    if (!email || !password) return showToast('이메일과 비밀번호를 입력해주세요.', 'error');

    showLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    showLoading(false);

    if (error) {
        showToast(error.message, 'error');
    } else {
        // 자동 로그인 설정 저장
        if (autoLogin) {
            localStorage.setItem('autoLogin', 'true');
            console.log('✅ 자동 로그인 활성화');
        } else {
            localStorage.removeItem('autoLogin');
            console.log('❌ 자동 로그인 비활성화');
        }

        state.user = data.user;
        await loadUserProfile();
        switchScreen('app-container');
        loadDashboard();
        showToast('로그인 성공!', 'success');
    }
};

// Signup
$('#btn-signup').onclick = async () => {
    const email = $('#s-email').value;
    const password = $('#s-password').value;

    // Profile Data
    const meta = {
        gender: $('#s-gender').value,
        age: Number($('#s-age').value),
        height: Number($('#s-height').value),
        weight: Number($('#s-weight').value),
        activity_level: Number($('#s-activity').value),
        goal: $('#s-goal').value
    };

    if (!email || !password || !meta.age || !meta.height || !meta.weight) {
        return showToast('모든 정보를 정확히 입력해주세요.', 'error');
    }

    showLoading(true);
    const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: meta }
    });
    showLoading(false);

    if (error) showToast(error.message, 'error');
    else {
        showToast('회원가입 성공! 로그인해주세요.', 'success');
        toggleAuthMode();
    }
};

$('#btn-goto-signup').onclick = toggleAuthMode;
$('#btn-goto-login').onclick = toggleAuthMode;

function toggleAuthMode() {
    const loginForm = $('#login-form');
    const signupForm = $('#signup-form');
    if (loginForm.classList.contains('hidden')) {
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
    } else {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
    }
}

// ==========================================
// 4. DATA & DASHBOARD
// ==========================================
async function loadUserProfile() {
    const { data } = await supabase.from('users').select('*').eq('id', state.user.id).single();
    state.profile = data;

    // Update local inputs in Profile Tab
    $('#p-email').value = state.user.email;
    $('#p-height').value = data.height;
    $('#p-weight').value = data.weight;
    $('#p-age').value = data.age || 25;
    $('#p-gender').value = data.gender || 'male';
    $('#p-activity').value = data.activity_level || 1.2;
    $('#p-goal').value = data.goal || 'maintain';

    calcAndShowTarget();
}

function calcAndShowTarget() {
    // Calculate on the fly for display
    const { target } = calculateMetrics(
        Number($('#p-weight').value),
        Number($('#p-height').value),
        Number($('#p-age').value),
        $('#p-gender').value,
        Number($('#p-activity').value),
        $('#p-goal').value
    );
    $('#p-target').value = target;
    return target;
}

async function loadDashboard() {
    if (!state.profile) return;

    // Get Korean date for "today"
    const now = new Date();
    const koreaOffset = 9 * 60; // UTC+9
    const koreaTime = new Date(now.getTime() + (koreaOffset + now.getTimezoneOffset()) * 60000);
    const today = koreaTime.toISOString().split('T')[0];

    console.log('📊 Loading dashboard for Korean date:', today);

    const { data: logs } = await supabase.from('food_logs').select('*').eq('user_id', state.user.id).eq('date', today);

    let totalKcal = 0;
    let macros = { carbs: 0, protein: 0, fat: 0 };

    const list = $('#list-recent');
    list.innerHTML = '';

    if (logs) {
        logs.forEach(log => {
            totalKcal += log.calories;
            if (log.nutrients) {
                macros.carbs += log.nutrients.carbs;
                macros.protein += log.nutrients.protein;
                macros.fat += log.nutrients.fat;
            }
            // Add list item
            const li = document.createElement('li');
            li.style.borderBottom = '1px solid #EEE';
            li.style.padding = '10px 0';
            li.innerHTML = `
                <div style="display:flex; justify-content:space-between; font-weight:600;">
                    <span>${log.food_name}</span>
                    <span>${log.calories} kcal</span>
                </div>
                <div style="font-size:12px; color:#888;">
                    ${log.health_score ? `Score: ${log.health_score} | ` : ''} 
                    탄${log.nutrients?.carbs} 단${log.nutrients?.protein} 지${log.nutrients?.fat}
                </div>
            `;
            list.appendChild(li);
        });
    }

    // --- Render Charts ---
    // 1. Target
    const targetKcal = calcAndShowTarget(); // Use current BMR calc
    const remain = Math.max(0, targetKcal - totalKcal);
    $('#val-remain').innerText = remain.toLocaleString();
    // Chart updates
    updateDoughnutChart(totalKcal, remain);
    updateMacroBars(macros, targetKcal);
}

function updateDoughnutChart(consumed, remain) {
    const ctx = document.getElementById('chart-doughnut').getContext('2d');
    if (state.charts.doughnut) state.charts.doughnut.destroy();

    const isOver = remain < 0;
    // Dark Mode Theme Colors
    const colorConsumed = isOver ? '#FF3D00' : '#FF6D00'; // 다크 오렌지 or 레드
    const colorRemain = '#333333'; // 어두운 회색 (남은 부분)

    state.charts.doughnut = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['섭취', '남음'],
            datasets: [{
                data: isOver ? [consumed, 0] : [consumed, remain],
                backgroundColor: [colorConsumed, colorRemain],
                borderWidth: 0,
                hoverOffset: 4,
                cutout: '80%',
                borderRadius: 20
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
            animation: { animateScale: true, animateRotate: true }
        }
    });
}

function updateMacroBars(current, totalKcal) {
    // 목표 비율 설정 (탄5 : 단3 : 지2)
    // Grams calculation
    const targets = {
        carbs: Math.round((totalKcal * 0.5) / 4),
        protein: Math.round((totalKcal * 0.3) / 4),
        fat: Math.round((totalKcal * 0.2) / 9)
    };

    const setBar = (type, val) => {
        // Prevent Divide by Zero
        const t = targets[type] || 1;
        const pct = Math.min((val / t) * 100, 100);

        // Debug
        console.log(`Macro ${type}: ${val}/${t} = ${pct}%`);

        const bar = document.getElementById(`bar-${type}`);
        const label = document.getElementById(`label-${type}`);

        if (bar) bar.style.width = `${pct}%`;
        if (label) label.innerText = `${val} / ${t}g`;
    };

    setBar('carb', current.carbs || 0);
    setBar('prot', current.protein || 0);
    setBar('fat', current.fat || 0);
}

// ==========================================
// 5. AI ANALYSIS (GEMINI V2)
// ==========================================
$('#btn-camera').onclick = () => $('#ai-image').click();
$('#ai-image').onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            $('#img-preview').src = e.target.result;
            $('#preview-area').classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
};
$('#btn-remove-img').onclick = () => {
    $('#ai-image').value = '';
    $('#preview-area').classList.add('hidden');
};

$('#btn-analyze').onclick = async () => {
    const text = $('#ai-prompt').value;
    const imageFile = $('#ai-image').files[0];
    if (!text && !imageFile) return showToast('음식 내용이나 사진을 입력해주세요.', 'error');

    showLoading(true);
    $('#result-card').classList.add('hidden');

    try {
        // Construct Prompt
        const parts = [{
            text: `Professional Nutritionist Analysis Needed. Response MUST be valid JSON only.
            Format: {
                "food_name": "String",
                "calories": Number,
                "nutrients": { "carbs": Number, "protein": Number, "fat": Number },
                "health_score": Number (0-100),
                "feedback": "One line expert output in Korean. e.g., '나트륨이 너무 높아요, 물을 많이 드세요.'",
                "burn_activity": "Activity to burn these calories. e.g., '걷기 30분'"
            }
            Input: ${text || 'Image provided'}`
        }];

        if (imageFile) {
            const base64 = await new Promise(r => {
                const reader = new FileReader();
                reader.onload = () => r(reader.result.split(',')[1]);
                reader.readAsDataURL(imageFile);
            });
            parts.push({ inlineData: { mimeType: imageFile.type, data: base64 } });
        }

        // Fetch Gemini
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts }] })
        });
        const json = await res.json();

        if (json.error) throw new Error(json.error.message);

        const content = json.candidates[0].content.parts[0].text;
        const cleanJson = content.match(/\{[\s\S]*\}/)[0];
        const data = JSON.parse(cleanJson);

        // Show Result
        renderResultCard(data);

    } catch (err) {
        console.error(err);
        showToast('분석 실패: ' + err.message, 'error');
    } finally {
        showLoading(false);
    }
};

function renderResultCard(data) {
    const card = $('#result-card');
    const badgeColor = data.health_score > 70 ? 'score-high' : (data.health_score > 40 ? 'score-mid' : 'score-low');

    card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <h3 style="margin:0;">${data.food_name}</h3>
            <span class="ai-badge ${badgeColor}">${data.health_score}점</span>
        </div>
        <div style="font-size:24px; font-weight:800; margin:10px 0;">${data.calories} kcal</div>
        <div style="background:#F9FAFB; padding:10px; border-radius:8px; font-size:13px; color:#555;">
            <p>💡 ${data.feedback}</p>
            <p>🔥 ${data.burn_activity}</p>
        </div>
        <div style="display:flex; gap:10px; margin-top:15px;">
            <button id="btn-save-record" class="btn-primary">기록하기</button>
            <button onclick="$('#result-card').classList.add('hidden')" class="btn-secondary" style="flex:0.4;">취소</button>
        </div>
    `;
    card.classList.remove('hidden');

    $('#btn-save-record').onclick = () => saveRecord(data);
}

async function saveRecord(data) {
    // Get Korean date
    const now = new Date();
    const koreaOffset = 9 * 60; // UTC+9
    const koreaTime = new Date(now.getTime() + (koreaOffset + now.getTimezoneOffset()) * 60000);
    const koreaDateStr = koreaTime.toISOString().split('T')[0];

    console.log('💾 Saving record with Korean date:', koreaDateStr);

    showLoading(true);
    const { error } = await supabase.from('food_logs').insert({
        user_id: state.user.id,
        date: koreaDateStr, // Use Korean date
        food_name: data.food_name,
        calories: data.calories,
        nutrients: data.nutrients,
        health_score: data.health_score,
        burn_activity: data.burn_activity
    });
    showLoading(false);

    if (error) showToast('저장 실패', 'error');
    else {
        showToast('식단이 저장되었습니다.', 'success');
        $('#result-card').classList.add('hidden');
        $('#ai-prompt').value = '';
        $('#preview-area').classList.add('hidden');
        loadDashboard();
    }
}

// ==========================================
// 6. HISTORY & STATS
// ==========================================
// ==========================================
// 6. HISTORY & CALENDAR (Refined)
// ==========================================
async function loadCalendar() {
    console.log('📅 loadCalendar called');
    state.currentTab = 'history';
    const calendarEl = document.getElementById('calendar');

    // CRITICAL: Load food logs FIRST
    try {
        const { data: logs, error } = await supabase
            .from('food_logs')
            .select('*')
            .eq('user_id', state.user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Error loading logs:', error);
            showToast('기록 로드 실패', 'error');
            return;
        }

        state.foodLogs = logs || [];
        console.log('✅ Loaded', state.foodLogs.length, 'food logs');
    } catch (err) {
        console.error('❌ Exception loading logs:', err);
        state.foodLogs = [];
    }

    if (state.calendar) state.calendar.destroy();

    state.calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: { left: 'prev', center: 'title', right: 'next' },
        height: 'auto',
        titleFormat: { year: 'numeric', month: 'short' },
        timeZone: 'local', // CRITICAL: Use local timezone, not UTC
        locale: 'ko',

        // Remove default event rendering
        events: [],

        dateClick: function (info) {
            console.log('📅 Date clicked:', info.dateStr);
            showDateModal(info.dateStr);
        },

        dayCellDidMount: function (info) {
            // Get date string from the cell (already in local timezone now)
            const cellDate = info.date;
            const dateStr = cellDate.getFullYear() + '-' +
                String(cellDate.getMonth() + 1).padStart(2, '0') + '-' +
                String(cellDate.getDate()).padStart(2, '0');

            // Get today's date in local timezone
            const today = new Date();
            const todayStr = today.getFullYear() + '-' +
                String(today.getMonth() + 1).padStart(2, '0') + '-' +
                String(today.getDate()).padStart(2, '0');

            console.log('🕐 Checking date:', dateStr, '| Today (Korea):', todayStr);

            // Check if log exists - USE 'date' FIELD, NOT 'created_at'
            const hasLog = state.foodLogs.some(log => {
                const logDate = log.date || log.created_at?.split('T')[0];
                return logDate === dateStr;
            });
            console.log('🔍 Logs for', dateStr, ':', hasLog ? 'FOUND' : 'NOT FOUND');

            // Logic:
            // 1. Data Exists -> Green Dot
            // 2. No Data & Past Date -> Red Dot
            // 3. Future -> No Dot

            let dotColor = null;

            if (hasLog) {
                dotColor = 'var(--accent)'; // Green
                console.log('✅', dateStr, 'has log - GREEN');
            } else if (dateStr < todayStr) {
                dotColor = 'var(--danger)'; // Red
                console.log('❌', dateStr, 'is past with no log - RED');
            } else {
                console.log('⏭️', dateStr, 'is today or future - NO DOT');
            }
            // Future dates (dateStr > todayStr) get no dot

            if (dotColor) {
                const dot = document.createElement('div');
                dot.style.cssText = `
                    width: 8px; 
                    height: 8px; 
                    background-color: ${dotColor}; 
                    border-radius: 50%; 
                    margin: 2px auto;
                    box-shadow: 0 0 5px ${dotColor};
                `;

                // Append to the top container
                const topEl = info.el.querySelector('.fc-daygrid-day-top');
                if (topEl) topEl.appendChild(dot);
            }
        }
    });

    state.calendar.render();
    console.log('✅ Calendar rendered');
}

function loadHistory() {
    loadCalendar(); // Redirect old calls
}

function showDateModal(dateStr) {
    console.log('🔔 showDateModal called with date:', dateStr);

    // Check if foodLogs exist
    if (!state.foodLogs) {
        console.error('❌ state.foodLogs is undefined!');
        state.foodLogs = [];
    }

    // Filter logs by 'date' field, not 'created_at'
    const logs = state.foodLogs.filter(log => {
        const logDate = log.date || log.created_at?.split('T')[0];
        return logDate === dateStr;
    });
    console.log('📊 Found', logs.length, 'logs for', dateStr);

    // Get modal elements
    const modal = document.getElementById('date-modal');
    const titleEl = document.getElementById('modal-date-title');
    const listEl = document.getElementById('modal-log-list');

    if (!modal || !titleEl || !listEl) {
        console.error('❌ Modal elements not found!', { modal, titleEl, listEl });
        alert('모달 요소를 찾을 수 없습니다. 페이지를 새로고침해주세요.');
        return;
    }

    // Set title
    titleEl.innerText = dateStr;
    listEl.innerHTML = '';

    if (logs.length === 0) {
        listEl.innerHTML = `
            <div style="text-align:center; padding:30px 0; color:var(--text-sub);">
                <i class="fas fa-utensils" style="font-size:24px; margin-bottom:10px; opacity:0.5;"></i>
                <p>기록이 없는 날입니다.</p>
            </div>`;
    } else {
        logs.forEach(log => {
            const div = document.createElement('div');
            div.className = 'modal-log-item';
            div.innerHTML = `
                <div class="modal-log-name">${log.food_name}</div>
                <div class="modal-log-cal">⚡ ${log.calories} kcal</div>
            `;
            listEl.appendChild(div);
        });
    }

    // Show modal
    console.log('👁️ Removing hidden class from modal');
    modal.classList.remove('hidden');
    console.log('✅ Modal should now be visible. Has hidden class:', modal.classList.contains('hidden'));
}

// Modal closing logic - Ensure elements exist before attaching
document.addEventListener('DOMContentLoaded', function () {
    const closeBtn = document.getElementById('btn-modal-close');
    const modal = document.getElementById('date-modal');

    if (closeBtn) {
        closeBtn.onclick = () => {
            console.log('❌ Close button clicked');
            modal.classList.add('hidden');
        };
    }

    if (modal) {
        modal.onclick = (e) => {
            if (e.target === modal) {
                console.log('❌ Modal background clicked');
                modal.classList.add('hidden');
            }
        };
    }
});

async function loadDayDetail(dateStr) {
    $('#day-detail').classList.remove('hidden');
    $('#day-detail-date').innerText = dateStr;
    const { data } = await supabase.from('food_logs').select('*').eq('user_id', state.user.id).eq('date', dateStr);
    const list = $('#day-detail-list');
    list.innerHTML = '';
    if (data && data.length) {
        data.forEach(l => {
            const li = document.createElement('li');
            li.innerText = `${l.food_name} (${l.calories}kcal)`;
            list.appendChild(li);
        });
    } else {
        list.innerHTML = '<li>기록 없음</li>';
    }
}

async function loadStats() {
    console.log('📊 Loading stats...');

    // Get Korean date for today
    const now = new Date();
    const koreaOffset = 9 * 60;
    const koreaTime = new Date(now.getTime() + (koreaOffset + now.getTimezoneOffset()) * 60000);
    const today = koreaTime.toISOString().split('T')[0];

    // ========== 영양 밸런스 레이더 차트 (오늘) ==========
    const { data: todayLogs } = await supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', state.user.id)
        .eq('date', today);

    let totalCarbs = 0, totalProtein = 0, totalFat = 0, totalCalories = 0, avgScore = 0;

    if (todayLogs && todayLogs.length > 0) {
        todayLogs.forEach(log => {
            if (log.nutrients) {
                totalCarbs += log.nutrients.carbs || 0;
                totalProtein += log.nutrients.protein || 0;
                totalFat += log.nutrients.fat || 0;
            }
            totalCalories += log.calories || 0;
            avgScore += log.health_score || 0;
        });
        avgScore = Math.round(avgScore / todayLogs.length);
    }

    // Target values based on profile
    const targetCal = state.profile ? calcAndShowTarget() : 2000;
    const targetCarbs = Math.round(targetCal * 0.5 / 4); // 50% from carbs, 4kcal/g
    const targetProtein = Math.round(targetCal * 0.3 / 4); // 30% from protein
    const targetFat = Math.round(targetCal * 0.2 / 9); // 20% from fat, 9kcal/g

    if (state.charts.radar) state.charts.radar.destroy();

    const ctxRadar = document.getElementById('chart-radar');
    if (ctxRadar) {
        state.charts.radar = new Chart(ctxRadar.getContext('2d'), {
            type: 'radar',
            data: {
                labels: ['칼로리', '탄수화물', '단백질', '지방', '건강점수'],
                datasets: [
                    {
                        label: '목표',
                        data: [100, 100, 100, 100, 100],
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        pointRadius: 0
                    },
                    {
                        label: '현재',
                        data: [
                            Math.min((totalCalories / targetCal) * 100, 150),
                            Math.min((totalCarbs / targetCarbs) * 100, 150),
                            Math.min((totalProtein / targetProtein) * 100, 150),
                            Math.min((totalFat / targetFat) * 100, 150),
                            avgScore
                        ],
                        borderColor: '#00FF88',
                        backgroundColor: 'rgba(0, 255, 136, 0.3)',
                        borderWidth: 3,
                        pointRadius: 6,
                        pointBackgroundColor: '#00FF88',
                        pointBorderColor: '#000',
                        pointBorderWidth: 2,
                        pointHoverRadius: 8,
                        pointHoverBackgroundColor: '#00FF88',
                        pointHoverBorderColor: '#FFF',
                        pointHoverBorderWidth: 3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#FFFFFF',
                            font: { size: 14, weight: 'bold' },
                            padding: 15,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        titleColor: '#00FF88',
                        bodyColor: '#FFFFFF',
                        borderColor: '#00FF88',
                        borderWidth: 2,
                        padding: 12,
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 14, weight: 'bold' },
                        callbacks: {
                            label: function (context) {
                                const label = context.dataset.label;
                                const value = context.parsed.r;
                                if (label === '목표') return `${label}: 100%`;

                                const labels = ['칼로리', '탄수화물', '단백질', '지방', '건강점수'];
                                const idx = context.dataIndex;
                                const actual = [totalCalories, totalCarbs, totalProtein, totalFat, avgScore][idx];
                                const units = ['kcal', 'g', 'g', 'g', '점'];

                                return `${label}: ${actual}${units[idx]} (${Math.round(value)}%)`;
                            }
                        }
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 150,
                        ticks: {
                            stepSize: 30,
                            color: '#FFFFFF',
                            font: { size: 11, weight: 'bold' },
                            backdropColor: 'transparent',
                            callback: function (value) {
                                return value + '%';
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.15)',
                            lineWidth: 1
                        },
                        angleLines: {
                            color: 'rgba(255, 255, 255, 0.15)',
                            lineWidth: 1
                        },
                        pointLabels: {
                            color: '#FFFFFF',
                            font: { size: 13, weight: 'bold' }
                        }
                    }
                }
            }
        });
    }

    // ========== 체중 변화 차트 ==========
    const { data: wData } = await supabase
        .from('weight_logs')
        .select('*')
        .eq('user_id', state.user.id)
        .order('date', { ascending: true })
        .limit(30);

    if (state.charts.weight) state.charts.weight.destroy();

    const ctxW = document.getElementById('chart-weight').getContext('2d');

    const weightLabels = wData && wData.length > 0 ? wData.map(d => {
        const date = new Date(d.date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    }) : ['데이터 없음'];

    const weightValues = wData && wData.length > 0 ? wData.map(d => d.weight) : [0];

    state.charts.weight = new Chart(ctxW, {
        type: 'line',
        data: {
            labels: weightLabels,
            datasets: [{
                label: '체중 (kg)',
                data: weightValues,
                borderColor: '#00FF88', // 네온 그린
                backgroundColor: 'rgba(0, 255, 136, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointRadius: 6,
                pointBackgroundColor: '#00FF88',
                pointBorderColor: '#000',
                pointBorderWidth: 2,
                pointHoverRadius: 8,
                pointHoverBackgroundColor: '#00FF88',
                pointHoverBorderColor: '#FFF',
                pointHoverBorderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#FFFFFF',
                        font: { size: 14, weight: 'bold' },
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    titleColor: '#00FF88',
                    bodyColor: '#FFFFFF',
                    borderColor: '#00FF88',
                    borderWidth: 2,
                    padding: 12,
                    displayColors: false,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 16, weight: 'bold' },
                    callbacks: {
                        label: function (context) {
                            return `${context.parsed.y} kg`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        color: '#FFFFFF',
                        font: { size: 12, weight: 'bold' },
                        callback: function (value) {
                            return value + ' kg';
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        lineWidth: 1
                    }
                },
                x: {
                    ticks: {
                        color: '#FFFFFF',
                        font: { size: 11, weight: 'bold' },
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        lineWidth: 1
                    }
                }
            }
        }
    });

    // ========== 칼로리 추이 차트 (최근 7일) ==========
    const nowCal = new Date();
    const koreaOffsetCal = 9 * 60;
    const koreaTimeCal = new Date(nowCal.getTime() + (koreaOffsetCal + nowCal.getTimezoneOffset()) * 60000);


    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(koreaTimeCal);
        d.setDate(koreaTimeCal.getDate() - i);
        const dateStr = d.getFullYear() + '-' +
            String(d.getMonth() + 1).padStart(2, '0') + '-' +
            String(d.getDate()).padStart(2, '0');
        last7Days.push(dateStr);
    }

    const { data: cData } = await supabase
        .from('food_logs')
        .select('date, calories')
        .eq('user_id', state.user.id)
        .in('date', last7Days);

    // Aggregate calories by date
    const caloriesByDate = {};
    last7Days.forEach(d => caloriesByDate[d] = 0);

    if (cData) {
        cData.forEach(log => {
            if (caloriesByDate[log.date] !== undefined) {
                caloriesByDate[log.date] += log.calories || 0;
            }
        });
    }

    const calorieLabels = last7Days.map(d => {
        const date = new Date(d);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    const calorieValues = last7Days.map(d => caloriesByDate[d]);

    if (state.charts.calorie) state.charts.calorie.destroy();

    const ctxC = document.getElementById('chart-calorie');
    if (ctxC) {
        state.charts.calorie = new Chart(ctxC.getContext('2d'), {
            type: 'bar',
            data: {
                labels: calorieLabels,
                datasets: [{
                    label: '칼로리 (kcal)',
                    data: calorieValues,
                    backgroundColor: '#FF6D00', // 오렌지
                    borderColor: '#FF3D00',
                    borderWidth: 2,
                    borderRadius: 8,
                    barThickness: 40
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: '#FFFFFF',
                            font: { size: 14, weight: 'bold' },
                            padding: 15
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        titleColor: '#FF6D00',
                        bodyColor: '#FFFFFF',
                        borderColor: '#FF6D00',
                        borderWidth: 2,
                        padding: 12,
                        displayColors: false,
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 16, weight: 'bold' },
                        callbacks: {
                            label: function (context) {
                                return `${context.parsed.y} kcal`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#FFFFFF',
                            font: { size: 12, weight: 'bold' },
                            callback: function (value) {
                                return value + ' kcal';
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            lineWidth: 1
                        }
                    },
                    x: {
                        ticks: {
                            color: '#FFFFFF',
                            font: { size: 11, weight: 'bold' }
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    console.log('✅ Stats loaded');
}

// ==========================================
// 7. PROFILE & INIT
// ==========================================
$('#btn-save-profile').onclick = async () => {
    const w = Number($('#p-weight').value);
    const updates = {
        gender: $('#p-gender').value,
        age: Number($('#p-age').value),
        height: Number($('#p-height').value),
        weight: w,
        activity_level: Number($('#p-activity').value),
        goal: $('#p-goal').value
    };

    showLoading(true);
    await supabase.from('users').update(updates).eq('id', state.user.id);
    if (w !== state.profile.weight) {
        await supabase.from('weight_logs').insert({ user_id: state.user.id, weight: w, date: new Date() });
    }
    showLoading(false);
    showToast('저장되었습니다.', 'success');
    loadUserProfile(); // refresh
};

$('#btn-logout').onclick = async () => {
    console.log('👋 로그아웃 중...');
    localStorage.removeItem('autoLogin'); // 자동 로그인 설정 제거
    await supabase.auth.signOut();
    location.reload();
};

// Tabs
$$('.nav-item').forEach(btn => {
    btn.onclick = () => {
        $$('.nav-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        $$('.screen').forEach(s => s.classList.remove('active'));
        const target = btn.dataset.target;
        $(`#${target}`).classList.add('active');

        if (target === 'tab-history') loadHistory();
        if (target === 'tab-stats') loadStats();
    };
});

// Start
initApp();
['p-weight', 'p-height', 'p-age', 'p-activity', 'p-goal'].forEach(id => $(`#${id}`).onchange = calcAndShowTarget);

// 자동 로그인 체크박스 시각적 피드백
const autoLoginCheckbox = $('#auto-login');
const checkIcon = $('#check-icon');

if (autoLoginCheckbox && checkIcon) {
    autoLoginCheckbox.addEventListener('change', function () {
        if (this.checked) {
            checkIcon.style.display = 'block';
            console.log('✅ 자동 로그인 체크');
        } else {
            checkIcon.style.display = 'none';
            console.log('⬜ 자동 로그인 체크 해제');
        }
    });
}
