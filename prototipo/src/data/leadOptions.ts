// Choices in the request forms. Shared by the forms and the team panel so both use the same labels.
export type InterestId = 'home' | 'land' | 'invest' | 'sell' | 'build' | 'other';

export const interests: { id: InterestId; en: string; es: string }[] = [
  { id: 'home', en: 'Buying a home', es: 'Comprar una casa' },
  { id: 'land', en: 'Buying land or a farm', es: 'Comprar un lote o una finca' },
  { id: 'invest', en: 'Investing / rentals', es: 'Invertir / alquileres' },
  { id: 'sell', en: 'Selling my property', es: 'Vender mi propiedad' },
  { id: 'build', en: 'Land & Build (machinery)', es: 'Land & Build (maquinaria)' },
  { id: 'other', en: 'Something else', es: 'Otra consulta' },
];

export const budgets = [
  { id: 'lt150', en: 'Under $150,000', es: 'Menos de $150.000' },
  { id: '150-300', en: '$150,000 – $300,000', es: '$150.000 – $300.000' },
  { id: '300-500', en: '$300,000 – $500,000', es: '$300.000 – $500.000' },
  { id: 'gt500', en: 'Over $500,000', es: 'Más de $500.000' },
];

export const ways = [
  { id: 'email', en: 'Email', es: 'Correo' },
  { id: 'whatsapp', en: 'WhatsApp', es: 'WhatsApp' },
  { id: 'video', en: 'Video call', es: 'Videollamada' },
];
