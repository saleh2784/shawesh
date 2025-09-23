import { state } from './state.js';
import { WA_ICON } from './config.js';

export const I18N = {
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

export function t(path) {
  const seg = path.split('.');
  let v = I18N[state.lang];
  for (const s of seg) v = v?.[s];
  return (typeof v === 'string') ? v : v ?? '';
}

export function catLabel(code) { return I18N[state.lang].categories[code] || code || ''; }

export function ensureLangToggle() {
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

export function updateLangToggleLabel() {
  const btn = document.getElementById('langToggle');
  if (!btn) return;
  btn.textContent = (state.lang === 'he') ? 'AR' : 'HE';
  btn.title = (state.lang === 'he') ? 'עבר לערבית' : 'التبديل إلى العبرية';
}

export function setLang(lang) {
  state.lang = (lang === 'ar') ? 'ar' : 'he';
  localStorage.setItem('lang', state.lang);
  applyLang();
}

export function applyLang() {
  document.documentElement.lang = (state.lang === 'ar') ? 'ar' : 'he';
  document.documentElement.dir = 'rtl';

  const heroTitle = document.querySelector('.hero h1');
  if (heroTitle) heroTitle.textContent = t('hero.title');
  const searchInput = document.getElementById('search');
  if (searchInput) searchInput.placeholder = t('controls.searchPH');

  document.querySelectorAll('.chip').forEach(chip => {
    const k = chip.dataset.cat || 'all';
    chip.textContent = catLabel(k);
  });
  document.querySelectorAll('.drawer-chips .chip').forEach(chip => {
    const k = chip.dataset.cat || 'all';
    chip.textContent = catLabel(k);
  });

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

  const openCartBtn = document.getElementById('openCart');
  if (openCartBtn) {
    const count = document.getElementById('cartCount');
    openCartBtn.textContent = `🛒 ${t('menu.cart')} `;
    if (count) openCartBtn.appendChild(count);
  }

  const mAdd = document.getElementById('mAdd');
  const mWhats = document.getElementById('mWhats');
  if (mAdd) mAdd.textContent = t('btn.add');
  if (mWhats) mWhats.innerHTML = `${WA_ICON(18)} ${t('btn.order')}`;

  const contactTitle = document.getElementById('contactTitle');
  if (contactTitle) contactTitle.textContent = (state.lang === 'ar') ? 'تواصل معنا' : 'יצירת קשר';

  updateLangToggleLabel();
}
