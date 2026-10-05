import { useMemo, useRef, useState } from 'react';
import { play } from '../../engine/audio';
import { shuffle } from '../../engine/generators';
import { Dino } from '../Dino';
import { RichText } from '../RichText';
import type { GameProps } from './types';

/** Guards against double taps while an animation plays. */
function useBusy() {
  const busy = useRef(false);
  return (ms: number, fn: () => void) => {
    if (busy.current) return;
    busy.current = true;
    setTimeout(() => {
      busy.current = false;
      fn();
    }, ms);
  };
}

// ---------- Dino Run: pick the right path ----------
export function DinoRun({ q, onAnswer, locked, dino }: GameProps) {
  const [lane, setLane] = useState<number | null>(null);
  const [slip, setSlip] = useState(false);
  const later = useBusy();
  const n = q.options.length;
  const choose = (i: number) => {
    if (locked) return;
    play('tap');
    setLane(i);
    later(550, () => {
      const ok = q.options[i] === q.answer;
      if (!ok) {
        setSlip(true);
        setTimeout(() => {
          setSlip(false);
          setLane(null);
        }, 700);
      }
      onAnswer(q.options[i]);
    });
  };
  const pos = lane == null ? 50 : ((lane + 0.5) / n) * 100;
  const solved = locked && lane != null;
  return (
    <div className="run-scene" style={{ ['--lanes' as string]: n }}>
      <div className="run-lanes">
        {q.options.map((o, i) => (
          <div key={o} className="run-lane">
            <button
              type="button"
              className={`stone ${lane === i ? (slip ? 'stone-wrong' : solved ? 'stone-right' : 'stone-picked') : ''}`}
              onClick={() => choose(i)}
              disabled={locked}
            >
              {o}
            </button>
            <div className="run-path" />
          </div>
        ))}
      </div>
      <div
        className={`run-dino ${lane != null ? 'running' : ''} ${slip ? 'slipping' : ''} ${solved ? 'crossed' : ''}`}
        style={{ left: `${pos}%` }}
      >
        <Dino size={92} color={dino.color} belly={dino.belly} mood={slip ? 'oops' : solved ? 'cheer' : 'happy'} />
      </div>
    </div>
  );
}

// ---------- Feed the Dino ----------
export function FeedDino({ q, onAnswer, locked, misses, dino }: GameProps) {
  const data = q.data?.type === 'feed' ? q.data : { need: 10, have: 5, item: '🫐' };
  const [added, setAdded] = useState(0);
  const [munch, setMunch] = useState(false);
  const change = (d: number) => {
    if (locked) return;
    play('tap');
    setAdded((a) => Math.max(0, Math.min(30, a + d)));
  };
  const feed = () => {
    if (locked || added === 0) return;
    setMunch(true);
    setTimeout(() => setMunch(false), 600);
    onAnswer(String(added));
  };
  return (
    <div className="feed-scene">
      <div className="feed-dino">
        <div className="bubble">
          I need <b>{data.need}</b> {data.item}!
        </div>
        <Dino size={130} color={dino.color} belly={dino.belly} mood={locked ? 'cheer' : munch ? 'think' : 'happy'} />
      </div>
      <div className="plate" aria-label={`Plate with ${data.have} already and ${added} added`}>
        <div className="plate-items">
          {Array.from({ length: data.have }, (_, i) => (
            <span key={`h${i}`} className="food have">
              {data.item}
            </span>
          ))}
          {Array.from({ length: added }, (_, i) => (
            <span key={`a${i}`} className="food added">
              {data.item}
            </span>
          ))}
        </div>
        {misses >= 2 && (
          <div className="plate-count">
            {data.have} + {added} = {data.have + added}
          </div>
        )}
      </div>
      <div className="feed-controls">
        <button type="button" className="btn btn-round" onClick={() => change(-1)} disabled={locked || added === 0} aria-label="Take one away">
          −
        </button>
        <div className="added-count">
          Adding <b>{added}</b> {data.item}
        </div>
        <button type="button" className="btn btn-round btn-add" onClick={() => change(1)} disabled={locked} aria-label="Add one">
          +
        </button>
      </div>
      <button type="button" className="btn btn-primary btn-big" onClick={feed} disabled={locked || added === 0}>
        🍽️ Feed Dino!
      </button>
    </div>
  );
}

// ---------- Egg Match ----------
export function EggMatch({ q, onAnswer, locked }: GameProps) {
  const pairs = q.data?.type === 'match' ? q.data.pairs : [];
  const rights = useMemo(() => shuffle(pairs.map((p) => p.right)), [q.id]);
  const [matched, setMatched] = useState<string[]>([]);
  const [sel, setSel] = useState<string | null>(null);
  const [shake, setShake] = useState<string | null>(null);
  const nestDone = (r: string) => pairs.some((p) => p.right === r && matched.includes(p.left));
  const tapNest = (r: string) => {
    if (locked || !sel || nestDone(r)) return;
    const pair = pairs.find((p) => p.left === sel)!;
    if (pair.right === r) {
      play('tap');
      const next = [...matched, sel];
      setMatched(next);
      setSel(null);
      if (next.length === pairs.length) onAnswer('done');
    } else {
      setShake(r);
      setTimeout(() => setShake(null), 500);
      setSel(null);
      onAnswer('wrong');
    }
  };
  return (
    <div className="match-scene">
      <p className="game-tip">Tap an egg 🥚, then tap its nest 🪺</p>
      <div className="match-cols">
        <div className="match-col">
          {pairs.map((p) => (
            <button
              type="button"
              key={p.left}
              className={`egg ${sel === p.left ? 'egg-selected' : ''} ${matched.includes(p.left) ? 'egg-done' : ''}`}
              onClick={() => !locked && !matched.includes(p.left) && setSel(p.left)}
              disabled={locked || matched.includes(p.left)}
            >
              {p.left}
            </button>
          ))}
        </div>
        <div className="match-col">
          {rights.map((r) => (
            <button
              type="button"
              key={r}
              className={`nest-btn ${nestDone(r) ? 'nest-done' : ''} ${shake === r ? 'shake' : ''}`}
              onClick={() => tapNest(r)}
              disabled={locked || nestDone(r)}
            >
              <span className="nest-num">{r}</span>
              {nestDone(r) && <span className="nest-egg">🐣</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- Number Train ----------
export function NumberTrain({ q, onAnswer, locked }: GameProps) {
  const seq = q.data?.type === 'train' ? q.data.seq : [];
  const [filled, setFilled] = useState<string | null>(null);
  const [wrong, setWrong] = useState(false);
  const later = useBusy();
  const choose = (o: string) => {
    if (locked) return;
    play('tap');
    setFilled(o);
    later(450, () => {
      if (o !== q.answer) {
        setWrong(true);
        setTimeout(() => {
          setWrong(false);
          setFilled(null);
        }, 600);
      }
      onAnswer(o);
    });
  };
  return (
    <div className="train-scene">
      <div className={`train ${locked ? 'train-go' : ''}`}>
        <div className="engine">🚂</div>
        {seq.map((x, i) => (
          <div key={i} className={`carriage ${x == null ? 'carriage-missing' : ''} ${x == null && wrong ? 'shake' : ''}`}>
            {x ?? filled ?? '?'}
          </div>
        ))}
      </div>
      <div className="track" />
      <p className="game-tip">Load the right number into the empty carriage!</p>
      <div className="cargo">
        {q.options.map((o) => (
          <button type="button" key={o} className="cargo-box" onClick={() => choose(o)} disabled={locked}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- Treasure Shop ----------
export function TreasureShop({ q, onAnswer, locked, misses }: GameProps) {
  const data = q.data?.type === 'shop' ? q.data : { target: 10, coins: [1, 2, 5, 10] };
  const [tray, setTray] = useState<number[]>([]);
  const sum = tray.reduce((a, b) => a + b, 0);
  const add = (c: number) => {
    if (locked || tray.length >= 15) return;
    play('tap');
    setTray((t) => [...t, c]);
  };
  const remove = (i: number) => !locked && setTray((t) => t.filter((_, j) => j !== i));
  return (
    <div className="shop-scene">
      {'item' in data && data.item && <div className="shop-item">{data.item}</div>}
      <div className="tray" aria-label="Your coins">
        {tray.length === 0 && <span className="tray-empty">Tap coins to put them here</span>}
        {tray.map((c, i) => (
          <button type="button" key={i} className={c >= 10 ? 'note' : 'coin'} onClick={() => remove(i)} title="Tap to take back" disabled={locked}>
            ₹{c}
          </button>
        ))}
      </div>
      {misses >= 2 && <div className="plate-count">Your coins make ₹{sum}</div>}
      <div className="purse">
        {data.coins.map((c) => (
          <button type="button" key={c} className={c >= 10 ? 'note' : 'coin'} onClick={() => add(c)} disabled={locked}>
            ₹{c}
          </button>
        ))}
      </div>
      <div className="row-center">
        <button type="button" className="btn btn-soft" onClick={() => setTray([])} disabled={locked || !tray.length}>
          ↩ Clear
        </button>
        <button type="button" className="btn btn-primary btn-big" onClick={() => onAnswer(String(sum))} disabled={locked || !tray.length}>
          💰 Pay
        </button>
      </div>
    </div>
  );
}

// ---------- Pattern Cave ----------
export function PatternCave({ q, onAnswer, locked }: GameProps) {
  const items = q.data?.type === 'pattern' ? q.data.items : [];
  const [placed, setPlaced] = useState<string | null>(null);
  const later = useBusy();
  const choose = (o: string) => {
    if (locked) return;
    play('tap');
    setPlaced(o);
    later(450, () => {
      if (o !== q.answer) setTimeout(() => setPlaced(null), 500);
      onAnswer(o);
    });
  };
  return (
    <div className="cave-scene">
      <div className="cave-wall">
        {items.map((x, i) => (
          <span key={i} className={`cave-item ${x === '?' ? 'cave-gap' : ''} ${x === '?' && locked ? 'cave-glow' : ''}`}>
            {x === '?' ? (placed ?? '?') : x}
          </span>
        ))}
      </div>
      <p className="game-tip">Which gem fills the gap?</p>
      <div className="gems">
        {q.options.map((o) => (
          <button type="button" key={o} className="gem" onClick={() => choose(o)} disabled={locked}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- Mystery Dino ----------
export function MysteryDino({ q, onAnswer, locked, dino }: GameProps) {
  const clues = q.data?.type === 'mystery' ? q.data.clues : [];
  const [ticked, setTicked] = useState<number[]>([]);
  return (
    <div className="mystery-scene">
      <div className="mystery-head">
        <Dino size={90} color={dino.color} belly={dino.belly} mood="think" />
        <span className="mystery-q">❓</span>
      </div>
      <ol className="clues">
        {clues.map((c, i) => (
          <li key={i}>
            <button
              type="button"
              className={`clue-card ${ticked.includes(i) ? 'clue-ticked' : ''}`}
              onClick={() => setTicked((t) => (t.includes(i) ? t.filter((x) => x !== i) : [...t, i]))}
            >
              <span className="clue-check">{ticked.includes(i) ? '✔' : i + 1}</span>
              <RichText text={c} />
            </button>
          </li>
        ))}
      </ol>
      <div className="egg-options">
        {q.options.map((o) => (
          <button type="button" key={o} className="egg egg-option" onClick={() => !locked && onAnswer(o)} disabled={locked}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- Lava Crossing ----------
export function LavaCrossing({ q, onAnswer, locked }: GameProps) {
  const data = q.data?.type === 'lava' ? q.data : { stones: [], order: 'asc' as const };
  const sorted = useMemo(() => [...data.stones].sort((a, b) => (data.order === 'asc' ? a - b : b - a)), [q.id]);
  const [step, setStep] = useState(0);
  const [shake, setShake] = useState<number | null>(null);
  const tap = (n: number) => {
    if (locked || sorted.indexOf(n) < step) return;
    if (n === sorted[step]) {
      play('tap');
      const next = step + 1;
      setStep(next);
      if (next === sorted.length) onAnswer('done');
    } else {
      setShake(n);
      setTimeout(() => setShake(null), 500);
      onAnswer('wrong');
    }
  };
  const last = step > 0 ? sorted[step - 1] : null;
  return (
    <div className="lava-scene">
      <div className="bank">🏝️ Start</div>
      <div className="lava">
        {data.stones.map((n) => {
          const done = sorted.indexOf(n) < step;
          return (
            <button
              type="button"
              key={n}
              className={`lava-stone ${done ? 'stepped' : ''} ${shake === n ? 'shake' : ''}`}
              onClick={() => tap(n)}
              disabled={locked || done}
            >
              {n}
              {last === n && <span className="lava-dino">🦖</span>}
            </button>
          );
        })}
      </div>
      <div className="bank">💎 Crystal</div>
      <div className="lava-path" aria-live="polite">
        Path: {sorted.slice(0, step).join(' → ') || '…'}
      </div>
    </div>
  );
}

// ---------- Picture choice ----------
export function PickGame({ q, onAnswer, locked }: GameProps) {
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div className={`pick-grid ${q.options.some((o) => o.length > 14) ? 'pick-wide' : ''}`}>
      {q.options.map((o) => (
        <button
          type="button"
          key={o}
          className={`pick-option ${picked === o ? (o === q.answer ? 'pick-right' : 'pick-wrong') : ''}`}
          onClick={() => {
            if (locked) return;
            play('tap');
            setPicked(o);
            onAnswer(o);
            if (o !== q.answer) setTimeout(() => setPicked(null), 700);
          }}
          disabled={locked}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
