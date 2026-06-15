import { Controller, Get, Post, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { IsString, IsOptional, IsEnum, IsObject, MinLength, MaxLength, IsDateString } from 'class-validator';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class CreateEventDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsDateString()
  startsAt!: string;

  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @IsOptional()
  @IsString()
  gameType?: string;

  @IsOptional()
  @IsObject()
  quizConfig?: object;
}

class RsvpDto {
  @IsEnum(['going', 'maybe', 'not_going'])
  status!: 'going' | 'maybe' | 'not_going';
}

class UpdateQuizDto {
  @IsObject()
  quizConfig!: object;
}

@Controller()
export class EventsController {
  constructor(private events: EventsService) {}

  @Post('communities/:communityId/events')
  @UseGuards(JwtAuthGuard)
  create(
    @Param('communityId') communityId: string,
    @Req() req: { user: { id: string } },
    @Body() dto: CreateEventDto,
  ) {
    return this.events.create(communityId, req.user.id, dto);
  }

  @Get('communities/:communityId/events')
  @UseGuards(JwtAuthGuard)
  list(@Param('communityId') communityId: string, @Req() req: { user: { id: string } }) {
    return this.events.listForCommunity(communityId, req.user.id);
  }

  @Get('events/:eventId')
  @UseGuards(JwtAuthGuard)
  getOne(@Param('eventId') eventId: string, @Req() req: { user: { id: string } }) {
    return this.events.getOne(eventId, req.user.id);
  }

  @Post('events/:eventId/rsvp')
  @UseGuards(JwtAuthGuard)
  rsvp(
    @Param('eventId') eventId: string,
    @Req() req: { user: { id: string } },
    @Body() dto: RsvpDto,
  ) {
    return this.events.rsvp(eventId, req.user.id, dto.status);
  }

  @Patch('events/:eventId/quiz')
  @UseGuards(JwtAuthGuard)
  updateQuiz(
    @Param('eventId') eventId: string,
    @Req() req: { user: { id: string } },
    @Body() dto: UpdateQuizDto,
  ) {
    return this.events.updateQuizConfig(eventId, req.user.id, dto.quizConfig);
  }

  @Post('events/:eventId/reminders')
  @UseGuards(JwtAuthGuard)
  sendReminders(@Param('eventId') eventId: string, @Req() req: { user: { id: string } }) {
    return this.events.sendReminders(eventId, req.user.id);
  }
}
