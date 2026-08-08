import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, ArrowRight, Eye, EyeOff, AlertCircle, User, Mail } from 'lucide-react';

export default function LoginPage({ onLoginSuccess, onBackToLanding }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const endpoint = isSignUp ? '/api/signup' : '/api/login';
    const payload = isSignUp ? { name, email, password } : { email, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const contentType = response.headers.get('content-type') || '';
      let data = {};
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        throw new Error('Authentication service unavailable. Please check your network or try again.');
      }

      if (!response.ok) {
        throw new Error(data.error || (isSignUp ? 'Registration failed' : 'Sign in failed'));
      }

      localStorage.setItem('invoiceshield_token', data.token);
      setIsLoading(false);
      onLoginSuccess(data.user);

    } catch (err) {
      setIsLoading(false);
      setErrorMessage(err.message || 'An error occurred during authentication.');
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-[#05030a] cyber-grid flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient Spline glow orbs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Auth Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-[#0a0714]/90 border border-purple-500/30 backdrop-blur-2xl shadow-2xl shadow-purple-950/60 relative z-10"
      >
        {/* Back Link */}
        <button
          onClick={onBackToLanding}
          className="text-xs font-mono text-slate-400 hover:text-purple-400 mb-6 flex items-center space-x-1 transition-colors cursor-pointer"
        >
          <span>← Back to 3D Landing Page</span>
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-3 mb-8">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-600/20 border border-purple-500/40 text-purple-400 shadow-lg shadow-purple-500/10">
            <Shield className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              InvoiceShield <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">AI</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              {isSignUp ? 'Create Your Account' : 'Enterprise Secure Authentication'}
            </p>
          </div>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required={isSignUp}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#05030a] border border-purple-900/50 text-slate-100 text-sm focus:outline-none focus:border-purple-400 transition-colors pl-10"
                  placeholder="John Doe"
                />
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              </div>
            </motion.div>
          )}

          <div>
            <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#05030a] border border-purple-900/50 text-slate-100 text-sm focus:outline-none focus:border-purple-400 transition-colors pl-10"
                placeholder="name@company.com"
              />
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#05030a] border border-purple-900/50 text-slate-100 text-sm focus:outline-none focus:border-purple-400 transition-colors pl-10 pr-10"
                placeholder={isSignUp ? 'Min 6 characters' : '••••••••••••'}
              />
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-500 to-indigo-600 font-bold text-white text-sm hover:brightness-110 shadow-lg shadow-purple-500/25 transition-all cursor-pointer flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <span className="flex items-center space-x-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{isSignUp ? 'Creating Account...' : 'Authenticating...'}</span>
              </span>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>{isSignUp ? 'Create Account & Sign In' : 'Authorize & Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode Link */}
        <div className="mt-6 pt-4 border-t border-slate-900 text-center">
          <button
            type="button"
            onClick={toggleMode}
            className="text-xs text-slate-400 hover:text-purple-400 transition-colors cursor-pointer"
          >
            {isSignUp ? (
              <span>Already have an account? <strong className="text-purple-400 underline">Sign In</strong></span>
            ) : (
              <span>Don't have an account? <strong className="text-purple-400 underline">Create One</strong></span>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
