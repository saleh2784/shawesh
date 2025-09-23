import { canonicalCategory } from './categories.js';
import { state } from './state.js';
import { render } from './ui.js';

export function byCategory(p, cat) { return cat === 'all' ? true : canonicalCategory(p.category) === canonicalCategory(cat); }
export function byQuery(p, q) {
  if (!q) return true;
  const text = (p.name + ' ' + (p.description || '') + ' ' + (p.name_he || '') + ' ' + (p.name_ar || '') + ' ' + (p.description_he || '') + ' ' + (p.description_ar || '')).toLowerCase();
  return text.includes(q.toLowerCase());
}

export function syncActiveChips(cat) {
  document.querySelectorAll('.drawer-chips .chip').forEach(c => c.classList.toggle('active', c.dataset.cat === cat));
  document.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c.dataset.cat === cat));
}

export function applyFilters() {
  syncActiveChips(state.category);
  state.filtered = state.products.filter(p => byCategory(p, state.category) && byQuery(p, state.q));
  render(state.filtered);
}
