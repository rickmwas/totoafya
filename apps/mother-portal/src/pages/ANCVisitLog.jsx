import db from '@/api/totoafyaClient';

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
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-toto-red opacity-[0.05] blur-2xl pointer-events-none" />
          <div className="absolute top-6 right-14 w-20 h-20 rounded-full bg-toto-teal opacity-[0.06] blur-xl pointer-events-none" />
          <p className="text-[10px] tracking-[0.2em] font-bold uppercase text-toto-red/60 mb-1.5">
            {lang === 'sw' ? 'UJAUZITO' : 'PREGNANCY CARE'}
          </p>
          <h1 className="font-bold leading-tight text-toto-black text-[34px]" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
            {t('anc_visits')}
          </h1>
        </div>

        {/* ANC Progress */}
        <div className="mx-4 mb-4 bg-white rounded-[24px] p-5 border border-toto-surface shadow-card">
          <p className="text-[10px] tracking-[0.15em] uppercase font-bold text-toto-light mb-3">
            {lang === 'sw' ? 'MAENDELEO YA ANC' : 'ANC PROGRESS'}
          </p>
          <div className="flex items-end gap-1 mb-3 animate-fade-in">
            <span className="text-[48px] font-extrabold leading-none tracking-[-0.03em] text-toto-teal font-numeric-tabular">
              {visits.length}
            </span>
            <span className="text-[16px] text-toto-gray mb-2 font-numeric-tabular">/ 8 {lang === 'sw' ? 'ziara' : 'visits'}</span>
          </div>
          {/* Visit dots */}
          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold transition-all font-numeric-tabular',
                  i < visits.length
                    ? 'bg-toto-teal text-white shadow-teal-glow-sm'
                    : 'bg-[#F7F5F0] border border-toto-surface text-toto-light'
                )}
              >
                {i + 1}
              </div>
            ))}
          </div>
          {visits.length < 8 && (
            <p className="text-[12px] text-toto-gray mt-3">
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
              className="w-full h-14 rounded-full bg-toto-teal text-white text-[15px] font-bold flex items-center justify-center gap-2 shadow-teal-glow active:scale-[0.97] transition-all"
            >
              <Plus size={18} /> {t('add_visit')}
            </button>
          </div>
        )}

        {/* Add Visit Form */}
        {showForm && (
          <div className="mx-4 mb-4 bg-white rounded-[24px] p-5 border border-toto-surface shadow-card animate-fade-in">
            <p className="text-[16px] font-bold text-toto-black mb-4">{t('add_visit')}</p>
            <div className="flex flex-col gap-4">
              {/* Date & Visit no */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-[10px] tracking-[0.15em] uppercase font-bold text-toto-light block mb-2">{t('date')}</label>
                  <input type="date" value={form.visit_date} onChange={e => setForm(f => ({...f, visit_date: e.target.value}))}
                    className="w-full h-12 px-4 bg-toto-surface border border-toto-surface rounded-[14px] text-[14px] outline-none focus:border-toto-teal font-numeric-tabular" />
                </div>
                <div className="w-20">
                  <label className="text-[10px] tracking-[0.15em] uppercase font-bold text-toto-light block mb-2">Visit #</label>
                  <input type="number" value={form.visit_number} onChange={e => setForm(f => ({...f, visit_number: parseInt(e.target.value)}))}
                    className="w-full h-12 px-4 bg-toto-surface border border-toto-surface rounded-[14px] text-[14px] outline-none focus:border-toto-teal font-numeric-tabular" />
                </div>
              </div>

              {/* Facility */}
              <div>
                <label className="text-[10px] tracking-[0.15em] uppercase font-bold text-toto-light block mb-2">
                  {lang === 'sw' ? 'HOSPITALI' : 'FACILITY'}
                </label>
                <input type="text" value={form.facility} onChange={e => setForm(f => ({...f, facility: e.target.value}))} placeholder="e.g. Nairobi West Hospital"
                  className="w-full h-12 px-4 bg-toto-surface border border-toto-surface rounded-[14px] text-[14px] outline-none focus:border-toto-teal" />
              </div>

              {/* Blood Pressure */}
              <div>
                <label className="text-[10px] tracking-[0.15em] uppercase font-bold text-toto-light block mb-2">{t('blood_pressure')}</label>
                <div className="flex items-center gap-2">
                  <input type="number" value={form.blood_pressure_systolic} onChange={e => setForm(f => ({...f, blood_pressure_systolic: e.target.value}))} placeholder="120"
                    className="flex-1 h-12 px-4 bg-toto-surface border border-toto-surface rounded-[14px] text-[14px] outline-none focus:border-toto-teal font-numeric-tabular" />
                  <span className="text-toto-light font-bold">/</span>
                  <input type="number" value={form.blood_pressure_diastolic} onChange={e => setForm(f => ({...f, blood_pressure_diastolic: e.target.value}))} placeholder="80"
                    className="flex-1 h-12 px-4 bg-toto-surface border border-toto-surface rounded-[14px] text-[14px] outline-none focus:border-toto-teal font-numeric-tabular" />
                  <span className="text-[12px] text-toto-light">mmHg</span>
                </div>
                {bpStatus(form.blood_pressure_systolic, form.blood_pressure_diastolic) === 'critical' && (
                  <p className="text-[11px] text-toto-red mt-1.5 font-semibold">⚠️ {lang === 'sw' ? 'Shinikizo la juu sana — tafadhali wasiliana na daktari' : 'Very high BP — seek medical attention'}</p>
                )}
              </div>

              {/* Weight, FH, FHR */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: lang === 'sw' ? 'UZITO (kg)' : 'WEIGHT (kg)', key: 'weight_kg', placeholder: '65' },
                  { label: lang === 'sw' ? 'FANDASI (cm)' : 'FUNDAL HT (cm)', key: 'fundal_height_cm', placeholder: '28' },
                  { label: lang === 'sw' ? 'MAPIGO YA MOYO' : 'FETAL HR', key: 'fetal_heart_rate', placeholder: '140' },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className="text-[9px] tracking-[0.1em] uppercase font-bold text-toto-light block mb-2">{label}</label>
                    <input type="number" value={form[key]} onChange={e => setForm(f => ({...f, [key]: e.target.value}))} placeholder={placeholder}
                      className="w-full h-12 px-3 bg-toto-surface border border-toto-surface rounded-[14px] text-[13px] outline-none focus:border-toto-teal font-numeric-tabular" />
                  </div>
                ))}
              </div>

              {/* Interventions */}
              <div>
                <label className="text-[10px] tracking-[0.15em] uppercase font-bold text-toto-light block mb-2">
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
                        'flex items-center gap-3 p-3 rounded-[14px] border text-left transition-all active:scale-[0.98] h-12',
                        form[key]
                          ? 'bg-toto-green/10 border-toto-green/30 text-toto-green'
                          : 'bg-toto-surface border-toto-surface text-toto-gray'
                      )}
                    >
                      <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0', form[key] ? 'bg-toto-green border-toto-green' : 'border-[#D0D0D0]')}>
                        {form[key] && <span className="text-white text-[10px] font-bold">✓</span>}
                      </div>
                      <span className="text-[13px] font-semibold">{lang === 'sw' ? sw : en}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Danger signs */}
              <div>
                <label className="text-[10px] tracking-[0.15em] uppercase font-bold text-toto-light block mb-2">
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
                          'flex items-center gap-3 p-3 rounded-[14px] border text-left transition-all active:scale-[0.98] h-12',
                          active
                            ? 'bg-toto-red/10 border-toto-red/30 text-toto-red font-bold'
                            : 'bg-toto-surface border-toto-surface text-toto-gray'
                        )}
                      >
                        <AlertTriangle size={14} className={active ? 'text-toto-red' : 'text-toto-light'} />
                        <span className="text-[13px] font-semibold">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowForm(false)} className="flex-1 h-12 rounded-full border border-toto-surface text-[13px] font-semibold text-toto-gray active:scale-[0.97]">
                  {t('cancel')}
                </button>
                <button onClick={saveVisit} disabled={saving} className="flex-1 h-12 rounded-full bg-toto-teal text-white text-[13px] font-bold shadow-teal-glow active:scale-[0.97] disabled:opacity-40">
                  {saving ? '...' : t('save')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Visit History */}
        <div className="px-4 pb-4">
          <p className="text-[10px] tracking-[0.15em] uppercase font-bold text-toto-light mb-3">
            {lang === 'sw' ? 'HISTORIA YA ZIARA' : 'VISIT HISTORY'}
          </p>
          {visits.length === 0 ? (
            <div className="bg-white rounded-[20px] p-6 border border-toto-surface text-center">
              <p className="text-[14px] text-toto-light">{lang === 'sw' ? 'Hakuna ziara bado' : 'No visits recorded yet'}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {visits.map(visit => {
                const bp = bpStatus(visit.blood_pressure_systolic, visit.blood_pressure_diastolic);
                const hasDangerSigns = visit.danger_signs?.length > 0;
                return (
                  <div key={visit.id} className={cn(
                    'bg-white rounded-[20px] p-4 border shadow-card transition-all duration-200',
                    hasDangerSigns ? 'border-toto-red/30 bg-toto-red/5' : bp === 'warning' ? 'border-toto-amber/30 bg-toto-amber/5' : 'border-toto-surface'
                  )}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-[10px] tracking-[0.12em] uppercase font-bold text-toto-light font-numeric-tabular">
                          {lang === 'sw' ? 'ZIARA' : 'VISIT'} {visit.visit_number}
                        </p>
                        <p className="text-[16px] font-bold text-toto-black font-numeric-tabular">
                          {visit.visit_date ? format(parseISO(visit.visit_date), 'MMM d, yyyy') : '—'}
                        </p>
                        {visit.facility && <p className="text-[12px] text-toto-gray font-medium mt-0.5">{visit.facility}</p>}
                      </div>
                      {hasDangerSigns && (
                        <div className="flex items-center gap-1 bg-toto-red/10 rounded-full px-2.5 py-1">
                          <AlertTriangle size={12} className="text-toto-red animate-pulse-dot" />
                          <span className="text-[10px] text-toto-red font-extrabold font-numeric-tabular">{visit.danger_signs.length}</span>
                        </div>
                      )}
                    </div>

                    {/* Gridded visit metrics */}
                    <div className="grid grid-cols-3 gap-2">
                      {visit.blood_pressure_systolic && (
                        <div className={cn(
                          'rounded-[14px] p-2 text-center border flex flex-col justify-center',
                          bp === 'critical' ? 'bg-toto-red/10 border-toto-red/20 text-toto-red' :
                          bp === 'warning' ? 'bg-toto-amber/10 border-toto-amber/20 text-toto-ochre' :
                          'bg-toto-surface border-toto-surface text-toto-teal'
                        )}>
                          <p className="text-[12px] font-extrabold leading-none font-numeric-tabular">
                            {visit.blood_pressure_systolic}/{visit.blood_pressure_diastolic}
                          </p>
                          <p className="text-[8px] tracking-wider uppercase font-bold text-toto-light mt-1">BP (mmHg)</p>
                        </div>
                      )}
                      {visit.weight_kg && (
                        <div className="bg-toto-surface border border-toto-surface rounded-[14px] p-2 text-center flex flex-col justify-center text-toto-black">
                          <p className="text-[12px] font-extrabold leading-none font-numeric-tabular">{visit.weight_kg}kg</p>
                          <p className="text-[8px] tracking-wider uppercase font-bold text-toto-light mt-1">{t('weight')}</p>
                        </div>
                      )}
                      {visit.haemoglobin && (
                        <div className="bg-toto-surface border border-toto-surface rounded-[14px] p-2 text-center flex flex-col justify-center text-toto-black">
                          <p className="text-[12px] font-extrabold leading-none font-numeric-tabular">{visit.haemoglobin}</p>
                          <p className="text-[8px] tracking-wider uppercase font-bold text-toto-light mt-1">Hb (g/dl)</p>
                        </div>
                      )}
                      {visit.fundal_height_cm && (
                        <div className="bg-toto-surface border border-toto-surface rounded-[14px] p-2 text-center flex flex-col justify-center text-toto-black">
                          <p className="text-[12px] font-extrabold leading-none font-numeric-tabular">{visit.fundal_height_cm}cm</p>
                          <p className="text-[8px] tracking-wider uppercase font-bold text-toto-light mt-1">Fundal Ht</p>
                        </div>
                      )}
                      {visit.fetal_heart_rate && (
                        <div className="bg-toto-surface border border-toto-surface rounded-[14px] p-2 text-center flex flex-col justify-center text-toto-black">
                          <p className="text-[12px] font-extrabold leading-none font-numeric-tabular">{visit.fetal_heart_rate}</p>
                          <p className="text-[8px] tracking-wider uppercase font-bold text-toto-light mt-1">Fetal HR</p>
                        </div>
                      )}
                    </div>

                    {/* Interventions list */}
                    {(visit.ttv_given || visit.ifas_given || visit.llin_given) && (
                      <div className="flex flex-wrap gap-1.5 mt-3 border-t border-toto-surface pt-2.5">
                        {visit.ttv_given && <span className="text-[8.5px] font-extrabold uppercase tracking-wider bg-toto-green/10 text-toto-green px-2.5 py-0.5 rounded-full">✓ TTV</span>}
                        {visit.ifas_given && <span className="text-[8.5px] font-extrabold uppercase tracking-wider bg-toto-green/10 text-toto-green px-2.5 py-0.5 rounded-full">✓ IFAS</span>}
                        {visit.llin_given && <span className="text-[8.5px] font-extrabold uppercase tracking-wider bg-toto-green/10 text-toto-green px-2.5 py-0.5 rounded-full">✓ Net (LLIN)</span>}
                      </div>
                    )}

                    {/* Danger Signs detailed layout */}
                    {hasDangerSigns && (
                      <div className="bg-toto-red/10 border border-toto-red/20 rounded-[14px] p-2.5 mt-3">
                        <p className="text-[9px] font-extrabold text-toto-red tracking-wider uppercase mb-1.5 flex items-center gap-1">
                          <AlertTriangle size={11} /> Reported Danger Signs
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {visit.danger_signs.map(sign => (
                            <span key={sign} className="text-[9px] font-bold text-toto-red bg-white border border-toto-red/20 px-2 py-0.5 rounded-full">
                              {sign}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
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