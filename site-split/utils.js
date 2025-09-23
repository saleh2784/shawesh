import { FALLBACK_IMG } from './config.js';
import { canonicalCategory, inferCategoryFromFilename } from './categories.js';
import { state } from './state.js';

export const BAG_PLUS = (size = 18) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
  <path d="M8 7V6a4 4 0 0 1 8 0v1h2.25c.96 0 1.75.79 1.75 1.75v9.5A2.75 2.75 0 0 1 17.25 21h-10.5A2.75 2.75 0 0 1 4 18.25v-9.5C4 7.79 4.79 7 5.75 7H8zm2 0h4V6a2 2 0 1 0-4 0v1z"/>
  <path d="M12 10.25a.75.75 0 0 1 .75.75v1.75H14.5a.75.75 0 0 1 0 1.5h-1.75V16a.75.75 0 0 1-1.5 0v-1.75H9.5a.75.75 0 0 1 0-1.5h1.75V11a.75.75 0 0 1 .75-.75z"/>
</svg>`;

export function parsePrice(val) {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const num = String(val).replace(/[^0-9.,]/g, '').replace(/,(?=\d{3}(\D|$))/g, '');
  const normalized = num.replace(',', '.');
  const f = parseFloat(normalized);
  return isNaN(f) ? 0 : f;
}

export function formatPrice(val) {
  const n = parsePrice(val);
  return `₪${Math.round(n).toLocaleString('he-IL')}`;
}

export function normalizeProducts(arr, srcFile = '') {
  if (!Array.isArray(arr)) return [];
  const defCat = inferCategoryFromFilename(srcFile);
  return arr.map(p => {
    const rawCat = (p.category || p.type || defCat || 'other');
    return {
      id: p.id ?? (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2)),
      name: p.name ?? '',
      name_he: p.name_he ?? '',
      name_ar: p.name_ar ?? '',
      description: p.description ?? '',
      description_he: p.description_he ?? '',
      description_ar: p.description_ar ?? '',
      price: parsePrice(p.price ?? p.cost ?? 0),
      category: canonicalCategory(rawCat),
      image: (p.image || p.img || '').trim() || (typeof FALLBACK_IMG !== 'undefined' ? FALLBACK_IMG : ''),
      related: Array.isArray(p.related) ? p.related : [],
      recommended: Boolean(p.recommended ?? p.featured ?? p.is_recommended ?? p.highlight ?? false),
      _src: srcFile,
    };
  });
}

export function pName(p) {
  return (state.lang === 'ar' ? (p.name_ar || p.name_he || p.name) : (p.name_he || p.name_ar || p.name)) || '';
}

export function pDesc(p) {
  return (state.lang === 'ar' ? (p.description_ar || p.description_he || p.description)
    : (p.description_he || p.description_ar || p.description)) || '';
}

// WhatsApp helpers
import { I18N } from './i18n.js';
export function buildWAProductMessage(lang, p) {
  const priceFmt = formatPrice(p.price);
  const nm = pName(p);
  return I18N[lang].whats_product(nm, priceFmt);
}

export function buildWACartMessage(lang, items, findProdById) {
  let total = 0;
  const lines = items.map(it => {
    const p = findProdById(it.id);
    const qty = it.qty || 1;
    const unit = parsePrice(it.price);
    total += unit * qty;
    const unitFmt = formatPrice(unit);
    const nm = pName(p || it);
    return I18N[lang].whats_line(nm, qty, unitFmt);
  });
  const totalFmt = formatPrice(total);
  return I18N[lang].whats_cart(lines, totalFmt);
}

// Effects
export function pressAnim(el) {
  if (!el) return;
  el.classList.remove('btn-pressed');
  void el.offsetWidth;
  el.classList.add('btn-pressed');
  setTimeout(() => el.classList.remove('btn-pressed'), 220);
}

export function bumpCart() {
  const c = document.getElementById('cartCount');
  if (!c) return;
  c.classList.remove('bump');
  void c.offsetWidth;
  c.classList.add('bump');
}

export function flyToCartFrom(imgEl) {
  try {
    if (!imgEl) return;
    const src = imgEl.getBoundingClientRect();
    const destEl = document.getElementById('cartCount') || document.getElementById('openCart');
    if (!destEl) return;
    const dest = destEl.getBoundingClientRect();

    const ghost = imgEl.cloneNode(true);
    ghost.className = 'fly-ghost';
    Object.assign(ghost.style, {
      position: 'fixed',
      top: `${src.top}px`,
      left: `${src.left}px`,
      width: `${src.width}px`,
      height: `${src.height}px`,
      borderRadius: '10px',
      zIndex: 1000,
      pointerEvents: 'none'
    });
    document.body.appendChild(ghost);

    const dx = dest.left + dest.width / 2 - (src.left + src.width / 2);
    const dy = dest.top + dest.height / 2 - (src.top + src.height / 2);

    const anim = ghost.animate([
      { transform: 'translate3d(0,0,0) scale(1)', opacity: 1 },
      { transform: `translate3d(${dx}px, ${dy}px, 0) scale(.2)`, opacity: .25 }
    ], { duration: 700, easing: 'cubic-bezier(.2,.7,.2,1)' });

    anim.onfinish = () => ghost.remove();
  } catch (e) { /* no-op */ }
}
