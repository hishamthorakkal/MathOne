import { SKILL, SKILLS, WORLD, WORLDS, skillsOf, type Section } from './catalog';
import { addDays, daysToExam, fromKey, phaseOf, today } from './dates';
import { generate, pick, shuffle } from './generators';
import { bossReady, currentWorld, isMastered, isUnlocked, masteryOf } from './mastery';
import type { AppState, Difficulty, Question, SkillId, WorldId } from './types';

export type SegmentKind = 'main' | 'secondary' | 'recall' | 'hots' | 'treasure' | 'boss' | 'camp' | 'light' | 'puzzle';

export const SEGMENTS: Record<SegmentKind, { title: string; emoji: string }> = {
  main: { title: 'Main Adventure', emoji: '🗺️' },
  secondary: { title: 'Side Quest', emoji: '🧭' },
  recall: { title: 'Dino Remembers', emoji: '💭' },
  hots: { title: 'Thinking Challenge', emoji: '🧠' },
  treasure: { title: 'Treasure Chest', emoji: '🎁' },
  boss: { title: 'Mini-Boss', emoji: '⚔️' },
  camp: { title: 'Training Camp', emoji: '🏋️' },
  light: { title: 'Easy Warm-up', emoji: '🌤️' },
  puzzle: { title: 'Favourite Puzzle', emoji: '🧩' },
};

export interface MissionItem {
  q: Question;
  segment: SegmentKind;
  followUp?: boolean;
}

export interface MissionPlan {
  kind: 'daily' | 'camp';
  world: WorldId;
  items: MissionItem[];
  intro: string[];
  boss: boolean;
  light: boolean;
}

const clampD = (n: number, cap: number) => Math.max(1, Math.min(cap, n)) as Difficulty;

function makeQ(skill: SkillId, d: Difficulty, avoid: Question[]): Question {
  let q = generate(skill, d);
  for (let i = 0; i < 6 && avoid.some((a) => a.prompt === q.prompt && a.answer === q.answer); i++) q = generate(skill, d);
  return q;
}

/** The skill that felt hardest on the most recent previous practice day. */
export function yesterdaysTricky(state: AppState): SkillId | null {
  const t = today();
  const days = Object.keys(state.days).filter((k) => k < t).sort();
  const last = days[days.length - 1];
  if (!last) return null;
  const tally: Partial<Record<SkillId, number>> = {};
  for (const a of state.attempts) {
    const k = new Date(a.t);
    const key = `${k.getFullYear()}-${String(k.getMonth() + 1).padStart(2, '0')}-${String(k.getDate()).padStart(2, '0')}`;
    if (key !== last || a.mode === 'arena') continue;
    if (a.outcome === 'incorrect' || a.outcome === 'guided' || a.outcome === 'hint') tally[a.skill] = (tally[a.skill] ?? 0) + 1;
  }
  const worst = (Object.entries(tally) as [SkillId, number][]).sort((a, b) => b[1] - a[1])[0];
  return worst ? worst[0] : null;
}

function dueRevision(state: AppState): SkillId[] {
  const t = today();
  return (Object.entries(state.revision) as [SkillId, NonNullable<AppState['revision'][SkillId]>][])
    .filter(([, r]) => r.nextReview <= t && r.priority > 0)
    .sort((a, b) => b[1].priority - a[1].priority)
    .map(([id]) => id);
}

function weakSkills(state: AppState, exclude: SkillId[]): SkillId[] {
  const due = dueRevision(state).filter((s) => !exclude.includes(s));
  // Weak = real struggle (help needed or errors), not merely "not practised much yet".
  const struggle = (id: SkillId) => {
    const sk = state.skills[id];
    if (!sk || sk.total === 0) return 0;
    return (sk.counts.hint + sk.counts.guided + sk.counts.incorrect) / sk.total;
  };
  const low = SKILLS.map((s) => s.id)
    .filter((id) => {
      if (exclude.includes(id) || due.includes(id)) return false;
      const sk = state.skills[id];
      if (!sk || sk.total === 0) return false;
      return struggle(id) >= 0.34 || (sk.total >= 5 && masteryOf(sk) < 0.6);
    })
    .sort((a, b) => struggle(b) - struggle(a));
  return [...due, ...low];
}

function spacedSkills(state: AppState, exclude: SkillId[]): SkillId[] {
  return SKILLS.map((s) => s.id)
    .filter((id) => !exclude.includes(id) && (state.skills[id]?.total ?? 0) > 0)
    .sort((a, b) => (state.skills[a]?.lastSeen ?? 0) - (state.skills[b]?.lastSeen ?? 0));
}

function unlockedSkills(state: AppState): SkillId[] {
  return WORLDS.filter((w) => isUnlocked(state, w.id)).flatMap((w) => skillsOf(w.id));
}

export function buildMission(state: AppState, worldChoice?: WorldId): MissionPlan {
  const t = today();
  const ph = phaseOf(t);
  const left = daysToExam(t);
  const level = (id: SkillId) => state.skills[id]?.level ?? 1;
  const d = (id: SkillId, delta = 0) => clampD(level(id) + delta, ph.cap);
  const items: MissionItem[] = [];
  const add = (skill: SkillId, diff: Difficulty, segment: SegmentKind) =>
    items.push({ q: makeQ(skill, diff, items.map((i) => i.q)), segment });

  const name = state.childName || 'friend';

  // Day before the Olympiad: very light practice, no boss.
  if (left === 1) {
    // Favourite (strongest) skills first, topped up with gentle basics.
    const byStrength = [...unlockedSkills(state)].sort((a, b) => masteryOf(state.skills[b]) - masteryOf(state.skills[a]));
    const basics: SkillId[] = ['addition_no_carry', 'compare_numbers', 'number_neighbours', 'subtraction_no_borrow', 'skip_counting'];
    const easy = [...new Set([...byStrength.slice(0, 3), ...basics])].slice(0, 5);
    shuffle(easy).forEach((id) => add(id, clampD(level(id) - 1, 2), 'light'));
    add('patterns', 2, 'puzzle');
    add('odd_one_out', 2, 'puzzle');
    return {
      kind: 'daily',
      world: 'olympiad_castle',
      items,
      intro: [`🦖 You are ready, ${name}!`, 'Today is a tiny mission: 5 easy questions and 2 favourite puzzles.', 'No Boss Battle today 😊'],
      boss: false,
      light: true,
    };
  }

  const world = worldChoice ?? currentWorld(state);
  const ws = skillsOf(world);
  const learning = ws.filter((id) => !isMastered(state.skills[id]));
  let main = learning[0] ?? [...ws].sort((a, b) => masteryOf(state.skills[a]) - masteryOf(state.skills[b]))[0];
  let secondary = learning[1] ?? pick(ws.filter((x) => x !== main));

  // Final preparation: reduce new learning, lean on weak skills and mixed revision.
  if (ph.phase === 4 && !worldChoice) {
    const weak = weakSkills(state, []);
    if (weak[0]) main = weak[0];
    secondary = pick(unlockedSkills(state).filter((x) => x !== main));
  }

  const used: SkillId[] = [main, secondary];
  const weak = weakSkills(state, used);
  const spaced = spacedSkills(state, [...used, ...weak.slice(0, 2)]);
  const fallback = shuffle(unlockedSkills(state).filter((x) => !used.includes(x)));
  const recall1 = weak[0] ?? spaced[0] ?? fallback[0];
  const recall2 = weak[1] ?? spaced[1] ?? fallback[1];
  const spacedSkill = spaced.find((s) => s !== recall1 && s !== recall2) ?? fallback[2];

  const reasoningPool = unlockedSkills(state).filter((id) => SKILL[id].reasoning);
  const hotsPool = reasoningPool.length ? reasoningPool : (['missing_number_ops', 'patterns', 'clue_numbers'] as SkillId[]);
  const hotsSkill = [...hotsPool].sort((a, b) => masteryOf(state.skills[a]) - masteryOf(state.skills[b]))[ph.phase === 1 ? 0 : Math.floor(Math.random() * Math.min(3, hotsPool.length))];
  const hotsD = clampD(Math.min(Math.max(level(hotsSkill) + 1, ph.phase + 1), level(hotsSkill) + 2), ph.cap);

  // ~60% likely success, ~25% learning edge, ~15% stretch.
  add(main, d(main, -1), 'main');
  add(main, d(main), 'main');
  add(main, d(main), 'main');
  add(secondary, d(secondary, -1), 'secondary');
  add(secondary, d(secondary), 'secondary');
  add(recall1, d(recall1, -1), 'recall');
  add(recall2, d(recall2, -1), 'recall');
  if (spacedSkill) add(spacedSkill, d(spacedSkill), 'recall');
  add(hotsSkill, hotsD, 'hots');

  const boss = bossReady(state, world) && ph.phase !== 5;
  if (boss) {
    const bs = shuffle(ws).slice(0, 3);
    bs.forEach((id) => add(id, d(id), 'boss'));
  } else {
    add(main, d(main, 1), 'treasure');
  }

  const tricky = yesterdaysTricky(state);
  const info = WORLD[world];
  const intro = [
    tricky
      ? `🦖 Hi ${name}! Yesterday ${SKILL[tricky].name.toLowerCase()} was tricky. I practised too. Shall we try one together?`
      : `🦖 Hi ${name}! I’m so happy to see you!`,
    `${info.emoji} ${info.story}`,
    boss ? `⚔️ Watch out… ${info.boss.name} ${info.boss.emoji} is waiting at the end!` : `🎁 A treasure chest is hidden at the end of today’s path.`,
  ];
  return { kind: 'daily', world, items, intro, boss, light: false };
}

export function buildCamp(state: AppState): MissionPlan | null {
  const ph = phaseOf();
  const weak = weakSkills(state, []).slice(0, 3);
  if (!weak.length) return null;
  const items: MissionItem[] = [];
  const plan = weak.length === 1 ? [weak[0], weak[0], weak[0]] : weak.length === 2 ? [weak[0], weak[1], weak[0], weak[1]] : [weak[0], weak[1], weak[2], weak[0]];
  for (const id of plan) {
    const failures = state.revision[id]?.failureCount ?? 0;
    // Repeated failure: simpler values, more support.
    const diff = failures >= 3 ? 1 : clampD((state.skills[id]?.level ?? 1) - 1, ph.cap);
    items.push({ q: makeQ(id, diff, items.map((i) => i.q)), segment: 'camp' });
  }
  return {
    kind: 'camp',
    world: SKILL[weak[0]].world,
    items,
    intro: ['🏋️ Welcome to Dino Training Camp!', `We’ll practise ${[...new Set(plan)].map((s) => SKILL[s].name).join(', ')} together.`, 'Just a few problems. Let’s get stronger!'],
    boss: false,
    light: false,
  };
}

export function followUpFor(q: Question): Question {
  return generate(q.skill, Math.max(1, q.difficulty - 1) as Difficulty);
}

// ---------- Olympiad Arena ----------

export interface MockQuestion {
  q: Question;
  section: Section;
  marks: number;
}

export const MOCK_SHAPE = {
  mini: { minutes: 15, sections: { 'Logical Reasoning': 4, 'Mathematical Reasoning': 4, 'Everyday Mathematics': 3, "Achievers' Section": 1 } },
  full: { minutes: 60, sections: { 'Logical Reasoning': 10, 'Mathematical Reasoning': 10, 'Everyday Mathematics': 10, "Achievers' Section": 5 } },
} as const;

export function buildMock(kind: 'mini' | 'full'): MockQuestion[] {
  const out: MockQuestion[] = [];
  for (const [section, count] of Object.entries(MOCK_SHAPE[kind].sections) as [Section, number][]) {
    const pool = SKILLS.filter((s) => (section === "Achievers' Section" ? s.reasoning : s.section === section)).map((s) => s.id);
    const order = shuffle(pool);
    for (let i = 0; i < count; i++) {
      const skill = order[i % order.length];
      const diff = (section === "Achievers' Section" ? pick([4, 5]) : pick([2, 3, 3, 4])) as Difficulty;
      let q = generate(skill, diff, { arena: true });
      for (let k = 0; k < 6 && out.some((o) => o.q.prompt === q.prompt); k++) q = generate(skill, diff, { arena: true });
      out.push({ q, section, marks: section === "Achievers' Section" ? 2 : 1 });
    }
  }
  return out;
}

export function arenaAvailable(state: AppState): boolean {
  if (state.settings.arena === 'on') return true;
  if (state.settings.arena === 'off') return false;
  return phaseOf().phase >= 2;
}

/** Real-world mission or parent challenge for the end of a session. */
export function offlineMission(): { kind: 'parent' | 'real'; text: string } {
  const t = today();
  const dow = fromKey(t).getDay();
  if (dow === 3 || dow === 6) {
    const have = pick([50, 40, 30, 100]);
    const spend = Math.floor(Math.random() * (have / 2)) + Math.floor(have / 4);
    return { kind: 'parent', text: `Ask Mum or Dad: “If I have ₹${have} and spend ₹${spend}, how much is left?” Explain how you worked it out!` };
  }
  return {
    kind: 'real',
    text: pick([
      'Find 3 rectangles in your house.',
      'Look at a clock and tell someone the time.',
      'Find 2 coins that make ₹10 together.',
      'Find two containers. Which one holds more water?',
      'Find the longest object in your room.',
      'Count the stairs or steps in your home. Is the number odd or even?',
      'Find something shaped like a cylinder in the kitchen.',
    ]),
  };
}

export function tomorrowPreview(state: AppState): string {
  const w = currentWorld(state);
  const tomorrow = addDays(today(), 1);
  if (daysToExam(tomorrow) === 0) return '🏅 Tomorrow is the Olympiad! Sleep well.';
  if (daysToExam(tomorrow) === 1) return '🌤️ Tomorrow is a tiny, easy mission. You are ready!';
  return `${WORLD[w].emoji} Tomorrow: more adventures in ${WORLD[w].name}!`;
}
