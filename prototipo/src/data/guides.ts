// Buyer guides (#guides, #guide-<slug>), in English and Spanish.
// Based on the client's market report (Bienes Raíces en Costa Rica.pdf) and checked against official
// sources on 14 November 2026. Where the report was out of date, the official source wins:
//  - Law 9996 tax incentives could only be requested until 14 July 2026 (art. 12).
//  - The 2% withholding for domiciled sellers was repealed by MH-DGT-RES-0051-2025; only the 2.5%
//    withholding for non-domiciled sellers remains (Law 7092, art. 28 ter).
// General information, not legal or tax advice. Pending the lawyer's review (COD-9).
// Text supports **bold** and nothing else.
import type { L } from '../lib/i18n';

export type Block =
  | { t: 'p'; text: L }
  | { t: 'list'; items: L[]; ordered?: boolean }
  | { t: 'callout'; tone: 'tip' | 'warn'; title: L; text: L }
  | { t: 'table'; caption: L; head: L[]; rows: L[][] }
  | { t: 'widget'; id: 'timeline' | 'zmt' | 'residency' | 'holding' | 'calculator' };

export type Section = { id: string; title: L; blocks: Block[] };
export type Source = { label: string; url?: string };
export type GuideIcon = 'steps' | 'coast' | 'passport' | 'tax';

export type Guide = {
  slug: string;
  icon: GuideIcon;
  title: L;
  short: L;
  description: L;
  topics: L[];
  minutes: number;
  updated: string;
  sections: Section[];
  faq: { q: L; a: L }[];
  sources: Source[];
};

const e = (en: string, es: string): L => ({ en, es });
const p = (en: string, es: string): Block => ({ t: 'p', text: e(en, es) });

export const GUIDES_UPDATED = '2026-11-14';

export const guides: Guide[] = [
  {
    slug: 'buying-process',
    icon: 'steps',
    title: e('How to buy property in Costa Rica, step by step', 'Cómo comprar una propiedad en Costa Rica, paso a paso'),
    short: e('Buying, step by step', 'Comprar, paso a paso'),
    description: e(
      'The whole purchase for foreign and local buyers: offer, escrow, title study, notary and registration, with typical timelines and who does what.',
      'La compra completa para compradores extranjeros y locales: oferta, escrow, estudio registral, notario e inscripción, con plazos típicos y quién hace qué.',
    ),
    topics: [e('Offer and escrow', 'Oferta y escrow'), e('Title study', 'Estudio registral'), e('Notary and registration', 'Notario e inscripción')],
    minutes: 8,
    updated: GUIDES_UPDATED,
    sections: [
      {
        id: 'summary',
        title: e('In short', 'En resumen'),
        blocks: [
          p(
            'Foreigners can buy and own titled property in Costa Rica with the same rights as citizens. The exception is the beachfront maritime zone, which works by concession. A cash purchase usually takes **30 to 60 days** from the accepted offer to the recorded deed; with a bank loan, add a few weeks.',
            'Los extranjeros pueden comprar y ser dueños de propiedades inscritas en Costa Rica con los mismos derechos que un costarricense. La excepción es la zona marítimo terrestre en la costa, que funciona por concesión. Una compra de contado suele tomar **de 30 a 60 días** desde la oferta aceptada hasta la escritura inscrita; con crédito bancario, sume algunas semanas.',
          ),
          { t: 'widget', id: 'timeline' },
        ],
      },
      {
        id: 'who',
        title: e('Who does what', 'Quién hace qué'),
        blocks: [
          {
            t: 'list',
            items: [
              e('**The broker.** Costa Rica does not license real estate brokers. Look for membership in the Costa Rican Chamber of Real Estate Brokers (CCCBR) and for registration with SUGEF, which every company that buys and sells real estate professionally must have under Law 7786.', '**El corredor.** En Costa Rica no se exige licencia para ser corredor de bienes raíces. Busque la afiliación a la Cámara Costarricense de Corredores de Bienes Raíces (CCCBR) y la inscripción ante SUGEF, obligatoria según la Ley 7786 para toda empresa que se dedique a la compra y venta de inmuebles.'),
              e('**The notary.** A lawyer-notary with public faith drafts the deed, collects the taxes and files the deed at the Registro Nacional. One notary can act for both parties, and you can always bring your own.', '**El notario.** Un abogado y notario con fe pública redacta la escritura, cobra los impuestos y presenta la escritura en el Registro Nacional. Un mismo notario puede atender a ambas partes, y usted siempre puede llevar el suyo.'),
              e('**The escrow agent.** A company regulated by SUGEF holds the deposit and the balance, and releases them only when the conditions in the contract are met.', '**El agente escrow.** Una empresa regulada por SUGEF custodia el depósito y el saldo, y solo los libera cuando se cumplen las condiciones del contrato.'),
              e('**The bank and the appraiser,** if you borrow. The bank orders its own appraisal and sets its own timeline.', '**El banco y el perito,** si usa crédito. El banco pide su propio avalúo y marca sus propios plazos.'),
            ],
          },
        ],
      },
      {
        id: 'offer',
        title: e('1. Offer and purchase agreement', '1. Oferta y contrato'),
        blocks: [
          p(
            'Offers are made in writing. Once accepted they become a purchase agreement or option contract (opción de compra or promesa de compraventa), which sets the price, the deposit, the deadline for due diligence, the closing date, who pays which costs and what happens if either side backs out.',
            'Las ofertas se hacen por escrito. Una vez aceptadas se convierten en una opción de compra o promesa de compraventa, que fija el precio, el depósito, el plazo para la debida diligencia, la fecha de cierre, quién paga cada gasto y qué pasa si alguna de las partes se retira.',
          ),
          { t: 'callout', tone: 'tip', title: e('Protect the deposit', 'Proteja el depósito'), text: e('Deposits are often around 10% of the price. Make it refundable if the title study or the inspection finds a problem, and write the deadline for those checks into the contract.', 'El depósito suele rondar el 10% del precio. Pida que sea reembolsable si el estudio registral o la inspección encuentran un problema, y ponga en el contrato el plazo para esas revisiones.') },
        ],
      },
      {
        id: 'escrow',
        title: e('2. The deposit goes to escrow', '2. El depósito va a escrow'),
        blocks: [
          p(
            'Never send money to the seller or to the broker. The deposit goes to a regulated escrow agent, who first checks who you are and where the money comes from, as anti-money-laundering rules require. Funds from abroad arrive by wire transfer.',
            'Nunca le envíe dinero al vendedor ni al corredor. El depósito va a un agente escrow regulado, que primero verifica quién es usted y de dónde viene el dinero, como exigen las normas contra la legitimación de capitales. Los fondos del exterior llegan por transferencia bancaria.',
          ),
          {
            t: 'list',
            items: [
              e('Passport or Costa Rican ID', 'Pasaporte o cédula'),
              e('Proof of address', 'Comprobante de domicilio'),
              e('Proof of where the funds come from: bank statements, the sale of another property, an inheritance', 'Prueba del origen de los fondos: estados de cuenta, la venta de otra propiedad, una herencia'),
              e('For a company: its legal standing, its shareholders and its beneficial owners', 'Si compra una sociedad: su personería, sus accionistas y sus beneficiarios finales'),
            ],
          },
        ],
      },
      {
        id: 'due-diligence',
        title: e('3. Title study and checks', '3. Estudio registral y revisiones'),
        blocks: [
          p(
            'Before the deposit becomes non-refundable, your notary or lawyer studies the property at the Registro Nacional. The study covers four things:',
            'Antes de que el depósito deje de ser reembolsable, su notario o abogado estudia la propiedad en el Registro Nacional. El estudio revisa cuatro cosas:',
          ),
          {
            t: 'list',
            ordered: true,
            items: [
              e('**Ownership:** the current owner and the chain of previous transfers.', '**Titularidad:** el dueño actual y la cadena de traspasos anteriores.'),
              e('**Liens (gravámenes):** mortgages, court embargoes, easements. They follow the property, so they must be cleared or accepted before closing.', '**Gravámenes:** hipotecas, embargos, servidumbres. Siguen a la propiedad, así que deben levantarse o aceptarse antes del cierre.'),
              e('**Annotations (anotaciones):** documents waiting to be recorded or lawsuits that block a sale.', '**Anotaciones:** documentos pendientes de inscripción o demandas que impiden vender.'),
              e('**Cadastral plan:** the plano catastrado must match the title and the land on the ground, without overlaps or protected areas.', '**Plano catastrado:** debe coincidir con el folio real y con el terreno, sin traslapes ni áreas protegidas.'),
            ],
          },
          p(
            'Outside the registry, also confirm that municipal taxes are paid, the zoning certificate (uso de suelo) allows what you plan to do, water is available and, for condos, that fees are paid and the bylaws allow rentals if you need them. For a house, an independent inspection of the roof, wiring and plumbing is money well spent.',
            'Fuera del Registro, confirme también que los impuestos municipales estén al día, que el certificado de uso de suelo permita lo que usted planea, que haya disponibilidad de agua y, en condominios, que las cuotas estén pagadas y que el reglamento permita alquilar si lo necesita. En una casa, una inspección independiente de techo, electricidad y fontanería vale lo que cuesta.',
          ),
          { t: 'callout', tone: 'tip', title: e('What we check before listing', 'Lo que revisamos antes de publicar'), text: e('Every listing on this site shows what we checked at the registry and on the ground, and when. Your notary still runs their own study for the closing.', 'Cada ficha de este sitio muestra qué revisamos en el Registro y en el terreno, y cuándo. Su notario igual hace su propio estudio para el cierre.') },
        ],
      },
      {
        id: 'closing',
        title: e('4. Closing at the notary', '4. Cierre ante el notario'),
        blocks: [
          p(
            'The notary writes the deed (escritura) in their protocol, buyer and seller sign it in person or through a power of attorney, and the balance is paid through escrow. The notary pays the transfer tax and registry fees and files the deed.',
            'El notario redacta la escritura en su protocolo, comprador y vendedor la firman en persona o mediante un poder especial, y el saldo se paga por medio del escrow. El notario paga el impuesto de traspaso y los derechos de registro, y presenta la escritura.',
          ),
          {
            t: 'table',
            caption: e('Typical closing costs', 'Gastos de cierre típicos'),
            head: [e('Item', 'Concepto'), e('Amount', 'Monto'), e('Note', 'Nota')],
            rows: [
              [e('Transfer tax', 'Impuesto de traspaso'), e('1.5%', '1,5%'), e('On the higher of the deed price and the fiscal value (Law 6999)', 'Sobre el mayor entre el precio de la escritura y el valor fiscal (Ley 6999)')],
              [e('Registry fees and stamps', 'Derechos de registro y timbres'), e('≈0.5%', '≈0,5%'), e('Registro Nacional and fiscal stamps', 'Registro Nacional y timbres fiscales')],
              [e('Notary fees', 'Honorarios del notario'), e('≈1–1.25% + 13% VAT', '≈1–1,25% + 13% de IVA'), e('Set by the bar association’s fee schedule, scaled by price', 'Según el arancel del Colegio de Abogados, escalonado por precio')],
              [e('Escrow', 'Escrow'), e('Flat fee', 'Tarifa fija'), e('Varies by agent', 'Varía según el agente')],
            ],
          },
          p(
            'Altogether, plan for about **3.5% to 4.5% of the price**. Who pays what is negotiable: the buyer usually pays, and the transfer tax and registry fees are sometimes split with the seller.',
            'En total, calcule **entre 3,5% y 4,5% del precio**. Quién paga qué se negocia: normalmente paga el comprador, y a veces el traspaso y los derechos de registro se dividen con el vendedor.',
          ),
          { t: 'callout', tone: 'warn', title: e('If the seller lives abroad', 'Si el vendedor vive fuera del país'), text: e('When the seller is not domiciled in Costa Rica, you as the buyer must withhold 2.5% of the price toward the seller’s capital-gains tax and file it on TRIBU-CR. Your notary handles it at closing, and the registry will not record the deed without it.', 'Cuando el vendedor no está domiciliado en Costa Rica, usted como comprador debe retener el 2,5% del precio a cuenta del impuesto de ganancias de capital del vendedor y declararlo en TRIBU-CR. Su notario lo gestiona en el cierre, y el Registro no inscribe la escritura sin ese pago.') },
          { t: 'widget', id: 'calculator' },
        ],
      },
      {
        id: 'registration',
        title: e('5. Registration', '5. Inscripción'),
        blocks: [
          p(
            'The Registro Nacional reviews the deed and records it, which can take from a few days to a few weeks. Once recorded, your name appears on the folio real. Escrow releases the money to the seller on the terms of the contract, usually once the deed is signed and presented with no new annotations. Keep a copy of the deed and of the registry certificate.',
            'El Registro Nacional califica la escritura y la inscribe, lo que puede tardar de unos días a algunas semanas. Una vez inscrita, su nombre aparece en el folio real. El escrow le entrega el dinero al vendedor según el contrato, por lo general cuando la escritura está firmada y presentada sin anotaciones nuevas. Guarde una copia de la escritura y de la certificación registral.',
          ),
        ],
      },
      {
        id: 'abroad',
        title: e('Buying from abroad', 'Comprar desde el exterior'),
        blocks: [
          {
            t: 'list',
            items: [
              e('Tour by video call, then visit in person before the deposit becomes final if you can.', 'Haga el recorrido por videollamada y, si puede, visite antes de que el depósito quede en firme.'),
              e('Sign through a special power of attorney (poder especial), granted before a Costa Rican consul or before a notary abroad with an apostille.', 'Firme mediante un poder especial, otorgado ante un cónsul de Costa Rica o ante un notario en el exterior con apostilla.'),
              e('Wire the funds straight to the escrow account, never to a personal account.', 'Transfiera los fondos directo a la cuenta de escrow, nunca a una cuenta personal.'),
              e('A property of $150,000 or more in your own name can support an investor residency application.', 'Una propiedad de $150.000 o más a su nombre puede respaldar una solicitud de residencia de inversionista.'),
            ],
          },
          { t: 'callout', tone: 'tip', title: e('In your name or through a company?', '¿A su nombre o por medio de una sociedad?'), text: e('Buying through a corporation (sociedad) used to be common. Today a company has yearly costs and reporting duties, and a property owned by a company does not count for investor residency. Ask your lawyer before you decide.', 'Antes era común comprar por medio de una sociedad. Hoy una sociedad tiene costos y obligaciones de reporte cada año, y una propiedad a nombre de una sociedad no cuenta para la residencia de inversionista. Consúltelo con su abogado antes de decidir.') },
        ],
      },
    ],
    faq: [
      { q: e('Can foreigners own property in Costa Rica?', '¿Puede un extranjero ser dueño de una propiedad en Costa Rica?'), a: e('Yes. Titled property can be owned by foreigners with the same rights as citizens. Concessions in the maritime zone have nationality and residency limits.', 'Sí. Un extranjero puede ser dueño de una propiedad inscrita con los mismos derechos que un costarricense. Las concesiones en la zona marítimo terrestre tienen límites por nacionalidad y residencia.') },
      { q: e('How long does a purchase take?', '¿Cuánto tarda una compra?'), a: e('About 30 to 60 days for a cash purchase, from the accepted offer to the recorded deed. Bank financing adds a few weeks.', 'De 30 a 60 días en una compra de contado, desde la oferta aceptada hasta la escritura inscrita. El crédito bancario suma algunas semanas.') },
      { q: e('Who pays the closing costs?', '¿Quién paga los gastos de cierre?'), a: e('Usually the buyer, but it is negotiable. The transfer tax and registry fees are sometimes split 50/50.', 'Normalmente el comprador, pero se negocia. A veces el traspaso y los derechos de registro se dividen 50/50.') },
      { q: e('Do I need my own lawyer?', '¿Necesito mi propio abogado?'), a: e('The deed requires a notary, who can serve both parties. Many buyers from abroad also hire their own lawyer for the due diligence and the contract.', 'La escritura requiere un notario, que puede atender a ambas partes. Muchos compradores del exterior contratan además su propio abogado para la debida diligencia y el contrato.') },
    ],
    sources: [
      { label: 'Ley 7786 y Acuerdo SUGEF 11-18 (inscripción de sujetos obligados)', url: 'https://www.sugef.fi.cr/normativa/normativa_vigente/SUGEF%2011-18%20(v11%2023%20de%20octubre%20de%202023).pdf' },
      { label: 'Ley 7092, art. 28 ter (retención del 2,5% a no domiciliados)' },
      { label: 'Ley 6999, Impuesto de Traspaso de Bienes Inmuebles' },
      { label: 'Informe "Bienes Raíces en Costa Rica" (2026), preparado para Soluciones Inmobiliarias CR' },
    ],
  },
  {
    slug: 'maritime-zone',
    icon: 'coast',
    title: e('Beachfront property and the maritime zone (ZMT)', 'Propiedades frente al mar y la zona marítimo terrestre (ZMT)'),
    short: e('The maritime zone (ZMT)', 'La zona marítimo terrestre (ZMT)'),
    description: e(
      'What you can and cannot own on the coast: the 200-meter maritime zone, how concessions work, who can hold one and what to check before you buy.',
      'Qué se puede y qué no se puede tener en la costa: la franja de 200 metros, cómo funcionan las concesiones, quién puede tener una y qué revisar antes de comprar.',
    ),
    topics: [e('Public and restricted zones', 'Zona pública y restringida'), e('Concessions', 'Concesiones'), e('Limits for foreigners', 'Límites para extranjeros')],
    minutes: 6,
    updated: GUIDES_UPDATED,
    sections: [
      {
        id: 'rule',
        title: e('The 200-meter rule', 'La regla de los 200 metros'),
        blocks: [
          p(
            'The strip of land **200 meters wide** measured inland from the ordinary high-tide line belongs to the State, under the Maritime Zone Law (Law 6043). It cannot be bought as private property: it can only be used through a municipal concession. Land beyond the 200 meters is ordinary titled property. A few properties inside the strip hold private titles that predate the law; your lawyer confirms which case applies.',
            'La franja de **200 metros de ancho** medida tierra adentro desde la línea de pleamar ordinaria pertenece al Estado, según la Ley sobre la Zona Marítimo Terrestre (Ley 6043). No se puede comprar como propiedad privada: solo se puede usar mediante una concesión municipal. El terreno después de los 200 metros es una propiedad inscrita común. Algunas propiedades dentro de la franja tienen títulos privados anteriores a la ley; su abogado confirma cuál es el caso.',
          ),
          { t: 'widget', id: 'zmt' },
        ],
      },
      {
        id: 'zones',
        title: e('Public zone and restricted zone', 'Zona pública y zona restringida'),
        blocks: [
          {
            t: 'list',
            items: [
              e('**Public zone, the first 50 meters.** Open to everyone, it cannot be occupied, built on or given in concession. Mangroves and estuaries are public zone wherever they reach.', '**Zona pública, los primeros 50 metros.** Es de libre acceso, no se puede ocupar, construir ni dar en concesión. Los manglares y esteros son zona pública hasta donde lleguen.'),
              e('**Restricted zone, the next 150 meters.** The municipality grants concessions here, with approval from the Costa Rican Tourism Institute (ICT) in tourist areas, and only where an approved coastal zoning plan (plan regulador) exists.', '**Zona restringida, los siguientes 150 metros.** Aquí la municipalidad otorga concesiones, con aprobación del Instituto Costarricense de Turismo (ICT) en zonas turísticas, y solo donde exista un plan regulador costero aprobado.'),
            ],
          },
        ],
      },
      {
        id: 'concessions',
        title: e('How a concession works', 'Cómo funciona una concesión'),
        blocks: [
          {
            t: 'list',
            items: [
              e('It is granted for **5 to 20 years** and can be renewed, as long as the canon is paid and the rules are met.', 'Se otorga por un plazo **de 5 a 20 años** y se puede prorrogar, si el canon está al día y se cumplen las condiciones.'),
              e('The concessionaire pays a yearly **canon** set by the municipality, which replaces the property tax.', 'El concesionario paga un **canon** anual que fija la municipalidad, en lugar del impuesto de bienes inmuebles.'),
              e('The use (residential, tourism, commercial) comes from the plan and cannot change without approval.', 'El uso (residencial, turístico, comercial) lo define el plan y no se puede cambiar sin autorización.'),
              e('Selling, transferring or mortgaging a concession needs the approval of the municipality and, where it applies, the ICT. Otherwise the deal is void.', 'Vender, traspasar o hipotecar una concesión requiere la autorización de la municipalidad y, cuando corresponde, del ICT. Sin ella, el acto no tiene validez.'),
            ],
          },
        ],
      },
      {
        id: 'who',
        title: e('Who can hold a concession', 'Quién puede tener una concesión'),
        blocks: [
          p('Law 6043 (article 47) does not allow concessions to:', 'La Ley 6043 (artículo 47) no permite otorgar concesiones a:'),
          {
            t: 'list',
            items: [
              e('Foreigners who have not lived in Costa Rica for at least five years', 'Extranjeros que no hayan residido en el país por lo menos cinco años'),
              e('Companies domiciled abroad, or formed in Costa Rica by foreigners', 'Sociedades domiciliadas en el exterior, o constituidas en el país por extranjeros'),
              e('Companies whose shares or capital belong more than 50% to foreigners', 'Entidades cuyas acciones o capital pertenezcan en más de un 50% a extranjeros'),
            ],
          },
          { t: 'callout', tone: 'warn', title: e('No nominees', 'Sin prestanombres'), text: e('Companies that hold a concession cannot transfer shares to foreigners, and arrangements with nominees (prestanombres) to get around the limits make the transfer void.', 'Las sociedades con concesión no pueden traspasar acciones a extranjeros, y los arreglos con prestanombres para evadir los límites anulan el traspaso.') },
        ],
      },
      {
        id: 'checklist',
        title: e('What to check before buying on the coast', 'Qué revisar antes de comprar en la costa'),
        blocks: [
          {
            t: 'list',
            ordered: true,
            items: [
              e('Whether it is titled land (folio real) or a concession, at the Registro Nacional.', 'Si es una propiedad inscrita (folio real) o una concesión, en el Registro Nacional.'),
              e('That an approved coastal plan covers the parcel. Without one, concessions cannot be granted or renewed.', 'Que un plan regulador costero aprobado cubra la parcela. Sin él no se otorgan ni se prorrogan concesiones.'),
              e('The years left on the concession and that the canon is paid.', 'Los años que le quedan a la concesión y que el canon esté al día.'),
              e('That the authorized use matches your plans, and the buildings have permits.', 'Que el uso autorizado coincida con sus planes y que las construcciones tengan permisos.'),
              e('That you, or your company, meet the nationality and residency rules.', 'Que usted, o su sociedad, cumpla los requisitos de nacionalidad y residencia.'),
            ],
          },
          { t: 'callout', tone: 'tip', title: e('Our areas are inland', 'Nuestras zonas están tierra adentro'), text: e('Escazú, Santa Ana, Heredia and Alajuela are in the Central Valley, so every listing on this site is ordinary titled property. If you are also looking at the coast, we can refer you to a lawyer who works with concessions.', 'Escazú, Santa Ana, Heredia y Alajuela están en el Valle Central, así que todas las propiedades de este sitio son propiedades inscritas comunes. Si también busca en la costa, le recomendamos un abogado que trabaje con concesiones.') },
        ],
      },
    ],
    faq: [
      { q: e('Can a foreigner buy beachfront property?', '¿Puede un extranjero comprar frente al mar?'), a: e('Titled land beyond the 200 meters, yes, like anywhere else. A concession inside the restricted zone requires five years of residency, or a company that is at least 50% Costa Rican.', 'Una propiedad inscrita después de los 200 metros, sí, como en cualquier otro lugar. Una concesión en la zona restringida requiere cinco años de residencia, o una sociedad que sea costarricense en al menos un 50%.') },
      { q: e('Is a concession the same as owning?', '¿Una concesión es lo mismo que ser dueño?'), a: e('No. It is a right to use a parcel for a set term, with conditions. The land stays public.', 'No. Es un derecho de uso sobre una parcela por un plazo y con condiciones. El terreno sigue siendo público.') },
      { q: e('What happens when a concession ends?', '¿Qué pasa cuando vence una concesión?'), a: e('The holder can request an extension. The municipality can deny it for public interest or if the conditions were not met.', 'El concesionario puede pedir la prórroga. La municipalidad puede negarla por interés público o si no se cumplieron las condiciones.') },
    ],
    sources: [
      { label: 'Ley 6043, Ley sobre la Zona Marítimo Terrestre', url: 'https://www.snitcr.go.cr/pdfs/leyes/Ley-6043.pdf' },
      { label: 'Informe "Bienes Raíces en Costa Rica" (2026), preparado para Soluciones Inmobiliarias CR' },
    ],
  },
  {
    slug: 'investor-residency',
    icon: 'passport',
    title: e('Investor residency through a property purchase', 'Residencia de inversionista con la compra de una propiedad'),
    short: e('Investor residency', 'Residencia de inversionista'),
    description: e(
      'How a property of $150,000 or more can support investor residency: what the property must show, the documents, and what changed with Law 9996 in July 2026.',
      'Cómo una propiedad de $150.000 o más puede respaldar la residencia de inversionista: qué debe mostrar la propiedad, los documentos y qué cambió con la Ley 9996 en julio de 2026.',
    ),
    topics: [e('The $150,000 minimum', 'El mínimo de $150.000'), e('Property requirements', 'Requisitos de la propiedad'), e('Law 9996 after July 2026', 'La Ley 9996 después de julio de 2026')],
    minutes: 7,
    updated: GUIDES_UPDATED,
    sections: [
      {
        id: 'summary',
        title: e('In short', 'En resumen'),
        blocks: [
          p(
            'Investor residency is a category of temporary residence. The minimum investment that the immigration office (DGME) publishes is **US$150,000**, and real estate qualifies. It is granted for up to two years at a time and renewed while you keep the investment; after three consecutive years you can apply for permanent residency. Investors and their dependents cannot take paid employment.',
            'La residencia de inversionista es una categoría de residencia temporal. El monto mínimo que publica la Dirección General de Migración y Extranjería (DGME) es de **US$150.000**, y una propiedad califica. Se otorga por períodos de hasta dos años y se renueva mientras mantenga la inversión; después de tres años seguidos puede solicitar la residencia permanente. Los inversionistas y sus dependientes no pueden trabajar de forma remunerada.',
          ),
          { t: 'callout', tone: 'warn', title: e('What changed on 14 July 2026', 'Qué cambió el 14 de julio de 2026'), text: e('The five-year window to request the Law 9996 tax incentives closed: duty-free household goods once, up to two vehicles, and 20% off the transfer tax. People granted them before keep them for ten years. Some lawyers ask whether the $150,000 minimum also ended; the regulation (Decree 43926) and DGME still publish $150,000. Confirm the amount when you file.', 'Cerró el plazo de cinco años para solicitar los incentivos fiscales de la Ley 9996: el menaje de casa libre de impuestos por una vez, hasta dos vehículos y el 20% menos de impuesto de traspaso. Quienes los obtuvieron antes los conservan por diez años. Algunos abogados se preguntan si el mínimo de $150.000 también venció; el reglamento (Decreto 43926) y la DGME siguen publicando $150.000. Confirme el monto al presentar la solicitud.') },
          { t: 'widget', id: 'residency' },
        ],
      },
      {
        id: 'property',
        title: e('What the property must show', 'Qué debe mostrar la propiedad'),
        blocks: [
          {
            t: 'list',
            items: [
              e('**It is in your own name.** A property owned by a company does not count. Shares can count instead, if the company has a real economic activity in Costa Rica and your stake is at least $150,000.', '**Está a su nombre.** Una propiedad a nombre de una sociedad no cuenta. Pueden contar en su lugar las acciones, si la sociedad tiene una actividad económica real en Costa Rica y su participación es de al menos $150.000.'),
              e('**The municipal value reaches $150,000.** The value that counts is the one the municipality uses for property tax, in a certificate no older than three months that also shows taxes are paid.', '**El valor municipal llega a $150.000.** El valor que cuenta es el que usa la municipalidad para el impuesto de bienes inmuebles, en una constancia de no más de tres meses que muestre además que los impuestos están al día.'),
              e('**With a mortgage, your own money reaches $150,000.** The down payment, alone or with other qualifying investments, must reach the minimum.', '**Con hipoteca, su propio dinero llega a $150.000.** La prima, sola o sumada a otras inversiones que califiquen, debe alcanzar el mínimo.'),
              e('**You keep it.** At each renewal you show that you kept the investment without interruption.', '**La mantiene.** En cada renovación debe demostrar que mantuvo la inversión sin interrupción.'),
            ],
          },
          { t: 'callout', tone: 'tip', title: e('Put the real price in the deed', 'Ponga el precio real en la escritura'), text: e('When a property changes hands, the price in the deed becomes the new municipal value if it is higher. A lower price in the deed lowers the investment you can prove, and understates the taxes.', 'Cuando una propiedad cambia de dueño, el precio de la escritura pasa a ser el nuevo valor municipal si es mayor. Un precio menor al real reduce la inversión que puede demostrar, y declara menos impuestos de los que corresponden.') },
        ],
      },
      {
        id: 'documents',
        title: e('Typical documents', 'Documentos usuales'),
        blocks: [
          {
            t: 'list',
            items: [
              e('Passport and passport photos', 'Pasaporte y fotografías'),
              e('Birth certificate, apostilled and translated', 'Certificado de nacimiento, apostillado y traducido'),
              e('Criminal record certificate from your country of residence, apostilled and recent', 'Certificado de antecedentes penales de su país de residencia, apostillado y reciente'),
              e('Fingerprints taken by the Ministry of Public Security', 'Registro de huellas en el Ministerio de Seguridad Pública'),
              e('Proof of the investment: the registry certification and the municipal value certificate', 'Prueba de la inversión: la certificación registral y la constancia de valor municipal'),
              e('For dependents: marriage and birth certificates', 'Para dependientes: certificados de matrimonio y de nacimiento'),
            ],
          },
          p('The exact list and the fees are on the DGME website; an immigration lawyer usually prepares the file.', 'La lista exacta y los costos están en el sitio de la DGME; por lo general, un abogado de migración prepara el expediente.'),
        ],
      },
      {
        id: 'tax-residency',
        title: e('Residency is not tax residency', 'Residencia no es residencia fiscal'),
        blocks: [
          p(
            'Law 9996 (article 6) says investors, rentiers and retirees are not automatically tax residents. Tax residency depends on the Income Tax Law, mainly on spending more than 183 days a year in the country. Either way, income earned in Costa Rica, such as rent from your property, is taxed here.',
            'La Ley 9996 (artículo 6) dice que los inversionistas, rentistas y pensionados no son residentes fiscales de forma automática. La residencia fiscal depende de la Ley del Impuesto sobre la Renta, principalmente de permanecer más de 183 días al año en el país. En cualquier caso, los ingresos generados en Costa Rica, como el alquiler de su propiedad, pagan impuestos aquí.',
          ),
        ],
      },
      {
        id: 'steps',
        title: e('How it fits with your purchase', 'Cómo encaja con su compra'),
        blocks: [
          {
            t: 'list',
            ordered: true,
            items: [
              e('Choose a property of $150,000 or more and buy it in your own name.', 'Elija una propiedad de $150.000 o más y cómprela a su nombre.'),
              e('At closing, the notary records the deed with the real price.', 'En el cierre, el notario inscribe la escritura con el precio real.'),
              e('Request the registry certification and the municipal value certificate.', 'Solicite la certificación registral y la constancia de valor municipal.'),
              e('Your immigration lawyer files the application with the DGME.', 'Su abogado de migración presenta la solicitud ante la DGME.'),
              e('Renew every two years showing the investment; after three years, apply for permanent residency.', 'Renueve cada dos años demostrando la inversión; a los tres años, solicite la permanente.'),
            ],
          },
        ],
      },
    ],
    faq: [
      { q: e('Can I buy through my company and still qualify?', '¿Puedo comprar por medio de mi sociedad y calificar?'), a: e('Not with the property itself. Your shares can count if the company has a real economic activity in Costa Rica and your stake reaches $150,000.', 'No con la propiedad en sí. Pueden contar sus acciones, si la sociedad tiene una actividad económica real en Costa Rica y su participación llega a $150.000.') },
      { q: e('Can I rent out the property?', '¿Puedo alquilar la propiedad?'), a: e('Owning and renting a property is not paid employment, so it does not conflict with the residency. The rental income is taxed in Costa Rica.', 'Ser dueño y alquilar una propiedad no es un trabajo remunerado, así que no choca con la residencia. El alquiler paga impuestos en Costa Rica.') },
      { q: e('Can I still get the Law 9996 tax incentives?', '¿Todavía puedo obtener los incentivos de la Ley 9996?'), a: e('Not as a new applicant: the window closed on 14 July 2026. Those who were granted them keep them for ten years.', 'No como solicitante nuevo: el plazo cerró el 14 de julio de 2026. Quienes los obtuvieron los conservan por diez años.') },
      { q: e('Does a pre-sale unit count?', '¿Cuenta una unidad en preventa?'), a: e('Usually only once the unit is registered in your name. Ask your lawyer about your project.', 'Por lo general, solo cuando la unidad esté inscrita a su nombre. Consulte su caso con su abogado.') },
    ],
    sources: [
      { label: 'Ley 9996, Ley para la Atracción de Inversionistas, Rentistas y Pensionados (arts. 6, 8 y 12)', url: 'https://pgrweb.go.cr/scij/Busqueda/Normativa/Normas/nrm_texto_completo.aspx?nValor1=1&nValor2=94782&nValor3=0&param1=NRTC&strTipM=TC' },
      { label: 'Decreto Ejecutivo 43926, Reglamento de la Ley 9996' },
      { label: 'Dirección General de Migración y Extranjería', url: 'https://www.migracion.go.cr' },
    ],
  },
  {
    slug: 'taxes',
    icon: 'tax',
    title: e('Property taxes in Costa Rica: buying, owning, renting and selling', 'Impuestos de una propiedad en Costa Rica: al comprar, tener, alquilar y vender'),
    short: e('Property taxes', 'Impuestos'),
    description: e(
      'Transfer tax and closing costs, the yearly property tax, the luxury home tax, taxes on rental income and capital gains when you sell, with 2026 figures.',
      'Impuesto de traspaso y gastos de cierre, impuesto de bienes inmuebles, impuesto solidario, impuestos sobre el alquiler y ganancias de capital al vender, con cifras de 2026.',
    ),
    topics: [e('Closing costs', 'Gastos de cierre'), e('Yearly taxes', 'Impuestos anuales'), e('Rent and capital gains', 'Alquiler y ganancias de capital')],
    minutes: 9,
    updated: GUIDES_UPDATED,
    sections: [
      {
        id: 'buying',
        title: e('When you buy', 'Al comprar'),
        blocks: [
          {
            t: 'table',
            caption: e('Taxes and fees at closing', 'Impuestos y gastos en el cierre'),
            head: [e('Item', 'Concepto'), e('Amount', 'Monto'), e('Note', 'Nota')],
            rows: [
              [e('Transfer tax (Law 6999)', 'Impuesto de traspaso (Ley 6999)'), e('1.5%', '1,5%'), e('On the higher of the deed price and the fiscal value', 'Sobre el mayor entre el precio de la escritura y el valor fiscal')],
              [e('Registry fees and stamps', 'Derechos de registro y timbres'), e('≈0.5%', '≈0,5%'), e('Registro Nacional and fiscal stamps', 'Registro Nacional y timbres fiscales')],
              [e('Notary fees', 'Honorarios del notario'), e('≈1–1.25% + 13% VAT', '≈1–1,25% + 13% de IVA'), e('Bar association fee schedule', 'Arancel del Colegio de Abogados')],
            ],
          },
          p(
            'With escrow and the title study, plan for about **3.5% to 4.5% of the price**. The Law 9996 discount of 20% on the transfer tax is no longer available to new applicants since 14 July 2026.',
            'Con el escrow y el estudio registral, calcule **entre 3,5% y 4,5% del precio**. El descuento del 20% en el traspaso de la Ley 9996 ya no está disponible para solicitantes nuevos desde el 14 de julio de 2026.',
          ),
          { t: 'callout', tone: 'warn', title: e('Withholding when the seller lives abroad', 'Retención si el vendedor vive fuera del país'), text: e('If the seller is not domiciled in Costa Rica, the buyer withholds 2.5% of the price toward the seller’s capital-gains tax and files it on TRIBU-CR (form 129) within the first 15 days of the following month. The 2% withholding for domiciled sellers announced in 2025 was repealed in October 2025.', 'Si el vendedor no está domiciliado en Costa Rica, el comprador retiene el 2,5% del precio a cuenta del impuesto de ganancias de capital del vendedor y lo declara en TRIBU-CR (formulario 129) dentro de los primeros 15 días del mes siguiente. La retención del 2% para vendedores domiciliados que se anunció en 2025 se derogó en octubre de 2025.') },
          { t: 'widget', id: 'calculator' },
        ],
      },
      {
        id: 'owning',
        title: e('Every year you own it', 'Cada año que la tenga'),
        blocks: [
          {
            t: 'list',
            items: [
              e('**Property tax (Law 7509): 0.25% a year** of the registered value, paid to the municipality, yearly or in quarterly installments. Owners update the value with a sworn declaration every five years.', '**Impuesto de bienes inmuebles (Ley 7509): 0,25% al año** sobre el valor registrado, que se paga a la municipalidad, anual o por trimestres. El propietario actualiza el valor con una declaración jurada cada cinco años.'),
              e('**Luxury home tax (impuesto solidario, Law 8683).** Only for homes, whether lived in, occasional or for recreation, whose construction value exceeds **₡143,000,000 in 2026**. If it does, the tax applies to construction plus land, from 0.25% to 0.55% by brackets. It is declared every three years (form D-174 on TRIBU-CR) and paid by 15 January.', '**Impuesto solidario (Ley 8683).** Solo para viviendas de uso habitual, ocasional o de recreo cuyo valor de construcción supere **₡143.000.000 en 2026**. Si lo supera, el impuesto se calcula sobre construcción más terreno, del 0,25% al 0,55% por tramos. Se declara cada tres años (formulario D-174 en TRIBU-CR) y se paga a más tardar el 15 de enero.'),
            ],
          },
          { t: 'widget', id: 'holding' },
          {
            t: 'table',
            caption: e('Luxury home tax brackets, 2026 (Decree 45358-H)', 'Tramos del impuesto solidario, 2026 (Decreto 45358-H)'),
            head: [e('Taxable value', 'Valor fiscal'), e('Rate', 'Tarifa')],
            rows: [
              [e('Up to ₡359,000,000', 'Hasta ₡359.000.000'), e('0.25%', '0,25%')],
              [e('₡359M to ₡720M', '₡359M a ₡720M'), e('0.30%', '0,30%')],
              [e('₡720M to ₡1,081M', '₡720M a ₡1.081M'), e('0.35%', '0,35%')],
              [e('₡1,081M to ₡1,443M', '₡1.081M a ₡1.443M'), e('0.40%', '0,40%')],
              [e('₡1,443M to ₡1,800M', '₡1.443M a ₡1.800M'), e('0.45%', '0,45%')],
              [e('₡1,800M to ₡2,162M', '₡1.800M a ₡2.162M'), e('0.50%', '0,50%')],
              [e('Over ₡2,162M', 'Más de ₡2.162M'), e('0.55%', '0,55%')],
            ],
          },
        ],
      },
      {
        id: 'renting',
        title: e('If you rent it out', 'Si la alquila'),
        blocks: [
          {
            t: 'list',
            items: [
              e('**Income tax on rent: 12.75% of what you collect.** The rate is 15% on 85% of the gross rent (a fixed 15% deduction for expenses). It is declared monthly on TRIBU-CR by the 15th of the following month.', '**Impuesto sobre la renta del alquiler: 12,75% de lo que cobra.** La tarifa es del 15% sobre el 85% del alquiler bruto (una deducción fija del 15% por gastos). Se declara cada mes en TRIBU-CR, a más tardar el día 15 del mes siguiente.'),
              e('**VAT on long-term home rentals.** Exempt when the monthly rent is up to 1.5 base salaries (₡693,300 in 2026). Above that, 13% applies to the whole rent, not just the excess.', '**IVA en alquiler de vivienda.** Está exento si el alquiler mensual es de hasta 1,5 salarios base (₡693.300 en 2026). Si lo supera, se aplica el 13% sobre todo el alquiler, no solo sobre el exceso.'),
              e('**Short-term and vacation rentals** are taxed as a business: 13% VAT plus income tax on the profit.', '**Los alquileres de corta estancia o vacacionales** tributan como actividad lucrativa: 13% de IVA más el impuesto sobre la renta de la utilidad.'),
            ],
          },
          { t: 'callout', tone: 'tip', title: e('Our yield figures are before these taxes', 'Nuestras rentabilidades son antes de estos impuestos'), text: e('The yields on our listings discount HOA, property tax, insurance, management and vacancy, but not income tax or VAT on the rent.', 'Las rentabilidades de nuestras fichas descuentan cuota, impuesto de bienes inmuebles, seguro, administración y desocupación, pero no el impuesto sobre la renta ni el IVA del alquiler.') },
        ],
      },
      {
        id: 'selling',
        title: e('When you sell', 'Al vender'),
        blocks: [
          {
            t: 'list',
            items: [
              e('**Capital gains: 15% of the gain**, the sale price minus the purchase cost and improvements, adjusted for inflation.', '**Ganancias de capital: 15% sobre la ganancia**, el precio de venta menos el costo de compra y las mejoras, ajustado por inflación.'),
              e('**Bought before 1 July 2019?** On the first sale you can choose to pay 2.25% of the sale price instead.', '**¿La compró antes del 1 de julio de 2019?** En la primera venta puede optar por pagar el 2,25% del precio de venta.'),
              e('**Your habitual home is exempt**, even when it is held by a company, if it truly is the owners’ home.', '**Su vivienda habitual está exenta**, aun si está a nombre de una sociedad, siempre que de verdad sea la casa de los dueños.'),
              e('**Sellers who live abroad** have 2.5% of the price withheld by the buyer, toward the tax.', '**A los vendedores que viven fuera del país**, el comprador les retiene el 2,5% del precio a cuenta del impuesto.'),
              e('If buying and selling property is your business, the gain is taxed with your business income instead.', 'Si comprar y vender propiedades es su negocio, la ganancia tributa con las utilidades de esa actividad.'),
            ],
          },
          p('Since October 2025, national tax returns are filed on TRIBU-CR, the Ministry of Finance’s platform. Property tax is still paid to the municipality.', 'Desde octubre de 2025, las declaraciones de impuestos nacionales se presentan en TRIBU-CR, la plataforma del Ministerio de Hacienda. El impuesto de bienes inmuebles se sigue pagando a la municipalidad.'),
        ],
      },
    ],
    faq: [
      { q: e('Do foreigners pay more property tax?', '¿Los extranjeros pagan más impuestos por su propiedad?'), a: e('No. The same rates apply to citizens and foreigners. What changes is the 2.5% withholding when a seller is not domiciled in Costa Rica.', 'No. Las tarifas son las mismas para costarricenses y extranjeros. Lo que cambia es la retención del 2,5% cuando el vendedor no está domiciliado en el país.') },
      { q: e('Is there a yearly wealth tax?', '¿Hay un impuesto anual al patrimonio?'), a: e('No. Besides the municipal property tax, only homes above the luxury threshold pay the impuesto solidario.', 'No. Además del impuesto municipal de bienes inmuebles, solo las viviendas que superan el umbral pagan el impuesto solidario.') },
      { q: e('If I do not rent the property, do I file anything?', 'Si no alquilo la propiedad, ¿tengo que declarar algo?'), a: e('You pay property tax to the municipality and, if the home is above the threshold, declare and pay the luxury home tax.', 'Paga el impuesto de bienes inmuebles a la municipalidad y, si la vivienda supera el umbral, declara y paga el impuesto solidario.') },
    ],
    sources: [
      { label: 'Ley 7092, arts. 28 bis, 28 ter y 31 ter (ganancias de capital)', url: 'http://www.pgrweb.go.cr/scij/Busqueda/Normativa/Normas/nrm_articulo.aspx?nValor1=1&nValor2=10969&nValor3=119380&nValor5=205612&param1=NRA' },
      { label: 'Resolución MH-DGT-RES-0051-2025 (Alcance 129, La Gaceta 186, 6 de octubre de 2025)', url: 'https://www.imprentanacional.go.cr/pub/2025/10/06/ALCA129_06_10_2025.pdf' },
      { label: 'Ley 8683, Impuesto Solidario, y Decreto 45358-H', url: 'https://www.hacienda.go.cr/docs/Aviso_informativo_vencimiento_Impuesto_Solidario_2026.pdf' },
      { label: 'Hacienda: arrendamiento de bienes muebles e inmuebles (IVA)', url: 'https://www.hacienda.go.cr/docs/ArrendamientoBienesMueblesInmuebles.pdf' },
      { label: 'Ley 7509, Impuesto sobre Bienes Inmuebles; Ley 6999, Impuesto de Traspaso' },
    ],
  },
];

export const guideBySlug = (slug: string) => guides.find(g => g.slug === slug);

export const glossary: { term: string; def: L }[] = [
  { term: 'Folio real', def: e('The registry record of a property at the Registro Nacional: owner, area, liens and history.', 'El registro de una propiedad en el Registro Nacional: dueño, medida, gravámenes e historial.') },
  { term: 'Plano catastrado', def: e('The official survey plan of the land, which must match the folio real and the land itself.', 'El plano oficial del terreno, que debe coincidir con el folio real y con el terreno.') },
  { term: 'Escritura', def: e('The deed, written and signed before a notary, that transfers the property.', 'El documento firmado ante notario que traspasa la propiedad.') },
  { term: 'Estudio registral', def: e('The title study: owner, liens, annotations and cadastral plan, checked before buying.', 'La revisión de dueño, gravámenes, anotaciones y plano antes de comprar.') },
  { term: 'Gravamen', def: e('A charge on the property, such as a mortgage, embargo or easement. It follows the property.', 'Una carga sobre la propiedad, como una hipoteca, un embargo o una servidumbre. Sigue a la propiedad.') },
  { term: 'Anotación', def: e('A pending document or lawsuit noted on the folio real, which blocks a sale.', 'Un documento pendiente o una demanda anotada en el folio real, que impide vender.') },
  { term: 'Escrow', def: e('A regulated company that holds the buyer’s money until the conditions of the sale are met.', 'Una empresa regulada que custodia el dinero del comprador hasta que se cumplen las condiciones de la venta.') },
  { term: 'Uso de suelo', def: e('The municipal zoning certificate that says what can be built or done on a property.', 'El certificado municipal que indica qué se puede construir o hacer en una propiedad.') },
  { term: 'Poder especial', def: e('A power of attorney that lets someone sign the purchase for you.', 'Un poder que permite que otra persona firme la compra en su nombre.') },
  { term: 'Opción de compra', def: e('The option or purchase agreement signed after an offer is accepted.', 'El contrato que se firma cuando se acepta una oferta.') },
  { term: 'ZMT', def: e('Maritime zone: the 200-meter strip from the high-tide line, owned by the State.', 'Zona marítimo terrestre: la franja de 200 metros desde la pleamar, que pertenece al Estado.') },
  { term: 'Concesión', def: e('A right to use a parcel in the maritime zone for 5 to 20 years, granted by the municipality.', 'Un derecho de uso sobre una parcela en la zona marítimo terrestre, por 5 a 20 años, que otorga la municipalidad.') },
  { term: 'Plan regulador', def: e('A municipality’s zoning plan. On the coast, concessions need an approved one.', 'El plan de ordenamiento de una municipalidad. En la costa, las concesiones requieren uno aprobado.') },
  { term: 'DGME', def: e('Dirección General de Migración y Extranjería, the immigration office that grants residency.', 'Dirección General de Migración y Extranjería, la oficina que otorga las residencias.') },
  { term: 'TRIBU-CR', def: e('The Ministry of Finance’s platform for national tax returns, in use since October 2025.', 'La plataforma del Ministerio de Hacienda para las declaraciones de impuestos nacionales, en uso desde octubre de 2025.') },
  { term: 'SUGEF', def: e('The financial regulator. Real estate companies and escrow agents register with it.', 'La Superintendencia General de Entidades Financieras. Ante ella se inscriben las empresas inmobiliarias y los agentes escrow.') },
];
