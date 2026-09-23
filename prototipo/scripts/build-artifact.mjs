// Turns the Vite build (dist/) into a single-page artifact: CSS and JS inlined into
// artifact/index.html, media left as separate files under dist/media/.
// Usage: npm run artifact
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const dist = new URL('dist/', root);
const html = await readFile(new URL('index.html', dist), 'utf8');

const title = html.match(/<title>[\s\S]*?<\/title>/)?.[0] ?? '<title>Soluciones Inmobiliarias CR</title>';
const meta = html.match(/<meta name="description"[^>]*>/)?.[0] ?? '';
const fontLinks = [...html.matchAll(/<link[^>]+fonts\.(googleapis|gstatic)\.com[^>]*>/g)].map(m => m[0]).join('\n');
const jsSrc = html.match(/<script type="module"[^>]*src="\.\/(assets\/[^"]+\.js)"/)?.[1];
const cssHref = html.match(/<link rel="stylesheet"[^>]*href="\.\/(assets\/[^"]+\.css)"/)?.[1];
if (!jsSrc || !cssHref) throw new Error('Could not find the built JS/CSS in dist/index.html');

const css = await readFile(new URL(cssHref, dist), 'utf8');
const js = (await readFile(new URL(jsSrc, dist), 'utf8')).replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');

const page = `${title}
${meta}
${fontLinks}
<style>${css}</style>
<div id="root"></div>
<script type="module">${js}</script>
`;

const outDir = new URL('artifact/', root);
await mkdir(outDir, { recursive: true });
await writeFile(new URL('index.html', outDir), page);
const media = await readdir(new URL('media/', dist));
console.log(`artifact/index.html: ${Math.round(page.length / 1024)} KB, ${media.length} media files in dist/media`);
