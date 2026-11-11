# Soluciones Inmobiliarias CR — prototipo Fase 1

Prototipo interactivo de alta fidelidad del sitio de Soluciones Inmobiliarias CR (bienes raíces y maquinaria en el Valle Central). Dirección visual: "Solid ground in Costa Rica".

## Correr el proyecto

```bash
npm install
npm run dev        # servidor local en http://localhost:5173
npm run typecheck  # verificación de tipos
npm run build      # build de producción en dist/
npm run artifact   # build + página única en artifact/ (para publicar como link)
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

`index.html` trae etiquetas Open Graph con la imagen `public/og-image.jpg` (1200 × 630). Como WhatsApp exige URLs absolutas, las etiquetas usan `__SITE_URL__` y nginx lo reemplaza por `https://<dominio>` al servir la página (ver `deploy/nginx.conf.template`). Funciona con el dominio de Railway y con un dominio propio sin cambiar nada.

## Base de datos (Convex)

Proyecto Convex: **soluciones-inmobiliarias-cr**. Funciones en `convex/`:

| Archivo | Qué hace |
|---|---|
| `schema.ts` | Tablas `properties` (fichas con textos EN/ES, orden y publicación) y `leads` (solicitudes de los formularios) |
| `properties.ts` | `properties:list`: propiedades publicadas, en orden |
| `leads.ts` | `leads:create`: guarda una solicitud (valida, recorta, descarta spam con un campo trampa y limita a 3 envíos por correo por hora y 20 por minuto en todo el sitio) y programa el aviso por correo |
| `notify.ts` | `notify:newLead`: envía al equipo un correo con la solicitud (Resend); "Responder" le escribe directo al cliente |
| `mail.ts` | Envío de correos con Resend, compartido por los avisos y los códigos de acceso |
| `auth.ts`, `authEmail.ts`, `auth.config.ts`, `http.ts` | Acceso al panel (Convex Auth): código por correo, correo y contraseña, o Google |
| `access.ts` | Lista del equipo (`ADMIN_EMAILS`) y verificación en cada llamada del panel |
| `team.ts` | Funciones del panel: listar y filtrar solicitudes, conteos, detalle, cambiar estado, notas |
| `admin.ts` | Internas, solo desde la terminal: `admin:deleteLeads` (borra solicitudes y sus notas) y `admin:deleteUser` (borra los datos de acceso de una persona) |
| `seed.ts` | `seed:properties`: carga o actualiza las 11 propiedades de ejemplo (por slug) |

```bash
npm run convex                              # npx convex dev: enlaza y sube funciones (primera vez: inicia sesión)
npm run seed                                # carga las propiedades en el entorno de desarrollo
npx convex run seed:properties --prod       # igual, en producción
npx convex data leads                       # ver las solicitudes recibidas
```

- Con `VITE_CONVEX_URL` (en `.env.local`, lo crea `npx convex dev`) el sitio lee las propiedades de Convex y guarda los formularios. `<html data-listings="database">` confirma la fuente.
- Sin esa variable (o con la base vacía) usa las propiedades de ejemplo de `src/data/`, así nunca queda en blanco.
- **Aviso por correo:** se activa por entorno con variables de Convex. Sin ellas, la solicitud se guarda igual y el registro de Convex indica que los avisos están apagados.
  ```bash
  npx convex env set RESEND_API_KEY re_xxx --prod
  npx convex env set NOTIFY_EMAIL ventas@ejemplo.com --prod       # varios: separados por coma
  npx convex env set NOTIFY_FROM "Soluciones Inmobiliarias CR <avisos@su-dominio.cr>" --prod   # opcional, requiere dominio verificado en Resend
  ```
  Sin `NOTIFY_FROM` se envía desde `onboarding@resend.dev`, que Resend solo permite hacia el correo de la cuenta de Resend.
- Las solicitudes solo se leen en el panel del equipo (abajo), con sesión iniciada. Ninguna función pública las devuelve sin sesión.
- `npm run artifact` compila en modo `artifact` (`.env.artifact`) sin base de datos, porque el visor de artifacts bloquea conexiones externas.

## Panel del equipo (`#panel`)

Página privada en `https://<dominio>/#panel` (no aparece en el menú y no se indexa). Lista las solicitudes con filtros por estado, interés, fecha y texto; muestra el detalle, permite cambiar el estado (`Nueva` / `Contactada` / `Cerrada`, con quién y cuándo) y escribir notas de seguimiento. Se actualiza sola cuando llega una solicitud. Va en un archivo aparte, así que los visitantes del sitio no lo descargan.

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

El `Dockerfile` de la raíz del repositorio compila este proyecto y lo sirve con nginx (`deploy/nginx.conf.template`) en el puerto de la variable `PORT`. Railway lo detecta al importar el repositorio; ver el README de la raíz.

## Pantallas (Fase 1)

| Ruta | Pantalla |
|---|---|
| `#home` | Inicio: video de drone, buscador en lenguaje natural, zonas con scroll, verificación, costos, maquinaria, testimonios |
| `#search` | Listado con filtros y mapa ilustrado sincronizados |
| `#property-<slug>` | Ficha: galería, tour 360°, plano interactivo, ubicación, costos, rentabilidad, estado legal, solicitud de visita |
| `#calculator` / `#calculator-<slug>` | Calculadora de costo real: cierre, hipoteca, impuestos, residencia (Ley 9996), rentabilidad |
| `#projects` | Proyectos y preventas: proyectos por etapa (lanzamiento, en construcción, entregados), cómo funciona una preventa, lista de espera |
| `#project-<slug>` | Ficha de proyecto: avance de obra por hitos, tipologías con plano (o diagrama del lote), plan de pagos ligado a los hitos, ubicación, solicitud de lista de precios |
| `#build` | Land & Build: servicios, flota, proceso, estimador de viajes de vagoneta, cotización |
| `#contact` | Contacto |
| `#panel` | Panel privado del equipo (solicitudes) |

## Estructura

```
src/
  data/        properties.ts (11 propiedades de ejemplo), projects.ts (5 proyectos y el cálculo del plan de pagos), company.ts (zonas, asesores, maquinaria), leadOptions.ts (opciones de los formularios), media.json (generado)
  lib/         router (hash + View Transitions), store (moneda, favoritos, búsqueda), search (parser de lenguaje natural), costs (modelo de costos CR)
  components/  piezas reutilizables: tarjeta, mapa, 360°, plano, galería, formulario, cursor, curvas de nivel
  pages/       una por pantalla
  styles/      base.css (tokens), components.css, pages.css
scripts/       fetch-media.mjs, build-artifact.mjs
public/media/  fotos (webp), panorámicas 360° y video
```

## Qué está simulado

- **Datos:** propiedades, cifras de la empresa, testimonios, números de folio y plano son de ejemplo.
- **Proyectos y preventas:** los 5 proyectos, sus precios, fechas, avance e informes de obra son ficticios y viven en `src/data/projects.ts` (no en Convex). El plan de pagos sigue un esquema común de preventa (reserva, 10–20% al firmar, pagos por hito y saldo contra entrega). Los hitos ya cumplidos se cobran al firmar. Las menciones a escrow y retiros deben pasar por la revisión legal (COD-9).
- **Buscador "IA":** es un parser por reglas (`src/lib/search.ts`) que entiende inglés y español. En producción se reemplaza por un modelo de lenguaje con el mismo contrato (`texto → filtros + explicación`).
- **Formularios:** guardan la solicitud en Convex y avisan por correo cuando Resend está configurado. En el artifact (sin base de datos) solo validan.
- **Mapa:** ilustrado, con posiciones aproximadas. Para producción se recomienda MapLibre con teselas reales.
- **Tour 360° y video:** material libre de ejemplo (ver `CREDITS.md`).

## Idiomas

El sitio está completo en inglés y español (selector EN/ES en el encabezado y en el menú móvil). La primera visita abre en español si el navegador está en español; si no, en inglés. La elección se guarda en el navegador.

- Textos de interfaz: en línea con `tx('English', 'Español')` (`src/lib/i18n.tsx`).
- Datos: `company.ts` usa `{ en, es }`; las propiedades se traducen en `src/data/properties.es.ts`.
- El buscador entiende ambos idiomas y responde en el idioma activo.

## Para producción

- Migrar a Next.js (SEO de fichas de propiedad) reutilizando `components/`, `lib/` y `styles/`.
- Validar con un abogado las cifras legales y tributarias de `src/lib/costs.ts` y de los textos.
- Reemplazar las fotos por material propio y conectar un CMS o CRM para las propiedades.
