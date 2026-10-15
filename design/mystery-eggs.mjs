// Design preview only: show a mystery egg (not a dino silhouette) for dinos not found yet.
// Run: node design/mystery-eggs.mjs  -> design/mystery-eggs.png
import { Resvg } from '@resvg/resvg-js';
import { writeFileSync } from 'node:fs';

const shade = (hex, amt) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (c) => Math.max(0, Math.min(255, Math.round(c + c * amt)));
  return '#' + [f(n >> 16), f((n >> 8) & 255), f(n & 255)].map((v) => v.toString(16).padStart(2, '0')).join('');
};
const T = (x, y, t, size = 14, w = 400, fill = '#1f2a44') =>
  `<text x="${x}" y="${y}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${size}" font-weight="${w}" fill="${fill}">${t}</text>`;

/** Mystery egg. The spots use the dino's home-world colour, so the egg hints where to look. */
function egg(cx, cy, color, mode) {
  const d = shade(color, -0.3);
  const spots = [[-16, -22, 6], [18, -12, 7], [-24, 20, 6], [22, 26, 5], [6, -34, 4], [-4, 38, 4]]
    .map(([x, y, r]) => `<circle cx="${cx + x}" cy="${cy + y}" r="${r}" fill="${color}" opacity="0.75"/>`).join('');
  const shell = `M${cx} ${cy - 46} C ${cx + 30} ${cy - 46} ${cx + 38} ${cy + 4} ${cx + 36} ${cy + 18} C ${cx + 34} ${cy + 40} ${cx + 18} ${cy + 48} ${cx} ${cy + 48} C ${cx - 18} ${cy + 48} ${cx - 34} ${cy + 40} ${cx - 36} ${cy + 18} C ${cx - 38} ${cy + 4} ${cx - 30} ${cy - 46} ${cx} ${cy - 46} Z`;
  const glow = mode === 'ready' ? `<circle cx="${cx}" cy="${cy}" r="60" fill="#ffe08a" opacity="0.55"/>` : '';
  const crackSmall = `<path d="M${cx - 10} ${cy - 22} l6 7 l-5 6 l7 6" stroke="${d}" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  const crackBig = `<path d="M${cx - 34} ${cy + 2} l10 -8 l8 9 l9 -10 l9 9 l9 -9 l10 8 l8 -4" stroke="${d}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  const tilt = mode === 'ready' ? `rotate(-8 ${cx} ${cy + 48})` : '';
  return `${glow}<ellipse cx="${cx}" cy="${cy + 52}" rx="30" ry="6" fill="#000" opacity="0.08"/>
    <g transform="${tilt}">
      <path d="${shell}" fill="#fffaf0" stroke="${d}" stroke-width="3"/>
      ${spots}
      <path d="M${cx - 20} ${cy - 30} q -8 14 -6 30" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.8"/>
      ${mode === 'hidden' ? T(cx, cy + 14, '?', 34, 700, d) : ''}
      ${mode === 'footprints' ? crackSmall : ''}
      ${mode === 'ready' ? crackBig : ''}
    </g>
    ${mode === 'footprints' ? T(cx + 46, cy + 44, '🐾', 20) : ''}
    ${mode === 'ready' ? T(cx + 42, cy - 36, '✨', 20) + T(cx - 44, cy - 24, '✨', 14) : ''}`;
}

/** Today's dark silhouette of the real dino (simplified), for comparison. */
function silhouette(cx, cy) {
  return `<g fill="#3b3f4a" opacity="0.85">
    <ellipse cx="${cx}" cy="${cy + 12}" rx="34" ry="26"/>
    <circle cx="${cx + 26}" cy="${cy - 20}" r="20"/>
    <path d="M${cx - 30} ${cy + 10} Q ${cx - 60} ${cy + 6} ${cx - 64} ${cy - 10} Q ${cx - 50} ${cy + 22} ${cx - 24} ${cy + 26} Z"/>
    <rect x="${cx - 18}" y="${cy + 30}" width="12" height="18" rx="5"/><rect x="${cx + 8}" y="${cy + 30}" width="12" height="18" rx="5"/>
  </g>${T(cx, cy + 20, '?', 30, 700, '#fff')}`;
}

const bar = (x, y, w, p, color) =>
  `<rect x="${x}" y="${y}" width="${w}" height="10" rx="5" fill="#ece6d9"/><rect x="${x}" y="${y}" width="${w * p}" height="10" rx="5" fill="${color}"/>`;

function card(x, y, w, h, opts) {
  const cx = x + w / 2;
  const border = opts.border ?? '#e7dfcf';
  let body = '';
  body += opts.art(cx, y + 74);
  body += T(cx, y + 158, opts.title, 15, 700);
  opts.lines.forEach((l, i) => (body += T(cx, y + 178 + i * 17, l, 12, 400, '#5d6886')));
  if (opts.bar != null) body += bar(x + 22, y + 214, w - 44, opts.bar, '#f2b233');
  if (opts.button) body += `<rect x="${cx - 52}" y="${y + 206}" width="104" height="30" rx="15" fill="#2e9d57"/>` + T(cx, y + 226, opts.button, 13, 700, '#fff');
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="20" fill="${opts.bg ?? '#fff'}" stroke="${border}" stroke-width="3"/>${body}`;
}

const W = 190, H = 250, G = 18;
const col = (i) => 70 + i * (W + G);

// Row 1: how it looks today. Row 2: the proposal.
const today = [
  card(col(0), 120, W, H, { art: silhouette, title: '???', lines: ['Clue: I have horns and', 'I live near the volcano.'] }),
  card(col(1), 120, W, H, { art: silhouette, title: 'Footprints spotted!', lines: ['Master 1 more', 'Volcano Valley skill'], bar: 0.8, border: '#f2b233' }),
  card(col(2), 120, W, H, { art: (cx, cy) => T(cx, cy + 16, '🥚', 60), title: 'New egg found!', lines: ['Something is inside…'], button: 'Hatch (🥚 3)', border: '#f2b233' }),
];
const proposed = [
  card(col(0), 470, W, H, { art: (cx, cy) => egg(cx, cy, '#e8603c', 'hidden'), title: 'Mystery Egg', lines: ['Clue: I have horns and', 'I live near the volcano.'] }),
  card(col(1), 470, W, H, { art: (cx, cy) => egg(cx, cy, '#e8603c', 'footprints'), title: 'The egg moved!', lines: ['Master 1 more', 'Volcano Valley skill'], bar: 0.8, border: '#f2b233' }),
  card(col(2), 470, W, H, { art: (cx, cy) => egg(cx, cy, '#e8603c', 'ready'), title: 'Ready to hatch!', lines: ['Something is inside…'], button: 'Hatch (🥚 3)', border: '#f2b233', bg: '#fffbea' }),
];

// Right side: a book page of mixed eggs (found dinos stay as dinos).
const px = 720, py = 470;
const eggs = [['#3fae5a', 'hidden'], ['#4b7be5', 'hidden'], ['#8b5cf6', 'footprints'], ['#f2b233', 'hidden'], ['#ec4899', 'hidden'], ['#e8603c', 'ready']];
const grid = eggs.map(([c, m], i) => {
  const gx = px + 60 + (i % 3) * 110, gy = py + 70 + Math.floor(i / 3) * 120;
  return `<g transform="translate(${gx} ${gy}) scale(0.62) translate(${-gx} ${-gy})">${egg(gx, gy, c, m)}</g>`;
}).join('');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1110" height="790">
  <rect width="100%" height="100%" fill="#fff9ee"/>
  ${T(555, 40, '📖 Dino Discovery Book: mystery eggs instead of hidden dinos', 26, 700)}
  ${T(555, 68, 'A dino you have not found yet stays a secret until it hatches.', 15, 400, '#5d6886')}
  ${T(380, 106, 'TODAY: the dino shape shows through', 16, 700, '#b4532a')}
  ${today.join('')}
  <rect x="700" y="120" width="370" height="250" rx="20" fill="#fff" stroke="#e7dfcf" stroke-width="3"/>
  ${T(885, 160, 'What changes', 18, 700)}
  ${['Not found: a speckled egg with a ?', 'Spots use the home-world colour:', 'a hint where to look', '75% there: the egg cracks + 🐾', 'Ready: egg glows, wobbles, hatch!', 'The dino is only seen after hatching']
    .map((t, i) => T(885, 196 + i * 26, t, 14, i === 5 ? 700 : 400, i === 5 ? '#2e9d57' : '#1f2a44')).join('')}
  ${T(380, 456, 'NEW: a mystery egg until it hatches', 16, 700, '#2e9d57')}
  ${proposed.join('')}
  <rect x="${px}" y="${py}" width="350" height="${H}" rx="20" fill="#fff" stroke="#e7dfcf" stroke-width="3"/>
  ${T(px + 175, py + 26, 'A page of the book', 14, 700, '#5d6886')}
  ${grid}
</svg>`;

writeFileSync('design/mystery-eggs.png', new Resvg(svg, { font: { loadSystemFonts: true } }).render().asPng());
console.log('wrote design/mystery-eggs.png');
