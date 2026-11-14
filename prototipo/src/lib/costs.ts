// Buyer-side cost model for Costa Rica, based on the client's 2026 market report and checked against
// official sources in November 2026 (see the taxes guide, src/data/guides.ts). Planning estimates only;
// a notary confirms the final figures.
import type { Lang } from './i18n';

export type ClosingOptions = {
  /**
   * The buyer already holds the Law 9996 tax benefits. New requests closed on 14 July 2026
   * (art. 12); people granted them before keep them for ten years.
   */
  law9996: boolean;
  split: boolean;
};
export type CostLine = { label: string; note: string; value: number };

export const RATES = {
  transfer: 0.015, // Law 6999 transfer tax
  registry: 0.005, // Registro Nacional fees and fiscal stamps (approx.)
  notary: 0.0125, // notary fees, scaled by the Bar; 1–1.25% typical
  vat: 0.13,
  law9996TransferDiscount: 0.2, // Law 9996: 20% off the transfer tax, for existing beneficiaries only
  propertyTax: 0.0025, // Law 7509, yearly, on registered value
  insurance: 0.002, // typical home policy, yearly
  escrowUsd: 750,
  dueDiligenceUsd: 350,
};

export function closingCosts(price: number, o: ClosingOptions, lang: Lang = 'en'): CostLine[] {
  const es = lang === 'es';
  const share = o.split ? 0.5 : 1;
  const transferRate = RATES.transfer * (o.law9996 ? 1 - RATES.law9996TransferDiscount : 1);
  return [
    {
      label: es ? 'Impuesto de traspaso' : 'Transfer tax',
      note: o.law9996 ? (es ? '1,5% menos 20% (beneficio de la Ley 9996)' : '1.5% less 20% (Law 9996 benefit)') : (es ? '1,5% del precio' : '1.5% of the price'),
      value: price * transferRate * share,
    },
    { label: es ? 'Derechos de registro y timbres' : 'Registry fees and fiscal stamps', note: es ? '≈0,5% del precio' : '≈0.5% of the price', value: price * RATES.registry * share },
    { label: es ? 'Honorarios del notario' : 'Notary fees', note: es ? '≈1,25% + 13% de IVA' : '≈1.25% + 13% VAT', value: price * RATES.notary * (1 + RATES.vat) },
    { label: es ? 'Agente escrow' : 'Escrow agent', note: es ? 'Regulado por SUGEF, tarifa fija' : 'SUGEF-regulated, flat fee', value: RATES.escrowUsd },
    { label: es ? 'Estudio registral y debida diligencia' : 'Title study and due diligence', note: es ? 'Registro, catastro, gravámenes' : 'Registry, cadastre, liens', value: RATES.dueDiligenceUsd },
  ];
}

export const sum = (lines: { value: number }[]) => lines.reduce((a, l) => a + l.value, 0);

export function monthlyPayment(principal: number, annualRate: number, years: number): number {
  if (principal <= 0) return 0;
  const r = annualRate / 12;
  const n = years * 12;
  return r ? (principal * r) / (1 - Math.pow(1 + r, -n)) : principal / n;
}

export function yearlyHolding(price: number) {
  return { propertyTax: price * RATES.propertyTax, insurance: price * RATES.insurance };
}

/** Net yield after HOA, tax, insurance, 10% management and 8% vacancy. */
export function rentalYield(price: number, rent: number, hoa: number) {
  const gross = rent * 12;
  const { propertyTax, insurance } = yearlyHolding(price);
  const net = gross * (1 - 0.08) * (1 - 0.1) - hoa * 12 - propertyTax - insurance;
  return { gross: gross / price, net: net / price, netYearly: net };
}
