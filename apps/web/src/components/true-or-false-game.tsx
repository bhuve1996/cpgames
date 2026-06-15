'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GameStartCountdown } from '@/components/game-start-countdown';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';
import type { TrueFalsePack } from '@/lib/true-or-false-data';
import { Check, RotateCcw, Users, X } from 'lucide-react';

export function TrueOrFalseGame({ pack, onExit }: { pack: TrueFalsePack; onExit: () => void }) {
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);

  const statement = pack.statements[index];
  const isLast = index >= pack.statements.length - 1;

  if (!started) {
    return (
      <GameStartCountdown
        label="True or False"
        sublabel={`${pack.title} · ${pack.statements.length} statements`}
        onComplete={() => {
          setStarted(true);
          toast.info('First statement!', 'True or false?');
        }}
      />
    );
  }

  const answer = (value: boolean) => {
    if (picked !== null || !statement) return;
    setPicked(value);
    const correct = value === statement.answer;
    if (correct) {
      setScore((s) => s + 1);
      toast.success('Correct!');
    } else {
      toast.warning('Wrong', `It was ${statement.answer ? 'TRUE' : 'FALSE'}`);
    }
  };

  const next = () => {
    if (isLast) {
      toast.success('Round complete!', `You got ${score}/${pack.statements.length} correct`);
      onExit();
      return;
    }
    setIndex((i) => i + 1);
    setPicked(null);
  };

  if (!statement) return null;

  const showResult = picked !== null;
  const wasCorrect = picked === statement.answer;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Statement {index + 1} of {pack.statements.length}</span>
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" /> Score: {score}
        </span>
      </div>

      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-violet-500 transition-all"
          style={{ width: `${((index + (showResult ? 1 : 0)) / pack.statements.length) * 100}%` }}
        />
      </div>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <p className="text-lg md:text-xl font-medium leading-relaxed">{statement.text}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          disabled={showResult}
          onClick={() => answer(true)}
          className={cn(
            'flex flex-col items-center gap-2 rounded-2xl border-2 p-6 transition-all font-bold text-lg',
            'hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:-translate-y-0.5',
            showResult && statement.answer === true && 'border-emerald-500 bg-emerald-500/15 ring-2 ring-emerald-500/30',
            showResult && picked === true && statement.answer !== true && 'border-destructive bg-destructive/10',
            showResult && picked !== true && statement.answer !== true && 'opacity-50',
          )}
        >
          <Check className="h-8 w-8 text-emerald-500" />
          TRUE
        </button>
        <button
          type="button"
          disabled={showResult}
          onClick={() => answer(false)}
          className={cn(
            'flex flex-col items-center gap-2 rounded-2xl border-2 p-6 transition-all font-bold text-lg',
            'hover:border-destructive/50 hover:bg-destructive/10 hover:-translate-y-0.5',
            showResult && statement.answer === false && 'border-destructive bg-destructive/15 ring-2 ring-destructive/30',
            showResult && picked === false && statement.answer !== false && 'border-amber-500 bg-amber-500/10',
            showResult && picked !== false && statement.answer !== false && 'opacity-50',
          )}
        >
          <X className="h-8 w-8 text-destructive" />
          FALSE
        </button>
      </div>

      {showResult && (
        <Card className={cn('border', wasCorrect ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-destructive/30 bg-destructive/5')}>
          <CardContent className="p-4 text-center space-y-3">
            <p className="font-semibold">{wasCorrect ? '✅ Nice!' : '❌ Not quite'}</p>
            <p className="text-sm text-muted-foreground">
              The answer is <strong>{statement.answer ? 'TRUE' : 'FALSE'}</strong>
            </p>
            <Button className="w-full" onClick={next}>
              {isLast ? 'Finish' : 'Next statement'}
            </Button>
          </CardContent>
        </Card>
      )}

      {isLast && showResult && (
        <Card className="bg-gradient-to-br from-primary/10 to-violet-500/10">
          <CardContent className="p-5 text-center">
            <p className="text-2xl mb-1">🎯</p>
            <p className="font-semibold">Final score: {score}/{pack.statements.length}</p>
          </CardContent>
        </Card>
      )}

      <Button variant="ghost" size="sm" className="w-full gap-2" onClick={onExit}>
        <RotateCcw className="h-4 w-4" /> Choose another pack
      </Button>
    </div>
  );
}
