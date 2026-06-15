'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/errors';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gamepad2, Zap, Users } from 'lucide-react';

interface TriviaPackInfo {
  id: string;
  title: string;
  description: string;
  emoji: string;
  questionCount: number;
}

export function PlayPanel({ communityId, slug }: { communityId: string; slug: string }) {
  const { token } = useAuth();
  const router = useRouter();
  const [packs, setPacks] = useState<TriviaPackInfo[]>([]);
  const [starting, setStarting] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<TriviaPackInfo[]>('/games/packs')
      .then(setPacks)
      .catch((err) => setError(getErrorMessage(err, 'Failed to load quiz packs')));
  }, []);

  const playNow = async (packId: string) => {
    if (!token) {
      setError('Please log in to play');
      return;
    }
    setError(null);
    setStarting(packId);
    try {
      const res = await api<{ sessionId: string }>(`/games/communities/${communityId}/play-now`, {
        method: 'POST',
        token,
        body: JSON.stringify({ packId }),
      });
      if (!res.sessionId) throw new Error('Server did not return a game session');
      router.push(`/c/${slug}/game/${res.sessionId}`);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to start game'));
      setStarting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center py-4">
        <div className="text-5xl mb-3">🎮</div>
        <h2 className="text-2xl font-bold">Live Trivia</h2>
        <p className="text-muted-foreground mt-1">Pick a quiz pack and start playing in seconds</p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        {packs.map((pack) => (
          <Card
            key={pack.id}
            className="hover:border-primary/50 transition-all cursor-pointer group"
            onClick={() => !starting && playNow(pack.id)}
          >
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
                onClick={(e) => { e.stopPropagation(); playNow(pack.id); }}
                className="gap-1"
              >
                {starting === pack.id ? (
                  'Starting...'
                ) : (
                  <><Zap className="h-4 w-4" /> Play Now</>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {packs.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <p className="text-muted-foreground">Loading quiz packs...</p>
          </CardContent>
        </Card>
      )}

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium">How to play with friends</p>
              <p className="text-muted-foreground mt-1">
                1. Click Play Now → 2. Copy the invite link from the lobby → 3. Start when everyone has joined
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
