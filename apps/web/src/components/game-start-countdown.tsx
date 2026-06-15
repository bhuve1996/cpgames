'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export function GameStartCountdown({
  seconds = 3,
  label = 'Get ready!',
  sublabel,
  onComplete,
}: {
  seconds?: number;
  label?: string;
  sublabel?: string;
  onComplete: () => void;
}) {
  const [value, setValue] = useState(seconds);
  const [showGo, setShowGo] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (showGo) {
      const t = setTimeout(() => onCompleteRef.current(), 700);
      return () => clearTimeout(t);
    }

    if (value <= 0) {
      setShowGo(true);
      return;
    }

    const t = setTimeout(() => setValue((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [value, showGo]);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="text-center space-y-4 px-6 animate-fade-in-up">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{label}</p>
        {sublabel && <p className="text-muted-foreground text-sm">{sublabel}</p>}
        <div
          className={cn(
            'font-black tabular-nums leading-none transition-all duration-300',
            showGo
              ? 'text-6xl md:text-7xl text-gradient animate-pulse-soft'
              : 'text-8xl md:text-9xl text-foreground animate-pulse-soft',
          )}
        >
          {showGo ? 'GO!' : value}
        </div>
        {!showGo && (
          <div className="flex justify-center gap-2">
            {Array.from({ length: seconds }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  'h-2 w-8 rounded-full transition-colors',
                  i < seconds - value ? 'bg-primary' : 'bg-secondary',
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
