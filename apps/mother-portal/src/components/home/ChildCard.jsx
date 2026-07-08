import React from 'react';
import { Link } from 'react-router-dom';
import { differenceInMonths, differenceInWeeks, differenceInYears, parseISO } from 'date-fns';
import { ChevronRight, AlertTriangle } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';

const GENDER = {
  male:   { accent: '#1B6B5A', bg: '#E6F4F1', initial: 'bg-[#1B6B5A]', bar: 'bg-[#1B6B5A]' },
  female: { accent: '#D946A8', bg: '#FFF0F9', initial: 'bg-[#D946A8]', bar: 'bg-[#D946A8]' },
};

const STATUS = {
  healthy:  { label: 'Healthy', label_sw: 'Mzima', color: '#2E7A5D', bg: '#f0faf5' },
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
    <Link to={`/child/${child.id}`} className="block active:scale-[0.98] transition-all duration-300">
      <div className="bg-white rounded-[26px] border border-[#F0F0F0] overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-300">
        {/* Top accent bar */}
        <div className={`h-[3.5px] w-full ${g.bar}`} />

        <div className="p-4.5">
          {/* Header row */}
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-[16px] flex items-center justify-center flex-shrink-0 ${g.initial} shadow-sm animate-bounce-in`}>
              <span className="text-white text-[14px] font-black tracking-tight">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[15px] font-black text-toto-black leading-tight truncate">{child.full_name}</h3>
              <p className="text-[12px] text-toto-light font-bold mt-0.5 tracking-wide uppercase">{ageLabel}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-full px-3 py-1 border shadow-[inset_0_1px_1px_rgba(0,0,0,0.01)]" style={{ backgroundColor: s.bg, borderColor: `${s.color}15` }}>
                <span className="text-[9.5px] font-black uppercase tracking-wider" style={{ color: s.color }}>
                  {lang === 'sw' ? s.label_sw : s.label}
                </span>
              </div>
              <div className="w-6 h-6 rounded-full border border-[#F5F5F7] flex items-center justify-center bg-white">
                <ChevronRight size={12} className="text-[#A0A0A5] ml-0.5" />
              </div>
            </div>
          </div>

          {/* Metrics */}
          {(lastGrowth?.weight_kg || lastGrowth?.height_cm || nextVaccine) && (
            <div className="flex gap-2.5 mt-4">
              {lastGrowth?.weight_kg && (
                <div className="flex-1 rounded-[14px] px-3.5 py-2.5 border" style={{ backgroundColor: `${g.accent}04`, borderColor: `${g.accent}12` }}>
                  <p className="text-[8.5px] tracking-[0.12em] uppercase font-black text-toto-light mb-0.5">{t('weight')}</p>
                  <p className="text-[16px] font-black leading-none" style={{ color: g.accent }}>
                    {lastGrowth.weight_kg}<span className="text-[10px] text-toto-light font-bold ml-0.5">kg</span>
                  </p>
                </div>
              )}
              {lastGrowth?.height_cm && (
                <div className="flex-1 rounded-[14px] px-3.5 py-2.5 border" style={{ backgroundColor: `${g.accent}04`, borderColor: `${g.accent}12` }}>
                  <p className="text-[8.5px] tracking-[0.12em] uppercase font-black text-toto-light mb-0.5">{t('height')}</p>
                  <p className="text-[16px] font-black leading-none" style={{ color: g.accent }}>
                    {lastGrowth.height_cm}<span className="text-[10px] text-toto-light font-bold ml-0.5">cm</span>
                  </p>
                </div>
              )}
              {nextVaccine && (
                <div className="flex-1 rounded-[14px] px-3.5 py-2.5 bg-toto-surface border border-toto-surface">
                  <p className="text-[8.5px] tracking-[0.12em] uppercase font-black text-toto-light mb-0.5">
                    {lang === 'sw' ? 'Chanjo' : 'Vaccine'}
                  </p>
                  <p className="text-[12px] font-bold text-toto-black leading-tight line-clamp-2">{nextVaccine.vaccine_name}</p>
                </div>
              )}
            </div>
          )}

          {/* At risk warning */}
          {(child.health_status === 'at_risk' || child.health_status === 'critical') && (
            <div className="mt-4.5 flex items-center gap-2.5 rounded-[14px] px-3.5 py-2.5 border border-rose-100 bg-rose-50/40 shadow-[inset_0_1px_2px_rgba(229,16,16,0.02)]">
              <AlertTriangle size={14} className="text-[#E51010] flex-shrink-0" />
              <span className="text-[11.5px] text-[#E51010] font-black uppercase tracking-wider">
                {lang === 'sw' ? 'Inahitaji umakini wa haraka' : 'Requires immediate attention'}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}