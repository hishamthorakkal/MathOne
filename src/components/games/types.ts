import type { DinoId, Question } from '../../engine/types';

export interface GameProps {
  q: Question;
  /** Submit an answer; compared with `q.answer` by the player. */
  onAnswer: (value: string) => void;
  /** True once solved – ignore further input. */
  locked: boolean;
  /** Number of misses so far (drives extra visual support). */
  misses: number;
  dino: { id?: DinoId; color: string; belly: string };
}
