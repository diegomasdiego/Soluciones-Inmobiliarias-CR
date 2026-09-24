# Soluciones Inmobiliarias CR — prototipo Fase 1

Prototipo interactivo de alta fidelidad del sitio de Soluciones Inmobiliarias CR (bienes raíces y maquinaria en el Valle Central). Dirección visual: "Solid ground in Costa Rica".

## Correr el proyecto

```bash
npm install
npm run dev        # servidor local en http://localhost:5173
npm run typecheck  # verificación de tipos
npm run build      # build de producción en dist/
npm run artifact   # build + página única en artifact/ (para publicar como link)
npm run media      # vuelve a descargar y optimizar fotos y video (ver CREDITS.md)
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
| `leads.ts` | `leads:create`: guarda una solicitud (valida, recorta y descarta spam con un campo trampa) |
| `seed.ts` | `seed:properties`: carga o actualiza las 11 propiedades de ejemplo (por slug) |

```bash
npm run convex                              # npx convex dev: enlaza y sube funciones (primera vez: inicia sesión)
npm run seed                                # carga las propiedades en el entorno de desarrollo
npx convex run seed:properties --prod       # igual, en producción
npx convex data leads                       # ver las solicitudes recibidas
```

- Con `VITE_CONVEX_URL` (en `.env.local`, lo crea `npx convex dev`) el sitio lee las propiedades de Convex y guarda los formularios. `<html data-listings="database">` confirma la fuente.
- Sin esa variable (o con la base vacía) usa las propiedades de ejemplo de `src/data/`, así nunca queda en blanco.
- Las solicitudes no se pueden leer desde el sitio: se revisan en el panel de Convex (tabla `leads`, campo `status`: `new` / `contacted` / `closed`).
- `npm run artifact` compila en modo `artifact` (`.env.artifact`) sin base de datos, porque el visor de artifacts bloquea conexiones externas.

## Despliegue

El `Dockerfile` de la raíz del repositorio compila este proyecto y lo sirve con nginx (`deploy/nginx.conf.template`) en el puerto de la variable `PORT`. Railway lo detecta al importar el repositorio; ver el README de la raíz.

## Pantallas (Fase 1)

| Ruta | Pantalla |
|---|---|
| `#home` | Inicio: video de drone, buscador en lenguaje natural, zonas con scroll, verificación, costos, maquinaria, testimonios |
| `#search` | Listado con filtros y mapa ilustrado sincronizados |
| `#property-<slug>` | Ficha: galería, tour 360°, plano interactivo, ubicación, costos, rentabilidad, estado legal, solicitud de visita |
| `#calculator` / `#calculator-<slug>` | Calculadora de costo real: cierre, hipoteca, impuestos, residencia (Ley 9996), rentabilidad |
| `#build` | Land & Build: servicios, flota, proceso, estimador de viajes de vagoneta, cotización |
| `#contact` | Contacto |

## Estructura

```
src/
  data/        properties.ts (11 propiedades de ejemplo), company.ts (zonas, asesores, maquinaria), media.json (generado)
  lib/         router (hash + View Transitions), store (moneda, favoritos, búsqueda), search (parser de lenguaje natural), costs (modelo de costos CR)
  components/  piezas reutilizables: tarjeta, mapa, 360°, plano, galería, formulario, cursor, curvas de nivel
  pages/       una por pantalla
  styles/      base.css (tokens), components.css, pages.css
scripts/       fetch-media.mjs, build-artifact.mjs
public/media/  fotos (webp), panorámicas 360° y video
```

## Qué está simulado

- **Datos:** propiedades, cifras de la empresa, testimonios, números de folio y plano son de ejemplo.
- **Buscador "IA":** es un parser por reglas (`src/lib/search.ts`) que entiende inglés y español. En producción se reemplaza por un modelo de lenguaje con el mismo contrato (`texto → filtros + explicación`).
- **Formularios:** validan pero no envían datos. Conectar a CRM o correo en producción.
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
