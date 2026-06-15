export interface ScrambleWord {
  id: string;
  word: string;
  hint: string;
}

export interface ScramblePack {
  id: string;
  title: string;
  description: string;
  emoji: string;
  words: ScrambleWord[];
}

export const SCRAMBLE_PACKS: ScramblePack[] = [
  {
    id: 'everyday',
    title: 'Everyday Words',
    description: 'Common words — good for warming up',
    emoji: '📝',
    words: [
      { id: 'e1', word: 'planet', hint: 'Orbits a star' },
      { id: 'e2', word: 'guitar', hint: 'String instrument' },
      { id: 'e3', word: 'coffee', hint: 'Morning drink' },
      { id: 'e4', word: 'bridge', hint: 'Crosses water' },
      { id: 'e5', word: 'silver', hint: 'Precious metal' },
      { id: 'e6', word: 'garden', hint: 'Plants grow here' },
      { id: 'e7', word: 'market', hint: 'Where you shop' },
      { id: 'e8', word: 'winter', hint: 'Cold season' },
      { id: 'e9', word: 'rocket', hint: 'Goes to space' },
      { id: 'e10', word: 'puzzle', hint: 'Brain teaser' },
    ],
  },
  {
    id: 'gaming',
    title: 'Gaming & Fun',
    description: 'Words from games and entertainment',
    emoji: '🎮',
    words: [
      { id: 'g1', word: 'player', hint: 'You are one' },
      { id: 'g2', word: 'trivia', hint: 'Quiz game type' },
      { id: 'g3', word: 'arcade', hint: 'Coin-op games' },
      { id: 'g4', word: 'avatar', hint: 'Your game character' },
      { id: 'g5', word: 'winner', hint: 'First place' },
      { id: 'g6', word: 'puzzle', hint: 'Solve this' },
      { id: 'g7', word: 'castle', hint: 'Medieval fortress' },
      { id: 'g8', word: 'dragon', hint: 'Fire-breathing beast' },
      { id: 'g9', word: 'quest', hint: 'Adventure mission' },
      { id: 'g10', word: 'score', hint: 'Points total' },
    ],
  },
];

export function scrambleWord(word: string): string {
  const letters = word.split('');
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  const result = letters.join('');
  return result === word && word.length > 1 ? scrambleWord(word) : result;
}

export function shuffleWords<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function getScramblePack(id: string): ScramblePack | undefined {
  return SCRAMBLE_PACKS.find((p) => p.id === id);
}
