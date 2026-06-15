'use client';

import { useState } from 'react';
import { SiteHeader } from '@/components/site-header';
import { PageBanner } from '@/components/page-banner';
import { AnimatedBackground } from '@/components/animated-background';
import { FloatingEmojis } from '@/components/floating-emojis';
import { WordScrambleGame } from '@/components/word-scramble-game';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SCRAMBLE_PACKS } from '@/lib/word-scramble-data';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';

export default function WordScramblePage() {
  const [activePackId, setActivePackId] = useState<string | null>(null);
  const activePack = SCRAMBLE_PACKS.find((p) => p.id === activePackId);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <AnimatedBackground />
      <FloatingEmojis preset="games" density="normal" />
      <SiteHeader variant="subpage" backHref="/games" backLabel="All games" title="Word Scramble" />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-lg space-y-6">
        {!activePack ? (
          <>
            <PageBanner
              variant="party"
              eyebrow="Single player"
              title="Word Scramble"
              description="Unscramble jumbled letters and beat the clock."
              className="animate-fade-in-up !p-5 md:!p-6"
            />

            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground px-1">Word packs</p>
              {SCRAMBLE_PACKS.map((pack, i) => (
                <Card
                  key={pack.id}
                  className={cn(
                    'hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5 transition-all bg-card/80 backdrop-blur-sm cursor-pointer',
                    i === 0 && 'animate-fade-in-up-delay-1',
                    i === 1 && 'animate-fade-in-up-delay-2',
                  )}
                  onClick={() => {
                    setActivePackId(pack.id);
                    toast.info(`Starting ${pack.title}`, `${pack.words.length} words`);
                  }}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <span className="text-3xl shrink-0">{pack.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">{pack.title}</p>
                      <p className="text-sm text-muted-foreground">{pack.description}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{pack.words.length} words</p>
                    </div>
                    <Button
                      size="sm"
                      className="shrink-0 gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePackId(pack.id);
                        toast.info(`Starting ${pack.title}`, `${pack.words.length} words`);
                      }}
                    >
                      <Zap className="h-4 w-4" /> Start
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <WordScrambleGame pack={activePack} onExit={() => setActivePackId(null)} />
        )}
      </main>
    </div>
  );
}
