# Soluciones Inmobiliarias CR

Sitio web de Soluciones Inmobiliarias CR: bienes raíces verificados en Escazú, Santa Ana, Heredia y Alajuela, y maquinaria (excavadoras, vagonetas, movimiento de tierras) para preparar lotes.

El sitio está en [`prototipo/`](prototipo/README.md) (Next.js 16 + React + TypeScript, con Convex como base de datos), con direcciones propias en inglés (`/properties/…`) y español (`/es/propiedades/…`).

## Desplegar en Railway

1. En Railway: **New Project → Deploy from GitHub repo** y elige este repositorio.
2. Railway detecta el `Dockerfile` de la raíz: compila `prototipo/` con Next.js y lo corre como un servidor de Node en el puerto que Railway asigna (`$PORT`). No hace falta configurar variables ni el directorio raíz. Si el sitio pasa a un dominio propio, cambie `NEXT_PUBLIC_SITE_URL` en el `Dockerfile` (o como variable de Railway) para que los enlaces canónicos, el mapa del sitio y las vistas previas usen ese dominio.
3. En el servicio: **Settings → Networking → Generate Domain** para obtener la URL pública.

### Conectar la base de datos en producción (Convex)

1. En el panel de Convex, proyecto **soluciones-inmobiliarias-cr**: **Settings → URL & Deploy Key → Generate Production Deploy Key**.
2. En Railway, en el servicio: **Variables → New Variable** con nombre `CONVEX_DEPLOY_KEY` y la clave como valor. Railway vuelve a desplegar solo.
3. El build sube las funciones a producción y compila el sitio con la URL de producción (`NEXT_PUBLIC_CONVEX_URL=https://modest-dogfish-981.convex.cloud`, definida en el `Dockerfile`). Si ese paso falla, el build lo avisa en el registro y publica igual el sitio conectado a producción con las funciones que ya estaban desplegadas.
4. Para subir cambios de las funciones de Convex sin Railway: `npx convex deploy` desde `prototipo/`. Para recargar las propiedades de ejemplo: `npx convex run seed:properties --prod`.

## Desarrollo local

```bash
cd prototipo
npm install
npm run dev
```
