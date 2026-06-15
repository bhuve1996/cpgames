import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { createDrawGuessEngine, DrawGuessEngine } from '@playground/game-engine';
import {
  getDrawGuessPack,
  shuffleWords,
  type DrawGuessPublicSession,
} from '@playground/shared';

@Injectable()
export class DrawGuessService {
  private guestEngines = new Map<string, DrawGuessEngine>();

  constructor(private config: ConfigService) {}

  isGuestPlayEnabled(): boolean {
    return this.config.get<string>('GUEST_PLAY_ENABLED') !== 'false';
  }

  isGuestSession(sessionId: string): boolean {
    return this.guestEngines.has(sessionId);
  }

  getEngine(sessionId: string): DrawGuessEngine {
    const engine = this.guestEngines.get(sessionId);
    if (!engine) throw new NotFoundException('Draw & Guess session not found or expired');
    return engine;
  }

  createGuestSession(displayName: string, packId = 'everyday') {
    if (!this.isGuestPlayEnabled()) {
      throw new ForbiddenException('Guest play is disabled');
    }
    const trimmedName = displayName.trim();
    if (trimmedName.length < 2) {
      throw new ForbiddenException('Display name must be at least 2 characters');
    }

    const pack = getDrawGuessPack(packId) ?? getDrawGuessPack('everyday')!;
    const guestId = `guest-${randomUUID()}`;
    const sessionId = randomUUID();
    const engine = createDrawGuessEngine({
      sessionId,
      hostId: guestId,
      packId: pack.id,
      words: shuffleWords(pack.words),
    });
    engine.addPlayer({
      userId: guestId,
      displayName: trimmedName,
      avatarUrl: null,
    });
    this.guestEngines.set(sessionId, engine);

    return {
      sessionId,
      guestId,
      state: engine.getPublicState(guestId),
    };
  }

  joinGuestSession(sessionId: string, displayName: string) {
    if (!this.isGuestPlayEnabled()) {
      throw new ForbiddenException('Guest play is disabled');
    }
    if (!this.isGuestSession(sessionId)) {
      throw new NotFoundException('Draw & Guess session not found');
    }
    const trimmedName = displayName.trim();
    if (trimmedName.length < 2) {
      throw new ForbiddenException('Display name must be at least 2 characters');
    }

    const guestId = `guest-${randomUUID()}`;
    const engine = this.guestEngines.get(sessionId)!;
    const state = engine.addPlayer({
      userId: guestId,
      displayName: trimmedName,
      avatarUrl: null,
    });

    return { guestId, state };
  }

  getGuestSession(sessionId: string, playerId?: string): DrawGuessPublicSession {
    if (!this.isGuestSession(sessionId)) {
      throw new NotFoundException('Draw & Guess session not found');
    }
    return this.guestEngines.get(sessionId)!.getPublicState(playerId);
  }
}
