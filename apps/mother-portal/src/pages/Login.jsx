import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, CreditCard, ArrowRight, UserPlus, Baby, Fingerprint, Eye, EyeOff, Sparkles } from 'lucide-react';
import { dataClient } from '@totoafya/api-client';
import { Button, Input, Badge } from '@totoafya/shared-ui';
import { useAuth } from '../lib/AuthContext';
import { useLang } from '@/context/LanguageContext';

export default function Login() {
  const navigate = useNavigate();
  const { checkAppState } = useAuth();
  const { lang, setLang } = useLang();
  const isSw = lang === 'sw';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [identifier, setIdentifier] = useState('28475920'); // Default demo: Amina Mwangi
  const [pin, setPin] = useState('123456');
  const [confirmPin, setConfirmPin] = useState('');
  const [activationCode, setActivationCode] = useState('');
  const [authType, setAuthType] = useState('national_id'); // 'national_id' | 'anc_number'
  const [showPin, setShowPin] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  const isMockMode = dataClient.mode === 'mock';

  const handleAction = async (e) => {
    if (e) e.preventDefault();
    if (!identifier) {
      setError(isSw ? 'Tafadhali jaza nambari ya kitambulisho au kadi ya ANC.' : 'Please enter your National ID or ANC number.');
      return;
    }

    if (isActivating) {
      if (!activationCode || !pin || !confirmPin) {
        setError(isSw ? 'Tafadhali jaza sehemu zote.' : 'Please fill in all activation fields.');
        return;
      }
      if (pin.trim().length < 4) {
        setError(isSw ? 'PIN lazima iwe angalau tarakimu 4.' : 'PIN must be at least 4 digits.');
        return;
      }
      if (pin !== confirmPin) {
        setError(isSw ? 'PIN hazilingani.' : 'PIN codes do not match.');
        return;
      }
    } else {
      if (!pin) {
        setError(isSw ? 'Tafadhali jaza PIN yako.' : 'Please enter your Security PIN.');
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      if (isActivating) {
        await dataClient.auth.signInWithNationalIdOrAnc(identifier, pin, activationCode);
      } else {
        await dataClient.auth.signInWithNationalIdOrAnc(identifier, pin);
      }

      if (checkAppState) await checkAppState();
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.message ||
          (isSw
            ? 'Uthibitishaji umeshindwa. Tafadhali angalia kitambulisho na PIN yako.'
            : 'Authentication failed. Please verify your ID and PIN.')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (idNum, name) => {
    setIdentifier(idNum);
    setPin('123456');
    setLoading(true);
    setError(null);
    try {
      await dataClient.auth.signInWithNationalIdOrAnc(idNum, '123456');
      if (checkAppState) await checkAppState();
      navigate('/', { replace: true });
    } catch (err) {
      setError(`Failed to login as ${name}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 font-sans text-slate-900">
      <div className="w-full max-w-[420px] bg-white border border-slate-200/80 rounded-[32px] p-6 sm:p-8 shadow-xl flex flex-col">
        {/* Header with Language toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#006B5F] to-[#0A2E2B] flex items-center justify-center text-white font-serif font-black text-lg shadow-sm">
              T
            </div>
            <span className="text-base font-extrabold text-[#006B5F] tracking-tight">TotoAfya</span>
          </div>

          <button
            type="button"
            onClick={() => setLang(isSw ? 'en' : 'sw')}
            className="px-2.5 py-1 rounded-full text-xs font-bold border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            {isSw ? '🇰🇪 SW' : '🇬🇧 EN'}
          </button>
        </div>

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">
            {isActivating
              ? isSw ? 'Wezesha Wasifu Wako' : 'Activate Maternal Profile'
              : isSw ? 'Karibu Tena Mama' : 'Welcome Back'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isActivating
              ? isSw ? 'Ingiza msimbo wa kliniki kuwezesha rekodi zako' : 'Enter your clinical activation code to sync hospital records'
              : isSw ? 'Ingia kufuatilia afya ya uzazi na chanjo za mtoto' : 'Sign in to access your maternal records and KEPI vaccine schedules'}
          </p>
        </div>

        {/* Quick Test Logins in Demo/Mock Mode */}
        {isMockMode && (
          <div className="mb-6 p-3.5 bg-teal-50/70 border border-teal-200 rounded-2xl">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#006B5F] mb-2">
              <Sparkles size={14} />
              <span>{isSw ? 'Kuingia kwa Majaribio (Bofya Moja):' : 'Demo Fast-Login (1-Click):'}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('28475920', 'Amina Mwangi')}
                className="px-3 py-2 bg-white hover:bg-teal-100/50 border border-teal-200 rounded-xl text-left transition-colors text-xs"
              >
                <div className="font-bold text-slate-900 truncate">Amina Mwangi</div>
                <div className="text-[10px] text-slate-500">ID: 28475920 • Pumwani</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('31908472', 'Faith Wanjiku')}
                className="px-3 py-2 bg-white hover:bg-teal-100/50 border border-teal-200 rounded-xl text-left transition-colors text-xs"
              >
                <div className="font-bold text-slate-900 truncate">Faith Wanjiku</div>
                <div className="text-[10px] text-slate-500">ID: 31908472 • KNH</div>
              </button>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
            <Shield size={16} className="shrink-0 mt-0.5 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Type Switcher */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl mb-4">
          <button
            type="button"
            onClick={() => setAuthType('national_id')}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              authType === 'national_id'
                ? 'bg-white text-[#006B5F] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isSw ? 'Kitambulisho (National ID)' : 'National ID'}
          </button>
          <button
            type="button"
            onClick={() => setAuthType('anc_number')}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              authType === 'anc_number'
                ? 'bg-white text-[#006B5F] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isSw ? 'Nambari ya Kadi ya ANC' : 'ANC Clinic Card'}
          </button>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleAction} className="space-y-4">
          <Input
            label={authType === 'national_id' ? (isSw ? 'Nambari ya Kitambulisho' : 'National ID Number') : (isSw ? 'Nambari ya Kadi ya ANC' : 'ANC Card Number')}
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder={authType === 'national_id' ? '28475920' : 'ANC-PMH-2026-0042'}
            required
            leftIcon={<Fingerprint size={18} className="text-slate-400" />}
          />

          {isActivating && (
            <Input
              label={isSw ? 'Msimbo wa Kliniki (MOH Code)' : 'Hospital Activation Code'}
              type="text"
              value={activationCode}
              onChange={(e) => setActivationCode(e.target.value)}
              placeholder="PMH-7749"
              required
              helperText={isSw ? 'Imechapishwa kwenye kadi yako ya kliniki' : 'Found on your hospital clinic appointment card'}
            />
          )}

          <div>
            <Input
              label={isActivating ? (isSw ? 'Unda PIN Mpya ya Tarakimu 6' : 'Create 6-Digit PIN') : (isSw ? 'PIN ya Siri' : 'Security PIN')}
              type={showPin ? 'text' : 'password'}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••••"
              maxLength={6}
              required
              leftIcon={<Lock size={18} className="text-slate-400" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
          </div>

          {isActivating && (
            <Input
              label={isSw ? 'Thibitisha PIN Mpya' : 'Confirm New PIN'}
              type={showPin ? 'text' : 'password'}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              placeholder="••••••"
              maxLength={6}
              required
              leftIcon={<Lock size={18} className="text-slate-400" />}
            />
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            disabled={loading}
          >
            <span>
              {loading
                ? isSw ? 'Inaingia...' : 'Signing in...'
                : isActivating
                ? isSw ? 'Kamilisha Uanzishaji' : 'Complete Activation'
                : isSw ? 'Ingia Kwenye Wasifu' : 'Sign In'}
            </span>
            <ArrowRight size={16} />
          </Button>
        </form>

        {/* Toggle between activation & normal login */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-2 text-center text-xs">
          <button
            type="button"
            onClick={() => {
              setIsActivating(!isActivating);
              setError(null);
            }}
            className="font-bold text-[#006B5F] hover:underline"
          >
            {isActivating
              ? isSw ? 'Una akaunti tayari? Ingia hapa' : 'Already activated? Sign in here'
              : isSw ? 'Je, una kadi mpya ya kliniki? Wezesha hapa' : 'First time with clinic card? Activate here'}
          </button>

          <Link to="/onboarding" className="text-slate-500 hover:text-slate-700">
            {isSw ? 'Huna kadi ya kliniki? Jisajili kama mama mpya' : 'New mother without clinic card? Register online'}
          </Link>
        </div>
      </div>
    </div>
  );
}
