// Sample listings for the prototype. All figures, registry numbers and dates are fictitious.

export type PropertyType = 'House' | 'Condo' | 'Lot' | 'Farm' | 'Commercial' | 'Pre-sale';
export type Area = 'Escazú' | 'Santa Ana' | 'Mora' | 'Belén' | 'Heredia' | 'Alajuela';

export type Nearby = { name: string; minutes: number; kind: 'school' | 'shopping' | 'health' | 'airport' | 'road' | 'nature' | 'town' | 'work' };

export type Room = { name: string; x: number; y: number; w: number; h: number; dims?: string };
export type Hotspot = { x: number; y: number; photo: number; label: string };

export type Property = {
  slug: string;
  title: string;
  type: PropertyType;
  area: Area;
  district: string;
  canton: string;
  province: 'San José' | 'Heredia' | 'Alajuela';
  lat: number;
  lng: number;
  priceUsd: number;
  priceNote?: string;
  beds?: number;
  baths?: number;
  builtM2?: number;
  lotM2?: number;
  parking?: number;
  yearBuilt?: number;
  hoaUsd: number;
  rentUsd?: number;
  pool?: boolean;
  view?: boolean;
  headline: string;
  description: string;
  features: string[];
  photos: string[];
  tour?: boolean;
  plan?: { rooms: Room[]; hotspots: Hotspot[] };
  legal: { title: string; folio: string; plano: string; zoning: string; checked: string };
  advisor: string;
  nearby: Nearby[];
  buildReady?: string;
  /** Spanish text, present on listings loaded from the database. */
  es?: { headline: string; description: string; features: string[]; legalTitle: string; zoning: string; buildReady?: string };
};

const laurelesPlan = {
  rooms: [
    { name: 'Living', x: 4, y: 4, w: 38, h: 30, dims: '7.6 × 6.0 m' },
    { name: 'Kitchen', x: 42, y: 4, w: 22, h: 18, dims: '4.4 × 3.6 m' },
    { name: 'Dining', x: 42, y: 22, w: 22, h: 12, dims: '4.4 × 2.4 m' },
    { name: 'Terrace', x: 4, y: 34, w: 38, h: 14, dims: '7.6 × 2.8 m' },
    { name: 'Primary suite', x: 64, y: 4, w: 32, h: 22, dims: '6.4 × 4.4 m' },
    { name: 'Bath', x: 64, y: 26, w: 14, h: 12 },
    { name: 'Office', x: 78, y: 26, w: 18, h: 12 },
    { name: 'Bedroom 2', x: 42, y: 34, w: 27, h: 22, dims: '5.4 × 4.4 m' },
    { name: 'Bedroom 3', x: 69, y: 38, w: 27, h: 18, dims: '5.4 × 3.6 m' },
    { name: 'Garden', x: 4, y: 48, w: 38, h: 8 },
  ],
  hotspots: [
    { x: 20, y: 18, photo: 2, label: 'Living room' },
    { x: 53, y: 12, photo: 3, label: 'Kitchen' },
    { x: 80, y: 14, photo: 4, label: 'Primary suite' },
    { x: 71, y: 32, photo: 5, label: 'Bathroom' },
    { x: 22, y: 41, photo: 6, label: 'View from the terrace' },
  ],
};

const pozosPlan = {
  rooms: [
    { name: 'Great room', x: 4, y: 4, w: 44, h: 28, dims: '8.8 × 5.6 m' },
    { name: 'Kitchen', x: 48, y: 4, w: 22, h: 20, dims: '4.4 × 4.0 m' },
    { name: 'Pantry', x: 70, y: 4, w: 10, h: 10 },
    { name: 'Laundry', x: 70, y: 14, w: 10, h: 10 },
    { name: 'Primary suite', x: 80, y: 4, w: 16, h: 30, dims: '3.2 × 6.0 m' },
    { name: 'Pool deck', x: 4, y: 32, w: 44, h: 24, dims: '10 × 4 m pool' },
    { name: 'Bedroom 2', x: 48, y: 24, w: 16, h: 16 },
    { name: 'Bedroom 3', x: 64, y: 24, w: 16, h: 16 },
    { name: 'Bedroom 4', x: 48, y: 40, w: 16, h: 16 },
    { name: 'Bath', x: 64, y: 40, w: 16, h: 16 },
    { name: 'Bath', x: 80, y: 34, w: 16, h: 22 },
  ],
  hotspots: [
    { x: 22, y: 16, photo: 1, label: 'Great room' },
    { x: 58, y: 13, photo: 2, label: 'Kitchen' },
    { x: 88, y: 18, photo: 3, label: 'Primary suite' },
    { x: 88, y: 45, photo: 4, label: 'Primary bath' },
    { x: 24, y: 44, photo: 0, label: 'Pool and garden' },
  ],
};

export const properties: Property[] = [
  {
    slug: 'los-laureles',
    title: 'Casa Los Laureles',
    type: 'House',
    area: 'Escazú',
    district: 'San Rafael',
    canton: 'Escazú',
    province: 'San José',
    lat: 9.9165,
    lng: -84.1372,
    priceUsd: 465000,
    beds: 3,
    baths: 3.5,
    builtM2: 260,
    lotM2: 520,
    parking: 2,
    yearBuilt: 2019,
    hoaUsd: 180,
    rentUsd: 2350,
    view: true,
    headline: 'Wood, stone and a view across the whole valley.',
    description:
      'A three-bedroom home on a quiet ridge in San Rafael de Escazú, ten minutes from Avenida Escazú. Floor-to-ceiling windows open the living room to a covered terrace and a garden of native plants. The primary suite has its own terrace, and a separate office works for remote work across time zones.',
    features: ['Gated community with 24/7 security', 'Valley and mountain views', 'Covered terrace', 'Home office', 'Solar water heating', 'Fiber internet (1 Gbps)', 'Two-car garage', 'Native-plant garden'],
    photos: ['laureles-1', 'laureles-2', 'laureles-3', 'laureles-4', 'laureles-5', 'laureles-6', 'laureles-7'],
    tour: true,
    plan: laurelesPlan,
    legal: { title: 'Fully titled property (Folio Real)', folio: '1-523871-000', plano: 'SJ-1893420-2016', zoning: 'Residential, low density', checked: '2026-08-18' },
    advisor: 'daniela',
    nearby: [
      { name: 'Avenida Escazú', minutes: 10, kind: 'shopping' },
      { name: 'Country Day School', minutes: 8, kind: 'school' },
      { name: 'Hospital CIMA', minutes: 12, kind: 'health' },
      { name: 'Multiplaza Escazú', minutes: 11, kind: 'shopping' },
      { name: 'Juan Santamaría Airport (SJO)', minutes: 25, kind: 'airport' },
    ],
  },
  {
    slug: 'altos-de-pozos',
    title: 'Altos de Pozos',
    type: 'House',
    area: 'Santa Ana',
    district: 'Pozos',
    canton: 'Santa Ana',
    province: 'San José',
    lat: 9.9475,
    lng: -84.1885,
    priceUsd: 498000,
    beds: 4,
    baths: 4,
    builtM2: 340,
    lotM2: 800,
    parking: 3,
    yearBuilt: 2021,
    hoaUsd: 220,
    rentUsd: 2250,
    pool: true,
    view: true,
    headline: 'A pool house in Santa Ana’s sunny side.',
    description:
      'Single-level living around a 10-meter pool and a lawn that catches the afternoon sun Santa Ana is known for. The great room, kitchen and pool deck flow into one space; four bedrooms sit on the quiet side of the house. Five minutes to Lindora’s restaurants, clinics and Ruta 27.',
    features: ['10 m saltwater pool', 'Single-level layout', 'Four en-suite bedrooms', 'Outdoor kitchen', 'Backup water tank', 'EV charger', 'Smart-home lighting'],
    photos: ['pozos-1', 'pozos-2', 'pozos-3', 'pozos-4', 'pozos-5'],
    tour: true,
    plan: pozosPlan,
    legal: { title: 'Fully titled property (Folio Real)', folio: '1-611204-000', plano: 'SJ-2011876-2019', zoning: 'Residential', checked: '2026-08-27' },
    advisor: 'daniela',
    nearby: [
      { name: 'Momentum Lindora', minutes: 5, kind: 'shopping' },
      { name: 'Hospital Metropolitano Lindora', minutes: 6, kind: 'health' },
      { name: 'Blue Valley School', minutes: 12, kind: 'school' },
      { name: 'Ruta 27', minutes: 4, kind: 'road' },
      { name: 'Juan Santamaría Airport (SJO)', minutes: 18, kind: 'airport' },
    ],
  },
  {
    slug: 'guachipelin-residences',
    title: 'Guachipelín Residences 5B',
    type: 'Condo',
    area: 'Escazú',
    district: 'Guachipelín',
    canton: 'Escazú',
    province: 'San José',
    lat: 9.9455,
    lng: -84.1545,
    priceUsd: 235000,
    beds: 2,
    baths: 2,
    builtM2: 112,
    parking: 2,
    yearBuilt: 2022,
    hoaUsd: 240,
    rentUsd: 1450,
    pool: true,
    headline: 'Lock-and-leave living, three minutes from Ruta 27.',
    description:
      'A fifth-floor corner unit with a glass balcony facing the Escazú hills. The building has a pool, gym, co-working lounge and 24/7 security, so it works as a first home in Costa Rica or as a furnished rental while you are away.',
    features: ['Corner unit, 5th floor', 'Glass balcony', 'Pool, gym and co-working', '24/7 security', 'Two covered parking spots', 'Storage unit', 'Pet-friendly building'],
    photos: ['guachipelin-1', 'guachipelin-2', 'guachipelin-3', 'guachipelin-4'],
    tour: true,
    legal: { title: 'Condominium unit, fully titled (Folio Real)', folio: '1-238415-F-000', plano: 'SJ-2150933-2021', zoning: 'Mixed use', checked: '2026-09-02' },
    advisor: 'sofia',
    nearby: [
      { name: 'Ruta 27', minutes: 3, kind: 'road' },
      { name: 'Plaza Tempo', minutes: 4, kind: 'shopping' },
      { name: 'Hospital CIMA', minutes: 6, kind: 'health' },
      { name: 'Country Day School', minutes: 9, kind: 'school' },
      { name: 'Juan Santamaría Airport (SJO)', minutes: 20, kind: 'airport' },
    ],
  },
  {
    slug: 'casa-san-pablo',
    title: 'Casa San Pablo',
    type: 'House',
    area: 'Heredia',
    district: 'San Pablo',
    canton: 'San Pablo',
    province: 'Heredia',
    lat: 9.9955,
    lng: -84.0965,
    priceUsd: 289000,
    beds: 3,
    baths: 2,
    builtM2: 185,
    lotM2: 300,
    parking: 2,
    yearBuilt: 2017,
    hoaUsd: 60,
    rentUsd: 1650,
    headline: 'A family home in coffee country, close to everything.',
    description:
      'A bright single-story home in a small gated street of San Pablo de Heredia. Open living and kitchen, a covered laundry and a back garden with room for a play area. Schools, the university and Heredia’s center are all within ten minutes.',
    features: ['Gated street', 'Single story', 'Back garden', 'Covered laundry', 'Two-car driveway', 'Water heater and backup tank'],
    photos: ['sanpablo-1', 'sanpablo-2', 'sanpablo-3', 'sanpablo-4'],
    legal: { title: 'Fully titled property (Folio Real)', folio: '4-187332-000', plano: 'H-1790245-2014', zoning: 'Residential', checked: '2026-09-05' },
    advisor: 'sofia',
    nearby: [
      { name: 'Paseo de las Flores', minutes: 6, kind: 'shopping' },
      { name: 'Universidad Nacional', minutes: 8, kind: 'school' },
      { name: 'Hospital San Vicente de Paúl', minutes: 10, kind: 'health' },
      { name: 'Heredia center', minutes: 7, kind: 'town' },
      { name: 'Juan Santamaría Airport (SJO)', minutes: 30, kind: 'airport' },
    ],
  },
  {
    slug: 'casa-cariari',
    title: 'Casa Cariari',
    type: 'House',
    area: 'Belén',
    district: 'Asunción',
    canton: 'Belén',
    province: 'Heredia',
    lat: 9.9725,
    lng: -84.1575,
    priceUsd: 455000,
    beds: 4,
    baths: 3.5,
    builtM2: 300,
    lotM2: 600,
    parking: 2,
    yearBuilt: 2020,
    hoaUsd: 120,
    rentUsd: 2100,
    headline: 'Glass, light and a garden, twelve minutes from the airport.',
    description:
      'A contemporary two-level home in Ciudad Cariari with double-height glass across the living room. The kitchen opens to a garden terrace; upstairs, four bedrooms share a family lounge. A strong choice for families who travel often.',
    features: ['Double-height living room', 'Garden terrace', 'Family lounge', 'Walk-in closets', 'Security cameras', 'Near Cariari Country Club'],
    photos: ['cariari-1', 'cariari-2', 'cariari-3'],
    legal: { title: 'Fully titled property (Folio Real)', folio: '4-201559-000', plano: 'H-1934120-2018', zoning: 'Residential', checked: '2026-08-30' },
    advisor: 'sofia',
    nearby: [
      { name: 'Cariari Country Club', minutes: 3, kind: 'nature' },
      { name: 'Real Cariari mall', minutes: 4, kind: 'shopping' },
      { name: 'Ruta 1 (General Cañas)', minutes: 3, kind: 'road' },
      { name: 'Free-trade zones', minutes: 10, kind: 'work' },
      { name: 'Juan Santamaría Airport (SJO)', minutes: 12, kind: 'airport' },
    ],
  },
  {
    slug: 'belen-urban',
    title: 'Belén Urban 304',
    type: 'Condo',
    area: 'Belén',
    district: 'La Asunción',
    canton: 'Belén',
    province: 'Heredia',
    lat: 9.9775,
    lng: -84.1865,
    priceUsd: 139000,
    beds: 1,
    baths: 1,
    builtM2: 62,
    parking: 1,
    yearBuilt: 2023,
    hoaUsd: 150,
    rentUsd: 1050,
    pool: true,
    headline: 'A one-bedroom that rents itself: eight minutes to SJO.',
    description:
      'Furnished one-bedroom in a new building next to the free-trade zones, popular with engineers, flight crews and consultants on 6- to 12-month contracts. Rooftop pool, co-working and bike storage.',
    features: ['Sold furnished', 'Rooftop pool', 'Co-working space', 'Bike storage', 'Rental-friendly rules', 'One parking spot'],
    photos: ['belen-1', 'belen-2', 'belen-3'],
    legal: { title: 'Condominium unit, fully titled (Folio Real)', folio: '4-244190-F-000', plano: 'H-2233871-2022', zoning: 'Mixed use', checked: '2026-09-09' },
    advisor: 'sofia',
    nearby: [
      { name: 'Juan Santamaría Airport (SJO)', minutes: 8, kind: 'airport' },
      { name: 'Free-trade zones', minutes: 5, kind: 'work' },
      { name: 'Ruta 1 (General Cañas)', minutes: 3, kind: 'road' },
      { name: 'City Mall Alajuela', minutes: 12, kind: 'shopping' },
      { name: 'Heredia center', minutes: 15, kind: 'town' },
    ],
  },
  {
    slug: 'lote-rio-oro',
    title: 'Lote Río Oro',
    type: 'Lot',
    area: 'Santa Ana',
    district: 'Río Oro',
    canton: 'Santa Ana',
    province: 'San José',
    lat: 9.9275,
    lng: -84.2125,
    priceUsd: 148000,
    lotM2: 1050,
    hoaUsd: 0,
    view: true,
    headline: 'Build your own house on 1,050 m² with open western views.',
    description:
      'A gently sloping residential lot with water and electricity at the property line and a municipal land-use certificate for a single-family home. Part of the lot is already cleared. Our Land & Build team can terrace it and prepare the building pad.',
    features: ['1,050 m² lot', 'Water and power at the line', 'Residential land-use certificate', 'Partly cleared', 'Gentle slope (about 8%)', 'Paved street access'],
    photos: ['rio-oro-1', 'hills-sunset'],
    legal: { title: 'Fully titled property (Folio Real)', folio: '1-702318-000', plano: 'SJ-2204519-2020', zoning: 'Residential, single family', checked: '2026-09-11' },
    advisor: 'mauricio',
    buildReady: 'Needs light clearing and one terrace cut before building.',
    nearby: [
      { name: 'Santa Ana center', minutes: 6, kind: 'town' },
      { name: 'Ruta 27', minutes: 4, kind: 'road' },
      { name: 'Lindora', minutes: 10, kind: 'shopping' },
      { name: 'Juan Santamaría Airport (SJO)', minutes: 22, kind: 'airport' },
    ],
  },
  {
    slug: 'casa-ciudad-colon',
    title: 'Casa Jardín, Ciudad Colón',
    type: 'House',
    area: 'Mora',
    district: 'Colón',
    canton: 'Mora',
    province: 'San José',
    lat: 9.9135,
    lng: -84.2425,
    priceUsd: 345000,
    beds: 3,
    baths: 2.5,
    builtM2: 210,
    lotM2: 900,
    parking: 2,
    yearBuilt: 2016,
    hoaUsd: 0,
    rentUsd: 1700,
    view: true,
    headline: 'A tropical garden home, west of the city’s rush.',
    description:
      'Wide eaves, a wraparound veranda and 900 m² of garden with mango, avocado and citrus trees. Ciudad Colón keeps a small-town pace, twenty minutes west of Santa Ana on Ruta 27.',
    features: ['Wraparound veranda', 'Fruit trees', 'Mountain views', 'Storage room', 'Well-kept garden irrigation', 'No HOA fees'],
    photos: ['colon-1', 'colon-2', 'colon-3'],
    legal: { title: 'Fully titled property (Folio Real)', folio: '1-455096-000', plano: 'SJ-1587702-2012', zoning: 'Residential', checked: '2026-08-21' },
    advisor: 'mauricio',
    nearby: [
      { name: 'Ciudad Colón center', minutes: 5, kind: 'town' },
      { name: 'University for Peace', minutes: 12, kind: 'school' },
      { name: 'Ruta 27', minutes: 6, kind: 'road' },
      { name: 'Santa Ana center', minutes: 15, kind: 'town' },
      { name: 'Juan Santamaría Airport (SJO)', minutes: 30, kind: 'airport' },
    ],
  },
  {
    slug: 'oficina-lindora',
    title: 'Oficina Lindora 2F',
    type: 'Commercial',
    area: 'Santa Ana',
    district: 'Pozos (Lindora)',
    canton: 'Santa Ana',
    province: 'San José',
    lat: 9.9585,
    lng: -84.1755,
    priceUsd: 390000,
    builtM2: 180,
    parking: 4,
    yearBuilt: 2018,
    hoaUsd: 310,
    rentUsd: 2600,
    headline: 'A turnkey office in Lindora’s business corridor.',
    description:
      'A 180 m² second-floor office with glass partitions, two meeting rooms and a reception area, currently leased to a tech company until 2028. Four parking spots and direct access to Ruta 27.',
    features: ['Leased until 2028', 'Two meeting rooms', 'Reception area', 'Four parking spots', 'Backup generator', 'Fiber internet'],
    photos: ['lindora-1', 'lindora-2'],
    legal: { title: 'Condominium unit, fully titled (Folio Real)', folio: '1-310877-F-000', plano: 'SJ-1966045-2017', zoning: 'Commercial', checked: '2026-09-03' },
    advisor: 'daniela',
    nearby: [
      { name: 'Momentum Lindora', minutes: 2, kind: 'shopping' },
      { name: 'Ruta 27', minutes: 4, kind: 'road' },
      { name: 'Forum business park', minutes: 6, kind: 'work' },
      { name: 'Juan Santamaría Airport (SJO)', minutes: 18, kind: 'airport' },
    ],
  },
  {
    slug: 'finca-san-isidro',
    title: 'Finca San Isidro',
    type: 'Farm',
    area: 'Alajuela',
    district: 'San Isidro',
    canton: 'Alajuela',
    province: 'Alajuela',
    lat: 10.0305,
    lng: -84.1965,
    priceUsd: 410000,
    beds: 2,
    baths: 1,
    builtM2: 120,
    lotM2: 32000,
    parking: 4,
    yearBuilt: 2004,
    hoaUsd: 0,
    view: true,
    headline: '3.2 hectares of pasture, spring water and valley views.',
    description:
      'A working farm on the slopes above Alajuela: fenced pasture, a small coffee plot, a spring with registered water rights and a two-bedroom farmhouse. The upper paddock looks over the whole Central Valley, twenty minutes from the airport.',
    features: ['3.2 hectares', 'Spring with registered water rights', 'Fenced pasture', 'Small coffee plot', 'Two-bedroom farmhouse', 'Internal gravel road'],
    photos: ['san-isidro-1', 'san-isidro-2', 'san-isidro-3'],
    legal: { title: 'Fully titled property (Folio Real)', folio: '2-398124-000', plano: 'A-1405567-2009', zoning: 'Agricultural', checked: '2026-08-25' },
    advisor: 'mauricio',
    buildReady: 'Internal road needs regrading and compaction before the rainy season.',
    nearby: [
      { name: 'Alajuela center', minutes: 15, kind: 'town' },
      { name: 'Juan Santamaría Airport (SJO)', minutes: 20, kind: 'airport' },
      { name: 'Poás Volcano National Park', minutes: 35, kind: 'nature' },
      { name: 'Hospital San Rafael de Alajuela', minutes: 16, kind: 'health' },
    ],
  },
  {
    slug: 'bosque-alto',
    title: 'Bosque Alto Townhomes',
    type: 'Pre-sale',
    area: 'Heredia',
    district: 'San Rafael',
    canton: 'San Rafael',
    province: 'Heredia',
    lat: 10.0135,
    lng: -84.0985,
    priceUsd: 265000,
    priceNote: 'From',
    beds: 3,
    baths: 2.5,
    builtM2: 165,
    lotM2: 190,
    parking: 2,
    yearBuilt: 2027,
    hoaUsd: 140,
    rentUsd: 1500,
    view: true,
    headline: 'Pre-sale: 14 townhomes in the cool air of the Heredia hills.',
    description:
      'Fourteen three-bedroom townhomes on the road to Monte de la Cruz, with a shared garden and forest trail. Pre-sale buyers choose finishes and pay in stages tied to construction milestones. Delivery planned for the third quarter of 2027.',
    features: ['Pre-sale pricing', 'Payments tied to construction milestones', 'Choice of finishes', 'Shared garden and forest trail', 'Cooler mountain climate', 'Delivery Q3 2027'],
    photos: ['bosque-alto-1', 'bosque-alto-2'],
    legal: { title: 'Mother property titled; units to be registered as condominium', folio: '4-160233-000', plano: 'H-2267014-2025', zoning: 'Residential condominium', checked: '2026-09-14' },
    advisor: 'sofia',
    nearby: [
      { name: 'Heredia center', minutes: 12, kind: 'town' },
      { name: 'Monte de la Cruz', minutes: 15, kind: 'nature' },
      { name: 'Universidad Nacional', minutes: 14, kind: 'school' },
      { name: 'Juan Santamaría Airport (SJO)', minutes: 30, kind: 'airport' },
    ],
  },
];

export const bySlug = (slug: string) => properties.find(p => p.slug === slug);

export const RESIDENCY_MIN_USD = 150000;
export const isResidencyEligible = (p: Property) => p.priceUsd >= RESIDENCY_MIN_USD;

export const grossYield = (p: Property) => (p.rentUsd ? (p.rentUsd * 12) / p.priceUsd : undefined);

export const areaList: Area[] = ['Escazú', 'Santa Ana', 'Mora', 'Belén', 'Heredia', 'Alajuela'];
export const typeList: PropertyType[] = ['House', 'Condo', 'Lot', 'Farm', 'Commercial', 'Pre-sale'];
