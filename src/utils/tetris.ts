import { TetrominoType, Tetromino, Position } from '@/types/tetris';

// Tetromino shapes (rotation state 0)
export const SHAPES: Record<TetrominoType, number[][]> = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
};

export const COLORS: Record<TetrominoType, string> = {
  I: 'tetro-i',
  O: 'tetro-o',
  T: 'tetro-t',
  S: 'tetro-s',
  Z: 'tetro-z',
  J: 'tetro-j',
  L: 'tetro-l',
};

// 7-bag random generator
export class SevenBag {
  private bag: TetrominoType[] = [];

  private fillBag() {
    const pieces: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    for (let i = pieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
    }
    this.bag = pieces;
  }

  next(): TetrominoType {
    if (this.bag.length === 0) {
      this.fillBag();
    }
    return this.bag.pop()!;
  }

  peek(count: number): TetrominoType[] {
    while (this.bag.length < count) {
      const pieces: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
      for (let i = pieces.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
      }
      this.bag = [...pieces, ...this.bag];
    }
    return this.bag.slice(-count).reverse();
  }
}

export function createTetromino(type: TetrominoType): Tetromino {
  return {
    type,
    shape: SHAPES[type],
    position: { x: 3, y: 0 },
    color: COLORS[type],
  };
}

export function rotatePiece(shape: number[][]): number[][] {
  const N = shape.length;
  const rotated = Array(N).fill(null).map(() => Array(N).fill(0));
  
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      rotated[j][N - 1 - i] = shape[i][j];
    }
  }
  
  return rotated;
}

export function checkCollision(
  board: (string | null)[][],
  piece: Tetromino,
  offset: Position = { x: 0, y: 0 }
): boolean {
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        const newX = piece.position.x + x + offset.x;
        const newY = piece.position.y + y + offset.y;
        
        if (
          newX < 0 ||
          newX >= board[0].length ||
          newY >= board.length ||
          (newY >= 0 && board[newY][newX])
        ) {
          return true;
        }
      }
    }
  }
  return false;
}

export function mergePiece(
  board: (string | null)[][],
  piece: Tetromino
): (string | null)[][] {
  const newBoard = board.map(row => [...row]);
  
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        const boardY = piece.position.y + y;
        const boardX = piece.position.x + x;
        if (boardY >= 0) {
          newBoard[boardY][boardX] = piece.color;
        }
      }
    }
  }
  
  return newBoard;
}

export function clearLines(board: (string | null)[][]): {
  newBoard: (string | null)[][];
  linesCleared: number;
} {
  const newBoard: (string | null)[][] = [];
  let linesCleared = 0;
  
  for (let y = board.length - 1; y >= 0; y--) {
    if (board[y].every(cell => cell !== null)) {
      linesCleared++;
    } else {
      newBoard.unshift(board[y]);
    }
  }
  
  while (newBoard.length < board.length) {
    newBoard.unshift(Array(board[0].length).fill(null));
  }
  
  return { newBoard, linesCleared };
}

export function calculateScore(linesCleared: number, level: number): number {
  const baseScores = [0, 100, 300, 500, 800];
  return baseScores[linesCleared] * level;
}

export function getDropSpeed(level: number, mode: string): number {
  const baseSpeed = mode === 'HARD' ? 300 : mode === 'MEDIUM' ? 600 : 1000;
  return Math.max(50, baseSpeed - (level - 1) * 50);
}

export function getGhostPosition(
  board: (string | null)[][],
  piece: Tetromino
): Position {
  let ghostY = piece.position.y;
  
  while (!checkCollision(board, piece, { x: 0, y: ghostY - piece.position.y + 1 })) {
    ghostY++;
  }
  
  return { x: piece.position.x, y: ghostY };
}

export const SARCASTIC_MESSAGES = [
  "Even my grandma plays better.",
  "I've seen goldfish make better decisions.",
  "That was... something.",
  "Were you even trying?",
  "Maybe Tetris isn't your thing.",
  "Have you considered easier games?",
  "At least you tried... sort of.",
  "Better luck next time... you'll need it.",
  "Impressive. Impressively bad.",
  "I believe in you! (Not really)",
];

export function getRandomSarcasticMessage(): string {
  return SARCASTIC_MESSAGES[Math.floor(Math.random() * SARCASTIC_MESSAGES.length)];
}
