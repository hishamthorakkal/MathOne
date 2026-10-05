import { DINOS } from '../engine/catalog';
import { stageOf } from '../engine/mastery';
import { useAppState } from '../engine/store';

export function useCompanion() {
  const state = useAppState();
  const info = DINOS.find((d) => d.id === state.companion) ?? DINOS[0];
  return { ...info, stage: stageOf(state), accessory: state.equipped };
}
