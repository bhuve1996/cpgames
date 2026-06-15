import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';
import { CommunitiesService } from '../communities/communities.service';
import { EmailService } from '../email/email.service';
import { RsvpStatus } from '@prisma/client';

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private communities: CommunitiesService,
    private email: EmailService,
  ) {}

  async create(
    communityId: string,
    userId: string,
    data: {
      title: string;
      description?: string;
      startsAt: string;
      endsAt?: string;
      gameType?: string;
      quizConfig?: object;
    },
  ) {
    await this.communities.requireMember(communityId, userId);

    const event = await this.prisma.event.create({
      data: {
        communityId,
        hostId: userId,
        title: data.title,
        description: data.description,
        startsAt: new Date(data.startsAt),
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
        gameType: data.gameType ?? 'trivia',
        quizConfig: data.quizConfig ?? undefined,
      },
      include: {
        host: { select: { id: true, displayName: true, avatarUrl: true } },
        _count: { select: { rsvps: true } },
      },
    });

    return this.formatEvent(event);
  }

  async listForCommunity(communityId: string, userId: string) {
    await this.communities.requireMember(communityId, userId);

    const events = await this.prisma.event.findMany({
      where: { communityId },
      include: {
        host: { select: { id: true, displayName: true, avatarUrl: true } },
        _count: { select: { rsvps: true } },
      },
      orderBy: { startsAt: 'asc' },
    });

    return events.map((e) => this.formatEvent(e));
  }

  async getOne(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        host: { select: { id: true, displayName: true, avatarUrl: true } },
        rsvps: {
          include: { user: { select: { id: true, displayName: true, avatarUrl: true } } },
        },
        community: { select: { id: true, name: true, slug: true } },
      },
    });
    if (!event) throw new NotFoundException('Event not found');
    await this.communities.requireMember(event.communityId, userId);

    return {
      ...this.formatEvent(event),
      rsvps: event.rsvps.map((r) => ({
        userId: r.userId,
        status: r.status,
        user: r.user,
      })),
      community: event.community,
      quizConfig: event.quizConfig,
    };
  }

  async rsvp(eventId: string, userId: string, status: RsvpStatus) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');
    await this.communities.requireMember(event.communityId, userId);

    await this.prisma.eventRsvp.upsert({
      where: { eventId_userId: { eventId, userId } },
      create: { eventId, userId, status },
      update: { status },
    });

    return { success: true, status };
  }

  async updateQuizConfig(eventId: string, userId: string, quizConfig: object) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');
    if (event.hostId !== userId) throw new ForbiddenException('Only host can update quiz');

    const updated = await this.prisma.event.update({
      where: { id: eventId },
      data: { quizConfig: JSON.parse(JSON.stringify(quizConfig)) },
      include: {
        host: { select: { id: true, displayName: true, avatarUrl: true } },
        _count: { select: { rsvps: true } },
      },
    });

    return this.formatEvent(updated);
  }

  async sendReminders(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        community: true,
        rsvps: {
          where: { status: 'going' },
          include: { user: true },
        },
      },
    });
    if (!event) throw new NotFoundException('Event not found');
    if (event.hostId !== userId) throw new ForbiddenException('Only host can send reminders');

    const sent = await this.email.sendEventReminder(
      event.rsvps.map((r) => r.user.email),
      event.title,
      event.startsAt,
      event.community.name,
    );

    return { sent };
  }

  private formatEvent(event: {
    id: string;
    communityId: string;
    title: string;
    description: string | null;
    startsAt: Date;
    endsAt: Date | null;
    hostId: string;
    gameType: string | null;
    location: string | null;
    createdAt: Date;
    host?: { id: string; displayName: string; avatarUrl: string | null };
    _count?: { rsvps: number };
  }) {
    return {
      id: event.id,
      communityId: event.communityId,
      title: event.title,
      description: event.description,
      startsAt: event.startsAt.toISOString(),
      endsAt: event.endsAt?.toISOString() ?? null,
      hostId: event.hostId,
      gameType: event.gameType,
      location: event.location,
      rsvpCount: event._count?.rsvps ?? 0,
      host: event.host,
      createdAt: event.createdAt.toISOString(),
    };
  }
}
