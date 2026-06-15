import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { IsString, IsOptional, IsEnum, MinLength, MaxLength } from 'class-validator';
import { ChannelsService } from './channels.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class CreateChannelDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name!: string;

  @IsOptional()
  @IsEnum(['text', 'voice', 'activity'])
  type?: 'text' | 'voice' | 'activity';
}

class SendMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  content!: string;
}

@Controller()
export class ChannelsController {
  constructor(private channels: ChannelsService) {}

  @Post('communities/:communityId/channels')
  @UseGuards(JwtAuthGuard)
  create(
    @Param('communityId') communityId: string,
    @Req() req: { user: { id: string } },
    @Body() dto: CreateChannelDto,
  ) {
    return this.channels.create(communityId, req.user.id, dto);
  }

  @Get('channels/:channelId/messages')
  @UseGuards(JwtAuthGuard)
  getMessages(
    @Param('channelId') channelId: string,
    @Req() req: { user: { id: string } },
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.channels.getMessages(channelId, req.user.id, cursor, limit ? parseInt(limit, 10) : 50);
  }

  @Post('channels/:channelId/messages')
  @UseGuards(JwtAuthGuard)
  sendMessage(
    @Param('channelId') channelId: string,
    @Req() req: { user: { id: string } },
    @Body() dto: SendMessageDto,
  ) {
    return this.channels.sendMessage(channelId, req.user.id, dto.content);
  }
}
