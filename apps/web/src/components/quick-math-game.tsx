'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GameStartCountdown } from '@/components/game-start-countdown';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';
import type { MathPack } from '@/lib/quick-math-data';
import { generateProblem, type MathProblem } from '@/lib/quick-math-data';
import { Flame, RotateCcw, Timer, Trophy } from 'lucide-react';

const ROUND_SECONDS = 60;

export function QuickMathGame({ pack, onExit }: { pack: MathPack; onExit: () => void }) {
  const [phase, setPhase] = useState<'countdown' | 'playing' | 'feedback' | 'done'>('countdown');
  const [problem, setProblem] = useState<MathProblem>(() => generateProblem(pack));
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [solved, setSolved] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [picked, setPicked] = useState<number | null>(null);

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

  const nextProblem = useCallback(() => {
    setProblem(generateProblem(pack));
    setPicked(null);
    setPhase('playing');
  }, [pack]);

  const answer = (value: number) => {
    if (phase !== 'playing') return;
    const correct = value === problem.answer;
    setPicked(value);
    setPhase('feedback');

    if (correct) {
      const bonus = Math.min(streak, 5) * 15;
      setScore((s) => s + 100 + bonus);
      setSolved((s) => s + 1);
      setStreak((s) => {
        const next = s + 1;
        setBestStreak((b) => Math.max(b, next));
        if (next === 3) toast.success('Hot streak!', '+45 bonus per answer');
        return next;
      });
    } else {
      setStreak(0);
      toast.warning('Incorrect', `Answer was ${problem.answer}`);
    }

    setTimeout(nextProblem, 500);
  };

  if (phase === 'countdown') {
    return (
      <GameStartCountdown
        label="Quick Math"
        sublabel={`${pack.title} · ${ROUND_SECONDS}s round`}
        onComplete={() => {
          setPhase('playing');
          toast.info('Go!', 'Solve as many as you can');
        }}
      />
    );
  }

  if (phase === 'done') {
    return (
      <div className="space-y-6 text-center animate-fade-in-up">
        <div className="text-6xl">🧮</div>
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-wider">Round complete</p>
          <p className="text-4xl font-bold text-gradient mt-1">{score}</p>
          <p className="text-muted-foreground text-sm">points</p>
        </div>
        <div className="flex justify-center gap-6 text-sm">
          <span className="flex items-center gap-1">
            <Trophy className="h-4 w-4 text-primary" /> {solved} solved
          </span>
          <span className="flex items-center gap-1">
            <Flame className="h-4 w-4 text-orange-500" /> Best streak {bestStreak}
          </span>
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

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="p-10 text-center">
          <p className="text-4xl md:text-5xl font-bold tabular-nums tracking-tight">{problem.question}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        {problem.options.map((opt) => {
          const isPicked = picked === opt;
          const isCorrect = opt === problem.answer;
          let style = 'border-border hover:border-primary/40 hover:bg-primary/5';
          if (phase === 'feedback') {
            if (isCorrect) style = 'border-green-500 bg-green-500/15';
            else if (isPicked) style = 'border-destructive bg-destructive/10';
            else style = 'border-border opacity-50';
          }
          return (
            <button
              key={opt}
              type="button"
              disabled={phase !== 'playing'}
              onClick={() => answer(opt)}
              className={cn(
                'rounded-xl border-2 p-4 text-lg font-bold transition-all hover:-translate-y-0.5',
                style,
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
