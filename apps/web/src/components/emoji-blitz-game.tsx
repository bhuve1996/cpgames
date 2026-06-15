'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GameStartCountdown } from '@/components/game-start-countdown';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';
import type { EmojiBlitzPack } from '@/lib/emoji-blitz-data';
import { shuffleRounds } from '@/lib/emoji-blitz-data';
import { Flame, RotateCcw, Timer, Trophy, Zap } from 'lucide-react';

const ROUND_SECONDS = 60;

export function EmojiBlitzGame({ pack, onExit }: { pack: EmojiBlitzPack; onExit: () => void }) {
  const [rounds] = useState(() => shuffleRounds(pack.rounds));
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [phase, setPhase] = useState<'countdown' | 'playing' | 'feedback' | 'done'>('countdown');
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  const round = rounds[index];
  const finished = phase === 'done';

  useEffect(() => {
    if (phase !== 'playing') return;
    if (timeLeft <= 0) {
      setPhase('done');
      toast.info("Time's up!", 'Check your final score below');
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, phase]);

  const advance = useCallback(() => {
    if (index >= rounds.length - 1) {
      setPhase('done');
      return;
    }
    setIndex((i) => i + 1);
    setPicked(null);
    setLastCorrect(null);
    setPhase('playing');
  }, [index, rounds.length]);

  const answer = (optionIndex: number) => {
    if (phase !== 'playing' || !round) return;

    const correct = optionIndex === round.correctIndex;
    setPicked(optionIndex);
    setLastCorrect(correct);
    setPhase('feedback');

    if (correct) {
      const bonus = Math.min(streak, 5) * 10;
      const earned = 100 + bonus;
      setPointsEarned(earned);
      setScore((s) => s + earned);
      setStreak((s) => {
        const next = s + 1;
        setBestStreak((b) => Math.max(b, next));
        if (next === 3) toast.success('3 in a row!', 'Streak bonus active');
        if (next === 5) toast.success('On fire!', '5-answer streak');
        return next;
      });
    } else {
      setPointsEarned(0);
      setStreak(0);
      toast.warning('Wrong answer', 'Streak reset');
    }

    setTimeout(advance, 600);
  };

  if (phase === 'countdown') {
    return (
      <GameStartCountdown
        label="Emoji Blitz"
        sublabel={`${pack.title} · ${ROUND_SECONDS}s round`}
        onComplete={() => {
          setPhase('playing');
          toast.info('Go!', 'Match as many emojis as you can');
        }}
      />
    );
  }

  if (finished) {
    return (
      <div className="space-y-6 text-center animate-fade-in-up">
        <div className="text-6xl animate-wiggle">🏆</div>
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-wider">Time&apos;s up!</p>
          <p className="text-4xl font-bold text-gradient mt-1">{score}</p>
          <p className="text-muted-foreground text-sm mt-1">points</p>
        </div>
        <div className="flex justify-center gap-6 text-sm">
          <span className="flex items-center gap-1">
            <Zap className="h-4 w-4 text-primary" /> {index + 1} answered
          </span>
          <span className="flex items-center gap-1">
            <Flame className="h-4 w-4 text-orange-500" /> Best streak {bestStreak}
          </span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button className="flex-1" onClick={() => window.location.reload()}>
            Play again
          </Button>
          <Button variant="outline" className="flex-1 gap-2" onClick={onExit}>
            <RotateCcw className="h-4 w-4" /> Other packs
          </Button>
        </div>
      </div>
    );
  }

  if (!round) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Trophy className="h-4 w-4 text-primary" />
          <span>{score}</span>
          {streak > 1 && (
            <span className="flex items-center gap-0.5 text-orange-500 text-xs">
              <Flame className="h-3.5 w-3.5" /> ×{streak}
            </span>
          )}
        </div>
        <div
          className={cn(
            'flex items-center gap-1.5 text-sm font-semibold tabular-nums px-3 py-1 rounded-full border',
            timeLeft <= 10 ? 'border-destructive/50 text-destructive animate-pulse-soft' : 'border-border',
          )}
        >
          <Timer className="h-4 w-4" />
          {timeLeft}s
        </div>
      </div>

      <Card className="bg-card/80 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-8 text-center space-y-4">
          <p className="text-sm text-muted-foreground">{round.prompt}</p>
          <span
            className="text-8xl block animate-float-slow select-none"
            style={{ animationDuration: '2.5s' }}
          >
            {round.emoji}
          </span>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        {round.options.map((opt, i) => {
          const isPicked = picked === i;
          const isCorrect = i === round.correctIndex;
          let variant = 'border-border hover:border-primary/40 hover:bg-primary/5';
          if (phase === 'feedback') {
            if (isCorrect) variant = 'border-green-500 bg-green-500/15 ring-2 ring-green-500/30';
            else if (isPicked) variant = 'border-destructive bg-destructive/10';
            else variant = 'border-border opacity-50';
          }

          return (
            <button
              key={opt}
              type="button"
              disabled={phase !== 'playing'}
              onClick={() => answer(i)}
              className={cn(
                'rounded-xl border-2 p-4 text-sm font-medium transition-all duration-200',
                'hover:-translate-y-0.5 hover:shadow-md disabled:hover:translate-y-0',
                variant,
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {lastCorrect === true && phase === 'feedback' && (
        <p className="text-center text-sm text-green-600 dark:text-green-400 font-medium animate-fade-in-up">
          +{pointsEarned} points!
        </p>
      )}
    </div>
  );
}
