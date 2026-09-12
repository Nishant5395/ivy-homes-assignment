// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('demo1@ivy.homes');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-serif text-3xl text-ink mb-1">Ivy Homes</h1>
        <p className="text-muted text-sm mb-8">Sign in to browse listings in Pune.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-ink mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-slate"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm text-ink mb-1">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-slate"
            />
          </div>

          {error && (
            <p className="text-sm text-red-700" role="alert">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate text-white rounded py-2 font-medium hover:bg-ink transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-xs text-muted mt-6">
          Demo accounts: demo1@ivy.homes, demo2@ivy.homes, demo3@ivy.homes
        </p>
      </div>
    </div>
  );
}
