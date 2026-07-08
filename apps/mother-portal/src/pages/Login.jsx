import React, { useState } from 'react';
import db from '@/api/totoafyaClient';
import { useAuth } from '@/lib/AuthContext';
import { Shield, Lock, CreditCard, Activity, ArrowRight, UserPlus, Baby } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';

export default function Login() {
  const { checkAppState } = useAuth();
  const { lang } = useLang();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [identifier, setIdentifier] = useState('');
  const [pin, setPin] = useState('');
  const [authType, setAuthType] = useState('national_id'); // 'national_id' | 'anc_number'
  const [showMockDrawer, setShowMockDrawer] = useState(false);

  const isSupabase = import.meta.env.VITE_DATABASE_PROVIDER === 'supabase';

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!identifier || !pin) {
      setError(lang === 'sw' ? 'Tafadhali jaza nambari na PIN yako.' : 'Please enter your ID and PIN.');
      return;
    }
    if (pin.trim().length !== 4) {
      setError(lang === 'sw' ? 'PIN lazima iwe nambari 4.' : 'PIN must be exactly 4 digits.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isSupabase) {
        await db.auth.signInWithNationalIdOrAnc(identifier, pin);
      } else {
        // Mock Login
        await db.auth.signInWithNationalIdOrAnc(identifier, pin);
      }
      await checkAppState();
      window.location.href = '/';
    } catch (err) {
      console.error(err);
      setError(
        lang === 'sw' 
          ? 'Uthibitishaji umeshindwa. Tafadhali angalia nambari yako ya kitambulisho na PIN.' 
          : 'Authentication failed. Please check your identifier and PIN.'
      );
      setLoading(false);
    }
  };

  const selectMockRole = async (role) => {
    setLoading(true);
    setShowMockDrawer(false);
    try {
      if (role === 'new_mother') {
        localStorage.setItem('active_mock_role', 'user');
        localStorage.removeItem('custom_mock_user');
        localStorage.setItem('is_logged_in', 'true');
      } else if (role === 'user') {
        const customUser = {
          id: 'mock-user',
          email: 'mother-a@local.app',
          full_name: 'Mother A',
          role: 'user',
          facility_id: 'fac-a-id',
          profile_complete: true,
          mother_id: 'mother-a-id'
        };
        localStorage.setItem('custom_mock_user', JSON.stringify(customUser));
        localStorage.setItem('active_mock_role', 'user');
        localStorage.setItem('is_logged_in', 'true');
      } else {
        await db.auth.signInWithGoogle(role);
      }
      await checkAppState();
      window.location.href = '/';
    } catch (err) {
      setError(err.message || 'Mock login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-toto-surface flex flex-col justify-center items-center p-4 font-sans text-toto-gray">
      {/* Main Container */}
      <div className="w-full max-w-[400px] bg-white border border-toto-surface/60 rounded-[28px] p-8 shadow-card flex flex-col items-center">
        
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-10 h-10 rounded-[14px] bg-toto-teal flex items-center justify-center shadow-teal-glow-sm">
            <span className="text-white text-lg font-bold" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>T</span>
          </div>
          <span className="text-lg font-bold text-toto-black tracking-tight">TotoAfya</span>
        </div>

        {/* Welcoming Text */}
        <div className="text-center mb-6">
          <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-toto-teal">
            {lang === 'sw' ? 'Msaidizi wa Afya ya Uzazi' : 'Maternal Health Assistant'}
          </span>
          <h1 className="text-[26px] font-bold text-toto-black tracking-tight mt-1.5" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
            {lang === 'sw' ? 'Karibu Kwenye Portal' : 'Welcome to the Portal'}
          </h1>
        </div>

        {error && (
          <div className="w-full bg-toto-red/5 border border-toto-red/20 text-toto-red text-xs px-4 py-3.5 rounded-[16px] mb-5 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-toto-red mt-0.5 flex-shrink-0" />
            <p className="font-semibold leading-relaxed">{error}</p>
          </div>
        )}

        {/* Auth Type Selector */}
        <div className="flex bg-toto-surface p-1 rounded-[16px] w-full mb-6 border border-toto-surface">
          <button
            type="button"
            onClick={() => { setAuthType('national_id'); setIdentifier(''); }}
            className={`flex-1 py-3 text-xs font-bold rounded-[12px] transition-all ${
              authType === 'national_id' ? 'bg-white text-toto-black shadow-sm' : 'text-toto-light hover:text-toto-gray'
            }`}
            style={{ minHeight: '40px' }}
          >
            {lang === 'sw' ? 'Kitambulisho (National ID)' : 'National ID'}
          </button>
          <button
            type="button"
            onClick={() => { setAuthType('anc_number'); setIdentifier(''); }}
            className={`flex-1 py-3 text-xs font-bold rounded-[12px] transition-all ${
              authType === 'anc_number' ? 'bg-white text-toto-black shadow-sm' : 'text-toto-light hover:text-toto-gray'
            }`}
            style={{ minHeight: '40px' }}
          >
            {lang === 'sw' ? 'Namba ya ANC' : 'ANC Card Number'}
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
          <div>
            <label className="block text-[10px] font-bold text-toto-light uppercase tracking-[0.15em] mb-2">
              {authType === 'national_id' 
                ? (lang === 'sw' ? 'Namba ya Kitambulisho' : 'National ID Number')
                : (lang === 'sw' ? 'Namba ya Kadi ya ANC' : 'ANC Registration Number')
              }
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder={authType === 'national_id' ? 'e.g. 12345678' : 'e.g. ANC-2026-0041'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full h-14 pl-12 pr-4 rounded-[16px] bg-white border border-toto-surface text-[15px] font-medium outline-none focus:border-toto-teal focus:ring-1 focus:ring-toto-teal transition-all text-toto-black shadow-sm"
              />
              <CreditCard className="w-4 h-4 text-toto-light absolute left-4 top-5" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-toto-light uppercase tracking-[0.15em] mb-2">
              {lang === 'sw' ? 'PIN ya Siri (Nambari 4)' : 'Security PIN (4 Digits)'}
            </label>
            <div className="relative">
              <input
                type="password"
                maxLength={4}
                pattern="\d{4}"
                inputMode="numeric"
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full h-14 pl-12 pr-4 rounded-[16px] bg-white border border-toto-surface text-[15px] font-medium tracking-widest outline-none focus:border-toto-teal focus:ring-1 focus:ring-toto-teal transition-all text-toto-black shadow-sm"
              />
              <Lock className="w-4 h-4 text-toto-light absolute left-4 top-5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-toto-teal hover:bg-toto-teal-dark active:scale-[0.98] text-white rounded-full font-bold text-[15px] shadow-teal-glow transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>{lang === 'sw' ? 'Ingia Sasa' : 'Verify & Login'}</span>
            )}
          </button>
        </form>

        {/* Sandbox Access Toggle */}
        {!isSupabase && (
          <button
            onClick={() => setShowMockDrawer(true)}
            className="text-xs text-toto-light hover:text-toto-teal mt-6 underline transition-colors"
          >
            Open Developer Sandbox
          </button>
        )}
      </div>

      {/* Simulated Mock Drawer */}
      {showMockDrawer && (
        <div className="fixed inset-0 bg-toto-black/40 backdrop-blur-sm z-50 flex items-end justify-center transition-all duration-300">
          <div className="w-full max-w-[440px] bg-white rounded-t-[28px] p-6 shadow-float max-h-[85vh] overflow-y-auto border-t border-toto-surface">
            <div className="w-12 h-1 bg-toto-surface rounded-full mx-auto mb-6" />

            <div className="mb-6 text-center">
              <div className="inline-flex items-center bg-toto-teal/5 text-toto-teal px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2">
                <span>Developer Sandbox</span>
              </div>
              <h3 className="text-lg font-bold text-toto-black" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>Select a Mock Profile</h3>
              <p className="text-xs text-toto-light mt-1">Choose a role profile to simulate for this session.</p>
            </div>

            <div className="flex flex-col gap-3">
              {[
                {
                  role: 'new_mother',
                  title: 'New Mother (Incomplete Profile)',
                  desc: 'Triggers the step-by-step onboarding walkthrough.',
                  icon: UserPlus
                },
                {
                  role: 'user',
                  title: 'Registered Mother (Complete Profile)',
                  desc: 'Logs in directly to the patient immunization dashboard.',
                  icon: Baby
                }
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.role}
                    onClick={() => selectMockRole(m.role)}
                    className="w-full text-left p-4 rounded-[20px] border border-toto-surface bg-toto-surface/30 hover:border-toto-teal hover:bg-toto-teal/5 active:scale-[0.99] transition-all flex items-start gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white border border-toto-surface flex items-center justify-center text-toto-gray flex-shrink-0 mt-0.5 shadow-sm">
                      <Icon className="w-5 h-5 text-toto-teal" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[14px] font-bold text-toto-black">{m.title}</p>
                      <p className="text-xs text-toto-light mt-0.5 leading-relaxed">{m.desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-toto-light self-center" />
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowMockDrawer(false)}
              className="w-full h-12 bg-toto-surface hover:bg-toto-surface/80 text-toto-gray font-bold rounded-full mt-6 text-xs active:scale-[0.98] transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
