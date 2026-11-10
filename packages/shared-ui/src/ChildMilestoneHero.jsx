import React from 'react';
import { Scale, Syringe, BookOpen, ChevronRight, Activity, Calendar } from 'lucide-react';
import { cn } from './utils';

/**
 * ChildMilestoneHero — "The Sunlit Botanical Editorial" Child Health Hero Organism
 *
 * Implements:
 * - Elevated hero card (rounded-3xl, bg #FFFFFF, border 1px #E2E8F0, p-5 md:p-6, shadow-sm)
 * - Header: Child avatar / monogram circle (48px) + Child Name + Age badge ("4 Months 2 Weeks" / "Miezi 4 Wiki 2")
 * - Growth snapshot: Last recorded weight ("6.4 kg — Normal (50th percentile)") + MUAC badge ("13.2 cm — Healthy" in green #15803D)
 * - Next vaccine alert: Savannah Ochre/Amber badge ("14-Week KEPI Vaccines Due in 12 Days" / "Chanjo ya Wiki 14")
 *   Enforcing strict Dark-on-Amber rule: Charcoal text #1A202C on Amber #FEF3C7/#E68A00 for WCAG 2.1 AA (6.71:1 contrast)
 * - Quick action row: "Log Weight", "View Vaccine Card", "Feeding Guide" with accessible buttons (min 48x48px hit areas)
 * - Bilingual English/Kiswahili support via `lang` prop ('en' | 'sw')
 * - ZERO Unicode emojis: Lucide SVG line icons exclusively
 */
export function ChildMilestoneHero({
  name = 'Baby Joy',
  avatarUrl = null,
  age = '4 Months 2 Weeks',
  ageSw = 'Miezi 4 Wiki 2',
  weight = '6.4 kg — Normal (50th percentile)',
  weightSw = '6.4 kg — Kawaida (asilimia 50)',
  muac = '13.2 cm — Healthy',
  muacSw = '13.2 cm — Afya Bora',
  muacStatus = 'healthy',
  vaccineAlert = '14-Week KEPI Vaccines Due in 12 Days',
  vaccineAlertSw = 'Chanjo ya Wiki 14 Inatarajiwa Siku 12',
  onLogWeight,
  onViewVaccines,
  onFeedingGuide,
  lang = 'en',
  className = '',
}) {
  const isSw = lang === 'sw';

  // Resolved localized strings
  const resolvedAge = isSw && ageSw ? ageSw : age;
  const resolvedWeight = isSw && weightSw ? weightSw : weight;
  const resolvedMuac = isSw && muacSw ? muacSw : muac;
  const resolvedVaccineAlert = isSw && vaccineAlertSw ? vaccineAlertSw : vaccineAlert;

  const weightCardTitle = isSw ? 'Uzito wa Mwisho' : 'Latest Weight';
  const muacCardTitle = isSw ? 'Kipimo cha MUAC' : 'MUAC Arm Circumference';
  const growthSectionTitle = isSw ? 'Tathmini ya Ukuaji' : 'Growth Snapshot';

  // Action labels
  const logWeightLabel = isSw ? 'Rekodi Uzito' : 'Log Weight';
  const viewVaccinesLabel = isSw ? 'Kadi ya Chanjo' : 'View Vaccine Card';
  const feedingGuideLabel = isSw ? 'Mwongozo wa Lishe' : 'Feeding Guide';

  // Child monogram initial
  const monogram = name ? name.trim().charAt(0).toUpperCase() : 'B';

  return (
    <article
      aria-label={`${name} — ${resolvedAge}`}
      className={cn(
        'w-full rounded-3xl bg-[#FFFFFF] border border-[#E2E8F0] p-5 md:p-6',
        'shadow-[0_4px_16px_rgba(0,0,0,0.06)] flex flex-col gap-5 text-left transition-all',
        className
      )}
    >
      {/* 1. Header: Avatar/Monogram + Name + Age Badge */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3.5">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="w-12 h-12 rounded-full object-cover border-2 border-[#006B5F] shadow-xs shrink-0"
            />
          ) : (
            <div
              className={cn(
                'w-12 h-12 rounded-full bg-[#E6F4F1] border-2 border-[#006B5F] text-[#006B5F]',
                'flex items-center justify-center font-bold text-lg shrink-0 shadow-xs select-none'
              )}
              aria-hidden="true"
            >
              {monogram}
            </div>
          )}

          <div className="flex flex-col">
            <h2 className="text-xl md:text-2xl font-bold font-display text-[#1A202C] leading-tight tracking-tight">
              {name}
            </h2>
            <span className="text-xs text-[#718096] font-medium">TotoAfya Child Companion</span>
          </div>
        </div>

        {/* Age Badge */}
        <div
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs md:text-sm font-semibold',
            'bg-[#F1EFEA] text-[#4A5568] border border-[#E2E8F0] select-none'
          )}
        >
          <Calendar className="w-3.5 h-3.5 shrink-0 text-[#006B5F]" aria-hidden="true" />
          <span>{resolvedAge}</span>
        </div>
      </div>

      {/* 2. Growth Snapshot: Weight Card + MUAC Nutrition Card */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider font-bold text-[#718096]">
            {growthSectionTitle}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Last Recorded Weight Card */}
          <div
            className={cn(
              'rounded-2xl bg-[#F9F8F5] border border-[#E2E8F0] p-3.5 md:p-4',
              'flex items-center gap-3 transition-colors hover:border-[#006B5F]/30'
            )}
          >
            <div className="w-10 h-10 rounded-xl bg-[#E6F4F1] text-[#006B5F] flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-[#718096] truncate">
                {weightCardTitle}
              </span>
              <span className="text-sm md:text-base font-bold text-[#1A202C] tabular-nums leading-snug truncate">
                {resolvedWeight}
              </span>
            </div>
          </div>

          {/* MUAC Nutrition Badge Card */}
          <div
            className={cn(
              'rounded-2xl bg-[#F9F8F5] border border-[#E2E8F0] p-3.5 md:p-4',
              'flex items-center gap-3 transition-colors hover:border-[#15803D]/30'
            )}
          >
            <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] text-[#15803D] flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-[#718096] truncate">
                {muacCardTitle}
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm md:text-base font-bold text-[#15803D] tabular-nums leading-snug">
                  {resolvedMuac}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Next Vaccine Alert: Savannah Ochre/Amber Badge (Dark-on-Amber Rule Enforced) */}
      {resolvedVaccineAlert && (
        <div
          role="status"
          className={cn(
            'w-full rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] p-3.5 md:p-4',
            'flex items-center justify-between gap-3 text-left shadow-xs'
          )}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[#FEF3C7] text-[#B45309] flex items-center justify-center shrink-0 border border-[#FDE68A]">
              <Syringe className="w-4 h-4" aria-hidden="true" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold uppercase tracking-wider text-[#B45309]">
                {isSw ? 'Ratiba ya Chanjo' : 'Vaccine Schedule'}
              </span>
              {/* Charcoal text on Amber guarantees 6.71:1 contrast per WCAG 2.1 AA */}
              <p className="text-sm md:text-base font-bold text-[#1A202C] leading-snug truncate">
                {resolvedVaccineAlert}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onViewVaccines}
            aria-label={isSw ? 'Tazama kadi ya chanjo' : 'View vaccine schedule'}
            className={cn(
              'inline-flex items-center justify-center min-w-[48px] min-h-[48px] p-2.5 rounded-full',
              'bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#1A202C] border border-[#FDE68A]',
              'transition-all duration-150 active:scale-[0.98]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E68A00]'
            )}
          >
            <ChevronRight className="w-5 h-5 text-[#B45309]" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* 4. Quick Action Row: 3 Accessible Buttons (>= 48x48px hit areas) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
        {/* Action 1: Log Weight */}
        <button
          type="button"
          onClick={onLogWeight}
          className={cn(
            'inline-flex items-center justify-center gap-2 rounded-full font-bold select-none',
            'min-h-[48px] px-4 py-2.5 text-xs md:text-sm',
            'bg-[#E6F4F1] hover:bg-[#D5EDE8] text-[#006B5F] active:scale-[0.98]',
            'transition-all duration-150 border border-[#BCE1DB]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5F] focus-visible:ring-offset-2'
          )}
        >
          <Scale className="w-4 h-4 shrink-0 text-[#006B5F]" aria-hidden="true" />
          <span className="truncate">{logWeightLabel}</span>
        </button>

        {/* Action 2: View Vaccine Card */}
        <button
          type="button"
          onClick={onViewVaccines}
          className={cn(
            'inline-flex items-center justify-center gap-2 rounded-full font-bold select-none',
            'min-h-[48px] px-4 py-2.5 text-xs md:text-sm',
            'bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#1A202C] active:scale-[0.98]',
            'transition-all duration-150 border border-[#FDE68A]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E68A00] focus-visible:ring-offset-2'
          )}
        >
          <Syringe className="w-4 h-4 shrink-0 text-[#B45309]" aria-hidden="true" />
          <span className="truncate">{viewVaccinesLabel}</span>
        </button>

        {/* Action 3: Feeding Guide */}
        <button
          type="button"
          onClick={onFeedingGuide}
          className={cn(
            'inline-flex items-center justify-center gap-2 rounded-full font-bold select-none',
            'min-h-[48px] px-4 py-2.5 text-xs md:text-sm',
            'bg-[#F1EFEA] hover:bg-[#E7E5DF] text-[#1A202C] active:scale-[0.98]',
            'transition-all duration-150 border border-[#E2E8F0]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5F] focus-visible:ring-offset-2'
          )}
        >
          <BookOpen className="w-4 h-4 shrink-0 text-[#4A5568]" aria-hidden="true" />
          <span className="truncate">{feedingGuideLabel}</span>
        </button>
      </div>
    </article>
  );
}
