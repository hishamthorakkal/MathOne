import type { Stage } from '../engine/types';

export type Mood = 'happy' | 'cheer' | 'think' | 'sleep' | 'oops';

interface Props {
  color?: string;
  belly?: string;
  mood?: Mood;
  stage?: Stage;
  accessory?: string | null;
  size?: number;
  className?: string;
  title?: string;
}

/** Friendly SVG dinosaur companion. */
export function Dino({
  color = '#4caf50',
  belly = '#c5e8a5',
  mood = 'happy',
  stage = 'baby',
  accessory = null,
  size = 160,
  className = '',
  title = 'Dino',
}: Props) {
  const dark = shade(color, -0.25);
  // Each stage is visibly bigger than the last.
  const scale = { egg: 0.78, baby: 0.82, explorer: 0.9, champion: 0.98, olympiad: 1.04 }[stage];
  const crown = accessory === 'crown' || (stage === 'olympiad' && !accessory);
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={`dino ${mood === 'cheer' ? 'dino-cheer' : mood === 'oops' ? 'dino-oops' : mood === 'sleep' ? '' : 'dino-bob'} ${className}`}
      role="img"
      aria-label={title}
    >
      <ellipse cx="100" cy="188" rx="58" ry="8" fill="rgba(0,0,0,0.12)" />
      <g transform={`translate(100 190) scale(${scale}) translate(-100 -190)`}>
        {/* tail (wags) */}
        <g className={mood === 'sleep' ? '' : 'dino-tail'}>
          <path d="M62 135 Q22 140 8 108 Q34 128 66 116 Z" fill={color} stroke={dark} strokeWidth="3" strokeLinejoin="round" />
        </g>
        {/* back spikes */}
        {[
          [58, 112],
          [72, 98],
          [90, 91],
          [108, 92],
        ].map(([x, y], i) => (
          <path key={i} d={`M${x - 9} ${y + 6} L${x} ${y - 10} L${x + 9} ${y + 6} Z`} fill={dark} />
        ))}
        {/* legs */}
        <rect x="68" y="148" width="20" height="34" rx="9" fill={color} stroke={dark} strokeWidth="3" />
        <rect x="106" y="148" width="20" height="34" rx="9" fill={color} stroke={dark} strokeWidth="3" />
        {/* body */}
        <ellipse cx="96" cy="128" rx="46" ry="38" fill={color} stroke={dark} strokeWidth="3" />
        <ellipse cx="106" cy="138" rx="26" ry="23" fill={belly} />
        {/* arm */}
        <path d="M128 122 q14 2 14 12" stroke={dark} strokeWidth="7" strokeLinecap="round" fill="none" />
        {/* head */}
        <circle cx="128" cy="72" r="36" fill={color} stroke={dark} strokeWidth="3" />
        <ellipse cx="156" cy="84" rx="24" ry="19" fill={color} stroke={dark} strokeWidth="3" />
        <path d="M120 100 Q132 110 150 102" fill={color} />
        <circle cx="168" cy="78" r="2.2" fill={dark} />
        <circle cx="160" cy="79" r="2.2" fill={dark} />
        <circle cx="146" cy="92" r="6" fill="#ff9aa2" opacity="0.6" />
        {/* eye */}
        {mood === 'sleep' ? (
          <path d="M126 66 q8 7 16 0" stroke="#222" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        ) : (
          <g className="dino-eye">
            <circle cx="134" cy="64" r="11" fill="#fff" stroke={dark} strokeWidth="2" />
            <circle cx={mood === 'think' ? 135 : 137} cy={mood === 'think' ? 59 : 65} r="6" fill="#222" />
            <circle cx={mood === 'think' ? 137 : 139} cy={mood === 'think' ? 57 : 62} r="2" fill="#fff" />
          </g>
        )}
        {/* mouth */}
        {mood === 'cheer' ? (
          <path d="M146 94 Q160 112 176 92 Z" fill="#7a1f2b" stroke={dark} strokeWidth="2" strokeLinejoin="round" />
        ) : mood === 'oops' ? (
          <path d="M150 98 q6 -5 12 0 q6 5 12 0" stroke="#222" strokeWidth="3" fill="none" strokeLinecap="round" />
        ) : mood === 'think' ? (
          <path d="M156 98 h12" stroke="#222" strokeWidth="3" strokeLinecap="round" />
        ) : (
          <path d="M148 94 Q161 106 175 93" stroke="#222" strokeWidth="3" fill="none" strokeLinecap="round" />
        )}
        {/* accessories */}
        {accessory === 'scarf' && (
          <path d="M100 98 q28 14 52 2 l-2 12 q-26 12 -50 -2 Z M108 104 l-8 26 l12 -2 l4 -22 Z" fill="#e63946" stroke="#9d1c27" strokeWidth="2" />
        )}
        {accessory === 'glasses' && (
          <g stroke="#111" strokeWidth="3" fill="rgba(30,30,60,0.75)">
            <circle cx="134" cy="64" r="12" />
            <circle cx="162" cy="66" r="9" />
            <path d="M146 64 h7" />
          </g>
        )}
        {accessory === 'hat' && (
          <g>
            <ellipse cx="124" cy="42" rx="34" ry="7" fill="#8d5a2b" />
            <path d="M104 42 q2 -28 20 -28 q18 0 20 28 Z" fill="#a86b32" />
            <rect x="105" y="34" width="38" height="5" fill="#5a3a1a" />
          </g>
        )}
        {crown && (
          <g className="dino-crown">
            <path d="M104 44 l6 -24 l10 14 l8 -18 l8 18 l10 -14 l6 24 Z" fill="#ffd23f" stroke="#c99a00" strokeWidth="2.5" strokeLinejoin="round" />
            <path className="crown-sparkle" d="M146 14 l2 6 l6 2 l-6 2 l-2 6 l-2 -6 l-6 -2 l6 -2 Z" fill="#fff6b0" />
          </g>
        )}
        {(stage === 'champion' || stage === 'olympiad') && (
          <g>
            <path d="M98 100 l8 20 l8 -20" stroke="#3a86ff" strokeWidth="5" fill="none" />
            <circle className="dino-medal" cx="106" cy="126" r="9" fill="#ffd23f" stroke="#c99a00" strokeWidth="2" />
            <text x="106" y="130" fontSize="10" textAnchor="middle" fill="#8a6500" fontWeight="bold">
              ★
            </text>
          </g>
        )}
        {stage === 'explorer' && accessory == null && (
          <rect x="48" y="112" width="22" height="28" rx="6" fill="#f4a261" stroke="#b5651d" strokeWidth="2.5" />
        )}
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
        <text x="170" y="40" fontSize="22" fill="#6c7a99" fontWeight="bold">
          z<tspan dx="2" dy="-10" fontSize="16">z</tspan>
        </text>
      )}
    </svg>
  );
}

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(c + c * amt)));
  const r = f(n >> 16);
  const g = f((n >> 8) & 255);
  const b = f(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
