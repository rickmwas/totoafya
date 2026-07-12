import db from '@/api/totoafyaClient';

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Camera, Loader2 } from 'lucide-react';

import { useLang } from '@/context/LanguageContext';
import AppShell from '@/components/layout/AppShell';
import { cn } from '@/lib/utils';

// Defined OUTSIDE component to prevent remounting on re-render
const InputField = ({ label, value, onChange, type = 'text', placeholder }) => (
  <div>
    <label className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0] block mb-2">{label}</label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-14 px-4 bg-white border border-[#E5E5E5] rounded-[16px] text-[15px] font-medium text-[#0A0A0A] placeholder:text-[#A0A0A0] outline-none focus:border-[#1B6B5A] transition-colors"
    />
  </div>
);

export default function AddChild() {
  const navigate = useNavigate();
  const { lang } = useLang();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    date_of_birth: '',
    gender: '',
    birth_weight_kg: '',
    birth_height_cm: '',
    birth_facility: '',
    birth_type: 'normal',
    gestational_age_weeks: '',
  });
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileRef = useRef();
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPhoto(true);
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    setAvatarUrl(file_url);
    setUploadingPhoto(false);
  };

  const handleSave = async () => {
    if (!form.full_name || !form.date_of_birth || !form.gender) return;
    setSaving(true);
    try {
      const mothers = await db.entities.Mother.list('-created_date', 1);
      const mother = mothers[0];
      await db.entities.Child.create({
        ...form,
        mother_id: mother?.id || null,
        birth_weight_kg: parseFloat(form.birth_weight_kg) || null,
        birth_height_cm: parseFloat(form.birth_height_cm) || null,
        gestational_age_weeks: parseInt(form.gestational_age_weeks) || null,
        health_status: 'healthy',
        avatar_url: avatarUrl || null,
      });
      navigate('/');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="animate-fade-in px-4 pt-12 pb-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#666666] mb-8 active:scale-[0.97] transition-transform min-h-[48px]">
          <ArrowLeft size={18} /> <span className="text-[13px] font-medium">Back</span>
        </button>

        <div className="mb-7">
          <p className="text-[10px] tracking-[0.2em] font-bold uppercase text-[#A0A0A0] mb-1">
            {lang === 'sw' ? 'MTOTO MPYA' : 'NEW CHILD'}
          </p>
          <h1 className="font-bold leading-tight text-[#1a1a1a] text-[34px]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            {lang === 'sw' ? 'Ongeza Mtoto' : 'Add Child'}
          </h1>
        </div>

        <div className="flex flex-col gap-4">
          {/* Photo upload */}
          <div className="flex flex-col items-center gap-3 py-2">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            <button type="button" onClick={() => fileRef.current.click()}
              className="relative w-20 h-20 rounded-[24px] overflow-hidden bg-[#F7F5F0] border-2 border-dashed border-[#E5E5E5] flex items-center justify-center active:scale-[0.97] transition-all hover:border-[#1B6B5A]">
              {uploadingPhoto ? (
                <Loader2 size={22} className="animate-spin text-[#A0A0A0]" />
              ) : avatarUrl ? (
                <img src={avatarUrl} alt="Child" className="w-full h-full object-cover" />
              ) : (
                <Camera size={22} className="text-[#A0A0A0]" />
              )}
              {avatarUrl && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Camera size={18} className="text-white" />
                </div>
              )}
            </button>
            <p className="text-[11px] text-[#A0A0A0] font-medium">
              {lang === 'sw' ? 'Piga picha (si lazima)' : 'Add photo (optional)'}
            </p>
          </div>

          <InputField
            label={lang === 'sw' ? 'JINA KAMILI LA MTOTO' : "CHILD'S FULL NAME"}
            value={form.full_name}
            onChange={v => set('full_name', v)}
            placeholder={lang === 'sw' ? 'Jina kamili' : "Child's full name"}
          />

          <InputField
            label={lang === 'sw' ? 'TAREHE YA KUZALIWA' : 'DATE OF BIRTH'}
            value={form.date_of_birth}
            onChange={v => set('date_of_birth', v)}
            type="date"
          />

          {/* Gender selector */}
          <div>
            <label className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0] block mb-2">
              {lang === 'sw' ? 'JINSIA' : 'GENDER'}
            </label>
            <div className="flex gap-3">
              {[
                { v: 'male', icon: '👦', en: 'Boy', sw: 'Mvulana', color: '#1B6B5A' },
                { v: 'female', icon: '👧', en: 'Girl', sw: 'Msichana', color: '#D946A8' },
              ].map(({ v, icon, en, sw, color }) => (
                <button
                  key={v}
                  onClick={() => set('gender', v)}
                  className={cn(
                    'flex-1 py-4 rounded-[18px] flex flex-col items-center gap-1 transition-all active:scale-[0.97] border',
                    form.gender === v ? 'border-2' : 'border border-[#E5E5E5] bg-white'
                  )}
                  style={form.gender === v ? { borderColor: color, backgroundColor: `${color}10` } : {}}
                >
                  <span className="text-3xl">{icon}</span>
                  <span className="text-[13px] font-bold" style={{ color: form.gender === v ? color : '#666666' }}>
                    {lang === 'sw' ? sw : en}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Birth type */}
          <div>
            <label className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0] block mb-2">
              {lang === 'sw' ? 'AINA YA KUZAA' : 'BIRTH TYPE'}
            </label>
            <div className="flex gap-2">
              {[
                { v: 'normal', en: 'Normal', sw: 'Kawaida' },
                { v: 'caesarean', en: 'C-Section', sw: 'Upasuaji' },
                { v: 'assisted', en: 'Assisted', sw: 'Msaada' },
              ].map(({ v, en, sw }) => (
                <button
                  key={v}
                  onClick={() => set('birth_type', v)}
                  className={cn(
                    'flex-1 py-3 rounded-full text-[12px] font-semibold transition-all active:scale-[0.96] border',
                    form.birth_type === v
                      ? 'bg-[#1B6B5A] text-white border-[#1B6B5A] shadow-teal-glow-sm'
                      : 'bg-white border-[#E5E5E5] text-[#666666]'
                  )}
                >
                  {lang === 'sw' ? sw : en}
                </button>
              ))}
            </div>
          </div>

          {/* Measurements */}
          <div className="flex gap-3">
            <div className="flex-1">
              <InputField
                label={lang === 'sw' ? 'UZITO WA KUZALIWA (kg)' : 'BIRTH WEIGHT (kg)'}
                value={form.birth_weight_kg}
                onChange={v => set('birth_weight_kg', v)}
                type="number"
                placeholder="e.g. 3.2"
              />
            </div>
            <div className="flex-1">
              <InputField
                label={lang === 'sw' ? 'UREFU WA KUZALIWA (cm)' : 'BIRTH HEIGHT (cm)'}
                value={form.birth_height_cm}
                onChange={v => set('birth_height_cm', v)}
                type="number"
                placeholder="e.g. 50"
              />
            </div>
          </div>

          <InputField
            label={lang === 'sw' ? 'JINA LA HOSPITALI' : 'BIRTH FACILITY'}
            value={form.birth_facility}
            onChange={v => set('birth_facility', v)}
            placeholder={lang === 'sw' ? 'Hospitali aliyozaliwa' : 'Hospital where born'}
          />

          <InputField
            label={lang === 'sw' ? 'UMRI WA WIKI WAKATI WA KUZALIWA' : 'GESTATIONAL AGE (weeks)'}
            value={form.gestational_age_weeks}
            onChange={v => set('gestational_age_weeks', v)}
            type="number"
            placeholder="e.g. 38"
          />

          <button
            onClick={handleSave}
            disabled={saving || !form.full_name || !form.date_of_birth || !form.gender}
            className="w-full h-14 rounded-full bg-[#1B6B5A] hover:bg-[#145244] text-white text-[16px] font-bold flex items-center justify-between pl-6 pr-2.5 active:scale-[0.97] transition-all shadow-teal-glow disabled:opacity-40 mt-2"
          >
            {saving ? (
              <div className="w-full flex justify-center items-center">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                <span className="flex-1 text-center font-bold tracking-tight">
                  {lang === 'sw' ? 'Hifadhi Mtoto' : 'Save Child'}
                </span>
                <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                  <Check size={18} className="text-white" strokeWidth={2.5} />
                </div>
              </>
            )}
          </button>
        </div>
      </div>
    </AppShell>
  );
}
