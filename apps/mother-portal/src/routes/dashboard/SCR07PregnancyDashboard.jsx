import React from 'react';
import {
  Activity,
  Calendar,
  FileCheck,
  Phone,
  Heart,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import {
  PregnancyMilestoneHero,
  AppointmentBanner,
  DangerSignAlertBanner,
  QuickActionCard,
  PillButton,
} from '@totoafya/shared-ui';

/**
 * SCR07PregnancyDashboard — Screen SCR-07: Pregnancy Home Dashboard
 *
 * Implements:
 * - "The Sunlit Botanical Editorial" maternal home surface
 * - PregnancyMilestoneHero with gestational week, countdown, botanical wreath line art, and Kenyan fruit size analogy (Biringanya)
 * - AppointmentBanner: ANC Contact 3 reminder with checklist trigger
 * - DangerSignAlertBanner: Obstetric red flags check with high-urgency triage CTA
 * - Quick Action tools: Kick Counter (/pregnancy/kicks), ANC Log (/anc), Birth Plan (/pregnancy/birth-plan)
 * - Fetal kick counter status preview widget
 * - Free hospital emergency helpline strip (0800 720 000)
 * - 48x48px minimum touch targets on all interactive elements
 * - ZERO Unicode emojis: Custom SVG line art and Lucide vector icons exclusively
 * - Bilingual English & Kiswahili support via `lang` prop ('en' | 'sw')
 */

export function SCR07PregnancyDashboard({
  motherName = 'Faith',
  week = 28,
  trimester = 3,
  daysRemaining = 84,
  sizeAnalogy = 'Eggplant (Garden Egg / Brinjal)',
  sizeAnalogySw = 'Biringanya',
  lengthCm = 37.6,
  weightGrams = 1000,
  adviceSnippet = 'Baby can now open their eyes, detect light changes, and practice gentle breathing movements.',
  adviceSnippetSw = 'Mtoto anaweza kufungua macho, kutambua mabadiliko ya mwanga, na kufanya mazoezi ya kupumua.',
  todayKicksCount = 10,
  lastKickTime = '10:15 AM',
  lastKickTimeSw = 'Saa 4:15 Asubuhi',
  onNavigate,
  onEmergencyCall,
  lang = 'en',
  className = '',
}) {
  const isSw = lang === 'sw';

  const handleAction = (route) => {
    if (typeof onNavigate === 'function') {
      onNavigate(route);
    }
  };

  return (
    <div
      data-testid="scr07-pregnancy-dashboard"
      className={`w-full flex flex-col gap-5 px-4 pt-3 pb-8 text-left ${className}`}
    >
      {/* 1. Header & Greeting */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h1 className="text-xl md:text-2xl font-bold font-serif text-[#1A202C] tracking-tight">
            {isSw ? `Habari, Mama ${motherName}` : `Good morning, ${motherName}`}
          </h1>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#E6F4F1] text-[#006B5F] border border-[#BCE1DB]">
            <Sparkles className="w-3.5 h-3.5 text-[#006B5F]" aria-hidden="true" />
            <span>{isSw ? `Wiki ${week} • Trimester ${trimester}` : `Week ${week} • Trimester ${trimester}`}</span>
          </span>
        </div>
        <p className="text-xs text-[#718096] font-medium">
          {isSw
            ? 'Fuatilia makuzi ya mtoto wako na tarehe za kliniki'
            : 'Track your baby’s growth, fetal movement, and upcoming clinic visits'}
        </p>
      </div>

      {/* 2. Pregnancy Milestone Hero Card */}
      <PregnancyMilestoneHero
        week={week}
        trimester={trimester}
        daysRemaining={daysRemaining}
        sizeAnalogy={sizeAnalogy}
        sizeAnalogySw={sizeAnalogySw}
        lengthCm={lengthCm}
        weightGrams={weightGrams}
        adviceSnippet={adviceSnippet}
        adviceSnippetSw={adviceSnippetSw}
        actionLabel={isSw ? 'Soma Makuzi Kamili ya Wiki 28 →' : 'Read Full Week 28 Guide →'}
        actionLabelSw="Soma Makuzi Kamili ya Wiki 28 →"
        onReadGuide={() => handleAction('/pregnancy/detail')}
        lang={lang}
      />

      {/* 3. Upcoming Clinic Appointment Banner */}
      <AppointmentBanner
        category="Next ANC Clinic Visit"
        categorySw="Kliniki ya Ujauzito Inayofuata"
        title="ANC Contact 3 — Ruiru Sub-County Hospital"
        titleSw="Kliniki ya Ujauzito (ANC Contact 3) — Ruiru Sub-County Hospital"
        date="Thursday, 15 Nov at 9:00 AM"
        dateSw="Alhamisi, 15 Nov saa 3:00 Asubuhi"
        countdown="In 4 Days"
        countdownSw="Zimebaki Siku 4"
        actionLabel="View Clinic Checklist"
        actionLabelSw="Tazama Maandalizi ya Kliniki"
        onAction={() => handleAction('/anc')}
        lang={lang}
      />

      {/* 4. Danger Sign Alert Banner */}
      <DangerSignAlertBanner
        title="Daily Danger Signs Check"
        titleSw="Ukaguzi wa Dalili za Hatari"
        description="If you experience severe headache, vaginal bleeding, reduced fetal movement, or high fever, seek immediate hospital care."
        descriptionSw="Ukipata maumivu makali ya kichwa, kutokwa na damu, kupungua kwa mateke ya mtoto, au homa kali, nenda hospitali mara moja."
        actionLabel="Emergency Triage & SOS"
        actionLabelSw="Mwongozo wa Dharura & SOS"
        phoneLabel="Call Emergency (1190)"
        phoneLabelSw="Piga Simu ya Dharura (1190)"
        emergencyPhone="1190"
        onAction={() => handleAction('/emergency')}
        onEmergencyCall={onEmergencyCall}
        lang={lang}
      />

      {/* 5. Quick Action Tools Row */}
      <div className="flex flex-col gap-2.5">
        <h2 className="text-sm font-bold font-serif text-[#1A202C] uppercase tracking-wider">
          {isSw ? 'Zana za Haraka' : 'Quick Health Tools'}
        </h2>

        <div className="flex flex-col gap-2">
          {/* Kick Counter Card */}
          <QuickActionCard
            icon={Activity}
            iconVariant="teal"
            title="Fetal Kick Counter"
            titleSw="Hesabu Mateke ya Mtoto"
            description="Track 10 kicks in 2 hours for reassurance"
            descriptionSw="Hesabu mateke 10 ndani ya masaa 2 kwa uhakika"
            badge={isSw ? 'Imekamilika Leo' : 'Completed Today'}
            badgeVariant="healthy"
            onClick={() => handleAction('/pregnancy/kicks')}
            lang={lang}
          />

          {/* ANC Log Card */}
          <QuickActionCard
            icon={Calendar}
            iconVariant="amber"
            title="ANC Visit Log"
            titleSw="Kumbukumbu ya Kliniki ya ANC"
            description="8-contact MoH schedule, blood pressure, and tests"
            descriptionSw="Ratiba ya ziara 8 za MoH, shinikizo la damu, na vipimo"
            onClick={() => handleAction('/anc')}
            lang={lang}
          />

          {/* Birth Plan Card */}
          <QuickActionCard
            icon={FileCheck}
            iconVariant="green"
            title="Birth Preparedness Plan"
            titleSw="Mpango wa Kujifungua Salama"
            description="Delivery facility, emergency transport, hospital bag"
            descriptionSw="Kituo cha uzazi, usafiri wa dharura, na begi la hospitali"
            badge={isSw ? 'Tayari 75%' : '75% Ready'}
            badgeVariant="info"
            onClick={() => handleAction('/pregnancy/birth-plan')}
            lang={lang}
          />
        </div>
      </div>

      {/* 6. Fetal Kick Counter Status Preview Widget */}
      <section
        aria-label={isSw ? 'Hali ya Mateke ya Mtoto' : 'Fetal Kick Tracker Status'}
        className="w-full rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0] p-4 md:p-5 shadow-xs flex flex-col gap-3"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#E6F4F1] flex items-center justify-center text-[#006B5F] shrink-0">
              <Heart className="w-4 h-4" aria-hidden="true" />
            </div>
            <h3 className="font-bold text-sm text-[#1A202C]">
              {isSw ? 'Mchezo wa Mtoto (Kick Counter)' : 'Fetal Kick Counter'}
            </h3>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]">
            {isSw ? 'Hali Nzuri' : 'Healthy'}
          </span>
        </div>

        <p className="text-xs text-[#4A5568] leading-relaxed">
          {isSw
            ? `Leo: Mateke ${todayKicksCount} yamehesabiwa saa ${lastKickTimeSw} (Hali ya mchezo ni nzuri).`
            : `Today: ${todayKicksCount} kicks recorded by ${lastKickTime} (Fetal movement is normal and reassuring).`}
        </p>

        <PillButton
          variant="outline"
          onClick={() => handleAction('/pregnancy/kicks')}
          aria-label={isSw ? 'Rekodi Mateke ya Mtoto Sasa' : 'Log Kicks Now'}
          className="w-full min-h-[48px] justify-center text-xs font-bold text-[#006B5F] border-[#006B5F] hover:bg-[#E6F4F1]"
        >
          <Activity className="w-4 h-4 mr-1 text-[#006B5F]" aria-hidden="true" />
          <span>{isSw ? 'Rekodi Mateke Sasa' : 'Log Kicks Now'}</span>
        </PillButton>
      </section>

      {/* 7. Persistent Emergency Helpline Footer Strip */}
      <aside
        role="complementary"
        aria-label={isSw ? 'Nambari ya Dharura' : 'Emergency Helpline'}
        className="w-full rounded-xl bg-[#004D44] text-[#FFFFFF] px-4 py-3 flex items-center justify-between gap-3 shadow-xs"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center shrink-0">
            <Phone className="w-4 h-4 text-white" aria-hidden="true" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-semibold text-white/80 leading-tight">
              {isSw ? 'Dharura ya Hospitali (Bila Malipo):' : 'Hospital Emergency Helpline (Toll-Free):'}
            </span>
            <span className="font-mono font-bold text-xs text-[#FEF3C7] tracking-wider truncate">
              0800 720 000
            </span>
          </div>
        </div>

        <a
          href="tel:0800720000"
          className="min-h-[48px] px-3.5 flex items-center justify-center rounded-lg bg-[#FEF3C7] text-[#1A202C] font-bold text-xs shrink-0 hover:bg-[#FDE68A] active:scale-95 transition-all shadow-2xs select-none"
        >
          {isSw ? 'Piga Simu' : 'Call Free'}
        </a>
      </aside>
    </div>
  );
}

export default SCR07PregnancyDashboard;
