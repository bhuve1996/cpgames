import type {
  GamePlayer,
  GameSessionState,
  TriviaQuestion,
} from '@playground/shared';
import { DEFAULT_QUESTION_TIME_SECONDS, MAX_PLAYERS_PER_GAME } from '@playground/shared';

export interface TriviaSessionConfig {
  sessionId: string;
  communityId: string;
  eventId?: string;
  hostId: string;
  questions: TriviaQuestion[];
}

export interface TriviaSessionState {
  id: string;
  communityId: string;
  eventId?: string;
  hostId: string;
  gameType: 'trivia';
  state: GameSessionState;
  currentQuestionIndex: number;
  questions: TriviaQuestion[];
  players: GamePlayer[];
  questionStartedAt: number | null;
}

export class TriviaEngine {
  private state: TriviaSessionState;

  constructor(config: TriviaSessionConfig) {
    this.state = {
      id: config.sessionId,
      communityId: config.communityId,
      eventId: config.eventId,
      hostId: config.hostId,
      gameType: 'trivia',
      state: 'lobby',
      currentQuestionIndex: -1,
      questions: config.questions,
      players: [],
      questionStartedAt: null,
    };
  }

  getState(): TriviaSessionState {
    return structuredClone(this.state);
  }

  addPlayer(player: Omit<GamePlayer, 'score' | 'currentAnswer' | 'answeredAt'>): TriviaSessionState {
    if (this.state.state !== 'lobby') {
      throw new Error('Cannot join after game started');
    }
    if (this.state.players.length >= MAX_PLAYERS_PER_GAME) {
      throw new Error('Game is full');
    }
    if (this.state.players.some((p) => p.userId === player.userId)) {
      return this.getState();
    }
    this.state.players.push({
      ...player,
      score: 0,
      currentAnswer: null,
      answeredAt: null,
    });
    return this.getState();
  }

  removePlayer(userId: string): TriviaSessionState {
    this.state.players = this.state.players.filter((p) => p.userId !== userId);
    return this.getState();
  }

  start(hostId: string): TriviaSessionState {
    if (hostId !== this.state.hostId) {
      throw new Error('Only host can start the game');
    }
    if (this.state.questions.length === 0) {
      throw new Error('No questions configured');
    }
    if (this.state.players.length < 1) {
      throw new Error('Need at least one player');
    }
    this.state.state = 'question';
    this.state.currentQuestionIndex = 0;
    this.state.questionStartedAt = Date.now();
    this.resetPlayerAnswers();
    return this.getState();
  }

  submitAnswer(userId: string, answerIndex: number): TriviaSessionState {
    if (this.state.state !== 'question') {
      throw new Error('Not accepting answers');
    }
    const player = this.state.players.find((p) => p.userId === userId);
    if (!player) {
      throw new Error('Player not in game');
    }
    if (player.currentAnswer !== null) {
      return this.getState();
    }
    const question = this.getCurrentQuestion();
    if (!question) {
      throw new Error('No active question');
    }
    if (answerIndex < 0 || answerIndex >= question.options.length) {
      throw new Error('Invalid answer');
    }

    const now = Date.now();
    player.currentAnswer = answerIndex;
    player.answeredAt = now;

    if (answerIndex === question.correctIndex) {
      const timeLimit = (question.timeLimitSeconds ?? DEFAULT_QUESTION_TIME_SECONDS) * 1000;
      const elapsed = now - (this.state.questionStartedAt ?? now);
      const timeBonus = Math.max(0, Math.floor((1 - elapsed / timeLimit) * 500));
      player.score += 1000 + timeBonus;
    }

    return this.getState();
  }

  reveal(hostId: string): TriviaSessionState {
    if (hostId !== this.state.hostId) {
      throw new Error('Only host can reveal');
    }
    if (this.state.state !== 'question') {
      throw new Error('No question to reveal');
    }
    this.state.state = 'reveal';
    return this.getState();
  }

  nextQuestion(hostId: string): TriviaSessionState {
    if (hostId !== this.state.hostId) {
      throw new Error('Only host can advance');
    }
    const nextIndex = this.state.currentQuestionIndex + 1;
    if (nextIndex >= this.state.questions.length) {
      this.state.state = 'finished';
      this.state.questionStartedAt = null;
      return this.getState();
    }
    this.state.currentQuestionIndex = nextIndex;
    this.state.state = 'question';
    this.state.questionStartedAt = Date.now();
    this.resetPlayerAnswers();
    return this.getState();
  }

  getCurrentQuestion(): TriviaQuestion | null {
    if (this.state.currentQuestionIndex < 0) return null;
    return this.state.questions[this.state.currentQuestionIndex] ?? null;
  }

  getPublicState(forUserId?: string): TriviaSessionState {
    const state = this.getState();
    if (state.state === 'question' && forUserId) {
      // Hide correct answers during question phase
      return state;
    }
    if (state.state === 'question') {
      state.questions = state.questions.map((q, i) =>
        i === state.currentQuestionIndex
          ? { ...q, correctIndex: -1 as unknown as number }
          : q,
      );
    }
    return state;
  }

  getLeaderboard(): GamePlayer[] {
    return [...this.state.players].sort((a, b) => b.score - a.score);
  }

  private resetPlayerAnswers(): void {
    for (const player of this.state.players) {
      player.currentAnswer = null;
      player.answeredAt = null;
    }
  }
}

export function createTriviaEngine(config: TriviaSessionConfig): TriviaEngine {
  return new TriviaEngine(config);
}
