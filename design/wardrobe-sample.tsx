// Design reference only (moved out of src so it never runs with the tests). To re-render, copy it to src/components/ as *.test.tsx and run vitest on it.
import { it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Resvg } from '@resvg/resvg-js';
import { writeFileSync } from 'node:fs';
import { DINOS } from '../engine/catalog';
import { Dino } from './Dino';

// TEMPORARY design sample (not part of the app): modern wardrobe items on real dinos.
type A = { eye: { x: number; y: number; r: number }; hat: { x: number; y: number; s: number }; scarf: { x: number; y: number; rot: number }; medal: { x: number; y: number }; pack: { x: number; y: number }; wrap?: string };
const ANCHORS: Record<string, A> = {
  rexy: { eye: { x: 150, y: 58, r: 10 }, hat: { x: 156, y: 43, s: 1 }, scarf: { x: 122, y: 104, rot: -38 }, medal: { x: 112, y: 122 }, pack: { x: 66, y: 112 } },
  brachio: { wrap: 'translate(0 6) scale(1 0.97)', eye: { x: 160, y: 26, r: 6.5 }, hat: { x: 156, y: 12, s: 0.7 }, scarf: { x: 128, y: 96, rot: -68 }, medal: { x: 98, y: 130 }, pack: { x: 66, y: 112 } },
  tricera: { eye: { x: 160, y: 110, r: 8 }, hat: { x: 132, y: 62, s: 0.85 }, scarf: { x: 128, y: 128, rot: -15 }, medal: { x: 112, y: 142 }, pack: { x: 72, y: 110 } },
  raptor: { eye: { x: 154, y: 64, r: 8 }, hat: { x: 160, y: 50, s: 0.8 }, scarf: { x: 134, y: 90, rot: -52 }, medal: { x: 108, y: 112 }, pack: { x: 80, y: 98 } },
};

type Slot = 'head' | 'eyes' | 'neck' | 'back';
interface Item { id: string; name: string; slot: Slot; cost: number; isNew: boolean; draw: (a: A) => string }

const atHat = (a: A, inner: string) => `<g transform="translate(${a.hat.x} ${a.hat.y}) scale(${a.hat.s * 1.3})">${inner}</g>`;
const atNeck = (a: A, inner: string) => `<g transform="translate(${a.scarf.x} ${a.scarf.y}) rotate(${a.scarf.rot}) scale(1.35)">${inner}</g>`;
const atBack = (a: A, inner: string, s = 1) => `<g transform="translate(${a.pack.x - 8} ${a.pack.y - 10}) scale(${s * 1.6})">${inner}</g>`;
const star = (cx: number, cy: number, r: number) =>
  Array.from({ length: 10 }, (_, i) => {
    const ang = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    return `${(cx + rr * Math.cos(ang)).toFixed(1)},${(cy + rr * Math.sin(ang)).toFixed(1)}`;
  }).join(' ');

const ITEMS: Item[] = [
  // ---- head ----
  { id: 'hat', name: 'Explorer Hat', slot: 'head', cost: 2, isNew: false, draw: (a) => atHat(a, `<ellipse rx="28" ry="6" fill="#8d5a2b"/><path d="M-17 0 q 2 -26 17 -26 q 15 0 17 26 Z" fill="#a86b32"/><rect x="-17" y="-8" width="34" height="5" fill="#5a3a1a"/>`) },
  { id: 'cap', name: 'Cool Cap', slot: 'head', cost: 3, isNew: true, draw: (a) => atHat(a, `<path d="M-19 2 Q -19 -24 2 -24 Q 21 -24 21 2 Z" fill="#3b82f6" stroke="#1e3a8a" stroke-width="2.5"/><path d="M15 0 Q 32 -2 40 4 Q 28 8 13 5 Z" fill="#1e3a8a"/><circle cx="2" cy="-24" r="2.5" fill="#1e3a8a"/><polygon points="${star(2, -11, 6)}" fill="#fde047"/>`) },
  { id: 'headphones', name: 'Headphones', slot: 'head', cost: 4, isNew: true, draw: (a) => atHat(a, `<path d="M-20 12 Q -22 -26 2 -26 Q 26 -26 24 12" fill="none" stroke="#111827" stroke-width="5" stroke-linecap="round"/><rect x="-26" y="4" width="14" height="20" rx="6" fill="#ef4444" stroke="#7f1d1d" stroke-width="2"/><rect x="-23" y="8" width="8" height="12" rx="3" fill="#fecaca"/>`) },
  { id: 'beanie', name: 'Comfy Beanie', slot: 'head', cost: 3, isNew: true, draw: (a) => atHat(a, `<path d="M-19 2 Q -19 -24 0 -24 Q 19 -24 19 2 Z" fill="#f97316" stroke="#9a3412" stroke-width="2.5"/><path d="M-15 -12 H 15 M -17 -4 H 17" stroke="#fdba74" stroke-width="3"/><rect x="-21" y="-2" width="42" height="8" rx="4" fill="#ea580c" stroke="#9a3412" stroke-width="2"/><circle cx="0" cy="-27" r="6" fill="#fff" stroke="#d1d5db" stroke-width="1.5"/>`) },
  { id: 'flowers', name: 'Flower Crown', slot: 'head', cost: 3, isNew: true, draw: (a) => atHat(a, `<path d="M-20 0 Q 0 -8 20 0" fill="none" stroke="#4d7c0f" stroke-width="3"/>${[-16, -6, 4, 14].map((x, i) => `<circle cx="${x}" cy="${-4 - (i % 2) * 2}" r="6" fill="${['#f472b6', '#fbbf24', '#a78bfa', '#fb7185'][i]}" stroke="#fff" stroke-width="1.5"/><circle cx="${x}" cy="${-4 - (i % 2) * 2}" r="2" fill="#fef3c7"/>`).join('')}`) },
  { id: 'crown', name: 'Olympiad Crown', slot: 'head', cost: 6, isNew: false, draw: (a) => atHat(a, `<path d="M-18 0 l 5 -22 l 8 13 l 5 -17 l 5 17 l 8 -13 l 5 22 Z" fill="#ffd23f" stroke="#c99a00" stroke-width="2.5" stroke-linejoin="round"/>`) },
  // ---- eyes ----
  { id: 'glasses', name: 'Cool Glasses', slot: 'eyes', cost: 4, isNew: false, draw: (a) => `<g stroke="#111" stroke-width="3"><path d="M${a.eye.x - a.eye.r - 3} ${a.eye.y - 1} l -14 -4" fill="none"/><circle cx="${a.eye.x}" cy="${a.eye.y}" r="${a.eye.r + 3}" fill="rgba(30,30,60,0.75)"/></g>` },
  { id: 'starshades', name: 'Star Shades', slot: 'eyes', cost: 4, isNew: true, draw: (a) => `<path d="M${a.eye.x - a.eye.r - 3} ${a.eye.y - 1} l -14 -4" stroke="#111" stroke-width="3"/><polygon points="${star(a.eye.x, a.eye.y, a.eye.r + 7)}" fill="rgba(30,30,60,0.8)" stroke="#facc15" stroke-width="3" stroke-linejoin="round"/>` },
  { id: 'heartglasses', name: 'Heart Glasses', slot: 'eyes', cost: 4, isNew: true, draw: (a) => { const r = a.eye.r + 4; return `<path d="M${a.eye.x - r - 1} ${a.eye.y - 2} l -12 -4" stroke="#be185d" stroke-width="3"/><path d="M${a.eye.x} ${a.eye.y + r} C ${a.eye.x - r * 1.6} ${a.eye.y} ${a.eye.x - r * 0.8} ${a.eye.y - r * 1.1} ${a.eye.x} ${a.eye.y - r * 0.35} C ${a.eye.x + r * 0.8} ${a.eye.y - r * 1.1} ${a.eye.x + r * 1.6} ${a.eye.y} ${a.eye.x} ${a.eye.y + r} Z" fill="rgba(236,72,153,0.55)" stroke="#be185d" stroke-width="3"/>`; } },
  { id: 'goggles', name: 'Smart Goggles', slot: 'eyes', cost: 5, isNew: true, draw: (a) => `<path d="M${a.eye.x - a.eye.r - 4} ${a.eye.y} l -16 -2" stroke="#334155" stroke-width="4"/><rect x="${a.eye.x - a.eye.r - 5}" y="${a.eye.y - a.eye.r - 3}" width="${a.eye.r * 2 + 14}" height="${a.eye.r * 2 + 6}" rx="${a.eye.r}" fill="rgba(34,211,238,0.55)" stroke="#0e7490" stroke-width="3"/><path d="M${a.eye.x - a.eye.r} ${a.eye.y - a.eye.r * 0.4} l ${a.eye.r} -2" stroke="#fff" stroke-width="2" stroke-linecap="round"/>` },
  // ---- neck ----
  { id: 'scarf', name: 'Cosy Scarf', slot: 'neck', cost: 3, isNew: false, draw: (a) => atNeck(a, `<g fill="#e63946" stroke="#9d1c27" stroke-width="2"><rect x="-15" y="-6" width="30" height="12" rx="6"/><path d="M4 4 l 6 22 l 8 -4 l -4 -18 Z"/></g>`) },
  { id: 'bowtie', name: 'Bow Tie', slot: 'neck', cost: 2, isNew: true, draw: (a) => atNeck(a, `<g stroke="#4c1d95" stroke-width="2" stroke-linejoin="round"><path d="M0 0 L -14 -9 L -14 9 Z" fill="#8b5cf6"/><path d="M0 0 L 14 -9 L 14 9 Z" fill="#8b5cf6"/><circle r="4" fill="#c4b5fd"/></g>`) },
  { id: 'necklace', name: 'Star Necklace', slot: 'neck', cost: 4, isNew: true, draw: (a) => atNeck(a, `<path d="M-14 -4 Q 0 12 14 -4" fill="none" stroke="#eab308" stroke-width="2.5" stroke-dasharray="2 2"/><polygon points="${star(0, 10, 7)}" fill="#fde047" stroke="#a16207" stroke-width="1.5"/>`) },
  { id: 'bandana', name: 'Bandana', slot: 'neck', cost: 3, isNew: true, draw: (a) => atNeck(a, `<path d="M-15 -5 L 15 -5 L 0 16 Z" fill="#14b8a6" stroke="#0f766e" stroke-width="2" stroke-linejoin="round"/><circle cx="-5" cy="0" r="1.6" fill="#fff"/><circle cx="5" cy="0" r="1.6" fill="#fff"/><circle cx="0" cy="7" r="1.6" fill="#fff"/>`) },
  // ---- back (drawn behind the body) ----
  { id: 'jetpack', name: 'Jet Pack', slot: 'back', cost: 6, isNew: true, draw: (a) => atBack(a, `<g stroke="#334155" stroke-width="2.5" stroke-linejoin="round"><rect x="-22" y="-20" width="16" height="34" rx="7" fill="#94a3b8"/><rect x="-6" y="-20" width="16" height="34" rx="7" fill="#cbd5e1"/></g><path d="M-18 14 L -14 30 L -10 14 Z M -2 14 L 2 32 L 6 14 Z" fill="#f97316" stroke="#c2410c" stroke-width="1.5"/><path d="M-16 14 L -14 22 L -12 14 Z M 0 14 L 2 24 L 4 14 Z" fill="#fde047"/>`) },
  { id: 'wings', name: 'Fairy Wings', slot: 'back', cost: 5, isNew: true, draw: (a) => atBack(a, `<g stroke="#a855f7" stroke-width="2" opacity="0.9"><path d="M0 0 C -10 -40 -44 -44 -40 -14 C -38 -2 -18 2 0 0 Z" fill="rgba(216,180,254,0.75)"/><path d="M0 0 C -24 4 -36 22 -22 30 C -12 34 -4 18 0 0 Z" fill="rgba(251,207,232,0.8)"/></g>`) },
  { id: 'guitar', name: 'Rock Guitar', slot: 'back', cost: 5, isNew: true, draw: (a) => atBack(a, `<g transform="rotate(-35)" stroke="#7c2d12" stroke-width="2.5" stroke-linejoin="round"><rect x="-3" y="-44" width="6" height="34" fill="#92400e"/><rect x="-6" y="-50" width="12" height="9" rx="2" fill="#78350f"/><path d="M0 -12 C -16 -12 -18 2 -12 8 C -18 16 -12 30 0 30 C 12 30 18 16 12 8 C 18 2 16 -12 0 -12 Z" fill="#ef4444"/><circle cx="0" cy="10" r="4" fill="#7f1d1d"/></g>`, 0.9) },
];

const S = 150;
function dinoWith(id: string, items: Item[], size = S) {
  const d = DINOS.find((x) => x.id === id)!;
  const a = ANCHORS[id];
  const chain = (inner: string) => `<g transform="translate(100 190) scale(0.78) translate(-100 -190)"><g transform="${a.wrap ?? ''}">${inner}</g></g>`;
  const back = items.filter((i) => i.slot === 'back').map((i) => i.draw(a)).join('');
  const front = items.filter((i) => i.slot !== 'back').map((i) => i.draw(a)).join('');
  const body = renderToStaticMarkup(<Dino species={d.id} color={d.color} belly={d.belly} stage="baby" mood="happy" size={size} />)
    .replace(/<svg[^>]*>/, '')
    .replace('</svg>', '');
  return `${chain(back)}${body}${chain(front)}`;
}

it('renders the modern wardrobe sample', () => {
  const COLS = 6;
  const T = (x: number, y: number, t: string, size = 13, w = 400, fill = '#1f2a44') =>
    `<text x="${x}" y="${y}" text-anchor="middle" font-family="Arial" font-size="${size}" font-weight="${w}" fill="${fill}">${t}</text>`;
  const SLOT_LABEL: Record<Slot, string> = { head: 'Head', eyes: 'Eyes', neck: 'Neck', back: 'Back' };
  const catalog = ITEMS.map((it, i) => {
    const x = (i % COLS) * S;
    const y = 60 + Math.floor(i / COLS) * (S + 50);
    return `<g transform="translate(${x} ${y})">
      <rect x="6" y="0" width="${S - 12}" height="${S + 40}" rx="16" fill="#fff" stroke="${it.isNew ? '#9fd8ae' : '#eadfca'}" stroke-width="3"/>
      ${it.isNew ? `<rect x="${S - 50}" y="8" width="36" height="16" rx="8" fill="#2e9d57"/>${T(S - 32, 20, 'NEW', 10, 700, '#fff')}` : ''}
      <g transform="translate(5 2) scale(${(S - 10) / 200})">${dinoWith('rexy', [it])}</g>
      ${T(S / 2, S + 12, it.name, 13, 700)}
      ${T(S / 2, S + 30, `${SLOT_LABEL[it.slot]} · ${it.cost} eggs`, 11, 400, '#5d6886')}
    </g>`;
  }).join('');
  const rows = Math.ceil(ITEMS.length / COLS);
  const oy = 60 + rows * (S + 50) + 40;
  const outfits: [string, string, string[]][] = [
    ['brachio', 'Sporty Brachio', ['cap', 'starshades', 'bowtie', 'jetpack']],
    ['tricera', 'Rock-star Tricera', ['headphones', 'heartglasses', 'bandana', 'guitar']],
    ['raptor', 'Dreamy Raptor', ['beanie', 'goggles', 'necklace', 'wings']],
    ['rexy', 'Spring Rexy', ['flowers', 'glasses', 'scarf', 'jetpack']],
  ];
  const OS = 220;
  const outfitCells = outfits.map(([id, label, ids], i) => {
    const its = ids.map((x) => ITEMS.find((it) => it.id === x)!);
    return `<g transform="translate(${10 + i * (OS + 4)} ${oy + 30})">
      <rect width="${OS}" height="${OS + 58}" rx="18" fill="#fff" stroke="#eadfca" stroke-width="3"/>
      <g transform="translate(10 6) scale(${(OS - 20) / 200})">${dinoWith(id, its)}</g>
      ${T(OS / 2, OS + 18, label, 15, 700)}
      ${T(OS / 2, OS + 34, its.slice(0, 2).map((x) => x.name).join(' · '), 11, 400, '#5d6886')}
      ${T(OS / 2, OS + 50, its.slice(2).map((x) => x.name).join(' · '), 11, 400, '#5d6886')}
    </g>`;
  }).join('');
  const W = Math.max(COLS * S, 4 * (OS + 4) + 16);
  const H = oy + OS + 110;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect width="100%" height="100%" fill="#fff9ee"/>
    ${T(W / 2, 32, '👕 Modern Wardrobe — items (one per spot: head · eyes · neck · back)', 20, 700)}
    ${catalog}
    ${T(W / 2, oy + 14, '🎨 Mix &amp; match: wear one item in every spot at the same time', 20, 700)}
    ${outfitCells}
  </svg>`;
  writeFileSync('design/wardrobe-sample.png', new Resvg(svg, { font: { loadSystemFonts: true } }).render().asPng());
});
