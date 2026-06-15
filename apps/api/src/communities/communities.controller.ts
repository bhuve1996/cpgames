import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { IsString, IsOptional, IsEnum, MinLength, MaxLength, Matches } from 'class-validator';
import { CommunitiesService } from './communities.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class CreateCommunityDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[a-z0-9-]+$/)
  slug!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsEnum(['public', 'private', 'invite'])
  visibility?: 'public' | 'private' | 'invite';
}

@Controller('communities')
export class CommunitiesController {
  constructor(private communities: CommunitiesService) {}

  @Get('public')
  findPublic() {
    return this.communities.findPublic();
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  findMine(@Req() req: { user: { id: string } }) {
    return this.communities.findForUser(req.user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: { user: { id: string } }, @Body() dto: CreateCommunityDto) {
    return this.communities.create(req.user.id, dto);
  }

  @Get(':slug')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('slug') slug: string, @Req() req: { user: { id: string } }) {
    return this.communities.findBySlug(slug, req.user.id);
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  join(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.communities.join(id, req.user.id);
  }

  @Post(':id/invites')
  @UseGuards(JwtAuthGuard)
  createInvite(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.communities.createInvite(id, req.user.id);
  }

  @Get(':id/members')
  @UseGuards(JwtAuthGuard)
  getMembers(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.communities.getMembers(id, req.user.id);
  }

  @Post('invite/:token/join')
  @UseGuards(JwtAuthGuard)
  joinByInvite(@Param('token') token: string, @Req() req: { user: { id: string } }) {
    return this.communities.joinByInvite(token, req.user.id);
  }
}
