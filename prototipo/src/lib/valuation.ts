// Seller's quick valuation (#sell). A planning figure built from the zone price ranges in
// data/company.ts, not an appraisal: an advisor confirms the value with a visit and recent sales.
//
// How it works: every zone has a USD-per-m² range (built area for houses and condos, land for lots).
// The estimate places the property inside that range: a starting point by property type, moved up
// or down by condition, size, view and pool. Price = that $/m² × m², with a ±7% band (±10% for lots).
import type { Zone } from '../data/company';
import type { Property } from '../data/properties';

export type SellKind = 'house' | 'condo' | 'lot';
export type Condition = 'new' | 'good' | 'dated';
export type LotState = 'ready' | 'services' | 'raw';

export type ValuationInput = {
  kind: SellKind;
  m2: number;
  condition: Condition;
  lotState: LotState;
  view: boolean;
  pool: boolean;
};

export type FactorId = 'condition' | 'state' | 'size' | 'view' | 'pool';
/** One adjustment, as a share of the starting $/m² (0.08 = +8%). */
export type Factor = { id: FactorId; effect: number };

export type Valuation = {
  /** Zone range used, USD per m². */
  range: [number, number];
  /** Starting $/m² for this type in this zone, before adjustments. */
  base: number;
  perM2: number;
  perM2Band: [number, number];
  low: number;
  mid: number;
  high: number;
  factors: Factor[];
};

// Where each type usually sits inside the zone range (0 = bottom, 1 = top).
// Houses carry their land, so they price lower per built m² than condos.
const START: Record<SellKind, number> = { house: 0.3, condo: 0.55, lot: 0.4 };
const CONDITION: Record<Condition, number> = { new: 0.18, good: 0, dated: -0.22 };
const LOT_STATE: Record<LotState, number> = { ready: 0.15, services: 0, raw: -0.18 };
const VIEW = 0.1;
const POOL = 0.04;
const TYPICAL_M2: Record<SellKind, number> = { house: 220, condo: 100, lot: 800 };
const SPREAD: Record<SellKind, number> = { house: 0.07, condo: 0.07, lot: 0.1 };

/** Slider limits and steps. Lots above 1 ha are valued with a visit. */
export const SIZE: Record<SellKind, { min: number; max: number; step: number; start: number }> = {
  house: { min: 60, max: 800, step: 5, start: 220 },
  condo: { min: 35, max: 400, step: 5, start: 100 },
  lot: { min: 150, max: 10000, step: 50, start: 800 },
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

// Larger properties sell for less per m², smaller ones for more.
function sizeShift(kind: SellKind, m2: number) {
  if (kind === 'lot') return clamp(-Math.log10(m2 / TYPICAL_M2.lot) * 0.25, -0.3, 0.15);
  const t = TYPICAL_M2[kind];
  return clamp(((t - m2) / t) * 0.3, -0.25, 0.15);
}

/** Rounds to $1,000 under $200k and to $5,000 above. */
export function roundPrice(v: number) {
  const step = v < 200000 ? 1000 : 5000;
  return Math.round(v / step) * step;
}

export function zoneRange(z: Zone, kind: SellKind): [number, number] {
  return kind === 'lot' ? z.landUsdM2 : z.builtUsdM2;
}

export function estimate(z: Zone, i: ValuationInput): Valuation {
  const range = zoneRange(z, i.kind);
  const [lo, hi] = range;
  const width = hi - lo;
  const base = lo + width * START[i.kind];

  const shifts: { id: FactorId; shift: number }[] = [];
  if (i.kind === 'lot') shifts.push({ id: 'state', shift: LOT_STATE[i.lotState] });
  else shifts.push({ id: 'condition', shift: CONDITION[i.condition] });
  shifts.push({ id: 'size', shift: sizeShift(i.kind, i.m2) });
  if (i.view) shifts.push({ id: 'view', shift: VIEW });
  if (i.pool && i.kind === 'house') shifts.push({ id: 'pool', shift: POOL });

  const pos = clamp(START[i.kind] + shifts.reduce((s, f) => s + f.shift, 0), -0.2, 1.15);
  const perM2 = lo + width * pos;
  const spread = SPREAD[i.kind];
  const mid = perM2 * i.m2;
  const factors = shifts
    .filter(f => Math.abs(f.shift) >= 0.005)
    .map(f => ({ id: f.id, effect: (f.shift * width) / base }));

  return {
    range,
    base,
    perM2,
    perM2Band: [perM2 * (1 - spread), perM2 * (1 + spread)],
    low: roundPrice(mid * (1 - spread)),
    mid: roundPrice(mid),
    high: roundPrice(mid * (1 + spread)),
    factors,
  };
}

/** Listings on the site of the same type in the zone, with their price per m². */
export function comparables(z: Zone, kind: SellKind, list: Property[]) {
  const type = kind === 'house' ? 'House' : kind === 'condo' ? 'Condo' : 'Lot';
  return list
    .filter(p => p.type === type && z.area.includes(p.area))
    .map(p => ({ p, m2: (kind === 'lot' ? p.lotM2 : p.builtM2) ?? 0 }))
    .filter(c => c.m2 > 0)
    .map(c => ({ ...c, perM2: c.p.priceUsd / c.m2 }))
    .sort((a, b) => a.perM2 - b.perM2);
}
