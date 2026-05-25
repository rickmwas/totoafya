import React, { useState } from 'react';
import { CreditCard, Check, Sparkles, AlertTriangle, ShieldAlert, Loader2, ArrowRight } from 'lucide-react';
import db from '@/api/totoafyaClient';

export default function B2CPaywall({ user, onPaid, lang = 'en' }) {
  const [selectedPlan, setSelectedPlan] = useState('monthly'); // 'monthly' | 'yearly'
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState('select'); // 'select' | 'sending' | 'pin_sent' | 'success'
  const [error, setError] = useState(null);

  const price = selectedPlan === 'monthly' ? 150 : 1000;
  const planLabel = selectedPlan === 'monthly' 
    ? (lang === 'sw' ? 'kila mwezi' : 'monthly')
    : (lang === 'sw' ? 'kila mwaka' : 'yearly');

  const initiatePayment = async (e) => {
    e.preventDefault();
    if (!phone.match(/^(?:\+254|0)?(7|1)\d{8}$/)) {
      setError(lang === 'sw' ? 'Tafadhali weka nambari halali ya M-Pesa' : 'Please enter a valid Safaricom M-Pesa number');
      return;
    }

    setError(null);
    setStep('sending');

    // Simulate STK Push sending
    setTimeout(() => {
      setStep('pin_sent');
    }, 1500);
  };

  const confirmPayment = async () => {
    setStep('sending');
    try {
      // Find and update mother record
      const mothersStore = JSON.parse(localStorage.getItem('db_Mother') || '[]');
      const motherIdx = mothersStore.findIndex(m => m.user_id === user.id || m.id === user.mother_id);
      
      if (motherIdx !== -1) {
        mothersStore[motherIdx].subscription_status = 'active';
        // Compute expiration date
        const expDate = new Date();
        if (selectedPlan === 'monthly') {
          expDate.setMonth(expDate.getMonth() + 1);
        } else {
          expDate.setFullYear(expDate.getFullYear() + 1);
        }
        mothersStore[motherIdx].subscription_expires_at = expDate.toISOString();
        localStorage.setItem('db_Mother', JSON.stringify(mothersStore));
      }

      setStep('success');
      setTimeout(() => {
        if (onPaid) onPaid();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Payment simulation failed');
      setStep('select');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col justify-center items-center p-4 font-sans text-slate-800">
      <div className="w-full max-w-[420px] bg-white border border-slate-200 rounded-[32px] p-6 shadow-xl flex flex-col overflow-hidden relative">
        <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-700/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-44 h-44 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {step === 'select' && (
          <>
            {/* Header */}
            <div className="text-center mb-6 mt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-800 text-[11px] font-bold uppercase tracking-wider mb-3">
                <ShieldAlert size={12} />
                <span>{lang === 'sw' ? 'Muda wa Majaribio Umekwisha' : 'Trial Period Expired'}</span>
              </div>
              <h2 className="text-[26px] font-bold text-slate-900 tracking-tight leading-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                {lang === 'sw' ? 'Endelea Kumlinda Mwanao' : 'Keep Your Child Protected'}
              </h2>
              <p className="text-[13px] text-slate-500 mt-2 leading-relaxed">
                {lang === 'sw' 
                  ? 'Kipindi chako cha majaribio cha siku 30 kimeisha. Lipia ili uendelee kupata ushauri wa AI, ratiba ya chanjo na ufuatiliaji wa afya.'
                  : 'Your 30-day grace trial has expired. Subscribe to continue receiving custom health alerts, smart vaccination schedules, and AI consultations.'}
              </p>
            </div>

            {/* Benefits */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-6">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                {lang === 'sw' ? 'FAIDA ZA PREMIUM' : 'PREMIUM BENEFITS'}
              </p>
              <ul className="space-y-2.5">
                {[
                  lang === 'sw' ? 'Ushauri wa AI saa 24/7' : '24/7 Maternal AI Health Assistant',
                  lang === 'sw' ? 'Ufuatiliaji wa uzito na urefu wa mtoto' : 'WHO Smart Growth Tracking & Charts',
                  lang === 'sw' ? 'Vikumbusho vya chanjo kwa njia ya SMS' : 'Automatic Vaccine Reminders via SMS & Push',
                ].map((b, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                    <div className="w-4 h-4 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={10} className="text-emerald-700" strokeWidth={3} />
                    </div>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Plan Selector */}
            <div className="flex gap-3 mb-6">
              <button
                type="button"
                onClick={() => setSelectedPlan('monthly')}
                className={`flex-1 p-4 rounded-2xl border text-left transition-all ${
                  selectedPlan === 'monthly' 
                    ? 'border-emerald-700 bg-emerald-50/20 shadow-sm' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  {lang === 'sw' ? 'Kila Mwezi' : 'Monthly Plan'}
                </p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-[20px] font-extrabold text-slate-900">KES 150</span>
                  <span className="text-[11px] text-slate-500">/{lang === 'sw' ? 'mwezi' : 'mo'}</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setSelectedPlan('yearly')}
                className={`flex-1 p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
                  selectedPlan === 'yearly' 
                    ? 'border-emerald-700 bg-emerald-50/20 shadow-sm' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="absolute top-0 right-0 bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-bl-lg">
                  SAVE 45%
                </div>
                <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  {lang === 'sw' ? 'Kila Mwaka' : 'Annual Plan'}
                </p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-[20px] font-extrabold text-slate-900">KES 1,000</span>
                  <span className="text-[11px] text-slate-500">/{lang === 'sw' ? 'mwaka' : 'yr'}</span>
                </div>
              </button>
            </div>

            {/* M-Pesa payment form */}
            <form onSubmit={initiatePayment} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
                  {lang === 'sw' ? 'NAMBARI YA SIMU YA M-PESA' : 'SAFARICOM M-PESA NUMBER'}
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="e.g. 0712345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-[52px] pl-4 pr-12 rounded-[16px] bg-slate-50 border border-slate-200 text-[14px] font-semibold focus:outline-none focus:border-emerald-700 focus:bg-white transition-all text-slate-900"
                  />
                  <div className="absolute right-4 top-3.5 flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-700 tracking-wider">LIPA NA M-PESA</span>
                  </div>
                </div>
                {error && <p className="text-rose-600 text-xs mt-1.5 px-1 font-medium">{error}</p>}
              </div>

              <button
                type="submit"
                className="w-full h-13 bg-emerald-700 hover:bg-emerald-600 active:scale-[0.99] text-white rounded-2xl font-bold text-[14px] shadow-sm transition-all flex items-center justify-center gap-2 mt-2"
              >
                <span>{lang === 'sw' ? 'Lipia Sasa' : 'Pay with M-Pesa'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          </>
        )}

        {step === 'sending' && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Loader2 size={40} className="text-emerald-700 animate-spin mb-4" />
            <h3 className="text-[18px] font-bold text-slate-900">
              {lang === 'sw' ? 'Tuma Ombi la M-Pesa...' : 'Initiating M-Pesa STK Push...'}
            </h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              {lang === 'sw' 
                ? `Tunasafirisha ombi la malipo ya KES ${price} kwenda namba ${phone}.`
                : `Sending payment request of KES ${price} to ${phone}. Please wait.`}
            </p>
          </div>
        )}

        {step === 'pin_sent' && (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100 mb-5">
              <Sparkles size={26} className="text-amber-600" />
            </div>
            <h3 className="text-[20px] font-bold text-slate-900 leading-tight">
              {lang === 'sw' ? 'Weka PIN ya M-Pesa' : 'Check M-Pesa Push Prompt'}
            </h3>
            <p className="text-xs text-slate-500 mt-3 leading-relaxed">
              {lang === 'sw' 
                ? `Tafadhali ingiza PIN yako ya M-Pesa kwenye simu yako ili kukubali malipo ya KES ${price} ya huduma ya ${planLabel}.`
                : `A push prompt has been sent to ${phone}. Please enter your M-Pesa PIN on your phone to approve the KES ${price} subscription.`}
            </p>

            <div className="mt-8 flex flex-col gap-3 w-full">
              <button
                onClick={confirmPayment}
                className="w-full h-12 bg-emerald-700 hover:bg-emerald-600 active:scale-[0.98] text-white rounded-xl font-bold text-[13px] shadow transition-colors"
              >
                {lang === 'sw' ? 'Tayari Nimeshalipia' : 'Confirm Payment Completed'}
              </button>
              <button
                onClick={() => setStep('select')}
                className="w-full h-12 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-[13px] transition-colors"
              >
                {lang === 'sw' ? 'Ghairi' : 'Cancel & Go Back'}
              </button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center border border-emerald-200 mb-5 animate-bounce">
              <Check size={30} className="text-emerald-700 animate-pulse" strokeWidth={3} />
            </div>
            <h3 className="text-[22px] font-bold text-slate-900 leading-none">
              {lang === 'sw' ? 'Malipo Yamekamilika!' : 'Payment Received!'}
            </h3>
            <p className="text-xs text-slate-500 mt-3 leading-relaxed">
              {lang === 'sw' 
                ? `Usajili wako wa ${planLabel} umeanza rasmi. Karibu tena TotoAfya!`
                : `Your ${planLabel} premium plan is active. Unlocking TotoAfya maternal services...`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
