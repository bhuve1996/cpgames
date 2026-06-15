'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { GameStartCountdown } from '@/components/game-start-countdown';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';
import type { MemoryPack } from '@/lib/memory-match-data';
import { createBoard, type MemoryCard } from '@/lib/memory-match-data';
import { RotateCcw, Timer, Trophy } from 'lucide-react';

export function MemoryMatchGame({ pack, onExit }: { pack: MemoryPack; onExit: () => void }) {
  const [phase, setPhase] = useState<'countdown' | 'playing' | 'done'>('countdown');
  const [cards, setCards] = useState<MemoryCard[]>(() => createBoard(pack));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [lock, setLock] = useState(false);

  const matched = cards.filter((c) => c.matched).length / 2;
  const totalPairs = pack.symbols.length;
  const done = matched === totalPairs;

  useEffect(() => {
    if (phase !== 'playing' || done) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [phase, done]);

  useEffect(() => {
    if (done && phase === 'playing') {
      setPhase('done');
      toast.success('All pairs found!', `${moves} moves in ${seconds}s`);
    }
  }, [done, phase, moves, seconds]);

  const flip = useCallback(
    (index: number) => {
      if (lock || phase !== 'playing') return;
      const card = cards[index];
      if (card.flipped || card.matched || flipped.includes(index)) return;

      const nextFlipped = [...flipped, index];
      const nextCards = cards.map((c, i) => (i === index ? { ...c, flipped: true } : c));
      setCards(nextCards);
      setFlipped(nextFlipped);

      if (nextFlipped.length === 2) {
        setMoves((m) => m + 1);
        setLock(true);
        const [a, b] = nextFlipped;
        if (nextCards[a].symbol === nextCards[b].symbol) {
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c, i) => (i === a || i === b ? { ...c, matched: true, flipped: true } : c)),
            );
            setFlipped([]);
            setLock(false);
            toast.success('Match!', `${matched + 1}/${totalPairs} pairs`);
          }, 400);
        } else {
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c, i) => (i === a || i === b ? { ...c, flipped: false } : c)),
            );
            setFlipped([]);
            setLock(false);
          }, 700);
        }
      }
    },
    [lock, phase, cards, flipped, matched, totalPairs],
  );

  if (phase === 'countdown') {
    return (
      <GameStartCountdown
        label="Memory Match"
        sublabel={`${pack.title} · ${totalPairs} pairs`}
        onComplete={() => {
          setPhase('playing');
          toast.info('Find all pairs!', 'Remember the positions');
        }}
      />
    );
  }

  if (phase === 'done') {
    return (
      <div className="space-y-6 text-center animate-fade-in-up">
        <div className="text-6xl">🃏</div>
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-wider">Complete!</p>
          <p className="text-3xl font-bold mt-1">{moves} moves</p>
          <p className="text-muted-foreground text-sm flex items-center justify-center gap-1 mt-1">
            <Timer className="h-4 w-4" /> {seconds} seconds
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button className="flex-1" onClick={() => {
            setCards(createBoard(pack));
            setFlipped([]);
            setMoves(0);
            setSeconds(0);
            setPhase('countdown');
          }}>
            Play again
          </Button>
          <Button variant="outline" className="flex-1 gap-2" onClick={onExit}>
            <RotateCcw className="h-4 w-4" /> Other packs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1 font-medium">
          <Trophy className="h-4 w-4 text-primary" />
          {matched}/{totalPairs} pairs
        </span>
        <span className="text-muted-foreground">{moves} moves</span>
        <span className="flex items-center gap-1 tabular-nums">
          <Timer className="h-4 w-4" />
          {seconds}s
        </span>
      </div>

      <div
        className="grid gap-2 sm:gap-3"
        style={{ gridTemplateColumns: `repeat(${pack.cols}, minmax(0, 1fr))` }}
      >
        {cards.map((card, i) => (
          <button
            key={card.id}
            type="button"
            onClick={() => flip(i)}
            disabled={card.matched || lock}
            className={cn(
              'aspect-square rounded-xl border-2 text-2xl sm:text-3xl flex items-center justify-center transition-all duration-300',
              'hover:scale-[1.02] active:scale-95',
              card.matched && 'border-emerald-500/50 bg-emerald-500/10 opacity-70',
              card.flipped && !card.matched && 'border-primary bg-primary/10 rotate-y-180',
              !card.flipped && !card.matched && 'border-border bg-secondary/60 hover:border-primary/40',
            )}
          >
            {card.flipped || card.matched ? card.symbol : '?'}
          </button>
        ))}
      </div>
    </div>
  );
}
