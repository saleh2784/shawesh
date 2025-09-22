/* =========================
   الشاوِيش للعطور — main.js
   Hebrew/Arabic i18n + Cart + Modal + WA
   ========================= */

// ====== CONFIG ======
const PHONE = '972505320456'; // WhatsApp (ללא אפסים/סימנים)
const DATA_URL = 'products.json'; // הנתונים המקומיים

// אייקון וואטסאפ חדש (SVG), ניתן לשלוט בגודל
const WA_ICON = (size=18) => `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
       width="${size}" height="${size}" fill="currentColor" aria-hidden="true">
    <path d="M20.52 3.5a11 11 0 0 0-17.05 12.5L2 21.5l5.6-1.46A11 11 0 0 0 21 11a10.9 10.9 0 0 0-.48-7.5zM12 19.9a8 8 0 0 1-4.12-1.13l-.3-.18-3.33.86.89-3.24-.19-.33A8 8 0 1 1 12 19.9zm4.49-6.06c-.24-.12-1.43-.7-1.65-.78s-.38-.12-.54.12-.62.78-.76.95-.28.18-.5.06a6.6 6.6 0 0 1-3.5-3 .41.41 0 0 1 .05-.5c.1-.12.24-.31.36-.45s.16-.24.24-.4a.86.86 0 0 0 .05-.44c0-.12-.54-1.3-.74-1.78s-.39-.42-.54-.43h-.46a.9.9 0 0 0-.65.3A2.75 2.75 0 0 0 7 8.27a4.8 4.8 0 0 0 1 2.53A10.9 10.9 0 0 0 12.2 14a9.1 9.1 0 0 0 1.56.44 1.33 1.33 0 0 0 .92-.3 3.63 3.63 0 0 0 .77-1.02.77.77 0 0 0-.04-.7c-.08-.14-.22-.2-.44-.33z"/>
  </svg>`;


// ====== STATE ======
const state = {
  products: [],
  filtered: [],
  category: 'all',
  q: '',
  modalProd: null,
  lang: 'he',  // 'he' | 'ar'
};

// ====== I18N (Hebrew + Arabic) ======
const I18N = {
  he: {
    menu: { catalog: 'מוצרים', contact: 'יצירת קשר', about: 'עלינו', cart: 'העגלה' },
    hero: { 
      title: 'ניחוחות שמספרים סיפור',
      subtitle: 'לחיצה על מוצר תפתח כרטיס פרטים מלא עם תמונה, מחיר, הוסף לעגלה, והזמנה בוואטסאפ.'
    },
    
    controls: { searchPH: 'חיפוש לפי שם / תיאור...' },

    categories: {
      all: 'הכל',
      men: 'בשמים לגברים',
      women: 'בשמים לנשים',
      air: 'מטהרי אוויר',
      cream: 'קרם',
      maklotim: 'מקלוטים',
      elctro: 'מכשירים',
    },
    about: {
      title: 'עלינו',
      body: 'אנחנו מאמינים שכל ריח מספר סיפור. איכות, אלגנטיות, ומצוינות — בכל בקבוק.'
    },
    empty: 'לא נמצאו מוצרים.',
    btn: {
      add: 'הוסף לעגלה',
      whats: 'הזמן עכשיו',
      order: 'הזמן עכשיו',
      close: 'סגור',
      remove: 'הסר',
    },
   
    waMsgProduct: (name, price) => `שלום! אני מעוניין במוצר ${name} במחיר ${price}`,
    waMsgCart: (items, totalFmt) =>
      `שלום! אני רוצה להזמין: ${items.map(i => `${i.qty}× ${i.name}`).join(', ')} | סה"כ ${totalFmt}`,
    },
  ar: {
    menu: { catalog: 'المنتجات', contact: 'تواصل معنا', about: 'عنّا', cart: 'السلة' },
    hero: {
      title: 'عطور تحكي قصة' ,
      subtitle: 'بالنقر على المنتج ستُفتح بطاقة تفاصيل كاملة تحتوي على صورة وسعر وزر «أضف إلى السلة» وخيار الطلب عبر واتساب.'
    },
    controls: { searchPH: 'ابحث بالاسم / الوصف...' },
    categories: {
      all: 'الكل',
      men: 'عطور للرجال',
      women: 'عطور للنساء',
      air: 'معطرات الجو',
      cream: 'كريم',
      maklotim: 'مكلوتيم',
      elctro: 'اجهزة',
    },
    empty: 'لا توجد منتجات.',
    btn: {
      add: 'أضف إلى السلة',
      whats: 'اطلب الان',
      order: 'اطلب الان',
      close: 'إغلاق',
      remove: 'حذف',
    },
    about: {
      title: 'عنّا',
      body: 'نحن نؤمن بأن كل رائحة تحكي قصة. جودة، أناقة، وتميّز — في كل زجاجة.'
    },
    waMsgProduct: (name, price) => `مرحبًا! أرغب في المنتج ${name} بسعر ${price}`,
    waMsgCart: (items, totalFmt) =>
      `مرحبًا! أود الطلب: ${items.map(i => `${i.qty}× ${i.name}`).join('، ')} | المجموع ${totalFmt}`,
  }
};
function t(path) {
  const seg = path.split('.');
  let v = I18N[state.lang];
  for (const s of seg) v = v?.[s];
  return (typeof v === 'string') ? v : v ?? '';
}
function catLabel(code){ return I18N[state.lang].categories[code] || code || ''; }

// ====== PRICE HELPERS ======
function parsePrice(val){
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const num = String(val).replace(/[^0-9.,]/g,'').replace(/,(?=\d{3}(\D|$))/g,'');
  const normalized = num.replace(',', '.');
  const f = parseFloat(normalized);
  return isNaN(f) ? 0 : f;
}
function formatPrice(val){
  const n = parsePrice(val);
  return `₪${Math.round(n).toLocaleString('he-IL')}`;
}

// ====== DATA NORMALIZATION (supports name_he/ar, description_he/ar) ======
function normalizeProducts(arr){
  if (!Array.isArray(arr)) return [];
  return arr.map(p => ({
    id: p.id ?? (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2)),
    // keep originals + multilingual fields
    name: p.name ?? '',
    name_he: p.name_he ?? '',
    name_ar: p.name_ar ?? '',
    description: p.description ?? '',
    description_he: p.description_he ?? '',
    description_ar: p.description_ar ?? '',
    price: parsePrice(p.price ?? p.cost ?? 0),
    category: (p.category || p.type || 'other').toLowerCase(),
    image: p.image || p.img || '',
    related: Array.isArray(p.related) ? p.related : [],
  }));
}
function pName(p){
  return (state.lang === 'ar' ? (p.name_ar || p.name_he || p.name) : (p.name_he || p.name_ar || p.name)) || '';
}
function pDesc(p){
  return (state.lang === 'ar' ? (p.description_ar || p.description_he || p.description) :
                                (p.description_he || p.description_ar || p.description)) || '';
}

// ====== LOAD PRODUCTS ======
async function loadProducts(){
  try{
    const res = await fetch(DATA_URL, { cache: 'no-store' });
    if(!res.ok) throw new Error('missing file');
    const data = await res.json();
    return Array.isArray(data) ? data : (data.products || []);
  }catch(e){
    // fallback from inline <script id="products-fallback">
    try{
      const raw = document.getElementById('products-fallback')?.textContent?.trim() || '';
      const data = JSON.parse(raw);
      return data.products || [];
    }catch{
      return [];
    }
  }
}

// ====== FILTERS ======
function byCategory(p, cat){ return cat === 'all' ? true : p.category === cat; }
function byQuery(p, q){
  if(!q) return true;
  const text = (pName(p) + ' ' + pDesc(p)).toLowerCase();
  return text.includes(q.toLowerCase());
}

// ====== RENDER GRID ======
const grid = document.getElementById('grid');
function render(items){
  grid.innerHTML = '';
  if(!items.length){
    grid.innerHTML = `<div style="grid-column:1/-1;opacity:.8;text-align:center;padding:1.4rem;background:var(--card);border:1px solid var(--border);border-radius:14px;">${t('empty')}</div>`;
    return;
  }

  const cartIcon = `
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="width:18px;height:18px;margin-inline-start:.3rem">
      <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2zM7.16 14.26l-.03.04c-.3.39-.78.7-1.31.7H4v-2h1.12l2.76-6.59C8.1 5.16 8.53 5 8.99 5H19c.55 0 1 .45 1 1s-.45 1-1 1H9.84l-.9 2h8.73c.75 0 1.41.45 1.7 1.11l2.36 5.3c.16.36.25.76.25 1.18 0 1.65-1.35 3-3 3H8c-.55 0-1-.45-1-1s.45-1 1-1h9.98c.55 0 1-.45 1-1 0-.14-.03-.27-.08-.39l-1.84-4.11H8.53l-1.37 3.26z"/>
    </svg>`;
  const waIcon = WA_ICON(18); // אייקון וואטסאפ החדש

  const frag = document.createDocumentFragment();

  items.forEach(p => {
    const name = pName(p);
    const priceFmt = formatPrice(p.price);
    const waLink = `https://wa.me/${PHONE}?text=${encodeURIComponent(i18nMsgProduct(name, priceFmt))}`;

    const el = document.createElement('article');
    el.className = 'card card-compact';
    el.innerHTML = `
      <a href="#" class="thumb" aria-label="${name}">
        <img src="${p.image}" alt="${name}" loading="lazy" decoding="async"
             onerror="this.src='https://dummyimage.com/600x800/222/fff&text=No+Image'">
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
    el.querySelector('.thumb').addEventListener('click', (e)=>{ e.preventDefault(); openModalProd(p); });
    el.addEventListener('click', (e)=>{ if(e.target.closest('[data-add],.btn.whats')) return; openModalProd(p); });
    el.querySelector('[data-add]').addEventListener('click', (e)=>{
      e.stopPropagation();
      addToCart(p);
      pressAnim(e.currentTarget);
      bumpCart();
      const imgEl = el.querySelector('.thumb img');
      flyToCartFrom(imgEl);     // ✈️
    });
    

    frag.appendChild(el);
  });

  grid.appendChild(frag);
}


// ====== MODAL ======
const modal = document.getElementById('modal');
const mImg = document.getElementById('mImg');
const mTitle = document.getElementById('mTitle');
const mCat = document.getElementById('mCat');
const mDesc = document.getElementById('mDesc');
const mPrice = document.getElementById('mPrice');
const mAdd = document.getElementById('mAdd');
const mWhats = document.getElementById('mWhats');
const closeModalBtn = document.getElementById('closeModal');
const waIcon = WA_ICON(18);


function openModalProd(p){
  state.modalProd = p;
  mImg.src = p.image; mImg.alt = pName(p);
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
    flyToCartFrom(mImg);      // ✈️
  };
  
  
  mWhats.classList.add('whats');
  mWhats.href = `https://wa.me/${PHONE}?text=${encodeURIComponent(i18nMsgProduct(pName(p), formatPrice(p.price)))}`;
  mWhats.innerHTML = `${WA_ICON(18)} ${t('btn.order')}`;

  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden', 'false');
}
function closeModal(){
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden', 'true');
  state.modalProd = null;
}
closeModalBtn?.addEventListener('click', closeModal);
modal?.addEventListener('click', (e)=>{ if(e.target === modal) closeModal(); });

// ====== CART ======
const drawer = document.getElementById('drawer');
const openCartBtn = document.getElementById('openCart');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
function cartCountEl(){ return document.getElementById('cartCount'); }
const checkoutBtn = document.getElementById('checkoutBtn');

function getCart(){ try{ return JSON.parse(localStorage.getItem('cart') || '[]'); }catch{return []} }
function setCart(items){ localStorage.setItem('cart', JSON.stringify(items)); updateCartUI(); }
function addToCart(p){
  const items = getCart();
  const found = items.find(x => x.id === p.id);
  if(found){ found.qty += 1; } else { items.push({ id:p.id, name:pName(p), price:p.price, image:p.image, qty:1 }); }
  setCart(items);
}
function removeFromCart(id){ const items = getCart().filter(x => x.id !== id); setCart(items); }
function changeQty(id, delta){
  const items = getCart();
  const it = items.find(x => x.id === id);
  if(!it) return;
  it.qty = Math.max(1, it.qty + delta);
  setCart(items);
}
function sumCart(items){ return items.reduce((s,x)=> s + parsePrice(x.price)*x.qty, 0); }

function updateCartUI(){
  const items = getCart();
  cartItems.innerHTML = '';
  // header title translate
  const hdrTitle = drawer?.querySelector('header strong');
  if(hdrTitle) hdrTitle.textContent = t('menu.cart');
  // close button translate
  const btnClose = drawer?.querySelector('header .icon-btn');
  if(btnClose) btnClose.textContent = t('btn.close');

  if(!items.length){
    cartItems.innerHTML = `<div style="opacity:.8">${t('empty')}</div>`;
  } else {
    items.forEach(x => {
      const row = document.createElement('div');
      row.className = 'item';
      row.innerHTML = `
        <img src="${x.image}" alt="${x.name}" style="width:64px;height:64px;object-fit:cover;border-radius:8px">
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
          <strong style="color:var(--text)">${formatPrice(parsePrice(x.price)*x.qty)}</strong>
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
  const count = items.reduce((c,x)=> c + x.qty, 0);
  if (cartCountEl()) cartCountEl().textContent = count;

  const msg = items.length
    ? i18nMsgCart(items, formatPrice(sumCart(items)))
    : (state.lang === 'ar' ? 'مرحبًا! أود تقديم طلب.' : 'שלום! אני מעוניין לבצע הזמנה.');
  checkoutBtn.href = `https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`;
}
openCartBtn?.addEventListener('click', ()=> { drawer.classList.add('open'); drawer.setAttribute('aria-hidden','false'); });
closeCart?.addEventListener('click', ()=> { drawer.classList.remove('open'); drawer.setAttribute('aria-hidden','true'); });

// ====== CONTROLS (chips + search) ======
const chips = [...document.querySelectorAll('.chip')];
const searchInput = document.getElementById('search');
function applyFilters(){
  state.filtered = state.products.filter(p => byCategory(p, state.category) && byQuery(p, state.q));
  render(state.filtered);
}
chips.forEach(chip => chip.addEventListener('click', ()=>{
  chips.forEach(c=>c.classList.remove('active'));
  chip.classList.add('active');
  state.category = chip.dataset.cat;
  applyFilters();
}));
searchInput?.addEventListener('input', (e)=>{
  state.q = e.target.value;
  applyFilters();
});

// ====== THEME TOGGLE (existing) ======
const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
function applyTheme(theme){
  if(theme === 'light'){
    root.setAttribute('data-theme','light');
    if (themeToggle) themeToggle.textContent = '☀️';
    localStorage.setItem('theme','light');
    if (themeToggle) themeToggle.setAttribute('aria-pressed','true');
  } else {
    root.removeAttribute('data-theme');
    if (themeToggle) themeToggle.textContent = '🌙';
    localStorage.setItem('theme','dark');
    if (themeToggle) themeToggle.setAttribute('aria-pressed','false');
  }
}
(function initTheme(){
  const saved = localStorage.getItem('theme');
  if(saved){ applyTheme(saved); }
  else {
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    applyTheme(prefersLight ? 'light' : 'dark');
  }
})();
themeToggle?.addEventListener('click', ()=>{
  const isLight = root.getAttribute('data-theme') === 'light';
  applyTheme(isLight ? 'dark' : 'light');
});

// 
// ===== Inline Contact Overlay (loads contact-us.html inside the page) =====
const contactLink = document.querySelector('.menu a[href="contact-us.html"]') || document.querySelector('.menu a[href="#contact"]');
const contactOverlay = document.getElementById('contactOverlay');
const contactContent = document.getElementById('contactContent');
const closeContactBtn = document.getElementById('closeContact');

async function openContactInline(e){
  if(e) e.preventDefault();
  try{
    if(!contactContent.dataset.loaded){
      const res = await fetch('contact-us.html', { credentials:'same-origin' });
      if(!res.ok) throw new Error('failed to fetch contact');
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const section = doc.querySelector('#contact') || doc.body; // מעדיף רק את הסקשן אם קיים
      contactContent.innerHTML = section.innerHTML;
      contactContent.dataset.loaded = '1';
    }
    // כותרת לפי שפה
    const contactTitle = document.getElementById('contactTitle');
    if(contactTitle) contactTitle.textContent = (state.lang === 'ar') ? ' تواصل معنا' : 'יצירת קשר';

    contactOverlay.classList.add('open');
    contactOverlay.setAttribute('aria-hidden','false');
  }catch(err){
    // אם יש בעיה ב-fetch ננווט לעמוד הרגיל (פרוגרסיבי)
    window.location.href = 'contact-us.html';
  }
}

if(contactLink){
  contactLink.addEventListener('click', openContactInline);
}
closeContactBtn?.addEventListener('click', ()=>{
  contactOverlay.classList.remove('open');
  contactOverlay.setAttribute('aria-hidden','true');
});
contactOverlay?.addEventListener('click', (e)=>{
  if(e.target === contactOverlay) closeContactBtn.click();
});
document.addEventListener('keydown', (e)=>{
  if(e.key === 'Escape' && contactOverlay?.classList.contains('open')) closeContactBtn.click();
});

// Prefetch בזמן סרק – כדי שזה ייפתח “כמעט מייד”
if('requestIdleCallback' in window){
  requestIdleCallback(()=>{ fetch('contact-us.html', { credentials:'same-origin' }).catch(()=>{}); });
}else{
  setTimeout(()=>{ fetch('contact-us.html', { credentials:'same-origin' }).catch(()=>{}); }, 1200);
}

// 
// ====== LANGUAGE TOGGLE ======
function i18nMsgProduct(name, priceFmt){
  return I18N[state.lang].waMsgProduct(name, priceFmt);
}
function i18nMsgCart(items, totalFmt){
  return I18N[state.lang].waMsgCart(items, totalFmt);
}
function ensureLangToggle(){
  let btn = document.getElementById('langToggle');
  const menu = document.querySelector('.menu');
  if(!btn && menu){
    btn = document.createElement('button');
    btn.id = 'langToggle';
    btn.className = 'icon-btn';
    menu.appendChild(btn);
  }
  if(btn){
    btn.onclick = ()=>{
      setLang(state.lang === 'he' ? 'ar' : 'he');
    };
  }
  updateLangToggleLabel();
}
function updateLangToggleLabel(){
  const btn = document.getElementById('langToggle');
  if(!btn) return;
  // מציג את השפה הבאה שניתן לעבור אליה
  btn.textContent = (state.lang === 'he') ? 'AR' : 'HE';
  btn.title = (state.lang === 'he') ? 'עבר לערבית' : 'التبديل إلى العبرية';
}
function setLang(lang){
  state.lang = (lang === 'ar') ? 'ar' : 'he';
  localStorage.setItem('lang', state.lang);
  applyLang();
  applyFilters();        // רנדר מוצרים בשפה הנכונה
  updateCartUI();        // עדכון טקסטים בעגלה
}
function applyLang(){
  // html lang/dir (שתיהן RTL, אבל נשים ערך נכון)
  document.documentElement.lang = (state.lang === 'ar') ? 'ar' : 'he';
  document.documentElement.dir = 'rtl';

  
  // hero title
  const heroTitle = document.querySelector('.hero h1');
  if(heroTitle) heroTitle.textContent = t('hero.title');

  // search placeholder
  if(searchInput) searchInput.placeholder = t('controls.searchPH');

  // chips labels
  chips.forEach(chip=>{
    const k = chip.dataset.cat || 'all';
    chip.textContent = catLabel(k);
  });

  // menu links
  const linkCatalog = document.querySelector('.menu a[href="#catalog"]');
  if(linkCatalog) linkCatalog.textContent = t('menu.catalog');
  const linkContact = document.querySelector('.menu a[href*="contact"]');
  if(linkContact) linkContact.textContent = t('menu.contact');
  const linkAbout = document.querySelector('.menu a[href="#about"]');
  if(linkAbout) linkAbout.textContent = t('menu.about');
  const aboutTitleEl = document.querySelector('#about h2');
  const aboutBodyEl  = document.querySelector('#about p');
  if (aboutTitleEl) aboutTitleEl.textContent = t('about.title');
  if (aboutBodyEl)  aboutBodyEl.textContent  = t('about.body');
  const heroSub = document.querySelector('.hero p');
  if (heroSub) heroSub.textContent = t('hero.subtitle');

  // cart button (שומר את ה-span של המונה)
  if(openCartBtn){
    const count = cartCountEl();
    openCartBtn.textContent = `🛒 ${t('menu.cart')} `;
    if(count) openCartBtn.appendChild(count);
  }

  // drawer header + close מתעדכנים ב-updateCartUI()

  // modal buttons text (אם פתוח)
  if(mAdd){ mAdd.textContent = t('btn.add'); }
  if (mWhats) mWhats.innerHTML = `${WA_ICON(18)} ${t('btn.order')}`;

  // contact section (אם קיים)
  const contactH2 = document.querySelector('#contact h2');
  if(contactH2) contactH2.textContent = (state.lang === 'ar') ? 'صفحة تواصل' : 'דף יצירת קשר';
  const contactOpenMap = document.getElementById('openMap');
  if(contactOpenMap) contactOpenMap.textContent = (state.lang === 'ar') ? 'افتح الموقع على الخريطة' : 'פתח המיקום על המפה';

  updateLangToggleLabel();
}


//help

function pressAnim(el){
  if(!el) return;
  el.classList.remove('btn-pressed');
  // reflow כדי להפעיל שוב אם לוחצים מהר כמה פעמים
  void el.offsetWidth;
  el.classList.add('btn-pressed');
  setTimeout(()=>el.classList.remove('btn-pressed'), 220);
}
function bumpCart(){
  const c = cartCountEl && cartCountEl();
  if(!c) return;
  c.classList.remove('bump');
  void c.offsetWidth;
  c.classList.add('bump');
}

// 
function pressAnim(el){
  if(!el) return;
  el.classList.remove('btn-pressed'); void el.offsetWidth;
  el.classList.add('btn-pressed');
  setTimeout(()=>el.classList.remove('btn-pressed'), 220);
}
function bumpCart(){
  const c = cartCountEl && cartCountEl();
  if(!c) return; c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump');
}
// טיסת תמונה מנקודת מקור (img) אל העגלה
function flyToCartFrom(imgEl){
  try{
    if(!imgEl) return;
    const src = imgEl.getBoundingClientRect();
    const destEl = cartCountEl() || document.getElementById('openCart');
    if(!destEl) return;
    const dest = destEl.getBoundingClientRect();

    const ghost = imgEl.cloneNode(true);
    ghost.className = 'fly-ghost';
    Object.assign(ghost.style, {
      top: `${src.top}px`,
      left: `${src.left}px`,
      width: `${src.width}px`,
      height: `${src.height}px`,
      transform: 'translate3d(0,0,0) scale(1)',
      opacity: '1'
    });
    document.body.appendChild(ghost);

    const dx = dest.left + dest.width/2 - (src.left + src.width/2);
    const dy = dest.top  + dest.height/2 - (src.top  + src.height/2);

    const anim = ghost.animate([
      { transform: 'translate3d(0,0,0) scale(1)', opacity: 1 },
      { transform: `translate3d(${dx}px, ${dy}px, 0) scale(.2)`, opacity: .25 }
    ], { duration: 700, easing: 'cubic-bezier(.2,.7,.2,1)' });

    anim.onfinish = () => ghost.remove();
  }catch(e){ /* no-op */ }
}

// ====== INIT ======
(async function init(){
  // init language
  const savedLang = localStorage.getItem('lang');
  state.lang = (savedLang === 'ar' || savedLang === 'he') ? savedLang : 'he';
  ensureLangToggle();
  applyLang();

  // year
  const yr = document.getElementById('year');
  if(yr) yr.textContent = new Date().getFullYear();

  // products
  const raw = await loadProducts();
  state.products = normalizeProducts(raw);
  state.filtered = state.products;
  render(state.filtered);
  updateCartUI();
})();
