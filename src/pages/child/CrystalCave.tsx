import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BONUS_CRYSTAL_EGGS, BONUS_CRYSTALS, SKILL, WORLDS, skillsOf, type BonusCrystal } from '../../engine/catalog';
import { bonusProgress, checkBonusCrystals, gemsOf } from '../../engine/collection';
import { isUnlocked } from '../../engine/mastery';
import { update, useAppState } from '../../engine/store';
import { play } from '../../engine/audio';
import { shade } from '../../components/Dino';

const HEX = [
  [0, -46],
  [24, -22],
  [24, 22],
  [0, 46],
  [-24, 22],
  [-24, -22],
];

/** A faceted crystal that fills from the bottom as gems are earned. */
function WorldCrystal({ color, fill, won, locked, id }: { color: string; fill: number; won: boolean; locked: boolean; id: string }) {
  const c = locked ? '#cfc6b4' : color;
  const d = shade(c, -0.35);
  const pts = HEX.map(([x, y]) => `${60 + x},${58 + y}`).join(' ');
  const top = 104 - 92 * fill;
  return (
    <svg viewBox="0 0 120 116" width="110" height="106" aria-hidden="true">
      <defs>
        <clipPath id={`cc-${id}`}>
          <polygon points={pts} />
        </clipPath>
      </defs>
      {won && <circle cx="60" cy="58" r="54" fill={shade(color, 0.6)} opacity="0.6" />}
      <polygon points={pts} fill="#fff" stroke={d} strokeWidth="3" strokeLinejoin="round" />
      {!locked && <polygon points={pts} fill={c} opacity="0.12" />}
      <rect x="30" y={top} width="60" height={104 - top} fill={c} clipPath={`url(#cc-${id})`} opacity="0.9" className="crystal-fill" />
      <path d="M60 12 L 60 104 M 36 36 L 60 58 L 84 36" stroke="#fff" strokeWidth="2" opacity="0.55" fill="none" />
      <polygon points={pts} fill="none" stroke={d} strokeWidth="3" strokeLinejoin="round" />
      {locked && (
        <text x="60" y="66" textAnchor="middle" fontSize="22">
          🔒
        </text>
      )}
      {won && (
        <g>
          <circle cx="84" cy="20" r="10" fill="#2e9d57" />
          <text x="84" y="25" textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">
            ✓
          </text>
        </g>
      )}
    </svg>
  );
}

function BonusGem({ b, won }: { b: BonusCrystal; won: boolean }) {
  const rainbow = b.color === 'rainbow';
  const c = rainbow ? '#ec4899' : b.color;
  return (
    <svg viewBox="0 0 60 84" width="52" height="74" aria-hidden="true">
      {rainbow && (
        <defs>
          <linearGradient id="rainbow-gem" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ef4444" />
            <stop offset="0.25" stopColor="#f59e0b" />
            <stop offset="0.5" stopColor="#22c55e" />
            <stop offset="0.75" stopColor="#3b82f6" />
            <stop offset="1" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      )}
      <polygon
        points="30,4 52,26 30,80 8,26"
        fill={rainbow ? 'url(#rainbow-gem)' : won ? c : '#ece6d9'}
        opacity={rainbow && !won ? 0.35 : 1}
        stroke={won ? shade(c, -0.35) : '#cfc6b4'}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M8 26 L 52 26 M 30 4 L 22 26 L 30 80 M 30 4 L 38 26 L 30 80" stroke="#fff" strokeWidth="1.5" opacity="0.6" fill="none" />
    </svg>
  );
}

export function CrystalCave() {
  const state = useAppState();
  const [justWon, setJustWon] = useState<BonusCrystal[]>([]);
  const gems = gemsOf(state);
  const bonusWon = state.bonusCrystals ?? [];

  // Award anything already earned (e.g. from before crystals existed), once.
  useEffect(() => {
    let won: BonusCrystal[] = [];
    update((d) => {
      won = checkBonusCrystals(d);
      d.gems = gemsOf(d);
    });
    if (won.length) {
      setJustWon(won);
      play('hatch');
    }
  }, []);

  return (
    <div className="screen crystal-cave">
      <header className="page-head">
        <Link to="/" className="btn btn-ghost">
          ← Home
        </Link>
        <h1>💎 Crystal Cave</h1>
        <span className="crystal-count">🥚 {state.eggs}</span>
      </header>
      <p className="lead center-text">
        {state.crystals.length} of {WORLDS.length} world crystals · {gems.length} of {Object.keys(SKILL).length} skill gems · {bonusWon.length} of{' '}
        {BONUS_CRYSTALS.length} bonus crystals
      </p>

      {justWon.length > 0 && (
        <div className="banner-note crystal-note center-text">
          ✨ You won {justWon.map((b) => b.name).join(' and ')}! +{justWon.length * BONUS_CRYSTAL_EGGS} 🥚
        </div>
      )}

      <div className="world-crystals">
        {WORLDS.map((w) => {
          const skills = skillsOf(w.id);
          const got = skills.filter((s) => gems.includes(s)).length;
          const won = state.crystals.includes(w.id);
          const locked = !isUnlocked(state, w.id) && got === 0;
          return (
            <div key={w.id} className={`crystal-card ${won ? 'crystal-won' : ''}`} style={{ ['--world' as string]: w.color }}>
              <WorldCrystal id={w.id} color={w.color} fill={got / skills.length} won={won} locked={locked} />
              <div className="gem-row" aria-label={`${got} of ${skills.length} gems`}>
                {skills.map((s) => (
                  <span key={s} className={`gem ${gems.includes(s) ? 'gem-on' : ''}`} title={SKILL[s].name} />
                ))}
              </div>
              <b>
                {w.emoji} {w.name}
              </b>
              <span className="small">{locked ? 'Opens later' : won ? 'Crystal won!' : `${got} of ${skills.length} gems`}</span>
            </div>
          );
        })}
      </div>

      <h2 className="section-title center-text">⭐ Bonus Crystals: won for great habits, never by luck</h2>
      <div className="bonus-crystals">
        {BONUS_CRYSTALS.map((b) => {
          const won = bonusWon.includes(b.id);
          const p = bonusProgress(state, b);
          return (
            <div key={b.id} className={`bonus-card ${won ? 'bonus-won' : ''}`} style={{ ['--gem' as string]: b.color === 'rainbow' ? '#a855f7' : b.color }}>
              <BonusGem b={b} won={won} />
              <div>
                <b>
                  {b.name}
                  {b.legendary ? ' ⭐' : ''}
                </b>
                <span className="small">{b.how}</span>
                {won ? (
                  <span className="bonus-done">✓ Won! +{BONUS_CRYSTAL_EGGS} 🥚</span>
                ) : (
                  <div className={`growth-bar ${p >= 0.75 ? 'growth-near' : ''}`} aria-label={`${Math.round(p * 100)}% of the way`}>
                    <span style={{ width: `${Math.max(4, p * 100)}%` }} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
