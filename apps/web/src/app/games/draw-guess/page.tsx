'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/errors';
import { setGuestIdentity, getGuestIdentity } from '@/lib/guest';
import { guestPlayEnabled } from '@/lib/config';
import { SiteHeader } from '@/components/site-header';
import { PageBanner } from '@/components/page-banner';
import { AnimatedBackground } from '@/components/animated-background';
import { FloatingEmojis } from '@/components/floating-emojis';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/lib/toast';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DrawPackInfo {
  id: string;
  title: string;
  description: string;
  emoji: string;
  wordCount: number;
}

export default function DrawGuessLobbyPage() {
  const router = useRouter();
  const [packs, setPacks] = useState<DrawPackInfo[]>([]);
  const [displayName, setDisplayName] = useState('');
  const [starting, setStarting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guestOk, setGuestOk] = useState(guestPlayEnabled);

  useEffect(() => {
    api<{ enabled: boolean }>('/games/guest/enabled')
      .then((r) => setGuestOk(r.enabled))
      .catch(() => setGuestOk(guestPlayEnabled));
  }, []);

  useEffect(() => {
    const existing = getGuestIdentity();
    if (existing) setDisplayName(existing.displayName);
    api<DrawPackInfo[]>('/games/draw/packs')
      .then(setPacks)
      .catch((err) => setError(getErrorMessage(err, 'Failed to load word packs')));
  }, []);

  const startGame = async (packId: string) => {
    const name = displayName.trim();
    if (name.length < 2) {
      toast.warning('Name required', 'Enter at least 2 characters');
      return;
    }
    setStarting(packId);
    try {
      const res = await api<{ sessionId: string; guestId: string }>('/games/draw/guest/play', {
        method: 'POST',
        body: JSON.stringify({ displayName: name, packId }),
      });
      setGuestIdentity(res.guestId, name);
      toast.success('Room created!', 'Share the link with friends');
      router.push(`/games/draw-guess/${res.sessionId}`);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to create room'));
      toast.error('Could not start', getErrorMessage(err, 'Failed'));
      setStarting(null);
    }
  };

  if (!guestOk) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-muted-foreground">Guest play is currently disabled.</p>
        <Link href="/login"><Button>Log in to play</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <AnimatedBackground />
      <FloatingEmojis preset="party" />
      <SiteHeader variant="subpage" backHref="/games" backLabel="All games" title="Sketch Off" />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-lg space-y-6">
        <PageBanner
          variant="party"
          eyebrow="Live multiplayer · Pictionary"
          title="Sketch Off"
          description="Draw on the canvas — everyone else guesses in real time. The real party game."
          className="animate-fade-in-up !p-5 md:!p-6"
        />

        <Card className="bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4 space-y-2">
            <p className="font-semibold text-sm">Your name</p>
            <Input
              placeholder="e.g. Alex"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={30}
            />
          </CardContent>
        </Card>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
        )}

        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground px-1">Word packs</p>
          {packs.map((pack, i) => (
            <Card
              key={pack.id}
              className={cn(
                'hover:border-primary/40 transition-all bg-card/80 cursor-pointer',
                i === 0 && 'animate-fade-in-up-delay-1',
                i === 1 && 'animate-fade-in-up-delay-2',
                i === 2 && 'animate-fade-in-up-delay-3',
              )}
              onClick={() => !starting && startGame(pack.id)}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <span className="text-3xl">{pack.emoji}</span>
                <div className="flex-1">
                  <p className="font-semibold">{pack.title}</p>
                  <p className="text-sm text-muted-foreground">{pack.description}</p>
                </div>
                <Button size="sm" disabled={!!starting} className="gap-1" onClick={(e) => { e.stopPropagation(); startGame(pack.id); }}>
                  <Zap className="h-4 w-4" /> {starting === pack.id ? '...' : 'Create'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
