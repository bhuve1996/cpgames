import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CommunitiesModule } from './communities/communities.module';
import { ChannelsModule } from './channels/channels.module';
import { EventsModule } from './events/events.module';
import { PollsModule } from './polls/polls.module';
import { GamesModule } from './games/games.module';
import { AiModule } from './ai/ai.module';
import { LivekitModule } from './livekit/livekit.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { EmailModule } from './email/email.module';
import { GatewayModule } from './gateway/gateway.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    CommunitiesModule,
    ChannelsModule,
    EventsModule,
    PollsModule,
    GamesModule,
    AiModule,
    LivekitModule,
    LeaderboardModule,
    EmailModule,
    GatewayModule,
  ],
})
export class AppModule {}
