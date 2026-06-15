import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { IsString } from 'class-validator';
import { LivekitService } from './livekit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class VoiceTokenDto {
  @IsString()
  roomName!: string;
}

@Controller('livekit')
export class LivekitController {
  constructor(private livekit: LivekitService) {}

  @Post('token')
  @UseGuards(JwtAuthGuard)
  getToken(
    @Req() req: { user: { id: string; displayName: string } },
    @Body() dto: VoiceTokenDto,
  ) {
    return this.livekit.createToken(dto.roomName, req.user.displayName, req.user.id);
  }
}
