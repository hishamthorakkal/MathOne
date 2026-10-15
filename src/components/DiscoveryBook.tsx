import { useState } from 'react';
import { play } from '../engine/audio';
import { DINOS, HATCH_COST, WORLDS, type DinoInfo } from '../engine/catalog';
import { discoveryProgress, FOOTPRINTS_AT, nextStep } from '../engine/mastery';
import { answerDinoMath, DINO_MATH_STARS } from '../engine/rewards';
import { update } from '../engine/store';
import type { AppState, DinoId, WorldId } from '../engine/types';
import { Dino } from './Dino';
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
                  <div className="mystery-egg egg-wobble">🥚</div>
                  <b>New egg found!</b>
                  <span className="small">Something is inside…</span>
                  <button type="button" className="btn btn-primary" disabled={state.eggs < HATCH_COST} onClick={() => onHatch(d)}>
                    Hatch (🥚 {HATCH_COST})
                  </button>
                  {state.eggs < HATCH_COST && <span className="small">Earn {HATCH_COST - state.eggs} more 🥚 on an adventure</span>}
                </div>
              ) : (
                <div className="dcard-body">
                  <div className="dcard-sil">
                    <Dino size={110} species={d.id} color={d.color} belly={d.belly} mood="happy" stage="baby" className="dino-still" title="Hidden dino" />
                    {cs === 'hidden' && <span className="dcard-q">?</span>}
                    {cs === 'footprints' && (
                      <span className="dcard-feet" aria-hidden="true">
                        🐾 🐾
                      </span>
                    )}
                  </div>
                  <b>{cs === 'footprints' ? 'Footprints spotted!' : '???'}</b>
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
