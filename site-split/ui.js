import { PHONE, FALLBACK_IMG, WA_ICON } from './config.js';
import { state } from './state.js';
import { t, catLabel } from './i18n.js';
import { formatPrice, pressAnim, bumpCart, flyToCartFrom, buildWAProductMessage } from './utils.js';
import { addToCart, updateCartUI } from './cart.js';

// ===== RENDER GRID =====
export function render(items) {
  const grid = document.getElementById('grid');
  if (!grid) return;
  grid.innerHTML = '';
  if (!items.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;opacity:.8;text-align:center;padding:1.4rem;background:var(--card);border:1px solid var(--border);border-radius:14px;">${t('empty')}</div>`;
    return;
  }

  const cartIcon = `
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="width:18px;height:18px;margin-inline-start:.3rem">
      <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2zM7.16 14.26l-.03.04c-.3.39-.78.7-1.31.7H4v-2h1.12l2.76-6.59C8.1 5.16 8.53 5 8.99 5H19c.55 0 1 .45 1 1s-.45 1-1 1H9.84l-.9 2h8.73c.75 0 1.41.45 1.7 1.11l2.36 5.3c.16.36.25.76.25 1.18 0 1.65-1.35 3-3 3H8c-.55 0-1-.45-1-1s.45-1 1-1h9.98c.55 0 1-.45 1-1 0-.14-.03-.27-.08-.39l-1.84-4.11H8.53l-1.37 3.26z"/>
    </svg>`;
  const waIcon = WA_ICON(18);

  const frag = document.createDocumentFragment();

  items.forEach(p => {
    const name = (state.lang === 'ar' ? (p.name_ar || p.name_he || p.name) : (p.name_he || p.name_ar || p.name)) || '';
    const priceFmt = formatPrice(p.price);
    const waMsg = buildWAProductMessage(state.lang, p);
    const waLink = `https://wa.me/${PHONE}?text=${encodeURIComponent(waMsg)}`;

    const el = document.createElement('article');
    el.className = 'card card-compact';
    el.innerHTML = `
      <a href="#" class="thumb" aria-label="${name}">
        <img src="${p.image || FALLBACK_IMG}" alt="${name}" loading="lazy" decoding="async"
             onerror="this.onerror=null; this.src='${FALLBACK_IMG}'">
      </a>
      <div class="info">
        <div class="title-row" style="display:flex;justify-content:space-between;align-items:center;gap:.6rem">
          <div class="title">${name}</div>
          <span class="price-pill">${priceFmt}</span>
        </div>
        <div class="meta">${catLabel(p.category)}</div>
        <div class="actions compact">
          <button class="btn add compact" data-add="${p.id}" aria-label="${t('btn.add')}">
            ${cartIcon} ${t('btn.add')}
          </button>
          <a class="btn whats compact" href="${waLink}" target="_blank" rel="noopener" aria-label="${t('btn.order')}">
            ${waIcon} ${t('btn.order')}
          </a>
        </div>
      </div>
    `;

    el.querySelector('.thumb').addEventListener('click', (e) => { e.preventDefault(); openModalProd(p); });
    el.addEventListener('click', (e) => { if (e.target.closest('[data-add],.btn.whats')) return; openModalProd(p); });
    el.querySelector('[data-add]').addEventListener('click', (e) => {
      e.stopPropagation();
      addToCart(p);
      pressAnim(e.currentTarget);
      bumpCart();
      const imgEl = el.querySelector('.thumb img');
      flyToCartFrom(imgEl);
    });

    frag.appendChild(el);
  });

  grid.appendChild(frag);
}

// ====== HERO CAROUSEL ======
export function buildHeroSlider(products) {
  const wrap = document.getElementById('heroCarousel');
  const track = document.getElementById('heroTrack');
  const prevBtn = wrap?.querySelector('.s-nav.prev');
  const nextBtn = wrap?.querySelector('.s-nav.next');

  if (!wrap || !track || !prevBtn || !nextBtn) {
    if (wrap) wrap.style.display = 'none';
    return;
  }
  track.setAttribute('dir', 'ltr');
  track.innerHTML = '';
  const featured = products.filter(p => p.recommended);
  if (!featured.length) { wrap.style.display = 'none'; return; }
  wrap.style.display = 'block';

  featured.forEach(p => {
    const a = document.createElement('a');
    a.href = '#';
    a.className = 'carousel-card';
    a.setAttribute('role', 'listitem');
    a.setAttribute('aria-label', (state.lang === 'ar' ? (p.name_ar || p.name_he || p.name) : (p.name_he || p.name_ar || p.name)) || '');
    a.setAttribute('tabindex', '0');

    const badge = state.lang === 'ar' ? 'موصى به' : 'מומלץ';
    a.innerHTML = `
      <img src="${p.image || FALLBACK_IMG}" alt="${(p.name_he||p.name_ar||p.name)||''}" loading="lazy" decoding="async"
           onerror="this.onerror=null; this.src='${FALLBACK_IMG}'">
      <span class="s-badge">${badge}</span>
      <div class="s-info">
        <div class="s-title">${(state.lang === 'ar' ? (p.name_ar || p.name_he || p.name) : (p.name_he || p.name_ar || p.name)) || ''}</div>
        <div class="s-price">${formatPrice(p.price)}</div>
      </div>`;
    a.addEventListener('click', (e) => { e.preventDefault(); openModalProd(p); });
    track.appendChild(a);
  });

  const scrollStep = 300;
  prevBtn.addEventListener('click', () => { track.scrollBy({ left: -scrollStep, behavior: 'smooth' }); });
  nextBtn.addEventListener('click', () => { track.scrollBy({ left: scrollStep, behavior: 'smooth' }); });
  // ====== Auto-play every 3s ======
let autoScroll = setInterval(() => {
  track.scrollBy({ left: scrollStep, behavior: 'smooth' });

  // אם הגענו לסוף, נחזור להתחלה
  if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 5) {
    track.scrollTo({ left: 0, behavior: 'smooth' });
  }
}, 3000);

// אם המשתמש מזיז ידנית – נשהה את האוטו־פליי
track.addEventListener('scroll', () => {
  clearInterval(autoScroll);
  autoScroll = setInterval(() => {
    track.scrollBy({ left: scrollStep, behavior: 'smooth' });
    if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 5) {
      track.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, 3000);
});

}

// ====== MODAL ======
export function openModalProd(p) {
  const modal = document.getElementById('modal');
  const mImg = document.getElementById('mImg');
  const mTitle = document.getElementById('mTitle');
  const mCat = document.getElementById('mCat');
  const mDesc = document.getElementById('mDesc');
  const mPrice = document.getElementById('mPrice');
  const mAdd = document.getElementById('mAdd');
  const mWhats = document.getElementById('mWhats');

  if (!modal || !mImg || !mTitle || !mCat || !mDesc || !mPrice || !mAdd || !mWhats) return;

  state.modalProd = p;
  mImg.src = p.image || FALLBACK_IMG;
  mImg.onerror = () => { mImg.onerror = null; mImg.src = FALLBACK_IMG; };
  mTitle.textContent = (state.lang === 'ar' ? (p.name_ar || p.name_he || p.name) : (p.name_he || p.name_ar || p.name)) || '';
  mCat.textContent = catLabel(p.category);
  mDesc.textContent = (state.lang === 'ar' ? (p.description_ar || p.description_he || p.description)
    : (p.description_he || p.description_ar || p.description)) || '';
  mPrice.textContent = formatPrice(p.price);

  mAdd.textContent = t('btn.add');
  mAdd.classList.add('add');
  mAdd.onclick = () => {
    addToCart(p);
    pressAnim(mAdd);
    bumpCart();
    flyToCartFrom(mImg);
  };

  const waMsg = buildWAProductMessage(state.lang, p);
  mWhats.classList.add('whats');
  mWhats.href = `https://wa.me/${PHONE}?text=${encodeURIComponent(waMsg)}`;
  mWhats.innerHTML = `${WA_ICON(18)} ${t('btn.order')}`;

  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden', 'false');
}
export function closeModal() {
  const modal = document.getElementById('modal');
  if (!modal) return;
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden', 'true');
  state.modalProd = null;
}
export function initModal() {
  const closeModalBtn = document.getElementById('closeModal');
  const modal = document.getElementById('modal');
  closeModalBtn?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
}

export function initYear() {
  const yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();
}

