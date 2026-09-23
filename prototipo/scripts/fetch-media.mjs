// Downloads the free stock media used by the prototype, optimizes it with sharp,
// and writes src/data/media.json (sizes + blur placeholders) and CREDITS.md.
// Usage: node scripts/fetch-media.mjs
import sharp from 'sharp';
import { mkdir, writeFile, stat } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const outDir = new URL('public/media/', root);
await mkdir(outDir, { recursive: true });
await mkdir(new URL('src/data/', root), { recursive: true });

const U = (path, id, author) => ({ src: `https://images.unsplash.com/${path}?w=2400&q=85&fm=jpg`, page: `https://unsplash.com/photos/${id}`, author, license: 'Unsplash License' });

// name -> source. Width is the max output width in px.
const images = {
  // Zones and landscapes
  'zone-escazu': [U('photo-1699385603652-1d142b1ae6c5', 'UtY6EKwp8SE', 'César Badilla Miranda'), 1800],
  'zone-santa-ana': [U('photo-1612617743322-8cc3f12e0ab0', 'aZoDrxdGG_A', 'Alix Greenman'), 1800],
  'zone-heredia': [U('photo-1625230918233-290f196bf22c', 'EdrMSkpzShs', 'bennoptic'), 1800],
  'zone-alajuela': [U('photo-1567196315593-2907379a4c69', 'MYUsXCTcRDc', 'Miguel Vargas'), 1800],
  'valley-dusk': [U('photo-1687698328566-683e7398996e', '3wnARnIFLx8', 'Elianna Gill'), 2000],
  'hills-sunset': [U('photo-1639521241683-bdb8b296f4b1', 'BPVMw_V7raw', 'Frames For Your Heart'), 2000],
  'coffee': [U('photo-1612668196612-70262cad2ad7', 'FpsB7Jo8nHk', 'Juliana Barquero'), 1400],
  'poas': [U('photo-1628777249528-fd17a59de277', 'fuYyV4ejV2Y', 'Vincent Branciforti'), 1400],
  // Properties
  'laureles-1': [U('photo-1760067538022-8ef8739b1b18', 'u2l_e5YS548', 'Alef Morais'), 2000],
  'laureles-2': [U('photo-1760067537265-dc9f11824eda', 'nQ30zvQb33Q', 'Alef Morais'), 1800],
  'laureles-3': [U('photo-1600210492493-0946911123ea', '4_jQL4JCS98', 'Collov Home Design'), 1800],
  'laureles-4': [U('photo-1682888813795-192fca4a10d9', 'tqksyXLp2mI', 'Zac Gudakov'), 1800],
  'laureles-5': [U('photo-1680210849951-34d1a56eb7aa', '1_tx9_Hxv9E', 'Juliana Morales Ramírez'), 1800],
  'laureles-6': [U('photo-1507652313519-d4e9174996dd', 'PibraWHb4h8', 'Jared Rice'), 1800],
  'laureles-7': [U('photo-1773393877754-07baeb21f947', 'EFvWlzJK9j4', 'Khanh Do'), 1800],
  'pozos-1': [U('photo-1730382186479-20d2e2c4b58f', 'HY2xcxQQ0FU', 'Ronaldo Rizzutti'), 2000],
  'pozos-2': [U('photo-1724582586529-62622e50c0b3', 'vIbxvHj9m9g', 'Prydumano Design'), 1800],
  'pozos-3': [U('photo-1682888813913-e13f18692019', 'o-uPDNNSsDA', 'Zac Gudakov'), 1800],
  'pozos-4': [U('photo-1668089677938-b52086753f77', 'sjMSp5YVf7s', 'Lotus Design N Print'), 1800],
  'pozos-5': [U('photo-1651951646668-46562cfb4518', 'yH1k2Qp86Tk', 'Mohammad Najjar'), 1800],
  'sanpablo-1': [U('photo-1786550860403-4a58f184643e', 'g6LLnC-rn0E', 'Brian Zajac'), 1800],
  'sanpablo-2': [U('photo-1631510390389-c1e4fb20ff31', 'Kh4tedFdHz4', 'Spacejoy'), 1800],
  'sanpablo-3': [U('photo-1586310520462-658e93388399', '57sIOF81IxU', 'Joseph Cortez'), 1800],
  'sanpablo-4': [U('photo-1668911094844-527491335108', '3fuI32P1GWc', 'Point3D Commercial Imaging Ltd.'), 1800],
  'guachipelin-1': [U('photo-1617036958702-0cb93be0552b', 'yz8_w9qtwZY', 'Trevor'), 1800],
  'guachipelin-2': [U('photo-1628744876497-eb30460be9f6', 'mw_mj-noYHM', 'Zac Gudakov'), 1800],
  'guachipelin-3': [U('photo-1665507279638-5b48073c637b', 'K5JI_wRQqY0', 'Zac Gudakov'), 1800],
  'guachipelin-4': [U('photo-1532344214108-1b6d425db572', 'PhwbTwdZ3f4', 'Holly Stratton'), 1800],
  'belen-1': [U('photo-1624204386084-dd8c05e32226', '4453DIQWtsQ', 'Tobias Wilden'), 1800],
  'belen-2': [U('photo-1632829882891-5047ccc421bc', 'EVjqpcn79AM', 'Spacejoy'), 1800],
  'belen-3': [U('photo-1682888813789-c39fe30921e2', '2M3QePaxX6E', 'Zac Gudakov'), 1800],
  'rio-oro-1': [U('photo-1781673856522-df1c89bde8b3', 'Vr3rlxbkRcc', 'You Le'), 1800],
  'san-isidro-1': [U('photo-1627609223680-d0ddc5becd8b', 'hBSeRFzbLKQ', 'Frames For Your Heart'), 1800],
  'san-isidro-2': [U('photo-1515524042669-de726ea3283d', 'wulrT9QNAoA', 'Collin'), 1800],
  'san-isidro-3': [U('photo-1543213324-024b81adc95f', 'On-ayJ6MaDg', 'Match Sùmàyà'), 1800],
  'lindora-1': [U('photo-1497366811353-6870744d04b2', 'eHD8Y1Znfpk', 'Nastuh Abootalebi'), 1800],
  'lindora-2': [U('photo-1706074797611-a02f9ed06439', '_ruJH-BVPbo', 'Hammer Group'), 1800],
  'cariari-1': [U('photo-1748063578185-3d68121b11ff', '4vioYQ9Nn9Y', 'Arthur BAUDRY'), 1800],
  'cariari-2': [U('photo-1649083048337-4aeb6dda80bb', 'PE4pFgcYzoQ', 'Bailey Alexander'), 1800],
  'cariari-3': [U('photo-1560185127-1902ccdc5094', 'I5uy6tQL4VM', 'Francesca Tosolini'), 1800],
  'colon-1': [U('photo-1779813377622-df4c5a982230', 'OnuWsmUo2-s', 'Logan Voss'), 1800],
  'colon-2': [U('photo-1665507279644-67d8ed143a84', 'XHZKjlnIJOs', 'Zac Gudakov'), 1800],
  'colon-3': [U('photo-1688786219616-598ed96aa19d', '59YYIR-20xs', 'Rebecca Chandler'), 1800],
  'bosque-alto-1': [U('photo-1787704113747-c1a65d1a6a62', 'iDq7J5bAa0I', 'Ibrahim Design'), 1800],
  'bosque-alto-2': [U('photo-1766603636502-99ac1abcb6c7', 'rlesyj-1Kv0', 'Alef Morais'), 1800],
  // Land & Build
  'build-hero': [U('photo-1649807533255-bbc9c9fb7d77', '3xaxYYv1_PI', 'Built Robotics'), 2000],
  'eq-excavator': [U('photo-1630288214173-a119cf823388', 'nkxB5Ab-ONY', 'Billy Freeman'), 1400],
  'eq-mini': [U('photo-1763624578810-5ac518e4fd4c', '5Z1vvzcCJ9U', 'Florencia Gonzalez Bazzano'), 1400],
  'eq-backhoe': [U('photo-1762291270825-0a49ab389d05', 'zU0htI8Y55M', 'Roger Starnes Sr'), 1400],
  'eq-dump': [U('photo-1760045788252-d8d386ea1d12', 'peVKQQ2w-lg', 'Luan Fonseca'), 1400],
  'eq-dozer': [U('photo-1630288214032-2c4cc2c080ca', '3U7jsNq1ZSk', 'Billy Freeman'), 1400],
  'eq-roller': [U('photo-1779384316974-7424be132379', '-uim3LxFj4A', 'Evan Porter'), 1400],
  'earthworks-aerial': [U('photo-1748848436533-f7583dce22b6', 'FeO9AixmDt0', 'Iain'), 1800],
  'aggregates': [U('photo-1779775981174-475ffb8ecf83', 'ugx4f5qGW3c', 'Sergej'), 1400],
  // Hero video poster (first frame of the Pexels clip)
  'hero-poster': [{ src: 'https://images.pexels.com/videos/35177375/alajuela-costa-rica-35177375.jpeg?auto=compress&cs=tinysrgb&w=2000', page: 'https://www.pexels.com/video/aerial-view-of-lush-alajuela-landscape-in-daylight-35177375/', author: 'Arturo Salas', license: 'Pexels License' }, 2000],
};

const panoramas = {
  'pano-living': { src: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/cayley_interior.jpg', page: 'https://polyhaven.com/a/cayley_interior', author: 'Poly Haven', license: 'CC0' },
  'pano-terrace': { src: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/veranda.jpg', page: 'https://polyhaven.com/a/veranda', author: 'Poly Haven', license: 'CC0' },
};

const video = { name: 'hero.mp4', src: 'https://videos.pexels.com/video-files/35177375/14903448_1920_1080_30fps.mp4', page: 'https://www.pexels.com/video/aerial-view-of-lush-alajuela-landscape-in-daylight-35177375/', author: 'Arturo Salas', license: 'Pexels License' };

const UA = { 'User-Agent': 'Mozilla/5.0' };
async function get(url) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch(url, { headers: UA });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    if (attempt === 3) throw new Error(`${res.status} ${url}`);
  }
}

const manifest = {};
const credits = [];

async function processImage(name, meta, maxW, quality = 74) {
  const buf = await get(meta.src);
  const img = sharp(buf).rotate().resize({ width: maxW, withoutEnlargement: true });
  const { data, info } = await img.webp({ quality }).toBuffer({ resolveWithObject: true });
  await writeFile(new URL(`${name}.webp`, outDir), data);
  const blur = await sharp(buf).resize(24).webp({ quality: 40 }).toBuffer();
  manifest[name] = { src: `media/${name}.webp`, w: info.width, h: info.height, blur: `data:image/webp;base64,${blur.toString('base64')}` };
  credits.push(`| ${name} | ${meta.author} | [${meta.license}](${meta.page}) |`);
  console.log('ok', name, info.width + 'x' + info.height, Math.round(data.length / 1024) + 'KB');
}

const entries = Object.entries(images);
for (let i = 0; i < entries.length; i += 6) {
  await Promise.all(entries.slice(i, i + 6).map(([name, [meta, w]]) => processImage(name, meta, w)));
}
for (const [name, meta] of Object.entries(panoramas)) {
  const buf = await get(meta.src);
  const data = await sharp(buf).resize(4096, 2048).webp({ quality: 80 }).toBuffer();
  await writeFile(new URL(`${name}.webp`, outDir), data);
  manifest[name] = { src: `media/${name}.webp`, w: 4096, h: 2048, blur: '' };
  credits.push(`| ${name} | ${meta.author} | [${meta.license}](${meta.page}) |`);
  console.log('ok', name, Math.round(data.length / 1024) + 'KB');
}
const vbuf = await get(video.src);
await writeFile(new URL(video.name, outDir), vbuf);
manifest.heroVideo = { src: `media/${video.name}`, w: 1920, h: 1080, blur: '' };
credits.push(`| ${video.name} | ${video.author} | [${video.license}](${video.page}) |`);
console.log('ok', video.name, Math.round((await stat(new URL(video.name, outDir))).size / 1024) + 'KB');

await writeFile(new URL('src/data/media.json', root), JSON.stringify(manifest, null, 1));
await writeFile(new URL('CREDITS.md', root), `# Media credits\n\nFree stock media used in the prototype. Replace with the company's own photography before launch.\n\n| File | Author | License / source |\n|---|---|---|\n${credits.join('\n')}\n`);
console.log('done:', Object.keys(manifest).length, 'assets');
