import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, GameMode, Tetromino, TetrominoType, BOARD_WIDTH, BOARD_HEIGHT, GameEvent } from '@/types/tetris';
import {
  SevenBag,
  createTetromino,
  rotatePiece,
  checkCollision,
  mergePiece,
  clearLines,
  calculateScore,
  getDropSpeed,
} from '@/utils/tetris';
import { toast } from 'sonner';

export function useTetris() {
  const [gameState, setGameState] = useState<GameState>({
    board: Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null)),
    currentPiece: null,
    nextPieces: [],
    holdPiece: null,
    canHold: true,
    score: 0,
    level: 1,
    lines: 0,
    gameOver: false,
    isPaused: false,
    mode: 'EASY',
    isRotating: false,
    secondChanceUsed: false,
  });

  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  
  const sevenBag = useRef(new SevenBag());
  const dropIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const modeProgressRef = useRef({ easy: 0, medium: 0 });

  const spawnPiece = useCallback(() => {
    const nextType = sevenBag.current.next();
    const newPiece = createTetromino(nextType);
    const nextPieces = sevenBag.current.peek(3);

    setGameState(prev => {
      if (checkCollision(prev.board, newPiece)) {
        return { ...prev, gameOver: true, isPaused: true };
      }
      return {
        ...prev,
        currentPiece: newPiece,
        nextPieces,
        canHold: true,
      };
    });
  }, []);

  const movePiece = useCallback((dx: number, dy: number) => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.isPaused) return prev;

      const newPiece = {
        ...prev.currentPiece,
        position: {
          x: prev.currentPiece.position.x + dx,
          y: prev.currentPiece.position.y + dy,
        },
      };

      if (checkCollision(prev.board, newPiece)) {
        if (dy > 0) {
          // Lock piece
          const newBoard = mergePiece(prev.board, prev.currentPiece);
          const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);
          const newLines = prev.lines + linesCleared;
          const newLevel = Math.floor(newLines / 10) + 1;
          const points = calculateScore(linesCleared, prev.level);
          
          // Show feedback
          if (linesCleared === 2) {
            setFeedback('Good!');
            setTimeout(() => setFeedback(null), 1000);
          } else if (linesCleared === 3) {
            setFeedback('Amazing!');
            setTimeout(() => setFeedback(null), 1000);
          } else if (linesCleared === 4) {
            setFeedback("I didn't expect that from you!");
            setTimeout(() => setFeedback(null), 1500);
          }

          // Check for mode transitions and events
          let newMode = prev.mode;
          let shouldPause = false;
          let newEvent: GameEvent | null = null;

          // Easy mode progress
          if (prev.mode === 'EASY' && newLines >= 5 && modeProgressRef.current.easy === 0) {
            modeProgressRef.current.easy = 1;
            shouldPause = true;
            newEvent = {
              type: 'SCREEN_ROTATION',
              title: 'Screen Rotation Event!',
              description: 'Survive 30 seconds of rotated gameplay',
            };
          } else if (prev.mode === 'EASY' && newLines >= 10) {
            newMode = 'MEDIUM';
            toast.success('Welcome to Medium Mode!');
          }

          // Medium mode events
          if (prev.mode === 'MEDIUM') {
            const progress = ((newLines - 10) / 10) * 100;
            
            if (progress >= 25 && progress < 30 && modeProgressRef.current.medium < 1) {
              modeProgressRef.current.medium = 1;
              shouldPause = true;
              newEvent = {
                type: 'MATH_QUIZ',
                title: 'Math Quiz',
                description: 'Answer correctly to slow down!',
              };
            } else if (progress >= 50 && progress < 55 && modeProgressRef.current.medium < 2) {
              modeProgressRef.current.medium = 2;
              shouldPause = true;
              newEvent = {
                type: 'MATH_QUIZ',
                title: 'Math Quiz',
                description: 'Answer correctly to slow down!',
              };
            } else if (progress >= 80 && progress < 85 && modeProgressRef.current.medium < 3) {
              modeProgressRef.current.medium = 3;
              shouldPause = true;
              newEvent = {
                type: 'STORY_QUIZ',
                title: 'Story Quiz',
                description: 'Read carefully and answer!',
              };
            } else if (newLines >= 20) {
              newMode = 'HARD';
              toast.success('Entering Hard Mode - Infinite Challenge!');
            }
          }

          // Hard mode events
          if (newMode === 'HARD' && Math.random() < 0.15 && !newEvent) {
            shouldPause = true;
            newEvent = {
              type: 'CARD_MEMORY',
              title: 'Card Harmony',
              description: 'Match 3 pairs - 3 mistakes allowed!',
            };
          }

          if (newEvent) {
            setCurrentEvent(newEvent);
          }

          return {
            ...prev,
            board: clearedBoard,
            currentPiece: null,
            score: prev.score + points,
            lines: newLines,
            level: newLevel,
            mode: newMode,
            isPaused: shouldPause,
          };
        }
        return prev;
      }

      return { ...prev, currentPiece: newPiece };
    });
  }, []);

  const rotate = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.isPaused) return prev;

      const rotated = {
        ...prev.currentPiece,
        shape: rotatePiece(prev.currentPiece.shape),
      };

      if (!checkCollision(prev.board, rotated)) {
        return { ...prev, currentPiece: rotated };
      }

      // Wall kicks
      const kicks = [
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: -1 },
      ];

      for (const kick of kicks) {
        const kicked = {
          ...rotated,
          position: {
            x: rotated.position.x + kick.x,
            y: rotated.position.y + kick.y,
          },
        };
        if (!checkCollision(prev.board, kicked)) {
          return { ...prev, currentPiece: kicked };
        }
      }

      return prev;
    });
  }, []);

  const hardDrop = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.isPaused) return prev;

      let dropDistance = 0;
      let testPiece = { ...prev.currentPiece };

      while (!checkCollision(prev.board, testPiece, { x: 0, y: 1 })) {
        testPiece.position.y++;
        dropDistance++;
      }

      const newBoard = mergePiece(prev.board, testPiece);
      const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);
      const newLines = prev.lines + linesCleared;
      const newLevel = Math.floor(newLines / 10) + 1;
      const points = calculateScore(linesCleared, prev.level) + (dropDistance * 5);

      return {
        ...prev,
        board: clearedBoard,
        currentPiece: null,
        score: prev.score + points,
        lines: newLines,
        level: newLevel,
      };
    });
  }, []);

  const hold = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || !prev.canHold || prev.isPaused) return prev;

      const heldType = prev.currentPiece.type;
      const nextType = prev.holdPiece || sevenBag.current.next();
      const newPiece = createTetromino(nextType);

      return {
        ...prev,
        currentPiece: newPiece,
        holdPiece: heldType,
        canHold: false,
        nextPieces: sevenBag.current.peek(3),
      };
    });
  }, []);

  const handleEventComplete = useCallback((success: boolean) => {
    setCurrentEvent(null);
    setGameState(prev => ({ ...prev, isPaused: false }));
    
    if (success) {
      toast.success('Event completed! Speed decreased.');
    } else {
      toast.error('Event failed! Speed increased.');
    }
  }, []);

  const handleSecondChance = useCallback(() => {
    setGameState(prev => {
      // Fill half the board randomly
      const newBoard = prev.board.map((row, y) => {
        if (y > BOARD_HEIGHT / 2) {
          return row.map(() => 
            Math.random() < 0.5 ? ['tetro-i', 'tetro-o', 'tetro-t'][Math.floor(Math.random() * 3)] : null
          );
        }
        return row;
      });

      return {
        ...prev,
        board: newBoard,
        score: Math.floor(prev.score * 0.5),
        gameOver: false,
        isPaused: false,
        secondChanceUsed: true,
      };
    });

    spawnPiece();
  }, [spawnPiece]);

  const restart = useCallback(() => {
    sevenBag.current = new SevenBag();
    modeProgressRef.current = { easy: 0, medium: 0 };
    
    setGameState({
      board: Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null)),
      currentPiece: null,
      nextPieces: [],
      holdPiece: null,
      canHold: true,
      score: 0,
      level: 1,
      lines: 0,
      gameOver: false,
      isPaused: false,
      mode: 'EASY',
      isRotating: false,
      secondChanceUsed: false,
    });
    
    setCurrentEvent(null);
    setFeedback(null);
  }, []);

  // Game loop
  useEffect(() => {
    if (!gameState.currentPiece && !gameState.gameOver) {
      spawnPiece();
    }
  }, [gameState.currentPiece, gameState.gameOver, spawnPiece]);

  useEffect(() => {
    if (gameState.isPaused || gameState.gameOver) {
      if (dropIntervalRef.current) {
        clearInterval(dropIntervalRef.current);
        dropIntervalRef.current = null;
      }
      return;
    }

    const speed = getDropSpeed(gameState.level, gameState.mode);
    dropIntervalRef.current = setInterval(() => {
      movePiece(0, 1);
    }, speed);

    return () => {
      if (dropIntervalRef.current) {
        clearInterval(dropIntervalRef.current);
      }
    };
  }, [gameState.isPaused, gameState.gameOver, gameState.level, gameState.mode, movePiece]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.isPaused || gameState.gameOver) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          movePiece(-1, 0);
          break;
        case 'ArrowRight':
          e.preventDefault();
          movePiece(1, 0);
          break;
        case 'ArrowDown':
          e.preventDefault();
          movePiece(0, 1);
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          rotate();
          break;
        case ' ':
          e.preventDefault();
          hardDrop();
          break;
        case 'c':
        case 'C':
          e.preventDefault();
          hold();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.isPaused, gameState.gameOver, movePiece, rotate, hardDrop, hold]);

  return {
    gameState,
    currentEvent,
    feedback,
    movePiece,
    rotate,
    hardDrop,
    hold,
    restart,
    handleEventComplete,
    handleSecondChance,
    setGameState,
  };
}
