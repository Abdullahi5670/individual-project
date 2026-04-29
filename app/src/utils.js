export function normalizeTags(input) {
  if (!input) return [];
  const arr = String(input).split(",").map(t => t.trim()).filter(Boolean).map(t => t.slice(0, 24));
  const seen = new Set();
  const unique = [];
  for (const t of arr) {
    const key = t.toLowerCase();
    if (!seen.has(key)) { seen.add(key); unique.push(t); }
  }
  return unique;
}

export function toJson(v) { return JSON.stringify(v ?? []); }
export function fromJson(s, fallback) { try { return JSON.parse(s); } catch { return fallback; } }

export function isEmail(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || "")); }

export function clampInt(v, min, max, def) {
  const n = parseInt(v, 10);
  if (Number.isNaN(n)) return def;
  return Math.min(max, Math.max(min, n));
}
