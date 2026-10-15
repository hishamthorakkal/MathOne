// Design preview only: 12 new species for the Dino Discovery Book.
// Run: node design/new-dinos.mjs  -> design/new-dinos.png
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
const smile = (d, dark, w = 2.5) => `<path d="${d}" fill="none" stroke="${dark}" stroke-width="${w}" stroke-linecap="round"/>`;
const G = (d) => `<g stroke="${d}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">`;
const leg = (x, y, w, h, fill) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" fill="${fill}"/>`;

// ---------- Stego: Stegosaurus (back plates, spiky tail) ----------
function stego(c, b) {
  const d = shade(c, -0.32), far = shade(c, -0.15), plate = '#f59e0b';
  const plates = [
    [50, 112, 14], [64, 100, 18], [80, 94, 21], [98, 94, 21], [116, 100, 18], [130, 112, 13],
  ].map(([x, y, s]) => `<path d="M${x - s * 0.55} ${y + 6} L ${x} ${y - s} L ${x + s * 0.55} ${y + 6} Z" fill="${plate}" stroke="${shade(plate, -0.35)}" stroke-width="2.5" stroke-linejoin="round"/>`).join('');
  return `${shadow(96, 66)}
  ${plates}
  ${G(d)}
    <path d="M44 128 C 28 126 14 120 4 110 C 10 128 26 140 48 144 Z" fill="${c}"/>
    <path d="M10 112 L 2 96 L 16 110 Z M 20 118 L 14 100 L 26 116 Z" fill="#fff6e0"/>
    ${leg(60, 146, 18, 36, far)}${leg(116, 150, 15, 32, far)}
    <ellipse cx="92" cy="130" rx="52" ry="30" fill="${c}"/>
    <ellipse cx="96" cy="146" rx="32" ry="11" fill="${b}" stroke="none"/>
    ${leg(46, 148, 19, 34, c)}${leg(104, 152, 16, 30, c)}
    <path d="M134 128 C 146 128 152 134 156 140 L 146 150 C 140 144 136 140 130 140 Z" fill="${c}"/>
    <ellipse cx="164" cy="142" rx="20" ry="12" fill="${c}"/>
  </g>
  ${smile('M168 148 Q 176 152 183 146', d)}
  ${eye(166, 138, 6, d)}
  ${cheek(160, 148, 3.5)}`;
}

// ---------- Ankylo: Ankylosaurus (armour, club tail) ----------
function ankylo(c, b) {
  const d = shade(c, -0.32), far = shade(c, -0.15), armour = '#fcd34d';
  const bumps = [52, 66, 80, 94, 108, 122, 136].map((x, i) => `<circle cx="${x}" cy="${[124, 114, 109, 107, 109, 114, 124][i]}" r="6" fill="${armour}" stroke="${shade(armour, -0.4)}" stroke-width="2"/>`).join('');
  return `${shadow(96, 70)}
  ${G(d)}
    <path d="M44 136 C 30 134 22 132 18 130 L 20 140 C 26 142 34 144 44 146 Z" fill="${c}"/>
    <circle cx="12" cy="131" r="10" fill="${shade(c, 0.1)}"/><circle cx="22" cy="135" r="8" fill="${shade(c, 0.1)}"/>
    ${leg(62, 152, 18, 30, far)}${leg(118, 152, 18, 30, far)}
    <ellipse cx="96" cy="136" rx="56" ry="27" fill="${c}"/>
    <ellipse cx="98" cy="152" rx="36" ry="9" fill="${b}" stroke="none"/>
    <path d="M44 140 l -10 4 l 10 4 M 62 154 l -6 10 l 10 -4 M 132 154 l 6 10 l -10 -4" fill="${armour}"/>
    ${leg(48, 154, 19, 28, c)}${leg(104, 154, 19, 28, c)}
    <path d="M146 128 C 158 122 176 124 186 134 C 190 142 184 152 172 154 C 160 156 148 150 146 140 Z" fill="${c}"/>
    <path d="M156 124 l -4 -10 l 10 6 M 170 124 l 2 -10 l 6 10" fill="${armour}"/>
  </g>
  ${bumps}
  ${smile('M168 146 Q 178 150 186 143', d)}
  ${eye(166, 136, 6.5, d)}
  ${cheek(160, 146, 3.5)}`;
}

// ---------- Pachy: Pachycephalosaurus (thick dome head) ----------
function pachy(c, b) {
  const d = shade(c, -0.32), far = shade(c, -0.15), dome = '#fbcfe8';
  const knobs = [-160, -135, -110, -70, -45, -20].map((a) => {
    const r = (a * Math.PI) / 180;
    return `<circle cx="${(150 + 28 * Math.cos(r)).toFixed(1)}" cy="${(70 + 26 * Math.sin(r) + 10).toFixed(1)}" r="4.5" fill="${shade(c, 0.2)}" stroke="${d}" stroke-width="2"/>`;
  }).join('');
  return `${shadow(100, 60)}
  ${G(d)}
    <path d="M70 118 C 44 116 22 108 8 94 C 18 120 44 140 76 142 Z" fill="${c}"/>
    <path d="M94 140 L 98 176 L 88 182 L 110 182 L 112 150 Z" fill="${far}"/>
    <ellipse cx="96" cy="124" rx="38" ry="30" fill="${c}" transform="rotate(-20 96 124)"/>
    <ellipse cx="104" cy="134" rx="20" ry="17" fill="${b}" stroke="none" transform="rotate(-20 104 134)"/>
    <path d="M102 128 C 122 124 128 146 120 158 L 124 178 L 136 182 L 102 182 L 104 162 C 94 152 92 136 102 128 Z" fill="${c}"/>
    <path d="M110 104 C 118 96 124 92 130 90 L 142 102 C 134 108 126 114 118 120 Z" fill="${c}"/>
    <path d="M124 82 C 126 70 140 64 156 66 C 172 68 184 78 186 92 C 178 100 160 104 144 102 C 132 100 122 94 124 82 Z" fill="${c}"/>
    <path d="M124 80 C 120 54 138 40 152 40 C 168 40 182 56 178 78 C 160 72 140 72 124 80 Z" fill="${dome}"/>
    <path d="M126 116 q 10 0 12 8" fill="none" stroke-width="5"/>
  </g>
  ${knobs}
  ${smile('M154 94 Q 168 100 182 92', d)}
  ${eye(152, 82, 7.5, d)}
  ${cheek(146, 92, 4)}
  <circle cx="182" cy="84" r="2" fill="${d}"/>`;
}

// ---------- Parasaur: Parasaurolophus (tube crest, duck bill) ----------
function parasaur(c, b) {
  const d = shade(c, -0.32), far = shade(c, -0.15), crest = '#f97316';
  return `${shadow(100, 62)}
  ${G(d)}
    <path d="M72 120 C 44 118 22 110 6 98 C 16 124 44 142 78 144 Z" fill="${c}"/>
    <path d="M94 140 L 98 176 L 88 182 L 110 182 L 112 150 Z" fill="${far}"/>
    <ellipse cx="96" cy="126" rx="40" ry="31" fill="${c}" transform="rotate(-14 96 126)"/>
    <ellipse cx="102" cy="138" rx="24" ry="15" fill="${b}" stroke="none" transform="rotate(-14 102 138)"/>
    <path d="M102 130 C 122 126 128 148 120 160 L 124 178 L 136 182 L 102 182 L 104 162 C 94 152 92 138 102 130 Z" fill="${c}"/>
    <path d="M114 104 C 122 94 128 86 134 80 L 148 92 C 140 100 130 110 122 120 Z" fill="${c}"/>
    <path d="M140 64 C 120 50 96 40 76 38 C 80 46 92 52 108 58 C 120 62 128 70 134 76 Z" fill="${crest}"/>
    <path d="M132 76 C 132 62 146 56 160 60 C 170 62 178 70 192 74 C 194 82 188 88 176 88 L 150 90 C 138 90 132 86 132 76 Z" fill="${c}"/>
    <path d="M168 84 L 192 78 C 194 84 188 90 176 90 Z" fill="#ffd8a8"/>
    <path d="M132 118 q 10 2 10 12" fill="none" stroke-width="5"/>
  </g>
  ${smile('M154 86 Q 166 92 178 86', d)}
  ${eye(152, 72, 7.5, d)}
  ${cheek(146, 82, 4)}`;
}

// ---------- Diplo: Diplodocus (long neck AND very long whip tail) ----------
function diplo(c, b) {
  const d = shade(c, -0.32), far = shade(c, -0.15);
  return `${shadow(96, 72)}
  ${G(d)}
    <path d="M56 124 C 36 124 20 130 10 142 C 4 150 2 160 8 164 C 10 156 16 148 26 142 C 38 136 50 136 60 138 Z" fill="${c}"/>
    ${leg(64, 140, 15, 42, far)}${leg(108, 142, 15, 40, far)}
    <ellipse cx="90" cy="128" rx="40" ry="24" fill="${c}"/>
    <ellipse cx="92" cy="140" rx="24" ry="10" fill="${b}" stroke="none"/>
    ${leg(52, 142, 16, 40, c)}${leg(96, 144, 16, 38, c)}
    <path d="M122 118 C 142 104 156 90 168 72 L 180 80 C 168 98 152 116 128 132 Z" fill="${c}"/>
    <path d="M134 118 C 150 106 160 94 170 80" fill="none" stroke="${b}" stroke-width="5"/>
    <ellipse cx="182" cy="72" rx="15" ry="9" fill="${c}"/>
  </g>
  <path d="M60 116 l 4 -8 l 4 8 M 74 108 l 4 -8 l 4 8 M 88 106 l 4 -8 l 4 8 M 102 108 l 4 -8 l 4 8" fill="${shade(c, 0.25)}" stroke="${d}" stroke-width="2" stroke-linejoin="round"/>
  ${smile('M184 77 Q 190 79 195 75', d, 2)}
  ${eye(182, 69, 5, d)}
  ${cheek(188, 78, 3)}`;
}

// ---------- Iguano: Iguanodon (thumb spike) ----------
function iguano(c, b) {
  const d = shade(c, -0.32), far = shade(c, -0.15);
  return `${shadow(100, 62)}
  ${G(d)}
    <path d="M70 120 C 44 120 22 112 6 100 C 16 126 44 144 76 146 Z" fill="${c}"/>
    <path d="M94 142 L 98 176 L 88 182 L 110 182 L 112 152 Z" fill="${far}"/>
    <ellipse cx="96" cy="128" rx="42" ry="32" fill="${c}" transform="rotate(-12 96 128)"/>
    <ellipse cx="102" cy="140" rx="26" ry="16" fill="${b}" stroke="none" transform="rotate(-12 102 140)"/>
    <path d="M102 132 C 124 128 130 150 122 162 L 126 178 L 138 182 L 102 182 L 104 164 C 94 154 92 140 102 132 Z" fill="${c}"/>
    <path d="M118 106 C 126 98 132 92 138 86 L 152 98 C 144 106 134 114 126 122 Z" fill="${c}"/>
    <path d="M134 80 C 136 66 152 60 168 64 C 182 68 192 78 192 88 C 186 96 170 98 154 98 C 140 98 132 92 134 80 Z" fill="${c}"/>
    <path d="M178 90 L 194 86 C 194 94 186 98 176 98 Z" fill="${shade(c, -0.15)}"/>
    <path d="M132 118 C 142 120 148 128 148 136" fill="none" stroke-width="6"/>
    <path d="M142 130 L 164 104 L 154 138 Z" fill="#fff6e0"/>
  </g>
  ${smile('M158 92 Q 170 96 182 90', d)}
  ${eye(158, 78, 7.5, d)}
  ${cheek(152, 88, 4)}
  <circle cx="186" cy="80" r="2" fill="${d}"/>`;
}

// ---------- Dilo: Dilophosaurus (two head crests, neck frill) ----------
function dilo(c, b) {
  const d = shade(c, -0.32), far = shade(c, -0.15), red = '#ef4444';
  const frillStripes = [0, 1, 2, 3, 4].map((i) => {
    const a = ((-170 + i * 40) * Math.PI) / 180;
    return `<path d="M140 80 L ${(140 + 34 * Math.cos(a)).toFixed(1)} ${(80 + 34 * Math.sin(a)).toFixed(1)}" stroke="${shade(red, -0.3)}" stroke-width="2"/>`;
  }).join('');
  return `${shadow(100, 60)}
  <circle cx="140" cy="80" r="34" fill="${red}" stroke="${shade(red, -0.35)}" stroke-width="3"/>
  ${frillStripes}
  ${G(d)}
    <path d="M70 116 C 44 112 22 104 6 92 C 16 118 44 136 76 140 Z" fill="${c}"/>
    <path d="M94 138 L 98 176 L 88 182 L 110 182 L 112 148 Z" fill="${far}"/>
    <ellipse cx="96" cy="122" rx="38" ry="26" fill="${c}" transform="rotate(-14 96 122)"/>
    <ellipse cx="102" cy="132" rx="22" ry="13" fill="${b}" stroke="none" transform="rotate(-14 102 132)"/>
    <path d="M102 126 C 122 122 128 144 120 156 L 124 178 L 136 182 L 102 182 L 104 160 C 94 150 92 134 102 126 Z" fill="${c}"/>
    <path d="M114 104 C 122 96 128 90 134 84 L 148 96 C 140 104 130 112 122 118 Z" fill="${c}"/>
    <path d="M132 74 C 134 62 150 58 166 62 L 192 72 C 194 80 186 84 176 84 L 148 86 C 138 86 130 82 132 74 Z" fill="${c}"/>
    <path d="M140 64 C 140 46 160 44 164 62 Z" fill="${red}"/>
    <path d="M150 62 C 152 42 172 42 172 64 Z" fill="${shade(red, 0.15)}"/>
    <path d="M128 112 q 10 2 10 12" fill="none" stroke-width="5"/>
  </g>
  ${smile('M154 80 Q 170 86 188 78', d)}
  ${eye(150, 72, 7.5, d)}
  ${cheek(146, 80, 4)}`;
}

// ---------- Mosa: Mosasaurus (sea reptile, flippers) ----------
function mosa(c, b) {
  const d = shade(c, -0.32), wave = '#7dd3fc';
  return `
  <path d="M0 170 Q 25 160 50 170 T 100 170 T 150 170 T 200 170 L 200 200 L 0 200 Z" fill="${wave}" opacity="0.7"/>
  ${G(d)}
    <path d="M40 118 C 24 118 12 112 2 100 L 6 126 L 0 142 C 14 134 28 130 44 132 Z" fill="${c}"/>
    <path d="M70 136 C 64 150 52 160 40 160 C 50 150 56 140 58 132 Z" fill="${shade(c, -0.1)}"/>
    <path d="M44 122 C 60 104 100 100 140 106 C 160 108 176 114 194 120 C 188 132 168 138 140 138 C 100 140 64 140 44 132 Z" fill="${c}"/>
    <path d="M60 130 C 90 136 130 136 160 132" fill="none" stroke="${b}" stroke-width="7"/>
    <path d="M118 136 C 116 150 108 160 96 164 C 102 152 104 144 104 136 Z" fill="${shade(c, -0.1)}"/>
    <path d="M150 122 L 196 120 C 192 128 180 132 164 132 C 156 132 150 128 150 122 Z" fill="${b}"/>
  </g>
  <g fill="#fff" stroke="${d}" stroke-width="1"><path d="M160 121.5 l 2 4 l 2 -4 Z"/><path d="M170 121 l 2 4 l 2 -4 Z"/><path d="M180 120.6 l 2 3.6 l 2 -3.8 Z"/></g>
  <path d="M30 100 q 6 -10 12 0 M 172 92 q 5 -8 10 0" fill="none" stroke="${wave}" stroke-width="3" stroke-linecap="round"/>
  ${eye(150, 112, 7, d)}
  ${cheek(144, 122, 4)}`;
}

// ---------- Archie: Archaeopteryx (feathered wings, first bird) ----------
function archie(c, b) {
  const d = shade(c, -0.32), far = shade(c, -0.15), feather = '#60a5fa';
  return `${shadow(100, 46)}
  ${G(d)}
    <path d="M70 120 C 50 124 30 128 10 140 C 30 140 50 136 72 132 Z" fill="${feather}"/>
    <path d="M14 134 l -8 -6 M 22 132 l -10 -4 M 30 130 l -10 -2" fill="none" stroke="${shade(feather, -0.35)}" stroke-width="2"/>
    <path d="M96 140 L 98 172 L 90 180 L 108 180 L 108 146 Z" fill="${far}"/>
    <ellipse cx="96" cy="124" rx="30" ry="24" fill="${c}" transform="rotate(-14 96 124)"/>
    <ellipse cx="102" cy="132" rx="18" ry="13" fill="${b}" stroke="none"/>
    <path d="M104 138 L 110 172 L 122 180 L 102 180 L 100 150 Z" fill="${c}"/>
    <path d="M86 112 C 66 96 46 92 24 96 C 40 108 58 118 84 126 Z" fill="${feather}"/>
    <path d="M30 98 l 4 8 M 42 98 l 4 10 M 54 102 l 3 10 M 66 106 l 2 10" fill="none" stroke="${shade(feather, -0.35)}" stroke-width="2"/>
    <path d="M112 106 C 118 98 122 90 126 84 L 138 92 C 132 100 126 108 120 114 Z" fill="${c}"/>
    <ellipse cx="138" cy="80" rx="16" ry="14" fill="${c}"/>
    <path d="M148 76 L 176 82 L 148 90 Z" fill="#fde68a"/>
  </g>
  <path d="M130 66 l 2 -8 l 4 7 l 4 -8 l 2 9" fill="${feather}" stroke="${shade(feather, -0.35)}" stroke-width="2" stroke-linejoin="round"/>
  <g fill="#fff" stroke="${d}" stroke-width="0.8"><path d="M156 84.5 l 1.5 3 l 1.5 -3 Z"/><path d="M164 84 l 1.5 3 l 1.5 -3 Z"/></g>
  ${eye(138, 76, 6.5, d)}
  ${cheek(134, 86, 3.5)}`;
}

// ---------- Compy: Compsognathus (tiny! shown next to a flower) ----------
function compy(c, b) {
  const d = shade(c, -0.35);
  return `${shadow(100, 34)}
  <g transform="translate(150 132)">
    <path d="M0 50 L 0 10" stroke="#3f9142" stroke-width="4"/>
    <path d="M0 30 q 12 -8 16 2 q -10 6 -16 -2 Z" fill="#7cc46f"/>
    ${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="${(9 * Math.cos((a * Math.PI) / 180)).toFixed(1)}" cy="${(9 * Math.sin((a * Math.PI) / 180)).toFixed(1)}" rx="7" ry="5" transform="rotate(${a} ${(9 * Math.cos((a * Math.PI) / 180)).toFixed(1)} ${(9 * Math.sin((a * Math.PI) / 180)).toFixed(1)})" fill="#ffb4c8" stroke="#e5728f" stroke-width="1.5"/>`).join('')}
    <circle cx="0" cy="0" r="5" fill="#ffd23f"/>
  </g>
  <g transform="translate(40 66) scale(0.6)">
  ${G(d)}
    <path d="M66 104 C 40 100 20 96 4 90 C 14 108 40 118 64 120 Z" fill="${c}"/>
    <path d="M90 120 L 96 150 L 92 176 L 84 182 L 104 182 L 104 150 Z" fill="${shade(c, -0.15)}"/>
    <ellipse cx="96" cy="110" rx="32" ry="22" fill="${c}" transform="rotate(-10 96 110)"/>
    <ellipse cx="100" cy="118" rx="20" ry="11" fill="${b}" stroke="none"/>
    <path d="M104 116 C 118 118 122 136 114 146 L 118 172 L 132 178 L 132 184 L 104 184 L 104 174 L 98 150 C 90 140 92 120 104 116 Z" fill="${c}"/>
    <path d="M120 100 C 128 92 132 82 134 74 L 146 78 C 144 90 138 100 128 110 Z" fill="${c}"/>
    <path d="M132 64 C 136 52 158 50 172 58 C 182 64 186 72 182 78 C 172 82 156 82 144 80 C 134 78 128 72 132 64 Z" fill="${c}"/>
    <path d="M122 112 q 10 2 10 10" fill="none" stroke-width="5"/>
  </g>
  ${smile('M156 74 Q 166 79 178 73', d)}
  ${eye(154, 66, 9, d)}
  ${cheek(148, 76, 5)}
  </g>
  <text x="70" y="70" font-family="Arial" font-size="13" font-weight="700" fill="#5d6886">tiny!</text>`;
}

// ---------- Ovi: Oviraptor (parrot beak, head crest, carries an egg) ----------
function ovi(c, b) {
  const d = shade(c, -0.32), far = shade(c, -0.15), crest = '#fb923c';
  return `${shadow(100, 58)}
  ${G(d)}
    <path d="M70 114 C 48 110 28 104 12 96 C 20 116 44 130 74 134 Z" fill="${c}"/>
    <path d="M14 96 l -10 -6 l 4 10 l -6 4 l 12 2 Z" fill="${crest}"/>
    <path d="M94 136 L 98 174 L 88 182 L 110 182 L 112 146 Z" fill="${far}"/>
    <ellipse cx="96" cy="120" rx="34" ry="26" fill="${c}" transform="rotate(-14 96 120)"/>
    <ellipse cx="102" cy="130" rx="20" ry="13" fill="${b}" stroke="none"/>
    <path d="M102 124 C 120 122 126 142 118 154 L 122 176 L 134 182 L 102 182 L 104 158 C 94 148 92 132 102 124 Z" fill="${c}"/>
    <path d="M112 102 C 120 94 126 86 130 78 L 144 86 C 138 96 130 106 122 114 Z" fill="${c}"/>
    <path d="M136 52 C 132 40 140 32 150 34 C 156 40 156 50 152 60 Z" fill="${crest}"/>
    <ellipse cx="146" cy="70" rx="20" ry="17" fill="${c}"/>
    <path d="M160 62 C 172 64 178 72 176 80 C 170 84 164 84 158 80 Z" fill="#fde68a"/>
    <ellipse cx="132" cy="136" rx="13" ry="16" fill="#fff8e7" stroke="#d9c7a0"/>
    <path d="M118 116 C 130 118 138 124 140 132" fill="none" stroke-width="6"/>
    <path d="M140 126 C 148 130 148 140 142 146" fill="none" stroke-width="6"/>
  </g>
  <circle cx="128" cy="130" r="3" fill="#f2d9a6"/><circle cx="136" cy="142" r="2.5" fill="#f2d9a6"/>
  ${eye(146, 66, 7.5, d)}
  ${cheek(144, 78, 4)}`;
}

// ---------- Golden Rex: legendary T. rex for Olympiad Day ----------
function goldenRex() {
  const c = '#f5b301', b = '#fff1b8', d = shade(c, -0.35), far = shade(c, -0.15);
  const sparkle = (x, y, s) => `<path d="M${x} ${y - 8 * s} l ${2 * s} ${6 * s} l ${6 * s} ${2 * s} l ${-6 * s} ${2 * s} l ${-2 * s} ${6 * s} l ${-2 * s} ${-6 * s} l ${-6 * s} ${-2 * s} l ${6 * s} ${-2 * s} Z" fill="#fffbe0" stroke="#f5b301" stroke-width="1"/>`;
  return `<circle cx="110" cy="110" r="86" fill="#fff6cc"/>
  ${shadow(100, 60)}
  ${G(d)}
    <path d="M74 118 C 44 116 20 104 6 86 C 16 116 44 140 82 144 Z" fill="${c}"/>
    <path d="M96 140 L 100 176 L 90 182 L 112 182 L 114 150 Z" fill="${far}"/>
    <ellipse cx="96" cy="124" rx="42" ry="33" fill="${c}" transform="rotate(-18 96 124)"/>
    <ellipse cx="104" cy="134" rx="22" ry="20" fill="${b}" stroke="none" transform="rotate(-18 104 134)"/>
    <path d="M104 128 C 126 124 132 148 124 160 L 128 178 L 140 182 L 104 182 L 106 162 C 96 152 94 136 104 128 Z" fill="${c}"/>
    <path d="M108 104 C 116 94 122 88 128 84 L 146 98 C 136 106 126 114 118 122 Z" fill="${c}"/>
    <path d="M118 72 C 118 42 152 34 174 42 C 188 48 194 62 192 74 L 188 82 L 134 86 C 122 86 118 80 118 72 Z" fill="${c}"/>
    <path d="M132 86 L 188 82 C 188 94 176 102 154 102 C 138 102 130 96 132 86 Z" fill="${b}"/>
    <path d="M128 116 q 12 0 14 10" fill="none" stroke-width="5"/>
  </g>
  <path d="M140 40 l 5 -20 l 8 12 l 6 -16 l 6 16 l 8 -12 l 5 20 Z" fill="#ffd23f" stroke="#b07d00" stroke-width="2.5" stroke-linejoin="round"/>
  <circle cx="157" cy="26" r="3" fill="#e63946"/>
  ${smile('M146 90 Q 166 98 186 86', d)}
  ${eye(150, 58, 10, d)}
  ${cheek(144, 78)}
  ${sparkle(30, 50, 1.2)}${sparkle(186, 120, 1)}${sparkle(50, 160, 0.8)}${sparkle(178, 24, 0.7)}`;
}

const NEW_DINOS = [
  ['Stego', 'Stegosaurus', 'Shape Caves', 'Spot 3 patterns', stego, '#84cc16', '#ecfccb'],
  ['Ankylo', 'Ankylosaurus', 'Treasure Market', 'Master 2 measuring skills', ankylo, '#b45309', '#fde68a'],
  ['Pachy', 'Pachycephalosaurus', 'Any world', '“Never Give Up” ×5', pachy, '#ec4899', '#fce7f3'],
  ['Parasaur', 'Parasaurolophus', 'Time Mountain', 'Master 2 time skills', parasaur, '#14b8a6', '#ccfbf1'],
  ['Diplo', 'Diplodocus', 'Number Jungle', 'Win the Number Crystal', diplo, '#6366f1', '#e0e7ff'],
  ['Iguano', 'Iguanodon', 'Dino Nest', 'Master 2 grouping skills', iguano, '#64748b', '#e2e8f0'],
  ['Dilo', 'Dilophosaurus', 'Puzzle Forest', 'Master 2 logic skills', dilo, '#eab308', '#fef9c3'],
  ['Mosa', 'Mosasaurus', 'Training Camp', 'Finish Training Camp 5×', mosa, '#0369a1', '#bae6fd'],
  ['Archie', 'Archaeopteryx', 'Real world', '3 Real-World Missions', archie, '#fb7185', '#ffe4e6'],
  ['Compy', 'Compsognathus', 'First week', '3 Adventure Days', compy, '#65a30d', '#d9f99d'],
  ['Ovi', 'Oviraptor', 'Egg collector', 'Earn 25 Dino Eggs', ovi, '#7c3aed', '#ede9fe'],
  ['Golden Rex', 'Legendary T. rex', 'Olympiad Castle', 'Win the Olympiad Crystal', goldenRex, '#f5b301', '#fff1b8'],
];

const W = 300;
const H = 360;
const COLS = 4;
const cells = NEW_DINOS.map(([name, species, where, how, fn, c, b], i) => {
  const x = (i % COLS) * W;
  const y = Math.floor(i / COLS) * H;
  const legendary = name === 'Golden Rex';
  return `<g transform="translate(${x} ${y})">
    <rect x="10" y="10" width="${W - 20}" height="${H - 20}" rx="24" fill="#ffffff" stroke="${legendary ? '#f5b301' : '#eadfca'}" stroke-width="${legendary ? 5 : 3}"/>
    <g transform="translate(40 18) scale(1.1)">${fn(c, b)}</g>
    <text x="${W / 2}" y="258" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="#1f2a44">${name}</text>
    <text x="${W / 2}" y="282" text-anchor="middle" font-family="Arial, sans-serif" font-size="15" fill="#5d6886" font-style="italic">${species}</text>
    <rect x="26" y="292" width="${W - 52}" height="44" rx="14" fill="${legendary ? '#fff6cc' : '#f1eadb'}"/>
    <text x="${W / 2}" y="310" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="#1f2a44">${where}</text>
    <text x="${W / 2}" y="328" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" fill="#5d6886">${how}</text>
  </g>`;
}).join('\n');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W * COLS} ${H * 3}" width="${W * COLS}" height="${H * 3}">
  <rect width="100%" height="100%" fill="#fff9ee"/>
  ${cells}
</svg>`;

writeFileSync('design/new-dinos.png', new Resvg(svg, { font: { loadSystemFonts: true } }).render().asPng());
console.log('wrote design/new-dinos.png');

// ---------------- Mock-up: the Dino Discovery Book screen ----------------
const SIL = `<filter id="sil"><feColorMatrix type="matrix" values="0 0 0 0 0.80  0 0 0 0 0.76  0 0 0 0 0.69  0 0 0 1 0"/></filter>`;
const foot = (x, y, r = 0) => `<g transform="translate(${x} ${y}) rotate(${r})" fill="#a8916b"><ellipse cx="0" cy="0" rx="5" ry="6"/><circle cx="-5" cy="-8" r="2.4"/><circle cx="0" cy="-10" r="2.4"/><circle cx="5" cy="-8" r="2.4"/></g>`;
const card = (x, y, w, h, inner, border = '#eadfca') => `<g transform="translate(${x} ${y})"><rect width="${w}" height="${h}" rx="18" fill="#fff" stroke="${border}" stroke-width="3"/>${inner}</g>`;
const dinoAt = (fn, c, b, x, y, s, sil = false) => `<g transform="translate(${x} ${y}) scale(${s})" ${sil ? 'filter="url(#sil)"' : ''}>${fn(c, b)}</g>`;
const T = (x, y, t, size = 14, weight = 400, fill = '#1f2a44', anchor = 'middle') => `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}">${t}</text>`;
const bar = (x, y, w, pct, color = '#2e9d57') => `<rect x="${x}" y="${y}" width="${w}" height="10" rx="5" fill="#ebe3d2"/><rect x="${x}" y="${y}" width="${Math.max(10, w * pct)}" height="10" rx="5" fill="${color}"/>`;

const bookCards = [
  // found
  card(30, 150, 190, 210, dinoAt(stego, '#84cc16', '#ecfccb', 18, -4, 0.78) + T(95, 176, 'Stego', 18, 700) + T(95, 196, '★ Found on 24 Oct', 12, 400, '#2e9d57')),
  card(235, 150, 190, 210, dinoAt(diplo, '#6366f1', '#e0e7ff', 18, -4, 0.78) + T(95, 176, 'Diplo', 18, 700) + T(95, 196, '★ Found on 19 Oct', 12, 400, '#2e9d57')),
  // footprints spotted (almost)
  card(440, 150, 190, 210, dinoAt(iguano, '#64748b', '#e2e8f0', 18, -4, 0.78, true) + foot(20, 150, -20) + foot(40, 140, 10) + foot(60, 152, -15) +
    T(95, 172, 'Footprints spotted!', 14, 700, '#a26a00') + bar(25, 182, 140, 0.8, '#f2b233') + T(95, 204, 'Master 1 more Dino Nest skill', 11, 400, '#5d6886'), '#f6d36b'),
  // hidden
  card(645, 150, 190, 210, dinoAt(dilo, '#eab308', '#fef9c3', 18, -4, 0.78, true) + T(95, 100, '?', 56, 700, '#a8916b') +
    T(95, 172, '???', 18, 700) + T(95, 192, 'Clue: I live in Puzzle Forest', 11, 400, '#5d6886') + T(95, 206, 'and love tricky codes!', 11, 400, '#5d6886')),
];

const factPanel = card(30, 380, 805, 200,
  dinoAt(stego, '#84cc16', '#ecfccb', 10, 6, 0.95) +
  T(210, 40, 'Stego · Stegosaurus', 22, 700, '#1f2a44', 'start') +
  T(210, 66, 'Dino fact: Stego had 17 plates on its back and 4 spikes on its tail.', 15, 400, '#1f2a44', 'start') +
  `<rect x="210" y="84" width="560" height="64" rx="14" fill="#fff6d6" stroke="#f6d36b" stroke-width="2"/>` +
  T(226, 110, '🧮 Dino Maths: 2 Stegos stand side by side.', 15, 700, '#1f2a44', 'start') +
  T(226, 134, 'How many tail spikes are there altogether?   [ 6 ]  [ 8 ]  [ 10 ]', 15, 400, '#1f2a44', 'start') +
  `<rect x="210" y="160" width="130" height="30" rx="15" fill="#fff" stroke="#eadfca" stroke-width="2"/>` + T(275, 180, '🔊 Read to Me', 13, 700) +
  `<rect x="352" y="160" width="160" height="30" rx="15" fill="#2e9d57"/>` + T(432, 180, '⭐ Make my buddy', 13, 700, '#fff'));

const book = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 865 600" width="865" height="600">
  <defs>${SIL}</defs>
  <rect width="100%" height="100%" fill="#fff9ee"/>
  ${T(432, 44, '📖 Dino Discovery Book', 30, 700)}
  ${T(432, 72, 'You have found 8 of 18 dinos!', 16, 400, '#5d6886')}
  ${bar(282, 82, 300, 8 / 18)}
  ${['All', '🌴 Jungle', '🌋 Volcano', '🥚 Nest', '🔷 Caves', '⏰ Time', '🪙 Market', '🧩 Forest', '⭐ Special'].map((t, i) =>
    `<rect x="${30 + i * 92}" y="104" width="86" height="30" rx="15" fill="${i === 0 ? '#2e9d57' : '#fff'}" stroke="#eadfca" stroke-width="2"/>` + T(73 + i * 92, 124, t, 12, 700, i === 0 ? '#fff' : '#1f2a44')).join('')}
  ${bookCards.join('')}
  ${factPanel}
</svg>`;
writeFileSync('design/discovery-book.png', new Resvg(book, { font: { loadSystemFonts: true } }).render().asPng());
console.log('wrote design/discovery-book.png');
