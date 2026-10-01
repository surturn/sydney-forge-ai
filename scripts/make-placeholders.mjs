import { mkdirSync, writeFileSync } from 'fs';

const OUT = 'public/images/placeholders';
mkdirSync(OUT, { recursive: true });

const slots = [
  ['portrait', 1200, 1500, 'Portrait — photo coming', '#2340FF', '#FFF3E2'],
  ['assetflow', 1600, 1000, 'AssetFlow — screenshot coming', '#14121F', '#C8F031'],
  ['eventify', 1600, 1000, 'Eventify — screenshot coming', '#FF4F1F', '#14121F'],
  ['digital-twin', 1600, 1000, 'Digital Twin — screenshot coming', '#2340FF', '#FFF3E2'],
  ['farmassist', 1600, 1000, 'FarmAssist — screenshot coming', '#C8F031', '#14121F'],
  ['forus', 1000, 1600, 'FoRUs — screens coming', '#14121F', '#FF4F1F'],
];

for (const [id, w, h, label, bg, fg] of slots) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<rect width="100%" height="100%" fill="${bg}"/>
<g stroke="${fg}" stroke-width="3" fill="none" opacity=".5">
<path d="M40 40h80M40 40v80M${w - 40} 40h-80M${w - 40} 40v80M40 ${h - 40}h80M40 ${h - 40}v-80M${w - 40} ${h - 40}h-80M${w - 40} ${h - 40}v-80"/>
</g>
<text x="50%" y="50%" fill="${fg}" font-family="IBM Plex Mono, monospace" font-size="${Math.round(w / 32)}" text-anchor="middle" dominant-baseline="middle" letter-spacing="4">${label.toUpperCase()}</text>
</svg>`;
  writeFileSync(`${OUT}/${id}.svg`, svg);
}
console.log(`wrote ${slots.length} placeholders to ${OUT}`);
