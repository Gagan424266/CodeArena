import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Problems from './pages/Problems';
import ProblemDetail from './pages/ProblemDetail';
import Auth from './pages/Auth';
import Leaderboard from './pages/Leaderboard';

export default function App() {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('ca_user');
    return raw ? JSON.parse(raw) : null;
  });

  function onAuth(data) {
    localStorage.setItem('ca_token', data.token);
    localStorage.setItem('ca_user', JSON.stringify(data.user));
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem('ca_token');
    localStorage.removeItem('ca_user');
    setUser(null);
  }

  return (
    <div className="shell">
      <header className="top">
        <Link to="/" className="brand">
          CodeArena
        </Link>
        <nav>
          <Link to="/">Problems</Link>
          <Link to="/leaderboard">Leaderboard</Link>
          {user ? (
            <button type="button" className="ghost" onClick={logout}>
              {user.username} · Logout
            </button>
          ) : (
            <Link to="/auth">Login</Link>
          )}
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Problems />} />
          <Route path="/problems/:slug" element={<ProblemDetail user={user} />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route
            path="/auth"
            element={user ? <Navigate to="/" /> : <Auth onAuth={onAuth} />}
          />
        </Routes>
      </main>
    </div>
  );
}
