import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedBackground } from '@/components/animated-background';
import { FloatingEmojis } from '@/components/floating-emojis';
import { HeroIllustration } from '@/components/hero-illustration';
import { Gamepad2, Users, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const FEATURES_LIST = [
  { icon: Gamepad2, title: 'Live Trivia', desc: 'Real-time multiplayer quizzes for any group size.' },
  { icon: Users, title: 'Communities', desc: 'Create a home for your team, club, or friend group.' },
] as const;

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      <FloatingEmojis />

      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80 animate-fade-in-up">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Gamepad2 className="h-6 w-6 text-primary animate-pulse-soft" />
            Playground
          </div>
          <nav className="flex items-center gap-3">
            <Link href="/games">
              <Button variant="ghost">Games</Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 py-12 md:py-20">
          <div className="grid lg:grid-cols-2 gap-10 items-center max-w-5xl mx-auto">
            <div className="text-center lg:text-left space-y-6 animate-fade-in-up">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                Where groups{' '}
                <span className="text-gradient">play together</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
                Jump into live trivia with friends — no sign-up needed. Create a community when you&apos;re ready for more.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
                <Link href="/games">
                  <Button size="lg" className="w-full sm:w-auto gap-2 shadow-lg shadow-primary/25 hover:scale-[1.02] transition-transform">
                    Explore games <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto hover:scale-[1.02] transition-transform">
                    Create your community
                  </Button>
                </Link>
              </div>
            </div>
            <div className="animate-fade-in-up-delay-2">
              <HeroIllustration />
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-16 grid gap-6 md:grid-cols-2 max-w-4xl">
          {FEATURES_LIST.map(({ icon: Icon, title, desc }, i) => (
            <Card
              key={title}
              className={cn(
                'bg-card/60 backdrop-blur-sm border-border/60 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1',
                i === 0 ? 'animate-fade-in-up-delay-1' : 'animate-fade-in-up-delay-2',
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
      </main>

      <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground">
        Playground — Social Gaming & Community Platform
      </footer>
    </div>
  );
}
