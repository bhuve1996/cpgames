'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { GameStartCountdown } from '@/components/game-start-countdown';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';
import type { ScramblePack } from '@/lib/word-scramble-data';
import { scrambleWord, shuffleWords } from '@/lib/word-scramble-data';
import { Check, Flame, RotateCcw, SkipForward, Timer, Trophy } from 'lucide-react';

const ROUND_SECONDS = 120;

export function WordScrambleGame({ pack, onExit }: { pack: ScramblePack; onExit: () => void }) {
  const [words] = useState(() => shuffleWords(pack.words));
  const [index, setIndex] = useState(0);
  const [scrambled, setScrambled] = useState('');
  const [guess, setGuess] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [solved, setSolved] = useState(0);
  const [phase, setPhase] = useState<'countdown' | 'playing' | 'done'>('countdown');
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [shake, setShake] = useState(false);

  const current = words[index];

  useEffect(() => {
    if (current) setScrambled(scrambleWord(current.word));
  }, [current]);

  useEffect(() => {
    if (phase !== 'playing') return;
    if (timeLeft <= 0) {
      setPhase('done');
      toast.info("Time's up!", `${solved} words unscrambled`);
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, phase, solved]);

  const advance = () => {
    if (index >= words.length - 1) {
      setPhase('done');
      toast.success('Pack complete!', `Score: ${score} points`);
      return;
    }
    setIndex((i) => i + 1);
    setGuess('');
  };

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!current || phase !== 'playing') return;

    if (guess.trim().toLowerCase() === current.word.toLowerCase()) {
      const bonus = Math.min(streak, 4) * 25;
      setScore((s) => s + 150 + bonus);
      setSolved((s) => s + 1);
      setStreak((s) => s + 1);
      toast.success('Correct!', current.hint);
      setTimeout(advance, 400);
    } else {
      setStreak(0);
      setShake(true);
      toast.warning('Not quite', 'Try again or skip');
      setTimeout(() => setShake(false), 400);
    }
  };

  const skip = () => {
    if (!current) return;
    setStreak(0);
    toast.info('Skipped', `Answer: ${current.word}`);
    advance();
  };

  if (phase === 'countdown') {
    return (
      <GameStartCountdown
        label="Word Scramble"
        sublabel={`${pack.title} · ${words.length} words`}
        onComplete={() => {
          setPhase('playing');
          toast.info('Unscramble!', 'Type the word and hit enter');
        }}
      />
    );
  }

  if (phase === 'done') {
    return (
      <div className="space-y-6 text-center animate-fade-in-up">
        <div className="text-6xl">🔤</div>
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-wider">Great job!</p>
          <p className="text-4xl font-bold text-gradient mt-1">{score}</p>
          <p className="text-muted-foreground text-sm">points · {solved}/{words.length} words</p>
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

  if (!current) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 text-sm">
        <div className="flex items-center gap-2 font-medium">
          <Trophy className="h-4 w-4 text-primary" />
          {score}
          {streak > 1 && (
            <span className="flex items-center gap-0.5 text-orange-500 text-xs">
              <Flame className="h-3.5 w-3.5" /> ×{streak}
            </span>
          )}
        </div>
        <span className="text-muted-foreground">
          Word {index + 1}/{words.length}
        </span>
        <div
          className={cn(
            'flex items-center gap-1.5 font-semibold tabular-nums px-3 py-1 rounded-full border',
            timeLeft <= 15 ? 'border-destructive/50 text-destructive' : 'border-border',
          )}
        >
          <Timer className="h-4 w-4" />
          {timeLeft}s
        </div>
      </div>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="p-8 text-center space-y-3">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Unscramble</p>
          <p
            className={cn(
              'text-3xl md:text-4xl font-bold tracking-[0.2em] uppercase text-primary',
              shake && 'animate-wiggle',
            )}
          >
            {scrambled}
          </p>
          <p className="text-sm text-muted-foreground">Hint: {current.hint}</p>
        </CardContent>
      </Card>

      <form onSubmit={submit} className="flex gap-2">
        <Input
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          placeholder="Type the word…"
          className="text-lg"
          autoComplete="off"
          autoFocus
        />
        <Button type="submit" size="icon" className="shrink-0 h-10 w-10">
          <Check className="h-4 w-4" />
        </Button>
      </form>

      <Button variant="ghost" size="sm" className="w-full gap-2 text-muted-foreground" onClick={skip}>
        <SkipForward className="h-4 w-4" /> Skip word
      </Button>
    </div>
  );
}
