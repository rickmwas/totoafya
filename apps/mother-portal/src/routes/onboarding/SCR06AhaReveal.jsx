import React from 'react';
import { PillButton } from '@totoafya/shared-ui';
import { CelebrationWreathIcon, FruitBotanicalIcon, SyringeVaccineIcon, CalendarIcon } from './icons';
import { getNextANCContact } from './pregnancyData';

/**
 * SCR-06: The "Aha! Moment" Value Reveal Screen
 *
 * Implements:
 * - Instant personalized milestone summary rather than an empty dashboard:
 *   - Expectant mother: Gestational weeks, countdown to baby arrival, fetal size analogy, next ANC contact.
 *   - Mother with child: Age in months, next clinic/vaccine visit.
 *   - Both: Dual overview.
 *   - Guest: Warm exploratory welcome.
 * - Primary Action: "Enter My Dashboard" / "Fungua Ukurasa Wangu" (52px pill, 48px min hit target)
 * - Zero Unicode emojis (strictly custom SVGs)
 */

export function SCR06AhaReveal({
  journeyData = {},
  onEnterDashboard,
  lang = 'en',
}) {
  const isSw = lang === 'sw';
  const { role, pregnancyData, childData } = journeyData;

  const isExpecting = role === 'expecting' || role === 'both';
  const hasChild = role === 'child' || role === 'both';

  const weeksAlong = pregnancyData?.gestationalWeeks || 26;
  const weeksRemaining = Math.max(0, 40 - weeksAlong);
  const nextAnc = getNextANCContact(weeksAlong);

  return (
    <div
      className="min-h-screen w-full flex flex-col justify-between px-6 py-8"
      style={{ backgroundColor: '#F9F8F5', color: '#1A202C' }}
      data-testid="scr06-aha-reveal"
    >
      {/* Celebration Header */}
      <div className="flex flex-col items-center text-center pt-2">
        <CelebrationWreathIcon size={58} className="mb-3.5" />

        <h1
          className="text-2xl font-bold text-[#1A202C] leading-snug mb-1"
          style={{ fontFamily: "'Merriweather', Georgia, serif" }}
        >
          {isSw ? 'Hongera! Safari Yako Imeanza' : "You're All Set!"}
        </h1>
        <p className="text-xs text-[#4A5568] max-w-xs leading-relaxed">
          {isSw
            ? 'Tumebinafsisha dashibodi yako kulingana na mahitaji yako na ya familia yako.'
            : 'We’ve prepared your personalized care dashboard and verified offline protection.'}
        </p>
      </div>

      {/* Main Personalized Value Card(s) */}
      <div className="my-auto space-y-4 max-w-sm mx-auto w-full py-4">
        {/* Expectant Mother Hero Card */}
        {isExpecting && (
          <div
            className="rounded-2xl p-5 text-white shadow-md transition-all"
            style={{
              background: 'linear-gradient(145deg, #006B5F 0%, #004D44 100%)',
            }}
            data-testid="aha-pregnancy-card"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#1A202C]">
                {isSw ? `Wiki ya ${weeksAlong}` : `Week ${weeksAlong} of 40`}
              </span>
              <span className="text-xs font-medium text-[#FEF3C7]">
                {isSw
                  ? `Zimebaki Wiki ${weeksRemaining}`
                  : `${weeksRemaining} Weeks to Arrival`}
              </span>
            </div>

            <div className="flex items-center gap-3.5 mb-3.5">
              <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <FruitBotanicalIcon week={weeksAlong} size={28} />
              </div>
              <div>
                <p className="text-xs text-[#FEF3C7] font-semibold">
                  {isSw ? 'Ukubwa wa Kijusi:' : 'Current Fetal Size:'}
                </p>
                <h3 className="text-base font-bold text-white leading-tight">
                  {pregnancyData?.fruitSize
                    ? isSw
                      ? pregnancyData.fruitSize.sw
                      : pregnancyData.fruitSize.en
                    : isSw
                    ? 'Biringanya (African Garden Egg)'
                    : 'African Garden Egg (Biringanya)'}
                </h3>
              </div>
            </div>

            {/* Next ANC Contact Reminder */}
            <div className="p-3 rounded-xl bg-white/10 border border-white/15">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#FEF3C7] mb-0.5">
                <CalendarIcon size={14} color="#FEF3C7" />
                <span>
                  {isSw
                    ? 'Kliniki ya Ujauzito Inayofuata:'
                    : 'Upcoming ANC Contact:'}
                </span>
              </div>
              <p className="text-xs text-white">
                {isSw ? nextAnc.titleSw : nextAnc.title} ({isSw ? nextAnc.weekRangeSw : nextAnc.weekRange})
              </p>
            </div>
          </div>
        )}

        {/* Child Health Hero Card */}
        {hasChild && (
          <div
            className="rounded-2xl p-5 bg-white border border-[#E2E8F0] shadow-sm text-[#1A202C]"
            data-testid="aha-child-card"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#006B5F] uppercase tracking-wide">
                {isSw ? 'Afya ya Mtoto' : 'Child Health Record'}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#F0FAF5] text-[#15803D]">
                {isSw ? 'KEPI Imeratibiwa' : 'KEPI Ready'}
              </span>
            </div>

            <h3 className="text-lg font-bold text-[#1A202C] leading-snug">
              {isSw
                ? `Karibu! Mtoto ${childData?.firstName || 'Wako'}`
                : `Welcome! Baby ${childData?.firstName || 'Joy'}`}
            </h3>
            <p className="text-xs text-[#4A5568] mt-0.5 mb-3">
              {childData?.ageDisplay || (isSw ? 'Miezi 4' : '4 months old')}
            </p>

            <div className="p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] flex items-start gap-2.5">
              <SyringeVaccineIcon size={20} color="#B45309" className="shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-[#92400E]">
                  {isSw ? 'Ziara Inayofuata ya Chanjo' : 'Next Vaccine Milestone'}
                </p>
                <p className="text-[11px] text-[#78350F] mt-0.5 leading-relaxed">
                  {isSw
                    ? 'Ratiba kamili ya KEPI ipo tayari kwenye kadi yako ya chanjo.'
                    : 'Kenya KEPI 7-visit immunization schedule is ready on your card.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Guest Explorer Summary */}
        {!isExpecting && !hasChild && (
          <div className="rounded-2xl p-5 bg-white border border-[#E2E8F0] shadow-sm text-center">
            <h3 className="text-base font-bold text-[#1A202C] mb-1.5">
              {isSw ? 'Mwongozo wa Afya wa TotoAfya' : 'Welcome to TotoAfya'}
            </h3>
            <p className="text-xs text-[#4A5568] leading-relaxed">
              {isSw
                ? 'Unaweza kuangalia ratiba za chanjo, makuzi ya watoto, na mwongozo wa afya ya uzazi wakati wowote.'
                : 'Explore interactive guides, Kenyan immunization schedules, and trusted advice. Personalize your records anytime from settings.'}
            </p>
          </div>
        )}

        {/* Offline & Security Reassurance Chip */}
        <div className="flex items-center justify-center gap-2 py-1 text-center">
          <span className="w-2 h-2 rounded-full bg-[#15803D]" />
          <span className="text-[11px] font-medium text-[#4A5568]">
            {isSw
              ? 'Taarifa zako zimehifadhiwa kwa siri na zinafanya kazi bila mtandao.'
              : 'Private PIN protected & fully functional offline.'}
          </span>
        </div>
      </div>

      {/* Primary Action CTA */}
      <div className="pt-4 w-full max-w-sm mx-auto">
        <PillButton
          variant="primary"
          size="lg"
          fullWidth
          onClick={onEnterDashboard}
          className="w-full h-[52px] text-base font-semibold"
          data-testid="enter-dashboard-btn"
        >
          {isSw ? 'Fungua Ukurasa Wangu' : 'Enter My Dashboard'}
        </PillButton>
      </div>
    </div>
  );
}

export default SCR06AhaReveal;
