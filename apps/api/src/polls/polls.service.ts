import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';
import { CommunitiesService } from '../communities/communities.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PollsService {
  constructor(
    private prisma: PrismaService,
    private communities: CommunitiesService,
  ) {}

  async create(
    communityId: string,
    userId: string,
    data: { question: string; options: string[]; channelId?: string; closesAt?: string },
  ) {
    await this.communities.requireMember(communityId, userId);

    const options = data.options.map((text) => ({ id: uuidv4(), text, voteCount: 0 }));

    const poll = await this.prisma.poll.create({
      data: {
        communityId,
        channelId: data.channelId,
        question: data.question,
        options,
        closesAt: data.closesAt ? new Date(data.closesAt) : null,
      },
    });

    return this.formatPoll(poll);
  }

  async listForCommunity(communityId: string, userId: string) {
    await this.communities.requireMember(communityId, userId);

    const polls = await this.prisma.poll.findMany({
      where: { communityId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return polls.map((p) => this.formatPoll(p));
  }

  async vote(pollId: string, userId: string, optionId: string) {
    const poll = await this.prisma.poll.findUnique({ where: { id: pollId } });
    if (!poll) throw new NotFoundException('Poll not found');
    if (poll.closesAt && poll.closesAt < new Date()) {
      throw new BadRequestException('Poll is closed');
    }

    await this.communities.requireMember(poll.communityId, userId);

    const options = poll.options as Array<{ id: string; text: string; voteCount?: number }>;
    if (!options.some((o) => o.id === optionId)) {
      throw new BadRequestException('Invalid option');
    }

    await this.prisma.pollVote.upsert({
      where: { pollId_userId: { pollId, userId } },
      create: { pollId, userId, optionId },
      update: { optionId },
    });

    const votes = await this.prisma.pollVote.findMany({ where: { pollId } });
    const voteCounts = new Map<string, number>();
    for (const v of votes) {
      voteCounts.set(v.optionId, (voteCounts.get(v.optionId) ?? 0) + 1);
    }

    const updatedOptions = options.map((o) => ({
      ...o,
      voteCount: voteCounts.get(o.id) ?? 0,
    }));

    await this.prisma.poll.update({
      where: { id: pollId },
      data: { options: updatedOptions },
    });

    return this.formatPoll({ ...poll, options: updatedOptions });
  }

  private formatPoll(poll: {
    id: string;
    communityId: string;
    channelId: string | null;
    question: string;
    options: unknown;
    closesAt: Date | null;
    createdAt: Date;
  }) {
    return {
      id: poll.id,
      communityId: poll.communityId,
      channelId: poll.channelId,
      question: poll.question,
      options: poll.options as Array<{ id: string; text: string; voteCount?: number }>,
      closesAt: poll.closesAt?.toISOString() ?? null,
      createdAt: poll.createdAt.toISOString(),
    };
  }
}
