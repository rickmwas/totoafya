import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, MoreVertical, Sparkles, ArrowRight } from 'lucide-react';
import db from '@/api/totoafyaClient';
import { useLang } from '@/context/LanguageContext';
import AppShell from '@/components/layout/AppShell';
import { differenceInWeeks, parseISO } from 'date-fns';

const FRUIT_SVGS = {
  Banana: (className) => (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 80C35 80 75 70 85 20C88 10 75 5 70 15C60 40 35 60 15 65C10 66 8 75 15 80Z" fill="url(#bananaGrad)" />
      <path d="M72 13L80 5" stroke="#4A3B00" strokeWidth="3" strokeLinecap="round" />
      <path d="M22 69C40 68 62 55 71 35" stroke="#D1B000" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <defs>
        <linearGradient id="bananaGrad" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#F9D423" />
          <stop offset="100%" stopColor="#FF8A3D" />
        </linearGradient>
      </defs>
    </svg>
  ),
  Carrot: (className) => (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M40 85C42 88 47 88 49 85L80 25C82 20 75 15 70 18L15 65C12 68 12 73 15 75L40 85Z" fill="url(#carrotGrad)" />
      <path d="M75 22C80 15 85 10 90 12M76 21C82 22 88 24 88 30" stroke="#006B4F" strokeWidth="3" strokeLinecap="round" />
      <path d="M30 75C34 73 38 74 40 78" stroke="#D35400" strokeWidth="2" strokeLinecap="round" />
      <path d="M50 55C54 53 58 54 60 58" stroke="#D35400" strokeWidth="2" strokeLinecap="round" />
      <defs>
        <linearGradient id="carrotGrad" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#FF9233" />
          <stop offset="100%" stopColor="#FF5E36" />
        </linearGradient>
      </defs>
    </svg>
  ),
  Papaya: (className) => (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 15C30 15 20 30 20 55C20 80 32 90 50 90C68 90 80 80 80 55C80 30 70 15 50 15Z" fill="url(#papayaOuter)" />
      <path d="M50 25C38 25 32 35 32 55C32 75 40 80 50 80C60 80 68 75 68 55C68 35 62 25 50 25Z" fill="url(#papayaInner)" />
      <circle cx="46" cy="50" r="3" fill="#17201D" />
      <circle cx="54" cy="46" r="2.5" fill="#17201D" />
      <circle cx="50" cy="56" r="3.5" fill="#17201D" />
      <circle cx="44" cy="58" r="3" fill="#17201D" />
      <circle cx="55" cy="60" r="3" fill="#17201D" />
      <defs>
        <linearGradient id="papayaOuter" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#85B22C" />
          <stop offset="100%" stopColor="#E0B034" />
        </linearGradient>
        <linearGradient id="papayaInner" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF8B3D" />
          <stop offset="100%" stopColor="#FF5E36" />
        </linearGradient>
      </defs>
    </svg>
  ),
  Grapefruit: (className) => (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="#FFAE34" stroke="#F1C40F" strokeWidth="3" />
      <circle cx="50" cy="50" r="38" fill="url(#grapefruitPink)" />
      <path d="M50 50 L50 12M50 50 L82 32M50 50 L77 68M50 50 L50 88M50 50 L23 68M50 50 L18 32" stroke="#FFF4EB" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="6" fill="#FFF4EB" />
      <defs>
        <linearGradient id="grapefruitPink" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF6B6B" />
          <stop offset="100%" stopColor="#FF8E53" />
        </linearGradient>
      </defs>
    </svg>
  ),
  Corn: (className) => (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="42" y="15" width="16" height="60" rx="8" fill="url(#cornYellow)" />
      <circle cx="46" cy="22" r="3" fill="#F39C12" /><circle cx="54" cy="22" r="3" fill="#F39C12" />
      <circle cx="46" cy="32" r="3.5" fill="#F1C40F" /><circle cx="54" cy="32" r="3.5" fill="#F1C40F" />
      <circle cx="46" cy="42" r="3.5" fill="#F39C12" /><circle cx="54" cy="42" r="3.5" fill="#F39C12" />
      <circle cx="46" cy="52" r="3.5" fill="#F1C40F" /><circle cx="54" cy="52" r="3.5" fill="#F1C40F" />
      <circle cx="46" cy="62" r="3.5" fill="#F39C12" /><circle cx="54" cy="62" r="3.5" fill="#F39C12" />
      <path d="M34 80C34 50 42 35 44 25C44 40 40 65 52 80" stroke="#006B4F" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M66 80C66 50 58 35 56 25C56 40 60 65 48 80" stroke="#2E7A5D" strokeWidth="4" strokeLinecap="round" fill="none" />
      <defs>
        <linearGradient id="cornYellow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F9D423" />
          <stop offset="100%" stopColor="#FF8A3D" />
        </linearGradient>
      </defs>
    </svg>
  ),
  Rutabaga: (className) => (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 15C32 15 22 28 22 50C22 72 38 88 50 88C62 88 78 72 78 50C78 28 68 15 50 15Z" fill="url(#rutabagaGrad)" />
      <path d="M48 15L52 5M44 14L40 7" stroke="#8E44AD" strokeWidth="2.5" strokeLinecap="round" />
      <defs>
        <linearGradient id="rutabagaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8E44AD" />
          <stop offset="45%" stopColor="#A569BD" />
          <stop offset="100%" stopColor="#FFF4EB" />
        </linearGradient>
      </defs>
    </svg>
  ),
  Scallion: (className) => (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 85C48 88 52 88 52 85L50 40Z" fill="#EEF2EF" stroke="#BDC3C7" strokeWidth="1.5" />
      <path d="M49 41L40 15M50 40L50 10M51 41L60 15" stroke="#006B4F" strokeWidth="4.5" strokeLinecap="round" />
    </svg>
  ),
  Eggplant: (className) => (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 25C35 25 30 40 30 60C30 80 40 90 50 90C60 90 70 80 70 60C70 40 65 25 50 25Z" fill="url(#eggplantGrad)" />
      <path d="M50 25C47 20 45 15 48 10" stroke="#006B4F" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M42 22C46 25 54 25 58 22" fill="#006B4F" />
      <defs>
        <linearGradient id="eggplantGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2E0854" />
          <stop offset="100%" stopColor="#4A154B" />
        </linearGradient>
      </defs>
    </svg>
  ),
  Cabbage: (className) => (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="35" fill="#2E7A5D" />
      <path d="M22 35C28 20 45 15 50 15C55 15 72 20 78 35C80 50 78 68 70 78" stroke="#A3D9BC" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M18 55C18 70 32 82 50 82C68 82 82 70 82 55" stroke="#A3D9BC" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M30 50C35 42 45 42 50 42C55 42 65 42 70 50" stroke="#A3D9BC" strokeWidth="2.5" fill="none" />
    </svg>
  ),
  Squash: (className) => (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 15C42 15 40 30 43 50C35 55 30 68 30 75C30 85 38 90 50 90C62 90 70 85 70 75C70 68 65 55 57 50C60 30 58 15 50 15Z" fill="url(#squashGrad)" />
      <path d="M50 15L52 8" stroke="#006B4F" strokeWidth="3" strokeLinecap="round" />
      <defs>
        <linearGradient id="squashGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F9D423" />
          <stop offset="100%" stopColor="#E67E22" />
        </linearGradient>
      </defs>
    </svg>
  ),
  Cantaloupe: (className) => (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="42" fill="#E5A93C" stroke="#BDC3C7" strokeWidth="2" />
      <circle cx="50" cy="50" r="32" fill="#E67E22" />
      <circle cx="50" cy="50" r="12" fill="#D35400" opacity="0.3" />
    </svg>
  ),
  Honeydew: (className) => (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="42" fill="#C3FDB8" stroke="#006B4F" strokeWidth="2" />
      <circle cx="50" cy="50" r="32" fill="#DFFFDF" />
    </svg>
  ),
  Pumpkin: (className) => (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 82C72 82 85 70 85 52C85 34 72 22 50 22C28 22 15 34 15 52C15 70 28 82 50 82Z" fill="url(#pumpGrad)" />
      <path d="M50 22L50 10" stroke="#006B4F" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M35 25C40 30 40 74 35 79M65 25C60 30 60 74 65 79M50 22C52 30 52 74 50 82" stroke="#D35400" strokeWidth="2" fill="none" />
      <defs>
        <linearGradient id="pumpGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF9F43" />
          <stop offset="100%" stopColor="#EE5A24" />
        </linearGradient>
      </defs>
    </svg>
  ),
  Watermelon: (className) => (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="44" fill="#006B4F" />
      <path d="M50 10C72 10 90 28 90 50L10 50C10 28 28 10 50 10Z" fill="#FFF6F0" />
      <path d="M50 14C68 14 84 30 84 50L16 50C16 30 32 14 50 14Z" fill="#FF5E62" />
      <circle cx="40" cy="30" r="2" fill="#17201D" /><circle cx="60" cy="30" r="2" fill="#17201D" />
      <circle cx="50" cy="22" r="2" fill="#17201D" /><circle cx="50" cy="40" r="2.5" fill="#17201D" />
    </svg>
  ),
};

const PREGNANCY_TIMELINE = {
  20: { fruit: 'Banana', fruitSw: 'Ndizi', weight: '300g', length: '25cm', dev: 'Your baby can swallow and is very active.', devSw: 'Mtoto wako anaweza kumeza na anacheza sana.', body: 'You may feel baby kicks regularly now.', bodySw: 'Unaweza kuhisi mateke ya mtoto mara kwa mara sasa.' },
  21: { fruit: 'Carrot', fruitSw: 'Karoti', weight: '360g', length: '27cm', dev: 'Baby is developing taste buds.', devSw: 'Mtoto anaanza kutofautisha ladha mbalimbali.', body: 'Stretch marks might start appearing on your belly.', bodySw: 'Milia ya kukua inaweza kuanza kuonekana kwenye tumbo.' },
  22: { fruit: 'Papaya', fruitSw: 'Papai', weight: '430g', length: '28cm', dev: 'Baby can hear your voice and external sounds.', devSw: 'Mtoto anaweza kusikia sauti yako na sauti za nje.', body: 'You may experience swollen feet or mild backaches.', bodySw: 'Unaweza kupata uvimbe wa miguu au maumivu kidogo ya mgongo.' },
  23: { fruit: 'Grapefruit', fruitSw: 'Kerafuti', weight: '500g', length: '29cm', dev: 'Baby lungs are preparing for breathing.', devSw: 'Mapafu ya mtoto yanajiandaa kwa kupumua baada ya kuzaliwa.', body: 'You might feel Braxton Hicks contractions (mild tightenings).', bodySw: 'Unaweza kuhisi tumbo likikaza kidogo bila maumivu.' },
  24: { fruit: 'Corn', fruitSw: 'Muhindi', weight: '600g', length: '30cm', dev: 'Baby has footprints and fingerprints forming.', devSw: 'Alama za vidole na miguu za mtoto zinatengenezwa.', body: 'Your center of gravity is shifting; be careful with balance.', bodySw: 'Msawazo wa mwili wako unabadilika; kuwa mwangalifu unapotembea.' },
  25: { fruit: 'Rutabaga', fruitSw: 'Rutabaga', weight: '660g', length: '34cm', dev: 'Baby skin is becoming opaque and less translucent.', devSw: 'Ngozi ya mtoto inaanza kuwa imara na isiyo wazi sana.', body: 'Heartburn or indigestion might feel more common.', bodySw: 'Kiwungulia au shida ya kusaga chakula inaweza kuongezeka.' },
  26: { fruit: 'Scallion', fruitSw: 'Vitunguu vya Majani', weight: '760g', length: '35cm', dev: 'Baby eyes can open and blink.', devSw: 'Macho ya mtoto yanaweza kufunguka na kupepesa.', body: 'Ensure you are getting enough iron and calcium in your diet.', bodySw: 'Hakikisha unapata madini ya chuma na chokaa kwenye chakula chako.' },
  28: { fruit: 'Eggplant', fruitSw: 'Bilinganya', weight: '1.0kg', length: '38cm', dev: 'Third trimester begins! Baby brain is growing fast.', devSw: 'Trimester ya tatu inaanza! Ubongo wa mtoto unakua haraka.', body: 'Sleep on your side to keep optimal blood flow to the baby.', bodySw: 'Lala kwa ubavu ili kuongeza mtiririko mzuri wa damu kwa mtoto.' },
  30: { fruit: 'Cabbage', fruitSw: 'Kabeji', weight: '1.3kg', length: '40cm', dev: 'Baby can dream and regulate their own body temperature.', devSw: 'Mtoto anaweza kuota ndoto na kudhibiti joto la mwili wake.', body: 'Shortness of breath is common as your uterus expands.', bodySw: 'Kupumua kwa shida ni kawaida wakati tumbo linavyoongezeka.' },
  32: { fruit: 'Squash', fruitSw: 'Boga', weight: '1.7kg', length: '42cm', dev: 'Baby practicing breathing movements.', devSw: 'Mtoto anafanya mazoezi ya kupumua kwa kupanua kifua.', body: 'Make sure your birth plan is ready and contact numbers are set.', bodySw: 'Hakikisha mpango wako wa kujifungua na namba za dharura ziko tayari.' },
  34: { fruit: 'Cantaloupe', fruitSw: 'Tikiti Maji la Manjano', weight: '2.1kg', length: '45cm', dev: 'Baby central nervous system is fully mature.', devSw: 'Mfumo mkuu wa neva wa mtoto umekamilika kikamilifu.', body: 'You may feel pelvic pressure as the baby settles lower.', bodySw: 'Unaweza kuhisi shinikizo kwenye nyonga mtoto anaposhuka chini.' },
  36: { fruit: 'Honeydew', fruitSw: 'Honeydew', weight: '2.6kg', length: '47cm', dev: 'Baby is shedding fine hair and protective waxy coating.', devSw: 'Mtoto anaanza kupoteza nywele laini zilizomfunika mwilini.', body: 'Frequent clinic checkups begin. pack your hospital bag!', bodySw: 'Kliniki za kila wiki zinaanza. Tayarisha mkoba wa hospitali!' },
  38: { fruit: 'Pumpkin', fruitSw: 'Malenge', weight: '3.0kg', length: '50cm', dev: 'Lungs and brain are fully mature and ready for birth.', devSw: 'Mapafu na ubongo vimekamilika na viko tayari kwa uzazi.', body: 'You may lose your mucus plug or experience light leaking.', bodySw: 'Unaweza kuona ute mzito au kuvuja kwa maji kidogo.' },
  40: { fruit: 'Watermelon', fruitSw: 'Tikiti Maji', weight: '3.4kg', length: '52cm', dev: 'Full term baby is ready to meet the world!', devSw: 'Muda kamili umewadia, mtoto yuko tayari kuiona dunia!', body: 'Rest up and look out for strong, regular labor contractions.', bodySw: 'Pumzika na uangalie uchungu wenye nguvu na unaofuatana.' }
};

export default function PregnancyOverview() {
  const { lang } = useLang();
  const navigate = useNavigate();
  const [mother, setMother] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(24);
  const [currentWeek, setCurrentWeek] = useState(24);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMother = async () => {
      try {
        const mothers = await db.entities.Mother.list('-created_date', 1);
        if (mothers && mothers.length > 0) {
          const m = mothers[0];
          setMother(m);
          if (m.lmp) {
            const weeks = differenceInWeeks(new Date(), parseISO(m.lmp));
            const clamped = Math.min(40, Math.max(20, weeks));
            // Find closest configured week
            const weeksKeys = Object.keys(PREGNANCY_TIMELINE).map(Number);
            const closest = weeksKeys.reduce((prev, curr) => 
              Math.abs(curr - clamped) < Math.abs(prev - clamped) ? curr : prev
            );
            setSelectedWeek(closest);
            setCurrentWeek(clamped);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadMother();
  }, []);

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-[440px] mx-auto p-5 pb-24 flex flex-col gap-6 animate-pulse bg-[#FFF6F0] min-h-screen">
          <div className="h-8 bg-slate-200/80 rounded-[12px] w-1/2"></div>
          <div className="bg-white rounded-[32px] h-48 bg-slate-200/60 shadow-sm border border-[#e5e7eb]"></div>
          <div className="h-6 bg-slate-200/80 rounded-[12px] w-1/3 mt-2"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-28 bg-slate-200/60 rounded-[24px]"></div>
            <div className="h-28 bg-slate-200/60 rounded-[24px]"></div>
          </div>
        </div>
      </AppShell>
    );
  }

  const weekData = PREGNANCY_TIMELINE[selectedWeek] || PREGNANCY_TIMELINE[24];
  const fruitName = lang === 'sw' ? weekData.fruitSw : weekData.fruit;
  const devText = lang === 'sw' ? weekData.devSw : weekData.dev;
  const bodyText = lang === 'sw' ? weekData.bodySw : weekData.body;

  const weeksList = Object.keys(PREGNANCY_TIMELINE).map(Number).sort((a, b) => a - b);

  return (
    <AppShell>
      <div className="bg-[#FFF6F0] min-h-screen pb-12 font-sans text-[#17201D]">
        
        {/* Header (Screen 05) */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white rounded-full border border-[#EEF2EF] flex items-center justify-center shadow-sm active:scale-95 transition-transform"
          >
            <ChevronLeft size={20} className="text-[#17201D]" />
          </button>
          <h1 className="text-[18px] font-extrabold text-[#17201D]">
            {lang === 'sw' ? 'Ujauzito' : 'Pregnancy'}
          </h1>
          <button 
            className="w-10 h-10 bg-white rounded-full border border-[#EEF2EF] flex items-center justify-center shadow-sm active:scale-95 transition-transform"
            onClick={() => alert(lang === 'sw' ? 'Chaguo zaidi' : 'More options')}
          >
            <MoreVertical size={20} className="text-[#17201D]" />
          </button>
        </div>

        {/* Horizontal Week Slider (Screen 05) */}
        <div className="px-6 py-4 flex flex-col gap-2.5">
          <span className="text-[11px] font-bold text-[#5F6C66] tracking-wider uppercase">
            {lang === 'sw' ? 'CHAGUA WIKI' : 'SELECT GESTATIONAL WEEK'}
          </span>
          <div className="flex gap-3.5 overflow-x-auto py-2.5 scrollbar-none snap-x">
            {weeksList.map((wk) => {
              const active = selectedWeek === wk;
              const isActualWeek = currentWeek === wk;
              return (
                <button
                  key={wk}
                  onClick={() => setSelectedWeek(wk)}
                  className={`snap-center flex-shrink-0 w-12 h-12 rounded-full border flex flex-col items-center justify-center transition-all relative ${
                    active 
                      ? 'bg-[#006B4F] text-white border-[#006B4F] shadow-[0_4px_14px_rgba(0,107,79,0.22)] scale-110 font-bold' 
                      : 'bg-white text-[#5F6C66] border-[#EEF2EF] hover:border-[#006B4F]/30'
                  }`}
                >
                  <span className="text-[15px]">{wk}</span>
                  {isActualWeek && !active && (
                    <span className="absolute -top-1 w-2.5 h-2.5 bg-[#FF8A3D] rounded-full border border-white" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Premium Realistic Fetus in the Womb Hero Card */}
        <div className="mx-4 mb-6">
          <div className="bg-white border border-[#EEF2EF] rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.015)] relative h-56 flex flex-col justify-end p-6">
            <img 
              src="/fetal_womb.png" 
              alt="Baby in the womb" 
              className="absolute inset-0 w-full h-full object-cover scale-105"
            />
            {/* Womb glassmorphic gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="relative z-10">
              <span className="text-[10px] font-black text-[#FF8A3D] tracking-widest uppercase">
                {lang === 'sw' ? 'MOTO KATIKA MFUKO WA UZAZI' : 'BABY IN THE WOMB'}
              </span>
              <h3 className="text-xl font-bold text-white mt-1">
                {lang === 'sw' ? `Wiki ya ${selectedWeek} ya Ukuaji` : `Week ${selectedWeek} of Development`}
              </h3>
              <p className="text-xs text-white/80 mt-1 font-medium leading-relaxed max-w-[85%]">
                {lang === 'sw' ? 'Ukuaji wa viungo na harakati huongezeka kila siku.' : 'Organ development and movements increase daily.'}
              </p>
            </div>
          </div>
        </div>

        {/* Gestational Size and Image Row (Screen 05) */}
        <div className="mx-4 mb-6 mt-4">
          <div className="bg-white border border-[#EEF2EF] rounded-[32px] p-6 shadow-[0_12px_36px_rgba(0,0,0,0.01)] flex items-center justify-between gap-6">
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-bold text-[#006B4F] tracking-wider uppercase">
                {lang === 'sw' ? 'KIPIMO NA UZITO' : 'SIZE & METRICS'}
              </span>
              <h2 className="text-[24px] font-extrabold text-[#17201D] leading-tight mt-1.5">
                {lang === 'sw' ? `Ukubwa wa ${fruitName}` : `Size of a ${fruitName}`}
              </h2>
              <div className="flex flex-col gap-1 mt-4">
                <p className="text-[14px] text-[#5F6C66] font-semibold">
                  {lang === 'sw' ? 'Urefu: ' : 'Length: '} <span className="text-[#17201D] font-bold">{weekData.length}</span>
                </p>
                <p className="text-[14px] text-[#5F6C66] font-semibold">
                  {lang === 'sw' ? 'Uzito: ' : 'Weight: '} <span className="text-[#17201D] font-bold">{weekData.weight}</span>
                </p>
              </div>
            </div>
            
            {/* Custom stylized vector SVG for the current fruit */}
            <div className="w-24 h-24 rounded-full bg-[#FFF4EB] border border-[#EEF2EF] flex items-center justify-center shadow-inner flex-shrink-0">
              {FRUIT_SVGS[weekData.fruit] ? FRUIT_SVGS[weekData.fruit]("w-16 h-16") : (
                <span className="text-4xl">🥑</span>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar (Screen 05) */}
        <div className="mx-4 mb-6 px-2">
          <div className="h-2.5 w-full bg-white rounded-full p-0.5 border border-[#EEF2EF] shadow-inner">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-[#006B4F] to-[#FF8A3D] transition-all duration-500"
              style={{ width: `${(selectedWeek / 40) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-bold text-[#5F6C66] mt-2.5 uppercase tracking-wider">
            <span>{selectedWeek <= 12 ? (lang === 'sw' ? 'Trimester ya 1' : '1st Trimester') : selectedWeek <= 27 ? (lang === 'sw' ? 'Trimester ya 2' : '2nd Trimester') : (lang === 'sw' ? 'Trimester ya 3' : '3rd Trimester')}</span>
            <span>{selectedWeek} / 40 {lang === 'sw' ? 'Wiki' : 'Weeks'}</span>
          </div>
        </div>

        {/* Baby Development and Body Advice Cards (Screen 05) */}
        <div className="grid grid-cols-2 gap-4 mx-4 mb-6">
          <div className="bg-white border border-[#EEF2EF] rounded-[24px] p-5 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Sparkles size={16} />
            </div>
            <h4 className="text-[13px] font-extrabold text-[#17201D] tracking-tight">
              {lang === 'sw' ? 'Ukuaji wa Mtoto' : 'Baby Development'}
            </h4>
            <p className="text-[12.5px] text-[#5F6C66] mt-2 leading-relaxed font-semibold">
              {devText}
            </p>
          </div>
          <div className="bg-white border border-[#EEF2EF] rounded-[24px] p-5 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
              <Sparkles size={16} />
            </div>
            <h4 className="text-[13px] font-extrabold text-[#17201D] tracking-tight">
              {lang === 'sw' ? 'Mwili Wako' : 'Your Body'}
            </h4>
            <p className="text-[12.5px] text-[#5F6C66] mt-2 leading-relaxed font-semibold">
              {bodyText}
            </p>
          </div>
        </div>

        {/* Bottom Timeline CTA (Screen 05) */}
        <div className="mx-4">
          <Link to="/anc">
            <button className="w-full h-14 bg-[#006B4F] hover:bg-[#00523C] active:scale-[0.97] text-white rounded-full font-bold text-[15px] shadow-[0_6px_20px_rgba(0,107,79,0.18)] transition-all duration-200 flex items-center justify-between pl-6 pr-2.5">
              <span className="flex-1 text-center font-bold tracking-tight">
                {lang === 'sw' ? 'Ona Historia ya Kliniki ya ANC' : 'View Full ANC Timeline'}
              </span>
              <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                <ArrowRight size={18} className="text-white" strokeWidth={2.5} />
              </div>
            </button>
          </Link>
        </div>

      </div>
    </AppShell>
  );
}
