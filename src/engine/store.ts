import { useSyncExternalStore } from 'react';
import { today } from './dates';
import type { AppState } from './types';

const KEY = 'mathosaur:v1';

export const initialState = (): AppState => ({
  version: 1,
  childName: '',
  createdAt: today(),
  settings: { sound: true, autoRead: true, unlockAll: false, arena: 'auto' },
  stars: 0,
  eggs: 0,
  skills: {},
  revision: {},
  attempts: [],
  days: {},
  missions: [],
  hatched: ['rexy'],
  companion: 'rexy',
  cosmetics: [],
  equipped: null,
  badges: {},
  crystals: [],
  bosses: [],
  mocks: [],
  strategies: {},
  mistakes: [],
});

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      const base = initialState();
      return { ...base, ...saved, settings: { ...base.settings, ...saved.settings } };
    }
  } catch {
    /* corrupted or unavailable storage – start fresh */
  }
  return initialState();
}

let state: AppState = load();
const listeners = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full / private mode */
  }
}

export const getState = () => state;

/** Apply a mutation to a copy of the state, persist it and notify subscribers. */
export function update(fn: (draft: AppState) => void) {
  const draft = structuredClone(state);
  fn(draft);
  state = draft;
  persist();
  listeners.forEach((l) => l());
}

export function replaceState(next: AppState) {
  state = next;
  persist();
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, getState, getState);
}
