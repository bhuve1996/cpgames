/**
 * Games available on Playground.
 * `mode`: multiplayer (real-time or pass-and-play) vs single (solo on your device).
 */
export type GameMode = 'multiplayer' | 'single';

export interface GameCatalogEntry {
  id: string;
  title: string;
  description: string;
  emoji: string;
  href: string;
  mode: GameMode;
  available: boolean;
  players?: string;
  duration?: string;
}

export const GAME_MODES: Record<
  GameMode,
  { label: string; description: string; emoji: string }
> = {
  multiplayer: {
    label: 'Multiplayer',
    description: 'Play with friends in real time or pass the device around the group.',
    emoji: '👥',
  },
  single: {
    label: 'Single Player',
    description: 'Solo challenges — beat your score and play at your own pace.',
    emoji: '🎯',
  },
};

export const GAMES_CATALOG: GameCatalogEntry[] = [
  // ── Multiplayer ──────────────────────────────────────────
  {
    id: 'trivia',
    title: 'Live Trivia',
    description: 'Answer fast, score big. Real-time quiz battles with 2–50 players.',
    emoji: '🧠',
    href: '/games/trivia',
    mode: 'multiplayer',
    available: true,
    players: '2–50',
    duration: '10–15 min',
  },
  {
    id: 'would-you-rather',
    title: 'Would You Rather',
    description: 'Wild dilemmas for the group. Vote, debate, and see crowd picks.',
    emoji: '🤔',
    href: '/games/would-you-rather',
    mode: 'multiplayer',
    available: true,
    players: '2–20',
    duration: '5–10 min',
  },
  {
    id: 'true-or-false',
    title: 'True or False',
    description: 'Call out fact or fiction. Fast statements for the whole group.',
    emoji: '✅',
    href: '/games/true-or-false',
    mode: 'multiplayer',
    available: true,
    players: '2–20',
    duration: '5–8 min',
  },
  {
    id: 'draw-guess',
    title: 'Draw & Guess',
    description: 'Sketch prompts while others guess. Classic party game energy.',
    emoji: '🎨',
    href: '#',
    mode: 'multiplayer',
    available: false,
    players: '3–12',
    duration: '15–20 min',
  },
  {
    id: 'never-have-i',
    title: 'Never Have I Ever',
    description: 'Confess or stay silent. The ultimate group icebreaker.',
    emoji: '🙈',
    href: '#',
    mode: 'multiplayer',
    available: false,
    players: '3–20',
    duration: '10–15 min',
  },
  {
    id: 'word-chain',
    title: 'Word Chain',
    description: 'Take turns — each word must start with the last letter.',
    emoji: '🔗',
    href: '#',
    mode: 'multiplayer',
    available: false,
    players: '2–10',
    duration: '5–10 min',
  },
  {
    id: 'charades',
    title: 'Charades',
    description: 'Act out prompts without speaking. Hilarious group game.',
    emoji: '🎭',
    href: '#',
    mode: 'multiplayer',
    available: false,
    players: '4–16',
    duration: '15–20 min',
  },
  {
    id: 'team-bingo',
    title: 'Team Bingo',
    description: 'Mark off prompts as they happen during game night.',
    emoji: '🎱',
    href: '#',
    mode: 'multiplayer',
    available: false,
    players: '4–30',
    duration: '20–30 min',
  },

  // ── Single player ────────────────────────────────────────
  {
    id: 'emoji-blitz',
    title: 'Emoji Blitz',
    description: 'Name the emoji before time runs out. Streaks boost your score.',
    emoji: '⚡',
    href: '/games/emoji-blitz',
    mode: 'single',
    available: true,
    players: '1',
    duration: '1 min',
  },
  {
    id: 'quick-math',
    title: 'Quick Math',
    description: 'Solve arithmetic as fast as you can. Speed and accuracy win.',
    emoji: '🔢',
    href: '/games/quick-math',
    mode: 'single',
    available: true,
    players: '1',
    duration: '1 min',
  },
  {
    id: 'word-scramble',
    title: 'Word Scramble',
    description: 'Unscramble the letters before the clock hits zero.',
    emoji: '🔤',
    href: '/games/word-scramble',
    mode: 'single',
    available: true,
    players: '1',
    duration: '2 min',
  },
  {
    id: 'memory-match',
    title: 'Memory Match',
    description: 'Flip cards and find matching pairs. How few moves can you use?',
    emoji: '🃏',
    href: '/games/memory-match',
    mode: 'single',
    available: true,
    players: '1',
    duration: '3–5 min',
  },
  {
    id: 'reaction-test',
    title: 'Reaction Test',
    description: 'Tap when the screen turns green. Test your reflexes.',
    emoji: '⏱️',
    href: '#',
    mode: 'single',
    available: false,
    players: '1',
    duration: '1 min',
  },
  {
    id: 'typing-sprint',
    title: 'Typing Sprint',
    description: 'Type the phrase before time runs out. WPM leaderboard coming soon.',
    emoji: '⌨️',
    href: '#',
    mode: 'single',
    available: false,
    players: '1',
    duration: '1 min',
  },
  {
    id: 'trivia-solo',
    title: 'Solo Trivia',
    description: 'Same great quizzes, play alone and chase a personal best.',
    emoji: '📚',
    href: '#',
    mode: 'single',
    available: false,
    players: '1',
    duration: '5–10 min',
  },
];

export const AVAILABLE_GAMES = GAMES_CATALOG.filter((g) => g.available);

export function gamesByMode(mode: GameMode): GameCatalogEntry[] {
  return GAMES_CATALOG.filter((g) => g.mode === mode);
}

export function countByMode(mode: GameMode): { total: number; live: number } {
  const games = gamesByMode(mode);
  return { total: games.length, live: games.filter((g) => g.available).length };
}
