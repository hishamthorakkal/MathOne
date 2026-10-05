import { describe, expect, it, vi } from 'vitest';

function fakeStorage() {
  const m = new Map<string, string>();
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
    keys: () => [...m.keys()],
    map: m,
  };
}

describe('clearProgress', () => {
  it('removes all Mathosaur data from this device and resets the state', async () => {
    const local = fakeStorage();
    const session = fakeStorage();
    const asStorage = (s: ReturnType<typeof fakeStorage>) =>
      new Proxy(s, { ownKeys: () => s.keys(), getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true }) });
    vi.stubGlobal('localStorage', asStorage(local));
    vi.stubGlobal('sessionStorage', asStorage(session));
    vi.resetModules();
    const { clearProgress, getState, update } = await import('./store');

    update((d) => {
      d.childName = 'Aarav';
      d.stars = 40;
    });
    local.setItem('mathosaur:dateOverride', '2026-11-20');
    local.setItem('other-app', 'keep me');
    session.setItem('mathosaur:parentPass', '123');
    expect(local.getItem('mathosaur:v1')).toContain('Aarav');

    clearProgress();

    expect(getState().childName).toBe('');
    expect(getState().stars).toBe(0);
    expect(local.getItem('mathosaur:v1')).toBeNull();
    expect(local.getItem('mathosaur:dateOverride')).toBeNull();
    expect(session.getItem('mathosaur:parentPass')).toBeNull();
    expect(local.getItem('other-app')).toBe('keep me');
    vi.unstubAllGlobals();
  });
});
