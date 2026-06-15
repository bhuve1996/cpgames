export interface NHIEPrompt {
  id: string;
  text: string;
}

export interface NHIEPack {
  id: string;
  title: string;
  description: string;
  emoji: string;
  prompts: NHIEPrompt[];
}

export const NHIE_PACKS: NHIEPack[] = [
  {
    id: 'classic',
    title: 'Classic',
    description: 'Mild icebreakers for any group',
    emoji: '🙈',
    prompts: [
      { id: 'c1', text: 'been skydiving' },
      { id: 'c2', text: 'fallen asleep in a movie theater' },
      { id: 'c3', text: 'sent a text to the wrong person' },
      { id: 'c4', text: 'pretended to laugh at a joke I didn\'t get' },
      { id: 'c5', text: 'gone more than a day without my phone' },
      { id: 'c6', text: 'sung karaoke in public' },
      { id: 'c7', text: 'been on TV or the news' },
      { id: 'c8', text: 'lied about my age' },
      { id: 'c9', text: 'eaten food off the floor' },
      { id: 'c10', text: 'had a crush on a friend' },
    ],
  },
  {
    id: 'party',
    title: 'Party Night',
    description: 'Spicier prompts for close friends',
    emoji: '🎉',
    prompts: [
      { id: 'p1', text: 'danced on a table' },
      { id: 'p2', text: 'stayed up until sunrise at a party' },
      { id: 'p3', text: 'had a wardrobe malfunction in public' },
      { id: 'p4', text: 'been kicked out of a bar or club' },
      { id: 'p5', text: 'done a shot I immediately regretted' },
      { id: 'p6', text: 'lost my voice from cheering too loud' },
      { id: 'p7', text: 'photobombed a stranger\'s picture' },
      { id: 'p8', text: 'worn the same outfit two days in a row to an event' },
      { id: 'p9', text: 'made a toast that went horribly wrong' },
      { id: 'p10', text: 'left a party without saying goodbye' },
    ],
  },
  {
    id: 'travel',
    title: 'Adventures',
    description: 'Travel and outdoors edition',
    emoji: '✈️',
    prompts: [
      { id: 't1', text: 'missed a flight' },
      { id: 't2', text: 'gotten lost in a foreign city' },
      { id: 't3', text: 'camped under the stars' },
      { id: 't4', text: 'tried food I couldn\'t identify' },
      { id: 't5', text: 'swum in the ocean at night' },
      { id: 't6', text: 'hitchhiked or picked up a hitchhiker' },
      { id: 't7', text: 'climbed a mountain over 3,000m' },
      { id: 't8', text: 'been on a road trip longer than 8 hours' },
      { id: 't9', text: 'used broken phrases in another language' },
      { id: 't10', text: 'kept a seashell or rock from a beach' },
    ],
  },
];
