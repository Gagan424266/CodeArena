import { Router } from 'express';
import { store } from '../db/store.js';
import { requireAuth } from '../middleware/auth.js';
import { createRateLimiter } from '../middleware/rateLimit.js';
import { enqueue } from '../services/judgeQueue.js';
import '../db/seed.js';

const router = Router();
const submitLimit = createRateLimiter({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  max: Number(process.env.RATE_LIMIT_MAX) || 10,
});

router.post('/', requireAuth, submitLimit, (req, res) => {
  const { problemSlug, language, sourceCode } = req.body;
  if (!problemSlug || !sourceCode) {
    return res.status(400).json({ error: 'problemSlug and sourceCode required' });
  }
  if (!store.problems.has(problemSlug)) {
    return res.status(404).json({ error: 'Problem not found' });
  }
  const lang = language || 'cpp';
  if (!['cpp', 'python', 'javascript'].includes(lang)) {
    return res.status(400).json({ error: 'Unsupported language' });
  }

  const sub = store.createSubmission({
    userId: req.user.sub,
    problemSlug,
    language: lang,
    sourceCode,
  });
  enqueue(sub.id);
  res.status(202).json({ id: sub.id, status: sub.status });
});

router.get('/:id', requireAuth, (req, res) => {
  const sub = store.submissions.get(req.params.id);
  if (!sub) return res.status(404).json({ error: 'Not found' });
  if (sub.userId !== req.user.sub) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const { sourceCode, ...safe } = sub;
  res.json(safe);
});

router.get('/', requireAuth, (req, res) => {
  const mine = [...store.submissions.values()]
    .filter((s) => s.userId === req.user.sub)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 50)
    .map(({ sourceCode, ...safe }) => safe);
  res.json({ submissions: mine });
});

export default router;
