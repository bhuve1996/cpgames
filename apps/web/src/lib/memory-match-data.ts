export interface MemoryPack {
  id: string;
  title: string;
  description: string;
  emoji: string;
  symbols: string[];
  cols: number;
}

export const MEMORY_PACKS: MemoryPack[] = [
  {
    id: 'animals',
    title: 'Animal Friends',
    description: '8 pairs · 4×4 grid',
    emoji: '🐾',
    symbols: ['🐶', '🐱', '🐼', '🦊', '🐸', '🦁', '🐧', '🦋'],
    cols: 4,
  },
  {
    id: 'food',
    title: 'Snack Attack',
    description: '6 pairs · compact grid',
    emoji: '🍕',
    symbols: ['🍕', '🍔', '🌮', '🍩', '🍦', '🍿'],
    cols: 4,
  },
  {
    id: 'space',
    title: 'Space Quest',
    description: '10 pairs · bigger challenge',
    emoji: '🚀',
    symbols: ['🚀', '🌙', '⭐', '🪐', '👽', '🛸', '☄️', '🌌', '🔭', '🌍'],
    cols: 5,
  },
];

export function getMemoryPack(id: string): MemoryPack | undefined {
  return MEMORY_PACKS.find((p) => p.id === id);
}

export interface MemoryCard {
  id: number;
  symbol: string;
  flipped: boolean;
  matched: boolean;
}

export function createBoard(pack: MemoryPack): MemoryCard[] {
  const pairs = pack.symbols.flatMap((symbol, i) => [
    { id: i * 2, symbol, flipped: false, matched: false },
    { id: i * 2 + 1, symbol, flipped: false, matched: false },
  ]);
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }
  return pairs;
}
