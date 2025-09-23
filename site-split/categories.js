// ====== CATEGORY HELPERS ======
export function inferCategoryFromFilename(fname = '') {
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

export const CATEGORY_ALIASES = {
  men: ['men', 'male', 'גברים', 'זכר', 'رجال', 'للرجال'],
  women: ['women', 'woman', 'ladies', 'lady', 'נשים', 'נקבה', 'نساء', 'للنساء'],
  air: ['air', 'airfreshener', 'air-freshener', 'freshener', 'מטהרי אוויר', 'מטהר', 'ריחן', 'معطر', 'معطرات', 'معطرات الجو'],
  cream: ['cream', 'קרם', 'مرهم', 'كريم'],
  maklotim: ['maklotim', 'מקלוטים', 'מקלוט', 'بخور', 'بخّور', 'عود'],
  elctro: ['elctro', 'electro', 'electronics', 'electronic', 'device', 'devices', 'מכשיר', 'מכשירים', 'חשמל', 'אלקטרוניקה', 'اجهزة', 'أجهزة', 'الكترونيات', 'إلكترونيات'],
  mabakher: ['mabakher', 'incense', 'بخور', 'مباخر', 'عود'],
  other: ['other', 'misc', 'כללי', 'אחר', 'אחרים', 'متنوع']
};

export function canonicalCategory(input = '') {
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
