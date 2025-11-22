import { GameState } from '@/types/tetris';
import { Badge } from '@/components/ui/badge';

interface ScorePanelProps {
  gameState: GameState;
  holdPiece: string | null;
  feedback: string | null;
}

export function ScorePanel({ gameState, holdPiece, feedback }: ScorePanelProps) {
  const { score, level, lines, mode } = gameState;

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'EASY': return 'bg-neon-green';
      case 'MEDIUM': return 'bg-neon-orange';
      case 'HARD': return 'bg-destructive';
      default: return 'bg-primary';
    }
  };

  return (
    <div className="space-y-4">
      <div className="glass-panel p-4 rounded-xl space-y-3">
        <div>
          <p className="text-sm text-muted-foreground">Mode</p>
          <Badge className={`${getModeColor(mode)} text-white font-bold`}>
            {mode}
          </Badge>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground">Score</p>
          <p className="text-3xl font-bold text-primary neon-text">{score}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Level</p>
            <p className="text-2xl font-bold">{level}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Lines</p>
            <p className="text-2xl font-bold">{lines}</p>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="glass-panel p-4 rounded-xl text-center pulse-neon">
          <p className="text-xl font-bold text-accent neon-text">{feedback}</p>
        </div>
      )}

      <div className="glass-panel p-3 rounded-xl">
        <h4 className="text-xs text-muted-foreground mb-2">Controls</h4>
        <div className="space-y-1 text-xs">
          <p>← → : Move</p>
          <p>↑ : Rotate</p>
          <p>↓ : Soft Drop</p>
          <p>Space : Hard Drop</p>
          <p>C : Hold</p>
        </div>
      </div>
    </div>
  );
}
