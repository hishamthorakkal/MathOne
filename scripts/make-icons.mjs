// Renders public/icon.svg into the PNG sizes browsers and phones need.
// Run with: npm run icons
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync } from 'node:fs';

const svg = readFileSync('public/icon.svg', 'utf8');
const sizes = { 'favicon-32.png': 32, 'apple-touch-icon.png': 180, 'icon-192.png': 192, 'icon-512.png': 512 };

for (const [file, size] of Object.entries(sizes)) {
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: size }, font: { loadSystemFonts: true } }).render().asPng();
  writeFileSync(`public/${file}`, png);
  console.log(`public/${file} (${size}×${size})`);
}

// Android adaptive ("maskable") icon: full-bleed background, art shrunk towards the bottom
// so the face and the + coin stay inside the safe circle while the dino still stands on the edge.
const BG = '<rect width="512" height="512" fill="url(#bg)"/>';
const art = svg.replace(/<svg[^>]*>/, '').replace('</svg>', '').replace(' clip-path="url(#tile)"', '').replace(BG, '');
const maskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs><linearGradient id="mbg" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="#5ccf73"/><stop offset="1" stop-color="#1f7a41"/></linearGradient></defs>
  <rect width="512" height="512" fill="url(#mbg)"/>
  <g transform="translate(256 512) scale(0.8) translate(-256 -512)">${art}</g>
</svg>`;
writeFileSync('public/icon-maskable-512.png', new Resvg(maskable, { fitTo: { mode: 'width', value: 512 }, font: { loadSystemFonts: true } }).render().asPng());
console.log('public/icon-maskable-512.png (512×512, maskable)');
