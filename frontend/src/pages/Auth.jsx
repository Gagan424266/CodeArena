import { useState } from 'react';
import { login, register } from '../api/client';

export default function Auth({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      const data =
        mode === 'login'
          ? await login({ email, password })
          : await register({ email, password, username });
      onAuth(data);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="panel narrow">
      <h1>{mode === 'login' ? 'Login' : 'Register'}</h1>
      <form onSubmit={submit} className="form">
        {mode === 'register' && (
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{mode === 'login' ? 'Login' : 'Create account'}</button>
      </form>
      {error && <p className="err">{error}</p>}
      <button
        type="button"
        className="ghost"
        onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
      >
        {mode === 'login' ? 'Need an account?' : 'Have an account?'}
      </button>
    </section>
  );
}
