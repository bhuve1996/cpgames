'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { GameStartCountdown } from '@/components/game-start-countdown';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';
import type { NHIEPack } from '@/lib/never-have-i-data';
import { ArrowRight, Hand, Minus, Plus, RotateCcw, Users } from 'lucide-react';

export function NeverHaveIEverGame({ pack, onExit }: { pack: NHIEPack; onExit: () => void }) {
  const [phase, setPhase] = useState<'setup' | 'countdown' | 'playing' | 'done'>('setup');
  const [playerCount, setPlayerCount] = useState(4);
  const [index, setIndex] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [scores, setScores] = useState<number[]>([]);

  const prompt = pack.prompts[index];
  const isLastPrompt = index >= pack.prompts.length - 1;
  const isLastPlayer = currentPlayer >= playerCount - 1;

  const startGame = () => {
    if (playerCount < 2) {
      toast.warning('Need at least 2 players');
      return;
    }
    setScores(Array.from({ length: playerCount }, () => 0));
    setPhase('countdown');
  };

  if (phase === 'setup') {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <Card className="bg-card/80">
          <CardContent className="p-5 space-y-4">
            <p className="font-semibold">How many players?</p>
            <p className="text-sm text-muted-foreground">
              Pass the device each round. Tap &quot;I have&quot; if you&apos;ve done it.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button variant="outline" size="icon" onClick={() => setPlayerCount((n) => Math.max(2, n - 1))}>
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                min={2}
                max={20}
                value={playerCount}
                onChange={(e) => setPlayerCount(Math.min(20, Math.max(2, Number(e.target.value) || 2)))}
                className="w-20 text-center text-lg font-bold"
              />
              <Button variant="outline" size="icon" onClick={() => setPlayerCount((n) => Math.min(20, n + 1))}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button className="w-full" onClick={startGame}>Start game</Button>
          </CardContent>
        </Card>
        <Button variant="ghost" size="sm" className="w-full gap-2" onClick={onExit}>
          <RotateCcw className="h-4 w-4" /> Choose another pack
        </Button>
      </div>
    );
  }

  if (phase === 'countdown') {
    return (
      <GameStartCountdown
        label="Never Have I Ever"
        sublabel={`${playerCount} players · ${pack.title}`}
        onComplete={() => {
          setPhase('playing');
          toast.info('Player 1\'s turn', 'Be honest!');
        }}
      />
    );
  }

  const respond = (have: boolean) => {
    if (have) {
      setScores((prev) => {
        const next = [...prev];
        next[currentPlayer] = (next[currentPlayer] ?? 0) + 1;
        return next;
      });
      toast.success('Counted!', `Player ${currentPlayer + 1}`);
    }

    if (isLastPlayer && isLastPrompt) {
      setPhase('done');
      toast.success('Game over!', 'See who\'s most adventurous');
      return;
    }

    if (isLastPlayer) {
      setIndex((i) => i + 1);
      setCurrentPlayer(0);
    } else {
      setCurrentPlayer((p) => p + 1);
    }
  };

  if (phase === 'done') {
    const maxScore = Math.max(...scores, 0);
    const winners = scores
      .map((s, i) => ({ s, i }))
      .filter(({ s }) => s === maxScore)
      .map(({ i }) => i + 1);

    return (
      <div className="space-y-6 text-center animate-fade-in-up">
        <div className="text-6xl">🙈</div>
        <div>
          <p className="font-semibold text-lg">
            {winners.length > 1
              ? `Tie between players ${winners.join(', ')}`
              : `Player ${winners[0]} wins`}
          </p>
          <p className="text-muted-foreground text-sm">{maxScore} confessions</p>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          {scores.map((s, i) => (
            <div key={i} className="rounded-lg p-2 border border-border bg-secondary/40 text-xs">
              <p className="text-muted-foreground">P{i + 1}</p>
              <p className="text-lg font-bold">{s}</p>
            </div>
          ))}
        </div>
        <Button className="w-full gap-2" onClick={onExit}>
          Done <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  if (!prompt) return null;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Round {index + 1} / {pack.prompts.length}</span>
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" /> {playerCount} players
        </span>
      </div>

      <Card className="bg-gradient-to-br from-primary/10 to-violet-500/10 border-primary/20">
        <CardContent className="p-8 text-center space-y-2">
          <p className="text-xs uppercase tracking-widest text-primary font-semibold">
            Player {currentPlayer + 1}&apos;s turn
          </p>
          <p className="text-sm text-muted-foreground">Never have I ever…</p>
          <p className="text-xl md:text-2xl font-bold leading-snug">{prompt.text}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Button size="lg" className="h-16 text-base gap-2" onClick={() => respond(true)}>
          <Hand className="h-5 w-5" /> I have
        </Button>
        <Button size="lg" variant="secondary" className="h-16 text-base" onClick={() => respond(false)}>
          I haven&apos;t
        </Button>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
        {scores.map((s, i) => (
          <div
            key={i}
            className={cn(
              'rounded-lg p-2 text-center text-xs border',
              i === currentPlayer ? 'border-primary bg-primary/10 font-bold' : 'border-border bg-secondary/40',
            )}
          >
            <p className="text-muted-foreground">P{i + 1}</p>
            <p className="text-lg font-bold">{s}</p>
          </div>
        ))}
      </div>

      <Button variant="ghost" size="sm" className="w-full gap-2" onClick={onExit}>
        <RotateCcw className="h-4 w-4" /> Exit game
      </Button>
    </div>
  );
}
