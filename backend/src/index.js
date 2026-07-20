import './loadEnv.js';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import problemRoutes from './routes/problems.js';
import submissionRoutes from './routes/submissions.js';
import leaderboardRoutes from './routes/leaderboard.js';
import { startWorker } from './services/judgeQueue.js';
import './db/seed.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;
const isProd = process.env.NODE_ENV === 'production';

// Same-origin UI+API in production; enable CORS for Vite dev proxy.
if (!isProd) {
  app.use(cors({ origin: true, credentials: true }));
}
app.use(express.json({ limit: '256kb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'codearena-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

if (isProd) {
  const distPath = path.resolve(__dirname, '../../frontend/dist');
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'), (err) => {
      if (err) next(err);
    });
  });
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal error' });
});

app.listen(PORT, () => {
  console.log(`CodeArena ${isProd ? 'app' : 'API'} on http://localhost:${PORT}`);
  startWorker();
});
