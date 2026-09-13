import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

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
    <div className="min-h-screen bg-paper flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl">

        {/* Main Card */}
        <div className="grid overflow-hidden rounded-3xl border border-black/5 bg-white shadow-[0_20px_60px_rgba(22,35,58,0.10)] md:grid-cols-2">

          {/* Left - Branding */}
          <div className="hidden bg-ink p-10 text-white md:flex md:flex-col md:justify-between">
            <div>
              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold text-lg font-semibold text-ink">
                  I
                </div>

                <span className="font-serif text-2xl">
                  Ivy Homes
                </span>
              </div>

              <h2 className="max-w-sm font-serif text-4xl leading-tight">
                Find a place that feels like home.
              </h2>

              <p className="mt-5 max-w-sm text-sm leading-6 text-white/65">
                Discover thoughtfully selected homes and apartments
                across Pune, all in one simple place.
              </p>
            </div>

            <div className="border-t border-white/10 pt-6">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                Premium living
              </p>

              <p className="mt-2 text-sm text-white/60">
                Better homes. Better decisions.
              </p>
            </div>
          </div>

          {/* Right - Login */}
          <div className="p-7 sm:p-10 md:p-12">

            {/* Mobile Logo */}
            <div className="mb-8 flex items-center gap-3 md:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-lg font-semibold text-gold">
                I
              </div>

              <span className="font-serif text-2xl text-ink">
                Ivy Homes
              </span>
            </div>

            <div className="mb-8">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate">
                Welcome back
              </p>

              <h1 className="font-serif text-3xl font-medium text-ink sm:text-4xl">
                Sign in
              </h1>

              <p className="mt-3 text-sm leading-6 text-muted">
                Sign in to browse listings and find your next home in Pune.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-ink"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-ink outline-none transition-all placeholder:text-gray-400 focus:border-slate focus:bg-white focus:ring-4 focus:ring-slate/10"
                />
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-ink"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-xs font-medium text-slate transition hover:text-ink"
                  >
                    Forgot password?
                  </button>
                </div>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-ink outline-none transition-all placeholder:text-gray-400 focus:border-slate focus:bg-white focus:ring-4 focus:ring-slate/10"
                />
              </div>

              {/* Error */}
              {error && (
                <div
                  className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
                  role="alert"
                >
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate hover:shadow-lg hover:shadow-slate/15 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <span className="transition-transform duration-200 group-hover:translate-x-1">
                      →
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* Demo accounts */}
            <div className="mt-8 rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink">
                Demo accounts
              </p>

              <p className="mt-2 text-xs leading-5 text-muted">
                demo1@ivy.homes · demo2@ivy.homes · demo3@ivy.homes
              </p>
            </div>

            <p className="mt-8 text-center text-xs text-muted">
              By continuing, you agree to Ivy Homes' terms and privacy policy.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-muted">
          © 2026 Ivy Homes. All rights reserved.
        </p>
      </div>
    </div>
  );
}

