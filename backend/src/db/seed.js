import { store } from './store.js';

const samples = [
  {
    slug: 'two-sum',
    title: 'Two Sum',
    difficulty: 'easy',
    tags: ['array', 'hashmap'],
    timeLimitMs: 1000,
    memoryLimitKb: 65536,
    statement: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume each input has exactly one solution, and you may not use the same element twice.`,
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' },
    ],
  },
  {
    slug: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'easy',
    tags: ['stack', 'string'],
    timeLimitMs: 1000,
    memoryLimitKb: 65536,
    statement: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.`,
    examples: [
      { input: 's = "()"', output: 'true' },
      { input: 's = "(]"', output: 'false' },
    ],
  },
];

export function seedProblems() {
  for (const p of samples) {
    store.problems.set(p.slug, { id: p.slug, ...p });
  }
  console.log(`Seeded ${samples.length} problems`);
}

seedProblems();
