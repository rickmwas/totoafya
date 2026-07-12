import React from 'react';
import { cn } from '@/lib/utils';

export default function ModeHeader({ mother, childCount, lang }) {
  if (!mother) return null;

  const isPregnant = mother.pregnancy_status === 'pregnant';
  const caregiverType = mother.caregiver_type || 'mother';
  const isCaregiverOnly = caregiverType === 'father' || caregiverType === 'guardian';

  if (isCaregiverOnly) {
    const isFather = caregiverType === 'father';
    return (
      <div className="mx-4 mb-4 flex gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 bg-[#7C3AED]/8 border border-[#7C3AED]/15 rounded-full px-3 py-1.5">
          <span className="text-[13px]">{isFather ? '👨' : '🧑'}</span>
          <span className="text-[10px] font-bold text-[#7C3AED] tracking-wide uppercase">
            {isFather
              ? (lang === 'sw' ? 'Baba' : 'Father')
              : (lang === 'sw' ? 'Mlezi' : 'Guardian')}
          </span>
        </div>
        {childCount > 0 && (
          <div className="flex items-center gap-1.5 bg-[#0F4C81]/8 border border-[#0F4C81]/15 rounded-full px-3 py-1.5">
            <span className="text-[13px]">👶</span>
            <span className="text-[10px] font-bold text-[#0F4C81] tracking-wide uppercase">
              {childCount} {lang === 'sw' ? 'Mtoto' : childCount === 1 ? 'Child' : 'Children'}
            </span>
          </div>
        )}
      </div>
    );
  }

  if (isPregnant && childCount > 0) {
    return (
      <div className="mx-4 mb-4 flex gap-2">
        <div className="flex items-center gap-1.5 bg-[#0F4C81]/8 border border-[#0F4C81]/15 rounded-full px-3 py-1.5">
          <span className="text-[13px]">🤰</span>
          <span className="text-[10px] font-bold text-[#0F4C81] tracking-wide uppercase">
            {lang === 'sw' ? 'Mjamzito' : 'Pregnant'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-[#0F4C81]/8 border border-[#0F4C81]/15 rounded-full px-3 py-1.5">
          <span className="text-[13px]">👶</span>
          <span className="text-[10px] font-bold text-[#0F4C81] tracking-wide uppercase">
            {childCount} {lang === 'sw' ? 'Mtoto' : childCount === 1 ? 'Child' : 'Children'}
          </span>
        </div>
      </div>
    );
  }

  if (isPregnant) {
    return (
      <div className="mx-4 mb-4">
        <div className="flex items-center gap-2 bg-[#0F4C81]/6 border border-[#0F4C81]/15 rounded-full px-4 py-2 w-fit">
          <span className="text-[15px]">🤰</span>
          <span className="text-[11px] font-bold text-[#0F4C81] tracking-wide uppercase">
            {lang === 'sw' ? 'Hali ya Ujauzito' : 'Maternal Mode'}
          </span>
        </div>
      </div>
    );
  }

  if (childCount > 0) {
    return (
      <div className="mx-4 mb-4">
        <div className="flex items-center gap-2 bg-[#0F4C81]/6 border border-[#0F4C81]/15 rounded-full px-4 py-2 w-fit">
          <span className="text-[15px]">👶</span>
          <span className="text-[11px] font-bold text-[#0F4C81] tracking-wide uppercase">
            {lang === 'sw' ? 'Hali ya Mtoto' : 'Child Care Mode'}
          </span>
        </div>
      </div>
    );
  }

  return null;
}
