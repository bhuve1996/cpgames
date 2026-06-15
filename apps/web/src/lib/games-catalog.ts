/**
 * Games available on Playground.
 * Set `available: true` when a game is ready to play.
 */
export interface GameCatalogEntry {
  id: string;
  title: string;
  description: string;
  emoji: string;
  href: string;
  available: boolean;
  tag?: string;
  players?: string;
  duration?: string;
}

export const GAMES_CATALOG: GameCatalogEntry[] = [
  {
    id: 'trivia',
    title: 'Live Trivia',
    description: 'Answer fast, score big. Pick a quiz pack and play with friends in real time.',
    emoji: '🧠',
    href: '/games/trivia',
    available: true,
    tag: 'Multiplayer',
    players: '2–50',
    duration: '10–15 min',
  },
  // Phase 2+ — flip available when shipped
  {
    id: 'draw-guess',
    title: 'Draw & Guess',
    description: 'Sketch prompts while others guess. Party game energy.',
    emoji: '🎨',
    href: '#',
    available: false,
    tag: 'Coming soon',
  },
  {
    id: 'would-you-rather',
    title: 'Would You Rather',
    description: 'Vote on dilemmas and see what your group picks.',
    emoji: '🤔',
    href: '#',
    available: false,
    tag: 'Coming soon',
  },
];

export const AVAILABLE_GAMES = GAMES_CATALOG.filter((g) => g.available);
