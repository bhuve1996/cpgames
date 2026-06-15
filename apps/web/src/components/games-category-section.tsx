import type { GameMode, GameCatalogEntry } from '@/lib/games-catalog';
import { GAME_MODES } from '@/lib/games-catalog';
import { GameCard } from '@/components/game-card';
import { cn } from '@/lib/utils';
import { Users, User } from 'lucide-react';

const MODE_STYLES: Record<GameMode, { border: string; badge: string; icon: typeof Users }> = {
  multiplayer: {
    border: 'border-primary/20 bg-primary/5',
    badge: 'bg-primary/15 text-primary',
    icon: Users,
  },
  single: {
    border: 'border-violet-500/20 bg-violet-500/5',
    badge: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
    icon: User,
  },
};

export function GamesCategorySection({
  mode,
  games,
  animationDelay = '',
}: {
  mode: GameMode;
  games: GameCatalogEntry[];
  animationDelay?: string;
}) {
  const meta = GAME_MODES[mode];
  const style = MODE_STYLES[mode];
  const Icon = style.icon;
  const liveCount = games.filter((g) => g.available).length;

  return (
    <section className={cn('space-y-5', animationDelay)}>
      <div
        className={cn(
          'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border p-4 md:p-5',
          style.border,
        )}
      >
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl',
              style.badge,
            )}
          >
            {meta.emoji}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold">{meta.label}</h2>
              <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', style.badge)}>
                {liveCount} live · {games.length} total
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{meta.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground sm:text-right">
          <Icon className="h-4 w-4 shrink-0" />
          <span>{mode === 'multiplayer' ? 'Invite friends to play' : 'Play solo anytime'}</span>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((game, i) => (
          <GameCard
            key={game.id}
            game={game}
            className={cn(
              i === 0 && 'animate-fade-in-up-delay-1',
              i === 1 && 'animate-fade-in-up-delay-2',
              i >= 2 && 'animate-fade-in-up-delay-3',
            )}
          />
        ))}
      </div>
    </section>
  );
}
