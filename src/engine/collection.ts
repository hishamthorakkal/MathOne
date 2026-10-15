import { BONUS_CRYSTAL_EGGS, BONUS_CRYSTALS, COSMETICS, type BonusCrystal, type Cosmetic } from './catalog';
import { adventureDayCount, campsFinished, displayStage, isMastered, lifetimeEggs, stageIndex } from './mastery';
import type { AppState, Outfit, SkillId } from './types';

// ---------- Wardrobe ----------

/**
 * The outfit the dino is wearing. Saves from before mix-and-match only had a
 * single `equipped` item, so that item is put in its spot.
 */
export function outfitOf(state: AppState): Outfit {
  if (state.outfit) return state.outfit;
  const old = COSMETICS.find((c) => c.id === state.equipped);
  return old ? { [old.slot]: old.id } : {};
}

export const canWear = (state: AppState, c: Cosmetic) => !c.minStage || stageIndex(displayStage(state)) >= stageIndex(c.minStage);

/** Put an owned item on (replacing whatever is in that spot), or take it off if already worn. */
export function toggleWear(draft: AppState, id: string): boolean {
  const c = COSMETICS.find((x) => x.id === id);
  if (!c || !draft.cosmetics.includes(id) || !canWear(draft, c)) return false;
  const outfit = { ...outfitOf(draft) };
  if (outfit[c.slot] === id) delete outfit[c.slot];
  else outfit[c.slot] = id;
  draft.outfit = outfit;
  draft.equipped = null;
  return true;
}

/** Buy an item with Dino Eggs and wear it straight away. */
export function buyItem(draft: AppState, id: string): boolean {
  const c = COSMETICS.find((x) => x.id === id);
  if (!c || draft.cosmetics.includes(id) || draft.eggs < c.cost || !canWear(draft, c)) return false;
  draft.eggs -= c.cost;
  draft.cosmetics.push(id);
  draft.outfit = { ...outfitOf(draft), [c.slot]: id };
  draft.equipped = null;
  return true;
}

// ---------- Skill gems ----------

/** Gems earned so far. Includes skills mastered before gems existed. */
export function gemsOf(state: AppState): SkillId[] {
  const stored = state.gems ?? [];
  const mastered = (Object.keys(state.skills) as SkillId[]).filter((id) => isMastered(state.skills[id]));
  return [...new Set([...stored, ...mastered])];
}

/** Give a gem when a skill becomes mastered. A gem is never taken away. */
export function awardGem(draft: AppState, skill: SkillId): boolean {
  const have = gemsOf(draft);
  if (!isMastered(draft.skills[skill]) || (draft.gems ?? []).includes(skill)) {
    draft.gems = have;
    return false;
  }
  draft.gems = [...new Set([...have, skill])];
  return true;
}

// ---------- Bonus crystals ----------

const bestFullMock = (state: AppState) => Math.max(0, ...state.mocks.filter((m) => m.kind === 'full').map((m) => m.score / m.maxScore));

export function bonusProgress(state: AppState, b: BonusCrystal): number {
  const r = b.rule;
  const ratio = (have: number, need: number) => Math.max(0, Math.min(1, have / need));
  switch (r.kind) {
    case 'mock':
      return ratio(bestFullMock(state), r.score);
    case 'camps':
      return ratio(campsFinished(state), r.count);
    case 'badge':
      return ratio(state.badges[r.badge] ?? 0, r.count);
    case 'realWorld':
      return ratio(state.realWorldDone?.length ?? 0, r.count);
    case 'days':
      return ratio(adventureDayCount(state), r.count);
    case 'dinos':
      return ratio(state.hatched.length, r.count);
    case 'worldCrystals':
      return ratio(state.crystals.length, r.count);
  }
}

/** Award any bonus crystals now earned (+2 eggs each, once). Returns the newly won ones. */
export function checkBonusCrystals(draft: AppState): BonusCrystal[] {
  const have = draft.bonusCrystals ?? [];
  const won = BONUS_CRYSTALS.filter((b) => !have.includes(b.id) && bonusProgress(draft, b) >= 1);
  if (!won.length) return [];
  draft.bonusCrystals = [...have, ...won.map((b) => b.id)];
  const eggs = won.length * BONUS_CRYSTAL_EGGS;
  draft.eggsEarned = lifetimeEggs(draft) + eggs;
  draft.eggs += eggs;
  return won;
}
