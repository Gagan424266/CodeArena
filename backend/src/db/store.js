/**
 * In-memory store for local development without Postgres.
 * Swap to pg queries when DATABASE_URL is available.
 */
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';

const users = new Map();
const problems = new Map();
const submissions = new Map();
const contests = new Map();

export const store = {
  users,
  problems,
  submissions,
  contests,

  createUser(email, password, username) {
    if ([...users.values()].some((u) => u.email === email)) {
      const err = new Error('Email already registered');
      err.status = 409;
      throw err;
    }
    const user = {
      id: uuid(),
      email,
      username,
      passwordHash: bcrypt.hashSync(password, 10),
      createdAt: new Date().toISOString(),
    };
    users.set(user.id, user);
    return user;
  },

  findUserByEmail(email) {
    return [...users.values()].find((u) => u.email === email);
  },

  createSubmission(data) {
    const sub = {
      id: uuid(),
      status: 'queued',
      verdict: null,
      timeMs: null,
      memoryKb: null,
      createdAt: new Date().toISOString(),
      judgedAt: null,
      ...data,
    };
    submissions.set(sub.id, sub);
    return sub;
  },

  updateSubmission(id, patch) {
    const sub = submissions.get(id);
    if (!sub) return null;
    Object.assign(sub, patch);
    return sub;
  },
};
