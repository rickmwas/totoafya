import React, { useState, useEffect } from 'react';
import { CreditCard, Check, ShieldAlert, Loader2, Phone, CheckCircle2, RefreshCw } from 'lucide-react';
import { dataClient } from '@totoafya/api-client';
import { Button, Input, Badge, Card, CardContent } from '@totoafya/shared-ui';

export default function B2CPaywall({ user, onPaid, lang = 'en' }) {
  const isSw = lang === 'sw';
  const [selectedPlan, setSelectedPlan] = useState('monthly'); // 'monthly' | 'yearly'
  const [phone, setPhone] = useState(user?.phone || '');
  const [step, setStep] = useState('select'); // 'select' | 'sending' | 'pin_sent' | 'checking' | 'success'
  const [error, setError] = useState(null);
  const [checkoutRequestId, setCheckoutRequestId] = useState(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  const price = selectedPlan === 'monthly' ? 150 : 1000;

  useEffect(() => {
    async function loadStatus() {
      try {
        const motherId = user?.mother_id || user?.id;
        if (motherId && dataClient.payments?.getSubscriptionStatus) {
          const info = await dataClient.payments.getSubscriptionStatus(motherId);
          setSubscriptionInfo(info);
        }
      } catch (err) {
        console.warn('Could not load subscription status:', err);
      } finally {
        setLoadingStatus(false);
      }
    }
    loadStatus();
  }, [user]);

  const initiatePayment = async (e) => {
    if (e) e.preventDefault();
    const cleanPhone = phone.replace(/\s+/g, '');
    if (!cleanPhone.match(/^(?:\+254|0)?(7|1)\d{8}$/)) {
      setError(
        isSw
          ? 'Tafadhali weka nambari halali ya Safaricom M-Pesa (mfano: 0712345678)'
          : 'Please enter a valid Safaricom M-Pesa number (e.g. 0712345678)'
      );
      return;
    }

    setError(null);
    setStep('sending');

    try {
      // Server-mediated STK push via dataClient
      const res = await dataClient.payments.initiateSTKPush(
        cleanPhone,
        price,
        selectedPlan === 'monthly' ? 'TOTOAFYA_MONTHLY_150' : 'TOTOAFYA_ANNUAL_1000'
      );

      setCheckoutRequestId(res?.checkoutRequestId || res?.checkout_request_id || 'checkout-' + Date.now());
      setStep('pin_sent');
    } catch (err) {
      console.error('STK push initiation failed:', err);
      setError(
        err.message ||
          (isSw
            ? 'Imeshindwa kuanzisha malipo ya M-Pesa. Tafadhali jaribu tena.'
            : 'Failed to initiate M-Pesa STK push. Please verify phone number and retry.')
      );
      setStep('select');
    }
  };

  const verifyPayment = async () => {
    if (!checkoutRequestId) return;
    setStep('checking');
    setError(null);

    try {
      const status = await dataClient.payments.checkPaymentStatus(checkoutRequestId);
      const isCompleted = typeof status === 'string' ? status === 'completed' : status?.status === 'completed';

      if (isCompleted) {
        setStep('success');
        setTimeout(() => {
          if (onPaid) onPaid();
        }, 1500);
      } else {
        setError(
          isSw
            ? 'Malipo bado hayajathibitishwa. Hakikisha umeingiza PIN kwenye simu yako kisha ubofye Thibitisha tena.'
            : 'Payment not yet confirmed. Please ensure you entered your M-Pesa PIN on your phone and click Verify again.'
        );
        setStep('pin_sent');
      }
    } catch (err) {
      console.error('Payment verification error:', err);
      setError(
        err.message ||
          (isSw ? 'Hitilafu wakati wa kuthibitisha malipo.' : 'Error verifying payment status.')
      );
      setStep('pin_sent');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 font-sans text-slate-800">
      <div className="w-full max-w-[420px] bg-white border border-slate-200/80 rounded-[32px] p-6 shadow-xl flex flex-col overflow-hidden relative">
        {step === 'select' && (
          <>
            {/* Header */}
            <div className="text-center mb-6 mt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold uppercase tracking-wider mb-3">
                <ShieldAlert size={13} />
                <span>{isSw ? 'Kipindi cha Majaribio Kimeisha' : 'Trial Period Expired'}</span>
              </div>
              <h2 className="text-[24px] font-extrabold text-slate-900 tracking-tight leading-tight">
                {isSw ? 'Endelea Kumlinda Mwanao' : 'Keep Your Child Protected'}
              </h2>
              <p className="text-[13px] text-slate-600 mt-2 leading-relaxed">
                {isSw
                  ? 'Kipindi chako cha majaribio cha siku 30 kimekamilika. Lipia ili uendelee kupata ushauri wa AI, ratiba ya chanjo ya KEPI na ufuatiliaji wa afya.'
                  : 'Your 30-day grace trial has expired. Subscribe via M-Pesa to continue receiving WHO growth charts, KEPI vaccine reminders, and AI clinical consultations.'}
              </p>
            </div>

            {/* Current Status Badge */}
            {subscriptionInfo && (
              <div className="mb-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">{isSw ? 'Hali ya Sasa:' : 'Current Status:'}</span>
                <Badge variant={subscriptionInfo.status === 'active' ? 'normal' : 'mam'}>
                  {subscriptionInfo.status.toUpperCase()}
                </Badge>
              </div>
            )}

            {/* Benefits */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-6">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                {isSw ? 'FAIDA ZA PREMIUM' : 'PREMIUM CLINICAL BENEFITS'}
              </p>
              <ul className="space-y-2.5">
                {[
                  isSw ? 'Ushauri wa AI wa afya ya uzazi saa 24/7' : '24/7 Maternal AI Clinical Assistant',
                  isSw ? 'Ufuatiliaji wa uzito & urefu wa mtoto (Chati za WHO)' : 'WHO Nutrition & Growth Monitoring Charts',
                  isSw ? 'Vikumbusho vya chanjo za KEPI kwa njia ya SMS' : 'Automated KEPI Vaccine Schedule & Reminders',
                ].map((b, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                    <div className="w-4 h-4 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={10} className="text-[#006B5F]" strokeWidth={3} />
                    </div>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Plan Selection */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => setSelectedPlan('monthly')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  selectedPlan === 'monthly'
                    ? 'border-[#006B5F] bg-[#E6F4F1] shadow-sm ring-1 ring-[#006B5F]'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="text-xs font-bold text-slate-600 mb-1">{isSw ? 'Kila Mwezi' : 'Monthly'}</div>
                <div className="text-xl font-extrabold text-[#006B5F]">KES 150</div>
                <div className="text-[10px] text-slate-500 mt-1">{isSw ? 'Siku 30' : '30 days access'}</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPlan('yearly')}
                className={`p-4 rounded-2xl border text-left transition-all relative ${
                  selectedPlan === 'yearly'
                    ? 'border-[#006B5F] bg-[#E6F4F1] shadow-sm ring-1 ring-[#006B5F]'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <span className="absolute -top-2 right-2 px-1.5 py-0.5 bg-[#C98A2C] text-white text-[9px] font-bold rounded-full">
                  {isSw ? 'Okoa 45%' : 'Save 45%'}
                </span>
                <div className="text-xs font-bold text-slate-600 mb-1">{isSw ? 'Kila Mwaka' : 'Annual'}</div>
                <div className="text-xl font-extrabold text-[#006B5F]">KES 1,000</div>
                <div className="text-[10px] text-slate-500 mt-1">{isSw ? 'Miezi 12' : '12 months access'}</div>
              </button>
            </div>

            {/* Phone Input & Action */}
            <form onSubmit={initiatePayment} className="space-y-4">
              <Input
                label={isSw ? 'Nambari ya Simu ya M-Pesa' : 'M-Pesa Phone Number'}
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0712 345 678"
                error={error}
                helperText={isSw ? 'Utapokea arifa ya PIN kwenye simu yako' : 'You will receive an STK PIN prompt on this device'}
                leftIcon={<Phone size={18} className="text-slate-400" />}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
              >
                <CreditCard size={18} />
                <span>
                  {isSw ? `Lipia KES ${price} kupitia M-Pesa` : `Subscribe for KES ${price} via M-Pesa`}
                </span>
              </Button>
            </form>
          </>
        )}

        {/* Sending STK Push State */}
        {step === 'sending' && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mb-4 text-[#006B5F]">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {isSw ? 'Inatuma Ombi la M-Pesa...' : 'Sending M-Pesa STK Push...'}
            </h3>
            <p className="text-xs text-slate-500 max-w-[260px]">
              {isSw
                ? 'Tafadhali subiri kidogo wakati tunaunganisha na Safaricom...'
                : 'Connecting to Safaricom Daraja gateway. Please hold on...'}
            </p>
          </div>
        )}

        {/* PIN Sent / Waiting for Customer */}
        {step === 'pin_sent' && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 border border-emerald-200">
              <Phone className="w-8 h-8 animate-bounce" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {isSw ? 'Weka PIN yako ya M-Pesa' : 'Enter M-Pesa PIN on Your Phone'}
            </h3>
            <p className="text-xs text-slate-600 max-w-[280px] mb-6 leading-relaxed">
              {isSw
                ? `Arifa ya M-Pesa imetumwa kwa ${phone}. Weka PIN yako ya siri kukamilisha malipo ya KES ${price}.`
                : `An M-Pesa STK prompt was dispatched to ${phone}. Enter your secret PIN to confirm payment of KES ${price}.`}
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3 w-full">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={verifyPayment}
              >
                <CheckCircle2 size={18} />
                <span>{isSw ? 'Nimeshalipa (Thibitisha)' : "I've Completed Payment (Verify)"}</span>
              </Button>

              <Button
                variant="outline"
                size="md"
                className="w-full"
                onClick={() => setStep('select')}
              >
                <span>{isSw ? 'Badilisha Nambari au Mpango' : 'Change Phone or Plan'}</span>
              </Button>
            </div>
          </div>
        )}

        {/* Checking Status */}
        {step === 'checking' && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mb-4 text-[#006B5F]">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {isSw ? 'Inathibitisha Malipo...' : 'Verifying Transaction...'}
            </h3>
            <p className="text-xs text-slate-500 max-w-[260px]">
              {isSw
                ? 'Inawasiliana na seva ya benki kuthibitisha risiti yako ya M-Pesa...'
                : 'Querying server-side payment callback to activate your subscription...'}
            </p>
          </div>
        )}

        {/* Success */}
        {step === 'success' && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4 shadow-lg shadow-emerald-900/10">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-2">
              {isSw ? 'Malipo Yamethibitishwa!' : 'Subscription Activated!'}
            </h3>
            <p className="text-xs text-slate-600 max-w-[280px]">
              {isSw
                ? 'Asante kwa kumlinda mwanao. Uanachama wako wa TotoAfya Premium sasa unatumika.'
                : 'Thank you for protecting your family. Your TotoAfya Premium clinical access is now active.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
