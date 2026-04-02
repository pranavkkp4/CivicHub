import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthShell from '../components/layout/AuthShell';

interface ApiErrorResponse {
  detail?: string;
}

const loginHighlights = [
  {
    label: 'Study',
    detail: 'Generate flashcards, mock interviews, and weak-topic reviews from your material.',
  },
  {
    label: 'Wellness',
    detail: 'Keep workout plans, nutrition goals, and check-ins in one calm operating layer.',
  },
  {
    label: 'Access',
    detail: 'Translate, simplify, and summarize information without switching tools.',
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      const apiError = err as AxiosError<ApiErrorResponse>;
      setError(apiError.response?.data?.detail ?? 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Return To Mission Control"
      title="Sign in and pick up where your impact left off."
      description="Impact OS brings your learning, wellness, sustainability, and accessibility workflows into one measured system."
      highlights={loginHighlights}
      footer={
        <p>
          New to the platform?{' '}
          <Link to="/register" className="font-semibold text-kaleo-terracotta transition hover:text-kaleo-charcoal">
            Create an account
          </Link>
          .
        </p>
      }
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="section-kicker">Secure Sign In</p>
          <h2 className="mt-3 text-3xl font-serif tracking-[-0.04em] text-kaleo-charcoal">
            Welcome back
          </h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-kaleo-charcoal/60">
            Enter your account details to reopen your plans, recommendations, and progress across every domain.
          </p>
        </div>
        <span className="status-pill hidden sm:inline-flex">Encrypted Session</span>
      </div>

      {error ? (
        <div className="mt-6 rounded-[1.25rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-kaleo-charcoal">Email Address</label>
          <div className="relative">
            <Mail className="auth-field-icon" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-field pl-12"
              placeholder="you@example.com"
              required
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label className="block text-sm font-medium text-kaleo-charcoal">Password</label>
            <span className="text-xs uppercase tracking-[0.18em] text-kaleo-charcoal/40">Minimum 8 characters</span>
          </div>
          <div className="relative">
            <Lock className="auth-field-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-field pl-12 pr-12"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-kaleo-charcoal/40 transition hover:text-kaleo-charcoal"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={isLoading} className="impact-button mt-2 w-full disabled:translate-y-0 disabled:opacity-60">
          {isLoading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/25 border-t-white" />
          ) : (
            <>
              Open dashboard
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
}
