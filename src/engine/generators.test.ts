import { describe, expect, it } from 'vitest';
import { SKILLS } from './catalog';
import { generate } from './generators';
import type { Difficulty } from './types';

const LEVELS: Difficulty[] = [1, 2, 3, 4, 5];

describe('question generators', () => {
  for (const { id } of SKILLS) {
    for (const d of LEVELS) {
      for (const arena of [false, true]) {
        it(`${id} d${d}${arena ? ' arena' : ''} produces valid questions`, () => {
          for (let i = 0; i < 150; i++) {
            const q = generate(id, d, { arena });
            const ctx = `${id} d${d} ${q.game}: ${q.prompt} -> ${q.answer} [${q.options.join(' | ')}]`;
            expect(q.prompt, ctx).toBeTruthy();
            expect(q.answer, ctx).toBeTruthy();
            expect(q.steps.length, ctx).toBeGreaterThan(0);
            expect(q.prompt, ctx).not.toMatch(/NaN|undefined/);
            expect(q.options.join(), ctx).not.toMatch(/NaN|undefined/);

            if (arena) expect(['pick', 'run']).toContain(q.game);

            if (q.game === 'feed') {
              expect(q.data?.type).toBe('feed');
              if (q.data?.type === 'feed') expect(q.data.need - q.data.have, ctx).toBe(Number(q.answer));
            } else if (q.game === 'shop') {
              expect(q.data?.type).toBe('shop');
              if (q.data?.type === 'shop') expect(q.data.target, ctx).toBe(Number(q.answer));
            } else if (q.game === 'lava' || q.game === 'match') {
              expect(q.answer).toBe('done');
            } else {
              expect(q.options, ctx).toContain(q.answer);
              expect(new Set(q.options).size, ctx).toBe(q.options.length);
              expect(q.options.length, ctx).toBeGreaterThanOrEqual(q.game === 'run' ? 3 : 3);
              if (q.game === 'run') expect(q.options.length, ctx).toBe(3);
            }

            if (q.data?.type === 'match') {
              const rights = q.data.pairs.map((p) => p.right);
              expect(new Set(rights).size, ctx).toBe(rights.length);
            }
          }
        });
      }
    }
  }
});

describe('maths and language correctness', () => {
  const many = (skill: Parameters<typeof generate>[0], d: Difficulty, n = 300) => Array.from({ length: n }, () => generate(skill, d));

  it('uses correct ordinals and articles', () => {
    for (const q of many('calendar', 5)) expect(q.prompt).not.toMatch(/\b(2?[123])th\b|\b1[123](st|nd|rd)\b/);
    for (const q of [...many('solids_3d', 1), ...many('solids_3d', 2)]) expect(q.prompt).not.toMatch(/\bA \*\*[aeiou]/i);
  });

  it('never makes square-vs-rectangle ambiguous', () => {
    for (const d of LEVELS) {
      for (const q of many('shapes_2d', d)) {
        if (q.visual?.kind === 'shape' && q.visual.shape === 'square') expect(q.options).not.toContain('Rectangle');
      }
      for (const q of many('count_shapes', d)) {
        if (/rectangles/.test(q.prompt) && q.visual?.kind === 'shapes') expect(q.visual.items).not.toContain('square');
      }
    }
  });

  it('keeps multiplication to the Class 2 tables (2, 3, 4, 5, 10)', () => {
    for (const d of LEVELS)
      for (const q of many('multiplication', d)) {
        const facts = q.data?.type === 'match' ? q.data.pairs.map((p) => p.left) : [q.prompt];
        for (const f of facts) {
          const m = f.match(/(\d+) × /);
          if (m) expect([2, 3, 4, 5, 10]).toContain(Number(m[1]));
        }
      }
  });

  it('clue puzzles always need a reasoning clue', () => {
    for (const d of LEVELS)
      for (const q of many('clue_numbers', d, 100)) {
        if (q.data?.type === 'mystery') expect(q.data.clues.join(' ')).toMatch(/add up|tens digit|times table/);
      }
  });
});
