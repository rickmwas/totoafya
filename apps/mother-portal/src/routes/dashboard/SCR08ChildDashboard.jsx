import React from 'react';
import {
  ChevronDown,
  Users,
  Scale,
  Syringe,
  BookOpen,
  Calendar,
  Activity,
  Plus,
  Sparkles,
} from 'lucide-react';
import {
  ChildMilestoneHero,
  AppointmentBanner,
  QuickActionCard,
  PillButton,
} from '@totoafya/shared-ui';

/**
 * SCR08ChildDashboard — Screen SCR-08: Child Home Dashboard
 *
 * Implements:
 * - "The Sunlit Botanical Editorial" child companion surface
 * - Active child selector bar with child switcher trigger button (opening SCR-22)
 * - ChildMilestoneHero: Child monogram avatar, age badge, weight snapshot with percentile,
 *   healthy green MUAC indicator, and Savannah Ochre vaccine alert (Dark-on-Amber compliant)
 * - Quick Action buttons/cards: Log Weight (/growth), View Vaccine Card (/vaccines), Feeding Guide (/learn)
 * - Recent growth curve status preview with WHO percentile benchmarks
 * - Upcoming 14-week KEPI clinic visit reminder via AppointmentBanner
 * - Feeding & Weaning Guidance card (Exclusive Breastfeeding month 4 of 6)
 * - 48x48px minimum hit targets on all interactive elements
 * - ZERO Unicode emojis: Custom SVG line art and Lucide vector icons exclusively
 * - Bilingual English & Kiswahili support via `lang` prop ('en' | 'sw')
 */

export function SCR08ChildDashboard({
  child = {
    id: 'child-1',
    name: 'Joy Wambui',
    gender: 'female',
    dob: '2026-07-12',
    age: '4 Months 2 Weeks',
    ageSw: 'Miezi 4 Wiki 2',
    weight: '6.4 kg — Normal (50th percentile)',
    weightSw: '6.4 kg — Kawaida (asilimia 50)',
    muac: '13.2 cm — Healthy',
    muacSw: '13.2 cm — Afya Bora',
    muacStatus: 'healthy',
    vaccineAlert: '14-Week KEPI Vaccines Due in 12 Days',
    vaccineAlertSw: 'Chanjo ya Wiki 14 — Zimebaki Siku 12',
  },
  onOpenChildSwitcher,
  onNavigate,
  lang = 'en',
  className = '',
}) {
  const isSw = lang === 'sw';

  const handleAction = (route) => {
    if (typeof onNavigate === 'function') {
      onNavigate(route);
    }
  };

  const monogram = child.name ? child.name.trim().charAt(0).toUpperCase() : 'B';
  const resolvedAge = isSw && child.ageSw ? child.ageSw : child.age;

  return (
    <div
      data-testid="scr08-child-dashboard"
      className={`w-full flex flex-col gap-5 px-4 pt-3 pb-8 text-left ${className}`}
    >
      {/* 1. Active Child Selector Bar (Opens SCR-22 Child Switcher) */}
      <div className="w-full flex items-center justify-between gap-2.5 p-2 rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-10 h-10 rounded-full bg-[#E6F4F1] border-2 border-[#006B5F] text-[#006B5F] flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs select-none"
            aria-hidden="true"
          >
            {monogram}
          </div>

          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm text-[#1A202C] truncate">
              {child.name}
            </span>
            <span className="text-xs text-[#718096] font-medium truncate">
              {resolvedAge}
            </span>
          </div>
        </div>

        {/* Switcher Trigger Button (min 48x48px hit target) */}
        <button
          type="button"
          onClick={onOpenChildSwitcher}
          aria-label={
            isSw
              ? `Badili mtoto anayetumika (Sasa hivi: ${child.name})`
              : `Switch active child (Current: ${child.name})`
          }
          className="min-h-[48px] px-3.5 flex items-center gap-1.5 rounded-xl bg-[#F9F8F5] border border-[#E2E8F0] text-xs font-bold text-[#006B5F] hover:bg-[#E6F4F1] active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5F] select-none shrink-0"
        >
          <Users className="w-4 h-4 text-[#006B5F]" aria-hidden="true" />
          <span>{isSw ? 'Badili Mtoto' : 'Switch Child'}</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#006B5F]" aria-hidden="true" />
        </button>
      </div>

      {/* 2. Child Milestone Hero Card */}
      <ChildMilestoneHero
        name={child.name}
        age={child.age}
        ageSw={child.ageSw}
        weight={child.weight}
        weightSw={child.weightSw}
        muac={child.muac}
        muacSw={child.muacSw}
        muacStatus={child.muacStatus}
        vaccineAlert={child.vaccineAlert}
        vaccineAlertSw={child.vaccineAlertSw}
        onLogWeight={() => handleAction('/growth')}
        onViewVaccines={() => handleAction('/vaccines')}
        onFeedingGuide={() => handleAction('/learn')}
        lang={lang}
      />

      {/* 3. Upcoming Immunization Clinic Reminder Banner */}
      <AppointmentBanner
        category="Next Immunization Clinic"
        categorySw="Kliniki ya Chanjo Inayofuata"
        title="14-Week KEPI Immunization Clinic"
        titleSw="Kliniki ya Chanjo ya Wiki 14 (KEPI)"
        date="21 Nov 2026 at Ruiru Health Centre"
        dateSw="21 Nov 2026 kwenye Kituo cha Afya cha Ruiru"
        countdown="In 12 Days"
        countdownSw="Zimebaki Siku 12"
        actionLabel="View Vaccine Card"
        actionLabelSw="Fungua Kadi ya Chanjo"
        onAction={() => handleAction('/vaccines')}
        lang={lang}
      />

      {/* 4. Quick Action Tools Row */}
      <div className="flex flex-col gap-2.5">
        <h2 className="text-sm font-bold font-serif text-[#1A202C] uppercase tracking-wider">
          {isSw ? 'Zana za Mtoto' : 'Child Health Tools'}
        </h2>

        <div className="flex flex-col gap-2">
          {/* Log Growth Card */}
          <QuickActionCard
            icon={Scale}
            iconVariant="teal"
            title="Log Growth & Weight"
            titleSw="Rekodi Uzito na Urefu"
            description="Record monthly weight, height, and arm circumference"
            descriptionSw="Rekodi uzito, urefu, na mzunguko wa mkono wa kila mwezi"
            badge={isSw ? 'Uzito wa Mwisho: 6.4 kg' : 'Last: 6.4 kg'}
            badgeVariant="healthy"
            onClick={() => handleAction('/growth')}
            lang={lang}
          />

          {/* Full Vaccine Card */}
          <QuickActionCard
            icon={Syringe}
            iconVariant="amber"
            title="Kenya KEPI Vaccine Card"
            titleSw="Kadi Kamili ya Chanjo (MoH)"
            description="All 7 routine visits from Birth to 18 Months"
            descriptionSw="Chanjo zote 7 za kawaida tangu kuzaliwa hadi miezi 18"
            badge={isSw ? 'Wiki 14 Inastahili' : '14-Week Due'}
            badgeVariant="warning"
            onClick={() => handleAction('/vaccines')}
            lang={lang}
          />

          {/* Feeding & Weaning Guide */}
          <QuickActionCard
            icon={BookOpen}
            iconVariant="stone"
            title="Feeding & Nutrition Guide"
            titleSw="Mwongozo wa Lishe Bora"
            description="Age-appropriate complementary feeding and breastfeeding"
            descriptionSw="Ulishaji sahihi kulingana na umri na unyonyeshaji"
            onClick={() => handleAction('/learn')}
            lang={lang}
          />
        </div>
      </div>

      {/* 5. Recent Growth Curve Status Preview Widget */}
      <section
        aria-label={isSw ? 'Tathmini ya Makuzi' : 'Growth Curve Status'}
        className="w-full rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0] p-4 md:p-5 shadow-xs flex flex-col gap-3"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#E6F4F1] flex items-center justify-center text-[#006B5F] shrink-0">
              <Activity className="w-4 h-4" aria-hidden="true" />
            </div>
            <h3 className="font-bold text-sm text-[#1A202C]">
              {isSw ? 'Tathmini ya Ukuaji (WHO)' : 'WHO Growth Trajectory'}
            </h3>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]">
            {isSw ? 'Ukuaji Kawaida' : 'Normal Curve'}
          </span>
        </div>

        {/* Metric summary chips */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-xl bg-[#F9F8F5] border border-[#E2E8F0] flex flex-col">
            <span className="text-[11px] text-[#718096] font-semibold">
              {isSw ? 'Uzito (Asilimia 50)' : 'Weight (50th percentile)'}
            </span>
            <span className="text-base font-bold text-[#1A202C] mt-0.5">6.4 kg</span>
          </div>

          <div className="p-3 rounded-xl bg-[#F9F8F5] border border-[#E2E8F0] flex flex-col">
            <span className="text-[11px] text-[#718096] font-semibold">
              {isSw ? 'Mzunguko wa Mkono' : 'MUAC Circumference'}
            </span>
            <span className="text-base font-bold text-[#15803D] mt-0.5">13.2 cm (Green)</span>
          </div>
        </div>

        <PillButton
          variant="outline"
          onClick={() => handleAction('/growth')}
          aria-label={isSw ? 'Rekodi Kipimo Kipya cha Makuzi' : 'Log New Growth Measurement'}
          className="w-full min-h-[48px] justify-center text-xs font-bold text-[#006B5F] border-[#006B5F] hover:bg-[#E6F4F1]"
        >
          <Plus className="w-4 h-4 mr-1 text-[#006B5F]" aria-hidden="true" />
          <span>{isSw ? '+ Rekodi Kipimo cha Leo' : '+ Log Today’s Measurement'}</span>
        </PillButton>
      </section>

      {/* 6. Feeding & Weaning Guidance Card */}
      <section
        aria-label={isSw ? 'Mwongozo wa Kunyonyesha' : 'Breastfeeding & Weaning Guidance'}
        className="w-full rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0] p-4 md:p-5 shadow-xs flex flex-col gap-2.5"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#FEF3C7] flex items-center justify-center text-[#B45309] shrink-0">
            <BookOpen className="w-4 h-4" aria-hidden="true" />
          </div>
          <h3 className="font-bold text-sm text-[#1A202C]">
            {isSw ? 'Kunyonyesha Pekee: Mwezi wa 4 kati ya 6' : 'Exclusive Breastfeeding: Month 4 of 6'}
          </h3>
        </div>

        <p className="text-xs text-[#4A5568] leading-relaxed">
          {isSw
            ? 'Maziwa ya mama pekee yanatosheleza kiu na njaa ya mtoto. Usiongeze maji, uji, au maziwa ya ng’ombe hadi atimize miezi 6 kamili kulingana na miongozo ya MoH na WHO.'
            : 'Breast milk alone provides complete nutrition and hydration. Do not introduce water, porridge, or animal milk until full 6 months per MoH and WHO guidelines.'}
        </p>

        <button
          type="button"
          onClick={() => handleAction('/learn')}
          className="min-h-[48px] self-start inline-flex items-center text-xs font-bold text-[#006B5F] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5F]"
        >
          <span>{isSw ? 'Soma Makala ya Ulishaji →' : 'Read Feeding Guide →'}</span>
        </button>
      </section>
    </div>
  );
}

export default SCR08ChildDashboard;
