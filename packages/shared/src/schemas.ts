import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2).max(50),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createCommunitySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
  visibility: z.enum(['public', 'private', 'invite']).default('private'),
});

export const createChannelSchema = z.object({
  name: z.string().min(1).max(50),
  type: z.enum(['text', 'voice', 'activity']).default('text'),
});

export const createEventSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().optional(),
  gameType: z.string().optional(),
});

export const createPollSchema = z.object({
  question: z.string().min(2).max(500),
  options: z.array(z.string().min(1).max(200)).min(2).max(10),
  channelId: z.string().uuid().optional(),
  closesAt: z.string().datetime().optional(),
});

export const generateQuizSchema = z.object({
  topic: z.string().min(2).max(200),
  questionCount: z.number().int().min(3).max(20).default(10),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
});

export const triviaQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  options: z.array(z.string()).length(4),
  correctIndex: z.number().int().min(0).max(3),
  timeLimitSeconds: z.number().int().min(5).max(120).optional(),
});

export const triviaQuizSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  questions: z.array(triviaQuestionSchema).min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateCommunityInput = z.infer<typeof createCommunitySchema>;
export type CreateChannelInput = z.infer<typeof createChannelSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type CreatePollInput = z.infer<typeof createPollSchema>;
export type GenerateQuizInput = z.infer<typeof generateQuizSchema>;
