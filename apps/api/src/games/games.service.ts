import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';
import { CommunitiesService } from '../communities/communities.service';
import { LeaderboardService } from '../leaderboard/leaderboard.service';
import { createTriviaEngine, TriviaEngine } from '@playground/game-engine';
import type { TriviaQuestion } from '@playground/shared';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GamesService {
  private engines = new Map<string, TriviaEngine>();

  constructor(
    private prisma: PrismaService,
    private communities: CommunitiesService,
    private leaderboard: LeaderboardService,
  ) {}

  async createSession(
    communityId: string,
    hostId: string,
    data: { eventId?: string; questions: TriviaQuestion[] },
  ) {
    await this.communities.requireMember(communityId, hostId);

    const session = await this.prisma.gameSession.create({
      data: {
        communityId,
        eventId: data.eventId,
        hostId,
        gameType: 'trivia',
        state: 'lobby',
        config: JSON.parse(JSON.stringify({ questions: data.questions })),
      },
    });

    const engine = createTriviaEngine({
      sessionId: session.id,
      communityId,
      eventId: data.eventId,
      hostId,
      questions: data.questions,
    });
    this.engines.set(session.id, engine);

    return { sessionId: session.id, state: engine.getState() };
  }

  getEngine(sessionId: string): TriviaEngine {
    const engine = this.engines.get(sessionId);
    if (!engine) throw new NotFoundException('Game session not found or expired');
    return engine;
  }

  async loadEngine(sessionId: string): Promise<TriviaEngine> {
    if (this.engines.has(sessionId)) {
      return this.engines.get(sessionId)!;
    }

    const session = await this.prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: {
        players: { include: { user: true } },
      },
    });
    if (!session) throw new NotFoundException('Game session not found');

    const config = session.config as unknown as { questions: TriviaQuestion[] };
    const engine = createTriviaEngine({
      sessionId: session.id,
      communityId: session.communityId,
      eventId: session.eventId ?? undefined,
      hostId: session.hostId,
      questions: config.questions ?? [],
    });

    for (const p of session.players) {
      engine.addPlayer({
        userId: p.userId,
        displayName: p.user.displayName,
        avatarUrl: p.user.avatarUrl,
      });
    }

    this.engines.set(sessionId, engine);
    return engine;
  }

  async joinSession(
    sessionId: string,
    user: { id: string; displayName: string; avatarUrl?: string | null },
  ) {
    const session = await this.prisma.gameSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Game session not found');
    await this.communities.requireMember(session.communityId, user.id);

    const engine = await this.loadEngine(sessionId);
    const state = engine.addPlayer({
      userId: user.id,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
    });

    await this.prisma.gamePlayer.upsert({
      where: { sessionId_userId: { sessionId, userId: user.id } },
      create: { sessionId, userId: user.id },
      update: {},
    });

    return state;
  }

  async persistState(sessionId: string) {
    const engine = this.getEngine(sessionId);
    const state = engine.getState();

    await this.prisma.gameSession.update({
      where: { id: sessionId },
      data: {
        state: state.state,
        currentQuestionIndex: state.currentQuestionIndex,
      },
    });

    for (const player of state.players) {
      await this.prisma.gamePlayer.update({
        where: { sessionId_userId: { sessionId, userId: player.userId } },
        data: { score: player.score },
      });
    }

    if (state.state === 'finished') {
      await this.leaderboard.recordGameResults(state.communityId, state.players, sessionId);
    }

    return state;
  }

  async getSession(sessionId: string, userId: string) {
    const session = await this.prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: { community: { select: { slug: true } } },
    });
    if (!session) throw new NotFoundException('Game session not found');
    await this.communities.requireMember(session.communityId, userId);

    try {
      const engine = await this.loadEngine(sessionId);
      return engine.getPublicState(userId);
    } catch {
      return {
        id: session.id,
        communityId: session.communityId,
        eventId: session.eventId,
        hostId: session.hostId,
        gameType: session.gameType,
        state: session.state,
        currentQuestionIndex: session.currentQuestionIndex,
        questions: (session.config as { questions?: TriviaQuestion[] }).questions ?? [],
        players: [],
      };
    }
  }

  async createFromEvent(eventId: string, hostId: string) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');
    if (event.hostId !== hostId) throw new ForbiddenException('Only host can start game');

    const quizConfig = event.quizConfig as { questions?: TriviaQuestion[] } | null;
    const questions = quizConfig?.questions?.length
      ? quizConfig.questions
      : this.getDefaultQuestions();

    return this.createSession(event.communityId, hostId, {
      eventId,
      questions,
    });
  }

  private getDefaultQuestions(): TriviaQuestion[] {
    return [
      {
        id: uuidv4(),
        question: 'What is the capital of France?',
        options: ['London', 'Berlin', 'Paris', 'Madrid'],
        correctIndex: 2,
        timeLimitSeconds: 20,
      },
      {
        id: uuidv4(),
        question: 'Which planet is known as the Red Planet?',
        options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
        correctIndex: 1,
        timeLimitSeconds: 20,
      },
      {
        id: uuidv4(),
        question: 'What year did the first iPhone launch?',
        options: ['2005', '2006', '2007', '2008'],
        correctIndex: 2,
        timeLimitSeconds: 20,
      },
    ];
  }
}
