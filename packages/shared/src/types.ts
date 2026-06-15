export type CommunityVisibility = 'public' | 'private' | 'invite';
export type MemberRole = 'owner' | 'admin' | 'member';
export type ChannelType = 'text' | 'voice' | 'activity';
export type RsvpStatus = 'going' | 'maybe' | 'not_going';
export type GameSessionState = 'lobby' | 'question' | 'reveal' | 'finished';
export type AiGenerationStatus = 'pending' | 'completed' | 'failed';
export type LeaderboardPeriod = 'all_time' | 'weekly' | 'event';

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
  createdAt: string;
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  visibility: CommunityVisibility;
  ownerId: string;
  memberCount?: number;
  createdAt: string;
}

export interface CommunityMember {
  communityId: string;
  userId: string;
  role: MemberRole;
  joinedAt: string;
  user?: User;
}

export interface Channel {
  id: string;
  communityId: string;
  name: string;
  type: ChannelType;
  sortOrder: number;
}

export interface Message {
  id: string;
  channelId: string;
  userId: string;
  content: string;
  createdAt: string;
  user?: Pick<User, 'id' | 'displayName' | 'avatarUrl'>;
}

export interface Event {
  id: string;
  communityId: string;
  title: string;
  description?: string | null;
  startsAt: string;
  endsAt?: string | null;
  hostId: string;
  gameType?: string | null;
  location?: string | null;
  rsvpCount?: number;
  host?: Pick<User, 'id' | 'displayName' | 'avatarUrl'>;
}

export interface Poll {
  id: string;
  communityId: string;
  channelId?: string | null;
  question: string;
  options: PollOption[];
  closesAt?: string | null;
  createdAt: string;
}

export interface PollOption {
  id: string;
  text: string;
  voteCount?: number;
}

export interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  timeLimitSeconds?: number;
}

export interface TriviaQuiz {
  id: string;
  title: string;
  description?: string;
  questions: TriviaQuestion[];
}

export interface GamePlayer {
  userId: string;
  displayName: string;
  avatarUrl?: string | null;
  score: number;
  currentAnswer?: number | null;
  answeredAt?: number | null;
}

export interface GameSession {
  id: string;
  eventId?: string | null;
  communityId: string;
  gameType: string;
  state: GameSessionState;
  hostId: string;
  currentQuestionIndex: number;
  questions: TriviaQuestion[];
  players: GamePlayer[];
  questionStartedAt?: number | null;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  avatarUrl?: string | null;
  points: number;
  rank: number;
}
