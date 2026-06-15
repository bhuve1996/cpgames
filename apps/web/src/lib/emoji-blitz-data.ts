export interface EmojiBlitzRound {
  id: string;
  emoji: string;
  prompt: string;
  options: string[];
  correctIndex: number;
}

export interface EmojiBlitzPack {
  id: string;
  title: string;
  description: string;
  emoji: string;
  rounds: EmojiBlitzRound[];
}

export const EMOJI_BLITZ_PACKS: EmojiBlitzPack[] = [
  {
    id: 'classic',
    title: 'Classic Mix',
    description: 'Food, animals, and everyday icons',
    emoji: '⚡',
    rounds: [
      { id: 'c1', emoji: '🍕', prompt: 'What is this?', options: ['Pizza', 'Pie', 'Cookie', 'Cake'], correctIndex: 0 },
      { id: 'c2', emoji: '🐶', prompt: 'What is this?', options: ['Cat', 'Dog', 'Fox', 'Wolf'], correctIndex: 1 },
      { id: 'c3', emoji: '☀️', prompt: 'What is this?', options: ['Moon', 'Star', 'Sun', 'Cloud'], correctIndex: 2 },
      { id: 'c4', emoji: '🚗', prompt: 'What is this?', options: ['Bus', 'Train', 'Car', 'Bike'], correctIndex: 2 },
      { id: 'c5', emoji: '🎸', prompt: 'What is this?', options: ['Drum', 'Guitar', 'Piano', 'Violin'], correctIndex: 1 },
      { id: 'c6', emoji: '🌮', prompt: 'What is this?', options: ['Burrito', 'Taco', 'Sandwich', 'Hot dog'], correctIndex: 1 },
      { id: 'c7', emoji: '🦁', prompt: 'What is this?', options: ['Tiger', 'Lion', 'Bear', 'Leopard'], correctIndex: 1 },
      { id: 'c8', emoji: '⚽', prompt: 'What is this?', options: ['Basketball', 'Tennis ball', 'Football', 'Baseball'], correctIndex: 2 },
      { id: 'c9', emoji: '🍦', prompt: 'What is this?', options: ['Ice cream', 'Yogurt', 'Milkshake', 'Candy'], correctIndex: 0 },
      { id: 'c10', emoji: '🦋', prompt: 'What is this?', options: ['Bee', 'Butterfly', 'Bird', 'Dragonfly'], correctIndex: 1 },
      { id: 'c11', emoji: '🎬', prompt: 'What is this?', options: ['Camera', 'Clapperboard', 'TV', 'Radio'], correctIndex: 1 },
      { id: 'c12', emoji: '🌵', prompt: 'What is this?', options: ['Tree', 'Bush', 'Cactus', 'Flower'], correctIndex: 2 },
    ],
  },
  {
    id: 'travel',
    title: 'Around the World',
    description: 'Flags, landmarks, and travel vibes',
    emoji: '🌍',
    rounds: [
      { id: 't1', emoji: '🗼', prompt: 'Famous landmark?', options: ['Big Ben', 'Eiffel Tower', 'Statue of Liberty', 'Colosseum'], correctIndex: 1 },
      { id: 't2', emoji: '🇯🇵', prompt: 'Which country?', options: ['China', 'Korea', 'Japan', 'Thailand'], correctIndex: 2 },
      { id: 't3', emoji: '✈️', prompt: 'What is this?', options: ['Helicopter', 'Plane', 'Rocket', 'Balloon'], correctIndex: 1 },
      { id: 't4', emoji: '🏖️', prompt: 'What place?', options: ['Mountain', 'Beach', 'Forest', 'Desert'], correctIndex: 1 },
      { id: 't5', emoji: '🗽', prompt: 'Located in?', options: ['UK', 'France', 'USA', 'Italy'], correctIndex: 2 },
      { id: 't6', emoji: '🏔️', prompt: 'What is this?', options: ['Hill', 'Mountain', 'Volcano', 'Valley'], correctIndex: 1 },
      { id: 't7', emoji: '⛩️', prompt: 'Building type?', options: ['Temple', 'Castle', 'Mosque', 'Church'], correctIndex: 0 },
      { id: 't8', emoji: '🚢', prompt: 'What is this?', options: ['Boat', 'Ship', 'Submarine', 'Yacht'], correctIndex: 1 },
      { id: 't9', emoji: '🌋', prompt: 'What is this?', options: ['Mountain', 'Volcano', 'Cave', 'Canyon'], correctIndex: 1 },
      { id: 't10', emoji: '🎒', prompt: 'Used for?', options: ['School', 'Travel', 'Sports', 'Shopping'], correctIndex: 1 },
    ],
  },
];

export function getEmojiBlitzPack(packId: string): EmojiBlitzPack | undefined {
  return EMOJI_BLITZ_PACKS.find((p) => p.id === packId);
}

export function shuffleRounds<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
