# CodeArena

Industry-style **Online Judge** (LeetCode-like) personal project.

**Stack:** React · Node.js · C++ Judge (optional) · in-memory store (Postgres/Redis optional)

## Features

- User auth (JWT)
- Problem catalog with tags & difficulty
- Submit code → async judge queue
- Verdicts: AC / WA / TLE / RE / CE
- Contest mode + leaderboard
- Rate limiting on submissions

## DSA highlights

- Priority queue for contest scoring
- Trie for tag/title search
- Sliding-window rate limiter
- Submission worker queue

## Monorepo layout

```
CodeArena/
├── frontend/     # React + Vite
├── backend/      # Node.js Express API (+ serves UI in production)
├── judge/        # C++ compile & run sandbox
├── problems/     # Sample problem packs
└── docker-compose.yml
```

## Production (single Node process)

```bash
# From CodeArena/
npm run install:all
npm run build
npm start
```

Open http://localhost:4000 — API and React UI are served from one process.

## Development

```bash
# Backend API (http://localhost:4000)
npm run install:all
npm run dev

# Frontend (separate terminal; proxies /api → :4000)
cd frontend && npm run dev
```

Optional: `docker compose up -d` for Postgres + Redis if you wire them later. The default store is in-memory and needs no external DB.

Optional judge binary:

```bash
cd judge && mkdir -p build && g++ -std=c++17 -O2 src/judge.cpp -o build/judge
```

## API (core)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/problems` | List problems |
| GET | `/api/problems/:slug` | Problem detail |
| POST | `/api/submissions` | Submit code |
| GET | `/api/submissions/:id` | Submission status |
| GET | `/api/leaderboard` | Contest ranks |

## Resume one-liner

> Built a distributed online judge with a C++ execution sandbox, async Node workers, JWT auth, and contest leaderboards.
