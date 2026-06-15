'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/errors';
import { connectSocket, resetSocket, SOCKET_EVENTS } from '@/lib/socket';
import { Button } from '@/components/ui/button';
import type { GameSession } from '@playground/shared';
import { ArrowLeft, Trophy, Users, Clock, Zap, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const ANSWER_COLORS = [
  'bg-red-500 hover:bg-red-600 border-red-600',
  'bg-blue-500 hover:bg-blue-600 border-blue-600',
  'bg-amber-400 hover:bg-amber-500 border-amber-500 text-black',
  'bg-emerald-500 hover:bg-emerald-600 border-emerald-600',
];

const ANSWER_SHAPES = ['▲', '◆', '●', '■'];

export function TriviaGame({
  sessionId,
  slug,
  guest,
}: {
  sessionId: string;
  slug?: string;
  guest?: { guestId: string; displayName: string };
}) {
  const { user, token } = useAuth();
  const playerId = guest?.guestId ?? user?.id ?? null;
  const isGuest = !!guest;
  const backHref = isGuest ? '/game' : `/c/${slug}`;
  const playAgainHref = isGuest ? '/game' : `/c/${slug}/play`;
  const communityHref = isGuest ? '/' : `/c/${slug}`;
  const [gameState, setGameState] = useState<GameSession | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [copied, setCopied] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSession = useCallback(() => {
    if (isGuest) {
      api<GameSession>(`/games/guest/sessions/${sessionId}`)
        .then(setGameState)
        .catch((err) => setError(getErrorMessage(err, 'Failed to load game')));
      return;
    }
    if (!token) return;
    api<GameSession>(`/games/sessions/${sessionId}`, { token })
      .then(setGameState)
      .catch((err) => setError(getErrorMessage(err, 'Failed to load game')));
  }, [token, sessionId, isGuest]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  useEffect(() => {
    if (!isGuest && !token) return;
    if (isGuest && !guest?.guestId) return;

    resetSocket();
    const socket = connectSocket();

    const onConnect = () => {
      socket.emit(SOCKET_EVENTS.GAME_JOIN, { sessionId });
    };

    const onState = (state: GameSession) => {
      setError(null);
      setGameState(state);
      if (state.state === 'question') {
        const me = state.players.find((p) => p.userId === playerId);
        setAnswered(me?.currentAnswer != null);
      }
      if (state.state === 'reveal' || state.state === 'question') {
        const q = state.questions[state.currentQuestionIndex];
        if (q && state.state === 'question' && state.questionStartedAt) {
          const limit = (q.timeLimitSeconds ?? 20) * 1000;
          const elapsed = Date.now() - state.questionStartedAt;
          setTimeLeft(Math.max(0, Math.ceil((limit - elapsed) / 1000)));
        }
      }
    };

    const onGameError = (payload: { message?: string }) => {
      setError(payload?.message ?? 'Game action failed');
    };

    const onConnectError = () => {
      setError('Could not connect to game server. Check that the API is running.');
    };

    if (socket.connected) onConnect();
    socket.on('connect', onConnect);
    socket.on(SOCKET_EVENTS.GAME_STATE, onState);
    socket.on(SOCKET_EVENTS.GAME_ERROR, onGameError);
    socket.on('connect_error', onConnectError);

    return () => {
      socket.off('connect', onConnect);
      socket.off(SOCKET_EVENTS.GAME_STATE, onState);
      socket.off(SOCKET_EVENTS.GAME_ERROR, onGameError);
      socket.off('connect_error', onConnectError);
    };
  }, [sessionId, token, playerId, isGuest, guest?.guestId]);

  // Countdown timer
  useEffect(() => {
    if (gameState?.state !== 'question') return;
    const interval = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState?.state, gameState?.currentQuestionIndex]);

  const isHost = playerId === gameState?.hostId;
  const currentQuestion = gameState?.questions[gameState.currentQuestionIndex];
  const progress = gameState
    ? ((gameState.currentQuestionIndex + (gameState.state === 'finished' ? 1 : 0)) / gameState.questions.length) * 100
    : 0;

  const emit = (event: string, data: object) => connectSocket().emit(event, data);

  const startGame = () => emit(SOCKET_EVENTS.GAME_START, { sessionId });
  const submitAnswer = (index: number) => {
    if (answered) return;
    setAnswered(true);
    emit(SOCKET_EVENTS.GAME_ANSWER, { sessionId, answerIndex: index });
  };
  const reveal = () => emit(SOCKET_EVENTS.GAME_NEXT, { sessionId, action: 'reveal' });
  const nextQuestion = () => emit(SOCKET_EVENTS.GAME_NEXT, { sessionId, action: 'next' });

  const copyInvite = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!gameState) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        {error ? (
          <>
            <p className="text-destructive text-center">{error}</p>
            <Link href={backHref}>
              <Button variant="outline">Back</Button>
            </Link>
          </>
        ) : (
          <>
            <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="text-muted-foreground">Joining game...</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-primary/5">
      {/* Progress bar */}
      <div className="h-1.5 bg-secondary w-full">
        <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <header className="flex items-center justify-between px-4 py-3 border-b border-border/30">
        <Link href={backHref}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="text-center">
          <p className="font-bold text-lg">Live Trivia</p>
          <p className="text-xs text-muted-foreground capitalize">{gameState.state}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={copyInvite}>
          {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
        </Button>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 max-w-2xl flex flex-col">
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
            {error}
          </div>
        )}
        {/* LOBBY */}
        {gameState.state === 'lobby' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
            <div className="text-6xl">🎮</div>
            <div>
              <h2 className="text-2xl font-bold">Game Lobby</h2>
              <p className="text-muted-foreground mt-1">
                {gameState.questions.length} questions ready · Share the link to invite players
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              {gameState.players.length} player{gameState.players.length !== 1 ? 's' : ''} joined
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full max-w-sm">
              {gameState.players.map((p) => (
                <div key={p.userId} className="px-3 py-2 bg-secondary/60 rounded-lg text-sm font-medium truncate">
                  {p.displayName}
                  {p.userId === gameState.hostId && <span className="text-primary ml-1">★</span>}
                </div>
              ))}
            </div>

            {isHost ? (
              <Button onClick={startGame} size="lg" className="w-full max-w-sm text-lg h-14 gap-2">
                <Zap className="h-5 w-5" /> Start Game
              </Button>
            ) : (
              <p className="text-muted-foreground animate-pulse">Waiting for host to start...</p>
            )}

            <Button variant="outline" size="sm" onClick={copyInvite} className="gap-2">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Link copied!' : 'Copy invite link'}
            </Button>
          </div>
        )}

        {/* QUESTION */}
        {gameState.state === 'question' && currentQuestion && (
          <div className="flex-1 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Q{gameState.currentQuestionIndex + 1} / {gameState.questions.length}
              </span>
              <div className={cn(
                'flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-lg',
                timeLeft <= 5 ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-secondary',
              )}>
                <Clock className="h-4 w-4" />
                {timeLeft}s
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold leading-snug text-center py-4">
              {currentQuestion.question}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
              {currentQuestion.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => submitAnswer(i)}
                  disabled={answered}
                  className={cn(
                    'flex items-center gap-3 p-4 rounded-xl border-2 text-white font-semibold text-left transition-all',
                    ANSWER_COLORS[i],
                    answered && 'opacity-60 cursor-not-allowed',
                    !answered && 'active:scale-95 shadow-lg',
                  )}
                >
                  <span className="text-2xl opacity-80">{ANSWER_SHAPES[i]}</span>
                  <span>{opt}</span>
                </button>
              ))}
            </div>

            {answered && (
              <p className="text-center text-muted-foreground animate-pulse">Answer locked in! Waiting for others...</p>
            )}

            {isHost && (
              <Button onClick={reveal} variant="secondary" className="w-full h-12">
                Reveal Answer ({gameState.players.filter((p) => p.currentAnswer != null).length}/{gameState.players.length} answered)
              </Button>
            )}
          </div>
        )}

        {/* REVEAL */}
        {gameState.state === 'reveal' && currentQuestion && (
          <div className="flex-1 flex flex-col gap-6">
            <h2 className="text-lg text-muted-foreground text-center">{currentQuestion.question}</h2>
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-2">Correct answer</p>
              <p className={cn(
                'text-2xl font-bold px-6 py-3 rounded-xl inline-block text-white',
                ANSWER_COLORS[currentQuestion.correctIndex],
              )}>
                {ANSWER_SHAPES[currentQuestion.correctIndex]} {currentQuestion.options[currentQuestion.correctIndex]}
              </p>
            </div>

            <div className="space-y-2">
              {[...gameState.players].sort((a, b) => b.score - a.score).map((p, i) => (
                <div key={p.userId} className="flex justify-between items-center p-3 bg-secondary/40 rounded-lg">
                  <span className="font-medium">
                    <span className="text-primary mr-2">#{i + 1}</span>
                    {p.displayName}
                  </span>
                  <span className="font-bold">{p.score.toLocaleString()} pts</span>
                </div>
              ))}
            </div>

            {isHost && (
              <Button onClick={nextQuestion} size="lg" className="w-full h-12">
                {gameState.currentQuestionIndex + 1 >= gameState.questions.length ? '🏆 Finish Game' : 'Next Question →'}
              </Button>
            )}
          </div>
        )}

        {/* FINISHED */}
        {gameState.state === 'finished' && (
          <div className="flex-1 flex flex-col items-center gap-6 py-8">
            <div className="text-6xl">🏆</div>
            <h2 className="text-3xl font-bold">Game Over!</h2>

            <div className="w-full space-y-3">
              {[...gameState.players].sort((a, b) => b.score - a.score).map((p, i) => (
                <div
                  key={p.userId}
                  className={cn(
                    'flex justify-between items-center p-4 rounded-xl',
                    i === 0 ? 'bg-primary/20 border-2 border-primary' : 'bg-secondary/40',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
                    <span className="font-semibold text-lg">{p.displayName}</span>
                  </div>
                  <span className="font-bold text-lg">{p.score.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3 w-full max-w-sm">
              <Link href={playAgainHref} className="flex-1">
                <Button variant="outline" className="w-full">Play Again</Button>
              </Link>
              <Link href={communityHref} className="flex-1">
                <Button className="w-full">{isGuest ? 'Home' : 'Back to Community'}</Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
