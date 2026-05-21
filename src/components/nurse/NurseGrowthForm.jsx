import db from '@/api/totoafyaClient';

import React, { useState } from 'react';
import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

export default function NurseGrowthForm({ patient, children, onSaved }) {
  const [selectedChild, setSelectedChild] = useState(children[0] || null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    recorded_date: new Date().toISOString().split('T')[0],
    weight_kg: '',
    height_cm: '',
    muac_cm: '',
    head_circumference_cm: '',
    facility: patient.facility_name || '',
    recorded_by: '',
    notes: '',
  });

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const calcAgeWeeks = (dob) => {
    const diff = new Date() - new Date(dob);
    return Math.floor(diff / (7 * 24 * 60 * 60 * 1000));
  };

  const calcNutritionStatus = (muac) => {
    if (!muac) return 'normal';
    const m = parseFloat(muac);
    if (m < 11.5) return 'sam';
    if (m < 12.5) return 'mam';
    return 'normal';
  };

  const handleSave = async () => {
    if (!selectedChild) return;
    setSaving(true);
    const ageWeeks = selectedChild.date_of_birth ? calcAgeWeeks(selectedChild.date_of_birth) : null;
    await db.entities.GrowthRecord.create({
      child_id: selectedChild.id,
      recorded_date: form.recorded_date,
      age_weeks: ageWeeks,
      age_months: ageWeeks ? Math.floor(ageWeeks / 4.33) : null,
      weight_kg: parseFloat(form.weight_kg) || null,
      height_cm: parseFloat(form.height_cm) || null,
      muac_cm: parseFloat(form.muac_cm) || null,
      head_circumference_cm: parseFloat(form.head_circumference_cm) || null,
      nutrition_status: calcNutritionStatus(form.muac_cm),
      facility: form.facility,
      recorded_by: form.recorded_by,
      notes: form.notes,
    });
    setSaving(false);
    setSaved(true);
    onSaved();
    setTimeout(() => setSaved(false), 3000);
  };

  if (children.length === 0) {
    return (
      <div className="bg-white rounded-[24px] border border-dashed border-[#E5E5E5] p-8 text-center">
        <p className="text-[14px] font-bold text-[#0A0A0A] mb-1">No children registered</p>
        <p className="text-[12px] text-[#A0A0A0]">This patient has no children on record yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[24px] border border-[#E5E5E5] p-5 flex flex-col gap-5">
      <p className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0]">Record Growth Measurements</p>

      {children.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {children.map(c => (
            <button key={c.id} onClick={() => setSelectedChild(c)}
              className={cn('px-4 py-2 rounded-full text-[13px] font-semibold border-2 transition-all',
                selectedChild?.id === c.id ? 'bg-[#0047FF] text-white border-[#0047FF]' : 'bg-white border-[#E5E5E5] text-[#666666]')}>
              {c.full_name}
            </button>
          ))}
        </div>
      )}

      {selectedChild && (
        <div className="bg-[#F5F5F7] rounded-[14px] px-4 py-3 text-[12px] text-[#666666]">
          <span className="font-bold text-[#0A0A0A]">{selectedChild.full_name}</span>
          {selectedChild.date_of_birth && ` · ${calcAgeWeeks(selectedChild.date_of_birth)} weeks old`}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {[
          { key: 'recorded_date', label: 'Date', type: 'date', placeholder: '' },
          { key: 'weight_kg', label: 'Weight (kg)', type: 'number', placeholder: 'e.g. 8.5' },
          { key: 'height_cm', label: 'Height (cm)', type: 'number', placeholder: 'e.g. 72' },
          { key: 'muac_cm', label: 'MUAC (cm)', type: 'number', placeholder: 'e.g. 13.5' },
          { key: 'head_circumference_cm', label: 'Head Circ. (cm)', type: 'number', placeholder: 'e.g. 44' },
          { key: 'recorded_by', label: 'Recorded By', type: 'text', placeholder: 'Your name' },
        ].map(({ key, label, type, placeholder }) => (
          <div key={key} className="flex flex-col gap-1.5">
            <label className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0]">{label}</label>
            <input type={type} value={form[key]} onChange={e => setF(key, e.target.value)} placeholder={placeholder}
              className="h-12 px-4 bg-white border border-[#E5E5E5] rounded-[14px] text-[14px] font-medium text-[#0A0A0A] placeholder:text-[#A0A0A0] outline-none focus:border-[#0047FF] transition-colors" />
          </div>
        ))}
      </div>

      {form.muac_cm && (
        <div className={cn('rounded-[14px] px-4 py-3 text-[13px] font-bold',
          parseFloat(form.muac_cm) < 11.5 ? 'bg-[#E51010]/10 text-[#E51010]' :
          parseFloat(form.muac_cm) < 12.5 ? 'bg-[#F9A825]/10 text-[#F9A825]' :
          'bg-[#2E7A5D]/10 text-[#2E7A5D]'
        )}>
          MUAC Status: {parseFloat(form.muac_cm) < 11.5 ? '⚠️ SAM — Refer immediately' :
            parseFloat(form.muac_cm) < 12.5 ? '⚠️ MAM — Monitor closely' : '✓ Normal'}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0]">Notes</label>
        <textarea value={form.notes} onChange={e => setF('notes', e.target.value)} placeholder="Clinical notes..."
          rows={2}
          className="px-4 py-3 bg-white border border-[#E5E5E5] rounded-[14px] text-[14px] font-medium placeholder:text-[#A0A0A0] outline-none focus:border-[#0047FF] resize-none transition-colors" />
      </div>

      <button
        onClick={handleSave}
        disabled={saving || !form.recorded_date}
        className={cn(
          'h-14 rounded-full text-[15px] font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.97]',
          'bg-[#0047FF] text-white shadow-teal-glow disabled:opacity-50'
        )}
      >
        {saved ? <><Check size={18} /> Saved!</> : saving ? 'Saving...' : 'Save Growth Record'}
      </button>
    </div>
  );
}