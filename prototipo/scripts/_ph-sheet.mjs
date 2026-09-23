import sharp from 'sharp';
const d = process.argv[2];
const ids = ['lebombo','veranda','cayley_interior','lythwood_room','hotel_room'];
const tiles = await Promise.all(ids.map(async (id, i) => ({ input: await sharp(`${d}/ph_${id}.png`).resize(640, 320, { fit: 'cover' }).composite([{ input: Buffer.from(`<svg width="640" height="320"><rect width="220" height="34" fill="black" opacity=".7"/><text x="8" y="24" font-family="Arial" font-size="22" fill="white">${id}</text></svg>`) }]).png().toBuffer(), left: (i % 2) * 646, top: Math.floor(i / 2) * 326 })));
await sharp({ create: { width: 1292, height: 978, channels: 3, background: '#222' } }).composite(tiles).jpeg({ quality: 70 }).toFile(`${d}/polyhaven.jpg`);
