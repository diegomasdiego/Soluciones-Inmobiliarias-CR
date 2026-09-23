// Generates the favicon set, the Open Graph share image (WhatsApp, Facebook…) and brand files,
// all from the client's logo (src/data/logo.ts, produced by scripts/trace-logo.mjs) in the site palette.
// Usage: node scripts/make-brand-assets.mjs   (downloads the OFL brand fonts on first run)
import sharp from 'sharp';
import { mkdir, writeFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { LOGO } from '../src/data/logo.ts';

const root = new URL('../', import.meta.url);
const pub = new URL('public/', root);
const brand = new URL('brand/', root);
const cache = new URL('scripts/.cache/', root);
await mkdir(cache, { recursive: true });
await mkdir(brand, { recursive: true });

const fonts = {
  serif: ['InstrumentSerif-Regular.ttf', 'instrumentserif/InstrumentSerif-Regular.ttf'],
  serifItalic: ['InstrumentSerif-Italic.ttf', 'instrumentserif/InstrumentSerif-Italic.ttf'],
  sans: ['HankenGrotesk[wght].ttf', 'hankengrotesk/HankenGrotesk%5Bwght%5D.ttf'],
};
const fontPath = {};
for (const [key, [file, remote]] of Object.entries(fonts)) {
  const url = new URL(file.replace('[', '%5B').replace(']', '%5D'), cache);
  try { await access(url); } catch {
    const res = await fetch(`https://github.com/google/fonts/raw/main/ofl/${remote}`);
    if (!res.ok) throw new Error(`Font download failed: ${remote}`);
    await writeFile(url, Buffer.from(await res.arrayBuffer()));
  }
  fontPath[key] = fileURLToPath(url);
}

const C = { basalto: '#151B18', cafetal: '#1E4A3B', niebla: '#EDF0EB', guariaLight: '#D9B3E6', mist: '#F4F6F2', sage: '#C9D6CD' };
const ALL = Object.values(LOGO.paths).join(' ');
const grad = (id, a, b) => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;

// ---------- Logo SVG builders ----------
/** Full circular emblem. disc = background circle color or null for linework only. */
function badgeSvg({ disc, from, to, size }) {
  const [x, y, w, h] = LOGO.box.badge;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}"${size ? ` width="${size}" height="${size}"` : ''}>
<defs>${grad('g', from, to)}</defs>
${disc ? `<circle cx="${LOGO.size / 2}" cy="${LOGO.size / 2}" r="${w / 2}" fill="${disc}"/>` : ''}
<path d="${ALL}" fill="url(#g)" fill-rule="evenodd"/>
</svg>`;
}

/** Horizontal lockup: building + three lines of lettering (same layout as the site header). */
function lockupSvg(color) {
  const [, , mw, mh] = LOGO.box.mark;
  const keys = ['line1', 'line2', 'line3'];
  const GAP1 = 30, GAP2 = 26, MARK_GAP = 110;
  const textH = LOGO.box.line1[3] + GAP1 + LOGO.box.line2[3] + GAP2 + LOGO.box.line3[3];
  const s = mh / textH;
  const textW = Math.max(...keys.map(k => LOGO.box[k][2])) * s;
  const x0 = mw + MARK_GAP;
  const part = (k, x, y, sc) => `<g transform="translate(${x} ${y}) scale(${sc}) translate(${-LOGO.box[k][0]} ${-LOGO.box[k][1]})"><path d="${LOGO.paths[k]}" fill-rule="evenodd"/></g>`;
  let y = 0;
  const lines = keys.map((k, i) => { const b = LOGO.box[k]; const out = part(k, x0 + (textW - b[2] * s) / 2, y, s); y += b[3] * s + (i === 0 ? GAP1 : GAP2) * s; return out; }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Math.ceil(x0 + textW)} ${mh}" fill="${color}">${part('mark', 0, 0, 1)}${lines}</svg>`;
}

/** Building mark only, centered in a square of side `side`, occupying `fill` of it. */
function markInSquare(side, fill, color) {
  const [bx, by, bw, bh] = LOGO.box.mark;
  const s = (side * fill) / Math.max(bw, bh);
  const x = (side - bw * s) / 2, y = (side - bh * s) / 2;
  return `<g transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${s.toFixed(5)}) translate(${-bx} ${-by})" fill="${color}"><path d="${LOGO.paths.mark}" fill-rule="evenodd"/></g>`;
}

// ---------- Brand files for the team ----------
await writeFile(new URL('logo-cafetal.svg', brand), badgeSvg({ disc: C.cafetal, from: C.mist, to: C.sage }));
await writeFile(new URL('logo-basalto.svg', brand), badgeSvg({ disc: C.basalto, from: C.mist, to: C.guariaLight }));
await writeFile(new URL('logo-on-light.svg', brand), badgeSvg({ disc: null, from: C.cafetal, to: '#2A6250' }));
await writeFile(new URL('logo-on-dark.svg', brand), badgeSvg({ disc: null, from: C.mist, to: C.guariaLight }));
await writeFile(new URL('lockup-on-light.svg', brand), lockupSvg(C.basalto));
await writeFile(new URL('lockup-on-dark.svg', brand), lockupSvg(C.niebla));
for (const name of ['logo-cafetal', 'logo-basalto']) {
  await sharp(fileURLToPath(new URL(`${name}.svg`, brand)), { density: 110 }).resize(1024, 1024).png().toFile(fileURLToPath(new URL(`${name}-1024.png`, brand)));
}

// ---------- Favicon and app icons ----------
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${C.cafetal}"/>${markInSquare(64, 0.74, C.niebla)}</svg>`;
await writeFile(new URL('favicon.svg', pub), faviconSvg);
await writeFile(new URL('favicon-32.png', pub), await sharp(Buffer.from(faviconSvg), { density: 144 }).resize(32, 32).png().toBuffer());

const appIcon = async size => {
  const inner = Math.round(size * 0.9);
  const badge = await sharp(Buffer.from(badgeSvg({ disc: null, from: C.mist, to: C.sage })), { density: 72 * (inner / 1182) * 2 }).resize(inner, inner).png().toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: C.cafetal } })
    .composite([{ input: badge, left: Math.round((size - inner) / 2), top: Math.round((size - inner) / 2) }]).png().toBuffer();
};
await writeFile(new URL('apple-touch-icon.png', pub), await appIcon(180));
await writeFile(new URL('icon-192.png', pub), await appIcon(192));
await writeFile(new URL('icon-512.png', pub), await appIcon(512));
await writeFile(new URL('site.webmanifest', pub), JSON.stringify({
  name: 'Soluciones Inmobiliarias CR',
  short_name: 'Soluciones',
  lang: 'es',
  icons: [
    { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
  ],
  theme_color: C.basalto,
  background_color: C.niebla,
  display: 'browser',
}, null, 2));

// ---------- Open Graph image (1200 × 630), in Spanish ----------
const W = 1200, H = 630;
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
async function text(str, { font, file, color = '#FFFFFF', spacing = 0 }) {
  const markup = `<span foreground="${color}"${spacing ? ` letter_spacing="${spacing}"` : ''}>${esc(str)}</span>`;
  const { data, info } = await sharp({ text: { text: markup, font, fontfile: file, rgba: true, dpi: 72 } }).png().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
}

function contours(cx, cy, rings, spacing, seed, color) {
  let paths = '';
  for (let k = 1; k <= rings; k++) {
    const r = k * spacing;
    let d = '';
    for (let i = 0; i <= 150; i++) {
      const th = (i / 150) * Math.PI * 2;
      const rr = r * (1 + 0.13 * Math.sin(3 * th + seed + k * 0.22) + 0.07 * Math.sin(5 * th - seed * 1.7 + k * 0.37) + 0.035 * Math.sin(9 * th + k * 0.5));
      d += `${i ? 'L' : 'M'}${(cx + rr * Math.cos(th) * 1.3).toFixed(1)},${(cy + rr * Math.sin(th) * 0.82).toFixed(1)}`;
    }
    const alpha = Math.max(0.22, 1 - k / (rings * 1.35));
    paths += `<path d="${d}Z" fill="none" stroke="${color}" stroke-opacity="${alpha.toFixed(2)}" stroke-width="1.2"/>`;
  }
  return paths;
}

const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="v" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0A0E0C" stop-opacity=".5"/>
      <stop offset=".4" stop-color="#0A0E0C" stop-opacity=".25"/>
      <stop offset="1" stop-color="#0A0E0C" stop-opacity=".9"/>
    </linearGradient>
    <linearGradient id="h" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#0A0E0C" stop-opacity=".6"/>
      <stop offset=".65" stop-color="#0A0E0C" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#v)"/>
  <rect width="${W}" height="${H}" fill="url(#h)"/>
  <g opacity=".28">${contours(990, 300, 18, 30, 0.4, '#E8EEE8')}</g>
  <rect x="64" y="${H - 64}" width="${W - 128}" height="1" fill="#FFFFFF" fill-opacity=".2"/>
</svg>`;

const bg = await sharp(fileURLToPath(new URL('media/hero-poster.webp', pub))).resize(W, H, { fit: 'cover', position: 'centre' }).toBuffer();
const BADGE = 330;
const badge = await sharp(Buffer.from(badgeSvg({ disc: C.basalto, from: C.mist, to: C.guariaLight })), { density: 72 * (BADGE / 1182) * 2 }).resize(BADGE, BADGE).png().toBuffer();
const shadow = await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${BADGE + 80}" height="${BADGE + 80}"><defs><filter id="b"><feGaussianBlur stdDeviation="18"/></filter></defs><circle cx="${(BADGE + 80) / 2}" cy="${(BADGE + 80) / 2 + 10}" r="${BADGE / 2}" fill="#000" fill-opacity=".45" filter="url(#b)"/></svg>`)).png().toBuffer();

const size = 112;
const line1a = await text('Terreno', { font: `Instrument Serif ${size}`, file: fontPath.serif });
const line1b = await text('firme', { font: `Instrument Serif Italic ${size}`, file: fontPath.serifItalic, color: C.guariaLight });
const line2 = await text('en Costa Rica.', { font: `Instrument Serif ${size}`, file: fontPath.serif });
const lead = await text('Casas, lotes y fincas verificados  ·  Maquinaria Land & Build', { font: 'Hanken Grotesk 24', file: fontPath.sans, color: '#E8EEE8' });
const areas = await text('ESCAZÚ  ·  SANTA ANA  ·  HEREDIA  ·  ALAJUELA', { font: 'Hanken Grotesk 14', file: fontPath.sans, color: '#C9D3CC', spacing: 2600 });

const headTop = 150;
const badgeLeft = W - 64 - BADGE, badgeTop = Math.round((H - 64 - BADGE) / 2) + 8;
await sharp(bg)
  .composite([
    { input: Buffer.from(overlay), left: 0, top: 0 },
    { input: shadow, left: badgeLeft - 40, top: badgeTop - 40 },
    { input: badge, left: badgeLeft, top: badgeTop },
    { input: line1a.data, left: 60, top: headTop },
    { input: line1b.data, left: 60 + line1a.w + Math.round(size * 0.24), top: headTop },
    { input: line2.data, left: 60, top: headTop + Math.round(line1a.h * 0.86) },
    { input: lead.data, left: 64, top: H - 64 - lead.h - 26 },
    { input: areas.data, left: 64, top: H - 64 + 18 },
  ])
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(fileURLToPath(new URL('og-image.jpg', pub)));

console.log('public: favicon.svg, favicon-32.png, apple-touch-icon.png, icon-192.png, icon-512.png, site.webmanifest, og-image.jpg');
console.log('brand: logo-cafetal/basalto (.svg, -1024.png), logo-on-light/dark.svg, lockup-on-light/dark.svg');
