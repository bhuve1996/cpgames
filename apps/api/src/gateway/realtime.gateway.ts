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
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token =
        client.handshake.auth?.token ??
        client.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwt.verify<{ sub: string; email: string }>(token, {
        secret: this.config.get<string>('JWT_SECRET') ?? 'dev-secret',
      });

      client.user = {
        id: payload.sub,
        email: payload.email,
        displayName: (client.handshake.auth?.displayName as string) ?? payload.email.split('@')[0],
        avatarUrl: client.handshake.auth?.avatarUrl as string | undefined,
      };
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
    if (!client.user) return;
    const state = await this.games.joinSession(data.sessionId, client.user);
    const room = `game:${data.sessionId}`;
    client.join(room);
    this.server.to(room).emit(SOCKET_EVENTS.GAME_STATE, state);
    return state;
  }

  @SubscribeMessage(SOCKET_EVENTS.GAME_START)
  async startGame(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { sessionId: string },
  ) {
    if (!client.user) return;
    const engine = await this.games.loadEngine(data.sessionId);
    const state = engine.start(client.user.id);
    await this.games.persistState(data.sessionId);
    this.broadcastGameState(data.sessionId, state);
    return state;
  }

  @SubscribeMessage(SOCKET_EVENTS.GAME_ANSWER)
  async submitAnswer(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { sessionId: string; answerIndex: number },
  ) {
    if (!client.user) return;
    const engine = await this.games.loadEngine(data.sessionId);
    const state = engine.submitAnswer(client.user.id, data.answerIndex);
    this.broadcastGameState(data.sessionId, state);
    return state;
  }

  @SubscribeMessage(SOCKET_EVENTS.GAME_NEXT)
  async nextQuestion(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { sessionId: string; action: 'reveal' | 'next' },
  ) {
    if (!client.user) return;
    const engine = await this.games.loadEngine(data.sessionId);
    let state;
    if (data.action === 'reveal') {
      state = engine.reveal(client.user.id);
    } else {
      state = engine.nextQuestion(client.user.id);
    }
    await this.games.persistState(data.sessionId);
    this.broadcastGameState(data.sessionId, state);
    return state;
  }

  private broadcastGameState(sessionId: string, state: object) {
    this.server.to(`game:${sessionId}`).emit(SOCKET_EVENTS.GAME_STATE, state);
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
