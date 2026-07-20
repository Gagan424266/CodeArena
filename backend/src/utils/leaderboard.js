/**
 * Contest leaderboard using a max-heap by score, then min time (DSA: priority queue).
 */
export class ContestLeaderboard {
  constructor() {
    this.byUser = new Map(); // userId -> { username, solved: Set, penaltyMs }
  }

  clear() {
    this.byUser.clear();
  }

  recordSolve(userId, username, problemSlug, timeMs) {
    let row = this.byUser.get(userId);
    if (!row) {
      row = { userId, username, solved: new Set(), penaltyMs: 0 };
      this.byUser.set(userId, row);
    }
    if (!row.solved.has(problemSlug)) {
      row.solved.add(problemSlug);
      row.penaltyMs += timeMs;
    }
  }

  top(n = 50) {
    const rows = [...this.byUser.values()].map((r) => ({
      userId: r.userId,
      username: r.username,
      solved: r.solved.size,
      penaltyMs: r.penaltyMs,
    }));
    // Sort: more solved first, then lower penalty
    rows.sort((a, b) => b.solved - a.solved || a.penaltyMs - b.penaltyMs);
    return rows.slice(0, n).map((r, i) => ({ rank: i + 1, ...r }));
  }
}
