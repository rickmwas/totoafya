import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, MoreVertical, Sparkles, ArrowRight } from 'lucide-react';
import db from '@/api/totoafyaClient';
import { useLang } from '@/context/LanguageContext';
import AppShell from '@/components/layout/AppShell';
import { differenceInWeeks, parseISO } from 'date-fns';

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
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="w-8 h-8 border-2 border-toto-teal border-t-transparent rounded-full animate-spin" />
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
      <div className="bg-[#f7f9f7] min-h-screen pb-12 font-sans text-[#131714]">
        
        {/* Header (Screen 05) */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white rounded-full border border-[#e5e7eb] flex items-center justify-center shadow-sm active:scale-95 transition-transform"
          >
            <ChevronLeft size={20} className="text-[#131714]" />
          </button>
          <h1 className="text-[18px] font-extrabold text-[#131714]">
            {lang === 'sw' ? 'Ujauzito' : 'Pregnancy'}
          </h1>
          <button 
            className="w-10 h-10 bg-white rounded-full border border-[#e5e7eb] flex items-center justify-center shadow-sm active:scale-95 transition-transform"
            onClick={() => alert(lang === 'sw' ? 'Chaguo zaidi' : 'More options')}
          >
            <MoreVertical size={20} className="text-[#131714]" />
          </button>
        </div>

        {/* Horizontal Week Slider (Screen 05) */}
        <div className="px-6 py-4 flex flex-col gap-2.5">
          <span className="text-[11px] font-bold text-toto-gray tracking-wider uppercase">
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
                      ? 'bg-toto-teal text-white border-toto-teal shadow-[0_4px_14px_rgba(13,98,61,0.22)] scale-110 font-bold' 
                      : 'bg-white text-toto-gray border-[#e5e7eb] hover:border-toto-teal/30'
                  }`}
                >
                  <span className="text-[15px]">{wk}</span>
                  {isActualWeek && !active && (
                    <span className="absolute -top-1 w-2.5 h-2.5 bg-[#1eb96c] rounded-full border border-white" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Gestational Size and Image Row (Screen 05) */}
        <div className="mx-4 mb-6 mt-4">
          <div className="bg-white border border-[#e5e7eb] rounded-[32px] p-6 shadow-[0_12px_36px_rgba(0,0,0,0.02)] flex items-center justify-between gap-6">
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-bold text-toto-teal tracking-wider uppercase">
                {lang === 'sw' ? 'KIPIMO NA UZITO' : 'SIZE & METRICS'}
              </span>
              <h2 className="text-[24px] font-extrabold text-[#131714] leading-tight mt-1.5">
                {lang === 'sw' ? `Ukubwa wa ${fruitName}` : `Size of a ${fruitName}`}
              </h2>
              <div className="flex flex-col gap-1 mt-4">
                <p className="text-[14px] text-toto-gray font-semibold">
                  {lang === 'sw' ? 'Urefu: ' : 'Length: '} <span className="text-[#131714] font-bold">{weekData.length}</span>
                </p>
                <p className="text-[14px] text-toto-gray font-semibold">
                  {lang === 'sw' ? 'Uzito: ' : 'Weight: '} <span className="text-[#131714] font-bold">{weekData.weight}</span>
                </p>
              </div>
            </div>
            {/* Baby circular sketch illustration */}
            <div className="w-24 h-24 rounded-full bg-[#fff5f2] border border-[#fcdacf] flex items-center justify-center shadow-inner flex-shrink-0">
              <svg className="w-16 h-16 text-[#e07b66]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="40" fill="#fffdfc" />
                <path 
                  d="M50 25C40 25 32 32 32 45C32 55 42 62 48 65C52 66.5 56 68 56 72C56 76 50 78 45 78" 
                  stroke="currentColor" 
                  strokeWidth="4.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
                <path d="M62 42C62 36 58 32 52 32" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                <path d="M55 58C62 55 68 48 68 40" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                <circle cx="50" cy="38" r="3.5" fill="currentColor" />
              </svg>
            </div>
          </div>
        </div>

        {/* Progress Bar (Screen 05) */}
        <div className="mx-4 mb-6 px-2">
          <div className="h-2.5 w-full bg-white rounded-full p-0.5 border border-[#e5e7eb] shadow-inner">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-toto-teal to-toto-green transition-all duration-500"
              style={{ width: `${(selectedWeek / 40) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-bold text-toto-gray mt-2.5 uppercase tracking-wider">
            <span>{selectedWeek <= 12 ? (lang === 'sw' ? 'Trimester ya 1' : '1st Trimester') : selectedWeek <= 27 ? (lang === 'sw' ? 'Trimester ya 2' : '2nd Trimester') : (lang === 'sw' ? 'Trimester ya 3' : '3rd Trimester')}</span>
            <span>{selectedWeek} / 40 {lang === 'sw' ? 'Wiki' : 'Weeks'}</span>
          </div>
        </div>

        {/* Baby Development and Body Advice Cards (Screen 05) */}
        <div className="grid grid-cols-2 gap-4 mx-4 mb-6">
          <div className="bg-white border border-[#e5e7eb] rounded-[24px] p-5 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Sparkles size={16} />
            </div>
            <h4 className="text-[13px] font-extrabold text-[#131714] tracking-tight">
              {lang === 'sw' ? 'Ukuaji wa Mtoto' : 'Baby Development'}
            </h4>
            <p className="text-[12.5px] text-toto-gray mt-2 leading-relaxed font-semibold">
              {devText}
            </p>
          </div>
          <div className="bg-white border border-[#e5e7eb] rounded-[24px] p-5 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
              <Sparkles size={16} />
            </div>
            <h4 className="text-[13px] font-extrabold text-[#131714] tracking-tight">
              {lang === 'sw' ? 'Mwili Wako' : 'Your Body'}
            </h4>
            <p className="text-[12.5px] text-toto-gray mt-2 leading-relaxed font-semibold">
              {bodyText}
            </p>
          </div>
        </div>

        {/* Bottom Timeline CTA (Screen 05) */}
        <div className="mx-4">
          <Link to="/anc">
            <button className="w-full h-14 bg-toto-teal hover:bg-[#145244] active:scale-[0.97] text-white rounded-full font-bold text-[15px] shadow-[0_6px_20px_rgba(13,98,61,0.18)] transition-all duration-200 flex items-center justify-between pl-6 pr-2.5">
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
