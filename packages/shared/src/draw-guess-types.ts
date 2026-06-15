export type DrawGuessPhase = 'lobby' | 'drawing' | 'reveal' | 'finished';

export interface DrawPoint {
  x: number;
  y: number;
}

export interface DrawStroke {
  id: string;
  points: DrawPoint[];
  color: string;
  width: number;
}

export interface DrawGuessPlayer {
  userId: string;
  displayName: string;
  avatarUrl?: string | null;
  score: number;
}

export interface DrawGuessGuess {
  userId: string;
  displayName: string;
  text: string;
  correct: boolean;
  at: number;
}

export interface DrawGuessSession {
  id: string;
  hostId: string;
  gameType: 'draw-guess';
  phase: DrawGuessPhase;
  packId: string;
  words: string[];
  round: number;
  drawerIndex: number;
  currentWord: string;
  strokes: DrawStroke[];
  guesses: DrawGuessGuess[];
  players: DrawGuessPlayer[];
  roundStartedAt: number | null;
  roundWinnerId: string | null;
  roundSeconds: number;
}

/** Public view — word hidden unless you are the drawer */
export type DrawGuessPublicSession = Omit<DrawGuessSession, 'currentWord' | 'words'> & {
  currentWord?: string;
  isDrawer: boolean;
};
