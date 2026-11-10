import React, { useState } from 'react';
import {
  ShieldAlert,
  Phone,
  Truck,
  AlertTriangle,
  CheckSquare,
  Square,
  ArrowLeft,
  MapPin,
  Clock,
  FileText,
  Users,
  CreditCard,
} from 'lucide-react';
import { evaluateDangerSigns } from '@totoafya/business-logic';
import { PillButton } from '@totoafya/shared-ui';

const RED_FLAG_SYMPTOMS = [
  { id: 'bleeding', en: 'Vaginal bleeding / spotting', sw: 'Kutokwa na damu ukeni', keyword: 'damu' },
  { id: 'convulsions', en: 'Convulsions, fits, or seizures', sw: 'Kifafa cha mimba au degedege', keyword: 'kifafa' },
  { id: 'headache', en: 'Severe headache or blurred vision', sw: 'Kuumwa na kichwa sana au kutoona vizuri', keyword: 'severe headache' },
  { id: 'movement', en: 'Baby stopped moving or moves much less', sw: 'Mtoto kuacha kucheza au hachezi', keyword: 'hachezi' },
  { id: 'fever', en: 'High fever or severe chills', sw: 'Homa kali au kutetemeka', keyword: 'homa kali' },
  { id: 'fluid', en: 'Water broke early or leaking fluid', sw: 'Maji kuvunjika kabla ya wakati', keyword: 'maji kuvunjika' },
  { id: 'chest_pain', en: 'Severe chest pain or difficulty breathing', sw: 'Maumivu makali ya kifua au kupumua kwa shida', keyword: 'difficulty breathing' },
  { id: 'fainting', en: 'Loss of consciousness or fainting', sw: 'Kupoteza fahamu au kuzirai', keyword: 'kuzirai' },
];

export function SCR21EmergencyTakeover({
  lang = 'en',
  onNavigate,
  detectedSymptoms: initialDetected = [],
  hospitalName = 'Ruiru Sub-County Hospital Maternity Wing',
  hospitalPhone = '0722000000',
  ambulanceNumber = '1199',
  className = '',
}) {
  const isSw = lang === 'sw';

  // State of selected symptoms
  const [selectedSymptoms, setSelectedSymptoms] = useState(() => {
    if (Array.isArray(initialDetected) && initialDetected.length > 0) {
      return initialDetected;
    }
    return ['bleeding']; // Default active emergency indicator
  });

  const toggleSymptom = (id) => {
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  // Convert selected ids to keywords for clinical sniffer
  const symptomKeywords = selectedSymptoms.map((id) => {
    const item = RED_FLAG_SYMPTOMS.find((s) => s.id === id);
    return item ? item.keyword : id;
  });

  const evaluation = evaluateDangerSigns(symptomKeywords);

  return (
    <main
      role="main"
      data-testid="scr21-emergency-takeover"
      className={`fixed inset-0 z-50 overflow-y-auto bg-[#FEF2F2] flex flex-col items-center justify-start p-4 md:p-6 text-left ${className}`}
    >
      <div className="w-full max-w-md flex flex-col gap-5 pt-2 pb-12">
        {/* Top Dismiss / Back Action */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('/dashboard')}
            aria-label={isSw ? 'Rudi kwenye dashibodi' : 'Return to dashboard'}
            className="min-h-[48px] px-3.5 py-2 rounded-full bg-white border border-[#FCA5A5] text-xs font-bold text-[#991B1B] hover:bg-[#FEE2E2] active:scale-95 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>{isSw ? 'Rudi Dashibodi' : 'Exit Emergency'}</span>
          </button>

          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-[#DC2626] text-white uppercase tracking-wider animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-white" aria-hidden="true" />
            <span>{isSw ? 'HATARI YA AFYA' : 'RED ALERT'}</span>
          </span>
        </div>

        {/* Warning Icon & Main Headline */}
        <div className="flex flex-col items-center text-center gap-2 pt-2">
          <div className="w-16 h-16 rounded-full bg-[#DC2626] text-white flex items-center justify-center shadow-lg shadow-[#DC2626]/30 animate-bounce">
            <ShieldAlert className="w-9 h-9" aria-hidden="true" />
          </div>

          <h1 className="text-2xl font-black font-serif text-[#991B1B] tracking-tight">
            {isSw ? 'DHARURA YA AFYA (Emergency SOS)' : 'EMERGENCY CLINICAL TRIAGE'}
          </h1>
          <p className="text-xs md:text-sm font-semibold text-[#7F1D1D] max-w-xs leading-relaxed">
            {isSw
              ? 'Unahitaji huduma ya haraka ya kimatibabu hospitalini sasa hivi.'
              : 'Immediate facility care required. Contact emergency services or proceed to the nearest hospital maternity wing.'}
          </p>
        </div>

        {/* Primary Hospital Action Card (1-Tap Calling) */}
        <section
          aria-label={isSw ? 'Simu ya Dharura ya Hospitali' : 'Facility Emergency Calling'}
          className="w-full rounded-3xl bg-white border-2 border-[#DC2626] p-5 shadow-xl shadow-[#DC2626]/10 flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-[#DC2626] uppercase tracking-wider">
              {isSw ? 'Hospitali ya Karibu' : 'Nearest Maternity Facility'}
            </span>
            <h2 className="text-lg font-bold font-serif text-[#1A202C]">
              {hospitalName}
            </h2>
            <div className="flex items-center gap-3 text-xs text-[#718096] pt-0.5">
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#DC2626]" aria-hidden="true" />
                <span>4.2 km</span>
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#DC2626]" aria-hidden="true" />
                <span>~12 mins by car</span>
              </span>
            </div>
          </div>

          {/* 1-Tap Hospital Phone Button */}
          <a
            href={`tel:${hospitalPhone}`}
            aria-label={isSw ? `Piga simu ya hospitali: ${hospitalPhone}` : `Call emergency maternity ward: ${hospitalPhone}`}
            className="w-full min-h-[56px] px-6 py-3.5 rounded-2xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-md shadow-[#DC2626]/25"
          >
            <Phone className="w-6 h-6 text-white animate-pulse" aria-hidden="true" />
            <span>{isSw ? `Piga Simu Hospitalini (${hospitalPhone})` : `Call Facility (${hospitalPhone})`}</span>
          </a>

          {/* 1-Tap County Ambulance Button (1199) */}
          <a
            href={`tel:${ambulanceNumber}`}
            aria-label={isSw ? `Piga ambulensi ya kaunti: ${ambulanceNumber}` : `Call County Ambulance: ${ambulanceNumber}`}
            className="w-full min-h-[48px] px-5 py-3 rounded-2xl bg-[#FFFBEB] border-2 border-[#FDE68A] hover:bg-[#FEF3C7] text-[#1A202C] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all"
          >
            <Truck className="w-5 h-5 text-[#B45309]" aria-hidden="true" />
            <span>{isSw ? `Piga Ambulensi ya Kaunti (${ambulanceNumber})` : `Call Free Ambulance (${ambulanceNumber})`}</span>
          </a>
        </section>

        {/* Dynamic Detected Red-Flags Checklist */}
        <section
          aria-label={isSw ? 'Dalili za Hatari Zilizotambuliwa' : 'Detected Danger Signs'}
          className="w-full rounded-2xl bg-white border border-[#FCA5A5] p-4 flex flex-col gap-3 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#991B1B] uppercase tracking-wider">
              {isSw ? 'Dalili za Hatari Unazohisi Sasa' : 'Select Signs You Are Experiencing'}
            </span>
            <span className="text-[11px] font-bold text-[#DC2626]">
              {selectedSymptoms.length} {isSw ? 'Zilizochaguliwa' : 'Selected'}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            {RED_FLAG_SYMPTOMS.map((symptom) => {
              const isChecked = selectedSymptoms.includes(symptom.id);
              return (
                <button
                  key={symptom.id}
                  type="button"
                  onClick={() => toggleSymptom(symptom.id)}
                  aria-pressed={isChecked}
                  className={`min-h-[48px] w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-left transition-all ${
                    isChecked
                      ? 'bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] font-bold'
                      : 'bg-[#F9F8F5] border border-transparent text-[#4A5568] hover:bg-[#F1EFEA]'
                  }`}
                >
                  {isChecked ? (
                    <CheckSquare className="w-5 h-5 text-[#DC2626] shrink-0" aria-hidden="true" />
                  ) : (
                    <Square className="w-5 h-5 text-[#CBD5E1] shrink-0" aria-hidden="true" />
                  )}
                  <span className="text-xs leading-snug">
                    {isSw ? symptom.sw : symptom.en}
                  </span>
                </button>
              );
            })}
          </div>

          {evaluation.isEmergency && (
            <div className="mt-1 p-3 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] text-xs font-semibold text-[#991B1B]">
              {isSw ? evaluation.recommendationSw : evaluation.recommendationEn}
            </div>
          )}
        </section>

        {/* Departure Checklist Box (Mambo ya Kubeba Hospitalini Mara Moja) */}
        <section
          aria-label={isSw ? 'Vitu vya Kubeba Hospitalini' : 'Departure Checklist'}
          className="w-full rounded-2xl bg-white border border-[#E2E8F0] p-4 flex flex-col gap-3 shadow-xs"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#DC2626]" aria-hidden="true" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A202C]">
              {isSw ? 'Vitu vya Kubeba Hospitalini Mara Moja:' : 'Grab & Go Hospital Checklist:'}
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-2 text-xs text-[#1A202C]">
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#F9F8F5] border border-[#E2E8F0]">
              <FileText className="w-4 h-4 text-[#006B5F] shrink-0" aria-hidden="true" />
              <span>
                <strong>{isSw ? 'Kadi ya Kliniki:' : 'MoH 216 Card:'}</strong>{' '}
                {isSw ? 'Kadi yako ya uzazi ya MoH 216' : 'Maternal & Child Health clinic booklet'}
              </span>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#F9F8F5] border border-[#E2E8F0]">
              <CreditCard className="w-4 h-4 text-[#006B5F] shrink-0" aria-hidden="true" />
              <span>
                <strong>{isSw ? 'Kitambulisho:' : 'National ID & SHA:'}</strong>{' '}
                {isSw ? 'Kitambulisho chako cha Taifa na nambari ya SHA/NHIF' : 'National identity card & insurance card'}
              </span>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#F9F8F5] border border-[#E2E8F0]">
              <Users className="w-4 h-4 text-[#006B5F] shrink-0" aria-hidden="true" />
              <span>
                <strong>{isSw ? 'Mtu wa Kusindikiza:' : 'Birth Companion:'}</strong>{' '}
                {isSw ? 'Mwambie mume au ndugu akusindikize mara moja' : 'Have your partner or family member accompany you'}
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
