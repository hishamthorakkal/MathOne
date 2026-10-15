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

/** How a dino is discovered. Always earned by learning, never by chance. */
export type Unlock =
  | { kind: 'start' }
  | { kind: 'skills'; skills: SkillId[]; count: number; what: string }
  | { kind: 'crystal'; world: WorldId }
  | { kind: 'badge'; badge: BadgeId; count: number }
  | { kind: 'days'; count: number }
  | { kind: 'camps'; count: number }
  | { kind: 'eggs'; count: number }
  | { kind: 'realWorld'; count: number }
  | { kind: 'legend' };

export interface DinoInfo {
  id: DinoId;
  name: string;
  species: string;
  color: string;
  belly: string;
  unlock: Unlock;
  /** Discovery Book tab. */
  tab: WorldId | 'special';
  /** Shown while the dino is still hidden. */
  clue: string;
  fact: string;
  /** One maths question built from the fact (for fun: a bonus star, not skill progress). */
  math: { q: string; options: string[]; answer: string };
  legendary?: boolean;
}

const worldSkills = (w: WorldId) => SKILLS.filter((s) => s.world === w).map((s) => s.id);

export const DINOS: DinoInfo[] = [
  // ---- the original six (unchanged looks and unlock rules) ----
  {
    id: 'rexy', name: 'Rexy', species: 'Tyrannosaurus rex', color: '#4caf50', belly: '#c5e8a5', unlock: { kind: 'start' }, tab: 'special',
    clue: 'Your first friend!', fact: 'T. rex had about 60 teeth, some as long as a banana.',
    math: { q: 'Rexy ate 3 apples in the morning and 4 in the evening. How many apples?', options: ['6', '7', '8'], answer: '7' },
  },
  {
    id: 'brachio', name: 'Brachio', species: 'Brachiosaurus', color: '#3b82f6', belly: '#bfdbfe',
    unlock: { kind: 'skills', skills: worldSkills('number_jungle'), count: 3, what: 'Number Jungle' }, tab: 'number_jungle',
    clue: 'I am very tall and I live in Number Jungle.', fact: 'Brachiosaurus was as tall as a 4-storey building.',
    math: { q: 'Brachio eats 10 leaves at a time. How many leaves in 3 bites?', options: ['13', '30', '20'], answer: '30' },
  },
  {
    id: 'tricera', name: 'Tricera', species: 'Triceratops', color: '#f97316', belly: '#fed7aa',
    unlock: { kind: 'skills', skills: worldSkills('volcano_valley'), count: 3, what: 'Volcano Valley' }, tab: 'volcano_valley',
    clue: 'I have horns and I live near the volcano.', fact: 'Triceratops means "three-horned face".',
    math: { q: '5 Triceras have 3 horns each. How many horns?', options: ['8', '15', '12'], answer: '15' },
  },
  {
    id: 'ptero', name: 'Ptero', species: 'Pteranodon', color: '#a855f7', belly: '#e9d5ff',
    unlock: { kind: 'skills', skills: worldSkills('shape_caves'), count: 2, what: 'Shape Caves' }, tab: 'shape_caves',
    clue: 'I fly over the Shape Caves.', fact: 'Pteranodon was a flying reptile, not a dinosaur! Its wings were wider than a car.',
    math: { q: 'Ptero flew 20 km, then 15 km more. How far did it fly?', options: ['35 km', '25 km', '30 km'], answer: '35 km' },
  },
  {
    id: 'spino', name: 'Spino', species: 'Spinosaurus', color: '#0ea5e9', belly: '#bae6fd',
    unlock: { kind: 'skills', skills: worldSkills('treasure_market'), count: 2, what: 'Treasure Market' }, tab: 'treasure_market',
    clue: 'I have a sail and I swim near Treasure Market.', fact: 'Spinosaurus loved to catch fish, like a crocodile.',
    math: { q: 'Spino caught 12 fish and ate 5. How many are left?', options: ['7', '17', '6'], answer: '7' },
  },
  {
    id: 'raptor', name: 'Raptor', species: 'Velociraptor', color: '#e11d48', belly: '#fecdd3',
    unlock: { kind: 'skills', skills: worldSkills('puzzle_forest'), count: 3, what: 'Puzzle Forest' }, tab: 'puzzle_forest',
    clue: 'I am fast and clever. Find me in Puzzle Forest.', fact: 'Velociraptor had feathers and was only about as tall as a dog.',
    math: { q: 'Raptor ran 2, 4, 6, 8 metres. What comes next?', options: ['9', '10', '12'], answer: '10' },
  },

  // ---- new dinos to discover ----
  {
    id: 'compy', name: 'Compy', species: 'Compsognathus', color: '#65a30d', belly: '#d9f99d', unlock: { kind: 'days', count: 3 }, tab: 'special',
    clue: 'I am tiny! Play on 3 different days to find me.', fact: 'Compsognathus was about the size of a chicken.',
    math: { q: 'Is Compy longer or shorter than 1 metre?', options: ['Shorter', 'Longer'], answer: 'Shorter' },
  },
  {
    id: 'diplo', name: 'Diplo', species: 'Diplodocus', color: '#6366f1', belly: '#e0e7ff', unlock: { kind: 'crystal', world: 'number_jungle' }, tab: 'number_jungle',
    clue: 'My tail is super long. Win the Number Crystal to find me.', fact: 'Diplodocus was about 26 metres long, as long as 2 buses.',
    math: { q: 'Diplo is 26 m long. What is half of 26?', options: ['12', '13', '16'], answer: '13' },
  },
  {
    id: 'iguano', name: 'Iguano', species: 'Iguanodon', color: '#64748b', belly: '#e2e8f0',
    unlock: { kind: 'skills', skills: worldSkills('dino_nest'), count: 2, what: 'Dino Nest' }, tab: 'dino_nest',
    clue: 'I have a spiky thumb. I live in Dino Nest.', fact: 'Iguanodon had a sharp spike on each thumb.',
    math: { q: '4 Iguanos each have 2 thumb spikes. How many spikes?', options: ['6', '8', '10'], answer: '8' },
  },
  {
    id: 'stego', name: 'Stego', species: 'Stegosaurus', color: '#84cc16', belly: '#ecfccb', unlock: { kind: 'badge', badge: 'pattern_spotter', count: 3 }, tab: 'shape_caves',
    clue: 'My back plates make a pattern. Spot 3 patterns!', fact: 'Stegosaurus had 17 plates on its back and 4 spikes on its tail.',
    math: { q: '2 Stegos stand side by side. How many tail spikes altogether?', options: ['6', '8', '10'], answer: '8' },
  },
  {
    id: 'parasaur', name: 'Parasaur', species: 'Parasaurolophus', color: '#14b8a6', belly: '#ccfbf1',
    unlock: { kind: 'skills', skills: worldSkills('time_mountain'), count: 2, what: 'Time Mountain' }, tab: 'time_mountain',
    clue: 'My crest toots like an alarm clock. I live on Time Mountain.', fact: 'Parasaurolophus could make loud honking sounds with its crest.',
    math: { q: "Parasaur toots every hour. It tooted at 3 o'clock. When is the next toot?", options: ["4 o'clock", "5 o'clock", "2 o'clock"], answer: "4 o'clock" },
  },
  {
    id: 'ankylo', name: 'Ankylo', species: 'Ankylosaurus', color: '#b45309', belly: '#fde68a',
    unlock: { kind: 'skills', skills: ['measurement', 'temperature', 'money_total', 'money_change'], count: 2, what: 'measuring and money' }, tab: 'treasure_market',
    clue: 'I am heavy and covered in armour. I love weighing things!', fact: 'Ankylosaurus weighed about 6,000 kg, more than a car.',
    math: { q: 'Which is heavier: Ankylo or a bicycle?', options: ['Ankylo', 'Bicycle'], answer: 'Ankylo' },
  },
  {
    id: 'dilo', name: 'Dilo', species: 'Dilophosaurus', color: '#eab308', belly: '#fef9c3',
    unlock: { kind: 'skills', skills: ['coding_decoding', 'analogy', 'venn', 'ranking', 'odd_one_out', 'spatial'], count: 2, what: 'logic' }, tab: 'puzzle_forest',
    clue: 'I live in Puzzle Forest and love tricky codes!', fact: 'Dilophosaurus had two thin crests on its head.',
    math: { q: '3 Dilos have 2 crests each. How many crests?', options: ['5', '6', '8'], answer: '6' },
  },
  {
    id: 'pachy', name: 'Pachy', species: 'Pachycephalosaurus', color: '#ec4899', belly: '#fce7f3', unlock: { kind: 'badge', badge: 'never_give_up', count: 5 }, tab: 'special',
    clue: 'I never give up! Keep trying on tricky questions to find me.', fact: 'Pachycephalosaurus had a skull dome as thick as a dictionary.',
    math: { q: 'Pachy tried 3 times, then 4 more times. How many tries?', options: ['6', '7', '12'], answer: '7' },
  },
  {
    id: 'mosa', name: 'Mosa', species: 'Mosasaurus', color: '#0369a1', belly: '#bae6fd', unlock: { kind: 'camps', count: 5 }, tab: 'special',
    clue: 'I dive deep! Finish Training Camp 5 times.', fact: 'Mosasaurus was a giant sea reptile, not a dinosaur!',
    math: { q: 'Mosa swam 30 m down, then 10 m more. How deep?', options: ['40 m', '20 m', '300 m'], answer: '40 m' },
  },
  {
    id: 'archie', name: 'Archie', species: 'Archaeopteryx', color: '#fb7185', belly: '#ffe4e6', unlock: { kind: 'realWorld', count: 3 }, tab: 'special',
    clue: 'I fly into the real world! Do 3 Real-World Missions.', fact: 'Archaeopteryx had feathers like a bird and teeth like a dinosaur.',
    math: { q: 'Archie has 2 wings. How many wings do 5 Archies have?', options: ['7', '10', '12'], answer: '10' },
  },
  {
    id: 'ovi', name: 'Ovi', species: 'Oviraptor', color: '#7c3aed', belly: '#ede9fe', unlock: { kind: 'eggs', count: 25 }, tab: 'special',
    clue: 'I collect eggs! Earn 25 Dino Eggs.', fact: 'Oviraptor sat on its nest of eggs like a bird.',
    math: { q: '3 nests have 4 eggs each. How many eggs?', options: ['7', '12', '10'], answer: '12' },
  },
  {
    id: 'goldrex', name: 'Golden Rex', species: 'Legendary T. rex', color: '#f5b301', belly: '#fff1b8', unlock: { kind: 'legend' }, tab: 'special', legendary: true,
    clue: 'The legend! Win the Olympiad Crystal, or score 75% in a full mock.', fact: 'Golden Rex only appears for true Olympiad champions!',
    math: { q: 'You scored 30 out of 40. How many did you miss?', options: ['10', '20', '70'], answer: '10' },
  },
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
