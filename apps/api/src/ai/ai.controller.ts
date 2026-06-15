import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { IsString, IsOptional, IsNumber, IsEnum, Min, Max, MinLength } from 'class-validator';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class GenerateQuizDto {
  @IsString()
  @MinLength(2)
  topic!: string;

  @IsOptional()
  @IsNumber()
  @Min(3)
  @Max(20)
  questionCount?: number;

  @IsOptional()
  @IsEnum(['easy', 'medium', 'hard'])
  difficulty?: 'easy' | 'medium' | 'hard';
}

@Controller('ai')
export class AiController {
  constructor(private ai: AiService) {}

  @Post('quiz/generate')
  @UseGuards(JwtAuthGuard)
  generate(@Req() req: { user: { id: string } }, @Body() dto: GenerateQuizDto) {
    return this.ai.generateQuiz(
      req.user.id,
      dto.topic,
      dto.questionCount ?? 10,
      dto.difficulty ?? 'medium',
    );
  }

  @Get('generations/:id')
  @UseGuards(JwtAuthGuard)
  getGeneration(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.ai.getGeneration(id, req.user.id);
  }
}
