import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProblem, submitCode, getSubmission } from '../api/client';

const STARTER = `#include <bits/stdc++.h>
using namespace std;
int main() {
  // Read input, write your algorithm, print answer
  return 0;
}
`;

export default function ProblemDetail({ user }) {
  const { slug } = useParams();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState(STARTER);
  const [verdict, setVerdict] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getProblem(slug).then(setProblem).catch(() => setError('Problem not found'));
  }, [slug]);

  async function onSubmit() {
    if (!user) {
      setError('Login required to submit');
      return;
    }
    setBusy(true);
    setError('');
    setVerdict(null);
    try {
      const { id } = await submitCode({
        problemSlug: slug,
        language: 'cpp',
        sourceCode: code,
      });
      // poll
      for (let i = 0; i < 20; i++) {
        await new Promise((r) => setTimeout(r, 400));
        const s = await getSubmission(id);
        if (s.status === 'done') {
          setVerdict(s);
          break;
        }
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (!problem) return <p className="muted">{error || 'Loading…'}</p>;

  return (
    <section className="split">
      <div className="panel">
        <Link to="/" className="back">
          ← Problems
        </Link>
        <h1>{problem.title}</h1>
        <span className={`diff ${problem.difficulty}`}>{problem.difficulty}</span>
        <p className="statement">{problem.statement}</p>
        {problem.examples?.map((ex, i) => (
          <pre key={i} className="example">
            <div>Input: {ex.input}</div>
            <div>Output: {ex.output}</div>
          </pre>
        ))}
      </div>
      <div className="panel editor-panel">
        <textarea
          className="editor"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
        />
        <div className="actions">
          <button type="button" onClick={onSubmit} disabled={busy}>
            {busy ? 'Judging…' : 'Submit'}
          </button>
          {verdict && (
            <span className={`verdict ${verdict.verdict}`}>{verdict.verdict}</span>
          )}
          {error && <span className="err">{error}</span>}
        </div>
      </div>
    </section>
  );
}
