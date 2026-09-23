// Spanish text for the sample listings. Keys are property slugs; anything not listed stays as in properties.ts.
import type { Lang } from '../lib/i18n';
import type { Property, PropertyType } from './properties';

type EsText = { headline: string; description: string; features: string[]; legalTitle: string; zoning: string; buildReady?: string };

const titled = 'Propiedad inscrita, con folio real';
const condoUnit = 'Filial de condominio inscrita, con folio real';

const es: Record<string, EsText> = {
  'los-laureles': {
    headline: 'Madera, piedra y una vista a todo el valle.',
    description: 'Una casa de tres habitaciones en una loma tranquila de San Rafael de Escazú, a diez minutos de Avenida Escazú. Los ventanales de piso a techo abren la sala a una terraza techada y a un jardín de plantas nativas. La suite principal tiene su propia terraza, y una oficina independiente permite trabajar a distancia con otros husos horarios.',
    features: ['Condominio cerrado con seguridad 24/7', 'Vista al valle y a las montañas', 'Terraza techada', 'Oficina en casa', 'Calentador solar de agua', 'Internet de fibra (1 Gbps)', 'Cochera para dos carros', 'Jardín de plantas nativas'],
    legalTitle: titled,
    zoning: 'Residencial, baja densidad',
  },
  'altos-de-pozos': {
    headline: 'Una casa con piscina en el lado soleado de Santa Ana.',
    description: 'Todo en una sola planta, alrededor de una piscina de 10 metros y un zacate que recibe el sol de la tarde por el que Santa Ana es conocida. La sala, la cocina y el deck de la piscina forman un solo espacio; las cuatro habitaciones quedan en el lado tranquilo de la casa. A cinco minutos de los restaurantes y clínicas de Lindora y de la Ruta 27.',
    features: ['Piscina de agua salada de 10 m', 'Todo en una planta', 'Cuatro habitaciones con baño propio', 'Cocina exterior', 'Tanque de agua de respaldo', 'Cargador para carro eléctrico', 'Iluminación inteligente'],
    legalTitle: titled,
    zoning: 'Residencial',
  },
  'guachipelin-residences': {
    headline: 'Cierre con llave y viaje tranquilo, a tres minutos de la Ruta 27.',
    description: 'Apartamento esquinero en el quinto piso, con balcón de vidrio hacia los cerros de Escazú. El edificio tiene piscina, gimnasio, sala de coworking y seguridad 24/7, así que funciona como primer hogar en Costa Rica o como alquiler amueblado mientras usted está fuera.',
    features: ['Unidad esquinera, 5.º piso', 'Balcón de vidrio', 'Piscina, gimnasio y coworking', 'Seguridad 24/7', 'Dos parqueos techados', 'Bodega', 'Edificio que acepta mascotas'],
    legalTitle: condoUnit,
    zoning: 'Uso mixto',
  },
  'casa-san-pablo': {
    headline: 'Una casa familiar en tierra cafetalera, cerca de todo.',
    description: 'Una casa de una planta, llena de luz, en una calle cerrada de San Pablo de Heredia. Sala y cocina abiertas, pila techada y un jardín trasero con espacio para juegos. Las escuelas, la universidad y el centro de Heredia quedan a menos de diez minutos.',
    features: ['Calle cerrada', 'Una sola planta', 'Jardín trasero', 'Pila techada', 'Parqueo para dos carros', 'Calentador y tanque de agua de respaldo'],
    legalTitle: titled,
    zoning: 'Residencial',
  },
  'casa-cariari': {
    headline: 'Vidrio, luz y jardín, a doce minutos del aeropuerto.',
    description: 'Una casa contemporánea de dos niveles en Ciudad Cariari, con vidrio a doble altura en toda la sala. La cocina abre a una terraza con jardín; arriba, cuatro habitaciones comparten una sala familiar. Una gran opción para familias que viajan seguido.',
    features: ['Sala a doble altura', 'Terraza con jardín', 'Sala familiar', 'Walk-in closets', 'Cámaras de seguridad', 'Cerca del Cariari Country Club'],
    legalTitle: titled,
    zoning: 'Residencial',
  },
  'belen-urban': {
    headline: 'Un apartamento que se alquila solo, a ocho minutos del SJO.',
    description: 'Apartamento amueblado de una habitación en un edificio nuevo junto a las zonas francas, muy buscado por ingenieros, tripulaciones y consultores con contratos de 6 a 12 meses. Piscina en la azotea, coworking y parqueo para bicicletas.',
    features: ['Se vende amueblado', 'Piscina en la azotea', 'Espacio de coworking', 'Parqueo para bicicletas', 'Reglamento que permite alquilar', 'Un parqueo'],
    legalTitle: condoUnit,
    zoning: 'Uso mixto',
  },
  'lote-rio-oro': {
    headline: 'Construya su propia casa en 1.050 m² con vista abierta al oeste.',
    description: 'Lote residencial de pendiente suave, con agua y electricidad a la orilla de la propiedad y certificado de uso de suelo municipal para vivienda unifamiliar. Parte del lote ya está limpia. Nuestro equipo de Land & Build puede hacerle las terrazas y preparar la plataforma de construcción.',
    features: ['Lote de 1.050 m²', 'Agua y luz a la orilla', 'Uso de suelo residencial', 'Parcialmente limpio', 'Pendiente suave (cerca de 8%)', 'Acceso por calle asfaltada'],
    legalTitle: titled,
    zoning: 'Residencial unifamiliar',
    buildReady: 'Necesita una limpieza ligera y un corte para terraza antes de construir.',
  },
  'casa-ciudad-colon': {
    headline: 'Una casa con jardín tropical, lejos del corre-corre de la ciudad.',
    description: 'Aleros anchos, un corredor alrededor de la casa y 900 m² de jardín con árboles de mango, aguacate y cítricos. Ciudad Colón conserva el ritmo de pueblo, veinte minutos al oeste de Santa Ana por la Ruta 27.',
    features: ['Corredor alrededor de la casa', 'Árboles frutales', 'Vista a las montañas', 'Bodega', 'Riego del jardín en buen estado', 'Sin cuota de condominio'],
    legalTitle: titled,
    zoning: 'Residencial',
  },
  'oficina-lindora': {
    headline: 'Una oficina lista para usar en el corredor de negocios de Lindora.',
    description: 'Oficina de 180 m² en segundo piso, con divisiones de vidrio, dos salas de reuniones y recepción, alquilada a una empresa de tecnología hasta 2028. Cuatro parqueos y acceso directo a la Ruta 27.',
    features: ['Alquilada hasta 2028', 'Dos salas de reuniones', 'Recepción', 'Cuatro parqueos', 'Planta eléctrica de respaldo', 'Internet de fibra'],
    legalTitle: condoUnit,
    zoning: 'Comercial',
  },
  'finca-san-isidro': {
    headline: '3,2 hectáreas de potrero, naciente de agua y vista al valle.',
    description: 'Una finca productiva en las faldas sobre Alajuela: potreros cercados, un pequeño cafetal, una naciente con concesión de agua inscrita y una casa de campo de dos habitaciones. Desde el potrero de arriba se ve todo el Valle Central, a veinte minutos del aeropuerto.',
    features: ['3,2 hectáreas', 'Naciente con concesión de agua', 'Potreros cercados', 'Pequeño cafetal', 'Casa de campo de dos habitaciones', 'Camino interno de lastre'],
    legalTitle: titled,
    zoning: 'Agrícola',
    buildReady: 'El camino interno necesita reconformación y compactación antes de la época lluviosa.',
  },
  'bosque-alto': {
    headline: 'Preventa: 14 casas en condominio con el aire fresco de los cerros de Heredia.',
    description: 'Catorce casas de tres habitaciones camino a Monte de la Cruz, con jardín común y sendero en el bosque. Quienes compran en preventa escogen los acabados y pagan por etapas ligadas al avance de obra. Entrega prevista para el tercer trimestre de 2027.',
    features: ['Precio de preventa', 'Pagos ligados al avance de obra', 'Acabados a escoger', 'Jardín común y sendero en el bosque', 'Clima fresco de montaña', 'Entrega: III trimestre de 2027'],
    legalTitle: 'Finca madre inscrita; las unidades se inscribirán como filiales de condominio',
    zoning: 'Condominio residencial',
  },
};

const nearbyEs: Record<string, string> = {
  'Juan Santamaría Airport (SJO)': 'Aeropuerto Juan Santamaría (SJO)',
  'Heredia center': 'Centro de Heredia',
  'Santa Ana center': 'Centro de Santa Ana',
  'Ciudad Colón center': 'Centro de Ciudad Colón',
  'Alajuela center': 'Centro de Alajuela',
  'Free-trade zones': 'Zonas francas',
  'University for Peace': 'Universidad para la Paz',
  'Poás Volcano National Park': 'Parque Nacional Volcán Poás',
  'Real Cariari mall': 'Centro comercial Real Cariari',
  'Forum business park': 'Parque empresarial Forum',
};

const roomEs: Record<string, string> = {
  Living: 'Sala', Kitchen: 'Cocina', Dining: 'Comedor', Terrace: 'Terraza', 'Primary suite': 'Suite principal',
  Bath: 'Baño', Office: 'Oficina', 'Bedroom 2': 'Habitación 2', 'Bedroom 3': 'Habitación 3', 'Bedroom 4': 'Habitación 4',
  Garden: 'Jardín', 'Great room': 'Sala principal', Pantry: 'Despensa', Laundry: 'Cuarto de pilas', 'Pool deck': 'Deck de piscina',
  'Living room': 'Sala', Bathroom: 'Baño', 'View from the terrace': 'Vista desde la terraza', 'Primary bath': 'Baño principal', 'Pool and garden': 'Piscina y jardín',
  '10 × 4 m pool': 'piscina de 10 × 4 m',
};

const typeNames: Record<PropertyType, { en: [string, string]; es: [string, string] }> = {
  House: { en: ['House', 'Houses'], es: ['Casa', 'Casas'] },
  Condo: { en: ['Condo', 'Condos'], es: ['Condominio', 'Condominios'] },
  Lot: { en: ['Lot', 'Lots'], es: ['Lote', 'Lotes'] },
  Farm: { en: ['Farm', 'Farms'], es: ['Finca', 'Fincas'] },
  Commercial: { en: ['Commercial', 'Commercial'], es: ['Comercial', 'Comerciales'] },
  'Pre-sale': { en: ['Pre-sale', 'Pre-sale'], es: ['Preventa', 'Preventas'] },
};

export const typeLabel = (t: PropertyType, lang: Lang, plural = false) => typeNames[t][lang][plural ? 1 : 0];
export const nearbyName = (name: string, lang: Lang) => (lang === 'es' ? nearbyEs[name] ?? name : name);
export const roomName = (name: string, lang: Lang) => (lang === 'es' ? roomEs[name] ?? name : name);

/** A copy of the property with its text fields in the requested language. */
export function localize(p: Property, lang: Lang): Property {
  if (lang === 'en') return p;
  const t = es[p.slug];
  return {
    ...p,
    priceNote: p.priceNote ? 'Desde' : undefined,
    headline: t?.headline ?? p.headline,
    description: t?.description ?? p.description,
    features: t?.features ?? p.features,
    buildReady: t?.buildReady ?? p.buildReady,
    legal: { ...p.legal, title: t?.legalTitle ?? p.legal.title, zoning: t?.zoning ?? p.legal.zoning },
    nearby: p.nearby.map(n => ({ ...n, name: nearbyName(n.name, lang) })),
  };
}
