import { Controller, Get, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { IsOptional, IsString, IsArray, ValidateNested, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { TRIVIA_PACKS } from '@playground/shared';
import { GamesService } from './games.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class PlayNowDto {
  @IsOptional()
  @IsString()
  packId?: string;
}

class TriviaQuestionDto {
  @IsString()
  id!: string;

  @IsString()
  question!: string;

  @IsArray()
  @IsString({ each: true })
  options!: string[];

  @IsNumber()
  @Min(0)
  @Max(3)
  correctIndex!: number;

  @IsOptional()
  @IsNumber()
  timeLimitSeconds?: number;
}

class CreateSessionDto {
  @IsOptional()
  @IsString()
  eventId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TriviaQuestionDto)
  questions!: TriviaQuestionDto[];
}

@Controller('games')
export class GamesController {
  constructor(private games: GamesService) {}

  @Post('communities/:communityId/play-now')
  @UseGuards(JwtAuthGuard)
  playNow(
    @Param('communityId') communityId: string,
    @Req() req: { user: { id: string } },
    @Body() body: PlayNowDto,
  ) {
    return this.games.playNow(communityId, req.user.id, body?.packId ?? 'general');
  }

  @Get('packs')
  getPacks() {
    return TRIVIA_PACKS.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      emoji: p.emoji,
      questionCount: p.questions.length,
    }));
  }

  @Post('communities/:communityId/sessions')
  @UseGuards(JwtAuthGuard)
  create(
    @Param('communityId') communityId: string,
    @Req() req: { user: { id: string } },
    @Body() dto: CreateSessionDto,
  ) {
    return this.games.createSession(communityId, req.user.id, dto);
  }

  @Post('events/:eventId/start')
  @UseGuards(JwtAuthGuard)
  startFromEvent(@Param('eventId') eventId: string, @Req() req: { user: { id: string } }) {
    return this.games.createFromEvent(eventId, req.user.id);
  }

  @Get('sessions/:sessionId')
  @UseGuards(JwtAuthGuard)
  getSession(@Param('sessionId') sessionId: string, @Req() req: { user: { id: string } }) {
    return this.games.getSession(sessionId, req.user.id);
  }
}
