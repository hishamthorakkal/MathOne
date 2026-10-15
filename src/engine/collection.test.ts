import { describe, expect, it } from 'vitest';
import { awardGem, bonusProgress, buyItem, checkBonusCrystals, gemsOf, outfitOf, toggleWear } from './collection';
import { BONUS_CRYSTALS, COSMETICS } from './catalog';
import { recordOutcome } from './mastery';
import { initialState } from './store';

const master = (s: ReturnType<typeof initialState>, id: Parameters<typeof recordOutcome>[1]) => {
  for (let i = 0; i < 10; i++) recordOutcome(s, id, 3, 'independent', 10, 'adventure');
};

describe('mix-and-match wardrobe', () => {
  it('keeps an old save: the single equipped item moves into its spot and stays owned', () => {
    const s = initialState();
    s.cosmetics = ['hat', 'glasses'];
    s.equipped = 'hat';
    expect(outfitOf(s)).toEqual({ head: 'hat' });
    expect(toggleWear(s, 'glasses')).toBe(true);
    expect(outfitOf(s)).toEqual({ head: 'hat', eyes: 'glasses' });
    expect(s.cosmetics).toEqual(['hat', 'glasses']);
  });

  it('wears one item per spot at the same time, and replaces within a spot', () => {
    const s = initialState();
    s.eggs = 50;
    for (const id of ['cap', 'starshades', 'bowtie', 'jetpack']) expect(buyItem(s, id)).toBe(true);
    expect(outfitOf(s)).toEqual({ head: 'cap', eyes: 'starshades', neck: 'bowtie', back: 'jetpack' });
    buyItem(s, 'headphones');
    expect(outfitOf(s).head).toBe('headphones');
    toggleWear(s, 'headphones'); // tap again: take it off
    expect(outfitOf(s).head).toBeUndefined();
    expect(s.eggs).toBe(50 - 3 - 4 - 2 - 6 - 4);
  });

  it('cannot buy without enough eggs, twice, or the crown before Champion', () => {
    const s = initialState();
    s.eggs = 3;
    expect(buyItem(s, 'jetpack')).toBe(false);
    expect(buyItem(s, 'cap')).toBe(true);
    expect(buyItem(s, 'cap')).toBe(false);
    s.eggs = 20;
    expect(buyItem(s, 'crown')).toBe(false);
    s.seenStage = 'champion';
    expect(buyItem(s, 'crown')).toBe(true);
  });

  it('has 17 items across 4 spots', () => {
    expect(COSMETICS).toHaveLength(17);
    expect(new Set(COSMETICS.map((c) => c.slot))).toEqual(new Set(['head', 'eyes', 'neck', 'back']));
  });
});

describe('skill gems', () => {
  it('counts skills mastered before gems existed, and never takes a gem away', () => {
    const s = initialState();
    master(s, 'place_value');
    expect(gemsOf(s)).toEqual(['place_value']); // old progress shows up as a gem
    master(s, 'even_odd');
    expect(awardGem(s, 'even_odd')).toBe(true);
    for (let i = 0; i < 15; i++) recordOutcome(s, 'even_odd', 1, 'incorrect', 10, 'adventure');
    expect(gemsOf(s)).toContain('even_odd');
  });
});

describe('bonus crystals', () => {
  it('awards each crystal once with +2 eggs, from existing progress too', () => {
    const s = initialState();
    s.crystals = ['number_jungle'];
    s.badges.never_give_up = 10;
    for (let i = 0; i < 20; i++) s.days[`2026-10-${String(i + 1).padStart(2, '0')}`] = { questions: 5, seconds: 60, missions: 1, camps: 0, stars: 5 };
    const eggs = s.eggs;
    const won = checkBonusCrystals(s).map((b) => b.id);
    expect(won.sort()).toEqual(['nevergiveup', 'sunshine']);
    expect(s.eggs).toBe(eggs + 4);
    expect(checkBonusCrystals(s)).toEqual([]); // only once
    expect(s.crystals).toEqual(['number_jungle']); // world crystals untouched
    const rainbow = BONUS_CRYSTALS.find((b) => b.id === 'rainbow')!;
    expect(bonusProgress(s, rainbow)).toBeCloseTo(1 / 8);
  });
});
