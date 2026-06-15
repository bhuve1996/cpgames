import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { IsString, IsOptional, IsArray, ArrayMinSize, ArrayMaxSize, IsDateString } from 'class-validator';
import { PollsService } from './polls.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class CreatePollDto {
  @IsString()
  question!: string;

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(10)
  @IsString({ each: true })
  options!: string[];

  @IsOptional()
  @IsString()
  channelId?: string;

  @IsOptional()
  @IsDateString()
  closesAt?: string;
}

class VotePollDto {
  @IsString()
  optionId!: string;
}

@Controller()
export class PollsController {
  constructor(private polls: PollsService) {}

  @Post('communities/:communityId/polls')
  @UseGuards(JwtAuthGuard)
  create(
    @Param('communityId') communityId: string,
    @Req() req: { user: { id: string } },
    @Body() dto: CreatePollDto,
  ) {
    return this.polls.create(communityId, req.user.id, dto);
  }

  @Get('communities/:communityId/polls')
  @UseGuards(JwtAuthGuard)
  list(@Param('communityId') communityId: string, @Req() req: { user: { id: string } }) {
    return this.polls.listForCommunity(communityId, req.user.id);
  }

  @Post('polls/:pollId/vote')
  @UseGuards(JwtAuthGuard)
  vote(
    @Param('pollId') pollId: string,
    @Req() req: { user: { id: string } },
    @Body() dto: VotePollDto,
  ) {
    return this.polls.vote(pollId, req.user.id, dto.optionId);
  }
}
