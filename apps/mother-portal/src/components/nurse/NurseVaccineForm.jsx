import db from '@/api/base44Client';

import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

const VACCINE_SCHEDULE = [
  { name: 'BCG', code: 'BCG', dose: 1, age_weeks: 0 },
  { name: 'OPV 0', code: 'OPV0', dose: 0, age_weeks: 0 },
  { name: 'OPV 1', code: 'OPV1', dose: 1, age_weeks: 6 },
  { name: 'Pentavalent 1', code: 'PENTA1', dose: 1, age_weeks: 6 },
  { name: 'PCV 1', code: 'PCV1', dose: 1, age_weeks: 6 },
  { name: 'Rota 1', code: 'ROTA1', dose: 1, age_weeks: 6 },
  { name: 'OPV 2', code: 'OPV2', dose: 2, age_weeks: 10 },
  { name: 'Pentavalent 2', code: 'PENTA2', dose: 2, age_weeks: 10 },
  { name: 'PCV 2', code: 'PCV2', dose: 2, age_weeks: 10 },
  { name: 'Rota 2', code: 'ROTA2', dose: 2, age_weeks: 10 },
  { name: 'OPV 3', code: 'OPV3', dose: 3, age_weeks: 14 },
  { name: 'Pentavalent 3', code: 'PENTA3', dose: 3, age_weeks: 14 },
  { name: 'PCV 3', code: 'PCV3', dose: 3, age_weeks: 14 },
  { name: 'IPV', code: 'IPV', dose: 1, age_weeks: 14 },
  { name: 'Measles 1', code: 'MR1', dose: 1, age_weeks: 36 },
  { name: 'Yellow Fever', code: 'YF', dose: 1, age_weeks: 36 },
  { name: 'Measles 2', code: 'MR2', dose: 2, age_weeks: 72 },
];

export default function NurseVaccineForm({ patient, children, onSaved }) {
  const [selectedChild, setSelectedChild] = useState(children[0] || null);
  const [existingRecords, setExistingRecords] = useState([]);
  const [selected, setSelected] = useState([]);
  const [givenDate, setGivenDate] = useState(new Date().toISOString().split('T')[0]);
  const [facility, setFacility] = useState(patient.facility_name || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (selectedChild) loadExisting();
  }, [selectedChild]);

  const loadExisting = async () => {
    const records = await db.entities.Immunization.filter({ child_id: selectedChild.id });
    setExistingRecords(records);
  };

  const isGiven = (code) => existingRecords.some(r => r.vaccine_code === code && r.status === 'given');

  const toggleVaccine = (code) => {
    setSelected(s => s.includes(code) ? s.filter(c => c !== code) : [...s, code]);
  };

  const handleSave = async () => {
    if (!selectedChild || selected.length === 0) return;
    setSaving(true);
    await Promise.all(selected.map(code => {
      const vaccine = VACCINE_SCHEDULE.find(v => v.code === code);
      // Check if a record exists already
      const existing = existingRecords.find(r => r.vaccine_code === code);
      if (existing) {
        return db.entities.Immunization.update(existing.id, {
          status: 'given',
          given_date: givenDate,
          facility,
        });
      } else {
        return db.entities.Immunization.create({
          child_id: selectedChild.id,
          vaccine_name: vaccine.name,
          vaccine_code: code,
          dose_number: vaccine.dose,
          age_weeks: vaccine.age_weeks,
          scheduled_date: givenDate,
          given_date: givenDate,
          status: 'given',
          facility,
        });
      }
    }));
    await loadExisting();
    setSaving(false);
    setSaved(true);
    setSelected([]);
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
      <p className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0]">Mark Vaccines Given</p>

      {/* Child selector */}
      {children.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {children.map(c => (
            <button key={c.id} onClick={() => setSelectedChild(c)}
              className={cn('px-4 py-2 rounded-full text-[13px] font-semibold border-2 transition-all',
                selectedChild?.id === c.id ? 'bg-[#2E7A5D] text-white border-[#2E7A5D]' : 'bg-white border-[#E5E5E5] text-[#666666]')}>
              {c.full_name}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0]">Date Given</label>
          <input type="date" value={givenDate} onChange={e => setGivenDate(e.target.value)}
            className="h-12 px-4 bg-white border border-[#E5E5E5] rounded-[14px] text-[14px] font-medium outline-none focus:border-[#2E7A5D]" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0]">Facility</label>
          <input value={facility} onChange={e => setFacility(e.target.value)} placeholder="Facility name"
            className="h-12 px-4 bg-white border border-[#E5E5E5] rounded-[14px] text-[14px] font-medium outline-none focus:border-[#2E7A5D]" />
        </div>
      </div>

      <div>
        <p className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0] mb-3">Select vaccines administered today</p>
        <div className="flex flex-col gap-2">
          {VACCINE_SCHEDULE.map(v => {
            const given = isGiven(v.code);
            const isSelected = selected.includes(v.code);
            return (
              <button
                key={v.code}
                onClick={() => !given && toggleVaccine(v.code)}
                disabled={given}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-[14px] border-2 text-left transition-all',
                  given ? 'bg-[#2E7A5D]/5 border-[#2E7A5D]/30 opacity-60 cursor-default' :
                  isSelected ? 'bg-[#2E7A5D]/8 border-[#2E7A5D]' :
                  'bg-white border-[#E5E5E5] active:scale-[0.98]'
                )}
              >
                <div className={cn('w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border-2',
                  given ? 'bg-[#2E7A5D] border-[#2E7A5D]' :
                  isSelected ? 'bg-[#2E7A5D] border-[#2E7A5D]' : 'border-[#D0D0D0]')}>
                  {(given || isSelected) && <Check size={12} className="text-white" strokeWidth={3} />}
                </div>
                <div className="flex-1">
                  <p className={cn('text-[13px] font-bold', given ? 'text-[#2E7A5D]' : 'text-[#0A0A0A]')}>{v.name}</p>
                  <p className="text-[10px] text-[#A0A0A0]">Week {v.age_weeks}</p>
                </div>
                {given && <span className="text-[10px] font-bold text-[#2E7A5D] bg-[#2E7A5D]/10 px-2 py-0.5 rounded-full">Given</span>}
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving || selected.length === 0}
        className={cn(
          'h-14 rounded-full text-[15px] font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.97]',
          saved ? 'bg-[#2E7A5D] text-white' : 'bg-[#2E7A5D] text-white shadow-green-glow disabled:opacity-50'
        )}
      >
        {saved ? <><Check size={18} /> Saved!</> : saving ? 'Saving...' : `Mark ${selected.length || ''} Vaccine${selected.length !== 1 ? 's' : ''} Given`}
      </button>
    </div>
  );
}