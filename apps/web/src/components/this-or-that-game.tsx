'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GameStartCountdown } from '@/components/game-start-countdown';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';
import type { ThisOrThatPack } from '@/lib/this-or-that-data';
import { getCrowdPercent, getCrowdPick } from '@/lib/this-or-that-data';
import { ArrowRight, RotateCcw, Users } from 'lucide-react';

type Pick = 'A' | 'B';

export function ThisOrThatGame({ pack, onExit }: { pack: ThisOrThatPack; onExit: () => void }) {
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [pick, setPick] = useState<Pick | null>(null);
  const [stats, setStats] = useState({ a: 0, b: 0 });

  const item = pack.choices[index];
  const isLast = index >= pack.choices.length - 1;

  if (!started) {
    return (
      <GameStartCountdown
        label="This or That"
        sublabel={`${pack.title} · ${pack.choices.length} picks`}
        onComplete={() => {
          setStarted(true);
          toast.info('First pick!', 'No wrong answers — just choose');
        }}
      />
    );
  }

  const choose = (side: Pick) => {
    if (pick) return;
    setPick(side);
    setStats((s) => ({ ...s, [side === 'A' ? 'a' : 'b']: s[side === 'A' ? 'a' : 'b'] + 1 }));
    toast.success(`You picked ${side === 'A' ? item?.optionA : item?.optionB}!`);
  };

  const next = () => {
    if (isLast) {
      toast.success('All done!', `You picked A ${stats.a}× · B ${stats.b}×`);
      onExit();
      return;
    }
    setIndex((i) => i + 1);
    setPick(null);
  };

  if (!item) return null;

  const crowdPct = getCrowdPercent(item.id);
  const crowdFav = getCrowdPick(item.id);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Pick {index + 1} of {pack.choices.length}</span>
        <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Pass &amp; play</span>
      </div>

      <p className="text-center text-lg font-semibold">This or that?</p>

      <div className="grid sm:grid-cols-2 gap-4">
        {(['A', 'B'] as const).map((side) => {
          const label = side === 'A' ? item.optionA : item.optionB;
          const selected = pick === side;
          const isCrowd = crowdFav === side;
          return (
            <button
              key={side}
              type="button"
              disabled={!!pick}
              onClick={() => choose(side)}
              className={cn(
                'rounded-2xl border-2 p-8 text-center transition-all font-bold text-lg',
                'hover:-translate-y-0.5 hover:shadow-lg',
                side === 'A'
                  ? 'hover:border-primary/50 hover:bg-primary/5'
                  : 'hover:border-violet-500/50 hover:bg-violet-500/5',
                selected && side === 'A' && 'border-primary bg-primary/10 ring-2 ring-primary/30',
                selected && side === 'B' && 'border-violet-500 bg-violet-500/10 ring-2 ring-violet-500/30',
                pick && !selected && 'opacity-50',
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      {pick && (
        <Card className="bg-card/80">
          <CardContent className="p-4 space-y-3 text-center">
            <p className="text-sm text-muted-foreground">
              {crowdPct}% of players picked <strong>{crowdFav === 'A' ? item.optionA : item.optionB}</strong>
            </p>
            <div className="flex h-2 rounded-full overflow-hidden bg-secondary">
              <div className="bg-primary transition-all" style={{ width: `${crowdFav === 'A' ? crowdPct : 100 - crowdPct}%` }} />
              <div className="bg-violet-500 flex-1" />
            </div>
            <Button className="w-full gap-2" onClick={next}>
              {isLast ? 'Finish' : 'Next'} <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      <Button variant="ghost" size="sm" className="w-full gap-2" onClick={onExit}>
        <RotateCcw className="h-4 w-4" /> Choose another pack
      </Button>
    </div>
  );
}
