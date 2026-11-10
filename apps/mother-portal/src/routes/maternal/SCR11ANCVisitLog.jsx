import React, { useState } from 'react';
import {
  ChevronLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Heart,
  Activity,
  Plus,
  AlertTriangle,
  ShieldAlert,
  ChevronRight,
  Info,
  X,
} from 'lucide-react';
import { triageBloodPressure } from '@totoafya/business-logic';
import { StatusBadge, PillButton } from '@totoafya/shared-ui';

/**
 * Kenya MoH / WHO 8 Focused Antenatal Care Contacts Model
 */
const DEFAULT_ANC_CONTACTS = [
  {
    contactNumber: 1,
    timingEn: 'Contact 1 (Up to 12 Weeks)',
    timingSw: 'Kliniki ya 1 (Hadi Wiki 12)',
    focusEn: 'Booking, ultrasound dating, baseline labs (Hb, HIV, VDRL, Blood group, Urinalysis)',
    focusSw: 'Kujiandikisha, kipimo cha picha (ultrasound), vipimo vya damu na mkojo',
    status: 'completed',
    date: '2026-07-20',
    facility: 'Ruiru Sub-County Hospital',
    bloodPressure: '118/76',
    weightKg: 62.4,
    fundalHeightCm: 12,
    fetalHeartRateBpm: 154,
    ttvGiven: true,
    ifasGiven: true,
    llinGiven: true,
  },
  {
    contactNumber: 2,
    timingEn: 'Contact 2 (20 Weeks)',
    timingSw: 'Kliniki ya 2 (Wiki 20)',
    focusEn: 'Anomaly scan, maternal wellbeing, fetal anatomy review',
    focusSw: 'Uchunguzi wa kina wa kijusi na afya ya mama',
    status: 'completed',
    date: '2026-09-14',
    facility: 'Ruiru Sub-County Hospital',
    bloodPressure: '120/78',
    weightKg: 64.8,
    fundalHeightCm: 20,
    fetalHeartRateBpm: 148,
    ttvGiven: true,
    ifasGiven: true,
    llinGiven: false,
  },
  {
    contactNumber: 3,
    timingEn: 'Contact 3 (26 Weeks)',
    timingSw: 'Kliniki ya 3 (Wiki 26)',
    focusEn: 'Gestational diabetes, pre-eclampsia screening, anemia check',
    focusSw: 'Uchunguzi wa kisukari cha mimba na shinikizo la damu',
    status: 'completed',
    date: '2026-10-26',
    facility: 'Ruiru Sub-County Hospital',
    bloodPressure: '124/80',
    weightKg: 67.2,
    fundalHeightCm: 26,
    fetalHeartRateBpm: 142,
    ttvGiven: false,
    ifasGiven: true,
    llinGiven: false,
  },
  {
    contactNumber: 4,
    timingEn: 'Contact 4 (30 Weeks) — CURRENT DUE',
    timingSw: 'Kliniki ya 4 (Wiki 30) — INASTAHILI',
    focusEn: 'IFAS review, fetal growth, pre-eclampsia assessment, birth plan introduction',
    focusSw: 'Ukaguzi wa IFAS, makuzi ya mtoto, shinikizo la damu, na mpango wa kujifungua',
    status: 'due',
    date: '2026-11-23',
    facility: 'Ruiru Sub-County Hospital',
    bloodPressure: null,
    weightKg: null,
    fundalHeightCm: null,
    fetalHeartRateBpm: null,
    ttvGiven: false,
    ifasGiven: false,
    llinGiven: false,
  },
  {
    contactNumber: 5,
    timingEn: 'Contact 5 (34 Weeks)',
    timingSw: 'Kliniki ya 5 (Wiki 34)',
    focusEn: 'Pre-eclampsia check, TTV booster review, maternal symptom review',
    focusSw: 'Kipimo cha shinikizo la damu na chanjo ya pepopunda',
    status: 'upcoming',
    date: '2026-12-21',
    facility: 'Ruiru Sub-County Hospital',
  },
  {
    contactNumber: 6,
    timingEn: 'Contact 6 (36 Weeks)',
    timingSw: 'Kliniki ya 6 (Wiki 36)',
    focusEn: 'Birth preparedness finalization, hospital bag, emergency transport',
    focusSw: 'Kukamilisha mpango wa uzazi, begi la hospitali, na usafiri wa dharura',
    status: 'upcoming',
    date: '2027-01-04',
    facility: 'Ruiru Sub-County Hospital',
  },
  {
    contactNumber: 7,
    timingEn: 'Contact 7 (38 Weeks)',
    timingSw: 'Kliniki ya 7 (Wiki 38)',
    focusEn: 'Fetal presentation (head-down), true vs false labor signs',
    focusSw: 'Mwelekeo wa mtoto na kutambua uchungu wa leba',
    status: 'upcoming',
    date: '2027-01-18',
    facility: 'Ruiru Sub-County Hospital',
  },
  {
    contactNumber: 8,
    timingEn: 'Contact 8 (40 Weeks)',
    timingSw: 'Kliniki ya 8 (Wiki 40)',
    focusEn: 'Delivery readiness, post-term monitoring, immediate newborn care planning',
    focusSw: 'Kujifungua na maandalizi ya kwanza ya mtoto mchanga',
    status: 'upcoming',
    date: '2027-02-01',
    facility: 'Ruiru Sub-County Hospital',
  },
];

export function SCR11ANCVisitLog({
  lang = 'en',
  onNavigate,
  motherName = 'Faith',
  className = '',
}) {
  const isSw = lang === 'sw';
  const [contacts, setContacts] = useState(DEFAULT_ANC_CONTACTS);
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  // Form state for logging a visit & BP triage
  const [formData, setFormData] = useState({
    contactNumber: 4,
    date: new Date().toISOString().split('T')[0],
    facility: 'Ruiru Sub-County Hospital',
    systolic: '',
    diastolic: '',
    weightKg: '',
    fundalHeightCm: '',
    fetalHeartRateBpm: '',
    ttvGiven: false,
    ifasGiven: true,
    llinGiven: false,
  });

  const [triageAlert, setTriageAlert] = useState(null);

  // Real-time BP validation & triage preview
  const handleBPChange = (field, val) => {
    const updated = { ...formData, [field]: val };
    setFormData(updated);

    const s = parseInt(updated.systolic, 10);
    const d = parseInt(updated.diastolic, 10);

    if (!isNaN(s) && !isNaN(d) && s > 0 && d > 0) {
      const result = triageBloodPressure(s, d);
      if (result.isValid && result.isEmergency) {
        setTriageAlert(result);
      } else {
        setTriageAlert(null);
      }
    } else {
      setTriageAlert(null);
    }
  };

  const handleSaveVisit = (e) => {
    e.preventDefault();
    const s = parseInt(formData.systolic, 10);
    const d = parseInt(formData.diastolic, 10);

    const bpString = !isNaN(s) && !isNaN(d) ? `${s}/${d}` : null;

    setContacts((prev) =>
      prev.map((c) => {
        if (c.contactNumber === formData.contactNumber) {
          return {
            ...c,
            status: 'completed',
            date: formData.date,
            facility: formData.facility,
            bloodPressure: bpString,
            weightKg: formData.weightKg ? parseFloat(formData.weightKg) : null,
            fundalHeightCm: formData.fundalHeightCm ? parseFloat(formData.fundalHeightCm) : null,
            fetalHeartRateBpm: formData.fetalHeartRateBpm ? parseInt(formData.fetalHeartRateBpm, 10) : null,
            ttvGiven: formData.ttvGiven,
            ifasGiven: formData.ifasGiven,
            llinGiven: formData.llinGiven,
          };
        }
        return c;
      })
    );

    setShowLogModal(false);
  };

  return (
    <div
      data-testid="scr11-anc-visit-log"
      className={`w-full flex flex-col gap-5 px-4 pt-3 pb-12 text-left bg-[#F9F8F5] min-h-screen ${className}`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('/dashboard')}
              aria-label={isSw ? 'Rudi nyumbani' : 'Back to dashboard'}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white border border-[#E2E8F0] text-[#1A202C] hover:bg-[#F1EFEA] active:scale-95 transition-all"
            >
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </button>
          )}
          <div>
            <h1 className="text-xl md:text-2xl font-bold font-serif text-[#1A202C] tracking-tight">
              {isSw ? 'Kadi ya Kliniki ya Ujauzito' : 'ANC Visit Log'}
            </h1>
            <p className="text-xs text-[#718096] font-medium">
              {isSw ? 'Miongozo 8 ya WHO na Wizara ya Afya (MoH 216)' : '8 WHO & Kenya MoH Recommended Contacts'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormData((f) => ({ ...f, contactNumber: 4 }));
            setShowLogModal(true);
          }}
          aria-label={isSw ? 'Weka rekodi ya kliniki' : 'Log clinic visit'}
          className="min-h-[48px] px-3.5 py-2 rounded-full bg-[#006B5F] text-white text-xs font-bold hover:bg-[#004D44] active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4 text-white" aria-hidden="true" />
          <span>{isSw ? 'Rekodi' : 'Log Visit'}</span>
        </button>
      </div>

      {/* Overview Progress Card */}
      <div className="w-full rounded-2xl bg-white border border-[#E2E8F0] p-4 flex items-center justify-between shadow-xs">
        <div className="flex flex-col">
          <span className="text-[11px] font-semibold text-[#718096] uppercase tracking-wider">
            {isSw ? 'Maendeleo ya Kliniki' : 'Clinic Progress'}
          </span>
          <span className="text-lg font-bold text-[#1A202C]">
            {contacts.filter((c) => c.status === 'completed').length} / 8 {isSw ? 'Zimekamilika' : 'Completed'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {contacts.map((c) => {
            const isDone = c.status === 'completed';
            const isDue = c.status === 'due';
            return (
              <span
                key={c.contactNumber}
                aria-label={`Contact ${c.contactNumber}: ${c.status}`}
                className={`w-3.5 h-3.5 rounded-full ${
                  isDone
                    ? 'bg-[#15803D]'
                    : isDue
                    ? 'bg-[#E68A00] animate-pulse ring-2 ring-[#E68A00]/40'
                    : 'bg-[#E2E8F0]'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Connected 2px Vertical Timeline Cards */}
      <div className="relative pl-6 flex flex-col gap-5">
        {/* Timeline Spine */}
        <div className="absolute top-4 bottom-4 left-[15px] w-0.5 bg-[#E2E8F0] pointer-events-none" />

        {contacts.map((contact) => {
          const isDone = contact.status === 'completed';
          const isDue = contact.status === 'due';

          return (
            <div key={contact.contactNumber} className="relative flex items-start gap-4">
              {/* Spine Node */}
              <div
                className={`absolute -left-[24px] top-4 w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-xs z-10 ${
                  isDone
                    ? 'bg-[#15803D] text-white'
                    : isDue
                    ? 'bg-[#E68A00] text-[#1A202C] ring-4 ring-[#FEF3C7]'
                    : 'bg-white border-[#CBD5E1] text-[#718096]'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                ) : isDue ? (
                  <Clock className="w-4 h-4 text-[#1A202C]" aria-hidden="true" />
                ) : (
                  <Calendar className="w-3.5 h-3.5 text-[#718096]" aria-hidden="true" />
                )}
              </div>

              {/* Contact Card */}
              <article
                className={`w-full rounded-2xl p-4 md:p-5 text-left transition-all ${
                  isDue
                    ? 'bg-[#FFFBEB] border-2 border-[#FDE68A] shadow-sm'
                    : 'bg-white border border-[#E2E8F0] shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                  <div>
                    <h3 className="text-sm md:text-base font-bold font-serif text-[#1A202C]">
                      {isSw ? contact.timingSw : contact.timingEn}
                    </h3>
                    <span className="text-[11px] text-[#718096] font-medium block">
                      {contact.facility}
                    </span>
                  </div>

                  <StatusBadge
                    status={isDone ? 'healthy' : isDue ? 'warning' : 'neutral'}
                    label={
                      isDone
                        ? (isSw ? 'Imekamilika' : 'Completed')
                        : isDue
                        ? (isSw ? 'Inastahili Sasa' : 'Due Now')
                        : (isSw ? 'Inayofuata' : 'Scheduled')
                    }
                    size="sm"
                  />
                </div>

                <p className="text-xs text-[#4A5568] leading-relaxed mb-3">
                  {isSw ? contact.focusSw : contact.focusEn}
                </p>

                {/* Completed Clinical Metrics Row */}
                {isDone && (
                  <div className="pt-2 border-t border-[#E2E8F0] grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="flex flex-col">
                      <span className="text-[#718096] text-[10px] uppercase font-semibold">BP</span>
                      <span className="font-bold text-[#1A202C]">{contact.bloodPressure ? `${contact.bloodPressure} mmHg` : '—'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[#718096] text-[10px] uppercase font-semibold">Uzito (Weight)</span>
                      <span className="font-bold text-[#1A202C]">{contact.weightKg ? `${contact.weightKg} kg` : '—'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[#718096] text-[10px] uppercase font-semibold">Fundal Ht</span>
                      <span className="font-bold text-[#1A202C]">{contact.fundalHeightCm ? `${contact.fundalHeightCm} cm` : '—'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[#718096] text-[10px] uppercase font-semibold">FHR (Moyo)</span>
                      <span className="font-bold text-[#1A202C]">{contact.fetalHeartRateBpm ? `${contact.fetalHeartRateBpm} bpm` : '—'}</span>
                    </div>
                  </div>
                )}

                {/* Medication / Interventions Check-offs */}
                {isDone && (
                  <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 border-t border-dashed border-[#E2E8F0]">
                    {contact.ifasGiven && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#E6F4F1] text-[#006B5F] border border-[#BCE1DB]">
                        <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                        <span>IFAS (Iron/Folate)</span>
                      </span>
                    )}
                    {contact.ttvGiven && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#E6F4F1] text-[#006B5F] border border-[#BCE1DB]">
                        <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                        <span>TTV (Pepopunda)</span>
                      </span>
                    )}
                    {contact.llinGiven && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#E6F4F1] text-[#006B5F] border border-[#BCE1DB]">
                        <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                        <span>LLIN (Chandarua)</span>
                      </span>
                    )}
                  </div>
                )}

                {/* Due Action CTA */}
                {isDue && (
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#B45309]">
                      {isSw ? `Tarehe: ${contact.date}` : `Scheduled: ${contact.date}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((f) => ({ ...f, contactNumber: contact.contactNumber }));
                        setShowLogModal(true);
                      }}
                      className="min-h-[48px] px-4 py-2 rounded-full bg-[#E68A00] hover:bg-[#CC7A00] text-[#1A202C] font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all shadow-xs"
                    >
                      <span>{isSw ? 'Rekodi Vipimo vya Leo' : 'Log Measurements'}</span>
                      <ChevronRight className="w-4 h-4 text-[#1A202C]" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </article>
            </div>
          );
        })}
      </div>

      {/* Modal: Log ANC Visit & BP Triage */}
      {showLogModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn"
        >
          <div className="w-full max-w-md rounded-3xl bg-white border border-[#E2E8F0] p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 id="modal-title" className="text-lg font-bold font-serif text-[#1A202C]">
                {isSw ? 'Weka Rekodi ya Kliniki ya ANC' : 'Log ANC Visit Record'}
              </h2>
              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                aria-label={isSw ? 'Funga' : 'Close'}
                className="w-10 h-10 rounded-full flex items-center justify-center text-[#718096] hover:bg-[#F1EFEA]"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSaveVisit} className="flex flex-col gap-4 text-left">
              {/* Contact Selector */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#1A202C]">
                  {isSw ? 'Nambari ya Kliniki' : 'ANC Contact Number'}
                </label>
                <select
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: parseInt(e.target.value, 10) })}
                  className="min-h-[48px] px-3 rounded-xl border border-[#CBD5E1] bg-white text-sm text-[#1A202C]"
                >
                  {contacts.map((c) => (
                    <option key={c.contactNumber} value={c.contactNumber}>
                      {isSw ? c.timingSw : c.timingEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Facility */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#1A202C]">
                    {isSw ? 'Tarehe' : 'Visit Date'}
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    className="min-h-[48px] px-3 rounded-xl border border-[#CBD5E1] text-xs text-[#1A202C]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#1A202C]">
                    {isSw ? 'Kituo cha Afya' : 'Facility'}
                  </label>
                  <input
                    type="text"
                    value={formData.facility}
                    onChange={(e) => setFormData({ ...formData, facility: e.target.value })}
                    placeholder="e.g. Ruiru Hospital"
                    required
                    className="min-h-[48px] px-3 rounded-xl border border-[#CBD5E1] text-xs text-[#1A202C]"
                  />
                </div>
              </div>

              {/* Blood Pressure Input with Pre-eclampsia Triage */}
              <div className="p-3.5 rounded-2xl bg-[#F9F8F5] border border-[#E2E8F0] flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1A202C]">
                    {isSw ? 'Shinikizo la Damu (Blood Pressure)' : 'Blood Pressure (mmHg)'}
                  </span>
                  <span className="text-[11px] text-[#718096]">Systolic / Diastolic</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    min="50"
                    max="300"
                    value={formData.systolic}
                    onChange={(e) => handleBPChange('systolic', e.target.value)}
                    placeholder="Systolic (e.g. 120)"
                    aria-label="Systolic BP"
                    required
                    className="min-h-[48px] px-3 rounded-xl border border-[#CBD5E1] text-sm font-mono text-[#1A202C]"
                  />
                  <input
                    type="number"
                    min="30"
                    max="200"
                    value={formData.diastolic}
                    onChange={(e) => handleBPChange('diastolic', e.target.value)}
                    placeholder="Diastolic (e.g. 80)"
                    aria-label="Diastolic BP"
                    required
                    className="min-h-[48px] px-3 rounded-xl border border-[#CBD5E1] text-sm font-mono text-[#1A202C]"
                  />
                </div>

                {/* Triage Warning Alert */}
                {triageAlert && (
                  <div className="mt-2 p-3 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] flex items-start gap-2 text-xs text-[#991B1B]">
                    <ShieldAlert className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" aria-hidden="true" />
                    <div className="flex flex-col">
                      <span className="font-bold">
                        {triageAlert.category === 'SEVERE_HYPERTENSION_EMERGENCY'
                          ? (isSw ? 'HATARI YA KIFAFA CHA MIMBA!' : 'SEVERE HYPERTENSION EMERGENCY!')
                          : (isSw ? 'TAHADHARI YA PRE-ECLAMPSIA' : 'SUSPECTED PRE-ECLAMPSIA ALERT')}
                      </span>
                      <span>{isSw ? triageAlert.clinicalAlertSw : triageAlert.clinicalAlert}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Vitals: Weight, Fundal Height, FHR */}
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-[#1A202C]">
                    {isSw ? 'Uzito (kg)' : 'Weight (kg)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.weightKg}
                    onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                    placeholder="65.0"
                    className="min-h-[48px] px-2 rounded-xl border border-[#CBD5E1] text-xs text-[#1A202C]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-[#1A202C]">
                    {isSw ? 'Fundal (cm)' : 'Fundal (cm)'}
                  </label>
                  <input
                    type="number"
                    value={formData.fundalHeightCm}
                    onChange={(e) => setFormData({ ...formData, fundalHeightCm: e.target.value })}
                    placeholder="26"
                    className="min-h-[48px] px-2 rounded-xl border border-[#CBD5E1] text-xs text-[#1A202C]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-[#1A202C]">
                    {isSw ? 'Moyo (bpm)' : 'FHR (bpm)'}
                  </label>
                  <input
                    type="number"
                    value={formData.fetalHeartRateBpm}
                    onChange={(e) => setFormData({ ...formData, fetalHeartRateBpm: e.target.value })}
                    placeholder="140"
                    className="min-h-[48px] px-2 rounded-xl border border-[#CBD5E1] text-xs text-[#1A202C]"
                  />
                </div>
              </div>

              {/* Medication Check-offs */}
              <div className="flex flex-col gap-2 pt-1">
                <span className="text-xs font-bold text-[#1A202C]">
                  {isSw ? 'Dawa na Vifaa Vilivyotolewa' : 'Medications & Interventions'}
                </span>
                <label className="min-h-[48px] flex items-center gap-3 px-3 rounded-xl border border-[#E2E8F0] hover:bg-[#F9F8F5] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.ifasGiven}
                    onChange={(e) => setFormData({ ...formData, ifasGiven: e.target.checked })}
                    className="w-5 h-5 rounded text-[#006B5F] focus:ring-[#006B5F]"
                  />
                  <span className="text-xs font-medium text-[#1A202C]">
                    IFAS (Iron & Folic Acid Supplements)
                  </span>
                </label>
                <label className="min-h-[48px] flex items-center gap-3 px-3 rounded-xl border border-[#E2E8F0] hover:bg-[#F9F8F5] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.ttvGiven}
                    onChange={(e) => setFormData({ ...formData, ttvGiven: e.target.checked })}
                    className="w-5 h-5 rounded text-[#006B5F] focus:ring-[#006B5F]"
                  />
                  <span className="text-xs font-medium text-[#1A202C]">
                    TTV (Tetanus Toxoid Vaccine)
                  </span>
                </label>
                <label className="min-h-[48px] flex items-center gap-3 px-3 rounded-xl border border-[#E2E8F0] hover:bg-[#F9F8F5] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.llinGiven}
                    onChange={(e) => setFormData({ ...formData, llinGiven: e.target.checked })}
                    className="w-5 h-5 rounded text-[#006B5F] focus:ring-[#006B5F]"
                  />
                  <span className="text-xs font-medium text-[#1A202C]">
                    LLIN (Long-Lasting Insecticidal Net / Chandarua)
                  </span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="min-h-[48px] px-4 py-2 rounded-full border border-[#E2E8F0] text-xs font-semibold text-[#4A5568]"
                >
                  {isSw ? 'Ghairi' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="min-h-[48px] px-6 py-2 rounded-full bg-[#006B5F] hover:bg-[#004D44] text-white text-xs font-bold active:scale-95 transition-all shadow-sm"
                >
                  {isSw ? 'Hifadhi Rekodi' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
