import { PHONE, FALLBACK_IMG, WA_ICON } from './config.js';
import { state } from './state.js';
import { t, catLabel } from './i18n.js';
import { formatPrice, pressAnim, bumpCart, flyToCartFrom, buildWAProductMessage } from './utils.js';
import { addToCart, updateCartUI } from './cart.js';
// ברנדר/מודאל
import { BAG_PLUS } from './utils.js';


// ===== RENDER GRID =====
// ===== RENDER GRID =====
// ===== RENDER GRID =====
export function render(items) {
  const grid = document.getElementById('grid');
  if (!grid) return;
  grid.innerHTML = '';
  if (!items.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;opacity:.8;text-align:center;padding:1.4rem;background:var(--card);border:1px solid var(--border);border-radius:14px;">${t('empty')}</div>`;
    return;
  }

  // אייקון תיק + פלוס
  const BAG_PLUS = (size = 18) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
  <path d="M8 7V6a4 4 0 0 1 8 0v1h2.25c.96 0 1.75.79 1.75 1.75v9.5A2.75 2.75 0 0 1 17.25 21h-10.5A2.75 2.75 0 0 1 4 18.25v-9.5C4 7.79 4.79 7 5.75 7H8zm2 0h4V6a2 2 0 1 0-4 0v1z"/>
  <path d="M12 10.25a.75.75 0 0 1 .75.75v1.75H14.5a.75.75 0 0 1 0 1.5h-1.75V16a.75.75 0 0 1-1.5 0v-1.75H9.5a.75.75 0 0 1 0-1.5h1.75V11a.75.75 0 0 1 .75-.75z"/>
</svg>`;

  const frag = document.createDocumentFragment();

  items.forEach(p => {
    const name =
      (state.lang === 'ar' ? (p.name_ar || p.name_he || p.name) : (p.name_he || p.name_ar || p.name)) || '';
    const priceFmt = formatPrice(p.price);

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
            ${BAG_PLUS(18)} ${t('btn.add')}
          </button>
        </div>
      </div>
    `;

    // פתיחת מודאל בלחיצה על הכרטיס / התמונה
    el.querySelector('.thumb').addEventListener('click', (e) => { e.preventDefault(); openModalProd(p); });
    el.addEventListener('click', (e) => {
      if (e.target.closest('[data-add]')) return;
      openModalProd(p);
    });

    // הוסף לסל
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
    const name = (state.lang === 'ar'
      ? (p.name_ar || p.name_he || p.name)
      : (p.name_he || p.name_ar || p.name)) || '';
  
    const a = document.createElement('div');   // שינוי: div במקום <a> כדי שנוכל לשים כפתורים בפנים
    a.className = 'carousel-card';
    a.setAttribute('role', 'listitem');
  
    const badge = state.lang === 'ar' ? 'موصى به' : 'מומלץ';
  
    // אייקון BAG+ (אותו מהגריד/מודאל)
    const BAG_PLUS = (size = 18) => `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M8 7V6a4 4 0 0 1 8 0v1h2.25c.96 0 1.75.79 1.75 1.75v9.5A2.75 2.75 0 0 1 17.25 21h-10.5A2.75 2.75 0 0 1 4 18.25v-9.5C4 7.79 4.79 7 5.75 7H8zm2 0h4V6a2 2 0 1 0-4 0v1z"/>
        <path d="M12 10.25a.75.75 0 0 1 .75.75v1.75H14.5a.75.75 0 0 1 0 1.5h-1.75V16a.75.75 0 0 1-1.5 0v-1.75H9.5a.75.75 0 0 1 0-1.5h1.75V11a.75.75 0 0 1 .75-.75z"/>
      </svg>`;
  
    a.innerHTML = `
      <img src="${p.image || FALLBACK_IMG}" alt="${name}" loading="lazy" decoding="async"
           onerror="this.onerror=null; this.src='${FALLBACK_IMG}'">
      <span class="s-badge">${badge}</span>
      <div class="s-info">
        <div class="s-title">${name}</div>
        <div class="s-price">${formatPrice(p.price)}</div>
        <div class="actions">
          <button class="btn add" data-add="${p.id}">
            ${BAG_PLUS(18)} ${t('btn.add')}
          </button>
        </div>
      </div>
    `;
  
    // פתיחת מודאל בלחיצה על התמונה
    a.querySelector('img').addEventListener('click', (e) => { e.preventDefault(); openModalProd(p); });
  
    // טיפול בכפתור הוסף לסל
    a.querySelector('[data-add]').addEventListener('click', (e) => {
      e.stopPropagation();
      addToCart(p);
      pressAnim(e.currentTarget);
      bumpCart();
      flyToCartFrom(a.querySelector('img'));
    });
  
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

