// Design preview only: the Crystal Cave (world crystals + skill gems + bonus crystals).
// Run: node design/crystals-sample.mjs  -> design/crystals-sample.png
import { Resvg } from '@resvg/resvg-js';
import { writeFileSync } from 'node:fs';

const shade = (hex, amt) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (c) => Math.max(0, Math.min(255, Math.round(c + c * amt)));
  return '#' + [f(n >> 16), f((n >> 8) & 255), f(n & 255)].map((v) => v.toString(16).padStart(2, '0')).join('');
};
const T = (x, y, t, size = 14, w = 400, fill = '#1f2a44') =>
  `<text x="${x}" y="${y}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${size}" font-weight="${w}" fill="${fill}">${t}</text>`;

/** A faceted crystal; `fill` 0..1 shows how full it is. */
function crystal(cx, cy, s, color, fill, done, locked) {
  const c = locked ? '#cfc6b4' : color;
  const d = shade(c, -0.35);
  const pts = (k) => [[0, -46], [24, -22], [24, 22], [0, 46], [-24, 22], [-24, -22]].map(([x, y]) => `${cx + x * s * k},${cy + y * s * k}`).join(' ');
  const top = cy + 46 * s - 92 * s * fill;
  const id = `clip${cx}${cy}`;
  return `<defs><clipPath id="${id}"><polygon points="${pts(1)}"/></clipPath></defs>
    ${done ? `<circle cx="${cx}" cy="${cy}" r="${58 * s}" fill="${shade(color, 0.6)}" opacity="0.6"/>` : ''}
    <polygon points="${pts(1)}" fill="${locked ? '#ece6d9' : '#ffffff'}" stroke="${d}" stroke-width="3" stroke-linejoin="round"/>
    <polygon points="${pts(1)}" fill="${c}" opacity="${locked ? 0 : 0.12}"/>
    <rect x="${cx - 30 * s}" y="${top}" width="${60 * s}" height="${cy + 46 * s - top}" fill="${c}" clip-path="url(#${id})" opacity="0.9"/>
    <path d="M${cx} ${cy - 46 * s} L ${cx} ${cy + 46 * s} M ${cx - 24 * s} ${cy - 22 * s} L ${cx} ${cy} L ${cx + 24 * s} ${cy - 22 * s}" stroke="#fff" stroke-width="2" opacity="0.55" fill="none"/>
    <polygon points="${pts(1)}" fill="none" stroke="${d}" stroke-width="3" stroke-linejoin="round"/>
    ${locked ? T(cx, cy + 6, '🔒', 20) : ''}
    ${done ? `<circle cx="${cx + 22 * s}" cy="${cy - 38 * s}" r="9" fill="#2e9d57"/>${T(cx + 22 * s, cy - 34 * s, '✓', 12, 700, '#fff')}` : ''}`;
}

const gem = (x, y, color, on) =>
  `<path d="M${x} ${y - 6} L ${x + 5} ${y} L ${x} ${y + 6} L ${x - 5} ${y} Z" fill="${on ? color : '#ece6d9'}" stroke="${on ? shade(color, -0.35) : '#cfc6b4'}" stroke-width="1.5"/>`;

const WORLDS = [
  ['🌴', 'Number Jungle', '#3fae5a', 7, 7, true],
  ['🌋', 'Volcano Valley', '#e8603c', 6, 6, true],
  ['🥚', 'Dino Nest', '#f2b233', 3, 3, true],
  ['🔷', 'Shape Caves', '#4b7be5', 4, 2, false],
  ['⏰', 'Time Mountain', '#8b5cf6', 3, 0, false],
  ['🪙', 'Treasure Market', '#d4a017', 4, 0, false],
  ['🧩', 'Puzzle Forest', '#14a39a', 8, 0, false, true],
  ['🏰', 'Olympiad Castle', '#c2410c', 2, 0, false, true],
];

const worldCards = WORLDS.map(([emoji, name, color, total, got, done, locked], i) => {
  const x = 20 + i * 135;
  const gems = Array.from({ length: total }, (_, k) => gem(x + 62 - (total - 1) * 7 + k * 14, 214, color, k < got)).join('');
  return `<g>
    <rect x="${x}" y="84" width="125" height="190" rx="16" fill="#fff" stroke="${done ? color : '#eadfca'}" stroke-width="3"/>
    ${crystal(x + 62, 146, 0.9, color, total ? got / total : 0, done, locked)}
    ${gems}
    ${T(x + 62, 242, `${emoji} ${name}`, 12, 700)}
    ${T(x + 62, 260, locked ? 'Opens later' : done ? 'Crystal won!' : `${got} of ${total} gems`, 11, 400, done ? '#1f7a41' : '#5d6886')}
  </g>`;
}).join('');

const BONUS = [
  ['Star Crystal', '#facc15', 'Score 60% in a full mock', true],
  ['Camp Crystal', '#38bdf8', 'Finish Training Camp 3 times', true],
  ['Never Give Up', '#f43f5e', '"Never Give Up" badge 10 times', false, 0.6],
  ['Explorer Crystal', '#22c55e', '5 Real-World Missions', false, 0.4],
  ['Sunshine Crystal', '#fb923c', 'Play on 20 Adventure Days', false, 0.45],
  ['Dino Friend', '#a855f7', 'Find 10 dinos', false, 0.5],
  ['Thinker Crystal', '#6366f1', '"Great Thinker" badge 10 times', false, 0.3],
  ['Rainbow Crystal', 'rainbow', 'Win all 8 world crystals', false, 0.375],
];

const bonusCards = BONUS.map(([name, color, how, won, p = 1], i) => {
  const x = 20 + (i % 4) * 270;
  const y = 330 + Math.floor(i / 4) * 120;
  const rainbow = color === 'rainbow';
  const col = rainbow ? '#ec4899' : color;
  const icon = rainbow
    ? `<defs><linearGradient id="rb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ef4444"/><stop offset="0.25" stop-color="#f59e0b"/><stop offset="0.5" stop-color="#22c55e"/><stop offset="0.75" stop-color="#3b82f6"/><stop offset="1" stop-color="#a855f7"/></linearGradient></defs>
       <polygon points="${x + 48},${y + 18} ${x + 70},${y + 40} ${x + 48},${y + 92} ${x + 26},${y + 40}" fill="url(#rb)" opacity="${won ? 1 : 0.35}" stroke="#7c3aed" stroke-width="3" stroke-linejoin="round"/>`
    : `<polygon points="${x + 48},${y + 18} ${x + 70},${y + 40} ${x + 48},${y + 92} ${x + 26},${y + 40}" fill="${won ? col : '#ece6d9'}" stroke="${won ? shade(col, -0.35) : '#cfc6b4'}" stroke-width="3" stroke-linejoin="round"/>
       <path d="M${x + 26} ${y + 40} L ${x + 70} ${y + 40} M ${x + 48} ${y + 18} L ${x + 40} ${y + 40} L ${x + 48} ${y + 92} M ${x + 48} ${y + 18} L ${x + 56} ${y + 40} L ${x + 48} ${y + 92}" stroke="#fff" stroke-width="1.5" opacity="0.6" fill="none"/>`;
  return `<g>
    <rect x="${x}" y="${y}" width="260" height="110" rx="16" fill="#fff" stroke="${won ? col : '#eadfca'}" stroke-width="3"/>
    ${icon}
    <text x="${x + 88}" y="${y + 38}" font-family="Arial" font-size="15" font-weight="700" fill="#1f2a44">${name}${rainbow ? ' ⭐' : ''}</text>
    <text x="${x + 88}" y="${y + 58}" font-family="Arial" font-size="12" fill="#5d6886">${how}</text>
    ${won
      ? `<text x="${x + 88}" y="${y + 84}" font-family="Arial" font-size="13" font-weight="700" fill="#1f7a41">✓ Won! +2 eggs</text>`
      : `<rect x="${x + 88}" y="${y + 74}" width="150" height="10" rx="5" fill="#ebe3d2"/><rect x="${x + 88}" y="${y + 74}" width="${150 * p}" height="10" rx="5" fill="${p >= 0.75 ? '#f2b233' : '#2e9d57'}"/>`}
  </g>`;
}).join('');

const toast = `<g>
  <rect x="200" y="580" width="680" height="56" rx="28" fill="#fff6d6" stroke="#f6d36b" stroke-width="2"/>
  ${gem(236, 608, '#4b7be5', true)}
  ${T(560, 614, '✨ New gem! You mastered 2D Shapes. 2 more gems to fill the Shape Crystal.', 15, 700)}
</g>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1110" height="660">
  <rect width="100%" height="100%" fill="#fff9ee"/>
  ${T(555, 36, '💎 Crystal Cave', 30, 700)}
  ${T(555, 64, '3 of 8 world crystals · 18 of 37 skill gems · 2 of 8 bonus crystals', 15, 400, '#5d6886')}
  ${worldCards}
  ${T(555, 314, '⭐ Bonus Crystals: won for great habits, never by luck', 18, 700)}
  ${bonusCards}
  ${toast}
</svg>`;

writeFileSync('design/crystals-sample.png', new Resvg(svg, { font: { loadSystemFonts: true } }).render().asPng());
console.log('wrote design/crystals-sample.png');
