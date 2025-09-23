/* =========================
  الشاوِيش للعطور — main.js
  RTL, i18n (HE/AR), Cart, Modal, WhatsApp, Carousel, Header Menu
  ========================= */

// ====== CONFIG ======
const PHONE = '972505320456'; // WhatsApp (ללא אפסים/סימנים)
const DATA_FILES = ['products.json', 'women_perfumes_ar.json', 'others.json'];
const FALLBACK_IMG = '/images/cat/logo.jpg';

// אייקון וואטסאפ (SVG)
const WA_ICON = (size = 18) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
  width="${size}" height="${size}" fill="currentColor" aria-hidden="true">
  <path d="M20.52 3.5a11 11 0 0 0-17.05 12.5L2 21.5l5.6-1.46A11 11 0 0 0 21 11a10.9 10.9 0 0 0-.48-7.5zM12 19.9a8 8 0 0 1-4.12-1.13l-.3-.18-3.33.86.89-3.24-.19-.33A8 8 0 1 1 12 19.9zm4.49-6.06c-.24-.12-1.43-.7-1.65-.78s-.38-.12-.54.12-.62.78-.76.95-.28.18-.5.06a6.6 6.6 0 0 1-3.5-3 .41.41 0 0 1 .05-.5c.1-.12.24-.31.36-.45s.16-.24.24-.4a.86.86 0 0 0 .05-.44c0-.12-.54-1.3-.74-1.78s-.39-.42-.54-.43h-.46a.9.9 0 0 0-.65.3A2.75 2.75 0 0 0 7 8.27a4.8 4.8 0 0 0 1 2.53A10.9 10.9 0 0 0 12.2 14a9.1 9.1 0 0 0 1.56.44 1.33 1.33 0 0 0 .92-.3 3.63 3.63 0 0 0 .77-1.02.77.77 0 0 0-.04-.7c-.08-.14-.22-.2-.44-.33z"/>
</svg>`;

// ====== CATEGORY HELPERS ======
function inferCategoryFromFilename(fname = '') {
  const f = fname.toLowerCase();
  if (f.includes('men')) return 'men';
  if (f.includes('women') || f.includes('lady') || f.includes('ladies')) return 'women';
  if (f.includes('air') || f.includes('freshener')) return 'air';
  if (f.includes('cream')) return 'cream';
  if (f.includes('maklot')) return 'maklotim';
  if (f.includes('electro') || f.includes('elctro') || f.includes('device')) return 'elctro';
  if (f.includes('mabakher') || f.includes('incense') || f.includes('bakhour')) return 'mabakher';
  return 'other';
}
const CATEGORY_ALIASES = {
  men: ['men', 'male', 'גברים', 'זכר', 'رجال', 'للرجال'],
  women: ['women', 'woman', 'ladies', 'lady', 'נשים', 'נקבה', 'نساء', 'للنساء'],
  air: ['air', 'airfreshener', 'air-freshener', 'freshener', 'מטהרי אוויר', 'מטהר', 'ריחן', 'معطر', 'معطرات', 'معطرات الجو'],
  cream: ['cream', 'קרם', 'مرهم', 'كريم'],
  maklotim: ['maklotim', 'מקלוטים', 'מקלוט', 'بخور', 'بخّور', 'عود'],
  elctro: ['elctro', 'electro', 'electronics', 'electronic', 'device', 'devices', 'מכשיר', 'מכשירים', 'חשמל', 'אלקטרוניקה', 'اجهزة', 'أجهزة', 'الكترونيات', 'إلكترونيات'],
  mabakher: ['mabakher', 'incense', 'بخور', 'مباخر', 'عود'],
  other: ['other', 'misc', 'כללי', 'אחר', 'אחרים', 'متنوع']
};
function canonicalCategory(input = '') {
  const s = String(input).toLowerCase().trim();
  for (const [canon, variants] of Object.entries(CATEGORY_ALIASES)) {
    if (variants.includes(s)) return canon;
  }
  if (/men|male|رجال|للرجال/.test(s)) return 'men';
  if (/women|lady|ladies|نساء|للنساء/.test(s)) return 'women';
  if (/air|freshener|מטהר|ריחן|معطر/.test(s)) return 'air';
  if (/cream|كريم|קרם/.test(s)) return 'cream';
  if (/maklot|מקלוט|مباخر|بخور|عود/.test(s)) return 'maklotim';
  if (/electro|device|electron|מכשיר|אלקטרו|كهرباء|جهاز|أجهزة|الكترون/.test(s)) return 'elctro';
  if (/mabakher|incense|مباخر|بخور/.test(s)) return 'mabakher';
  return 'other';
}

// ====== STATE ======
const state = {
  products: [],
  filtered: [],
  category: 'all',
  q: '',
  modalProd: null,
  lang: 'he', // 'he' | 'ar' (יוחלף בערך שמור/ברירת מחדל בהמשך)
};

// ====== DOM ELEMENTS (Caching) ======
const grid = document.getElementById('grid');
const modal = document.getElementById('modal');
const mImg = document.getElementById('mImg');
const mTitle = document.getElementById('mTitle');
const mCat = document.getElementById('mCat');
const mDesc = document.getElementById('mDesc');
const mPrice = document.getElementById('mPrice');
const mAdd = document.getElementById('mAdd');
const mWhats = document.getElementById('mWhats');
const closeModalBtn = document.getElementById('closeModal');
const drawer = document.getElementById('drawer');
const openCartBtn = document.getElementById('openCart');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const cartCountEl = () => document.getElementById('cartCount');
const chips = [...document.querySelectorAll('.chip')];
const searchInput = document.getElementById('search');
const navChips = [...document.querySelectorAll('.drawer-chips .chip')];
const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const sideDrawer = document.getElementById('sideDrawer');
const menuBackdrop = document.getElementById('menuBackdrop');
const openMenuBtn = document.getElementById('openMenu');
const closeMenuBtn = document.getElementById('closeMenu');

// ====== I18N (Hebrew + Arabic) ======
const I18N = {
  he: {
    menu: { catalog: 'מוצרים', contact: 'יצירת קשר', about: 'עלינו', cart: 'העגלה' },
    hero: { title: 'ניחוחות שמספרים סיפור', subtitle: 'לחיצה על מוצר תפתח כרטיס פרטים מלא עם תמונה, מחיר, הוסף לעגלה, והזמנה בוואטסאפ.' },
    controls: { searchPH: 'חיפוש לפי שם / תיאור...' },
    categories: { all: 'הכל', men: 'בשמים לגברים', women: 'בשמים לנשים', air: 'מטהרי אוויר', cream: 'קרם', maklotim: 'מקלוטים', elctro: 'מכשירים', mabakher: 'מבערי קטורת' },
    about: { title: 'עלינו', body: 'אנחנו מאמינים שכל ריח מספר סיפור. איכות, אלגנטיות, ומצוינות — בכל בקבוק.' },
    empty: 'לא נמצאו מוצרים.',
    btn: { add: 'הוסף לעגלה', whats: 'הזמן עכשיו', order: 'הזמן עכשיו', close: 'סגור', remove: 'הסר' },
    whats_product: (name, priceFmt) => `שלום,
אני מעוניין להזמין:
• ${name} + כמות: 1 + מחיר: ${priceFmt}

סה״כ: ${priceFmt}`,
    whats_cart: (lines, totalFmt) => `שלום,
אני מעוניין להזמין:
${lines.join('\n')}

סה״כ: ${totalFmt}`,
    whats_line: (name, qty, unitFmt) => `• ${name} + כמות: ${qty} + מחיר: ${unitFmt}`,
  },
  ar: {
    menu: { catalog: 'المنتجات', contact: 'تواصل معنا', about: 'عنّا', cart: 'السلة' },
    hero: { title: 'عطور تحكي قصة', subtitle: 'بالنقر على المنتج ستُفتح بطاقة تفاصيل كاملة تحتوي على صورة وسعر وزر «أضف إلى السلة» وخيار الطلب عبر واتساب.' },
    controls: { searchPH: 'ابحث بالاسم / الوصف...' },
    categories: { all: 'الكل', men: 'عطور للرجال', women: 'عطور للنساء', air: 'معطرات الجو', cream: 'كريم', maklotim: 'مكلوتيم', elctro: 'اجهزة', mabakher: 'مباخر' },
    about: { title: 'عنّا', body: 'نحن نؤمن بأن كل رائحة تحكي قصة. جودة، أناقة، وتميّز — في كل زجاجة.' },
    empty: 'لا توجد منتجات.',
    btn: { add: 'أضف إلى السلة', whats: 'اطلب الان', order: 'اطلب الان', close: 'إغلاق', remove: 'حذف' },
    whats_product: (name, priceFmt) => `مرحباً،
أرغب بالطلب:
• ${name} + الكمية: 1 + السعر: ${priceFmt}

الإجمالي: ${priceFmt}`,
    whats_cart: (lines, totalFmt) => `مرحباً،
أرغب بالطلب:
${lines.join('\n')}

الإجمالي: ${totalFmt}`,
    whats_line: (name, qty, unitFmt) => `• ${name} + الكمية: ${qty} + السعر: ${unitFmt}`,
  }
};

function t(path) {
  const seg = path.split('.');
  let v = I18N[state.lang];
  for (const s of seg) v = v?.[s];
  return (typeof v === 'string') ? v : v ?? '';
}
function catLabel(code) { return I18N[state.lang].categories[code] || code || ''; }

// ====== PRICE HELPERS ======
function parsePrice(val) {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const num = String(val).replace(/[^0-9.,]/g, '').replace(/,(?=\d{3}(\D|$))/g, '');
  const normalized = num.replace(',', '.');
  const f = parseFloat(normalized);
  return isNaN(f) ? 0 : f;
}
function formatPrice(val) {
  const n = parsePrice(val);
  return `₪${Math.round(n).toLocaleString('he-IL')}`;
}

// ====== DATA NORMALIZATION ======
function normalizeProducts(arr, srcFile = '') {
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
function pName(p) {
  return (state.lang === 'ar' ? (p.name_ar || p.name_he || p.name) : (p.name_he || p.name_ar || p.name)) || '';
}
function pDesc(p) {
  return (state.lang === 'ar' ? (p.description_ar || p.description_he || p.description)
    : (p.description_he || p.description_ar || p.description)) || '';
}

// ====== LOAD PRODUCTS ======
async function loadProducts() {
  const param = new URLSearchParams(location.search).get('data');
  const files = param ? param.split(',').map(s => s.trim()).filter(Boolean) : DATA_FILES;

  try {
    const batches = await Promise.all(files.map(async file => {
      const res = await fetch(file, { cache: 'no-store' });
      if (!res.ok) throw new Error(`fetch ${file} failed`);
      const json = await res.json();
      const list = Array.isArray(json) ? json : (json.products || []);
      return normalizeProducts(list, file);
    }));

    // Merge + unique by id
    const merged = batches.flat();
    const seen = new Set(),
      uniq = [];
    for (const p of merged) {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        uniq.push(p);
      }
    }
    return uniq;
  } catch (e) {
    console.warn('שגיאה בטעינת קבצים, נופל ל-fallback', e);
    try {
      const raw = document.getElementById('products-fallback')?.textContent?.trim() || '';
      const data = JSON.parse(raw);
      return normalizeProducts(data.products || [], 'fallback');
    } catch {
      return [];
    }
  }
}

// ====== FILTERS ======
function byCategory(p, cat) { return cat === 'all' ? true : canonicalCategory(p.category) === canonicalCategory(cat); }
function byQuery(p, q) {
  if (!q) return true;
  const text = (pName(p) + ' ' + pDesc(p)).toLowerCase();
  return text.includes(q.toLowerCase());
}

// ====== WHATSAPP MESSAGES ======
function findProdById(id) { return state.products.find(x => String(x.id) === String(id)); }

// מוצר יחיד
function buildWAProductMessage(lang, p) {
  const priceFmt = formatPrice(p.price);
  const nm = pName(p);
  return I18N[lang].whats_product(nm, priceFmt);
}

// עגלה
function buildWACartMessage(lang, items) {
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

// ====== RENDER GRID ======
function render(items) {
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
    const name = pName(p);
    const priceFmt = formatPrice(p.price);
    const waMsg = buildWAProductMessage(state.lang, p);
    const waLink = `https://wa.me/${PHONE}?text=${encodeURIComponent(waMsg)}`;

    const el = document.createElement('article');
    el.className = 'card card-compact';
    el.innerHTML = `
      <a href="#" class="thumb" aria-label="${name}">
        <img src="${p.image || FALLBACK_IMG}"
          alt="${name}" loading="lazy" decoding="async"
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

    // פתיחת מודאל (התיאור יופיע רק שם)
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
function buildHeroSlider(products) {
  const wrap = document.getElementById('heroCarousel');
  const track = document.getElementById('carouselTrack');
  const indicatorsContainer = document.getElementById('carouselIndicators');

  if (!wrap || !track || !indicatorsContainer) return;

  track.innerHTML = '';
  indicatorsContainer.innerHTML = '';

  const featured = products.filter(p => p.recommended);
  if (!featured.length) {
    wrap.style.display = 'none';
    return;
  }
  wrap.style.display = 'block';

  featured.forEach((p, index) => {
    const a = document.createElement('a');
    a.href = '#';
    a.className = 'carousel-card';
    a.setAttribute('role', 'listitem');
    a.setAttribute('aria-label', pName(p));
    a.setAttribute('tabindex', '0');

    const badge = state.lang === 'ar' ? 'موصى به' : 'מומלץ';
    a.innerHTML = `
      <img src="${p.image || FALLBACK_IMG}"
            alt="${pName(p)}"
            loading="lazy"
            decoding="async"
            onerror="this.onerror=null; this.src='${FALLBACK_IMG}'">
      <span class="s-badge">${badge}</span>
      <div class="s-info">
        <div class="s-title">${pName(p)}</div>
        <div class="s-price">${formatPrice(p.price)}</div>
      </div>`;

    a.addEventListener('click', (e) => {
      e.preventDefault();
      openModalProd(p);
    });

    track.appendChild(a);

    const dot = document.createElement('div');
    dot.className = 'indicator';
    if (index === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(index));
    indicatorsContainer.appendChild(dot);
  });

  let currentIndex = 0;
  const cards = track.children;
  const totalCards = cards.length;

  function updateIndicators() {
    document.querySelectorAll('.indicator').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }

  function goToSlide(index) {
    currentIndex = index;
    const cardWidth = cards[0]?.offsetWidth || 300;
    const gap = 16;
    const offset = index * (cardWidth + gap);
    track.style.transform = `translateX(-${offset}px)`;
    updateIndicators();
  }

  goToSlide(0); // תחילת קרוסלה ממוצר הראשון

  function nextSlide() {
    currentIndex = (currentIndex + 1) % totalCards;
    goToSlide(currentIndex);
  }

  function prevSlide() {
    currentIndex = (currentIndex - 1 + totalCards) % totalCards;
    goToSlide(currentIndex);
  }

  const prevBtn = wrap.querySelector('.carousel-nav.prev');
  const nextBtn = wrap.querySelector('.carousel-nav.next');

  prevBtn?.addEventListener('click', prevSlide);
  nextBtn?.addEventListener('click', nextSlide);

  if (totalCards > 1) {
    let autoPlayInterval = setInterval(nextSlide, 5000);
    wrap.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
    wrap.addEventListener('mouseleave', () => {
      autoPlayInterval = setInterval(nextSlide, 5000);
    });
  }
}

// ====== MODAL ======
function openModalProd(p) {
  if (!modal || !mImg || !mTitle || !mCat || !mDesc || !mPrice || !mAdd || !mWhats) return;

  state.modalProd = p;
  mImg.src = p.image || FALLBACK_IMG;
  mImg.onerror = () => { mImg.onerror = null; mImg.src = FALLBACK_IMG; };
  mTitle.textContent = pName(p);
  mCat.textContent = catLabel(p.category);
  mDesc.textContent = pDesc(p);
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
function closeModal() {
  if (!modal) return;
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden', 'true');
  state.modalProd = null;
}
closeModalBtn?.addEventListener('click', closeModal);
modal?.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

// ====== CART ======
function getCart() { try { return JSON.parse(localStorage.getItem('cart') || '[]'); } catch { return [] } }
function setCart(items) { localStorage.setItem('cart', JSON.stringify(items)); updateCartUI(); }
function addToCart(p) {
  const items = getCart();
  const found = items.find(x => x.id === p.id);
  if (found) { found.qty += 1; } else { items.push({ id: p.id, name: pName(p), price: p.price, image: p.image, qty: 1 }); }
  setCart(items);
}
function removeFromCart(id) { const items = getCart().filter(x => x.id !== id); setCart(items); }
function changeQty(id, delta) {
  const items = getCart();
  const it = items.find(x => x.id === id);
  if (!it) return;
  it.qty = Math.max(1, it.qty + delta);
  setCart(items);
}
function sumCart(items) { return items.reduce((s, x) => s + parsePrice(x.price) * x.qty, 0); }

function updateCartUI() {
  const items = getCart();
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

  cartTotal.textContent = formatPrice(sumCart(items));
  const count = items.reduce((c, x) => c + x.qty, 0);
  if (cartCountEl()) cartCountEl().textContent = count;

  const msg = items.length
    ? buildWACartMessage(state.lang, items)
    : (state.lang === 'ar' ? 'مرحباً! أود تقديم طلب.' : 'שלום! אני מעוניין לבצע הזמנה.');
  checkoutBtn.href = `https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`;
}

function openDrawer() {
  if (!drawer) return;
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeDrawer() {
  if (!drawer) return;
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}
openCartBtn?.addEventListener('click', (e) => { e.preventDefault(); openDrawer(); });
closeCart?.addEventListener('click', (e) => { e.preventDefault(); closeDrawer(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && drawer?.classList.contains('open')) closeDrawer(); });

// ====== CONTROLS (chips + search) ======
function syncActiveChips(cat) {
  navChips.forEach(c => c.classList.toggle('active', c.dataset.cat === cat));
  chips.forEach(c => c.classList.toggle('active', c.dataset.cat === cat));
}

function applyFilters() {
  syncActiveChips(state.category);
  state.filtered = state.products.filter(p => byCategory(p, state.category) && byQuery(p, state.q));
  render(state.filtered);
}

navChips.forEach(chip => {
  chip.addEventListener('click', (e) => {
    e.preventDefault();
    const cat = chip.dataset.cat;
    state.category = cat;
    applyFilters();
    closeSideDrawer();
  });
});

chips.forEach(chip => chip.addEventListener('click', () => {
  state.category = chip.dataset.cat;
  applyFilters();
}));

searchInput?.addEventListener('input', (e) => { state.q = e.target.value; applyFilters(); });

// ====== THEME ======
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
(function initTheme() {
  const saved = localStorage.getItem('theme');
  applyTheme(saved || 'dark');
})();
themeToggle?.addEventListener('click', () => {
  const isLight = root.getAttribute('data-theme') === 'light';
  applyTheme(isLight ? 'dark' : 'light');
});

// ====== LANGUAGE ======
function ensureLangToggle() {
  let btn = document.getElementById('langToggle');
  const menu = document.querySelector('.menu');
  if (!btn && menu) {
    btn = document.createElement('button');
    btn.id = 'langToggle';
    btn.className = 'icon-btn';
    menu.appendChild(btn);
  }
  if (btn) {
    btn.onclick = () => {
      setLang(state.lang === 'he' ? 'ar' : 'he');
    };
  }
  updateLangToggleLabel();
}
function updateLangToggleLabel() {
  const btn = document.getElementById('langToggle');
  if (!btn) return;
  btn.textContent = (state.lang === 'he') ? 'AR' : 'HE';
  btn.title = (state.lang === 'he') ? 'עבר לערבית' : 'التبديل إلى العبرية';
}
function setLang(lang) {
  state.lang = (lang === 'ar') ? 'ar' : 'he';
  localStorage.setItem('lang', state.lang);
  applyLang();
  applyFilters();
  updateCartUI();
  buildHeroSlider(state.products);
}
function applyLang() {
  document.documentElement.lang = (state.lang === 'ar') ? 'ar' : 'he';
  document.documentElement.dir = 'rtl';

  const heroTitle = document.querySelector('.hero h1');
  if (heroTitle) heroTitle.textContent = t('hero.title');
  if (searchInput) searchInput.placeholder = t('controls.searchPH');

  chips.forEach(chip => { const k = chip.dataset.cat || 'all'; chip.textContent = catLabel(k); });
  navChips.forEach(chip => { const k = chip.dataset.cat || 'all'; chip.textContent = catLabel(k); });


  const linkCatalog = document.querySelector('.menu a[href="#catalog"]');
  if (linkCatalog) linkCatalog.textContent = t('menu.catalog');
  const linkContact = document.querySelector('.menu a[href*="contact"]');
  if (linkContact) linkContact.textContent = t('menu.contact');
  const linkAbout = document.querySelector('.menu a[href="#about"]');
  if (linkAbout) linkAbout.textContent = t('menu.about');

  const aboutTitleEl = document.querySelector('#about h2');
  const aboutBodyEl = document.querySelector('#about p');
  if (aboutTitleEl) aboutTitleEl.textContent = t('about.title');
  if (aboutBodyEl) aboutBodyEl.textContent = t('about.body');

  const heroSub = document.querySelector('.hero p');
  if (heroSub) heroSub.textContent = t('hero.subtitle');

  if (openCartBtn) {
    const count = cartCountEl();
    openCartBtn.textContent = `🛒 ${t('menu.cart')} `;
    if (count) openCartBtn.appendChild(count);
  }
  if (mAdd) mAdd.textContent = t('btn.add');
  if (mWhats) mWhats.innerHTML = `${WA_ICON(18)} ${t('btn.order')}`;

  const contactTitle = document.getElementById('contactTitle');
  if (contactTitle) contactTitle.textContent = (state.lang === 'ar') ? 'تواصل معنا' : 'יצירת קשר';

  updateLangToggleLabel();
}

// ===== Inline Contact Overlay =====
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
    if (contactTitle) contactTitle.textContent = (state.lang === 'ar') ? 'تواصل معنا' : 'יצירת קשר';
    contactOverlay.classList.add('open');
    contactOverlay.setAttribute('aria-hidden', 'false');
  } catch (err) {
    window.location.href = 'contact-us.html';
  }
}
if (contactLink) {
  contactLink.addEventListener('click', openContactInline);
  // סגירת תפריט צד בלחיצה על "יצירת קשר"
  contactLink.addEventListener('click', closeSideDrawer);
}
closeContactBtn?.addEventListener('click', () => {
  contactOverlay.classList.remove('open');
  contactOverlay.setAttribute('aria-hidden', 'true');
});
contactOverlay?.addEventListener('click', (e) => {
  if (e.target === contactOverlay) closeContactBtn.click();
});
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => { fetch('contact-us.html', { credentials: 'same-origin' }).catch(() => {}); });
} else {
  setTimeout(() => { fetch('contact-us.html', { credentials: 'same-origin' }).catch(() => {}); }, 1200);
}

// ===== Effects =====
function pressAnim(el) {
  if (!el) return;
  el.classList.remove('btn-pressed');
  void el.offsetWidth;
  el.classList.add('btn-pressed');
  setTimeout(() => el.classList.remove('btn-pressed'), 220);
}
function bumpCart() {
  const c = cartCountEl();
  if (!c) return;
  c.classList.remove('bump');
  void c.offsetWidth;
  c.classList.add('bump');
}
function flyToCartFrom(imgEl) {
  try {
    if (!imgEl) return;
    const src = imgEl.getBoundingClientRect();
    const destEl = cartCountEl() || document.getElementById('openCart');
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

// ====== תפרית צד ======
function openSideDrawer() {
  if (!sideDrawer || !menuBackdrop) return;
  sideDrawer.classList.add('open');
  sideDrawer.setAttribute('aria-hidden', 'false');
  sideDrawer.inert = false;
  menuBackdrop.classList.add('open');
  menuBackdrop.setAttribute('aria-hidden', 'false');
  menuBackdrop.inert = false;
  document.body.style.overflow = 'hidden';
}

function closeSideDrawer() {
  if (!sideDrawer || !menuBackdrop) return;
  sideDrawer.classList.remove('open');
  sideDrawer.setAttribute('aria-hidden', 'true');
  sideDrawer.inert = true;
  menuBackdrop.classList.remove('open');
  menuBackdrop.setAttribute('aria-hidden', 'true');
  menuBackdrop.inert = true;
  if (openMenuBtn) openMenuBtn.focus();
  document.body.style.overflow = '';
}

openMenuBtn?.addEventListener('click', openSideDrawer);
closeMenuBtn?.addEventListener('click', closeSideDrawer);
menuBackdrop?.addEventListener('click', closeSideDrawer);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && sideDrawer && sideDrawer.classList.contains('open')) {
    closeSideDrawer();
  }
});

// ====== INIT ======
(async function init() {
  const savedLang = localStorage.getItem('lang');
  state.lang = (savedLang === 'ar' || savedLang === 'he') ? savedLang : 'ar';
  ensureLangToggle();
  applyLang();

  const yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();

  const raw = await loadProducts();
  state.products = normalizeProducts(raw);
  state.filtered = state.products;
  render(state.filtered);
  updateCartUI();
  buildHeroSlider(state.products);
})();