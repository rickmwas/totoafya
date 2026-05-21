import db from '@/api/base44Client';

import React, { useState, useEffect } from 'react';
import { Plus, Heart, Activity, Calendar, AlertTriangle, ChevronRight } from 'lucide-react';

import { useLang } from '@/context/LanguageContext';
import AppShell from '@/components/layout/AppShell';
import { useRequireOnboarding } from '@/hooks/useRequireOnboarding';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

const DANGER_SIGNS = [
  { en: 'Severe headache', sw: 'Maumivu makali ya kichwa' },
  { en: 'Blurred vision', sw: 'Kuona vibaya' },
  { en: 'Severe swelling (hands/face)', sw: 'Uvimbe mkubwa (mikono/uso)' },
  { en: 'Vaginal bleeding', sw: 'Kutoka damu ukeni' },
  { en: 'Reduced fetal movement', sw: 'Mtoto kutosogea' },
  { en: 'High fever', sw: 'Homa kali' },
  { en: 'Difficulty breathing', sw: 'Ugumu wa kupumua' },
];

export default function ANCVisitLog() {
  const { t, lang } = useLang();
  const { loading: checkingOnboarding } = useRequireOnboarding();
  const [mother, setMother] = useState(null);
  const [visits, setVisits] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    visit_date: new Date().toISOString().split('T')[0],
    visit_number: 1,
    facility: '',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    weight_kg: '',
    fundal_height_cm: '',
    fetal_heart_rate: '',
    haemoglobin: '',
    ttv_given: false,
    ifas_given: false,
    llin_given: false,
    danger_signs: [],
    notes: '',
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [mothers, v] = await Promise.all([
      db.entities.Mother.list('-created_date', 1),
      db.entities.ANCVisit.list('-visit_date', 20),
    ]);
    setMother(mothers[0] || null);
    setVisits(v);
    setForm(f => ({ ...f, visit_number: v.length + 1 }));
  };

  const toggleDangerSign = (sign) => {
    setForm(f => ({
      ...f,
      danger_signs: f.danger_signs.includes(sign)
        ? f.danger_signs.filter(s => s !== sign)
        : [...f.danger_signs, sign],
    }));
  };

  const saveVisit = async () => {
    if (!mother) return;
    setSaving(true);
    await db.entities.ANCVisit.create({
      ...form,
      mother_id: mother.id,
      blood_pressure_systolic: parseFloat(form.blood_pressure_systolic) || null,
      blood_pressure_diastolic: parseFloat(form.blood_pressure_diastolic) || null,
      weight_kg: parseFloat(form.weight_kg) || null,
      fundal_height_cm: parseFloat(form.fundal_height_cm) || null,
      fetal_heart_rate: parseFloat(form.fetal_heart_rate) || null,
      haemoglobin: parseFloat(form.haemoglobin) || null,
    });
    await loadData();
    setShowForm(false);
    setSaving(false);
  };

  const bpStatus = (sys, dia) => {
    if (!sys) return null;
    if (sys >= 160 || dia >= 110) return 'critical';
    if (sys >= 140 || dia >= 90) return 'warning';
    return 'normal';
  };

  if (checkingOnboarding) return null;

  return (
    <AppShell>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="relative px-4 pt-14 pb-6 overflow-hidden">
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-[#E91E8C] opacity-[0.05] blur-2xl pointer-events-none" />
          <div className="absolute top-6 right-14 w-20 h-20 rounded-full bg-[#1B6B5A] opacity-[0.06] blur-xl pointer-events-none" />
          <p className="text-[10px] tracking-[0.2em] font-bold uppercase text-[#E91E8C]/50 mb-1.5">
            {lang === 'sw' ? 'UJAUZITO' : 'PREGNANCY CARE'}
          </p>
          <h1 className="font-bold leading-tight text-[#1a1a1a] text-[34px]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            {t('anc_visits')}
          </h1>
        </div>

        {/* ANC Progress */}
        <div className="mx-4 mb-4 bg-white rounded-[24px] p-5 border border-[#E5E5E5] shadow-card">
          <p className="text-[10px] tracking-[0.15em] uppercase font-bold text-[#A0A0A0] mb-3">
            {lang === 'sw' ? 'MAENDELEO YA ANC' : 'ANC PROGRESS'}
          </p>
          <div className="flex items-end gap-1 mb-3">
            <span className="text-[48px] font-extrabold leading-none tracking-[-0.03em] text-[#1B6B5A]">
              {visits.length}
            </span>
            <span className="text-[16px] text-[#666666] mb-2">/ 8 {lang === 'sw' ? 'ziara' : 'visits'}</span>
          </div>
          {/* Visit dots */}
          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold transition-all',
                  i < visits.length
                    ? 'bg-[#2E7A5D] text-white shadow-green-glow'
                    : 'bg-[#F7F5F0] border border-[#E5E5E5] text-[#A0A0A0]'
                )}
              >
                {i + 1}
              </div>
            ))}
          </div>
          {visits.length < 8 && (
            <p className="text-[12px] text-[#666666] mt-3">
              {lang === 'sw'
                ? `WHO inashauriwa ziara ${8 - visits.length} zaidi`
                : `${8 - visits.length} more visits recommended by WHO`}
            </p>
          )}
        </div>

        {/* Add Visit Button */}
        {!showForm && (
          <div className="px-4 mb-4">
            <button
              onClick={() => setShowForm(true)}
              className="w-full h-14 rounded-full bg-[#1B6B5A] text-white text-[15px] font-bold flex items-center justify-center gap-2 shadow-teal-glow active:scale-[0.97] transition-all"
            >
              <Plus size={18} /> {t('add_visit')}
            </button>
          </div>
        )}

        {/* Add Visit Form */}
        {showForm && (
          <div className="mx-4 mb-4 bg-white rounded-[24px] p-5 border border-[#E5E5E5] shadow-card">
            <p className="text-[16px] font-bold text-[#0A0A0A] mb-4">{t('add_visit')}</p>
            <div className="flex flex-col gap-4">
              {/* Date & Visit no */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-[10px] tracking-[0.15em] uppercase font-bold text-[#A0A0A0] block mb-2">{t('date')}</label>
                  <input type="date" value={form.visit_date} onChange={e => setForm(f => ({...f, visit_date: e.target.value}))}
                    className="w-full h-12 px-4 bg-[#F7F5F0] border border-[#E5E5E5] rounded-[14px] text-[14px] outline-none focus:border-[#1B6B5A]" />
                </div>
                <div className="w-20">
                  <label className="text-[10px] tracking-[0.15em] uppercase font-bold text-[#A0A0A0] block mb-2">Visit #</label>
                  <input type="number" value={form.visit_number} onChange={e => setForm(f => ({...f, visit_number: parseInt(e.target.value)}))}
                    className="w-full h-12 px-4 bg-[#F7F5F0] border border-[#E5E5E5] rounded-[14px] text-[14px] outline-none focus:border-[#1B6B5A]" />
                </div>
              </div>

              {/* Facility */}
              <div>
                <label className="text-[10px] tracking-[0.15em] uppercase font-bold text-[#A0A0A0] block mb-2">
                  {lang === 'sw' ? 'HOSPITALI' : 'FACILITY'}
                </label>
                <input type="text" value={form.facility} onChange={e => setForm(f => ({...f, facility: e.target.value}))} placeholder="e.g. Nairobi West Hospital"
                  className="w-full h-12 px-4 bg-[#F7F5F0] border border-[#E5E5E5] rounded-[14px] text-[14px] outline-none focus:border-[#1B6B5A]" />
              </div>

              {/* Blood Pressure */}
              <div>
                <label className="text-[10px] tracking-[0.15em] uppercase font-bold text-[#A0A0A0] block mb-2">{t('blood_pressure')}</label>
                <div className="flex items-center gap-2">
                  <input type="number" value={form.blood_pressure_systolic} onChange={e => setForm(f => ({...f, blood_pressure_systolic: e.target.value}))} placeholder="120"
                    className="flex-1 h-12 px-4 bg-[#F7F5F0] border border-[#E5E5E5] rounded-[14px] text-[14px] outline-none focus:border-[#1B6B5A]" />
                  <span className="text-[#A0A0A0] font-bold">/</span>
                  <input type="number" value={form.blood_pressure_diastolic} onChange={e => setForm(f => ({...f, blood_pressure_diastolic: e.target.value}))} placeholder="80"
                    className="flex-1 h-12 px-4 bg-[#F7F5F0] border border-[#E5E5E5] rounded-[14px] text-[14px] outline-none focus:border-[#1B6B5A]" />
                  <span className="text-[12px] text-[#A0A0A0]">mmHg</span>
                </div>
                {bpStatus(form.blood_pressure_systolic, form.blood_pressure_diastolic) === 'critical' && (
                  <p className="text-[11px] text-[#E51010] mt-1 font-semibold">⚠️ {lang === 'sw' ? 'Shinikizo la juu sana — tafadhali wasiliana na daktari' : 'Very high BP — seek medical attention'}</p>
                )}
              </div>

              {/* Weight, FH, FHR */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: lang === 'sw' ? 'UZITO (kg)' : 'WEIGHT (kg)', key: 'weight_kg', placeholder: '65' },
                  { label: lang === 'sw' ? 'UREFU WA FANDASI (cm)' : 'FUNDAL HT (cm)', key: 'fundal_height_cm', placeholder: '28' },
                  { label: lang === 'sw' ? 'MAPIGO YA MOYO' : 'FETAL HR', key: 'fetal_heart_rate', placeholder: '140' },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className="text-[9px] tracking-[0.1em] uppercase font-bold text-[#A0A0A0] block mb-2">{label}</label>
                    <input type="number" value={form[key]} onChange={e => setForm(f => ({...f, [key]: e.target.value}))} placeholder={placeholder}
                      className="w-full h-12 px-3 bg-[#F7F5F0] border border-[#E5E5E5] rounded-[14px] text-[13px] outline-none focus:border-[#1B6B5A]" />
                  </div>
                ))}
              </div>

              {/* Interventions */}
              <div>
                <label className="text-[10px] tracking-[0.15em] uppercase font-bold text-[#A0A0A0] block mb-2">
                  {lang === 'sw' ? 'DAWA/HUDUMA' : 'INTERVENTIONS'}
                </label>
                <div className="flex flex-col gap-2">
                  {[
                    { key: 'ttv_given', en: 'TTV given', sw: 'TTV imepewa' },
                    { key: 'ifas_given', en: 'Iron/Folic Acid given', sw: 'Dawa ya chuma/folic imepewa' },
                    { key: 'llin_given', en: 'Mosquito net given', sw: 'Neti ya mbu imepewa' },
                  ].map(({ key, en, sw }) => (
                    <button
                      key={key}
                      onClick={() => setForm(f => ({...f, [key]: !f[key]}))}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-[14px] border text-left transition-all active:scale-[0.98]',
                        form[key]
                          ? 'bg-[#2E7A5D]/8 border-[#2E7A5D]/30 text-[#2E7A5D]'
                          : 'bg-[#F7F5F0] border-[#E5E5E5] text-[#666666]'
                      )}
                    >
                      <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0', form[key] ? 'bg-[#2E7A5D] border-[#2E7A5D]' : 'border-[#D0D0D0]')}>
                        {form[key] && <span className="text-white text-[10px] font-bold">✓</span>}
                      </div>
                      <span className="text-[13px] font-medium">{lang === 'sw' ? sw : en}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Danger signs */}
              <div>
                <label className="text-[10px] tracking-[0.15em] uppercase font-bold text-[#A0A0A0] block mb-2">
                  {t('danger_signs')} {lang === 'sw' ? '(chagua zote zinazotumika)' : '(select all that apply)'}
                </label>
                <div className="flex flex-col gap-2">
                  {DANGER_SIGNS.map(sign => {
                    const label = lang === 'sw' ? sign.sw : sign.en;
                    const active = form.danger_signs.includes(sign.en);
                    return (
                      <button
                        key={sign.en}
                        onClick={() => toggleDangerSign(sign.en)}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-[14px] border text-left transition-all active:scale-[0.98]',
                          active
                            ? 'bg-[#E51010]/8 border-[#E51010]/30 text-[#E51010]'
                            : 'bg-[#F7F5F0] border-[#E5E5E5] text-[#666666]'
                        )}
                      >
                        <AlertTriangle size={14} className={active ? 'text-[#E51010]' : 'text-[#A0A0A0]'} />
                        <span className="text-[13px] font-medium">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowForm(false)} className="flex-1 h-12 rounded-full border border-[#E5E5E5] text-[13px] font-semibold text-[#666666] active:scale-[0.97]">
                  {t('cancel')}
                </button>
                <button onClick={saveVisit} disabled={saving} className="flex-1 h-12 rounded-full bg-[#1B6B5A] text-white text-[13px] font-bold shadow-teal-glow active:scale-[0.97] disabled:opacity-40">
                  {saving ? '...' : t('save')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Visit History */}
        <div className="px-4 pb-4">
          <p className="text-[10px] tracking-[0.15em] uppercase font-bold text-[#A0A0A0] mb-3">
            {lang === 'sw' ? 'HISTORIA YA ZIARA' : 'VISIT HISTORY'}
          </p>
          {visits.length === 0 ? (
            <div className="bg-white rounded-[20px] p-6 border border-[#E5E5E5] text-center">
              <p className="text-[14px] text-[#A0A0A0]">{lang === 'sw' ? 'Hakuna ziara bado' : 'No visits recorded yet'}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {visits.map(visit => {
                const bp = bpStatus(visit.blood_pressure_systolic, visit.blood_pressure_diastolic);
                const hasDangerSigns = visit.danger_signs?.length > 0;
                return (
                  <div key={visit.id} className={cn(
                    'bg-white rounded-[20px] p-4 border shadow-card',
                    hasDangerSigns ? 'border-[#E51010]/30' : bp === 'warning' ? 'border-[#F9A825]/30' : 'border-[#E5E5E5]'
                  )}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-[10px] tracking-[0.12em] uppercase font-bold text-[#A0A0A0]">
                          {lang === 'sw' ? 'ZIARA' : 'VISIT'} {visit.visit_number}
                        </p>
                        <p className="text-[16px] font-bold text-[#0A0A0A]">
                          {visit.visit_date ? format(parseISO(visit.visit_date), 'MMM d, yyyy') : '—'}
                        </p>
                        {visit.facility && <p className="text-[12px] text-[#A0A0A0]">{visit.facility}</p>}
                      </div>
                      {hasDangerSigns && (
                        <div className="flex items-center gap-1 bg-[#E51010]/10 rounded-full px-2.5 py-1">
                          <AlertTriangle size={12} className="text-[#E51010]" />
                          <span className="text-[10px] text-[#E51010] font-bold">{visit.danger_signs.length}</span>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {visit.blood_pressure_systolic && (
                        <div className={cn('rounded-[12px] p-2 text-center', bp === 'critical' ? 'bg-[#E51010]/8' : bp === 'warning' ? 'bg-[#F9A825]/8' : 'bg-[#F7F5F0]')}>
                          <p className="text-[11px] font-extrabold" style={{ color: bp === 'critical' ? '#E51010' : bp === 'warning' ? '#F9A825' : '#1B6B5A' }}>
                            {visit.blood_pressure_systolic}/{visit.blood_pressure_diastolic}
                          </p>
                          <p className="text-[9px] text-[#A0A0A0] mt-0.5">mmHg</p>
                        </div>
                      )}
                      {visit.weight_kg && (
                        <div className="bg-[#F7F5F0] rounded-[12px] p-2 text-center">
                          <p className="text-[11px] font-extrabold text-[#2E7A5D]">{visit.weight_kg}kg</p>
                          <p className="text-[9px] text-[#A0A0A0] mt-0.5">{t('weight')}</p>
                        </div>
                      )}
                      {visit.haemoglobin && (
                        <div className="bg-[#F7F5F0] rounded-[12px] p-2 text-center">
                          <p className="text-[11px] font-extrabold text-[#0A0A0A]">{visit.haemoglobin} g/dl</p>
                          <p className="text-[9px] text-[#A0A0A0] mt-0.5">Hb</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}