import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { ArrowRight, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthShell from '../components/layout/AuthShell';

interface ApiErrorResponse {
  detail?: string;
}

const registerHighlights = [
  {
    label: 'Plan',
    detail: 'Set up study systems, health routines, eco habits, and readable content from day one.',
  },
  {
    label: 'Track',
    detail: 'See recommendations, notifications, and milestones without piecing together separate apps.',
  },
  {
    label: 'Scale',
    detail: 'Use structured AI workflows instead of generic chat so action follows every prompt.',
  },
];

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      await register(formData.email, formData.password, formData.firstName, formData.lastName);
      navigate('/dashboard');
    } catch (err: unknown) {
      const apiError = err as AxiosError<ApiErrorResponse>;
      setError(apiError.response?.data?.detail ?? 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Build Your Operating Layer"
      title="Create an account for structured progress across every impact domain."
      description="Start with one profile and unlock domain agents that turn notes, goals, and ideas into practical next steps."
      highlights={registerHighlights}
      footer={
        <p>
          Already have access?{' '}
          <Link to="/login" className="font-semibold text-kaleo-terracotta transition hover:text-kaleo-charcoal">
            Sign in
          </Link>
          .
        </p>
      }
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="section-kicker">Create Account</p>
          <h2 className="mt-3 text-3xl font-serif tracking-[-0.04em] text-kaleo-charcoal">
            Launch Civic Hub
          </h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-kaleo-charcoal/60">
            Set up your profile once and manage learning, health, sustainability, and accessibility from a single interface.
          </p>
        </div>
        <span className="status-pill hidden sm:inline-flex">Onboarding Ready</span>
      </div>

      {error ? (
        <div className="mt-6 rounded-[1.25rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-kaleo-charcoal">First Name</label>
            <div className="relative">
              <User className="auth-field-icon" />
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="auth-field pl-12"
                placeholder="Jordan"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-kaleo-charcoal">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="auth-field"
              placeholder="Rivera"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-kaleo-charcoal">Email Address</label>
          <div className="relative">
            <Mail className="auth-field-icon" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="auth-field pl-12"
              placeholder="you@example.com"
              required
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label className="block text-sm font-medium text-kaleo-charcoal">Password</label>
            <span className="text-xs uppercase tracking-[0.18em] text-kaleo-charcoal/40">8 characters minimum</span>
          </div>
          <div className="relative">
            <Lock className="auth-field-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="auth-field pl-12 pr-12"
              placeholder="Create a password"
              required
              minLength={8}
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

        <div>
          <label className="mb-2 block text-sm font-medium text-kaleo-charcoal">Confirm Password</label>
          <div className="relative">
            <Lock className="auth-field-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="auth-field pl-12"
              placeholder="Repeat your password"
              required
            />
          </div>
        </div>

        <button type="submit" disabled={isLoading} className="impact-button mt-2 w-full disabled:translate-y-0 disabled:opacity-60">
          {isLoading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/25 border-t-white" />
          ) : (
            <>
              Create workspace
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
}
