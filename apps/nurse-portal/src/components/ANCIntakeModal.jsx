import React, { useState, useEffect } from 'react';
import {
  X,
  AlertTriangle,
  HeartPulse,
  Activity,
  Calendar,
  Save,
  Check,
  ShieldAlert,
} from 'lucide-react';
import { dataClient } from '@totoafya/api-client';
import { calculateGestationalAgeInWeeks, calculateEdd, DANGER_SIGNS_EN, DANGER_SIGNS_SW } from '@totoafya/business-logic';
import { Button, Input, Badge } from '@totoafya/shared-ui';

export default function ANCIntakeModal({ patient, onClose, onSaved, lang = 'en' }) {
  const isSw = lang === 'sw';

  // Form State
  const [visitNumber, setVisitNumber] = useState(1);
  const [visitDate, setVisitDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [lmp, setLmp] = useState(patient?.lmp || '');
  const [bpSystolic, setBpSystolic] = useState('');
  const [bpDiastolic, setBpDiastolic] = useState('');
  const [pulse, setPulse] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [temperature, setTemperature] = useState('36.8');
  const [fetalHeartRate, setFetalHeartRate] = useState('');
  const [fundalHeightCm, setFundalHeightCm] = useState('');
  const [haemoglobin, setHaemoglobin] = useState('');
  const [urineProtein, setUrineProtein] = useState('negative');
  const [selectedDangerSigns, setSelectedDangerSigns] = useState([]);
  const [ttvGiven, setTtvGiven] = useState(false);
  const [ifasGiven, setIfasGiven] = useState(true);
  const [llinGiven, setLlinGiven] = useState(false);
  const [nextVisitDate, setNextVisitDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 28); // 4 weeks later
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-calculated Gestation & EDD
  const gestationalWeeks = lmp ? calculateGestationalAgeInWeeks(lmp) : null;
  const calculatedEdd = lmp ? calculateEdd(lmp) : '';

  // Automatic Preeclampsia / Severe Hypertension evaluation
  const sysNum = parseInt(bpSystolic, 10);
  const diaNum = parseInt(bpDiastolic, 10);
  const isPreeclampsiaRisk = (sysNum && sysNum >= 140) || (diaNum && diaNum >= 90);

  const toggleDangerSign = (sign) => {
    setSelectedDangerSigns((prev) =>
      prev.includes(sign) ? prev.filter((s) => s !== sign) : [...prev, sign]
    );
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!bpSystolic || !bpDiastolic) {
      setError(isSw ? 'Tafadhali weka shinikizo la damu (BP)' : 'Please enter Blood Pressure (Systolic and Diastolic)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const visitPayload = {
        mother_id: patient.id,
        visit_number: parseInt(visitNumber, 10) || 1,
        visit_date: visitDate,
        gestational_age_weeks: gestationalWeeks || undefined,
        blood_pressure_systolic: sysNum,
        blood_pressure_diastolic: diaNum,
        weight_kg: weightKg ? parseFloat(weightKg) : undefined,
        fundal_height_cm: fundalHeightCm ? parseFloat(fundalHeightCm) : undefined,
        fetal_heart_rate: fetalHeartRate ? parseInt(fetalHeartRate, 10) : undefined,
        haemoglobin: haemoglobin ? parseFloat(haemoglobin) : undefined,
        urine_protein: urineProtein,
        ttv_given: ttvGiven,
        ifas_given: ifasGiven,
        llin_given: llinGiven,
        danger_signs: selectedDangerSigns,
        next_visit_date: nextVisitDate,
        notes: notes || undefined,
      };

      await dataClient.ancVisits.create(visitPayload);

      // If preeclampsia or danger signs, escalate mother's risk level
      if (isPreeclampsiaRisk || selectedDangerSigns.length > 0) {
        await dataClient.mothers.update(patient.id, {
          risk_level: 'critical',
          risk_score: 85,
        });
      }

      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save ANC clinical visit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0A]/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#006B5F] text-white flex items-center justify-center font-bold">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#0A0A0A] leading-tight">
                {isSw ? 'Rekodi ya Ziara ya ANC' : 'Record ANC Clinical Encounter'}
              </h3>
              <p className="text-xs text-[#6B7280]">
                {patient.full_name} • ANC: {patient.anc_number || 'N/A'} • ID: {patient.national_id || 'N/A'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-[#DC2626] flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Automatic Preeclampsia Alert Banner */}
          {isPreeclampsiaRisk && (
            <div className="p-4 bg-red-50 border-2 border-[#DC2626] rounded-xl text-[#DC2626] flex items-start gap-3 animate-pulse">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#DC2626]" />
              <div>
                <p className="text-xs font-black uppercase tracking-wider">
                  ⚠️ PREECLAMPSIA / SEVERE HYPERTENSION DETECTED ({bpSystolic}/{bpDiastolic} mmHg)
                </p>
                <p className="text-xs mt-0.5 leading-snug font-medium">
                  Systolic BP &ge; 140 or Diastolic BP &ge; 90 indicates gestational hypertension. Administer magnesium sulphate protocol and escalate for urgent obstetric review.
                </p>
              </div>
            </div>
          )}

          {/* Section 1: Timeline & Gestation */}
          <div className="bg-[#F7F5F0] p-4 rounded-xl border border-slate-200/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#006B5F] mb-3 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Visit Timeline & Gestation</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase">Visit Number</label>
                <select
                  value={visitNumber}
                  onChange={(e) => setVisitNumber(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-[#D1D5DB] rounded-lg text-sm font-semibold outline-none focus:border-[#006B5F]"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>
                      Visit {n} (WHO Milestone)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase">Visit Date</label>
                <input
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-[#D1D5DB] rounded-lg text-sm font-semibold outline-none focus:border-[#006B5F]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase">LMP (Last Period)</label>
                <input
                  type="date"
                  value={lmp}
                  onChange={(e) => setLmp(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-[#D1D5DB] rounded-lg text-sm font-semibold outline-none focus:border-[#006B5F]"
                />
              </div>
            </div>

            {gestationalWeeks !== null && (
              <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Calculated Gestational Age: <strong className="text-[#006B5F] font-black">{gestationalWeeks} Weeks</strong></span>
                {calculatedEdd && <span>Estimated Delivery (EDD): <strong className="text-slate-900 font-bold">{calculatedEdd}</strong></span>}
              </div>
            )}
          </div>

          {/* Section 2: Clinical Vitals */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A] mb-3 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#006B5F]" />
              <span>Maternal Vitals & Measurements</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase">BP Systolic *</label>
                <input
                  type="number"
                  placeholder="120"
                  value={bpSystolic}
                  onChange={(e) => setBpSystolic(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-[#D1D5DB] rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-[#006B5F]"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase">BP Diastolic *</label>
                <input
                  type="number"
                  placeholder="80"
                  value={bpDiastolic}
                  onChange={(e) => setBpDiastolic(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-[#D1D5DB] rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-[#006B5F]"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase">Fetal Heart Rate (bpm)</label>
                <input
                  type="number"
                  placeholder="140"
                  value={fetalHeartRate}
                  onChange={(e) => setFetalHeartRate(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-[#D1D5DB] rounded-lg text-sm font-medium text-slate-900 outline-none focus:border-[#006B5F]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase">Fundal Height (cm)</label>
                <input
                  type="number"
                  placeholder="24"
                  value={fundalHeightCm}
                  onChange={(e) => setFundalHeightCm(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-[#D1D5DB] rounded-lg text-sm font-medium text-slate-900 outline-none focus:border-[#006B5F]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="65.5"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-[#D1D5DB] rounded-lg text-sm font-medium text-slate-900 outline-none focus:border-[#006B5F]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase">Temp (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="36.8"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-[#D1D5DB] rounded-lg text-sm font-medium text-slate-900 outline-none focus:border-[#006B5F]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase">Haemoglobin (g/dL)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="11.5"
                  value={haemoglobin}
                  onChange={(e) => setHaemoglobin(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-[#D1D5DB] rounded-lg text-sm font-medium text-slate-900 outline-none focus:border-[#006B5F]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase">Urine Protein</label>
                <select
                  value={urineProtein}
                  onChange={(e) => setUrineProtein(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-[#D1D5DB] rounded-lg text-sm font-medium outline-none focus:border-[#006B5F]"
                >
                  <option value="negative">Negative</option>
                  <option value="trace">Trace</option>
                  <option value="1+">1+</option>
                  <option value="2+">2+ (High)</option>
                  <option value="3+">3+ (Severe)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Danger Signs Checklist */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#DC2626] mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Danger Signs Checklist (Dalili za Hatari)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-red-50/40 p-3.5 rounded-xl border border-red-200">
              {DANGER_SIGNS_EN.map((sign, idx) => {
                const swSign = DANGER_SIGNS_SW[idx] || '';
                const isChecked = selectedDangerSigns.includes(sign);
                return (
                  <label
                    key={sign}
                    className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors text-xs select-none ${
                      isChecked ? 'bg-red-100/80 font-bold text-red-900' : 'hover:bg-red-100/40 text-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleDangerSign(sign)}
                      className="mt-0.5 rounded text-[#DC2626] focus:ring-[#DC2626] w-4 h-4"
                    />
                    <div>
                      <span>{sign}</span>
                      <span className="block text-[11px] font-normal text-slate-500 italic">
                        {swSign}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section 4: Prophylaxis & Next Appointment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase mb-2 block">
                Prophylactic Treatments
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={ttvGiven}
                    onChange={(e) => setTtvGiven(e.target.checked)}
                    className="w-4 h-4 rounded text-[#006B5F]"
                  />
                  <span>Tetanus Toxoid Vaccine (TTV) Administered</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={ifasGiven}
                    onChange={(e) => setIfasGiven(e.target.checked)}
                    className="w-4 h-4 rounded text-[#006B5F]"
                  />
                  <span>Iron & Folic Acid Supplements (IFAS) Issued</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={llinGiven}
                    onChange={(e) => setLlinGiven(e.target.checked)}
                    className="w-4 h-4 rounded text-[#006B5F]"
                  />
                  <span>Long-Lasting Insecticidal Net (LLIN) Issued</span>
                </label>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase mb-1 block">
                Next Scheduled ANC Visit
              </label>
              <input
                type="date"
                value={nextVisitDate}
                onChange={(e) => setNextVisitDate(e.target.value)}
                className="w-full h-11 px-3 bg-white border border-[#D1D5DB] rounded-lg text-sm font-semibold outline-none focus:border-[#006B5F]"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase mb-1 block">
              Clinical Observations & Prescriptions
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record maternal complaints, counseling, or ultrasound findings..."
              className="w-full p-3 bg-white border border-[#D1D5DB] rounded-lg text-sm text-slate-900 outline-none focus:border-[#006B5F]"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button variant="outline" size="md" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant={isPreeclampsiaRisk ? 'danger' : 'primary'}
              size="md"
              loading={loading}
              icon={Save}
            >
              {isPreeclampsiaRisk ? 'Save & Escalate Risk' : 'Save ANC Encounter'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
