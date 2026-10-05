import { ord, shuffle, swapDigits } from './generators';
import type { Question, SkillId } from './types';

/** Questions that pick from a set: a new number could also satisfy the rule, so never swap options. */
const SELECTION_SKILLS: SkillId[] = ['compare_numbers', 'even_odd', 'odd_one_out', 'ordering', 'temperature'];

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/** Name the likely misconception behind a wrong answer, if we can tell. */
export function classifyMistake(q: Question, picked: string): string | undefined {
  if (q.mistakes?.[picked]) return q.mistakes[picked];
  const num = (s: string) => {
    const m = s.match(/^(\D*)(\d+)(\D*)$/);
    return m ? Number(m[2]) : null;
  };
  const a = num(q.answer);
  const p = num(picked);
  if (a == null || p == null) return undefined;
  const diff = Math.abs(a - p);
  if (diff === 1) return 'Counting slip (off by one)';
  if (diff === 10) return 'Tens slip (off by ten)';
  if (a >= 10 && a < 100 && swapDigits(a) === p) return 'Mixed up tens and ones';
  return undefined;
}

/**
 * A fresh wrong option to replace one the child already tried, so the third
 * try can't be won just by elimination. Returns null when none is available.
 */
export function replacementOption(q: Question, current: string[]): string | null {
  if (SELECTION_SKILLS.includes(q.skill)) return null;
  const taken = new Set([...current, q.answer]);
  const fresh = (cands: string[]) => shuffle(cands).find((c) => !taken.has(c)) ?? null;

  const ordinal = q.answer.match(/^(\d+)(st|nd|rd|th)(.*)$/);
  if (ordinal) {
    const n = Number(ordinal[1]);
    return fresh([n + 1, n - 1, n + 2, n + 3].filter((x) => x > 0).map((x) => `${x}${ord(x)}${ordinal[3]}`));
  }

  // Clock times: change the hour, keep it between 1 and 12.
  const hour = (h: number) => ((h - 1 + 120) % 12) + 1;
  const clock = q.answer.match(/^(\d+):(\d\d)( pm| am)?$/);
  if (clock) {
    const h = Number(clock[1]);
    return fresh([1, -1, 2, -2].map((k) => `${hour(h + k)}:${clock[2]}${clock[3] ?? ''}`));
  }
  const label = q.answer.match(/^(.*?)(\d+)( o'clock)?$/);
  if (label && /o'clock|past|quarter to/.test(q.answer)) {
    const h = Number(label[2]);
    return fresh([1, -1, 2, -2].map((k) => `${label[1]}${hour(h + k)}${label[3] ?? ''}`));
  }
  const m = q.answer.match(/^(\D*)(\d+)(\D*)$/);
  if (m) {
    const [, pre, digits, post] = m;
    const n = Number(digits);
    const near = [n + 1, n - 1, n + 2, n - 2, n + 10, n - 10, n + 3, n - 3, n + 5, n - 5].filter((x) => x >= 0);
    return fresh(near.map((x) => `${pre}${x}${post}`));
  }
  if (DAYS.includes(q.answer)) return fresh(DAYS);
  if (MONTHS.includes(q.answer)) return fresh(MONTHS);
  return null;
}
