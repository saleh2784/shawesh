import { DATA_FILES } from './config.js';
import { normalizeProducts } from './utils.js';

export async function loadProducts() {
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
    const merged = batches.flat();
    const seen = new Set(), uniq = [];
    for (const p of merged) {
      if (!seen.has(p.id)) { seen.add(p.id); uniq.push(p); }
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
