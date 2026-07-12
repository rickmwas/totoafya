import React, { useState } from 'react';
import db from '@/api/totoafyaClient';
import { Shield, ArrowRight, KeyRound, ShieldAlert, Crown, Mail, Lock } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await db.auth.login(email, password);
      if (onLoginSuccess) {
        await onLoginSuccess();
      } else {
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Invalid email or password.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-955 flex flex-col justify-center items-center p-4 font-sans text-slate-100">
      {/* Main Container Card */}
      <div className="w-full max-w-[400px] bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center">
        
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 mb-6 text-slate-400">
          <KeyRound className="w-5 h-5 text-indigo-500" />
          <span className="text-xs font-semibold tracking-wider uppercase">TotoAfya Global Console</span>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Super Admin Login
          </h1>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            Global network operations, facility configuration controls, and administrative database security audit.
          </p>
        </div>

        {error && (
          <div className="w-full bg-rose-955/50 border border-rose-800 text-rose-300 text-xs px-4 py-3 rounded-lg mb-5 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <p className="font-semibold leading-relaxed">{error}</p>
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="w-full flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Console Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="super@totoafya.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-800 border border-slate-700 text-sm focus:outline-none focus:border-indigo-500 focus:bg-slate-800/80 transition-all text-slate-100"
                required
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Console Password
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-800 border border-slate-700 text-sm focus:outline-none focus:border-indigo-500 focus:bg-slate-800/80 transition-all text-slate-100"
                required
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-indigo-650 hover:bg-indigo-600 active:scale-[0.99] text-white rounded-xl font-bold text-sm shadow transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Access Console</span>
            )}
          </button>
        </form>

        {/* Warnings */}
        <p className="text-xs text-slate-500 mt-6 text-center leading-relaxed">
          Restricted global infrastructure node. Unauthorized access attempts are logged and investigated.
        </p>
      </div>
    </div>
  );
}
