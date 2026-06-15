import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';
import { CommunitiesService } from '../communities/communities.service';
import { MAX_CHANNELS_PER_COMMUNITY } from '@playground/shared';
import { ChannelType } from '@prisma/client';

@Injectable()
export class ChannelsService {
  constructor(
    private prisma: PrismaService,
    private communities: CommunitiesService,
  ) {}

  async create(
    communityId: string,
    userId: string,
    data: { name: string; type?: ChannelType },
  ) {
    await this.communities.requireRole(communityId, userId, ['owner', 'admin']);

    const count = await this.prisma.channel.count({ where: { communityId } });
    if (count >= MAX_CHANNELS_PER_COMMUNITY) {
      throw new BadRequestException(`Max ${MAX_CHANNELS_PER_COMMUNITY} channels per community`);
    }

    return this.prisma.channel.create({
      data: {
        communityId,
        name: data.name,
        type: data.type ?? 'text',
        sortOrder: count,
      },
    });
  }

  async getMessages(channelId: string, userId: string, cursor?: string, limit = 50) {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
    });
    if (!channel) throw new ForbiddenException('Channel not found');
    await this.communities.requireMember(channel.communityId, userId);

    const messages = await this.prisma.message.findMany({
      where: { channelId },
      take: limit,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, displayName: true, avatarUrl: true } },
      },
    });

    return messages.reverse().map((m) => ({
      id: m.id,
      channelId: m.channelId,
      userId: m.userId,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
      user: m.user,
    }));
  }

  async sendMessage(channelId: string, userId: string, content: string) {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
    });
    if (!channel) throw new ForbiddenException('Channel not found');
    if (channel.type !== 'text') throw new BadRequestException('Not a text channel');
    await this.communities.requireMember(channel.communityId, userId);

    const message = await this.prisma.message.create({
      data: { channelId, userId, content },
      include: {
        user: { select: { id: true, displayName: true, avatarUrl: true } },
      },
    });

    return {
      id: message.id,
      channelId: message.channelId,
      userId: message.userId,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
      user: message.user,
    };
  }
}
