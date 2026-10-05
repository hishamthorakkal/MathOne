import type { Difficulty, GameData, GameType, Question, ShapeName, SkillId, Visual } from './types';

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

const swapDigits = (n: number) => {
  const s = String(n);
  return s.length === 2 && s[0] !== s[1] && s[1] !== '0' ? Number(s[1] + s[0]) : n + 11;
};

function numOpts(ans: number, likelyMistakes: number[] = [], n = 4): string[] {
  const near = shuffle([ans + 1, ans - 1, ans + 10, ans - 10, ans + 2, ans - 2, swapDigits(ans)]);
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

// ---------- Number Jungle ----------
const placeValue: Gen = (d, arena) => {
  if (d <= 2) {
    const n = ri(d === 1 ? 11 : 21, 99);
    const t = Math.floor(n / 10);
    const o = n % 10;
    if (chance(0.5)) {
      return {
        game: pickGame(arena, 'run'),
        prompt: `How many **tens** are in **${n}**?`,
        answer: String(t),
        options: numOpts(t, [o, n]),
        hint: `${n} = ${tensOnes(n)}`,
        hintVisual: { kind: 'blocks', numbers: [n] },
        steps: [`Split ${n} into tens and ones.`, `${n} = ${t} tens and ${o} ones.`, `So there are ${t} tens.`],
      };
    }
    return {
      game: pickGame(arena, 'run'),
      prompt: `**${t} tens** and **${o} ones** make which number?`,
      answer: String(n),
      options: numOpts(n, [Number(`${o}${t}`), t + o]),
      hint: `${t} tens = ${t * 10}. Then add ${o} ones.`,
      hintVisual: { kind: 'blocks', numbers: [n] },
      steps: [`${t} tens = ${t * 10}`, `${t * 10} + ${o} = ${n}`],
    };
  }
  const n = d === 3 ? ri(101, 499) : ri(101, 999);
  const digits = String(n).split('').map(Number);
  if (d === 3 || chance(0.5)) {
    const pos = ri(0, 2);
    const names = ['hundreds', 'tens', 'ones'];
    const value = digits[pos] * [100, 10, 1][pos];
    if (digits[pos] === 0) return placeValue(d, arena);
    const dupes = digits.filter((x) => x === digits[pos]).length > 1;
    if (dupes) return placeValue(d, arena);
    return {
      game: pickGame(arena, 'run'),
      prompt: `What is the **place value** of **${digits[pos]}** in **${n}**?`,
      answer: String(value),
      options: opts(String(value), [digits[pos], digits[pos] * 10, digits[pos] * 100, digits[pos] * 1000].map(String)),
      hint: `${n} = ${tensOnes(n)}. ${digits[pos]} is in the ${names[pos]} place.`,
      hintVisual: { kind: 'blocks', numbers: [n] },
      steps: [`Find ${digits[pos]} in ${n}: it is in the ${names[pos]} place.`, `${digits[pos]} ${names[pos]} = ${value}.`],
    };
  }
  const [h, t, o] = digits;
  return {
    game: pickGame(arena, 'run'),
    prompt: `**${h * 100} + ${t * 10} + ${o}** = ?`,
    answer: String(n),
    options: numOpts(n, [Number(`${h}${o}${t}`), h + t + o, n + 100]),
    hint: `${h} hundreds, ${t} tens and ${o} ones.`,
    hintVisual: { kind: 'blocks', numbers: [n] },
    steps: [`Hundreds digit: ${h}`, `Tens digit: ${t}`, `Ones digit: ${o}`, `Write them together: ${n}`],
  };
};

const compareNumbers: Gen = (d, arena) => {
  if (d >= 3 && chance(0.35)) {
    const a = d === 3 ? ri(20, 99) : ri(100, 999);
    let b = chance(0.5) ? swapDigits(a) : a + pick([-10, -1, 1, 10]);
    if (b === a) b = a + 1;
    const sign = a > b ? '>' : '<';
    return {
      game: pickGame(arena, 'run'),
      prompt: `Which sign goes in the box?  **${a} ☐ ${b}**`,
      answer: sign,
      options: ['>', '<', '='],
      hint: `Compare from the left. Look at the biggest place first.`,
      steps: [`Compare ${a} and ${b} digit by digit from the left.`, `${a} is ${a > b ? 'greater' : 'smaller'}, so ${a} ${sign} ${b}.`],
    };
  }
  const greatest = chance(0.5);
  let nums: number[];
  if (d <= 1) nums = sample([...Array(50).keys()].map((x) => x + 1), 3);
  else if (d === 2) nums = sample([...Array(90).keys()].map((x) => x + 10), 3);
  else if (d === 3) {
    const base = ri(2, 8) * 10;
    nums = sample([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((x) => base + x), 3);
  } else {
    const ds = sample([1, 2, 3, 4, 5, 6, 7, 8, 9], 3);
    const perms = [
      [0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0],
    ].map((p) => Number(p.map((i) => ds[i]).join('')));
    nums = sample(perms, d === 4 ? 3 : 4);
  }
  const ans = greatest ? Math.max(...nums) : Math.min(...nums);
  return {
    game: pickGame(arena, 'run'),
    prompt: `Which number is the **${greatest ? 'greatest' : 'smallest'}**?`,
    answer: String(ans),
    options: shuffle(nums.map(String)),
    hint: `Look at the ${nums[0] >= 100 ? 'hundreds' : 'tens'} digit first. The ${greatest ? 'bigger' : 'smaller'} digit wins.`,
    hintVisual: { kind: 'blocks', numbers: nums.length <= 3 && nums[0] < 100 ? nums : [] },
    steps: [
      `Compare the first digits of ${nums.join(', ')}.`,
      `If they are the same, compare the next digit.`,
      `The ${greatest ? 'greatest' : 'smallest'} is ${ans}.`,
    ],
  };
};

const ordering: Gen = (d, arena) => {
  const count = d <= 2 ? 4 : 5;
  const max = d === 1 ? 50 : d <= 3 ? 99 : 999;
  const min = d >= 4 ? 100 : 1;
  const set = new Set<number>();
  while (set.size < count) set.add(ri(min, max));
  const stones = [...set];
  const order: 'asc' | 'desc' = d >= 3 && chance(0.5) ? 'desc' : 'asc';
  const sorted = [...stones].sort((a, b) => (order === 'asc' ? a - b : b - a));
  const word = order === 'asc' ? 'smallest to biggest' : 'biggest to smallest';
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
  const max = d <= 2 ? 99 : 999;
  const n = ri(d === 1 ? 2 : 10, max - 11);
  const kind = d === 1 ? pick(['after', 'before']) : pick(['after', 'before', 'between', 'ten_more', 'ten_less']);
  if (kind === 'between' && !arena) {
    return {
      game: 'train',
      prompt: `Which number is missing from the train?`,
      answer: String(n + 1),
      options: numOpts(n + 1, [n - 1, n + 2]),
      data: { type: 'train', seq: [n - 1, n, null, n + 2] },
      hint: `Count on by 1: ${n}, …`,
      steps: [`The numbers go up by 1.`, `After ${n} comes ${n + 1}.`],
    };
  }
  const map = {
    after: { q: `What number comes **just after ${n}**?`, a: n + 1, h: `Count one more than ${n}.` },
    before: { q: `What number comes **just before ${n}**?`, a: n - 1, h: `Count one less than ${n}.` },
    between: { q: `Which number is **between ${n} and ${n + 2}**?`, a: n + 1, h: `It is one more than ${n}.` },
    ten_more: { q: `What is **10 more than ${n}**?`, a: n + 10, h: `10 more changes only the tens digit.` },
    ten_less: { q: `What is **10 less than ${n}**?`, a: n - 10, h: `10 less changes only the tens digit.` },
  } as const;
  const k = map[kind as keyof typeof map];
  return {
    game: pickGame(arena, 'run'),
    prompt: k.q,
    answer: String(k.a),
    options: numOpts(k.a, [n, n + 2, n - 2]),
    hint: k.h,
    steps: [k.h, `The answer is ${k.a}.`],
  };
};

const skipCounting: Gen = (d, arena) => {
  let seq: number[];
  let rule: string;
  if (d === 1) {
    const step = pick([2, 5, 10]);
    const start = step * ri(0, 4);
    seq = [0, 1, 2, 3, 4].map((i) => start + i * step);
    rule = `add ${step}`;
  } else if (d === 2) {
    const step = pick([2, 3, 5, 10]);
    const start = ri(1, 30);
    seq = [0, 1, 2, 3, 4].map((i) => start + i * step);
    rule = `add ${step}`;
  } else if (d === 3) {
    const step = pick([3, 4, 5, 10]);
    const start = ri(30, 70);
    const down = chance(0.5);
    seq = [0, 1, 2, 3, 4].map((i) => (down ? start + 40 - i * step : start + i * step));
    rule = down ? `take away ${step}` : `add ${step}`;
  } else if (d === 4) {
    const step = pick([20, 25, 50, 100]);
    const start = step * ri(1, 4);
    seq = [0, 1, 2, 3, 4].map((i) => start + i * step);
    rule = `add ${step}`;
  } else {
    // growing differences: +1, +2, +3 …
    const start = ri(1, 10);
    const inc = ri(1, 2);
    seq = [start];
    for (let i = 1; i < 5; i++) seq.push(seq[i - 1] + i * inc);
    rule = `the jump grows by ${inc} each time`;
  }
  const missing = d === 1 ? ri(2, 4) : ri(1, 4);
  const ans = seq[missing];
  const step = seq[1] - seq[0];
  return {
    game: arena ? 'pick' : 'train',
    prompt: `Complete the number train!`,
    answer: String(ans),
    options: numOpts(ans, [ans + 1, ans - 1, ans + step, ans - step]),
    data: { type: 'train', seq: seq.map((x, i) => (i === missing ? null : x)) },
    hint: `Look at the jump between two carriages: ${rule}.`,
    steps: [`The rule is: ${rule}.`, `So the missing number is ${ans}.`],
  };
};

const evenOdd: Gen = (d, arena) => {
  if (d >= 4) {
    const a = ri(10, 40);
    const b = a + ri(6, 10);
    const evens = [];
    for (let i = a + 1; i < b; i++) if (i % 2 === 0) evens.push(i);
    return {
      game: pickGame(arena, 'run'),
      prompt: `How many **even** numbers are there **between ${a} and ${b}**?`,
      answer: String(evens.length),
      options: numOpts(evens.length, [evens.length + 1, evens.length - 1]),
      hint: `Even numbers end in 0, 2, 4, 6 or 8. Count them one by one.`,
      steps: [`Numbers between ${a} and ${b}: ${a + 1} … ${b - 1}`, `Even ones: ${evens.join(', ')}`, `That is ${evens.length}.`],
      hots: true,
    };
  }
  const wantEven = chance(0.5);
  const max = d === 1 ? 20 : d === 2 ? 99 : 999;
  const target = (() => {
    let n = ri(2, max);
    if ((n % 2 === 0) !== wantEven) n += 1;
    return n;
  })();
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
    steps: [`Check the last digit of each number.`, `${target} ends in ${target % 10}, so it is ${wantEven ? 'even' : 'odd'}.`],
  };
};

// ---------- Volcano Valley ----------
function addPair(d: Difficulty, carry: boolean): [number, number] {
  for (let tries = 0; tries < 200; tries++) {
    let a: number, b: number;
    if (d === 1) [a, b] = carry ? [ri(5, 9), ri(5, 9)] : [ri(1, 6), ri(1, 4)];
    else if (d === 2) [a, b] = [ri(11, 89), ri(1, 9)];
    else if (d === 3) [a, b] = [ri(11, 79), ri(11, 49)];
    else if (d === 4) [a, b] = [ri(101, 799), ri(11, 99)];
    else [a, b] = [ri(101, 599), ri(101, 399)];
    const hasCarry = (a % 10) + (b % 10) >= 10 || (Math.floor(a / 10) % 10) + (Math.floor(b / 10) % 10) >= 10;
    if (hasCarry === carry && a + b < 1000) return [a, b];
  }
  return carry ? [36, 27] : [23, 14];
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

function additionQ(d: Difficulty, arena: boolean, carry: boolean): Draft {
  if (!arena && d <= 3 && chance(0.25)) return opMatch(d, '+', carry);
  const [a, b] = addPair(d, carry);
  const s = a + b;
  // classic mistake: add each place but forget to carry
  const noCarryMistake = Number(
    String(a)
      .padStart(3, '0')
      .split('')
      .map((x, i) => (Number(x) + Number(String(b).padStart(3, '0')[i])) % 10)
      .join(''),
  );
  const onesSum = (a % 10) + (b % 10);
  const story = !arena && chance(0.4) && d <= 3;
  const it = pick(ITEMS);
  return {
    game: pickGame(arena, 'run'),
    prompt: story
      ? `Dino collected **${a} ${it.name}** and found **${b} more**. How many now?`
      : `Which stone is **${a} + ${b}**?`,
    answer: String(s),
    options: numOpts(s, carry ? [noCarryMistake, s - 10] : [s + 10]),
    hint: a >= 10 ? `${a} = ${tensOnes(a)}\n${b} = ${tensOnes(b)}` : `Start at ${a} and count on ${b}.`,
    hintVisual: { kind: 'blocks', numbers: [a, b] },
    steps:
      a >= 10
        ? [
            `Add the ones: ${a % 10} + ${b % 10} = ${onesSum}${onesSum >= 10 ? ` → write ${onesSum % 10}, carry 1 ten` : ''}.`,
            `Add the tens${onesSum >= 10 ? ' (plus the carried 1)' : ''}.`,
            `${a} + ${b} = ${s}`,
          ]
        : [`Start at ${a}.`, `Count on ${b}: ${[...Array(b).keys()].map((i) => a + i + 1).join(', ')}.`, `${a} + ${b} = ${s}`],
  };
}

function subPair(d: Difficulty, borrow: boolean): [number, number] {
  for (let tries = 0; tries < 200; tries++) {
    let a: number, b: number;
    if (d === 1) [a, b] = borrow ? [ri(11, 18), ri(3, 9)] : [ri(5, 9), ri(1, 4)];
    else if (d === 2) [a, b] = [ri(20, 99), ri(1, 9)];
    else if (d === 3) [a, b] = [ri(30, 99), ri(11, 29)];
    else if (d === 4) [a, b] = [ri(200, 999), ri(11, 99)];
    else [a, b] = [ri(300, 999), ri(101, 299)];
    if (b >= a) continue;
    const needs = a % 10 < b % 10 || Math.floor(a / 10) % 10 < Math.floor(b / 10) % 10;
    if (needs === borrow) return [a, b];
  }
  return borrow ? [52, 27] : [58, 23];
}

function subtractionQ(d: Difficulty, arena: boolean, borrow: boolean): Draft {
  if (!arena && d <= 3 && chance(0.25)) return opMatch(d, '−', borrow);
  const [a, b] = subPair(d, borrow);
  const diff = a - b;
  // classic mistake: subtract the smaller digit from the bigger in each place
  const mistake = Number(
    String(a)
      .padStart(3, '0')
      .split('')
      .map((x, i) => Math.abs(Number(x) - Number(String(b).padStart(3, '0')[i])))
      .join(''),
  );
  const story = !arena && chance(0.4) && d <= 3;
  const it = pick(ITEMS);
  return {
    game: pickGame(arena, 'run'),
    prompt: story
      ? `Dino had **${a} ${it.name}**. It gave away **${b}**. How many are left?`
      : `Which stone is **${a} − ${b}**?`,
    answer: String(diff),
    options: numOpts(diff, borrow ? [mistake, diff + 10] : [a + b, diff - 10]),
    hint: a >= 10 ? `${a} = ${tensOnes(a)}\nTake away ${b}.` : `Start at ${a} and count back ${b}.`,
    hintVisual: { kind: 'blocks', numbers: [a] },
    steps:
      a % 10 < b % 10
        ? [
            `Ones: ${a % 10} is smaller than ${b % 10}, so borrow 1 ten → ${(a % 10) + 10} ones.`,
            `${(a % 10) + 10} − ${b % 10} = ${(a % 10) + 10 - (b % 10)}`,
            `Now subtract the tens (one ten was borrowed).`,
            `${a} − ${b} = ${diff}`,
          ]
        : [`Subtract the ones: ${a % 10} − ${b % 10} = ${(a % 10) - (b % 10)}`, `Subtract the tens.`, `${a} − ${b} = ${diff}`],
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
      steps: [`${have} + ? = ${need}`, `${need} − ${have} = ${need - have}`, `Dino needs ${need - have} more.`],
    };
  }
  const plus = chance(0.6);
  const big = d >= 4;
  const a = big ? ri(110, 500) : ri(12, 60);
  const x = big ? ri(15, 199) : ri(8, 35);
  if (plus) {
    const total = a + x;
    return {
      game: pickGame(arena, 'run'),
      prompt: `**${a} + ☐ = ${total}**. What is in the box?`,
      answer: String(x),
      options: numOpts(x, [total + a, x + 10]),
      hint: `Think: what do I add to ${a} to make ${total}? Try ${total} − ${a}.`,
      steps: [`☐ = ${total} − ${a}`, `☐ = ${x}`, `Check: ${a} + ${x} = ${total} ✔`],
      hots: d >= 4,
    };
  }
  const start = a + x;
  return {
    game: pickGame(arena, 'run'),
    prompt: `**☐ − ${x} = ${a}**. What is in the box?`,
    answer: String(start),
    options: numOpts(start, [a - x > 0 ? a - x : a + 1, start + 10]),
    hint: `Work backwards: put back the ${x} you took away. ${a} + ${x} = ?`,
    steps: [`☐ = ${a} + ${x}`, `☐ = ${start}`, `Check: ${start} − ${x} = ${a} ✔`],
    hots: d >= 4,
  };
};

const addSubWord: Gen = (d, arena) => {
  const name = pick(NAMES);
  const max = d <= 2 ? 20 : d <= 4 ? 99 : 500;
  const kind = d <= 2 ? pick(['more', 'less']) : pick(['more', 'less', 'compare', 'money']);
  const a = ri(Math.ceil(max / 3), max);
  const b = ri(2, Math.floor(max / 3));
  const it = pick(ITEMS);
  let prompt: string;
  let ans: number;
  let steps: string[];
  if (kind === 'more') {
    prompt = `${name} has **${a} ${it.name}** and gets **${b} more**. How many ${it.name} now?`;
    ans = a + b;
    steps = [`"More" means add.`, `${a} + ${b} = ${ans}`];
  } else if (kind === 'less') {
    prompt = `${name} has **${a} ${it.name}** and gives away **${b}**. How many are left?`;
    ans = a - b;
    steps = [`"Gives away" means subtract.`, `${a} − ${b} = ${ans}`];
  } else if (kind === 'compare') {
    const other = pick(NAMES.filter((n) => n !== name));
    prompt = `${name} has **${a} ${it.name}**. ${other} has **${b}**. How many **more** does ${name} have?`;
    ans = a - b;
    steps = [`"How many more" means find the difference.`, `${a} − ${b} = ${ans}`];
  } else {
    prompt = `${name} has **₹${a}** and gets **₹${b} more**. How much money now?`;
    ans = a + b;
    steps = [`Add the money.`, `₹${a} + ₹${b} = ₹${ans}`];
  }
  const isMoney = kind === 'money';
  const fmt = (n: number) => (isMoney ? `₹${n}` : String(n));
  const ansN = ans;
  return {
    game: pickGame(arena, 'run'),
    prompt,
    answer: fmt(ansN),
    options: opts(
      fmt(ansN),
      shuffle([kind === 'more' || kind === 'money' ? a - b : a + b, ansN + 10, ansN - 1, ansN + 1, ansN - 10])
        .filter((x) => x >= 0)
        .map(fmt),
    ),
    hint: `Find the key words. Do we put together (add) or take away (subtract)?`,
    steps,
  };
};

// ---------- Dino Nest ----------
const repeatedAddition: Gen = (d, arena) => {
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
  };
};

const multiplication: Gen = (d, arena) => {
  const tables = d === 1 ? [2, 10] : d === 2 ? [2, 5, 10] : [2, 3, 4, 5, 10]; // Class 2 syllabus tables
  const maxB = d <= 2 ? 5 : 10;
  if (!arena && d <= 4 && chance(0.4)) {
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
    hintVisual: { kind: 'groups', groups: b, each: t, icon: '🥚' },
    steps: [`${Array(b).fill(t).join(' + ')}`, `= ${t * b}`],
  };
};

const equalSharing: Gen = (d, arena) => {
  const groups = d <= 2 ? pick([2, 3]) : ri(2, 5);
  const each = d === 1 ? ri(2, 4) : d <= 3 ? ri(2, 6) : ri(3, 10);
  const total = groups * each;
  const name = pick(NAMES);
  const icon = pick(['🥚', '🍪', '🍬', '🍎']);
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
    };
  }
  return {
    game: pickGame(arena, 'pick'),
    prompt: `Share **${total} ${icon}** equally into **${groups} nests**. How many in each nest?`,
    answer: String(each),
    options: numOpts(each, [total - groups, groups, each + 1]),
    visual: { kind: 'emoji', text: icon.repeat(total) },
    hint: `Put one in each nest, again and again, until none are left.`,
    hintVisual: { kind: 'groups', groups, each, icon },
    steps: [`${total} ÷ ${groups}: think ${groups} × ? = ${total}`, `${groups} × ${each} = ${total}`, `So each nest gets ${each}.`],
  };
};

// ---------- Shape Caves ----------
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
      hint: `Count the sides of each shape in your head. Tri = 3, Penta = 5, Hexa = 6.`,
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
  if (d >= 3 && chance(0.5)) {
    const facts = [
      { q: 'How many **faces** does a **cube** have?', a: '6', o: ['4', '6', '8', '12'], h: 'Think of a dice: count the dots faces 1 to 6.' },
      { q: 'Which solid has **no flat face**?', a: 'Sphere', o: ['Sphere', 'Cube', 'Cone', 'Cylinder'], h: 'It is perfectly round all over, like a ball.' },
      { q: 'Which solid can **roll and slide**?', a: 'Cylinder', o: ['Cylinder', 'Cube', 'Sphere', 'Cuboid'], h: 'It has flat faces at the ends and a curved side, like a can.' },
      { q: 'How many **corners** does a **cube** have?', a: '8', o: ['4', '6', '8', '12'], h: '4 corners on top and 4 on the bottom.' },
      { q: 'Which solid has **only one** flat face?', a: 'Cone', o: ['Cone', 'Cylinder', 'Cube', 'Sphere'], h: 'Think of an ice-cream cone.' },
    ];
    const f = pick(facts.slice(0, d === 3 ? 3 : 5));
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
  return {
    game: 'pick',
    prompt: `${/^[aeiou]/i.test(rest.join(' ')) ? 'An' : 'A'} **${rest.join(' ')}** is shaped like a…`,
    answer: s.solid,
    options: opts(s.solid, shuffle(SOLIDS.map((x) => x.solid))),
    visual: { kind: 'emoji', text: emoji },
    hint: `Is it round? Does it have flat faces? Does it have a point?`,
    steps: [`A ${rest.join(' ')} looks like a ${s.solid}.`],
  };
};

const countShapes: Gen = (d, _arena) => {
  const pool: ShapeName[] = d <= 2 ? ['circle', 'triangle', 'square'] : ['circle', 'triangle', 'square', 'rectangle', 'hexagon', 'oval'];
  const total = d <= 2 ? ri(5, 7) : d === 3 ? ri(7, 9) : ri(9, 12);
  const items = Array.from({ length: total }, () => pick(pool));
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

// ---------- Time Mountain ----------
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
  const m = d === 1 ? 0 : d === 2 ? pick([0, 30]) : d === 3 ? pick([15, 30, 45]) : pick([5, 10, 20, 25, 35, 40, 50, 55]);
  if (d === 5 && chance(0.5)) {
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
  };
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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
    };
  }
  if (d === 2) {
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
    const s = ri(1, 10);
    const add = pick([15, 30, 45]);
    const ans = timeLabel(s, add);
    return {
      game: g,
      prompt: `It is **${s} o'clock**. What time will it be after **${add} minutes**?`,
      answer: ans,
      options: opts(ans, [timeLabel(s, (add + 15) % 60), timeLabel(s + 1, add), timeLabel(s, add === 15 ? 45 : 15), timeLabel(s + 1, 0)]),
      hint: `15 minutes is a quarter hour. 30 minutes is half an hour.`,
      steps: [`${add} minutes after ${s} o'clock is ${ans}.`],
    };
  }
  const facts = [
    { q: 'How many **minutes** are in **1 hour**?', a: '60', o: ['30', '60', '100', '24'] },
    { q: '**Half an hour + 15 minutes** = how many minutes?', a: '45', o: ['45', '30', '65', '35'] },
    { q: 'How many **hours** are in **1 day**?', a: '24', o: ['12', '24', '60', '7'] },
    { q: 'How many **days** are in **2 weeks**?', a: '14', o: ['7', '14', '12', '21'] },
  ];
  const f = pick(facts);
  return {
    game: g,
    prompt: f.q,
    answer: f.a,
    options: shuffle(f.o),
    hint: `1 hour = 60 minutes. Half an hour = 30 minutes. 1 week = 7 days.`,
    steps: [`The answer is ${f.a}.`],
    hots: true,
  };
};

// ---------- Treasure Market ----------
const COINS = [1, 2, 5, 10, 20, 50];

const moneyTotal: Gen = (d, arena) => {
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
  };
};

const measurement: Gen = (d, arena) => {
  const g = pickGame(arena, 'run');
  if (d <= 2) {
    const sets = [
      { q: 'Which is **heavier**?', a: '🐘 Elephant', o: ['🐘 Elephant', '🐈 Cat', '🐭 Mouse'] },
      { q: 'Which is **lighter**?', a: '🪶 Feather', o: ['🪶 Feather', '🧱 Brick', '🍉 Watermelon'] },
      { q: 'Which is **taller**?', a: '🦒 Giraffe', o: ['🦒 Giraffe', '🐕 Dog', '🐇 Rabbit'] },
      { q: 'Which holds **more** water?', a: '🪣 Bucket', o: ['🪣 Bucket', '☕ Cup', '🥄 Spoon'] },
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
      prompt: `A ${things[0]} is **${a} cm** long. A ${things[1]} is **${b} cm** long. How much **longer** is the ${things[0]}?`,
      answer: `${a - b} cm`,
      options: opts(`${a - b} cm`, [a + b, a - b + 1, a - b - 1, a - b + 10].filter((x) => x > 0).map((x) => `${x} cm`)),
      hint: `"How much longer" means find the difference: ${a} − ${b}.`,
      steps: [`${a} − ${b} = ${a - b}`, `The ${things[0]} is ${a - b} cm longer.`],
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

// ---------- Puzzle Forest ----------
const PATTERN_SETS = [
  ['🔴', '🔵', '🟢', '🟡'],
  ['🍎', '🍌', '🍇', '🍊'],
  ['⭐', '🌙', '☀️', '☁️'],
  ['🐶', '🐱', '🐰', '🐸'],
  ['▲', '■', '●', '◆'],
];

const patterns: Gen = (d, arena) => {
  if (d >= 4) {
    // numeric patterns
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
      if (seq[5] > 200 || chance(0.5)) {
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
    };
  }
  const set = pick(PATTERN_SETS);
  const units: string[][] =
    d === 1
      ? [[set[0], set[1]]]
      : d === 2
        ? [[set[0], set[1], set[2]], [set[0], set[0], set[1]], [set[0], set[1], set[1]]]
        : [[set[0], set[1], set[1], set[2]], [set[0], set[1], set[2], set[1]], [set[0], set[0], set[1], set[2]]];
  const unit = pick(units);
  const len = unit.length * 2 + ri(1, unit.length - 1);
  const full = Array.from({ length: len + 1 }, (_, i) => unit[i % unit.length]);
  const missingAt = d === 3 && chance(0.5) ? ri(1, len - 1) : len;
  const ans = full[missingAt];
  const items = missingAt === len ? [...full.slice(0, len), '?'] : full.slice(0, len).map((x, i) => (i === missingAt ? '?' : x));
  const distinct = [...new Set(set)];
  return {
    game: arena ? 'pick' : 'pattern',
    prompt: missingAt === len ? `What comes next in the pattern?` : `What is missing from the pattern?`,
    answer: ans,
    options: opts(ans, shuffle(distinct)),
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
    {
      make: () => {
        const ev = sample([12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34], 3);
        return { items: ev, odd: pick([13, 15, 17, 19, 21, 23, 25, 27]), why: 'The others are even numbers.' };
      },
    },
    {
      make: () => {
        const m = sample([10, 15, 20, 25, 30, 35, 40, 45, 50], 3);
        return { items: m, odd: pick([12, 23, 34, 41, 18]), why: 'The others are in the 5 times table.' };
      },
    },
    {
      make: () => {
        const t = ri(2, 7);
        const pts = sample([1, 2, 3, 4, 5, 6, 7, 8, 9], 3).map((o) => t * 10 + o);
        return { items: pts, odd: (t + pick([1, 2])) * 10 + ri(1, 9), why: `The others have ${t} tens.` };
      },
    },
    {
      make: () => {
        const sums = sample([[1, 8], [2, 7], [3, 6], [4, 5], [5, 4], [6, 3], [7, 2]], 3).map(([a, b]) => a * 10 + b);
        return { items: sums, odd: pick([45, 63, 72, 36].filter((x) => !sums.includes(x)).map((x) => x + 1)), why: 'The digits of the others add up to 9.' };
      },
    },
  ];
  const r = pick(rules.slice(0, d === 3 ? 2 : d === 4 ? 3 : 4)).make();
  const all = shuffle([...r.items, r.odd].map(String));
  return {
    game: g === 'run' ? 'pick' : g,
    prompt: `Which number is the **odd one out**?`,
    answer: String(r.odd),
    options: all,
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
  const w = pick(WORDS);
  const code = (s: string, f: (i: number) => string) => s.split('').map((ch) => f(ALPHA.indexOf(ch))).join('');
  if (d <= 2) {
    const short = pick(['CAB', 'BAD', 'ACE', 'BED', 'FED', 'DAB', 'CAGE'.slice(0, 3)]);
    const ans = code(short, (i) => String(i + 1));
    return {
      game: g,
      prompt: `If **A = 1, B = 2, C = 3** … what is the code for **${short}**?`,
      answer: ans,
      options: opts(ans, [ans.split('').reverse().join(''), code(short, (i) => String(i + 2)), code(short, (i) => String(i))].filter((x) => !x.includes('-'))),
      hint: `Count each letter's place in the alphabet: A=1, B=2, C=3, D=4, E=5, F=6, G=7.`,
      steps: short.split('').map((ch) => `${ch} = ${ALPHA.indexOf(ch) + 1}`),
    };
  }
  if (d === 3 || d === 4) {
    const shift = d === 3 ? 1 : pick([1, 2]);
    const ex = pick(WORDS.filter((x) => x !== w));
    const enc = (s: string, k: number) => code(s, (i) => ALPHA[(i + k) % 26]);
    const ans = enc(w, shift);
    return {
      game: g,
      prompt: `If **${ex}** is written as **${enc(ex, shift)}**, how is **${w}** written?`,
      answer: ans,
      options: opts(ans, [enc(w, shift + 1), enc(w, 25), enc(w, shift).split('').reverse().join(''), w]),
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
    };
  }
  const n = d <= 3 ? 3 : 4;
  const people = sample(NAMES, n);
  const order = [...people]; // order[0] is tallest
  const adj = pick([
    ['taller', 'tallest', 'shortest'],
    ['older', 'oldest', 'youngest'],
    ['faster', 'fastest', 'slowest'],
  ]);
  const clues = [];
  for (let i = 0; i < n - 1; i++) clues.push(`**${order[i]}** is ${adj[0]} than **${order[i + 1]}**.`);
  const shuffled = shuffle(clues);
  const askTop = d === 1 || chance(0.5);
  const ans = askTop ? order[0] : order[n - 1];
  return {
    game: g,
    prompt: `Who is the **${askTop ? adj[1] : adj[2]}**?`,
    answer: ans,
    options: shuffle(people),
    data: { type: 'mystery', clues: d === 1 ? clues : shuffled },
    hint: `Put them in a line from ${adj[1]} to ${adj[2]} using each clue.`,
    steps: [`From ${adj[1]} to ${adj[2]}: ${order.join(' → ')}`, `The ${askTop ? adj[1] : adj[2]} is ${ans}.`],
    hots: d >= 3,
  };
};
function ord(n: number) {
  if (n % 100 >= 11 && n % 100 <= 13) return 'th';
  return n % 10 === 1 ? 'st' : n % 10 === 2 ? 'nd' : n % 10 === 3 ? 'rd' : 'th';
}

const dataPictograph: Gen = (d, arena) => {
  const fruits = sample(['🍎 Apples', '🍌 Bananas', '🥭 Mangoes', '🍇 Grapes', '🍊 Oranges'], d <= 2 ? 3 : 4);
  const key = d >= 4 ? 2 : 1;
  const rows = fruits.map((f) => ({ label: f, count: ri(1, 6) * key }));
  if (new Set(rows.map((r) => r.count)).size !== rows.length) return dataPictograph(d, arena);
  const icon = '🧺';
  const visual: Visual = { kind: 'pictograph', icon, rows, key };
  const kind = d === 1 ? 'count' : d === 2 ? pick(['count', 'most', 'least']) : pick(['more', 'total', 'count']);
  if (kind === 'count') {
    const r = pick(rows);
    return {
      game: 'pick',
      prompt: `How many **${r.label.split(' ')[1].toLowerCase()}** were sold?`,
      answer: String(r.count),
      options: numOpts(r.count, [r.count / key, r.count + key, r.count - key].filter((x) => x > 0 && x !== r.count)),
      visual,
      hint: key > 1 ? `Each ${icon} means ${key}. Count the baskets and double.` : `Count the ${icon} in that row.`,
      steps: [`${r.label}: ${r.count / key} baskets × ${key} = ${r.count}`],
    };
  }
  if (kind === 'most' || kind === 'least') {
    const best = [...rows].sort((a, b) => (kind === 'most' ? b.count - a.count : a.count - b.count))[0];
    return {
      game: 'pick',
      prompt: `Which fruit was sold the **${kind}**?`,
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
      prompt: `How many **more ${a.label.split(' ')[1].toLowerCase()}** than **${b.label.split(' ')[1].toLowerCase()}**?`,
      answer: String(diff),
      options: numOpts(diff, [a.count + b.count, diff + key, diff + 1].filter((x) => x !== diff)),
      visual,
      hint: `Find both numbers, then subtract.`,
      steps: [`${a.label}: ${a.count}`, `${b.label}: ${b.count}`, `${a.count} − ${b.count} = ${diff}`],
      hots: true,
    };
  }
  const total = rows.reduce((s, r) => s + r.count, 0);
  return {
    game: 'pick',
    prompt: `How many fruits were sold **in all**?`,
    answer: String(total),
    options: numOpts(total, [total - key, total + key, total / key].filter((x) => x !== total)),
    visual,
    hint: `Find each row's number, then add them all.`,
    steps: [rows.map((r) => r.count).join(' + ') + ` = ${total}`],
  };
};

// ---------- Olympiad Castle ----------
type Clue = { text: string; test: (n: number) => boolean };

function cluesFor(n: number, d: Difficulty): Clue[] {
  const t = Math.floor(n / 10) % 10;
  const o = n % 10;
  const ds = String(n).split('').map(Number).reduce((a, b) => a + b, 0);
  const lo = Math.max(1, n - ri(3, 12));
  const hi = n + ri(3, 12);
  const list: Clue[] = [
    { text: `I am **greater than ${lo}**.`, test: (x) => x > lo },
    { text: `I am **less than ${hi}**.`, test: (x) => x < hi },
    { text: `My digits **add up to ${ds}**.`, test: (x) => String(x).split('').map(Number).reduce((a, b) => a + b, 0) === ds },
    { text: `I am an **${n % 2 ? 'odd' : 'even'}** number.`, test: (x) => x % 2 === n % 2 },
    { text: `My **ones digit is ${o}**.`, test: (x) => x % 10 === o },
  ];
  if (t > o && n < 100) list.push({ text: `My **tens digit is ${t - o} more** than my ones digit.`, test: (x) => Math.floor(x / 10) - (x % 10) === t - o });
  if (n % 5 === 0) list.push({ text: `I am in the **5 times table**.`, test: (x) => x % 5 === 0 });
  if (d <= 2) return list.filter((c) => !c.text.includes('tens digit is'));
  return list;
}

const clueNumbers: Gen = (d, arena) => {
  const [lo, hi] = d <= 2 ? [10, 50] : d <= 4 ? [10, 99] : [100, 300];
  for (let tries = 0; tries < 100; tries++) {
    const n = ri(lo + 5, hi - 5);
    const all = shuffle(cluesFor(n, d));
    // range clues first so the child has somewhere to start
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
    // Require at least one clue that needs thinking about digits or tables.
    if (!chosen.some((c) => /add up|tens digit|times table/.test(c.text))) continue;
    const near = shuffle(
      Array.from({ length: 30 }, (_, i) => n - 15 + i).filter((x) => x !== n && x >= lo && chosen.some((c) => c.test(x))),
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
  const kind = pick(d <= 2 ? ['spend2', 'getgive'] : ['spend2', 'getgive', 'groups_left', 'compare_total']);
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
    };
  }
  if (kind === 'getgive') {
    const it = pick(ITEMS);
    const a = ri(10, d <= 2 ? 30 : 60);
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
  };
};

// ---------- registry ----------
const GENERATORS: Record<SkillId, Gen> = {
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
  clock_reading: clockReading,
  calendar,
  duration,
  money_total: moneyTotal,
  money_change: moneyChange,
  measurement,
  patterns,
  odd_one_out: oddOneOut,
  analogy,
  coding_decoding: codingDecoding,
  ranking,
  data_pictograph: dataPictograph,
  clue_numbers: clueNumbers,
  multi_step: multiStep,
};

let counter = 0;

export function generate(skill: SkillId, difficulty: Difficulty, opts: { arena?: boolean } = {}): Question {
  const arena = !!opts.arena;
  const draft = GENERATORS[skill](difficulty, arena);
  let options = draft.options ?? [];
  // Mix interactions: some path choices become picture-tile choices.
  if (draft.game === 'run' && !arena && chance(0.3)) {
    draft.game = 'pick';
    draft.prompt = draft.prompt.replace(/^Which stone is (.+)\?$/, 'What is $1?');
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
  pick: 'Dino Quest',
};

export type { GameData };
