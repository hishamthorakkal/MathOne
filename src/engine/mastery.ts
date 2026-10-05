import { DINOS, SKILL, SKILLS, WORLDS, skillsOf, type DinoInfo } from './catalog';
import { addDays, today } from './dates';
import type { AppState, Difficulty, Outcome, SkillId, SkillState, Stage, WorldId } from './types';

export const OUTCOME_WEIGHT: Record<Outcome, number> = {
  independent: 1,
  retry: 0.8,
  hint: 0.6,
  guided: 0.35,
  incorrect: 0,
};

const RECENCY = 0.85;
const RECENT_CAP = 20;
export const MASTERED = 0.75;
export const MIN_ATTEMPTS = 5;

export const emptySkill = (): SkillState => ({
  recent: [],
  level: 1,
  streakCorrect: 0,
  streakWrong: 0,
  total: 0,
  counts: { independent: 0, retry: 0, hint: 0, guided: 0, incorrect: 0 },
  totalSeconds: 0,
});

/**
 * Recency-weighted mastery in [0, 1]. Newer attempts count more; harder
 * questions count slightly more; a small prior keeps a couple of lucky
 * answers from looking like mastery.
 */
export function masteryOf(s?: SkillState): number {
  if (!s || s.recent.length === 0) return 0;
  let num = 0;
  let den = 1; // prior
  const n = s.recent.length;
  s.recent.forEach((r, i) => {
    const w = Math.pow(RECENCY, n - 1 - i);
    num += w * OUTCOME_WEIGHT[r.o] * Math.min(1, 0.8 + 0.05 * r.d);
    den += w;
  });
  // Normalise so a long perfect run reaches ~1, and scale by evidence so two
  // lucky answers don't look like mastery.
  const confidence = Math.min(1, n / MIN_ATTEMPTS);
  return Math.min(1, (num / den / 0.87) * confidence);
}

export const isMastered = (s?: SkillState) => !!s && s.total >= MIN_ATTEMPTS && masteryOf(s) >= MASTERED;

export function skillStatus(s?: SkillState): 'Not started' | 'Strong' | 'Developing' | 'Needs Practice' {
  if (!s || s.total === 0) return 'Not started';
  const m = masteryOf(s);
  if (m >= 0.8) return 'Strong';
  if (m >= 0.6) return 'Developing';
  return 'Needs Practice';
}

/** Progress of a world from 0 to 1. */
export function worldProgress(state: AppState, w: WorldId): number {
  const ids = skillsOf(w);
  const sum = ids.reduce((acc, id) => acc + Math.min(1, masteryOf(state.skills[id]) / MASTERED), 0);
  return sum / ids.length;
}

export const masteredCount = (state: AppState, w: WorldId) => skillsOf(w).filter((id) => isMastered(state.skills[id])).length;

export function recordOutcome(
  state: AppState,
  skill: SkillId,
  difficulty: Difficulty,
  outcome: Outcome,
  seconds: number,
  mode: 'adventure' | 'camp' | 'arena',
) {
  const now = Date.now();
  const s = state.skills[skill] ?? emptySkill();
  s.recent.push({ o: outcome, s: Math.round(seconds), t: now, d: difficulty });
  if (s.recent.length > RECENT_CAP) s.recent.splice(0, s.recent.length - RECENT_CAP);
  s.total += 1;
  s.counts[outcome] += 1;
  s.totalSeconds += Math.round(seconds);
  s.lastSeen = now;

  // Anti-frustration: adjust the invisible difficulty level.
  if (mode !== 'arena') {
    if (outcome === 'independent') {
      s.streakWrong = 0;
      s.streakCorrect += 1;
      if (s.streakCorrect >= 3) {
        s.level = Math.min(5, s.level + 1) as Difficulty;
        s.streakCorrect = 0;
      }
    } else if (outcome === 'incorrect' || outcome === 'guided') {
      s.streakCorrect = 0;
      s.streakWrong += 1;
      if (s.streakWrong >= 2) {
        s.level = Math.max(1, s.level - 1) as Difficulty;
        s.streakWrong = 0;
      }
    } else {
      s.streakCorrect = 0;
      s.streakWrong = 0;
    }
  }
  state.skills[skill] = s;

  // Spaced-repetition revision queue.
  const t = today();
  const r = state.revision[skill];
  if (outcome === 'incorrect' || outcome === 'guided') {
    const failureCount = (r?.failureCount ?? 0) + 1;
    state.revision[skill] = {
      priority: Math.min(5, (r?.priority ?? 1) + 2),
      intervalDays: 1,
      nextReview: addDays(t, 1),
      failureCount,
    };
  } else if (outcome === 'hint') {
    state.revision[skill] = {
      priority: Math.min(5, (r?.priority ?? 1) + 1),
      intervalDays: 2,
      nextReview: addDays(t, 2),
      failureCount: r?.failureCount ?? 0,
    };
  } else if (r) {
    const interval = outcome === 'independent' ? Math.min(16, r.intervalDays * 2) : r.intervalDays;
    const priority = outcome === 'independent' ? Math.max(0, r.priority - 1) : r.priority;
    if (priority === 0 && interval >= 8 && isMastered(s)) delete state.revision[skill];
    else state.revision[skill] = { ...r, priority, intervalDays: interval, nextReview: addDays(t, interval) };
  }

  state.attempts.push({ t: now, skill, difficulty, outcome, seconds: Math.round(seconds), mode });
  if (state.attempts.length > 3000) state.attempts.splice(0, state.attempts.length - 3000);

  const day = (state.days[t] ??= { questions: 0, seconds: 0, missions: 0, camps: 0, stars: 0 });
  day.questions += 1;
  day.seconds += Math.round(seconds);
}

// ---------- worlds, stages, dinos ----------

const WORLD_DATE_UNLOCK: Partial<Record<WorldId, string>> = {
  shape_caves: '2026-10-15',
  time_mountain: '2026-10-19',
  treasure_market: '2026-10-23',
  puzzle_forest: '2026-10-27',
  olympiad_castle: '2026-11-21', // castle gate opens 5 days before the exam
};

export const CASTLE_APPEARS = '2026-11-19';

export function isUnlocked(state: AppState, w: WorldId, k = today()): boolean {
  if (state.settings.unlockAll) return true;
  const i = WORLDS.findIndex((x) => x.id === w);
  if (i === 0) return true;
  const date = WORLD_DATE_UNLOCK[w];
  if (date && k >= date) return true;
  if (w === 'olympiad_castle') return WORLDS.slice(0, 7).every((x) => state.crystals.includes(x.id));
  return worldProgress(state, WORLDS[i - 1].id) >= 0.5;
}

export function currentWorld(state: AppState): WorldId {
  const open = WORLDS.filter((w) => isUnlocked(state, w.id));
  return (open.find((w) => !state.crystals.includes(w.id)) ?? open[open.length - 1]).id;
}

export const bossReady = (state: AppState, w: WorldId) => !state.bosses.includes(w) && worldProgress(state, w) >= 0.6;

export function stageOf(state: AppState): Stage {
  const p = (w: WorldId) => worldProgress(state, w);
  const bestMock = Math.max(0, ...state.mocks.filter((m) => m.kind === 'full').map((m) => m.score / m.maxScore));
  if (state.crystals.includes('olympiad_castle') || bestMock >= 0.75) return 'olympiad';
  const strongWorlds = WORLDS.filter((w) => p(w.id) >= 0.5).length;
  if (p('puzzle_forest') >= 0.5 && strongWorlds >= 5) return 'champion';
  if (p('number_jungle') >= 0.6 && p('volcano_valley') >= 0.6) return 'explorer';
  if (p('number_jungle') >= 0.6) return 'baby';
  return 'egg';
}

export const STAGE_INFO: Record<Stage, { name: string; next: string }> = {
  egg: { name: 'Dino Egg', next: 'Master basic number sense in Number Jungle to hatch!' },
  baby: { name: 'Baby Dino', next: 'Master addition & subtraction in Volcano Valley to grow.' },
  explorer: { name: 'Explorer Dino', next: 'Master Puzzle Forest reasoning + mixed maths.' },
  champion: { name: 'Champion Dino', next: 'Complete the Olympiad missions or score 75% in a full mock.' },
  olympiad: { name: 'Olympiad Dino', next: 'You reached the top! 👑' },
};

export function dinoReady(state: AppState, d: DinoInfo): boolean {
  if (!d.world) return true;
  return masteredCount(state, d.world) >= (d.mastered ?? 1);
}

export const readyToHatch = (state: AppState) => DINOS.filter((d) => !state.hatched.includes(d.id) && dinoReady(state, d));

// ---------- analytics helpers ----------

export function skillStats(state: AppState, id: SkillId) {
  const s = state.skills[id];
  const total = s?.total ?? 0;
  const c = s?.counts ?? emptySkill().counts;
  return {
    id,
    name: SKILL[id].name,
    total,
    mastery: masteryOf(s),
    status: skillStatus(s),
    independent: total ? c.independent / total : 0,
    hintRate: total ? (c.hint + c.guided) / total : 0,
    errors: c.incorrect + c.guided,
    avgSeconds: total ? (s!.totalSeconds / total) : 0,
    failures: state.revision[id]?.failureCount ?? 0,
  };
}

export const allSkillStats = (state: AppState) => SKILLS.map((s) => skillStats(state, s.id));
