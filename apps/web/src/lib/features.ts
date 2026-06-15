/**
 * UI feature flags — backend routes stay wired; flip these on when we ship each area.
 *
 * Phase 1 focus: live trivia + guest play.
 * Everything else is built but hidden until later.
 */
export const FEATURES = {
  /** Real-time text channels (Discord-style chat). */
  chat: false,
  /** Scheduled game nights, RSVPs, email reminders. */
  events: false,
  /** Community polls and voting. */
  polls: false,
  /** Persistent all-time / event leaderboards. */
  communityLeaderboard: false,
  /** LiveKit voice rooms (needs LIVEKIT_* env keys). */
  voiceRooms: false,
  /** OpenAI quiz pack generator (needs OPENAI_API_KEY). */
  aiQuiz: false,
} as const;

export type FeatureKey = keyof typeof FEATURES;

export function isFeatureEnabled(key: FeatureKey): boolean {
  return FEATURES[key];
}
