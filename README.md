# Soluciones Inmobiliarias CR

Sitio web de Soluciones Inmobiliarias CR: bienes raíces verificados en Escazú, Santa Ana, Heredia y Alajuela, y maquinaria (excavadoras, vagonetas, movimiento de tierras) para preparar lotes.

El prototipo interactivo de la Fase 1 está en [`prototipo/`](prototipo/README.md) (Vite + React + TypeScript).

## Desplegar en Railway

1. En Railway: **New Project → Deploy from GitHub repo** y elige este repositorio.
2. Railway detecta el `Dockerfile` de la raíz: compila `prototipo/` y lo sirve con nginx en el puerto que Railway asigna (`$PORT`). No hace falta configurar variables ni el directorio raíz.
3. En el servicio: **Settings → Networking → Generate Domain** para obtener la URL pública.

### Conectar la base de datos en producción (Convex)

1. En el panel de Convex, proyecto **soluciones-inmobiliarias-cr**: **Settings → URL & Deploy Key → Generate Production Deploy Key**.
2. En Railway, en el servicio: **Variables → New Variable** con nombre `CONVEX_DEPLOY_KEY` y la clave como valor. Railway vuelve a desplegar solo.
3. El build sube las funciones a producción y compila el sitio con la URL de producción. La primera vez la base de producción está vacía (el sitio muestra las propiedades de ejemplo) hasta cargarla con `npx convex run seed:properties --prod` desde `prototipo/`.

## Desarrollo local

```bash
cd prototipo
npm install
npm run dev
```
