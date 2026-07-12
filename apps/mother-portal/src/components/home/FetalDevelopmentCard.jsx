import React from 'react';
import { Link } from 'react-router-dom';
import { differenceInWeeks, differenceInDays, parseISO } from 'date-fns';

const FETAL_DATA = {
  4:  { size: 'Poppy seed', weight: '<1g', length: '0.2' },
  5:  { size: 'Sesame seed', weight: '<1g', length: '0.4' },
  6:  { size: 'Lentil', weight: '<1g', length: '0.6' },
  7:  { size: 'Blueberry', weight: '<1g', length: '1.0' },
  8:  { size: 'Kidney bean', weight: '1g', length: '1.6' },
  9:  { size: 'Grape', weight: '2g', length: '2.3' },
  10: { size: 'Kumquat', weight: '4g', length: '3.1' },
  11: { size: 'Fig', weight: '7g', length: '4.1' },
  12: { size: 'Lime', weight: '14g', length: '5.4' },
  13: { size: 'Peach', weight: '23g', length: '7.4' },
  14: { size: 'Lemon', weight: '43g', length: '8.7' },
  16: { size: 'Avocado', weight: '100g', length: '11.6' },
  18: { size: 'Bell pepper', weight: '190g', length: '14.2' },
  20: { size: 'Banana', weight: '300g', length: '16.4' },
  22: { size: 'Papaya', weight: '430g', length: '19.6' },
  24: { size: 'Corn', weight: '600g', length: '21.8' },
  26: { size: 'Scallion', weight: '760g', length: '23' },
  28: { size: 'Eggplant', weight: '1kg', length: '25' },
  30: { size: 'Cabbage', weight: '1.3kg', length: '27' },
  32: { size: 'Squash', weight: '1.7kg', length: '28.7' },
  34: { size: 'Butternut', weight: '2.1kg', length: '30' },
  36: { size: 'Melon', weight: '2.6kg', length: '32' },
  38: { size: 'Pumpkin', weight: '3kg', length: '34' },
  40: { size: 'Watermelon', weight: '3.4kg', length: '36' },
};

function getFetalInfo(weeks) {
  if (!weeks || weeks < 4) return FETAL_DATA[4];
  const keys = Object.keys(FETAL_DATA).map(Number).sort((a, b) => a - b);
  let info = FETAL_DATA[4];
  for (const k of keys) {
    if (weeks >= k) info = FETAL_DATA[k];
  }
  return info;
}

export default function FetalDevelopmentCard({ mother, lang }) {
  if (!mother || mother.pregnancy_status !== 'pregnant') return null;

  const today = new Date();
  const lmpDate = mother.lmp ? parseISO(mother.lmp) : null;
  const eddDate = mother.edd ? parseISO(mother.edd) : null;
  const weeksRaw = lmpDate ? differenceInWeeks(today, lmpDate) : 0;
  const weeksPregnant = Math.max(0, weeksRaw);
  const totalDays = lmpDate ? differenceInDays(today, lmpDate) : 0;
  const daysPregnantPart = totalDays % 7;

  const trimester = weeksPregnant <= 12 ? 1 : weeksPregnant <= 27 ? 2 : 3;
  const trimesterText = {
    1: lang === 'sw' ? 'Trimester ya 1' : '1st Trimester',
    2: lang === 'sw' ? 'Trimester ya 2' : '2nd Trimester',
    3: lang === 'sw' ? 'Trimester ya 3' : '3rd Trimester',
  }[trimester];

  const progress = Math.min((weeksPregnant / 40) * 100, 100);

  return (
    <Link to="/care" className="block mx-4 mb-5 active:scale-[0.985] transition-all duration-300">
      <div className="rounded-[32px] bg-white border border-[#EEF2EF] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.015)] flex items-center justify-between gap-6 hover:shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
        
        {/* Left Side Info */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <span className="text-[12px] font-bold text-[#5F6C66] tracking-wide uppercase">
              {lang === 'sw' ? 'Ujauzito Wako' : 'Your Pregnancy'}
            </span>
            <h4 className="text-[26px] font-extrabold text-[#17201D] leading-tight mt-1 tracking-tight">
              {weeksPregnant} {lang === 'sw' ? 'wiki' : 'weeks'} + {daysPregnantPart} {lang === 'sw' ? 'siku' : 'days'}
            </h4>
          </div>

          {/* Progress bar slider */}
          <div className="mt-5 w-full">
            <div className="h-2 w-full bg-[#EEF2EF] rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full bg-[#FF8A3D] transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] font-bold text-[#5F6C66] mt-2.5 uppercase tracking-wider">
              <span>{trimesterText}</span>
              <span>{Math.round(progress)}% {lang === 'sw' ? 'kamili' : 'complete'}</span>
            </div>
          </div>
        </div>

        {/* Right Side Realistic Womb Illustration */}
        <div className="w-20 h-20 rounded-full border-2 border-[#FF8A3D]/25 overflow-hidden flex items-center justify-center shadow-md flex-shrink-0 bg-[#FFF4EB]">
          <img 
            src="/fetal_womb.png" 
            alt="Fetal development inside the womb" 
            className="w-full h-full object-cover scale-110" 
            loading="lazy"
          />
        </div>

      </div>
    </Link>
  );
}
