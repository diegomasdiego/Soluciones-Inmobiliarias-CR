# Soluciones Inmobiliarias CR

Sitio web de Soluciones Inmobiliarias CR: bienes raíces verificados en Escazú, Santa Ana, Heredia y Alajuela, y maquinaria (excavadoras, vagonetas, movimiento de tierras) para preparar lotes.

El prototipo interactivo de la Fase 1 está en [`prototipo/`](prototipo/README.md) (Vite + React + TypeScript).

## Desplegar en Railway

1. En Railway: **New Project → Deploy from GitHub repo** y elige este repositorio.
2. Railway detecta el `Dockerfile` de la raíz: compila `prototipo/` y lo sirve con nginx en el puerto que Railway asigna (`$PORT`). No hace falta configurar variables ni el directorio raíz.
3. En el servicio: **Settings → Networking → Generate Domain** para obtener la URL pública.

## Desarrollo local

```bash
cd prototipo
npm install
npm run dev
```
