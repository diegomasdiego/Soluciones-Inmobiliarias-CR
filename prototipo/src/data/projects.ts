// Projects and pre-sales for the prototype (#projects). All projects, prices, dates and progress are fictitious.
// Payment plans follow a common Costa Rican pre-sale scheme: a reservation, a share at contract signing,
// payments tied to construction milestones and the balance at delivery (usually bank financing).
import type { L, Lang } from '../lib/i18n';
import type { Area } from './properties';

export type ProjectStage = 'launch' | 'construction' | 'delivered';
export type PlanRoom = { name: L; x: number; y: number; w: number; h: number; outdoor?: boolean };
/** Floor plan on a 100 × 60 grid. `floors` labels side-by-side levels. */
export type UnitPlan = { floors?: { label: L; x: number; w: number }[]; rooms: PlanRoom[] };
export type UnitType = {
  id: string;
  name: L;
  beds?: number;
  baths?: number;
  builtM2?: number;
  lotM2?: number;
  /** Lots: frontage and depth in metres. */
  lot?: { front: number; depth: number };
  priceUsd: number;
  units: number;
  available: number;
  plan?: UnitPlan;
  note?: L;
};
/** `pay` is the share of the price due when the milestone is reached. The last milestone is delivery and takes the balance. */
export type Milestone = { name: L; date: string; pay: number };

export type Project = {
  slug: string;
  name: string;
  area: Area;
  district: string;
  canton: string;
  province: 'San José' | 'Heredia' | 'Alajuela';
  lat: number;
  lng: number;
  stage: ProjectStage;
  /** Overall construction progress, 0 to 1. */
  progress: number;
  /** Index of the milestone under way (milestones.length when delivered). */
  current: number;
  /** Month of the last progress report (YYYY-MM). */
  updated: string;
  kind: L;
  tagline: L;
  body: L;
  hero: string;
  photos: string[];
  progressPhoto: string;
  progressNote: L;
  reserveUsd: number;
  signingPct: number;
  milestones: Milestone[];
  types: UnitType[];
  amenities: L[];
  /** Estimated list price at delivery compared with today's pre-sale price. */
  presaleEdge?: number;
  /** Listing in the property search for the same project. */
  propertySlug?: string;
  landAndBuild?: L;
  advisor: string;
  nearby: { name: L; minutes: number }[];
};

const r = (en: string, es: string, x: number, y: number, w: number, h: number, outdoor?: boolean): PlanRoom => ({ name: { en, es }, x, y, w, h, outdoor });
const level1 = { label: { en: 'Level 1', es: 'Planta 1' }, x: 4, w: 44 };
const level2 = { label: { en: 'Level 2', es: 'Planta 2' }, x: 52, w: 44 };

const townhomePlan = (studio = false): UnitPlan => ({
  floors: [level1, level2],
  rooms: [
    r('Living', 'Sala', 4, 8, 24, 20),
    r('Kitchen', 'Cocina', 28, 8, 20, 12),
    r('Dining', 'Comedor', 28, 20, 20, 8),
    r('Garden', 'Jardín', 4, 28, 24, 28, true),
    r('Laundry', 'Pilas', 28, 28, 10, 8),
    r('Half bath', 'Medio baño', 38, 28, 10, 8),
    r('Parking', 'Parqueo', 28, 36, 20, 20, true),
    r('Primary suite', 'Suite principal', 52, 8, 26, 20),
    r('Bath', 'Baño', 78, 8, 18, 10),
    r('Bath 2', 'Baño 2', 78, 18, 18, 10),
    r('Bedroom 2', 'Habitación 2', 52, 28, 22, 18),
    r('Bedroom 3', 'Habitación 3', 74, 28, 22, 18),
    studio ? r('Studio', 'Estudio', 52, 46, 44, 10) : r('Balcony', 'Balcón', 52, 46, 44, 10, true),
  ],
});

const condoPlans: Record<'one' | 'two' | 'three', UnitPlan> = {
  one: {
    rooms: [
      r('Living and dining', 'Sala y comedor', 4, 4, 44, 32),
      r('Kitchen', 'Cocina', 48, 4, 20, 16),
      r('Bath', 'Baño', 48, 20, 20, 16),
      r('Bedroom', 'Habitación', 68, 4, 28, 32),
      r('Balcony', 'Balcón', 4, 36, 44, 20, true),
      r('Laundry', 'Pilas', 48, 36, 20, 20),
      r('Walk-in closet', 'Vestidor', 68, 36, 28, 20),
    ],
  },
  two: {
    rooms: [
      r('Living and dining', 'Sala y comedor', 4, 4, 40, 30),
      r('Kitchen', 'Cocina', 44, 4, 18, 16),
      r('Laundry', 'Pilas', 44, 20, 18, 14),
      r('Primary suite', 'Suite principal', 62, 4, 34, 24),
      r('Primary bath', 'Baño principal', 62, 28, 18, 12),
      r('Bath', 'Baño', 80, 28, 16, 12),
      r('Bedroom 2', 'Habitación 2', 62, 40, 34, 16),
      r('Balcony', 'Balcón', 4, 34, 40, 22, true),
      r('Office nook', 'Rincón de oficina', 44, 34, 18, 22),
    ],
  },
  three: {
    rooms: [
      r('Living and dining', 'Sala y comedor', 4, 4, 36, 30),
      r('Kitchen', 'Cocina', 40, 4, 20, 16),
      r('Laundry', 'Pilas', 40, 20, 20, 14),
      r('Primary suite', 'Suite principal', 60, 4, 36, 22),
      r('Primary bath', 'Baño principal', 60, 26, 16, 12),
      r('Bath', 'Baño', 76, 26, 20, 12),
      r('Bedroom 2', 'Habitación 2', 60, 38, 18, 18),
      r('Bedroom 3', 'Habitación 3', 78, 38, 18, 18),
      r('Balcony', 'Balcón', 4, 34, 36, 22, true),
      r('Guest bath', 'Baño de visitas', 40, 34, 20, 22),
    ],
  },
};

const houseMilestones = (dates: [string, string, string, string, string, string]): Milestone[] => [
  { name: { en: 'Permits and approved plans', es: 'Permisos y planos aprobados' }, date: dates[0], pay: 0 },
  { name: { en: 'Earthworks', es: 'Movimiento de tierras' }, date: dates[1], pay: 0 },
  { name: { en: 'Foundations', es: 'Cimientos' }, date: dates[2], pay: 0.05 },
  { name: { en: 'Structure and roof', es: 'Obra gris y techo' }, date: dates[3], pay: 0.1 },
  { name: { en: 'Finishes', es: 'Acabados' }, date: dates[4], pay: 0.05 },
  { name: { en: 'Delivery and registration', es: 'Entrega e inscripción' }, date: dates[5], pay: 0 },
];

export const projects: Project[] = [
  {
    slug: 'terrazas-san-antonio',
    name: 'Terrazas de San Antonio',
    area: 'Escazú',
    district: 'San Antonio',
    canton: 'Escazú',
    province: 'San José',
    lat: 9.9035,
    lng: -84.1335,
    stage: 'construction',
    progress: 0.72,
    current: 4,
    updated: '2026-10',
    kind: { en: '8 townhouses with rooftop terraces', es: '8 casas con terraza en la azotea' },
    tagline: { en: 'Eight homes, one private street, the whole valley from the roof.', es: 'Ocho casas, una calle privada y todo el valle desde la azotea.' },
    body: {
      en: 'Three-level townhouses on the hillside of San Antonio de Escazú, each with a private rooftop terrace facing the Central Valley. The structure is finished and the homes are in the finishing stage: buyers who sign now still choose floors, kitchen and paint.',
      es: 'Casas de tres niveles en la ladera de San Antonio de Escazú, cada una con terraza privada en la azotea frente al Valle Central. La obra gris está terminada y las casas están en acabados: quien firme ahora todavía escoge pisos, cocina y pintura.',
    },
    hero: 'proj-terraces',
    photos: ['proj-terraces', 'proj-tropical-house', 'proj-model-living', 'proj-structure'],
    progressPhoto: 'proj-structure',
    progressNote: {
      en: 'October: structure and roofs finished on all eight homes; windows and tiling under way on houses 1 to 4.',
      es: 'Octubre: obra gris y techos terminados en las ocho casas; ventanería y enchape en curso en las casas 1 a 4.',
    },
    reserveUsd: 5000,
    signingPct: 0.1,
    milestones: houseMilestones(['2025-03', '2025-06', '2025-09', '2026-06', '2027-01', '2027-03']),
    types: [
      {
        id: 'rooftop',
        name: { en: 'Rooftop townhouse', es: 'Casa con azotea' },
        beds: 3, baths: 3.5, builtM2: 214, lotM2: 180,
        priceUsd: 415000, units: 6, available: 2,
        plan: townhomePlan(),
        note: { en: 'Plus a 58 m² private rooftop terrace on level 3.', es: 'Más una terraza privada de 58 m² en la azotea (nivel 3).' },
      },
      {
        id: 'rooftop-studio',
        name: { en: 'Rooftop townhouse + studio', es: 'Casa con azotea + estudio' },
        beds: 3, baths: 3.5, builtM2: 246, lotM2: 205,
        priceUsd: 468000, units: 2, available: 1,
        plan: townhomePlan(true),
        note: { en: 'End units with a studio for remote work and a 64 m² rooftop terrace.', es: 'Casas esquineras con estudio para teletrabajo y terraza de 64 m² en la azotea.' },
      },
    ],
    amenities: [
      { en: 'Private rooftop terrace with valley views', es: 'Terraza privada en la azotea con vista al valle' },
      { en: 'Two-car garage', es: 'Cochera para dos carros' },
      { en: 'Solar water heating', es: 'Calentador de agua solar' },
      { en: 'Gated private street, 8 homes only', es: 'Calle privada con portón, solo 8 casas' },
      { en: 'Fibre optic internet', es: 'Internet por fibra óptica' },
    ],
    presaleEdge: 0.05,
    advisor: 'daniela',
    nearby: [
      { name: { en: 'Escazú center', es: 'Centro de Escazú' }, minutes: 6 },
      { name: { en: 'Country Day School', es: 'Country Day School' }, minutes: 10 },
      { name: { en: 'Multiplaza Escazú', es: 'Multiplaza Escazú' }, minutes: 12 },
      { name: { en: 'Hospital CIMA', es: 'Hospital CIMA' }, minutes: 14 },
      { name: { en: 'Juan Santamaría Airport (SJO)', es: 'Aeropuerto Juan Santamaría (SJO)' }, minutes: 25 },
    ],
  },
  {
    slug: 'bosque-alto',
    name: 'Bosque Alto Townhomes',
    area: 'Heredia',
    district: 'San Rafael',
    canton: 'San Rafael',
    province: 'Heredia',
    lat: 10.0135,
    lng: -84.0985,
    stage: 'construction',
    progress: 0.38,
    current: 3,
    updated: '2026-10',
    kind: { en: '14 townhomes', es: '14 casas en condominio' },
    tagline: { en: 'Cool mountain air, a forest trail and payments that follow the build.', es: 'Aire fresco de montaña, un sendero en el bosque y pagos que siguen la obra.' },
    body: {
      en: 'Fourteen three-bedroom townhomes on the road to Monte de la Cruz, with a shared garden and a private forest trail. Foundations are finished and the structure is going up; pre-sale buyers still choose their finishes.',
      es: 'Catorce casas de tres habitaciones camino a Monte de la Cruz, con jardín común y sendero privado en el bosque. Los cimientos están terminados y la obra gris avanza; quien compra en preventa todavía escoge los acabados.',
    },
    hero: 'bosque-alto-1',
    photos: ['bosque-alto-1', 'bosque-alto-2', 'proj-model-living', 'proj-crew'],
    progressPhoto: 'proj-crew',
    progressNote: {
      en: 'October: block walls of level 1 finished on ten homes; level 2 slab poured on houses 1 to 6.',
      es: 'Octubre: paredes de la planta 1 terminadas en diez casas; losa de la planta 2 chorreada en las casas 1 a 6.',
    },
    reserveUsd: 3000,
    signingPct: 0.1,
    milestones: houseMilestones(['2025-11', '2026-02', '2026-05', '2026-12', '2027-05', '2027-09']),
    types: [
      {
        id: 'middle',
        name: { en: 'Townhome B · middle unit', es: 'Casa B · central' },
        beds: 3, baths: 2.5, builtM2: 165, lotM2: 190,
        priceUsd: 265000, units: 10, available: 5,
        plan: townhomePlan(),
      },
      {
        id: 'end',
        name: { en: 'Townhome A · end unit', es: 'Casa A · esquinera' },
        beds: 3, baths: 2.5, builtM2: 178, lotM2: 230,
        priceUsd: 279000, units: 4, available: 1,
        plan: townhomePlan(true),
        note: { en: 'Side garden and an extra studio upstairs.', es: 'Jardín lateral y un estudio adicional en la planta alta.' },
      },
    ],
    amenities: [
      { en: 'Private forest trail', es: 'Sendero privado en el bosque' },
      { en: 'Shared garden and playground', es: 'Jardín común y área de juegos' },
      { en: 'Gated entry with 24-hour security', es: 'Acceso controlado con seguridad 24 horas' },
      { en: 'Two parking spaces per home', es: 'Dos parqueos por casa' },
      { en: 'Cooler mountain climate', es: 'Clima fresco de montaña' },
    ],
    presaleEdge: 0.08,
    propertySlug: 'bosque-alto',
    advisor: 'sofia',
    nearby: [
      { name: { en: 'Heredia center', es: 'Centro de Heredia' }, minutes: 12 },
      { name: { en: 'Monte de la Cruz', es: 'Monte de la Cruz' }, minutes: 15 },
      { name: { en: 'Universidad Nacional', es: 'Universidad Nacional' }, minutes: 14 },
      { name: { en: 'Juan Santamaría Airport (SJO)', es: 'Aeropuerto Juan Santamaría (SJO)' }, minutes: 30 },
    ],
  },
  {
    slug: 'palmar-de-lindora',
    name: 'Palmar de Lindora',
    area: 'Santa Ana',
    district: 'Pozos',
    canton: 'Santa Ana',
    province: 'San José',
    lat: 9.9545,
    lng: -84.1885,
    stage: 'launch',
    progress: 0.12,
    current: 2,
    updated: '2026-10',
    kind: { en: '36 apartments in two buildings', es: '36 apartamentos en dos edificios' },
    tagline: { en: 'Launch prices, a walkable address and payments spread over two years.', es: 'Precios de lanzamiento, todo a pie y pagos repartidos en dos años.' },
    body: {
      en: 'Thirty-six apartments in two four-storey buildings around a garden and pool, a short walk from the shops and offices of Lindora. Launch prices apply to the first units sold. Earthworks were done by our own Land & Build crew and foundations start in January.',
      es: 'Treinta y seis apartamentos en dos edificios de cuatro pisos alrededor de un jardín con piscina, a pocos pasos de los comercios y oficinas de Lindora. Los precios de lanzamiento aplican a las primeras unidades vendidas. El movimiento de tierras lo hizo nuestro propio equipo de Land & Build y los cimientos empiezan en enero.',
    },
    hero: 'proj-condo-palms',
    photos: ['proj-condo-palms', 'proj-pool', 'proj-model-living', 'proj-foundation'],
    progressPhoto: 'proj-foundation',
    progressNote: {
      en: 'October: site terraced and compacted; foundation formwork for building A begins in January.',
      es: 'Octubre: terreno aterrazado y compactado; la formaleta de los cimientos del edificio A empieza en enero.',
    },
    reserveUsd: 2000,
    signingPct: 0.1,
    milestones: houseMilestones(['2026-06', '2026-09', '2027-01', '2027-09', '2028-04', '2028-08']),
    types: [
      { id: 'one', name: { en: 'One bedroom', es: 'Una habitación' }, beds: 1, baths: 1, builtM2: 62, priceUsd: 158000, units: 12, available: 9, plan: condoPlans.one },
      { id: 'two', name: { en: 'Two bedrooms', es: 'Dos habitaciones' }, beds: 2, baths: 2, builtM2: 89, priceUsd: 219000, units: 16, available: 11, plan: condoPlans.two },
      { id: 'three', name: { en: 'Three bedrooms', es: 'Tres habitaciones' }, beds: 3, baths: 2.5, builtM2: 121, priceUsd: 289000, units: 8, available: 6, plan: condoPlans.three },
    ],
    amenities: [
      { en: 'Pool and garden', es: 'Piscina y jardín' },
      { en: 'Gym and coworking room', es: 'Gimnasio y sala de coworking' },
      { en: 'Rooftop lounge facing the Escazú hills', es: 'Terraza común en la azotea frente a los cerros de Escazú' },
      { en: 'Pet park', es: 'Parque para mascotas' },
      { en: 'Bike parking and EV-ready spaces', es: 'Parqueo de bicicletas y espacios listos para carga eléctrica' },
    ],
    presaleEdge: 0.12,
    landAndBuild: {
      en: 'Earthworks and terracing on this site were done by our Land & Build machines and crew.',
      es: 'El movimiento de tierras y las terrazas de este terreno los hicieron nuestras máquinas y operadores de Land & Build.',
    },
    advisor: 'daniela',
    nearby: [
      { name: { en: 'Lindora shops and restaurants', es: 'Comercios y restaurantes de Lindora' }, minutes: 3 },
      { name: { en: 'Forum business park', es: 'Parque empresarial Forum' }, minutes: 5 },
      { name: { en: 'Route 27', es: 'Ruta 27' }, minutes: 4 },
      { name: { en: 'Escazú center', es: 'Centro de Escazú' }, minutes: 12 },
      { name: { en: 'Juan Santamaría Airport (SJO)', es: 'Aeropuerto Juan Santamaría (SJO)' }, minutes: 25 },
    ],
  },
  {
    slug: 'hacienda-la-guacima',
    name: 'Hacienda La Guácima',
    area: 'Alajuela',
    district: 'La Guácima',
    canton: 'Alajuela',
    province: 'Alajuela',
    lat: 9.9645,
    lng: -84.2545,
    stage: 'construction',
    progress: 0.64,
    current: 3,
    updated: '2026-10',
    kind: { en: '42 lots in a gated community', es: '42 lotes en condominio' },
    tagline: { en: 'Your own lot, paved streets and services underground, 12 minutes from the airport.', es: 'Su propio lote, calles pavimentadas y servicios subterráneos, a 12 minutos del aeropuerto.' },
    body: {
      en: 'Forty-two residential lots from 360 to 720 m² in a gated community with a clubhouse, pool and park. Streets and storm drains are done; water and underground power are being installed. Lots are delivered registered, with their own folio real, so you can build when you are ready, or let our Land & Build team prepare the ground.',
      es: 'Cuarenta y dos lotes residenciales de 360 a 720 m² en un condominio con casa club, piscina y parque. Las calles y los pluviales están listos; se instalan el agua y la electricidad subterránea. Los lotes se entregan inscritos, con su propio folio real, para construir cuando usted quiera o dejar que nuestro equipo de Land & Build prepare el terreno.',
    },
    hero: 'proj-community-aerial',
    photos: ['proj-community-aerial', 'proj-new-street', 'proj-pool', 'proj-hillside-house'],
    progressPhoto: 'proj-new-street',
    progressNote: {
      en: 'October: all streets paved with storm drains; water mains 70% laid; power conduits under way.',
      es: 'Octubre: todas las calles pavimentadas con pluviales; tubería de agua al 70%; ductos eléctricos en curso.',
    },
    reserveUsd: 2000,
    signingPct: 0.2,
    milestones: [
      { name: { en: 'Permits and approved plans', es: 'Permisos y planos aprobados' }, date: '2025-10', pay: 0 },
      { name: { en: 'Earthworks', es: 'Movimiento de tierras' }, date: '2026-03', pay: 0 },
      { name: { en: 'Streets and storm drains', es: 'Calles y pluviales' }, date: '2026-08', pay: 0.1 },
      { name: { en: 'Water and underground power', es: 'Agua y electricidad subterránea' }, date: '2026-12', pay: 0.1 },
      { name: { en: 'Clubhouse, pool and park', es: 'Casa club, piscina y parque' }, date: '2027-03', pay: 0.1 },
      { name: { en: 'Delivery of registered lots', es: 'Entrega de lotes inscritos' }, date: '2027-05', pay: 0 },
    ],
    types: [
      { id: 'standard', name: { en: 'Standard lot', es: 'Lote estándar' }, lotM2: 384, lot: { front: 12, depth: 32 }, priceUsd: 64000, units: 26, available: 14 },
      { id: 'corner', name: { en: 'Corner lot', es: 'Lote esquinero' }, lotM2: 480, lot: { front: 16, depth: 30 }, priceUsd: 86000, units: 10, available: 4 },
      {
        id: 'view', name: { en: 'View lot', es: 'Lote con vista' }, lotM2: 650, lot: { front: 20, depth: 32.5 }, priceUsd: 118000, units: 6, available: 2,
        note: { en: 'Edge of the property, facing the Poás and Barva volcanoes.', es: 'En el borde de la propiedad, frente a los volcanes Poás y Barva.' },
      },
    ],
    amenities: [
      { en: 'Gated entry with 24-hour security', es: 'Acceso controlado con seguridad 24 horas' },
      { en: 'Clubhouse with pool', es: 'Casa club con piscina' },
      { en: 'Park and playground', es: 'Parque y área de juegos' },
      { en: 'Underground power and fibre', es: 'Electricidad y fibra subterráneas' },
      { en: 'Paved streets with storm drains', es: 'Calles pavimentadas con pluviales' },
    ],
    presaleEdge: 0.1,
    landAndBuild: {
      en: 'Land & Build can level your lot, build retaining walls and leave it ready for the foundation as soon as it is delivered.',
      es: 'Land & Build puede nivelar su lote, hacer muros de contención y dejarlo listo para los cimientos apenas se lo entreguen.',
    },
    advisor: 'mauricio',
    nearby: [
      { name: { en: 'Juan Santamaría Airport (SJO)', es: 'Aeropuerto Juan Santamaría (SJO)' }, minutes: 12 },
      { name: { en: 'Coyol free-trade zone', es: 'Zona franca El Coyol' }, minutes: 12 },
      { name: { en: 'Route 27', es: 'Ruta 27' }, minutes: 10 },
      { name: { en: 'Alajuela center', es: 'Centro de Alajuela' }, minutes: 15 },
    ],
  },
  {
    slug: 'jardines-la-asuncion',
    name: 'Jardines de La Asunción',
    area: 'Belén',
    district: 'La Asunción',
    canton: 'Belén',
    province: 'Heredia',
    lat: 9.9805,
    lng: -84.1755,
    stage: 'delivered',
    progress: 1,
    current: 6,
    updated: '2025-08',
    kind: { en: '10 houses, delivered and sold', es: '10 casas, entregadas y vendidas' },
    tagline: { en: 'Delivered on time in August 2025. All ten homes sold.', es: 'Entregado a tiempo en agosto de 2025. Las diez casas vendidas.' },
    body: {
      en: 'Ten two-level houses with gardens in La Asunción de Belén, ten minutes from the airport and the free-trade zones. Sold out during construction and delivered on the planned date, with every home registered to its owner.',
      es: 'Diez casas de dos plantas con jardín en La Asunción de Belén, a diez minutos del aeropuerto y de las zonas francas. Se vendieron durante la construcción y se entregaron en la fecha prevista, con cada casa inscrita a nombre de su dueño.',
    },
    hero: 'proj-hillside-house',
    photos: ['proj-hillside-house', 'proj-tropical-house', 'proj-model-living'],
    progressPhoto: 'proj-hillside-house',
    progressNote: { en: 'August 2025: all ten homes delivered and registered.', es: 'Agosto de 2025: las diez casas entregadas e inscritas.' },
    reserveUsd: 3000,
    signingPct: 0.1,
    milestones: houseMilestones(['2023-09', '2023-12', '2024-03', '2024-10', '2025-05', '2025-08']),
    types: [
      { id: 'house', name: { en: 'Garden house', es: 'Casa con jardín' }, beds: 3, baths: 2.5, builtM2: 180, lotM2: 220, priceUsd: 338000, units: 10, available: 0, plan: townhomePlan() },
    ],
    amenities: [
      { en: 'Private garden', es: 'Jardín privado' },
      { en: 'Gated entry', es: 'Acceso controlado' },
      { en: 'Solar panels on every roof', es: 'Paneles solares en cada techo' },
    ],
    advisor: 'sofia',
    nearby: [
      { name: { en: 'Belén center', es: 'Centro de Belén' }, minutes: 4 },
      { name: { en: 'Free-trade zones', es: 'Zonas francas' }, minutes: 6 },
      { name: { en: 'Real Cariari mall', es: 'Centro comercial Real Cariari' }, minutes: 8 },
      { name: { en: 'Juan Santamaría Airport (SJO)', es: 'Aeropuerto Juan Santamaría (SJO)' }, minutes: 10 },
    ],
  },
];

export const projectBySlug = (slug: string) => projects.find(p => p.slug === slug);
export const projectForProperty = (propertySlug: string) => projects.find(p => p.propertySlug === propertySlug);

export const stageLabel: Record<ProjectStage, L> = {
  launch: { en: 'Pre-sale launch', es: 'Preventa de lanzamiento' },
  construction: { en: 'Under construction', es: 'En construcción' },
  delivered: { en: 'Delivered', es: 'Entregado' },
};

export const priceFrom = (p: Project) => Math.min(...p.types.map(t => t.priceUsd));
export const unitsTotal = (p: Project) => p.types.reduce((s, t) => s + t.units, 0);
export const unitsAvailable = (p: Project) => p.types.reduce((s, t) => s + t.available, 0);
export const deliveryDate = (p: Project) => p.milestones[p.milestones.length - 1].date;

const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthsEs = ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sept.', 'oct.', 'nov.', 'dic.'];
const roman = ['I', 'II', 'III', 'IV'];

/** "Mar 2027" / "mar. 2027" */
export function monthYear(ym: string, lang: Lang) {
  const [y, m] = ym.split('-').map(Number);
  return `${(lang === 'es' ? monthsEs : monthsEn)[m - 1]} ${y}`;
}
/** "Q3 2027" / "III trim. 2027" */
export function quarter(ym: string, lang: Lang) {
  const [y, m] = ym.split('-').map(Number);
  const q = Math.floor((m - 1) / 3);
  return lang === 'es' ? `${roman[q]} trim. ${y}` : `Q${q + 1} ${y}`;
}

export type PaymentRow = {
  kind: 'reserve' | 'signing' | 'milestone' | 'delivery';
  label: L;
  /** YYYY-MM, or undefined for "today" / "within 30 days". */
  date?: string;
  share: number;
  amount: number;
  /** Milestones already reached that are paid at signing. */
  catchUp?: number;
};

/**
 * Payment schedule for a unit at today's progress. Milestones the project has already passed
 * are paid together with the contract, so late buyers catch up with early ones.
 */
export function paymentPlan(p: Project, price: number): PaymentRow[] {
  const last = p.milestones.length - 1;
  const during = p.milestones.slice(0, last);
  const balance = 1 - p.signingPct - during.reduce((s, m) => s + m.pay, 0);
  const catchUp = during.reduce((s, m, i) => (i < p.current ? s + m.pay : s), 0);
  const reserveShare = p.reserveUsd / price;
  const rows: PaymentRow[] = [
    { kind: 'reserve', label: { en: 'Reservation', es: 'Reserva' }, share: reserveShare, amount: p.reserveUsd },
    {
      kind: 'signing',
      label: { en: 'Purchase contract', es: 'Contrato de compraventa' },
      share: p.signingPct + catchUp - reserveShare,
      amount: (p.signingPct + catchUp) * price - p.reserveUsd,
      catchUp: catchUp || undefined,
    },
  ];
  during.forEach((m, i) => {
    if (i >= p.current && m.pay > 0) rows.push({ kind: 'milestone', label: m.name, date: m.date, share: m.pay, amount: m.pay * price });
  });
  rows.push({ kind: 'delivery', label: p.milestones[last].name, date: p.milestones[last].date, share: balance, amount: balance * price });
  return rows;
}
