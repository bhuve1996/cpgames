export interface DrawGuessWordPack {
  id: string;
  title: string;
  description: string;
  emoji: string;
  words: string[];
}

export const DRAW_GUESS_PACKS: DrawGuessWordPack[] = [
  {
    id: 'everyday',
    title: 'Everyday Objects',
    description: 'Easy words — great for any group',
    emoji: '🏠',
    words: [
      'Bicycle', 'Umbrella', 'Guitar', 'Pizza', 'Rainbow', 'Camera', 'Ladder', 'Snowman',
      'Helicopter', 'Campfire', 'Skateboard', 'Tornado', 'Penguin', 'Sandwich', 'Treasure',
    ],
  },
  {
    id: 'movies',
    title: 'Movies & TV',
    description: 'Characters and pop culture',
    emoji: '🎬',
    words: [
      'Superhero', 'Dragon', 'Pirate', 'Wizard', 'Robot', 'Alien', 'Detective', 'Vampire',
      'Dinosaur', 'Princess', 'Ninja', 'Zombie', 'Cowboy', 'Astronaut', 'Mermaid',
    ],
  },
  {
    id: 'actions',
    title: 'Actions & Sports',
    description: 'Verbs and activities to sketch',
    emoji: '⚽',
    words: [
      'Swimming', 'Dancing', 'Cooking', 'Sleeping', 'Fishing', 'Surfing', 'Boxing', 'Climbing',
      'Sneezing', 'Juggling', 'Painting', 'Running', 'Yawning', 'Singing', 'Skateboarding',
    ],
  },
];

export function getDrawGuessPack(packId: string): DrawGuessWordPack | undefined {
  return DRAW_GUESS_PACKS.find((p) => p.id === packId);
}

export function shuffleWords(words: string[]): string[] {
  const copy = [...words];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
