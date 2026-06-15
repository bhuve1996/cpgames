import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SOCKET_EVENTS } from '@playground/shared';
import { ChannelsService } from '../channels/channels.service';
import { GamesService } from '../games/games.service';
import { CommunitiesService } from '../communities/communities.service';
import { PrismaService } from '../prisma/prisma.module';

interface AuthenticatedSocket extends Socket {
  user?: { id: string; displayName: string; avatarUrl?: string | null; email: string };
}

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:3000'],
    credentials: true,
  },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private presence = new Map<string, Set<string>>();

  constructor(
    private jwt: JwtService,
    private config: ConfigService,
    private channels: ChannelsService,
    private games: GamesService,
    private communities: CommunitiesService,
    private prisma: PrismaService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token =
        client.handshake.auth?.token ??
        client.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        const guestId = client.handshake.auth?.guestId as string | undefined;
        const displayName = client.handshake.auth?.displayName as string | undefined;
        const guestAllowed =
          this.config.get<string>('GUEST_PLAY_ENABLED') !== 'false';

        if (guestAllowed && guestId?.startsWith('guest-') && displayName?.trim()) {
          client.user = {
            id: guestId,
            displayName: displayName.trim(),
            email: '',
            avatarUrl: null,
          };
          return;
        }

        client.disconnect();
        return;
      }

      const payload = this.jwt.verify<{ sub: string; email: string }>(token, {
        secret: this.config.get<string>('JWT_SECRET') ?? 'dev-secret',
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, email: true, displayName: true, avatarUrl: true },
      });

      if (!user) {
        client.disconnect();
        return;
      }

      client.user = user;
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    for (const [room, users] of this.presence.entries()) {
      if (client.user && users.has(client.user.id)) {
        users.delete(client.user.id);
        this.server.to(room).emit(SOCKET_EVENTS.PRESENCE_UPDATE, {
          room,
          count: users.size,
          online: Array.from(users),
        });
      }
    }
  }

  @SubscribeMessage(SOCKET_EVENTS.JOIN_CHANNEL)
  async joinChannel(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { channelId: string },
  ) {
    if (!client.user) return;
    const room = `channel:${data.channelId}`;
    client.join(room);
    this.trackPresence(room, client.user.id);
    return { joined: room };
  }

  @SubscribeMessage(SOCKET_EVENTS.MESSAGE_SEND)
  async sendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { channelId: string; content: string },
  ) {
    if (!client.user) return;
    const message = await this.channels.sendMessage(
      data.channelId,
      client.user.id,
      data.content,
    );
    this.server.to(`channel:${data.channelId}`).emit(SOCKET_EVENTS.MESSAGE_NEW, message);
    return message;
  }

  @SubscribeMessage(SOCKET_EVENTS.GAME_JOIN)
  async joinGame(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { sessionId: string },
  ) {
    return this.runGameAction(client, data.sessionId, async () => {
      const state = await this.games.joinSession(data.sessionId, client.user!);
      const room = `game:${data.sessionId}`;
      client.join(room);
      this.server.to(room).emit(SOCKET_EVENTS.GAME_STATE, state);
      return state;
    });
  }

  @SubscribeMessage(SOCKET_EVENTS.GAME_START)
  async startGame(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { sessionId: string },
  ) {
    return this.runGameAction(client, data.sessionId, async () => {
      const engine = await this.games.loadEngine(data.sessionId);
      const state = engine.start(client.user!.id);
      await this.games.persistState(data.sessionId);
      this.broadcastGameState(data.sessionId, state);
      return state;
    });
  }

  @SubscribeMessage(SOCKET_EVENTS.GAME_ANSWER)
  async submitAnswer(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { sessionId: string; answerIndex: number },
  ) {
    return this.runGameAction(client, data.sessionId, async () => {
      const engine = await this.games.loadEngine(data.sessionId);
      const state = engine.submitAnswer(client.user!.id, data.answerIndex);
      this.broadcastGameState(data.sessionId, state);
      return state;
    });
  }

  @SubscribeMessage(SOCKET_EVENTS.GAME_NEXT)
  async nextQuestion(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { sessionId: string; action: 'reveal' | 'next' },
  ) {
    return this.runGameAction(client, data.sessionId, async () => {
      const engine = await this.games.loadEngine(data.sessionId);
      const state =
        data.action === 'reveal'
          ? engine.reveal(client.user!.id)
          : engine.nextQuestion(client.user!.id);
      await this.games.persistState(data.sessionId);
      this.broadcastGameState(data.sessionId, state);
      return state;
    });
  }

  private broadcastGameState(sessionId: string, state: object) {
    this.server.to(`game:${sessionId}`).emit(SOCKET_EVENTS.GAME_STATE, state);
  }

  private emitGameError(client: AuthenticatedSocket, sessionId: string, err: unknown) {
    const message = err instanceof Error ? err.message : 'Game action failed';
    client.emit(SOCKET_EVENTS.GAME_ERROR, { sessionId, message });
  }

  private async runGameAction(
    client: AuthenticatedSocket,
    sessionId: string,
    action: () => Promise<object> | object,
  ) {
    if (!client.user) return;
    try {
      return await action();
    } catch (err) {
      this.emitGameError(client, sessionId, err);
    }
  }

  private trackPresence(room: string, userId: string) {
    if (!this.presence.has(room)) this.presence.set(room, new Set());
    this.presence.get(room)!.add(userId);
    this.server.to(room).emit(SOCKET_EVENTS.PRESENCE_UPDATE, {
      room,
      count: this.presence.get(room)!.size,
      online: Array.from(this.presence.get(room)!),
    });
  }
}
