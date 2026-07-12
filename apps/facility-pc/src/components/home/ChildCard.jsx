import React from 'react';
import { Link } from 'react-router-dom';
import { differenceInMonths, differenceInWeeks, differenceInYears, parseISO } from 'date-fns';
import { ChevronRight, AlertTriangle } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';

const GENDER = {
  male:   { accent: '#2E5B47', bg: '#E6F4F1', initial: 'bg-[#2E5B47]', bar: 'bg-[#2E5B47]' },
  female: { accent: '#D946A8', bg: '#FFF0F9', initial: 'bg-[#D946A8]', bar: 'bg-[#D946A8]' },
};

const STATUS = {
  healthy:  { label: 'Healthy', label_sw: 'Mzima', color: '#2E5B47', bg: '#f0faf5' },
  monitor:  { label: 'Monitor', label_sw: 'Fuatilia', color: '#F9A825', bg: '#fffbeb' },
  at_risk:  { label: 'At Risk', label_sw: 'Hatarini', color: '#E51010', bg: '#fff5f5' },
  critical: { label: 'Critical', label_sw: 'Hali Mbaya', color: '#E51010', bg: '#fff5f5' },
};

export default function ChildCard({ child, nextVaccine, lastGrowth }) {
  const { t, lang } = useLang();
  const g = GENDER[child.gender] || GENDER.male;
  const s = STATUS[child.health_status] || STATUS.healthy;

  const dob = parseISO(child.date_of_birth);
  const years = differenceInYears(new Date(), dob);
  const months = differenceInMonths(new Date(), dob);
  const weeks = differenceInWeeks(new Date(), dob);
  const ageLabel = years >= 1 ? `${years} ${t('years_old')}` : months >= 1 ? `${months} ${t('months_old')}` : `${weeks} ${t('weeks_old')}`;
  const initials = child.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <Link to={`/child/${child.id}`} className="block active:scale-[0.98] transition-all duration-200">
      <div className="bg-white rounded-[22px] border border-[#F0F0F0] overflow-hidden shadow-card">
        {/* Top accent bar */}
        <div className={`h-[3px] w-full ${g.bar}`} />

        <div className="p-4">
          {/* Header row */}
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0 ${g.initial}`}>
              <span className="text-white text-[14px] font-extrabold">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[15px] font-bold text-[#0A0A0A] leading-tight truncate">{child.full_name}</h3>
              <p className="text-[12px] text-[#A0A0A0] mt-0.5">{ageLabel}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-full px-2.5 py-1" style={{ backgroundColor: s.bg }}>
                <span className="text-[10px] font-bold" style={{ color: s.color }}>
                  {lang === 'sw' ? s.label_sw : s.label}
                </span>
              </div>
              <ChevronRight size={15} className="text-[#D0D0D0]" />
            </div>
          </div>

          {/* Metrics */}
          {(lastGrowth?.weight_kg || lastGrowth?.height_cm || nextVaccine) && (
            <div className="flex gap-2 mt-3">
              {lastGrowth?.weight_kg && (
                <div className="flex-1 rounded-[12px] px-3 py-2" style={{ backgroundColor: g.bg }}>
                  <p className="text-[9px] tracking-[0.1em] uppercase font-bold text-[#A0A0A0] mb-0.5">{t('weight')}</p>
                  <p className="text-[16px] font-extrabold leading-none" style={{ color: g.accent }}>
                    {lastGrowth.weight_kg}<span className="text-[10px] text-[#A0A0A0] font-medium ml-0.5">kg</span>
                  </p>
                </div>
              )}
              {lastGrowth?.height_cm && (
                <div className="flex-1 rounded-[12px] px-3 py-2" style={{ backgroundColor: g.bg }}>
                  <p className="text-[9px] tracking-[0.1em] uppercase font-bold text-[#A0A0A0] mb-0.5">{t('height')}</p>
                  <p className="text-[16px] font-extrabold leading-none" style={{ color: g.accent }}>
                    {lastGrowth.height_cm}<span className="text-[10px] text-[#A0A0A0] font-medium ml-0.5">cm</span>
                  </p>
                </div>
              )}
              {nextVaccine && (
                <div className="flex-1 rounded-[12px] px-3 py-2 bg-[#FAFBFB]">
                  <p className="text-[9px] tracking-[0.1em] uppercase font-bold text-[#A0A0A0] mb-0.5">
                    {lang === 'sw' ? 'Chanjo' : 'Vaccine'}
                  </p>
                  <p className="text-[12px] font-bold text-[#0A0A0A] leading-tight line-clamp-2">{nextVaccine.vaccine_name}</p>
                </div>
              )}
            </div>
          )}

          {/* At risk warning */}
          {(child.health_status === 'at_risk' || child.health_status === 'critical') && (
            <div className="mt-3 flex items-center gap-2 rounded-[10px] px-3 py-2" style={{ backgroundColor: '#fff5f5' }}>
              <AlertTriangle size={13} className="text-[#E51010] flex-shrink-0" />
              <span className="text-[11px] text-[#E51010] font-semibold">
                {lang === 'sw' ? 'Inahitaji umakini wa haraka' : 'Requires immediate attention'}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
