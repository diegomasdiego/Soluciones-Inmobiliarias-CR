// Company content for the prototype, in English and Spanish. Names, figures and quotes are sample data.
import type { L } from '../lib/i18n';
import type { Area } from './properties';

export const company = {
  name: 'Soluciones Inmobiliarias CR',
  short: 'Soluciones',
  email: 'hola@solucionesinmobiliarias.cr',
  phone: '+506 0000-0000',
  office: { en: 'San Rafael de Escazú, San José, Costa Rica', es: 'San Rafael de Escazú, San José, Costa Rica' } as L,
  hours: { en: 'Mon–Fri 8:00–18:00 · Sat 9:00–13:00 (GMT-6)', es: 'Lun–vie 8:00–18:00 · sáb 9:00–13:00 (GMT-6)' } as L,
  stats: [
    { value: '11', unit: { en: 'years', es: 'años' }, label: { en: 'in the Central Valley', es: 'en el Valle Central' } },
    { value: '180+', unit: { en: '', es: '' }, label: { en: 'closings, homes to farms', es: 'cierres, de casas a fincas' } },
    { value: '100%', unit: { en: '', es: '' }, label: { en: 'of listings title-checked', es: 'de las propiedades con estudio registral' } },
    { value: '6', unit: { en: 'machines', es: 'máquinas' }, label: { en: 'for earthworks and hauling', es: 'para movimiento de tierras y acarreo' } },
  ] as { value: string; unit: L; label: L }[],
  exchangeRate: 505,
};

export type Advisor = { id: string; name: string; role: L; languages: string; initials: string };
export const advisors: Record<string, Advisor> = {
  daniela: { id: 'daniela', name: 'Daniela Rojas', role: { en: 'Homes in Escazú and Santa Ana', es: 'Casas en Escazú y Santa Ana' }, languages: 'English · Español', initials: 'DR' },
  sofia: { id: 'sofia', name: 'Sofía Vargas', role: { en: 'Condos and investors, Heredia and Belén', es: 'Condominios e inversionistas, Heredia y Belén' }, languages: 'English · Español · Português', initials: 'SV' },
  mauricio: { id: 'mauricio', name: 'Mauricio Chaves', role: { en: 'Land, farms and Land & Build', es: 'Lotes, fincas y Land & Build' }, languages: 'Español · English', initials: 'MC' },
};

export type Zone = {
  area: Area[];
  name: L;
  photo: string;
  lat: number;
  lng: number;
  tagline: L;
  body: L;
  pricePerM2: string;
  growth: L;
  toAirport: string;
  estimate?: boolean;
};

// Price ranges for Escazú/Santa Ana and Heredia/Belén come from the 2026 market report the client shared.
// The Alajuela range is an estimate for the prototype.
export const zones: Zone[] = [
  {
    area: ['Escazú'],
    name: { en: 'Escazú', es: 'Escazú' },
    photo: 'zone-escazu',
    lat: 9.9189,
    lng: -84.1398,
    tagline: { en: 'The west’s most established address.', es: 'La dirección más consolidada del oeste.' },
    body: {
      en: 'Hillside homes above the city, international schools and the Avenida Escazú corridor. Prices hold steady and demand from relocating families stays high.',
      es: 'Casas en las laderas sobre la ciudad, colegios internacionales y el corredor de Avenida Escazú. Los precios se mantienen estables y la demanda de familias que se mudan al país sigue alta.',
    },
    pricePerM2: '$1,500–2,500',
    growth: { en: '+4–7% a year', es: '+4–7% al año' },
    toAirport: '20–25 min',
  },
  {
    area: ['Santa Ana', 'Mora'],
    name: { en: 'Santa Ana', es: 'Santa Ana' },
    photo: 'zone-santa-ana',
    lat: 9.9326,
    lng: -84.1826,
    tagline: { en: 'The sunniest valley, and the fastest growing.', es: 'El valle más soleado, y el que más crece.' },
    body: {
      en: 'A drier, warmer microclimate, the Lindora business corridor and direct access to Ruta 27. West toward Ciudad Colón, larger lots and a slower pace.',
      es: 'Un microclima más seco y cálido, el corredor de negocios de Lindora y acceso directo a la Ruta 27. Hacia Ciudad Colón, lotes más grandes y un ritmo más tranquilo.',
    },
    pricePerM2: '$1,500–2,500',
    growth: { en: '+4–7% a year', es: '+4–7% al año' },
    toAirport: '18–22 min',
  },
  {
    area: ['Heredia', 'Belén'],
    name: { en: 'Heredia & Belén', es: 'Heredia y Belén' },
    photo: 'zone-heredia',
    lat: 9.9981,
    lng: -84.1169,
    tagline: { en: 'Coffee country, minutes from the airport.', es: 'Tierra cafetalera, a minutos del aeropuerto.' },
    body: {
      en: 'University town energy, cool mornings in the hills and the free-trade zones of Belén. Strong demand from mid-to-upper income families keeps rentals full.',
      es: 'Ambiente universitario, mañanas frescas en los cerros y las zonas francas de Belén. La demanda de familias de ingresos medios y altos mantiene los alquileres ocupados.',
    },
    pricePerM2: '$1,200–1,800',
    growth: { en: '+5% a year', es: '+5% al año' },
    toAirport: '8–30 min',
  },
  {
    area: ['Alajuela'],
    name: { en: 'Alajuela', es: 'Alajuela' },
    photo: 'zone-alajuela',
    lat: 10.0163,
    lng: -84.2116,
    tagline: { en: 'Space, views and the airport at your door.', es: 'Espacio, vistas y el aeropuerto a la puerta.' },
    body: {
      en: 'Farms and larger lots on the slopes toward Poás, with the whole valley below. The best value per square meter in our coverage area.',
      es: 'Fincas y lotes grandes en las faldas hacia el Poás, con todo el valle a sus pies. El mejor valor por metro cuadrado de nuestra zona de cobertura.',
    },
    pricePerM2: '$900–1,400',
    growth: { en: '+4–6% a year', es: '+4–6% al año' },
    toAirport: '10–25 min',
    estimate: true,
  },
];

export const testimonials: { quote: L; name: string; detail: L }[] = [
  {
    quote: { en: 'They showed us the title study before we even asked. Buying from Texas never felt risky.', es: 'Nos mostraron el estudio registral antes de que lo pidiéramos. Comprar desde Texas nunca se sintió riesgoso.' },
    name: 'Laura and Mike H.',
    detail: { en: 'Relocated from Austin to Escazú', es: 'Se mudaron de Austin a Escazú' },
  },
  {
    quote: { en: 'We bought a lot in Santa Ana, and their own crew cleared it and cut the terrace. One team, one invoice.', es: 'Compramos un lote en Santa Ana y su propio equipo lo limpió y le hizo la terraza. Un solo equipo, una sola factura.' },
    name: 'Andrés S.',
    detail: { en: 'Building his family home in Santa Ana', es: 'Construye la casa de su familia en Santa Ana' },
  },
  {
    quote: { en: 'Their true-cost estimate matched the notary’s final number within a few hundred dollars.', es: 'Su estimación del costo real coincidió con la cifra final del notario por unos pocos cientos de dólares.' },
    name: 'Priya N.',
    detail: { en: 'Investor, two condos in Belén', es: 'Inversionista, dos apartamentos en Belén' },
  },
];

export type Equipment = { id: string; name: L; spec: L; use: L; billing: L; photo: string };
export const equipment: Equipment[] = [
  {
    id: 'excavator', photo: 'eq-excavator',
    name: { en: '20-ton crawler excavator', es: 'Excavadora de oruga de 20 t' },
    spec: { en: 'Bucket 0.9–1.2 m³ · digs to ~6.5 m', es: 'Cucharón de 0,9–1,2 m³ · excava hasta ~6,5 m' },
    use: { en: 'Cuts, terraces, foundations and loading trucks.', es: 'Cortes, terrazas, cimientos y carga de vagonetas.' },
    billing: { en: 'Hourly with operator · 4 h minimum', es: 'Por hora con operador · mínimo 4 h' },
  },
  {
    id: 'mini', photo: 'eq-mini',
    name: { en: '3.5-ton mini excavator', es: 'Miniexcavadora de 3,5 t' },
    spec: { en: '~1.7 m wide · rubber tracks', es: '~1,7 m de ancho · orugas de hule' },
    use: { en: 'Fits through condominium gates: trenches, pipes and tight urban lots.', es: 'Entra por portones de condominio: zanjas, tuberías y lotes urbanos estrechos.' },
    billing: { en: 'Hourly or daily with operator', es: 'Por hora o por día con operador' },
  },
  {
    id: 'backhoe', photo: 'eq-backhoe',
    name: { en: 'Backhoe loader 4×4', es: 'Retroexcavadora (back hoe) 4×4' },
    spec: { en: 'Front bucket ~1 m³ + rear digging arm', es: 'Pala frontal ~1 m³ + brazo excavador trasero' },
    use: { en: 'Trenches, loading material, cleanup and quick jobs.', es: 'Zanjas, carga de material, limpieza y trabajos rápidos.' },
    billing: { en: 'Hourly with operator · 3 h minimum', es: 'Por hora con operador · mínimo 3 h' },
  },
  {
    id: 'dump', photo: 'eq-dump',
    name: { en: '12 m³ dump truck (vagoneta)', es: 'Vagoneta de 12 m³' },
    spec: { en: 'Tandem axle · tipping body', es: 'Doble eje · caja de volteo' },
    use: { en: 'Hauling soil, ballast (lastre), base, sand, gravel and debris.', es: 'Acarreo de tierra, lastre, base, arena, piedra y escombros.' },
    billing: { en: 'Per trip, priced by distance', es: 'Por viaje, según la distancia' },
  },
  {
    id: 'dozer', photo: 'eq-dozer',
    name: { en: 'D6-class crawler dozer', es: 'Tractor de oruga clase D6' },
    spec: { en: 'Blade + rear ripper', es: 'Hoja topadora + ripper trasero' },
    use: { en: 'Clearing, pushing material and opening farm roads.', es: 'Limpieza de terrenos, empuje de material y apertura de caminos en fincas.' },
    billing: { en: 'Hourly with operator · 4 h minimum', es: 'Por hora con operador · mínimo 4 h' },
  },
  {
    id: 'roller', photo: 'eq-roller',
    name: { en: 'Vibratory soil compactor', es: 'Compactadora vibratoria' },
    spec: { en: 'Single drum · 10–12 tons', es: 'Un rodillo · 10–12 t' },
    use: { en: 'Compacting base and sub-base for roads and building pads.', es: 'Compactación de base y sub-base para calles y plataformas.' },
    billing: { en: 'Hourly or daily with operator', es: 'Por hora o por día con operador' },
  },
];

export const buildServices: { title: L; body: L }[] = [
  { title: { en: 'Lot clearing', es: 'Limpieza de lotes' }, body: { en: 'Brush, stumps and debris removed; topsoil stockpiled for your garden.', es: 'Se retiran maleza, troncos y escombros; la capa vegetal se guarda para su jardín.' } },
  { title: { en: 'Cuts, fills and terraces', es: 'Cortes, rellenos y terrazas' }, body: { en: 'Level building pads on sloped lots, shaped to the engineer’s plan.', es: 'Plataformas niveladas en lotes con pendiente, según el plano del ingeniero.' } },
  { title: { en: 'Trenches and drainage', es: 'Zanjas y drenajes' }, body: { en: 'Water, sewer and storm-water lines; French drains and retaining-wall footings.', es: 'Tuberías de agua potable, aguas negras y pluviales; drenajes franceses y cimientos para muros de contención.' } },
  { title: { en: 'Material hauling', es: 'Acarreo de materiales' }, body: { en: 'Lastre, base, sand and gravel delivered by the trip; debris taken to authorized sites.', es: 'Lastre, base, arena y piedra por viaje; escombros a sitios autorizados.' } },
  { title: { en: 'Farm and condo roads', es: 'Caminos en fincas y condominios' }, body: { en: 'Grading, ballast and compaction for internal roads that survive the rainy season.', es: 'Conformación, lastrado y compactación de caminos internos que aguantan la época lluviosa.' } },
  { title: { en: 'Demolition', es: 'Demolición' }, body: { en: 'Small structures demolished and cleared so the lot is ready to sell or build.', es: 'Demolición de estructuras pequeñas y limpieza, para que el lote quede listo para vender o construir.' } },
];

export const buildSteps: { title: L; body: L }[] = [
  { title: { en: 'Site visit', es: 'Visita al sitio' }, body: { en: 'We walk the lot, check access for the machines and review the cadastral plan.', es: 'Recorremos el lote, revisamos el acceso para la maquinaria y el plano catastrado.' } },
  { title: { en: 'Permits', es: 'Permisos' }, body: { en: 'Earthworks may need a municipal permit and, depending on volume and zone, SETENA environmental viability. Large cuts need a soil study and a CFIA engineer.', es: 'El movimiento de tierras puede requerir permiso municipal y, según el volumen y la zona, viabilidad ambiental de SETENA. Los cortes grandes necesitan estudio de suelos y un ingeniero del CFIA.' } },
  { title: { en: 'Clearing', es: 'Limpieza' }, body: { en: 'Brush and debris out; topsoil set aside.', es: 'Se retiran maleza y escombros; se aparta la capa vegetal.' } },
  { title: { en: 'Cuts and fills', es: 'Cortes y rellenos' }, body: { en: 'Excavator and dozer shape the terraces; trucks move the surplus.', es: 'La excavadora y el tractor dan forma a las terrazas; las vagonetas se llevan el material sobrante.' } },
  { title: { en: 'Compaction and drainage', es: 'Compactación y drenaje' }, body: { en: 'The pad is compacted in layers and storm water gets somewhere to go.', es: 'La plataforma se compacta por capas y el agua de lluvia tiene por dónde salir.' } },
  { title: { en: 'Ready to build', es: 'Listo para construir' }, body: { en: 'You get a level, compacted, drained pad and a short report for your builder.', es: 'Usted recibe una plataforma nivelada, compactada y drenada, con un informe corto para su constructor.' } },
];
