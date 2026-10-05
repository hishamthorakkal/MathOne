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
