import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Heart,
  Building2,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  Check,
  Calendar,
  Phone,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { dataClient, mockFacilities } from '@totoafya/api-client';
import { calculateGestationalAgeInWeeks, calculateEdd } from '@totoafya/business-logic';
import { Button, Input, Card, CardContent, Badge } from '@totoafya/shared-ui';
import { useAuth } from '../lib/AuthContext';
import { useLang } from '@/context/LanguageContext';

export default function Onboarding() {
  const navigate = useNavigate();
  const { checkAppState } = useAuth();
  const { lang, setLang } = useLang();
  const isSw = lang === 'sw';

  const [step, setStep] = useState(1); // 1: Personal, 2: Pregnancy, 3: Facility, 4: PIN/Verification
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [facilities, setFacilities] = useState(mockFacilities);

  // Form State
  const [fullName, setFullName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [phone, setPhone] = useState('');
  const [county, setCounty] = useState('Nairobi');
  const [subCounty, setSubCounty] = useState('Kamukunji');
  const [dob, setDob] = useState('1998-05-14');

  // Step 2: Pregnancy / Maternal
  const [pregnancyStatus, setPregnancyStatus] = useState('pregnant'); // 'pregnant' | 'postpartum'
  const [lmp, setLmp] = useState('2026-05-15');
  const [gravida, setGravida] = useState('1');
  const [parity, setParity] = useState('0');

  // Step 3: Facility
  const [selectedFacilityId, setSelectedFacilityId] = useState('fac-pumwani-01');

  // Step 4: PIN
  const [pin, setPin] = useState('123456');
  const [confirmPin, setConfirmPin] = useState('123456');

  useEffect(() => {
    async function loadFacilities() {
      try {
        if (dataClient.facilities?.list) {
          const list = await dataClient.facilities.list();
          if (list.length > 0) setFacilities(list);
        }
      } catch {}
    }
    loadFacilities();
  }, []);

  const gestationalWeeks = lmp ? calculateGestationalAgeInWeeks(lmp) : null;
  const computedEdd = lmp ? calculateEdd(lmp) : null;

  const handleNext = () => {
    setError(null);
    if (step === 1) {
      if (!fullName.trim() || !nationalId.trim() || !phone.trim()) {
        setError(isSw ? 'Tafadhali jaza majina, kitambulisho na nambari ya simu.' : 'Please enter your name, National ID, and phone number.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (pregnancyStatus === 'pregnant' && !lmp) {
        setError(isSw ? 'Tafadhali weka tarehe ya hedhi ya mwisho (LMP).' : 'Please enter your Last Menstrual Period date (LMP).');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!selectedFacilityId) {
        setError(isSw ? 'Tafadhali chagua kituo cha afya kilicho karibu nawe.' : 'Please select your primary health facility.');
        return;
      }
      setStep(4);
    }
  };

  const handleComplete = async (e) => {
    if (e) e.preventDefault();
    if (!pin || pin.length < 4) {
      setError(isSw ? 'PIN lazima iwe angalau tarakimu 4.' : 'PIN must be at least 4 digits.');
      return;
    }
    if (pin !== confirmPin) {
      setError(isSw ? 'PIN hazilingani.' : 'PIN numbers do not match.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const selectedFac = facilities.find((f) => f.id === selectedFacilityId) || facilities[0];

      // 1. Register mother profile
      const newMother = await dataClient.mothers.create({
        full_name: fullName.trim(),
        national_id: nationalId.trim(),
        phone: phone.trim(),
        county,
        sub_county: subCounty,
        date_of_birth: dob,
        pregnancy_status: pregnancyStatus,
        lmp: pregnancyStatus === 'pregnant' ? lmp : undefined,
        edd: pregnancyStatus === 'pregnant' ? computedEdd : undefined,
        gravida: parseInt(gravida, 10) || 1,
        parity: parseInt(parity, 10) || 0,
        facility_id: selectedFac.id,
        facility_name: selectedFac.name,
        facility_phone: selectedFac.phone,
        caregiver_type: 'mother',
        language_preference: lang,
        risk_level: 'low',
        risk_score: 15,
        profile_complete: true,
      });

      // 2. Sign up authentication session
      if (dataClient.auth?.signUpMother) {
        await dataClient.auth.signUpMother(nationalId.trim(), pin, {
          full_name: fullName.trim(),
          facility_id: selectedFac.id,
          mother_id: newMother.id,
          phone: phone.trim(),
          profile_complete: true,
        });
      } else {
        await dataClient.auth.signInWithNationalIdOrAnc(nationalId.trim(), pin);
      }

      if (checkAppState) await checkAppState();
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err.message || (isSw ? 'Usajili umeshindwa. Tafadhali jaribu tena.' : 'Registration failed. Please retry.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 font-sans text-slate-900">
      <div className="w-full max-w-[440px] bg-white border border-slate-200/80 rounded-[32px] p-6 sm:p-8 shadow-xl flex flex-col">
        {/* Top brand & step progress */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#006B5F] flex items-center justify-center text-white font-serif font-black text-sm">
              T
            </div>
            <span className="text-sm font-extrabold text-[#006B5F]">TotoAfya Digital</span>
          </div>

          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === step ? 'w-6 bg-[#006B5F]' : i < step ? 'w-2 bg-emerald-400' : 'w-2 bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Header */}
        <div className="mb-6">
          <h1 className="text-xl font-extrabold text-slate-900">
            {step === 1 && (isSw ? 'Taarifa Zako Binafsi' : 'Personal Details')}
            {step === 2 && (isSw ? 'Hali ya Ujauzito na Uzazi' : 'Maternal & Pregnancy Profile')}
            {step === 3 && (isSw ? 'Kituo Chako cha Afya' : 'Select Health Facility')}
            {step === 4 && (isSw ? 'Unda PIN ya Usalama' : 'Create Security PIN')}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {step === 1 && (isSw ? 'Hatua 1 ya 4: Maelezo ya kitambulisho na mawasiliano' : 'Step 1 of 4: Identity & contact information')}
            {step === 2 && (isSw ? 'Hatua 2 ya 4: Hesabu ya wiki za ujauzito na tarehe ya kujifungua' : 'Step 2 of 4: Gestational age calculation & EDD')}
            {step === 3 && (isSw ? 'Hatua 3 ya 4: Chagua hospitali ya MCH ya serikali' : 'Step 3 of 4: Primary hospital for clinic visits')}
            {step === 4 && (isSw ? 'Hatua 4 ya 4: Weka PIN ya siri kulinda data zako' : 'Step 4 of 4: 6-digit PIN to secure your health records')}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            {error}
          </div>
        )}

        {/* STEP 1: Personal Details */}
        {step === 1 && (
          <div className="space-y-4">
            <Input
              label={isSw ? 'Majina Kamili ya Mama' : 'Full Name'}
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Amina Mwangi"
              required
            />

            <Input
              label={isSw ? 'Nambari ya Kitambulisho cha Taifa' : 'National ID Number'}
              type="text"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              placeholder="28475920"
              required
            />

            <Input
              label={isSw ? 'Nambari ya Simu (M-Pesa)' : 'Phone Number'}
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0712 345 678"
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label={isSw ? 'Kaunti' : 'County'}
                type="text"
                value={county}
                onChange={(e) => setCounty(e.target.value)}
              />
              <Input
                label={isSw ? 'Kaunti Ndogo' : 'Sub-County'}
                type="text"
                value={subCounty}
                onChange={(e) => setSubCounty(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* STEP 2: Pregnancy Profile */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isSw ? 'Hali Yako kwa Sasa' : 'Current Maternal Status'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPregnancyStatus('pregnant')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                    pregnancyStatus === 'pregnant'
                      ? 'border-[#006B5F] bg-[#E6F4F1] text-[#006B5F]'
                      : 'border-slate-200 text-slate-600 bg-white'
                  }`}
                >
                  🤰 {isSw ? 'Mjamzito' : 'Currently Pregnant'}
                </button>
                <button
                  type="button"
                  onClick={() => setPregnancyStatus('postpartum')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                    pregnancyStatus === 'postpartum'
                      ? 'border-[#006B5F] bg-[#E6F4F1] text-[#006B5F]'
                      : 'border-slate-200 text-slate-600 bg-white'
                  }`}
                >
                  👶 {isSw ? 'Nimejifungua' : 'Postpartum (Given Birth)'}
                </button>
              </div>
            </div>

            {pregnancyStatus === 'pregnant' && (
              <>
                <Input
                  label={isSw ? 'Tarehe ya Hedhi ya Mwisho (LMP)' : 'Last Menstrual Period (LMP)'}
                  type="date"
                  value={lmp}
                  onChange={(e) => setLmp(e.target.value)}
                  required
                />

                {gestationalWeeks && computedEdd && (
                  <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl space-y-1.5 text-xs text-teal-900">
                    <div className="flex justify-between">
                      <span className="font-semibold">{isSw ? 'Umri wa Ujauzito:' : 'Gestational Age:'}</span>
                      <span className="font-bold">{gestationalWeeks} {isSw ? 'wiki' : 'weeks'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">{isSw ? 'Makadirio ya Kujifungua (EDD):' : 'Estimated Delivery Date (EDD):'}</span>
                      <span className="font-bold">{computedEdd}</span>
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Input
                label={isSw ? 'Mimba Ngapi (Gravida)' : 'Pregnancies (Gravida)'}
                type="number"
                min="1"
                value={gravida}
                onChange={(e) => setGravida(e.target.value)}
              />
              <Input
                label={isSw ? 'Waliozaliwa (Parity)' : 'Births (Parity)'}
                type="number"
                min="0"
                value={parity}
                onChange={(e) => setParity(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* STEP 3: Facility Selection */}
        {step === 3 && (
          <div className="space-y-3">
            <p className="text-xs text-slate-600 mb-2">
              {isSw
                ? 'Chagua hospitali ambapo utahudhuria kliniki ya ANC au chanjo za mtoto:'
                : 'Select the primary healthcare facility for your ANC visits and KEPI child immunizations:'}
            </p>

            <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
              {facilities.map((fac) => {
                const isSelected = selectedFacilityId === fac.id;
                return (
                  <button
                    key={fac.id}
                    type="button"
                    onClick={() => setSelectedFacilityId(fac.id)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-[#006B5F] bg-[#E6F4F1] shadow-sm ring-1 ring-[#006B5F]'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">{fac.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {fac.county} • {fac.level || 'Hospital'} • {fac.facility_code || 'MFL'}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#006B5F] text-white flex items-center justify-center">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: Security PIN Setup */}
        {step === 4 && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              {isSw
                ? 'Unda PIN ya tarakimu 6 ambayo utatumia kila wakati unapoingia kwenye simu yako kulinda siri za afya yako.'
                : 'Create a 6-digit secret PIN to quickly sign in and keep your private maternal records secure.'}
            </p>

            <Input
              label={isSw ? 'PIN ya Usalama (Tarakimu 6)' : 'Security PIN (6 Digits)'}
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••••"
              maxLength={6}
              required
            />

            <Input
              label={isSw ? 'Thibitisha PIN Yako' : 'Confirm Security PIN'}
              type="password"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              placeholder="••••••"
              maxLength={6}
              required
            />
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex gap-3">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => {
                setError(null);
                setStep(step - 1);
              }}
              disabled={loading}
            >
              <ArrowLeft size={16} />
              <span>{isSw ? 'Nyuma' : 'Back'}</span>
            </Button>
          )}

          {step < 4 ? (
            <Button
              type="button"
              variant="primary"
              size="lg"
              className="flex-1"
              onClick={handleNext}
            >
              <span>{isSw ? 'Endelea' : 'Continue'}</span>
              <ArrowRight size={16} />
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="lg"
              className="flex-1"
              onClick={handleComplete}
              disabled={loading}
            >
              <span>{loading ? (isSw ? 'Inasajili...' : 'Completing...') : (isSw ? 'Kamilisha Usajili' : 'Complete Registration')}</span>
              <Check size={16} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
