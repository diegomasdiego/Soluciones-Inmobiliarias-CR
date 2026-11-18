// Client portal: the purchase stages, labels, and the sample files shown at #portal-demo.
// The live portal reads deals from Convex (convex/portal.ts); everything here is display text
// or fictitious sample data. Stage texts are general information and go through the legal review (COD-9).
import type { L } from '../lib/i18n';

export type DealKind = 'purchase' | 'managed';
export type DocCategory = 'offer' | 'study' | 'escrow' | 'signing' | 'registration' | 'identity' | 'funds' | 'contract' | 'report' | 'invoice' | 'other';
export type TicketStatus = 'open' | 'scheduled' | 'done';

export type PortalDeal = {
  _id: string;
  kind: DealKind;
  title: string;
  place: string;
  propertySlug?: string;
  clientName: string;
  lang: 'en' | 'es';
  advisor: string;
  priceUsd?: number;
  depositUsd?: number;
  rentUsd?: number;
  stage: number;
  stageDates: string[];
  status: 'active' | 'closed';
  updatedAt: number;
};
export type PortalUpdate = { _id: string; _creationTime: number; author: string; byClient: boolean; text: string };
export type PortalDoc = { _id: string; _creationTime: number; name: string; category: DocCategory; size: number; contentType: string; uploadedBy: string; byClient: boolean };
export type PortalReport = { _id: string; month: string; incomeUsd: number; feeUsd: number; maintenanceUsd: number; otherUsd: number; nights?: number; note?: string };
export type PortalTicket = { _id: string; _creationTime: number; title: string; detail?: string; status: TicketStatus; costUsd?: number; scheduledFor?: string; openedBy: string; byClient: boolean; closedAt?: number };
export type PortalData = { deal: PortalDeal; updates: PortalUpdate[]; docs: PortalDoc[]; reports: PortalReport[]; tickets: PortalTicket[]; seenAt: number; team: boolean };

export const stages: { id: DocCategory; title: L; what: L; you: L }[] = [
  {
    id: 'offer',
    title: { en: 'Offer', es: 'Oferta' },
    what: { en: 'You and the seller sign the offer or option-to-purchase agreement: price, deadlines and who pays each cost.', es: 'Usted y el vendedor firman la oferta o el contrato de opción de compra: precio, plazos y quién paga cada gasto.' },
    you: { en: 'Sign the offer and send us your ID.', es: 'Firmar la oferta y enviarnos su identificación.' },
  },
  {
    id: 'study',
    title: { en: 'Title study', es: 'Estudio registral' },
    what: { en: 'We check the property record (folio real) and survey plan at the National Registry, liens, municipal taxes and zoning.', es: 'Revisamos el folio real y el plano catastrado en el Registro Nacional, los gravámenes, los impuestos municipales y el uso de suelo.' },
    you: { en: 'Read the report and ask us about anything unclear.', es: 'Leer el informe y preguntarnos lo que no quede claro.' },
  },
  {
    id: 'escrow',
    title: { en: 'Escrow', es: 'Escrow' },
    what: { en: 'The deposit is held in an escrow account with a company registered with SUGEF until the signing.', es: 'El depósito queda en una cuenta de garantía de una empresa de escrow inscrita ante SUGEF hasta la firma.' },
    you: { en: 'Wire the deposit to the escrow account, never to a personal account.', es: 'Transferir el depósito a la cuenta de escrow, nunca a una cuenta personal.' },
  },
  {
    id: 'signing',
    title: { en: 'Signing', es: 'Firma' },
    what: { en: 'The deed is signed before a notary, the balance is paid and escrow releases the money to the seller.', es: 'Se firma la escritura ante notario, se paga el saldo y el escrow le entrega el dinero al vendedor.' },
    you: { en: 'Attend the signing (or sign through a power of attorney) and wire the balance and closing costs.', es: 'Asistir a la firma (o firmar por medio de un poder) y transferir el saldo y los gastos de cierre.' },
  },
  {
    id: 'registration',
    title: { en: 'Registration', es: 'Inscripción' },
    what: { en: 'The notary files the deed with the National Registry. Once it is recorded, the property is in your name.', es: 'El notario presenta la escritura al Registro Nacional. Al quedar inscrita, la propiedad está a su nombre.' },
    you: { en: 'Nothing: we tell you when it is recorded and give you the certified copy of the deed.', es: 'Nada: le avisamos cuando quede inscrita y le entregamos el testimonio de la escritura.' },
  },
];

export const docCategories: Record<DocCategory, L> = {
  offer: { en: 'Offer', es: 'Oferta' },
  study: { en: 'Title study', es: 'Estudio registral' },
  escrow: { en: 'Escrow', es: 'Escrow' },
  signing: { en: 'Signing', es: 'Firma' },
  registration: { en: 'Registration', es: 'Inscripción' },
  identity: { en: 'ID', es: 'Identificación' },
  funds: { en: 'Proof of funds', es: 'Origen de los fondos' },
  contract: { en: 'Contract', es: 'Contrato' },
  report: { en: 'Report', es: 'Reporte' },
  invoice: { en: 'Invoice', es: 'Factura' },
  other: { en: 'Other', es: 'Otro' },
};
/** What a client may upload (the server enforces the same list). */
export const clientDocCategories: DocCategory[] = ['identity', 'funds', 'other'];
export const teamDocCategories = (kind: DealKind): DocCategory[] =>
  kind === 'purchase' ? ['offer', 'study', 'escrow', 'signing', 'registration', 'identity', 'funds', 'other'] : ['contract', 'report', 'invoice', 'other'];

export const ticketStatuses: Record<TicketStatus, L> = {
  open: { en: 'Received', es: 'Recibida' },
  scheduled: { en: 'Scheduled', es: 'Programada' },
  done: { en: 'Done', es: 'Resuelta' },
};

export const ACCEPT = '.pdf,.jpg,.jpeg,.png,.webp,.heic,.heif,.docx,.xlsx';
export const MAX_FILE_MB = 15;

// ---------------------------------------------------------------- demo (fictitious)

const at = (iso: string, hour = 10) => new Date(`${iso}T${String(hour).padStart(2, '0')}:00:00-06:00`).getTime();
const TEAM = 'equipo@solucionesinmobiliarias.cr';
const CLIENT = 'laura@ejemplo.com';

type DemoText = { en: string; es: string };
const t = (x: DemoText, lang: 'en' | 'es') => x[lang];

export function demoDeals(lang: 'en' | 'es'): PortalData[] {
  const purchase: PortalData = {
    team: false,
    seenAt: at('2026-11-12', 18),
    deal: {
      _id: 'demo-purchase', kind: 'purchase', title: 'Casa Los Laureles', place: 'San Rafael, Escazú', propertySlug: 'los-laureles',
      clientName: 'Laura y Daniel Whitaker', lang, advisor: 'Daniela Rojas', priceUsd: 452000, depositUsd: 45200,
      stage: 3, stageDates: ['2026-10-20', '2026-11-04', '2026-11-12', '2026-12-05', '2026-12-19'], status: 'active', updatedAt: at('2026-11-14', 9),
    },
    updates: [
      { _id: 'u4', _creationTime: at('2026-11-14', 9), author: TEAM, byClient: false, text: t({ en: 'The notary confirmed the signing for Friday, December 5 at 10:00 in Escazú. If you prefer to sign through a power of attorney, tell us this week so we can prepare it.', es: 'La notaría confirmó la firma para el viernes 5 de diciembre a las 10:00 en Escazú. Si prefiere firmar por medio de un poder, díganos esta semana para prepararlo.' }, lang) },
      { _id: 'u3', _creationTime: at('2026-11-12', 15), author: TEAM, byClient: false, text: t({ en: 'The escrow company confirmed your deposit of US$45,200. It stays in the escrow account until the signing.', es: 'La empresa de escrow confirmó su depósito de US$45.200. Queda en la cuenta de garantía hasta la firma.' }, lang) },
      { _id: 'u2', _creationTime: at('2026-11-10', 20), author: CLIENT, byClient: true, text: t({ en: 'We sent the wire today. Is the 2023 municipal tax receipt included in the study?', es: 'Hoy enviamos la transferencia. ¿El recibo del impuesto municipal de 2023 está incluido en el estudio?' }, lang) },
      { _id: 'u1', _creationTime: at('2026-11-04', 11), author: TEAM, byClient: false, text: t({ en: 'The title study is clean: no liens or annotations, municipal taxes up to date and residential zoning. The full report is in Documents.', es: 'El estudio registral salió limpio: sin gravámenes ni anotaciones, impuestos municipales al día y uso de suelo residencial. El informe completo está en Documentos.' }, lang) },
    ],
    docs: [
      { _id: 'd6', _creationTime: at('2026-11-14', 9), name: t({ en: 'Draft deed for review.pdf', es: 'Borrador de escritura para revisión.pdf' }, lang), category: 'signing', size: 412_000, contentType: 'application/pdf', uploadedBy: TEAM, byClient: false },
      { _id: 'd5', _creationTime: at('2026-11-12', 15), name: t({ en: 'Escrow deposit receipt.pdf', es: 'Comprobante de depósito en escrow.pdf' }, lang), category: 'escrow', size: 188_000, contentType: 'application/pdf', uploadedBy: TEAM, byClient: false },
      { _id: 'd4', _creationTime: at('2026-11-10', 20), name: t({ en: 'Wire confirmation.pdf', es: 'Confirmación de transferencia.pdf' }, lang), category: 'funds', size: 96_000, contentType: 'application/pdf', uploadedBy: CLIENT, byClient: true },
      { _id: 'd3', _creationTime: at('2026-11-04', 11), name: t({ en: 'Title study, folio 1-523871-000.pdf', es: 'Estudio registral, folio 1-523871-000.pdf' }, lang), category: 'study', size: 1_240_000, contentType: 'application/pdf', uploadedBy: TEAM, byClient: false },
      { _id: 'd2', _creationTime: at('2026-11-04', 11), name: t({ en: 'Survey plan SJ-1893420-2016.pdf', es: 'Plano catastrado SJ-1893420-2016.pdf' }, lang), category: 'study', size: 860_000, contentType: 'application/pdf', uploadedBy: TEAM, byClient: false },
      { _id: 'd1', _creationTime: at('2026-10-20', 16), name: t({ en: 'Signed offer.pdf', es: 'Oferta firmada.pdf' }, lang), category: 'offer', size: 320_000, contentType: 'application/pdf', uploadedBy: TEAM, byClient: false },
      { _id: 'd0', _creationTime: at('2026-10-19', 12), name: t({ en: 'Passports.pdf', es: 'Pasaportes.pdf' }, lang), category: 'identity', size: 2_100_000, contentType: 'application/pdf', uploadedBy: CLIENT, byClient: true },
    ],
    reports: [],
    tickets: [],
  };

  const months = ['2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10'];
  const maint = [0, 85, 0, 240, 35, 0];
  const managed: PortalData = {
    team: false,
    seenAt: at('2026-11-05', 18),
    deal: {
      _id: 'demo-managed', kind: 'managed', title: 'Guachipelín Residences 5B', place: 'Guachipelín, Escazú', propertySlug: 'guachipelin-residences',
      clientName: 'Laura y Daniel Whitaker', lang, advisor: 'Sofía Vargas', rentUsd: 1450,
      stage: 0, stageDates: [], status: 'active', updatedAt: at('2026-11-15', 11),
    },
    updates: [
      { _id: 'm2', _creationTime: at('2026-11-15', 11), author: TEAM, byClient: false, text: t({ en: 'The tenant renewed the lease for 12 more months at US$1,450. The signed renewal is in Documents.', es: 'El inquilino renovó el contrato por 12 meses más a US$1.450. La renovación firmada está en Documentos.' }, lang) },
      { _id: 'm1', _creationTime: at('2026-11-03', 9), author: TEAM, byClient: false, text: t({ en: 'October report is ready: rent collected on the 1st, no maintenance this month.', es: 'Listo el reporte de octubre: alquiler cobrado el día 1 y sin mantenimiento este mes.' }, lang) },
    ],
    docs: [
      { _id: 'n4', _creationTime: at('2026-11-15', 11), name: t({ en: 'Lease renewal 2026-2027.pdf', es: 'Renovación de contrato 2026-2027.pdf' }, lang), category: 'contract', size: 540_000, contentType: 'application/pdf', uploadedBy: TEAM, byClient: false },
      { _id: 'n3', _creationTime: at('2026-11-03', 9), name: t({ en: 'Report October 2026.pdf', es: 'Reporte octubre 2026.pdf' }, lang), category: 'report', size: 210_000, contentType: 'application/pdf', uploadedBy: TEAM, byClient: false },
      { _id: 'n2', _creationTime: at('2026-08-22', 14), name: t({ en: 'Invoice, water heater repair.pdf', es: 'Factura, reparación del calentador de agua.pdf' }, lang), category: 'invoice', size: 150_000, contentType: 'application/pdf', uploadedBy: TEAM, byClient: false },
      { _id: 'n1', _creationTime: at('2026-04-28', 10), name: t({ en: 'Management agreement.pdf', es: 'Contrato de administración.pdf' }, lang), category: 'contract', size: 380_000, contentType: 'application/pdf', uploadedBy: TEAM, byClient: false },
    ],
    reports: months.map((month, i) => ({
      _id: `r${i}`, month,
      incomeUsd: 1450, feeUsd: 145, maintenanceUsd: maint[i], otherUsd: 210,
      note: i === 3 ? t({ en: 'Water heater repaired.', es: 'Se reparó el calentador de agua.' }, lang) : undefined,
    })),
    tickets: [
      { _id: 't3', _creationTime: at('2026-11-13', 19), title: t({ en: 'Front door lock sticks', es: 'La cerradura de la puerta principal se traba' }, lang), detail: t({ en: 'The tenant says the key turns with difficulty.', es: 'El inquilino dice que la llave gira con dificultad.' }, lang), status: 'open', openedBy: CLIENT, byClient: true },
      { _id: 't2', _creationTime: at('2026-11-06', 10), title: t({ en: 'Air conditioning service', es: 'Mantenimiento del aire acondicionado' }, lang), status: 'scheduled', scheduledFor: '2026-11-22', openedBy: TEAM, byClient: false },
      { _id: 't1', _creationTime: at('2026-08-19', 8), title: t({ en: 'Water heater not heating', es: 'El calentador de agua no calienta' }, lang), status: 'done', costUsd: 240, openedBy: TEAM, byClient: false, closedAt: at('2026-08-22', 14) },
    ],
  };
  return [purchase, managed];
}
