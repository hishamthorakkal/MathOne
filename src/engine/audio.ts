import { getState } from './store';

let ctx: AudioContext | null = null;

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.12) {
  if (!ctx) ctx = new AudioContext();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  const t0 = ctx.currentTime + start;
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(vol, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(ctx.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.05);
}

const SOUNDS = {
  correct: () => {
    tone(660, 0, 0.15);
    tone(880, 0.1, 0.25);
  },
  tap: () => tone(520, 0, 0.06, 'triangle', 0.05),
  hatch: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.25, 'triangle')),
  complete: () => [523, 659, 784, 659, 1047].forEach((f, i) => tone(f, i * 0.12, 0.3)),
  boss: () => [392, 523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.1, 0.35, 'triangle')),
};

/** Short, gentle sounds only. There is deliberately no failure sound. */
export function play(name: keyof typeof SOUNDS) {
  if (!getState().settings.sound) return;
  try {
    SOUNDS[name]();
  } catch {
    /* audio unavailable */
  }
}

export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

export function speak(text: string) {
  if (!canSpeak()) return;
  const clean = text
    .replace(/\*\*/g, '')
    .replace(/₹\s?(\d+)/g, '$1 rupees')
    .replace(/☐/g, 'box')
    .replace(/−/g, ' minus ')
    .replace(/×/g, ' times ')
    .replace(/÷/g, ' divided by ');
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(clean);
  u.rate = 0.9;
  u.pitch = 1.1;
  u.lang = 'en-IN';
  window.speechSynthesis.speak(u);
}

export const stopSpeaking = () => canSpeak() && window.speechSynthesis.cancel();
