import { Router } from 'express';
import { store } from '../db/store.js';
import { TagTrie } from '../utils/tagTrie.js';
import '../db/seed.js';

const router = Router();
const trie = new TagTrie();

function rebuildTrie() {
  for (const p of store.problems.values()) {
    trie.insert(p.title.toLowerCase(), p.slug);
    for (const tag of p.tags) trie.insert(tag.toLowerCase(), p.slug);
  }
}
rebuildTrie();

router.get('/', (req, res) => {
  const { difficulty, q, tag } = req.query;
  let list = [...store.problems.values()];

  if (difficulty) list = list.filter((p) => p.difficulty === difficulty);
  if (tag) list = list.filter((p) => p.tags.includes(String(tag).toLowerCase()));
  if (q) {
    const slugs = new Set(trie.searchPrefix(String(q).toLowerCase()));
    list = list.filter(
      (p) =>
        slugs.has(p.slug) ||
        p.title.toLowerCase().includes(String(q).toLowerCase())
    );
  }

  res.json({
    problems: list.map(({ statement, examples, ...meta }) => meta),
    total: list.length,
  });
});

router.get('/:slug', (req, res) => {
  const problem = store.problems.get(req.params.slug);
  if (!problem) return res.status(404).json({ error: 'Problem not found' });
  res.json(problem);
});

export default router;
