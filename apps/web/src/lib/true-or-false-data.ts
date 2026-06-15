export interface TrueFalseStatement {
  id: string;
  text: string;
  answer: boolean;
}

export interface TrueFalsePack {
  id: string;
  title: string;
  description: string;
  emoji: string;
  statements: TrueFalseStatement[];
}

export const TRUE_FALSE_PACKS: TrueFalsePack[] = [
  {
    id: 'science',
    title: 'Science Facts',
    description: 'Separate fact from fiction',
    emoji: '🔬',
    statements: [
      { id: 's1', text: 'Light travels faster than sound.', answer: true },
      { id: 's2', text: 'The Great Wall of China is visible from space with the naked eye.', answer: false },
      { id: 's3', text: 'Honey never spoils.', answer: true },
      { id: 's4', text: 'Humans use only 10% of their brain.', answer: false },
      { id: 's5', text: 'Venus is the hottest planet in our solar system.', answer: true },
      { id: 's6', text: 'Goldfish have a 3-second memory.', answer: false },
      { id: 's7', text: 'Octopuses have three hearts.', answer: true },
      { id: 's8', text: 'Bats are blind.', answer: false },
    ],
  },
  {
    id: 'world',
    title: 'Around the World',
    description: 'Geography and culture trivia',
    emoji: '🌍',
    statements: [
      { id: 'w1', text: 'Australia is wider than the moon.', answer: true },
      { id: 'w2', text: 'The capital of Australia is Sydney.', answer: false },
      { id: 'w3', text: 'Africa spans all four hemispheres.', answer: true },
      { id: 'w4', text: 'Iceland has no mosquitoes.', answer: true },
      { id: 'w5', text: 'The Nile is the longest river in the world.', answer: true },
      { id: 'w6', text: 'Brazil is the largest country in South America.', answer: true },
      { id: 'w7', text: 'Mount Everest is the tallest mountain from base to peak.', answer: false },
      { id: 'w8', text: 'Japan has more than 6,800 islands.', answer: true },
    ],
  },
  {
    id: 'fun',
    title: 'Fun & Random',
    description: 'Wild claims — true or false?',
    emoji: '🎲',
    statements: [
      { id: 'f1', text: 'A group of flamingos is called a flamboyance.', answer: true },
      { id: 'f2', text: 'Bananas are berries.', answer: true },
      { id: 'f3', text: 'Strawberries are berries.', answer: false },
      { id: 'f4', text: 'Scotland\'s national animal is the unicorn.', answer: true },
      { id: 'f5', text: 'Hot water freezes faster than cold water sometimes.', answer: true },
      { id: 'f6', text: 'Humans share 50% of their DNA with bananas.', answer: true },
      { id: 'f7', text: 'A day on Venus is longer than a year on Venus.', answer: true },
      { id: 'f8', text: 'Wombat poop is cube-shaped.', answer: true },
    ],
  },
];

export function getTrueFalsePack(id: string): TrueFalsePack | undefined {
  return TRUE_FALSE_PACKS.find((p) => p.id === id);
}
