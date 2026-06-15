'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GameStartCountdown } from '@/components/game-start-countdown';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';
import type { CharadesPack } from '@/lib/charades-data';
import { shufflePrompts } from '@/lib/charades-data';
import { Eye, EyeOff, RotateCcw, SkipForward, Timer, Trophy } from 'lucide-react';

const ROUND_SECONDS = 60;

export function CharadesGame({ pack, onExit }: { pack: CharadesPack; onExit: () => void }) {
  const [prompts] = useState(() => shufflePrompts(pack.prompts));
  const [phase, setPhase] = useState<'countdown' | 'ready' | 'acting' | 'done'>('countdown');
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [score, setScore] = useState(0);

  const prompt = prompts[index];
  const isLast = index >= prompts.length - 1;

  useEffect(() => {
    if (phase !== 'acting') return;
    if (timeLeft <= 0) {
      toast.warning("Time's up!", 'Pass to the next actor');
      setPhase('ready');
      setRevealed(false);
      setTimeLeft(ROUND_SECONDS);
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, phase]);

  if (phase === 'countdown') {
    return (
      <GameStartCountdown
        label="Charades"
        sublabel={`${pack.title} · act without speaking`}
        onComplete={() => {
          setPhase('ready');
          toast.info('Round 1', 'Tap reveal when the actor is ready');
        }}
      />
    );
  }

  const startActing = () => {
    setRevealed(true);
    setPhase('acting');
    setTimeLeft(ROUND_SECONDS);
    toast.info('Go!', 'No talking allowed');
  };

  const guessed = () => {
    const newScore = score + 1;
    setScore(newScore);
    toast.success('Correct!', '+1 for the team');
    if (isLast) {
      setPhase('done');
      toast.success('Game over!', `${newScore} rounds guessed`);
      return;
    }
    setIndex((i) => i + 1);
    setRevealed(false);
    setPhase('ready');
    setTimeLeft(ROUND_SECONDS);
  };

  const skip = () => {
    toast.info('Skipped', `It was "${prompt?.text}"`);
    if (isLast) {
      setPhase('done');
      toast.success('Game over!', `${score} rounds guessed`);
      return;
    }
    setIndex((i) => i + 1);
    setRevealed(false);
    setPhase('ready');
    setTimeLeft(ROUND_SECONDS);
  };

  if (phase === 'done') {
    return (
      <div className="space-y-6 text-center animate-fade-in-up">
        <div className="text-6xl">🎭</div>
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-wider">Great acting!</p>
          <p className="text-4xl font-bold text-gradient mt-1">{score}</p>
          <p className="text-muted-foreground text-sm">rounds guessed</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button className="flex-1" onClick={() => window.location.reload()}>Play again</Button>
          <Button variant="outline" className="flex-1 gap-2" onClick={onExit}>
            <RotateCcw className="h-4 w-4" /> Other packs
          </Button>
        </div>
      </div>
    );
  }

  if (!prompt) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1 font-medium">
          <Trophy className="h-4 w-4 text-primary" /> {score} guessed
        </span>
        <span className="text-muted-foreground">Round {index + 1}/{prompts.length}</span>
        {phase === 'acting' && (
          <span className={cn(
            'flex items-center gap-1 font-semibold tabular-nums px-2 py-0.5 rounded-full border',
            timeLeft <= 10 ? 'border-destructive text-destructive animate-pulse-soft' : 'border-border',
          )}>
            <Timer className="h-3.5 w-3.5" /> {timeLeft}s
          </span>
        )}
      </div>

      <Card className="bg-card/80 min-h-[200px] flex items-center justify-center">
        <CardContent className="p-8 text-center w-full">
          {!revealed ? (
            <div className="space-y-4">
              <EyeOff className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">Pass the device to the actor</p>
              <p className="text-xs text-muted-foreground">Category: {prompt.category}</p>
              <Button size="lg" className="gap-2" onClick={startActing}>
                <Eye className="h-5 w-5" /> Reveal prompt
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-widest text-primary">{prompt.category}</p>
              <p className="text-3xl md:text-4xl font-bold">{prompt.text}</p>
              <p className="text-sm text-muted-foreground mt-4">Act it out — no words!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {revealed && phase === 'acting' && (
        <div className="grid grid-cols-2 gap-3">
          <Button size="lg" className="h-14" onClick={guessed}>
            ✅ Guessed it!
          </Button>
          <Button size="lg" variant="secondary" className="h-14 gap-2" onClick={skip}>
            <SkipForward className="h-4 w-4" /> Skip
          </Button>
        </div>
      )}

      <Button variant="ghost" size="sm" className="w-full gap-2" onClick={onExit}>
        <RotateCcw className="h-4 w-4" /> Exit game
      </Button>
    </div>
  );
}
