import type { Difficulty, GameData, GameType, Question, ShapeName, SkillId, Visual } from './types';

/*
 * Question generators for the IMO Class 2 syllabus.
 *
 * Range policy (from the syllabus): numbers 1–100 and two-digit addition and
 * subtraction are the core (levels 1–4). Level 5 ("Boss Puzzle") adds the
 * three-digit stretch questions that appear in the official sample paper
 * (e.g. "Two hundred five", 200 + 197, 152 − 36).
 */

// ---------- random helpers ----------
export const ri = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
export const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const sample = <T,>(arr: readonly T[], n: number) => shuffle(arr).slice(0, n);
const chance = (p: number) => Math.random() < p;

function opts(answer: string, distractors: string[], n = 4): string[] {
  const out: string[] = [];
  for (const d of distractors) if (d !== answer && !out.includes(d)) out.push(d);
  return shuffle([answer, ...out.slice(0, n - 1)]);
}

export const swapDigits = (n: number) => {
  const s = String(n);
  return s.length === 2 && s[0] !== s[1] && s[1] !== '0' ? Number(s[1] + s[0]) : n + 11;
};

function numOpts(ans: number, likelyMistakes: number[] = [], n = 4): string[] {
  // Small answers get small distractors (no "13" as an option for 2).
  const near = shuffle(ans < 10 ? [ans + 1, ans - 1, ans + 2, ans - 2, ans + 3] : [ans + 1, ans - 1, ans + 10, ans - 10, ans + 2, ans - 2, ans < 100 ? swapDigits(ans) : ans + 100]);
  return opts(
    String(ans),
    [...likelyMistakes, ...near].filter((x) => x >= 0).map(String),
    n,
  );
}

const tensOnes = (n: number) => {
  const h = Math.floor(n / 100);
  const t = Math.floor((n % 100) / 10);
  const o = n % 10;
  return h ? `${h} hundreds + ${t} tens + ${o} ones` : `${t} tens + ${o} ones`;
};

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

/** Number name in Indian school style: 205 → "two hundred five". */
export function numberWord(n: number): string {
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? `-${ONES[n % 10]}` : '');
  const h = Math.floor(n / 100);
  const rest = n % 100;
  return `${ONES[h]} hundred${rest ? ` ${numberWord(rest)}` : ''}`;
}
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

export function ord(n: number) {
  if (n % 100 >= 11 && n % 100 <= 13) return 'th';
  return n % 10 === 1 ? 'st' : n % 10 === 2 ? 'nd' : n % 10 === 3 ? 'rd' : 'th';
}

const NAMES = ['Riya', 'Aarav', 'Meera', 'Kabir', 'Zoya', 'Arjun', 'Anaya', 'Vihaan', 'Sara', 'Dev'];
const ITEMS = [
  { name: 'apples', e: '🍎' },
  { name: 'marbles', e: '🔵' },
  { name: 'stickers', e: '⭐' },
  { name: 'balloons', e: '🎈' },
  { name: 'shells', e: '🐚' },
  { name: 'berries', e: '🫐' },
];

type Draft = Omit<Question, 'id' | 'skill' | 'difficulty' | 'estSeconds' | 'options'> & {
  options?: string[];
  estSeconds?: number;
};
type Gen = (d: Difficulty, arena: boolean) => Draft;

const pickGame = (arena: boolean, g: GameType): GameType => (arena ? 'pick' : g);

/** Builds a misconception map, skipping values equal to the answer. */
function tags(answer: string, entries: [string | number, string][]): Record<string, string> {
  const m: Record<string, string> = {};
  for (const [k, v] of entries) if (String(k) !== answer) m[String(k)] = v;
  return m;
}

// =====================================================================
// Number Jungle
// =====================================================================

const numberNames: Gen = (d, arena) => {
  if (d === 4 && chance(0.4)) {
    const pairs = [
      ['forty', 'fourty'],
      ['ninety', 'ninty'],
      ['fifteen', 'fivteen'],
      ['twelve', 'twelf'],
      ['eighty', 'eighthy'],
    ];
    const [right, wrong] = pick(pairs);
    const others = sample(pairs.filter((p) => p[0] !== right).map((p) => p[1]), 2);
    return {
      game: 'pick',
      prompt: `Which number name is **spelled correctly**?`,
      answer: right,
      options: shuffle([right, wrong, ...others]),
      hint: `Say each one slowly and picture how it looks in your book.`,
      steps: [`The correct spelling is "${right}".`],
    };
  }
  let n: number;
  if (d === 1) n = ri(1, 20);
  else if (d === 2) n = ri(21, 50);
  else if (d === 3) n = ri(51, 99);
  else if (d === 4) n = pick([13, 14, 15, 16, 17, 18, 19, 30, 40, 50, 60, 70, 80, 90]);
  else n = ri(1, 9) * 100 + pick([0, ri(1, 9), ri(1, 9) * 10, ri(11, 99)]);
  const word = numberWord(n);
  const rev = n >= 10 && n < 100 ? swapDigits(n) : n + 10;
  const teenTy = n >= 13 && n <= 19 ? (n - 10) * 10 : n >= 30 && n < 100 && n % 10 === 0 ? n / 10 + 10 : null;
  const m: [number, string][] = [[rev, 'Mixed up tens and ones']];
  if (teenTy) m.push([teenTy, 'Confused “-teen” and “-ty”']);
  if (n >= 100) {
    const h = Math.floor(n / 100);
    const rest = n % 100;
    if (rest < 10) m.push([h * 100 + rest * 10, 'Put the digit in the tens place (forgot the zero)']);
    m.push([h * 10 + (rest % 10), 'Left out a place (wrote too few digits)']);
  }
  if (chance(0.5)) {
    // word → numeral
    return {
      game: pickGame(arena, n >= 100 ? 'pick' : 'run'),
      prompt: `Which number is **${cap(word)}**?`,
      answer: String(n),
      options: opts(String(n), [...m.map(([v]) => String(v)), ...numOpts(n, [], 6)]),
      hint: n >= 100 ? `“${cap(numberWord(Math.floor(n / 100)))} hundred” is ${Math.floor(n / 100)}00. Then look at what comes after.` : `Listen for the tens word first, then the ones word.`,
      steps: [`${cap(word)} = ${tensOnes(n)}`, `So the number is ${n}.`],
      mistakes: tags(String(n), m),
    };
  }
  const words = [...new Set([...m.map(([v]) => numberWord(v)), numberWord(n + 1), numberWord(Math.max(1, n - 1)), numberWord(n + 10)])];
  return {
    game: 'pick',
    prompt: `How do we write **${n}** in words?`,
    answer: word,
    options: opts(word, words),
    hint: `${n} = ${tensOnes(n)}.`,
    steps: [`${n} = ${tensOnes(n)}`, `In words: ${word}.`],
    mistakes: tags(word, m.map(([v, t]) => [numberWord(v), t])),
  };
};

const placeValue: Gen = (d, arena) => {
  const g = pickGame(arena, 'run');
  if (d === 5) {
    // three-digit stretch, as in the sample paper's abacus question
    const h = ri(1, 4);
    const t = ri(0, 8);
    const o = ri(1, 9);
    const n = h * 100 + t * 10 + o;
    if (chance(0.5)) {
      return {
        game: 'pick',
        prompt: `Look at the abacus. If **1 more bead** is added to the **tens** rod, what number will it show?`,
        answer: String(n + 10),
        options: opts(String(n + 10), [String(n + 1), String(n + 100), String(n), String(h * 1000 + (t + 1) * 10 + o)]),
        visual: { kind: 'abacus', h, t, o },
        hint: `First read the abacus: ${h} hundreds, ${t} tens, ${o} ones = ${n}. One more ten adds 10.`,
        steps: [`The abacus shows ${n}.`, `1 more ten: ${n} + 10 = ${n + 10}.`],
        mistakes: tags(String(n + 10), [
          [n + 1, 'Added the bead to the ones rod'],
          [n + 100, 'Added the bead to the hundreds rod'],
        ]),
      };
    }
    return {
      game: g,
      prompt: `**${h} hundreds + ${t} tens + ${o} ones** = ?`,
      answer: String(n),
      options: opts(String(n), [String(h * 100 + o * 10 + t), String(h + t + o), String(n + 100), String(n + 10)]),
      hint: `Write the hundreds digit, then the tens digit, then the ones digit.`,
      hintVisual: { kind: 'blocks', numbers: [n] },
      steps: [`Hundreds: ${h}, tens: ${t}, ones: ${o}`, `Number: ${n}`],
      mistakes: tags(String(n), [
        [h * 100 + o * 10 + t, 'Mixed up tens and ones'],
        [h + t + o, 'Added the digits instead of placing them'],
      ]),
    };
  }
  const n = ri(d === 1 ? 11 : 21, 99);
  const t = Math.floor(n / 10);
  const o = n % 10;
  if (o === 0 || t === o) return placeValue(d, arena);
  const kind = d === 1 ? pick(['tens', 'make']) : d === 2 ? pick(['blocks', 'value', 'make']) : d === 3 ? pick(['expanded', 'abacus', 'value']) : pick(['reversed', 'tensIn100', 'abacusMore']);
  switch (kind) {
    case 'tens':
      return {
        game: g,
        prompt: `How many **tens** are in **${n}**?`,
        answer: String(t),
        options: numOpts(t, [o, n]),
        hint: `${n} = ${tensOnes(n)}`,
        hintVisual: { kind: 'blocks', numbers: [n] },
        steps: [`Split ${n} into tens and ones.`, `${n} = ${t} tens and ${o} ones.`, `So there are ${t} tens.`],
        mistakes: tags(String(t), [[o, 'Mixed up tens and ones']]),
      };
    case 'make':
    case 'reversed': {
      const rev = kind === 'reversed';
      return {
        game: g,
        prompt: rev ? `**${o} ones** and **${t} tens** make which number?` : `**${t} tens** and **${o} ones** make which number?`,
        answer: String(n),
        options: numOpts(n, [o * 10 + t, t + o]),
        hint: `${t} tens = ${t * 10}. Then add ${o} ones.`,
        hintVisual: { kind: 'blocks', numbers: [n] },
        steps: [`${t} tens = ${t * 10}`, `${t * 10} + ${o} = ${n}`],
        mistakes: tags(String(n), [
          [o * 10 + t, 'Mixed up tens and ones'],
          [t + o, 'Added the digits instead of placing them'],
        ]),
      };
    }
    case 'blocks':
      return {
        game: 'pick',
        prompt: `What number do these blocks show?`,
        answer: String(n),
        options: numOpts(n, [o * 10 + t, t + o]),
        visual: { kind: 'blocks', numbers: [n], hideLabel: true },
        hint: `Each tall rod is 10. Each small cube is 1. Count the rods in tens: 10, 20, 30…`,
        steps: [`${t} rods = ${t * 10}`, `${o} cubes = ${o}`, `${t * 10} + ${o} = ${n}`],
        mistakes: tags(String(n), [[o * 10 + t, 'Mixed up tens and ones']]),
      };
    case 'value':
      return {
        game: g,
        prompt: `What is the **value** of **${t}** in **${n}**?`,
        answer: String(t * 10),
        options: opts(String(t * 10), [String(t), String(t * 100), String(t + 10), String(o)]),
        hint: `${t} is in the tens place, so it means ${t} tens.`,
        hintVisual: { kind: 'blocks', numbers: [n] },
        steps: [`In ${n}, ${t} is in the tens place.`, `${t} tens = ${t * 10}.`],
        mistakes: tags(String(t * 10), [[t, 'Confused the digit with its place value']]),
      };
    case 'expanded':
      return {
        game: g,
        prompt: `**${t * 10} + ${o}** = ?`,
        answer: String(n),
        options: numOpts(n, [o * 10 + t, t * 10 + o * 10]),
        hint: `${t * 10} is ${t} tens. Put ${o} in the ones place.`,
        steps: [`${t * 10} + ${o} = ${n}`],
        mistakes: tags(String(n), [[o * 10 + t, 'Mixed up tens and ones']]),
      };
    case 'abacus':
      return {
        game: 'pick',
        prompt: `What number does the abacus show?`,
        answer: String(n),
        options: numOpts(n, [o * 10 + t, t + o]),
        visual: { kind: 'abacus', h: 0, t, o },
        hint: `Beads on the T rod are tens. Beads on the O rod are ones.`,
        steps: [`T rod: ${t} beads = ${t * 10}`, `O rod: ${o} beads = ${o}`, `Number: ${n}`],
        mistakes: tags(String(n), [[o * 10 + t, 'Mixed up tens and ones']]),
      };
    case 'tensIn100':
      return {
        game: g,
        prompt: `How many **tens** make **100**?`,
        answer: '10',
        options: ['10', '100', '1', '20'],
        hint: `Count in tens: 10, 20, 30 … up to 100. How many jumps?`,
        hintVisual: { kind: 'numberline', from: 0, to: 100, step: 10 },
        steps: [`10, 20, 30, 40, 50, 60, 70, 80, 90, 100`, `That is 10 tens.`],
      };
    default: {
      // abacus + 1 more ten (two-digit version of the sample question)
      const tt = Math.min(t, 8);
      const nn = tt * 10 + o;
      return {
        game: 'pick',
        prompt: `If **1 more bead** is added to the **tens** rod, what number will the abacus show?`,
        answer: String(nn + 10),
        options: opts(String(nn + 10), [String(nn + 1), String(nn), String(nn + 11), String(nn + 100)]),
        visual: { kind: 'abacus', h: 0, t: tt, o },
        hint: `Read the abacus first: ${nn}. One more ten adds 10.`,
        steps: [`The abacus shows ${nn}.`, `${nn} + 10 = ${nn + 10}`],
        mistakes: tags(String(nn + 10), [[nn + 1, 'Added the bead to the ones rod']]),
      };
    }
  }
};

const compareNumbers: Gen = (d, arena) => {
  if (d >= 3 && chance(0.35)) {
    const a = d <= 4 ? ri(12, 98) : ri(101, 999);
    let b = chance(0.5) ? swapDigits(a) : a + pick([-10, -1, 1, 10]);
    if (b === a || b > (d <= 4 ? 99 : 999)) b = a - 1;
    const sign = a > b ? '>' : '<';
    return {
      game: pickGame(arena, 'run'),
      prompt: `Which sign goes in the box?  **${a} ☐ ${b}**`,
      answer: sign,
      options: ['>', '<', '='],
      hint: `Compare the biggest place first. The open mouth eats the bigger number.`,
      steps: [`Compare ${a} and ${b} digit by digit from the left.`, `${a} is ${a > b ? 'greater' : 'smaller'}, so ${a} ${sign} ${b}.`],
      mistakes: tags(sign, [[sign === '>' ? '<' : '>', 'Mixed up the > and < signs']]),
    };
  }
  const greatest = chance(0.5);
  let nums: number[];
  if (d === 1) nums = sample([...Array(50).keys()].map((x) => x + 1), 3);
  else if (d === 2) nums = sample([...Array(90).keys()].map((x) => x + 10), 3);
  else if (d === 3) {
    const base = ri(2, 8) * 10;
    nums = sample([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((x) => base + x), 3);
  } else if (d === 4) {
    const [x, y] = sample([1, 2, 3, 4, 5, 6, 7, 8, 9], 2);
    nums = shuffle([x * 10 + y, y * 10 + x, x * 10 + x, y * 10 + y]).slice(0, 3);
  } else {
    const ds = sample([1, 2, 3, 4, 5, 6, 7, 8, 9], 3);
    const perms = [
      [0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0],
    ].map((p) => Number(p.map((i) => ds[i]).join('')));
    nums = sample(perms, 4);
  }
  const ans = greatest ? Math.max(...nums) : Math.min(...nums);
  return {
    game: pickGame(arena, 'run'),
    prompt: `Which number is the **${greatest ? 'greatest' : 'smallest'}**?`,
    answer: String(ans),
    options: shuffle(nums.map(String)),
    hint: `Look at the ${nums[0] >= 100 ? 'hundreds' : 'tens'} digit first. The ${greatest ? 'bigger' : 'smaller'} digit wins.`,
    hintVisual: nums.every((n) => n < 100) ? { kind: 'blocks', numbers: nums.slice(0, 3) } : undefined,
    steps: [`Compare the first digits of ${nums.join(', ')}.`, `If they are the same, compare the next digit.`, `The ${greatest ? 'greatest' : 'smallest'} is ${ans}.`],
  };
};

const ordering: Gen = (d, arena) => {
  const count = d <= 2 ? 4 : 5;
  const [min, max] = d === 1 ? [1, 50] : d <= 3 ? [1, 99] : d === 4 ? [40, 70] : [100, 999];
  const set = new Set<number>();
  while (set.size < count) set.add(ri(min, max));
  const stones = [...set];
  const order: 'asc' | 'desc' = d >= 3 && chance(0.5) ? 'desc' : 'asc';
  const sorted = [...stones].sort((a, b) => (order === 'asc' ? a - b : b - a));
  const word = order === 'asc' ? 'smallest to biggest (ascending)' : 'biggest to smallest (descending)';
  if (arena) {
    const correct = sorted.join(', ');
    const swapped = [...sorted];
    [swapped[1], swapped[2]] = [swapped[2], swapped[1]];
    const swapped2 = [...sorted];
    [swapped2[0], swapped2[count - 1]] = [swapped2[count - 1], swapped2[0]];
    return {
      game: 'pick',
      prompt: `Which shows the numbers from **${word}**?`,
      answer: correct,
      options: opts(correct, [[...sorted].reverse().join(', '), swapped.join(', '), swapped2.join(', ')]),
      hint: `Find the ${order === 'asc' ? 'smallest' : 'biggest'} number first.`,
      steps: [`Start with ${sorted[0]}.`, `Then ${sorted.slice(1).join(', ')}.`],
      mistakes: tags(correct, [[[...sorted].reverse().join(', '), 'Mixed up ascending and descending']]),
    };
  }
  return {
    game: 'lava',
    prompt: `Cross the lava! Step on the stones from **${word}**.`,
    answer: 'done',
    data: { type: 'lava', stones: shuffle(stones), order },
    hint: `Find the ${order === 'asc' ? 'smallest' : 'biggest'} number first, then the next one.`,
    steps: [`The order is: ${sorted.join(' → ')}`],
  };
};

const numberNeighbours: Gen = (d, arena) => {
  if (d === 4 && chance(0.6)) {
    // "Which is the same as 5 more than 20?" (sample paper Q33)
    const a = ri(2, 8) * 10;
    const k = pick([2, 3, 5]);
    const t = a + k;
    const k2 = pick([5, 10].filter((x) => x !== k));
    const correct = `${k2} less than ${t + k2}`;
    const value = (phrase: string) => {
      const [x, dir, , y] = phrase.split(' ');
      return dir === 'less' ? Number(y) - Number(x) : Number(y) + Number(x);
    };
    const wrongs = [`${k} less than ${a}`, `${k2} more than ${t}`, `${k2} less than ${a}`, `10 more than ${a}`, `${k} more than ${t}`].filter(
      (w) => value(w) !== t,
    );
    return {
      game: 'pick',
      prompt: `Which is the same as **${k} more than ${a}**?`,
      answer: correct,
      options: opts(correct, wrongs),
      hint: `First find ${k} more than ${a}. Then check which option makes the same number.`,
      steps: [`${k} more than ${a} = ${t}`, `${correct} = ${t + k2} − ${k2} = ${t}`],
    };
  }
  const max = d <= 4 ? 99 : 999;
  const n = d === 5 ? pick([ri(101, 989), pick([99, 199, 299, 109, 190, 290]) ]) : ri(d === 1 ? 2 : 10, max - 11);
  const kind = d === 1 ? pick(['after', 'before']) : pick(['after', 'before', 'between', 'ten_more', 'ten_less']);
  if (kind === 'between' && !arena) {
    return {
      game: 'train',
      prompt: `Which number is missing from the train?`,
      answer: String(n + 1),
      options: numOpts(n + 1, [n - 1, n + 2]),
      data: { type: 'train', seq: [n - 1, n, null, n + 2] },
      hint: `Count on by 1: ${n}, …`,
      hintVisual: n < 95 ? { kind: 'numberline', from: n - 1, to: n + 2, step: 1 } : undefined,
      steps: [`The numbers go up by 1.`, `After ${n} comes ${n + 1}.`],
    };
  }
  const map = {
    after: { q: `What number comes **just after ${n}**?`, a: n + 1, h: `Count one more than ${n}.`, from: n, to: n + 1, step: 1 },
    before: { q: `What number comes **just before ${n}**?`, a: n - 1, h: `Count one less than ${n}.`, from: n, to: n - 1, step: 1 },
    between: { q: `Which number is **between ${n} and ${n + 2}**?`, a: n + 1, h: `It is one more than ${n}.`, from: n, to: n + 1, step: 1 },
    ten_more: { q: `What is **10 more than ${n}**?`, a: n + 10, h: `10 more changes only the tens digit.`, from: n, to: n + 10, step: 10 },
    ten_less: { q: `What is **10 less than ${n}**?`, a: n - 10, h: `10 less changes only the tens digit.`, from: n, to: n - 10, step: 10 },
  } as const;
  const k = map[kind as keyof typeof map];
  return {
    game: pickGame(arena, 'run'),
    prompt: k.q,
    answer: String(k.a),
    options: numOpts(k.a, kind.startsWith('ten') ? [n + 1, n - 1] : [n, n + 2, n - 2]),
    hint: k.h,
    hintVisual: n < 100 && k.a < 100 && k.a >= 0 ? { kind: 'numberline', from: k.from, to: k.to, step: k.step } : undefined,
    steps: [k.h, `The answer is ${k.a}.`],
    mistakes: tags(String(k.a), kind === 'after' ? [[n - 1, 'Counted backwards instead of forwards']] : kind === 'before' ? [[n + 1, 'Counted forwards instead of backwards']] : kind === 'ten_more' ? [[n + 1, 'Added 1 instead of 10']] : kind === 'ten_less' ? [[n - 1, 'Took away 1 instead of 10']] : []),
  };
};

const skipCounting: Gen = (d, arena) => {
  let seq: number[];
  let rule: string;
  let step = 0;
  if (d === 1) {
    step = pick([2, 5, 10]);
    const start = step * ri(0, 4);
    seq = [0, 1, 2, 3, 4].map((i) => start + i * step);
    rule = `add ${step}`;
  } else if (d === 2) {
    step = pick([2, 3, 5, 10]);
    const start = ri(1, 40);
    seq = [0, 1, 2, 3, 4].map((i) => start + i * step);
    rule = `add ${step}`;
  } else if (d <= 4) {
    step = pick(d === 3 ? [3, 4, 5, 10] : [4, 5, 10, 3]);
    const down = chance(0.5);
    const start = down ? ri(60, 99) : ri(20, 60);
    seq = [0, 1, 2, 3, 4].map((i) => (down ? start - i * step : start + i * step));
    if (down) step = -step;
    rule = step < 0 ? `take away ${-step}` : `add ${step}`;
  } else {
    // growing jumps: +1, +2, +3 …
    const start = ri(1, 10);
    const inc = ri(1, 2);
    seq = [start];
    for (let i = 1; i < 5; i++) seq.push(seq[i - 1] + i * inc);
    rule = `the jump grows by ${inc} each time`;
  }
  const missing = d === 1 ? ri(2, 4) : ri(1, 4);
  const ans = seq[missing];
  const s = seq[1] - seq[0];
  return {
    game: arena ? 'pick' : 'train',
    prompt: `Complete the number train!`,
    answer: String(ans),
    options: numOpts(ans, [ans + 1, ans - 1, ans + s, ans - s]),
    data: { type: 'train', seq: seq.map((x, i) => (i === missing ? null : x)) },
    hint: `Look at the jump between two carriages: ${rule}.`,
    hintVisual: d <= 4 && step ? { kind: 'numberline', from: seq[0], to: seq[4], step } : undefined,
    steps: [`The rule is: ${rule}.`, `So the missing number is ${ans}.`],
  };
};

const evenOdd: Gen = (d, arena) => {
  if (d === 5) {
    const a = ri(10, 60);
    const b = a + ri(6, 10);
    const evens = [];
    for (let i = a + 1; i < b; i++) if (i % 2 === 0) evens.push(i);
    return {
      game: pickGame(arena, 'run'),
      prompt: `How many **even** numbers are there **between ${a} and ${b}**?`,
      answer: String(evens.length),
      options: numOpts(evens.length, [evens.length + 1, evens.length - 1]),
      hint: `Even numbers end in 0, 2, 4, 6 or 8. "Between" means do not count ${a} and ${b}.`,
      steps: [`Numbers between ${a} and ${b}: ${a + 1} … ${b - 1}`, `Even ones: ${evens.join(', ')}`, `That is ${evens.length}.`],
      hots: true,
      mistakes: tags(String(evens.length), [[evens.length + 1, 'Counted the end numbers too ("between" excludes them)']]),
    };
  }
  if (d === 4) {
    // Lucky-draw tickets (sample paper Q19): two conditions at once.
    const wantEven = chance(0.5);
    const color = pick(['Green', 'Blue']);
    const other = color === 'Green' ? 'Blue' : 'Green';
    const sq = (c: string) => (c === 'Green' ? '🟩' : '🟦');
    const num = (even: boolean) => {
      let n = ri(11, 98);
      if ((n % 2 === 0) !== even) n += 1;
      return n;
    };
    const win = `${sq(color)} ${color} ${num(wantEven)}`;
    const wrongs = [`${sq(other)} ${other} ${num(wantEven)}`, `${sq(color)} ${color} ${num(!wantEven)}`, `${sq(color)} ${color} ${num(!wantEven)}`];
    return {
      game: 'pick',
      prompt: `The winning ticket is **${color}** and has an **${wantEven ? 'even' : 'odd'}** number. Which ticket wins?`,
      answer: win,
      options: opts(win, wrongs),
      hint: `Check BOTH rules for each ticket: the colour AND ${wantEven ? 'even' : 'odd'}.`,
      steps: [`Only ${win} is ${color} and ${wantEven ? 'even' : 'odd'}.`],
      hots: true,
      mistakes: tags(win, [[wrongs[0], 'Checked only the number, not the colour'], [wrongs[1], 'Checked only the colour, not even/odd'], [wrongs[2], 'Checked only the colour, not even/odd']]),
    };
  }
  const wantEven = chance(0.5);
  const max = d === 1 ? 20 : 99;
  let target = ri(2, max);
  if ((target % 2 === 0) !== wantEven) target += 1;
  const others = new Set<number>();
  while (others.size < 3) {
    let n = ri(2, max);
    if ((n % 2 === 0) === wantEven) n += 1;
    if (n !== target) others.add(n);
  }
  return {
    game: pickGame(arena, 'run'),
    prompt: `Which number is **${wantEven ? 'even' : 'odd'}**?`,
    answer: String(target),
    options: shuffle([String(target), ...[...others].map(String)]),
    hint: `Look only at the ones digit. Even numbers end in 0, 2, 4, 6, 8.`,
    hintVisual: d === 1 ? { kind: 'objects', parts: [{ n: Math.min(target, 20), icon: '🟡' }] } : undefined,
    steps: [`Check the last digit of each number.`, `${target} ends in ${target % 10}, so it is ${wantEven ? 'even' : 'odd'}.`],
  };
};

// =====================================================================
// Volcano Valley
// =====================================================================

function addPair(d: Difficulty, carry: boolean): [number, number] {
  for (let tries = 0; tries < 300; tries++) {
    let a: number, b: number;
    if (d === 1) [a, b] = carry ? [ri(5, 9), ri(5, 9)] : [ri(1, 6), ri(1, 4)];
    else if (d === 2) [a, b] = [ri(11, 89), ri(1, 9)];
    else if (d === 3) [a, b] = [ri(11, 59), ri(11, 39)];
    else if (d === 4) [a, b] = [ri(25, 69), ri(15, 49)];
    else [a, b] = [ri(100, 399), ri(11, 299)];
    const hasCarry = (a % 10) + (b % 10) >= 10 || (Math.floor(a / 10) % 10) + (Math.floor(b / 10) % 10) >= 10;
    const limit = d <= 4 ? 100 : 1000;
    if (hasCarry === carry && a + b < limit) return [a, b];
  }
  return carry ? [36, 27] : [23, 14];
}

function subPair(d: Difficulty, borrow: boolean): [number, number] {
  for (let tries = 0; tries < 300; tries++) {
    let a: number, b: number;
    if (d === 1) [a, b] = borrow ? [ri(11, 18), ri(3, 9)] : [ri(5, 9), ri(1, 4)];
    else if (d === 2) [a, b] = [ri(20, 99), ri(1, 9)];
    else if (d === 3) [a, b] = [ri(30, 99), ri(11, 29)];
    else if (d === 4) [a, b] = [ri(40, 99), ri(15, 59)];
    else [a, b] = [ri(100, 200), ri(11, 99)];
    if (b >= a) continue;
    const needs = a % 10 < b % 10 || Math.floor(a / 10) % 10 < Math.floor(b / 10) % 10;
    if (needs === borrow) return [a, b];
  }
  return borrow ? [52, 27] : [58, 23];
}

/** Egg Match variant: match three or four sums/differences to their answers. */
function opMatch(d: Difficulty, op: '+' | '−', carry: boolean): Draft {
  const pairs: { left: string; right: string }[] = [];
  const used = new Set<number>();
  for (let guard = 0; pairs.length < (d <= 2 ? 3 : 4) && guard < 200; guard++) {
    const [a, b] = op === '+' ? addPair(d, carry) : subPair(d, carry);
    const r = op === '+' ? a + b : a - b;
    if (used.has(r)) continue;
    used.add(r);
    pairs.push({ left: `${a} ${op} ${b}`, right: String(r) });
  }
  return {
    game: 'match',
    prompt: `Match each egg to its nest!`,
    answer: 'done',
    options: [],
    data: { type: 'match', pairs },
    hint: op === '+' ? `Add the ones first, then the tens.` : `Subtract the ones first, then the tens.`,
    steps: pairs.map((p) => `${p.left} = ${p.right}`),
  };
}

const placewise = (a: number, b: number, f: (x: number, y: number) => number) =>
  Number(
    String(a)
      .padStart(3, '0')
      .split('')
      .map((x, i) => f(Number(x), Number(String(b).padStart(3, '0')[i])))
      .join(''),
  );

function additionQ(d: Difficulty, arena: boolean, carry: boolean): Draft {
  if (!arena && d >= 2 && d <= 3 && chance(0.25)) return opMatch(d, '+', carry);
  const [a, b] = addPair(d, carry);
  const s = a + b;
  const noCarry = placewise(a, b, (x, y) => (x + y) % 10);
  const onesSum = (a % 10) + (b % 10);
  const story = !arena && chance(0.4) && d >= 2 && b > 1;
  const it = pick(ITEMS);
  const fruit = pick([['green grapes', 'black grapes', 'grapes'], ['red beads', 'blue beads', 'beads'], ['big shells', 'small shells', 'shells']]);
  return {
    game: pickGame(arena, 'run'),
    prompt: story
      ? chance(0.5)
        ? `I counted **${a} ${fruit[0]}** and **${b} ${fruit[1]}**. Together, how many ${fruit[2]}?`
        : `Dino collected **${a} ${it.name}** and found **${b} more**. How many now?`
      : `Which stone is **${a} + ${b}**?`,
    answer: String(s),
    options: numOpts(s, carry ? [noCarry, s - 10] : [s + 10]),
    // Level 1: start concrete with pictures; pictures fade out at higher levels.
    visual: d === 1 && !arena ? { kind: 'objects', parts: [{ n: a, icon: it.e }, { n: b, icon: it.e }], op: '+' } : undefined,
    hint: a >= 10 ? `${a} = ${tensOnes(a)}\n${b} = ${tensOnes(b)}` : `Start at ${a} and count on ${b}.`,
    hintVisual: a >= 10 ? { kind: 'blocks', numbers: [a, b] } : { kind: 'numberline', from: a, to: s, step: 1 },
    steps:
      a >= 10
        ? [
            `Add the ones: ${a % 10} + ${b % 10} = ${onesSum}${onesSum >= 10 ? ` → write ${onesSum % 10}, carry 1 ten` : ''}.`,
            `Add the tens${onesSum >= 10 ? ' (plus the carried 1)' : ''}.`,
            `${a} + ${b} = ${s}`,
          ]
        : [`Start at ${a}.`, `Count on ${b}: ${[...Array(b).keys()].map((i) => a + i + 1).join(', ')}.`, `${a} + ${b} = ${s}`],
    mistakes: tags(String(s), carry ? [[noCarry, 'Forgot to carry the ten']] : []),
  };
}

function subtractionQ(d: Difficulty, arena: boolean, borrow: boolean): Draft {
  if (!arena && d >= 2 && d <= 3 && chance(0.2)) return opMatch(d, '−', borrow);
  if (!borrow && d >= 2 && d <= 3 && chance(0.25)) {
    // Number-line jumps → number sentence (sample paper Q36)
    const start = ri(8, 15);
    const jumps = ri(3, Math.min(6, start - 1));
    const correct = `${start} − ${jumps} = ${start - jumps}`;
    const animal = pick(['rabbit 🐇', 'frog 🐸', 'kangaroo 🦘']);
    return {
      game: 'pick',
      prompt: `A **${animal.split(' ')[0]}** sat on **${start}**. It jumped back **${jumps}** times to reach **${start - jumps}**. Which number sentence shows this?`,
      answer: correct,
      options: opts(correct, [`${start} + ${jumps} = ${start + jumps}`, `${jumps} + 0 = ${jumps}`, `${start - jumps} − ${start - jumps} = 0`]),
      visual: { kind: 'numberline', from: start, to: start - jumps, step: 1 },
      hint: `Jumping back on a number line means taking away.`,
      steps: [`It started at ${start}.`, `${jumps} jumps back = take away ${jumps}.`, correct],
      mistakes: tags(correct, [[`${start} + ${jumps} = ${start + jumps}`, 'Read jumping back as adding']]),
    };
  }
  const [a, b] = subPair(d, borrow);
  const diff = a - b;
  const mistake = placewise(a, b, (x, y) => Math.abs(x - y));
  const story = !arena && chance(0.4) && d >= 2;
  const it = pick(ITEMS);
  return {
    game: pickGame(arena, 'run'),
    prompt: story
      ? d === 5
        ? `My story book has **${a} pages**. I have read **${b} pages**. How many pages are left?`
        : `Dino had **${a} ${it.name}** and gave away **${b}**. How many are left?`
      : `Which stone is **${a} − ${b}**?`,
    answer: String(diff),
    options: numOpts(diff, borrow ? [mistake, diff + 10] : [a + b, diff - 10]),
    visual: d === 1 && !arena ? { kind: 'objects', parts: [{ n: a, icon: it.e, crossed: b }], op: '−' } : undefined,
    hint: a >= 20 ? `${a} = ${tensOnes(a)}\nTake away ${b}.` : `Start at ${a} and count back ${b}.`,
    hintVisual: borrow && a >= 20 ? { kind: 'regroup', n: a } : a < 20 ? { kind: 'numberline', from: a, to: diff, step: 1 } : { kind: 'blocks', numbers: [a] },
    steps:
      a % 10 < b % 10
        ? [
            `Ones: ${a % 10} is smaller than ${b % 10}, so break 1 ten into 10 ones → ${(a % 10) + 10} ones.`,
            `${(a % 10) + 10} − ${b % 10} = ${(a % 10) + 10 - (b % 10)}`,
            `Now subtract the tens (one ten was used).`,
            `${a} − ${b} = ${diff}`,
          ]
        : [`Subtract the ones: ${a % 10} − ${b % 10} = ${(a % 10) - (b % 10)}`, `Subtract the tens.`, `${a} − ${b} = ${diff}`],
    mistakes: tags(String(diff), [
      ...(borrow ? ([[mistake, 'Took the smaller digit from the bigger one (did not borrow)']] as [number, string][]) : []),
      [a + b, 'Added instead of subtracting'],
    ]),
  };
}

const missingNumberOps: Gen = (d, arena) => {
  if (d <= 2 && !arena) {
    const need = d === 1 ? ri(5, 10) : ri(11, 20);
    const have = ri(Math.max(1, need - (d === 1 ? 6 : 12)), need - 2);
    const it = pick(ITEMS.filter((x) => x.name !== 'marbles'));
    return {
      game: 'feed',
      prompt: `Dino needs **${need} ${it.name}**. It already has **${have}**. Give Dino the rest!`,
      answer: String(need - have),
      options: [],
      data: { type: 'feed', need, have, item: it.e },
      hint: `Count on from ${have} until you reach ${need}.`,
      hintVisual: { kind: 'numberline', from: have, to: need, step: 1 },
      steps: [`${have} + ? = ${need}`, `${need} − ${have} = ${need - have}`, `Dino needs ${need - have} more.`],
    };
  }
  if (d >= 4 && chance(0.45)) {
    // Missing digit (sample paper Q34: 200 + 197 = 39X)
    const [a, b] = d === 4 ? addPair(4, chance(0.5)) : [ri(1, 3) * 100, ri(101, 199)];
    const s = a + b;
    const sStr = String(s);
    const pos = sStr.length - 1 - (d === 4 ? ri(0, 1) : 0);
    const digit = sStr[pos];
    const shown = sStr.slice(0, pos) + '☐' + sStr.slice(pos + 1);
    return {
      game: pickGame(arena, 'run'),
      prompt: `**${a} + ${b} = ${shown}**. Which digit goes in the box?`,
      answer: digit,
      options: opts(digit, [String((Number(digit) + 1) % 10), String((Number(digit) + 9) % 10), String((Number(digit) + 2) % 10), '0']),
      hint: `Add ${a} + ${b} fully, then match it to ${shown}.`,
      steps: [`${a} + ${b} = ${s}`, `So the box is ${digit}.`],
      hots: true,
    };
  }
  const plus = chance(0.6);
  const a = d === 5 ? ri(110, 300) : ri(12, 60);
  const x = d === 5 ? ri(15, 99) : ri(8, 35);
  if (plus) {
    const total = a + x;
    return {
      game: pickGame(arena, 'run'),
      prompt: `**${a} + ☐ = ${total}**. What is in the box?`,
      answer: String(x),
      options: numOpts(x, [total + a, x + 10]),
      hint: `Think: what do I add to ${a} to make ${total}? Try ${total} − ${a}.`,
      hintVisual: total < 100 ? { kind: 'numberline', from: a, to: total, step: Math.max(1, Math.floor(x / 10) * 10 === x ? 10 : 1) } : undefined,
      steps: [`☐ = ${total} − ${a}`, `☐ = ${x}`, `Check: ${a} + ${x} = ${total} ✔`],
      hots: d >= 4,
      mistakes: tags(String(x), [[total + a, 'Added instead of finding the difference']]),
    };
  }
  const start = a + x;
  return {
    game: pickGame(arena, 'run'),
    prompt: `**☐ − ${x} = ${a}**. What is in the box?`,
    answer: String(start),
    options: numOpts(start, [Math.abs(a - x), start + 10]),
    hint: `Work backwards: put back the ${x} you took away. ${a} + ${x} = ?`,
    steps: [`☐ = ${a} + ${x}`, `☐ = ${start}`, `Check: ${start} − ${x} = ${a} ✔`],
    hots: d >= 4,
    mistakes: tags(String(start), [[Math.abs(a - x), 'Subtracted instead of working backwards']]),
  };
};

const addSubWord: Gen = (d, arena) => {
  const name = pick(NAMES);
  const max = d <= 2 ? 20 : d <= 4 ? 99 : 200;
  const kind = d <= 2 ? pick(['more', 'less']) : pick(['more', 'less', 'compare', 'money', 'older', 'taller']);
  const b = ri(2, Math.floor(max / 3));
  // Keep sums within the level's range (two digits up to level 4).
  const a = ri(Math.ceil(max / 3), max - b);
  const it = pick(ITEMS);
  let prompt: string;
  let ans: number;
  let unit = '';
  let steps: string[];
  let opposite: number;
  if (kind === 'more') {
    prompt = `${name} has **${a} ${it.name}** and gets **${b} more**. How many ${it.name} now?`;
    ans = a + b;
    opposite = a - b;
    steps = [`"More" means add.`, `${a} + ${b} = ${ans}`];
  } else if (kind === 'less') {
    prompt = `${name} has **${a} ${it.name}** and gives away **${b}**. How many are left?`;
    ans = a - b;
    opposite = a + b;
    steps = [`"Gives away" means subtract.`, `${a} − ${b} = ${ans}`];
  } else if (kind === 'compare') {
    const other = pick(NAMES.filter((n) => n !== name));
    prompt = `${name} has **${a} ${it.name}**. ${other} has **${b}**. How many **more** does ${name} have?`;
    ans = a - b;
    opposite = a + b;
    steps = [`"How many more" means find the difference.`, `${a} − ${b} = ${ans}`];
  } else if (kind === 'money') {
    prompt = `${name} has **₹${a}** and gets **₹${b} more**. How much money now?`;
    ans = a + b;
    opposite = a - b;
    unit = '₹';
    steps = [`Add the money.`, `₹${a} + ₹${b} = ₹${ans}`];
  } else if (kind === 'older') {
    const age = ri(6, 9);
    const gap = ri(20, 35);
    prompt = `${name} is **${age} years** old. ${name}’s father is **${gap} years older**. How old is the father?`;
    ans = age + gap;
    opposite = gap - age;
    steps = [`"Older" means add the years.`, `${age} + ${gap} = ${ans}`];
  } else {
    const h = ri(10, 40);
    const more = ri(3, 15);
    prompt = `Manav’s plant is **${more} cm taller** than Manali’s plant. Manali’s plant is **${h} cm**. How tall is Manav’s plant?`;
    ans = h + more;
    opposite = h - more;
    unit = ' cm';
    steps = [`"Taller" means add.`, `${h} + ${more} = ${ans} cm`];
  }
  const fmt = (n: number) => (unit === '₹' ? `₹${n}` : unit ? `${n}${unit}` : String(n));
  return {
    game: pickGame(arena, 'run'),
    prompt,
    answer: fmt(ans),
    options: opts(fmt(ans), shuffle([opposite, ans + 10, ans - 1, ans + 1, ans - 10]).filter((x) => x >= 0).map(fmt)),
    hint: `Find the key words. Do we put together (add) or take away (subtract)?`,
    steps,
    mistakes: tags(fmt(ans), [[fmt(opposite), ans > opposite ? 'Subtracted when it should add' : 'Added when it should subtract']]),
  };
};

// =====================================================================
// Dino Nest – counting in groups, multiplication, division
// =====================================================================

const repeatedAddition: Gen = (d, arena) => {
  if (d === 5) {
    const per = pick([2, 3, 4]);
    const groups = ri(11, per === 2 ? 25 : 15);
    const ctx = pick([
      [`Sonia counted **${groups} umbrellas**. There were **${per} children** under each umbrella. How many children in all?`, 'children'],
      [`There are **${groups} boxes** with **${per} pencils** in each. How many pencils in all?`, 'pencils'],
    ]);
    return {
      game: pickGame(arena, 'run'),
      prompt: ctx[0],
      answer: String(groups * per),
      options: numOpts(groups * per, [groups + per, groups * per + per]),
      hint: `${per} in each group, ${groups} groups: count in ${per}s, or add ${groups} ${per} times.`,
      steps: [`${groups} × ${per} = ${Array(per).fill(groups).join(' + ')}`, `= ${groups * per} ${ctx[1]}`],
      hots: true,
      mistakes: tags(String(groups * per), [[groups + per, 'Added the numbers instead of counting in groups']]),
    };
  }
  const groups = d <= 2 ? ri(2, 4) : ri(3, 6);
  const each = d === 1 ? ri(2, 3) : d <= 3 ? ri(2, 5) : ri(3, 10);
  const total = groups * each;
  const icon = pick(['🥚', '🍎', '⭐', '🌸']);
  if (d >= 3 && chance(0.5)) {
    const expr = Array(groups).fill(each).join(' + ');
    const ans = `${groups} × ${each}`;
    return {
      game: pickGame(arena, 'run'),
      prompt: `Which is the same as **${expr}**?`,
      answer: ans,
      options: opts(ans, [`${groups} + ${each}`, `${each} × ${each}`, `${groups} × ${groups}`, `${groups + 1} × ${each}`]),
      visual: { kind: 'groups', groups, each, icon },
      hint: `Count how many times ${each} is added.`,
      steps: [`${each} is added ${groups} times.`, `${groups} groups of ${each} = ${groups} × ${each}.`],
      mistakes: tags(ans, [[`${groups} + ${each}`, 'Added instead of multiplying']]),
    };
  }
  if (d === 4 && chance(0.5)) {
    const animal = pick(['cats 🐈', 'puppies 🐶', 'calves 🐄']);
    return {
      game: pickGame(arena, 'run'),
      prompt: `There are **${groups} ${animal.split(' ')[0]}**. Each drank **${each} bottles** of milk. How many bottles in all?`,
      answer: String(total),
      options: numOpts(total, [groups + each, total + 10]),
      visual: { kind: 'groups', groups, each, icon: '🍼' },
      hint: `${groups} groups of ${each}.`,
      steps: [`${Array(groups).fill(each).join(' + ')} = ${total}`],
      mistakes: tags(String(total), [[groups + each, 'Added the numbers instead of counting in groups']]),
    };
  }
  return {
    game: pickGame(arena, 'pick'),
    prompt: `There are **${groups} nests** with **${each} ${icon}** in each. How many ${icon} in all?`,
    answer: String(total),
    options: numOpts(total, [groups + each, total + each, total - each]),
    visual: { kind: 'groups', groups, each, icon },
    hint: `Add ${each} again and again: ${Array(groups).fill(each).join(' + ')}`,
    steps: [`${Array(groups).fill(each).join(' + ')}`, `= ${total}`],
    mistakes: tags(String(total), [[groups + each, 'Added the numbers instead of counting in groups']]),
  };
};

const TABLES = [2, 3, 4, 5, 10]; // Class 2 syllabus tables

const multiplication: Gen = (d, arena) => {
  const tables = d === 1 ? [2, 10] : d === 2 ? [2, 5, 10] : TABLES;
  const maxB = d <= 2 ? 5 : 10;
  if (!arena && d <= 4 && chance(0.35)) {
    const pairs: { left: string; right: string }[] = [];
    const used = new Set<number>();
    let guard = 0;
    while (pairs.length < (d <= 2 ? 3 : 4) && guard++ < 100) {
      const t = pick(tables);
      const b = ri(1, maxB);
      if (used.has(t * b)) continue;
      used.add(t * b);
      pairs.push({ left: `${t} × ${b}`, right: String(t * b) });
    }
    return {
      game: 'match',
      prompt: `Match each egg to its nest!`,
      answer: 'done',
      options: [],
      data: { type: 'match', pairs },
      hint: `Multiplying is adding the same number again. 3 × 4 = 4 + 4 + 4.`,
      steps: pairs.map((p) => `${p.left} = ${p.right}`),
    };
  }
  const t = pick(tables);
  const b = ri(1, maxB);
  if (d === 5 && chance(0.6)) {
    return {
      game: pickGame(arena, 'run'),
      prompt: `**${t} × ☐ = ${t * b}**. What is in the box?`,
      answer: String(b),
      options: numOpts(b, [t * b - t, b + 1, t]),
      hint: `Count in ${t}s until you reach ${t * b}.`,
      hintVisual: { kind: 'numberline', from: 0, to: t * b, step: t },
      steps: [`Count in ${t}s: ${[...Array(b).keys()].map((i) => t * (i + 1)).join(', ')}`, `That is ${b} jumps, so ☐ = ${b}.`],
      hots: true,
    };
  }
  return {
    game: pickGame(arena, 'run'),
    prompt: `Which stone is **${t} × ${b}**?`,
    answer: String(t * b),
    options: numOpts(t * b, [t + b, t * b + t, t * b - t]),
    hint: `${t} × ${b} means ${b} groups of ${t}.`,
    hintVisual: t * b <= 50 ? { kind: 'groups', groups: b, each: t, icon: '🥚' } : { kind: 'numberline', from: 0, to: t * b, step: t },
    steps: [`${Array(b).fill(t).join(' + ')}`, `= ${t * b}`],
    mistakes: tags(String(t * b), [
      [t + b, 'Added instead of multiplying'],
      [t * b + t, 'Counted one group too many'],
      [t * b - t, 'Counted one group too few'],
    ]),
  };
};

const equalSharing: Gen = (d, arena) => {
  const groups = d <= 2 ? pick([2, 3]) : ri(2, 5);
  const each = d === 1 ? ri(2, 4) : d <= 3 ? ri(2, 6) : ri(3, 10);
  const total = groups * each;
  const name = pick(NAMES);
  const icon = pick(['🥚', '🍪', '🍬', '🍎']);
  if (d === 4 && chance(0.5)) {
    // Share of two friends together (sample paper Q26)
    const g = ri(3, 5);
    const e = ri(2, 5);
    const ans = 2 * e;
    return {
      game: pickGame(arena, 'run'),
      prompt: `**${g * e} ${icon}** are shared equally among **${g} friends**. How many do **2 friends get together**?`,
      answer: String(ans),
      options: numOpts(ans, [e, g * e - e, ans + 1]),
      hintVisual: { kind: 'groups', groups: g, each: e, icon },
      hint: `First find one friend's share. Then double it.`,
      steps: [`One friend: ${g * e} ÷ ${g} = ${e}`, `Two friends: ${e} + ${e} = ${ans}`],
      hots: true,
      mistakes: tags(String(ans), [[e, 'Found one share but not two']]),
    };
  }
  if (d === 5 && chance(0.5)) {
    return {
      game: pickGame(arena, 'run'),
      prompt: `${name} shares some ${icon} equally among **${groups} friends**. Each friend gets **${each}**. How many ${icon} were there?`,
      answer: String(total),
      options: numOpts(total, [groups + each, total + each]),
      hint: `Work backwards: ${groups} friends × ${each} each.`,
      hintVisual: { kind: 'groups', groups, each, icon },
      steps: [`${groups} groups of ${each}`, `${groups} × ${each} = ${total}`],
      hots: true,
      mistakes: tags(String(total), [[groups + each, 'Added instead of multiplying']]),
    };
  }
  return {
    game: pickGame(arena, 'pick'),
    prompt: `Share **${total} ${icon}** equally among **${groups} friends**. How many does each friend get?`,
    answer: String(each),
    options: numOpts(each, [total - groups, groups, each + 1]),
    visual: total <= 30 ? { kind: 'emoji', text: icon.repeat(total) } : undefined,
    hint: `Give one to each friend, again and again, until none are left.`,
    hintVisual: { kind: 'groups', groups, each, icon },
    steps: [`Think: ${groups} × ? = ${total}`, `${groups} × ${each} = ${total}`, `So each friend gets ${each}.`],
    mistakes: tags(String(each), [
      [total - groups, 'Subtracted instead of sharing'],
      [groups, 'Gave the number of friends, not the share'],
    ]),
  };
};

// =====================================================================
// Shape Caves
// =====================================================================

const SHAPES: Record<ShapeName, { sides: number; corners: number; name: string }> = {
  circle: { sides: 0, corners: 0, name: 'Circle' },
  oval: { sides: 0, corners: 0, name: 'Oval' },
  triangle: { sides: 3, corners: 3, name: 'Triangle' },
  square: { sides: 4, corners: 4, name: 'Square' },
  rectangle: { sides: 4, corners: 4, name: 'Rectangle' },
  pentagon: { sides: 5, corners: 5, name: 'Pentagon' },
  hexagon: { sides: 6, corners: 6, name: 'Hexagon' },
};

const shapes2d: Gen = (d, arena) => {
  const pool: ShapeName[] =
    d <= 2 ? ['circle', 'triangle', 'square', 'rectangle'] : ['triangle', 'square', 'rectangle', 'pentagon', 'hexagon', 'circle', 'oval'];
  const s = pick(pool);
  const info = SHAPES[s];
  if (d >= 4 && chance(0.5)) {
    const n = pick([3, 5, 6]);
    const target = (Object.keys(SHAPES) as ShapeName[]).find((k) => SHAPES[k].sides === n)!;
    return {
      game: pickGame(arena, 'run'),
      prompt: `Which shape has **${n} sides** and **${n} corners**?`,
      answer: SHAPES[target].name,
      options: opts(SHAPES[target].name, shuffle(['Triangle', 'Square', 'Pentagon', 'Hexagon', 'Circle'])),
      hint: `Tri = 3, Penta = 5, Hexa = 6.`,
      steps: [`A shape with ${n} sides is a ${SHAPES[target].name}.`],
    };
  }
  const ask = info.sides === 0 || d === 1 ? 'name' : pick(['sides', 'corners', 'name']);
  if (ask === 'name') {
    // A square is also a rectangle, so never offer "Rectangle" for a square.
    const names = pool.filter((p) => !(s === 'square' && p === 'rectangle')).map((p) => SHAPES[p].name);
    return {
      game: 'pick',
      prompt: `What is this shape called?`,
      answer: info.name,
      options: opts(info.name, shuffle(names)),
      visual: { kind: 'shape', shape: s },
      hint: info.sides ? `Count its sides: it has ${info.sides}.` : `It has no corners at all.`,
      steps: [`It has ${info.sides} sides and ${info.corners} corners.`, `It is a ${info.name}.`],
    };
  }
  const ans = ask === 'sides' ? info.sides : info.corners;
  return {
    game: 'pick',
    prompt: `How many **${ask}** does this shape have?`,
    answer: String(ans),
    options: opts(String(ans), shuffle([ans - 1, ans + 1, ans + 2, 0].filter((x) => x >= 0).map(String))),
    visual: { kind: 'shape', shape: s },
    hint: ask === 'sides' ? `Run your finger along each straight edge and count.` : `Corners are where two sides meet. Count the points.`,
    steps: [`A ${info.name} has ${info.sides} sides and ${info.corners} corners.`],
  };
};

const SOLIDS = [
  { solid: 'Sphere', objects: ['⚽ football', '🌍 globe', '🏀 basketball'] },
  { solid: 'Cube', objects: ['🎲 dice', '🧊 ice cube'] },
  { solid: 'Cone', objects: ['🍦 ice-cream cone', '🎉 party hat'] },
  { solid: 'Cylinder', objects: ['🥫 tin can', '🥁 drum', '🕯️ candle'] },
  { solid: 'Cuboid', objects: ['🧱 brick', '📦 box', '📚 book'] },
];

const solids3d: Gen = (d, arena) => {
  if (d >= 3 && chance(0.6)) {
    const facts = [
      { q: 'Which solid can **roll and slide**?', a: 'Cylinder', o: ['Cylinder', 'Cube', 'Sphere', 'Cuboid'], h: 'It has flat faces at the ends and a curved side, like a can.' },
      { q: 'Which solid has **no flat face**?', a: 'Sphere', o: ['Sphere', 'Cube', 'Cone', 'Cylinder'], h: 'It is perfectly round all over, like a ball.' },
      { q: 'Sonika puts **square cards** one over the other. Which solid does she get?', a: 'Cuboid', o: ['Cuboid', 'Cone', 'Sphere', 'Cylinder'], h: 'A pile of flat squares makes a box shape.' },
      { q: 'Which solid would you use to **trace a square**?', a: 'Cube', o: ['Cube', 'Cylinder', 'Cone', 'Sphere'], h: 'Look for a solid whose faces are all squares.' },
      { q: 'Which solid would you use to **trace a circle**?', a: 'Cylinder', o: ['Cylinder', 'Cube', 'Cuboid', 'Sphere'], h: 'Its flat ends are circles.' },
      { q: 'How many **faces** does a **cube** have?', a: '6', o: ['4', '6', '8', '12'], h: 'Think of a dice: count the faces 1 to 6.' },
      { q: 'Which solid has **only one** flat face?', a: 'Cone', o: ['Cone', 'Cylinder', 'Cube', 'Sphere'], h: 'Think of an ice-cream cone.' },
    ];
    const f = pick(facts.slice(0, d === 3 ? 5 : facts.length));
    return {
      game: pickGame(arena, 'run'),
      prompt: f.q,
      answer: f.a,
      options: shuffle(f.o),
      hint: f.h,
      steps: [f.h, `The answer is ${f.a}.`],
      hots: d >= 4,
    };
  }
  const s = pick(SOLIDS);
  const obj = pick(s.objects);
  const [emoji, ...rest] = obj.split(' ');
  const thing = rest.join(' ');
  return {
    game: 'pick',
    prompt: `${/^[aeiou]/i.test(thing) ? 'An' : 'A'} **${thing}** is shaped like a…`,
    answer: s.solid,
    options: opts(s.solid, shuffle(SOLIDS.map((x) => x.solid))),
    visual: { kind: 'emoji', text: emoji },
    hint: `Is it round? Does it have flat faces? Does it have a point?`,
    steps: [`A ${thing} looks like a ${s.solid}.`],
  };
};

const countShapes: Gen = (d, _arena) => {
  const pool: ShapeName[] = d <= 2 ? ['circle', 'triangle', 'square'] : ['circle', 'triangle', 'square', 'rectangle', 'hexagon', 'oval'];
  const total = d <= 2 ? ri(5, 7) : d === 3 ? ri(7, 9) : ri(9, 12);
  const items = Array.from({ length: total }, () => pick(pool));
  if (d >= 3 && chance(0.4)) {
    // Difference between two kinds (sample paper Q39)
    const [x, y] = sample(['triangle', 'circle', 'square'] as ShapeName[], 2);
    if (!items.includes(x)) items[0] = x;
    if (!items.includes(y)) items[1] = y;
    const nx = items.filter((i) => i === x).length;
    const ny = items.filter((i) => i === y).length;
    if (nx === ny) items[items.indexOf(y)] = x;
    const cx = items.filter((i) => i === x).length;
    const cy = items.filter((i) => i === y).length;
    const diff = Math.abs(cx - cy);
    return {
      game: 'pick',
      prompt: `What is the **difference** between the number of **${x}s** and **${y}s**?`,
      answer: String(diff),
      options: numOpts(diff, [cx + cy, cx, cy].filter((v) => v !== diff)),
      visual: { kind: 'shapes', items },
      hint: `Count the ${x}s. Count the ${y}s. Then take the smaller from the bigger.`,
      steps: [`${x}s: ${cx}`, `${y}s: ${cy}`, `Difference: ${Math.max(cx, cy)} − ${Math.min(cx, cy)} = ${diff}`],
      hots: true,
      mistakes: tags(String(diff), [[cx + cy, 'Added instead of finding the difference']]),
    };
  }
  const target = pick(pool);
  if (!items.includes(target)) items[ri(0, total - 1)] = target;
  // Squares are rectangles too: when counting rectangles, leave squares out.
  if (target === 'rectangle') for (let i = 0; i < items.length; i++) if (items[i] === 'square') items[i] = 'circle';
  const n = items.filter((x) => x === target).length;
  const nm = SHAPES[target].name.toLowerCase();
  return {
    game: 'pick',
    prompt: `How many **${nm}s** can you find?`,
    answer: String(n),
    options: numOpts(n, [n + 1, n - 1, n + 2].filter((x) => x > 0)),
    visual: { kind: 'shapes', items },
    hint: `Point to each ${nm} and count slowly, left to right.`,
    steps: [`Go row by row and touch each ${nm}.`, `There are ${n} ${nm}s.`],
    hots: d >= 4,
  };
};

// Capital letters that look the same on both sides of a fold down the middle.
const SYM_LETTERS = ['A', 'H', 'I', 'M', 'O', 'T', 'U', 'V', 'W', 'X', 'Y'];
const ASYM_LETTERS = ['F', 'G', 'J', 'L', 'N', 'P', 'R', 'S', 'Z'];

const symmetry: Gen = (d, _arena) => {
  if (d >= 3) {
    const n = d === 3 ? 4 : 5;
    const symCount = ri(1, n - 1);
    const items = shuffle([...sample(SYM_LETTERS, symCount), ...sample(ASYM_LETTERS, n - symCount)]);
    return {
      game: 'pick',
      prompt: `Fold each letter along the dotted line. **How many** letters match exactly on both sides?`,
      answer: String(symCount),
      options: numOpts(symCount, [n - symCount, symCount + 1, symCount - 1].filter((x) => x >= 0)),
      visual: { kind: 'fold', items },
      hint: `For each letter, imagine folding it in half. Do both halves sit exactly on top of each other?`,
      steps: [`Matching: ${items.filter((x) => SYM_LETTERS.includes(x)).join(', ')}`, `That is ${symCount}.`],
      hots: true,
    };
  }
  const right = pick(SYM_LETTERS);
  const items = shuffle([right, ...sample(ASYM_LETTERS, 3)]);
  return {
    game: 'pick',
    prompt: `Which letter will **match exactly** when folded along the dotted line?`,
    answer: right,
    options: items,
    visual: { kind: 'fold', items },
    hint: `The left half and the right half must look like mirror images.`,
    steps: [`${right} has the same shape on both sides of the fold.`],
  };
};

// =====================================================================
// Time Mountain
// =====================================================================

export function timeLabel(h: number, m: number): string {
  const hh = ((h - 1 + 12) % 12) + 1;
  if (m === 0) return `${hh} o'clock`;
  if (m === 30) return `half past ${hh}`;
  if (m === 15) return `quarter past ${hh}`;
  if (m === 45) return `quarter to ${(hh % 12) + 1}`;
  return `${hh}:${String(m).padStart(2, '0')}`;
}

const clockReading: Gen = (d, _arena) => {
  const h = ri(1, 12);
  const m = d === 1 ? 0 : d === 2 ? pick([0, 30]) : d <= 4 ? pick([15, 30, 45]) : pick([5, 10, 20, 25, 35, 40, 50, 55]);
  if ((d === 4 && chance(0.5)) || (d === 5 && chance(0.4))) {
    const later = pick([1, 2, 3]);
    const ans = timeLabel(h + later, m);
    return {
      game: 'pick',
      prompt: `What time will it be **${later} hour${later > 1 ? 's' : ''} later**?`,
      answer: ans,
      options: opts(ans, [timeLabel(h, m), timeLabel(h + later + 1, m), timeLabel(h + later - 1 || 12, m), timeLabel(h + later, (m + 30) % 60)]),
      visual: { kind: 'clock', h, m },
      hint: `Read the clock first: ${timeLabel(h, m)}. Then move the short hand on by ${later}.`,
      steps: [`Now it is ${timeLabel(h, m)}.`, `Add ${later} hour${later > 1 ? 's' : ''} to the hour.`, `It will be ${ans}.`],
      hots: true,
      mistakes: tags(ans, [[timeLabel(h, m), 'Read the clock but did not add the hours']]),
    };
  }
  const ans = timeLabel(h, m);
  const swapped = timeLabel(m === 0 ? 12 : m / 5, (h * 5) % 60);
  return {
    game: 'pick',
    prompt: `What time does the clock show?`,
    answer: ans,
    options: opts(ans, shuffle([timeLabel(h + 1, m), timeLabel(h - 1 || 12, m), swapped, timeLabel(h, (m + 30) % 60)])),
    visual: { kind: 'clock', h, m },
    hint: `The short hand shows the hour. The long hand shows the minutes.`,
    steps: [
      `The short hand is ${m === 0 ? 'on' : 'just after'} ${((h - 1 + 12) % 12) + 1}.`,
      m === 0 ? `The long hand is on 12, so it is "o'clock".` : `The long hand is on ${m / 5}, which means ${m} minutes.`,
      `The time is ${ans}.`,
    ],
    mistakes: tags(ans, [[swapped, 'Mixed up the hour hand and the minute hand']]),
  };
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const ORDINAL_WORDS = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth'];

const calendar: Gen = (d, arena) => {
  const g = pickGame(arena, 'run');
  if (d === 1) {
    const i = ri(0, 6);
    const after = chance(0.5);
    const ans = DAYS[(i + (after ? 1 : 6)) % 7];
    return {
      game: g,
      prompt: `Which day comes **just ${after ? 'after' : 'before'} ${DAYS[i]}**?`,
      answer: ans,
      options: opts(ans, shuffle(DAYS)),
      hint: `Say the days in order: Monday, Tuesday, Wednesday…`,
      steps: [`The order is ${DAYS.join(', ')}.`, `Just ${after ? 'after' : 'before'} ${DAYS[i]} is ${ans}.`],
      mistakes: tags(ans, [[DAYS[(i + (after ? 6 : 1)) % 7], after ? 'Gave the day before, not after' : 'Gave the day after, not before']]),
    };
  }
  if (d === 2) {
    if (chance(0.5)) {
      const k = ri(3, 12);
      const ans = MONTHS[k - 1];
      return {
        game: g,
        prompt: `Which is the **${ORDINAL_WORDS[k - 1]} month** of the year?`,
        answer: ans,
        options: opts(ans, [MONTHS[k % 12], MONTHS[(k + 10) % 12], ...shuffle(MONTHS)]),
        hint: `Count the months on your fingers starting with January.`,
        steps: [`January is the first month.`, `Counting on, the ${ORDINAL_WORDS[k - 1]} month is ${ans}.`],
        mistakes: tags(ans, [[MONTHS[k % 12], 'Counted one month too many'], [MONTHS[(k + 10) % 12], 'Counted one month too few']]),
      };
    }
    const i = ri(0, 11);
    const after = chance(0.5);
    const ans = MONTHS[(i + (after ? 1 : 11)) % 12];
    return {
      game: g,
      prompt: `Which month comes **just ${after ? 'after' : 'before'} ${MONTHS[i]}**?`,
      answer: ans,
      options: opts(ans, shuffle(MONTHS)),
      hint: `Say the months in order: January, February, March…`,
      steps: [`Just ${after ? 'after' : 'before'} ${MONTHS[i]} comes ${ans}.`],
    };
  }
  if (d === 4 && chance(0.5)) {
    // Festival dates (sample paper Q29)
    const ev = pick([
      { name: 'Children’s Day', date: 14, month: 'November' },
      { name: 'Teachers’ Day', date: 5, month: 'September' },
      { name: 'Gandhi Jayanti', date: 2, month: 'October' },
      { name: 'Independence Day', date: 15, month: 'August' },
    ]);
    const add = pick([5, 7, 10]);
    const ans = `${ev.date + add} ${ev.month}`;
    return {
      game: g,
      prompt: `${pick(NAMES)}’s birthday is on **${ev.name}** (**${ev.date} ${ev.month}**). A friend’s birthday is **${add} days later**. When is it?`,
      answer: ans,
      options: opts(ans, [`${ev.date + add + 1} ${ev.month}`, `${ev.date + add - 1} ${ev.month}`, `${ev.date} ${ev.month}`, `${ev.date + add + 10} ${ev.month}`]),
      hint: `Add ${add} to the date ${ev.date}.`,
      steps: [`${ev.date} + ${add} = ${ev.date + add}`, `So it is ${ans}.`],
      hots: true,
    };
  }
  if (d <= 4) {
    const i = ri(0, 6);
    const n = ri(2, d === 3 ? 3 : 5);
    const forward = d === 3 || chance(0.5);
    const ans = DAYS[(i + (forward ? n : 7 - n)) % 7];
    return {
      game: g,
      prompt: forward
        ? `Today is **${DAYS[i]}**. What day will it be **${n} days later**?`
        : `Today is **${DAYS[i]}**. What day was it **${n} days ago**?`,
      answer: ans,
      options: opts(ans, shuffle(DAYS)),
      hint: `Count ${forward ? 'forward' : 'backward'} ${n} days on your fingers, starting after ${DAYS[i]}.`,
      steps: [`Start at ${DAYS[i]}.`, `Count ${forward ? 'on' : 'back'} ${n}.`, `It is ${ans}.`],
      hots: d === 4,
    };
  }
  const start = ri(0, 6);
  const date = pick([8, 15, 22, 10, 12]);
  const ans = DAYS[(start + date - 1) % 7];
  return {
    game: g,
    prompt: `The **1st** of the month is a **${DAYS[start]}**. What day is the **${date}${ord(date)}**?`,
    answer: ans,
    options: opts(ans, shuffle(DAYS)),
    hint: `The same day comes back every 7 days: 1st, 8th, 15th, 22nd are all ${DAYS[start]}s.`,
    steps: [`1st, 8th, 15th, 22nd are ${DAYS[start]}.`, `Count on to the ${date}${ord(date)}.`, `It is a ${ans}.`],
    hots: true,
  };
};

const pm = (h: number, m = 0) => `${((h - 1 + 12) % 12) + 1}:${String(m).padStart(2, '0')} pm`;

const duration: Gen = (d, arena) => {
  const g = pickGame(arena, 'run');
  if (d <= 2) {
    const s = ri(1, 8);
    const len = ri(1, d === 1 ? 2 : 4);
    const ans = `${len} hour${len > 1 ? 's' : ''}`;
    return {
      game: g,
      prompt: `A picnic starts at **${s} o'clock** and ends at **${s + len} o'clock**. How long is the picnic?`,
      answer: ans,
      options: opts(ans, [1, 2, 3, 4, 5].map((n) => `${n} hour${n > 1 ? 's' : ''}`)),
      hint: `Count the hours from ${s} to ${s + len}.`,
      steps: [`From ${s} to ${s + len} is ${len} hour${len > 1 ? 's' : ''}.`],
    };
  }
  if (d === 3) {
    const s = ri(1, 8);
    const len = ri(2, 4);
    const ans = `${s + len} o'clock`;
    return {
      game: g,
      prompt: `A movie starts at **${s} o'clock** and lasts **${len} hours**. When does it end?`,
      answer: ans,
      options: opts(ans, [s + len + 1, s + len - 1, s, s + len + 2].map((n) => `${n} o'clock`)),
      hint: `Start at ${s} and count on ${len} hours.`,
      steps: [`${s} + ${len} = ${s + len}`, `It ends at ${ans}.`],
    };
  }
  if (d === 4) {
    // Two-step time (sample paper Q24)
    const s = ri(1, 5);
    const wait = pick([1, 2]);
    const mins = pick([30, 15]);
    const back = pm(s + wait, mins);
    const name = pick(NAMES);
    return {
      game: g,
      prompt: `${name} came home at **${pm(s)}**. ${name} went to music class **${wait} hour${wait > 1 ? 's' : ''} later** and came back after **${mins} minutes**. When did ${name} come back?`,
      answer: back,
      options: opts(back, [pm(s + wait), pm(s + wait + 1), pm(s, mins), pm(s + wait + 1, mins)]),
      hint: `Step 1: ${pm(s)} + ${wait} hour${wait > 1 ? 's' : ''}. Step 2: add ${mins} minutes.`,
      steps: [`${pm(s)} + ${wait} hour${wait > 1 ? 's' : ''} = ${pm(s + wait)}`, `${pm(s + wait)} + ${mins} minutes = ${back}`],
      hots: true,
      mistakes: tags(back, [[pm(s + wait), 'Did only the first step'], [pm(s, mins), 'Forgot to add the hours']]),
    };
  }
  const facts = [
    { q: 'How many **minutes** are in **1 hour**?', a: '60', o: ['30', '60', '100', '24'] },
    { q: '**Half an hour + 15 minutes** = how many minutes?', a: '45', o: ['45', '30', '65', '35'] },
    { q: 'How many **hours** are in **1 day**?', a: '24', o: ['12', '24', '60', '7'] },
    { q: 'How many **days** are in **2 weeks**?', a: '14', o: ['7', '14', '10', '15'] },
    { q: 'In a race, the **fastest** time wins. Rahul: **2 minutes**, Ritesh: **50 seconds**, Rohit: **10 minutes**. Who wins?', a: 'Ritesh', o: ['Ritesh', 'Rahul', 'Rohit'] },
  ];
  const f = pick(facts);
  return {
    game: g,
    prompt: f.q,
    answer: f.a,
    options: shuffle(f.o),
    hint: `1 hour = 60 minutes. 1 minute = 60 seconds. 1 week = 7 days.`,
    steps: [`The answer is ${f.a}.`],
    hots: true,
  };
};

// =====================================================================
// Treasure Market
// =====================================================================

const COINS = [1, 2, 5, 10, 20, 50];

const moneyTotal: Gen = (d, arena) => {
  if (d === 5 && chance(0.5)) {
    // Rupees and paise in words (sample paper Q27)
    const r = ri(11, 99);
    const p = pick([50, 25, 75]);
    const ans = `₹${r}.${p}`;
    const pw = numberWord(p);
    return {
      game: 'pick',
      prompt: `Which shows **${numberWord(r)} rupees and ${pw} paise**?`,
      answer: ans,
      options: opts(ans, [`₹${r}.${String(p).split('').reverse().join('')}`, `₹${r - 10}.${p}`, `₹${Math.floor(r / 10)}.${r % 10}${String(p)[0]}`, `₹${swapDigits(r)}.${p}`]),
      mistakes: tags(ans, [[`₹${r}.${String(p).split('').reverse().join('')}`, 'Mixed up the paise digits'], [`₹${Math.floor(r / 10)}.${r % 10}${String(p)[0]}`, 'Put the dot in the wrong place']]),
      hint: `Rupees come before the dot. Paise come after the dot.`,
      steps: [`${cap(numberWord(r))} rupees = ₹${r}`, `${cap(pw)} paise = .${p}`, `Together: ${ans}`],
    };
  }
  if (!arena && chance(0.55)) {
    const target = d === 1 ? ri(3, 15) : d === 2 ? ri(10, 40) : d === 3 ? ri(25, 70) : ri(45, 99);
    const item = pick(['🧸 teddy', '🪁 kite', '⚽ ball', '📒 notebook', '🖍️ crayon-box', '🍫 chocolate']);
    return {
      game: 'shop',
      prompt: `The **${item.split(' ')[1].replace('-', ' ')}** costs **₹${target}**. Pay the exact amount!`,
      answer: String(target),
      options: [],
      data: { type: 'shop', target, coins: COINS, item: item.split(' ')[0] },
      hint: `Start with the biggest coin or note that is not more than ₹${target}.`,
      steps: (() => {
        const parts: number[] = [];
        let left = target;
        for (const c of [...COINS].reverse()) while (left >= c) { parts.push(c); left -= c; }
        return [`One way: ${parts.map((p) => `₹${p}`).join(' + ')} = ₹${target}`];
      })(),
    };
  }
  const n = d <= 2 ? 3 : 4;
  const coins = Array.from({ length: n }, () => pick(d === 1 ? [1, 2, 5] : d <= 3 ? [2, 5, 10, 20] : [5, 10, 20, 50]));
  const sum = coins.reduce((a, b) => a + b, 0);
  return {
    game: pickGame(arena, 'run'),
    prompt: `How much money is this?  **${coins.map((c) => `₹${c}`).join(' + ')}**`,
    answer: `₹${sum}`,
    options: opts(`₹${sum}`, shuffle([sum + 5, sum - 5, sum + 10, sum - 1, sum + 1]).filter((x) => x > 0).map((x) => `₹${x}`)),
    hint: `Add the big ones first: ${[...coins].sort((a, b) => b - a).map((c) => `₹${c}`).join(' + ')}`,
    steps: [`${[...coins].sort((a, b) => b - a).map((c) => `₹${c}`).join(' + ')}`, `= ₹${sum}`],
  };
};

const moneyChange: Gen = (d, arena) => {
  const pay = d <= 2 ? pick([10, 20]) : d <= 4 ? pick([50, 100]) : 100;
  const cost = d <= 2 ? ri(2, pay - 2) : ri(Math.floor(pay / 3), pay - 3);
  const change = pay - cost;
  const item = pick(['toy car', 'pencil box', 'juice', 'storybook', 'yo-yo']);
  if (!arena && chance(0.6)) {
    return {
      game: 'shop',
      prompt: `You pay **₹${pay}**. The ${item} costs **₹${cost}**. Give the right **change** with coins!`,
      answer: String(change),
      options: [],
      data: { type: 'shop', target: change, coins: COINS.filter((c) => c < pay) },
      hint: `Change = what you pay − the cost. Count up from ₹${cost} to ₹${pay}.`,
      hintVisual: pay <= 20 ? { kind: 'numberline', from: cost, to: pay, step: 1 } : undefined,
      steps: [`₹${pay} − ₹${cost} = ₹${change}`, `Give ₹${change} in coins.`],
    };
  }
  return {
    game: pickGame(arena, 'run'),
    prompt: `${pick(NAMES)} pays **₹${pay}** for a ${item} that costs **₹${cost}**. How much change?`,
    answer: `₹${change}`,
    options: opts(`₹${change}`, shuffle([pay + cost, change + 10, change - 1, change + 1, change - 10]).filter((x) => x > 0).map((x) => `₹${x}`)),
    hint: `Count up from ₹${cost} to ₹${pay}.`,
    steps: [`₹${pay} − ₹${cost} = ₹${change}`],
    mistakes: tags(`₹${change}`, [[`₹${pay + cost}`, 'Added instead of subtracting']]),
  };
};

const measurement: Gen = (d, arena) => {
  const g = pickGame(arena, 'run');
  if (d <= 2) {
    const sets = [
      { q: 'Which is **heavier**?', a: '🐘 Elephant', o: ['🐘 Elephant', '🐈 Cat', '🐭 Mouse'] },
      { q: 'Which is the **lightest**?', a: '☁️ Cotton ball', o: ['☁️ Cotton ball', '🥭 Mango', '📕 Book', '🍚 10 kg rice'] },
      { q: 'Which is **taller**?', a: '🦒 Giraffe', o: ['🦒 Giraffe', '🐕 Dog', '🐇 Rabbit'] },
      { q: 'Which holds the **least** water?', a: '🥄 Spoon', o: ['🥄 Spoon', '☕ Cup', '🪣 Bucket', '🍼 Bottle'] },
      { q: 'Which holds the **most** water?', a: '🪣 Bucket', o: ['🪣 Bucket', '☕ Cup', '🥄 Spoon'] },
      { q: 'Which is **shorter**?', a: '✏️ Pencil', o: ['✏️ Pencil', '🚪 Door', '🌳 Tree'] },
    ];
    const s = pick(sets);
    return { game: g, prompt: s.q, answer: s.a, options: shuffle(s.o), hint: 'Picture them side by side.', steps: [`${s.a} is the answer.`] };
  }
  if (d === 3) {
    const sets = [
      { q: 'Which unit is best to measure the **length of a pencil**?', a: 'centimetre', o: ['centimetre', 'kilogram', 'litre', 'metre'] },
      { q: 'Which unit is best to measure **milk in a bottle**?', a: 'litre', o: ['litre', 'metre', 'kilogram', 'centimetre'] },
      { q: 'Which unit is best to measure the **weight of a bag of rice**?', a: 'kilogram', o: ['kilogram', 'litre', 'centimetre', 'metre'] },
      { q: 'Which unit is best to measure the **length of a classroom**?', a: 'metre', o: ['metre', 'centimetre', 'litre', 'kilogram'] },
    ];
    const s = pick(sets);
    return {
      game: g,
      prompt: s.q,
      answer: s.a,
      options: shuffle(s.o),
      hint: 'Length → cm or m. Weight → kg. Liquids → litre.',
      steps: [`We measure that in ${s.a}s.`],
    };
  }
  if (d === 4) {
    const a = ri(10, 30);
    const b = ri(3, a - 2);
    const things = pick([['pencil', 'eraser'], ['ribbon', 'string'], ['ruler', 'crayon']]);
    return {
      game: g,
      prompt: `A ${things[0]} is **${a} cm** long. ${/^[aeiou]/.test(things[1]) ? 'An' : 'A'} ${things[1]} is **${b} cm** long. How much **longer** is the ${things[0]}?`,
      answer: `${a - b} cm`,
      options: opts(`${a - b} cm`, [a + b, a - b + 1, a - b - 1, a - b + 10].filter((x) => x > 0).map((x) => `${x} cm`)),
      hint: `"How much longer" means find the difference: ${a} − ${b}.`,
      steps: [`${a} − ${b} = ${a - b}`, `The ${things[0]} is ${a - b} cm longer.`],
      mistakes: tags(`${a - b} cm`, [[`${a + b} cm`, 'Added instead of finding the difference']]),
    };
  }
  if (chance(0.5)) {
    // Half-weight reasoning (sample paper Q50)
    const w = pick([2, 4, 6, 10]);
    const n = pick([8, 10, 12, 20]);
    const ans = w / 2 === 1 ? '1 kg' : `${w / 2} kg`;
    const all = [...new Set([ans, w === 2 ? 'Half kg' : `${w / 4} kg`, `${w} kg`, `${n / 2} kg`, `${w * 2} kg`])];
    return {
      game: g,
      prompt: `A **${w} kg** sweet box holds **${n}** gulab jamuns. What do **${n / 2}** gulab jamuns weigh?`,
      answer: ans,
      options: opts(ans, all),
      hint: `${n / 2} is half of ${n}. So the weight is half of ${w} kg.`,
      steps: [`${n / 2} is half of ${n}.`, `Half of ${w} kg = ${ans}.`],
      hots: true,
    };
  }
  const facts = [
    { q: '**1 metre** = how many **centimetres**?', a: '100', o: ['10', '100', '1000', '50'] },
    { q: '**1 kilogram** = how many **grams**?', a: '1000', o: ['100', '10', '1000', '500'] },
    { q: 'A jug holds **2 litres**. How many jugs fill a **10 litre** bucket?', a: '5', o: ['5', '8', '12', '20'] },
  ];
  const f = pick(facts);
  return { game: g, prompt: f.q, answer: f.a, options: shuffle(f.o), hint: '1 m = 100 cm, 1 kg = 1000 g.', steps: [`The answer is ${f.a}.`], hots: true };
};

const temperature: Gen = (d, arena) => {
  if (d === 1) {
    const hot = chance(0.5);
    const ans = hot ? '☀️ Sunny summer day' : '❄️ Snowy day';
    return {
      game: pickGame(arena, 'run'),
      prompt: `Which shows a **${hot ? 'hot' : 'cold'}** day?`,
      answer: ans,
      options: shuffle(['☀️ Sunny summer day', '❄️ Snowy day', '🌧️ Rainy day']),
      hint: hot ? `When it is hot, we wear cotton clothes and drink cold water.` : `When it is cold, we wear woollen clothes.`,
      steps: [`${ans} is ${hot ? 'hot' : 'cold'}.`],
    };
  }
  if (d <= 3) {
    const v = d === 2 ? ri(1, 4) * 10 : ri(1, 9) * 5;
    return {
      game: 'pick',
      prompt: `What temperature does the thermometer show?`,
      answer: `${v}°C`,
      options: opts(`${v}°C`, [v + 5, v - 5, v + 10, v + 1].filter((x) => x >= 0 && x <= 50).map((x) => `${x}°C`)),
      visual: { kind: 'thermometer', value: v },
      hint: `Find the top of the red line, then read the number beside it. Each small step is 5°C.`,
      steps: [`The red line stops at ${v}.`, `So it is ${v}°C.`],
    };
  }
  if (d === 4) {
    // Woollen clothes below a temperature (sample paper Q35)
    const limit = pick([10, 15]);
    const cities = shuffle(['Delhi', 'Mumbai', 'Shimla', 'Jammu', 'Chennai', 'Kolkata']).slice(0, 4);
    const winner = ri(0, 3);
    const temps = cities.map((_, i) => (i === winner ? limit - ri(1, 4) : limit + ri(1, 8)));
    const label = (i: number) => `${cities[i]} ${temps[i]}°C`;
    return {
      game: 'pick',
      prompt: `People wear woollen clothes when it is **less than ${limit}°C**. In which city will people wear woollens?`,
      answer: label(winner),
      options: shuffle(cities.map((_, i) => label(i))),
      hint: `Look for the only temperature smaller than ${limit}.`,
      steps: [`Only ${temps[winner]}°C is less than ${limit}°C.`, `So the answer is ${cities[winner]}.`],
      hots: true,
    };
  }
  const start = ri(15, 30);
  const change = ri(3, 9);
  const rise = chance(0.5);
  const ans = rise ? start + change : start - change;
  return {
    game: pickGame(arena, 'run'),
    prompt: `In the morning it was **${start}°C**. By afternoon it ${rise ? 'went up' : 'went down'} by **${change}°C**. What is the temperature now?`,
    answer: `${ans}°C`,
    options: opts(`${ans}°C`, [rise ? start - change : start + change, ans + 1, ans - 1, ans + 10].map((x) => `${x}°C`)),
    hint: rise ? `"Went up" means add.` : `"Went down" means subtract.`,
    steps: [`${start} ${rise ? '+' : '−'} ${change} = ${ans}`, `It is ${ans}°C.`],
    hots: true,
    mistakes: tags(`${ans}°C`, [[`${rise ? start - change : start + change}°C`, rise ? 'Subtracted when the temperature went up' : 'Added when the temperature went down']]),
  };
};

// =====================================================================
// Puzzle Forest
// =====================================================================

const PATTERN_SETS = [
  ['🔴', '🔵', '🟢', '🟡'],
  ['🍎', '🍌', '🍇', '🍊'],
  ['⭐', '🌙', '☀️', '☁️'],
  ['🐶', '🐱', '🐰', '🐸'],
  ['▲', '■', '●', '◆'],
];
const UNIT_CODE: Record<string, string> = { '0,1': 'AB', '0,1,2': 'ABC', '0,0,1': 'AAB', '0,1,1': 'ABB' };

const patterns: Gen = (d, arena) => {
  if (d >= 4) {
    let seq: number[];
    let rule: string;
    if (d === 4) {
      const a = ri(1, 9);
      const up = ri(2, 4);
      const down = ri(1, up - 1);
      seq = [a];
      for (let i = 1; i < 6; i++) seq.push(seq[i - 1] + (i % 2 ? up : -down));
      rule = `+${up}, −${down}, +${up}, −${down} …`;
    } else {
      const a = ri(1, 3);
      seq = [a];
      for (let i = 1; i < 6; i++) seq.push(seq[i - 1] * 2);
      if (seq[5] > 100 || chance(0.5)) {
        seq = [ri(1, 5)];
        for (let i = 1; i < 6; i++) seq.push(seq[i - 1] + i);
        rule = 'the jump grows by 1 each time: +1, +2, +3 …';
      } else rule = 'each number is double the one before';
    }
    const ans = seq[5];
    return {
      game: arena ? 'pick' : 'pattern',
      prompt: `What number comes next in the pattern?`,
      answer: String(ans),
      options: numOpts(ans, [ans + 1, ans - 1, seq[4] + (seq[4] - seq[3])]),
      data: { type: 'pattern', items: [...seq.slice(0, 5).map(String), '?'] },
      hint: `Look at how each number changes: ${seq[1] - seq[0] >= 0 ? '+' : ''}${seq[1] - seq[0]}, ${seq[2] - seq[1] >= 0 ? '+' : ''}${seq[2] - seq[1]} …`,
      steps: [`The rule: ${rule}`, `So the next number is ${ans}.`],
      hots: true,
      mistakes: tags(String(ans), [[seq[4] + (seq[4] - seq[3]), 'Repeated the last jump instead of finding the rule']]),
    };
  }
  const set = pick(PATTERN_SETS);
  const unitIdx: number[][] =
    d === 1 ? [[0, 1]] : d === 2 ? [[0, 1, 2], [0, 0, 1], [0, 1, 1]] : [[0, 1, 1, 2], [0, 1, 2, 1], [0, 0, 1, 2]];
  const idx = pick(unitIdx);
  const unit = idx.map((i) => set[i]);
  if (d >= 2 && d <= 3 && chance(0.3)) {
    // Describe the pattern with letters (sample paper Q2)
    const two = pick([[0, 1], [0, 1, 2], [0, 0, 1], [0, 1, 1]]);
    const u = two.map((i) => set[i]);
    const code = UNIT_CODE[two.join(',')];
    const items = Array.from({ length: u.length * 3 }, (_, i) => u[i % u.length]);
    return {
      game: arena ? 'pick' : 'pattern',
      prompt: `Which letters show the **same pattern**?`,
      answer: code,
      options: shuffle(['AB', 'ABC', 'AAB', 'ABB']),
      data: { type: 'pattern', items },
      hint: `Call the first picture A. A new picture gets the next letter. What part repeats?`,
      steps: [`The repeating part is ${u.join(' ')}.`, `That is ${code}.`],
    };
  }
  const len = unit.length * 2 + ri(1, unit.length - 1);
  const full = Array.from({ length: len + 1 }, (_, i) => unit[i % unit.length]);
  const missingAt = d === 3 && chance(0.5) ? ri(1, len - 1) : len;
  const ans = full[missingAt];
  const items = missingAt === len ? [...full.slice(0, len), '?'] : full.slice(0, len).map((x, i) => (i === missingAt ? '?' : x));
  return {
    game: arena ? 'pick' : 'pattern',
    prompt: missingAt === len ? `What comes next in the pattern?` : `What is missing from the pattern?`,
    answer: ans,
    options: opts(ans, shuffle([...new Set(set)])),
    data: { type: 'pattern', items },
    hint: `Find the part that repeats: ${unit.join(' ')}`,
    steps: [`The repeating part is ${unit.join(' ')}.`, `So the missing one is ${ans}.`],
  };
};

const ODD_SETS = [
  { items: ['🍎', '🍌', '🍇', '🚗'], odd: '🚗', why: 'The others are fruits.' },
  { items: ['🐶', '🐱', '🐮', '🌳'], odd: '🌳', why: 'The others are animals.' },
  { items: ['🚗', '🚌', '🚲', '🍕'], odd: '🍕', why: 'The others are vehicles.' },
  { items: ['🦆', '🦅', '🐦', '🐟'], odd: '🐟', why: 'The others are birds.' },
  { items: ['🥕', '🥦', '🌽', '⚽'], odd: '⚽', why: 'The others are vegetables.' },
  { items: ['✏️', '📏', '✂️', '🍦'], odd: '🍦', why: 'The others are school things.' },
];

const oddOneOut: Gen = (d, arena) => {
  const g = pickGame(arena, 'run');
  if (d <= 2) {
    const s = pick(ODD_SETS);
    return {
      game: g,
      prompt: `Which one is the **odd one out**?`,
      answer: s.odd,
      options: d === 1 ? shuffle([s.odd, ...sample(s.items.filter((x) => x !== s.odd), 2)]) : shuffle(s.items),
      hint: `What is the same about most of them?`,
      steps: [s.why, `So ${s.odd} is the odd one out.`],
    };
  }
  const rules = [
    () => ({ items: sample([12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34], 3), odd: pick([13, 15, 17, 19, 21, 23, 25, 27]), why: 'The others are even numbers.' }),
    () => ({ items: sample([10, 15, 20, 25, 30, 35, 40, 45, 50], 3), odd: pick([12, 23, 34, 41, 18]), why: 'The others are in the 5 times table.' }),
    () => {
      const t = ri(2, 7);
      return { items: sample([1, 2, 3, 4, 5, 6, 7, 8, 9], 3).map((o) => t * 10 + o), odd: (t + pick([1, 2])) * 10 + ri(1, 9), why: `The others have ${t} tens.` };
    },
    () => {
      const sums = sample([[1, 8], [2, 7], [3, 6], [4, 5], [5, 4], [6, 3], [7, 2]], 3).map(([a, b]) => a * 10 + b);
      return { items: sums, odd: pick([46, 64, 73, 37]), why: 'The digits of the others add up to 9.' };
    },
  ];
  const r = pick(rules.slice(0, d === 3 ? 2 : d === 4 ? 3 : 4))();
  return {
    game: g === 'run' ? 'pick' : g,
    prompt: `Which number is the **odd one out**?`,
    answer: String(r.odd),
    options: shuffle([...r.items, r.odd].map(String)),
    hint: `Try: even/odd? Tables? Tens digit? Digit sums?`,
    steps: [r.why, `So ${r.odd} is the odd one out.`],
    hots: d >= 4,
  };
};

const analogy: Gen = (d, arena) => {
  const g = pickGame(arena, 'run');
  if (d <= 2) {
    const sets = [
      ['Cat', 'Kitten', 'Dog', 'Puppy', ['Puppy', 'Calf', 'Cub', 'Bone']],
      ['Bird', 'Fly', 'Fish', 'Swim', ['Swim', 'Run', 'Jump', 'Fly']],
      ['Hand', 'Glove', 'Foot', 'Sock', ['Sock', 'Hat', 'Ring', 'Shirt']],
      ['Day', 'Sun', 'Night', 'Moon', ['Moon', 'Cloud', 'Rain', 'Sky']],
      ['Cow', 'Milk', 'Hen', 'Egg', ['Egg', 'Wool', 'Honey', 'Milk']],
      ['Eye', 'See', 'Ear', 'Hear', ['Hear', 'Smell', 'Taste', 'Talk']],
    ] as const;
    const s = pick(sets);
    return {
      game: g,
      prompt: `**${s[0]}** is to **${s[1]}** as **${s[2]}** is to **?**`,
      answer: s[3],
      options: shuffle([...s[4]]).slice(0, 4),
      hint: `How are ${s[0]} and ${s[1]} connected? Use the same link for ${s[2]}.`,
      steps: [`${s[0]} → ${s[1]}`, `In the same way, ${s[2]} → ${s[3]}`],
    };
  }
  const rule = pick(d === 3 ? ['add', 'double'] : ['add', 'double', 'half', 'sub']);
  const k = ri(2, 9);
  const f = (x: number) => (rule === 'add' ? x + k : rule === 'sub' ? x - k : rule === 'double' ? x * 2 : x / 2);
  const mk = () => (rule === 'half' ? ri(2, 25) * 2 : rule === 'sub' ? ri(k + 1, 40) : ri(2, 30));
  const a = mk();
  let c = mk();
  while (c === a) c = mk();
  const ans = f(c);
  const text = rule === 'add' ? `add ${k}` : rule === 'sub' ? `take away ${k}` : rule === 'double' ? 'double it' : 'halve it';
  return {
    game: g,
    prompt: `**${a} : ${f(a)}  ::  ${c} : ?**`,
    answer: String(ans),
    options: numOpts(ans, [c + (f(a) - a), ans + 1, ans - 1].filter((x) => x !== ans)),
    hint: `What do you do to ${a} to get ${f(a)}?`,
    steps: [`${a} → ${f(a)}: ${text}.`, `${c} → ${text} → ${ans}`],
    hots: true,
  };
};

const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const WORDS = ['CAT', 'DOG', 'SUN', 'BAT', 'PEN', 'CUP', 'HEN', 'BUS', 'MAP', 'JAM', 'FAN', 'BED'];

const codingDecoding: Gen = (d, arena) => {
  const g = pickGame(arena, 'run');
  const code = (s: string, f: (i: number) => string) => s.split('').map((ch) => f(ALPHA.indexOf(ch))).join('');
  if (d === 1) {
    // Picture equation (sample paper Q3)
    const [a, b] = sample(['😊', '🍎', '🐟', '🌼'], 1).concat(sample(['⭐', '💎', '🔷'], 1));
    const k = pick([2, 3]);
    const times = k * pick([2, 3]);
    const n = times / k;
    const ans = b.repeat(n);
    return {
      game: 'pick',
      prompt: `If **${Array(k).fill(a).join(' + ')} = ${b}**, what is **${Array(times).fill(a).join(' + ')}**?`,
      answer: ans,
      options: opts(ans, [b.repeat(n + 1), b, b.repeat(times), b.repeat(n + 2)]),
      hint: `Every ${k} ${a} make one ${b}. Make groups of ${k}.`,
      steps: [`${times} ${a} = ${n} groups of ${k}.`, `Each group is one ${b}, so ${ans}.`],
      mistakes: tags(ans, [[b.repeat(times), 'Swapped each picture one-for-one instead of grouping']]),
    };
  }
  if (d === 2) {
    const short = pick(['CAB', 'BAD', 'ACE', 'BED', 'FED', 'DAB']);
    const ans = short.split('').map((ch) => ALPHA.indexOf(ch) + 1).join('-');
    return {
      game: g,
      prompt: `If **A = 1, B = 2, C = 3** … what is the code for **${short}**?`,
      answer: ans,
      options: opts(ans, [
        ans.split('-').reverse().join('-'),
        short.split('').map((ch) => ALPHA.indexOf(ch) + 2).join('-'),
        short.split('').map((ch) => Math.max(1, ALPHA.indexOf(ch))).join('-'),
        [ans.split('-')[1], ans.split('-')[0], ans.split('-')[2]].join('-'),
      ]),
      hint: `Count each letter's place in the alphabet: A=1, B=2, C=3, D=4, E=5, F=6.`,
      steps: short.split('').map((ch) => `${ch} = ${ALPHA.indexOf(ch) + 1}`),
    };
  }
  if (d === 3) {
    // Symbols stand for operations and letters for numbers (sample paper Q5)
    const sym = pick(['△', '◇', '★']);
    const op = pick(['+', '−']);
    const [L1, L2] = sample(['P', 'Q', 'R', 'M', 'K'], 2);
    let v1 = ri(5, 20);
    let v2 = ri(3, 15);
    if (op === '−' && v2 > v1) [v1, v2] = [v2, v1];
    const ans = op === '+' ? v1 + v2 : v1 - v2;
    return {
      game: g,
      prompt: `If **${sym}** means **'${op}'**, **${L1}** means **${v1}** and **${L2}** means **${v2}**, what is **${L1} ${sym} ${L2}**?`,
      answer: String(ans),
      options: numOpts(ans, [op === '+' ? v1 - v2 : v1 + v2, ans + 1, ans - 1]),
      hint: `Swap in the meanings: ${L1} ${sym} ${L2} becomes ${v1} ${op} ${v2}.`,
      steps: [`${L1} ${sym} ${L2} = ${v1} ${op} ${v2}`, `= ${ans}`],
      hots: true,
      mistakes: tags(String(ans), [[op === '+' ? v1 - v2 : v1 + v2, 'Used the wrong operation for the symbol']]),
    };
  }
  const w = pick(WORDS);
  if (d === 4) {
    const shift = pick([1, 2]);
    const ex = pick(WORDS.filter((x) => x !== w));
    const enc = (s: string, k: number) => code(s, (i) => ALPHA[(i + k) % 26]);
    const ans = enc(w, shift);
    return {
      game: g,
      prompt: `If **${ex}** is written as **${enc(ex, shift)}**, how is **${w}** written?`,
      answer: ans,
      options: opts(ans, [enc(w, shift + 1), enc(w, 25), ans.split('').reverse().join(''), w]),
      hint: `Each letter moves ${shift} step${shift > 1 ? 's' : ''} forward in the alphabet: ${ex[0]} → ${enc(ex[0], shift)}.`,
      steps: w.split('').map((ch) => `${ch} → ${enc(ch, shift)}`),
      hots: true,
    };
  }
  const ex = pick(WORDS.filter((x) => x !== w));
  const rev = (s: string) => s.split('').reverse().join('');
  return {
    game: g,
    prompt: `If **${ex}** is written as **${rev(ex)}**, how is **${w}** written?`,
    answer: rev(w),
    options: opts(rev(w), [w, w[1] + w[0] + w[2], w[0] + w[2] + w[1]]),
    hint: `Look at the first and last letters of ${ex} and ${rev(ex)}.`,
    steps: [`The word is written backwards.`, `${w} → ${rev(w)}`],
    hots: true,
  };
};

const ranking: Gen = (d, arena) => {
  const g: GameType = arena ? 'pick' : 'mystery';
  if (d === 5) {
    const front = ri(2, 6);
    const back = ri(2, 6);
    const total = front + back - 1;
    const name = pick(NAMES);
    return {
      game: g,
      prompt: `How many children are in the line?`,
      answer: String(total),
      options: numOpts(total, [front + back, front + back + 1]),
      data: { type: 'mystery', clues: [`${name} is **${front}${ord(front)} from the front**.`, `${name} is also **${back}${ord(back)} from the back**.`] },
      hint: `Draw it! Put ${name} in the middle. Count ${front - 1} in front and ${back - 1} behind.`,
      steps: [`In front of ${name}: ${front - 1}`, `Behind ${name}: ${back - 1}`, `Total: ${front - 1} + 1 + ${back - 1} = ${total}`],
      hots: true,
      mistakes: tags(String(total), [[front + back, `Counted ${name} twice`]]),
    };
  }
  const n = d <= 3 ? 3 : 4;
  const people = sample(NAMES, n);
  const order = [...people];
  const adj = pick([
    ['taller', 'tallest', 'shortest'],
    ['older', 'oldest', 'youngest'],
    ['faster', 'fastest', 'slowest'],
  ]);
  const clues = [];
  for (let i = 0; i < n - 1; i++) clues.push(`**${order[i]}** is ${adj[0]} than **${order[i + 1]}**.`);
  const askTop = d === 1 || chance(0.5);
  const ans = askTop ? order[0] : order[n - 1];
  return {
    game: g,
    prompt: `Who is the **${askTop ? adj[1] : adj[2]}**?`,
    answer: ans,
    options: shuffle(people),
    data: { type: 'mystery', clues: d === 1 ? clues : shuffle(clues) },
    hint: `Put them in a line from ${adj[1]} to ${adj[2]} using each clue.`,
    steps: [`From ${adj[1]} to ${adj[2]}: ${order.join(' → ')}`, `The ${askTop ? adj[1] : adj[2]} is ${ans}.`],
    hots: d >= 3,
    mistakes: tags(ans, [[askTop ? order[n - 1] : order[0], `Mixed up ${adj[1]} and ${adj[2]}`]]),
  };
};

const dataPictograph: Gen = (d, arena) => {
  const fruits = sample(['🍎 Apples', '🍌 Bananas', '🥭 Mangoes', '🍇 Grapes', '🍊 Oranges'], d <= 2 ? 3 : 4);
  const key = d >= 4 ? 2 : 1;
  const rows = fruits.map((f) => ({ label: f, count: ri(1, 6) * key }));
  if (new Set(rows.map((r) => r.count)).size !== rows.length) return dataPictograph(d, arena);
  const icon = '🧺';
  const day = pick(['Monday', 'Tuesday', 'Saturday']);
  const visual: Visual = { kind: 'pictograph', icon, rows, key };
  const title = `Fruits sold at Dino’s shop on ${day}`;
  const kind = d === 1 ? 'count' : d === 2 ? pick(['count', 'most', 'least']) : pick(['more', 'total', 'count']);
  const fruitName = (r: { label: string }) => r.label.split(' ')[1].toLowerCase();
  if (kind === 'count') {
    const r = pick(rows);
    return {
      game: 'pick',
      prompt: `${title}. How many **${fruitName(r)}** were sold?`,
      answer: String(r.count),
      options: numOpts(r.count, [r.count / key, r.count + key, r.count - key].filter((x) => x > 0 && x !== r.count)),
      visual,
      hint: key > 1 ? `Each ${icon} means ${key}. Count the baskets, then count in ${key}s.` : `Count the ${icon} in that row.`,
      steps: [`${r.label}: ${r.count / key} baskets × ${key} = ${r.count}`],
      mistakes: key > 1 ? tags(String(r.count), [[r.count / key, 'Counted pictures but forgot the key (each picture = 2)']]) : undefined,
    };
  }
  if (kind === 'most' || kind === 'least') {
    const best = [...rows].sort((a, b) => (kind === 'most' ? b.count - a.count : a.count - b.count))[0];
    return {
      game: 'pick',
      prompt: `${title}. Which fruit was sold the **${kind}**?`,
      answer: best.label,
      options: shuffle(rows.map((r) => r.label)),
      visual,
      hint: `Find the ${kind === 'most' ? 'longest' : 'shortest'} row.`,
      steps: [`${best.label} has ${best.count}, the ${kind === 'most' ? 'most' : 'fewest'}.`],
    };
  }
  if (kind === 'more') {
    const [a, b] = sample(rows, 2).sort((x, y) => y.count - x.count);
    const diff = a.count - b.count;
    return {
      game: 'pick',
      prompt: `${title}. How many **more ${fruitName(a)}** than **${fruitName(b)}**?`,
      answer: String(diff),
      options: numOpts(diff, [a.count + b.count, diff + key, diff + 1].filter((x) => x !== diff)),
      visual,
      hint: `Find both numbers, then subtract.`,
      steps: [`${a.label}: ${a.count}`, `${b.label}: ${b.count}`, `${a.count} − ${b.count} = ${diff}`],
      hots: true,
      mistakes: tags(String(diff), [[a.count + b.count, 'Added instead of finding the difference']]),
    };
  }
  const total = rows.reduce((s, r) => s + r.count, 0);
  return {
    game: 'pick',
    prompt: `${title}. How many fruits were sold **in all**?`,
    answer: String(total),
    options: numOpts(total, [total - key, total + key, total / key].filter((x) => x !== total)),
    visual,
    hint: `Find each row's number, then add them all.`,
    steps: [rows.map((r) => r.count).join(' + ') + ` = ${total}`],
    mistakes: key > 1 ? tags(String(total), [[total / key, 'Counted pictures but forgot the key']]) : undefined,
  };
};

const OBJECTS = ['🧸', '🍎', '⚽', '🎈', '📕', '🚗', '🌼', '🐟', '🥁', '🍕', '🪁', '🎩'];
const DIRS = ['North', 'South', 'East', 'West'];

const spatial: Gen = (d, arena) => {
  if (d === 1 || (d === 4 && chance(0.4))) {
    // Ordinal position in a row (sample paper Q20)
    const items = sample(OBJECTS, 8); // all different, so "the 5th object" is unambiguous
    const fromRight = d === 4;
    const k = ri(2, 6);
    const ans = fromRight ? items[items.length - k] : items[k - 1];
    const wrongPos = fromRight ? items[k - 1] : items[items.length - k];
    return {
      game: 'pick',
      prompt: `Which is the **${k}${ord(k)}** object from the **${fromRight ? 'right (last)' : 'left (first)'}**?`,
      answer: ans,
      options: opts(ans, [wrongPos, items[(k + (fromRight ? -1 : 0)) % 8], ...shuffle(OBJECTS)]),
      visual: { kind: 'row', items },
      hint: `Put your finger on the ${fromRight ? 'last' : 'first'} object and count ${k}.`,
      steps: [`Start from the ${fromRight ? 'right' : 'left'} and count 1, 2, … ${k}.`, `The ${k}${ord(k)} object is ${ans}.`],
      mistakes: tags(ans, [[wrongPos, fromRight ? 'Counted from the left instead of the right' : 'Counted from the right instead of the left']]),
    };
  }
  if (d === 2) {
    // Position in a 3×3 grid (sample paper Q14)
    const cells = sample(OBJECTS, 9);
    const places = [
      ['top left', 0], ['top right', 2], ['bottom left', 6], ['bottom right', 8], ['middle', 4], ['top middle', 1], ['bottom middle', 7],
    ] as const;
    const [label, i] = pick(places);
    const mirror = [2, 1, 0, 5, 4, 3, 8, 7, 6][i];
    return {
      game: 'pick',
      prompt: `Which object is in the **${label}** box?`,
      answer: cells[i],
      options: opts(cells[i], [cells[mirror], cells[8 - i], ...shuffle(cells)]),
      visual: { kind: 'grid', cells, cols: 3 },
      hint: `Top is the first row. Left is the side of your left hand.`,
      steps: [`The ${label} box has ${cells[i]}.`],
      mistakes: tags(cells[i], [[cells[mirror], 'Mixed up left and right']]),
    };
  }
  if (d === 3) {
    // Directions on a grid (sample paper Q6)
    const size = 5;
    const c = 12; // centre
    const dir = pick(DIRS);
    const steps = ri(1, 2);
    const DELTA: Record<string, number> = { North: -size, South: size, East: 1, West: -1 };
    const delta = DELTA[dir];
    const cells = Array(size * size).fill('');
    cells[c] = '✖';
    cells[c + delta * steps] = '⬤';
    const OPPOSITE: Record<string, string> = { North: 'South', South: 'North', East: 'West', West: 'East' };
    const opposite = OPPOSITE[dir];
    return {
      game: 'pick',
      prompt: `In which direction must **✖** move to reach **⬤**?`,
      answer: dir,
      options: shuffle(DIRS),
      visual: { kind: 'grid', cells, cols: size, compass: true },
      hint: `North is up, South is down, East is to the right, West is to the left.`,
      steps: [`⬤ is ${dir === 'North' ? 'above' : dir === 'South' ? 'below' : dir === 'East' ? 'to the right of' : 'to the left of'} ✖.`, `So ✖ moves ${dir}.`],
      mistakes: tags(dir, [[opposite, 'Mixed up opposite directions']]),
    };
  }
  // Up and down a staircase (sample paper Q49)
  const start = ri(4, 9);
  const up = ri(1, 4);
  const down = ri(2, 6);
  const end = start + up - down;
  if (end < 1) return spatial(d, arena);
  const lbl = (n: number) => `${n}${ord(n)} step`;
  return {
    game: pickGame(arena, 'run'),
    prompt: `A monkey 🐒 is on the **${lbl(start)}**. It jumps **${up} steps up** and then **${down} steps down**. Where is it now?`,
    answer: lbl(end),
    options: opts(lbl(end), [lbl(start + up + down), lbl(start - up + down), lbl(end + 1), lbl(Math.max(1, end - 1))]),
    hint: `Start at ${start}. Count up ${up}, then count down ${down}.`,
    hintVisual: { kind: 'numberline', from: start, to: start + up, step: 1 },
    steps: [`${start} + ${up} = ${start + up}`, `${start + up} − ${down} = ${end}`, `It is on the ${lbl(end)}.`],
    hots: true,
    mistakes: tags(lbl(end), [[lbl(start + up + down), 'Went up both times'], [lbl(start - up + down), 'Mixed up up and down']]),
  };
};

const VENN_SETS = [
  { left: 'Fruits', right: 'Red things', both: ['🍎', '🍓', '🍒'], leftOnly: ['🍌', '🍇', '🍐', '🥭'], rightOnly: ['🚒', '🎈', '❤️', '🌹'] },
  { left: 'Animals', right: 'Can fly', both: ['🐦', '🦅', '🦆', '🦋'], leftOnly: ['🐶', '🐱', '🐘', '🐟'], rightOnly: ['✈️', '🚁', '🪁', '🎈'] },
  { left: 'Round things', right: 'Toys', both: ['⚽', '🏀', '🪀'], leftOnly: ['🍊', '🌍', '🍪'], rightOnly: ['🧸', '🪁', '🚂'] },
];

const venn: Gen = (d, arena) => {
  if (d >= 4) {
    // Numbers in a Venn diagram
    const L = { name: 'Even numbers', test: (n: number) => n % 2 === 0 };
    const R = d === 4 ? { name: 'Less than 20', test: (n: number) => n < 20 } : { name: 'In the 5 times table', test: (n: number) => n % 5 === 0 };
    const nums = sample([...Array(40).keys()].map((x) => x + 1), d === 4 ? 9 : 11).filter((n) => L.test(n) || R.test(n));
    const both = nums.filter((n) => L.test(n) && R.test(n));
    const lo = nums.filter((n) => L.test(n) && !R.test(n));
    const ro = nums.filter((n) => !L.test(n) && R.test(n));
    if (!both.length || !lo.length || !ro.length) return venn(d, arena);
    const ask = pick(['both', 'leftOnly', 'all']);
    const ans = ask === 'both' ? both.length : ask === 'leftOnly' ? lo.length : nums.length;
    return {
      game: 'pick',
      prompt:
        ask === 'both'
          ? `How many numbers are **${L.name.toLowerCase()}** AND **${R.name.toLowerCase()}**?`
          : ask === 'leftOnly'
            ? `How many numbers are **${L.name.toLowerCase()}** but **NOT ${R.name.toLowerCase()}**?`
            : `How many numbers are there **in all**?`,
      answer: String(ans),
      options: numOpts(ans, [both.length + lo.length, lo.length, both.length, ro.length].filter((x) => x !== ans)),
      visual: { kind: 'venn', left: L.name, right: R.name, leftOnly: lo.map(String), both: both.map(String), rightOnly: ro.map(String) },
      hint: `The middle part (where the circles overlap) belongs to BOTH circles.`,
      steps: [`Both: ${both.join(', ')}`, `Only ${L.name.toLowerCase()}: ${lo.join(', ')}`, `Answer: ${ans}`],
      hots: true,
      mistakes: ask === 'leftOnly' ? tags(String(ans), [[both.length + lo.length, 'Also counted the middle part']]) : undefined,
    };
  }
  const s = pick(VENN_SETS);
  const both = sample(s.both, d === 1 ? 1 : 2);
  const lo = sample(s.leftOnly, 3);
  const ro = sample(s.rightOnly, 3);
  const visual: Visual = { kind: 'venn', left: s.left, right: s.right, leftOnly: lo, both, rightOnly: ro };
  if (d <= 2) {
    const ans = both[0];
    return {
      game: 'pick',
      prompt: `Which one is **${s.left.toLowerCase()}** AND **${s.right.toLowerCase()}**?`,
      answer: ans,
      options: shuffle([ans, lo[0], ro[0], lo[1]]),
      visual,
      hint: `Look in the middle, where the two circles overlap.`,
      steps: [`The middle part belongs to both circles.`, `${ans} is in the middle.`],
    };
  }
  return {
    game: 'pick',
    prompt: `How many things are **${s.left.toLowerCase()}** but **NOT ${s.right.toLowerCase()}**?`,
    answer: String(lo.length),
    options: numOpts(lo.length, [lo.length + both.length, both.length]),
    visual,
    hint: `Count only the part of the "${s.left}" circle that is outside the middle.`,
    steps: [`Only ${s.left.toLowerCase()}: ${lo.join(' ')}`, `That is ${lo.length}.`],
    hots: true,
    mistakes: tags(String(lo.length), [[lo.length + both.length, 'Also counted the middle part']]),
  };
};

// =====================================================================
// Olympiad Castle
// =====================================================================

type Clue = { text: string; test: (n: number) => boolean };

function cluesFor(n: number, d: Difficulty): Clue[] {
  const t = Math.floor(n / 10) % 10;
  const o = n % 10;
  const ds = t + o;
  const lo = Math.max(1, n - ri(5, 15));
  const hi = n + ri(5, 15);
  const list: Clue[] = [
    { text: `I am **greater than ${lo}**.`, test: (x) => x > lo },
    { text: `I am **less than ${hi}**.`, test: (x) => x < hi },
    { text: `My digits **add up to ${ds}**.`, test: (x) => Math.floor(x / 10) + (x % 10) === ds },
    { text: `I am an **${n % 2 ? 'odd' : 'even'}** number.`, test: (x) => x % 2 === n % 2 },
  ];
  if (d <= 3) list.push({ text: `My **ones digit is ${o}**.`, test: (x) => x % 10 === o });
  if (t > o && d >= 3) list.push({ text: `My **tens digit is ${t - o} more** than my ones digit.`, test: (x) => Math.floor(x / 10) - (x % 10) === t - o });
  if (o > t && d >= 3) list.push({ text: `My **ones digit is ${o - t} more** than my tens digit.`, test: (x) => (x % 10) - Math.floor(x / 10) === o - t });
  if (n % 5 === 0) list.push({ text: `I am in the **5 times table**.`, test: (x) => x % 5 === 0 });
  return list;
}

const clueNumbers: Gen = (d, arena) => {
  const [lo, hi] = d <= 2 ? [10, 50] : [10, 99];
  for (let tries = 0; tries < 200; tries++) {
    const n = ri(lo + 5, hi - 5);
    const all = shuffle(cluesFor(n, d));
    all.sort((a, b) => Number(/greater|less/.test(b.text)) - Number(/greater|less/.test(a.text)));
    const chosen: Clue[] = [];
    let cands = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
    for (const c of all) {
      const next = cands.filter(c.test);
      if (next.length < cands.length) {
        chosen.push(c);
        cands = next;
      }
      if (cands.length === 1) break;
    }
    if (cands.length !== 1 || chosen.length > 4 || chosen.length < 2) continue;
    // Require at least one clue that needs thinking about digits or tables;
    // the hardest level needs a digit-relationship clue.
    if (!chosen.some((c) => /add up|tens digit|ones digit is \d+ more|times table/.test(c.text))) continue;
    if (d === 5 && !chosen.some((c) => /more\*\* than my/.test(c.text))) continue;
    const near = shuffle(
      Array.from({ length: 30 }, (_, i) => n - 15 + i).filter((x) => x !== n && x >= lo && x <= 99 && chosen.some((c) => c.test(x))),
    );
    return {
      game: arena ? 'pick' : 'mystery',
      prompt: `Who am I? Read the clues!`,
      answer: String(n),
      options: opts(String(n), near.map(String)),
      data: { type: 'mystery', clues: chosen.map((c) => c.text) },
      hint: `Use one clue at a time and cross out numbers that don't fit.`,
      steps: [...chosen.map((c) => `✔ ${c.text.replace(/\*\*/g, '')}`), `Only ${n} fits every clue.`],
      hots: true,
    };
  }
  return clueNumbers(d, arena);
};

const multiStep: Gen = (d, arena) => {
  const name = pick(NAMES);
  const g = pickGame(arena, 'run');
  const kind = pick(d <= 2 ? ['spend2', 'getgive'] : ['spend2', 'getgive', 'groups_left', 'compare_total', 'boots']);
  if (kind === 'spend2') {
    const have = d <= 2 ? pick([20, 30, 50]) : pick([50, 100]);
    const a = ri(3, Math.floor(have / 3));
    const b = ri(3, Math.floor(have / 3));
    const ans = have - a - b;
    return {
      game: g,
      prompt: `${name} has **₹${have}**, buys a pencil for **₹${a}** and an eraser for **₹${b}**. How much money is **left**?`,
      answer: `₹${ans}`,
      options: opts(`₹${ans}`, [have - a, have - b, ans + 10, a + b, ans - 1].filter((x) => x > 0).map((x) => `₹${x}`)),
      hint: `Step 1: How much did ${name} spend? Step 2: Take that away from ₹${have}.`,
      steps: [`Spent: ₹${a} + ₹${b} = ₹${a + b}`, `Left: ₹${have} − ₹${a + b} = ₹${ans}`],
      hots: true,
      mistakes: tags(`₹${ans}`, [[`₹${have - a}`, 'Did only the first step'], [`₹${a + b}`, 'Found the amount spent, not what is left']]),
    };
  }
  if (kind === 'boots') {
    // Sample paper Q12 style, scaled to two digits
    const scarf = ri(30, 45);
    const cake = ri(15, 30);
    const less = pick([5, 10]);
    const boots = scarf - less;
    const total = scarf + cake + boots;
    return {
      game: g,
      prompt: `A scarf costs **₹${scarf}**. A cake costs **₹${cake}**. Boots cost **₹${less} less** than the scarf. What is the **total** cost of all 3?`,
      answer: `₹${total}`,
      options: opts(`₹${total}`, [scarf + cake, scarf + cake + scarf + less, total + 10, total - 10].map((x) => `₹${x}`)),
      hint: `Step 1: Find the cost of the boots. Step 2: Add all three.`,
      steps: [`Boots: ₹${scarf} − ₹${less} = ₹${boots}`, `Total: ₹${scarf} + ₹${cake} + ₹${boots} = ₹${total}`],
      hots: true,
      mistakes: tags(`₹${total}`, [[`₹${scarf + cake + scarf + less}`, 'Made the boots cost more instead of less'], [`₹${scarf + cake}`, 'Forgot the boots']]),
    };
  }
  if (kind === 'getgive') {
    const it = pick(ITEMS);
    const a = ri(10, d <= 2 ? 30 : 50);
    const b = ri(5, 20);
    const c = ri(3, a);
    const ans = a + b - c;
    return {
      game: g,
      prompt: `${name} had **${a} ${it.name}**, got **${b} more**, then gave **${c}** to a friend. How many now?`,
      answer: String(ans),
      options: numOpts(ans, [a + b, a - c, a + b + c]),
      hint: `Step 1: ${a} + ${b}. Step 2: take away ${c}.`,
      steps: [`${a} + ${b} = ${a + b}`, `${a + b} − ${c} = ${ans}`],
      hots: true,
      mistakes: tags(String(ans), [[a + b, 'Did only the first step'], [a + b + c, 'Added the number given away']]),
    };
  }
  if (kind === 'groups_left') {
    const per = ri(2, 5);
    const days = ri(3, 6);
    const start = per * days + ri(3, 15);
    const ans = start - per * days;
    return {
      game: g,
      prompt: `Dino has **${start} apples**. It eats **${per} apples every day** for **${days} days**. How many apples are left?`,
      answer: String(ans),
      options: numOpts(ans, [per * days, start - per, start - days]),
      hint: `Step 1: apples eaten = ${per} × ${days}. Step 2: subtract from ${start}.`,
      steps: [`Eaten: ${per} × ${days} = ${per * days}`, `Left: ${start} − ${per * days} = ${ans}`],
      hots: true,
      mistakes: tags(String(ans), [[per * days, 'Found the apples eaten, not those left'], [start - per, 'Took away only one day']]),
    };
  }
  const a = ri(15, 40);
  const more = ri(5, 15);
  const ans = a + a + more;
  const other = pick(NAMES.filter((n) => n !== name));
  return {
    game: g,
    prompt: `${name} has **${a} stickers**. ${other} has **${more} more** than ${name}. How many stickers do they have **together**?`,
    answer: String(ans),
    options: numOpts(ans, [a + more, a + a, ans + more]),
    hint: `Step 1: find how many ${other} has (${a} + ${more}). Step 2: add both.`,
    steps: [`${other}: ${a} + ${more} = ${a + more}`, `Together: ${a} + ${a + more} = ${ans}`],
    hots: true,
    mistakes: tags(String(ans), [[a + more, `Found only ${other}’s stickers`]]),
  };
};

// =====================================================================
// registry
// =====================================================================

const GENERATORS: Record<SkillId, Gen> = {
  number_names: numberNames,
  place_value: placeValue,
  compare_numbers: compareNumbers,
  ordering,
  number_neighbours: numberNeighbours,
  skip_counting: skipCounting,
  even_odd: evenOdd,
  addition_no_carry: (d, a) => additionQ(d, a, false),
  addition_carry: (d, a) => additionQ(d, a, true),
  subtraction_no_borrow: (d, a) => subtractionQ(d, a, false),
  subtraction_borrow: (d, a) => subtractionQ(d, a, true),
  missing_number_ops: missingNumberOps,
  add_sub_word: addSubWord,
  repeated_addition: repeatedAddition,
  multiplication,
  equal_sharing: equalSharing,
  shapes_2d: shapes2d,
  solids_3d: solids3d,
  count_shapes: countShapes,
  symmetry,
  clock_reading: clockReading,
  calendar,
  duration,
  money_total: moneyTotal,
  money_change: moneyChange,
  measurement,
  temperature,
  patterns,
  odd_one_out: oddOneOut,
  analogy,
  coding_decoding: codingDecoding,
  ranking,
  data_pictograph: dataPictograph,
  spatial,
  venn,
  clue_numbers: clueNumbers,
  multi_step: multiStep,
};

/** Skills whose numeric answers children should sometimes type, not pick. */
const TYPEABLE: SkillId[] = [
  'addition_no_carry',
  'addition_carry',
  'subtraction_no_borrow',
  'subtraction_borrow',
  'missing_number_ops',
  'multiplication',
  'number_neighbours',
  'add_sub_word',
  'repeated_addition',
  'equal_sharing',
  'place_value',
  'number_names',
];

let counter = 0;

export function generate(skill: SkillId, difficulty: Difficulty, opts: { arena?: boolean } = {}): Question {
  const arena = !!opts.arena;
  const draft = GENERATORS[skill](difficulty, arena);
  let options = draft.options ?? [];
  if (!arena && (draft.game === 'run' || draft.game === 'pick') && /^\d+$/.test(draft.answer) && TYPEABLE.includes(skill) && chance(0.35)) {
    // Producing an answer builds more fluency than recognising one.
    draft.game = 'type';
  } else if (draft.game === 'run' && !arena && chance(0.3)) {
    // Mix interactions: some path choices become picture-tile choices.
    draft.game = 'pick';
  }
  if (draft.game !== 'run') draft.prompt = draft.prompt.replace(/^Which stone is (.+)\?$/, 'What is $1?');
  if (draft.game === 'run' && options.length > 3) {
    const others = options.filter((o) => o !== draft.answer).slice(0, 2);
    options = shuffle([draft.answer, ...others]);
  }
  const words = draft.prompt.split(/\s+/).length;
  return {
    ...draft,
    options,
    id: `${skill}-${Date.now().toString(36)}-${(counter++).toString(36)}`,
    skill,
    difficulty,
    estSeconds: draft.estSeconds ?? Math.round(15 + words * 1.5 + difficulty * 6 + (draft.hots ? 15 : 0)),
  };
}

export const GAME_NAMES: Record<GameType, string> = {
  run: 'Dino Run',
  feed: 'Feed the Dino',
  match: 'Egg Match',
  train: 'Number Train',
  shop: 'Treasure Shop',
  pattern: 'Pattern Cave',
  mystery: 'Mystery Dino',
  lava: 'Lava Crossing',
  type: 'Dino Calculator',
  pick: 'Dino Quest',
};

export type { GameData };
