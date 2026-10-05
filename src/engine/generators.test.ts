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

describe('IMO Class 2 syllabus alignment', () => {
  const CORE: Parameters<typeof generate>[0][] = [
    'number_names', 'place_value', 'compare_numbers', 'ordering', 'number_neighbours', 'skip_counting', 'even_odd',
    'addition_no_carry', 'addition_carry', 'subtraction_no_borrow', 'subtraction_borrow', 'missing_number_ops',
    'add_sub_word', 'repeated_addition', 'multiplication', 'equal_sharing',
  ];
  it('keeps levels 1–4 within numbers up to 100 (three digits only at level 5)', () => {
    for (const skill of CORE)
      for (const d of [1, 2, 3, 4] as Difficulty[])
        for (let i = 0; i < 200; i++) {
          const q = generate(skill, d);
          const nums = [q.prompt, q.answer, ...(q.data?.type === 'lava' ? q.data.stones.map(String) : []), ...(q.data?.type === 'match' ? q.data.pairs.flatMap((p) => [p.left, p.right]) : [])]
            .join(' ')
            .match(/\d+/g)?.map(Number) ?? [];
          expect(Math.max(0, ...nums), `${skill} d${d}: ${q.prompt} -> ${q.answer}`).toBeLessThanOrEqual(100);
        }
  });

  it('builds a 50-question mock like the sample paper', async () => {
    const { buildMock } = await import('./session');
    const m = buildMock('full');
    expect(m).toHaveLength(50);
    expect(m.filter((x) => x.section === 'Logical Reasoning')).toHaveLength(20);
    expect(m.filter((x) => x.section === 'Mathematical Reasoning')).toHaveLength(20);
    expect(m.filter((x) => x.section === 'Everyday Mathematics')).toHaveLength(10);
    for (const x of m) expect(x.q.options).toContain(x.q.answer);
  });
});

describe('anti-elimination option swap', () => {
  it('never swaps in the answer, a duplicate, or a second correct answer', async () => {
    const { replacementOption } = await import('./misconceptions');
    for (const { id } of SKILLS)
      for (const d of LEVELS)
        for (let i = 0; i < 40; i++) {
          const q = generate(id, d);
          if (!q.options.length) continue;
          const r = replacementOption(q, q.options);
          if (r == null) continue;
          expect(r).not.toBe(q.answer);
          expect(q.options).not.toContain(r);
          expect(r, `${id}: ${r}`).not.toMatch(/\b(1[3-9]|2\d) o'clock|\b0 o'clock|^0:|\b1[3-9]:\d\d/);
        }
  });
});
