import type { CSSProperties, ReactNode } from 'react';
import type { DinoId, Stage } from '../engine/types';

export type Mood = 'happy' | 'cheer' | 'think' | 'sleep' | 'oops';

interface Props {
  species?: DinoId;
  color?: string;
  belly?: string;
  mood?: Mood;
  stage?: Stage;
  accessory?: string | null;
  size?: number;
  className?: string;
  title?: string;
}

type Pt = { x: number; y: number };

interface Paint {
  c: string; // body colour
  b: string; // belly colour
  d: string; // outline
  far: string; // far-side legs
}

/** How each species is drawn, plus where its face and accessories sit (200×200 frame). */
interface Species {
  name: string;
  /** Optional transform for the whole drawing (e.g. to fit a long neck). */
  wrap?: string;
  /** Sea creatures float on water instead of standing on the ground. */
  noShadow?: boolean;
  /** Drawn behind everything, not animated (e.g. Spino's sail). */
  back?: (p: Paint) => ReactNode;
  /** The animated part: tail (wags) or wings (flap). */
  tail: (p: Paint) => ReactNode;
  tailOrigin: Pt;
  flap?: boolean;
  /** Body, legs and head (with outline). */
  body: (p: Paint) => ReactNode;
  /** Small details on top: teeth, nostrils, spots, feathers. */
  details?: (p: Paint) => ReactNode;
  eye: Pt & { r: number };
  cheek: Pt & { r: number };
  smile: string;
  smileColor?: string;
  open: string;
  mouth: Pt;
  hat: Pt & { s: number };
  scarf: Pt & { rot: number };
  medal: Pt;
  pack: Pt;
}

const OUTLINE = { strokeWidth: 3, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
const FEATHER = '#ffd166';
const SAIL = '#fb923c';

const BASE: Record<Exclude<DinoId, 'goldrex'>, Species> = {
  // ---------- Tyrannosaurus rex: big head, tiny arms ----------
  rexy: {
    name: 'T. rex',
    tail: ({ c }) => <path d="M74 118 C 44 116 20 104 6 86 C 16 116 44 140 82 144 Z" fill={c} />,
    tailOrigin: { x: 76, y: 126 },
    body: ({ c, b, far }) => (
      <>
        <path d="M96 140 L 100 176 L 90 182 L 112 182 L 114 150 Z" fill={far} />
        <ellipse cx="96" cy="124" rx="42" ry="33" fill={c} transform="rotate(-18 96 124)" />
        <ellipse cx="104" cy="134" rx="22" ry="20" fill={b} stroke="none" transform="rotate(-18 104 134)" />
        <path d="M104 128 C 126 124 132 148 124 160 L 128 178 L 140 182 L 104 182 L 106 162 C 96 152 94 136 104 128 Z" fill={c} />
        <path d="M108 104 C 116 94 122 88 128 84 L 146 98 C 136 106 126 114 118 122 Z" fill={c} />
        <path d="M118 72 C 118 42 152 34 174 42 C 188 48 194 62 192 74 L 188 82 L 134 86 C 122 86 118 80 118 72 Z" fill={c} />
        <path d="M132 86 L 188 82 C 188 94 176 102 154 102 C 138 102 130 96 132 86 Z" fill={b} />
        <path d="M128 116 q 12 0 14 10" fill="none" strokeWidth="5" />
        <path d="M142 126 l 4 3 M 140 128 l 2 4" strokeWidth="2" />
      </>
    ),
    details: ({ d }) => (
      <>
        <g fill="#fff" stroke={d} strokeWidth="1.2" strokeLinejoin="round">
          <path d="M150 85 l 3 6 l 3 -6.3 Z" />
          <path d="M162 84.4 l 3 6 l 3 -6.3 Z" />
          <path d="M174 83.8 l 3 5.6 l 3 -6 Z" />
        </g>
        <path d="M138 46 q 12 -6 22 -2" fill="none" stroke={d} strokeWidth="3" strokeLinecap="round" />
        <circle cx="183" cy="56" r="2.4" fill={d} />
      </>
    ),
    eye: { x: 150, y: 58, r: 10 },
    cheek: { x: 144, y: 78, r: 5 },
    smile: 'M146 90 Q 166 98 186 86',
    open: 'M146 89 Q 166 106 186 85 Z',
    mouth: { x: 164, y: 93 },
    hat: { x: 156, y: 43, s: 1 },
    scarf: { x: 122, y: 104, rot: -38 },
    medal: { x: 112, y: 122 },
    pack: { x: 66, y: 112 },
  },

  // ---------- Brachiosaurus: very long neck, tall front legs ----------
  brachio: {
    name: 'Brachiosaurus',
    wrap: 'translate(0 6) scale(1 0.97)',
    tail: ({ c }) => <path d="M40 134 C 22 140 10 156 4 168 C 20 162 34 154 48 146 Z" fill={c} />,
    tailOrigin: { x: 44, y: 140 },
    body: ({ c, b, far }) => (
      <>
        <rect x="56" y="140" width="16" height="42" rx="7" fill={far} />
        <rect x="100" y="124" width="16" height="58" rx="7" fill={far} />
        <ellipse cx="82" cy="130" rx="46" ry="29" fill={c} transform="rotate(-14 82 130)" />
        <ellipse cx="86" cy="142" rx="28" ry="14" fill={b} stroke="none" transform="rotate(-14 86 142)" />
        <rect x="42" y="142" width="17" height="40" rx="7" fill={c} />
        <rect x="114" y="120" width="17" height="62" rx="7" fill={c} />
        <path d="M106 112 C 116 74 128 42 142 26 L 162 34 C 146 52 134 88 128 122 Z" fill={c} />
        <path d="M124 110 C 130 80 140 54 152 40" fill="none" stroke={b} strokeWidth="6" />
        <ellipse cx="164" cy="30" rx="22" ry="12" fill={c} />
        <circle cx="153" cy="19" r="9" fill={c} />
      </>
    ),
    details: ({ c, d }) => (
      <>
        <circle cx="151" cy="15" r="1.8" fill={d} />
        <circle cx="156" cy="14" r="1.8" fill={d} />
        <g fill={shade(c, -0.12)}>
          <circle cx="70" cy="118" r="4" />
          <circle cx="86" cy="112" r="3" />
          <circle cx="60" cy="128" r="3" />
        </g>
      </>
    ),
    eye: { x: 160, y: 26, r: 6.5 },
    cheek: { x: 170, y: 36, r: 4 },
    smile: 'M166 36 Q 176 40 184 33',
    open: 'M166 35 Q 176 46 184 32 Z',
    mouth: { x: 175, y: 37 },
    hat: { x: 156, y: 12, s: 0.7 },
    scarf: { x: 128, y: 96, rot: -68 },
    medal: { x: 98, y: 130 },
    pack: { x: 66, y: 112 },
  },

  // ---------- Triceratops: three horns and a frill ----------
  tricera: {
    name: 'Triceratops',
    tail: ({ c }) => <path d="M44 128 C 26 130 12 138 6 150 C 22 150 36 148 48 144 Z" fill={c} />,
    tailOrigin: { x: 46, y: 138 },
    body: ({ c, b, far }) => {
      const horn = '#fff6e0';
      return (
        <>
          <rect x="62" y="148" width="18" height="34" rx="7" fill={far} />
          <rect x="114" y="148" width="18" height="34" rx="7" fill={far} />
          <ellipse cx="88" cy="132" rx="50" ry="32" fill={c} />
          <ellipse cx="94" cy="146" rx="32" ry="13" fill={b} stroke="none" />
          <rect x="46" y="150" width="19" height="32" rx="7" fill={c} />
          <rect x="98" y="150" width="19" height="32" rx="7" fill={c} />
          {Array.from({ length: 9 }, (_, i) => {
            const a = ((-150 + i * 30) * Math.PI) / 180;
            return <circle key={i} cx={136 + 38 * Math.cos(a)} cy={98 + 40 * Math.sin(a)} r="6" fill={shade(c, 0.25)} />;
          })}
          <ellipse cx="136" cy="98" rx="36" ry="40" fill={shade(c, 0.12)} />
          <ellipse cx="136" cy="100" rx="24" ry="27" fill={b} stroke="none" />
          <path d="M136 104 C 144 90 168 92 178 106 L 192 118 L 180 128 C 168 136 148 136 138 126 C 130 120 130 110 136 104 Z" fill={c} />
          <path d="M182 110 L 194 118 L 182 126 Z" fill={shade(c, -0.2)} />
          <path d="M145 102 L 152 52 L 158 103 Z" fill={shade(horn, -0.08)} />
          <path d="M155 102 L 176 54 L 167 106 Z" fill={horn} />
          <path d="M177 107 L 188 86 L 186 113 Z" fill={horn} />
        </>
      );
    },
    eye: { x: 160, y: 110, r: 8 },
    cheek: { x: 150, y: 120, r: 5 },
    smile: 'M150 124 Q 164 132 178 122',
    open: 'M150 123 Q 164 138 178 121 Z',
    mouth: { x: 164, y: 128 },
    hat: { x: 132, y: 62, s: 0.85 },
    scarf: { x: 128, y: 128, rot: -15 },
    medal: { x: 112, y: 142 },
    pack: { x: 72, y: 110 },
  },

  // ---------- Pteranodon: wings, long beak, crest ----------
  ptero: {
    name: 'Pteranodon',
    flap: true,
    tail: ({ c, d }) => {
      const wing = shade(c, 0.2);
      return (
        <>
          <path d="M94 106 C 70 78 40 66 6 68 C 18 84 20 104 14 120 C 40 112 68 118 92 126 Z" fill={wing} />
          <path d="M106 106 C 130 78 160 66 194 68 C 182 84 180 104 186 120 C 160 112 132 118 108 126 Z" fill={wing} />
          <path d="M94 106 C 70 78 40 66 6 68" fill="none" stroke={d} strokeWidth="5" />
          <path d="M106 106 C 130 78 160 66 194 68" fill="none" stroke={d} strokeWidth="5" />
        </>
      );
    },
    tailOrigin: { x: 100, y: 112 },
    body: ({ c, b }) => (
      <>
        <path d="M94 140 l -4 14 l -6 4 M 106 140 l 4 14 l 6 4" fill="none" />
        <ellipse cx="100" cy="118" rx="16" ry="24" fill={c} />
        <ellipse cx="100" cy="124" rx="9" ry="14" fill={b} stroke="none" />
        <path d="M94 96 C 96 88 104 84 112 84 L 116 98 C 110 102 102 104 96 104 Z" fill={c} />
        <path d="M104 70 L 66 50 L 108 84 Z" fill={shade(c, 0.1)} />
        <path d="M122 72 L 186 88 L 124 94 Z" fill="#ffcf56" />
        <ellipse cx="112" cy="80" rx="18" ry="15" fill={c} />
      </>
    ),
    eye: { x: 114, y: 76, r: 7.5 },
    cheek: { x: 118, y: 89, r: 4 },
    smile: 'M124 90 Q 150 94 176 89',
    smileColor: '#a3801f',
    open: 'M124 89 Q 150 100 176 88 Z',
    mouth: { x: 140, y: 92 },
    hat: { x: 110, y: 66, s: 0.72 },
    scarf: { x: 104, y: 98, rot: 0 },
    medal: { x: 100, y: 120 },
    pack: { x: 88, y: 118 },
  },

  // ---------- Spinosaurus: sail and long snout ----------
  spino: {
    name: 'Spinosaurus',
    back: () => {
      const tops = [100, 80, 70, 68, 76, 94];
      return (
        <>
          <path d="M54 114 C 54 64 96 38 132 106 Z" fill={SAIL} stroke={shade(SAIL, -0.35)} strokeWidth="3" strokeLinejoin="round" />
          {[62, 74, 86, 98, 110, 122].map((x, i) => (
            <path key={x} d={`M${x} 112 L ${x + 2} ${tops[i]}`} stroke={shade(SAIL, -0.3)} strokeWidth="3" strokeLinecap="round" />
          ))}
        </>
      );
    },
    tail: ({ c }) => (
      <>
        <path d="M52 122 C 30 116 14 104 4 90 C 6 112 22 132 50 142 Z" fill={c} />
        <path d="M26 108 C 24 98 28 92 32 90 C 32 98 36 106 40 112 Z" fill={SAIL} />
      </>
    ),
    tailOrigin: { x: 52, y: 128 },
    body: ({ c, b, far }) => (
      <>
        <path d="M86 140 L 90 176 L 80 182 L 104 182 L 104 146 Z" fill={far} />
        <ellipse cx="92" cy="124" rx="46" ry="30" fill={c} />
        <ellipse cx="98" cy="136" rx="28" ry="15" fill={b} stroke="none" />
        <path d="M100 130 C 120 128 126 148 118 158 L 122 178 L 134 182 L 100 182 L 102 162 C 92 152 92 136 100 130 Z" fill={c} />
        <path d="M126 116 q 10 2 10 12" fill="none" strokeWidth="5" />
        <path d="M118 96 C 124 86 134 84 144 86 L 192 94 C 196 98 194 104 188 104 L 146 106 C 132 108 120 104 118 96 Z" fill={c} />
        <path d="M136 106 L 188 104 C 186 110 176 112 160 112 C 146 112 138 110 136 106 Z" fill={b} />
      </>
    ),
    details: ({ d }) => (
      <>
        <g fill="#fff" stroke={d} strokeWidth="1">
          <path d="M160 104.8 l 2 4 l 2 -4.1 Z" />
          <path d="M170 104.4 l 2 4 l 2 -4.1 Z" />
          <path d="M180 104 l 2 3.6 l 2 -3.8 Z" />
        </g>
        <circle cx="184" cy="96" r="2" fill={d} />
      </>
    ),
    eye: { x: 140, y: 92, r: 8 },
    cheek: { x: 152, y: 104, r: 4 },
    smile: 'M146 107 Q 166 111 186 105',
    open: 'M146 106 Q 166 118 186 104 Z',
    mouth: { x: 160, y: 109 },
    hat: { x: 140, y: 80, s: 0.8 },
    scarf: { x: 120, y: 108, rot: -30 },
    medal: { x: 112, y: 128 },
    pack: { x: 74, y: 118 },
  },

  // ---------- Velociraptor: slim, feathery, sickle claw ----------
  raptor: {
    name: 'Velociraptor',
    tail: ({ c }) => (
      <>
        <path d="M66 104 L 10 92 L 12 102 L 64 120 Z" fill={c} />
        <path d="M14 92 L 2 84 L 6 96 L 0 100 L 12 102 Z" fill={FEATHER} />
      </>
    ),
    tailOrigin: { x: 66, y: 110 },
    body: ({ c, b, far }) => (
      <>
        <path d="M90 120 L 96 150 L 92 176 L 84 182 L 104 182 L 104 150 Z" fill={far} />
        <ellipse cx="96" cy="110" rx="36" ry="21" fill={c} transform="rotate(-8 96 110)" />
        <ellipse cx="100" cy="118" rx="22" ry="10" fill={b} stroke="none" />
        <path d="M104 116 C 118 118 122 136 114 146 L 118 172 L 132 178 L 132 184 L 104 184 L 104 174 L 98 150 C 90 140 92 120 104 116 Z" fill={c} />
        <path d="M112 176 Q 122 166 112 156" fill="none" strokeWidth="3.5" />
        <path d="M122 98 C 132 90 134 78 138 70 L 150 74 C 146 88 140 100 130 112 Z" fill={c} />
        <path d="M136 62 C 142 52 162 52 176 58 L 194 66 C 194 72 186 76 178 76 L 148 78 C 138 78 132 70 136 62 Z" fill={c} />
        <path d="M118 112 C 130 112 136 122 132 130 L 126 128 C 128 122 124 118 118 118 Z" fill={c} />
        <path d="M120 120 l 4 12 l 4 -2 l 2 6" fill="none" stroke={shade(FEATHER, -0.4)} strokeWidth="2" />
      </>
    ),
    details: ({ c, d }) => (
      <>
        <path d="M140 56 l 2 -10 l 4 9 l 3 -11 l 3 12" fill={FEATHER} stroke={shade(FEATHER, -0.4)} strokeWidth="2" strokeLinejoin="round" />
        <g fill={shade(c, -0.18)}>
          <path d="M78 92 l 6 -2 l -2 8 Z" />
          <path d="M92 90 l 6 -2 l -2 8 Z" />
          <path d="M106 90 l 6 -1 l -2 8 Z" />
        </g>
        <g fill="#fff" stroke={d} strokeWidth="1">
          <path d="M166 75.5 l 2 3.6 l 2 -3.8 Z" />
          <path d="M176 74 l 2 3.4 l 2 -3.6 Z" />
        </g>
        <path d="M144 54 l 16 3" stroke={d} strokeWidth="3" strokeLinecap="round" />
        <circle cx="189" cy="64" r="1.8" fill={d} />
      </>
    ),
    eye: { x: 154, y: 64, r: 8 },
    cheek: { x: 150, y: 74, r: 4 },
    smile: 'M154 72 Q 170 78 188 70',
    open: 'M154 71 Q 170 84 188 69 Z',
    mouth: { x: 170, y: 75 },
    hat: { x: 160, y: 50, s: 0.8 },
    scarf: { x: 134, y: 90, rot: -52 },
    medal: { x: 108, y: 112 },
    pack: { x: 80, y: 98 },
  },

  // ---------- Compsognathus: tiny and quick ----------
  compy: {
    name: 'Compsognathus',
    wrap: 'translate(28 50) scale(0.72)',
    tail: ({ c }) => <path d="M66 104 C 40 100 20 96 4 90 C 14 108 40 118 64 120 Z" fill={c} />,
    tailOrigin: { x: 64, y: 110 },
    body: ({ c, b, far }) => (
      <>
        <path d="M90 120 L 96 150 L 92 176 L 84 182 L 104 182 L 104 150 Z" fill={far} />
        <ellipse cx="96" cy="110" rx="32" ry="22" fill={c} transform="rotate(-10 96 110)" />
        <ellipse cx="100" cy="118" rx="20" ry="11" fill={b} stroke="none" />
        <path d="M104 116 C 118 118 122 136 114 146 L 118 172 L 132 178 L 132 184 L 104 184 L 104 174 L 98 150 C 90 140 92 120 104 116 Z" fill={c} />
        <path d="M120 100 C 128 92 132 82 134 74 L 146 78 C 144 90 138 100 128 110 Z" fill={c} />
        <path d="M132 64 C 136 52 158 50 172 58 C 182 64 186 72 182 78 C 172 82 156 82 144 80 C 134 78 128 72 132 64 Z" fill={c} />
        <path d="M122 112 q 10 2 10 10" fill="none" strokeWidth="5" />
      </>
    ),
    eye: { x: 154, y: 66, r: 9 },
    cheek: { x: 148, y: 76, r: 5 },
    smile: 'M156 74 Q 166 79 178 73',
    open: 'M156 73 Q 166 84 178 72 Z',
    mouth: { x: 166, y: 77 },
    hat: { x: 156, y: 54, s: 1 },
    scarf: { x: 132, y: 96, rot: -50 },
    medal: { x: 110, y: 118 },
    pack: { x: 80, y: 100 },
  },

  // ---------- Diplodocus: long neck and very long whip tail ----------
  diplo: {
    name: 'Diplodocus',
    tail: ({ c }) => (
      <path d="M56 124 C 36 124 20 130 10 142 C 4 150 2 160 8 164 C 10 156 16 148 26 142 C 38 136 50 136 60 138 Z" fill={c} />
    ),
    tailOrigin: { x: 58, y: 130 },
    body: ({ c, b, far }) => (
      <>
        <rect x="64" y="140" width="15" height="42" rx="7" fill={far} />
        <rect x="108" y="142" width="15" height="40" rx="7" fill={far} />
        <ellipse cx="90" cy="128" rx="40" ry="24" fill={c} />
        <ellipse cx="92" cy="140" rx="24" ry="10" fill={b} stroke="none" />
        <rect x="52" y="142" width="16" height="40" rx="7" fill={c} />
        <rect x="96" y="144" width="16" height="38" rx="7" fill={c} />
        <path d="M122 118 C 142 104 156 90 168 72 L 180 80 C 168 98 152 116 128 132 Z" fill={c} />
        <path d="M134 118 C 150 106 160 94 170 80" fill="none" stroke={b} strokeWidth="5" />
        <ellipse cx="182" cy="72" rx="15" ry="9" fill={c} />
      </>
    ),
    details: ({ c, d }) => (
      <path
        d="M60 116 l 4 -8 l 4 8 M 74 108 l 4 -8 l 4 8 M 88 106 l 4 -8 l 4 8 M 102 108 l 4 -8 l 4 8"
        fill={shade(c, 0.25)}
        stroke={d}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    ),
    eye: { x: 182, y: 69, r: 5 },
    cheek: { x: 188, y: 78, r: 3 },
    smile: 'M184 77 Q 190 79 195 75',
    open: 'M184 76 Q 190 83 195 74 Z',
    mouth: { x: 189, y: 78 },
    hat: { x: 181, y: 63, s: 0.55 },
    scarf: { x: 150, y: 100, rot: -50 },
    medal: { x: 100, y: 128 },
    pack: { x: 74, y: 112 },
  },

  // ---------- Iguanodon: thumb spike ----------
  iguano: {
    name: 'Iguanodon',
    tail: ({ c }) => <path d="M70 120 C 44 120 22 112 6 100 C 16 126 44 144 76 146 Z" fill={c} />,
    tailOrigin: { x: 72, y: 130 },
    body: ({ c, b, far }) => (
      <>
        <path d="M94 142 L 98 176 L 88 182 L 110 182 L 112 152 Z" fill={far} />
        <ellipse cx="96" cy="128" rx="42" ry="32" fill={c} transform="rotate(-12 96 128)" />
        <ellipse cx="102" cy="140" rx="26" ry="16" fill={b} stroke="none" transform="rotate(-12 102 140)" />
        <path d="M102 132 C 124 128 130 150 122 162 L 126 178 L 138 182 L 102 182 L 104 164 C 94 154 92 140 102 132 Z" fill={c} />
        <path d="M118 106 C 126 98 132 92 138 86 L 152 98 C 144 106 134 114 126 122 Z" fill={c} />
        <path d="M134 80 C 136 66 152 60 168 64 C 182 68 192 78 192 88 C 186 96 170 98 154 98 C 140 98 132 92 134 80 Z" fill={c} />
        <path d="M178 90 L 194 86 C 194 94 186 98 176 98 Z" fill={shade(c, -0.15)} />
        <path d="M132 118 C 142 120 148 128 148 136" fill="none" strokeWidth="6" />
        <path d="M142 130 L 164 104 L 154 138 Z" fill="#fff6e0" />
      </>
    ),
    details: ({ d }) => <circle cx="186" cy="80" r="2" fill={d} />,
    eye: { x: 158, y: 78, r: 7.5 },
    cheek: { x: 152, y: 88, r: 4 },
    smile: 'M158 92 Q 170 96 182 90',
    open: 'M158 91 Q 170 102 182 89 Z',
    mouth: { x: 170, y: 94 },
    hat: { x: 162, y: 64, s: 0.8 },
    scarf: { x: 134, y: 104, rot: -42 },
    medal: { x: 114, y: 126 },
    pack: { x: 68, y: 116 },
  },

  // ---------- Stegosaurus: back plates and spiky tail ----------
  stego: {
    name: 'Stegosaurus',
    back: () => {
      const plate = '#f59e0b';
      const plates: [number, number, number][] = [
        [50, 112, 14],
        [64, 100, 18],
        [80, 94, 21],
        [98, 94, 21],
        [116, 100, 18],
        [130, 112, 13],
      ];
      return (
        <>
          {plates.map(([x, y, s]) => (
            <path
              key={x}
              d={`M${x - s * 0.55} ${y + 6} L ${x} ${y - s} L ${x + s * 0.55} ${y + 6} Z`}
              fill={plate}
              stroke={shade(plate, -0.35)}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          ))}
        </>
      );
    },
    tail: ({ c }) => (
      <>
        <path d="M44 128 C 28 126 14 120 4 110 C 10 128 26 140 48 144 Z" fill={c} />
        <path d="M10 112 L 2 96 L 16 110 Z M 20 118 L 14 100 L 26 116 Z" fill="#fff6e0" />
      </>
    ),
    tailOrigin: { x: 46, y: 134 },
    body: ({ c, b, far }) => (
      <>
        <rect x="60" y="146" width="18" height="36" rx="7" fill={far} />
        <rect x="116" y="150" width="15" height="32" rx="7" fill={far} />
        <ellipse cx="92" cy="130" rx="52" ry="30" fill={c} />
        <ellipse cx="96" cy="146" rx="32" ry="11" fill={b} stroke="none" />
        <rect x="46" y="148" width="19" height="34" rx="7" fill={c} />
        <rect x="104" y="152" width="16" height="30" rx="7" fill={c} />
        <path d="M134 128 C 146 128 152 134 156 140 L 146 150 C 140 144 136 140 130 140 Z" fill={c} />
        <ellipse cx="164" cy="142" rx="20" ry="12" fill={c} />
      </>
    ),
    eye: { x: 166, y: 138, r: 6 },
    cheek: { x: 160, y: 148, r: 3.5 },
    smile: 'M168 148 Q 176 152 183 146',
    open: 'M168 147 Q 176 156 183 145 Z',
    mouth: { x: 176, y: 150 },
    hat: { x: 164, y: 132, s: 0.6 },
    scarf: { x: 146, y: 140, rot: 30 },
    medal: { x: 126, y: 140 },
    pack: { x: 62, y: 132 },
  },

  // ---------- Parasaurolophus: tube crest, duck bill ----------
  parasaur: {
    name: 'Parasaurolophus',
    tail: ({ c }) => <path d="M72 120 C 44 118 22 110 6 98 C 16 124 44 142 78 144 Z" fill={c} />,
    tailOrigin: { x: 74, y: 130 },
    body: ({ c, b, far }) => (
      <>
        <path d="M94 140 L 98 176 L 88 182 L 110 182 L 112 150 Z" fill={far} />
        <ellipse cx="96" cy="126" rx="40" ry="31" fill={c} transform="rotate(-14 96 126)" />
        <ellipse cx="102" cy="138" rx="24" ry="15" fill={b} stroke="none" transform="rotate(-14 102 138)" />
        <path d="M102 130 C 122 126 128 148 120 160 L 124 178 L 136 182 L 102 182 L 104 162 C 94 152 92 138 102 130 Z" fill={c} />
        <path d="M114 104 C 122 94 128 86 134 80 L 148 92 C 140 100 130 110 122 120 Z" fill={c} />
        <path d="M140 64 C 120 50 96 40 76 38 C 80 46 92 52 108 58 C 120 62 128 70 134 76 Z" fill="#f97316" />
        <path d="M132 76 C 132 62 146 56 160 60 C 170 62 178 70 192 74 C 194 82 188 88 176 88 L 150 90 C 138 90 132 86 132 76 Z" fill={c} />
        <path d="M168 84 L 192 78 C 194 84 188 90 176 90 Z" fill="#ffd8a8" />
        <path d="M132 118 q 10 2 10 12" fill="none" strokeWidth="5" />
      </>
    ),
    eye: { x: 152, y: 72, r: 7.5 },
    cheek: { x: 146, y: 82, r: 4 },
    smile: 'M154 86 Q 166 92 178 86',
    open: 'M154 85 Q 166 96 178 85 Z',
    mouth: { x: 166, y: 89 },
    hat: { x: 158, y: 61, s: 0.75 },
    scarf: { x: 128, y: 100, rot: -45 },
    medal: { x: 114, y: 124 },
    pack: { x: 68, y: 114 },
  },

  // ---------- Ankylosaurus: armour and club tail ----------
  ankylo: {
    name: 'Ankylosaurus',
    tail: ({ c }) => (
      <>
        <path d="M44 136 C 30 134 22 132 18 130 L 20 140 C 26 142 34 144 44 146 Z" fill={c} />
        <circle cx="12" cy="131" r="10" fill={shade(c, 0.1)} />
        <circle cx="22" cy="135" r="8" fill={shade(c, 0.1)} />
      </>
    ),
    tailOrigin: { x: 46, y: 140 },
    body: ({ c, b, far }) => {
      const armour = '#fcd34d';
      return (
        <>
          <rect x="62" y="152" width="18" height="30" rx="7" fill={far} />
          <rect x="118" y="152" width="18" height="30" rx="7" fill={far} />
          <ellipse cx="96" cy="136" rx="56" ry="27" fill={c} />
          <ellipse cx="98" cy="152" rx="36" ry="9" fill={b} stroke="none" />
          <path d="M44 140 l -10 4 l 10 4 M 62 154 l -6 10 l 10 -4 M 132 154 l 6 10 l -10 -4" fill={armour} />
          <rect x="48" y="154" width="19" height="28" rx="7" fill={c} />
          <rect x="104" y="154" width="19" height="28" rx="7" fill={c} />
          <path d="M146 128 C 158 122 176 124 186 134 C 190 142 184 152 172 154 C 160 156 148 150 146 140 Z" fill={c} />
          <path d="M156 124 l -4 -10 l 10 6 M 170 124 l 2 -10 l 6 10" fill={armour} />
        </>
      );
    },
    details: () => {
      const armour = '#fcd34d';
      const ys = [124, 114, 109, 107, 109, 114, 124];
      return (
        <>
          {[52, 66, 80, 94, 108, 122, 136].map((x, i) => (
            <circle key={x} cx={x} cy={ys[i]} r="6" fill={armour} stroke={shade(armour, -0.4)} strokeWidth="2" />
          ))}
        </>
      );
    },
    eye: { x: 166, y: 136, r: 6.5 },
    cheek: { x: 160, y: 146, r: 3.5 },
    smile: 'M168 146 Q 178 150 186 143',
    open: 'M168 145 Q 178 154 186 142 Z',
    mouth: { x: 177, y: 148 },
    hat: { x: 168, y: 125, s: 0.65 },
    scarf: { x: 150, y: 140, rot: 10 },
    medal: { x: 132, y: 150 },
    pack: { x: 96, y: 118 },
  },

  // ---------- Dilophosaurus: two crests and a neck frill ----------
  dilo: {
    name: 'Dilophosaurus',
    back: () => {
      const red = '#ef4444';
      return (
        <>
          <circle cx="140" cy="80" r="34" fill={red} stroke={shade(red, -0.35)} strokeWidth="3" />
          {[0, 1, 2, 3, 4].map((i) => {
            const a = ((-170 + i * 40) * Math.PI) / 180;
            return <path key={i} d={`M140 80 L ${140 + 34 * Math.cos(a)} ${80 + 34 * Math.sin(a)}`} stroke={shade(red, -0.3)} strokeWidth="2" />;
          })}
        </>
      );
    },
    tail: ({ c }) => <path d="M70 116 C 44 112 22 104 6 92 C 16 118 44 136 76 140 Z" fill={c} />,
    tailOrigin: { x: 72, y: 126 },
    body: ({ c, b, far }) => (
      <>
        <path d="M94 138 L 98 176 L 88 182 L 110 182 L 112 148 Z" fill={far} />
        <ellipse cx="96" cy="122" rx="38" ry="26" fill={c} transform="rotate(-14 96 122)" />
        <ellipse cx="102" cy="132" rx="22" ry="13" fill={b} stroke="none" transform="rotate(-14 102 132)" />
        <path d="M102 126 C 122 122 128 144 120 156 L 124 178 L 136 182 L 102 182 L 104 160 C 94 150 92 134 102 126 Z" fill={c} />
        <path d="M114 104 C 122 96 128 90 134 84 L 148 96 C 140 104 130 112 122 118 Z" fill={c} />
        <path d="M132 74 C 134 62 150 58 166 62 L 192 72 C 194 80 186 84 176 84 L 148 86 C 138 86 130 82 132 74 Z" fill={c} />
        <path d="M140 64 C 140 46 160 44 164 62 Z" fill="#ef4444" />
        <path d="M150 62 C 152 42 172 42 172 64 Z" fill={shade('#ef4444', 0.15)} />
        <path d="M128 112 q 10 2 10 12" fill="none" strokeWidth="5" />
      </>
    ),
    eye: { x: 150, y: 72, r: 7.5 },
    cheek: { x: 146, y: 80, r: 4 },
    smile: 'M154 80 Q 170 86 188 78',
    open: 'M154 79 Q 170 92 188 77 Z',
    mouth: { x: 170, y: 83 },
    hat: { x: 160, y: 58, s: 0.7 },
    scarf: { x: 128, y: 100, rot: -45 },
    medal: { x: 112, y: 120 },
    pack: { x: 68, y: 110 },
  },

  // ---------- Pachycephalosaurus: thick dome head ----------
  pachy: {
    name: 'Pachycephalosaurus',
    tail: ({ c }) => <path d="M70 118 C 44 116 22 108 8 94 C 18 120 44 140 76 142 Z" fill={c} />,
    tailOrigin: { x: 72, y: 128 },
    body: ({ c, b, far }) => (
      <>
        <path d="M94 140 L 98 176 L 88 182 L 110 182 L 112 150 Z" fill={far} />
        <ellipse cx="96" cy="124" rx="38" ry="30" fill={c} transform="rotate(-20 96 124)" />
        <ellipse cx="104" cy="134" rx="20" ry="17" fill={b} stroke="none" transform="rotate(-20 104 134)" />
        <path d="M102 128 C 122 124 128 146 120 158 L 124 178 L 136 182 L 102 182 L 104 162 C 94 152 92 136 102 128 Z" fill={c} />
        <path d="M110 104 C 118 96 124 92 130 90 L 142 102 C 134 108 126 114 118 120 Z" fill={c} />
        <path d="M124 82 C 126 70 140 64 156 66 C 172 68 184 78 186 92 C 178 100 160 104 144 102 C 132 100 122 94 124 82 Z" fill={c} />
        <path d="M124 80 C 120 54 138 40 152 40 C 168 40 182 56 178 78 C 160 72 140 72 124 80 Z" fill="#fbcfe8" />
        <path d="M126 116 q 10 0 12 8" fill="none" strokeWidth="5" />
      </>
    ),
    details: ({ c, d }) => (
      <>
        {[-160, -135, -110, -70, -45, -20].map((a) => {
          const r = (a * Math.PI) / 180;
          return <circle key={a} cx={150 + 28 * Math.cos(r)} cy={70 + 26 * Math.sin(r) + 10} r="4.5" fill={shade(c, 0.2)} stroke={d} strokeWidth="2" />;
        })}
        <circle cx="182" cy="84" r="2" fill={d} />
      </>
    ),
    eye: { x: 152, y: 82, r: 7.5 },
    cheek: { x: 146, y: 92, r: 4 },
    smile: 'M154 94 Q 168 100 182 92',
    open: 'M154 93 Q 168 106 182 91 Z',
    mouth: { x: 168, y: 97 },
    hat: { x: 152, y: 44, s: 0.85 },
    scarf: { x: 124, y: 106, rot: -40 },
    medal: { x: 112, y: 124 },
    pack: { x: 68, y: 112 },
  },

  // ---------- Mosasaurus: sea reptile with flippers ----------
  mosa: {
    name: 'Mosasaurus',
    noShadow: true,
    back: () => <path d="M0 170 Q 25 160 50 170 T 100 170 T 150 170 T 200 170 L 200 192 L 0 192 Z" fill="#7dd3fc" opacity="0.7" />,
    tail: ({ c }) => <path d="M40 118 C 24 118 12 112 2 100 L 6 126 L 0 142 C 14 134 28 130 44 132 Z" fill={c} />,
    tailOrigin: { x: 44, y: 124 },
    body: ({ c, b }) => (
      <>
        <path d="M70 136 C 64 150 52 160 40 160 C 50 150 56 140 58 132 Z" fill={shade(c, -0.1)} />
        <path d="M44 122 C 60 104 100 100 140 106 C 160 108 176 114 194 120 C 188 132 168 138 140 138 C 100 140 64 140 44 132 Z" fill={c} />
        <path d="M60 130 C 90 136 130 136 160 132" fill="none" stroke={b} strokeWidth="7" />
        <path d="M118 136 C 116 150 108 160 96 164 C 102 152 104 144 104 136 Z" fill={shade(c, -0.1)} />
        <path d="M150 122 L 196 120 C 192 128 180 132 164 132 C 156 132 150 128 150 122 Z" fill={b} />
      </>
    ),
    details: ({ d }) => (
      <>
        <g fill="#fff" stroke={d} strokeWidth="1">
          <path d="M160 121.5 l 2 4 l 2 -4 Z" />
          <path d="M170 121 l 2 4 l 2 -4 Z" />
          <path d="M180 120.6 l 2 3.6 l 2 -3.8 Z" />
        </g>
        <path d="M30 100 q 6 -10 12 0 M 172 92 q 5 -8 10 0" fill="none" stroke="#7dd3fc" strokeWidth="3" strokeLinecap="round" />
      </>
    ),
    eye: { x: 150, y: 112, r: 7 },
    cheek: { x: 144, y: 122, r: 4 },
    smile: 'M152 128 Q 170 132 190 126',
    open: 'M152 127 Q 170 138 190 125 Z',
    mouth: { x: 170, y: 130 },
    hat: { x: 150, y: 104, s: 0.7 },
    scarf: { x: 132, y: 120, rot: 80 },
    medal: { x: 118, y: 134 },
    pack: { x: 90, y: 108 },
  },

  // ---------- Archaeopteryx: feathered wings, first bird ----------
  archie: {
    name: 'Archaeopteryx',
    tail: () => {
      const feather = '#60a5fa';
      return (
        <>
          <path d="M70 120 C 50 124 30 128 10 140 C 30 140 50 136 72 132 Z" fill={feather} />
          <path d="M14 134 l -8 -6 M 22 132 l -10 -4 M 30 130 l -10 -2" fill="none" stroke={shade(feather, -0.35)} strokeWidth="2" />
        </>
      );
    },
    tailOrigin: { x: 72, y: 126 },
    body: ({ c, b, far }) => {
      const feather = '#60a5fa';
      return (
        <>
          <path d="M96 140 L 98 172 L 90 180 L 108 180 L 108 146 Z" fill={far} />
          <ellipse cx="96" cy="124" rx="30" ry="24" fill={c} transform="rotate(-14 96 124)" />
          <ellipse cx="102" cy="132" rx="18" ry="13" fill={b} stroke="none" />
          <path d="M104 138 L 110 172 L 122 180 L 102 180 L 100 150 Z" fill={c} />
          <path d="M86 112 C 66 96 46 92 24 96 C 40 108 58 118 84 126 Z" fill={feather} />
          <path d="M30 98 l 4 8 M 42 98 l 4 10 M 54 102 l 3 10 M 66 106 l 2 10" fill="none" stroke={shade(feather, -0.35)} strokeWidth="2" />
          <path d="M112 106 C 118 98 122 90 126 84 L 138 92 C 132 100 126 108 120 114 Z" fill={c} />
          <ellipse cx="138" cy="80" rx="16" ry="14" fill={c} />
          <path d="M148 76 L 176 82 L 148 90 Z" fill="#fde68a" />
        </>
      );
    },
    details: ({ d }) => (
      <>
        <path d="M130 66 l 2 -8 l 4 7 l 4 -8 l 2 9" fill="#60a5fa" stroke={shade('#60a5fa', -0.35)} strokeWidth="2" strokeLinejoin="round" />
        <g fill="#fff" stroke={d} strokeWidth="0.8">
          <path d="M156 84.5 l 1.5 3 l 1.5 -3 Z" />
          <path d="M164 84 l 1.5 3 l 1.5 -3 Z" />
        </g>
      </>
    ),
    eye: { x: 138, y: 76, r: 6.5 },
    cheek: { x: 134, y: 86, r: 3.5 },
    smile: 'M150 86 Q 162 88 172 84',
    smileColor: '#a3801f',
    open: 'M150 85 Q 162 92 172 83 Z',
    mouth: { x: 160, y: 87 },
    hat: { x: 138, y: 66, s: 0.65 },
    scarf: { x: 120, y: 100, rot: -40 },
    medal: { x: 104, y: 124 },
    pack: { x: 80, y: 116 },
  },

  // ---------- Oviraptor: parrot beak, crest, carries an egg ----------
  ovi: {
    name: 'Oviraptor',
    tail: ({ c }) => (
      <>
        <path d="M70 114 C 48 110 28 104 12 96 C 20 116 44 130 74 134 Z" fill={c} />
        <path d="M14 96 l -10 -6 l 4 10 l -6 4 l 12 2 Z" fill="#fb923c" />
      </>
    ),
    tailOrigin: { x: 72, y: 122 },
    body: ({ c, b, far }) => (
      <>
        <path d="M94 136 L 98 174 L 88 182 L 110 182 L 112 146 Z" fill={far} />
        <ellipse cx="96" cy="120" rx="34" ry="26" fill={c} transform="rotate(-14 96 120)" />
        <ellipse cx="102" cy="130" rx="20" ry="13" fill={b} stroke="none" />
        <path d="M102 124 C 120 122 126 142 118 154 L 122 176 L 134 182 L 102 182 L 104 158 C 94 148 92 132 102 124 Z" fill={c} />
        <path d="M112 102 C 120 94 126 86 130 78 L 144 86 C 138 96 130 106 122 114 Z" fill={c} />
        <path d="M136 52 C 132 40 140 32 150 34 C 156 40 156 50 152 60 Z" fill="#fb923c" />
        <ellipse cx="146" cy="70" rx="20" ry="17" fill={c} />
        <path d="M160 62 C 172 64 178 72 176 80 C 170 84 164 84 158 80 Z" fill="#fde68a" />
        <ellipse cx="132" cy="136" rx="13" ry="16" fill="#fff8e7" stroke="#d9c7a0" />
        <path d="M118 116 C 130 118 138 124 140 132" fill="none" strokeWidth="6" />
        <path d="M140 126 C 148 130 148 140 142 146" fill="none" strokeWidth="6" />
      </>
    ),
    details: () => (
      <>
        <circle cx="128" cy="130" r="3" fill="#f2d9a6" />
        <circle cx="136" cy="142" r="2.5" fill="#f2d9a6" />
      </>
    ),
    eye: { x: 146, y: 66, r: 7.5 },
    cheek: { x: 144, y: 78, r: 4 },
    smile: 'M161 77 Q 167 80 173 77',
    smileColor: '#a3801f',
    open: 'M161 76 Q 167 83 173 76 Z',
    mouth: { x: 167, y: 79 },
    hat: { x: 146, y: 54, s: 0.7 },
    scarf: { x: 126, y: 96, rot: -45 },
    medal: { x: 108, y: 112 },
    pack: { x: 70, y: 110 },
  },
};

/** Golden Rex: the legendary T. rex, drawn in gold with a glow and sparkles. */
const sparkle = (x: number, y: number, k: number) => (
  <path
    key={`${x}-${y}`}
    d={`M${x} ${y - 8 * k} l ${2 * k} ${6 * k} l ${6 * k} ${2 * k} l ${-6 * k} ${2 * k} l ${-2 * k} ${6 * k} l ${-2 * k} ${-6 * k} l ${-6 * k} ${-2 * k} l ${6 * k} ${-2 * k} Z`}
    fill="#fffbe0"
    stroke="#f5b301"
    strokeWidth="1"
  />
);

const SPECIES: Record<DinoId, Species> = {
  ...BASE,
  goldrex: {
    ...BASE.rexy,
    name: 'Golden T. rex',
    back: () => <circle cx="110" cy="110" r="84" fill="#fff6cc" />,
    details: (p) => (
      <>
        {BASE.rexy.details?.(p)}
        {sparkle(30, 50, 1.2)}
        {sparkle(186, 120, 1)}
        {sparkle(50, 160, 0.8)}
        {sparkle(180, 26, 0.7)}
      </>
    ),
  },
};

/** Friendly SVG dinosaur companion, drawn as its real species. */
export function Dino({
  species = 'rexy',
  color = '#4caf50',
  belly = '#c5e8a5',
  mood = 'happy',
  stage = 'baby',
  accessory = null,
  size = 160,
  className = '',
  title,
}: Props) {
  const sp = SPECIES[species] ?? SPECIES.rexy;
  const p: Paint = { c: color, b: belly, d: shade(color, -0.3), far: shade(color, -0.15) };
  // Each stage is visibly bigger than the last.
  const scale = { egg: 0.78, baby: 0.82, explorer: 0.9, champion: 0.98, olympiad: 1.04 }[stage];
  const crown = accessory === 'crown' || ((stage === 'olympiad' || species === 'goldrex') && !accessory);
  const { eye, mouth } = sp;
  const origin = (pt: Pt): CSSProperties => ({ transformOrigin: `${pt.x}px ${pt.y}px` });

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={`dino ${mood === 'cheer' ? 'dino-cheer' : mood === 'oops' ? 'dino-oops' : mood === 'sleep' ? '' : 'dino-bob'} ${className}`}
      role="img"
      aria-label={title ?? `${sp.name} dino`}
    >
      {!sp.noShadow && <ellipse cx="100" cy="188" rx="58" ry="8" fill="rgba(0,0,0,0.12)" />}
      <g transform={`translate(100 190) scale(${scale}) translate(-100 -190)`}>
        <g transform={sp.wrap}>
          {sp.back?.(p)}
          {stage === 'explorer' && accessory == null && (
            <rect x={sp.pack.x - 11} y={sp.pack.y - 14} width="22" height="28" rx="6" fill="#f4a261" stroke="#b5651d" strokeWidth="2.5" />
          )}
          <g className={mood === 'sleep' ? '' : sp.flap ? 'dino-flap' : 'dino-tail'} style={origin(sp.tailOrigin)} stroke={p.d} {...OUTLINE}>
            {sp.tail(p)}
          </g>
          <g stroke={p.d} {...OUTLINE}>
            {sp.body(p)}
          </g>
          {sp.details?.(p)}

          {/* face */}
          <circle cx={sp.cheek.x} cy={sp.cheek.y} r={sp.cheek.r} fill="#ff8fa0" opacity="0.6" />
          {mood === 'sleep' ? (
            <path d={`M${eye.x - eye.r} ${eye.y} q ${eye.r} ${eye.r * 0.8} ${eye.r * 2} 0`} stroke="#222" strokeWidth="3" fill="none" strokeLinecap="round" />
          ) : (
            <g className="dino-eye" style={origin(eye)}>
              <circle cx={eye.x} cy={eye.y} r={eye.r} fill="#fff" stroke={p.d} strokeWidth="2" />
              <circle cx={eye.x + eye.r * 0.25} cy={eye.y + (mood === 'think' ? -eye.r * 0.4 : eye.r * 0.1)} r={eye.r * 0.55} fill="#222" />
              <circle cx={eye.x + eye.r * 0.45} cy={eye.y - eye.r * (mood === 'think' ? 0.6 : 0.2)} r={eye.r * 0.2} fill="#fff" />
            </g>
          )}
          {mood === 'cheer' ? (
            <path d={sp.open} fill="#7a1f2b" stroke={p.d} strokeWidth="2" strokeLinejoin="round" />
          ) : mood === 'oops' ? (
            <path d={`M${mouth.x - 9} ${mouth.y} q 4.5 -4 9 0 q 4.5 4 9 0`} stroke="#222" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          ) : mood === 'think' ? (
            <path d={`M${mouth.x - 5} ${mouth.y} h 10`} stroke="#222" strokeWidth="2.5" strokeLinecap="round" />
          ) : (
            <path d={sp.smile} stroke={sp.smileColor ?? p.d} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          )}

          {/* growth medal */}
          {(stage === 'champion' || stage === 'olympiad') && (
            <g transform={`translate(${sp.medal.x} ${sp.medal.y})`}>
              <path d="M-8 -16 l 8 14 l 8 -14" stroke="#3a86ff" strokeWidth="5" fill="none" />
              <circle className="dino-medal" cx="0" cy="4" r="8" fill="#ffd23f" stroke="#c99a00" strokeWidth="2" />
              <text x="0" y="8" fontSize="9" textAnchor="middle" fill="#8a6500" fontWeight="bold">
                ★
              </text>
            </g>
          )}

          {/* wardrobe */}
          {accessory === 'scarf' && (
            <g transform={`translate(${sp.scarf.x} ${sp.scarf.y}) rotate(${sp.scarf.rot})`} fill="#e63946" stroke="#9d1c27" strokeWidth="2">
              <rect x="-15" y="-6" width="30" height="12" rx="6" />
              <path d="M4 4 l 6 22 l 8 -4 l -4 -18 Z" />
            </g>
          )}
          {accessory === 'glasses' && (
            <g stroke="#111" strokeWidth="3">
              <path d={`M${eye.x - eye.r - 3} ${eye.y - 1} l -14 -4`} fill="none" />
              <circle cx={eye.x} cy={eye.y} r={eye.r + 3} fill="rgba(30,30,60,0.75)" />
            </g>
          )}
          {accessory === 'hat' && (
            <g transform={`translate(${sp.hat.x} ${sp.hat.y}) scale(${sp.hat.s})`}>
              <ellipse cx="0" cy="0" rx="28" ry="6" fill="#8d5a2b" />
              <path d="M-17 0 q 2 -26 17 -26 q 15 0 17 26 Z" fill="#a86b32" />
              <rect x="-17" y="-8" width="34" height="5" fill="#5a3a1a" />
            </g>
          )}
          {crown && (
            <g className="dino-crown" transform={`translate(${sp.hat.x} ${sp.hat.y}) scale(${sp.hat.s})`}>
              <path d="M-18 0 l 5 -22 l 8 13 l 5 -17 l 5 17 l 8 -13 l 5 22 Z" fill="#ffd23f" stroke="#c99a00" strokeWidth="2.5" strokeLinejoin="round" />
              <path className="crown-sparkle" d="M20 -30 l 2 6 l 6 2 l -6 2 l -2 6 l -2 -6 l -6 -2 l 6 -2 Z" fill="#fff6b0" />
            </g>
          )}
        </g>
      </g>

      {/* egg shell for the Egg stage */}
      {stage === 'egg' && (
        <g>
          <path
            d="M34 150 L48 134 L62 150 L78 132 L94 150 L110 132 L126 150 L142 132 L158 150 L170 138 Q172 186 100 190 Q30 186 34 150 Z"
            fill="#fff8e7"
            stroke="#d9c7a0"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <circle cx="70" cy="168" r="6" fill="#f2d9a6" />
          <circle cx="128" cy="172" r="8" fill="#f2d9a6" />
          <circle cx="100" cy="160" r="4" fill="#f2d9a6" />
        </g>
      )}
      {mood === 'sleep' && (
        <text x="172" y="30" fontSize="22" fill="#6c7a99" fontWeight="bold">
          z
          <tspan dx="2" dy="-10" fontSize="16">
            z
          </tspan>
        </text>
      )}
    </svg>
  );
}

export function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(c + c * amt)));
  const r = f(n >> 16);
  const g = f((n >> 8) & 255);
  const b = f(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
