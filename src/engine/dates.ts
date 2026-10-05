import { EXAM_DATE, PLAN_START } from './catalog';

const OVERRIDE_KEY = 'mathosaur:dateOverride';

export function toKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function fromKey(k: string): Date {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Today's date key; parents can preview another date from the dashboard. */
export function today(): string {
  try {
    const o = localStorage.getItem(OVERRIDE_KEY);
    if (o && /^\d{4}-\d{2}-\d{2}$/.test(o)) return o;
  } catch {
    /* no storage */
  }
  return toKey(new Date());
}

export function setDateOverride(k: string | null) {
  if (k) localStorage.setItem(OVERRIDE_KEY, k);
  else localStorage.removeItem(OVERRIDE_KEY);
}

export const getDateOverride = () => localStorage.getItem(OVERRIDE_KEY);

export function addDays(k: string, n: number): string {
  const d = fromKey(k);
  d.setDate(d.getDate() + n);
  return toKey(d);
}

export function daysBetween(a: string, b: string): number {
  return Math.round((fromKey(b).getTime() - fromKey(a).getTime()) / 86400000);
}

export const daysToExam = (k = today()) => daysBetween(k, EXAM_DATE);

export type Phase = 1 | 2 | 3 | 4 | 5; // 5 = exam day or after

export interface PhaseInfo {
  phase: Phase;
  name: string;
  focus: string;
  /** Highest internal difficulty used in Adventure Mode. */
  cap: 3 | 4 | 5;
}

/**
 * The preparation schedule, worked out from PLAN_START and EXAM_DATE.
 * The final 9 days are always Final Preparation; the days before that are
 * split roughly 22% Foundation, 47% Olympiad Skills, 31% Olympiad Thinking.
 * With a 12 Oct start: Foundation 12–19 Oct, Skills 20 Oct–5 Nov,
 * Thinking 6–16 Nov, Final Preparation 17–25 Nov.
 */
export const SCHEDULE = (() => {
  const finalStart = addDays(EXAM_DATE, -9);
  const learning = daysBetween(PLAN_START, finalStart);
  const p2 = addDays(PLAN_START, Math.round(learning * 0.22));
  const p3 = addDays(PLAN_START, Math.round(learning * 0.69));
  return {
    start: PLAN_START,
    phase2: p2,
    phase3: p3,
    phase4: finalStart,
    /** New worlds open every few days during Olympiad Skills. */
    worlds: {
      shape_caves: p2,
      time_mountain: addDays(p2, 3),
      treasure_market: addDays(p2, 6),
      puzzle_forest: addDays(p2, 9),
    },
    castleAppears: addDays(EXAM_DATE, -7),
    castleOpens: addDays(EXAM_DATE, -5),
    /** Mission days per world before the adventure moves on (7 worlds share the learning days). */
    worldDays: Math.max(3, Math.floor(learning / 7)),
  };
})();

export const daysToStart = (k = today()) => daysBetween(k, PLAN_START);

export function phaseOf(k = today()): PhaseInfo {
  const left = daysToExam(k);
  if (left <= 0) return { phase: 5, name: 'Olympiad Day', focus: 'You are ready!', cap: 5 };
  if (k >= SCHEDULE.phase4) return { phase: 4, name: 'Final Preparation', focus: 'Training Camp, revision and mock exams', cap: 5 };
  if (k >= SCHEDULE.phase3) return { phase: 3, name: 'Olympiad Thinking', focus: 'Analogy, coding, clue puzzles, multi-step problems', cap: 5 };
  if (k >= SCHEDULE.phase2) return { phase: 2, name: 'Olympiad Skills', focus: 'Shapes, time, money, measurement, patterns, logic', cap: 4 };
  return { phase: 1, name: 'Foundation', focus: 'Number sense, addition, subtraction, multiplication basics', cap: 3 };
}

/** Readable date, e.g. "Mon 12 Oct". */
export function prettyDate(k: string): string {
  return fromKey(k).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

/** Monday-based week start. */
export function weekStart(k: string): string {
  const d = fromKey(k);
  const dow = (d.getDay() + 6) % 7;
  return addDays(k, -dow);
}
