import React from 'react';
import { Baby, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { differenceInDays, differenceInWeeks, parseISO } from 'date-fns';
import { useLang } from '@/context/LanguageContext';
import StatusBadge from '@/components/atoms/StatusBadge';

export default function PregnancyBanner({ mother }) {
  const { t, lang } = useLang();

  if (!mother || mother.pregnancy_status !== 'pregnant') return null;

  const today = new Date();
  const lmpDate = mother.lmp ? parseISO(mother.lmp) : null;
  const eddDate = mother.edd ? parseISO(mother.edd) : null;
  const weeksPregnant = lmpDate ? differenceInWeeks(today, lmpDate) : null;
  const daysUntilDue = eddDate ? differenceInDays(eddDate, today) : null;

  const trimester = weeksPregnant
    ? weeksPregnant <= 12 ? 1 : weeksPregnant <= 27 ? 2 : 3
    : null;

  return (
    <Link to="/anc" className="block mx-4 mb-4 active:scale-[0.98] transition-all duration-200">
      <div
        className="rounded-[28px] p-5 overflow-hidden relative"
        style={{
          background: 'linear-gradient(135deg, #2E5B47 0%, #0033CC 100%)',
        }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute -bottom-6 -right-2 w-24 h-24 rounded-full bg-white/5" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[10px] tracking-[0.18em] font-bold uppercase text-white/60 mb-1">
                {lang === 'sw' ? 'UJAUZITO WAKO' : 'YOUR PREGNANCY'}
              </p>
              {trimester && (
                <StatusBadge
                  status="info"
                  label={`${lang === 'sw' ? 'Trimesta' : 'Trimester'} ${trimester}`}
                  className="bg-white/20 text-white border-0"
                />
              )}
            </div>
            <div className="w-10 h-10 rounded-[14px] bg-white/15 flex items-center justify-center">
              <Baby size={20} className="text-white" />
            </div>
          </div>

          {weeksPregnant !== null && (
            <div className="mb-4">
              <span className="text-[48px] font-extrabold leading-none tracking-[-0.03em] text-white">
                {weeksPregnant}
              </span>
              <span className="text-[16px] text-white/70 font-medium ml-2">{t('weeks_pregnant')}</span>
            </div>
          )}

          {/* Progress bar */}
          {weeksPregnant !== null && (
            <div className="mb-4">
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-700"
                  style={{ width: `${Math.min((weeksPregnant / 40) * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-white/50">0w</span>
                <span className="text-[10px] text-white/50">40w</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            {daysUntilDue !== null && daysUntilDue > 0 ? (
              <div className="flex items-center gap-2">
                <Calendar size={13} className="text-white/60" />
                <span className="text-[12px] text-white/80 font-medium">
                  {t('due_in')} {daysUntilDue} {t('days')}
                </span>
              </div>
            ) : (
              <span className="text-[12px] text-white/80 font-medium">
                {lang === 'sw' ? 'Karibu kuzaa!' : 'Due soon!'}
              </span>
            )}
            <div className="flex items-center gap-1 text-white/70">
              <span className="text-[11px] font-semibold">{t('next_anc')}</span>
              <ArrowRight size={13} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
