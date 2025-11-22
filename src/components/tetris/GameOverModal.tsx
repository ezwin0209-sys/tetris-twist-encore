import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getRandomSarcasticMessage } from '@/utils/tetris';
import { useEffect, useState } from 'react';

interface GameOverModalProps {
  isOpen: boolean;
  score: number;
  lines: number;
  level: number;
  mode: string;
  secondChanceUsed: boolean;
  onRestart: () => void;
  onSecondChance: () => void;
}

export function GameOverModal({
  isOpen,
  score,
  lines,
  level,
  mode,
  secondChanceUsed,
  onRestart,
  onSecondChance,
}: GameOverModalProps) {
  const [sarcasticMessage, setSarcasticMessage] = useState('');
  const [bestScore, setBestScore] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setSarcasticMessage(getRandomSarcasticMessage());
      
      // Load best score
      const saved = localStorage.getItem('tetris-best-score');
      const currentBest = saved ? parseInt(saved) : 0;
      
      if (score > currentBest) {
        localStorage.setItem('tetris-best-score', score.toString());
        setBestScore(score);
      } else {
        setBestScore(currentBest);
      }
    }
  }, [isOpen, score]);

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="glass-panel border-destructive/50 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-3xl text-destructive neon-text mb-4">
            Game Over
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="text-lg italic text-accent">{sarcasticMessage}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-card rounded-lg">
              <p className="text-sm text-muted-foreground">Final Score</p>
              <p className="text-2xl font-bold text-primary">{score}</p>
            </div>
            
            <div className="text-center p-3 bg-card rounded-lg">
              <p className="text-sm text-muted-foreground">Best Score</p>
              <p className="text-2xl font-bold text-accent">{bestScore}</p>
            </div>
            
            <div className="text-center p-3 bg-card rounded-lg">
              <p className="text-sm text-muted-foreground">Lines</p>
              <p className="text-2xl font-bold">{lines}</p>
            </div>
            
            <div className="text-center p-3 bg-card rounded-lg">
              <p className="text-sm text-muted-foreground">Level</p>
              <p className="text-2xl font-bold">{level}</p>
            </div>
          </div>

          <div className="text-center p-3 bg-card rounded-lg">
            <p className="text-sm text-muted-foreground">Mode Reached</p>
            <p className="text-xl font-bold text-accent">{mode}</p>
          </div>

          <div className="space-y-2">
            {!secondChanceUsed && mode === 'HARD' && (
              <Button
                onClick={onSecondChance}
                variant="default"
                className="w-full bg-accent hover:bg-accent/90"
              >
                Use Second Chance
                <span className="text-xs ml-2">(One Time Only)</span>
              </Button>
            )}
            
            <Button
              onClick={onRestart}
              variant="default"
              className="w-full"
            >
              Try Again
            </Button>
          </div>

          {!secondChanceUsed && mode === 'HARD' && (
            <p className="text-xs text-center text-muted-foreground">
              Second chance: Half score, increased speed, half-filled board
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
