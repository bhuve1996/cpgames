'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { getGuestIdentity, setGuestIdentity } from '@/lib/guest';
import { DrawGuessGame } from '@/components/draw-guess-game';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { getErrorMessage } from '@/lib/errors';

export default function DrawGuessSessionPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [guest, setGuest] = useState<{ guestId: string; displayName: string } | null>(null);
  const [joinName, setJoinName] = useState('');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const existing = getGuestIdentity();
    if (existing) {
      setGuest(existing);
      return;
    }
    api(`/games/draw/guest/sessions/${sessionId}`).catch(() => {
      /* session exists, need to join */
    });
  }, [sessionId]);

  const joinGame = async () => {
    const name = joinName.trim();
    if (name.length < 2) {
      setError('Enter your name (at least 2 characters)');
      return;
    }
    setJoining(true);
    setError(null);
    try {
      const res = await api<{ guestId: string }>(`/games/draw/guest/sessions/${sessionId}/join`, {
        method: 'POST',
        body: JSON.stringify({ displayName: name }),
      });
      const identity = { guestId: res.guestId, displayName: name };
      setGuestIdentity(res.guestId, name);
      setGuest(identity);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to join game'));
      setJoining(false);
    }
  };

  if (!guest) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <Card className="w-full max-w-sm">
          <CardContent className="p-6 space-y-4">
            <div className="text-center">
              <span className="text-4xl">🎨</span>
              <h1 className="text-xl font-bold mt-2">Join Sketch Off</h1>
              <p className="text-sm text-muted-foreground">Enter your name to join this room</p>
            </div>
            <Input
              placeholder="Your name"
              value={joinName}
              onChange={(e) => setJoinName(e.target.value)}
              maxLength={30}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button className="w-full" onClick={joinGame} disabled={joining}>
              {joining ? 'Joining…' : 'Join game'}
            </Button>
            <Link href="/games/draw-guess" className="block text-center text-sm text-muted-foreground hover:text-primary">
              Create your own room
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <DrawGuessGame sessionId={sessionId} guest={guest} />;
}
