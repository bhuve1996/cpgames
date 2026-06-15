'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/errors';
import { setGuestIdentity, getGuestIdentity } from '@/lib/guest';
import { guestPlayEnabled } from '@/lib/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SiteHeader } from '@/components/site-header';
import { PageBanner } from '@/components/page-banner';
import { AnimatedBackground } from '@/components/animated-background';
import { FloatingEmojis } from '@/components/floating-emojis';
import { Zap } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';

interface TriviaPackInfo {
  id: string;
  title: string;
  description: string;
  emoji: string;
  questionCount: number;
}

export default function TriviaPlayPage() {
  const router = useRouter();
  const [packs, setPacks] = useState<TriviaPackInfo[]>([]);
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
    api<TriviaPackInfo[]>('/games/packs')
      .then(setPacks)
      .catch((err) => setError(getErrorMessage(err, 'Failed to load quiz packs')));
  }, []);

  const startGame = async (packId: string) => {
    const name = displayName.trim();
    if (name.length < 2) {
      setError('Enter your name (at least 2 characters)');
      toast.warning('Name required', 'Enter at least 2 characters to play');
      return;
    }

    setError(null);
    setStarting(packId);
    try {
      const res = await api<{ sessionId: string; guestId: string }>('/games/guest/play', {
        method: 'POST',
        body: JSON.stringify({ displayName: name, packId }),
      });
      setGuestIdentity(res.guestId, name);
      toast.success('Lobby created!', 'Share the link to invite friends');
      router.push(`/games/trivia/${res.sessionId}`);
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to start game');
      setError(message);
      toast.error('Could not start game', message);
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
      <FloatingEmojis preset="trivia" density="normal" />
      <SiteHeader variant="subpage" backHref="/games" backLabel="All games" title="Live Trivia" />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-lg space-y-6">
        <PageBanner
          variant="trivia"
          eyebrow="No login required"
          title="Live Trivia"
          description="Choose a quiz pack, enter your name, and start the lobby."
          className="animate-fade-in-up !p-5 md:!p-6"
        />

        <Card className="animate-fade-in-up-delay-1 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Your name</CardTitle>
            <CardDescription>Shown to other players in the game</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="e.g. Alex"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={30}
            />
          </CardContent>
        </Card>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground px-1">Quiz packs</p>
          {packs.map((pack, i) => (
            <Card
              key={pack.id}
              className={cn(
                'hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 bg-card/80 backdrop-blur-sm',
                i === 0 && 'animate-fade-in-up-delay-1',
                i === 1 && 'animate-fade-in-up-delay-2',
                i === 2 && 'animate-fade-in-up-delay-3',
              )}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <span className="text-3xl shrink-0 animate-float-slow" style={{ animationDelay: `${i * 0.2}s` }}>{pack.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{pack.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{pack.description}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{pack.questionCount} questions</p>
                </div>
                <Button
                  size="sm"
                  disabled={!!starting}
                  onClick={() => startGame(pack.id)}
                  className="shrink-0 gap-1"
                >
                  {starting === pack.id ? '...' : <><Zap className="h-4 w-4" /> Play</>}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {packs.length === 0 && !error && (
          <p className="text-center text-muted-foreground text-sm">Loading packs...</p>
        )}
      </main>
    </div>
  );
}
