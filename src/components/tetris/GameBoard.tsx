import { GameState } from '@/types/tetris';
import { getGhostPosition } from '@/utils/tetris';
import { cn } from '@/lib/utils';

interface GameBoardProps {
  gameState: GameState;
}

export function GameBoard({ gameState }: GameBoardProps) {
  const { board, currentPiece, isRotating } = gameState;

  // Create display board with current piece and ghost
  const displayBoard = board.map(row => [...row]);

  // Add ghost piece
  if (currentPiece) {
    const ghostPos = getGhostPosition(board, currentPiece);
    for (let y = 0; y < currentPiece.shape.length; y++) {
      for (let x = 0; x < currentPiece.shape[y].length; x++) {
        if (currentPiece.shape[y][x]) {
          const boardY = ghostPos.y + y;
          const boardX = ghostPos.x + x;
          if (boardY >= 0 && boardY < board.length && !displayBoard[boardY][boardX]) {
            displayBoard[boardY][boardX] = `${currentPiece.color}-ghost`;
          }
        }
      }
    }

    // Add current piece
    for (let y = 0; y < currentPiece.shape.length; y++) {
      for (let x = 0; x < currentPiece.shape[y].length; x++) {
        if (currentPiece.shape[y][x]) {
          const boardY = currentPiece.position.y + y;
          const boardX = currentPiece.position.x + x;
          if (boardY >= 0 && boardY < board.length) {
            displayBoard[boardY][boardX] = currentPiece.color;
          }
        }
      }
    }
  }

  return (
    <div
      className={cn(
        "glass-panel p-4 rounded-xl transition-transform duration-1000",
        isRotating && "rotating"
      )}
    >
      <div className="grid gap-[2px] bg-game-border p-2 rounded-lg neon-glow">
        {displayBoard.map((row, y) => (
          <div key={y} className="flex gap-[2px]">
            {row.map((cell, x) => {
              const isGhost = cell?.includes('-ghost');
              const color = isGhost ? cell?.replace('-ghost', '') : cell;
              
              return (
                <div
                  key={x}
                  className={cn(
                    "w-7 h-7 rounded-sm transition-all duration-150",
                    !cell && "bg-game-grid"
                  )}
                  style={{
                    backgroundColor: cell && !isGhost ? `hsl(var(--${color}))` : undefined,
                    opacity: isGhost ? 0.2 : 1,
                    boxShadow: cell && !isGhost ? '0 0 8px rgba(0,0,0,0.3)' : undefined,
                    border: cell && !isGhost ? '1px solid rgba(255,255,255,0.2)' : undefined,
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
