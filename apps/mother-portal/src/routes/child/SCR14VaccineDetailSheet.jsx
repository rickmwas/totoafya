import React, { useState } from 'react';
import {
  X,
  Syringe,
  ShieldCheck,
  Thermometer,
  HeartHandshake,
  AlertTriangle,
  Calendar,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { StatusBadge, PillButton } from '@totoafya/shared-ui';

export function SCR14VaccineDetailSheet({
  isOpen,
  onClose,
  visit,
  lang = 'en',
  onMarkAdministered,
  className = '',
}) {
  const isSw = lang === 'sw';
  const [adminDate, setAdminDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [facility, setFacility] = useState('Ruiru Sub-County Hospital');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !visit) return null;

  const displayTitle = isSw
    ? (visit.visitLabelSw || visit.titleSw || visit.title || visit.visitLabelEn)
    : (visit.visitLabelEn || visit.title || visit.titleEn);

  const displayAge = isSw
    ? (visit.targetAgeDescriptionSw || visit.ageLabelSw || visit.ageLabel || visit.targetAgeDescriptionEn)
    : (visit.targetAgeDescriptionEn || visit.ageLabel || visit.ageLabelEn);

  const rawVaccines = visit.vaccines || visit.antigens || [];
  const normalizedVaccines = rawVaccines.map((v) => ({
    name: v.antigen || v.name,
    route: v.route || 'Intramuscular',
    site: v.site || 'Upper thigh / Deltoid',
    siteSw: v.siteSw || v.site || 'Paja la juu / Bega',
    diseaseTarget: v.diseaseTarget || 'Infectious childhood diseases',
    diseaseTargetSw: v.diseaseTargetSw || v.diseaseTarget || 'Magonjwa ya utotoni',
  }));

  const handleAdminister = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (typeof onMarkAdministered === 'function') {
      onMarkAdministered({
        visitNumber: visit.visitNumber,
        visitId: visit.visitId || visit.visitNumber,
        date: adminDate,
        facility,
      });
    }
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="vaccine-sheet-title"
      data-testid="scr14-vaccine-detail-sheet"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-fadeIn"
    >
      <div
        className={`w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white border border-[#E2E8F0] p-6 shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto text-left ${className}`}
      >
        {/* Header Row */}
        <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#E6F4F1] flex items-center justify-center text-[#006B5F] shrink-0">
              <Syringe className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="vaccine-sheet-title" className="text-base sm:text-lg font-bold font-serif text-[#1A202C]">
                {displayTitle}
              </h2>
              <span className="text-xs text-[#718096] font-medium">
                {displayAge}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={isSw ? 'Funga maelezo' : 'Close details'}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#718096] hover:bg-[#F1EFEA] transition-all"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Antigens & Disease Protection */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-bold text-[#1A202C] uppercase tracking-wider">
            {isSw ? 'Magonjwa Yanayokingwa (Target Diseases):' : 'Vaccine Antigens & Disease Protection:'}
          </span>
          <div className="flex flex-col gap-2">
            {normalizedVaccines.map((antigen, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-[#F9F8F5] border border-[#E2E8F0] flex flex-col gap-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#006B5F]">{antigen.name}</span>
                  <span className="text-[11px] font-semibold text-[#718096]">{antigen.route}</span>
                </div>
                <span className="text-[#4A5568]">
                  <strong>{isSw ? 'Hukinga dhidi ya:' : 'Protects against:'}</strong>{' '}
                  {isSw ? (antigen.diseaseTargetSw || antigen.diseaseTarget) : antigen.diseaseTarget}
                </span>
                <span className="text-[11px] text-[#718096]">
                  {isSw ? `Sehemu ya mwili: ${antigen.siteSw || antigen.site}` : `Injection site: ${antigen.site}`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Post-Vaccine Home Care & Fever Advice */}
        <section
          aria-label={isSw ? 'Ushauri wa Homa Baada ya Chanjo' : 'Post-Vaccine Home Care'}
          className="p-4 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] flex flex-col gap-2 text-xs"
        >
          <div className="flex items-center gap-2 text-[#B45309]">
            <Thermometer className="w-4 h-4 shrink-0" aria-hidden="true" />
            <h3 className="font-bold text-[#1A202C]">
              {isSw ? 'Homa na Utunzaji Baada ya Chanjo:' : 'Post-Vaccine Fever & Home Care:'}
            </h3>
          </div>
          <ul className="list-disc pl-4 text-[#1A202C] space-y-1 leading-relaxed">
            <li>
              {isSw
                ? 'Homa ndogo au kutulia kwa mtoto ndani ya masaa 24-48 ni kawaida na inaonyesha mfumo wa kinga unafanya kazi.'
                : 'Mild fever and slight irritability within 24-48 hours is normal, indicating the child’s immune system is responding.'}
            </li>
            <li>
              {isSw
                ? 'Weka kitambaa safi kilichorowekwa kwenye maji ya baridi (siyo barafu) juu ya sehemu ya sindano. Usisugue sehemu hiyo.'
                : 'Place a cool, damp washcloth over the injection site to ease soreness. Never rub or massage the injection spot.'}
            </li>
            <li>
              {isSw
                ? 'Mpe mtoto maziwa ya mama kwa wingi. Ikiwa homa inazidi 38.5°C au mtoto analia bila kunyamaza, muone mhudumu wa afya.'
                : 'Continue frequent breastfeeding for hydration and comfort. If fever exceeds 38.5°C or crying persists > 3h, consult your nurse.'}
            </li>
          </ul>
        </section>

        {/* Action: Mark Administered Form */}
        <form onSubmit={handleAdminister} className="pt-2 border-t border-[#E2E8F0] flex flex-col gap-3">
          <span className="text-xs font-bold text-[#1A202C]">
            {isSw ? 'Rekodi Chanjo Hii Kama Imetolewa:' : 'Record Dose Administration:'}
          </span>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-[#718096]">
                {isSw ? 'Tarehe ya Kutolewa' : 'Date Administered'}
              </label>
              <input
                type="date"
                value={adminDate}
                onChange={(e) => setAdminDate(e.target.value)}
                required
                className="min-h-[48px] px-3 rounded-xl border border-[#CBD5E1] text-xs text-[#1A202C]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-[#718096]">
                {isSw ? 'Kituo cha Afya' : 'Health Facility'}
              </label>
              <input
                type="text"
                value={facility}
                onChange={(e) => setFacility(e.target.value)}
                required
                className="min-h-[48px] px-3 rounded-xl border border-[#CBD5E1] text-xs text-[#1A202C]"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[48px] px-4 py-2 rounded-full border border-[#E2E8F0] text-xs font-semibold text-[#4A5568]"
            >
              {isSw ? 'Funga' : 'Close'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[48px] px-6 py-2 rounded-full bg-[#006B5F] hover:bg-[#004D44] text-white text-xs font-bold active:scale-95 transition-all shadow-sm flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-white" aria-hidden="true" />
              <span>{isSw ? 'Weka Kama Imetolewa' : 'Mark Administered'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
