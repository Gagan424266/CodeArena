import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { store } from '../db/store.js';
import '../db/seed.js';

const router = Router();
const SECRET = process.env.JWT_SECRET || 'dev-secret';

router.post('/register', (req, res, next) => {
  try {
    const { email, password, username } = req.body;
    if (!email || !password || !username) {
      return res.status(400).json({ error: 'email, password, username required' });
    }
    const user = store.createUser(email, password, username);
    const token = jwt.sign({ sub: user.id, email: user.email }, SECRET, { expiresIn: '7d' });
    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, username: user.username },
    });
  } catch (e) {
    next(e);
  }
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = store.findUserByEmail(email);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ sub: user.id, email: user.email }, SECRET, { expiresIn: '7d' });
  res.json({
    token,
    user: { id: user.id, email: user.email, username: user.username },
  });
});

export default router;
