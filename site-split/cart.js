import { PHONE, FALLBACK_IMG } from './config.js';
import { state } from './state.js';
import { parsePrice, formatPrice, buildWACartMessage } from './utils.js';
import { t } from './i18n.js';

// ====== CART ======
export function getCart() { try { return JSON.parse(localStorage.getItem('cart') || '[]'); } catch { return [] } }
export function setCart(items) { localStorage.setItem('cart', JSON.stringify(items)); updateCartUI(); }
export function clearCart() {
  localStorage.removeItem('cart');
  updateCartUI();
  closeDrawer();
}

export function addToCart(p) {
  const items = getCart();
  const found = items.find(x => x.id === p.id);
  if (found) { found.qty += 1; } else { items.push({ id: p.id, name: p.name, price: p.price, image: p.image, qty: 1 }); }
  setCart(items);
}
export function removeFromCart(id) { const items = getCart().filter(x => x.id !== id); setCart(items); }
export function changeQty(id, delta) {
  const items = getCart();
  const it = items.find(x => x.id === id);
  if (!it) return;
  it.qty = Math.max(1, it.qty + delta);
  setCart(items);
}
export function sumCart(items) { return items.reduce((s, x) => s + parsePrice(x.price) * x.qty, 0); }

export function updateCartUI() {
  const items = getCart();
  const cartItems = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const drawer = document.getElementById('drawer');
  if (!cartItems || !cartTotal || !checkoutBtn) return;
  cartItems.innerHTML = '';

  const hdrTitle = drawer?.querySelector('header strong');
  if (hdrTitle) hdrTitle.textContent = t('menu.cart');
  const btnClose = drawer?.querySelector('header .icon-btn');
  if (btnClose) btnClose.textContent = t('btn.close');

  if (!items.length) {
    cartItems.innerHTML = `<div style="opacity:.8">${t('empty')}</div>`;
  } else {
    items.forEach(x => {
      const row = document.createElement('div');
      row.className = 'item';
      row.innerHTML = `
        <img src="${x.image || FALLBACK_IMG}" alt="${x.name}"
             onerror="this.onerror=null; this.src='${FALLBACK_IMG}'"
             style="width:56px;height:56px;object-fit:cover;border-radius:8px">
        <div>
          <div style="font-weight:700; color:var(--text)">${x.name}</div>
          <div style="color:var(--muted)">${formatPrice(x.price)}</div>
          <div style="margin-top:.4rem;display:flex;gap:.4rem;align-items:center">
            <button class="icon-btn" data-dec="${x.id}">−</button>
            <span>${x.qty}</span>
            <button class="icon-btn" data-inc="${x.id}">+</button>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:.4rem;align-items:end">
          <strong style="color:var(--text)">${formatPrice(parsePrice(x.price) * x.qty)}</strong>
          <button class="icon-btn" data-del="${x.id}">${t('btn.remove')}</button>
        </div>
      `;
      row.querySelector('[data-dec]').onclick = () => changeQty(x.id, -1);
      row.querySelector('[data-inc]').onclick = () => changeQty(x.id, 1);
      row.querySelector('[data-del]').onclick = () => removeFromCart(x.id);
      cartItems.appendChild(row);
    });
  }

  const clearCartBtn = document.querySelector('.clear-cart-btn');
  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', (e) => {
      e.preventDefault();
      clearCart();
    });
  }

  cartTotal.textContent = formatPrice(sumCart(items));
  const count = items.reduce((c, x) => c + x.qty, 0);
  const cartCountEl = document.getElementById('cartCount');
  if (cartCountEl) cartCountEl.textContent = count;

  const msg = items.length
    ? buildWACartMessage(state.lang, items, (id)=> state.products.find(x => String(x.id) === String(id)))
    : (state.lang === 'ar' ? 'مرحباً! أود تقديم طلب.' : 'שלום! אני מעוניין לבצע הזמנה.');
  checkoutBtn.href = `https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`;
}

export function openDrawer() {
  const drawer = document.getElementById('drawer');
  if (!drawer) return;
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
export function closeDrawer() {
  const drawer = document.getElementById('drawer');
  if (!drawer) return;
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

export function initCartControls() {
  const openCartBtn = document.getElementById('openCart');
  const closeCart = document.getElementById('closeCart');
  openCartBtn?.addEventListener('click', (e) => { e.preventDefault(); openDrawer(); });
  closeCart?.addEventListener('click', (e) => { e.preventDefault(); closeDrawer(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawer(); });
}
