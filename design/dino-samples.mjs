// Sample sheet of species-shaped cartoon dinos (design preview only).
// Run: node design/dino-samples.mjs  -> design/dino-samples.svg + .png
import { Resvg } from '@resvg/resvg-js';
import { writeFileSync } from 'node:fs';

const shade = (hex, amt) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (c) => Math.max(0, Math.min(255, Math.round(c + c * amt)));
  return '#' + [f(n >> 16), f((n >> 8) & 255), f(n & 255)].map((v) => v.toString(16).padStart(2, '0')).join('');
};

const eye = (x, y, r, dark) => `
  <circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="${dark}" stroke-width="2"/>
  <circle cx="${x + r * 0.25}" cy="${y + r * 0.1}" r="${r * 0.55}" fill="#222"/>
  <circle cx="${x + r * 0.45}" cy="${y - r * 0.2}" r="${r * 0.2}" fill="#fff"/>`;
const cheek = (x, y, r = 5) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#ff8fa0" opacity="0.6"/>`;
const shadow = (cx = 100, rx = 62) => `<ellipse cx="${cx}" cy="186" rx="${rx}" ry="7" fill="rgba(0,0,0,0.12)"/>`;

// ---------------- Rexy: Tyrannosaurus rex ----------------
function rexy(c, b) {
  const d = shade(c, -0.3), far = shade(c, -0.15);
  return `${shadow(100, 60)}
  <g stroke="${d}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
    <path d="M74 118 C 44 116 20 104 6 86 C 16 116 44 140 82 144 Z" fill="${c}"/>
    <path d="M96 140 L 100 176 L 90 182 L 112 182 L 114 150 Z" fill="${far}"/>
    <ellipse cx="96" cy="124" rx="42" ry="33" fill="${c}" transform="rotate(-18 96 124)"/>
    <ellipse cx="104" cy="134" rx="22" ry="20" fill="${b}" stroke="none" transform="rotate(-18 104 134)"/>
    <path d="M104 128 C 126 124 132 148 124 160 L 128 178 L 140 182 L 104 182 L 106 162 C 96 152 94 136 104 128 Z" fill="${c}"/>
    <path d="M108 104 C 116 94 122 88 128 84 L 146 98 C 136 106 126 114 118 122 Z" fill="${c}"/>
    <path d="M118 72 C 118 42 152 34 174 42 C 188 48 194 62 192 74 L 188 82 L 134 86 C 122 86 118 80 118 72 Z" fill="${c}"/>
    <path d="M132 86 L 188 82 C 188 94 176 102 154 102 C 138 102 130 96 132 86 Z" fill="${b}"/>
    <path d="M128 116 q 12 0 14 10" fill="none" stroke-width="5"/>
    <path d="M142 126 l 4 3 M 140 128 l 2 4" stroke-width="2"/>
  </g>
  <g fill="#fff" stroke="${d}" stroke-width="1.2" stroke-linejoin="round">
    <path d="M150 85 l 3 6 l 3 -6.3 Z"/><path d="M162 84.4 l 3 6 l 3 -6.3 Z"/><path d="M174 83.8 l 3 5.6 l 3 -6 Z"/>
  </g>
  <path d="M146 90 Q 166 98 186 86" fill="none" stroke="${d}" stroke-width="2.5" stroke-linecap="round"/>
  ${eye(150, 58, 10, d)}
  <path d="M138 46 q 12 -6 22 -2" fill="none" stroke="${d}" stroke-width="3" stroke-linecap="round"/>
  <circle cx="183" cy="56" r="2.4" fill="${d}"/>
  ${cheek(144, 78)}`;
}

// ---------------- Brachio: Brachiosaurus ----------------
function brachio(c, b) {
  const d = shade(c, -0.3), far = shade(c, -0.15);
  return `${shadow(92, 66)}
  <g transform="translate(0 6) scale(1 0.97)">
  <g stroke="${d}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
    <path d="M40 134 C 22 140 10 156 4 168 C 20 162 34 154 48 146 Z" fill="${c}"/>
    <rect x="56" y="140" width="16" height="42" rx="7" fill="${far}"/>
    <rect x="100" y="124" width="16" height="58" rx="7" fill="${far}"/>
    <ellipse cx="82" cy="130" rx="46" ry="29" fill="${c}" transform="rotate(-14 82 130)"/>
    <ellipse cx="86" cy="142" rx="28" ry="14" fill="${b}" stroke="none" transform="rotate(-14 86 142)"/>
    <rect x="42" y="142" width="17" height="40" rx="7" fill="${c}"/>
    <rect x="114" y="120" width="17" height="62" rx="7" fill="${c}"/>
    <path d="M106 112 C 116 74 128 42 142 26 L 162 34 C 146 52 134 88 128 122 Z" fill="${c}"/>
    <path d="M124 110 C 130 80 140 54 152 40" fill="none" stroke="${b}" stroke-width="6"/>
    <ellipse cx="164" cy="30" rx="22" ry="12" fill="${c}"/>
    <circle cx="153" cy="19" r="9" fill="${c}"/>
  </g>
  <path d="M166 36 Q 176 40 184 33" fill="none" stroke="${d}" stroke-width="2.5" stroke-linecap="round"/>
  ${eye(160, 26, 6.5, d)}
  <circle cx="151" cy="15" r="1.8" fill="${d}"/><circle cx="156" cy="14" r="1.8" fill="${d}"/>
  ${cheek(170, 36, 4)}
  <g fill="${shade(c, -0.12)}"><circle cx="70" cy="118" r="4"/><circle cx="86" cy="112" r="3"/><circle cx="60" cy="128" r="3"/></g>
  </g>`;
}

// ---------------- Tricera: Triceratops ----------------
function tricera(c, b) {
  const d = shade(c, -0.3), far = shade(c, -0.15), horn = '#fff6e0';
  const bumps = Array.from({ length: 9 }, (_, i) => {
    const a = ((-150 + i * 30) * Math.PI) / 180;
    return `<circle cx="${(136 + 38 * Math.cos(a)).toFixed(1)}" cy="${(98 + 40 * Math.sin(a)).toFixed(1)}" r="6" fill="${shade(c, 0.25)}"/>`;
  }).join('');
  return `${shadow(98, 66)}
  <g stroke="${d}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
    <path d="M44 128 C 26 130 12 138 6 150 C 22 150 36 148 48 144 Z" fill="${c}"/>
    <rect x="62" y="148" width="18" height="34" rx="7" fill="${far}"/>
    <rect x="114" y="148" width="18" height="34" rx="7" fill="${far}"/>
    <ellipse cx="88" cy="132" rx="50" ry="32" fill="${c}"/>
    <ellipse cx="94" cy="146" rx="32" ry="13" fill="${b}" stroke="none"/>
    <rect x="46" y="150" width="19" height="32" rx="7" fill="${c}"/>
    <rect x="98" y="150" width="19" height="32" rx="7" fill="${c}"/>
    ${bumps}
    <ellipse cx="136" cy="98" rx="36" ry="40" fill="${shade(c, 0.12)}"/>
    <ellipse cx="136" cy="100" rx="24" ry="27" fill="${b}" stroke="none"/>
    <path d="M136 104 C 144 90 168 92 178 106 L 192 118 L 180 128 C 168 136 148 136 138 126 C 130 120 130 110 136 104 Z" fill="${c}"/>
    <path d="M182 110 L 194 118 L 182 126 Z" fill="${shade(c, -0.2)}"/>
    <path d="M145 102 L 152 52 L 158 103 Z" fill="${shade(horn, -0.08)}"/>
    <path d="M155 102 L 176 54 L 167 106 Z" fill="${horn}"/>
    <path d="M177 107 L 188 86 L 186 113 Z" fill="${horn}"/>
  </g>
  <path d="M150 124 Q 164 132 178 122" fill="none" stroke="${d}" stroke-width="2.5" stroke-linecap="round"/>
  ${eye(160, 110, 8, d)}
  ${cheek(150, 120, 5)}`;
}

// ---------------- Ptero: Pteranodon ----------------
function ptero(c, b) {
  const d = shade(c, -0.3), wing = shade(c, 0.2), beak = '#ffcf56';
  return `${shadow(100, 40)}
  <g stroke="${d}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
    <path d="M94 106 C 70 78 40 66 6 68 C 18 84 20 104 14 120 C 40 112 68 118 92 126 Z" fill="${wing}"/>
    <path d="M106 106 C 130 78 160 66 194 68 C 182 84 180 104 186 120 C 160 112 132 118 108 126 Z" fill="${wing}"/>
    <path d="M94 106 C 70 78 40 66 6 68" fill="none" stroke-width="5"/>
    <path d="M106 106 C 130 78 160 66 194 68" fill="none" stroke-width="5"/>
    <path d="M94 140 l -4 14 l -6 4 M 106 140 l 4 14 l 6 4" fill="none"/>
    <ellipse cx="100" cy="118" rx="16" ry="24" fill="${c}"/>
    <ellipse cx="100" cy="124" rx="9" ry="14" fill="${b}" stroke="none"/>
    <path d="M94 96 C 96 88 104 84 112 84 L 116 98 C 110 102 102 104 96 104 Z" fill="${c}"/>
    <path d="M104 70 L 66 50 L 108 84 Z" fill="${shade(c, 0.1)}"/>
    <path d="M122 72 L 186 88 L 124 94 Z" fill="${beak}"/>
    <ellipse cx="112" cy="80" rx="18" ry="15" fill="${c}"/>
  </g>
  <path d="M124 90 Q 150 94 176 89" fill="none" stroke="${shade(beak, -0.35)}" stroke-width="2" stroke-linecap="round"/>
  ${eye(114, 76, 7.5, d)}
  ${cheek(118, 89, 4)}`;
}

// ---------------- Spino: Spinosaurus ----------------
function spino(c, b) {
  const d = shade(c, -0.3), far = shade(c, -0.15), sail = '#fb923c';
  const tops = [100, 80, 70, 68, 76, 94];
  const spines = [62, 74, 86, 98, 110, 122]
    .map((x, i) => `<path d="M${x} 112 L ${x + 2} ${tops[i]}" stroke="${shade(sail, -0.3)}" stroke-width="3" stroke-linecap="round"/>`)
    .join('');
  return `${shadow(98, 64)}
  <path d="M54 114 C 54 64 96 38 132 106 Z" fill="${sail}" stroke="${shade(sail, -0.35)}" stroke-width="3" stroke-linejoin="round"/>
  ${spines}
  <g stroke="${d}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
    <path d="M52 122 C 30 116 14 104 4 90 C 6 112 22 132 50 142 Z" fill="${c}"/>
    <path d="M26 108 C 24 98 28 92 32 90 C 32 98 36 106 40 112 Z" fill="${sail}"/>
    <path d="M86 140 L 90 176 L 80 182 L 104 182 L 104 146 Z" fill="${far}"/>
    <ellipse cx="92" cy="124" rx="46" ry="30" fill="${c}"/>
    <ellipse cx="98" cy="136" rx="28" ry="15" fill="${b}" stroke="none"/>
    <path d="M100 130 C 120 128 126 148 118 158 L 122 178 L 134 182 L 100 182 L 102 162 C 92 152 92 136 100 130 Z" fill="${c}"/>
    <path d="M126 116 q 10 2 10 12" fill="none" stroke-width="5"/>
    <path d="M118 96 C 124 86 134 84 144 86 L 192 94 C 196 98 194 104 188 104 L 146 106 C 132 108 120 104 118 96 Z" fill="${c}"/>
    <path d="M136 106 L 188 104 C 186 110 176 112 160 112 C 146 112 138 110 136 106 Z" fill="${b}"/>
  </g>
  <g fill="#fff" stroke="${d}" stroke-width="1"><path d="M160 104.8 l 2 4 l 2 -4.1 Z"/><path d="M170 104.4 l 2 4 l 2 -4.1 Z"/><path d="M180 104 l 2 3.6 l 2 -3.8 Z"/></g>
  ${eye(140, 92, 8, d)}
  <circle cx="184" cy="96" r="2" fill="${d}"/>
  ${cheek(152, 104, 4)}`;
}

// ---------------- Raptor: Velociraptor ----------------
function raptor(c, b) {
  const d = shade(c, -0.3), far = shade(c, -0.15), feather = '#ffd166';
  return `${shadow(100, 58)}
  <g stroke="${d}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
    <path d="M66 104 L 10 92 L 12 102 L 64 120 Z" fill="${c}"/>
    <path d="M14 92 L 2 84 L 6 96 L 0 100 L 12 102 Z" fill="${feather}"/>
    <path d="M90 120 L 96 150 L 92 176 L 84 182 L 104 182 L 104 150 Z" fill="${far}"/>
    <ellipse cx="96" cy="110" rx="36" ry="21" fill="${c}" transform="rotate(-8 96 110)"/>
    <ellipse cx="100" cy="118" rx="22" ry="10" fill="${b}" stroke="none"/>
    <path d="M104 116 C 118 118 122 136 114 146 L 118 172 L 132 178 L 132 184 L 104 184 L 104 174 L 98 150 C 90 140 92 120 104 116 Z" fill="${c}"/>
    <path d="M112 176 Q 122 166 112 156" fill="none" stroke-width="3.5"/>
    <path d="M122 98 C 132 90 134 78 138 70 L 150 74 C 146 88 140 100 130 112 Z" fill="${c}"/>
    <path d="M136 62 C 142 52 162 52 176 58 L 194 66 C 194 72 186 76 178 76 L 148 78 C 138 78 132 70 136 62 Z" fill="${c}"/>
    <path d="M118 112 C 130 112 136 122 132 130 L 126 128 C 128 122 124 118 118 118 Z" fill="${c}"/>
    <path d="M120 120 l 4 12 l 4 -2 l 2 6" fill="none" stroke="${shade(feather, -0.4)}" stroke-width="2"/>
  </g>
  <path d="M140 56 l 2 -10 l 4 9 l 3 -11 l 3 12" fill="${feather}" stroke="${shade(feather, -0.4)}" stroke-width="2" stroke-linejoin="round"/>
  <g fill="${shade(c, -0.18)}"><path d="M78 92 l 6 -2 l -2 8 Z"/><path d="M92 90 l 6 -2 l -2 8 Z"/><path d="M106 90 l 6 -1 l -2 8 Z"/></g>
  <path d="M154 72 Q 170 78 188 70" fill="none" stroke="${d}" stroke-width="2.5" stroke-linecap="round"/>
  <g fill="#fff" stroke="${d}" stroke-width="1"><path d="M166 75.5 l 2 3.6 l 2 -3.8 Z"/><path d="M176 74 l 2 3.4 l 2 -3.6 Z"/></g>
  ${eye(154, 64, 8, d)}
  <path d="M144 54 l 16 3" stroke="${d}" stroke-width="3" stroke-linecap="round"/>
  <circle cx="189" cy="64" r="1.8" fill="${d}"/>
  ${cheek(150, 74, 4)}`;
}

const DINOS = [
  ['Rexy', 'Tyrannosaurus rex', 'Big head, tiny arms, strong legs', rexy, '#4caf50', '#c5e8a5'],
  ['Brachio', 'Brachiosaurus', 'Very long neck, tall front legs', brachio, '#3b82f6', '#bfdbfe'],
  ['Tricera', 'Triceratops', 'Three horns and a big frill', tricera, '#f97316', '#fed7aa'],
  ['Ptero', 'Pteranodon', 'Wide wings, long beak, head crest', ptero, '#a855f7', '#e9d5ff'],
  ['Spino', 'Spinosaurus', 'Sail on its back, long snout', spino, '#0ea5e9', '#bae6fd'],
  ['Raptor', 'Velociraptor', 'Fast, feathery, sickle claw', raptor, '#e11d48', '#fecdd3'],
];

const W = 300;
const H = 330;
const cells = DINOS.map(([name, species, note, fn, c, b], i) => {
  const x = (i % 3) * W;
  const y = Math.floor(i / 3) * H;
  return `<g transform="translate(${x} ${y})">
    <rect x="10" y="10" width="${W - 20}" height="${H - 20}" rx="24" fill="#ffffff" stroke="#eadfca" stroke-width="3"/>
    <g transform="translate(40 20) scale(1.1)">${fn(c, b)}</g>
    <text x="${W / 2}" y="262" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="#1f2a44">${name}</text>
    <text x="${W / 2}" y="288" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#5d6886" font-style="italic">${species}</text>
    <text x="${W / 2}" y="310" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#5d6886">${note}</text>
  </g>`;
}).join('\n');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W * 3} ${H * 2}" width="${W * 3}" height="${H * 2}">
  <rect width="100%" height="100%" fill="#fff9ee"/>
  ${cells}
</svg>`;

writeFileSync('design/dino-samples.svg', svg);
writeFileSync('design/dino-samples.png', new Resvg(svg, { font: { loadSystemFonts: true } }).render().asPng());
console.log('wrote design/dino-samples.svg and .png');
