import React from 'react';
import { Link } from 'react-router-dom';
import { differenceInWeeks, differenceInDays, parseISO, format } from 'date-fns';
import { ArrowRight } from 'lucide-react';

const FETAL_DATA = {
  4:  { size: 'Poppy seed', weight: '<1g', length: '0.2', update: "Your baby's neural tube is forming — the foundation of the brain and spinal cord.", update_sw: 'Bomba la neva la mtoto linakua — msingi wa ubongo na uti wa mgongo.' },
  5:  { size: 'Sesame seed', weight: '<1g', length: '0.4', update: "Tiny heart cells are beginning to beat for the very first time.", update_sw: 'Seli ndogo za moyo zinaanza kupiga kwa mara ya kwanza.' },
  6:  { size: 'Lentil', weight: '<1g', length: '0.6', update: "Baby's heart is beating — you may see it on ultrasound! Arm and leg buds appear.", update_sw: 'Moyo wa mtoto unapiga! Vichwa vya mikono na miguu vinaonekana.' },
  7:  { size: 'Blueberry', weight: '<1g', length: '1.0', update: "Baby is forming hands and feet, and their brain is growing rapidly.", update_sw: 'Mtoto anaunda mikono na miguu, na ubongo wake unakua haraka.' },
  8:  { size: 'Kidney bean', weight: '1g', length: '1.6', update: "All major organs are starting to develop. Tiny fingers are forming!", update_sw: 'Viungo vyote vikuu vinaanza kukua. Vidole vidogo vinaundwa!' },
  9:  { size: 'Grape', weight: '2g', length: '2.3', update: "Baby's eyelids are forming and they can make tiny movements now.", update_sw: 'Kope za mtoto zinaundwa na anaweza kusonga kidogo sasa.' },
  10: { size: 'Kumquat', weight: '4g', length: '3.1', update: "Your baby is now officially a fetus! All vital organs are in place.", update_sw: 'Mtoto wako sasa ni fetasi rasmi! Viungo vyote muhimu viko sehemu zao.' },
  11: { size: 'Fig', weight: '7g', length: '4.1', update: "Baby's hands open and close. Tiny tooth buds are developing.", update_sw: 'Mikono ya mtoto inafunguka na kufunga. Vichwa vidogo vya meno vinaendelea.' },
  12: { size: 'Lime', weight: '14g', length: '5.4', update: "End of first trimester! Baby can now yawn, stretch, and make faces.", update_sw: 'Mwisho wa trimesta ya kwanza! Mtoto anaweza kupiga miayo na kunyoosha.' },
  13: { size: 'Peach', weight: '23g', length: '7.4', update: "Vocal cords are developing. Baby is starting to produce urine.", update_sw: 'Kamba za sauti zinaendelea. Mtoto anaanza kutoa mkojo.' },
  14: { size: 'Lemon', weight: '43g', length: '8.7', update: "Baby can make sucking motions. Their sex is distinguishable on ultrasound.", update_sw: 'Mtoto anaweza kufanya mwendo wa kunyonya. Jinsia yao inaweza kuonekana kwa ultrasound.' },
  16: { size: 'Avocado', weight: '100g', length: '11.6', update: "Baby can hear sounds! They may react to your voice and music.", update_sw: 'Mtoto anaweza kusikia sauti! Wanaweza kujibu sauti yako na muziki.' },
  18: { size: 'Bell pepper', weight: '190g', length: '14.2', update: "You may soon feel baby's first movements — like butterflies in your tummy!", update_sw: 'Hivi karibuni unaweza kuhisi mwendo wa kwanza wa mtoto!' },
  20: { size: 'Banana', weight: '300g', length: '16.4', update: "Halfway there! Baby is swallowing and may get hiccups you can feel.", update_sw: 'Nusu ya safari! Mtoto anameza na anaweza kupata kozo unazoweza kuhisi.' },
  22: { size: 'Papaya', weight: '430g', length: '19.6', update: "Baby's face is fully formed. They can feel touch and respond to it.", update_sw: 'Uso wa mtoto umekamilika. Wanaweza kuhisi kuguswa na kujibu.' },
  24: { size: 'Corn', weight: '600g', length: '21.8', update: "Baby's footprints and fingerprints are forming! Lungs are developing rapidly.", update_sw: 'Alama za miguu na vidole vya mtoto zinaundwa! Mapafu yanakua haraka.' },
  26: { size: 'Scallion', weight: '760g', length: '23', update: "Eyes can open and close. Baby recognizes your voice and may respond!", update_sw: 'Macho yanaweza kufunguka na kufunga. Mtoto anatambua sauti yako!' },
  28: { size: 'Eggplant', weight: '1kg', length: '25', update: "Third trimester begins! Baby can dream. Brain is growing fast.", update_sw: 'Trimesta ya tatu inaanza! Mtoto anaweza kuota. Ubongo unakua haraka.' },
  30: { size: 'Cabbage', weight: '1.3kg', length: '27', update: "Baby is storing fat for warmth. They kick and move very actively now.", update_sw: 'Mtoto anahifadhi mafuta kwa joto. Wanakick na kusonga kikamilifu sasa.' },
  32: { size: 'Squash', weight: '1.7kg', length: '28.7', update: "Baby practices breathing movements. Their nails and hair are growing.", update_sw: 'Mtoto anafanya mazoezi ya kupumua. Kucha na nywele zao zinakua.' },
  34: { size: 'Butternut', weight: '2.1kg', length: '30', update: "Baby is almost fully developed. They sleep and wake on a regular schedule.", update_sw: 'Mtoto amekaribia kukamilika. Wanalala na kuamka kwa ratiba ya kawaida.' },
  36: { size: 'Melon', weight: '2.6kg', length: '32', update: "Baby is considered early term. Head may be engaged in the pelvis.", update_sw: 'Mtoto anachukuliwa kama mapema ya muda. Kichwa kinaweza kushiriki kwenye kiuno.' },
  38: { size: 'Pumpkin', weight: '3kg', length: '34', update: "Baby is gaining weight daily. Lungs are mature and ready to breathe air!", update_sw: 'Mtoto anapata uzito kila siku. Mapafu yamekuwa na yako tayari kupumua hewa!' },
  40: { size: 'Watermelon', weight: '3.4kg', length: '36', update: "Full term! Baby could arrive any day. You've done an amazing job, mama.", update_sw: 'Muda kamili! Mtoto anaweza kuja siku yoyote. Umefanya kazi nzuri sana, mama.' },
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

const TRIM_CONFIG = {
  1: {
    label: 'First Trimester',
    label_sw: 'Trimesta ya Kwanza',
    gradient: 'linear-gradient(160deg, #2d1b4e 0%, #553a8c 60%, #4a2d7a 100%)',
    accent: '#9b7de8',
    dot: '#c4a7ff',
  },
  2: {
    label: 'Second Trimester',
    label_sw: 'Trimesta ya Pili',
    gradient: 'linear-gradient(160deg, #0d2e4a 0%, #0f4c75 60%, #1565a8 100%)',
    accent: '#5ba8e8',
    dot: '#93c9f8',
  },
  3: {
    label: 'Third Trimester',
    label_sw: 'Trimesta ya Tatu',
    gradient: 'linear-gradient(160deg, #0d2e1e 0%, #1a5e40 60%, #2d7a5d 100%)',
    accent: '#4ecb8d',
    dot: '#80e8b5',
  },
};

export default function FetalDevelopmentCard({ mother, lang }) {
  if (!mother || mother.pregnancy_status !== 'pregnant') return null;

  const today = new Date();
  const lmpDate = mother.lmp ? parseISO(mother.lmp) : null;
  const eddDate = mother.edd ? parseISO(mother.edd) : null;
  const weeksRaw = lmpDate ? differenceInWeeks(today, lmpDate) : null;
  const weeksPregnant = (weeksRaw !== null && weeksRaw > 0) ? weeksRaw : null;
  const daysUntilDue = eddDate ? differenceInDays(eddDate, today) : null;

  const trimester = weeksPregnant
    ? weeksPregnant <= 12 ? 1 : weeksPregnant <= 27 ? 2 : 3
    : 2;

  const fetal = getFetalInfo(weeksPregnant);
  const progress = weeksPregnant ? Math.min((weeksPregnant / 40) * 100, 100) : 0;
  const eddFormatted = eddDate ? format(eddDate, 'MMM d, yyyy') : null;
  const cfg = TRIM_CONFIG[trimester];
  const update = lang === 'sw' ? fetal.update_sw : fetal.update;
  const trimLabel = lang === 'sw' ? cfg.label_sw : cfg.label;

  return (
    <Link to="/anc" className="block mx-4 mb-5 active:scale-[0.985] transition-all duration-300">
      <div className="rounded-[28px] overflow-hidden relative shadow-[0_12px_36px_rgba(0,0,0,0.06)]" style={{ background: cfg.gradient }}>

        {/* Subtle mesh pattern overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 80%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        {/* Glow decoration */}
        <div className="absolute -top-12 -left-12 w-32 h-32 rounded-full opacity-[0.15] blur-2xl pointer-events-none" style={{ backgroundColor: cfg.dot }} />

        <div className="relative p-5">

          {/* Top: Trimester Details + Due Badge */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[9px] tracking-[0.2em] font-extrabold uppercase mb-0.5" style={{ color: cfg.accent }}>
                {lang === 'sw' ? 'MTOTO WAKO LEO' : 'YOUR BABY TODAY'}
              </p>
              <p className="text-[12px] font-bold text-white/70">{trimLabel}</p>
            </div>
            {eddFormatted && (
              <div className="rounded-full px-3 py-1.5 flex items-center gap-2"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ backgroundColor: cfg.dot }} />
                <span className="text-[10px] font-black text-white/80 tracking-tight">{eddFormatted}</span>
              </div>
            )}
          </div>

          {/* Main Content: Split layout */}
          <div className="flex items-start justify-between gap-4 mb-5">
            {/* Left: Size comparison and description */}
            <div className="flex-1 min-w-0">
              <p className="text-[20px] font-black text-white leading-tight mb-2 tracking-tight">
                {lang === 'sw' ? 'Ukubwa wa ' : 'Size of a '}<span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80" style={{ textShadow: `0 2px 10px ${cfg.accent}30` }}>{fetal.size}</span>
              </p>
              <p className="text-[12.5px] text-white/75 leading-relaxed font-semibold line-clamp-3">{update}</p>
            </div>

            {/* Right: Premium glass circular week badge */}
            <div className="w-22 h-22 rounded-full bg-white/10 backdrop-blur-md border border-white/15 flex flex-col items-center justify-center relative shadow-[inset_0_1px_3px_rgba(255,255,255,0.2)] flex-shrink-0">
              <span className="text-[32px] font-black text-white leading-none tracking-tight">{weeksPregnant ?? '—'}</span>
              <span className="text-[8px] tracking-[0.1em] font-black text-white/60 uppercase leading-none mt-1">{lang === 'sw' ? 'WIKI' : 'WEEKS'}</span>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white flex items-center justify-center text-[12px] shadow-sm border border-toto-teal/10 animate-bounce-in">
                👶
              </div>
            </div>
          </div>

          {/* Fetal metrics row */}
          <div className="grid grid-cols-3 gap-2.5 mb-5">
            <div className="bg-white/5 backdrop-blur-md rounded-[16px] border border-white/10 p-2.5 flex flex-col">
              <span className="text-[9px] text-white/50 font-bold uppercase tracking-wider">{lang === 'sw' ? 'Uzito' : 'Weight'}</span>
              <span className="text-[13px] font-black text-white mt-0.5">{fetal.weight}</span>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-[16px] border border-white/10 p-2.5 flex flex-col">
              <span className="text-[9px] text-white/50 font-bold uppercase tracking-wider">{lang === 'sw' ? 'Urefu' : 'Length'}</span>
              <span className="text-[13px] font-black text-white mt-0.5">{fetal.length} cm</span>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-[16px] border border-white/10 p-2.5 flex flex-col">
              <span className="text-[9px] text-white/50 font-bold uppercase tracking-wider">{lang === 'sw' ? 'Katika Siku' : 'Progress'}</span>
              <span className="text-[13px] font-black text-white mt-0.5 truncate">{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-1">
            <div className="h-[4px] rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}>
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${cfg.accent}, ${cfg.dot})` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[8.5px] text-white/35 font-bold uppercase tracking-wider">{lang === 'sw' ? 'Wiki 1' : 'Week 1'}</span>
              <span className="text-[8.5px] text-white/35 font-bold uppercase tracking-wider">{lang === 'sw' ? 'Wiki 40' : 'Week 40'}</span>
            </div>
          </div>

        </div>

        {/* Premium bottom glass container bar */}
        <div className="flex items-center justify-between px-5 py-3.5"
          style={{ backgroundColor: 'rgba(0,0,0,0.22)', backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <p className="text-[9px] tracking-[0.15em] uppercase font-bold text-white/40 mb-0.5">
              {lang === 'sw' ? 'SIKU ZILIZOBAKI' : 'DAYS UNTIL DUE'}
            </p>
            <p className="text-[17px] font-black text-white leading-none font-numeric-tabular">
              {daysUntilDue !== null && daysUntilDue > 0 ? `${daysUntilDue} ${lang === 'sw' ? 'siku' : 'days'}` : '—'}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors duration-200">
            <span className="text-[11.5px] font-bold">{lang === 'sw' ? 'Kumbukumbu za ANC' : 'View ANC records'}</span>
            <ArrowRight size={13} />
          </div>
        </div>
      </div>
    </Link>
  );
}