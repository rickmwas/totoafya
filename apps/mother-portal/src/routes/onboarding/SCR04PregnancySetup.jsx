import React, { useState, useMemo } from 'react';
import { PillButton } from '@totoafya/shared-ui';
import {
  calculateEDDFromLMP,
  calculateEdd,
  calculateGestationalAgeInWeeks,
  estimateTrimesterAndEDD,
} from '@totoafya/business-logic';
import { getKenyanFetalSize } from './pregnancyData';
import { CalendarIcon, FruitBotanicalIcon } from './icons';

/**
 * SCR-04: Pregnancy Setup Flow
 *
 * Implements:
 * - Path 1: Last Menstrual Period (LMP) date picker with live calculation of EDD,
 *           gestational weeks, trimester, and Kenyan agricultural fruit size analogy.
 * - Path 2: Ultrasound scan EDD date picker.
 * - Path 3: Guided Trimester Estimator ("When did you first notice pregnant / feel movement?")
 *           with clinical provisional disclaimer.
 * - Genuine clinical calculations using @totoafya/business-logic algorithms.
 * - Zero Unicode emojis.
 */

export function SCR04PregnancySetup({
  initialData = {},
  onComplete,
  onBack,
  lang = 'en',
}) {
  const isSw = lang === 'sw';

  // Active path: 'lmp' | 'ultrasound' | 'guided'
  const [activePath, setActivePath] = useState(initialData.path || 'lmp');

  // Form states
  const [lmpDate, setLmpDate] = useState(initialData.lmp || '');
  const [scanEddDate, setScanEddDate] = useState(initialData.edd || '');
  const [guidedMonthsAgo, setGuidedMonthsAgo] = useState(
    initialData.approximateMonthsAgo || 5
  );
  const [guidedLandmark, setGuidedLandmark] = useState(
    initialData.landmark || 'at_navel'
  );
  const [error, setError] = useState('');

  // Today's date in YYYY-MM-DD for min/max attributes
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Compute live calculation based on active path
  const calculationResult = useMemo(() => {
    try {
      if (activePath === 'lmp') {
        if (!lmpDate) return null;
        // Direct Naegele computation from business-logic
        const res = calculateEDDFromLMP(lmpDate);
        // Also verify backwards compatible functions
        const backupWeeks = calculateGestationalAgeInWeeks(lmpDate);
        const backupEdd = calculateEdd(lmpDate);

        const fruit = getKenyanFetalSize(res.gestationalWeeks);

        return {
          edd: res.edd || backupEdd,
          gestationalWeeks: res.gestationalWeeks ?? backupWeeks,
          gestationalDays: res.gestationalDays ?? 0,
          trimester: res.trimester,
          source: 'lmp_naegele',
          fruit,
          isPostTerm: res.isPostTerm,
        };
      }

      if (activePath === 'ultrasound') {
        if (!scanEddDate) return null;
        const targetDate = new Date(scanEddDate);
        const today = new Date();
        const diffMs = targetDate.getTime() - today.getTime();
        const daysRemaining = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
        const weeksRemaining = Math.floor(daysRemaining / 7);
        const gestationalWeeks = Math.max(1, Math.min(44, 40 - weeksRemaining));

        let trimester = 1;
        if (gestationalWeeks > 13 && gestationalWeeks <= 27) trimester = 2;
        else if (gestationalWeeks > 27) trimester = 3;

        const fruit = getKenyanFetalSize(gestationalWeeks);

        return {
          edd: scanEddDate,
          gestationalWeeks,
          gestationalDays: 0,
          trimester,
          source: 'ultrasound_scan',
          fruit,
          daysRemaining,
        };
      }

      if (activePath === 'guided') {
        // Guided estimator using fundal height landmarks or approximate months
        const res = estimateTrimesterAndEDD({
          landmark: guidedLandmark,
          approximateMonthsAgo: Number(guidedMonthsAgo),
        });

        const fruit = getKenyanFetalSize(res.gestationalWeeks);

        return {
          edd: res.edd,
          gestationalWeeks: res.gestationalWeeks,
          gestationalDays: 0,
          trimester: res.trimester,
          source: 'guided_estimate',
          fruit,
          clinicalDisclaimer: res.clinicalDisclaimer,
        };
      }
    } catch (err) {
      return null;
    }
    return null;
  }, [activePath, lmpDate, scanEddDate, guidedMonthsAgo, guidedLandmark]);

  const handleConfirm = () => {
    setError('');

    if (activePath === 'lmp' && !lmpDate) {
      setError(
        isSw
          ? 'Tafadhali chagua tarehe ya hedhi ya mwisho (LMP).'
          : 'Please select your Last Menstrual Period date (LMP).'
      );
      return;
    }

    if (activePath === 'ultrasound' && !scanEddDate) {
      setError(
        isSw
          ? 'Tafadhali chagua tarehe ya kujifungua iliyoonyeshwa na ultrasound.'
          : 'Please select your ultrasound estimated due date.'
      );
      return;
    }

    if (calculationResult && onComplete) {
      onComplete({
        path: activePath,
        lmp: lmpDate,
        edd: calculationResult.edd,
        gestationalWeeks: calculationResult.gestationalWeeks,
        trimester: calculationResult.trimester,
        source: calculationResult.source,
        fruitSize: calculationResult.fruit,
        clinicalDisclaimer: calculationResult.clinicalDisclaimer,
      });
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col justify-between px-6 py-6"
      style={{ backgroundColor: '#F9F8F5', color: '#1A202C' }}
      data-testid="scr04-pregnancy-setup"
    >
      <div>
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-4">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="min-h-[48px] min-w-[48px] flex items-center gap-1.5 text-sm font-semibold text-[#006B5F] hover:text-[#004D44] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5F] rounded-lg"
              aria-label={isSw ? 'Rudi nyuma' : 'Go back'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>{isSw ? 'Nyuma' : 'Back'}</span>
            </button>
          ) : (
            <div className="w-12 h-12" />
          )}

          <span className="text-xs font-semibold text-[#718096] uppercase tracking-wider">
            {isSw ? 'Hatua 4 kati ya 6' : 'Step 4 of 6'}
          </span>
        </div>

        {/* Headline */}
        <div className="text-center mb-5">
          <h2
            className="text-2xl font-bold text-[#1A202C] leading-tight mb-1.5"
            style={{ fontFamily: "'Merriweather', Georgia, serif" }}
          >
            {isSw ? 'Weka Taarifa za Ujauzito' : 'Set Up Your Pregnancy'}
          </h2>
          <p className="text-xs text-[#4A5568] max-w-sm mx-auto">
            {isSw
              ? 'Chagua njia unayopendelea kukadiria tarehe yako ya kujifungua.'
              : 'How would you like to calculate your baby’s estimated due date?'}
          </p>
        </div>

        {/* 3 Path Selection Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-white border border-[#E2E8F0] rounded-xl shadow-sm mb-5 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => setActivePath('lmp')}
            className={`min-h-[48px] px-2 py-2 rounded-lg text-xs font-semibold text-center transition-all ${
              activePath === 'lmp'
                ? 'bg-[#006B5F] text-white shadow-sm'
                : 'text-[#4A5568] hover:bg-[#F9F8F5]'
            }`}
            data-testid="path-lmp-btn"
          >
            {isSw ? 'Hedhi (LMP)' : 'Last Period (LMP)'}
          </button>

          <button
            type="button"
            onClick={() => setActivePath('ultrasound')}
            className={`min-h-[48px] px-2 py-2 rounded-lg text-xs font-semibold text-center transition-all ${
              activePath === 'ultrasound'
                ? 'bg-[#006B5F] text-white shadow-sm'
                : 'text-[#4A5568] hover:bg-[#F9F8F5]'
            }`}
            data-testid="path-ultrasound-btn"
          >
            {isSw ? 'Ultrasound' : 'Ultrasound EDD'}
          </button>

          <button
            type="button"
            onClick={() => setActivePath('guided')}
            className={`min-h-[48px] px-2 py-2 rounded-lg text-xs font-semibold text-center transition-all ${
              activePath === 'guided'
                ? 'bg-[#006B5F] text-white shadow-sm'
                : 'text-[#4A5568] hover:bg-[#F9F8F5]'
            }`}
            data-testid="path-guided-btn"
          >
            {isSw ? 'Kadirio' : 'Guided Estimate'}
          </button>
        </div>

        {/* Path 1: LMP Selection */}
        {activePath === 'lmp' && (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm max-w-md mx-auto mb-4">
            <label className="block text-sm font-bold text-[#1A202C] mb-1">
              {isSw
                ? 'Siku ya Kwanza ya Hedhi ya Mwisho (LMP)'
                : 'First Day of Last Menstrual Period (LMP)'}
            </label>
            <p className="text-xs text-[#718096] mb-3">
              {isSw
                ? 'Njia ya kimatibabu ya Naegele (+siku 280 / wiki 40).'
                : 'Recommended standard clinical method (LMP + 280 days).'}
            </p>

            <div className="relative">
              <input
                type="date"
                max={todayStr}
                value={lmpDate}
                onChange={(e) => setLmpDate(e.target.value)}
                className="w-full min-h-[48px] px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-sm text-[#1A202C] focus:outline-none focus:ring-2 focus:ring-[#006B5F] focus:border-[#006B5F]"
                data-testid="lmp-date-input"
                aria-label="Last menstrual period date"
              />
            </div>
          </div>
        )}

        {/* Path 2: Ultrasound EDD Selection */}
        {activePath === 'ultrasound' && (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm max-w-md mx-auto mb-4">
            <label className="block text-sm font-bold text-[#1A202C] mb-1">
              {isSw
                ? 'Tarehe ya Kujifungua kutoka Ultrasound'
                : 'Ultrasound Scan Due Date (EDD)'}
            </label>
            <p className="text-xs text-[#718096] mb-3">
              {isSw
                ? 'Kama umeshafanyiwa kipimo cha ultrasound na daktari au muuguzi.'
                : 'Enter the due date written on your hospital ultrasound scan report.'}
            </p>

            <div className="relative">
              <input
                type="date"
                min={todayStr}
                value={scanEddDate}
                onChange={(e) => setScanEddDate(e.target.value)}
                className="w-full min-h-[48px] px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-sm text-[#1A202C] focus:outline-none focus:ring-2 focus:ring-[#006B5F] focus:border-[#006B5F]"
                data-testid="ultrasound-date-input"
                aria-label="Ultrasound due date"
              />
            </div>
          </div>
        )}

        {/* Path 3: Guided Trimester Estimator */}
        {activePath === 'guided' && (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm max-w-md mx-auto mb-4">
            <label className="block text-sm font-bold text-[#1A202C] mb-1">
              {isSw
                ? 'Mchezo wa Mtoto au Uvumi wa Mimba'
                : 'When did you first notice or feel baby move?'}
            </label>
            <p className="text-xs text-[#718096] mb-4">
              {isSw
                ? 'Chagua alama ya mwili au makadirio ya miezi iliyopita:'
                : 'Select anatomical fundal height landmark or approximate months:'}
            </p>

            <div className="flex flex-col gap-2.5 mb-4">
              {[
                {
                  id: 'below_navel',
                  label: isSw ? 'Chini ya kitovu (Chini ya wiki 20)' : 'Below belly button (< 20 weeks)',
                  approx: '~14 weeks (Trimester 2)',
                },
                {
                  id: 'at_navel',
                  label: isSw ? 'Sawa na kitovu (Takriban wiki 20)' : 'Level with belly button (~ 20 weeks)',
                  approx: '~20 weeks (Trimester 2)',
                },
                {
                  id: 'above_navel',
                  label: isSw ? 'Juu ya kitovu (Zaidi ya wiki 20)' : 'Above belly button (> 20 weeks)',
                  approx: '~30 weeks (Trimester 3)',
                },
              ].map((lm) => (
                <label
                  key={lm.id}
                  className={`min-h-[48px] p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                    guidedLandmark === lm.id
                      ? 'bg-[#E6F4F1] border-[#006B5F]'
                      : 'border-[#E2E8F0] hover:bg-[#F9F8F5]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="landmark"
                      value={lm.id}
                      checked={guidedLandmark === lm.id}
                      onChange={() => setGuidedLandmark(lm.id)}
                      className="w-4 h-4 text-[#006B5F] focus:ring-[#006B5F]"
                    />
                    <span className="text-xs font-semibold text-[#1A202C]">
                      {lm.label}
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-[#718096]">
                    {lm.approx}
                  </span>
                </label>
              ))}
            </div>

            {/* Approximate Months Slider / Selector */}
            <div className="pt-2 border-t border-[#E2E8F0]">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-[#4A5568]">
                  {isSw ? 'Au miezi iliyopita tangu mimba:' : 'Or approximate months pregnant:'}
                </span>
                <span className="text-xs font-bold text-[#006B5F]">
                  {guidedMonthsAgo} {isSw ? 'Miezi' : 'Months'}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="9"
                value={guidedMonthsAgo}
                onChange={(e) => setGuidedMonthsAgo(e.target.value)}
                className="w-full accent-[#006B5F] h-2 bg-[#E2E8F0] rounded-lg cursor-pointer"
                data-testid="guided-months-slider"
              />
            </div>

            {/* Clinical Provisional Disclaimer */}
            <div className="mt-4 p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#92400E] leading-relaxed">
              <strong>{isSw ? 'Kumbuka: ' : 'Clinical Note: '}</strong>
              {isSw
                ? 'Makadirio haya ni ya muda mfupi. Muuguzi au mkunga wako kwenye kliniki inayofuata ya ANC atathibitisha tarehe kamili.'
                : 'Provisional estimate based on anatomical landmarks. Your nurse or midwife at the next ANC visit will verify your exact due date.'}
            </div>
          </div>
        )}

        {/* Live Calculation Feedback Card */}
        {calculationResult && (
          <div
            className="rounded-2xl p-5 border text-white shadow-md max-w-md mx-auto transition-all"
            style={{
              background: 'linear-gradient(145deg, #006B5F 0%, #004D44 100%)',
            }}
            data-testid="pregnancy-calculation-card"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#1A202C]">
                {isSw
                  ? `Robo ya ${calculationResult.trimester} (Trimester ${calculationResult.trimester})`
                  : `Trimester ${calculationResult.trimester}`}
              </span>

              <span className="text-xs font-medium text-[#FEF3C7]">
                {`EDD: ${calculationResult.edd}`}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Botanical Fruit Icon Frame */}
              <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
                <FruitBotanicalIcon
                  week={calculationResult.gestationalWeeks}
                  size={32}
                />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white leading-tight">
                  {isSw
                    ? `Takriban Wiki ${calculationResult.gestationalWeeks}`
                    : `Approximately ${calculationResult.gestationalWeeks} Weeks Pregnant`}
                </h3>
                {calculationResult.fruit && (
                  <p className="text-xs text-[#FEF3C7] mt-0.5 font-medium">
                    {isSw
                      ? `Ukubwa wa Mtoto: ${calculationResult.fruit.sw}`
                      : `Baby Size: ${calculationResult.fruit.en}`}
                  </p>
                )}
                {calculationResult.fruit?.weightG && (
                  <p className="text-[11px] text-white/80 mt-0.5">
                    {isSw
                      ? `Urefu: ~${calculationResult.fruit.lengthCm} cm | Uzito: ~${calculationResult.fruit.weightG} g`
                      : `Length: ~${calculationResult.fruit.lengthCm} cm | Weight: ~${calculationResult.fruit.weightG} g`}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {error && (
          <p
            className="mt-3 text-xs font-semibold text-[#DC2626] text-center max-w-md mx-auto"
            role="alert"
            data-testid="pregnancy-error"
          >
            {error}
          </p>
        )}
      </div>

      {/* Action CTA */}
      <div className="pt-6 w-full max-w-sm mx-auto">
        <PillButton
          variant="primary"
          size="lg"
          fullWidth
          disabled={!calculationResult}
          onClick={handleConfirm}
          className="w-full h-[52px] text-base font-semibold"
          data-testid="confirm-due-date-btn"
        >
          {isSw ? 'Thibitisha Tarehe' : 'Confirm Due Date'}
        </PillButton>
      </div>
    </div>
  );
}

export default SCR04PregnancySetup;
