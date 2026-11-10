/**
 * TotoAfya Mother Experience — Core Shared Atomic & Molecular UI Component Test Suite
 * Task Directive TD-1.4: Core Shared Atomic Components per "The Sunlit Botanical Editorial"
 *
 * Verifies:
 * 1. PillButton: variants, contrast compliance, 48x48px hit target, active spring scale, loading spinner, Swahili clearance.
 * 2. StatusBadge: semantic statuses, dignified Savannah Ochre for Overdue, zero punitive red, dark text on amber.
 * 3. ModeSwitcherPill: dual-mode toggle, active white pill with Deep Teal, 48px hit target, zero Unicode emojis.
 * 4. TextInput: accessible labels, 48px touch height, clear error states, helper text, leading icon.
 * 5. AppointmentBanner: summary card, facility name, date, countdown badge, 48px action button.
 * 6. DangerSignAlertBanner: red border, immediate dialer trigger, prominent danger signs, role="alert".
 * 7. MUACIndicator: SAM / MAM / Normal thresholds, pointer positioning, StatusBadge integration.
 * 8. Anti-pattern guardrails: ZERO Unicode emojis, ZERO white text on Amber.
 */

import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  PillButton,
  StatusBadge,
  ModeSwitcherPill,
  TextInput,
  AppointmentBanner,
  DangerSignAlertBanner,
  MUACIndicator,
} from '../index';

describe('Atomic UI Primitives: PillButton', () => {
  it('renders primary variant with Deep Teal (#006B5F) and white text', () => {
    const html = renderToString(
      <PillButton variant="primary">Kamilisha Usajili</PillButton>
    );
    expect(html).toContain('bg-[#006B5F]');
    expect(html).toContain('text-[#FFFFFF]');
    expect(html).toContain('rounded-full');
    expect(html).toContain('Kamilisha Usajili');
  });

  it('renders secondary variant with Savannah Amber (#E68A00) and Charcoal Ink text (#1A202C)', () => {
    const html = renderToString(
      <PillButton variant="secondary">Tazama Ratiba</PillButton>
    );
    // Strict contrast compliance: Charcoal text on Savannah Amber
    expect(html).toContain('bg-[#E68A00]');
    expect(html).toContain('text-[#1A202C]');
    // Never white text on amber
    expect(html).not.toMatch(/bg-\[#E68A00\][^>]*text-white/);
    expect(html).not.toMatch(/bg-\[#E68A00\][^>]*text-\[#FFFFFF\]/);
  });

  it('renders outline variant with transparent background and Deep Teal border', () => {
    const html = renderToString(
      <PillButton variant="outline">Angalia Maelezo</PillButton>
    );
    expect(html).toContain('border-[#006B5F]');
    expect(html).toContain('text-[#006B5F]');
    expect(html).toContain('bg-transparent');
  });

  it('renders danger variant with Urgent Red (#DC2626) and white text', () => {
    const html = renderToString(
      <PillButton variant="danger">Piga Simu ya Dharura</PillButton>
    );
    expect(html).toContain('bg-[#DC2626]');
    expect(html).toContain('text-[#FFFFFF]');
  });

  it('enforces guaranteed minimum 48x48px hit target across sizes', () => {
    const smHtml = renderToString(<PillButton size="sm">Small</PillButton>);
    const mdHtml = renderToString(<PillButton size="md">Medium</PillButton>);
    const lgHtml = renderToString(<PillButton size="lg">Large</PillButton>);
    const iconHtml = renderToString(<PillButton size="icon" aria-label="Action" />);

    expect(smHtml).toContain('min-h-[48px]');
    expect(smHtml).toContain('min-w-[48px]');
    expect(mdHtml).toContain('min-h-[48px]');
    expect(mdHtml).toContain('min-w-[48px]');
    expect(lgHtml).toContain('min-h-[54px]');
    expect(lgHtml).toContain('min-w-[48px]');
    expect(iconHtml).toContain('min-h-[48px]');
    expect(iconHtml).toContain('min-w-[48px]');
  });

  it('enforces active spring scale for tactile mobile physics', () => {
    const html = renderToString(<PillButton>Touch Target</PillButton>);
    expect(html).toContain('active:scale-[0.98]');
  });

  it('renders loading spinner and sets aria-busy="true"', () => {
    const html = renderToString(
      <PillButton loading loadingText="Inapakia...">Hifadhi</PillButton>
    );
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('disabled=""');
    expect(html).toContain('animate-spin');
    expect(html).toContain('Inapakia...');
  });

  it('incorporates generous padding for Swahili text expansion clearance (+25%)', () => {
    const html = renderToString(
      <PillButton size="md">Thibitisha Maandalizi ya Kujifungua</PillButton>
    );
    expect(html).toContain('px-6');
    expect(html).toContain('py-3');
  });
});

describe('Atomic UI Primitives: StatusBadge', () => {
  it('renders completed status in Forest Green (#15803D) on Soft Mint (#F0FDF4)', () => {
    const html = renderToString(<StatusBadge status="completed" />);
    expect(html).toContain('bg-[#F0FDF4]');
    expect(html).toContain('text-[#15803D]');
    expect(html).toContain('border-[#A3E0BF]');
    expect(html).toContain('Completed');
  });

  it('renders upcoming status in Clinical Cobalt (#1D4ED8) on Soft Sky (#EFF6FF)', () => {
    const html = renderToString(<StatusBadge status="upcoming" />);
    expect(html).toContain('bg-[#EFF6FF]');
    expect(html).toContain('text-[#1D4ED8]');
    expect(html).toContain('border-[#BFDBFE]');
    expect(html).toContain('Upcoming');
  });

  it('renders overdue status using dignified Savannah Ochre (#B45309 on #FFFBEB), NEVER punitive red', () => {
    const htmlEn = renderToString(<StatusBadge status="overdue" lang="en" />);
    const htmlSw = renderToString(<StatusBadge status="overdue" lang="sw" />);

    // Strict Anti-Pattern 7 compliance
    expect(htmlEn).toContain('bg-[#FFFBEB]');
    expect(htmlEn).toContain('text-[#B45309]');
    expect(htmlEn).toContain('border-[#FDE68A]');
    expect(htmlEn).toContain('Catch-up Due');
    expect(htmlEn).not.toContain('bg-[#FEF2F2]');
    expect(htmlEn).not.toContain('text-[#DC2626]');

    // Swahili localization
    expect(htmlSw).toContain('Kukamilisha Huduma');
  });

  it('renders critical danger status in Soft Crimson (#FEF2F2) with Urgent Red (#DC2626) dot', () => {
    const html = renderToString(<StatusBadge status="critical" />);
    expect(html).toContain('bg-[#FEF2F2]');
    expect(html).toContain('text-[#DC2626]');
    expect(html).toContain('border-[#FCA5A5]');
    expect(html).toContain('Critical Danger');
  });

  it('supports Swahili localization seamlessly', () => {
    const html = renderToString(
      <StatusBadge status="completed" lang="sw" />
    );
    expect(html).toContain('Imekamilika');
  });
});

describe('Molecular UI Primitives: ModeSwitcherPill', () => {
  it('renders both pregnancy ("Mimba Yangu") and child ("Mtoto Wangu") modes', () => {
    const html = renderToString(
      <ModeSwitcherPill
        mode="pregnancy"
        pregnancySubtitle="Wiki 28"
        childSubtitle="Joy (4m)"
        lang="sw"
      />
    );

    expect(html).toContain('Mimba Yangu');
    expect(html).toContain('Wiki 28');
    expect(html).toContain('Mtoto Wangu');
    expect(html).toContain('Joy (4m)');
    expect(html).toContain('role="radiogroup"');
  });

  it('highlights the active mode with solid white pill and Deep Teal (#006B5F)', () => {
    const pregnancyHtml = renderToString(
      <ModeSwitcherPill mode="pregnancy" />
    );
    expect(pregnancyHtml).toContain('bg-[#FFFFFF]');
    expect(pregnancyHtml).toContain('text-[#006B5F]');
    expect(pregnancyHtml).toContain('aria-checked="true"');

    const childHtml = renderToString(
      <ModeSwitcherPill mode="child" />
    );
    expect(childHtml).toContain('bg-[#FFFFFF]');
    expect(childHtml).toContain('text-[#006B5F]');
  });

  it('guarantees minimum 48px hit target per interactive segment', () => {
    const html = renderToString(<ModeSwitcherPill mode="pregnancy" />);
    // Check that both mode buttons include min-h-[48px]
    const matches = html.match(/min-h-\[48px\]/g);
    expect(matches).not.toBeNull();
    expect(matches?.length).toBeGreaterThanOrEqual(2);
  });

  it('outlaws Unicode emojis and uses clean SVG vector icons exclusively', () => {
    const html = renderToString(<ModeSwitcherPill mode="pregnancy" />);
    // Verify no emoji codepoints
    expect(html).not.toContain('🤰');
    expect(html).not.toContain('👶');
    expect(html).not.toContain('🤱');
    // Verify SVG icons exist
    expect(html).toContain('<svg');
    expect(html).toContain('viewBox="0 0 24 24"');
  });
});

describe('Atomic UI Primitives: TextInput', () => {
  it('renders accessible label and guaranteed 48px touch height', () => {
    const html = renderToString(
      <TextInput
        label="ANC Clinic Number"
        labelSw="Nambari ya Kliniki ya ANC"
        placeholder="e.g. ANC-2026-089"
        required
      />
    );
    expect(html).toContain('ANC Clinic Number');
    expect(html).toContain('(Nambari ya Kliniki ya ANC)');
    expect(html).toContain('min-h-[48px]');
    expect(html).toContain('placeholder="e.g. ANC-2026-089"');
    expect(html).toContain('*');
  });

  it('renders clear error state with role="alert" and #DC2626 border', () => {
    const html = renderToString(
      <TextInput
        label="National ID"
        error="National ID is required for clinic lookup"
        id="test-id-input"
      />
    );
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('role="alert"');
    expect(html).toContain('border-[#DC2626]');
    expect(html).toContain('National ID is required for clinic lookup');
  });

  it('renders helper text associated via aria-describedby', () => {
    const html = renderToString(
      <TextInput
        label="Phone Number"
        helperText="Used strictly for clinic visit reminders"
        id="phone-input"
      />
    );
    expect(html).toContain('aria-describedby="phone-input-helper"');
    expect(html).toContain('Used strictly for clinic visit reminders');
  });
});

describe('Molecular UI Primitives: AppointmentBanner', () => {
  it('renders upcoming ANC visit summary with date, facility name, and action button', () => {
    const html = renderToString(
      <AppointmentBanner
        title="Antenatal Care Contact 3"
        category="Upcoming Clinic Appointment"
        facility="Ruiru Sub-County Hospital"
        date="Thursday, 15 Nov at 9:00 AM"
        countdown="In 4 Days"
        actionLabel="View Checklist"
        onAction={() => {}}
      />
    );

    expect(html).toContain('Antenatal Care Contact 3');
    expect(html).toContain('Upcoming Clinic Appointment');
    expect(html).toContain('Ruiru Sub-County Hospital');
    expect(html).toContain('Thursday, 15 Nov at 9:00 AM');
    expect(html).toContain('In 4 Days');
    expect(html).toContain('View Checklist');
    expect(html).toContain('bg-[#FFFBEB]');
    expect(html).toContain('border-[#FDE68A]');
    // 48px hit target on PillButton
    expect(html).toContain('min-h-[48px]');
  });

  it('supports Swahili localization for all banner content', () => {
    const html = renderToString(
      <AppointmentBanner
        title="Uchunguzi wa Mimba — Mawasiliano ya 3"
        categorySw="Kliniki Inayofuata"
        facility="Hospitali ya Ruiru"
        dateSw="Alhamisi, 15 Nov saa 3:00 Asubuhi"
        countdownSw="Baada ya Siku 4"
        actionLabelSw="Angalia Maandalizi"
        lang="sw"
        onAction={() => {}}
      />
    );

    expect(html).toContain('Kliniki Inayofuata');
    expect(html).toContain('Hospitali ya Ruiru');
    expect(html).toContain('Alhamisi, 15 Nov saa 3:00 Asubuhi');
    expect(html).toContain('Baada ya Siku 4');
    expect(html).toContain('Angalia Maandalizi');
  });
});

describe('Molecular UI Primitives: DangerSignAlertBanner', () => {
  it('renders emergency alert banner with high-contrast red border (#DC2626)', () => {
    const html = renderToString(
      <DangerSignAlertBanner
        title="Danger Signs Alert"
        description="Severe headache or reduced fetal kicks require immediate emergency triage."
        emergencyPhone="1190"
        signs={['Severe Headache', 'Vaginal Bleeding', 'Reduced Fetal Movement']}
        onAction={() => {}}
      />
    );

    expect(html).toContain('role="alert"');
    expect(html).toContain('border-2');
    expect(html).toContain('border-[#DC2626]');
    expect(html).toContain('bg-[#FEF2F2]');
    expect(html).toContain('Severe headache or reduced fetal kicks');
    expect(html).toContain('Severe Headache');
    expect(html).toContain('Vaginal Bleeding');
    expect(html).toContain('Reduced Fetal Movement');
  });

  it('renders immediate dialer action trigger via direct tel: link with guaranteed 48px hit target', () => {
    const html = renderToString(
      <DangerSignAlertBanner
        emergencyPhone="1190"
        phoneLabel="Call Emergency (1190)"
      />
    );

    expect(html).toContain('href="tel:1190"');
    expect(html).toContain('Call Emergency (1190)');
    expect(html).toContain('min-h-[48px]');
    expect(html).toContain('bg-[#DC2626]');
  });

  it('supports Swahili localization for emergency triage', () => {
    const html = renderToString(
      <DangerSignAlertBanner
        lang="sw"
        signsSw={['Maumivu Makali ya Kichwa', 'Kutokwa na Damu']}
        emergencyPhone="1190"
      />
    );

    expect(html).toContain('Ukaguzi wa Dalili za Hatari');
    expect(html).toContain('Maumivu Makali ya Kichwa');
    expect(html).toContain('Kutokwa na Damu');
    expect(html).toContain('Piga Simu ya Dharura (1190)');
  });
});

describe('Molecular UI Primitives: MUACIndicator', () => {
  it('classifies healthy nutrition (>= 12.5 cm) with green status badge', () => {
    const html = renderToString(<MUACIndicator value={13.2} />);
    expect(html).toContain('13.2');
    expect(html).toContain('cm');
    expect(html).toContain('Healthy');
    expect(html).toContain('bg-[#F0FDF4]');
  });

  it('classifies MAM (11.5 - 12.4 cm) with amber status badge', () => {
    const html = renderToString(<MUACIndicator value={12.0} />);
    expect(html).toContain('12.0');
    expect(html).toContain('MAM');
    expect(html).toContain('bg-[#FFFBEB]');
  });

  it('classifies SAM (< 11.5 cm) with red urgent status badge', () => {
    const html = renderToString(<MUACIndicator value={10.8} />);
    expect(html).toContain('10.8');
    expect(html).toContain('SAM');
    expect(html).toContain('bg-[#FEF2F2]');
  });
});

describe('Anti-Pattern Integrity Checks Across All Primitives', () => {
  it('strictly contains ZERO Unicode emojis across all rendered components', () => {
    const samples = [
      renderToString(<PillButton>Test</PillButton>),
      renderToString(<StatusBadge status="completed" />),
      renderToString(<StatusBadge status="overdue" />),
      renderToString(<ModeSwitcherPill mode="pregnancy" />),
      renderToString(<ModeSwitcherPill mode="child" />),
      renderToString(<TextInput label="Input" placeholder="Placeholder" />),
      renderToString(<AppointmentBanner title="Visit" facility="Clinic" />),
      renderToString(<DangerSignAlertBanner />),
      renderToString(<MUACIndicator value={13.5} />),
    ];

    const prohibitedEmojis = [
      '🤰', '👶', '🤱', '🍼', '💊', '🏥', '🚨', '📅', '⚠️', '✅', '❌', '❤️', '⭐', '🔥'
    ];

    for (const sample of samples) {
      for (const emoji of prohibitedEmojis) {
        expect(sample).not.toContain(emoji);
      }
    }
  });

  it('strictly outlaws white text on Amber (#E68A00 or #FFFBEB)', () => {
    const samples = [
      renderToString(<PillButton variant="secondary">Savannah</PillButton>),
      renderToString(<StatusBadge status="overdue" />),
      renderToString(<StatusBadge status="catch_up" />),
      renderToString(<StatusBadge status="due" />),
      renderToString(<AppointmentBanner title="Visit" countdown="In 4 Days" />),
    ];

    for (const sample of samples) {
      // Must not pair amber with text-white or text-[#FFFFFF]
      expect(sample).not.toMatch(/bg-\[#E68A00\][^>]*text-white/);
      expect(sample).not.toMatch(/bg-\[#E68A00\][^>]*text-\[#FFFFFF\]/);
      expect(sample).not.toMatch(/bg-\[#FFFBEB\][^>]*text-white/);
      expect(sample).not.toMatch(/bg-\[#FFFBEB\][^>]*text-\[#FFFFFF\]/);
    }
  });
});
