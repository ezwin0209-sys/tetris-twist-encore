export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export type GameMode = 'EASY' | 'MEDIUM' | 'HARD';

export type EventType = 
  | 'SCREEN_ROTATION'
  | 'MATH_QUIZ'
  | 'PUZZLE'
  | 'STORY_QUIZ'
  | 'CARD_MEMORY'
  | 'JUMP_SCARE';

export interface Position {
  x: number;
  y: number;
}

export interface Tetromino {
  type: TetrominoType;
  shape: number[][];
  position: Position;
  color: string;
}

export interface GameState {
  board: (string | null)[][];
  currentPiece: Tetromino | null;
  nextPieces: TetrominoType[];
  holdPiece: TetrominoType | null;
  canHold: boolean;
  score: number;
  level: number;
  lines: number;
  gameOver: boolean;
  isPaused: boolean;
  mode: GameMode;
  isRotating: boolean;
  secondChanceUsed: boolean;
}

export interface GameEvent {
  type: EventType;
  title: string;
  description?: string;
  data?: any;
}

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;
