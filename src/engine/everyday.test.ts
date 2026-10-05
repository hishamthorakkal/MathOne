import { describe, expect, it, vi } from 'vitest';
import { addDays, daysToExam, phaseOf } from './dates';
import { completeMission, applyQuestion } from './rewards';
import { buildCamp, buildMission, buildMock } from './session';
import { initialState } from './store';
import type { Outcome } from './types';

// Simulate a child playing one mission every day from today until the Olympiad.
describe('every day until the Olympiad', () => {
  it('builds a valid mission each day and progresses through the worlds', () => {
    const store: Record<string, string> = {};
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => void (store[k] = v),
      removeItem: (k: string) => void delete store[k],
    });
    const state = initialState();
    state.childName = 'Test';
    const outcomes: Outcome[] = ['independent', 'independent', 'independent', 'retry', 'hint', 'independent', 'guided', 'independent'];
    const report: string[] = [];
    let n = 0;

    for (let day = '2026-10-05'; day <= '2026-11-26'; day = addDays(day, 1)) {
      store['mathosaur:dateOverride'] = day;
      const left = daysToExam(day);
      const plan = buildMission(state);
      expect(plan.items.length, day).toBeGreaterThanOrEqual(7);
      if (left === 1) {
        expect(plan.light, day).toBe(true);
        expect(plan.boss, day).toBe(false);
      }
      for (const item of plan.items) {
        expect(item.q.prompt, day).toBeTruthy();
        applyQuestion(state, item.q, outcomes[n++ % outcomes.length], 20, 'adventure', { segment: item.segment, independentStreak: 0 });
      }
      completeMission(state, plan, { seconds: 600, questions: plan.items.length, independent: 6, stars: 20 });
      buildCamp(state); // must not throw
      report.push(`${day} P${phaseOf(day).phase} ${plan.world}${plan.boss ? ' BOSS' : ''}${plan.light ? ' LIGHT' : ''}`);
    }
    expect(buildMock('full')).toHaveLength(50);
    console.log(report.join('\n'));
    console.log('crystals:', state.crystals.join(', '));
    vi.unstubAllGlobals();
  });
});
