import { Controller, Get, Param, Query, UseGuards, Req } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private leaderboard: LeaderboardService) {}

  @Get('communities/:communityId')
  @UseGuards(JwtAuthGuard)
  getCommunity(
    @Param('communityId') communityId: string,
    @Req() req: { user: { id: string } },
    @Query('period') period?: 'all_time' | 'weekly' | 'event',
    @Query('eventId') eventId?: string,
  ) {
    return this.leaderboard.getCommunityLeaderboard(
      communityId,
      req.user.id,
      period ?? 'all_time',
      eventId,
    );
  }
}
