// Throwaway helper: builds labeled contact sheets of Unsplash candidates for visual selection.
import sharp from 'sharp';
import { readFile, mkdir } from 'node:fs/promises';

const outDir = process.argv[2];
const cands = JSON.parse(await readFile(new URL('./media-candidates.json', import.meta.url), 'utf8'));
const groups = {
  landscapes: ['land1', 'land2', 'land3', 'land4'],
  houses: ['hx1', 'hx2', 'hx3', 'condo1', 'condo2'],
  interiors: ['in1', 'in2', 'in3', 'in4', 'in5'],
  land_commercial: ['lot1', 'lot2', 'com1', 'com2'],
  machinery: ['mx1', 'mx2', 'mx3', 'mx4', 'mx5', 'mx6'],
};
const W = 300, H = 200, COLS = 6, GAP = 6;
await mkdir(outDir, { recursive: true });

for (const [name, keys] of Object.entries(groups)) {
  const items = keys.flatMap(k => cands[k].map((c, i) => ({ label: `${k}.${i}`, path: c[1] })));
  const tiles = await Promise.all(items.map(async it => {
    const url = `https://images.unsplash.com/${it.path}?w=${W * 2}&q=60&fm=jpg`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    const label = Buffer.from(`<svg width="${W}" height="${H}"><rect x="0" y="0" width="${it.label.length * 13 + 14}" height="30" fill="black" opacity=".75"/><text x="7" y="22" font-family="Arial" font-size="20" fill="white">${it.label}</text></svg>`);
    return sharp(buf).resize(W, H, { fit: 'cover' }).composite([{ input: label }]).jpeg().toBuffer();
  }));
  const rows = Math.ceil(items.length / COLS);
  const composites = tiles.map((t, i) => t && ({ input: t, left: (i % COLS) * (W + GAP), top: Math.floor(i / COLS) * (H + GAP) })).filter(Boolean);
  await sharp({ create: { width: COLS * (W + GAP), height: rows * (H + GAP), channels: 3, background: '#222' } })
    .composite(composites).jpeg({ quality: 70 }).toFile(`${outDir}/${name}.jpg`);
  console.log(name, items.length, 'tiles');
}
