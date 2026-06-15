/**
 * Games available on Playground.
 * `mode`: multiplayer (real-time or pass-and-play) vs single (solo on your device).
 * `tier`: multiplayer only — `live` = real-time games, `party` = pass-and-play icebreakers.
 */
export type GameMode = 'multiplayer' | 'single';
export type GameTier = 'live' | 'party';

export interface GameCatalogEntry {
  id: string;
  title: string;
  description: string;
  emoji: string;
  href: string;
  mode: GameMode;
  tier?: GameTier;
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
    description: 'Real-time rooms and party games to play together.',
    emoji: '👥',
  },
  single: {
    label: 'Single Player',
    description: 'Solo challenges — beat your score and play at your own pace.',
    emoji: '🎯',
  },
};

export const MULTIPLAYER_TIERS: Record<GameTier, { label: string; description: string }> = {
  live: {
    label: 'Live games',
    description: 'Real-time rooms — draw, guess, and compete online with friends.',
  },
  party: {
    label: 'Party icebreakers',
    description: 'Quick pass-and-play prompts for groups in the same room.',
  },
};

export const GAMES_CATALOG: GameCatalogEntry[] = [
  // ── Multiplayer · Live (real games) ───────────────────────
  {
    id: 'draw-guess',
    title: 'Sketch Off',
    description: 'Live Pictionary — draw on canvas, friends guess in real time. Share a link and play.',
    emoji: '🎨',
    href: '/games/draw-guess',
    mode: 'multiplayer',
    tier: 'live',
    available: true,
    players: '2–12',
    duration: '15–20 min',
  },
  {
    id: 'trivia',
    title: 'Live Trivia',
    description: 'Real-time quiz battles. Answer fast, climb the leaderboard.',
    emoji: '🧠',
    href: '/games/trivia',
    mode: 'multiplayer',
    tier: 'live',
    available: true,
    players: '2–50',
    duration: '10–15 min',
  },

  // ── Multiplayer · Party (icebreakers) ─────────────────────
  {
    id: 'would-you-rather',
    title: 'Would You Rather',
    description: 'Wild dilemmas — vote and debate with your group.',
    emoji: '🤔',
    href: '/games/would-you-rather',
    mode: 'multiplayer',
    tier: 'party',
    available: true,
    players: '2–20',
    duration: '5–10 min',
  },
  {
    id: 'true-or-false',
    title: 'True or False',
    description: 'Fact or fiction — quick statements for the group.',
    emoji: '✅',
    href: '/games/true-or-false',
    mode: 'multiplayer',
    tier: 'party',
    available: true,
    players: '2–20',
    duration: '5–8 min',
  },
  {
    id: 'this-or-that',
    title: 'This or That',
    description: 'Either/or picks — faster than dilemmas.',
    emoji: '⚖️',
    href: '/games/this-or-that',
    mode: 'multiplayer',
    tier: 'party',
    available: true,
    players: '2–20',
    duration: '5 min',
  },
  {
    id: 'never-have-i',
    title: 'Never Have I Ever',
    description: 'Confess or stay silent — classic icebreaker.',
    emoji: '🙈',
    href: '/games/never-have-i-ever',
    mode: 'multiplayer',
    tier: 'party',
    available: true,
    players: '3–20',
    duration: '10–15 min',
  },

  // ── Multiplayer · Coming soon ───────────────────────────
  {
    id: 'charades',
    title: 'Charades',
    description: 'Act out prompts — coming back as a live game mode.',
    emoji: '🎭',
    href: '#',
    mode: 'multiplayer',
    tier: 'live',
    available: false,
    players: '4–16',
    duration: '15–20 min',
  },
  {
    id: 'word-chain',
    title: 'Word Chain',
    description: 'Take turns — each word must start with the last letter.',
    emoji: '🔗',
    href: '#',
    mode: 'multiplayer',
    tier: 'live',
    available: false,
    players: '2–10',
    duration: '5–10 min',
  },
  {
    id: 'hot-takes',
    title: 'Hot Takes',
    description: 'Agree or disagree on spicy opinions.',
    emoji: '🔥',
    href: '#',
    mode: 'multiplayer',
    tier: 'party',
    available: false,
    players: '3–20',
    duration: '10 min',
  },
  {
    id: 'team-bingo',
    title: 'Team Bingo',
    description: 'Mark off prompts as they happen during game night.',
    emoji: '🎱',
    href: '#',
    mode: 'multiplayer',
    tier: 'party',
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
    description: 'Solve arithmetic as fast as you can.',
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
    description: 'Flip cards and find matching pairs.',
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
    description: 'Tap when the screen turns green.',
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
    description: 'Type the phrase before time runs out.',
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
    description: 'Same great quizzes, play alone.',
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

export function gamesByModeAndTier(mode: GameMode, tier: GameTier): GameCatalogEntry[] {
  return GAMES_CATALOG.filter((g) => g.mode === mode && g.tier === tier);
}

export function countByMode(mode: GameMode): { total: number; live: number } {
  const games = gamesByMode(mode);
  return { total: games.length, live: games.filter((g) => g.available).length };
}
