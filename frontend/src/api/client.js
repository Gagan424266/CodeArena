const API = '/api';

function authHeaders() {
  const token = localStorage.getItem('ca_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function register(body) {
  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Register failed');
  return data;
}

export async function login(body) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data;
}

export async function listProblems(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API}/problems${qs ? `?${qs}` : ''}`);
  return res.json();
}

export async function getProblem(slug) {
  const res = await fetch(`${API}/problems/${slug}`);
  if (!res.ok) throw new Error('Not found');
  return res.json();
}

export async function submitCode(body) {
  const res = await fetch(`${API}/submissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Submit failed');
  return data;
}

export async function getSubmission(id) {
  const res = await fetch(`${API}/submissions/${id}`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function getLeaderboard() {
  const res = await fetch(`${API}/leaderboard`);
  return res.json();
}
