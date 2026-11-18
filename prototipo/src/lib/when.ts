// Dates for the private pages (panel and portal), always in Costa Rica time.
import type { Lang } from './i18n';

const locale = (lang: Lang) => (lang === 'es' ? 'es-CR' : 'en-US');

/** "17 nov 2026, 10:05" */
export function fmtDate(ts: number, lang: Lang) {
  return new Intl.DateTimeFormat(locale(lang), { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Costa_Rica' }).format(ts);
}

/** "5 min ago", "yesterday", or the date once it is a month old. */
export function ago(ts: number, lang: Lang) {
  const rtf = new Intl.RelativeTimeFormat(lang === 'es' ? 'es' : 'en', { numeric: 'auto' });
  // Never in the future: the server clock can be a little ahead of the visitor's.
  const min = Math.min(0, Math.round((ts - Date.now()) / 60000));
  if (Math.abs(min) < 60) return rtf.format(min, 'minute');
  const h = Math.round(min / 60);
  if (Math.abs(h) < 24) return rtf.format(h, 'hour');
  const d = Math.round(h / 24);
  if (Math.abs(d) < 30) return rtf.format(d, 'day');
  return fmtDate(ts, lang);
}

/** A calendar day (YYYY-MM-DD): "5 dic 2026". */
export function fmtDay(iso: string, lang: Lang, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }) {
  return new Intl.DateTimeFormat(locale(lang), { ...opts, timeZone: 'UTC' }).format(new Date(iso + 'T12:00:00Z'));
}

/** A month (YYYY-MM): "oct 2026" or "Oct". */
export function fmtMonth(month: string, lang: Lang, withYear = true) {
  return new Intl.DateTimeFormat(locale(lang), { month: 'short', ...(withYear ? { year: 'numeric' } : null), timeZone: 'UTC' }).format(new Date(month + '-15T12:00:00Z'));
}

/** Today in Costa Rica as YYYY-MM-DD. */
export const todayCR = () => new Date(Date.now() - 6 * 3600_000).toISOString().slice(0, 10);
