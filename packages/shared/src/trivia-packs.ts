import type { TriviaQuestion } from './types';

export interface TriviaPack {
  id: string;
  title: string;
  description: string;
  emoji: string;
  questions: TriviaQuestion[];
}

export const TRIVIA_PACKS: TriviaPack[] = [
  {
    id: 'general',
    title: 'General Knowledge',
    description: '10 quick questions everyone can try',
    emoji: '🧠',
    questions: [
      {
        id: 'g1',
        question: 'What is the capital of France?',
        options: ['London', 'Berlin', 'Paris', 'Madrid'],
        correctIndex: 2,
        timeLimitSeconds: 20,
      },
      {
        id: 'g2',
        question: 'Which planet is known as the Red Planet?',
        options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
        correctIndex: 1,
        timeLimitSeconds: 20,
      },
      {
        id: 'g3',
        question: 'What year did the first iPhone launch?',
        options: ['2005', '2006', '2007', '2008'],
        correctIndex: 2,
        timeLimitSeconds: 20,
      },
      {
        id: 'g4',
        question: 'How many continents are there?',
        options: ['5', '6', '7', '8'],
        correctIndex: 2,
        timeLimitSeconds: 15,
      },
      {
        id: 'g5',
        question: 'What is the largest ocean on Earth?',
        options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'],
        correctIndex: 3,
        timeLimitSeconds: 20,
      },
      {
        id: 'g6',
        question: 'Who painted the Mona Lisa?',
        options: ['Van Gogh', 'Picasso', 'Da Vinci', 'Michelangelo'],
        correctIndex: 2,
        timeLimitSeconds: 20,
      },
      {
        id: 'g7',
        question: 'What gas do plants absorb from the atmosphere?',
        options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'],
        correctIndex: 2,
        timeLimitSeconds: 20,
      },
      {
        id: 'g8',
        question: 'Which country hosted the 2016 Summer Olympics?',
        options: ['China', 'UK', 'Brazil', 'Japan'],
        correctIndex: 2,
        timeLimitSeconds: 20,
      },
      {
        id: 'g9',
        question: 'What is the hardest natural substance?',
        options: ['Gold', 'Iron', 'Diamond', 'Quartz'],
        correctIndex: 2,
        timeLimitSeconds: 15,
      },
      {
        id: 'g10',
        question: 'How many players are on a soccer team on the field?',
        options: ['9', '10', '11', '12'],
        correctIndex: 2,
        timeLimitSeconds: 15,
      },
    ],
  },
  {
    id: 'movies',
    title: 'Movies & Pop Culture',
    description: 'Film buffs and binge-watchers unite',
    emoji: '🎬',
    questions: [
      {
        id: 'm1',
        question: 'Which movie features the quote "May the Force be with you"?',
        options: ['Star Trek', 'Star Wars', 'Avatar', 'Matrix'],
        correctIndex: 1,
        timeLimitSeconds: 20,
      },
      {
        id: 'm2',
        question: 'Who directed Inception?',
        options: ['Spielberg', 'Nolan', 'Scorsese', 'Tarantino'],
        correctIndex: 1,
        timeLimitSeconds: 20,
      },
      {
        id: 'm3',
        question: 'What is the highest-grossing film of all time (unadjusted)?',
        options: ['Avengers: Endgame', 'Avatar', 'Titanic', 'Frozen II'],
        correctIndex: 1,
        timeLimitSeconds: 25,
      },
      {
        id: 'm4',
        question: 'Which actor played Jack in Titanic?',
        options: ['Brad Pitt', 'Leonardo DiCaprio', 'Tom Cruise', 'Johnny Depp'],
        correctIndex: 1,
        timeLimitSeconds: 15,
      },
      {
        id: 'm5',
        question: 'What is the name of the wizard school in Harry Potter?',
        options: ['Durmstrang', 'Beauxbatons', 'Hogwarts', 'Ilvermorny'],
        correctIndex: 2,
        timeLimitSeconds: 20,
      },
      {
        id: 'm6',
        question: 'Which studio created Minions?',
        options: ['Pixar', 'DreamWorks', 'Illumination', 'Blue Sky'],
        correctIndex: 2,
        timeLimitSeconds: 20,
      },
      {
        id: 'm7',
        question: 'In The Matrix, what color pill does Neo take?',
        options: ['Blue', 'Red', 'Green', 'Yellow'],
        correctIndex: 1,
        timeLimitSeconds: 15,
      },
      {
        id: 'm8',
        question: 'Who voices Woody in Toy Story?',
        options: ['Tom Hanks', 'Tim Allen', 'Billy Crystal', 'Mike Myers'],
        correctIndex: 0,
        timeLimitSeconds: 20,
      },
    ],
  },
  {
    id: 'icebreaker',
    title: 'Team Icebreaker',
    description: 'Light fun for new groups',
    emoji: '🎉',
    questions: [
      {
        id: 'i1',
        question: 'Which superpower would you pick for a day?',
        options: ['Flying', 'Invisibility', 'Time travel', 'Teleportation'],
        correctIndex: 0,
        timeLimitSeconds: 20,
      },
      {
        id: 'i2',
        question: 'Best pizza topping?',
        options: ['Pepperoni', 'Mushroom', 'Pineapple', 'Extra cheese'],
        correctIndex: 3,
        timeLimitSeconds: 15,
      },
      {
        id: 'i3',
        question: 'Ideal weekend activity?',
        options: ['Hiking', 'Gaming', 'Brunch', 'Netflix'],
        correctIndex: 2,
        timeLimitSeconds: 15,
      },
      {
        id: 'i4',
        question: 'Coffee or tea?',
        options: ['Coffee', 'Tea', 'Both', 'Neither'],
        correctIndex: 0,
        timeLimitSeconds: 10,
      },
      {
        id: 'i5',
        question: 'Cats or dogs?',
        options: ['Cats', 'Dogs', 'Both', 'Neither'],
        correctIndex: 1,
        timeLimitSeconds: 10,
      },
      {
        id: 'i6',
        question: 'Best season?',
        options: ['Spring', 'Summer', 'Fall', 'Winter'],
        correctIndex: 1,
        timeLimitSeconds: 15,
      },
    ],
  },
];

export function getTriviaPack(packId: string): TriviaPack | undefined {
  return TRIVIA_PACKS.find((p) => p.id === packId);
}
