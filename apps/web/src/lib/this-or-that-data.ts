export interface ThisOrThatChoice {
  id: string;
  optionA: string;
  optionB: string;
}

export interface ThisOrThatPack {
  id: string;
  title: string;
  description: string;
  emoji: string;
  choices: ThisOrThatChoice[];
}

export const THIS_OR_THAT_PACKS: ThisOrThatPack[] = [
  {
    id: 'food',
    title: 'Food Fight',
    description: 'Pick your side — no wrong answers',
    emoji: '🍕',
    choices: [
      { id: 'f1', optionA: 'Pizza', optionB: 'Burgers' },
      { id: 'f2', optionA: 'Coffee', optionB: 'Tea' },
      { id: 'f3', optionA: 'Sweet breakfast', optionB: 'Savory breakfast' },
      { id: 'f4', optionA: 'Chocolate', optionB: 'Vanilla' },
      { id: 'f5', optionA: 'Tacos', optionB: 'Sushi' },
      { id: 'f6', optionA: 'Cook at home', optionB: 'Eat out' },
      { id: 'f7', optionA: 'Ice cream', optionB: 'Cake' },
      { id: 'f8', optionA: 'Spicy food', optionB: 'Mild food' },
    ],
  },
  {
    id: 'life',
    title: 'Life Choices',
    description: 'Everyday preferences to debate',
    emoji: '🌴',
    choices: [
      { id: 'l1', optionA: 'Beach vacation', optionB: 'Mountain cabin' },
      { id: 'l2', optionA: 'Early bird', optionB: 'Night owl' },
      { id: 'l3', optionA: 'City life', optionB: 'Country life' },
      { id: 'l4', optionA: 'Summer', optionB: 'Winter' },
      { id: 'l5', optionA: 'Books', optionB: 'Movies' },
      { id: 'l6', optionA: 'Plan everything', optionB: 'Wing it' },
      { id: 'l7', optionA: 'Dogs', optionB: 'Cats' },
      { id: 'l8', optionA: 'Text', optionB: 'Phone call' },
    ],
  },
  {
    id: 'fun',
    title: 'Fun & Random',
    description: 'Silly picks that start arguments',
    emoji: '🎲',
    choices: [
      { id: 'u1', optionA: 'Super strength', optionB: 'Super speed' },
      { id: 'u2', optionA: 'Time travel to past', optionB: 'Time travel to future' },
      { id: 'u3', optionA: 'Always hot', optionB: 'Always cold' },
      { id: 'u4', optionA: 'No Wi-Fi for a week', optionB: 'No AC for a week' },
      { id: 'u5', optionA: 'Sing everything', optionB: 'Dance everywhere' },
      { id: 'u6', optionA: 'Talk to animals', optionB: 'Speak every language' },
      { id: 'u7', optionA: 'Live in a treehouse', optionB: 'Live on a houseboat' },
      { id: 'u8', optionA: 'Unlimited pizza', optionB: 'Unlimited tacos' },
    ],
  },
];

export function getCrowdPick(id: string): 'A' | 'B' {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i)) % 100;
  return hash % 2 === 0 ? 'A' : 'B';
}

export function getCrowdPercent(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i) * (i + 1)) % 100;
  return 38 + (hash % 24);
}
