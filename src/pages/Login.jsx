import React, { useState } from 'react';
import db from '@/api/totoafyaClient';
import { useAuth } from '@/lib/AuthContext';
import { useLang } from '@/context/LanguageContext';
import { 
  Shield, Lock, CreditCard, ArrowRight, Baby, Stethoscope, 
  Building2, Crown, Zap, Mail, Eye, EyeOff, CheckCircle2 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { checkAppState } = useAuth();
  const { lang } = useLang();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('caregiver'); // 'caregiver' | 'staff'
  const [identifier, setIdentifier] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successRole, setSuccessRole] = useState(null);

  // Quick 1-click login for local development
  const handleQuickLogin = async (roleKey, targetPath) => {
    setLoading(true);
    setError(null);
    try {
      if (db.auth.quickLogin) {
        db.auth.quickLogin(roleKey);
      } else {
        await db.auth.login(
          roleKey === 'nurse' ? 'nurse-a@facility.org' :
          roleKey === 'facility_admin' ? 'admin@facility.org' :
          roleKey === 'super_admin' ? 'cto@terraseptsolutions.com' : 'mother-a@local.app',
          'demo123'
        );
      }
      setSuccessRole(roleKey);
      await checkAppState();
      setTimeout(() => {
        navigate(targetPath, { replace: true });
      }, 300);
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Quick login failed');
      setLoading(false);
    }
  };

  // Mother / Caregiver sign-in
  const handleCaregiverLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const idToUse = identifier.trim() || '12345678';
      const pinToUse = pin.trim() || '123456';
      await db.auth.signInWithNationalIdOrAnc(idToUse, pinToUse);
      await checkAppState();
      navigate('/', { replace: true });
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Caregiver login failed.');
      setLoading(false);
    }
  };

  // Staff (Nurse / Facility Admin / Super Admin) sign-in
  const handleStaffLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const emailToUse = email.trim() || 'nurse-a@facility.org';
      const user = await db.auth.login(emailToUse, password || 'password');
      await checkAppState();
      
      if (user?.role === 'nurse') {
        navigate('/nurse', { replace: true });
      } else if (user?.role === 'facility_admin' || user?.role === 'admin') {
        navigate('/facility', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Staff login failed.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col justify-center items-center p-4 sm:p-6 font-sans text-[#0A0A0A]">
      <div className="w-full max-w-[440px] flex flex-col gap-4">
        
        {/* Local Dev Fast-Access Card */}
        <div className="bg-gradient-to-br from-[#103E33] to-[#1B6B5A] text-white p-5 rounded-[26px] shadow-lg border border-teal-800/40">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
              <Zap size={14} className="fill-emerald-300 text-emerald-300" />
              Local Development — Auth Disabled
            </span>
          </div>
          <p className="text-[12px] text-teal-100/90 mb-3.5 leading-snug">
            Auth barriers are disabled for local testing. Click any role below for instant 1-click access:
          </p>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('user', '/')}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2.5 bg-white/10 hover:bg-white/20 active:scale-[0.98] rounded-xl text-left text-xs font-bold transition-all border border-white/10"
            >
              <Baby size={16} className="text-amber-300 shrink-0" />
              <div>
                <p className="leading-tight">Mother Portal</p>
                <p className="text-[10px] text-teal-200 font-normal">Caregiver (Home)</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('nurse', '/nurse')}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2.5 bg-white/10 hover:bg-white/20 active:scale-[0.98] rounded-xl text-left text-xs font-bold transition-all border border-white/10"
            >
              <Stethoscope size={16} className="text-teal-300 shrink-0" />
              <div>
                <p className="leading-tight">Nurse Portal</p>
                <p className="text-[10px] text-teal-200 font-normal">Clinical (/nurse)</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('facility_admin', '/facility')}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2.5 bg-white/10 hover:bg-white/20 active:scale-[0.98] rounded-xl text-left text-xs font-bold transition-all border border-white/10"
            >
              <Building2 size={16} className="text-sky-300 shrink-0" />
              <div>
                <p className="leading-tight">Facility Admin</p>
                <p className="text-[10px] text-teal-200 font-normal">Dashboard (/facility)</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('super_admin', '/')}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2.5 bg-white/10 hover:bg-white/20 active:scale-[0.98] rounded-xl text-left text-xs font-bold transition-all border border-white/10"
            >
              <Crown size={16} className="text-yellow-300 shrink-0" />
              <div>
                <p className="leading-tight">Super Admin</p>
                <p className="text-[10px] text-teal-200 font-normal">Global Access</p>
              </div>
            </button>
          </div>
        </div>

        {/* Main Login Container */}
        <div className="bg-white border border-[#E5E5E5] rounded-[32px] p-7 sm:p-8 shadow-sm flex flex-col">
          
          {/* Logo & Greeting */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 rounded-[18px] bg-[#1B6B5A] flex items-center justify-center shadow-[0_6px_20px_rgba(27,107,90,0.25)] mb-3">
              <span className="text-white text-2xl font-bold font-serif">T</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#0A0A0A] tracking-tight">
              TotoAfya Digital
            </h1>
            <p className="text-xs text-[#555555] mt-1 font-medium">
              {lang === 'sw' ? 'Mfumo wa Afya ya Mama na Mtoto' : 'Maternal & Child Health Care Platform'}
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex bg-[#F7F5F0] p-1 rounded-2xl mb-5">
            <button
              type="button"
              onClick={() => { setActiveTab('caregiver'); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'caregiver'
                  ? 'bg-white text-[#1B6B5A] shadow-sm'
                  : 'text-[#666666] hover:text-[#0A0A0A]'
              }`}
            >
              👩 {lang === 'sw' ? 'Mzazi / Mama' : 'Caregiver'}
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('staff'); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'staff'
                  ? 'bg-white text-[#1B6B5A] shadow-sm'
                  : 'text-[#666666] hover:text-[#0A0A0A]'
              }`}
            >
              🩺 {lang === 'sw' ? 'Wafanyikazi' : 'Staff / Clinic'}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3.5 py-2.5 rounded-xl mb-4 flex items-center gap-2">
              <Shield size={14} className="shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {successRole && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3.5 py-2.5 rounded-xl mb-4 flex items-center gap-2">
              <CheckCircle2 size={14} className="shrink-0 text-emerald-600" />
              <span>Logged in as <b>{successRole}</b>. Redirecting...</span>
            </div>
          )}

          {/* Form 1: Caregiver Login */}
          {activeTab === 'caregiver' && (
            <form onSubmit={handleCaregiverLogin} className="flex flex-col gap-3.5">
              <div>
                <label className="block text-[11px] font-bold text-[#555555] uppercase tracking-wider mb-1.5 px-1">
                  {lang === 'sw' ? 'Kitambulisho au Namba ya ANC' : 'National ID or ANC Number'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. 12345678 or ANC-2026-001"
                    className="w-full h-12 px-4 rounded-xl bg-[#F7F5F0] border border-[#E5E5E5] text-sm font-medium outline-none focus:border-[#1B6B5A] focus:bg-white transition-all text-[#0A0A0A]"
                  />
                  <CreditCard className="w-4 h-4 text-gray-400 absolute right-3.5 top-4" />
                </div>
                <p className="text-[10px] text-emerald-700 mt-1 px-1">
                  💡 Local hint: Enter any ID (default: <code>12345678</code>)
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#555555] uppercase tracking-wider mb-1.5 px-1">
                  {lang === 'sw' ? 'PIN ya Siri (Nambari 6)' : 'Security PIN (6 Digits)'}
                </label>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="123456"
                    className="w-full h-12 px-4 rounded-xl bg-[#F7F5F0] border border-[#E5E5E5] text-sm font-medium tracking-widest outline-none focus:border-[#1B6B5A] focus:bg-white transition-all text-[#0A0A0A]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3.5 top-4 text-gray-400 hover:text-gray-600"
                  >
                    {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-[10px] text-emerald-700 mt-1 px-1">
                  💡 Local hint: Enter any 6-digit PIN (default: <code>123456</code>)
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#1B6B5A] hover:bg-[#155447] active:scale-[0.99] text-white rounded-full font-bold text-sm shadow-[0_4px_16px_rgba(27,107,90,0.25)] transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{lang === 'sw' ? 'Ingia Kama Mzazi' : 'Sign In as Caregiver'}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Form 2: Staff Login */}
          {activeTab === 'staff' && (
            <form onSubmit={handleStaffLogin} className="flex flex-col gap-3.5">
              <div>
                <label className="block text-[11px] font-bold text-[#555555] uppercase tracking-wider mb-1.5 px-1">
                  Staff Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nurse-a@facility.org"
                    className="w-full h-12 px-4 rounded-xl bg-[#F7F5F0] border border-[#E5E5E5] text-sm font-medium outline-none focus:border-[#1B6B5A] focus:bg-white transition-all text-[#0A0A0A]"
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute right-3.5 top-4" />
                </div>
                <p className="text-[10px] text-emerald-700 mt-1 px-1">
                  💡 Hint: <code>nurse-a@facility.org</code> or <code>admin@facility.org</code>
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#555555] uppercase tracking-wider mb-1.5 px-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-12 px-4 rounded-xl bg-[#F7F5F0] border border-[#E5E5E5] text-sm font-medium outline-none focus:border-[#1B6B5A] focus:bg-white transition-all text-[#0A0A0A]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-4 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-[10px] text-emerald-700 mt-1 px-1">
                  💡 Local mode accepts any password.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#0F4C81] hover:bg-[#0c3c66] active:scale-[0.99] text-white rounded-full font-bold text-sm shadow-[0_4px_16px_rgba(15,76,129,0.25)] transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Verify & Login Staff</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Bypass Action */}
          <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Skip authentication:</span>
            <button
              type="button"
              onClick={() => handleQuickLogin('user', '/')}
              className="text-[#1B6B5A] font-bold hover:underline"
            >
              ⚡ Enter App Directly
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

