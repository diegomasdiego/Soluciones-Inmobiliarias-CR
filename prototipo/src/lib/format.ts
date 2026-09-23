export type Currency = 'USD' | 'CRC';

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const num = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

export function money(amountUsd: number, currency: Currency, rate: number): string {
  if (currency === 'USD') return usd.format(amountUsd);
  return '₡' + num.format(Math.round(amountUsd * rate));
}

export function moneyShort(amountUsd: number, currency: Currency, rate: number): string {
  const v = currency === 'USD' ? amountUsd : amountUsd * rate;
  const sym = currency === 'USD' ? '$' : '₡';
  if (v >= 1_000_000) return `${sym}${(v / 1_000_000).toFixed(v >= 10_000_000 ? 0 : 1).replace(/\.0$/, '')}M`;
  if (v >= 1_000) return `${sym}${Math.round(v / 1000)}k`;
  return `${sym}${Math.round(v)}`;
}

export const m2 = (v: number) => `${num.format(v)} m²`;
export const pct = (v: number, digits = 1) => `${(v * 100).toFixed(digits)}%`;
export const int = (v: number) => num.format(Math.round(v));

export function formatDate(iso: string, lang: 'en' | 'es' = 'en'): string {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString(lang === 'es' ? 'es-CR' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
