import { HATCH_COST } from './catalog';
import { today } from './dates';
import { readyToHatch, recordOutcome, worldProgress } from './mastery';
import type { MissionPlan, SegmentKind } from './session';
import type { AppState, BadgeId, DinoId, Outcome, Question, WorldId } from './types';

/** Keep a short log of wrong answers (with likely misconception) for parents. */
export function logMistakes(draft: AppState, q: Question, wrongs: { picked: string; tag?: string }[]) {
  for (const w of wrongs) {
    draft.mistakes.push({ t: Date.now(), skill: q.skill, prompt: q.prompt, picked: w.picked, answer: q.answer, tag: w.tag });
  }
  if (draft.mistakes.length > 300) draft.mistakes.splice(0, draft.mistakes.length - 300);
}

/** Stars reward effort as well as independent success. */
export const STARS: Record<Outcome, number> = { independent: 3, retry: 2, hint: 2, guided: 1, incorrect: 1 };

export const MISSION_STARS = 5;
export const CAMP_STARS = 3;
export const DAILY_MISSION_LIMIT = 2;
/** Most extra adventures a parent can unlock in one day (healthy-use guardrail). */
export const MAX_EXTRA_PER_DAY = 3;

/** Adventures allowed on a date: the normal limit plus any a parent unlocked. */
export const missionLimit = (state: AppState, date = today()) => DAILY_MISSION_LIMIT + (state.extraMissions?.[date] ?? 0);

/** Parent mode: let the child play the next day's adventure today. */
export function unlockNextDay(draft: AppState, date = today()): boolean {
  const extra = draft.extraMissions?.[date] ?? 0;
  if (extra >= MAX_EXTRA_PER_DAY) return false;
  draft.extraMissions = { ...(draft.extraMissions ?? {}), [date]: extra + 1 };
  return true;
}
export const DAILY_CAMP_LIMIT = 2;

export function applyQuestion(
  draft: AppState,
  q: Question,
  outcome: Outcome,
  seconds: number,
  mode: 'adventure' | 'camp',
  ctx: { segment: SegmentKind; strategy?: string; independentStreak: number },
): BadgeId[] {
  recordOutcome(draft, q.skill, q.difficulty, outcome, seconds, mode);
  const s = STARS[outcome];
  draft.stars += s;
  draft.days[today()].stars += s;

  const earned: BadgeId[] = [];
  const solved = outcome !== 'incorrect';
  if (solved && (outcome === 'hint' || outcome === 'guided')) earned.push('never_give_up');
  if (solved && (q.hots || ctx.segment === 'hots')) earned.push('great_thinker');
  if (solved && q.skill === 'patterns') earned.push('pattern_spotter');
  if (outcome === 'independent' && ctx.independentStreak > 0 && ctx.independentStreak % 3 === 0) earned.push('sharp_eyes');
  if (ctx.strategy) {
    earned.push('super_explainer');
    draft.strategies[ctx.strategy] = (draft.strategies[ctx.strategy] ?? 0) + 1;
  }
  for (const b of earned) draft.badges[b] = (draft.badges[b] ?? 0) + 1;
  return earned;
}

export interface MissionResult {
  stars: number;
  eggs: number;
  bossDefeated: boolean;
  crystal: WorldId | null;
  newlyReady: DinoId[];
}

export function completeMission(
  draft: AppState,
  plan: MissionPlan,
  stats: { seconds: number; questions: number; independent: number; stars: number },
): MissionResult {
  const t = today();
  const day = (draft.days[t] ??= { questions: 0, seconds: 0, missions: 0, camps: 0, stars: 0 });
  const readyBefore = readyToHatch(draft).map((d) => d.id);
  let eggs = 0;
  let bonus = 0;
  let bossDefeated = false;
  let crystal: WorldId | null = null;

  if (plan.kind === 'camp') {
    bonus = CAMP_STARS;
    day.camps += 1;
  } else {
    bonus = MISSION_STARS;
    eggs += 1;
    day.missions += 1;
    // Adventures beyond the normal daily limit were unlocked by a parent as
    // "the next day's adventure", so they move the plan on by a day.
    const ahead = day.missions > DAILY_MISSION_LIMIT;
    draft.missions.push({ date: t, world: plan.world, ...stats, stars: stats.stars + bonus, ...(ahead ? { ahead } : {}) });
    if (plan.boss && !draft.bosses.includes(plan.world)) {
      draft.bosses.push(plan.world);
      bossDefeated = true;
      eggs += 2;
    }
    if (!draft.crystals.includes(plan.world) && draft.bosses.includes(plan.world) && worldProgress(draft, plan.world) >= 0.85) {
      draft.crystals.push(plan.world);
      crystal = plan.world;
      eggs += 3;
    }
  }
  draft.stars += bonus;
  day.stars += bonus;
  draft.eggs += eggs;
  const newlyReady = readyToHatch(draft)
    .map((d) => d.id)
    .filter((id) => !readyBefore.includes(id));
  return { stars: stats.stars + bonus, eggs, bossDefeated, crystal, newlyReady };
}

/** Crystals can also be earned later, once mastery catches up after the boss. */
export function checkCrystals(draft: AppState): WorldId[] {
  const won: WorldId[] = [];
  for (const w of draft.bosses) {
    if (!draft.crystals.includes(w) && worldProgress(draft, w) >= 0.85) {
      draft.crystals.push(w);
      draft.eggs += 3;
      won.push(w);
    }
  }
  return won;
}

export function hatch(draft: AppState, id: DinoId): boolean {
  if (draft.hatched.includes(id) || draft.eggs < HATCH_COST) return false;
  if (!readyToHatch(draft).some((d) => d.id === id)) return false;
  draft.eggs -= HATCH_COST;
  draft.hatched.push(id);
  return true;
}

export function adventureDays(state: AppState, fromKey: string, toKey: string): number {
  return Object.entries(state.days).filter(([k, d]) => k >= fromKey && k <= toKey && d.questions > 0).length;
}
