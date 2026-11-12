// Content for the About page (#about): history, credentials, team and partner network.
// Names, dates and counts are sample data for the prototype. The company confirms them before launch.
import type { L } from '../lib/i18n';

export type LineId = 'sales' | 'trust' | 'build';
export const lineLabels: Record<LineId, L> = {
  sales: { en: 'Real estate', es: 'Bienes raíces' },
  trust: { en: 'Compliance', es: 'Respaldo' },
  build: { en: 'Land & Build', es: 'Land & Build' },
};

export type Milestone = { year: number; line: LineId; title: L; body: L };
export const milestones: Milestone[] = [
  {
    year: 2015, line: 'sales',
    title: { en: 'An office in San Rafael de Escazú', es: 'Una oficina en San Rafael de Escazú' },
    body: {
      en: 'Two advisors, one phone and homes in Escazú and Santa Ana for Costa Rican families. From the first listing, every property came with its title study.',
      es: 'Dos asesores, un teléfono y casas en Escazú y Santa Ana para familias costarricenses. Desde la primera ficha, cada propiedad se publicó con su estudio registral.',
    },
  },
  {
    year: 2017, line: 'sales',
    title: { en: 'The first buyers from abroad', es: 'Los primeros compradores del exterior' },
    body: {
      en: 'Listings in English, tours by video call and the first closings with a power of attorney, for buyers who could not fly down.',
      es: 'Fichas en inglés, recorridos por videollamada y los primeros cierres con poder especial, para compradores que no podían viajar.',
    },
  },
  {
    year: 2018, line: 'trust',
    title: { en: 'Registered with SUGEF', es: 'Inscripción ante SUGEF' },
    body: {
      en: 'Like every company that buys and sells real estate professionally, we registered as a reporting entity under Law 7786: we identify each client and where the money comes from.',
      es: 'Como toda empresa que se dedica a la compra y venta de inmuebles, nos inscribimos como sujeto obligado de la Ley 7786: identificamos a cada cliente y el origen de los fondos.',
    },
  },
  {
    year: 2019, line: 'trust',
    title: { en: 'Members of the CCCBR', es: 'Afiliación a la CCCBR' },
    body: {
      en: 'We joined the Costa Rican Chamber of Real Estate Brokers and adopted its code of ethics. The whole sales team trains with the Chamber.',
      es: 'Nos afiliamos a la Cámara Costarricense de Corredores de Bienes Raíces y adoptamos su código de ética. Todo el equipo de ventas se capacita con la Cámara.',
    },
  },
  {
    year: 2021, line: 'build',
    title: { en: 'Land & Build begins', es: 'Nace Land & Build' },
    body: {
      en: 'Many lots we sold needed clearing and a building pad before anyone could build. We bought an excavator and a dump truck to do it ourselves.',
      es: 'Muchos lotes que vendíamos necesitaban limpieza y terraza antes de construir. Compramos una excavadora y una vagoneta para hacerlo nosotros.',
    },
  },
  {
    year: 2023, line: 'sales',
    title: { en: 'Heredia, Belén and Alajuela', es: 'Heredia, Belén y Alajuela' },
    body: {
      en: 'We started working north of the valley, with one advisor for condos and investors and another for land and farms.',
      es: 'Empezamos a trabajar al norte del valle, con una asesora para condominios e inversionistas y un asesor para lotes y fincas.',
    },
  },
  {
    year: 2024, line: 'trust',
    title: { en: 'Solid Ground Verified', es: 'Sello Solid Ground Verified' },
    body: {
      en: 'Every listing now shows what we checked at the registry and on the ground, and the date we checked it.',
      es: 'Cada ficha muestra qué revisamos en el Registro y en el terreno, y la fecha en que lo revisamos.',
    },
  },
  {
    year: 2026, line: 'build',
    title: { en: '15 people and 6 machines', es: '15 personas y 6 máquinas' },
    body: {
      en: 'Advisors, closings, production and our own fleet with operators. More than 180 closings, from homes to farms.',
      es: 'Asesores, cierres, producción y una flotilla propia con operadores. Más de 180 cierres, de casas a fincas.',
    },
  },
];

export type TeamGroup = 'sales' | 'closing' | 'build' | 'care';
export const groupLabels: Record<TeamGroup, L> = {
  sales: { en: 'Buying and selling', es: 'Compra y venta' },
  closing: { en: 'Closings and compliance', es: 'Cierres y cumplimiento' },
  build: { en: 'Land & Build', es: 'Land & Build' },
  care: { en: 'Production and client care', es: 'Producción y atención' },
};

export type Member = {
  id: string;
  name: L;
  initials: string;
  group: TeamGroup;
  role: L;
  focus: L;
  languages: string;
  since: number;
  /** How many people the card stands for (crews). */
  count?: number;
  /** Clients can write to this person directly from the page. */
  contact?: boolean;
};

const same = (s: string): L => ({ en: s, es: s });

export const team: Member[] = [
  { id: 'daniela', name: same('Daniela Rojas'), initials: 'DR', group: 'sales', contact: true, since: 2015, languages: 'English · Español',
    role: { en: 'Advisor · homes', es: 'Asesora · casas' }, focus: { en: 'Escazú and Santa Ana', es: 'Escazú y Santa Ana' } },
  { id: 'mauricio', name: same('Mauricio Chaves'), initials: 'MC', group: 'sales', contact: true, since: 2016, languages: 'Español · English',
    role: { en: 'Advisor · land and farms', es: 'Asesor · lotes y fincas' }, focus: { en: 'Santa Ana, Ciudad Colón and Alajuela', es: 'Santa Ana, Ciudad Colón y Alajuela' } },
  { id: 'sofia', name: same('Sofía Vargas'), initials: 'SV', group: 'sales', contact: true, since: 2018, languages: 'English · Español · Português',
    role: { en: 'Advisor · condos and investors', es: 'Asesora · condominios e inversión' }, focus: { en: 'Heredia and Belén', es: 'Heredia y Belén' } },
  { id: 'andrea', name: same('Andrea Solano'), initials: 'AS', group: 'sales', contact: true, since: 2021, languages: 'English · Español · Français',
    role: { en: 'Advisor · buyers abroad', es: 'Asesora · compradores del exterior' }, focus: { en: 'Video-call tours, remote closings and residency', es: 'Recorridos por videollamada, cierres a distancia y residencia' } },
  { id: 'gabriela', name: same('Gabriela Mora'), initials: 'GM', group: 'closing', contact: true, since: 2017, languages: 'Español · English',
    role: { en: 'Closing coordinator', es: 'Coordinadora de cierres' }, focus: { en: 'Escrow, notaries and powers of attorney', es: 'Escrow, notarías y poderes especiales' } },
  { id: 'luisfer', name: same('Luis Fernando Araya'), initials: 'LA', group: 'closing', since: 2019, languages: 'Español',
    role: { en: 'Title studies', es: 'Estudios registrales' }, focus: { en: 'Registro Nacional, cadastre and municipalities', es: 'Registro Nacional, catastro y municipalidades' } },
  { id: 'karla', name: same('Karla Jiménez'), initials: 'KJ', group: 'closing', since: 2018, languages: 'Español · English',
    role: { en: 'Compliance officer', es: 'Oficial de cumplimiento' }, focus: { en: 'Client identification and source of funds (Law 7786)', es: 'Identificación de clientes y origen de fondos (Ley 7786)' } },
  { id: 'esteban', name: same('Esteban Solís'), initials: 'ES', group: 'build', contact: true, since: 2021, languages: 'Español · English',
    role: { en: 'Operations lead, Land & Build', es: 'Jefe de operaciones, Land & Build' }, focus: { en: 'Site visits, permits and work schedules', es: 'Visitas al sitio, permisos y cronograma de obra' } },
  { id: 'crew', name: { en: 'Operators and drivers', es: 'Operadores y choferes' }, initials: '×5', group: 'build', since: 2021, count: 5, languages: 'Español',
    role: { en: 'Land & Build crew', es: 'Cuadrilla de Land & Build' }, focus: { en: 'Excavators, dozer, compactor and dump trucks', es: 'Excavadoras, tractor, compactadora y vagonetas' } },
  { id: 'valeria', name: same('Valeria Castro'), initials: 'VC', group: 'care', since: 2022, languages: 'Español · English',
    role: { en: 'Photo, drone and 360°', es: 'Fotografía, dron y 360°' }, focus: { en: 'Production for every listing', es: 'La producción de cada ficha' } },
  { id: 'paula', name: same('Paula Méndez'), initials: 'PM', group: 'care', contact: true, since: 2020, languages: 'Español · English',
    role: { en: 'Client care', es: 'Atención al cliente' }, focus: { en: 'Visit scheduling and request follow-up', es: 'Agenda de visitas y seguimiento de solicitudes' } },
];

export const teamSize = team.reduce((n, m) => n + (m.count ?? 1), 0);

export type StageId = 'search' | 'offer' | 'study' | 'closing' | 'after';
export const stages: { id: StageId; label: L }[] = [
  { id: 'search', label: { en: 'Search', es: 'Búsqueda' } },
  { id: 'offer', label: { en: 'Offer', es: 'Oferta' } },
  { id: 'study', label: { en: 'Due diligence', es: 'Estudio' } },
  { id: 'closing', label: { en: 'Closing', es: 'Cierre' } },
  { id: 'after', label: { en: 'After', es: 'Después' } },
];

export type AllyIcon = 'team' | 'pen' | 'lock' | 'plan' | 'inspect' | 'calc' | 'bank' | 'plane' | 'truck';
export type Ally = { id: string; icon: AllyIcon; name: L; count: L; body: L; when: StageId[]; own?: boolean };
export const allies: Ally[] = [
  {
    id: 'us', icon: 'team', own: true, when: ['search', 'offer', 'study', 'closing', 'after'],
    name: { en: 'Our team', es: 'Nuestro equipo' },
    count: { en: 'One advisor from start to finish', es: 'Un asesor de principio a fin' },
    body: {
      en: 'Your advisor coordinates everyone below, keeps one calendar for the whole purchase and tells you what happens next, in English or Spanish.',
      es: 'Su asesor coordina a todos los de esta lista, lleva un solo calendario de la compra y le avisa qué sigue, en español o en inglés.',
    },
  },
  {
    id: 'banks', icon: 'bank', when: ['search', 'offer', 'closing'],
    name: { en: 'Banks and lenders', es: 'Bancos y financieras' },
    count: { en: '3 regulated lenders', es: '3 entidades reguladas' },
    body: {
      en: 'Mortgages for residents and, in some cases, for foreigners. We introduce you to the loan officer early and line up the bank’s appraisal.',
      es: 'Crédito hipotecario para residentes y, en algunos casos, para extranjeros. Le presentamos al ejecutivo desde el inicio y coordinamos el avalúo del banco.',
    },
  },
  {
    id: 'escrow', icon: 'lock', when: ['offer', 'study', 'closing'],
    name: { en: 'Escrow agents', es: 'Agentes escrow' },
    count: { en: '2, regulated by SUGEF', es: '2, regulados por SUGEF' },
    body: {
      en: 'They hold the deposit from the accepted offer and the final payment, and release the money only when the deed is recorded.',
      es: 'Reciben el depósito de la oferta aceptada y el pago final, y solo liberan el dinero cuando la escritura queda inscrita.',
    },
  },
  {
    id: 'appraisers', icon: 'calc', when: ['offer', 'study'],
    name: { en: 'Appraisers', es: 'Peritos valuadores' },
    count: { en: '2 certified appraisers', es: '2 peritos acreditados' },
    body: {
      en: 'Formal appraisals when the buyer uses a bank loan, or when a seller wants independent support for the asking price.',
      es: 'Avalúos formales cuando el comprador usa crédito bancario o cuando el vendedor quiere un respaldo independiente para su precio.',
    },
  },
  {
    id: 'surveyors', icon: 'plan', when: ['study', 'after'],
    name: { en: 'Surveyors and CFIA engineers', es: 'Topógrafos e ingenieros del CFIA' },
    count: { en: '4 professionals', es: '4 profesionales' },
    body: {
      en: 'They check the boundaries against the cadastral plan, run soil studies and sign the permits for earthworks and building.',
      es: 'Comparan los linderos con el plano catastrado, hacen estudios de suelos y firman los permisos de movimiento de tierras y construcción.',
    },
  },
  {
    id: 'inspectors', icon: 'inspect', when: ['study'],
    name: { en: 'Home inspectors', es: 'Inspectores de vivienda' },
    count: { en: '2 inspectors', es: '2 inspectores' },
    body: {
      en: 'Roof, wiring, plumbing and humidity checked before the offer becomes firm, with a photo report you can share with your builder.',
      es: 'Revisan techo, electricidad, fontanería y humedad antes de que la oferta quede en firme, con un informe con fotos que puede compartir con su constructor.',
    },
  },
  {
    id: 'notaries', icon: 'pen', when: ['study', 'closing'],
    name: { en: 'Notaries', es: 'Notarías' },
    count: { en: '3 in Escazú, Santa Ana and Heredia', es: '3 en Escazú, Santa Ana y Heredia' },
    body: {
      en: 'They draft and sign the deed and record it at the Registro Nacional. You are always free to bring your own notary.',
      es: 'Redactan y firman la escritura y la inscriben en el Registro Nacional. Usted siempre puede llevar a su propio notario.',
    },
  },
  {
    id: 'immigration', icon: 'plane', when: ['closing', 'after'],
    name: { en: 'Immigration lawyers', es: 'Abogados de migración' },
    count: { en: '2 firms', es: '2 bufetes' },
    body: {
      en: 'They file investor residency (Law 9996) for purchases from $150,000, using the deed and the recorded title from your closing.',
      es: 'Tramitan la residencia de inversionista (Ley 9996) para compras desde $150.000, con la escritura y el folio inscrito de su cierre.',
    },
  },
  {
    id: 'machinery', icon: 'truck', when: ['after'],
    name: { en: 'Partner machinery', es: 'Maquinaria aliada' },
    count: { en: 'Cranes, well drilling, heavy transport', es: 'Grúas, pozos, transporte pesado' },
    body: {
      en: 'When a job needs more than our six machines: cranes, water-well drilling and low-bed trucks to move heavy equipment.',
      es: 'Cuando una obra necesita más que nuestras seis máquinas: grúas, perforación de pozos y carretas para mover equipo pesado.',
    },
  },
];
