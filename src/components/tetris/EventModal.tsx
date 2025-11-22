import { useState, useEffect } from 'react';
import { GameEvent } from '@/types/tetris';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface EventModalProps {
  event: GameEvent | null;
  onComplete: (success: boolean) => void;
}

export function EventModal({ event, onComplete }: EventModalProps) {
  const [answer, setAnswer] = useState('');
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedCards, setMatchedCards] = useState<number[]>([]);
  const [mistakes, setMistakes] = useState(0);

  useEffect(() => {
    if (event?.type === 'CARD_MEMORY') {
      // Initialize card game
      setFlippedCards([]);
      setMatchedCards([]);
      setSelectedCards([]);
      setMistakes(0);
    }
  }, [event]);

  if (!event) return null;

  const handleMathQuiz = () => {
    // Generate random math problem
    const a = Math.floor(Math.random() * 20) + 1;
    const b = Math.floor(Math.random() * 20) + 1;
    const op = ['+', '-', '*'][Math.floor(Math.random() * 3)];
    
    let correctAnswer = 0;
    let question = '';
    
    switch (op) {
      case '+':
        correctAnswer = a + b;
        question = `${a} + ${b}`;
        break;
      case '-':
        correctAnswer = a - b;
        question = `${a} - ${b}`;
        break;
      case '*':
        correctAnswer = a * b;
        question = `${a} × ${b}`;
        break;
    }

    return { question, correctAnswer };
  };

  const handleStoryQuiz = () => {
    const stories = [
      {
        text: "A cat named Whiskers loved to chase butterflies. One day, she caught one and immediately felt guilty.",
        question: "What is the cat's name?",
        answer: "whiskers"
      },
      {
        text: "Tom bought 5 apples at the market. He ate 2 on the way home and gave 1 to his neighbor.",
        question: "How many apples did Tom buy?",
        answer: "5"
      },
      {
        text: "The blue car parked outside has been there since Monday. Today is Wednesday.",
        question: "What color is the car?",
        answer: "blue"
      }
    ];

    return stories[Math.floor(Math.random() * stories.length)];
  };

  const handleCardClick = (index: number) => {
    if (flippedCards.includes(index) || matchedCards.includes(index) || selectedCards.length >= 2) {
      return;
    }

    const newSelected = [...selectedCards, index];
    setSelectedCards(newSelected);
    setFlippedCards([...flippedCards, index]);

    if (newSelected.length === 2) {
      const [first, second] = newSelected;
      const cards = ['🌟', '🎮', '🎵', '🌟', '🎮', '🎵'];
      
      setTimeout(() => {
        if (cards[first] === cards[second]) {
          setMatchedCards([...matchedCards, first, second]);
          setSelectedCards([]);
          
          if (matchedCards.length + 2 === 6) {
            onComplete(true);
          }
        } else {
          setFlippedCards(flippedCards.filter(i => i !== first && i !== second));
          setSelectedCards([]);
          setMistakes(mistakes + 1);
          
          if (mistakes + 1 >= 3) {
            onComplete(false);
          }
        }
      }, 800);
    }
  };

  const renderEventContent = () => {
    switch (event.type) {
      case 'SCREEN_ROTATION':
        return (
          <div className="text-center space-y-4">
            <p className="text-lg">The screen will rotate 180° for 30 seconds!</p>
            <p className="text-accent">Get ready...</p>
            <Button onClick={() => {
              onComplete(true);
            }} className="w-full">
              Start!
            </Button>
          </div>
        );

      case 'MATH_QUIZ': {
        const { question, correctAnswer } = handleMathQuiz();
        return (
          <div className="space-y-4">
            <p className="text-2xl font-bold text-center">{question} = ?</p>
            <Input
              type="number"
              placeholder="Your answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onComplete(parseInt(answer) === correctAnswer);
                  setAnswer('');
                }
              }}
            />
            <Button
              onClick={() => {
                onComplete(parseInt(answer) === correctAnswer);
                setAnswer('');
              }}
              className="w-full"
            >
              Submit
            </Button>
          </div>
        );
      }

      case 'STORY_QUIZ': {
        const story = handleStoryQuiz();
        return (
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm">{story.text}</p>
            </div>
            <p className="font-medium">{story.question}</p>
            <Input
              placeholder="Your answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onComplete(answer.toLowerCase().trim() === story.answer.toLowerCase());
                  setAnswer('');
                }
              }}
            />
            <Button
              onClick={() => {
                onComplete(answer.toLowerCase().trim() === story.answer.toLowerCase());
                setAnswer('');
              }}
              className="w-full"
            >
              Submit
            </Button>
          </div>
        );
      }

      case 'CARD_MEMORY': {
        const cards = ['🌟', '🎮', '🎵', '🌟', '🎮', '🎵'];
        return (
          <div className="space-y-4">
            <p className="text-center">Match 3 pairs! {3 - mistakes} mistakes left</p>
            <div className="grid grid-cols-3 gap-3">
              {cards.map((card, idx) => (
                <Card
                  key={idx}
                  className={`aspect-square flex items-center justify-center text-4xl cursor-pointer transition-all hover:scale-105 ${
                    matchedCards.includes(idx)
                      ? 'bg-neon-green text-white'
                      : flippedCards.includes(idx)
                      ? 'bg-primary text-white'
                      : 'bg-muted'
                  }`}
                  onClick={() => handleCardClick(idx)}
                >
                  {(flippedCards.includes(idx) || matchedCards.includes(idx)) ? card : '?'}
                </Card>
              ))}
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <Dialog open={!!event} onOpenChange={() => {}}>
      <DialogContent className="glass-panel border-primary/50 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl neon-text">{event.title}</DialogTitle>
          {event.description && (
            <DialogDescription className="text-muted-foreground">
              {event.description}
            </DialogDescription>
          )}
        </DialogHeader>
        {renderEventContent()}
      </DialogContent>
    </Dialog>
  );
}
