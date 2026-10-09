import { useEffect, useMemo, useRef, useState } from 'react';
import { play, speak, stopSpeaking } from '../engine/audio';
import { DIFFICULTY_LABEL, SKILL } from '../engine/catalog';
import { classifyMistake, replacementOption } from '../engine/misconceptions';
import { getState } from '../engine/store';
import { GAME_NAMES, pick } from '../engine/generators';
import { STARS } from '../engine/rewards';
import type { Outcome, Question, SkillId } from '../engine/types';
import { Dino } from './Dino';
import { DinoRun, EggMatch, FeedDino, LavaCrossing, MysteryDino, NumberPad, NumberTrain, PatternCave, PickGame, TreasureShop } from './games/Games';
import type { GameProps } from './games/types';
import { ReadAloud, RichText } from './RichText';
import { VisualView } from './Visuals';
import { useCompanion } from './useCompanion';

const GAMES: Record<Question['game'], (p: GameProps) => JSX.Element> = {
  run: DinoRun,
  feed: FeedDino,
  match: EggMatch,
  train: NumberTrain,
  shop: TreasureShop,
  pattern: PatternCave,
  mystery: MysteryDino,
  lava: LavaCrossing,
  type: NumberPad,
  pick: PickGame,
};

/** Games where a tried wrong option can be swapped for a fresh one. */
const OPTION_GAMES: Question['game'][] = ['run', 'pick', 'train', 'pattern', 'mystery'];

const CHEERS = ['Great thinking!', 'Dino crossed safely!', 'You got it!', 'Super!', 'Brilliant!', 'Roar-some!', 'Well done!'];
const RETRY_CHEERS = ['You kept trying – and got it!', 'Never give up! 💪', 'That’s the way!'];
const REASONING_STRATEGIES = ['I found a pattern', 'I crossed some out', 'I checked each clue', 'I drew it in my head', 'I guessed'];
const PICTURE_STRATEGIES = ['I counted carefully', 'I looked at the picture', 'I used what I know', 'I guessed'];
const NUMBER_STRATEGIES = ['I counted on', 'I added tens first', 'I used a number fact I know', 'I used the picture', 'I guessed'];
const PICTURE_SKILLS: SkillId[] = ['shapes_2d', 'solids_3d', 'count_shapes', 'clock_reading', 'data_pictograph', 'temperature', 'measurement', 'symmetry'];

/** "How did you solve it?" choices that fit the kind of question. */
export function strategiesFor(skill: SkillId): string[] {
  if (SKILL[skill].reasoning) return REASONING_STRATEGIES;
  if (PICTURE_SKILLS.includes(skill)) return PICTURE_STRATEGIES;
  return NUMBER_STRATEGIES;
}

export interface WrongPick {
  picked: string;
  tag?: string;
}

interface Props {
  q: Question;
  onDone: (outcome: Outcome, seconds: number, strategy?: string, wrongs?: WrongPick[]) => void;
  /** Ask "How did you solve it?" if solved independently. */
  askStrategy?: boolean;
  header?: React.ReactNode;
}

type Phase = 'play' | 'solved' | 'strategy' | 'revealed';

export function QuestionPlayer({ q, onDone, askStrategy = false, header }: Props) {
  const companion = useCompanion();
  const [misses, setMisses] = useState(0);
  const [phase, setPhase] = useState<Phase>('play');
  const [msg, setMsg] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [options, setOptions] = useState(q.options);
  const shownQ = useMemo(() => ({ ...q, options }), [q, options]);
  const wrongs = useRef<WrongPick[]>([]);
  const start = useRef(Date.now());
  const elapsed = () => (Date.now() - start.current) / 1000;
  const doneRef = useRef(false);
  const readText = q.prompt + (q.data?.type === 'mystery' ? '. ' + q.data.clues.join('. ') : '');

  useEffect(() => {
    // Reading should not be the hidden difficulty: read longer questions aloud.
    const longText = q.prompt.split(/\s+/).length > 7 || q.data?.type === 'mystery';
    const t = getState().settings.autoRead !== false && longText ? setTimeout(() => speak(readText), 350) : undefined;
    return () => {
      if (t) clearTimeout(t);
      stopSpeaking();
    };
  }, []);

  const finish = (o: Outcome, strategy?: string) => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone(o, elapsed(), strategy, wrongs.current);
  };

  const handle = (value: string) => {
    if (phase !== 'play') return;
    if (value === q.answer) {
      const o: Outcome = misses === 0 ? 'independent' : misses === 1 ? 'retry' : misses === 2 ? 'hint' : 'guided';
      setOutcome(o);
      play('correct');
      setMsg(misses >= 2 ? pick(RETRY_CHEERS) : pick(CHEERS));
      setPhase('solved');
      return;
    }
    const m = misses + 1;
    setMisses(m);
    if (value !== 'wrong') wrongs.current.push({ picked: value, tag: classifyMistake(q, value) });
    // Swap the tried option for a fresh one so the next try can't be won by elimination.
    if (OPTION_GAMES.includes(q.game) && options.includes(value)) {
      const fresh = replacementOption(q, options);
      if (fresh) setTimeout(() => setOptions((o) => o.map((x) => (x === value ? fresh : x))), 800);
    }
    if (m === 1) setMsg('🦖 Dino slipped. Try once more!');
    else if (m === 2) setMsg('💡 Here’s a clue to help you.');
    else if (m === 3) setMsg('🤝 Let’s solve it together, step by step.');
    else {
      setOutcome('incorrect');
      setPhase('revealed');
      setMsg(null);
    }
  };

  const next = () => {
    if (!outcome) return;
    if (phase === 'solved' && outcome === 'independent' && askStrategy) {
      setPhase('strategy');
      return;
    }
    finish(outcome);
  };

  const Game = GAMES[q.game];
  const showVisual = q.visual && q.game !== 'pattern';
  const answerLabel = q.answer === 'done' ? (q.steps[0] ?? '') : q.answer;

  return (
    <div className="qp">
      <div className="qp-top">
        {header}
        <span className="tag" title="Challenge type">
          {GAME_NAMES[q.game]} · {DIFFICULTY_LABEL[q.difficulty]}
        </span>
      </div>
      <div className="qp-prompt">
        <h2>
          <RichText text={q.prompt} />
        </h2>
        <ReadAloud text={readText} />
      </div>
      {showVisual && (
        <div className="qp-visual">
          <VisualView v={q.visual!} />
        </div>
      )}

      <div className={`qp-game ${phase === 'strategy' || phase === 'revealed' ? 'dim' : ''}`}>
        <Game key={q.id} q={shownQ} onAnswer={handle} locked={phase !== 'play'} misses={misses} dino={companion} />
      </div>

      {msg && phase === 'play' && (
        <div className={`feedback ${misses >= 2 ? 'feedback-help' : 'feedback-soft'}`} role="status">
          {msg}
        </div>
      )}

      {phase === 'play' && misses >= 2 && (
        <div className="hint-box">
          <div className="hint-title">💡 Clue</div>
          <p className="pre">{q.hint}</p>
          {q.hintVisual && <VisualView v={q.hintVisual} />}
        </div>
      )}

      {phase === 'play' && misses >= 3 && (
        <div className="guided-box">
          <div className="hint-title">🤝 Let’s do it together</div>
          <ol>
            {q.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
          <p className="small">Now you try!</p>
        </div>
      )}

      {phase === 'solved' && (
        <div className="success-bar" role="status">
          <Dino size={70} species={companion.id} color={companion.color} belly={companion.belly} mood="cheer" stage={companion.stage} accessory={companion.accessory} />
          <div className="success-text">
            <b>{msg}</b>
            <span>
              +{STARS[outcome!]} ⭐ {outcome === 'independent' ? 'all by yourself!' : 'for not giving up!'}
            </span>
          </div>
          <button type="button" className="btn btn-primary btn-big" onClick={next} autoFocus>
            Next ▶
          </button>
        </div>
      )}

      {phase === 'revealed' && (
        <div className="guided-box">
          <div className="hint-title">🦖 Let’s look at the answer together</div>
          <ol>
            {q.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
          <p>
            The answer is <b>{answerLabel}</b>. Dino will give you a similar one next – you can do it!
          </p>
          <button type="button" className="btn btn-primary btn-big" onClick={() => finish('incorrect')} autoFocus>
            Try a similar one ▶
          </button>
        </div>
      )}

      {phase === 'strategy' && (
        <div className="strategy-box">
          <h3>🦖 How did you solve it?</h3>
          <div className="strategy-options">
            {strategiesFor(q.skill).map((s) => (
              <button type="button" key={s} className="btn btn-soft" onClick={() => finish('independent', s)}>
                {s}
              </button>
            ))}
          </div>
          <button type="button" className="link" onClick={() => finish('independent')}>
            Skip
          </button>
        </div>
      )}
    </div>
  );
}
