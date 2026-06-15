export interface CharadesPrompt {
  id: string;
  text: string;
  category: string;
}

export interface CharadesPack {
  id: string;
  title: string;
  description: string;
  emoji: string;
  prompts: CharadesPrompt[];
}

export const CHARADES_PACKS: CharadesPack[] = [
  {
    id: 'easy',
    title: 'Easy Mode',
    description: 'Simple words anyone can act out',
    emoji: '🌟',
    prompts: [
      { id: 'e1', text: 'Swimming', category: 'Action' },
      { id: 'e2', text: 'Pizza delivery', category: 'Job' },
      { id: 'e3', text: 'Birthday party', category: 'Event' },
      { id: 'e4', text: 'Sleeping', category: 'Action' },
      { id: 'e5', text: 'Basketball', category: 'Sport' },
      { id: 'e6', text: 'Rainbow', category: 'Nature' },
      { id: 'e7', text: 'Selfie', category: 'Action' },
      { id: 'e8', text: 'Rock star', category: 'Person' },
      { id: 'e9', text: 'Traffic jam', category: 'Situation' },
      { id: 'e10', text: 'Opening a gift', category: 'Action' },
    ],
  },
  {
    id: 'movies',
    title: 'Movie Night',
    description: 'Films and characters to perform',
    emoji: '🎬',
    prompts: [
      { id: 'm1', text: 'Titanic', category: 'Movie' },
      { id: 'm2', text: 'Harry Potter', category: 'Movie' },
      { id: 'm3', text: 'The Lion King', category: 'Movie' },
      { id: 'm4', text: 'Jurassic Park', category: 'Movie' },
      { id: 'm5', text: 'Spider-Man', category: 'Character' },
      { id: 'm6', text: 'Frozen', category: 'Movie' },
      { id: 'm7', text: 'James Bond', category: 'Character' },
      { id: 'm8', text: 'Star Wars', category: 'Movie' },
      { id: 'm9', text: 'King Kong', category: 'Character' },
      { id: 'm10', text: 'Finding Nemo', category: 'Movie' },
    ],
  },
  {
    id: 'chaos',
    title: 'Chaos Mode',
    description: 'Harder prompts for brave actors',
    emoji: '🔥',
    prompts: [
      { id: 'x1', text: 'Procrastinating', category: 'Abstract' },
      { id: 'x2', text: 'Déjà vu', category: 'Abstract' },
      { id: 'x3', text: 'Bitcoin crashing', category: 'Abstract' },
      { id: 'x4', text: 'Group chat drama', category: 'Situation' },
      { id: 'x5', text: 'Wi-Fi going out', category: 'Situation' },
      { id: 'x6', text: 'Parallel parking', category: 'Action' },
      { id: 'x7', text: 'Tax season', category: 'Abstract' },
      { id: 'x8', text: 'Influencer apology', category: 'Situation' },
      { id: 'x9', text: 'Monday morning', category: 'Abstract' },
      { id: 'x10', text: 'Plot twist', category: 'Abstract' },
    ],
  },
];

export function shufflePrompts<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
