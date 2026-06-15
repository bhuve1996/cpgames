import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedBackground } from '@/components/animated-background';
import { FloatingEmojis } from '@/components/floating-emojis';
import { SiteHeader } from '@/components/site-header';
import { PromoStrip } from '@/components/promo-strip';
import { PageBanner, MiniBanner } from '@/components/page-banner';
import { gamesByMode } from '@/lib/games-catalog';
import { Gamepad2, Users, User, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const FEATURES_LIST = [
  { icon: Users, title: 'Multiplayer', desc: 'Real-time trivia and party games with your whole group.' },
  { icon: User, title: 'Single player', desc: 'Quick solo challenges — play anytime, beat your high score.' },
  { icon: Gamepad2, title: 'Communities', desc: 'Create a home for your team, club, or friend group.' },
] as const;

export default function HomePage() {
  const multiplayer = gamesByMode('multiplayer').filter((g) => g.available);
  const single = gamesByMode('single').filter((g) => g.available);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      <FloatingEmojis preset="home" />
      <PromoStrip />
      <SiteHeader />

      <main className="container mx-auto px-4 py-8 md:py-12 space-y-12 max-w-5xl">
        <PageBanner
          variant="home"
          eyebrow="Social gaming platform"
          title={
            <>
              Where groups <span className="text-gradient">play together</span>
            </>
          }
          description="Multiplayer game nights with friends, or solo challenges when you're on your own — no sign-up needed."
          cta={{ href: '/games', label: 'Browse all games' }}
          className="animate-fade-in-up"
        />

        {/* Multiplayer */}
        <section className="space-y-4 animate-fade-in-up-delay-1">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">👥</span>
              <div>
                <h2 className="text-lg font-bold">Multiplayer</h2>
                <p className="text-sm text-muted-foreground">Play with friends</p>
              </div>
            </div>
            <Link href="/games" className="text-sm text-primary hover:underline shrink-0">
              See all →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {multiplayer.map((game) => (
              <MiniBanner
                key={game.id}
                emoji={game.emoji}
                title={game.title}
                description={`${game.players} · ${game.duration}`}
                href={game.href}
              />
            ))}
          </div>
        </section>

        {/* Single player */}
        <section className="space-y-4 animate-fade-in-up-delay-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <div>
                <h2 className="text-lg font-bold">Single player</h2>
                <p className="text-sm text-muted-foreground">Solo challenges</p>
              </div>
            </div>
            <Link href="/games" className="text-sm text-primary hover:underline shrink-0">
              See all →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {single.map((game) => (
              <MiniBanner
                key={game.id}
                emoji={game.emoji}
                title={game.title}
                description={game.duration ?? 'Quick round'}
                href={game.href}
              />
            ))}
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {FEATURES_LIST.map(({ icon: Icon, title, desc }, i) => (
            <Card
              key={title}
              className={cn(
                'bg-card/60 backdrop-blur-sm border-border/60 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1',
                i === 0 && 'animate-fade-in-up-delay-1',
                i === 1 && 'animate-fade-in-up-delay-2',
                i === 2 && 'animate-fade-in-up-delay-3',
              )}
            >
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{title}</CardTitle>
                <CardDescription>{desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </section>

        <section className="text-center pb-8 animate-fade-in-up-delay-3">
          <Link href="/games">
            <Button size="lg" className="gap-2 shadow-lg shadow-primary/25">
              Explore game library <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </section>
      </main>

      <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground">
        Playground — Social Gaming & Community Platform
      </footer>
    </div>
  );
}
