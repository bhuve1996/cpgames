'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { api } from '@/lib/api';
import { connectSocket, SOCKET_EVENTS } from '@/lib/socket';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VoiceRoom } from '@/components/voice-room';
import type { GameSession, TriviaQuestion } from '@playground/shared';
import { ArrowLeft, Play, Trophy } from 'lucide-react';

export default function EventPage() {
  const params = useParams();
  const slug = params.slug as string;
  const eventId = params.eventId as string;
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [event, setEvent] = useState<{
    id: string;
    title: string;
    startsAt: string;
    hostId: string;
    communityId: string;
    community: { slug: string; name: string };
    quizConfig?: { questions?: TriviaQuestion[] };
  } | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameSession | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (token) {
      api<typeof event>(`/events/${eventId}`, { token }).then(setEvent).catch(console.error);
    }
  }, [token, eventId]);

  useEffect(() => {
    if (!sessionId) return;
    const socket = connectSocket();

    socket.emit(SOCKET_EVENTS.GAME_JOIN, { sessionId });

    const onState = (state: GameSession) => setGameState(state);
    socket.on(SOCKET_EVENTS.GAME_STATE, onState);

    return () => {
      socket.off(SOCKET_EVENTS.GAME_STATE, onState);
    };
  }, [sessionId]);

  const rsvp = async (status: 'going' | 'maybe' | 'not_going') => {
    if (!token) return;
    await api(`/events/${eventId}/rsvp`, { method: 'POST', token, body: JSON.stringify({ status }) });
  };

  const startGame = async () => {
    if (!token) return;
    const savedQuiz = localStorage.getItem(`quiz-${event?.communityId}`);
    if (savedQuiz && event) {
      await api(`/events/${eventId}/quiz`, {
        method: 'PATCH',
        token,
        body: JSON.stringify({ quizConfig: JSON.parse(savedQuiz) }),
      });
    }
    const res = await api<{ sessionId: string }>(`/games/events/${eventId}/start`, { method: 'POST', token });
    setSessionId(res.sessionId);
    router.push(`/c/${slug}/game/${res.sessionId}`);
  };

  const sendReminders = async () => {
    if (!token) return;
    await api(`/events/${eventId}/reminders`, { method: 'POST', token });
    alert('Reminders sent (or logged in demo mode)');
  };

  if (loading || !event) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const isHost = user?.id === event.hostId;

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/50">
        <div className="container mx-auto flex h-14 items-center gap-3 px-4">
          <Link href={`/c/${slug}`}><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
          <div>
            <h1 className="font-bold">{event.title}</h1>
            <p className="text-xs text-muted-foreground">{new Date(event.startsAt).toLocaleString()}</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">Community: {event.community.name}</p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => rsvp('going')}>RSVP Going</Button>
              <Button size="sm" variant="outline" onClick={() => rsvp('maybe')}>Maybe</Button>
              {isHost && (
                <>
                  <Button size="sm" onClick={startGame}><Play className="h-4 w-4 mr-1" /> Start Trivia</Button>
                  <Button size="sm" variant="outline" onClick={sendReminders}>Send Reminders</Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <VoiceRoom roomName={`event-${eventId}`} />

        {sessionId && (
          <Card>
            <CardContent className="pt-6">
              <Link href={`/c/${slug}/game/${sessionId}`}>
                <Button className="w-full"><Play className="h-4 w-4 mr-2" /> Join Game Lobby</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
