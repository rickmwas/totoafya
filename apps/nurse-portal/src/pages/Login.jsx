import React, { useState } from 'react';
import db from '@/api/totoafyaClient';
import { useAuth } from '@/lib/AuthContext';
import { Shield, ArrowRight, Activity, ShieldAlert, UserCheck, Mail, Lock } from 'lucide-react';

export default function Login() {
  const { checkAppState } = useAuth();
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
      await checkAppState();
      window.location.href = '/';
    } catch (err) {
      console.error(err);
      setError(err.message || 'Invalid email or password.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 font-sans text-slate-800">
      {/* Main Container */}
      <div className="w-full max-w-[400px] bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col items-center">

        {/* Brand Header */}
        <div className="flex flex-col items-center gap-2 mb-6">
          <img src="/logo-horizontal.png" alt="TotoAfya Digital" className="h-10 object-contain" />
          <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mt-1">Nurse Portal</span>
        </div>

        {/* Welcome Text */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">
            Nurse Staff Login
          </h1>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            Authorized portal for child immunizations, maternal records, and patient registries.
          </p>
        </div>

        {error && (
          <div className="w-full bg-rose-50 border border-rose-100 text-rose-700 text-xs px-4 py-3 rounded-lg mb-5 flex items-start gap-2">
            <Shield className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
            <p className="font-semibold leading-relaxed">{error}</p>
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="w-full flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="nurse@facility.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white transition-all text-slate-900"
                required
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white transition-all text-slate-900"
                required
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-emerald-700 hover:bg-emerald-600 active:scale-[0.99] text-white rounded-xl font-bold text-sm shadow transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Verify & Login</span>
            )}
          </button>
        </form>

        {/* Help Info */}
        <p className="text-xs text-slate-400 mt-6 text-center leading-relaxed">
          Authorized clinical staff only. Nurse emails must be pre-registered by the system administrator.
        </p>
      </div>
    </div>
  );
}
