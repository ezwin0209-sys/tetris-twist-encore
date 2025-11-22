import { useTetris } from '@/hooks/useTetris';
import { GameBoard } from '@/components/tetris/GameBoard';
import { NextPieces } from '@/components/tetris/NextPieces';
import { ScorePanel } from '@/components/tetris/ScorePanel';
import { EventModal } from '@/components/tetris/EventModal';
import { GameOverModal } from '@/components/tetris/GameOverModal';
import { ThemeToggle } from '@/components/tetris/ThemeToggle';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

const Index = () => {
  const {
    gameState,
    currentEvent,
    feedback,
    restart,
    handleEventComplete,
    handleSecondChance,
    setGameState,
  } = useTetris();

  // Handle screen rotation event
  useEffect(() => {
    if (currentEvent?.type === 'SCREEN_ROTATION') {
      setGameState(prev => ({ ...prev, isRotating: true }));
      
      setTimeout(() => {
        handleEventComplete(true);
        setGameState(prev => ({ ...prev, isRotating: false }));
      }, 30000);
    }
  }, [currentEvent, handleEventComplete, setGameState]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <ThemeToggle />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-primary neon-text mb-2">
            TETRIS
          </h1>
          <p className="text-muted-foreground">
            Survive the modes, conquer the events
          </p>
        </div>

        {/* Game Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_300px] gap-6 items-start">
          {/* Left Panel - Score & Controls */}
          <div>
            <ScorePanel 
              gameState={gameState} 
              holdPiece={gameState.holdPiece}
              feedback={feedback}
            />
          </div>

          {/* Center - Game Board */}
          <div className="flex flex-col items-center gap-4">
            <GameBoard gameState={gameState} />
            
            <div className="flex gap-2">
              <Button
                onClick={restart}
                variant="default"
                size="lg"
                className="bg-primary hover:bg-primary/90"
              >
                {gameState.gameOver ? 'New Game' : 'Restart'}
              </Button>
              
              <Button
                onClick={() => setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }))}
                variant="secondary"
                size="lg"
                disabled={gameState.gameOver}
              >
                {gameState.isPaused ? 'Resume' : 'Pause'}
              </Button>
            </div>
          </div>

          {/* Right Panel - Next Pieces */}
          <div>
            <NextPieces pieces={gameState.nextPieces} />
          </div>
        </div>

        {/* Event Modal */}
        <EventModal event={currentEvent} onComplete={handleEventComplete} />

        {/* Game Over Modal */}
        <GameOverModal
          isOpen={gameState.gameOver}
          score={gameState.score}
          lines={gameState.lines}
          level={gameState.level}
          mode={gameState.mode}
          secondChanceUsed={gameState.secondChanceUsed}
          onRestart={restart}
          onSecondChance={handleSecondChance}
        />
      </div>
    </div>
  );
};

export default Index;
