import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessToken } from 'livekit-server-sdk';

@Injectable()
export class LivekitService {
  constructor(private config: ConfigService) {}

  isConfigured(): boolean {
    return Boolean(
      this.config.get('LIVEKIT_API_KEY') &&
        this.config.get('LIVEKIT_API_SECRET') &&
        this.config.get('LIVEKIT_URL'),
    );
  }

  async createToken(roomName: string, participantName: string, userId: string) {
    const apiKey = this.config.get<string>('LIVEKIT_API_KEY');
    const apiSecret = this.config.get<string>('LIVEKIT_API_SECRET');

    if (!apiKey || !apiSecret) {
      return {
        configured: false,
        message: 'LiveKit not configured. Add LIVEKIT_API_KEY and LIVEKIT_API_SECRET to .env',
      };
    }

    const token = new AccessToken(apiKey, apiSecret, {
      identity: userId,
      name: participantName,
    });

    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });

    const jwt = await token.toJwt();

    return {
      configured: true,
      token: jwt,
      url: this.config.get<string>('LIVEKIT_URL'),
      roomName,
    };
  }
}
