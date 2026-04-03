import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { apiCall } from '../utils/api.js';

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const errors = {};
    if (!username.trim()) {
      errors.username = 'Username is required';
    } else if (username.trim().length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const errors = validateForm();
    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      setIsLoading(true);
      const data = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      login(data.token, data.user);
      setLocation('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,rgba(37,99,235,0.18),transparent_32%),linear-gradient(180deg,#f8fbff_0%,#f1f5f9_100%)] px-4 py-10">
      <div className="mx-auto grid max-w-5xl items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="hidden lg:block">
          <img src="/logo.png" alt="Company logo" className="mb-6 h-14 w-auto" />
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900">
            Task Manager Workspace
          </h1>
          <p className="mt-3 max-w-md text-slate-600">
            Manage tasks, teams, and communication from one dashboard built for focused operations.
          </p>
        </section>

        <section className="surface-card mx-auto w-full max-w-md p-6 sm:p-8">
          <div className="mb-6 text-center">
            <img src="/logo.png" alt="Company logo" className="mx-auto mb-4 h-14 w-auto lg:hidden" />
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Welcome Back</h2>
            <p className="section-subtitle">Sign in to continue to your workspace.</p>
          </div>

          {error && (
            <div className="alert-error mb-4">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (validationErrors.username) setValidationErrors({ ...validationErrors, username: '' });
                }}
                placeholder="Enter your username"
                className={`control-input ${validationErrors.username ? '!border-rose-400 !shadow-none' : ''}`}
              />
              {validationErrors.username && <p className="mt-1 text-xs font-medium text-rose-600">{validationErrors.username}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (validationErrors.password) setValidationErrors({ ...validationErrors, password: '' });
                  }}
                  placeholder="Enter your password"
                  className={`control-input pr-10 ${validationErrors.password ? '!border-rose-400 !shadow-none' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {validationErrors.password && <p className="mt-1 text-xs font-medium text-rose-600">{validationErrors.password}</p>}
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-200 pt-4">
            <p className="text-center text-sm text-slate-600">
              New user? Contact your super admin to create an account.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
