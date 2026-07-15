import React, { useState, useEffect } from 'react';
import db, { supabase } from '@/api/totoafyaClient';
import { useAuth } from '@/lib/AuthContext';
import { Shield, ArrowRight, Activity, ShieldAlert, UserCheck, Mail, Lock, Phone, Key, Activity as ActivityIcon } from 'lucide-react';

export default function Login({ isActivationFlow = false }) {
  const { checkAppState, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Login states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Activation states
  const [designation, setDesignation] = useState('');
  const [phone, setPhone] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [autoVerifying, setAutoVerifying] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    const codeParam = params.get('code');
    if (emailParam && codeParam) {
      // Clear the query parameters from the URL bar immediately to prevent duplicate runs on remount
      window.history.replaceState({}, document.title, window.location.pathname);

      setEmail(emailParam);
      setPassword(codeParam);
      setAutoVerifying(true);
      setLoading(true);
      setError(null);

      const performAutoLogin = async () => {
        try {
          await db.auth.login(emailParam, codeParam);
          await checkAppState();
        } catch (err) {
          console.error("Auto-activation failed:", err);
          setError(err.message || 'Auto-activation failed. Please enter your credentials manually.');
          setLoading(false);
          setAutoVerifying(false);
        }
      };

      const timer = setTimeout(performAutoLogin, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (isActivationFlow && user?.nurse_id) {
      db.entities.Nurse.get(user.nurse_id).then(n => {
        if (n) {
          setDesignation(n.designation || '');
          setPhone(n.phone || '');
          setEmployeeId(n.employee_id || '');
        }
      }).catch(err => console.error("Failed to load nurse details:", err));
    }
  }, [isActivationFlow, user]);

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

  const handleActivation = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setError('Please enter and confirm your password.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Update password in Supabase Auth
      if (supabase) {
        const { error: authError } = await supabase.auth.updateUser({ password });
        if (authError) throw authError;
      }

      // 2. Update staff profile details and change status to active
      await db.entities.Nurse.update(user.nurse_id, {
        status: 'active',
        designation,
        phone,
        employee_id: employeeId
      });

      // 3. Refresh Auth session state
      await checkAppState();
      window.location.href = '/';
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to activate account.');
      setLoading(false);
    }
  };

  if (autoVerifying) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex flex-col justify-center items-center p-4 font-sans text-slate-800 animate-in fade-in duration-300">
        <div className="w-full max-w-[420px] bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col items-center gap-6">
          <img src="/logo-horizontal.png" alt="TotoAfya Digital" className="h-10 object-contain animate-pulse" />
          <div className="flex flex-col items-center gap-2 text-center mt-2">
            <h1 className="text-xl font-bold text-slate-900">Verifying Onboarding Code</h1>
            <p className="text-sm text-slate-500 max-w-[280px] leading-relaxed">
              We are verifying your invitation. You will be redirected to complete your profile in a moment...
            </p>
          </div>
          <div className="w-6 h-6 border-2 border-[#006B5F] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (isActivationFlow) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 font-sans text-slate-800 animate-in fade-in duration-300">
        <div className="w-full max-w-[420px] bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col items-center">
          
          <div className="flex flex-col items-center gap-2 mb-6">
            <img src="/logo-horizontal.png" alt="TotoAfya Digital" className="h-10 object-contain" />
            <span className="text-[10px] font-bold tracking-widest text-[#0047FF] uppercase mt-1">Account Activation</span>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">
              Welcome to TotoAfya!
            </h1>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Complete your profile and set up a secure password to activate your account.
            </p>
          </div>

          {error && (
            <div className="w-full bg-rose-50 border border-rose-100 text-rose-700 text-xs px-4 py-3 rounded-lg mb-5 flex items-start gap-2">
              <Shield className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <p className="font-semibold leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleActivation} className="w-full flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Designation / Job Title
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Clinical Officer, Nurse-in-Charge"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#0047FF] focus:bg-white transition-all text-slate-900"
                  required
                />
                <ActivityIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Contact Phone
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. +254 712 345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#0047FF] focus:bg-white transition-all text-slate-900"
                  required
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Employee / License Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. KNC-20392"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#0047FF] focus:bg-white transition-all text-slate-900"
                  required
                />
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Choose Secure Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#0047FF] focus:bg-white transition-all text-slate-900"
                  required
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#0047FF] focus:bg-white transition-all text-slate-900"
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
                <span>Activate Account</span>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 font-sans text-slate-800 animate-in fade-in duration-300">
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
