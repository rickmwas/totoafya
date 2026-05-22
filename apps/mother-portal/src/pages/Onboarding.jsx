import db from '@/api/totoafyaClient';

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Check, MapPin, Heart } from 'lucide-react';

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

function ProgressDots({ current, total }) {
  return (
    <div className="flex items-center gap-1.5 justify-center mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            width: i === current ? '24px' : '6px',
            height: '6px',
            backgroundColor: i === current ? '#1B6B5A' : i < current ? '#1B6B5A60' : '#E5E5E5',
          }}
        />
      ))}
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
        className="h-[52px] px-4 bg-white border border-[#E8E8E8] rounded-[16px] text-[15px] font-medium text-[#0A0A0A] placeholder:text-[#C0C0C0] outline-none focus:border-[#1B6B5A] focus:shadow-[0_0_0_3px_rgba(27,107,90,0.08)] transition-all"
      />
    </div>
  );
}

function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 text-[#999] mb-6 active:scale-[0.97] transition-transform min-h-[44px]">
      <div className="w-8 h-8 rounded-full bg-[#F7F5F0] flex items-center justify-center">
        <ArrowLeft size={15} className="text-[#666666]" />
      </div>
      <span className="text-[13px] font-medium text-[#666666]">Back</span>
    </button>
  );
}

function ContinueBtn({ onClick, disabled, loading, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full h-[56px] rounded-full bg-[#1B6B5A] text-white text-[16px] font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-[0_8px_30px_rgba(27,107,90,0.3)] disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed"
    >
      {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : children}
    </button>
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
    const isCaregiverOnly = caregiverType === 'father' || caregiverType === 'guardian';
    try {
      const lmp = pregForm.lmp || (pregForm.trimester ? lmpFromTrimester(pregForm.trimester) : null);
      const edd = lmp ? new Date(new Date(lmp).getTime() + 280 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null;
      const effectiveMode = isCaregiverOnly ? 'child' : mode;

      const mother = await db.entities.Mother.create({
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
        risk_score: 0, risk_level: 'low', profile_complete: true, language_preference: lang,
      });

      if (mode === 'child' && childForm.full_name && childForm.date_of_birth && childForm.gender) {
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
    } finally {
      setLoading(false);
    }
  };

  // ── STEP 0: Welcome ──────────────────────────────────────────────────────────
  if (step === 0) return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col max-w-[430px] mx-auto overflow-hidden">
      {/* Hero image area — rounded bottom */}
      <div className="relative h-[46vh] overflow-hidden flex-shrink-0 rounded-b-[40px] shadow-[0_8px_40px_rgba(0,0,0,0.15)]">
        <img
          src="https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&q=85"
          alt="Mother and baby"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, transparent 35%, rgba(27,107,90,0.45) 100%)' }} />
        {/* Brand pill */}
        <div className="absolute top-12 left-6">
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md rounded-full px-3 py-1.5 shadow-card">
            <div className="w-6 h-6 rounded-[7px] bg-[#1B6B5A] flex items-center justify-center">
              <span className="text-white text-[10px] font-extrabold">T</span>
            </div>
            <span className="text-[13px] font-extrabold text-[#0A0A0A]">TotoAfya</span>
          </div>
        </div>
        {/* Bottom label over image */}
        <div className="absolute bottom-5 left-6">
          <span className="text-white/80 text-[11px] font-semibold tracking-[0.15em] uppercase">Kenya MCH Digital</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 px-6 pt-7">
        <h1 className="text-[40px] font-bold leading-tight text-[#1a1a1a] mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          {lang === 'sw' ? 'Afya Bora\nInaanza Hapa' : 'Better Health\nStarts Here'}
        </h1>
        <p className="text-[14px] text-[#7a7a6e] leading-relaxed mb-7">
          {t('welcome_sub')}
        </p>

        {/* Feature highlights row */}
        <div className="flex gap-3 mb-7">
          {[
            { icon: '🤰', color: '#E91E8C', bg: '#FFF0F6', en: 'Prenatal\nCare', sw: 'Huduma ya\nUjauzito' },
            { icon: '💉', color: '#1B6B5A', bg: '#E6F4F1', en: 'Vaccine\nTracker', sw: 'Ratiba ya\nChanjo' },
            { icon: '📈', color: '#C8813A', bg: '#FDF3E7', en: 'Growth\nMonitor', sw: 'Ukuaji wa\nMtoto' },
          ].map(({ icon, color, bg, en, sw: swLabel }) => (
            <div key={en} className="flex-1 bg-white rounded-[20px] p-3.5 shadow-card border border-[#f0ede5] flex flex-col items-center gap-2 text-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-[18px]" style={{ backgroundColor: bg }}>
                {icon}
              </div>
              <span className="text-[10px] font-bold leading-tight" style={{ color }}>
                {lang === 'sw' ? swLabel : en}
              </span>
            </div>
          ))}
        </div>

        {/* Language picker */}
        <div className="flex gap-2 mb-6">
          {[{ code: 'en', flag: '🇬🇧', label: 'English' }, { code: 'sw', flag: '🇰🇪', label: 'Kiswahili' }].map(({ code, flag, label }) => (
            <button
              key={code}
              onClick={() => setLanguage(code)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 h-12 rounded-[14px] text-[14px] font-semibold transition-all active:scale-[0.97] border',
                lang === code
                  ? 'bg-[#1B6B5A] border-[#1B6B5A] text-white shadow-[0_4px_16px_rgba(27,107,90,0.25)]'
                  : 'bg-white border-[#e8e4da] text-[#666666]'
              )}
            >
              <span>{flag}</span> {label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <div className="pb-10">
          <ContinueBtn onClick={() => setStep(1)}>
            {t('get_started')} <ArrowRight size={18} />
          </ContinueBtn>
          <p className="text-center text-[11px] text-[#A0A0A0] mt-4">
            {lang === 'sw' ? 'Inachukua dakika 2 tu' : 'Takes just 2 minutes'}
          </p>
        </div>
      </div>
    </div>
  );

  // ── STEP 1: Who are you? ─────────────────────────────────────────────────────
  if (step === 1) return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col max-w-[430px] mx-auto px-5 pt-14 pb-10">
      <BackBtn onClick={() => setStep(0)} />
      <ProgressDots current={0} total={4} />

      <div className="mb-7">
        <p className="text-[11px] tracking-[0.15em] font-bold uppercase text-[#1B6B5A] mb-2">
          {lang === 'sw' ? 'HATUA 1 YA 4' : 'STEP 1 OF 4'}
        </p>
        <h2 className="text-[30px] font-bold leading-tight text-[#1a1a1a]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          {lang === 'sw' ? 'Wewe ni nani?' : 'Who are you?'}
        </h2>
        <p className="text-[14px] text-[#999] mt-1.5">
          {lang === 'sw' ? 'Tutabinafsisha programu kwa hali yako' : "We'll personalize the app for your role"}
        </p>
      </div>

      <div className="flex flex-col gap-3 flex-1">
        {[
          { key: 'mother', icon: '👩', color: '#FF6B9D', bg: '#FFF0F5', en: 'Mother', sw: 'Mama', sub_en: 'Pregnant or postpartum caregiver', sub_sw: 'Mlezi mjamzito au baada ya kujifungua' },
          { key: 'father', icon: '👨', color: '#1B6B5A', bg: '#E6F4F1', en: 'Father', sw: 'Baba', sub_en: 'Co-parent or primary caregiver', sub_sw: 'Mzazi mwenza au mlezi mkuu' },
          { key: 'guardian', icon: '🧑', color: '#7C3AED', bg: '#F5F0FF', en: 'Guardian / Relative', sw: 'Mlezi / Ndugu', sub_en: 'Grandparent, aunt, uncle or other', sub_sw: 'Bibi, shangazi, mjomba au mlezi mwingine' },
        ].map(({ key, icon, color, bg, en, sw, sub_en, sub_sw }) => {
          const sel = caregiverType === key;
          return (
            <button
              key={key}
              onClick={() => { setCaregiverType(key); setStep(key === 'mother' ? 2 : 3); }}
              className={cn(
                'w-full rounded-[20px] p-4 border-2 text-left transition-all active:scale-[0.98] duration-200',
                sel ? 'border-current shadow-[0_4px_20px_rgba(0,0,0,0.08)]' : 'bg-white border-[#F0F0F0]'
              )}
              style={sel ? { borderColor: color, backgroundColor: bg } : {}}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-[16px] flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ backgroundColor: sel ? color + '20' : '#F7F5F0' }}>
                  {icon}
                </div>
                <div className="flex-1">
                  <p className="text-[16px] font-extrabold text-[#0A0A0A]">{lang === 'sw' ? sw : en}</p>
                  <p className="text-[12px] text-[#999] mt-0.5">{lang === 'sw' ? sub_sw : sub_en}</p>
                </div>
                {sel && (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color }}>
                    <Check size={12} className="text-white" strokeWidth={3} />
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
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col max-w-[430px] mx-auto px-5 pt-14 pb-10 overflow-y-auto">
      <BackBtn onClick={() => setStep(1)} />
      <ProgressDots current={1} total={4} />

      <div className="mb-7">
        <p className="text-[11px] tracking-[0.15em] font-bold uppercase text-[#1B6B5A] mb-2">
          {lang === 'sw' ? 'HATUA 2 YA 4' : 'STEP 2 OF 4'}
        </p>
        <h2 className="text-[30px] font-bold leading-tight text-[#1a1a1a]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          {lang === 'sw' ? 'Uko wapi katika safari yako?' : 'Where are you in your journey?'}
        </h2>
        <p className="text-[14px] text-[#999] mt-1.5">
          {lang === 'sw' ? "Tutabadilisha programu" : "We'll tailor the app to your situation"}
        </p>
      </div>

      <div className="flex flex-col gap-4 flex-1">
        {/* Pregnant */}
        <button
          onClick={() => { setMode('pregnant'); setStep(3); }}
          className={cn(
            'w-full rounded-[22px] p-5 border-2 text-left transition-all active:scale-[0.98] duration-200 relative overflow-hidden',
            mode === 'pregnant' ? 'border-[#1B6B5A] bg-[#E6F4F1]' : 'bg-white border-[#F0F0F0]'
          )}
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-[18px] bg-[#1B6B5A]/10 flex items-center justify-center text-3xl flex-shrink-0">🤰</div>
            <div className="flex-1">
              <p className="text-[17px] font-extrabold text-[#0A0A0A] mb-0.5">
                {lang === 'sw' ? 'Mimi ni mjamzito' : 'I am pregnant'}
              </p>
              <p className="text-[12px] text-[#999] leading-snug mb-3">
                {lang === 'sw' ? 'Fuatilia ziara za ANC, ukuaji wa mtoto' : 'Track ANC visits, fetal development & milestones'}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {['ANC Tracker', 'Fetal Timeline', 'Danger Alerts'].map(tag => (
                  <span key={tag} className="text-[10px] bg-[#1B6B5A]/10 text-[#1B6B5A] px-2 py-0.5 rounded-full font-bold tracking-wide">{tag}</span>
                ))}
              </div>
            </div>
            {mode === 'pregnant' && (
              <div className="w-6 h-6 rounded-full bg-[#1B6B5A] flex items-center justify-center flex-shrink-0 mt-1">
                <Check size={12} className="text-white" strokeWidth={3} />
              </div>
            )}
          </div>
        </button>

        {/* Child */}
        <button
          onClick={() => { setMode('child'); setStep(3); }}
          className={cn(
            'w-full rounded-[22px] p-5 border-2 text-left transition-all active:scale-[0.98] duration-200',
            mode === 'child' ? 'border-[#2E7A5D] bg-[#F0FAF5]' : 'bg-white border-[#F0F0F0]'
          )}
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-[18px] bg-[#2E7A5D]/10 flex items-center justify-center text-3xl flex-shrink-0">👶</div>
            <div className="flex-1">
              <p className="text-[17px] font-extrabold text-[#0A0A0A] mb-0.5">
                {lang === 'sw' ? 'Nina mtoto tayari' : 'I already have a child'}
              </p>
              <p className="text-[12px] text-[#999] leading-snug mb-3">
                {lang === 'sw' ? 'Fuatilia chanjo, ukuaji na hatua za maendeleo' : 'Track vaccines, growth charts & milestones'}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {['Vaccines', 'Growth Chart', 'Milestones'].map(tag => (
                  <span key={tag} className="text-[10px] bg-[#2E7A5D]/10 text-[#2E7A5D] px-2 py-0.5 rounded-full font-bold tracking-wide">{tag}</span>
                ))}
              </div>
            </div>
            {mode === 'child' && (
              <div className="w-6 h-6 rounded-full bg-[#2E7A5D] flex items-center justify-center flex-shrink-0 mt-1">
                <Check size={12} className="text-white" strokeWidth={3} />
              </div>
            )}
          </div>
        </button>

        {/* Both */}
        <button
          onClick={() => { setMode('pregnant'); setStep(3); }}
          className="w-full rounded-[18px] p-4 border border-dashed border-[#E0E0E0] bg-white text-left active:scale-[0.98] transition-all"
        >
          <p className="text-[14px] font-bold text-[#0A0A0A]">
            🤰👶 {lang === 'sw' ? 'Mjamzito na nina watoto' : 'Pregnant + have children'}
          </p>
          <p className="text-[11px] text-[#A0A0A0] mt-0.5">
            {lang === 'sw' ? 'Tutawezesha hali zote mbili' : "We'll enable both modes for you"}
          </p>
        </button>
      </div>
    </div>
  );

  // ── STEP 3: Personal Details ─────────────────────────────────────────────────
  if (step === 3) {
    const isCaregiverOnly = caregiverType === 'father' || caregiverType === 'guardian';
    const stepLabel = isCaregiverOnly ? (lang === 'sw' ? 'HATUA 2 YA 3' : 'STEP 2 OF 3') : (lang === 'sw' ? 'HATUA 3 YA 4' : 'STEP 3 OF 4');
    const dotIndex = isCaregiverOnly ? 1 : 2;
    const dotTotal = isCaregiverOnly ? 3 : 4;

    return (
      <div className="min-h-screen bg-[#F7F5F0] flex flex-col max-w-[430px] mx-auto px-5 pt-14 pb-10 overflow-y-auto">
        <BackBtn onClick={() => setStep(isCaregiverOnly ? 1 : 2)} />
        <ProgressDots current={dotIndex} total={dotTotal} />

        <div className="mb-7">
          <p className="text-[11px] tracking-[0.15em] font-bold uppercase text-[#1B6B5A] mb-2">{stepLabel}</p>
          <h2 className="text-[30px] font-bold leading-tight text-[#1a1a1a]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            {lang === 'sw' ? 'Maelezo Yako' : 'Your Details'}
          </h2>
          <p className="text-[14px] text-[#999] mt-1.5">
            {lang === 'sw' ? 'Taarifa zako ziko salama' : 'Your information is secure and private'}
          </p>
        </div>

        <div className="flex flex-col gap-4 flex-1">
          <InputField label={t('full_name')} value={form.full_name} onChange={v => setF('full_name', v)}
            placeholder={lang === 'sw' ? 'Jina kamili lako' : 'Your full name'} />
          <InputField label={t('phone_number')} value={form.phone} onChange={v => setF('phone', v)}
            type="tel" placeholder="+254 7XX XXX XXX" />

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] tracking-[0.12em] font-bold uppercase text-[#666666] px-1">{t('county')}</label>
            <select
              value={form.county}
              onChange={e => setF('county', e.target.value)}
              className="h-[52px] px-4 bg-white border border-[#E8E8E8] rounded-[16px] text-[15px] font-medium text-[#0A0A0A] outline-none focus:border-[#1B6B5A] focus:shadow-[0_0_0_3px_rgba(27,107,90,0.08)] transition-all appearance-none"
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
            }}
            lang={lang}
          />

          {/* Facility phones - collapsible feel */}
          <div className="bg-white rounded-[18px] border border-[#F0F0F0] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#F5F5F5]">
              <p className="text-[11px] tracking-[0.12em] font-bold uppercase text-[#666666]">
                {lang === 'sw' ? 'NAMBARI ZA HOSPITALI (SI LAZIMA)' : 'FACILITY PHONES (OPTIONAL)'}
              </p>
            </div>
            <div className="p-4 flex flex-col gap-3">
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

        <div className="mt-6">
          <ContinueBtn onClick={() => setStep(4)} disabled={!form.full_name || !form.phone}>
            {lang === 'sw' ? 'Endelea' : 'Continue'} <ArrowRight size={18} />
          </ContinueBtn>
        </div>
      </div>
    );
  }

  // ── STEP 4C: Father / Guardian ───────────────────────────────────────────────
  if (step === 4 && (caregiverType === 'father' || caregiverType === 'guardian')) return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col max-w-[430px] mx-auto px-5 pt-14 pb-10 overflow-y-auto">
      <BackBtn onClick={() => setStep(3)} />
      <ProgressDots current={2} total={3} />

      <div className="mb-7">
        <div className="inline-flex items-center gap-2 bg-[#7C3AED]/10 rounded-full px-3 py-1.5 mb-3">
          <span>{caregiverType === 'father' ? '👨' : '🧑'}</span>
          <span className="text-[11px] font-bold text-[#7C3AED] tracking-wide uppercase">
            {lang === 'sw' ? (caregiverType === 'father' ? 'BABA' : 'MLEZI') : (caregiverType === 'father' ? 'FATHER' : 'GUARDIAN')}
          </span>
        </div>
        <h2 className="text-[30px] font-bold leading-tight text-[#1a1a1a]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          {lang === 'sw' ? 'Watoto Wanaohusika' : 'Children in Your Care'}
        </h2>
        <p className="text-[14px] text-[#999] mt-1.5">
          {lang === 'sw' ? 'Unaweza kuongeza watoto baadaye pia' : 'You can add more children later'}
        </p>
      </div>

      <div className="flex flex-col gap-4 flex-1">
        <div className="bg-white rounded-[20px] border border-[#F0F0F0] p-5">
          <p className="text-[11px] tracking-[0.12em] font-bold uppercase text-[#999] mb-4">
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
                {[{ v: 'male', icon: '👦', en: 'Boy', sw: 'Mvulana', color: '#1B6B5A' }, { v: 'female', icon: '👧', en: 'Girl', sw: 'Msichana', color: '#D946A8' }].map(({ v, icon, en, sw, color }) => (
                  <button key={v} onClick={() => setC('gender', v)}
                    className={cn('flex-1 py-3.5 rounded-[14px] flex items-center justify-center gap-2 border-2 transition-all active:scale-[0.97] font-semibold text-[14px]',
                      childForm.gender === v ? 'border-current' : 'border-[#F0F0F0] bg-[#F7F5F0] text-[#666666]')}
                    style={childForm.gender === v ? { borderColor: color, backgroundColor: color + '12', color } : {}}>
                    <span>{icon}</span> {lang === 'sw' ? sw : en}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 bg-[#7C3AED]/5 border border-[#7C3AED]/15 rounded-[18px] p-4">
          <span className="text-lg flex-shrink-0">ℹ️</span>
          <p className="text-[12px] text-[#666] leading-relaxed">
            {lang === 'sw'
              ? 'Kama baba au mlezi, utaweza kuona chanjo, ukuaji na arifa za afya za watoto wote.'
              : "As a father or guardian, you'll track vaccines, growth, and health alerts for all children."}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <ContinueBtn loading={loading} onClick={handleSubmit}>
          <Check size={18} /> {lang === 'sw' ? 'Maliza Usajili' : 'Complete Setup'}
        </ContinueBtn>
      </div>
    </div>
  );

  // ── STEP 4A: Pregnancy Detail ────────────────────────────────────────────────
  if (step === 4 && mode === 'pregnant') return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col max-w-[430px] mx-auto px-5 pt-14 pb-10 overflow-y-auto">
      <BackBtn onClick={() => setStep(3)} />
      <ProgressDots current={3} total={4} />

      <div className="mb-7">
        <div className="inline-flex items-center gap-2 bg-[#1B6B5A]/10 rounded-full px-3 py-1.5 mb-3">
          <span>🤰</span>
          <span className="text-[11px] font-bold text-[#1B6B5A] tracking-wide uppercase">
            {lang === 'sw' ? 'HALI YA UJAUZITO' : 'PREGNANCY'}
          </span>
        </div>
        <h2 className="text-[30px] font-bold leading-tight text-[#1a1a1a]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          {lang === 'sw' ? 'Kuhusu Ujauzito Wako' : 'About Your Pregnancy'}
        </h2>
      </div>

      <div className="flex flex-col gap-6 flex-1">
        {/* Trimester */}
        <div>
          <label className="text-[11px] tracking-[0.12em] font-bold uppercase text-[#666666] block mb-3 px-1">
            {lang === 'sw' ? 'UKO KATIKA KIPINDI GANI?' : 'WHICH TRIMESTER?'}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { v: 1, en: '1st', sw: 'Kwanza', sub: '1–13 wks', color: '#7C3AED' },
              { v: 2, en: '2nd', sw: 'Pili', sub: '14–27 wks', color: '#1B6B5A' },
              { v: 3, en: '3rd', sw: 'Tatu', sub: '28+ wks', color: '#2E7A5D' },
            ].map(({ v, en, sw, sub, color }) => (
              <button key={v} onClick={() => setP('trimester', v)}
                className={cn('rounded-[18px] py-4 flex flex-col items-center gap-1 border-2 transition-all active:scale-[0.96]',
                  pregForm.trimester === v ? 'border-current shadow-[0_4px_16px_rgba(0,0,0,0.08)]' : 'border-[#F0F0F0] bg-white')}
                style={pregForm.trimester === v ? { borderColor: color, backgroundColor: color + '10' } : {}}>
                <span className="text-[20px] font-extrabold" style={{ color: pregForm.trimester === v ? color : '#0A0A0A' }}>
                  {lang === 'sw' ? sw : en}
                </span>
                <span className="text-[10px] text-[#999] font-medium">{sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* OR LMP */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-px bg-[#EAEAEA]" />
            <span className="text-[11px] text-[#C0C0C0] font-medium">{lang === 'sw' ? 'AU INGIZA TAREHE' : 'OR ENTER EXACT DATE'}</span>
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
            {[{ v: true, en: 'Yes, first time', sw: 'Ndio, mara ya kwanza' }, { v: false, en: 'No, I have children', sw: 'Hapana, nina watoto' }].map(({ v, en, sw }) => (
              <button key={String(v)} onClick={() => setP('is_first', v)}
                className={cn('flex-1 h-12 rounded-[14px] text-[13px] font-semibold border-2 transition-all active:scale-[0.97]',
                  pregForm.is_first === v ? 'bg-[#1B6B5A] text-white border-[#1B6B5A] shadow-[0_4px_16px_rgba(27,107,90,0.25)]' : 'bg-white border-[#F0F0F0] text-[#666666]')}>
                {lang === 'sw' ? sw : en}
              </button>
            ))}
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
                <button key={key} onClick={() => toggleRisk(key)}
                  className={cn('px-4 py-2.5 rounded-full text-[13px] font-semibold border transition-all active:scale-[0.96]',
                    selected ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]' : 'bg-white border-[#E8E8E8] text-[#555]')}>
                  {lang === 'sw' ? sw : en}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <ContinueBtn loading={loading} onClick={handleSubmit} disabled={!pregForm.trimester && !pregForm.lmp}>
          <Check size={18} /> {lang === 'sw' ? 'Maliza Usajili' : 'Complete Setup'}
        </ContinueBtn>
      </div>
    </div>
  );

  // ── STEP 4B: Child Detail ────────────────────────────────────────────────────
  if (step === 4 && mode === 'child') return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col max-w-[430px] mx-auto px-5 pt-14 pb-10 overflow-y-auto">
      <BackBtn onClick={() => setStep(3)} />
      <ProgressDots current={3} total={4} />

      <div className="mb-7">
        <div className="inline-flex items-center gap-2 bg-[#2E7A5D]/10 rounded-full px-3 py-1.5 mb-3">
          <span>👶</span>
          <span className="text-[11px] font-bold text-[#2E7A5D] tracking-wide uppercase">
            {lang === 'sw' ? 'MAELEZO YA MTOTO' : 'CHILD DETAILS'}
          </span>
        </div>
        <h2 className="text-[30px] font-bold leading-tight text-[#1a1a1a]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          {lang === 'sw' ? 'Mwambie kidogo kuhusu mtoto wako' : 'Tell us about your child'}
        </h2>
      </div>

      <div className="flex flex-col gap-5 flex-1">
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
            {[{ v: 'male', icon: '👦', en: 'Boy', sw: 'Mvulana', color: '#1B6B5A' }, { v: 'female', icon: '👧', en: 'Girl', sw: 'Msichana', color: '#D946A8' }].map(({ v, icon, en, sw, color }) => (
              <button key={v} onClick={() => setC('gender', v)}
                className={cn('flex-1 py-5 rounded-[20px] flex flex-col items-center gap-2 border-2 transition-all active:scale-[0.97]',
                  childForm.gender === v ? 'border-current shadow-[0_4px_16px_rgba(0,0,0,0.08)]' : 'border-[#F0F0F0] bg-white')}
                style={childForm.gender === v ? { borderColor: color, backgroundColor: color + '10' } : {}}>
                <span className="text-3xl">{icon}</span>
                <span className="text-[14px] font-bold" style={{ color: childForm.gender === v ? color : '#666' }}>
                  {lang === 'sw' ? sw : en}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] tracking-[0.12em] font-bold uppercase text-[#666666] px-1">
            {lang === 'sw' ? 'UZITO WA KUZALIWA (SI LAZIMA)' : 'BIRTH WEIGHT — OPTIONAL'}
          </label>
          <div className="flex items-center gap-2 bg-white border border-[#E8E8E8] rounded-[16px] px-4 focus-within:border-[#1B6B5A] focus-within:shadow-[0_0_0_3px_rgba(27,107,90,0.08)] transition-all">
            <input type="number" value={childForm.birth_weight_kg}
              onChange={e => setC('birth_weight_kg', e.target.value)}
              placeholder="e.g. 3.2" step="0.1" min="0.5" max="6"
              className="flex-1 h-[52px] text-[15px] font-medium text-[#0A0A0A] placeholder:text-[#C0C0C0] outline-none bg-transparent" />
            <span className="text-[14px] font-bold text-[#A0A0A0]">kg</span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <ContinueBtn loading={loading} onClick={handleSubmit} disabled={!childForm.full_name || !childForm.date_of_birth || !childForm.gender}>
          <Check size={18} /> {lang === 'sw' ? 'Maliza Usajili' : 'Complete Setup'}
        </ContinueBtn>
      </div>
    </div>
  );

  return null;
}