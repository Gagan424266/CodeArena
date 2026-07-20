import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listProblems } from '../api/client';

export default function Problems() {
  const [problems, setProblems] = useState([]);
  const [q, setQ] = useState('');
  const [difficulty, setDifficulty] = useState('');

  useEffect(() => {
    const params = {};
    if (q) params.q = q;
    if (difficulty) params.difficulty = difficulty;
    listProblems(params).then((d) => setProblems(d.problems || []));
  }, [q, difficulty]);

  return (
    <section className="panel">
      <div className="hero-block">
        <h1>Problems</h1>
        <p>Practice DSA with a real judge pipeline — submit, queue, verdict.</p>
      </div>
      <div className="filters">
        <input
          placeholder="Search title or tag…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="">All difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
      <ul className="problem-list">
        {problems.map((p) => (
          <li key={p.slug}>
            <Link to={`/problems/${p.slug}`}>
              <span className={`diff ${p.difficulty}`}>{p.difficulty}</span>
              <strong>{p.title}</strong>
              <span className="tags">{p.tags?.join(' · ')}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
