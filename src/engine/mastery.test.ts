import { describe, expect, it } from 'vitest';
import { isMastered, masteryOf, recordOutcome, worldProgress, isUnlocked } from './mastery';
import { initialState } from './store';

describe('mastery model', () => {
  it('does not treat a couple of correct answers as mastery', () => {
    const s = initialState();
    recordOutcome(s, 'place_value', 1, 'independent', 10, 'adventure');
    recordOutcome(s, 'place_value', 1, 'independent', 10, 'adventure');
    expect(masteryOf(s.skills.place_value)).toBeLessThan(0.5);
    expect(isMastered(s.skills.place_value)).toBe(false);
  });

  it('reaches mastery after a run of independent answers and raises difficulty', () => {
    const s = initialState();
    for (let i = 0; i < 9; i++) recordOutcome(s, 'place_value', s.skills.place_value?.level ?? 1, 'independent', 10, 'adventure');
    expect(isMastered(s.skills.place_value)).toBe(true);
    expect(s.skills.place_value!.level).toBeGreaterThan(1);
  });

  it('weights help: independent > hint > guided', () => {
    const run = (o: 'independent' | 'hint' | 'guided') => {
      const s = initialState();
      for (let i = 0; i < 6; i++) recordOutcome(s, 'patterns', 2, o, 10, 'adventure');
      return masteryOf(s.skills.patterns);
    };
    expect(run('independent')).toBeGreaterThan(run('hint'));
    expect(run('hint')).toBeGreaterThan(run('guided'));
  });

  it('lowers difficulty after two consecutive errors and queues revision', () => {
    const s = initialState();
    for (let i = 0; i < 3; i++) recordOutcome(s, 'money_change', 1, 'independent', 10, 'adventure');
    expect(s.skills.money_change!.level).toBe(2);
    recordOutcome(s, 'money_change', 2, 'incorrect', 10, 'adventure');
    recordOutcome(s, 'money_change', 2, 'incorrect', 10, 'adventure');
    expect(s.skills.money_change!.level).toBe(1);
    expect(s.revision.money_change!.failureCount).toBe(2);
    expect(s.revision.money_change!.priority).toBeGreaterThanOrEqual(3);
  });

  it('keeps the next world locked after one short mission', () => {
    const s = initialState();
    for (const id of ['place_value', 'compare_numbers', 'ordering', 'number_neighbours', 'skip_counting', 'even_odd'] as const) {
      recordOutcome(s, id, 1, 'independent', 10, 'adventure');
      recordOutcome(s, id, 1, 'independent', 10, 'adventure');
    }
    expect(worldProgress(s, 'number_jungle')).toBeLessThan(0.5);
    expect(isUnlocked(s, 'volcano_valley', '2026-10-05')).toBe(false);
  });
});
