'use client';

import { useState } from 'react';
import { SiteHeader } from '@/components/site-header';
import { PromoStrip } from '@/components/promo-strip';
import { PageBanner } from '@/components/page-banner';
import { AnimatedBackground } from '@/components/animated-background';
import { FloatingEmojis } from '@/components/floating-emojis';
import { GamesCategorySection } from '@/components/games-category-section';
import { gamesByMode, countByMode, type GameMode } from '@/lib/games-catalog';
import { cn } from '@/lib/utils';
import { Users, User, LayoutGrid } from 'lucide-react';

type Filter = 'all' | GameMode;

const FILTERS: { id: Filter; label: string; icon: typeof LayoutGrid }[] = [
  { id: 'all', label: 'All games', icon: LayoutGrid },
  { id: 'multiplayer', label: 'Multiplayer', icon: Users },
  { id: 'single', label: 'Single player', icon: User },
];

export default function GamesPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const mp = countByMode('multiplayer');
  const solo = countByMode('single');

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <AnimatedBackground />
      <FloatingEmojis preset="games" />
      <PromoStrip />
      <SiteHeader variant="subpage" backHref="/" backLabel="Home" title="Games" />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl space-y-8">
        <PageBanner
          variant="games"
          eyebrow="Game library"
          title={
            <>
              Pick your <span className="text-gradient">mode</span>
            </>
          }
          description={`${mp.live + solo.live} games ready to play — multiplayer with friends or solo challenges on your own.`}
          className="animate-fade-in-up"
        />

        {/* Mode stats */}
        <div className="grid sm:grid-cols-2 gap-4 animate-fade-in-up-delay-1">
          <div className="rounded-xl border border-primary/25 bg-primary/5 p-4 flex items-center gap-4">
            <span className="text-3xl">👥</span>
            <div>
              <p className="font-semibold">Multiplayer</p>
              <p className="text-sm text-muted-foreground">
                {mp.live} live · {mp.total} games — trivia, party games &amp; more
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-violet-500/25 bg-violet-500/5 p-4 flex items-center gap-4">
            <span className="text-3xl">🎯</span>
            <div>
              <p className="font-semibold">Single player</p>
              <p className="text-sm text-muted-foreground">
                {solo.live} live · {solo.total} games — speed rounds &amp; brain teasers
              </p>
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 animate-fade-in-up-delay-1">
          {FILTERS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all',
                filter === id
                  ? 'bg-background border-primary/40 text-foreground shadow-sm'
                  : 'border-transparent bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {(filter === 'all' || filter === 'multiplayer') && (
          <GamesCategorySection
            mode="multiplayer"
            games={gamesByMode('multiplayer')}
            animationDelay="animate-fade-in-up-delay-2"
          />
        )}

        {(filter === 'all' || filter === 'single') && (
          <GamesCategorySection
            mode="single"
            games={gamesByMode('single')}
            animationDelay={filter === 'all' ? 'animate-fade-in-up-delay-3' : 'animate-fade-in-up-delay-2'}
          />
        )}
      </main>
    </div>
  );
}
