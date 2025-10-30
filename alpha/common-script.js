// 모바일 메뉴 토글
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileNav = document.getElementById('mobile-nav');

if (mobileMenuBtn && mobileNav) {
  mobileMenuBtn.addEventListener('click', () => {
    mobileNav.classList.toggle('active');
    const icon = mobileMenuBtn.querySelector('.material-symbols-outlined');
    icon.textContent = mobileNav.classList.contains('active') ? 'close' : 'menu';
  });

  // 링크 클릭 시 메뉴 닫기
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('active');
      const icon = mobileMenuBtn.querySelector('.material-symbols-outlined');
      icon.textContent = 'menu';
    });
  });
}

// 다크 모드 토글
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    const icon = themeToggle.querySelector('.material-symbols-outlined');
    icon.textContent = isDark ? 'dark_mode' : 'light_mode';
  });
}

// 다크 모드 초기화
if (localStorage.getItem('theme') === 'dark') {
  document.documentElement.classList.add('dark');
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    const icon = themeToggle.querySelector('.material-symbols-outlined');
    icon.textContent = 'dark_mode';
  }
} else {
  document.documentElement.classList.remove('dark');
}

// 페이지 로드 애니메이션
document.addEventListener('DOMContentLoaded', () => {
  const elements = document.querySelectorAll('section, .card-hover-border, .card-enhanced');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in-up');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  elements.forEach(el => observer.observe(el));
});

// 스무스 스크롤
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href !== '#') {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  });
});
