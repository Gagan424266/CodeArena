import { useEffect, useState } from 'react';
import { getLeaderboard } from '../api/client';

export default function Leaderboard() {
  const [ranks, setRanks] = useState([]);

  useEffect(() => {
    getLeaderboard().then((d) => setRanks(d.ranks || []));
  }, []);

  return (
    <section className="panel">
      <h1>Leaderboard</h1>
      <p className="muted">Ranked by solves, then penalty time (contest-style).</p>
      <table className="board">
        <thead>
          <tr>
            <th>#</th>
            <th>User</th>
            <th>Solved</th>
            <th>Penalty (ms)</th>
          </tr>
        </thead>
        <tbody>
          {ranks.length === 0 && (
            <tr>
              <td colSpan={4}>No AC submissions yet — solve a problem!</td>
            </tr>
          )}
          {ranks.map((r) => (
            <tr key={r.userId}>
              <td>{r.rank}</td>
              <td>{r.username}</td>
              <td>{r.solved}</td>
              <td>{r.penaltyMs}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
