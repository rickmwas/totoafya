import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Heart,
  Activity,
  Apple,
  Calendar,
  ShieldAlert,
  ArrowRight,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { PillButton, StatusBadge } from '@totoafya/shared-ui';

/**
 * Kenyan fruit & vegetable size analogies across pregnancy weeks.
 */
const FETAL_SIZE_ANALOGIES = {
  4: { en: 'Poppy seed', sw: 'Mbegu ya Khaskhas', lengthCm: 0.1, weightGrams: 0.1 },
  8: { en: 'Kidney bean', sw: 'Maharagwe', lengthCm: 1.6, weightGrams: 1.0 },
  12: { en: 'Lime', sw: 'Ndimu', lengthCm: 5.4, weightGrams: 14 },
  16: { en: 'Avocado', sw: 'Parachichi', lengthCm: 11.6, weightGrams: 100 },
  20: { en: 'Banana', sw: 'Ndizi', lengthCm: 25.6, weightGrams: 300 },
  24: { en: 'Sweet Corn', sw: 'Mahindi', lengthCm: 30.0, weightGrams: 600 },
  28: { en: 'Eggplant (Garden Egg / Brinjal)', sw: 'Biringanya', lengthCm: 37.6, weightGrams: 1000 },
  32: { en: 'Butternut Squash', sw: 'Malenge madogo', lengthCm: 42.4, weightGrams: 1700 },
  36: { en: 'Papaya / Pawpaw', sw: 'Papai', lengthCm: 47.4, weightGrams: 2600 },
  40: { en: 'Watermelon', sw: 'Tikiti Maji', lengthCm: 51.2, weightGrams: 3500 },
};

function getSizeDataForWeek(week) {
  const weeks = Object.keys(FETAL_SIZE_ANALOGIES).map(Number).sort((a, b) => a - b);
  let closest = weeks[0];
  let minDiff = Math.abs(week - closest);
  for (const w of weeks) {
    const diff = Math.abs(week - w);
    if (diff < minDiff) {
      minDiff = diff;
      closest = w;
    }
  }
  return FETAL_SIZE_ANALOGIES[closest];
}

/**
 * Organ development & anatomy milestones by week.
 */
function getOrganDevelopment(week, isSw) {
  if (week <= 12) {
    return isSw
      ? 'Moyo umeanza kupiga, viungo vya mikono na miguu vinajitengeneza, na uso unaanza kuonekana.'
      : 'Heart is beating steadily, tiny limb buds form into fingers and toes, and facial features begin taking shape.';
  }
  if (week <= 20) {
    return isSw
      ? 'Kijusi kinaweza kusikia sauti za mwili wa mama, ngozi inalindwa na vernix, na vidole vina alama za kipekee.'
      : 'Baby can hear maternal sounds, skin is protected by vernix caseosa, and unique fingerprints are fully formed.';
  }
  if (week <= 28) {
    return isSw
      ? 'Macho yanaanza kufunguka na kutambua mabadiliko ya mwanga. Mapafu yanafanya mazoezi ya kupumua na ubongo unakua haraka.'
      : 'Eyes can now open and sense light changes. Lungs practice breathing movements, and brain neural pathways develop rapidly.';
  }
  if (week <= 36) {
    return isSw
      ? 'Mifupa inazidi kuwa imara, mtoto anajaza mafuta chini ya ngozi, na mfumo wa kinga unaimarika.'
      : 'Bones harden, baby accumulates protective subcutaneous fat, and antibodies pass from mother to infant.';
  }
  return isSw
    ? 'Mtoto amekua kikamilifu na yuko tayari kwa ajili ya kuzaliwa. Kichwa kinashuka kuelekea nyonga.'
    : 'Baby is fully developed and ready for birth. Baby engages head-down into the maternal pelvis in preparation for labor.';
}

/**
 * Maternal body changes by week.
 */
function getMaternalChanges(week, isSw) {
  if (week <= 12) {
    return isSw
      ? 'Kichefuchefu cha asubuhi, uchovu wa mwili, na matiti kuwa laini au kuongezeka ukubwa.'
      : 'Morning sickness, heightened fatigue, sensitive breasts, and increased frequency of urination.';
  }
  if (week <= 20) {
    return isSw
      ? 'Nishati inarudi, tumbo linaanza kuonekana wazi, na unaweza kuanza kuhisi mchezo wa kwanza wa mtoto (quickening).'
      : 'Energy rebounds, bump becomes visibly prominent, and subtle flutter kicks (quickening) may be felt.';
  }
  if (week <= 28) {
    return isSw
      ? 'Maumivu madogo ya mgongo wa chini, kiungulia baada ya kula, na kuongezeka kwa uzito wa kawaida.'
      : 'Mild lower back ache due to center-of-gravity shifts, occasional heartburn, and normal maternal weight gain.';
  }
  if (week <= 36) {
    return isSw
      ? 'Kupumua kwa shida kidogo kadiri tumbo linavyopanda, mikazo midogo isiyo na uchungu ya Braxton Hicks.'
      : 'Mild shortness of breath as uterus expands upward, accompanied by occasional non-painful Braxton Hicks contractions.';
  }
  return isSw
    ? 'Hamu kubwa ya kujifungua (nesting), shinikizo kwenye nyonga, na maji ya mwili kuongezeka.'
    : 'Pelvic pressure increases as baby drops lower, nesting instinct peaks, and frequent bathroom trips resume.';
}

/**
 * Kenyan nutrition advice by trimester/week.
 */
function getNutritionAdvice(week, isSw) {
  if (week <= 13) {
    return isSw
      ? 'Kula vyakula vyenye madini ya chuma na foliki: Sukuma wiki, mchicha, mayai, na dengu. Kunywa maji safi ya kutosha.'
      : 'Focus on folate and iron-rich foods: Sukuma wiki, spinach, boiled eggs, and lentils (dengu) to support neural tube development.';
  }
  if (week <= 27) {
    return isSw
      ? 'Ongeza kalsiamu na protini: Maziwa mgando, maharagwe, parachichi, na samaki (kama omena au sato) kwa mifupa imara ya mtoto.'
      : 'Boost calcium and proteins: Fermented milk (mala), beans, avocado, and fish (omena or tilapia) for fetal skeletal strength.';
  }
  return isSw
    ? 'Zingatia vidonge vya IFAS (chuma na foliki), vyakula vyenye nyuzi (fiber) kama ndizi mbivu na ugali wa dona kuzuia choo kigumu.'
    : 'Maintain daily IFAS supplements, high-fiber whole grains (dona ugali, ripe bananas) to prevent constipation, and adequate hydration.';
}

export function SCR09WeeklyFetalGuide({
  initialWeek = 28,
  lang = 'en',
  onNavigate,
  className = '',
}) {
  const [selectedWeek, setSelectedWeek] = useState(initialWeek);
  const [internalLang, setInternalLang] = useState(lang);
  const isSw = internalLang === 'sw';

  const sizeData = getSizeDataForWeek(selectedWeek);
  const organInfo = getOrganDevelopment(selectedWeek, isSw);
  const maternalInfo = getMaternalChanges(selectedWeek, isSw);
  const nutritionInfo = getNutritionAdvice(selectedWeek, isSw);

  const trimester = selectedWeek <= 13 ? 1 : selectedWeek <= 27 ? 2 : 3;

  return (
    <div
      data-testid="scr09-weekly-fetal-guide"
      className={`w-full flex flex-col gap-5 px-4 pt-3 pb-12 text-left bg-[#F9F8F5] min-h-screen ${className}`}
    >
      {/* Top Header & Navigation */}
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
              {isSw ? 'Mwongozo wa Kila Wiki' : 'Weekly Fetal Guide'}
            </h1>
            <p className="text-xs text-[#718096] font-medium">
              {isSw ? 'Hatua za makuzi ya mtoto tumboni' : 'Step-by-step fetal growth milestones'}
            </p>
          </div>
        </div>

        {/* Bilingual Language Switcher */}
        <button
          type="button"
          onClick={() => setInternalLang((prev) => (prev === 'en' ? 'sw' : 'en'))}
          aria-label={isSw ? 'Badilisha lugha kuwa Kiingereza' : 'Switch to Swahili'}
          className="min-h-[48px] px-3.5 py-2 rounded-full bg-white border border-[#E2E8F0] text-xs font-bold text-[#006B5F] hover:bg-[#E6F4F1] active:scale-95 transition-all flex items-center gap-1.5"
        >
          <span className={!isSw ? 'text-[#006B5F]' : 'text-[#718096]'}>EN</span>
          <span className="text-[#CBD5E1]">|</span>
          <span className={isSw ? 'text-[#006B5F]' : 'text-[#718096]'}>SW</span>
        </button>
      </div>

      {/* Sticky Week Scroller (Weeks 4 to 42) */}
      <div className="sticky top-0 z-20 -mx-4 px-4 py-2.5 bg-[#F9F8F5]/95 backdrop-blur-sm border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1">
          {Array.from({ length: 39 }, (_, i) => i + 4).map((w) => {
            const isSelected = w === selectedWeek;
            return (
              <button
                key={w}
                type="button"
                onClick={() => setSelectedWeek(w)}
                aria-label={isSw ? `Wiki ${w}` : `Week ${w}`}
                className={`min-w-[48px] min-h-[48px] px-3 py-2 rounded-full text-xs font-bold transition-all shrink-0 flex items-center justify-center ${
                  isSelected
                    ? 'bg-[#006B5F] text-white shadow-sm ring-2 ring-[#006B5F] ring-offset-2 ring-offset-[#F9F8F5]'
                    : 'bg-white text-[#4A5568] border border-[#E2E8F0] hover:border-[#006B5F]/40'
                }`}
              >
                {isSw ? `W${w}` : `Wk ${w}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Hero Size Comparison Card */}
      <section
        aria-label={isSw ? `Muhtasari wa Wiki ${selectedWeek}` : `Week ${selectedWeek} Summary`}
        className="w-full rounded-3xl p-6 text-white shadow-md relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #006B5F 0%, #004D44 100%)' }}
      >
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#FEF3C7]" aria-hidden="true" />
            <span>{isSw ? `Wiki ${selectedWeek} • Trimester ${trimester}` : `Week ${selectedWeek} • Trimester ${trimester}`}</span>
          </span>
          <span className="text-xs font-medium text-[#FEF3C7]">
            {isSw ? `${40 - selectedWeek > 0 ? `Zimebaki takriban wiki ${40 - selectedWeek}` : 'Wakati wa kujifungua'}` : `${40 - selectedWeek > 0 ? `~${40 - selectedWeek} weeks to EDD` : 'Full term'}`}
          </span>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-5">
          {/* Circular Illustration Frame */}
          <div className="w-28 h-28 rounded-full bg-white/10 border-2 border-white/25 flex items-center justify-center p-4 shrink-0 shadow-inner">
            <Apple className="w-14 h-14 text-[#FEF3C7]" aria-hidden="true" />
          </div>

          <div className="flex flex-col gap-1.5 text-center md:text-left">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#BCE1DB]">
              {isSw ? 'Ukubwa wa Kijusi (Kenyan Fruit Analogy)' : 'Baby Size Comparison'}
            </span>
            <h2 className="text-2xl font-bold font-serif text-white leading-tight">
              {isSw ? sizeData.sw : sizeData.en}
            </h2>
            <div className="flex items-center justify-center md:justify-start gap-4 text-xs text-[#E6F4F1] pt-1">
              <span>{isSw ? `Urefu: ~${sizeData.lengthCm} cm` : `Length: ~${sizeData.lengthCm} cm`}</span>
              <span className="text-white/40">•</span>
              <span>{isSw ? `Uzito: ~${sizeData.weightGrams} g` : `Weight: ~${sizeData.weightGrams} g`}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Action Navigation Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('/pregnancy/kicks')}
          className="min-h-[48px] p-3.5 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#006B5F] text-left flex items-center justify-between gap-2 shadow-xs active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#E6F4F1] flex items-center justify-center text-[#006B5F] shrink-0">
              <Activity className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#1A202C] block">
                {isSw ? 'Hesabu Mateke' : 'Kick Counter'}
              </span>
              <span className="text-[10px] text-[#718096]">
                {isSw ? '10 katika masaa 2' : '10 kicks / 2 hours'}
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#718096] shrink-0" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={() => onNavigate && onNavigate('/pregnancy/anc')}
          className="min-h-[48px] p-3.5 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#006B5F] text-left flex items-center justify-between gap-2 shadow-xs active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#FFFBEB] flex items-center justify-center text-[#B45309] shrink-0">
              <Calendar className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#1A202C] block">
                {isSw ? 'Kadi ya ANC' : 'ANC Contacts'}
              </span>
              <span className="text-[10px] text-[#718096]">
                {isSw ? 'Kliniki 8 za MoH' : '8 WHO Contacts'}
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#718096] shrink-0" aria-hidden="true" />
        </button>
      </div>

      {/* Section 1: Fetal Development & Anatomy */}
      <article className="w-full rounded-2xl bg-white border border-[#E2E8F0] p-5 shadow-xs flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#E6F4F1] flex items-center justify-center text-[#006B5F] shrink-0">
            <Heart className="w-5 h-5" aria-hidden="true" />
          </div>
          <h3 className="text-base font-bold font-serif text-[#1A202C]">
            {isSw ? 'Makuzi ya Viungo na Anatomia' : 'Organ & Anatomical Milestones'}
          </h3>
        </div>
        <p className="text-sm text-[#4A5568] leading-relaxed">
          {organInfo}
        </p>
      </article>

      {/* Section 2: Maternal Body Changes */}
      <article className="w-full rounded-2xl bg-white border border-[#E2E8F0] p-5 shadow-xs flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#FEF3C7] flex items-center justify-center text-[#B45309] shrink-0">
            <Activity className="w-5 h-5" aria-hidden="true" />
          </div>
          <h3 className="text-base font-bold font-serif text-[#1A202C]">
            {isSw ? 'Mabadiliko ya Mwili wa Mama' : 'Maternal Physiological Changes'}
          </h3>
        </div>
        <p className="text-sm text-[#4A5568] leading-relaxed">
          {maternalInfo}
        </p>
      </article>

      {/* Section 3: Kenyan Nutrition Advice */}
      <article className="w-full rounded-2xl bg-white border border-[#E2E8F0] p-5 shadow-xs flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#F0FDF4] flex items-center justify-center text-[#15803D] shrink-0">
            <Apple className="w-5 h-5" aria-hidden="true" />
          </div>
          <h3 className="text-base font-bold font-serif text-[#1A202C]">
            {isSw ? 'Lishe Bora ya Kienyeji (Kenyan Nutrition)' : 'Kenyan Maternal Nutrition Guidance'}
          </h3>
        </div>
        <p className="text-sm text-[#4A5568] leading-relaxed">
          {nutritionInfo}
        </p>
        <div className="mt-1 p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-xs font-medium text-[#1A202C] flex items-start gap-2">
          <Info className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            {isSw
              ? 'Kumbuka kumeza kidonge chako cha IFAS kila siku baada ya chakula chenye maji ya ndimu au machungwa kwa ufyonzaji bora wa chuma.'
              : 'Remember to take your daily IFAS tablet with fresh lemon or orange juice to maximize iron absorption and avoid taking it with tea or coffee.'}
          </span>
        </div>
      </article>
    </div>
  );
}
