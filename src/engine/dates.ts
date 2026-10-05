import { EXAM_DATE } from './catalog';

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

export function phaseOf(k = today()): PhaseInfo {
  const left = daysToExam(k);
  if (left <= 0) return { phase: 5, name: 'Olympiad Day', focus: 'You are ready!', cap: 5 };
  if (left <= 9) return { phase: 4, name: 'Final Preparation', focus: 'Training Camp, revision and mock exams', cap: 5 };
  if (k >= '2026-11-05') return { phase: 3, name: 'Olympiad Thinking', focus: 'Analogy, coding, clue puzzles, multi-step problems', cap: 5 };
  if (k >= '2026-10-15') return { phase: 2, name: 'Olympiad Skills', focus: 'Shapes, time, money, measurement, patterns, logic', cap: 4 };
  return { phase: 1, name: 'Foundation', focus: 'Number sense, addition, subtraction, multiplication basics', cap: 3 };
}

/** Monday-based week start. */
export function weekStart(k: string): string {
  const d = fromKey(k);
  const dow = (d.getDay() + 6) % 7;
  return addDays(k, -dow);
}
