import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Syringe,
  Info,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { calculateKEPISchedule, classifyVaccineDueStatus } from '@totoafya/business-logic';
import { StatusBadge, PillButton } from '@totoafya/shared-ui';
import { SCR14VaccineDetailSheet } from './SCR14VaccineDetailSheet';

export function SCR13VaccineSchedule({
  lang = 'en',
  onNavigate,
  childName = 'Joy Wambui',
  childDob = '2026-07-12',
  className = '',
}) {
  const isSw = lang === 'sw';
  const [filter, setFilter] = useState('all'); // 'all' | 'administered' | 'due' | 'catch_up'
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Generate deterministic 7-visit KEPI schedule from child's DOB
  const baseSchedule = useMemo(() => {
    try {
      return calculateKEPISchedule(childDob);
    } catch (e) {
      // Fallback
      return { childDob, visits: [] };
    }
  }, [childDob]);

  // Maintain local administration state (e.g., initial state has Birth, 6w, 10w completed, 14w due)
  const [administeredMap, setAdministeredMap] = useState({
    1: { administered: true, date: '2026-07-12', facility: 'Ruiru Sub-County Hospital' },
    2: { administered: true, date: '2026-08-24', facility: 'Ruiru Sub-County Hospital' },
    3: { administered: true, date: '2026-09-21', facility: 'Ruiru Sub-County Hospital' },
  });

  // Enrich visits with status and administration data
  const enrichedVisits = useMemo(() => {
    return (baseSchedule.visits || []).map((v) => {
      const adminRecord = administeredMap[v.visitNumber];
      const isDone = Boolean(adminRecord?.administered);

      let status = 'upcoming';
      if (isDone) {
        status = 'administered';
      } else {
        const diffDays = Math.round((new Date(v.scheduledDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
        if (diffDays < -14) {
          status = 'catch_up'; // Savannah Ochre non-shaming dignity badge
        } else if (diffDays <= 14) {
          status = 'due';
        } else {
          status = 'upcoming';
        }
      }

      return {
        ...v,
        status,
        adminRecord,
      };
    });
  }, [baseSchedule, administeredMap]);

  // Filtered visits
  const filteredVisits = enrichedVisits.filter((v) => {
    if (filter === 'administered') return v.status === 'administered';
    if (filter === 'due') return v.status === 'due';
    if (filter === 'catch_up') return v.status === 'catch_up';
    return true;
  });

  const handleOpenDetail = (visit) => {
    setSelectedVisit(visit);
    setIsDetailOpen(true);
  };

  const handleMarkAdministered = ({ visitNumber, date, facility }) => {
    setAdministeredMap((prev) => ({
      ...prev,
      [visitNumber]: { administered: true, date, facility },
    }));
  };

  const completedCount = enrichedVisits.filter((v) => v.status === 'administered').length;
  const catchUpCount = enrichedVisits.filter((v) => v.status === 'catch_up').length;
  const dueCount = enrichedVisits.filter((v) => v.status === 'due').length;

  return (
    <div
      data-testid="scr13-vaccine-schedule"
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
              {isSw ? 'Ratiba ya Chanjo (KEPI)' : 'Immunization Schedule'}
            </h1>
            <p className="text-xs text-[#718096] font-medium">
              {childName} • {isSw ? `Kuzaliwa: ${childDob}` : `DOB: ${childDob}`}
            </p>
          </div>
        </div>
      </div>

      {/* Progress & Dignity Summary Card */}
      <section
        aria-label={isSw ? 'Muhtasari wa Chanjo' : 'Vaccine Summary'}
        className="w-full rounded-2xl bg-white border border-[#E2E8F0] p-4 flex items-center justify-between shadow-xs"
      >
        <div className="flex flex-col">
          <span className="text-[11px] font-semibold text-[#718096] uppercase tracking-wider">
            {isSw ? 'Hali ya Chanjo' : 'Immunization Progress'}
          </span>
          <span className="text-lg font-bold text-[#1A202C]">
            {completedCount} / 7 {isSw ? 'Zimetolewa' : 'Administered'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {catchUpCount > 0 && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
              <AlertTriangle className="w-3.5 h-3.5 text-[#B45309]" aria-hidden="true" />
              <span>{catchUpCount} {isSw ? 'Zinazosubiriwa' : 'Catch-Up Due'}</span>
            </span>
          )}
          {dueCount > 0 && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
              <Clock className="w-3.5 h-3.5 text-[#B45309]" aria-hidden="true" />
              <span>{dueCount} {isSw ? 'Inastahili Sasa' : 'Due Now'}</span>
            </span>
          )}
        </div>
      </section>

      {/* Filter Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {[
          { id: 'all', labelEn: `All (7)`, labelSw: `Zote (7)` },
          { id: 'administered', labelEn: `Given (${completedCount})`, labelSw: `Zilizotolewa (${completedCount})` },
          { id: 'due', labelEn: `Due (${dueCount})`, labelSw: `Zinazofuata (${dueCount})` },
          { id: 'catch_up', labelEn: `Catch-Up (${catchUpCount})`, labelSw: `Zilizochelewa (${catchUpCount})` },
        ].map((chip) => {
          const isActive = filter === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => setFilter(chip.id)}
              className={`min-h-[48px] px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all ${
                isActive
                  ? 'bg-[#006B5F] text-white shadow-xs'
                  : 'bg-white text-[#4A5568] border border-[#E2E8F0] hover:bg-[#F9F8F5]'
              }`}
            >
              {isSw ? chip.labelSw : chip.labelEn}
            </button>
          );
        })}
      </div>

      {/* Connected 2px Vertical Spine Timeline */}
      <div className="relative pl-6 flex flex-col gap-5 pt-2">
        {/* Continuous Spine */}
        <div className="absolute top-4 bottom-4 left-[15px] w-0.5 bg-[#E2E8F0] pointer-events-none" />

        {filteredVisits.map((visit) => {
          const isDone = visit.status === 'administered';
          const isDue = visit.status === 'due';
          const isCatchUp = visit.status === 'catch_up';

          return (
            <div key={visit.visitNumber} className="relative flex items-start gap-4">
              {/* Spine Node */}
              <div
                className={`absolute -left-[24px] top-4 w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-xs z-10 ${
                  isDone
                    ? 'bg-[#15803D] text-white'
                    : isDue
                    ? 'bg-[#E68A00] text-[#1A202C] ring-4 ring-[#FEF3C7]'
                    : isCatchUp
                    ? 'bg-[#B45309] text-white ring-4 ring-[#FFFBEB]'
                    : 'bg-white border-[#CBD5E1] text-[#718096]'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                ) : isDue ? (
                  <Clock className="w-4 h-4 text-[#1A202C]" aria-hidden="true" />
                ) : isCatchUp ? (
                  <AlertTriangle className="w-4 h-4 text-white" aria-hidden="true" />
                ) : (
                  <Calendar className="w-3.5 h-3.5 text-[#718096]" aria-hidden="true" />
                )}
              </div>

              {/* Vaccine Visit Card */}
              <article
                className={`w-full rounded-2xl p-4 md:p-5 text-left transition-all ${
                  isDue
                    ? 'bg-[#FFFBEB] border-2 border-[#FDE68A] shadow-sm'
                    : isCatchUp
                    ? 'bg-[#FFFBEB] border-2 border-[#FDE68A] shadow-sm'
                    : 'bg-white border border-[#E2E8F0] shadow-xs hover:border-[#006B5F]/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                  <div>
                    <h3 className="text-sm md:text-base font-bold font-serif text-[#1A202C]">
                      {isSw ? visit.visitLabelSw : visit.visitLabelEn}
                    </h3>
                    <span className="text-xs font-semibold text-[#718096]">
                      {isSw ? visit.targetAgeDescriptionSw : visit.targetAgeDescriptionEn}
                    </span>
                  </div>

                  {/* Semantic Status Badge with Dark-on-Amber Strictness */}
                  {isDone ? (
                    <StatusBadge status="healthy" label={isSw ? 'Imetolewa' : 'Given'} size="sm" />
                  ) : isDue ? (
                    <StatusBadge status="warning" label={isSw ? 'Inastahili Sasa' : 'Due Now'} size="sm" />
                  ) : isCatchUp ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
                      {isSw ? 'Inasubiriwa (Catch-Up)' : 'Catch-Up Due'}
                    </span>
                  ) : (
                    <StatusBadge status="neutral" label={isSw ? 'Inayofuata' : 'Upcoming'} size="sm" />
                  )}
                </div>

                {/* Antigens / Vaccines List */}
                <div className="flex flex-wrap items-center gap-1.5 my-2">
                  {(visit.vaccines || []).map((v, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#F1EFEA] text-[#1A202C] border border-[#E2E8F0]"
                    >
                      {v.antigen}
                    </span>
                  ))}
                </div>

                {/* Metadata & Administered Row */}
                {isDone && visit.adminRecord && (
                  <p className="text-xs text-[#15803D] font-medium pt-1">
                    {isSw
                      ? `Imetolewa tarehe ${visit.adminRecord.date} katika ${visit.adminRecord.facility}`
                      : `Administered on ${visit.adminRecord.date} at ${visit.adminRecord.facility}`}
                  </p>
                )}

                {/* Due / Catch-up Non-Shaming Message */}
                {isCatchUp && (
                  <p className="text-xs text-[#B45309] font-medium pt-1">
                    {isSw
                      ? 'Haichelewi sana! Mtoto wako anaweza kupewa chanjo hii bure kwenye kituo chochote cha afya cha umma.'
                      : 'Never too late! Your baby can still receive this free catch-up dose at any public clinic.'}
                  </p>
                )}

                {/* Interactive Detail Action Trigger */}
                <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
                  <span className="text-[11px] text-[#718096]">
                    {isSw ? `Tarehe: ${visit.scheduledDate}` : `Date: ${visit.scheduledDate}`}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleOpenDetail(visit)}
                    className="min-h-[48px] px-3.5 py-2 rounded-full bg-[#E6F4F1] hover:bg-[#D5EDE8] text-[#006B5F] text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
                  >
                    <span>{isSw ? 'Maelezo ya Chanjo' : 'View Antigens'}</span>
                    <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </article>
            </div>
          );
        })}
      </div>

      {/* SCR-14 Vaccine Detail Bottom Sheet Modal */}
      <SCR14VaccineDetailSheet
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        visit={selectedVisit}
        lang={lang}
        onMarkAdministered={handleMarkAdministered}
      />
    </div>
  );
}
