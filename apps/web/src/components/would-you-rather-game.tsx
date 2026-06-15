'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GameStartCountdown } from '@/components/game-start-countdown';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';
import type { WouldYouRatherPack } from '@/lib/would-you-rather-packs';
import { getCrowdSplit } from '@/lib/would-you-rather-packs';
import { ArrowRight, RotateCcw, Users } from 'lucide-react';

type Choice = 'A' | 'B';

export function WouldYouRatherGame({ pack, onExit }: { pack: WouldYouRatherPack; onExit: () => void }) {
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<Choice | null>(null);
  const [stats, setStats] = useState({ a: 0, b: 0 });

  if (!started) {
    return (
      <GameStartCountdown
        label="Would You Rather"
        sublabel={`${pack.title} · ${pack.dilemmas.length} dilemmas`}
        onComplete={() => {
          setStarted(true);
          toast.info('First dilemma!', 'Pick the option you prefer');
        }}
      />
    );
  }

  const dilemma = pack.dilemmas[index];
  const isLast = index >= pack.dilemmas.length - 1;
  const crowdPct = dilemma ? getCrowdSplit(dilemma.id) : 50;

  const pick = (side: Choice) => {
    if (choice) return;
    setChoice(side);
    setStats((s) => ({ ...s, [side === 'A' ? 'a' : 'b']: s[side === 'A' ? 'a' : 'b'] + 1 }));
    toast.success(`You picked Option ${side}`, 'See how others voted');
  };

  const next = () => {
    if (isLast) {
      toast.success('Pack complete!', `You chose A ${stats.a}× and B ${stats.b}×`);
      onExit();
      return;
    }
    setIndex((i) => i + 1);
    setChoice(null);
  };

  if (!dilemma) return null;

  const pickedA = choice === 'A';
  const pickedB = choice === 'B';

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Round {index + 1} of {pack.dilemmas.length}</span>
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" /> Pass &amp; play
        </span>
      </div>

      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-violet-500 transition-all duration-500"
          style={{ width: `${((index + (choice ? 1 : 0)) / pack.dilemmas.length) * 100}%` }}
        />
      </div>

      <p className="text-center text-lg font-semibold">Would you rather…</p>

      <div className="grid sm:grid-cols-2 gap-4">
        <button
          type="button"
          disabled={!!choice}
          onClick={() => pick('A')}
          className={cn(
            'text-left rounded-2xl border-2 p-5 transition-all duration-300 min-h-[120px]',
            'hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5',
            pickedA && 'border-primary bg-primary/10 ring-2 ring-primary/30',
            pickedB && 'opacity-50',
            choice && !pickedA && 'opacity-60',
          )}
        >
          <span className="text-xs font-bold text-primary uppercase tracking-wider">Option A</span>
          <p className="mt-2 font-medium text-base leading-snug">{dilemma.optionA}</p>
        </button>

        <button
          type="button"
          disabled={!!choice}
          onClick={() => pick('B')}
          className={cn(
            'text-left rounded-2xl border-2 p-5 transition-all duration-300 min-h-[120px]',
            'hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10 hover:-translate-y-0.5',
            pickedB && 'border-violet-500 bg-violet-500/10 ring-2 ring-violet-500/30',
            pickedA && 'opacity-50',
            choice && !pickedB && 'opacity-60',
          )}
        >
          <span className="text-xs font-bold text-violet-500 uppercase tracking-wider">Option B</span>
          <p className="mt-2 font-medium text-base leading-snug">{dilemma.optionB}</p>
        </button>
      </div>

      {choice && (
        <Card className="bg-card/80 backdrop-blur-sm border-primary/20 animate-fade-in-up">
          <CardContent className="p-4 space-y-3">
            <p className="text-sm text-center text-muted-foreground">
              <span className="font-semibold text-foreground">{crowdPct}%</span> of players picked Option A
              {' · '}
              <span className="font-semibold text-foreground">{100 - crowdPct}%</span> picked Option B
            </p>
            <div className="flex h-3 rounded-full overflow-hidden bg-secondary">
              <div className="bg-primary transition-all duration-700" style={{ width: `${crowdPct}%` }} />
              <div className="bg-violet-500 flex-1" />
            </div>
            <div className="flex gap-2">
              <Button className="flex-1 gap-2" onClick={next}>
                {isLast ? 'Finish' : 'Next dilemma'} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLast && choice && (
        <Card className="bg-gradient-to-br from-primary/10 to-violet-500/10 border-primary/20">
          <CardContent className="p-5 text-center space-y-2">
            <p className="text-2xl">🎉</p>
            <p className="font-semibold">Pack complete!</p>
            <p className="text-sm text-muted-foreground">
              You picked A {stats.a}× and B {stats.b}×
            </p>
          </CardContent>
        </Card>
      )}

      <Button variant="ghost" size="sm" className="w-full gap-2 text-muted-foreground" onClick={onExit}>
        <RotateCcw className="h-4 w-4" /> Choose another pack
      </Button>
    </div>
  );
}
