import { state } from './state.js';
import { applyFilters } from './filters.js';
import { applyLang, ensureLangToggle } from './i18n.js';
import { updateCartUI } from './cart.js';

// Chips & search
export function initControls() {
  document.querySelectorAll('.drawer-chips .chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.preventDefault();
      const cat = chip.dataset.cat;
      state.category = cat;
      applyFilters();
      window.closeSideDrawer && window.closeSideDrawer();
    });
  });
  document.querySelectorAll('.chip').forEach(chip => chip.addEventListener('click', () => {
    state.category = chip.dataset.cat;
    applyFilters();
  }));
  const searchInput = document.getElementById('search');
  searchInput?.addEventListener('input', (e) => { state.q = e.target.value; applyFilters(); });
}

// Theme
export function initTheme() {
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  function applyTheme(theme) {
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
      if (themeToggle) themeToggle.textContent = '☀️';
      localStorage.setItem('theme', 'light');
      themeToggle?.setAttribute('aria-pressed', 'true');
    } else {
      root.removeAttribute('data-theme');
      if (themeToggle) themeToggle.textContent = '🌙';
      localStorage.setItem('theme', 'dark');
      themeToggle?.setAttribute('aria-pressed', 'false');
    }
  }
  (function initThemeInner() {
    const saved = localStorage.getItem('theme');
    applyTheme(saved || 'dark');
  })();
  themeToggle?.addEventListener('click', () => {
    const isLight = root.getAttribute('data-theme') === 'light';
    applyTheme(isLight ? 'dark' : 'light');
  });
}

// Side drawer
export function initSideDrawer() {
  const sideDrawer = document.getElementById('sideDrawer');
  const menuBackdrop = document.getElementById('menuBackdrop');
  const openMenuBtn = document.getElementById('openMenu');
  const closeMenuBtn = document.getElementById('closeMenu');

  function openSideDrawer() {
    sideDrawer.classList.add('open');
    menuBackdrop.classList.add('open');
    document.body.classList.add('drawer-open'); // נועל גלילה
  }
  
  function closeSideDrawer() {
    sideDrawer.classList.remove('open');
    menuBackdrop.classList.remove('open');
    document.body.classList.remove('drawer-open'); // מחזיר גלילה
  }
  

  openMenuBtn?.addEventListener('click', openSideDrawer);
  closeMenuBtn?.addEventListener('click', closeSideDrawer);
  menuBackdrop?.addEventListener('click', closeSideDrawer);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && sideDrawer?.classList.contains('open')) closeSideDrawer(); });

  // expose closeSideDrawer for chips handler
  window.closeSideDrawer = closeSideDrawer;
}

// Contact overlay (optional prefetch)
export function initContactOverlay() {
  const contactLink = document.querySelector('.menu a[href="contact-us.html"]') || document.querySelector('.menu a[href="#contact"]');
  const contactOverlay = document.getElementById('contactOverlay');
  const contactContent = document.getElementById('contactContent');
  const closeContactBtn = document.getElementById('closeContact');

  async function openContactInline(e) {
    if (e) e.preventDefault();
    try {
      if (!contactContent.dataset.loaded) {
        const res = await fetch('contact-us.html', { credentials: 'same-origin' });
        if (!res.ok) throw new Error('failed to fetch contact');
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const section = doc.querySelector('#contact') || doc.body;
        contactContent.innerHTML = section.innerHTML;
        contactContent.dataset.loaded = '1';
      }
      const contactTitle = document.getElementById('contactTitle');
      if (contactTitle) contactTitle.textContent = (localStorage.getItem('lang') === 'ar') ? 'تواصل معنا' : 'יצירת קשר';
      contactOverlay.classList.add('open');
      contactOverlay.setAttribute('aria-hidden', 'false');
    } catch (err) {
      window.location.href = 'contact-us.html';
    }
  }

  if (contactLink) {
    contactLink.addEventListener('click', openContactInline);
    contactLink.addEventListener('click', () => window.closeSideDrawer && window.closeSideDrawer());
  }
  closeContactBtn?.addEventListener('click', () => {
    contactOverlay.classList.remove('open');
    contactOverlay.setAttribute('aria-hidden', 'true');
  });
  contactOverlay?.addEventListener('click', (e) => { if (e.target === contactOverlay) closeContactBtn.click(); });

  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => { fetch('contact-us.html', { credentials: 'same-origin' }).catch(() => {}); });
  } else {
    setTimeout(() => { fetch('contact-us.html', { credentials: 'same-origin' }).catch(() => {}); }, 1200);
}

}
