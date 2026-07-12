import db from '@/api/totoafyaClient';

import React, { useState } from 'react';
import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0]">{label}</label>
    {children}
  </div>
);

const Input = ({ value, onChange, type = 'text', placeholder }) => (
  <input
    type={type}
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    className="h-12 px-4 bg-white border border-[#E5E5E5] rounded-[14px] text-[14px] font-medium text-[#0A0A0A] placeholder:text-[#A0A0A0] outline-none focus:border-[#2E5B47] transition-colors"
  />
);

const DANGER_SIGNS = ['Heavy bleeding','Severe headache','Blurred vision','Swollen face/hands','Fits/convulsions','Reduced fetal movement','Fever','Difficulty breathing'];

export default function NurseANCForm({ patient, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    visit_date: new Date().toISOString().split('T')[0],
    gestational_age_weeks: '',
    facility: patient.facility_name || '',
    clinician_name: '',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    weight_kg: '',
    fundal_height_cm: '',
    fetal_heart_rate: '',
    haemoglobin: '',
    urine_protein: 'negative',
    hiv_status: 'not_tested',
    ttv_given: false,
    ifas_given: false,
    llin_given: false,
    danger_signs: [],
    notes: '',
  });

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleDanger = (sign) => {
    setForm(f => ({
      ...f,
      danger_signs: f.danger_signs.includes(sign)
        ? f.danger_signs.filter(s => s !== sign)
        : [...f.danger_signs, sign]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    await db.entities.ANCVisit.create({
      mother_id: patient.id,
      ...form,
      gestational_age_weeks: Number(form.gestational_age_weeks) || null,
      blood_pressure_systolic: Number(form.blood_pressure_systolic) || null,
      blood_pressure_diastolic: Number(form.blood_pressure_diastolic) || null,
      weight_kg: Number(form.weight_kg) || null,
      fundal_height_cm: Number(form.fundal_height_cm) || null,
      fetal_heart_rate: Number(form.fetal_heart_rate) || null,
      haemoglobin: Number(form.haemoglobin) || null,
    });
    setSaving(false);
    setSaved(true);
    onSaved();
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="bg-white rounded-[24px] border border-[#E5E5E5] p-5 flex flex-col gap-5">
      <p className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0]">Record ANC Visit</p>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Visit Date">
          <Input type="date" value={form.visit_date} onChange={v => setF('visit_date', v)} />
        </Field>
        <Field label="Gestational Age (wks)">
          <Input type="number" value={form.gestational_age_weeks} onChange={v => setF('gestational_age_weeks', v)} placeholder="e.g. 28" />
        </Field>
        <Field label="BP Systolic (mmHg)">
          <Input type="number" value={form.blood_pressure_systolic} onChange={v => setF('blood_pressure_systolic', v)} placeholder="e.g. 120" />
        </Field>
        <Field label="BP Diastolic (mmHg)">
          <Input type="number" value={form.blood_pressure_diastolic} onChange={v => setF('blood_pressure_diastolic', v)} placeholder="e.g. 80" />
        </Field>
        <Field label="Weight (kg)">
          <Input type="number" value={form.weight_kg} onChange={v => setF('weight_kg', v)} placeholder="e.g. 65" />
        </Field>
        <Field label="Fundal Height (cm)">
          <Input type="number" value={form.fundal_height_cm} onChange={v => setF('fundal_height_cm', v)} placeholder="e.g. 28" />
        </Field>
        <Field label="Fetal Heart Rate">
          <Input type="number" value={form.fetal_heart_rate} onChange={v => setF('fetal_heart_rate', v)} placeholder="e.g. 140" />
        </Field>
        <Field label="Haemoglobin (g/dL)">
          <Input type="number" value={form.haemoglobin} onChange={v => setF('haemoglobin', v)} placeholder="e.g. 11.5" />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Urine Protein">
          <select value={form.urine_protein} onChange={e => setF('urine_protein', e.target.value)}
            className="h-12 px-4 bg-white border border-[#E5E5E5] rounded-[14px] text-[14px] font-medium text-[#0A0A0A] outline-none focus:border-[#2E5B47]">
            {['negative','trace','1+','2+','3+'].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </Field>
        <Field label="HIV Status">
          <select value={form.hiv_status} onChange={e => setF('hiv_status', e.target.value)}
            className="h-12 px-4 bg-white border border-[#E5E5E5] rounded-[14px] text-[14px] font-medium text-[#0A0A0A] outline-none focus:border-[#2E5B47]">
            {['negative','positive','not_tested','declined'].map(v => <option key={v} value={v}>{v.replace('_',' ')}</option>)}
          </select>
        </Field>
      </div>

      {/* Supplements given */}
      <Field label="Supplements / Interventions Given">
        <div className="flex gap-3 flex-wrap">
          {[{ key: 'ttv_given', label: 'TTV' }, { key: 'ifas_given', label: 'IFAs' }, { key: 'llin_given', label: 'LLIN' }].map(({ key, label }) => (
            <button key={key} onClick={() => setF(key, !form[key])}
              className={cn('px-4 py-2.5 rounded-full text-[13px] font-semibold border-2 transition-all active:scale-[0.96]',
                form[key] ? 'bg-[#2E5B47] text-white border-[#2E5B47]' : 'bg-white border-[#E5E5E5] text-[#666666]')}>
              {label}
            </button>
          ))}
        </div>
      </Field>

      {/* Danger signs */}
      <Field label="Danger Signs (select all present)">
        <div className="flex flex-wrap gap-2">
          {DANGER_SIGNS.map(sign => (
            <button key={sign} onClick={() => toggleDanger(sign)}
              className={cn('px-3 py-2 rounded-full text-[12px] font-semibold border transition-all active:scale-[0.96]',
                form.danger_signs.includes(sign)
                  ? 'bg-[#E51010] text-white border-[#E51010]'
                  : 'bg-white border-[#E5E5E5] text-[#666666]')}>
              {sign}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Clinician Name">
        <Input value={form.clinician_name} onChange={v => setF('clinician_name', v)} placeholder="Your name" />
      </Field>

      <Field label="Notes">
        <textarea value={form.notes} onChange={e => setF('notes', e.target.value)} placeholder="Additional clinical notes..."
          rows={3}
          className="px-4 py-3 bg-white border border-[#E5E5E5] rounded-[14px] text-[14px] font-medium text-[#0A0A0A] placeholder:text-[#A0A0A0] outline-none focus:border-[#2E5B47] transition-colors resize-none" />
      </Field>

      <button
        onClick={handleSave}
        disabled={saving || !form.visit_date}
        className={cn(
          'h-14 rounded-full text-[15px] font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.97]',
          saved ? 'bg-[#2E5B47] text-white' : 'bg-[#2E5B47] text-white shadow-green-glow disabled:opacity-50'
        )}
      >
        {saved ? <><Check size={18} /> Saved to patient record</> : saving ? 'Saving...' : 'Save ANC Visit'}
      </button>
    </div>
  );
}
