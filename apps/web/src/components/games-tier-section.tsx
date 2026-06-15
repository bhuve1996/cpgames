import type { GameTier, GameCatalogEntry } from '@/lib/games-catalog';
import { MULTIPLAYER_TIERS } from '@/lib/games-catalog';
import { GameCard } from '@/components/game-card';
import { cn } from '@/lib/utils';

export function GamesTierSection({
  tier,
  games,
  className,
}: {
  tier: GameTier;
  games: GameCatalogEntry[];
  className?: string;
}) {
  const meta = MULTIPLAYER_TIERS[tier];
  const liveCount = games.filter((g) => g.available).length;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold">{meta.label}</h3>
          <p className="text-sm text-muted-foreground">{meta.description}</p>
        </div>
        <span className="text-xs text-muted-foreground shrink-0">{liveCount} live</span>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
}
