import { Module } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { AuthModule } from '../auth/auth.module';
import { ChannelsModule } from '../channels/channels.module';
import { GamesModule } from '../games/games.module';
import { CommunitiesModule } from '../communities/communities.module';

@Module({
  imports: [AuthModule, ChannelsModule, GamesModule, CommunitiesModule],
  providers: [RealtimeGateway],
})
export class GatewayModule {}
