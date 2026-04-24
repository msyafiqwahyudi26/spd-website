const STORAGE_KEY = 'spd_views';

function safeRead() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch (_) {
    return {};
  }
}

export function incrementView(type, slug) {
  if (!slug) return;
  try {
    const views = safeRead();
    const key = `${type}_${slug}`;
    views[key] = (views[key] ?? 0) + 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(views));
  } catch (_) {}
}

export function getViewCount(type, slug) {
  if (!slug) return 0;
  return safeRead()[`${type}_${slug}`] ?? 0;
}

export function getTotalViews() {
  return Object.values(safeRead()).reduce((sum, v) => sum + (Number(v) || 0), 0);
}
