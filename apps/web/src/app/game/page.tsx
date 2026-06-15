'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/errors';
import { setGuestIdentity, getGuestIdentity } from '@/lib/guest';
import { guestPlayEnabled } from '@/lib/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gamepad2, Zap } from 'lucide-react';

interface TriviaPackInfo {
  id: string;
  title: string;
  description: string;
  emoji: string;
  questionCount: number;
}

export default function GuestGamePage() {
  const router = useRouter();
  const [packs, setPacks] = useState<TriviaPackInfo[]>([]);
  const [displayName, setDisplayName] = useState('');
  const [starting, setStarting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      setError('Enter a name (at least 2 characters)');
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
      router.push(`/game/${res.sessionId}`);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to start game'));
      setStarting(null);
    }
  };

  if (!guestPlayEnabled) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-muted-foreground">Guest play is currently disabled.</p>
        <Link href="/login"><Button>Log in to play</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/50">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Gamepad2 className="h-5 w-5 text-primary" />
            Playground
          </Link>
          <Link href="/login">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-lg space-y-6">
        <div className="text-center py-4">
          <div className="text-5xl mb-3">🎮</div>
          <h1 className="text-2xl font-bold">Play Trivia</h1>
          <p className="text-muted-foreground mt-1">No account needed — jump in and play</p>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Your name</CardTitle>
            <CardDescription>Shown on the leaderboard during the game</CardDescription>
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

        <div className="grid gap-4">
          {packs.map((pack) => (
            <Card key={pack.id} className="hover:border-primary/50 transition-all">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{pack.emoji}</span>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{pack.title}</CardTitle>
                    <CardDescription>{pack.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{pack.questionCount} questions</span>
                <Button
                  size="sm"
                  disabled={!!starting}
                  onClick={() => startGame(pack.id)}
                  className="gap-1"
                >
                  {starting === pack.id ? 'Starting...' : <><Zap className="h-4 w-4" /> Play</>}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {packs.length === 0 && !error && (
          <p className="text-center text-muted-foreground">Loading quiz packs...</p>
        )}
      </main>
    </div>
  );
}
