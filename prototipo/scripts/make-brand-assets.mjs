// Generates the favicon set and the Open Graph share image (WhatsApp, Facebook, LinkedIn…).
// Usage: node scripts/make-brand-assets.mjs   (downloads the OFL brand fonts on first run)
import sharp from 'sharp';
import { mkdir, writeFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const pub = new URL('public/', root);
const cache = new URL('scripts/.cache/', root);
await mkdir(cache, { recursive: true });

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

const C = { basalto: '#151B18', cafetal: '#1E4A3B', niebla: '#EDF0EB', guariaLight: '#D9B3E6' };

// ---------- Favicon ----------
const mark = (stroke, dot, sw) => `
  <g fill="none" stroke="${stroke}" stroke-width="${sw}">
    <ellipse cx="32" cy="36" rx="24" ry="16.5"/>
    <ellipse cx="31" cy="33" rx="16" ry="11"/>
    <ellipse cx="30.5" cy="30" rx="8.5" ry="6"/>
  </g>
  <circle cx="30" cy="28.6" r="2.6" fill="${dot}"/>`;
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${C.cafetal}"/>${mark(C.niebla, C.guariaLight, 3.4)}</svg>`;
await writeFile(new URL('favicon.svg', pub), faviconSvg);
const icon = (size, rounded = true) => {
  const svg = rounded ? faviconSvg : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="${C.cafetal}"/><g transform="translate(6.4 6.4) scale(.8)">${mark(C.niebla, C.guariaLight, 3.4)}</g></svg>`;
  return sharp(Buffer.from(svg), { density: 72 * (size / 64) * 2 }).resize(size, size).png().toBuffer();
};
await writeFile(new URL('favicon-32.png', pub), await icon(32));
await writeFile(new URL('apple-touch-icon.png', pub), await icon(180, false));
await writeFile(new URL('icon-192.png', pub), await icon(192, false));
await writeFile(new URL('icon-512.png', pub), await icon(512, false));
await writeFile(new URL('site.webmanifest', pub), JSON.stringify({
  name: 'Soluciones Inmobiliarias CR',
  short_name: 'Soluciones',
  icons: [
    { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
  ],
  theme_color: C.basalto,
  background_color: C.niebla,
  display: 'browser',
}, null, 2));

// ---------- Open Graph image (1200 × 630) ----------
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
      <stop offset="0" stop-color="#0A0E0C" stop-opacity=".55"/>
      <stop offset=".38" stop-color="#0A0E0C" stop-opacity=".2"/>
      <stop offset="1" stop-color="#0A0E0C" stop-opacity=".9"/>
    </linearGradient>
    <linearGradient id="h" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#0A0E0C" stop-opacity=".55"/>
      <stop offset=".7" stop-color="#0A0E0C" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#v)"/>
  <rect width="${W}" height="${H}" fill="url(#h)"/>
  <g opacity=".3">${contours(1060, 190, 20, 26, 0.4, '#E8EEE8')}</g>
  <g transform="translate(64 50) scale(.95)">${mark('#FFFFFF', C.guariaLight, 3.2)}</g>
  <rect x="64" y="${H - 64}" width="${W - 128}" height="1" fill="#FFFFFF" fill-opacity=".2"/>
</svg>`;

const bg = await sharp(fileURLToPath(new URL('media/hero-poster.webp', pub))).resize(W, H, { fit: 'cover', position: 'centre' }).modulate({ saturation: 1.05 }).toBuffer();

const wordmark = await text('Soluciones', { font: 'Instrument Serif 46', file: fontPath.serif });
const sub = await text('INMOBILIARIAS · CR', { font: 'Hanken Grotesk 15', file: fontPath.sans, color: '#E8EEE8', spacing: 3500 });
const solid = await text('Solid ', { font: 'Instrument Serif 124', file: fontPath.serif });
const ground = await text('ground', { font: 'Instrument Serif Italic 124', file: fontPath.serifItalic, color: C.guariaLight });
const line2 = await text('in Costa Rica.', { font: 'Instrument Serif 124', file: fontPath.serif });
const lead = await text('Verified homes, lots and farms  ·  Land & Build machinery', { font: 'Hanken Grotesk 25', file: fontPath.sans, color: '#E8EEE8' });
const areas = await text('ESCAZÚ  ·  SANTA ANA  ·  HEREDIA  ·  ALAJUELA', { font: 'Hanken Grotesk 14', file: fontPath.sans, color: '#C9D3CC', spacing: 2600 });

const headTop = 250;
await sharp(bg)
  .composite([
    { input: Buffer.from(overlay), left: 0, top: 0 },
    { input: wordmark.data, left: 136, top: 50 },
    { input: sub.data, left: 138, top: 50 + wordmark.h + 6 },
    { input: solid.data, left: 60, top: headTop },
    { input: ground.data, left: 60 + solid.w, top: headTop },
    { input: line2.data, left: 60, top: headTop + Math.round(solid.h * 0.86) },
    { input: lead.data, left: 64, top: H - 64 - lead.h - 26 },
    { input: areas.data, left: W - 64 - areas.w, top: H - 64 + 18 },
  ])
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(fileURLToPath(new URL('og-image.jpg', pub)));

console.log('favicon.svg, favicon-32.png, apple-touch-icon.png, icon-192.png, icon-512.png, site.webmanifest, og-image.jpg');
