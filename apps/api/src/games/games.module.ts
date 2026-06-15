import { Module, forwardRef } from '@nestjs/common';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { DrawGuessService } from './draw-guess.service';
import { DrawGuessController } from './draw-guess.controller';
import { CommunitiesModule } from '../communities/communities.module';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';

@Module({
  imports: [CommunitiesModule, forwardRef(() => LeaderboardModule)],
  controllers: [GamesController, DrawGuessController],
  providers: [GamesService, DrawGuessService],
  exports: [GamesService, DrawGuessService],
})
export class GamesModule {}
