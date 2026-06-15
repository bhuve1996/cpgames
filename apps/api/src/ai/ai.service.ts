import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { PrismaService } from '../prisma/prisma.module';
import { v4 as uuidv4 } from 'uuid';
import type { TriviaQuestion } from '@playground/shared';

@Injectable()
export class AiService {
  private openai: OpenAI | null = null;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    const apiKey = this.config.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  async generateQuiz(
    userId: string,
    topic: string,
    questionCount: number,
    difficulty: 'easy' | 'medium' | 'hard',
  ) {
    const generation = await this.prisma.aiGeneration.create({
      data: {
        userId,
        type: 'quiz',
        prompt: `${topic} (${difficulty}, ${questionCount} questions)`,
        status: 'pending',
      },
    });

    try {
      const quiz = await this.callAiOrFallback(topic, questionCount, difficulty);

      await this.prisma.aiGeneration.update({
        where: { id: generation.id },
        data: { status: 'completed', output: JSON.parse(JSON.stringify(quiz)) },
      });

      return { id: generation.id, ...quiz };
    } catch (error) {
      await this.prisma.aiGeneration.update({
        where: { id: generation.id },
        data: { status: 'failed' },
      });
      throw error;
    }
  }

  async getGeneration(id: string, userId: string) {
    const gen = await this.prisma.aiGeneration.findUnique({ where: { id } });
    if (!gen || gen.userId !== userId) throw new BadRequestException('Generation not found');
    return gen;
  }

  private async callAiOrFallback(
    topic: string,
    questionCount: number,
    difficulty: string,
  ): Promise<{ title: string; description: string; questions: TriviaQuestion[] }> {
    if (this.openai) {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Generate a trivia quiz as JSON with format: {"title":"...","description":"...","questions":[{"question":"...","options":["A","B","C","D"],"correctIndex":0,"timeLimitSeconds":20}]}. Generate exactly ${questionCount} questions at ${difficulty} difficulty about the topic. correctIndex is 0-3.`,
          },
          { role: 'user', content: topic },
        ],
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content) as {
          title: string;
          description?: string;
          questions: Array<{
            question: string;
            options: string[];
            correctIndex: number;
            timeLimitSeconds?: number;
          }>;
        };
        return {
          title: parsed.title,
          description: parsed.description ?? `A ${difficulty} quiz about ${topic}`,
          questions: parsed.questions.map((q) => ({
            id: uuidv4(),
            question: q.question,
            options: q.options.slice(0, 4),
            correctIndex: q.correctIndex,
            timeLimitSeconds: q.timeLimitSeconds ?? 20,
          })),
        };
      }
    }

    return this.fallbackQuiz(topic, questionCount, difficulty);
  }

  private fallbackQuiz(topic: string, count: number, difficulty: string) {
    const questions: TriviaQuestion[] = Array.from({ length: count }, (_, i) => ({
      id: uuidv4(),
      question: `${topic} - Question ${i + 1} (${difficulty})?`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctIndex: i % 4,
      timeLimitSeconds: 20,
    }));

    return {
      title: `${topic} Quiz`,
      description: `A ${difficulty} quiz about ${topic} (demo mode - add OPENAI_API_KEY for AI generation)`,
      questions,
    };
  }
}
