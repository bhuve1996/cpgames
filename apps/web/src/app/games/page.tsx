import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GamesHeader } from '@/components/games-header';
import { AnimatedBackground } from '@/components/animated-background';
import { FloatingEmojis } from '@/components/floating-emojis';
import { GameArt } from '@/components/game-art';
import { GAMES_CATALOG } from '@/lib/games-catalog';
import { Users, Clock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function GamesPage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <AnimatedBackground />
      <FloatingEmojis items={['🎮', '🧠', '🎨', '🤔', '🏆', '✨']} />
      <GamesHeader backHref="/" backLabel="Home" />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8 space-y-4 animate-fade-in-up">
          <GameArt
            src="/illustrations/games-banner.svg"
            alt="Animated games banner"
            className="w-full max-w-md mb-2"
            priority
          />
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Explore <span className="text-gradient">games</span>
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Pick a game, invite friends, and start playing — no account required.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {GAMES_CATALOG.map((game, i) => (
            <Card
              key={game.id}
              className={cn(
                'relative overflow-hidden group transition-all duration-300',
                i === 0 && 'animate-fade-in-up-delay-1',
                i === 1 && 'animate-fade-in-up-delay-2',
                i === 2 && 'animate-fade-in-up-delay-3',
                game.available
                  ? 'hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 bg-card/70 backdrop-blur-sm'
                  : 'opacity-60 bg-card/40',
              )}
            >
              {game.available && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              )}
              {game.tag && (
                <span
                  className={cn(
                    'absolute top-3 right-3 text-xs font-medium px-2.5 py-1 rounded-full z-10',
                    game.available ? 'bg-primary/15 text-primary' : 'bg-secondary text-muted-foreground',
                  )}
                >
                  {game.tag}
                </span>
              )}
              <CardHeader className="pb-2 relative">
                <span
                  className={cn(
                    'text-5xl mb-2 block',
                    game.available && 'group-hover:animate-wiggle',
                  )}
                >
                  {game.emoji}
                </span>
                <CardTitle className="text-xl">{game.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">{game.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 relative">
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
          ))}
        </div>
      </main>
    </div>
  );
}
