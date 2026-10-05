import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { play } from '../../engine/audio';
import { BADGES, DINOS, WORLD } from '../../engine/catalog';
import { phaseOf, today, weekStart } from '../../engine/dates';
import { isUnlocked } from '../../engine/mastery';
import {
  adventureDays,
  applyQuestion,
  logMistakes,
  completeMission,
  DAILY_CAMP_LIMIT,
  DAILY_MISSION_LIMIT,
  STARS,
  type MissionResult,
} from '../../engine/rewards';
import { buildCamp, buildMission, followUpFor, offlineMission, SEGMENTS, tomorrowPreview, type MissionItem } from '../../engine/session';
import { getState, update, useAppState } from '../../engine/store';
import type { BadgeId, Outcome, WorldId } from '../../engine/types';
import { Dino } from '../../components/Dino';
import { QuestionPlayer, type WrongPick } from '../../components/QuestionPlayer';
import { useCompanion } from '../../components/useCompanion';

type Stage = 'intro' | 'banner' | 'question' | 'summary';

export function MissionPage({ kind }: { kind: 'daily' | 'camp' }) {
  const state = useAppState();
  const [params] = useSearchParams();
  const companion = useCompanion();
  const t = today();
  const day = state.days[t];
  const worldParam = params.get('world') as WorldId | null;

  // Plan once on mount; later state changes must not reshuffle the mission.
  const [initial] = useState(() => {
    const s = getState();
    const d = s.days[t];
    if (kind === 'daily' && (d?.missions ?? 0) >= DAILY_MISSION_LIMIT) return { blocked: 'sleepy' as const };
    if (kind === 'camp' && (d?.camps ?? 0) >= DAILY_CAMP_LIMIT) return { blocked: 'sleepy' as const };
    if (kind === 'camp') {
      const plan = buildCamp(s);
      return plan ? { plan } : { blocked: 'clear' as const };
    }
    const w = worldParam && WORLD[worldParam] && isUnlocked(s, worldParam) ? worldParam : undefined;
    return { plan: buildMission(s, w) };
  });

  if ('blocked' in initial) return <Blocked reason={initial.blocked!} companion={companion} />;
  return <MissionRun plan={initial.plan!} alreadyToday={day?.missions ?? 0} />;
}

function Blocked({ reason, companion }: { reason: 'sleepy' | 'clear'; companion: ReturnType<typeof useCompanion> }) {
  return (
    <div className="screen center-col">
      <Dino size={200} color={companion.color} belly={companion.belly} mood={reason === 'sleepy' ? 'sleep' : 'cheer'} stage={companion.stage} accessory={companion.accessory} />
      {reason === 'sleepy' ? (
        <>
          <h1>Dino is sleepy 😴</h1>
          <p className="lead">We had a great adventure today. Rest your brain and come back tomorrow!</p>
        </>
      ) : (
        <>
          <h1>Training Camp is all clear! 🎉</h1>
          <p className="lead">There’s nothing tricky to practise right now. Go on an adventure instead!</p>
        </>
      )}
      <Link to="/" className="btn btn-primary btn-big">
        🏠 Home
      </Link>
    </div>
  );
}

function MissionRun({ plan, alreadyToday }: { plan: NonNullable<ReturnType<typeof buildMission>>; alreadyToday: number }) {
  const nav = useNavigate();
  const companion = useCompanion();
  const [items, setItems] = useState<MissionItem[]>(plan.items);
  const [idx, setIdx] = useState(0);
  const [stage, setStage] = useState<Stage>('intro');
  const [introLine, setIntroLine] = useState(0);
  const [stats, setStats] = useState({ seconds: 0, questions: 0, independent: 0, stars: 0, streak: 0, built: 0 });
  const [badges, setBadges] = useState<BadgeId[]>([]);
  const [strategyAsked, setStrategyAsked] = useState(false);
  const [result, setResult] = useState<MissionResult | null>(null);
  const world = WORLD[plan.world];
  const item = items[idx];
  const prevSegment = idx > 0 ? items[idx - 1].segment : null;
  const askStrategy = useMemo(() => !strategyAsked && idx >= 2 && Math.random() < 0.3, [idx, strategyAsked]);

  const onDone = (outcome: Outcome, seconds: number, strategy?: string, wrongs: WrongPick[] = []) => {
    const streak = outcome === 'independent' ? stats.streak + 1 : 0;
    let earned: BadgeId[] = [];
    update((d) => {
      earned = applyQuestion(d, item.q, outcome, seconds, plan.kind === 'camp' ? 'camp' : 'adventure', {
        segment: item.segment,
        strategy,
        independentStreak: streak,
      });
      logMistakes(d, item.q, wrongs);
    });
    if (strategy || askStrategy) setStrategyAsked(true);
    const nextStats = {
      seconds: stats.seconds + seconds,
      questions: stats.questions + 1,
      independent: stats.independent + (outcome === 'independent' ? 1 : 0),
      stars: stats.stars + STARS[outcome],
      streak,
      built: stats.built + (item.segment === 'boss' && outcome !== 'incorrect' ? 1 : 0),
    };
    setStats(nextStats);
    setBadges((b) => [...b, ...earned]);

    // After guided help or a miss, immediately give a similar success problem.
    let list = items;
    if ((outcome === 'guided' || outcome === 'incorrect') && !item.followUp) {
      list = [...items.slice(0, idx + 1), { q: followUpFor(item.q), segment: item.segment, followUp: true }, ...items.slice(idx + 1)];
      setItems(list);
    }

    const ni = idx + 1;
    if (ni >= list.length) {
      let r: MissionResult | null = null;
      update((d) => {
        r = completeMission(d, plan, {
          seconds: Math.round(nextStats.seconds),
          questions: nextStats.questions,
          independent: nextStats.independent,
          stars: nextStats.stars,
        });
      });
      setResult(r);
      play(plan.boss ? 'boss' : 'complete');
      setStage('summary');
      return;
    }
    setIdx(ni);
    setStage(list[ni].segment !== item.segment ? 'banner' : 'question');
  };

  const quit = () => {
    if (window.confirm('Leave this mission? Your stars so far are saved.')) nav('/');
  };

  if (stage === 'intro') {
    return (
      <div className="screen center-col mission-intro" style={{ ['--world' as string]: world.color }}>
        <div className="world-badge">
          {world.emoji} {plan.kind === 'camp' ? 'Dino Training Camp' : world.name}
        </div>
        <Dino size={190} color={companion.color} belly={companion.belly} mood={introLine === 0 ? 'happy' : 'think'} stage={companion.stage} accessory={companion.accessory} />
        <div className="speech">{plan.intro[introLine]}</div>
        {introLine < plan.intro.length - 1 ? (
          <button type="button" className="btn btn-primary btn-big" onClick={() => setIntroLine((l) => l + 1)} autoFocus>
            Next ▶
          </button>
        ) : (
          <button type="button" className="btn btn-primary btn-big" onClick={() => setStage('banner')} autoFocus>
            ▶ Let’s go!
          </button>
        )}
        {alreadyToday > 0 && plan.kind === 'daily' && <p className="small">Bonus adventure – the last one for today!</p>}
      </div>
    );
  }

  if (stage === 'banner') {
    const seg = SEGMENTS[item.segment];
    const isBoss = item.segment === 'boss';
    return (
      <div className={`screen center-col banner ${isBoss ? 'banner-boss' : ''}`} style={{ ['--world' as string]: world.color }}>
        {prevSegment === 'main' && (
          <div className="tiny-reward">✨ Dino found a shiny stone on the path! +{stats.stars} ⭐ so far</div>
        )}
        <div className="banner-emoji">{isBoss ? world.boss.emoji : seg.emoji}</div>
        <h1>{isBoss ? world.boss.name : seg.title}</h1>
        {isBoss && <p className="lead">{world.boss.mechanic}</p>}
        {item.segment === 'recall' && <p className="lead">Let’s remember something from before.</p>}
        {item.segment === 'hots' && <p className="lead">This one needs careful thinking. Take your time!</p>}
        {item.segment === 'treasure' && <p className="lead">Solve it to open the chest!</p>}
        <button type="button" className="btn btn-primary btn-big" onClick={() => setStage('question')} autoFocus>
          {isBoss ? '⚔️ Battle!' : '▶ Go!'}
        </button>
      </div>
    );
  }

  if (stage === 'summary' && result) {
    return <Summary plan={plan} stats={stats} badges={badges} result={result} />;
  }

  const bossItems = items.filter((i) => i.segment === 'boss').length;
  return (
    <div className="screen mission" style={{ ['--world' as string]: world.color }}>
      <div className="mission-bar">
        <button type="button" className="btn btn-ghost" onClick={quit} aria-label="Leave mission">
          ✕
        </button>
        <div className="path-dots" aria-label={`Question ${idx + 1} of ${items.length}`}>
          {items.map((it, i) => (
            <span key={it.q.id} className={`dot ${i < idx ? 'dot-done' : i === idx ? 'dot-now' : ''} ${it.segment === 'boss' ? 'dot-boss' : ''} ${it.segment === 'treasure' ? 'dot-treasure' : ''}`}>
              {i === idx ? '🦖' : it.segment === 'boss' ? world.boss.emoji : it.segment === 'treasure' ? '🎁' : ''}
            </span>
          ))}
        </div>
        <span className="mission-stars">⭐ {stats.stars}</span>
      </div>
      {item.segment === 'boss' && (
        <div className="boss-bar">
          <span className="boss-emoji">{world.boss.emoji}</span>
          <div className="bridge">
            {Array.from({ length: bossItems }, (_, i) => (
              <span key={i} className={`bridge-stone ${i < stats.built ? 'built' : ''}`} />
            ))}
          </div>
          <span>💎</span>
        </div>
      )}
      <QuestionPlayer
        key={item.q.id}
        q={item.q}
        onDone={onDone}
        askStrategy={askStrategy}
        header={
          <span className="seg-label">
            {SEGMENTS[item.segment].emoji} {item.followUp ? 'One more like that' : SEGMENTS[item.segment].title}
          </span>
        }
      />
    </div>
  );
}

function Summary({
  plan,
  stats,
  badges,
  result,
}: {
  plan: NonNullable<ReturnType<typeof buildMission>>;
  stats: { seconds: number; questions: number; independent: number; stars: number };
  badges: BadgeId[];
  result: MissionResult;
}) {
  const state = useAppState();
  const companion = useCompanion();
  const [offline] = useState(() => offlineMission());
  const [sleepy, setSleepy] = useState(false);
  const t = today();
  const week = adventureDays(state, weekStart(t), t);
  const world = WORLD[plan.world];
  const uniqueBadges = [...new Set(badges)];
  // Gentle speed feedback only once Olympiad Thinking starts (accuracy first).
  const showSpeed = phaseOf(t).phase >= 3;
  const prev = state.missions.filter((m) => m.questions > 0).slice(-2, -1)[0];
  const perQ = stats.seconds / Math.max(1, stats.questions);
  const prevPerQ = prev ? prev.seconds / Math.max(1, prev.questions) : null;

  return (
    <div className="screen summary center-col" style={{ ['--world' as string]: world.color }}>
      <div onAnimationEnd={() => setSleepy(true)} className="summary-dino">
        <Dino size={170} color={companion.color} belly={companion.belly} mood={sleepy ? 'sleep' : 'cheer'} stage={companion.stage} accessory={companion.accessory} />
      </div>
      <h1>{plan.kind === 'camp' ? 'Training complete! 💪' : plan.boss ? `You beat ${world.boss.name}! 🎉` : plan.light ? 'You are ready! 🌟' : 'Mission complete! 🎉'}</h1>
      <div className="reward-row">
        <div className="reward-card">
          <span className="big">⭐ {result.stars}</span>
          <span>Stars</span>
        </div>
        {result.eggs > 0 && (
          <div className="reward-card">
            <span className="big">🥚 {result.eggs}</span>
            <span>Dino Eggs</span>
          </div>
        )}
        <div className="reward-card">
          <span className="big">🧠 {stats.independent}</span>
          <span>All by yourself</span>
        </div>
      </div>
      {result.crystal && <div className="banner-note crystal-note">💎 You recovered the {WORLD[result.crystal].crystal}!</div>}
      {result.newlyReady.length > 0 && (
        <div className="banner-note">
          🥚 A new egg is ready to hatch: {result.newlyReady.map((id) => DINOS.find((d) => d.id === id)!.name).join(', ')}! Visit My Dinos.
        </div>
      )}
      {uniqueBadges.length > 0 && (
        <div className="badges-earned">
          {uniqueBadges.map((b) => (
            <span key={b} className="badge-chip">
              {BADGES[b].emoji} {BADGES[b].name}
            </span>
          ))}
        </div>
      )}
      {showSpeed && prevPerQ && (
        <p className="lead">
          {perQ < prevPerQ ? '⚡ You were quicker than last time – and still careful!' : '🐢 Careful and steady. Can you beat your own time tomorrow?'}
        </p>
      )}
      <p className="lead">🌟 You trained {week} {week === 1 ? 'day' : 'days'} this week.</p>
      <div className={`offline ${offline.kind}`}>
        <b>{offline.kind === 'parent' ? '👨‍👩‍👧 Parent Challenge' : '🏠 Real-World Mission'}</b>
        <p>{offline.text}</p>
      </div>
      <p className="small">{tomorrowPreview(state)}</p>
      <Link to="/" className="btn btn-primary btn-big">
        🏠 Home
      </Link>
    </div>
  );
}
