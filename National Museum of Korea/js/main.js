// 스플래시 표시 시작 시각 (스크립트 로드 시점)
const __splashShownAt = Date.now();

document.addEventListener('DOMContentLoaded', function() {
    // 해시 스크롤 링크 동작
    initSmoothScroll();

    // 햄버거 메뉴
    initMobileMenu();

    // 소장품 필터
    initCollectionFilter();

    // 컬렉션 검색
    initCollectionSearch();

    // 스크롤 애니메이션
    initScrollAnimation();
    

    // 오늘의 운영 안내 배너
    initTodayBanner();

    // 층별 상세 탭
    initFloorTabs();

    // 상단 서브메뉴(시설 소개) 토글 (모바일 대응)
    initSubmenuToggle();
});

// 스플래시: 최소 노출 시간 보장 후 페이드아웃 (약 2.3초)
window.addEventListener('load', function() {
    const MIN_SHOW_MS = 2000;
    const splash = document.getElementById('splash');
    if (!splash) return;
    const elapsed = Date.now() - __splashShownAt;
    const delay = Math.max(0, MIN_SHOW_MS - elapsed);
    setTimeout(() => splash.classList.add('hide'), delay);
});

// 로드 지연 대비 안전장치 (최대 5초 후 자동 숨김)
setTimeout(() => {
    const splash = document.getElementById('splash');
    if (splash && !splash.classList.contains('hide')) {
        splash.classList.add('hide');
    }
}, 5000);

// ============ 서브메뉴 토글 (모바일) ============
function initSubmenuToggle() {
    const submenuToggles = document.querySelectorAll('.submenu-toggle');
    submenuToggles.forEach(btn => {
        btn.addEventListener('click', function(e) {
            if (window.innerWidth <= 992) {
                e.preventDefault();
                const parent = this.closest('.has-submenu');
                const expanded = this.getAttribute('aria-expanded') === 'true';
                this.setAttribute('aria-expanded', expanded ? 'false' : 'true');
                parent.classList.toggle('open');
            }
        });
    });
}

// ============ 층별 상세 탭 ============
function initFloorTabs() {
    const tabs = document.querySelectorAll('.floor-tab');
    const image = document.getElementById('floorImage');
    const title = document.querySelector('.floor-info-title');
    const info = document.getElementById('floorInfo');

    // 층별 텍스트 데이터
    const floorInfoData = {
        b1: {
            title: 'B1',
            subtitle: '전시영역/극장/사무동',
            lines: ['주차장 Parking']
        },
        '1f': {
            title: '1F',
            subtitle: '교육관/사무동/수장고/주차장',
            lines: [
                '교육관 Education Area',
                '사무동 Office Building',
                '수장고 Storage Room',
                '주차장 Parking'
            ]
        },
        '2f': {
            title: '2F',
            subtitle: '사무동/주차장',
            lines: [
                '사무동 Office Building',
                '주차장 Parking'
            ]
        },
        '3f': {
            title: '3F',
            subtitle: '전시1층(중·근세관 / 선사·고대관)/ 으뜸홀 / 어린이박물관/ 특별전시설1',
            lines: [
                '전시영역 Exhibition Area',
                '어린이박물관 Children’s Museum',
                '특별전시설1 Special Exhibition Gallery 1',
                '으뜸홀 Great Hall',
                '극장 용 Theater YONG'
            ]
        },
        '4f': {
            title: '4F',
            subtitle: '전시2층(서화관/기증관) / 극장 용 / 사무동 / 도서관',
            lines: [
                '전시영역 Exhibition Area',
                '극장 용 Theater YONG',
                '사무동 Office Building',
                '도서관 Library'
            ]
        },
        '5f': {
            title: '5F',
            subtitle: '사무동/극장 용',
            lines: [
                '극장 용 Theater YONG',
                '사무동 Office Building'
            ]
        },
        '6f': {
            title: '6F',
            subtitle: '전시3층(조각·공예관/세계문화관)/ 극장 용 / 사무동',
            lines: [
                '전시영역 Exhibition Area',
                '극장 용 Theater YONG',
                '사무동 Office Building'
            ]
        }
    };

    function renderInfo(floorKey) {
        if (!info) return;
        const data = floorInfoData[floorKey];
        if (!data) return;
        if (title) title.textContent = data.title;
        const linesHtml = data.lines.map(t => `<div class="fi-line">${t}</div>`).join('');
        info.innerHTML = `
            <h3 class="floor-info-title">${data.title}</h3>
            <div class="fi-sub">${data.subtitle}</div>
            <div class="fi-lines">${linesHtml}</div>
        `;
    }

    if (!tabs || tabs.length === 0 || !image) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const floor = this.getAttribute('data-floor');
            if (!floor) return;

            // active/aria-selected 업데이트
            tabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            this.classList.add('active');
            this.setAttribute('aria-selected', 'true');

            // 이미지 교체
            image.src = `images/layout/floors/${floor}.png`;
            image.alt = `${floor.toUpperCase()} 층 배치도`;

            // 정보 패널 렌더
            renderInfo(floor);
        });
    });

    // 초기 활성 탭 기준 렌더
    const active = document.querySelector('.floor-tab.active');
    renderInfo(active ? active.getAttribute('data-floor') : 'b1');
}

// ============ 오늘의 운영 배너 ============
function initTodayBanner() {
    const banner = document.getElementById('todayBanner');
    const text = document.getElementById('todayHoursText');
    if (!banner || !text) return;

    const now = new Date();
    const day = now.getDay(); // 0:일, 1:월, ... 6:토
    const hour = now.getHours();

    let open = true;
    let label = '';

    // 실제 국립중앙박물관 기본 운영 기준
    // 월요일 휴관, 수/토 21시까지, 기타 18시까지
    if (day === 1) { // Monday
        open = false;
        label = '휴관일 (매주 월요일)';
    } else if (day === 3 || day === 6) { // Wed or Sat
        label = '오늘 운영: 10:00 ~ 21:00';
        if (hour < 10 || hour >= 21) open = false;
    } else {
        label = '오늘 운영: 10:00 ~ 18:00';
        if (hour < 10 || hour >= 18) open = false;
    }

    text.textContent = open ? `${label} · 운영 중` : `${label} · 운영 종료`;
    banner.classList.toggle('is-closed', !open);
}

// ============ 부드러운 스크롤 ============
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // 모바일 메뉴 닫기
                const navMenu = document.getElementById('navMenu');
                const hamburger = document.getElementById('hamburger');
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    hamburger.classList.remove('active');
                }
            }
        });
    });
}

// ============ 모바일 메뉴 토글 ============
function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    if (!hamburger) return;

    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // 화면 크기 변경 시 메뉴 닫기
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });
}

// ============ 소장품 필터 ============
function initCollectionFilter() {
    const filterButtons = document.querySelectorAll('.category-filter');
    const collectionItems = document.querySelectorAll('.collection-item');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');

            // 활성 버튼 업데이트
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // 아이템 필터링
            collectionItems.forEach(item => {
                const itemCategory = item.getAttribute('data-category');

                if (category === 'all' || itemCategory === category) {
                    item.classList.remove('hidden');
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.9)';
                    setTimeout(() => {
                        item.classList.add('hidden');
                    }, 300);
                }
            });
        });
    });
}

// ============ 컬렉션 검색 ============
function initCollectionSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const collectionItems = document.querySelectorAll('.collection-item');

    if (!searchInput || !searchButton) return;

    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();

        collectionItems.forEach(item => {
            const title = item.querySelector('.item-title').textContent.toLowerCase();
            const period = item.querySelector('.item-period').textContent.toLowerCase();

            if (searchTerm === '' || title.includes(searchTerm) || period.includes(searchTerm)) {
                item.classList.remove('hidden');
                item.style.opacity = '1';
                item.style.transform = 'scale(1)';
            } else {
                item.style.opacity = '0';
                item.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    item.classList.add('hidden');
                }, 300);
            }
        });
    }

    searchButton.addEventListener('click', performSearch);

    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // 검색어가 비어있을 때 모든 아이템 표시
    searchInput.addEventListener('input', function() {
        if (this.value.trim() === '') {
            collectionItems.forEach(item => {
                item.classList.remove('hidden');
                item.style.opacity = '1';
                item.style.transform = 'scale(1)';
            });
        }
    });
}

// ============ 스크롤 애니메이션 ============
function initScrollAnimation() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    // 애니메이션할 요소들
    const elementsToAnimate = document.querySelectorAll(
        '.exhibition-card, .collection-item, .event-card, .info-card, .notice-item'
    );

    elementsToAnimate.forEach(element => {
        element.style.opacity = '0';
        observer.observe(element);
    });
}

// ============ 헤더 스크롤 효과 ============
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');

    if (window.scrollY > 50) {
        header.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    } else {
        header.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
    }
});

// ============ CTA 버튼 동작 ============
const ctaButton = document.querySelector('.cta-button');
if (ctaButton) {
    ctaButton.addEventListener('click', function() {
        const aboutSection = document.getElementById('about');
        if (aboutSection) {
            aboutSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
}

// ============ 컬렉션 아이템 상호작용 ============
const collectionItems = document.querySelectorAll('.collection-item');
collectionItems.forEach(item => {
    item.addEventListener('mouseenter', function() {
        this.style.cursor = 'pointer';
    });

    item.addEventListener('click', function() {
        const itemTitle = this.querySelector('.item-title').textContent;
        const itemPeriod = this.querySelector('.item-period').textContent;
        console.log(`선택: ${itemTitle} (${itemPeriod})`);
        // 여기에 상세 페이지로 이동하거나 모달을 띄우는 로직을 추가할 수 있습니다
    });
});

