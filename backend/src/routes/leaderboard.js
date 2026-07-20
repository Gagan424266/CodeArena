import { Router } from 'express';
import { store } from '../db/store.js';
import { ContestLeaderboard } from '../utils/leaderboard.js';

const router = Router();
const board = new ContestLeaderboard();

router.get('/', (_req, res) => {
  // Aggregate accepted submissions into a live leaderboard
  board.clear();
  for (const sub of store.submissions.values()) {
    if (sub.verdict === 'AC') {
      const user = store.users.get(sub.userId);
      board.recordSolve(sub.userId, user?.username || sub.userId, sub.problemSlug, sub.timeMs || 0);
    }
  }
  res.json({ ranks: board.top(50) });
});

export default router;
