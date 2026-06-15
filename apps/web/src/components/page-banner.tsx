import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GameArt } from '@/components/game-art';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';

type BannerVariant = 'games' | 'trivia' | 'home' | 'dashboard' | 'party' | 'blitz';

const VARIANTS: Record<
  BannerVariant,
  { gradient: string; art?: string; emoji?: string }
> = {
  home: {
    gradient: 'from-primary/20 via-violet-500/10 to-fuchsia-500/10',
    emoji: '🎮',
  },
  games: {
    gradient: 'from-primary/25 via-violet-600/15 to-indigo-500/10',
    art: '/illustrations/games-banner.svg',
  },
  trivia: {
    gradient: 'from-amber-500/15 via-primary/20 to-violet-600/15',
    art: '/illustrations/trivia-play.svg',
  },
  dashboard: {
    gradient: 'from-primary/15 via-background to-violet-500/10',
    emoji: '👋',
  },
  party: {
    gradient: 'from-fuchsia-500/15 via-primary/15 to-amber-500/10',
    emoji: '🤔',
  },
  blitz: {
    gradient: 'from-amber-500/20 via-orange-500/10 to-primary/15',
    emoji: '⚡',
  },
};

export function PageBanner({
  variant,
  eyebrow,
  title,
  description,
  cta,
  className,
}: {
  variant: BannerVariant;
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  cta?: { href: string; label: string };
  className?: string;
}) {
  const style = VARIANTS[variant];

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br p-6 md:p-10',
        style.gradient,
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 to-transparent dark:from-white/5 pointer-events-none" />
      <div className="relative grid md:grid-cols-[1fr_auto] gap-6 items-center">
        <div className="space-y-3 text-center md:text-left">
          {eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">{eyebrow}</p>
          )}
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground max-w-lg mx-auto md:mx-0 text-base">{description}</p>
          )}
          {cta && (
            <Link href={cta.href}>
              <Button className="mt-2 gap-2 shadow-lg shadow-primary/20">
                {cta.label} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
        {(style.art || style.emoji) && (
          <div className="flex justify-center md:justify-end">
            {style.art ? (
              <GameArt src={style.art} alt="" className="w-full max-w-[220px] md:max-w-[260px]" />
            ) : (
              <span className="text-7xl md:text-8xl animate-float-slow">{style.emoji}</span>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/** Slim inline banner for cards or sections */
export function MiniBanner({
  title,
  description,
  href,
  emoji = '🎯',
}: {
  title: string;
  description: string;
  href: string;
  emoji?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 to-violet-500/5 p-4 hover:border-primary/40 hover:shadow-md hover:shadow-primary/10 transition-all"
    >
      <span className="text-3xl group-hover:animate-wiggle">{emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <ArrowRight className="h-5 w-5 text-primary shrink-0 group-hover:translate-x-1 transition-transform" />
    </Link>
  );
}
