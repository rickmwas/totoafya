import React, { useState } from 'react';
import db from '@/api/totoafyaClient';
import { useAuth } from '../lib/AuthContext';
import { Shield, Lock, CreditCard, ArrowRight, UserPlus, Baby, Fingerprint, Eye, EyeOff } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';

export default function Login() {
  const { checkAppState } = useAuth();
  const { lang } = useLang();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [identifier, setIdentifier] = useState('');
  const [pin, setPin] = useState('');
  const [authType, setAuthType] = useState('national_id'); // 'national_id' | 'anc_number'
  const [showPin, setShowPin] = useState(false);
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
    <div className="min-h-screen bg-[#f7f9f7] flex flex-col justify-center items-center p-6 font-sans text-[#131714]">
      {/* Main Container */}
      <div className="w-full max-w-[400px] bg-white border border-[#e5e7eb] rounded-[36px] px-8 py-10 shadow-[0_12px_40px_rgba(0,0,0,0.04)] flex flex-col">
        
        {/* Logo and Greeting */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-8 h-8 text-toto-teal" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M50 82C50 82 20 57.5 20 37C20 25.4 29.4 16 41 16C46.8 16 50 20 50 20C50 20 53.2 16 59 16C70.6 16 80 25.4 80 37C80 57.5 50 82 50 82Z" 
                stroke="currentColor" 
                strokeWidth="6" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              <circle cx="50" cy="38" r="7" fill="currentColor" />
              <path d="M34 50C34 44 42 42 50 42C58 42 66 44 66 50" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
              <circle cx="50" cy="56" r="5" fill="currentColor" />
              <path d="M40 65C40 60 45 59 50 59C55 59 60 60 60 65" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            </svg>
            <span className="text-[22px] font-extrabold text-toto-teal tracking-tight">TotoAfya</span>
          </div>
          
          <h1 className="text-[28px] font-extrabold text-[#131714] leading-tight">
            {lang === 'sw' ? 'Karibu tena' : 'Welcome back'}
          </h1>
          <p className="text-[13.5px] text-[#6e7772] mt-1 font-medium leading-relaxed">
            {lang === 'sw' ? 'Weka maelezo yako kuendelea na safari' : 'Sign in to continue your health journey'}
          </p>
        </div>

        {error && (
          <div className="w-full bg-toto-red/5 border border-toto-red/10 text-toto-red text-xs px-4 py-3 rounded-[16px] mb-5 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-toto-red mt-0.5 flex-shrink-0" />
            <p className="font-semibold leading-relaxed">{error}</p>
          </div>
        )}

        {/* Tab Controls (Material/Apple style) */}
        <div className="flex border-b border-[#e5e7eb] w-full mb-6">
          <button
            type="button"
            onClick={() => { setAuthType('national_id'); setIdentifier(''); }}
            className={`flex-1 pb-3 text-[14px] font-bold transition-all relative ${
              authType === 'national_id' ? 'text-toto-teal' : 'text-[#6e7772] hover:text-[#131714]'
            }`}
          >
            {lang === 'sw' ? 'Kitambulisho' : 'National ID'}
            {authType === 'national_id' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-toto-teal rounded-full" />
            )}
          </button>
          <button
            type="button"
            onClick={() => { setAuthType('anc_number'); setIdentifier(''); }}
            className={`flex-1 pb-3 text-[14px] font-bold transition-all relative ${
              authType === 'anc_number' ? 'text-toto-teal' : 'text-[#6e7772] hover:text-[#131714]'
            }`}
          >
            {lang === 'sw' ? 'Namba ya ANC' : 'ANC Card'}
            {authType === 'anc_number' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-toto-teal rounded-full" />
            )}
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
          <div>
            <label className="block text-[12px] font-bold text-[#131714] mb-1.5 px-1">
              {authType === 'national_id' 
                ? (lang === 'sw' ? 'Namba ya Kitambulisho' : 'National ID Number')
                : (lang === 'sw' ? 'Namba ya ANC' : 'ANC Registration Number')
              }
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder={authType === 'national_id' ? 'e.g. 12345678' : 'e.g. ANC-2026-0041'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full h-12 px-4 rounded-[12px] bg-[#f7f9f7] border border-[#e5e7eb] text-[14px] font-medium outline-none focus:border-toto-teal focus:ring-1 focus:ring-toto-teal transition-all text-toto-black placeholder:text-[#a0aba5]/70"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5 px-1">
              <label className="text-[12px] font-bold text-[#131714]">
                {lang === 'sw' ? 'PIN ya Siri' : 'Security PIN'}
              </label>
              <button 
                type="button"
                className="text-[12px] font-bold text-toto-teal hover:underline"
                onClick={() => alert(lang === 'sw' ? 'Tafadhali wasiliana na kituo chako cha afya ili kuweka upya PIN.' : 'Please contact your health facility to reset your PIN.')}
              >
                {lang === 'sw' ? 'Umesahau?' : 'Forgot?'}
              </button>
            </div>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                maxLength={4}
                pattern="\d{4}"
                inputMode="numeric"
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full h-12 px-4 pr-10 rounded-[12px] bg-[#f7f9f7] border border-[#e5e7eb] text-[14px] font-medium tracking-widest outline-none focus:border-toto-teal focus:ring-1 focus:ring-toto-teal transition-all text-toto-black placeholder:text-[#a0aba5]/70"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-3.5 text-[#6e7772] hover:text-[#131714]"
              >
                {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-toto-teal hover:bg-toto-teal-dark active:scale-[0.98] text-white rounded-full font-bold text-[15px] shadow-[0_4px_12px_rgba(13,98,61,0.15)] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>{lang === 'sw' ? 'Ingia' : 'Sign In'}</span>
            )}
          </button>
        </form>

        {/* Social Authentication */}
        <div className="relative flex items-center justify-center my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#e5e7eb]"></div>
          </div>
          <span className="relative px-3 text-[11px] font-bold text-[#6e7772] bg-white uppercase tracking-wider">
            {lang === 'sw' ? 'au endelea na' : 'or continue with'}
          </span>
        </div>

        {/* Social Buttons row */}
        <div className="flex justify-center gap-4">
          <button 
            type="button" 
            onClick={() => selectMockRole('user')}
            className="w-12 h-12 rounded-full border border-[#e5e7eb] flex items-center justify-center hover:bg-[#f7f9f7] transition-colors"
          >
            {/* Google Logo SVG */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.62-.63-1.04-1.37-1.19-2.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          </button>
          <button 
            type="button" 
            onClick={() => selectMockRole('new_mother')}
            className="w-12 h-12 rounded-full border border-[#e5e7eb] flex items-center justify-center hover:bg-[#f7f9f7] transition-colors"
          >
            {/* Apple Logo SVG */}
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.5-.63.73-1.18 1.87-1.03 2.98 1.12.09 2.27-.58 2.98-1.42z" />
            </svg>
          </button>
          <button 
            type="button" 
            onClick={() => setShowMockDrawer(true)}
            className="w-12 h-12 rounded-full border border-[#e5e7eb] flex items-center justify-center hover:bg-[#f7f9f7] transition-colors text-toto-teal"
          >
            <Fingerprint size={20} />
          </button>
        </div>

        {/* Don't have account info */}
        <p className="text-center text-[13px] text-[#6e7772] font-semibold mt-8">
          {lang === 'sw' ? 'Huna akaunti bado? ' : "Don't have an account? "}
          <button 
            type="button"
            className="text-toto-teal hover:underline font-bold"
            onClick={() => alert(lang === 'sw' ? 'Wasiliana na kituo chako cha afya ili kuunda wasifu.' : 'Please visit your nearest health facility to register.')}
          >
            {lang === 'sw' ? 'Jisajili' : 'Sign up'}
          </button>
        </p>

      </div>

      {/* Simulated Mock Drawer */}
      {showMockDrawer && (
        <div className="fixed inset-0 bg-[#131714]/40 backdrop-blur-sm z-50 flex items-end justify-center transition-all duration-300">
          <div className="w-full max-w-[440px] bg-white rounded-t-[28px] p-6 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] max-h-[85vh] overflow-y-auto border-t border-[#e5e7eb]">
            <div className="w-12 h-1 bg-[#f7f9f7] rounded-full mx-auto mb-6" />

            <div className="mb-6 text-center">
              <div className="inline-flex items-center bg-toto-teal/5 text-toto-teal px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2">
                <span>Developer Sandbox</span>
              </div>
              <h3 className="text-lg font-bold text-toto-black">Select a Mock Profile</h3>
              <p className="text-xs text-toto-gray mt-1">Choose a role profile to simulate for this session.</p>
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
                    className="w-full text-left p-4 rounded-[20px] border border-[#e5e7eb] bg-[#f7f9f7]/30 hover:border-toto-teal hover:bg-toto-teal/5 active:scale-[0.99] transition-all flex items-start gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#e5e7eb] flex items-center justify-center text-toto-gray flex-shrink-0 mt-0.5 shadow-sm">
                      <Icon className="w-5 h-5 text-toto-teal" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[14px] font-bold text-toto-black">{m.title}</p>
                      <p className="text-xs text-toto-gray mt-0.5 leading-relaxed">{m.desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-toto-gray self-center" />
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowMockDrawer(false)}
              className="w-full h-12 bg-[#f7f9f7] hover:bg-[#e5e7eb] text-toto-gray font-bold rounded-full mt-6 text-xs active:scale-[0.98] transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
