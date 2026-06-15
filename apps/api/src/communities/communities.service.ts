import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.module';
import { MemberRole, CommunityVisibility } from '@prisma/client';
import { MAX_CHANNELS_PER_COMMUNITY, INVITE_TOKEN_EXPIRY_DAYS } from '@playground/shared';

@Injectable()
export class CommunitiesService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    data: { name: string; slug: string; description?: string; visibility?: CommunityVisibility },
  ) {
    const existing = await this.prisma.community.findUnique({ where: { slug: data.slug } });
    if (existing) throw new ConflictException('Slug already taken');

    const community = await this.prisma.community.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        visibility: data.visibility ?? 'private',
        ownerId: userId,
        members: { create: { userId, role: 'owner' } },
        channels: {
          create: [
            { name: 'general', type: 'text', sortOrder: 0 },
            { name: 'voice-lounge', type: 'voice', sortOrder: 1 },
            { name: 'game-night', type: 'activity', sortOrder: 2 },
          ],
        },
      },
      include: {
        _count: { select: { members: true } },
      },
    });

    return this.formatCommunity(community);
  }

  async findPublic() {
    const communities = await this.prisma.community.findMany({
      where: { visibility: 'public' },
      include: { _count: { select: { members: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return communities.map((c) => this.formatCommunity(c));
  }

  async findForUser(userId: string) {
    const memberships = await this.prisma.communityMember.findMany({
      where: { userId },
      include: {
        community: { include: { _count: { select: { members: true } } } },
      },
    });
    return memberships.map((m) => this.formatCommunity(m.community));
  }

  async findBySlug(slug: string, userId?: string) {
    const community = await this.prisma.community.findUnique({
      where: { slug },
      include: {
        _count: { select: { members: true } },
        channels: { orderBy: { sortOrder: 'asc' } },
      },
    });
    if (!community) throw new NotFoundException('Community not found');

    if (community.visibility !== 'public') {
      if (!userId) throw new ForbiddenException('Private community');
      await this.requireMember(community.id, userId);
    }

    return {
      ...this.formatCommunity(community),
      channels: community.channels,
    };
  }

  async join(communityId: string, userId: string) {
    const community = await this.prisma.community.findUnique({ where: { id: communityId } });
    if (!community) throw new NotFoundException('Community not found');
    if (community.visibility === 'invite') {
      throw new ForbiddenException('Invite required');
    }

    await this.prisma.communityMember.upsert({
      where: { communityId_userId: { communityId, userId } },
      create: { communityId, userId, role: 'member' },
      update: {},
    });

    return { success: true };
  }

  async joinByInvite(token: string, userId: string) {
    const invite = await this.prisma.communityInvite.findUnique({
      where: { token },
      include: { community: true },
    });
    if (!invite) throw new NotFoundException('Invalid invite');
    if (invite.expiresAt < new Date()) throw new BadRequestException('Invite expired');
    if (invite.maxUses > 0 && invite.useCount >= invite.maxUses) {
      throw new BadRequestException('Invite max uses reached');
    }

    await this.prisma.$transaction([
      this.prisma.communityMember.upsert({
        where: {
          communityId_userId: { communityId: invite.communityId, userId },
        },
        create: { communityId: invite.communityId, userId, role: 'member' },
        update: {},
      }),
      this.prisma.communityInvite.update({
        where: { id: invite.id },
        data: { useCount: { increment: 1 } },
      }),
    ]);

    return { community: this.formatCommunity(invite.community) };
  }

  async createInvite(communityId: string, userId: string, maxUses = 0) {
    await this.requireRole(communityId, userId, ['owner', 'admin']);

    const token = randomBytes(24).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITE_TOKEN_EXPIRY_DAYS);

    const invite = await this.prisma.communityInvite.create({
      data: { communityId, token, createdById: userId, maxUses, expiresAt },
    });

    return {
      token: invite.token,
      expiresAt: invite.expiresAt,
      url: `/invite/${invite.token}`,
    };
  }

  async getMembers(communityId: string, userId: string) {
    await this.requireMember(communityId, userId);
    const members = await this.prisma.communityMember.findMany({
      where: { communityId },
      include: {
        user: { select: { id: true, displayName: true, avatarUrl: true, email: true } },
      },
      orderBy: { joinedAt: 'asc' },
    });
    return members.map((m) => ({
      userId: m.userId,
      role: m.role,
      joinedAt: m.joinedAt,
      user: m.user,
    }));
  }

  async requireMember(communityId: string, userId: string) {
    const member = await this.prisma.communityMember.findUnique({
      where: { communityId_userId: { communityId, userId } },
    });
    if (!member) throw new ForbiddenException('Not a member');
    return member;
  }

  async requireRole(communityId: string, userId: string, roles: MemberRole[]) {
    const member = await this.requireMember(communityId, userId);
    if (!roles.includes(member.role)) throw new ForbiddenException('Insufficient permissions');
    return member;
  }

  private formatCommunity(community: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    visibility: CommunityVisibility;
    ownerId: string;
    createdAt: Date;
    _count?: { members: number };
  }) {
    return {
      id: community.id,
      name: community.name,
      slug: community.slug,
      description: community.description,
      visibility: community.visibility,
      ownerId: community.ownerId,
      memberCount: community._count?.members ?? 0,
      createdAt: community.createdAt.toISOString(),
    };
  }
}
