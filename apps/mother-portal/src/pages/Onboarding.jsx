import db from '@/api/totoafyaClient';

import React, { useState } from 'react';
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
    <div className="flex items-center gap-1 w-24">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-[3px] rounded-full transition-all duration-300 flex-1",
            i <= current ? "bg-[#044C3A]" : "bg-[#EAEAEA]"
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
        className="w-10 h-10 rounded-full bg-white border border-[#F0F0F0] flex items-center justify-center active:scale-[0.95] transition-transform shadow-sm"
      >
        <ArrowLeft size={16} className="text-[#0A0A0A]" />
      </button>
      <ProgressBar current={current} total={total} />
      <div className="w-10" />
    </div>
  );
}

function InputField({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] tracking-[0.12em] font-bold uppercase text-[#666666] px-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-[52px] px-4 bg-white border border-[#EAEAEA] rounded-[16px] text-[15px] font-medium text-[#0A0A0A] placeholder:text-[#C0C0C0] outline-none focus:border-[#044C3A] focus:shadow-[0_0_0_3px_rgba(4,76,58,0.06)] transition-all"
      />
    </div>
  );
}

function ContinueBtn({ onClick, disabled, loading, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full h-[56px] rounded-full bg-[#044C3A] text-white text-[16px] font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-[0_4px_18px_rgba(4,76,58,0.15)] disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed"
    >
      {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : children}
    </button>
  );
}

function PaywallAlert({ error, lang, facilityName }) {
  if (!error) return null;
  return (
    <div className="bg-rose-50 border border-rose-200 rounded-[20px] p-4 mb-4 text-left animate-in fade-in duration-200">
      <div className="flex gap-2.5">
        <span className="text-lg leading-none">⚠️</span>
        <div>
          <p className="text-[13px] font-bold text-rose-900 leading-tight">
            {lang === 'sw' ? 'Kituo cha Afya Kimejaa' : 'Facility Capacity Reached'}
          </p>
          <p className="text-[11.5px] text-rose-700 leading-relaxed mt-1">
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
      const edd = lmp ? new Date(new Date(lmp).getTime() + 280 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null;
      const effectiveMode = isCaregiverOnly ? 'child' : mode;

      let mother;
      let existingMothers = [];
      if (user?.id) {
        existingMothers = await db.entities.Mother.filter({ user_id: user.id });
      }

      if (existingMothers && existingMothers.length > 0) {
        mother = await db.entities.Mother.update(existingMothers[0].id, {
          ...form,
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
          ...form,
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
    <div className="min-h-screen bg-[#FCFCFC] flex flex-col max-w-[430px] mx-auto overflow-y-auto pb-10 font-sans">
      {/* Hero Image Card */}
      <div className="relative mx-4 mt-4 mb-6 h-[46vh] rounded-[32px] overflow-hidden flex-shrink-0 shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
        <img
          src="/onboarding_welcome.png"
          alt="Mother and baby"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#044C3A]/30 via-transparent to-black/10" />
        
        {/* Brand Pill */}
        <div className="absolute top-4 left-4">
          <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md rounded-full px-3.5 py-1.5 shadow-sm border border-[#F0F0F0]/50">
            <div className="w-7 h-7 rounded-[9px] bg-[#044C3A] flex items-center justify-center shadow-sm">
              <Heart size={13} className="text-white fill-white" />
            </div>
            <span className="text-[14px] font-extrabold text-[#0A0A0A] tracking-tight">TotoAfya</span>
          </div>
        </div>

        {/* Notification Icon */}
        <div className="absolute top-4 right-4">
          <button className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-sm border border-[#F0F0F0]/50 relative active:scale-95 transition-transform">
            <Bell size={16} className="text-[#0A0A0A]" />
            <div className="w-2.5 h-2.5 bg-[#044C3A] rounded-full absolute top-2 right-2 border-2 border-white" />
          </button>
        </div>
      </div>

      {/* Hero Content */}
      <div className="flex flex-col flex-1 px-6">
        <h1 className="text-[38px] font-bold leading-[1.1] text-[#0A0A0A] tracking-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          {lang === 'sw' ? 'Afya Bora' : 'Better Health'}{' '}
          <span className="text-[#044C3A] block">{lang === 'sw' ? 'Huanzia Hapa' : 'Starts Here'}</span>
        </h1>
        <p className="text-[14px] text-[#707070] font-semibold mt-2.5 tracking-tight">
          Your family health companion
        </p>

        {/* Highlight Feature Cards */}
        <div className="grid grid-cols-3 gap-2.5 mt-6 mb-8">
          {[
            { icon: '🤰', color: '#D946EF', bg: '#FFF0F5', en: 'Prenatal Care', sw: 'Huduma ya Ujauzito', subEn: 'Track & stay prepared', subSw: 'Kua tayari' },
            { icon: '🛡️', color: '#044C3A', bg: '#E8F5F2', en: 'Vaccine Tracker', sw: 'Ratiba ya Chanjo', subEn: 'Never miss a vaccine', subSw: 'Kamwe usikose' },
            { icon: '📈', color: '#2563EB', bg: '#EFF6FF', en: 'Growth Monitor', sw: 'Ukuaji wa Mtoto', subEn: 'Track growth with ease', subSw: 'Ukuaji rahisi' },
          ].map(({ icon, color, bg, en, sw, subEn, subSw }) => (
            <div key={en} className="bg-white rounded-[22px] p-3 border border-[#F0F0F0] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col items-center gap-1.5 text-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-[18px] shadow-sm" style={{ backgroundColor: bg }}>
                {icon}
              </div>
              <p className="text-[11px] font-extrabold leading-[1.25] tracking-tight" style={{ color }}>
                {lang === 'sw' ? sw : en}
              </p>
              <p className="text-[9px] text-[#999999] leading-tight font-medium">
                {lang === 'sw' ? subSw : subEn}
              </p>
            </div>
          ))}
        </div>

        {/* Language Picker */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <span className="text-[11px] tracking-[0.1em] font-bold uppercase text-[#999999]">Choose your language</span>
          <div className="bg-[#F2F2F2] rounded-full p-1 flex gap-1 w-full max-w-[280px]">
            {[
              { code: 'en', flagText: 'EN', label: 'English' },
              { code: 'sw', flagText: 'KE', label: 'Kiswahili' }
            ].map(({ code, flagText, label }) => {
              const selected = lang === code;
              return (
                <button
                  key={code}
                  onClick={() => setLanguage(code)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 h-9 rounded-full text-[13px] font-bold transition-all active:scale-[0.98]',
                    selected
                      ? 'bg-[#044C3A] text-white shadow-sm'
                      : 'text-[#666666]'
                  )}
                >
                  <div className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black',
                    selected ? 'bg-white/20 text-white' : 'bg-black/5 text-[#666666]'
                  )}>
                    {flagText}
                  </div>
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pb-6 mt-auto">
          <ContinueBtn onClick={() => setStep(1)}>
            <span>Get Started</span> <ArrowRight size={16} strokeWidth={2.5} />
          </ContinueBtn>
          <p className="text-center text-[11px] text-[#A0A0A0] mt-3.5 font-medium">
            {lang === 'sw' ? 'Inachukua dakika 2 tu' : 'Takes just 2 minutes'}
          </p>
        </div>
      </div>
    </div>
  );

  // ── STEP 1: Who are you? ─────────────────────────────────────────────────────
  if (step === 1) return (
    <div className="min-h-screen bg-[#FCFCFC] flex flex-col max-w-[430px] mx-auto px-6 pt-6 pb-10 font-sans">
      <StepHeader onBack={() => setStep(0)} current={0} total={4} />

      <div className="mb-8 flex-shrink-0">
        <p className="text-[11px] tracking-[0.15em] font-extrabold uppercase text-[#044C3A] mb-2">
          {lang === 'sw' ? 'HATUA 1 YA 4' : 'STEP 1 OF 4'}
        </p>
        <h2 className="text-[30px] font-bold leading-tight text-[#0A0A0A] tracking-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          {lang === 'sw' ? 'Wewe ni nani?' : 'Who are you?'}
        </h2>
        <p className="text-[14px] text-[#707070] font-medium mt-2 leading-relaxed">
          {lang === 'sw' ? 'Tutabinafsisha programu kwa hali yako' : "We'll personalize the app for your role"}
        </p>
      </div>

      <div className="flex flex-col gap-3.5 flex-1 overflow-y-auto">
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
            sub_en: 'Grandparent, aunt, uncle or other',
            sub_sw: 'Bibi, shangazi, mjomba au mlezi mwingine'
          },
        ].map(({ key, imgUrl, en, sw, sub_en, sub_sw }) => {
          const sel = caregiverType === key;
          return (
            <button
              key={key}
              onClick={() => { setCaregiverType(key); setStep(key === 'mother' ? 2 : 3); }}
              className={cn(
                'w-full rounded-[24px] p-3.5 border-2 text-left transition-all active:scale-[0.98] duration-200 flex items-center',
                sel
                  ? 'border-[#044C3A] bg-[#E8F5F2]/20 shadow-[0_4px_16px_rgba(4,76,58,0.04)]'
                  : 'bg-white border-[#F2F2F2]'
              )}
            >
              {/* Photo Image Left */}
              <div className="w-[72px] h-[72px] rounded-[18px] overflow-hidden flex-shrink-0 mr-4 shadow-sm">
                <img src={imgUrl} alt={en} className="w-full h-full object-cover" />
              </div>

              {/* Title & Description Middle */}
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-[16px] font-extrabold text-[#0A0A0A] tracking-tight">{lang === 'sw' ? sw : en}</p>
                <p className="text-[12px] text-[#707070] mt-1 font-semibold leading-tight">{lang === 'sw' ? sub_sw : sub_en}</p>
              </div>

              {/* Select indicator Right */}
              <div className="flex-shrink-0 ml-2">
                {sel ? (
                  <div className="w-6 h-6 rounded-full bg-[#044C3A] flex items-center justify-center shadow-sm">
                    <Check size={12} className="text-white" strokeWidth={3} />
                  </div>
                ) : (
                  <ChevronRight size={16} className="text-[#C0C0C0]" />
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
    <div className="min-h-screen bg-[#FCFCFC] flex flex-col max-w-[430px] mx-auto px-6 pt-6 pb-10 font-sans">
      <StepHeader onBack={() => setStep(1)} current={1} total={4} />

      <div className="mb-8 flex-shrink-0">
        <p className="text-[11px] tracking-[0.15em] font-extrabold uppercase text-[#044C3A] mb-2">
          {lang === 'sw' ? 'HATUA 2 YA 4' : 'STEP 2 OF 4'}
        </p>
        <h2 className="text-[30px] font-bold leading-tight text-[#0A0A0A] tracking-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          {lang === 'sw' ? 'Uko wapi katika safari yako?' : 'Where are you in your journey?'}
        </h2>
        <p className="text-[14px] text-[#707070] font-medium mt-2 leading-relaxed">
          {lang === 'sw' ? "Tutabadilisha programu" : "We'll tailor the app to your situation"}
        </p>
      </div>

      <div className="flex flex-col gap-3.5 flex-1 overflow-y-auto">
        {/* Pregnant option */}
        <button
          onClick={() => { setMode('pregnant'); setStep(3); }}
          className={cn(
            'w-full rounded-[24px] p-3.5 border-2 text-left transition-all active:scale-[0.98] duration-200 flex items-center',
            mode === 'pregnant' ? 'border-[#044C3A] bg-[#E8F5F2]/20 shadow-[0_4px_16px_rgba(4,76,58,0.04)]' : 'bg-white border-[#F2F2F2]'
          )}
        >
          <div className="w-[72px] h-[72px] rounded-[18px] overflow-hidden flex-shrink-0 mr-4 shadow-sm">
            <img
              src="/onboarding_journey_pregnant.png"
              alt="Pregnant"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0 pr-2">
            <p className="text-[16px] font-extrabold text-[#0A0A0A] tracking-tight">{lang === 'sw' ? 'Mimi ni mjamzito' : 'I am pregnant'}</p>
            <p className="text-[12px] text-[#707070] mt-1 font-semibold leading-tight">
              {lang === 'sw' ? 'Fuatilia ziara za ANC, ukuaji wa mtoto' : 'Track ANC visits, fetal development & milestones'}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {['ANC Tracker', 'Fetal Timeline'].map(tag => (
                <span key={tag} className="text-[9px] bg-[#E8F5F2] text-[#044C3A] px-2 py-0.5 rounded-full font-bold tracking-wide">{tag}</span>
              ))}
              <span className="text-[9px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full font-bold tracking-wide">Danger Alerts</span>
            </div>
          </div>
          <div className="flex-shrink-0 ml-2">
            <ChevronRight size={16} className="text-[#C0C0C0]" />
          </div>
        </button>

        {/* Child option */}
        <button
          onClick={() => { setMode('child'); setStep(3); }}
          className={cn(
            'w-full rounded-[24px] p-3.5 border-2 text-left transition-all active:scale-[0.98] duration-200 flex items-center',
            mode === 'child' ? 'border-[#044C3A] bg-[#E8F5F2]/20 shadow-[0_4px_16px_rgba(4,76,58,0.04)]' : 'bg-white border-[#F2F2F2]'
          )}
        >
          <div className="w-[72px] h-[72px] rounded-[18px] overflow-hidden flex-shrink-0 mr-4 shadow-sm">
            <img
              src="/onboarding_journey_child.png"
              alt="Child"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0 pr-2">
            <p className="text-[16px] font-extrabold text-[#0A0A0A] tracking-tight">{lang === 'sw' ? 'Nina mtoto tayari' : 'I already have a child'}</p>
            <p className="text-[12px] text-[#707070] mt-1 font-semibold leading-tight">
              {lang === 'sw' ? 'Fuatilia chanjo, ukuaji na hatua za maendeleo' : 'Track vaccines, growth charts & milestones'}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {['Vaccines', 'Growth Chart', 'Milestones'].map(tag => (
                <span key={tag} className="text-[9px] bg-[#E8F5F2] text-[#044C3A] px-2 py-0.5 rounded-full font-bold tracking-wide">{tag}</span>
              ))}
            </div>
          </div>
          <div className="flex-shrink-0 ml-2">
            <ChevronRight size={16} className="text-[#C0C0C0]" />
          </div>
        </button>

        {/* Both option */}
        <button
          onClick={() => { setMode('pregnant'); setStep(3); }}
          className="w-full rounded-[24px] p-3.5 border border-dashed border-[#E0E0E0] bg-white text-left transition-all active:scale-[0.98] duration-200 flex items-center"
        >
          <div className="w-[72px] h-[72px] rounded-[18px] overflow-hidden flex-shrink-0 mr-4 shadow-sm">
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
            <ChevronRight size={16} className="text-[#C0C0C0]" />
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
      <div className="min-h-screen bg-[#FCFCFC] flex flex-col max-w-[430px] mx-auto px-6 pt-6 pb-10 font-sans">
        <StepHeader onBack={() => setStep(isCaregiverOnly ? 1 : 2)} current={dotIndex} total={dotTotal} />

        <div className="mb-8 flex-shrink-0">
          <p className="text-[11px] tracking-[0.15em] font-extrabold uppercase text-[#044C3A] mb-2">{stepLabel}</p>
          <h2 className="text-[30px] font-bold leading-tight text-[#0A0A0A] tracking-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            {lang === 'sw' ? 'Maelezo Yako' : 'Your Details'}
          </h2>
          <p className="text-[14px] text-[#707070] font-medium mt-2 leading-relaxed">
            {lang === 'sw' ? 'Taarifa zako ziko salama' : 'Your information is secure and private'}
          </p>
        </div>

        <div className="flex flex-col gap-4 flex-1 overflow-y-auto">
          <InputField label={t('full_name')} value={form.full_name} onChange={v => setF('full_name', v)}
            placeholder={lang === 'sw' ? 'Jina kamili lako' : 'Your full name'} />
          <InputField label={t('phone_number')} value={form.phone} onChange={v => setF('phone', v)}
            type="tel" placeholder="+254 7XX XXX XXX" />

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] tracking-[0.12em] font-bold uppercase text-[#666666] px-1">{t('county')}</label>
            <select
              value={form.county}
              onChange={e => setF('county', e.target.value)}
              className="h-[52px] px-4 bg-white border border-[#EAEAEA] rounded-[16px] text-[15px] font-medium text-[#0A0A0A] outline-none focus:border-[#044C3A] focus:shadow-[0_0_0_3px_rgba(4,76,58,0.06)] transition-all appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23999' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}
            >
              <option value="">{lang === 'sw' ? 'Chagua kaunti' : 'Select county'}</option>
              {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
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
          <div className="bg-white rounded-[24px] border border-[#F2F2F2] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.01)] mt-2">
            <div className="px-4 py-3 bg-[#FAFAFA] border-b border-[#F0F0F0]">
              <p className="text-[11px] tracking-[0.12em] font-extrabold uppercase text-[#666666]">
                {lang === 'sw' ? 'NAMBARI ZA HOSPITALI (SI LAZIMA)' : 'FACILITY PHONES (OPTIONAL)'}
              </p>
            </div>
            <div className="p-4 flex flex-col gap-3.5">
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
    <div className="min-h-screen bg-[#FCFCFC] flex flex-col max-w-[430px] mx-auto px-6 pt-6 pb-10 font-sans">
      <StepHeader onBack={() => setStep(3)} current={2} total={3} />

      <div className="mb-8 flex-shrink-0">
        <div className="inline-flex items-center gap-2 bg-[#044C3A]/10 rounded-full px-3 py-1.5 mb-3.5">
          <span className="text-xs">{caregiverType === 'father' ? '👨' : '🧑'}</span>
          <span className="text-[10px] font-extrabold text-[#044C3A] tracking-wider uppercase">
            {lang === 'sw' ? (caregiverType === 'father' ? 'BABA' : 'MLEZI') : (caregiverType === 'father' ? 'FATHER' : 'GUARDIAN')}
          </span>
        </div>
        <h2 className="text-[30px] font-bold leading-tight text-[#0A0A0A] tracking-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          {lang === 'sw' ? 'Watoto Wanaohusika' : 'Children in Your Care'}
        </h2>
        <p className="text-[14px] text-[#707070] font-medium mt-2 leading-relaxed">
          {lang === 'sw' ? 'Unaweza kuongeza watoto baadaye pia' : 'You can add more children later'}
        </p>
      </div>

      <div className="flex flex-col gap-4 flex-1 overflow-y-auto">
        <div className="bg-white rounded-[24px] border border-[#F2F2F2] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
          <p className="text-[11px] tracking-[0.12em] font-extrabold uppercase text-[#999999] mb-4">
            {lang === 'sw' ? 'MTOTO WA KWANZA (SI LAZIMA)' : 'FIRST CHILD (OPTIONAL)'}
          </p>
          <div className="flex flex-col gap-4">
            <InputField
              label={lang === 'sw' ? 'JINA LA MTOTO' : "CHILD'S NAME"}
              value={childForm.full_name} onChange={v => setC('full_name', v)}
              placeholder={lang === 'sw' ? 'Jina kamili' : "Child's full name"} />
            <InputField
              label={lang === 'sw' ? 'TAREHE YA KUZALIWA' : 'DATE OF BIRTH'}
              value={childForm.date_of_birth} onChange={v => setC('date_of_birth', v)} type="date" />
            <div>
              <label className="text-[11px] tracking-[0.12em] font-bold uppercase text-[#666666] block mb-2 px-1">
                {lang === 'sw' ? 'JINSIA' : 'GENDER'}
              </label>
              <div className="flex gap-2">
                {[
                  { v: 'male', icon: '👦', en: 'Boy', sw: 'Mvulana', activeColor: '#044C3A', activeBg: '#E8F5F2' },
                  { v: 'female', icon: '👧', en: 'Girl', sw: 'Msichana', activeColor: '#D946A8', activeBg: '#FDF2FA' }
                ].map(({ v, icon, en, sw, activeColor, activeBg }) => {
                  const active = childForm.gender === v;
                  return (
                    <button
                      key={v}
                      onClick={() => setC('gender', v)}
                      className={cn(
                        'flex-1 h-12 rounded-[16px] flex items-center justify-center gap-2 border-2 transition-all active:scale-[0.97] font-extrabold text-[14px]',
                        active
                          ? 'shadow-[0_2px_12px_rgba(0,0,0,0.02)]'
                          : 'border-[#F2F2F2] bg-white text-[#666666]'
                      )}
                      style={active ? { borderColor: activeColor, backgroundColor: activeBg, color: activeColor } : {}}
                    >
                      <span>{icon}</span> {lang === 'sw' ? sw : en}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 bg-[#044C3A]/5 border border-[#044C3A]/10 rounded-[20px] p-4 mt-2">
          <span className="text-lg flex-shrink-0">ℹ️</span>
          <p className="text-[12.5px] text-[#555] leading-relaxed font-semibold">
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
    <div className="min-h-screen bg-[#FCFCFC] flex flex-col max-w-[430px] mx-auto px-6 pt-6 pb-10 font-sans">
      <StepHeader onBack={() => setStep(3)} current={3} total={4} />

      <div className="mb-8 flex-shrink-0">
        <div className="inline-flex items-center gap-2 bg-[#044C3A]/10 rounded-full px-3 py-1.5 mb-3.5">
          <span className="text-xs">🤰</span>
          <span className="text-[10px] font-extrabold text-[#044C3A] tracking-wider uppercase">
            {lang === 'sw' ? 'HALI YA UJAUZITO' : 'PREGNANCY'}
          </span>
        </div>
        <h2 className="text-[30px] font-bold leading-tight text-[#0A0A0A] tracking-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          {lang === 'sw' ? 'Kuhusu Ujauzito Wako' : 'About Your Pregnancy'}
        </h2>
      </div>

      <div className="flex flex-col gap-5 flex-1 overflow-y-auto">
        {/* Trimester */}
        <div>
          <label className="text-[11px] tracking-[0.12em] font-bold uppercase text-[#666666] block mb-3 px-1">
            {lang === 'sw' ? 'UKO KATIKA KIPINDI GANI?' : 'WHICH TRIMESTER?'}
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { v: 1, en: '1st', sw: 'Kwanza', sub: '1–13 wks', color: '#7C3AED', bg: '#F5F3FF' },
              { v: 2, en: '2nd', sw: 'Pili', sub: '14–27 wks', color: '#044C3A', bg: '#E8F5F2' },
              { v: 3, en: '3rd', sw: 'Tatu', sub: '28+ wks', color: '#2E7A5D', bg: '#ECFDF5' },
            ].map(({ v, en, sw, sub, color, bg }) => {
              const active = pregForm.trimester === v;
              return (
                <button
                  key={v}
                  onClick={() => setP('trimester', v)}
                  className={cn(
                    'rounded-[20px] py-4 flex flex-col items-center gap-1 border-2 transition-all active:scale-[0.96] shadow-[0_2px_6px_rgba(0,0,0,0.01)]',
                    active ? 'shadow-[0_4px_16px_rgba(0,0,0,0.03)]' : 'border-[#F2F2F2] bg-white'
                  )}
                  style={active ? { borderColor: color, backgroundColor: bg } : {}}
                >
                  <span className="text-[20px] font-black" style={{ color: active ? color : '#0A0A0A' }}>
                    {lang === 'sw' ? sw : en}
                  </span>
                  <span className="text-[10px] text-[#999] font-bold">{sub}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* OR LMP */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-px bg-[#EAEAEA]" />
            <span className="text-[11px] text-[#C0C0C0] font-bold tracking-wider">{lang === 'sw' ? 'AU INGIZA TAREHE' : 'OR ENTER EXACT DATE'}</span>
            <div className="flex-1 h-px bg-[#EAEAEA]" />
          </div>
          <InputField
            label={lang === 'sw' ? 'Tarehe ya Hedhi ya Mwisho (LMP)' : 'Last Menstrual Period (LMP)'}
            value={pregForm.lmp} onChange={v => setP('lmp', v)} type="date" />
        </div>

        {/* First pregnancy */}
        <div>
          <label className="text-[11px] tracking-[0.12em] font-bold uppercase text-[#666666] block mb-3 px-1">
            {lang === 'sw' ? 'JE, HII NI UJAUZITO WA KWANZA?' : 'IS THIS YOUR FIRST PREGNANCY?'}
          </label>
          <div className="flex gap-2">
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
                    'flex-1 h-12 rounded-[16px] text-[13px] font-extrabold border-2 transition-all active:scale-[0.97]',
                    active
                      ? 'bg-[#044C3A] text-white border-[#044C3A] shadow-[0_4px_16px_rgba(4,76,58,0.15)]'
                      : 'bg-white border-[#F2F2F2] text-[#666666]'
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
          <label className="text-[11px] tracking-[0.12em] font-bold uppercase text-[#666666] block mb-3 px-1">
            {lang === 'sw' ? 'MAMBO YANAYOATHIRI AFYA' : 'RISK FACTORS (SELECT ALL THAT APPLY)'}
          </label>
          <div className="flex flex-wrap gap-2">
            {RISK_FACTORS.map(({ key, en, sw }) => {
              const selected = pregForm.risk_factors.includes(key);
              return (
                <button
                  key={key}
                  onClick={() => toggleRisk(key)}
                  className={cn(
                    'px-4 py-2.5 rounded-full text-[13px] font-bold border transition-all active:scale-[0.96]',
                    selected
                      ? 'bg-[#0A0A0A] text-white border-[#0A0A0A] shadow-sm'
                      : 'bg-white border-[#EAEAEA] text-[#555]'
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
    <div className="min-h-screen bg-[#FCFCFC] flex flex-col max-w-[430px] mx-auto px-6 pt-6 pb-10 font-sans">
      <StepHeader onBack={() => setStep(3)} current={3} total={4} />

      <div className="mb-8 flex-shrink-0">
        <div className="inline-flex items-center gap-2 bg-[#044C3A]/10 rounded-full px-3 py-1.5 mb-3.5">
          <span className="text-xs">👶</span>
          <span className="text-[10px] font-extrabold text-[#044C3A] tracking-wider uppercase">
            {lang === 'sw' ? 'MAELEZO YA MTOTO' : 'CHILD DETAILS'}
          </span>
        </div>
        <h2 className="text-[30px] font-bold leading-tight text-[#0A0A0A] tracking-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          {lang === 'sw' ? 'Mwambie kidogo kuhusu mtoto wako' : 'Tell us about your child'}
        </h2>
      </div>

      <div className="flex flex-col gap-4.5 flex-1 overflow-y-auto">
        <InputField
          label={lang === 'sw' ? "JINA LA MTOTO" : "CHILD'S NAME"}
          value={childForm.full_name} onChange={v => setC('full_name', v)}
          placeholder={lang === 'sw' ? 'Jina kamili' : "Child's full name"} />
        <InputField
          label={lang === 'sw' ? 'TAREHE YA KUZALIWA' : 'DATE OF BIRTH'}
          value={childForm.date_of_birth} onChange={v => setC('date_of_birth', v)} type="date" />

        <div>
          <label className="text-[11px] tracking-[0.12em] font-bold uppercase text-[#666666] block mb-3 px-1">
            {lang === 'sw' ? 'JINSIA' : 'GENDER'}
          </label>
          <div className="flex gap-3">
            {[
              { v: 'male', icon: '👦', en: 'Boy', sw: 'Mvulana', activeColor: '#044C3A', activeBg: '#E8F5F2' },
              { v: 'female', icon: '👧', en: 'Girl', sw: 'Msichana', activeColor: '#D946A8', activeBg: '#FDF2FA' }
            ].map(({ v, icon, en, sw, activeColor, activeBg }) => {
              const active = childForm.gender === v;
              return (
                <button
                  key={v}
                  onClick={() => setC('gender', v)}
                  className={cn(
                    'flex-1 py-4.5 rounded-[22px] flex flex-col items-center gap-1.5 border-2 transition-all active:scale-[0.97]',
                    active
                      ? 'shadow-[0_4px_16px_rgba(0,0,0,0.02)]'
                      : 'border-[#F2F2F2] bg-white text-[#666666]'
                  )}
                  style={active ? { borderColor: activeColor, backgroundColor: activeBg } : {}}
                >
                  <span className="text-3xl mb-0.5">{icon}</span>
                  <span className="text-[14px] font-black" style={{ color: active ? activeColor : '#666' }}>
                    {lang === 'sw' ? sw : en}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] tracking-[0.12em] font-bold uppercase text-[#666666] px-1">
            {lang === 'sw' ? 'UZITO WA KUZALIWA (SI LAZIMA)' : 'BIRTH WEIGHT — OPTIONAL'}
          </label>
          <div className="flex items-center gap-2 bg-white border border-[#EAEAEA] rounded-[16px] px-4 focus-within:border-[#044C3A] focus-within:shadow-[0_0_0_3px_rgba(4,76,58,0.06)] transition-all shadow-[0_2px_6px_rgba(0,0,0,0.01)]">
            <input type="number" value={childForm.birth_weight_kg}
              onChange={e => setC('birth_weight_kg', e.target.value)}
              placeholder="e.g. 3.2" step="0.1" min="0.5" max="6"
              className="flex-1 h-[52px] text-[15px] font-medium text-[#0A0A0A] placeholder:text-[#C0C0C0] outline-none bg-transparent" />
            <span className="text-[14px] font-extrabold text-[#A0A0A0]">kg</span>
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