'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DrawingCanvas } from '@/components/drawing-canvas';
import { connectSocket, resetSocket, SOCKET_EVENTS } from '@/lib/socket';
import { toast } from '@/lib/toast';
import type { DrawGuessPublicSession, DrawStroke } from '@playground/shared';
import { cn } from '@/lib/utils';
import {
  ArrowLeft, Copy, Check, Users, Timer, Trophy, Eraser, Play, SkipForward,
} from 'lucide-react';

export function DrawGuessGame({
  sessionId,
  guest,
}: {
  sessionId: string;
  guest: { guestId: string; displayName: string };
}) {
  const [gameState, setGameState] = useState<DrawGuessPublicSession | null>(null);
  const [guess, setGuess] = useState('');
  const [timeLeft, setTimeLeft] = useState(90);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const playerId = guest.guestId;
  const isHost = playerId === gameState?.hostId;

  useEffect(() => {
    resetSocket();
    const socket = connectSocket();

    const onConnect = () => {
      socket.emit(SOCKET_EVENTS.DRAW_JOIN, { sessionId });
    };

    const onState = (state: DrawGuessPublicSession) => {
      setError(null);
      setGameState(state);
      if (state.roundStartedAt && state.phase === 'drawing') {
        const elapsed = Math.floor((Date.now() - state.roundStartedAt) / 1000);
        setTimeLeft(Math.max(0, state.roundSeconds - elapsed));
      }
    };

    const onError = (payload: { message?: string }) => {
      const msg = payload?.message ?? 'Game action failed';
      setError(msg);
      toast.error('Draw & Guess', msg);
    };

    if (socket.connected) onConnect();
    socket.on('connect', onConnect);
    socket.on(SOCKET_EVENTS.DRAW_STATE, onState);
    socket.on(SOCKET_EVENTS.DRAW_ERROR, onError);
    socket.on('connect_error', () => setError('Could not connect to game server'));

    return () => {
      socket.off('connect', onConnect);
      socket.off(SOCKET_EVENTS.DRAW_STATE, onState);
      socket.off(SOCKET_EVENTS.DRAW_ERROR, onError);
    };
  }, [sessionId]);

  useEffect(() => {
    if (gameState?.phase !== 'drawing') return;
    const t = setInterval(() => setTimeLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [gameState?.phase, gameState?.round]);

  const emit = (event: string, data: object) => connectSocket().emit(event, data);

  const startGame = () => emit(SOCKET_EVENTS.DRAW_START, { sessionId });
  const onStroke = useCallback(
    (stroke: DrawStroke) => emit(SOCKET_EVENTS.DRAW_STROKE, { sessionId, stroke }),
    [sessionId],
  );
  const clearCanvas = () => emit(SOCKET_EVENTS.DRAW_CLEAR, { sessionId });
  const submitGuess = (e: React.FormEvent) => {
    e.preventDefault();
    const text = guess.trim();
    if (!text) return;
    emit(SOCKET_EVENTS.DRAW_GUESS, { sessionId, guess: text });
    setGuess('');
    toast.success('Guess sent!');
  };
  const nextRound = () => emit(SOCKET_EVENTS.DRAW_NEXT, { sessionId });

  const copyInvite = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Invite link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!gameState) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        {error ? (
          <>
            <p className="text-destructive">{error}</p>
            <Link href="/games/draw-guess"><Button variant="outline">Back</Button></Link>
          </>
        ) : (
          <>
            <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="text-muted-foreground">Joining room…</p>
          </>
        )}
      </div>
    );
  }

  const drawer = gameState.players[gameState.drawerIndex];
  const isDrawer = gameState.isDrawer;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-primary/5">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border/30">
        <Link href="/games/draw-guess">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="text-center">
          <p className="font-bold">Sketch Off</p>
          <p className="text-xs text-muted-foreground capitalize">{gameState.phase}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={copyInvite}>
          {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
        </Button>
      </header>

      <main className="flex-1 container mx-auto px-4 py-4 max-w-2xl space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
        )}

        {gameState.phase === 'lobby' && (
          <div className="space-y-6 text-center py-8">
            <div className="text-6xl">🎨</div>
            <h2 className="text-2xl font-bold">Game Lobby</h2>
            <p className="text-muted-foreground">Share the link — friends join and guess your drawings live</p>
            <div className="flex items-center justify-center gap-2 text-sm">
              <Users className="h-4 w-4" />
              {gameState.players.length} player{gameState.players.length !== 1 ? 's' : ''}
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {gameState.players.map((p) => (
                <span key={p.userId} className="px-3 py-1.5 rounded-full bg-secondary text-sm font-medium">
                  {p.displayName}{p.userId === gameState.hostId && ' ★'}
                </span>
              ))}
            </div>
            {isHost ? (
              <Button size="lg" className="gap-2" onClick={startGame} disabled={gameState.players.length < 2}>
                <Play className="h-5 w-5" /> Start game
              </Button>
            ) : (
              <p className="text-muted-foreground animate-pulse">Waiting for host…</p>
            )}
            <Button variant="outline" size="sm" onClick={copyInvite} className="gap-2">
              <Copy className="h-4 w-4" /> Copy invite link
            </Button>
          </div>
        )}

        {(gameState.phase === 'drawing' || gameState.phase === 'reveal') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>Round {gameState.round} · Drawer: <strong>{drawer?.displayName}</strong></span>
              {gameState.phase === 'drawing' && (
                <span className={cn(
                  'flex items-center gap-1 font-bold tabular-nums px-2 py-0.5 rounded-full border',
                  timeLeft <= 10 ? 'border-destructive text-destructive' : 'border-border',
                )}>
                  <Timer className="h-3.5 w-3.5" /> {timeLeft}s
                </span>
              )}
            </div>

            {isDrawer && gameState.currentWord && gameState.phase === 'drawing' && (
              <div className="text-center p-3 rounded-xl bg-primary/10 border border-primary/30">
                <p className="text-xs uppercase tracking-widest text-primary font-semibold">Draw this word</p>
                <p className="text-2xl font-bold mt-1">{gameState.currentWord}</p>
              </div>
            )}

            {!isDrawer && gameState.phase === 'drawing' && (
              <p className="text-center text-sm text-muted-foreground">
                Watch the canvas and type your guess below!
              </p>
            )}

            <DrawingCanvas
              strokes={gameState.strokes}
              readOnly={!isDrawer || gameState.phase !== 'drawing'}
              onStroke={isDrawer && gameState.phase === 'drawing' ? onStroke : undefined}
            />

            {isDrawer && gameState.phase === 'drawing' && (
              <Button variant="outline" size="sm" className="gap-2" onClick={clearCanvas}>
                <Eraser className="h-4 w-4" /> Clear canvas
              </Button>
            )}

            {!isDrawer && gameState.phase === 'drawing' && (
              <form onSubmit={submitGuess} className="flex gap-2">
                <Input
                  placeholder="Type your guess…"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  autoComplete="off"
                  className="text-lg"
                />
                <Button type="submit">Guess</Button>
              </form>
            )}

            {gameState.guesses.length > 0 && (
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {gameState.guesses.slice(-8).map((g, i) => (
                  <p key={i} className={cn('text-sm px-2', g.correct && 'text-emerald-600 font-semibold')}>
                    {g.displayName}: {g.text} {g.correct && '✓'}
                  </p>
                ))}
              </div>
            )}

            {gameState.phase === 'reveal' && (
              <div className="text-center space-y-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <p className="text-sm text-muted-foreground">The word was</p>
                <p className="text-3xl font-bold text-primary">{gameState.currentWord}</p>
                {gameState.roundWinnerId && (
                  <p className="text-sm">
                    🎉 {gameState.players.find((p) => p.userId === gameState.roundWinnerId)?.displayName} guessed it!
                  </p>
                )}
                {isHost && (
                  <Button className="gap-2" onClick={nextRound}>
                    <SkipForward className="h-4 w-4" /> Next round
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {gameState.phase === 'finished' && (
          <div className="space-y-6 py-8 text-center">
            <div className="text-6xl">🏆</div>
            <h2 className="text-2xl font-bold">Game Over!</h2>
            <div className="space-y-2">
              {[...gameState.players].sort((a, b) => b.score - a.score).map((p, i) => (
                <div key={p.userId} className={cn(
                  'flex justify-between p-3 rounded-xl',
                  i === 0 ? 'bg-primary/15 border border-primary/40' : 'bg-secondary/40',
                )}>
                  <span className="font-medium">{i === 0 ? '🥇' : `#${i + 1}`} {p.displayName}</span>
                  <span className="font-bold flex items-center gap-1">
                    <Trophy className="h-4 w-4" /> {p.score}
                  </span>
                </div>
              ))}
            </div>
            <Link href="/games/draw-guess">
              <Button>Play again</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
