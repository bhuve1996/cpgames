import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { GameCatalogEntry } from '@/lib/games-catalog';
import { Users, Clock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function GameCard({ game, className }: { game: GameCatalogEntry; className?: string }) {
  return (
    <Card
      className={cn(
        'relative overflow-hidden group transition-all duration-300 h-full flex flex-col',
        game.available
          ? 'hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 bg-card/70 backdrop-blur-sm'
          : 'opacity-60 bg-card/40',
        className,
      )}
    >
      {game.available && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      )}
      <span
        className={cn(
          'absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full z-10',
          game.available
            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
            : 'bg-secondary text-muted-foreground',
        )}
      >
        {game.available ? 'Live' : 'Soon'}
      </span>
      <CardHeader className="pb-2 relative flex-1">
        <span
          className={cn('text-5xl mb-2 block', game.available && 'group-hover:animate-wiggle')}
        >
          {game.emoji}
        </span>
        <CardTitle className="text-xl pr-12">{game.title}</CardTitle>
        <CardDescription className="text-sm leading-relaxed">{game.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 relative mt-auto">
        {(game.players || game.duration) && (
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {game.players && (
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" /> {game.players}
              </span>
            )}
            {game.duration && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> {game.duration}
              </span>
            )}
          </div>
        )}
        {game.available ? (
          <Link href={game.href}>
            <Button className="w-full gap-2 group-hover:shadow-md transition-shadow">
              Play now <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
        ) : (
          <Button className="w-full" variant="secondary" disabled>
            Coming soon
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
