import type { BadgeId, DinoId, SkillId, WorldId } from './types';

/** Sections of the IMO Class 2 paper (see the official sample paper). */
export type Section = 'Logical Reasoning' | 'Mathematical Reasoning' | 'Everyday Mathematics';

export interface SkillInfo {
  id: SkillId;
  name: string;
  world: WorldId;
  section: Section;
  /** Reasoning / HOTS skills are used for the daily thinking challenge. */
  reasoning?: boolean;
}

export const SKILLS: SkillInfo[] = [
  { id: 'number_names', name: 'Number Names', world: 'number_jungle', section: 'Mathematical Reasoning' },
  { id: 'place_value', name: 'Place Value & Abacus', world: 'number_jungle', section: 'Mathematical Reasoning' },
  { id: 'compare_numbers', name: 'Greater & Smaller', world: 'number_jungle', section: 'Mathematical Reasoning' },
  { id: 'ordering', name: 'Number Order', world: 'number_jungle', section: 'Mathematical Reasoning' },
  { id: 'number_neighbours', name: 'Missing Numbers', world: 'number_jungle', section: 'Mathematical Reasoning' },
  { id: 'skip_counting', name: 'Number Patterns', world: 'number_jungle', section: 'Mathematical Reasoning' },
  { id: 'even_odd', name: 'Even & Odd', world: 'number_jungle', section: 'Mathematical Reasoning' },

  { id: 'addition_no_carry', name: 'Addition', world: 'volcano_valley', section: 'Mathematical Reasoning' },
  { id: 'addition_carry', name: 'Addition with Carry', world: 'volcano_valley', section: 'Mathematical Reasoning' },
  { id: 'subtraction_no_borrow', name: 'Subtraction', world: 'volcano_valley', section: 'Mathematical Reasoning' },
  { id: 'subtraction_borrow', name: 'Subtraction with Borrow', world: 'volcano_valley', section: 'Mathematical Reasoning' },
  { id: 'missing_number_ops', name: 'Missing Number Sums', world: 'volcano_valley', section: 'Mathematical Reasoning', reasoning: true },
  { id: 'add_sub_word', name: 'Word Problems', world: 'volcano_valley', section: 'Everyday Mathematics' },

  { id: 'repeated_addition', name: 'Repeated Addition', world: 'dino_nest', section: 'Mathematical Reasoning' },
  { id: 'multiplication', name: 'Multiplication', world: 'dino_nest', section: 'Mathematical Reasoning' },
  { id: 'equal_sharing', name: 'Equal Sharing', world: 'dino_nest', section: 'Everyday Mathematics' },

  { id: 'shapes_2d', name: '2D Shapes', world: 'shape_caves', section: 'Mathematical Reasoning' },
  { id: 'solids_3d', name: '3D Solids', world: 'shape_caves', section: 'Mathematical Reasoning' },
  { id: 'count_shapes', name: 'Counting Shapes', world: 'shape_caves', section: 'Logical Reasoning', reasoning: true },
  { id: 'symmetry', name: 'Fold & Symmetry', world: 'shape_caves', section: 'Logical Reasoning', reasoning: true },

  { id: 'clock_reading', name: 'Clock Reading', world: 'time_mountain', section: 'Mathematical Reasoning' },
  { id: 'calendar', name: 'Calendar', world: 'time_mountain', section: 'Mathematical Reasoning' },
  { id: 'duration', name: 'Time Duration', world: 'time_mountain', section: 'Everyday Mathematics' },

  { id: 'money_total', name: 'Money', world: 'treasure_market', section: 'Everyday Mathematics' },
  { id: 'money_change', name: 'Money Change', world: 'treasure_market', section: 'Everyday Mathematics' },
  { id: 'measurement', name: 'Length, Weight & Capacity', world: 'treasure_market', section: 'Everyday Mathematics' },
  { id: 'temperature', name: 'Temperature', world: 'treasure_market', section: 'Mathematical Reasoning' },

  { id: 'patterns', name: 'Patterns', world: 'puzzle_forest', section: 'Logical Reasoning', reasoning: true },
  { id: 'odd_one_out', name: 'Odd One Out', world: 'puzzle_forest', section: 'Logical Reasoning', reasoning: true },
  { id: 'analogy', name: 'Analogy', world: 'puzzle_forest', section: 'Logical Reasoning', reasoning: true },
  { id: 'coding_decoding', name: 'Coding-Decoding', world: 'puzzle_forest', section: 'Logical Reasoning', reasoning: true },
  { id: 'ranking', name: 'Ranking', world: 'puzzle_forest', section: 'Logical Reasoning', reasoning: true },
  { id: 'data_pictograph', name: 'Data & Pictographs', world: 'puzzle_forest', section: 'Everyday Mathematics' },
  { id: 'spatial', name: 'Directions & Positions', world: 'puzzle_forest', section: 'Logical Reasoning', reasoning: true },
  { id: 'venn', name: 'Grouping & Venn', world: 'puzzle_forest', section: 'Logical Reasoning', reasoning: true },

  { id: 'clue_numbers', name: 'Clue Puzzles', world: 'olympiad_castle', section: 'Logical Reasoning', reasoning: true },
  { id: 'multi_step', name: 'Multi-step Problems', world: 'olympiad_castle', section: 'Everyday Mathematics', reasoning: true },
];

export const SKILL: Record<SkillId, SkillInfo> = Object.fromEntries(SKILLS.map((s) => [s.id, s])) as Record<
  SkillId,
  SkillInfo
>;

export interface WorldInfo {
  id: WorldId;
  name: string;
  emoji: string;
  crystal: string;
  color: string;
  boss: { name: string; emoji: string; mechanic: string };
  story: string;
}

export const WORLDS: WorldInfo[] = [
  {
    id: 'number_jungle',
    name: 'Number Jungle',
    emoji: '🌴',
    crystal: '🔢 Number Crystal',
    color: '#3fae5a',
    boss: { name: 'Number Snake', emoji: '🐍', mechanic: 'Arrange the snake’s number segments!' },
    story: 'Professor Zero hid the Number Crystal deep in the jungle vines.',
  },
  {
    id: 'volcano_valley',
    name: 'Volcano Valley',
    emoji: '🌋',
    crystal: '➕ Operation Crystal',
    color: '#e8603c',
    boss: { name: 'Lava Dragon', emoji: '🐉', mechanic: 'Build stepping stones before the lava rises!' },
    story: 'The Operation Crystal is glowing on the other side of the lava river.',
  },
  {
    id: 'dino_nest',
    name: 'Dino Nest',
    emoji: '🥚',
    crystal: '✖️ Grouping Crystal',
    color: '#f2b233',
    boss: { name: 'Egg Thief', emoji: '🦝', mechanic: 'Share the eggs fairly to win them back!' },
    story: 'Baby dinos need their eggs shared equally into nests.',
  },
  {
    id: 'shape_caves',
    name: 'Shape Caves',
    emoji: '🔷',
    crystal: '🔷 Shape Crystal',
    color: '#4b7be5',
    boss: { name: 'Shape Monster', emoji: '👾', mechanic: 'Spot every shape to break its armour!' },
    story: 'The cave walls are full of shapes. One of them hides the Shape Crystal.',
  },
  {
    id: 'time_mountain',
    name: 'Time Mountain',
    emoji: '⏰',
    crystal: '⏰ Time Crystal',
    color: '#8b5cf6',
    boss: { name: 'Clock Giant', emoji: '🗿', mechanic: 'Set the clock right to wake the giant!' },
    story: 'All the clocks on Time Mountain have stopped. Let’s fix them!',
  },
  {
    id: 'treasure_market',
    name: 'Treasure Market',
    emoji: '🪙',
    crystal: '💰 Money Crystal',
    color: '#d4a017',
    boss: { name: 'Treasure Troll', emoji: '🧌', mechanic: 'Pay the troll the exact amount!' },
    story: 'The market traders will trade the Money Crystal for exact coins.',
  },
  {
    id: 'puzzle_forest',
    name: 'Puzzle Forest',
    emoji: '🧩',
    crystal: '🧩 Logic Crystal',
    color: '#14a39a',
    boss: { name: 'Pattern Wizard', emoji: '🧙', mechanic: 'Complete the sequence to break the spell!' },
    story: 'The trees in Puzzle Forest only open their paths for clever thinkers.',
  },
  {
    id: 'olympiad_castle',
    name: 'Olympiad Castle',
    emoji: '🏰',
    crystal: '👑 Olympiad Crystal',
    color: '#c2410c',
    boss: { name: 'Professor Zero', emoji: '🦹', mechanic: 'The final mixed reasoning challenge!' },
    story: 'Professor Zero waits in the castle with the last crystal.',
  },
];

export const WORLD: Record<WorldId, WorldInfo> = Object.fromEntries(WORLDS.map((w) => [w.id, w])) as Record<
  WorldId,
  WorldInfo
>;

export const skillsOf = (w: WorldId): SkillId[] => SKILLS.filter((s) => s.world === w).map((s) => s.id);

export const DIFFICULTY_LABEL = ['', 'Explorer', 'Adventure', 'Mystery', 'Super Challenge', 'Boss Puzzle'] as const;

export interface DinoInfo {
  id: DinoId;
  name: string;
  color: string;
  belly: string;
  requirement: string;
  /** Worlds whose mastery unlocks this dino. */
  world?: WorldId;
  /** Number of skills in that world that must be mastered. */
  mastered?: number;
}

export const DINOS: DinoInfo[] = [
  { id: 'rexy', name: 'Rexy', color: '#4caf50', belly: '#c5e8a5', requirement: 'Your first companion!' },
  { id: 'brachio', name: 'Brachio', color: '#3b82f6', belly: '#bfdbfe', requirement: 'Master 3 Number Jungle skills', world: 'number_jungle', mastered: 3 },
  { id: 'tricera', name: 'Tricera', color: '#f97316', belly: '#fed7aa', requirement: 'Master 3 Volcano Valley skills', world: 'volcano_valley', mastered: 3 },
  { id: 'ptero', name: 'Ptero', color: '#a855f7', belly: '#e9d5ff', requirement: 'Master 2 Shape Caves skills', world: 'shape_caves', mastered: 2 },
  { id: 'spino', name: 'Spino', color: '#0ea5e9', belly: '#bae6fd', requirement: 'Master 2 Treasure Market skills', world: 'treasure_market', mastered: 2 },
  { id: 'raptor', name: 'Raptor', color: '#e11d48', belly: '#fecdd3', requirement: 'Master 3 Puzzle Forest skills', world: 'puzzle_forest', mastered: 3 },
];

export const HATCH_COST = 2;

export const COSMETICS = [
  { id: 'hat', name: 'Explorer Hat', emoji: '🎩', cost: 2 },
  { id: 'scarf', name: 'Cosy Scarf', emoji: '🧣', cost: 3 },
  { id: 'glasses', name: 'Cool Glasses', emoji: '🕶️', cost: 4 },
  { id: 'crown', name: 'Olympiad Crown', emoji: '👑', cost: 6 },
] as const;

export const BADGES: Record<BadgeId, { name: string; emoji: string; desc: string }> = {
  great_thinker: { name: 'Great Thinker', emoji: '🧠', desc: 'Solved a thinking challenge' },
  pattern_spotter: { name: 'Pattern Spotter', emoji: '🔍', desc: 'Cracked a pattern' },
  never_give_up: { name: 'Never Give Up', emoji: '💪', desc: 'Kept trying and got it' },
  sharp_eyes: { name: 'Sharp Eyes', emoji: '👀', desc: '3 in a row all by yourself' },
  super_explainer: { name: 'Super Explainer', emoji: '🗣️', desc: 'Told Dino how you thought' },
};

export const EXAM_DATE = '2026-11-26';
/** First day of the daily plan (Monday). The whole schedule is worked out from this and EXAM_DATE. */
export const PLAN_START = '2026-10-12';
