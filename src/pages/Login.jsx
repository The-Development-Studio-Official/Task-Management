import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Eye, EyeOff } from 'lucide-react';

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
    
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      setIsLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const loginUrl = `${apiUrl}/api/auth/login`;
      
      console.log('Login URL:', loginUrl);
      
      const res = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      console.log('Response status:', res.status);
      console.log('Response headers:', res.headers.get('content-type'));
      
      const text = await res.text();
      console.log('Response body:', text);
      
      if (!text) {
        throw new Error('Empty response from server');
      }
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
      }
      
      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}: Login failed`);
      }
      
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
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#f0f4f8] to-[#f8fafc]">
      {/* Logo Area */}
      <div className="mb-8">
        <img 
          src="/logo.png" 
          alt="Company Logo" 
          className="h-16 mx-auto shadow-md"
        />
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-[440px] bg-white p-10 rounded-lg shadow-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-6 border border-red-200 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => {
                setUsername(e.target.value);
                if (validationErrors.username) {
                  setValidationErrors({ ...validationErrors, username: '' });
                }
              }}
              placeholder="Enter your username"
              className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                validationErrors.username 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
            />
            {validationErrors.username && (
              <p className="text-xs text-red-600 font-medium">{validationErrors.username}</p>
            )}
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">Password</label>
            <div className="relative w-full">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (validationErrors.password) {
                    setValidationErrors({ ...validationErrors, password: '' });
                  }
                }}
                placeholder="Enter your password"
                className={`w-full px-3 py-2.5 pr-10 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  validationErrors.password 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                }`}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {validationErrors.password && (
              <p className="text-xs text-red-600 font-medium">{validationErrors.password}</p>
            )}
          </div>
          
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-2.5 rounded-lg transition-colors mt-2"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Sign Up Section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-600">
            <span className="font-semibold">New user?</span> Contact your Super Admin to create an account
          </p>
        </div>
      </div>
    </div>
  );
}
