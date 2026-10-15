import { useState } from 'react';
import { play } from '../engine/audio';
import { DINOS, HATCH_COST, WORLDS, type DinoInfo } from '../engine/catalog';
import { discoveryProgress, FOOTPRINTS_AT, nextStep } from '../engine/mastery';
import { answerDinoMath, DINO_MATH_STARS } from '../engine/rewards';
import { update } from '../engine/store';
import type { AppState, DinoId, WorldId } from '../engine/types';
import { Dino, shade } from './Dino';
import { ReadAloud } from './RichText';

type Tab = 'all' | WorldId | 'special';

const TABS: { id: Tab; label: string }[] = [
  { id: 'all', label: 'All' },
  ...WORLDS.filter((w) => w.id !== 'olympiad_castle').map((w) => ({ id: w.id as Tab, label: `${w.emoji} ${w.name.split(' ')[0]}` })),
  { id: 'special', label: '⭐ Special' },
];

type CardState = 'found' | 'egg' | 'footprints' | 'hidden';

export function cardState(state: AppState, d: DinoInfo): CardState {
  if (state.hatched.includes(d.id)) return 'found';
  const p = discoveryProgress(state, d);
  if (p >= 1) return 'egg';
  return p >= FOOTPRINTS_AT ? 'footprints' : 'hidden';
}

/** Spots on a mystery egg use the dino's home-world colour: a hint where to look. */
export function eggColor(d: DinoInfo): string {
  return WORLDS.find((w) => w.id === d.tab)?.color ?? '#ec4899';
}

const SPOTS = [
  [-16, -22, 6],
  [18, -12, 7],
  [-24, 20, 6],
  [22, 26, 5],
  [6, -34, 4],
  [-4, 38, 4],
];

/** A dino not found yet stays a secret: a speckled egg that cracks as the child gets close. */
export function MysteryEgg({ color, mode, size = 110 }: { color: string; mode: 'hidden' | 'footprints' | 'egg'; size?: number }) {
  const d = shade(color, -0.3);
  const shell = 'M60 14 C 90 14 98 64 96 78 C 94 100 78 108 60 108 C 42 108 26 100 24 78 C 22 64 30 14 60 14 Z';
  return (
    <svg viewBox="0 0 120 124" width={size} height={size} className={`mystery-shell egg-${mode}`} role="img" aria-label="Mystery egg">
      {mode === 'egg' && <circle cx="60" cy="62" r="58" fill="#ffe08a" opacity="0.55" />}
      <ellipse cx="60" cy="114" rx="30" ry="6" fill="#000" opacity="0.08" />
      <g className="mystery-body">
        <path d={shell} fill="#fffaf0" stroke={d} strokeWidth="3" />
        {SPOTS.map(([x, y, r], i) => (
          <circle key={i} cx={60 + x} cy={60 + y} r={r} fill={color} opacity="0.75" />
        ))}
        <path d="M40 30 q -8 14 -6 30" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.8" />
        {mode === 'hidden' && (
          <text x="60" y="74" textAnchor="middle" fontSize="34" fontWeight="800" fill={d}>
            ?
          </text>
        )}
        {mode === 'footprints' && <path d="M50 38 l6 7 l-5 6 l7 6" stroke={d} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
        {mode === 'egg' && (
          <path d="M26 62 l10 -8 l8 9 l9 -10 l9 9 l9 -9 l10 8 l8 -4" stroke={d} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </g>
      {mode === 'egg' && (
        <>
          <text x="102" y="28" textAnchor="middle" fontSize="18">
            ✨
          </text>
          <text x="16" y="40" textAnchor="middle" fontSize="13">
            ✨
          </text>
        </>
      )}
    </svg>
  );
}

interface Props {
  state: AppState;
  selected: DinoId | null;
  onSelect: (id: DinoId | null) => void;
  onHatch: (d: DinoInfo) => void;
}

/** The Dino Discovery Book: every dino, found or still hiding, with clues and progress. */
export function DiscoveryBook({ state, selected, onSelect, onHatch }: Props) {
  const [tab, setTab] = useState<Tab>('all');
  const found = DINOS.filter((d) => state.hatched.includes(d.id)).length;
  const shown = DINOS.filter((d) => tab === 'all' || d.tab === tab);
  const sel = DINOS.find((d) => d.id === selected) ?? null;

  return (
    <section className="discovery" aria-label="Dino Discovery Book">
      <div className="discovery-head">
        <h2 className="section-title">📖 Dino Discovery Book</h2>
        <p className="lead">
          You have found <b>{found}</b> of <b>{DINOS.length}</b> dinos!
        </p>
        <div className="growth-bar discovery-bar" role="progressbar" aria-valuemin={0} aria-valuemax={DINOS.length} aria-valuenow={found} aria-label="Dinos found">
          <span style={{ width: `${(found / DINOS.length) * 100}%` }} />
        </div>
      </div>

      <div className="discovery-tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className={`chip-btn ${tab === t.id ? 'chip-on' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {sel && state.hatched.includes(sel.id) && <FactCard key={sel.id} state={state} d={sel} onClose={() => onSelect(null)} />}

      <div className="discovery-grid">
        {shown.map((d) => {
          const cs = cardState(state, d);
          const p = discoveryProgress(state, d);
          return (
            <div key={d.id} className={`dcard dcard-${cs} ${d.legendary ? 'dcard-legend' : ''}`}>
              {cs === 'found' ? (
                <button type="button" className="dcard-body" onClick={() => onSelect(d.id)} aria-label={`${d.name}: see fact card`}>
                  <Dino size={110} species={d.id} color={d.color} belly={d.belly} mood="happy" stage="baby" />
                  <b>{d.name}</b>
                  <span className="small">{d.species}</span>
                  {state.companion === d.id ? <span className="chip">My buddy</span> : <span className="dcard-tap">Tap for fact ✨</span>}
                </button>
              ) : cs === 'egg' ? (
                <div className="dcard-body">
                  <MysteryEgg color={eggColor(d)} mode="egg" />
                  <b>Ready to hatch!</b>
                  <span className="small">Something is inside…</span>
                  <button type="button" className="btn btn-primary" disabled={state.eggs < HATCH_COST} onClick={() => onHatch(d)}>
                    Hatch (🥚 {HATCH_COST})
                  </button>
                  {state.eggs < HATCH_COST && <span className="small">Earn {HATCH_COST - state.eggs} more 🥚 on an adventure</span>}
                </div>
              ) : (
                <div className="dcard-body">
                  <div className="dcard-sil">
                    <MysteryEgg color={eggColor(d)} mode={cs} />
                    {cs === 'footprints' && (
                      <span className="dcard-feet" aria-hidden="true">
                        🐾 🐾
                      </span>
                    )}
                  </div>
                  <b>{cs === 'footprints' ? 'The egg moved!' : 'Mystery Egg'}</b>
                  {cs === 'footprints' ? (
                    <>
                      <div className="growth-bar growth-near" aria-label={`${Math.round(p * 100)}% of the way`}>
                        <span style={{ width: `${p * 100}%` }} />
                      </div>
                      <span className="small">{nextStep(state, d)}</span>
                    </>
                  ) : (
                    <span className="small">Clue: {d.clue}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function FactCard({ state, d, onClose }: { state: AppState; d: DinoInfo; onClose: () => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  // Remember whether it was answered before this visit, so the first win shows the bonus.
  const [answered] = useState(() => !!state.factsAnswered?.includes(d.id));
  const right = picked === d.math.answer;
  return (
    <div className="fact-card" role="region" aria-label={`${d.name} fact card`}>
      <button type="button" className="btn btn-ghost fact-close" onClick={onClose} aria-label="Close fact card">
        ✕
      </button>
      <Dino size={150} species={d.id} color={d.color} belly={d.belly} mood={right ? 'cheer' : 'happy'} stage="baby" />
      <div className="fact-text">
        <h3>
          {d.name} · <span className="muted">{d.species}</span>
        </h3>
        <p>
          <b>Dino fact:</b> {d.fact}
        </p>
        <div className="dino-math">
          <b>🧮 Dino Maths:</b> {d.math.q}
          <div className="row">
            {d.math.options.map((o) => (
              <button
                key={o}
                type="button"
                className={`btn btn-soft ${picked === o ? (o === d.math.answer ? 'pick-right' : 'pick-wrong') : ''}`}
                onClick={() => {
                  setPicked(o);
                  if (o === d.math.answer) {
                    play('correct');
                    update((s) => void answerDinoMath(s, d.id, true));
                  }
                }}
              >
                {o}
              </button>
            ))}
          </div>
          {picked && (
            <p className="small">
              {right ? (answered ? '✅ Yes! You are a dino expert.' : `✅ Yes! +${DINO_MATH_STARS} ⭐`) : '🦖 Not quite. Have another look!'}
            </p>
          )}
        </div>
        <div className="row">
          <ReadAloud text={`${d.name}. ${d.fact} Dino maths: ${d.math.q}`} />
          {state.companion !== d.id ? (
            <button type="button" className="btn btn-primary" onClick={() => update((s) => void (s.companion = d.id))}>
              ⭐ Make my buddy
            </button>
          ) : (
            <span className="chip">⭐ My buddy</span>
          )}
        </div>
      </div>
    </div>
  );
}
