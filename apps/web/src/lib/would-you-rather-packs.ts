export interface WouldYouRatherDilemma {
  id: string;
  optionA: string;
  optionB: string;
}

export interface WouldYouRatherPack {
  id: string;
  title: string;
  description: string;
  emoji: string;
  dilemmas: WouldYouRatherDilemma[];
}

export const WYR_PACKS: WouldYouRatherPack[] = [
  {
    id: 'funny',
    title: 'Silly Choices',
    description: 'Ridiculous dilemmas for a good laugh',
    emoji: '😂',
    dilemmas: [
      { id: 'f1', optionA: 'Only speak in movie quotes', optionB: 'Only speak in song lyrics' },
      { id: 'f2', optionA: 'Have a permanent clown nose', optionB: 'Have permanent clown shoes' },
      { id: 'f3', optionA: 'Fight one horse-sized duck', optionB: 'Fight 100 duck-sized horses' },
      { id: 'f4', optionA: 'Sweat maple syrup', optionB: 'Cry chocolate milk' },
      { id: 'f5', optionA: 'Always trip on flat ground', optionB: 'Always lose one sock in the laundry' },
      { id: 'f6', optionA: 'Your laugh is a car horn', optionB: 'Your sneeze is a trumpet' },
      { id: 'f7', optionA: 'Live in a house made of candy', optionB: 'Live in a house made of pillows' },
      { id: 'f8', optionA: 'Be famous for something embarrassing', optionB: 'Be unknown but incredibly cool' },
    ],
  },
  {
    id: 'party',
    title: 'Party Picks',
    description: 'Perfect icebreakers for game night',
    emoji: '🎉',
    dilemmas: [
      { id: 'p1', optionA: 'Karaoke every Friday', optionB: 'Dance battle every Saturday' },
      { id: 'p2', optionA: 'Unlimited snacks, no drinks', optionB: 'Unlimited drinks, no snacks' },
      { id: 'p3', optionA: 'Host every party', optionB: 'Never host, always attend' },
      { id: 'p4', optionA: 'Theme costumes required', optionB: 'Pajamas only parties' },
      { id: 'p5', optionA: 'Board games all night', optionB: 'Video games all night' },
      { id: 'p6', optionA: 'Surprise guests every time', optionB: 'Same core crew every time' },
      { id: 'p7', optionA: 'Outdoor parties only', optionB: 'Indoor parties only' },
      { id: 'p8', optionA: 'DJ for every event', optionB: 'Live band for every event' },
    ],
  },
  {
    id: 'deep',
    title: 'Tough Calls',
    description: 'Harder choices that spark debate',
    emoji: '🤔',
    dilemmas: [
      { id: 'd1', optionA: 'Know how you die', optionB: 'Know when you die' },
      { id: 'd2', optionA: 'Relive your best day on loop', optionB: 'Skip to your happiest future day' },
      { id: 'd3', optionA: 'Be loved by everyone', optionB: 'Be respected by everyone' },
      { id: 'd4', optionA: 'Fix one global problem', optionB: 'Fix one personal problem forever' },
      { id: 'd5', optionA: 'Never use social media again', optionB: 'Never watch TV or movies again' },
      { id: 'd6', optionA: 'Always tell the truth', optionB: 'Always know when someone lies' },
      { id: 'd7', optionA: 'Explore space', optionB: 'Explore the deep ocean' },
      { id: 'd8', optionA: 'Extra 2 hours every morning', optionB: 'Extra 2 hours every night' },
    ],
  },
];

export function getWyrPack(packId: string): WouldYouRatherPack | undefined {
  return WYR_PACKS.find((p) => p.id === packId);
}

/** Fake crowd split for fun — stable per dilemma id */
export function getCrowdSplit(dilemmaId: string): number {
  let hash = 0;
  for (let i = 0; i < dilemmaId.length; i++) {
    hash = (hash + dilemmaId.charCodeAt(i) * (i + 1)) % 100;
  }
  return 35 + (hash % 30);
}
