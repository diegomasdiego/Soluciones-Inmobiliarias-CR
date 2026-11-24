# Soluciones Inmobiliarias CR — sitio web

Sitio de Soluciones Inmobiliarias CR (bienes raíces y maquinaria en el Valle Central), hecho con Next.js 16 (App Router), React y TypeScript, con Convex como base de datos. Dirección visual: "Solid ground in Costa Rica".

## Correr el proyecto

```bash
npm install
npm run dev        # servidor local en http://localhost:5173
npm run typecheck  # verificación de tipos (TypeScript 7; el build de Next no la repite)
npm run build      # build de producción en .next/ (servidor autónomo en .next/standalone)
npm run start      # sirve el build en http://localhost:3000
npm run media      # descarga y optimiza las fotos y el video nuevos (los ya descargados se conservan; --force para todo) y regenera CREDITS.md
npm run logo       # vectoriza ../logo.JPG (logo del cliente) en src/data/logo.ts
npm run brand      # regenera favicon, íconos, imagen para compartir y archivos de marca (brand/)
```

## Logo

El logo del cliente (`../logo.JPG`, dorado sobre negro) se vectorizó sin cambiar sus formas y se recoloreó con la paleta del sitio:

- **Encabezado:** edificio + "SOLUCIONES / INMOBILIARIAS / C.R." en una línea horizontal, en el color del texto (blanco sobre el video, Basalto sobre fondo claro). Componente `LogoLockup`.
- **Emblema completo:** `LogoBadge` en el pie de página, íconos y vista previa de WhatsApp.
- **Archivos para el equipo** en `brand/`: emblema sobre Cafetal y sobre Basalto (SVG y PNG 1024 px), versiones solo línea para fondo claro u oscuro y el logotipo horizontal.

## Vista previa al compartir (WhatsApp, redes)

Cada página trae su título, descripción e imagen para compartir (Open Graph y Twitter): la foto principal en las fichas y los proyectos, `public/og-image.jpg` (1200 × 630) en el resto. Las direcciones absolutas salen de `NEXT_PUBLIC_SITE_URL` (en el `Dockerfile`; por defecto el dominio de Railway). Al pasar a un dominio propio hay que cambiar esa variable y volver a desplegar.

## Base de datos (Convex)

Proyecto Convex: **soluciones-inmobiliarias-cr**. Funciones en `convex/`:

| Archivo | Qué hace |
|---|---|
| `schema.ts` | Tablas `properties` (fichas con textos EN/ES, orden y publicación), `leads` (solicitudes de los formularios), las del portal (`deals`, `dealAccess`, `dealUpdates`, `dealDocs`, `ownerReports`, `tickets`) y las del buscador con IA |
| `properties.ts` | `properties:list`: propiedades publicadas, en orden |
| `leads.ts` | `leads:create`: guarda una solicitud (valida, recorta, descarta spam con un campo trampa y limita a 3 envíos por correo por hora y 20 por minuto en todo el sitio) y programa el aviso por correo |
| `notify.ts` | `notify:newLead`: envía al equipo un correo con la solicitud (Resend); "Responder" le escribe directo al cliente |
| `mail.ts` | Envío de correos con Resend, compartido por los avisos y los códigos de acceso |
| `auth.ts`, `authEmail.ts`, `auth.config.ts` | Acceso al panel y al portal de clientes (Convex Auth): código por correo, correo y contraseña, o Google. Solo entran los correos del equipo y los que el equipo agregó a un expediente |
| `access.ts` | Lista del equipo (`ADMIN_EMAILS`) y qué expedientes puede ver cada persona, revisado en cada llamada |
| `portal.ts` | Portal de clientes: sus expedientes, mensajes, subir documentos (PDF, fotos, Word, Excel; hasta 15 MB) y reportar mantenimiento, con límites por hora y por día |
| `portalTeam.ts` | Lado del equipo: crear expedientes, dar o quitar acceso por correo, etapas y fechas, reportes mensuales, mantenimiento, borrar documentos o expedientes |
| `portalNotify.ts` | Correos del portal: invitación, aviso al cliente cuando hay novedades (sin detalles, máximo uno cada 30 min) y aviso al equipo cuando el cliente escribe, sube o reporta algo |
| `http.ts` | Rutas de Convex Auth y la descarga de documentos del portal (solo con sesión y acceso al expediente; los archivos no tienen enlace público) |
| `team.ts` | Funciones del panel: listar y filtrar solicitudes, conteos, detalle, cambiar estado, notas |
| `admin.ts` | Internas, solo desde la terminal: `admin:deleteLeads` (borra solicitudes y sus notas) y `admin:deleteUser` (borra los datos de acceso de una persona) |
| `ai.ts` | Buscador con IA: `ai:search` lee la búsqueda con un modelo de lenguaje (Claude) y devuelve filtros, las propiedades que mejor encajan y el motivo de cada una. Guarda cada respuesta 24 h y limita las llamadas por minuto y por día |
| `seed.ts` | `seed:properties`: carga o actualiza las 11 propiedades de ejemplo (por slug) |

```bash
npm run convex                              # npx convex dev: enlaza y sube funciones (primera vez: inicia sesión)
npm run seed                                # carga las propiedades en el entorno de desarrollo
npx convex run seed:properties --prod       # igual, en producción
npx convex data leads                       # ver las solicitudes recibidas
```

- Con `NEXT_PUBLIC_CONVEX_URL` (en `.env.local`; `npx convex dev` escribe la misma URL como `VITE_CONVEX_URL`, cópiela si cambia) el servidor lee las propiedades de Convex para dibujar cada página y el navegador se mantiene suscrito para verlas al día. `<html data-listings="database">` confirma la fuente.
- Sin esa variable (o con la base vacía) usa las propiedades de ejemplo de `src/data/`, así nunca queda en blanco.
- **Aviso por correo:** se activa por entorno con variables de Convex. Sin ellas, la solicitud se guarda igual y el registro de Convex indica que los avisos están apagados.
  ```bash
  npx convex env set RESEND_API_KEY re_xxx --prod
  npx convex env set NOTIFY_EMAIL ventas@ejemplo.com --prod       # varios: separados por coma
  npx convex env set NOTIFY_FROM "Soluciones Inmobiliarias CR <avisos@su-dominio.cr>" --prod   # opcional, requiere dominio verificado en Resend
  ```
  Sin `NOTIFY_FROM` se envía desde `onboarding@resend.dev`, que Resend solo permite hacia el correo de la cuenta de Resend.
- Las solicitudes solo se leen en el panel del equipo (abajo), con sesión iniciada. Ninguna función pública las devuelve sin sesión.
- **Buscador con IA:** se activa con la clave de la API de Anthropic en cada entorno. Sin ella, el buscador funciona solo con las reglas.
  ```powershell
  Get-Clipboard | npx convex env set ANTHROPIC_API_KEY            # desarrollo
  Get-Clipboard | npx convex env set ANTHROPIC_API_KEY --prod     # producción
  ```
  Opcionales: `AI_SEARCH_MODEL` (por defecto `claude-opus-5-5`), `AI_SEARCH_DAILY_LIMIT` (llamadas al modelo por día de Costa Rica, por defecto 300) y `AI_SEARCH_MINUTE_LIMIT` (por minuto en todo el sitio, por defecto 20). Las búsquedas repetidas en 24 h salen de la base de datos y no cuentan. Cada llamada deja en el registro de Convex el modelo, el tiempo y los tokens usados (no el texto buscado). La tabla `aiSearches` guarda un código derivado de la búsqueda, no el texto.

## Panel del equipo (`/panel`)

Página privada en `https://<dominio>/panel` (en español `/es/panel`) (no aparece en el menú y no se indexa). Tiene dos secciones:

- **Solicitudes:** lista las solicitudes con filtros por estado, interés, fecha y texto; muestra el detalle, permite cambiar el estado (`Nueva` / `Contactada` / `Cerrada`, con quién y cuándo) y escribir notas de seguimiento. Se actualiza sola cuando llega una solicitud.
- **Portal de clientes:** un expediente por cada compra en curso o propiedad administrada. Se indica quién lo puede ver (hasta 6 correos), y el equipo ve lo mismo que el cliente más sus controles: etapa y fechas de la compra, novedades, documentos, reportes mensuales y estado de cada arreglo. Marca los expedientes donde el cliente hizo algo nuevo y la última visita de cada persona.

Va en un archivo aparte, así que los visitantes del sitio no lo descargan.

## Portal de clientes (`/portal`)

Área privada en `https://<dominio>/portal` (en español `/es/portal`) (enlace en el pie de página; no se indexa). El cliente entra con el correo que el equipo agregó a su expediente, con las mismas tres formas que el panel, y solo ve sus expedientes:

- **Compra:** las cinco etapas (oferta, estudio registral, escrow, firma, inscripción) con qué pasa y qué hace el cliente en cada una, fechas, precio, depósito en escrow y saldo, y los documentos de cada etapa.
- **Propiedad administrada:** alquiler cobrado, gastos y neto de los últimos 12 meses, gráfico del neto por mes (con tabla), y mantenimiento: lo que está abierto, programado o resuelto, y un formulario para reportar algo.
- En los dos: mensajes con el equipo y documentos. El cliente puede subir identificación, origen de los fondos u otros; el equipo, cualquier categoría.

`/portal/demo` muestra lo mismo con datos ficticios y sin entrar: sirve para enseñarlo. Lo que se escribe o sube ahí no sale del navegador.

Seguridad: el servidor revisa en cada llamada que el correo con sesión esté en el expediente (o en `ADMIN_EMAILS`); quitar un correo corta el acceso de inmediato. Un expediente ajeno responde igual que uno inexistente. Los documentos se descargan por una ruta que exige la sesión, y se rechazan archivos de más de 15 MB o de otros tipos. Los correos al cliente no llevan montos, mensajes ni archivos: solo avisan que hay novedades.

**Quién entra:** solo los correos de `ADMIN_EMAILS`. El servidor lo revisa en cada consulta, así que quitar un correo de la lista corta el acceso de inmediato.

```bash
npx convex env set ADMIN_EMAILS "ventas@ejemplo.com,otra.persona@ejemplo.com" --prod
```

**Formas de entrar** (se activan por entorno; la pantalla de acceso indica cuáles faltan):

| Forma | Necesita |
|---|---|
| Código de 8 dígitos por correo | `RESEND_API_KEY` (la misma de los avisos) |
| Correo y contraseña (mín. 10 caracteres; el correo se confirma una vez con un código, y "¿Olvidó su contraseña?" usa otro código) | `RESEND_API_KEY` |
| Cuenta de Google | `AUTH_GOOGLE_ID` y `AUTH_GOOGLE_SECRET` |

Google: en Google Cloud Console → APIs y servicios → Credenciales → Crear ID de cliente de OAuth → Aplicación web.
- Orígenes autorizados: `https://soluciones-inmobiliarias-cr-production.up.railway.app` (y `http://localhost:5173` para desarrollo).
- URI de redireccionamiento: `https://modest-dogfish-981.convex.site/api/auth/callback/google` (producción) y `https://fantastic-axolotl-351.convex.site/api/auth/callback/google` (desarrollo).

Para que las claves no queden en el historial de la terminal, cópielas y páselas por la entrada estándar (PowerShell):

```powershell
Get-Clipboard | npx convex env set AUTH_GOOGLE_SECRET --prod
```

**Ya configurado en cada entorno:** `JWT_PRIVATE_KEY` y `JWKS` (firma de las sesiones, distintas en desarrollo y producción) y `SITE_URL` (`http://localhost:5173` en desarrollo, el dominio de Railway en producción). Si el sitio pasa a un dominio propio, cambie `SITE_URL` en producción; si no, la entrada con Google regresa al dominio anterior.

**Quitar a alguien:** sáquelo de `ADMIN_EMAILS` (corta el acceso) y, si quiere borrar sus datos de acceso, `npx convex run admin:deleteUser '{"email":"persona@ejemplo.com"}' --prod`. Sus notas se conservan.

## Despliegue

El `Dockerfile` de la raíz del repositorio compila este proyecto y lo corre como un servidor de Node (salida `standalone` de Next) en el puerto de la variable `PORT`. Railway lo detecta al importar el repositorio; ver el README de la raíz.

- **Páginas:** las públicas se generan al compilar (las dos versiones de idioma de cada ficha, proyecto y guía) y se renuevan cada 5 minutos con lo que haya en Convex. Una propiedad nueva se dibuja la primera vez que alguien la abre.
- **Mapa:** `npm run build` y `npm run dev` copian antes el *worker* de MapLibre a `public/maplibre/` (`scripts/copy-map-worker.mjs`), porque el empaquetador de Next no lo publica.
- **Conocido:** las direcciones que no existen responden 404 y muestran la página de "no encontramos esa página", pero esa página la dibuja el navegador (Next no la genera en el servidor cuando el diseño raíz está por idioma). No afecta a los buscadores.

## Pantallas y direcciones

| Inglés | Español | Pantalla |
|---|---|---|
| `/` | `/es` | Inicio: video de drone, buscador en lenguaje natural, zonas con scroll, verificación, costos, maquinaria, testimonios |
| `/properties` | `/es/propiedades` | Listado con buscador con IA, filtros y mapa real sincronizados |
| `/properties/<slug>` | `/es/propiedades/<slug>` | Ficha: galería, tour 360°, plano interactivo, ubicación en el mapa, costos, rentabilidad, estado legal, solicitud de visita |
| `/calculator`, `/calculator/<slug>` | `/es/calculadora`, `/es/calculadora/<slug>` | Calculadora de costo real: cierre, hipoteca, impuestos, residencia de inversionista, rentabilidad |
| `/guides` | `/es/guias` | Guías para comprar: las cuatro guías y un glosario con buscador |
| `/guides/<slug>` | `/es/guias/<slug>` | Guía: `buying-process`, `maritime-zone`, `investor-residency`, `taxes`. Índice lateral, barra de lectura, piezas interactivas, preguntas frecuentes y fuentes |
| `/projects` | `/es/proyectos` | Proyectos y preventas: proyectos por etapa (lanzamiento, en construcción, entregados), cómo funciona una preventa, lista de espera |
| `/projects/<slug>` | `/es/proyectos/<slug>` | Ficha de proyecto: avance de obra por hitos, tipologías con plano (o diagrama del lote), plan de pagos ligado a los hitos, ubicación, solicitud de lista de precios |
| `/sell` | `/es/vender` | Vende con nosotros: por qué vender con la empresa, qué incluye cada ficha, estimador de valor por zona y m², proceso, documentos, cierre y solicitud de valoración |
| `/land-and-build` | `/es/land-and-build` | Land & Build: servicios, flota, proceso, estimador de viajes de vagoneta, cotización |
| `/about` | `/es/nosotros` | Nosotros: historia, zonas y líneas de trabajo sobre el mapa, respaldo, equipo, red de aliados, testimonios y formulario dirigido a una persona del equipo |
| `/saved` | `/es/guardadas` | Guardadas: comparador lado a lado, "solo diferencias", enlace para compartir y solicitud de visitas |
| `/compare/<slug>,<slug>` | `/es/comparar/<slug>,<slug>` | Lista compartida por enlace: se compara igual y se puede guardar en la lista propia |
| `/contact`, `/contact/<tema>` | `/es/contacto`, `/es/contacto/<tema>` | Contacto |
| `/panel` | `/es/panel` | Panel privado del equipo: solicitudes y expedientes del portal de clientes |
| `/portal` | `/es/portal` | Portal de clientes: avance de la compra, documentos, mensajes, reportes y mantenimiento |
| `/portal/demo` | `/es/portal/demo` | El portal con datos ficticios, sin entrar |

Las direcciones se arman en un solo lugar (`src/lib/routes.ts`); las vistas usan rutas (`{ name: 'property', slug }`) y `Link`/`navigate` de `src/lib/router.tsx` las convierten en la dirección del idioma activo. Los enlaces viejos con `#` (`#property-…`, `#compare-…`, que siguen llegando por WhatsApp o correo) se redirigen solos a la dirección nueva.

**SEO:** cada página pública sale del servidor con su contenido, título, descripción, enlace canónico, su versión en el otro idioma (`hreflang`) e imagen para compartir; las fichas llevan datos estructurados `RealEstateListing`, las guías `Article` y `FAQPage`, y el inicio `RealEstateAgent` (`src/lib/meta.ts`). `/sitemap.xml` lista todas las páginas en los dos idiomas y `/robots.txt` deja fuera el panel y el portal. Guardadas, listas compartidas y la calculadora de una propiedad llevan `noindex`.

## Estructura

```
src/
  app/         rutas de Next: [lang]/ (diseño raíz por idioma), (site)/[[...path]] (todas las páginas públicas), panel/, portal/, sitemap.ts, robots.ts
  proxy.ts     idioma en la dirección: lo que no empieza con /es se sirve en inglés; la primera visita al inicio sigue el idioma del navegador
  data/        properties.ts (11 propiedades de ejemplo), projects.ts (5 proyectos y el cálculo del plan de pagos), company.ts (zonas con precio por m², asesores, maquinaria, testimonios), about.ts (historia, equipo, aliados), leadOptions.ts (opciones de los formularios), media.json (generado)
  lib/         routes (direcciones por idioma), router (Link y navigate sobre Next), meta (SEO por página), listings (propiedades desde Convex en el servidor), store (moneda, favoritos, búsqueda y respuesta de la IA), search (filtros y parser por reglas), costs (modelo de costos CR), valuation (estimador de valor para vendedores)
  components/  piezas reutilizables: tarjeta, mapa, 360°, plano, galería, formulario, cursor, curvas de nivel, entrada (SignIn, compartida por panel y portal); portal/ (vista de un expediente, gráfico de reportes)
  views/       una por pantalla (cliente); PageView elige la vista según la ruta
  styles/      base.css (tokens), components.css, pages.css
scripts/       fetch-media.mjs, copy-map-worker.mjs, trace-logo.mjs, make-brand-assets.mjs
public/media/  fotos (webp), panorámicas 360° y video
```

## Qué está simulado

- **Datos:** propiedades, cifras de la empresa, testimonios, números de folio y plano son de ejemplo.
- **Proyectos y preventas:** los 5 proyectos, sus precios, fechas, avance e informes de obra son ficticios y viven en `src/data/projects.ts` (no en Convex). El plan de pagos sigue un esquema común de preventa (reserva, 10–20% al firmar, pagos por hito y saldo contra entrega). Los hitos ya cumplidos se cobran al firmar. Las menciones a escrow y retiros deben pasar por la revisión legal (COD-9).
- **Vende con nosotros:** el estimador (`src/lib/valuation.ts`) ubica la propiedad dentro del rango de precio por m² de su zona (`company.ts`): construido para casas y apartamentos, de terreno para lotes de hasta 1 ha. Parte de un punto según el tipo y lo mueve por estado, tamaño, vista y piscina; muestra cada ajuste y compara con las propiedades publicadas de la misma zona. Los rangos de terrenos y el de Alajuela son estimaciones propias. Las cifras del encabezado (días hasta la oferta, % del precio pedido, compradores del exterior), los testimonios de vendedores y la política de comisión al cierre son de ejemplo y debe confirmarlos el cliente. La retención del 2,5% a vendedores no domiciliados, las reglas de ganancias de capital y los documentos pedidos deben pasar por la revisión legal (COD-9).
- **Nosotros:** la historia (fechas e hitos), el equipo de 15 personas (nombres, cargos, idiomas, año de ingreso) y la red de aliados (cantidades y en qué etapa participan) son de ejemplo y viven en `src/data/about.ts`. La página no destaca a ninguna persona: la marca es la empresa. La afiliación a la CCCBR, la inscripción ante SUGEF (art. 15 bis de la Ley 7786) y sus fechas deben confirmarlas el cliente y la revisión legal (COD-9) antes de publicar. El botón "Escribirle a…" solo agrega el nombre de la persona a la solicitud; no la envía a su correo.
- **Guías:** el contenido vive en `src/data/guides.ts` (bilingüe, separado del diseño para reutilizarlo en COD-18). Se basa en el informe del cliente y se verificó con fuentes oficiales el 14 de noviembre de 2026. Dos datos del informe ya no estaban vigentes y se corrigieron en todo el sitio: el plazo para pedir los incentivos fiscales de la Ley 9996 (20% menos de traspaso, menaje, vehículos) cerró el 14 de julio de 2026, y la retención del 2% a vendedores domiciliados se derogó en octubre de 2025 (queda la del 2,5% a no domiciliados). La calculadora aplica el 20% solo si el usuario indica que ya tiene esos beneficios. Cada guía tiene su propia dirección en los dos idiomas, con título, descripción y datos estructurados (Article y FAQPage) generados en el servidor. Todo el texto legal y tributario pasa por la revisión legal (COD-9).
- **Guardadas y comparador:** la lista vive en el navegador (`localStorage`, clave `sicr.saved`), no en una cuenta; para verla en otro dispositivo se comparte el enlace `/compare/…`, que solo lleva los códigos de las propiedades. Las cifras usan el mismo modelo de `src/lib/costs.ts` que la ficha y la calculadora (préstamo en dólares al 7,5% a 25 años). Una lista sincronizada con cuenta llegaría con el portal de cliente (COD-16).
- **Buscador con IA:** al buscar, las reglas (`src/lib/search.ts`, inglés y español) filtran al instante y, si `ANTHROPIC_API_KEY` está configurada, `convex/ai.ts` le pasa la búsqueda y el catálogo publicado al modelo. Su respuesta reemplaza los filtros (salvo que el visitante ya los haya cambiado), ordena por "Mejor coincidencia" y pone en cada tarjeta elegida el motivo, en el idioma de la página. También muestra los deseos que no son filtros ("calle tranquila") y una nota cuando nada coincide o la zona está fuera del Valle Central. Si el modelo no está configurado, llega a su límite, tarda más de 25 s o falla, quedan las reglas. Los atajos del sitio (zonas, "ver lotes", "aptas para residencia") usan solo las reglas.
- **Portal de clientes:** funciona de verdad con Convex (expedientes, acceso, archivos y correos), pero no tiene expedientes cargados: el equipo los crea en el panel. La demostración (`/portal/demo`, datos en `src/data/portal.ts`) usa una compra y un apartamento administrado ficticios. Los textos de las etapas, la comisión de administración del 10% que propone el formulario de reportes y la advertencia sobre transferencias deben confirmarlos el cliente y la revisión legal (COD-9).
- **Formularios:** guardan la solicitud en Convex y avisan por correo cuando Resend está configurado. Sin base de datos solo validan.
- **Mapa:** real, con MapLibre y las teselas abiertas de OpenFreeMap (estilo Positron, teñido con la paleta del sitio; sin clave ni costo). Las ubicaciones de las propiedades de ejemplo son aproximadas. Si el tráfico crece, conviene un proveedor con acuerdo de servicio (MapTiler, Stadia) cambiando una línea en `src/components/MapView.tsx`.
- **Link de artifact:** la versión publicada como artifact de claude.ai (Fase 1) quedó congelada: el sitio ya no se compila como página única.
- **Tour 360° y video:** material libre de ejemplo (ver `CREDITS.md`).

## Idiomas

El sitio está completo en inglés y español (selector EN/ES en el encabezado y en el menú móvil), cada idioma con sus propias direcciones (`/properties` y `/es/propiedades`). La primera visita al inicio abre en español si el navegador está en español; al cambiar de idioma, la elección se guarda (cookie `sicr_lang`) y el selector lleva a la misma página en el otro idioma.

- Textos de interfaz: en línea con `tx('English', 'Español')` (`src/lib/i18n.tsx`).
- Datos: `company.ts` usa `{ en, es }`; las propiedades se traducen en `src/data/properties.es.ts`.
- El buscador entiende ambos idiomas y responde en el idioma activo.

## Para producción

- Validar con un abogado las cifras legales y tributarias de `src/lib/costs.ts` y de los textos.
- Reemplazar las fotos por material propio y conectar un CMS o CRM para las propiedades.
