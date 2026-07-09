import db from '@/api/totoafyaClient';

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Check, Bell, ChevronRight, Heart } from 'lucide-react';

import { useLang } from '@/context/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { cn } from '@/lib/utils';
import HospitalPicker from '@/components/onboarding/HospitalPicker';

const COUNTIES = ['Nairobi','Mombasa','Kisumu','Nakuru','Eldoret','Thika','Machakos','Nyeri','Kisii','Kakamega','Meru','Garissa','Kitui','Malindi','Embu'];
const RISK_FACTORS = [
  { key: 'high_bp', en: 'High Blood Pressure', sw: 'Shinikizo la damu' },
  { key: 'diabetes', en: 'Diabetes', sw: 'Kisukari' },
  { key: 'anaemia', en: 'Anaemia', sw: 'Upungufu wa damu' },
  { key: 'twins', en: 'Multiple Pregnancy', sw: 'Ujauzito wa mapacha' },
  { key: 'none', en: 'None of the above', sw: 'Hakuna' },
];

// ── Reusable atoms ─────────────────────────────────────────────────────────────

function ProgressBar({ current, total }) {
  return (
    <div className="flex items-center gap-1.5 w-24">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-[3px] rounded-full transition-all duration-500 ease-out flex-1",
            i <= current ? "bg-toto-teal" : "bg-[#EBEBEB]"
          )}
        />
      ))}
    </div>
  );
}

function StepHeader({ onBack, current, total }) {
  return (
    <div className="flex items-center justify-between w-full mb-8 flex-shrink-0">
      <button
        onClick={onBack}
        className="w-10 h-10 rounded-full bg-white border border-[#EBEBEB] flex items-center justify-center active:scale-[0.92] transition-transform shadow-sm hover:border-toto-teal/20 animate-fade-in"
      >
        <ArrowLeft size={16} className="text-toto-black" />
      </button>
      <ProgressBar current={current} total={total} />
      <div className="w-10" />
    </div>
  );
}

function InputField({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] tracking-[0.18em] font-extrabold uppercase text-[#A0A0A0] px-1">{label}</label>
      <div className="relative focus-within:ring-2 focus-within:ring-toto-teal/20 focus-within:border-toto-teal border border-[#E5E5E5] rounded-[18px] bg-white transition-all duration-300 shadow-sm overflow-hidden">
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-14 px-4 bg-transparent text-[15px] font-semibold text-toto-black placeholder:text-[#C0C0C0] outline-none"
        />
      </div>
    </div>
  );
}

function ContinueBtn({ onClick, disabled, loading, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full h-14 rounded-full bg-toto-teal text-white text-[15px] font-extrabold flex items-center justify-center gap-2 active:scale-[0.96] transition-all duration-200 shadow-teal-glow disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed select-none"
    >
      {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : children}
    </button>
  );
}

function PaywallAlert({ error, lang, facilityName }) {
  if (!error) return null;
  return (
    <div className="bg-rose-50/50 border border-rose-100 rounded-[24px] p-4.5 mb-4.5 text-left animate-fade-in shadow-sm">
      <div className="flex gap-3">
        <span className="text-xl leading-none flex-shrink-0">⚠️</span>
        <div>
          <p className="text-[13.5px] font-extrabold text-rose-950 leading-tight">
            {lang === 'sw' ? 'Kituo cha Afya Kimejaa' : 'Facility Capacity Reached'}
          </p>
          <p className="text-[12px] text-rose-700 leading-relaxed mt-1.5 font-medium">
            {lang === 'sw'
              ? `Hospitali ya ${facilityName || 'Demo Referral Hospital'} imefikia kikomo cha usajili. Tafadhali wasiliana na utawala wa kituo au uchague hospitali nyingine.`
              : `Your selected hospital (${facilityName || 'Demo Referral Hospital'}) has reached its registered patient limit. Please notify the hospital administration to upgrade their account, or choose a different facility.`}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────────
export default function Onboarding() {
  const navigate = useNavigate();
  const { t, lang, setLanguage } = useLang();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState(null);
  const [caregiverType, setCaregiverType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paywallError, setPaywallError] = useState(null);

  const [form, setForm] = useState({
    full_name: '', national_id: '', anc_number: '', phone: '',
    county: '', facility_id: '', facility_name: '', facility_phone: '', facility_emergency_phone: '',
  });
  const [pregForm, setPregForm] = useState({ lmp: '', gravida: 1, parity: 0, trimester: null, is_first: null, risk_factors: [] });
  const [childForm, setChildForm] = useState({ full_name: '', date_of_birth: '', gender: '', birth_weight_kg: '' });

  useEffect(() => {
    const fetchExistingMother = async () => {
      if (user?.id) {
        try {
          const existing = await db.entities.Mother.filter({ user_id: user.id });
          if (existing && existing.length > 0) {
            const m = existing[0];
            setForm(f => ({
              ...f,
              full_name: m.full_name || '',
              national_id: m.national_id || '',
              anc_number: m.anc_number || '',
              phone: m.phone || '',
              county: m.county || '',
              facility_id: m.facility_id || '',
              facility_name: m.facility_name || '',
              facility_phone: m.facility_phone || '',
              facility_emergency_phone: m.facility_emergency_phone || '',
            }));
            if (m.caregiver_type) setCaregiverType(m.caregiver_type);
            if (m.pregnancy_status) setMode(m.pregnancy_status);
            if (m.lmp) {
              setPregForm(p => ({
                ...p,
                lmp: m.lmp,
                gravida: m.gravida || 1,
                parity: m.parity || 0,
              }));
            }
          }
        } catch (err) {
          console.error("Error fetching existing mother profile:", err);
        }
      }
    };
    fetchExistingMother();
  }, [user]);

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setP = (k, v) => setPregForm(f => ({ ...f, [k]: v }));
  const setC = (k, v) => setChildForm(f => ({ ...f, [k]: v }));

  const toggleRisk = (key) => {
    setPregForm(f => {
      if (key === 'none') return { ...f, risk_factors: ['none'] };
      const filtered = f.risk_factors.filter(r => r !== 'none');
      return { ...f, risk_factors: filtered.includes(key) ? filtered.filter(r => r !== key) : [...filtered, key] };
    });
  };

  const lmpFromTrimester = (t) => {
    const weeks = t === 1 ? 6 : t === 2 ? 18 : 30;
    const d = new Date();
    d.setDate(d.getDate() - weeks * 7);
    return d.toISOString().split('T')[0];
  };

  const handleSubmit = async () => {
    setLoading(true);
    setPaywallError(null);
    const isCaregiverOnly = caregiverType === 'father' || caregiverType === 'guardian';
    try {
      const lmp = pregForm.lmp || (pregForm.trimester ? lmpFromTrimester(pregForm.trimester) : null);
      
      // Clinical validation for pregnancy date
      if (mode === 'pregnant' && !isCaregiverOnly && lmp) {
        const today = new Date();
        const lmpDate = new Date(lmp);
        if (lmpDate > today) {
          alert(lang === 'sw' ? 'Tarehe ya LMP haiwezi kuwa ya baadaye.' : 'LMP date cannot be in the future.');
          setLoading(false);
          return;
        }
        const diffWeeks = (today.getTime() - lmpDate.getTime()) / (1000 * 60 * 60 * 24 * 7);
        if (diffWeeks > 44) {
          alert(lang === 'sw' ? 'Tarehe ya LMP si sahihi (zaidi ya wiki 44 zilizopita).' : 'LMP date is invalid (more than 44 weeks ago).');
          setLoading(false);
          return;
        }
      }

      // Clinical validation for child's date of birth
      const effectiveMode = isCaregiverOnly ? 'child' : mode;
      if (effectiveMode === 'child' && childForm.date_of_birth) {
        const today = new Date();
        const dobDate = new Date(childForm.date_of_birth);
        if (dobDate > today) {
          alert(lang === 'sw' ? 'Tarehe ya kuzaliwa haiwezi kuwa ya baadaye.' : 'Date of birth cannot be in the future.');
          setLoading(false);
          return;
        }
      }

      const edd = lmp ? new Date(new Date(lmp).getTime() + 280 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null;

      const cleanForm = {
        ...form,
        national_id: form.national_id?.trim() || null,
        anc_number: form.anc_number?.trim() || null,
      };

      let mother;
      let existingMothers = [];
      if (user?.id) {
        existingMothers = await db.entities.Mother.filter({ user_id: user.id });
      }

      if (existingMothers && existingMothers.length > 0) {
        mother = await db.entities.Mother.update(existingMothers[0].id, {
          ...cleanForm,
          caregiver_type: caregiverType || 'mother',
          pregnancy_status: effectiveMode === 'pregnant' ? 'pregnant' : 'postpartum',
          lmp: isCaregiverOnly ? null : lmp,
          edd: isCaregiverOnly ? null : edd,
          gravida: isCaregiverOnly ? 0 : (Number(pregForm.gravida) || (effectiveMode === 'pregnant' ? 1 : 0)),
          parity: isCaregiverOnly ? 0 : (Number(pregForm.parity) || (effectiveMode === 'child' ? 1 : 0)),
          profile_complete: true,
          language_preference: lang,
          facility_phone: form.facility_phone || null,
          facility_emergency_phone: form.facility_emergency_phone || null,
        });
      } else {
        mother = await db.entities.Mother.create({
          ...cleanForm,
          user_id: user?.id || null,
          facility_phone: form.facility_phone || null,
          facility_emergency_phone: form.facility_emergency_phone || null,
          caregiver_type: caregiverType || 'mother',
          pregnancy_status: effectiveMode === 'pregnant' ? 'pregnant' : 'postpartum',
          lmp: isCaregiverOnly ? null : lmp,
          edd: isCaregiverOnly ? null : edd,
          gravida: isCaregiverOnly ? 0 : (Number(pregForm.gravida) || (effectiveMode === 'pregnant' ? 1 : 0)),
          parity: isCaregiverOnly ? 0 : (Number(pregForm.parity) || (effectiveMode === 'child' ? 1 : 0)),
          risk_score: 0,
          risk_level: 'low',
          profile_complete: true,
          language_preference: lang,
        });
      }

      if (effectiveMode === 'child' && childForm.full_name && childForm.date_of_birth && childForm.gender) {
        await db.entities.Child.create({
          mother_id: mother.id,
          full_name: childForm.full_name,
          date_of_birth: childForm.date_of_birth,
          gender: childForm.gender,
          birth_weight_kg: parseFloat(childForm.birth_weight_kg) || null,
          health_status: 'healthy',
        });
      }
      navigate('/');
    } catch (err) {
      console.error(err);
      if (err.message && (err.message.includes('SUB_LIMIT_REACHED') || err.message.includes('SUB_EXPIRED'))) {
        setPaywallError(err.message);
      } else {
        alert(err.message || 'An error occurred during onboarding');
      }
    } finally {
      setLoading(false);
    }
  };

  const isCaregiverOnly = caregiverType === 'father' || caregiverType === 'guardian';

  // ── STEP 0: Welcome ──────────────────────────────────────────────────────────
  if (step === 0) return (
    <div className="min-h-screen bg-[#f7f9f7] flex flex-col max-w-[430px] mx-auto overflow-y-auto pb-10 font-sans">
      {/* Hero Image Card */}
      <div className="relative mx-4 mt-4 mb-6 h-[42vh] rounded-[32px] overflow-hidden flex-shrink-0 bg-toto-teal/5 shadow-[0_12px_36px_rgba(0,0,0,0.06)]">
        <img
          src="/onboarding_journey_both.png"
          alt="Mother and father"
          className="w-full h-full object-cover transition-transform ease-out hover:scale-105"
          style={{ transitionDuration: '6000ms' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#f7f9f7] via-transparent to-transparent" />
      </div>

      {/* Hero Content */}
      <div className="flex flex-col flex-1 px-6 justify-between">
        <div className="flex flex-col">
          <h1 className="text-[34px] font-extrabold leading-[1.1] text-toto-black tracking-tight">
            {lang === 'sw' ? 'Utunzaji wa kuaminika kwa kila hatua' : 'Trusted care for every step'}
          </h1>
          <p className="text-[14px] text-toto-gray mt-3.5 leading-relaxed font-medium">
            {lang === 'sw' 
              ? 'Mwongozo wa kibinafsi, vikumbusho na usaidizi kwako na mtoto wako.' 
              : 'Personalized guidance, reminders and support for you and your baby.'}
          </p>

          {/* Checklist Items */}
          <div className="flex flex-col gap-3 mt-6">
            {[
              { en: 'Track your pregnancy', sw: 'Fuatilia ujauzito wako' },
              { en: "Monitor baby's growth", sw: "Fuatilia ukuaji wa mtoto" },
              { en: 'Get AI health insights', sw: 'Pata ushauri wa afya wa AI' }
            ].map((item) => (
              <div key={item.en} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-toto-green/10 flex items-center justify-center text-toto-green flex-shrink-0">
                  <Check size={14} strokeWidth={3} />
                </div>
                <span className="text-[14px] font-semibold text-toto-black">
                  {lang === 'sw' ? item.sw : item.en}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Language Picker */}
        <div className="flex flex-col items-center gap-2 mt-6">
          <span className="text-[9px] tracking-[0.2em] font-black uppercase text-toto-light">CHOOSE LANGUAGE</span>
          <div className="bg-toto-gray/10 border border-white/20 rounded-full p-0.5 flex gap-1 w-full max-w-[240px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]">
            {[
              { code: 'en', flagText: 'EN', label: 'English' },
              { code: 'sw', flagText: 'KE', label: 'Swahili' }
            ].map(({ code, flagText, label }) => {
              const selected = lang === code;
              return (
                <button
                  key={code}
                  onClick={() => setLanguage(code)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 h-8 rounded-full text-[12px] font-bold transition-all duration-200 active:scale-[0.96]',
                    selected
                      ? 'bg-toto-teal text-white shadow-sm'
                      : 'text-toto-gray'
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom bar with Indicator dots and Next/Skip buttons */}
        <div className="mt-8">
          {/* Indicator Dots */}
          <div className="flex justify-center gap-2 mb-6">
            <div className="w-2.5 h-2.5 rounded-full bg-toto-teal" />
            <div className="w-2.5 h-2.5 rounded-full bg-toto-light/35" />
            <div className="w-2.5 h-2.5 rounded-full bg-toto-light/35" />
          </div>

          <div className="flex items-center justify-between">
            <button 
              onClick={() => setStep(1)} 
              className="text-toto-gray hover:text-toto-black font-bold text-[15px] transition-colors"
            >
              {lang === 'sw' ? 'Ruka' : 'Skip'}
            </button>
            
            <button
              onClick={() => setStep(1)}
              className="h-12 px-8 bg-toto-teal hover:bg-toto-teal-dark active:scale-[0.96] text-white rounded-full font-bold text-[15px] shadow-[0_6px_20px_rgba(13,98,61,0.2)] transition-all duration-200"
            >
              {lang === 'sw' ? 'Kisha' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── STEP 1: Who are you? ─────────────────────────────────────────────────────
  if (step === 1) return (
    <div className="min-h-screen bg-[#FDFCF8] flex flex-col max-w-[430px] mx-auto px-6 pt-6 pb-10 font-sans">
      <StepHeader onBack={() => setStep(0)} current={0} total={4} />

      <div className="mb-8 flex-shrink-0 animate-fade-in">
        <p className="text-[10px] tracking-[0.2em] font-black uppercase text-toto-teal mb-2">
          {lang === 'sw' ? 'HATUA 1 YA 4' : 'STEP 1 OF 4'}
        </p>
        <h2 className="text-[32px] font-bold leading-tight text-toto-black tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {lang === 'sw' ? 'Wewe ni nani?' : 'Who are you?'}
        </h2>
        <p className="text-[14px] text-toto-gray font-medium mt-1 leading-relaxed">
          {lang === 'sw' ? 'Tutabinafsisha programu kwa hali yako' : "We'll personalize the app for your role"}
        </p>
      </div>

      <div className="flex flex-col gap-4 flex-1 overflow-y-auto">
        {[
          {
            key: 'mother',
            imgUrl: '/onboarding_role_mother.png',
            en: 'Mother',
            sw: 'Mama',
            sub_en: 'Pregnant or postpartum caregiver',
            sub_sw: 'Mlezi mjamzito au baada ya kujifungua'
          },
          {
            key: 'father',
            imgUrl: '/onboarding_role_father.png',
            en: 'Father',
            sw: 'Baba',
            sub_en: 'Co-parent or primary caregiver',
            sub_sw: 'Mzazi mwenza au mlezi mkuu'
          },
          {
            key: 'guardian',
            imgUrl: '/onboarding_role_guardian.png',
            en: 'Guardian / Relative',
            sw: 'Mlezi / Ndugu',
            sub_en: 'Grandparent, aunt, or family relative',
            sub_sw: 'Bibi, shangazi, au mlezi wa familia'
          },
        ].map(({ key, imgUrl, en, sw, sub_en, sub_sw }) => {
          const sel = caregiverType === key;
          return (
            <button
              key={key}
              onClick={() => { setCaregiverType(key); setStep(key === 'mother' ? 2 : 3); }}
              className={cn(
                'w-full rounded-[26px] p-3.5 border-2 text-left transition-all duration-300 active:scale-[0.98] flex items-center shadow-card hover:shadow-card-hover',
                sel
                  ? 'border-toto-teal bg-toto-teal/[0.03] shadow-teal-glow-sm'
                  : 'bg-white border-[#F0F0F0]'
              )}
            >
              {/* Photo Image Left */}
              <div className="w-[74px] h-[74px] rounded-[20px] overflow-hidden flex-shrink-0 mr-4 border border-[#F5F5F7] shadow-sm">
                <img src={imgUrl} alt={en} className="w-full h-full object-cover" />
              </div>

              {/* Title & Description Middle */}
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-[16px] font-extrabold text-toto-black tracking-tight">{lang === 'sw' ? sw : en}</p>
                <p className="text-[12px] text-toto-gray mt-1 font-semibold leading-tight">{lang === 'sw' ? sub_sw : sub_en}</p>
              </div>

              {/* Select indicator Right */}
              <div className="flex-shrink-0 ml-2">
                {sel ? (
                  <div className="w-6 h-6 rounded-full bg-toto-teal flex items-center justify-center shadow-sm">
                    <Check size={12} className="text-white" strokeWidth={3.2} />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border border-[#DCDCDD] flex items-center justify-center bg-white">
                    <ChevronRight size={13} className="text-[#A0A0A5] ml-0.5" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  // ── STEP 2: Journey Selection ────────────────────────────────────────────────
  if (step === 2) return (
    <div className="min-h-screen bg-[#FDFCF8] flex flex-col max-w-[430px] mx-auto px-6 pt-6 pb-10 font-sans">
      <StepHeader onBack={() => setStep(1)} current={1} total={4} />

      <div className="mb-8 flex-shrink-0 animate-fade-in">
        <p className="text-[10px] tracking-[0.2em] font-black uppercase text-toto-teal mb-2">
          {lang === 'sw' ? 'HATUA 2 YA 4' : 'STEP 2 OF 4'}
        </p>
        <h2 className="text-[32px] font-bold leading-tight text-toto-black tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {lang === 'sw' ? 'Uko wapi katika safari yako?' : 'Where are you in your journey?'}
        </h2>
        <p className="text-[14px] text-toto-gray font-medium mt-1 leading-relaxed">
          {lang === 'sw' ? "Tutabadilisha programu kulingana na mahitaji yako" : "We'll tailor the app to your current situation"}
        </p>
      </div>

      <div className="flex flex-col gap-4 flex-1 overflow-y-auto">
        {/* Pregnant option */}
        <button
          onClick={() => { setMode('pregnant'); setStep(3); }}
          className={cn(
            'w-full rounded-[26px] p-3.5 border-2 text-left transition-all duration-300 active:scale-[0.98] flex items-center shadow-card hover:shadow-card-hover',
            mode === 'pregnant' ? 'border-toto-teal bg-toto-teal/[0.03] shadow-teal-glow-sm' : 'bg-white border-[#F0F0F0]'
          )}
        >
          <div className="w-[74px] h-[74px] rounded-[20px] overflow-hidden flex-shrink-0 mr-4 border border-[#F5F5F7] shadow-sm">
            <img
              src="/onboarding_journey_pregnant.png"
              alt="Pregnant"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0 pr-2">
            <p className="text-[16px] font-extrabold text-toto-black tracking-tight">{lang === 'sw' ? 'Mimi ni mjamzito' : 'I am pregnant'}</p>
            <p className="text-[12px] text-toto-gray mt-1 font-semibold leading-tight">
              {lang === 'sw' ? 'Fuatilia ziara za ANC na ukuaji wa mtoto' : 'Track ANC visits, fetal development & milestones'}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {['ANC Tracker', 'Fetal Timeline'].map(tag => (
                <span key={tag} className="text-[9px] bg-toto-teal/10 text-toto-teal px-2 py-0.5 rounded-full font-bold tracking-wide">{tag}</span>
              ))}
              <span className="text-[9px] bg-toto-red/5 text-toto-red px-2 py-0.5 rounded-full font-bold tracking-wide">Danger Alerts</span>
            </div>
          </div>
          <div className="flex-shrink-0 ml-2">
            <div className="w-6 h-6 rounded-full border border-[#DCDCDD] flex items-center justify-center bg-white">
              <ChevronRight size={13} className="text-[#A0A0A5] ml-0.5" />
            </div>
          </div>
        </button>

        {/* Child option */}
        <button
          onClick={() => { setMode('child'); setStep(3); }}
          className={cn(
            'w-full rounded-[26px] p-3.5 border-2 text-left transition-all duration-300 active:scale-[0.98] flex items-center shadow-card hover:shadow-card-hover',
            mode === 'child' ? 'border-toto-teal bg-toto-teal/[0.03] shadow-teal-glow-sm' : 'bg-white border-[#F0F0F0]'
          )}
        >
          <div className="w-[74px] h-[74px] rounded-[20px] overflow-hidden flex-shrink-0 mr-4 border border-[#F5F5F7] shadow-sm">
            <img
              src="/onboarding_journey_child.png"
              alt="Child"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0 pr-2">
            <p className="text-[16px] font-extrabold text-toto-black tracking-tight">{lang === 'sw' ? 'Nina mtoto tayari' : 'I already have a child'}</p>
            <p className="text-[12px] text-toto-gray mt-1 font-semibold leading-tight">
              {lang === 'sw' ? 'Fuatilia chanjo, ukuaji na maendeleo' : 'Track vaccines, growth charts & milestones'}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {['Vaccines', 'Growth Chart', 'Milestones'].map(tag => (
                <span key={tag} className="text-[9px] bg-toto-teal/10 text-toto-teal px-2 py-0.5 rounded-full font-bold tracking-wide">{tag}</span>
              ))}
            </div>
          </div>
          <div className="flex-shrink-0 ml-2">
            <div className="w-6 h-6 rounded-full border border-[#DCDCDD] flex items-center justify-center bg-white">
              <ChevronRight size={13} className="text-[#A0A0A5] ml-0.5" />
            </div>
          </div>
        </button>

        {/* Both option */}
        <button
          onClick={() => { setMode('pregnant'); setStep(3); }}
          className="w-full rounded-[26px] p-3.5 border border-dashed border-[#DCDCDD] bg-white text-left transition-all duration-300 active:scale-[0.98] flex items-center hover:border-toto-teal/30 shadow-card"
        >
          <div className="w-[74px] h-[74px] rounded-[20px] overflow-hidden flex-shrink-0 mr-4 border border-[#F5F5F7] shadow-sm">
            <img
              src="/onboarding_journey_both.png"
              alt="Family"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0 pr-2">
            <p className="text-[16px] font-extrabold text-[#0A0A0A] tracking-tight">{lang === 'sw' ? 'Mjamzito na nina watoto' : 'Pregnant + have children'}</p>
            <p className="text-[12px] text-[#707070] mt-1 font-semibold leading-tight">
              {lang === 'sw' ? 'Tutawezesha hali zote mbili' : "We'll enable both modes for you"}
            </p>
          </div>
          <div className="flex-shrink-0 ml-2">
            <div className="w-6 h-6 rounded-full border border-[#DCDCDD] flex items-center justify-center bg-white">
              <ChevronRight size={13} className="text-[#A0A0A5] ml-0.5" />
            </div>
          </div>
        </button>
      </div>
    </div>
  );

  // ── STEP 3: Personal Details ─────────────────────────────────────────────────
  if (step === 3) {
    const stepLabel = isCaregiverOnly ? (lang === 'sw' ? 'HATUA 2 YA 3' : 'STEP 2 OF 3') : (lang === 'sw' ? 'HATUA 3 YA 4' : 'STEP 3 OF 4');
    const dotIndex = isCaregiverOnly ? 1 : 2;
    const dotTotal = isCaregiverOnly ? 3 : 4;

    return (
      <div className="min-h-screen bg-[#FDFCF8] flex flex-col max-w-[430px] mx-auto px-6 pt-6 pb-10 font-sans">
        <StepHeader onBack={() => setStep(isCaregiverOnly ? 1 : 2)} current={dotIndex} total={dotTotal} />

        <div className="mb-8 flex-shrink-0 animate-fade-in">
          <p className="text-[10px] tracking-[0.2em] font-black uppercase text-toto-teal mb-2">{stepLabel}</p>
          <h2 className="text-[32px] font-bold leading-tight text-toto-black tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {lang === 'sw' ? 'Maelezo Yako' : 'Your Details'}
          </h2>
          <p className="text-[14px] text-toto-gray font-medium mt-1 leading-relaxed">
            {lang === 'sw' ? 'Taarifa zako ziko salama' : 'Your information is secure and private'}
          </p>
        </div>

        <div className="flex flex-col gap-4 flex-1 overflow-y-auto">
          <InputField label={t('full_name')} value={form.full_name} onChange={v => setF('full_name', v)}
            placeholder={lang === 'sw' ? 'Jina kamili lako' : 'Your full name'} />
          <InputField label={t('phone_number')} value={form.phone} onChange={v => setF('phone', v)}
            type="tel" placeholder="+254 7XX XXX XXX" />

          <div className="flex flex-col gap-2">
            <label className="text-[10px] tracking-[0.18em] font-extrabold uppercase text-[#A0A0A0] px-1">{t('county')}</label>
            <div className="relative focus-within:ring-2 focus-within:ring-toto-teal/20 focus-within:border-toto-teal border border-[#E5E5E5] rounded-[18px] bg-white transition-all duration-300 shadow-sm overflow-hidden">
              <select
                value={form.county}
                onChange={e => setF('county', e.target.value)}
                className="w-full h-14 px-4 bg-transparent text-[15px] font-semibold text-toto-black outline-none appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23999' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}
              >
                <option value="">{lang === 'sw' ? 'Chagua kaunti' : 'Select county'}</option>
                {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <HospitalPicker
            value={form.facility_name}
            onChange={f => {
              setF('facility_id', f?.id || '');
              setF('facility_name', f?.name || '');
              setPaywallError(null);
            }}
            lang={lang}
          />

          {/* Hospital emergency details */}
          <div className="bg-white rounded-[24px] border border-[#F0F0F0] overflow-hidden shadow-card mt-2">
            <div className="px-4 py-3 bg-[#FAFAFA] border-b border-[#F5F5F7]">
              <p className="text-[11px] tracking-[0.12em] font-extrabold uppercase text-toto-gray">
                {lang === 'sw' ? 'NAMBARI ZA HOSPITALI (SI LAZIMA)' : 'FACILITY PHONES (OPTIONAL)'}
              </p>
            </div>
            <div className="p-4 flex flex-col gap-4">
              <InputField
                label={lang === 'sw' ? 'MASWALI' : 'INQUIRY LINE'}
                value={form.facility_phone}
                onChange={v => setF('facility_phone', v)}
                type="tel"
                placeholder="+254 7XX XXX XXX"
              />
              <InputField
                label={lang === 'sw' ? 'DHARURA / UZAZI' : 'EMERGENCY / MATERNITY'}
                value={form.facility_emergency_phone}
                onChange={v => setF('facility_emergency_phone', v)}
                type="tel"
                placeholder="+254 7XX XXX XXX"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex-shrink-0">
          <ContinueBtn onClick={() => setStep(4)} disabled={!form.full_name || !form.phone}>
            <span>{lang === 'sw' ? 'Endelea' : 'Continue'}</span> <ArrowRight size={16} strokeWidth={2.5} />
          </ContinueBtn>
        </div>
      </div>
    );
  }

  // ── STEP 4C: Father / Guardian ───────────────────────────────────────────────
  if (step === 4 && (caregiverType === 'father' || caregiverType === 'guardian')) return (
    <div className="min-h-screen bg-[#FDFCF8] flex flex-col max-w-[430px] mx-auto px-6 pt-6 pb-10 font-sans">
      <StepHeader onBack={() => setStep(3)} current={2} total={3} />

      <div className="mb-8 flex-shrink-0 animate-fade-in">
        <div className="inline-flex items-center gap-2 bg-toto-teal/10 rounded-full px-3 py-1.5 mb-3.5">
          <span className="text-xs">{caregiverType === 'father' ? '👨' : '🧑'}</span>
          <span className="text-[10px] font-extrabold text-toto-teal tracking-wider uppercase">
            {lang === 'sw' ? (caregiverType === 'father' ? 'BABA' : 'MLEZI') : (caregiverType === 'father' ? 'FATHER' : 'GUARDIAN')}
          </span>
        </div>
        <h2 className="text-[32px] font-bold leading-tight text-toto-black tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {lang === 'sw' ? 'Watoto Wanaohusika' : 'Children in Your Care'}
        </h2>
        <p className="text-[14px] text-toto-gray font-medium mt-1 leading-relaxed">
          {lang === 'sw' ? 'Unaweza kuongeza watoto baadaye pia' : 'You can add more children later'}
        </p>
      </div>

      <div className="flex flex-col gap-4 flex-1 overflow-y-auto">
        <div className="bg-white rounded-[26px] border border-[#F0F0F0] p-5 shadow-card">
          <p className="text-[10px] tracking-[0.18em] font-extrabold uppercase text-[#A0A0A0] mb-4">
            {lang === 'sw' ? 'MTOTO WA KWANZA (SI LAZIMA)' : 'FIRST CHILD (OPTIONAL)'}
          </p>
          <div className="flex flex-col gap-4.5">
            <InputField
              label={lang === 'sw' ? "JINA LA MTOTO" : "CHILD'S NAME"}
              value={childForm.full_name} onChange={v => setC('full_name', v)}
              placeholder={lang === 'sw' ? 'Jina kamili' : "Child's full name"} />
            <InputField
              label={lang === 'sw' ? 'TAREHE YA KUZALIWA' : 'DATE OF BIRTH'}
              value={childForm.date_of_birth} onChange={v => setC('date_of_birth', v)} type="date" />
            <div>
              <label className="text-[10px] tracking-[0.18em] font-extrabold uppercase text-[#A0A0A0] block mb-2.5 px-1">
                {lang === 'sw' ? 'JINSIA' : 'GENDER'}
              </label>
              <div className="flex gap-3">
                {[
                  { v: 'male', icon: '👦', en: 'Boy', sw: 'Mvulana' },
                  { v: 'female', icon: '👧', en: 'Girl', sw: 'Msichana' }
                ].map(({ v, icon, en, sw }) => {
                  const active = childForm.gender === v;
                  const borderClass = active
                    ? v === 'male'
                      ? 'border-toto-teal bg-toto-teal/5 text-toto-teal shadow-sm'
                      : 'border-[#D946A8] bg-[#FFF0F9] text-[#D946A8] shadow-sm'
                    : 'border-[#F0F0F0] bg-white text-toto-gray hover:border-toto-teal/20';
                  return (
                    <button
                      key={v}
                      onClick={() => setC('gender', v)}
                      className={cn(
                        'flex-1 h-12 rounded-[18px] flex items-center justify-center gap-2 border-2 transition-all duration-350 active:scale-[0.97] font-black text-[14px]',
                        borderClass
                      )}
                    >
                      <span>{icon}</span> {lang === 'sw' ? sw : en}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3.5 bg-toto-teal/[0.03] border border-toto-teal/10 rounded-[24px] p-4.5 mt-2">
          <span className="text-lg flex-shrink-0">ℹ️</span>
          <p className="text-[13px] text-toto-gray leading-relaxed font-semibold">
            {lang === 'sw'
              ? 'Kama baba au mlezi, utaweza kuona chanjo, ukuaji na arifa za afya za watoto wote.'
              : "As a father or guardian, you'll track vaccines, growth, and health alerts for all children."}
          </p>
        </div>
      </div>

      <div className="mt-6 flex-shrink-0">
        <PaywallAlert error={paywallError} lang={lang} facilityName={form.facility_name} />
        <ContinueBtn loading={loading} onClick={handleSubmit}>
          <Check size={18} strokeWidth={2.5} /> {lang === 'sw' ? 'Maliza Usajili' : 'Complete Setup'}
        </ContinueBtn>
      </div>
    </div>
  );

  // ── STEP 4A: Pregnancy Detail ────────────────────────────────────────────────
  if (step === 4 && mode === 'pregnant') return (
    <div className="min-h-screen bg-[#FDFCF8] flex flex-col max-w-[430px] mx-auto px-6 pt-6 pb-10 font-sans">
      <StepHeader onBack={() => setStep(3)} current={3} total={4} />

      <div className="mb-8 flex-shrink-0 animate-fade-in">
        <div className="inline-flex items-center gap-2 bg-toto-teal/10 rounded-full px-3 py-1.5 mb-3.5">
          <span className="text-xs">🤰</span>
          <span className="text-[10px] font-extrabold text-toto-teal tracking-wider uppercase">
            {lang === 'sw' ? 'HALI YA UJAUZITO' : 'PREGNANCY'}
          </span>
        </div>
        <h2 className="text-[32px] font-bold leading-tight text-toto-black tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {lang === 'sw' ? 'Kuhusu Ujauzito Wako' : 'About Your Pregnancy'}
        </h2>
      </div>

      <div className="flex flex-col gap-6 flex-1 overflow-y-auto">
        {/* Trimester */}
        <div>
          <label className="text-[10px] tracking-[0.18em] font-extrabold uppercase text-[#A0A0A0] block mb-3 px-1">
            {lang === 'sw' ? 'UKO KATIKA KIPINDI GANI?' : 'WHICH TRIMESTER?'}
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { v: 1, en: '1st', sw: 'Kwanza', sub: '1–13 wks' },
              { v: 2, en: '2nd', sw: 'Pili', sub: '14–27 wks' },
              { v: 3, en: '3rd', sw: 'Tatu', sub: '28+ wks' },
            ].map(({ v, en, sw, sub }) => {
              const active = pregForm.trimester === v;
              const borderClass = active
                ? v === 1 ? 'border-toto-purple bg-toto-purple/5 text-toto-purple shadow-sm'
                  : v === 2 ? 'border-toto-teal bg-toto-teal/5 text-toto-teal shadow-sm'
                  : 'border-toto-green bg-toto-green/5 text-toto-green shadow-sm'
                : 'border-[#F0F0F0] bg-white text-toto-black hover:border-toto-teal/20';

              return (
                <button
                  key={v}
                  onClick={() => setP('trimester', v)}
                  className={cn(
                    'rounded-[20px] py-4 flex flex-col items-center gap-1 border-2 transition-all duration-350 active:scale-[0.96] shadow-card hover:shadow-card-hover font-black text-[18px]',
                    borderClass
                  )}
                >
                  <span>{lang === 'sw' ? sw : en}</span>
                  <span className="text-[9.5px] text-[#A0A0A0] font-bold mt-0.5">{sub}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* OR LMP */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-px bg-[#EBEBEB]" />
            <span className="text-[10px] text-[#A0A0A0] font-bold tracking-wider">{lang === 'sw' ? 'AU INGIZA TAREHE' : 'OR ENTER EXACT DATE'}</span>
            <div className="flex-1 h-px bg-[#EBEBEB]" />
          </div>
          <InputField
            label={lang === 'sw' ? 'Tarehe ya Hedhi ya Mwisho (LMP)' : 'Last Menstrual Period (LMP)'}
            value={pregForm.lmp} onChange={v => setP('lmp', v)} type="date" />
        </div>

        {/* First pregnancy */}
        <div>
          <label className="text-[10px] tracking-[0.18em] font-extrabold uppercase text-[#A0A0A0] block mb-3 px-1">
            {lang === 'sw' ? 'JE, HII NI UJAUZITO WA KWANZA?' : 'IS THIS YOUR FIRST PREGNANCY?'}
          </label>
          <div className="flex gap-3">
            {[
              { v: true, en: 'Yes, first time', sw: 'Ndio, mara ya kwanza' },
              { v: false, en: 'No, I have children', sw: 'Hapana, nina watoto' }
            ].map(({ v, en, sw }) => {
              const active = pregForm.is_first === v;
              return (
                <button
                  key={String(v)}
                  onClick={() => setP('is_first', v)}
                  className={cn(
                    'flex-1 h-13 rounded-[18px] text-[13.5px] font-black border-2 transition-all duration-300 active:scale-[0.97] shadow-card',
                    active
                      ? 'bg-toto-teal text-white border-toto-teal shadow-teal-glow-sm'
                      : 'bg-white border-[#F0F0F0] text-toto-gray hover:border-toto-teal/20'
                  )}
                >
                  {lang === 'sw' ? sw : en}
                </button>
              );
            })}
          </div>
        </div>

        {/* Risk factors */}
        <div>
          <label className="text-[10px] tracking-[0.18em] font-extrabold uppercase text-[#A0A0A0] block mb-3 px-1">
            {lang === 'sw' ? 'MAMBO YANAYOATHIRI AFYA' : 'RISK FACTORS (SELECT ALL THAT APPLY)'}
          </label>
          <div className="flex flex-wrap gap-2.5">
            {RISK_FACTORS.map(({ key, en, sw }) => {
              const selected = pregForm.risk_factors.includes(key);
              return (
                <button
                  key={key}
                  onClick={() => toggleRisk(key)}
                  className={cn(
                    'px-4 py-2.5 rounded-full text-[13px] font-bold border transition-all duration-200 active:scale-[0.96] shadow-sm select-none',
                    selected
                      ? 'bg-toto-black text-white border-toto-black'
                      : 'bg-white border-[#F0F0F0] text-toto-gray hover:border-toto-teal/20'
                  )}
                >
                  {lang === 'sw' ? sw : en}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 flex-shrink-0">
        <PaywallAlert error={paywallError} lang={lang} facilityName={form.facility_name} />
        <ContinueBtn loading={loading} onClick={handleSubmit} disabled={!pregForm.trimester && !pregForm.lmp}>
          <Check size={18} strokeWidth={2.5} /> {lang === 'sw' ? 'Maliza Usajili' : 'Complete Setup'}
        </ContinueBtn>
      </div>
    </div>
  );

  // ── STEP 4B: Child Detail ────────────────────────────────────────────────────
  if (step === 4 && mode === 'child') return (
    <div className="min-h-screen bg-[#FDFCF8] flex flex-col max-w-[430px] mx-auto px-6 pt-6 pb-10 font-sans">
      <StepHeader onBack={() => setStep(3)} current={3} total={4} />

      <div className="mb-8 flex-shrink-0 animate-fade-in">
        <div className="inline-flex items-center gap-2 bg-toto-teal/10 rounded-full px-3 py-1.5 mb-3.5">
          <span className="text-xs">👶</span>
          <span className="text-[10px] font-extrabold text-toto-teal tracking-wider uppercase">
            {lang === 'sw' ? 'MAELEZO YA MTOTO' : 'CHILD DETAILS'}
          </span>
        </div>
        <h2 className="text-[32px] font-bold leading-tight text-toto-black tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {lang === 'sw' ? 'Mwambie kidogo kuhusu mtoto wako' : 'Tell us about your child'}
        </h2>
      </div>

      <div className="flex flex-col gap-5 flex-1 overflow-y-auto">
        <InputField
          label={lang === 'sw' ? "JINA LA MTOTO" : "CHILD'S NAME"}
          value={childForm.full_name} onChange={v => setC('full_name', v)}
          placeholder={lang === 'sw' ? 'Jina kamili' : "Child's full name"} />
        <InputField
          label={lang === 'sw' ? 'TAREHE YA KUZALIWA' : 'DATE OF BIRTH'}
          value={childForm.date_of_birth} onChange={v => setC('date_of_birth', v)} type="date" />

        <div>
          <label className="text-[10px] tracking-[0.18em] font-extrabold uppercase text-[#A0A0A0] block mb-3 px-1">
            {lang === 'sw' ? 'JINSIA' : 'GENDER'}
          </label>
          <div className="flex gap-3">
            {[
              { v: 'male', icon: '👦', en: 'Boy', sw: 'Mvulana' },
              { v: 'female', icon: '👧', en: 'Girl', sw: 'Msichana' }
            ].map(({ v, icon, en, sw }) => {
              const active = childForm.gender === v;
              const genderStyle = active
                ? v === 'male'
                  ? 'border-toto-teal bg-toto-teal/5 text-toto-teal shadow-sm'
                  : 'border-[#D946A8] bg-[#FFF0F9] text-[#D946A8] shadow-sm'
                : 'border-[#F0F0F0] bg-white text-toto-gray hover:border-toto-teal/20';

              return (
                <button
                  key={v}
                  onClick={() => setC('gender', v)}
                  className={cn(
                    'flex-1 py-4.5 rounded-[22px] flex flex-col items-center gap-1.5 border-2 transition-all duration-350 active:scale-[0.97] font-black',
                    genderStyle
                  )}
                >
                  <span className="text-3xl mb-0.5">{icon}</span>
                  <span className="text-[14px]">
                    {lang === 'sw' ? sw : en}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] tracking-[0.18em] font-extrabold uppercase text-[#A0A0A0] px-1">
            {lang === 'sw' ? 'UZITO WA KUZALIWA (SI LAZIMA)' : 'BIRTH WEIGHT — OPTIONAL'}
          </label>
          <div className="flex items-center gap-2 bg-white border border-[#E5E5E5] rounded-[18px] px-4 focus-within:ring-2 focus-within:ring-toto-teal/20 focus-within:border-toto-teal transition-all duration-300 shadow-sm overflow-hidden">
            <input type="number" value={childForm.birth_weight_kg}
              onChange={e => setC('birth_weight_kg', e.target.value)}
              placeholder="e.g. 3.2" step="0.1" min="0.5" max="6"
              className="flex-1 h-14 text-[15px] font-semibold text-toto-black placeholder:text-[#C0C0C0] outline-none bg-transparent" />
            <span className="text-[14px] font-black text-toto-light">kg</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex-shrink-0">
        <PaywallAlert error={paywallError} lang={lang} facilityName={form.facility_name} />
        <ContinueBtn loading={loading} onClick={handleSubmit} disabled={!childForm.full_name || !childForm.date_of_birth || !childForm.gender}>
          <Check size={18} strokeWidth={2.5} /> {lang === 'sw' ? 'Maliza Usajili' : 'Complete Setup'}
        </ContinueBtn>
      </div>
    </div>
  );

  return null;
}