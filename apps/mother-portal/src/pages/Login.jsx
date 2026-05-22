import React, { useState } from 'react';
import db from '@/api/totoafyaClient';
import { useAuth } from '@/lib/AuthContext';
import { Shield, ArrowRight, Heart, UserPlus, Baby, Activity, Building, Crown } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';

export default function Login() {
  const { checkAppState } = useAuth();
  const { lang } = useLang();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showMockDrawer, setShowMockDrawer] = useState(false);

  const isSupabase = import.meta.env.VITE_DATABASE_PROVIDER === 'supabase';

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isSupabase) {
        await db.auth.signInWithGoogle();
      } else {
        setShowMockDrawer(true);
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to initialize Google Sign-In');
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 font-sans text-slate-800">
      {/* Main Container */}
      <div className="w-full max-w-[400px] bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col items-center">

        {/* Brand Header */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-lg bg-emerald-700 flex items-center justify-center shadow-sm">
            <span className="text-white text-base font-bold">T</span>
          </div>
          <span className="text-base font-bold text-slate-900 tracking-tight">TotoAfya</span>
        </div>

        {/* Welcoming Text */}
        <div className="text-center mb-8">
          <span className="text-xs font-bold tracking-wider uppercase text-emerald-700">
            {lang === 'sw' ? 'Afya ya Mama na Mtoto' : 'Maternal & Child Health'}
          </span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-2">
            {lang === 'sw' ? 'Karibu TotoAfya' : 'Welcome to TotoAfya'}
          </h1>
          <p className="text-sm text-slate-500 mt-3 leading-relaxed">
            {lang === 'sw'
              ? 'Fuatilia chanjo, ukuaji, na pata ushauri wa afya wa haraka wakati wowote.'
              : 'Track immunizations, monitor growth, and access clinical advice anytime.'}
          </p>
        </div>

        {error && (
          <div className="w-full bg-rose-50 border border-rose-100 text-rose-700 text-xs px-4 py-3 rounded-lg mb-6 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
            <p className="font-semibold leading-relaxed">{error}</p>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full h-12 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg flex items-center justify-center gap-3 active:scale-[0.99] transition-all font-medium text-sm disabled:opacity-50 shadow-sm"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              {/* Official Google G Logo */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
              <span>{lang === 'sw' ? 'Endelea na Google' : 'Continue with Google'}</span>
            </>
          )}
        </button>

        {/* Security badge */}
        <div className="flex items-center gap-1.5 mt-6 text-slate-400 text-xs">
          <Heart className="w-4 h-4 text-rose-500" />
          <span>{lang === 'sw' ? 'Uthibitishaji salama wa Google' : 'Secure authentication via Google'}</span>
        </div>
      </div>

      {/* Simulated Mock Drawer */}
      {showMockDrawer && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end justify-center transition-all duration-300">
          <div className="w-full max-w-[440px] bg-white rounded-t-2xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto border-t border-slate-200">
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-6" />

            <div className="mb-6 text-center">
              <div className="inline-flex items-center bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold mb-2">
                <span>Developer Sandbox</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">Select a Mock Profile</h3>
              <p className="text-xs text-slate-500 mt-1">Choose a role profile to simulate for this session.</p>
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
                },
                {
                  role: 'nurse',
                  title: 'Clinic Nurse Staff',
                  desc: 'Simulates clinic nurse permissions and workflows.',
                  icon: Activity
                },
                {
                  role: 'facility_admin',
                  title: 'Facility Clinic Admin',
                  desc: 'Simulates hospital facility admin panels and coordination.',
                  icon: Building
                },
                {
                  role: 'super_admin',
                  title: 'Platform Super Admin',
                  desc: 'Simulates global infrastructure control access.',
                  icon: Crown
                }
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.role}
                    onClick={() => selectMockRole(m.role)}
                    className="w-full text-left p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-emerald-600 hover:bg-emerald-50/30 active:scale-[0.99] transition-all flex items-start gap-3"
                  >
                    <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 flex-shrink-0 mt-0.5">
                      <Icon className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">{m.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{m.desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 self-center" />
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowMockDrawer(false)}
              className="w-full h-11 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl mt-6 text-xs active:scale-[0.98] transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
