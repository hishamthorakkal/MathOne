import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { stageIndex, stageOf } from '../engine/mastery';
import { update, useAppState } from '../engine/store';
import { EvolutionOverlay, growthSteps } from './Evolution';
import { useCompanion } from './useCompanion';

/** Screens where a celebration would interrupt focused work. */
const BUSY = /^\/(mission|camp|arena|parent)/;

/**
 * Plays the growth celebration once, the first time the child is on a calm
 * screen after their dino reaches a new stage.
 */
export function EvolutionWatcher() {
  const state = useAppState();
  const companion = useCompanion();
  const { pathname } = useLocation();
  const actual = stageOf(state);
  const seen = state.seenStage;

  // First visit (or progress from before this feature): remember the current
  // stage quietly rather than celebrating growth that happened earlier.
  useEffect(() => {
    if (!seen && state.childName) update((d) => void (d.seenStage = stageOf(d)));
  }, [seen, state.childName]);

  if (!seen || stageIndex(actual) <= stageIndex(seen) || BUSY.test(pathname)) return null;

  return (
    <EvolutionOverlay
      steps={growthSteps(seen, actual)}
      dino={{ species: companion.id, name: companion.name, color: companion.color, belly: companion.belly, accessory: state.equipped }}
      onDone={() => update((d) => void (d.seenStage = actual))}
    />
  );
}
