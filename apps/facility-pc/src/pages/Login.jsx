import React, { useState, useEffect } from 'react';
import db, { supabase } from '@/api/totoafyaClient';
import { useAuth } from '@/lib/AuthContext';
import { Shield, ArrowRight, Building, ShieldAlert, KeyRound, Mail, Lock, Phone, Key, Activity } from 'lucide-react';

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

  useEffect(() => {
    if (isActivationFlow && user?.nurse_id) {
      db.entities.Nurse.get(user.nurse_id).then(n => {
        if (n) {
          setDesignation(n.designation || '');
          setPhone(n.phone || '');
          setEmployeeId(n.employee_id || '');
        }
      }).catch(err => console.error("Failed to load admin profile details:", err));
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

      // 2. Update admin profile details and change status to active
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

  if (isActivationFlow) {
    return (
      <div className="min-h-screen bg-slate-955 flex flex-col justify-center items-center p-4 font-sans text-slate-100 animate-in fade-in duration-300">
        <div className="w-full max-w-[420px] bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center">
          
          <div className="flex items-center gap-2.5 mb-6 text-slate-400">
            <Building className="w-5 h-5 text-indigo-500" />
            <span className="text-xs font-semibold tracking-wider uppercase">Account Activation</span>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Welcome Admin!
            </h1>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              Complete your facility admin profile details and set up your password to activate this account.
            </p>
          </div>

          {error && (
            <div className="w-full bg-rose-950/40 border border-rose-800 text-rose-300 text-xs px-4 py-3 rounded-lg mb-5 flex items-start gap-2">
              <Shield className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <p className="font-semibold leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleActivation} className="w-full flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Designation / Job Title
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Chief Administrator, Facility Director"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-800 border border-slate-700 text-sm focus:outline-none focus:border-indigo-500 focus:bg-slate-800/80 transition-all text-slate-100"
                  required
                />
                <Activity className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Contact Phone
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. +254 712 345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-800 border border-slate-700 text-sm focus:outline-none focus:border-indigo-500 focus:bg-slate-800/80 transition-all text-slate-100"
                  required
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Employee / License Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. ADM-10292"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-800 border border-slate-700 text-sm focus:outline-none focus:border-indigo-500 focus:bg-slate-800/80 transition-all text-slate-100"
                  required
                />
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Choose Secure Password
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

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-800 border border-slate-700 text-sm focus:outline-none focus:border-indigo-500 focus:bg-slate-800/80 transition-all text-slate-100"
                  required
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white rounded-xl font-bold text-sm shadow transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
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
    <div className="min-h-screen bg-slate-955 flex flex-col justify-center items-center p-4 font-sans text-slate-100 animate-in fade-in duration-300">
      {/* Main Card */}
      <div className="w-full max-w-[400px] bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center">
        
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 mb-6 text-slate-400">
          <Building className="w-5 h-5 text-indigo-500" />
          <span className="text-xs font-semibold tracking-wider uppercase">TotoAfya Facility Portal</span>
        </div>

        {/* Header Text */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Clinic PC Login
          </h1>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            Authorized administrative dashboard for scheduling, staff coordination, and facility auditing.
          </p>
        </div>

        {error && (
          <div className="w-full bg-rose-950/40 border border-rose-800 text-rose-300 text-xs px-4 py-3 rounded-lg mb-5 flex items-start gap-2">
            <Shield className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <p className="font-semibold leading-relaxed">{error}</p>
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="w-full flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Admin Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="admin@facility.org"
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
              Password
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
              <span>Verify & Login</span>
            )}
          </button>
        </form>

        {/* Security / Admin warning */}
        <p className="text-xs text-slate-500 mt-6 text-center leading-relaxed">
          Authorized administrative access only. Activity is monitored and audited.
        </p>
      </div>
    </div>
  );
}
