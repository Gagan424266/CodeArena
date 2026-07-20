# Architecture notes

## Submission flow

1. Client POST `/api/submissions` with source
2. API enqueues id → in-memory queue (swap Redis later)
3. Worker picks job → invokes C++ `judge` binary
4. Judge compiles, runs each `.in/.out` pair, returns JSON verdict
5. Client polls until `status=done`

## DSA modules

| Module | Structure | File |
|--------|-----------|------|
| Tag search | Trie | `backend/src/utils/tagTrie.js` |
| Rate limit | Sliding window | `backend/src/middleware/rateLimit.js` |
| Leaderboard | Sort / priority | `backend/src/utils/leaderboard.js` |
| Judge timeout | fork + waitpid | `judge/src/judge.cpp` |
