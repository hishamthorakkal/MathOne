export type Difficulty = 1 | 2 | 3 | 4 | 5;

export type WorldId =
  | 'number_jungle'
  | 'volcano_valley'
  | 'dino_nest'
  | 'shape_caves'
  | 'time_mountain'
  | 'treasure_market'
  | 'puzzle_forest'
  | 'olympiad_castle';

export type SkillId =
  // Number Jungle
  | 'place_value'
  | 'number_names'
  | 'compare_numbers'
  | 'ordering'
  | 'number_neighbours'
  | 'skip_counting'
  | 'even_odd'
  // Volcano Valley
  | 'addition_no_carry'
  | 'addition_carry'
  | 'subtraction_no_borrow'
  | 'subtraction_borrow'
  | 'missing_number_ops'
  | 'add_sub_word'
  // Dino Nest
  | 'repeated_addition'
  | 'multiplication'
  | 'equal_sharing'
  // Shape Caves
  | 'shapes_2d'
  | 'solids_3d'
  | 'count_shapes'
  | 'symmetry'
  // Time Mountain
  | 'clock_reading'
  | 'calendar'
  | 'duration'
  // Treasure Market
  | 'money_total'
  | 'money_change'
  | 'measurement'
  | 'temperature'
  // Puzzle Forest
  | 'patterns'
  | 'odd_one_out'
  | 'analogy'
  | 'coding_decoding'
  | 'ranking'
  | 'data_pictograph'
  | 'spatial'
  | 'venn'
  // Olympiad Castle
  | 'clue_numbers'
  | 'multi_step';

/** Mini-game interaction used to present a question. */
export type GameType =
  | 'run' // Dino Run – pick one of three paths
  | 'feed' // Feed the Dino – add the right number of items
  | 'match' // Egg Match – match expressions to answers
  | 'train' // Number Train – fill the missing carriage
  | 'shop' // Treasure Shop – build an amount with coins
  | 'pattern' // Pattern Cave – complete a pattern
  | 'mystery' // Mystery Dino – clue puzzle
  | 'lava' // Lava Crossing – tap stones in order
  | 'type' // Dino Calculator – type the answer on a number pad
  | 'pick'; // Picture choice (clocks, shapes, charts)

export type Visual =
  | { kind: 'clock'; h: number; m: number }
  | { kind: 'shape'; shape: ShapeName }
  | { kind: 'shapes'; items: ShapeName[] }
  | { kind: 'pictograph'; icon: string; rows: { label: string; count: number }[]; key: number }
  | { kind: 'blocks'; numbers: number[]; hideLabel?: boolean }
  | { kind: 'groups'; groups: number; each: number; icon: string }
  | { kind: 'emoji'; text: string }
  | { kind: 'objects'; parts: { n: number; icon: string; crossed?: number }[]; op?: '+' | '−' }
  | { kind: 'numberline'; from: number; to: number; step: number }
  | { kind: 'regroup'; n: number }
  | { kind: 'abacus'; h: number; t: number; o: number }
  | { kind: 'thermometer'; value: number }
  | { kind: 'venn'; left: string; right: string; leftOnly: string[]; both: string[]; rightOnly: string[] }
  | { kind: 'grid'; cells: string[]; cols: number; compass?: boolean }
  | { kind: 'row'; items: string[] }
  | { kind: 'fold'; items: string[] };

export type ShapeName =
  | 'circle'
  | 'triangle'
  | 'square'
  | 'rectangle'
  | 'pentagon'
  | 'hexagon'
  | 'oval';

export interface Question {
  id: string;
  skill: SkillId;
  difficulty: Difficulty;
  game: GameType;
  /** Prompt text. Wrap key numbers/clues in **double stars** to highlight them. */
  prompt: string;
  /** Correct answer, compared as a string. */
  answer: string;
  /** Multiple-choice options (always contains `answer` when present). */
  options: string[];
  visual?: Visual;
  /** Game-specific payload. */
  data?: GameData;
  /** Visual hint shown after the second miss. */
  hint: string;
  hintVisual?: Visual;
  /** Guided solution steps shown after the third miss. */
  steps: string[];
  hots?: boolean;
  estSeconds: number;
  /** Wrong options built from a known misconception, e.g. { "53": "Forgot to carry" }. */
  mistakes?: Record<string, string>;
}

export type GameData =
  | { type: 'feed'; need: number; have: number; item: string }
  | { type: 'shop'; target: number; coins: number[]; item?: string }
  | { type: 'train'; seq: (number | string | null)[] }
  | { type: 'pattern'; items: string[] }
  | { type: 'mystery'; clues: string[] }
  | { type: 'lava'; stones: number[]; order: 'asc' | 'desc' }
  | { type: 'match'; pairs: { left: string; right: string }[] };

export type Outcome = 'independent' | 'retry' | 'hint' | 'guided' | 'incorrect';

export interface AttemptLog {
  t: number; // timestamp
  skill: SkillId;
  difficulty: Difficulty;
  outcome: Outcome;
  seconds: number;
  mode: 'adventure' | 'camp' | 'arena';
}

export interface SkillState {
  /** Recent outcomes (newest last), capped. */
  recent: { o: Outcome; s: number; t: number; d: Difficulty }[];
  level: Difficulty;
  streakCorrect: number;
  streakWrong: number;
  total: number;
  counts: Record<Outcome, number>;
  totalSeconds: number;
  lastSeen?: number;
}

export interface MistakeLog {
  t: number;
  skill: SkillId;
  prompt: string;
  picked: string;
  answer: string;
  tag?: string;
}

export interface RevisionItem {
  priority: number;
  nextReview: string; // YYYY-MM-DD
  intervalDays: number;
  failureCount: number;
}

export interface DayLog {
  questions: number;
  seconds: number;
  missions: number;
  camps: number;
  stars: number;
}

export interface MissionLog {
  date: string;
  world: WorldId;
  seconds: number;
  questions: number;
  independent: number;
  stars: number;
}

export interface MockQuestionResult {
  skill: SkillId;
  section: string;
  correct: boolean;
  answered: boolean;
  seconds: number;
  estSeconds: number;
  careless: boolean;
}

export interface MockResult {
  date: string;
  kind: 'mini' | 'full';
  score: number;
  maxScore: number;
  correct: number;
  total: number;
  seconds: number;
  items: MockQuestionResult[];
}

export type DinoId = 'rexy' | 'brachio' | 'tricera' | 'ptero' | 'spino' | 'raptor';
export type BadgeId = 'great_thinker' | 'pattern_spotter' | 'never_give_up' | 'sharp_eyes' | 'super_explainer';
export type Stage = 'egg' | 'baby' | 'explorer' | 'champion' | 'olympiad';

export interface Settings {
  sound: boolean;
  /** Read word problems aloud automatically (undefined = on). */
  autoRead?: boolean;
  unlockAll: boolean;
  arena: 'auto' | 'on' | 'off';
}

export interface AppState {
  version: 1;
  childName: string;
  createdAt: string;
  settings: Settings;
  stars: number;
  eggs: number;
  skills: Partial<Record<SkillId, SkillState>>;
  revision: Partial<Record<SkillId, RevisionItem>>;
  attempts: AttemptLog[];
  days: Record<string, DayLog>;
  missions: MissionLog[];
  hatched: DinoId[];
  companion: DinoId;
  cosmetics: string[];
  equipped: string | null;
  badges: Partial<Record<BadgeId, number>>;
  crystals: WorldId[];
  bosses: WorldId[];
  mocks: MockResult[];
  strategies: Record<string, number>;
  mistakes: MistakeLog[];
}
