import db from '@/api/totoafyaClient';

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Bell, 
  ChevronRight, 
  Heart,
  Shield,
  TrendingUp,
  Sparkles,
  BookOpen,
  MapPin,
  Syringe,
  Calendar,
  Activity,
  CheckCircle
} from 'lucide-react';

import { useLang } from '@/context/LanguageContext';
import { useAuth } from '../lib/AuthContext';
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

function BrandHeader() {
  return (
    <div className="flex items-center gap-2 select-none">
      <div className="rounded-xl bg-gradient-to-br from-[#1B6B5A] to-[#145244] w-9 h-9 flex items-center justify-center shadow-md">
        <Heart size={14} className="text-white fill-white" />
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-bold tracking-tight text-[#0A0A0A] text-md">
          <span className="text-[#1B6B5A]">Toto</span>
          <span className="text-[#C8813A]">Afya</span>
        </span>
        <span className="font-semibold tracking-[0.2em] text-[#1B6B5A] uppercase text-[7px]">
          Digital
        </span>
      </div>
    </div>
  );
}

function ProgressBar({ current, total }) {
  return (
    <div className="flex items-center gap-1.5 w-24">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-1 rounded-full transition-all duration-500 ease-out flex-1",
            i <= current ? "bg-[#1B6B5A]" : "bg-gray-200"
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
        className="w-10 h-10 rounded-full bg-white border border-[#E5E5E5] flex items-center justify-center active:scale-[0.92] transition-transform shadow-sm hover:border-[#1B6B5A]/20"
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
        className="h-[52px] px-4 bg-white border border-gray-200 rounded-[16px] text-[15px] font-medium text-[#0A0A0A] placeholder:text-[#C0C0C0] outline-none focus:border-[#1B6B5A] focus:shadow-[0_0_0_3px_rgba(27,107,90,0.06)] transition-all"
      />
    </div>
  );
}

function ContinueBtn({ onClick, disabled, loading, icon: Icon = ArrowRight, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full h-[56px] rounded-full bg-[#1B6B5A] hover:bg-[#145244] text-white text-[16px] font-bold flex items-center justify-between pl-6 pr-2.5 active:scale-[0.98] transition-all shadow-teal-glow disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed"
    >
      {loading ? (
        <div className="w-full flex justify-center items-center">
          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <span className="flex-1 text-center font-bold tracking-tight">{children}</span>
          <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
            <Icon size={18} className="text-white" strokeWidth={2.5} />
          </div>
        </>
      )}
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
  const { user, checkAppState } = useAuth();
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
      // Refresh user session so profile_complete is updated in React state
      await checkAppState();
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
    <div className="min-h-screen bg-[#FDFCF8] flex flex-col max-w-[430px] mx-auto overflow-y-auto pb-10 font-sans">
      {/* Soft integrated top cover banner (Google/Apple layout) */}
      <div className="relative w-full h-[40vh] flex-shrink-0 overflow-hidden bg-[#FDFCF8]">
        <img
          src="/onboarding_welcome.png"
          alt="Welcome to TotoAfya"
          className="w-full h-full object-cover"
        />
        {/* Soft fade overlay to blend the banner into the page's background */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#FDFCF8] via-[#FDFCF8]/90 to-transparent" />
        
        {/* Brand logo pill */}
        <div className="absolute top-6 left-6">
          <BrandHeader />
        </div>
      </div>

      {/* Title block */}
      <div className="flex flex-col flex-1 px-6">
        <h1 className="text-[34px] font-extrabold leading-[1.15] text-[#0A0A0A] tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Welcome to <br />
          <span className="text-[#1B6B5A]">Toto</span><span className="text-[#C8813A]">Afya</span> <span className="text-[#1B6B5A]">Digital</span>
        </h1>
        <p className="text-[14px] text-gray-500 font-semibold mt-2.5 leading-relaxed tracking-tight">
          Your trusted companion through pregnancy, child growth and family health.
        </p>

        {/* Feature Icons Grid (soft styled, borderless) */}
        <div className="grid grid-cols-3 gap-4 my-6">
          {[
            { label: 'Prenatal Care', icon: Heart, bg: 'bg-[#C8813A]/10', color: 'text-[#C8813A]' },
            { label: 'Vaccines', icon: Shield, bg: 'bg-[#1B6B5A]/10', color: 'text-[#1B6B5A]' },
            { label: 'Growth Tracking', icon: TrendingUp, bg: 'bg-[#2E7A5D]/10', color: 'text-[#2E7A5D]' }
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center text-center gap-1.5">
              <div className={`w-11 h-11 rounded-full ${item.bg} flex items-center justify-center`}>
                <item.icon size={20} className={item.color} />
              </div>
              <span className="text-[11px] font-bold text-gray-700 leading-tight">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Language selector */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="bg-gray-100 rounded-full p-1 flex gap-1 w-full max-w-[240px]">
            {[
              { code: 'en', label: 'English' },
              { code: 'sw', label: 'Kiswahili' }
            ].map(({ code, label }) => {
              const selected = lang === code;
              return (
                <button
                  key={code}
                  onClick={() => setLanguage(code)}
                  className={cn(
                    'flex-1 py-1.5 rounded-full text-[12px] font-bold transition-all active:scale-[0.97]',
                    selected ? 'bg-[#1B6B5A] text-white shadow-sm' : 'text-[#666666]'
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Call to Action */}
        <div className="pb-6 mt-auto">
          <ContinueBtn onClick={() => setStep(1)}>
            {lang === 'sw' ? 'Anza Sasa' : 'Get Started'}
          </ContinueBtn>
          <p className="text-center text-[11px] text-gray-400 mt-3 font-semibold">
            {lang === 'sw' ? 'Inachukua dakika 2 tu' : 'Takes just 2 minutes'}
          </p>
        </div>
      </div>
    </div>
  );

  // ── STEP 1: Who are you? ─────────────────────────────────────────────────────
  if (step === 1) return (
    <div className="min-h-screen bg-[#FDFCF8] flex flex-col max-w-[430px] mx-auto px-6 pt-6 pb-10 font-sans">
      <StepHeader onBack={() => setStep(0)} current={0} total={4} />

      <div className="mb-8 flex-shrink-0">
        <p className="text-[11px] tracking-[0.15em] font-extrabold uppercase text-[#1B6B5A] mb-2">
          {lang === 'sw' ? 'HATUA 1 YA 4' : 'STEP 1 OF 4'}
        </p>
        <h2 className="text-[30px] font-bold leading-tight text-[#0A0A0A] tracking-tight animate-fade-in" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {lang === 'sw' ? 'Wewe ni nani?' : 'Who are you?'}
        </h2>
        <p className="text-[14px] text-gray-500 font-semibold mt-1 leading-relaxed">
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
                'w-full rounded-[24px] p-3 border-2 text-left transition-all active:scale-[0.98] duration-200 flex items-center shadow-card hover:shadow-card-hover',
                sel
                  ? 'border-[#1B6B5A] bg-[#1B6B5A]/[0.01] shadow-teal-glow-sm'
                  : 'bg-white border-gray-100'
              )}
            >
              {/* Photo Image Left (borderless, soft) */}
              <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 mr-4 shadow-sm bg-gray-50">
                <img src={imgUrl} alt={en} className="w-full h-full object-cover" />
              </div>

              {/* Title & Description Middle */}
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-[16px] font-extrabold text-[#0A0A0A] tracking-tight">{lang === 'sw' ? sw : en}</p>
                <p className="text-[12px] text-gray-500 mt-1 font-semibold leading-tight">{lang === 'sw' ? sub_sw : sub_en}</p>
              </div>

              {/* Select indicator Right */}
              <div className="flex-shrink-0 ml-2">
                {sel ? (
                  <div className="w-6 h-6 rounded-full bg-[#1B6B5A] flex items-center justify-center shadow-sm">
                    <Check size={12} className="text-white" strokeWidth={3} />
                  </div>
                ) : (
                  <ChevronRight size={16} className="text-gray-300" />
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

      <div className="mb-8 flex-shrink-0">
        <p className="text-[11px] tracking-[0.15em] font-extrabold uppercase text-[#1B6B5A] mb-2">
          {lang === 'sw' ? 'HATUA 2 YA 4' : 'STEP 2 OF 4'}
        </p>
        <h2 className="text-[30px] font-bold leading-tight text-[#0A0A0A] tracking-tight animate-fade-in" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {lang === 'sw' ? 'Uko wapi katika safari yako?' : 'Where are you in your journey?'}
        </h2>
        <p className="text-[14px] text-gray-500 font-semibold mt-1 leading-relaxed">
          {lang === 'sw' ? "Tutabadilisha programu" : "We'll tailor the app to your situation"}
        </p>
      </div>

      <div className="flex flex-col gap-3.5 flex-1 overflow-y-auto">
        {/* Pregnant option */}
        <button
          onClick={() => { setMode('pregnant'); setStep(3); }}
          className={cn(
            'w-full rounded-[24px] p-3 border-2 text-left transition-all active:scale-[0.98] duration-200 flex items-center shadow-card hover:shadow-card-hover',
            mode === 'pregnant' ? 'border-[#1B6B5A] bg-[#1B6B5A]/[0.01] shadow-teal-glow-sm' : 'bg-white border-gray-100'
          )}
        >
          <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 mr-4 shadow-sm bg-gray-50">
            <img
              src="/onboarding_journey_pregnant.png"
              alt="Pregnant"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0 pr-2">
            <p className="text-[16px] font-extrabold text-[#0A0A0A] tracking-tight">{lang === 'sw' ? 'Mimi ni mjamzito' : 'I am pregnant'}</p>
            <p className="text-[12px] text-gray-500 mt-1 font-semibold leading-tight">
              {lang === 'sw' ? 'Fuatilia ziara za ANC, ukuaji wa mtoto' : 'Track ANC visits, fetal development & milestones'}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {['ANC Tracker', 'Fetal Timeline'].map(tag => (
                <span key={tag} className="text-[9px] bg-[#1B6B5A]/10 text-[#1B6B5A] px-2 py-0.5 rounded-full font-bold tracking-wide">{tag}</span>
              ))}
              <span className="text-[9px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full font-bold tracking-wide">Danger Alerts</span>
            </div>
          </div>
          <div className="flex-shrink-0 ml-2">
            <ChevronRight size={16} className="text-gray-300" />
          </div>
        </button>

        {/* Child option */}
        <button
          onClick={() => { setMode('child'); setStep(3); }}
          className={cn(
            'w-full rounded-[24px] p-3 border-2 text-left transition-all active:scale-[0.98] duration-200 flex items-center shadow-card hover:shadow-card-hover',
            mode === 'child' ? 'border-[#1B6B5A] bg-[#1B6B5A]/[0.01] shadow-teal-glow-sm' : 'bg-white border-gray-100'
          )}
        >
          <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 mr-4 shadow-sm bg-gray-50">
            <img
              src="/onboarding_journey_child.png"
              alt="Child"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0 pr-2">
            <p className="text-[16px] font-extrabold text-[#0A0A0A] tracking-tight">{lang === 'sw' ? 'Nina mtoto tayari' : 'I already have a child'}</p>
            <p className="text-[12px] text-gray-500 mt-1 font-semibold leading-tight">
              {lang === 'sw' ? 'Fuatilia chanjo, ukuaji na hatua za maendeleo' : 'Track vaccines, growth charts & milestones'}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {['Vaccines', 'Growth Chart', 'Milestones'].map(tag => (
                <span key={tag} className="text-[9px] bg-[#1B6B5A]/10 text-[#1B6B5A] px-2 py-0.5 rounded-full font-bold tracking-wide">{tag}</span>
              ))}
            </div>
          </div>
          <div className="flex-shrink-0 ml-2">
            <ChevronRight size={16} className="text-gray-300" />
          </div>
        </button>

        {/* Both option */}
        <button
          onClick={() => { setMode('pregnant'); setStep(3); }}
          className="w-full rounded-[24px] p-3 border border-dashed border-gray-200 bg-white text-left transition-all active:scale-[0.98] duration-200 flex items-center shadow-card hover:border-[#1B6B5A]/30"
        >
          <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 mr-4 shadow-sm bg-gray-50">
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
            <ChevronRight size={16} className="text-gray-300" />
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

        <div className="mb-8 flex-shrink-0">
          <p className="text-[11px] tracking-[0.15em] font-extrabold uppercase text-[#1B6B5A] mb-2">{stepLabel}</p>
          <h2 className="text-[30px] font-bold leading-tight text-[#0A0A0A] tracking-tight animate-fade-in" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {lang === 'sw' ? 'Maelezo Yako' : 'Your Details'}
          </h2>
          <p className="text-[14px] text-gray-500 font-semibold mt-1 leading-relaxed">
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
              className="h-[52px] px-4 bg-white border border-gray-200 rounded-[16px] text-[15px] font-medium text-[#0A0A0A] outline-none focus:border-[#1B6B5A] focus:shadow-[0_0_0_3px_rgba(27,107,90,0.06)] transition-all appearance-none"
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

          {/* Hospital emergency details (soft outline) */}
          <div className="bg-white rounded-[24px] border border-gray-150 overflow-hidden shadow-card mt-2">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <p className="text-[11px] tracking-[0.12em] font-extrabold uppercase text-gray-500">
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
            {lang === 'sw' ? 'Endelea' : 'Continue'}
          </ContinueBtn>
        </div>
      </div>
    );
  }

  // ── STEP 4C: Father / Guardian ───────────────────────────────────────────────
  if (step === 4 && (caregiverType === 'father' || caregiverType === 'guardian')) return (
    <div className="min-h-screen bg-[#FDFCF8] flex flex-col max-w-[430px] mx-auto px-6 pt-6 pb-10 font-sans">
      <StepHeader onBack={() => setStep(3)} current={2} total={3} />

      <div className="mb-8 flex-shrink-0">
        <div className="inline-flex items-center gap-2 bg-[#1B6B5A]/10 rounded-full px-3 py-1.5 mb-3.5">
          <span className="text-xs">{caregiverType === 'father' ? '👨' : '🧑'}</span>
          <span className="text-[10px] font-extrabold text-[#1B6B5A] tracking-wider uppercase">
            {lang === 'sw' ? (caregiverType === 'father' ? 'BABA' : 'MLEZI') : (caregiverType === 'father' ? 'FATHER' : 'GUARDIAN')}
          </span>
        </div>
        <h2 className="text-[30px] font-bold leading-tight text-[#0A0A0A] tracking-tight animate-fade-in" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {lang === 'sw' ? 'Watoto Wanaohusika' : 'Children in Your Care'}
        </h2>
        <p className="text-[14px] text-gray-500 font-semibold mt-1 leading-relaxed">
          {lang === 'sw' ? 'Unaweza kuongeza watoto baadaye pia' : 'You can add more children later'}
        </p>
      </div>

      <div className="flex flex-col gap-4 flex-1 overflow-y-auto">
        <div className="bg-white rounded-[24px] border border-gray-150 p-5 shadow-card">
          <p className="text-[11px] tracking-[0.12em] font-extrabold uppercase text-gray-400 mb-4">
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
                  { v: 'male', icon: '👦', en: 'Boy', sw: 'Mvulana', activeColor: '#1B6B5A', activeBg: '#E8F5F2' },
                  { v: 'female', icon: '👧', en: 'Girl', sw: 'Msichana', activeColor: '#C8813A', activeBg: '#FDF7F2' }
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
                          : 'border-gray-100 bg-white text-[#666666]'
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

        <div className="flex gap-3 bg-[#1B6B5A]/5 border border-[#1B6B5A]/10 rounded-[20px] p-4 mt-2">
          <span className="text-lg flex-shrink-0">ℹ️</span>
          <p className="text-[12.5px] text-gray-600 leading-relaxed font-semibold">
            {lang === 'sw'
              ? 'Kama baba au mlezi, utaweza kuona chanjo, ukuaji na arifa za afya za watoto wote.'
              : "As a father or guardian, you'll track vaccines, growth, and health alerts for all children."}
          </p>
        </div>
      </div>

      <div className="mt-6 flex-shrink-0">
        <PaywallAlert error={paywallError} lang={lang} facilityName={form.facility_name} />
        <ContinueBtn loading={loading} onClick={handleSubmit} icon={Check}>
          {lang === 'sw' ? 'Maliza Usajili' : 'Complete Setup'}
        </ContinueBtn>
      </div>
    </div>
  );

  // ── STEP 4A: Pregnancy Detail ────────────────────────────────────────────────
  if (step === 4 && mode === 'pregnant') return (
    <div className="min-h-screen bg-[#FDFCF8] flex flex-col max-w-[430px] mx-auto px-6 pt-6 pb-10 font-sans">
      <StepHeader onBack={() => setStep(3)} current={3} total={4} />

      <div className="mb-8 flex-shrink-0">
        <div className="inline-flex items-center gap-2 bg-[#1B6B5A]/10 rounded-full px-3 py-1.5 mb-3.5">
          <span className="text-xs">🤰</span>
          <span className="text-[10px] font-extrabold text-[#1B6B5A] tracking-wider uppercase">
            {lang === 'sw' ? 'HALI YA UJAUZITO' : 'PREGNANCY'}
          </span>
        </div>
        <h2 className="text-[30px] font-bold leading-tight text-[#0A0A0A] tracking-tight animate-fade-in" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
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
              { v: 2, en: '2nd', sw: 'Pili', sub: '14–27 wks', color: '#1B6B5A', bg: '#E8F5F2' },
              { v: 3, en: '3rd', sw: 'Tatu', sub: '28+ wks', color: '#2E7A5D', bg: '#ECFDF5' },
            ].map(({ v, en, sw, sub, color, bg }) => {
              const active = pregForm.trimester === v;
              return (
                <button
                  key={v}
                  onClick={() => setP('trimester', v)}
                  className={cn(
                    'rounded-[20px] py-4 flex flex-col items-center gap-1 border-2 transition-all active:scale-[0.96] shadow-card',
                    active ? 'shadow-card-hover' : 'border-gray-100 bg-white'
                  )}
                  style={active ? { borderColor: color, backgroundColor: bg } : {}}
                >
                  <span className="text-[20px] font-black" style={{ color: active ? color : '#0A0A0A' }}>
                    {lang === 'sw' ? sw : en}
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold">{sub}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* OR LMP */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[11px] text-gray-400 font-bold tracking-wider">{lang === 'sw' ? 'AU INGIZA TAREHE' : 'OR ENTER EXACT DATE'}</span>
            <div className="flex-1 h-px bg-gray-200" />
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
                      ? 'bg-[#1B6B5A] text-white border-[#1B6B5A] shadow-teal-glow'
                      : 'bg-white border-gray-100 text-[#666666]'
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
                      : 'bg-white border-gray-200 text-gray-600'
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
        <ContinueBtn loading={loading} onClick={handleSubmit} disabled={!pregForm.trimester && !pregForm.lmp} icon={Check}>
          {lang === 'sw' ? 'Maliza Usajili' : 'Complete Setup'}
        </ContinueBtn>
      </div>
    </div>
  );

  // ── STEP 4B: Child Detail ────────────────────────────────────────────────────
  if (step === 4 && mode === 'child') return (
    <div className="min-h-screen bg-[#FDFCF8] flex flex-col max-w-[430px] mx-auto px-6 pt-6 pb-10 font-sans">
      <StepHeader onBack={() => setStep(3)} current={3} total={4} />

      <div className="mb-8 flex-shrink-0">
        <div className="inline-flex items-center gap-2 bg-[#1B6B5A]/10 rounded-full px-3 py-1.5 mb-3.5">
          <span className="text-xs">👶</span>
          <span className="text-[10px] font-extrabold text-[#1B6B5A] tracking-wider uppercase">
            {lang === 'sw' ? 'MAELEZO YA MTOTO' : 'CHILD DETAILS'}
          </span>
        </div>
        <h2 className="text-[30px] font-bold leading-tight text-[#0A0A0A] tracking-tight animate-fade-in" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
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
              { v: 'male', icon: '👦', en: 'Boy', sw: 'Mvulana', activeColor: '#1B6B5A', activeBg: '#E8F5F2' },
              { v: 'female', icon: '👧', en: 'Girl', sw: 'Msichana', activeColor: '#C8813A', activeBg: '#FDF7F2' }
            ].map(({ v, icon, en, sw, activeColor, activeBg }) => {
              const active = childForm.gender === v;
              return (
                <button
                  key={v}
                  onClick={() => setC('gender', v)}
                  className={cn(
                    'flex-1 py-4.5 rounded-[22px] flex flex-col items-center gap-1.5 border-2 transition-all active:scale-[0.97] shadow-card',
                    active
                      ? 'shadow-card-hover'
                      : 'border-gray-100 bg-white text-gray-500'
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
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-[16px] px-4 focus-within:border-[#1B6B5A] focus-within:shadow-[0_0_0_3px_rgba(27,107,90,0.06)] transition-all shadow-[0_2px_6px_rgba(0,0,0,0.01)]">
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
        <ContinueBtn loading={loading} onClick={handleSubmit} disabled={!childForm.full_name || !childForm.date_of_birth || !childForm.gender} icon={Check}>
          {lang === 'sw' ? 'Maliza Usajili' : 'Complete Setup'}
        </ContinueBtn>
      </div>
    </div>
  );

  return null;
}