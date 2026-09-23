// Buyer-side cost model for Costa Rica, based on the 2026 regulations summarized in the client's
// market report. Planning estimates only; a notary confirms the final figures.

export type ClosingOptions = { residency: boolean; split: boolean };
export type CostLine = { label: string; note: string; value: number };

export const RATES = {
  transfer: 0.015, // Law 6999 transfer tax
  registry: 0.005, // Registro Nacional fees and fiscal stamps (approx.)
  notary: 0.0125, // notary fees, scaled by the Bar; 1–1.25% typical
  vat: 0.13,
  residencyTransferDiscount: 0.2, // Law 9996: 20% off the transfer tax
  propertyTax: 0.0025, // Law 7509, yearly, on registered value
  insurance: 0.002, // typical home policy, yearly
  escrowUsd: 750,
  dueDiligenceUsd: 350,
};

export function closingCosts(price: number, o: ClosingOptions): CostLine[] {
  const share = o.split ? 0.5 : 1;
  const transferRate = RATES.transfer * (o.residency ? 1 - RATES.residencyTransferDiscount : 1);
  return [
    { label: 'Transfer tax', note: o.residency ? '1.5% less 20% (Law 9996)' : '1.5% of the price', value: price * transferRate * share },
    { label: 'Registry fees and fiscal stamps', note: '≈0.5% of the price', value: price * RATES.registry * share },
    { label: 'Notary fees', note: '≈1.25% + 13% VAT', value: price * RATES.notary * (1 + RATES.vat) },
    { label: 'Escrow agent', note: 'SUGEF-regulated, flat fee', value: RATES.escrowUsd },
    { label: 'Title study and due diligence', note: 'Registry, cadastre, liens', value: RATES.dueDiligenceUsd },
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
