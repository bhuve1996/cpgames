export interface MathPack {
  id: string;
  title: string;
  description: string;
  emoji: string;
  maxNumber: number;
  ops: Array<'+' | '-' | '×'>;
}

export const MATH_PACKS: MathPack[] = [
  {
    id: 'easy',
    title: 'Warm Up',
    description: 'Addition and subtraction up to 20',
    emoji: '🌱',
    maxNumber: 20,
    ops: ['+', '-'],
  },
  {
    id: 'standard',
    title: 'Standard',
    description: 'Mixed ops up to 50',
    emoji: '🔢',
    maxNumber: 50,
    ops: ['+', '-', '×'],
  },
  {
    id: 'hard',
    title: 'Brain Burn',
    description: 'Bigger numbers, all operations',
    emoji: '🔥',
    maxNumber: 99,
    ops: ['+', '-', '×'],
  },
];

export interface MathProblem {
  id: string;
  question: string;
  answer: number;
  options: number[];
}

function randInt(max: number) {
  return Math.floor(Math.random() * max) + 1;
}

export function generateProblem(pack: MathPack): MathProblem {
  const op = pack.ops[Math.floor(Math.random() * pack.ops.length)];
  let a = randInt(pack.maxNumber);
  let b = randInt(pack.maxNumber);
  let answer: number;

  if (op === '-') {
    if (a < b) [a, b] = [b, a];
    answer = a - b;
  } else if (op === '×') {
    a = randInt(Math.min(12, pack.maxNumber));
    b = randInt(Math.min(12, pack.maxNumber));
    answer = a * b;
  } else {
    answer = a + b;
  }

  const question = `${a} ${op} ${b} = ?`;
  const wrong = new Set<number>();
  while (wrong.size < 3) {
    const delta = randInt(10) * (Math.random() > 0.5 ? 1 : -1);
    const candidate = answer + delta;
    if (candidate !== answer && candidate >= 0) wrong.add(candidate);
  }

  const options = [answer, ...wrong];
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  return { id: crypto.randomUUID(), question, answer, options };
}

export function getMathPack(id: string): MathPack | undefined {
  return MATH_PACKS.find((p) => p.id === id);
}
