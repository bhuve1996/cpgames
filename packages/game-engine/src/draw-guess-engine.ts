import type {
  DrawGuessGuess,
  DrawGuessPlayer,
  DrawGuessPublicSession,
  DrawGuessSession,
  DrawStroke,
} from '@playground/shared';
import { MAX_PLAYERS_PER_GAME } from '@playground/shared';

const ROUND_SECONDS = 90;
const POINTS_GUESS = 200;
const POINTS_DRAWER = 100;

export interface DrawGuessConfig {
  sessionId: string;
  hostId: string;
  packId: string;
  words: string[];
}

function normalize(text: string) {
  return text.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '');
}

export class DrawGuessEngine {
  private state: DrawGuessSession;

  constructor(config: DrawGuessConfig) {
    this.state = {
      id: config.sessionId,
      hostId: config.hostId,
      gameType: 'draw-guess',
      phase: 'lobby',
      packId: config.packId,
      words: config.words,
      round: 0,
      drawerIndex: 0,
      currentWord: '',
      strokes: [],
      guesses: [],
      players: [],
      roundStartedAt: null,
      roundWinnerId: null,
      roundSeconds: ROUND_SECONDS,
    };
  }

  getState(): DrawGuessSession {
    return structuredClone(this.state);
  }

  getPublicState(userId?: string): DrawGuessPublicSession {
    const drawer = this.state.players[this.state.drawerIndex];
    const isDrawer = !!userId && drawer?.userId === userId;
    const showWord = isDrawer || this.state.phase === 'reveal' || this.state.phase === 'finished';
    const { words, currentWord, ...rest } = this.getState();
    return {
      ...rest,
      currentWord: showWord ? currentWord : undefined,
      isDrawer,
    };
  }

  addPlayer(player: Omit<DrawGuessPlayer, 'score'>): DrawGuessPublicSession {
    if (this.state.phase !== 'lobby') throw new Error('Game already started');
    if (this.state.players.length >= MAX_PLAYERS_PER_GAME) throw new Error('Room is full');
    if (!this.state.players.some((p) => p.userId === player.userId)) {
      this.state.players.push({ ...player, score: 0 });
    }
    return this.getPublicState(player.userId);
  }

  start(hostId: string): DrawGuessPublicSession {
    if (hostId !== this.state.hostId) throw new Error('Only host can start');
    if (this.state.players.length < 2) throw new Error('Need at least 2 players');
    this.beginRound(0);
    return this.getPublicState(hostId);
  }

  private beginRound(drawerIndex: number) {
    const wordIndex = drawerIndex % this.state.words.length;
    this.state.drawerIndex = drawerIndex;
    this.state.round = drawerIndex + 1;
    this.state.currentWord = this.state.words[wordIndex] ?? 'Mystery';
    this.state.strokes = [];
    this.state.guesses = [];
    this.state.roundWinnerId = null;
    this.state.phase = 'drawing';
    this.state.roundStartedAt = Date.now();
  }

  addStroke(drawerId: string, stroke: DrawStroke): DrawGuessPublicSession {
    const drawer = this.state.players[this.state.drawerIndex];
    if (!drawer || drawer.userId !== drawerId) throw new Error('Only the drawer can draw');
    if (this.state.phase !== 'drawing') throw new Error('Not in drawing phase');
    this.state.strokes.push(stroke);
    return this.getPublicState(drawerId);
  }

  clearCanvas(drawerId: string): DrawGuessPublicSession {
    const drawer = this.state.players[this.state.drawerIndex];
    if (!drawer || drawer.userId !== drawerId) throw new Error('Only the drawer can clear');
    this.state.strokes = [];
    return this.getPublicState(drawerId);
  }

  submitGuess(userId: string, displayName: string, text: string): DrawGuessPublicSession {
    if (this.state.phase !== 'drawing') throw new Error('Not accepting guesses');
    const drawer = this.state.players[this.state.drawerIndex];
    if (drawer?.userId === userId) throw new Error('Drawer cannot guess');

    const correct = normalize(text) === normalize(this.state.currentWord);
    const guess: DrawGuessGuess = {
      userId,
      displayName,
      text: text.trim(),
      correct,
      at: Date.now(),
    };
    this.state.guesses.push(guess);

    if (correct && !this.state.roundWinnerId) {
      this.state.roundWinnerId = userId;
      const guesser = this.state.players.find((p) => p.userId === userId);
      if (guesser) guesser.score += POINTS_GUESS;
      if (drawer) drawer.score += POINTS_DRAWER;
      this.state.phase = 'reveal';
    }

    return this.getPublicState(userId);
  }

  nextRound(hostId: string): DrawGuessPublicSession {
    if (hostId !== this.state.hostId) throw new Error('Only host can advance');
    const nextDrawer = this.state.drawerIndex + 1;
    if (nextDrawer >= this.state.players.length) {
      this.state.phase = 'finished';
      return this.getPublicState(hostId);
    }
    this.beginRound(nextDrawer);
    return this.getPublicState(hostId);
  }
}

export function createDrawGuessEngine(config: DrawGuessConfig) {
  return new DrawGuessEngine(config);
}
