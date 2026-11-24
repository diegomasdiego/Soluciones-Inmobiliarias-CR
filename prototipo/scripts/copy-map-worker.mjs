// Copies MapLibre's web worker into public/maplibre/ so the site can serve it (Next's bundler
// does not emit it). Runs before `npm run dev` and `npm run build`. The file name carries the
// MapLibre version, so a new version never meets an old cached worker.
import { copyFileSync, mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = join(root, 'node_modules', 'maplibre-gl');
const { version } = JSON.parse(readFileSync(join(pkg, 'package.json'), 'utf8'));
const out = join(root, 'public', 'maplibre');
mkdirSync(out, { recursive: true });
for (const f of readdirSync(out)) if (f !== `worker-${version}.mjs`) rmSync(join(out, f));
copyFileSync(join(pkg, 'dist', 'maplibre-gl-worker.mjs'), join(out, `worker-${version}.mjs`));
console.log(`MapLibre worker ${version} copied to public/maplibre/.`);
