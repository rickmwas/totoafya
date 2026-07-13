import React, { useState } from 'react';
import db from '@/api/totoafyaClient';
import { useAuth } from '../lib/AuthContext';
import { Shield, Lock, CreditCard, ArrowRight, UserPlus, Baby, Fingerprint, Eye, EyeOff, KeyRound } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';

export default function Login() {
  const { checkAppState } = useAuth();
  const { lang } = useLang();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [identifier, setIdentifier] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [activationCode, setActivationCode] = useState('');
  const [authType, setAuthType] = useState('national_id'); // 'national_id' | 'anc_number'
  const [showPin, setShowPin] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  const handleAction = async (e) => {
    e.preventDefault();
    if (!identifier) {
      setError(lang === 'sw' ? 'Tafadhali jaza nambari ya kitambulisho.' : 'Please enter your identifier.');
      return;
    }

    if (isActivating) {
      if (!activationCode || !pin || !confirmPin) {
        setError(lang === 'sw' ? 'Tafadhali jaza sehemu zote.' : 'Please fill in all activation fields.');
        return;
      }
      if (pin.trim().length !== 6) {
        setError(lang === 'sw' ? 'PIN mpya lazima iwe nambari 6.' : 'New PIN must be exactly 6 digits.');
        return;
      }
      if (pin !== confirmPin) {
        setError(lang === 'sw' ? 'PIN hazilingani.' : 'PIN codes do not match.');
        return;
      }
    } else {
      if (!pin) {
        setError(lang === 'sw' ? 'Tafadhali jaza PIN yako.' : 'Please enter your Security PIN.');
        return;
      }
      if (pin.trim().length !== 6) {
        setError(lang === 'sw' ? 'PIN lazima iwe nambari 6.' : 'PIN must be exactly 6 digits.');
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      if (isActivating) {
        // Activate mother profile by passing activation code
        await db.auth.signInWithNationalIdOrAnc(identifier, pin, activationCode);
      } else {
        // Regular sign in
        await db.auth.signInWithNationalIdOrAnc(identifier, pin);
      }
      await checkAppState();
      window.location.href = '/';
    } catch (err) {
      console.error(err);
      setError(err.message || (
        lang === 'sw' 
          ? 'Uthibitishaji umeshindwa. Tafadhali angalia nambari yako ya kitambulisho na PIN.' 
          : 'Authentication failed. Please check your inputs.'
      ));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9f7] flex flex-col justify-center items-center p-6 font-sans text-[#131714]">
      {/* Main Container */}
      <div className="w-full max-w-[400px] bg-white border border-[#e5e7eb] rounded-[36px] px-8 py-10 shadow-[0_12px_40px_rgba(0,0,0,0.04)] flex flex-col">
        
        {/* Logo and Greeting */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex items-center gap-2 mb-3 h-12">
            <img src="/logo-horizontal.png" alt="TotoAfya Digital" className="h-10 object-contain" />
          </div>
          
          <h1 className="text-[26px] font-extrabold text-[#131714] leading-tight">
            {isActivating 
              ? (lang === 'sw' ? 'Wezesha Wasifu' : 'Activate Profile')
              : (lang === 'sw' ? 'Karibu tena' : 'Welcome back')
            }
          </h1>
          <p className="text-[13px] text-[#6e7772] mt-1 font-medium leading-relaxed">
            {isActivating
              ? (lang === 'sw' ? 'Weka nambari ya kitambulisho na msimbo wa kliniki kuwezesha' : 'Enter your registered details and clinic activation code')
              : (lang === 'sw' ? 'Weka maelezo yako kuendelea na safari' : 'Sign in to continue your health journey')
            }
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
        <form onSubmit={handleAction} className="w-full flex flex-col gap-4">
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

          {isActivating && (
            <div>
              <label className="block text-[12px] font-bold text-[#131714] mb-1.5 px-1">
                {lang === 'sw' ? 'Msimbo wa Uanzishaji wa Kliniki (Nambari 6)' : 'Clinic Activation Code (6 Digits)'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 982104"
                  value={activationCode}
                  onChange={(e) => setActivationCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full h-12 px-4 rounded-[12px] bg-[#f7f9f7] border border-[#e5e7eb] text-[14px] font-semibold tracking-wider outline-none focus:border-toto-teal focus:ring-1 focus:ring-toto-teal transition-all text-toto-black placeholder:text-[#a0aba5]/70"
                />
              </div>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-1.5 px-1">
              <label className="text-[12px] font-bold text-[#131714]">
                {isActivating 
                  ? (lang === 'sw' ? 'Unda PIN mpya (Nambari 6)' : 'Create 6-digit PIN')
                  : (lang === 'sw' ? 'PIN ya Siri' : 'Security PIN')
                }
              </label>
              {!isActivating && (
                <button 
                  type="button"
                  className="text-[12px] font-bold text-toto-teal hover:underline"
                  onClick={() => alert(lang === 'sw' ? 'Tafadhali wasiliana na kituo chako cha afya ili kuweka upya PIN.' : 'Please contact your health facility to reset your PIN.')}
                >
                  {lang === 'sw' ? 'Umesahau?' : 'Forgot?'}
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                maxLength={6}
                pattern="\d{6}"
                inputMode="numeric"
                placeholder="••••••"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
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

          {isActivating && (
            <div>
              <label className="block text-[12px] font-bold text-[#131714] mb-1.5 px-1">
                {lang === 'sw' ? 'Thibitisha PIN mpya' : 'Confirm new PIN'}
              </label>
              <div className="relative">
                <input
                  type="password"
                  maxLength={6}
                  pattern="\d{6}"
                  inputMode="numeric"
                  placeholder="••••••"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full h-12 px-4 rounded-[12px] bg-[#f7f9f7] border border-[#e5e7eb] text-[14px] font-medium tracking-widest outline-none focus:border-toto-teal focus:ring-1 focus:ring-toto-teal transition-all text-toto-black placeholder:text-[#a0aba5]/70"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-toto-teal hover:bg-toto-teal-dark active:scale-[0.98] text-white rounded-full font-bold text-[15px] shadow-[0_4px_12px_rgba(13,98,61,0.15)] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>
                {isActivating 
                  ? (lang === 'sw' ? 'Wezesha Wasifu Sasa' : 'Activate Profile Now')
                  : (lang === 'sw' ? 'Ingia' : 'Sign In')
                }
              </span>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <p className="text-center text-[13px] text-[#6e7772] font-semibold mt-8">
          {isActivating ? (
            <>
              {lang === 'sw' ? 'Tayari una wasifu uliowezeshwa? ' : 'Already activated your profile? '}
              <button 
                type="button"
                className="text-toto-teal hover:underline font-bold"
                onClick={() => { setIsActivating(false); setError(null); setPin(''); }}
              >
                {lang === 'sw' ? 'Ingia hapa' : 'Sign in here'}
              </button>
            </>
          ) : (
            <>
              {lang === 'sw' ? 'Kwanza kutumia TotoAfya? ' : 'First time using TotoAfya? '}
              <button 
                type="button"
                className="text-toto-teal hover:underline font-bold"
                onClick={() => { setIsActivating(true); setError(null); setPin(''); }}
              >
                {lang === 'sw' ? 'Wezesha wasifu wako' : 'Activate your profile'}
              </button>
            </>
          )}
        </p>

      </div>
    </div>
  );
}
