import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

const Login = () => {
  const { admin, loading, login } = useAuth();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Already authenticated → go to gallery
  if (!loading && admin) return <Navigate to="/gallery" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      const msg = err?.response?.data?.message;
      if (err?.response?.status === 401) {
        setError('Invalid email or password.');
      } else if (err?.response?.status === 429) {
        setError('Too many login attempts. Please wait 15 minutes.');
      } else if (!err?.response) {
        setError('Cannot reach the server. Check your connection.');
      } else {
        setError(msg || 'Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-pink-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">

          {/* Top accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-[#1e3a5f] to-[#e91e8c]" />

          <div className="px-8 py-10">
            {/* Logo + brand */}
            <div className="flex flex-col items-center mb-8">
              <img src={logo} alt="Reeyansh Aya Care" className="h-16 w-auto object-contain mb-4" />
              <h1 className="text-xl font-bold text-[#1e3a5f] text-center">Admin Panel</h1>
              <p className="text-sm text-slate-500 mt-1">Sign in to manage your content</p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
                <span className="text-red-500 mt-0.5 shrink-0">⚠</span>
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 pr-11 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                id="login-btn"
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-[#1e3a5f] to-[#2a4f80] hover:from-[#162d4a] hover:to-[#1e3a5f] text-white text-sm font-semibold rounded-lg shadow-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e3a5f]"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Signing in…
                  </>
                ) : (
                  'Login'
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-5">
          Reeyansh Aya Care &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default Login;
