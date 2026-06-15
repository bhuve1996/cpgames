import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
import { DRAW_GUESS_PACKS } from '@playground/shared';
import { DrawGuessService } from './draw-guess.service';

class DrawGuestPlayDto {
  @IsString()
  displayName!: string;

  @IsOptional()
  @IsString()
  packId?: string;
}

class DrawGuestJoinDto {
  @IsString()
  displayName!: string;
}

@Controller('games/draw')
export class DrawGuessController {
  constructor(private drawGuess: DrawGuessService) {}

  @Get('packs')
  getPacks() {
    return DRAW_GUESS_PACKS.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      emoji: p.emoji,
      wordCount: p.words.length,
    }));
  }

  @Post('guest/play')
  guestPlay(@Body() body: DrawGuestPlayDto) {
    return this.drawGuess.createGuestSession(body.displayName, body.packId ?? 'everyday');
  }

  @Post('guest/sessions/:sessionId/join')
  guestJoin(@Param('sessionId') sessionId: string, @Body() body: DrawGuestJoinDto) {
    return this.drawGuess.joinGuestSession(sessionId, body.displayName);
  }

  @Get('guest/sessions/:sessionId')
  getGuestSession(@Param('sessionId') sessionId: string) {
    return this.drawGuess.getGuestSession(sessionId);
  }
}
