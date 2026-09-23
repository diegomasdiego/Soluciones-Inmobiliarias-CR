// Company content for the prototype. Names, figures and quotes are sample data.
import type { Area } from './properties';

export const company = {
  name: 'Soluciones Inmobiliarias CR',
  short: 'Soluciones',
  email: 'hola@solucionesinmobiliarias.cr',
  phone: '+506 0000-0000',
  office: 'San Rafael de Escazú, San José, Costa Rica',
  hours: 'Mon–Fri 8:00–18:00 · Sat 9:00–13:00 (GMT-6)',
  stats: [
    { value: '11', unit: 'years', label: 'in the Central Valley' },
    { value: '180+', unit: '', label: 'closings, homes to farms' },
    { value: '100%', unit: '', label: 'of listings title-checked' },
    { value: '6', unit: 'machines', label: 'for earthworks and hauling' },
  ],
  exchangeRate: 505,
};

export type Advisor = { id: string; name: string; role: string; languages: string; initials: string };
export const advisors: Record<string, Advisor> = {
  daniela: { id: 'daniela', name: 'Daniela Rojas', role: 'Homes in Escazú and Santa Ana', languages: 'English · Español', initials: 'DR' },
  sofia: { id: 'sofia', name: 'Sofía Vargas', role: 'Condos and investors, Heredia and Belén', languages: 'English · Español · Português', initials: 'SV' },
  mauricio: { id: 'mauricio', name: 'Mauricio Chaves', role: 'Land, farms and Land & Build', languages: 'Español · English', initials: 'MC' },
};

export type Zone = {
  area: Area[];
  name: string;
  photo: string;
  lat: number;
  lng: number;
  tagline: string;
  body: string;
  pricePerM2: string;
  growth: string;
  toAirport: string;
  estimate?: boolean;
};

// Price ranges for Escazú/Santa Ana and Heredia/Belén come from the 2026 market report the client shared.
// The Alajuela range is an estimate for the prototype.
export const zones: Zone[] = [
  {
    area: ['Escazú'],
    name: 'Escazú',
    photo: 'zone-escazu',
    lat: 9.9189,
    lng: -84.1398,
    tagline: 'The west’s most established address.',
    body: 'Hillside homes above the city, international schools and the Avenida Escazú corridor. Prices hold steady and demand from relocating families stays high.',
    pricePerM2: '$1,500–2,500',
    growth: '+4–7% a year',
    toAirport: '20–25 min',
  },
  {
    area: ['Santa Ana', 'Mora'],
    name: 'Santa Ana',
    photo: 'zone-santa-ana',
    lat: 9.9326,
    lng: -84.1826,
    tagline: 'The sunniest valley, and the fastest growing.',
    body: 'A drier, warmer microclimate, the Lindora business corridor and direct access to Ruta 27. West toward Ciudad Colón, larger lots and a slower pace.',
    pricePerM2: '$1,500–2,500',
    growth: '+4–7% a year',
    toAirport: '18–22 min',
  },
  {
    area: ['Heredia', 'Belén'],
    name: 'Heredia & Belén',
    photo: 'zone-heredia',
    lat: 9.9981,
    lng: -84.1169,
    tagline: 'Coffee country, minutes from the airport.',
    body: 'University town energy, cool mornings in the hills and the free-trade zones of Belén. Strong demand from mid-to-upper income families keeps rentals full.',
    pricePerM2: '$1,200–1,800',
    growth: '+5% a year',
    toAirport: '8–30 min',
  },
  {
    area: ['Alajuela'],
    name: 'Alajuela',
    photo: 'zone-alajuela',
    lat: 10.0163,
    lng: -84.2116,
    tagline: 'Space, views and the airport at your door.',
    body: 'Farms and larger lots on the slopes toward Poás, with the whole valley below. The best value per square meter in our coverage area.',
    pricePerM2: '$900–1,400',
    growth: '+4–6% a year',
    toAirport: '10–25 min',
    estimate: true,
  },
];

export const testimonials = [
  {
    quote: 'They showed us the title study before we even asked. Buying from Texas never felt risky.',
    name: 'Laura and Mike H.',
    detail: 'Relocated from Austin to Escazú',
  },
  {
    quote: 'We bought a lot in Santa Ana, and their own crew cleared it and cut the terrace. One team, one invoice.',
    name: 'Andrés S.',
    detail: 'Building his family home in Santa Ana',
  },
  {
    quote: 'Their true-cost estimate matched the notary’s final number within a few hundred dollars.',
    name: 'Priya N.',
    detail: 'Investor, two condos in Belén',
  },
];

export type Equipment = { id: string; name: string; spec: string; use: string; billing: string; photo: string };
export const equipment: Equipment[] = [
  { id: 'excavator', name: '20-ton crawler excavator', spec: 'Bucket 0.9–1.2 m³ · digs to ~6.5 m', use: 'Cuts, terraces, foundations and loading trucks.', billing: 'Hourly with operator · 4 h minimum', photo: 'eq-excavator' },
  { id: 'mini', name: '3.5-ton mini excavator', spec: '~1.7 m wide · rubber tracks', use: 'Fits through condominium gates: trenches, pipes and tight urban lots.', billing: 'Hourly or daily with operator', photo: 'eq-mini' },
  { id: 'backhoe', name: 'Backhoe loader 4×4', spec: 'Front bucket ~1 m³ + rear digging arm', use: 'Trenches, loading material, cleanup and quick jobs.', billing: 'Hourly with operator · 3 h minimum', photo: 'eq-backhoe' },
  { id: 'dump', name: '12 m³ dump truck (vagoneta)', spec: 'Tandem axle · tipping body', use: 'Hauling soil, ballast (lastre), base, sand, gravel and debris.', billing: 'Per trip, priced by distance', photo: 'eq-dump' },
  { id: 'dozer', name: 'D6-class crawler dozer', spec: 'Blade + rear ripper', use: 'Clearing, pushing material and opening farm roads.', billing: 'Hourly with operator · 4 h minimum', photo: 'eq-dozer' },
  { id: 'roller', name: 'Vibratory soil compactor', spec: 'Single drum · 10–12 tons', use: 'Compacting base and sub-base for roads and building pads.', billing: 'Hourly or daily with operator', photo: 'eq-roller' },
];

export const buildServices = [
  { title: 'Lot clearing', body: 'Brush, stumps and debris removed; topsoil stockpiled for your garden.' },
  { title: 'Cuts, fills and terraces', body: 'Level building pads on sloped lots, shaped to the engineer’s plan.' },
  { title: 'Trenches and drainage', body: 'Water, sewer and storm-water lines; French drains and retaining-wall footings.' },
  { title: 'Material hauling', body: 'Lastre, base, sand and gravel delivered by the trip; debris taken to authorized sites.' },
  { title: 'Farm and condo roads', body: 'Grading, ballast and compaction for internal roads that survive the rainy season.' },
  { title: 'Demolition', body: 'Small structures demolished and cleared so the lot is ready to sell or build.' },
];

export const buildSteps = [
  { title: 'Site visit', body: 'We walk the lot, check access for the machines and review the cadastral plan.' },
  { title: 'Permits', body: 'Earthworks may need a municipal permit and, depending on volume and zone, SETENA environmental viability. Large cuts need a soil study and a CFIA engineer.' },
  { title: 'Clearing', body: 'Brush and debris out; topsoil set aside.' },
  { title: 'Cuts and fills', body: 'Excavator and dozer shape the terraces; trucks move the surplus.' },
  { title: 'Compaction and drainage', body: 'The pad is compacted in layers and storm water gets somewhere to go.' },
  { title: 'Ready to build', body: 'You get a level, compacted, drained pad and a short report for your builder.' },
];
