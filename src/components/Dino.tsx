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

const SPECIES: Record<DinoId, Species> = {
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
  const crown = accessory === 'crown' || (stage === 'olympiad' && !accessory);
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
      <ellipse cx="100" cy="188" rx="58" ry="8" fill="rgba(0,0,0,0.12)" />
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
