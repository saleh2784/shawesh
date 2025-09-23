import { state } from './state.js';
import { ensureLangToggle, applyLang } from './i18n.js';
import { loadProducts } from './data.js';
import { normalizeProducts } from './utils.js';
import { render, buildHeroSlider, initModal, initYear } from './ui.js';
import { initCartControls, updateCartUI } from './cart.js';
import { initControls, initTheme, initSideDrawer, initContactOverlay } from './controls.js';
import { applyFilters } from './filters.js';

(async function init() {
  const savedLang = localStorage.getItem('lang');
  state.lang = (savedLang === 'ar' || savedLang === 'he') ? savedLang : 'ar';
  ensureLangToggle();
  applyLang();

  initYear();
  initModal();
  initCartControls();
  initControls();
  initTheme();
  initSideDrawer();
  initContactOverlay();

  const raw = await loadProducts();
  state.products = normalizeProducts(raw);
  state.filtered = state.products;
  render(state.filtered);
  updateCartUI();
  buildHeroSlider(state.products);

  // re-apply filters if needed after language toggle
  applyFilters();
})();
