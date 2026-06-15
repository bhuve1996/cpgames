'use client';

import { useState } from 'react';
import { SiteHeader } from '@/components/site-header';
import { PageBanner } from '@/components/page-banner';
import { AnimatedBackground } from '@/components/animated-background';
import { FloatingEmojis } from '@/components/floating-emojis';
import { MemoryMatchGame } from '@/components/memory-match-game';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MEMORY_PACKS } from '@/lib/memory-match-data';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';

export default function MemoryMatchPage() {
  const [activePackId, setActivePackId] = useState<string | null>(null);
  const activePack = MEMORY_PACKS.find((p) => p.id === activePackId);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <AnimatedBackground />
      <FloatingEmojis preset="games" density="normal" />
      <SiteHeader variant="subpage" backHref="/games" backLabel="All games" title="Memory Match" />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-lg space-y-6">
        {!activePack ? (
          <>
            <PageBanner
              variant="blitz"
              eyebrow="Single player"
              title="Memory Match"
              description="Flip cards and find matching pairs. Fewer moves wins."
              className="animate-fade-in-up !p-5 md:!p-6"
            />
            <div className="space-y-3">
              {MEMORY_PACKS.map((pack, i) => (
                <Card
                  key={pack.id}
                  className={cn(
                    'hover:border-primary/40 hover:shadow-md transition-all bg-card/80 backdrop-blur-sm cursor-pointer',
                    i === 0 && 'animate-fade-in-up-delay-1',
                    i === 1 && 'animate-fade-in-up-delay-2',
                    i === 2 && 'animate-fade-in-up-delay-3',
                  )}
                  onClick={() => {
                    setActivePackId(pack.id);
                    toast.info(`Starting ${pack.title}`, pack.description);
                  }}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <span className="text-3xl">{pack.emoji}</span>
                    <div className="flex-1">
                      <p className="font-semibold">{pack.title}</p>
                      <p className="text-sm text-muted-foreground">{pack.description}</p>
                    </div>
                    <Button size="sm" className="gap-1" onClick={(e) => { e.stopPropagation(); setActivePackId(pack.id); }}>
                      <Zap className="h-4 w-4" /> Start
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <MemoryMatchGame pack={activePack} onExit={() => setActivePackId(null)} />
        )}
      </main>
    </div>
  );
}
