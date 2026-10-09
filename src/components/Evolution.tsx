import { useEffect, useMemo, useState } from 'react';
import { play } from '../engine/audio';
import { STAGE_INFO, STAGE_ORDER, stageIndex } from '../engine/mastery';
import type { DinoId, Stage } from '../engine/types';
import { Dino } from './Dino';

interface DinoLook {
  species?: DinoId;
  name: string;
  color: string;
  belly: string;
  accessory?: string | null;
}

interface Props {
  /** Each step grows the dino by one stage, e.g. [['egg','baby'], ['baby','explorer']]. */
  steps: [Stage, Stage][];
  dino: DinoLook;
  onDone: () => void;
  /** Override the message shown when a stage is reached. */
  messageFor?: (to: Stage) => string;
}

const MESSAGES: Record<Stage, (name: string) => string> = {
  egg: (n) => `${n} is waiting inside the egg.`,
  baby: (n) => `Your number sense helped the egg crack open. Say hello to baby ${n}!`,
  explorer: (n) => `${n} is an Explorer now! Adding and taking away are your super powers.`,
  champion: (n) => `Champion Dino! ${n} is proud of your clever thinking.`,
  olympiad: (n) => `Olympiad Dino! ${n} is ready for the Olympiad Castle. 👑`,
};

type Beat = 'charge' | 'burst' | 'reveal';

/** All growth steps from one stage up to another. */
export function growthSteps(from: Stage, to: Stage): [Stage, Stage][] {
  const out: [Stage, Stage][] = [];
  for (let i = stageIndex(from); i < stageIndex(to); i++) out.push([STAGE_ORDER[i], STAGE_ORDER[i + 1]]);
  return out;
}

/**
 * Full-screen growth celebration. Gentle, no flashing: a soft glow while the
 * dino wiggles (or the egg cracks), a sparkle burst as it grows, then a
 * message. About 3 seconds per step, and children can skip ahead.
 */
export function EvolutionOverlay({ steps, dino, onDone, messageFor }: Props) {
  const [i, setI] = useState(0);
  const [beat, setBeat] = useState<Beat>('charge');
  const [from, to] = steps[i];
  const hatching = from === 'egg';

  useEffect(() => {
    setBeat('charge');
    const t1 = setTimeout(() => {
      setBeat('burst');
      play('hatch');
    }, 1700);
    const t2 = setTimeout(() => setBeat('reveal'), 3100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [i]);

  const sparkles = useMemo(
    () =>
      Array.from({ length: 12 }, (_, k) => {
        const a = (k / 12) * Math.PI * 2;
        const r = 120 + (k % 3) * 25;
        return { dx: Math.cos(a) * r, dy: Math.sin(a) * r, e: ['✨', '⭐', '🌟'][k % 3], delay: (k % 4) * 60 };
      }),
    [i],
  );

  const next = () => (i < steps.length - 1 ? setI(i + 1) : onDone());
  const title =
    beat === 'charge'
      ? hatching
        ? 'The egg is wiggling… 🥚'
        : `${dino.name} is growing…`
      : hatching
        ? `${dino.name} hatched! 🐣`
        : `${dino.name} became an ${STAGE_INFO[to].name}!`.replace('an C', 'a C');

  return (
    <div className="evo-backdrop" role="dialog" aria-modal="true" aria-live="polite" aria-label={title}>
      <div className={`evo-scene evo-${beat}`}>
        <div className="evo-glow" />
        {beat === 'charge' ? (
          <div className={`evo-dino ${hatching ? 'evo-egg-wobble' : 'evo-charge-wiggle'}`}>
            <Dino size={220} species={dino.species} color={dino.color} belly={dino.belly} stage={from} accessory={dino.accessory} mood={hatching ? 'sleep' : 'think'} />
            {hatching && (
              <svg className="evo-cracks" viewBox="0 0 200 200" width="220" height="220" aria-hidden="true">
                <path d="M70 160 l12 -10 l-6 -10 l14 -6" />
                <path d="M128 162 l-10 -12 l8 -8 l-12 -8" />
                <path d="M100 150 l4 -12 l-6 -8" />
              </svg>
            )}
          </div>
        ) : (
          <div className="evo-dino evo-grow-in">
            <Dino size={220} species={dino.species} color={dino.color} belly={dino.belly} stage={to} accessory={dino.accessory} mood="cheer" />
          </div>
        )}
        {beat === 'burst' && hatching && (
          <>
            <span className="evo-shell evo-shell-l" />
            <span className="evo-shell evo-shell-r" />
          </>
        )}
        {beat !== 'charge' && (
          <div className="evo-sparkles" aria-hidden="true">
            {sparkles.map((s, k) => (
              <span
                key={k}
                style={{ ['--dx' as string]: `${s.dx}px`, ['--dy' as string]: `${s.dy}px`, animationDelay: `${s.delay}ms` }}
              >
                {s.e}
              </span>
            ))}
          </div>
        )}
      </div>

      <h2 className="evo-title">{title}</h2>
      {beat === 'reveal' ? (
        <>
          <p className="evo-message">{messageFor ? messageFor(to) : MESSAGES[to](dino.name)}</p>
          <ol className="evo-path" aria-label="Growth stages">
            {STAGE_ORDER.map((s) => (
              <li key={s} className={stageIndex(s) <= stageIndex(to) ? 'evo-path-done' : ''}>
                {STAGE_INFO[s].name}
              </li>
            ))}
          </ol>
          <button type="button" className="btn btn-primary btn-big" onClick={next} autoFocus>
            {i < steps.length - 1 ? 'Keep growing ▶' : 'Yay! 🎉'}
          </button>
        </>
      ) : (
        <button type="button" className="link evo-skip" onClick={() => setBeat('reveal')}>
          Skip
        </button>
      )}
    </div>
  );
}

/** A friendly bar showing growth towards the next stage. */
export function GrowthMeter({ pct, next, compact = false }: { pct: number; next: Stage | null; compact?: boolean }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setShown(pct), 120); // animate the fill on arrival
    return () => clearTimeout(t);
  }, [pct]);
  if (!next) return <div className={`growth ${compact ? 'growth-compact' : ''}`}>👑 Fully grown!</div>;
  return (
    <div className={`growth ${compact ? 'growth-compact' : ''}`}>
      {!compact && <span className="growth-label">Growing into {STAGE_INFO[next].name}</span>}
      <div
        className={`growth-bar ${pct >= 0.85 ? 'growth-near' : ''}`}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct * 100)}
        aria-label={`Growth towards ${STAGE_INFO[next].name}`}
      >
        <span style={{ width: `${Math.max(4, shown * 100)}%` }} />
      </div>
      {pct >= 0.85 && <span className="growth-almost">✨ Almost there!</span>}
    </div>
  );
}
