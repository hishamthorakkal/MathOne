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

describe('parent unlock of the next day’s adventure', () => {
  it('raises today’s limit, caps at 3 extra, and counts each early adventure as a plan day', async () => {
    const { DAILY_MISSION_LIMIT, MAX_EXTRA_PER_DAY, missionLimit, unlockNextDay } = await import('./rewards');
    const { missionDays } = await import('./mastery');
    const s = initialState();
    const day = '2026-10-14';
    expect(missionLimit(s, day)).toBe(DAILY_MISSION_LIMIT);
    expect(unlockNextDay(s, day)).toBe(true);
    expect(missionLimit(s, day)).toBe(DAILY_MISSION_LIMIT + 1);
    for (let i = 1; i < MAX_EXTRA_PER_DAY; i++) unlockNextDay(s, day);
    expect(unlockNextDay(s, day)).toBe(false);
    expect(missionLimit(s, '2026-10-15')).toBe(DAILY_MISSION_LIMIT); // only for that day

    const m = { world: 'number_jungle' as const, seconds: 600, questions: 10, independent: 5, stars: 20 };
    s.missions.push({ date: day, ...m }, { date: day, ...m }, { date: day, ...m, ahead: true });
    // two normal adventures on one date = 1 plan day, plus 1 early "next day" adventure
    expect(missionDays(s, 'number_jungle')).toBe(2);
  });
});

describe('dino growth', () => {
  const masterWorld = (s: ReturnType<typeof initialState>, skills: Parameters<typeof recordOutcome>[1][]) => {
    for (const id of skills) for (let i = 0; i < 10; i++) recordOutcome(s, id, 3, 'independent', 10, 'adventure');
  };
  const JUNGLE = ['place_value', 'number_names', 'compare_numbers', 'ordering', 'number_neighbours', 'skip_counting', 'even_odd'] as const;

  it('fills the growth meter as Number Jungle is mastered, then hatches', async () => {
    const { stageProgress, displayStage } = await import('./mastery');
    const s = initialState();
    expect(stageProgress(s)).toMatchObject({ stage: 'egg', next: 'baby', pct: 0 });
    masterWorld(s, [...JUNGLE.slice(0, 3)]);
    const half = stageProgress(s).pct;
    expect(half).toBeGreaterThan(0.3);
    expect(half).toBeLessThan(1);
    masterWorld(s, [...JUNGLE]);
    expect(displayStage(s)).toBe('baby');
  });

  it('never shrinks back after a stage has been reached', async () => {
    const { displayStage, stageOf } = await import('./mastery');
    const s = initialState();
    masterWorld(s, [...JUNGLE]);
    s.seenStage = 'baby';
    // A run of mistakes drops measured mastery…
    for (const id of JUNGLE) for (let i = 0; i < 12; i++) recordOutcome(s, id, 1, 'incorrect', 10, 'adventure');
    expect(stageOf(s)).toBe('egg');
    // …but the dino the child sees stays a Baby Dino.
    expect(displayStage(s)).toBe('baby');
  });
});

describe('45-day schedule from Monday 12 October', () => {
  it('splits the plan into the four phases', async () => {
    const { SCHEDULE, phaseOf } = await import('./dates');
    expect(SCHEDULE.start).toBe('2026-10-12');
    expect(SCHEDULE.phase2).toBe('2026-10-20');
    expect(SCHEDULE.phase3).toBe('2026-11-06');
    expect(SCHEDULE.phase4).toBe('2026-11-17');
    expect(phaseOf('2026-10-12').phase).toBe(1);
    expect(phaseOf('2026-10-20').phase).toBe(2);
    expect(phaseOf('2026-11-06').phase).toBe(3);
    expect(phaseOf('2026-11-17').phase).toBe(4);
    expect(phaseOf('2026-11-26').phase).toBe(5);
  });

  it('moves on from a world after its share of mission days, even if not mastered', async () => {
    const { SCHEDULE, addDays } = await import('./dates');
    const { currentWorld } = await import('./mastery');
    const s = initialState();
    for (let i = 0; i < SCHEDULE.worldDays; i++)
      s.missions.push({ date: addDays('2026-10-12', i), world: 'number_jungle', seconds: 600, questions: 10, independent: 5, stars: 20 });
    expect(currentWorld(s)).toBe('volcano_valley');
  });

  it('keeps the castle closed until 5 days before the Olympiad', () => {
    const s = initialState();
    expect(isUnlocked(s, 'olympiad_castle', '2026-11-20')).toBe(false);
    expect(isUnlocked(s, 'olympiad_castle', '2026-11-21')).toBe(true);
  });
});
