import { TetrominoType } from '@/types/tetris';
import { SHAPES, COLORS } from '@/utils/tetris';
import { cn } from '@/lib/utils';

interface NextPiecesProps {
  pieces: TetrominoType[];
}

export function NextPieces({ pieces }: NextPiecesProps) {
  return (
    <div className="glass-panel p-4 rounded-xl space-y-4">
      <h3 className="text-lg font-bold text-primary neon-text">Next Pieces</h3>
      <div className="space-y-3">
        {pieces.map((type, idx) => {
          const shape = SHAPES[type];
          const color = COLORS[type];
          
          return (
            <div
              key={idx}
              className="bg-game-grid p-2 rounded-lg border border-game-border"
            >
              <div className="grid gap-[2px]">
                {shape.map((row, y) => (
                  <div key={y} className="flex gap-[2px] justify-center">
                    {row.map((cell, x) => (
                      <div
                        key={x}
                        className={cn(
                          "w-4 h-4 rounded-sm",
                          cell ? `bg-${color} shadow-sm border border-white/20` : "opacity-0"
                        )}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
