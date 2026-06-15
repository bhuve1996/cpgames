'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'playground_promo_dismissed';

export function PromoStrip() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(localStorage.getItem(STORAGE_KEY) !== '1');
  }, []);

  if (!visible) return null;

  return (
    <div className="relative z-[60] bg-gradient-to-r from-primary via-violet-600 to-fuchsia-600 text-white text-sm">
      <div className="container mx-auto flex items-center justify-center gap-3 px-10 py-2.5 text-center">
        <Sparkles className="h-4 w-4 shrink-0 animate-pulse-soft hidden sm:block" />
        <p className="font-medium">
          <span className="opacity-90">7 games live</span> — multiplayer &amp; solo. No account needed.{' '}
          <Link href="/games" className="underline underline-offset-2 font-semibold hover:opacity-90">
            Jump in now →
          </Link>
        </p>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 text-white hover:bg-white/20 hover:text-white"
          onClick={() => {
            localStorage.setItem(STORAGE_KEY, '1');
            setVisible(false);
          }}
          aria-label="Dismiss banner"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
