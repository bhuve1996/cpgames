import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';
import { CommunitiesService } from '../communities/communities.service';
import type { GamePlayer } from '@playground/shared';

@Injectable()
export class LeaderboardService {
  constructor(
    private prisma: PrismaService,
    private communities: CommunitiesService,
  ) {}

  async getCommunityLeaderboard(communityId: string, userId: string, period: 'all_time' | 'weekly' | 'event' = 'all_time', eventId?: string) {
    await this.communities.requireMember(communityId, userId);

    const entries = await this.prisma.leaderboardEntry.findMany({
      where: {
        communityId,
        period,
        ...(eventId ? { eventId } : { eventId: null }),
      },
      include: {
        user: { select: { id: true, displayName: true, avatarUrl: true } },
      },
      orderBy: { points: 'desc' },
      take: 100,
    });

    return entries.map((e, index) => ({
      userId: e.userId,
      displayName: e.user.displayName,
      avatarUrl: e.user.avatarUrl,
      points: e.points,
      rank: index + 1,
    }));
  }

  async recordGameResults(communityId: string, players: GamePlayer[], eventId?: string) {
    for (const player of players) {
      if (player.score <= 0) continue;

      await this.upsertPoints(communityId, player.userId, player.score, 'all_time');
      await this.upsertPoints(communityId, player.userId, player.score, 'weekly');

      if (eventId) {
        await this.upsertPoints(communityId, player.userId, player.score, 'event', eventId);
      }
    }
  }

  private async upsertPoints(
    communityId: string,
    userId: string,
    points: number,
    period: 'all_time' | 'weekly' | 'event',
    eventId?: string,
  ) {
    const existing = await this.prisma.leaderboardEntry.findFirst({
      where: {
        communityId,
        userId,
        period,
        eventId: eventId ?? null,
      },
    });

    if (existing) {
      await this.prisma.leaderboardEntry.update({
        where: { id: existing.id },
        data: { points: existing.points + points },
      });
    } else {
      await this.prisma.leaderboardEntry.create({
        data: {
          communityId,
          userId,
          period,
          eventId: eventId ?? null,
          points,
        },
      });
    }
  }
}
