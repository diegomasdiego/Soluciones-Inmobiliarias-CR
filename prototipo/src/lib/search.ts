// Filters for the Search page and a rule-based natural-language parser that stands in
// for the AI search in this prototype (production would call a language model).
import { properties, grossYield, isResidencyEligible, type Area, type Property, type PropertyType } from '../data/properties';

export type Filters = {
  types: PropertyType[];
  areas: Area[];
  minBeds?: number;
  maxPrice?: number;
  minPrice?: number;
  pool?: boolean;
  view?: boolean;
  residency?: boolean;
  investment?: boolean;
  nearSchools?: boolean;
  nearAirport?: boolean;
  text?: string;
};

export type Sort = 'featured' | 'price-asc' | 'price-desc' | 'yield';

export const emptyFilters: Filters = { types: [], areas: [] };

const words: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5 };

const areaWords: [RegExp, Area][] = [
  [/escaz[uú]|guachipel[ií]n|san rafael de escaz/i, 'Escazú'],
  [/santa ana|pozos|lindora|r[ií]o oro/i, 'Santa Ana'],
  [/ciudad col[oó]n|\bmora\b/i, 'Mora'],
  [/bel[eé]n|cariari/i, 'Belén'],
  [/heredia|san pablo|san rafael de heredia/i, 'Heredia'],
  [/alajuela|san isidro|po[aá]s/i, 'Alajuela'],
];

const typeWords: [RegExp, PropertyType][] = [
  [/\b(house|home|casa|villa)s?\b/i, 'House'],
  [/\b(condo|condominium|apartment|apartamento|apto|flat|unit)s?\b/i, 'Condo'],
  [/\b(lot|land|lote|terreno|plot)s?\b/i, 'Lot'],
  [/\b(farm|finca|ranch|hacienda|acre|hect[aá]rea)s?\b/i, 'Farm'],
  [/\b(office|commercial|local|oficina|retail)s?\b/i, 'Commercial'],
  [/pre-?sale|preventa|new development|off-plan/i, 'Pre-sale'],
];

function parseAmount(raw: string, unit?: string): number {
  let n = parseFloat(raw.replace(/,/g, ''));
  const u = (unit || '').toLowerCase();
  if (u === 'k' || u === 'mil') n *= 1000;
  else if (u.startsWith('m')) n *= 1_000_000;
  else if (n < 5000) n *= 1000; // "under 450" -> 450k
  return n;
}

const money = (n: number) => '$' + n.toLocaleString('en-US');

export function parseQuery(q: string): { filters: Filters; understood: string[] } {
  const f: Filters = { types: [], areas: [] };
  const understood: string[] = [];
  const s = q.trim();
  if (!s) return { filters: f, understood };

  const bed = s.match(/(\d+|one|two|three|four|five|uno|una|dos|tres|cuatro|cinco)\s*\+?\s*-?\s*(bed(room)?s?|br|bd|habitaci[oó]n(es)?|cuartos?|dormitorios?)/i);
  if (bed) {
    const n = words[bed[1].toLowerCase()] ?? parseInt(bed[1], 10);
    f.minBeds = n;
    understood.push(`${n}+ bedrooms`);
  }

  const max = s.match(/(under|below|max(imum)?|less than|up to|no more than|hasta|menos de|m[aá]ximo|bajo)\s*(us)?\$?\s*([\d.,]+)\s*(millones|million|mil|k|m)?\b/i);
  if (max) {
    f.maxPrice = parseAmount(max[4], max[5]);
    understood.push(`Under ${money(f.maxPrice)}`);
  }
  const min = s.match(/(over|above|at least|more than|from|m[aá]s de|desde)\s*(us)?\$?\s*([\d.,]+)\s*(millones|million|mil|k|m)?\b/i);
  if (min) {
    f.minPrice = parseAmount(min[3], min[4]);
    understood.push(`Over ${money(f.minPrice)}`);
  }

  for (const [re, area] of areaWords) if (re.test(s) && !f.areas.includes(area)) { f.areas.push(area); understood.push(area); }
  for (const [re, type] of typeWords) if (re.test(s) && !f.types.includes(type)) { f.types.push(type); understood.push(type === 'Pre-sale' ? 'Pre-sale' : type + 's'); }

  if (/pool|piscina/i.test(s)) { f.pool = true; understood.push('With pool'); }
  if (/view|vista|mirador/i.test(s)) { f.view = true; understood.push('With a view'); }
  if (/school|escuela|colegio|kids|niños/i.test(s)) { f.nearSchools = true; understood.push('Near schools'); }
  if (/airport|aeropuerto|\bsjo\b|travel|viaj/i.test(s)) { f.nearAirport = true; understood.push('Close to SJO airport'); }
  if (/\b(rent(al|ing)?|invest(ment|ing)?|income|yield|airbnb|alquil\w*|inversi[oó]n|renta)\b/i.test(s)) { f.investment = true; understood.push('Good rental yield'); }
  if (/residen|visa|9996|immigra|migra/i.test(s)) { f.residency = true; understood.push('Residency-eligible'); }

  if (!understood.length) { f.text = s; understood.push(`“${s}”`); }
  return { filters: f, understood };
}

export function applyFilters(list: Property[], f: Filters, sort: Sort): Property[] {
  const text = f.text?.toLowerCase();
  const out = list.filter(p => {
    if (f.types.length && !f.types.includes(p.type)) return false;
    if (f.areas.length && !f.areas.includes(p.area)) return false;
    if (f.minBeds && (p.beds ?? 0) < f.minBeds) return false;
    if (f.maxPrice && p.priceUsd > f.maxPrice) return false;
    if (f.minPrice && p.priceUsd < f.minPrice) return false;
    if (f.pool && !p.pool) return false;
    if (f.view && !p.view) return false;
    if (f.residency && !isResidencyEligible(p)) return false;
    if (f.investment && (grossYield(p) ?? 0) < 0.065) return false;
    if (f.nearSchools && !p.nearby.some(n => n.kind === 'school' && n.minutes <= 12)) return false;
    if (f.nearAirport && !p.nearby.some(n => n.kind === 'airport' && n.minutes <= 20)) return false;
    if (text && !`${p.title} ${p.headline} ${p.description} ${p.features.join(' ')} ${p.district} ${p.canton}`.toLowerCase().includes(text)) return false;
    return true;
  });
  const order = properties.map(p => p.slug);
  return out.sort((a, b) => {
    if (sort === 'price-asc') return a.priceUsd - b.priceUsd;
    if (sort === 'price-desc') return b.priceUsd - a.priceUsd;
    if (sort === 'yield') return (grossYield(b) ?? 0) - (grossYield(a) ?? 0);
    return order.indexOf(a.slug) - order.indexOf(b.slug);
  });
}

export function explainMatch(p: Property, f: Filters): string {
  const bits: string[] = [];
  if (f.nearSchools) { const s = p.nearby.find(n => n.kind === 'school'); if (s) bits.push(`${s.minutes} min to ${s.name}`); }
  if (f.nearAirport) { const a = p.nearby.find(n => n.kind === 'airport'); if (a) bits.push(`${a.minutes} min to SJO`); }
  if (f.investment) { const y = grossYield(p); if (y) bits.push(`${(y * 100).toFixed(1)}% est. gross yield`); }
  if (f.residency) bits.push('qualifies for investor residency');
  if (f.pool && p.pool) bits.push('private or shared pool');
  if (f.view && p.view) bits.push('open views');
  return bits.join(' · ');
}

export const activeFilterCount = (f: Filters) =>
  f.types.length + f.areas.length + [f.minBeds, f.maxPrice, f.minPrice, f.pool, f.view, f.residency, f.investment, f.nearSchools, f.nearAirport, f.text].filter(Boolean).length;
