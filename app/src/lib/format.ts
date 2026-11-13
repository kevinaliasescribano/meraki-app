const euro = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
const number = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 });

export const fmtPrice = (v?: number | null) => (v == null ? '—' : euro.format(v));
export const fmtNumber = (v?: number | null) => (v == null ? '—' : number.format(v));

export function fmtDate(v?: string | null) {
  if (!v) return '—';
  const [y, m, d] = v.split('-');
  return `${d}/${m}/${y}`;
}

export const today = () => new Date().toISOString().slice(0, 10);

export function parseNumber(v: string): number | null {
  const s = v.trim().replace(',', '.');
  if (!s) return null;
  const n = Number(s);
  return Number.isNaN(n) ? NaN : n;
}
