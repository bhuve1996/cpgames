'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/errors';
import { getGuestIdentity, setGuestIdentity } from '@/lib/guest';
import { guestPlayEnabled } from '@/lib/config';
import { resetSocket } from '@/lib/socket';
import { TriviaGame } from '@/components/trivia-game';
import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { GameSession } from '@playground/shared';

export default function TriviaSessionPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [guest, setGuest] = useState<{ guestId: string; displayName: string } | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [guestOk, setGuestOk] = useState(guestPlayEnabled);

  useEffect(() => {
    api<{ enabled: boolean }>('/games/guest/enabled')
      .then((r) => setGuestOk(r.enabled))
      .catch(() => setGuestOk(guestPlayEnabled));
  }, []);

  useEffect(() => {
    if (!guestOk) {
      setChecking(false);
      return;
    }

    const existing = getGuestIdentity();
    if (existing) setDisplayName(existing.displayName);

    api<GameSession>(`/games/guest/sessions/${sessionId}`)
      .then((session) => {
        if (existing && session.players.some((p) => p.userId === existing.guestId)) {
          setGuest(existing);
        }
      })
      .catch((err) => setError(getErrorMessage(err, 'Game not found')))
      .finally(() => setChecking(false));
  }, [sessionId, guestOk]);

  const joinGame = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = displayName.trim();
    if (name.length < 2) {
      setError('Enter a name (at least 2 characters)');
      return;
    }

    setJoining(true);
    setError(null);
    try {
      const res = await api<{ guestId: string }>(`/games/guest/sessions/${sessionId}/join`, {
        method: 'POST',
        body: JSON.stringify({ displayName: name }),
      });
      const identity = { guestId: res.guestId, displayName: name };
      setGuestIdentity(res.guestId, name);
      resetSocket();
      setGuest(identity);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to join game'));
    } finally {
      setJoining(false);
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

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (guest) {
    return <TriviaGame sessionId={sessionId} guest={guest} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader variant="subpage" backHref="/games/trivia" backLabel="Live Trivia" title="Join game" />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Join the lobby</CardTitle>
            <CardDescription>Enter your name to play with the group</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={joinGame} className="space-y-4">
              <Input
                placeholder="Your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={30}
                autoFocus
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={joining}>
                {joining ? 'Joining...' : 'Join game'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
