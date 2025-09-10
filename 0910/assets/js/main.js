// 모바일 메뉴 토글
const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('#nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    nav.classList.toggle('open');
  });
}

// 푸터 연도 자동
const y = document.getElementById('year');
if (y) y.textContent = new Date().getFullYear();

// 소개글을 쉽게 바꾸기 위한 헬퍼 (콘솔에서 사용)
window.setIntro = (t) => {
  const el = document.getElementById('intro-text');
  if (el) el.innerHTML = t;
};