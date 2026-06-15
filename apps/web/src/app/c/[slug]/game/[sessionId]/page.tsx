'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { api } from '@/lib/api';
import { connectSocket, SOCKET_EVENTS } from '@/lib/socket';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { GameSession } from '@playground/shared';
import { ArrowLeft, Trophy, Users } from 'lucide-react';

export default function GamePage() {
  const params = useParams();
  const slug = params.slug as string;
  const sessionId = params.sessionId as string;
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [gameState, setGameState] = useState<GameSession | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (!token) return;
    api<GameSession>(`/games/sessions/${sessionId}`, { token }).then(setGameState).catch(console.error);
  }, [token, sessionId]);

  useEffect(() => {
    const socket = connectSocket();
    socket.emit(SOCKET_EVENTS.GAME_JOIN, { sessionId });

    const onState = (state: GameSession) => setGameState(state);
    socket.on(SOCKET_EVENTS.GAME_STATE, onState);

    return () => {
      socket.off(SOCKET_EVENTS.GAME_STATE, onState);
    };
  }, [sessionId]);

  const isHost = user?.id === gameState?.hostId;
  const currentQuestion = gameState?.questions[gameState.currentQuestionIndex];

  const startGame = () => {
    connectSocket().emit(SOCKET_EVENTS.GAME_START, { sessionId });
  };

  const submitAnswer = (index: number) => {
    connectSocket().emit(SOCKET_EVENTS.GAME_ANSWER, { sessionId, answerIndex: index });
  };

  const reveal = () => {
    connectSocket().emit(SOCKET_EVENTS.GAME_NEXT, { sessionId, action: 'reveal' });
  };

  const nextQuestion = () => {
    connectSocket().emit(SOCKET_EVENTS.GAME_NEXT, { sessionId, action: 'next' });
  };

  if (loading || !gameState) {
    return <div className="min-h-screen flex items-center justify-center">Loading game...</div>;
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/50">
        <div className="container mx-auto flex h-14 items-center gap-3 px-4">
          <Link href={`/c/${slug}`}><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
          <h1 className="font-bold">Live Trivia</h1>
          <span className="text-sm text-muted-foreground capitalize ml-auto">{gameState.state}</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {gameState.state === 'lobby' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Lobby</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{gameState.players.length} players joined</p>
              <div className="grid grid-cols-2 gap-2">
                {gameState.players.map((p) => (
                  <div key={p.userId} className="p-2 bg-secondary/50 rounded-md text-sm">{p.displayName}</div>
                ))}
              </div>
              {isHost && (
                <Button onClick={startGame} className="w-full">Start Game</Button>
              )}
              {!isHost && <p className="text-sm text-muted-foreground text-center">Waiting for host to start...</p>}
            </CardContent>
          </Card>
        )}

        {gameState.state === 'question' && currentQuestion && (
          <Card>
            <CardHeader>
              <CardTitle>Question {gameState.currentQuestionIndex + 1} / {gameState.questions.length}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg font-medium">{currentQuestion.question}</p>
              <div className="grid gap-2">
                {currentQuestion.options.map((opt, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="justify-start h-auto py-3 text-left"
                    onClick={() => submitAnswer(i)}
                    disabled={gameState.players.find((p) => p.userId === user?.id)?.currentAnswer != null}
                  >
                    {String.fromCharCode(65 + i)}. {opt}
                  </Button>
                ))}
              </div>
              {isHost && (
                <Button onClick={reveal} variant="secondary" className="w-full">Reveal Answer</Button>
              )}
            </CardContent>
          </Card>
        )}

        {gameState.state === 'reveal' && currentQuestion && (
          <Card>
            <CardHeader>
              <CardTitle>Answer Revealed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg">{currentQuestion.question}</p>
              <p className="text-primary font-bold">
                Correct: {currentQuestion.options[currentQuestion.correctIndex]}
              </p>
              <div className="space-y-1">
                {[...gameState.players].sort((a, b) => b.score - a.score).map((p, i) => (
                  <div key={p.userId} className="flex justify-between text-sm p-2 bg-secondary/30 rounded">
                    <span>#{i + 1} {p.displayName}</span>
                    <span>{p.score} pts</span>
                  </div>
                ))}
              </div>
              {isHost && (
                <Button onClick={nextQuestion} className="w-full">
                  {gameState.currentQuestionIndex + 1 >= gameState.questions.length ? 'Finish Game' : 'Next Question'}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {gameState.state === 'finished' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-yellow-500" /> Final Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[...gameState.players].sort((a, b) => b.score - a.score).map((p, i) => (
                <div key={p.userId} className={`flex justify-between p-3 rounded-md ${i === 0 ? 'bg-primary/20 border border-primary/50' : 'bg-secondary/30'}`}>
                  <span className="font-medium">#{i + 1} {p.displayName}</span>
                  <span>{p.score} pts</span>
                </div>
              ))}
              <Link href={`/c/${slug}`}>
                <Button variant="outline" className="w-full mt-4">Back to Community</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
