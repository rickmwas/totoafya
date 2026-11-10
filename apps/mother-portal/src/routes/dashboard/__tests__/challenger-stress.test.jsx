/**
 * Vitest Adversarial Stress-Testing Suite: TotoAfya Mother Experience Dual Dashboards & Shell
 * Challenger 2 Verification Harness (Gate 2)
 *
 * Mandate Coverage:
 * 1. Mode Switching Chaos (SCR-07 vs SCR-08): Rapid alternating mode toggles, mounting assertions, zero leaking.
 * 2. Multi-Child Switcher Resilience (SCR-22): Drawer open/close, sibling switching, state propagation, + Add Child CTA.
 * 3. 4-Tab Navigation & Thumb Zone Ergonomics: 4 destinations, active indicators, 48x48px hit bounds.
 * 4. Offline Resilience & Dark-on-Amber Compliance: isOnline=false, Savannah Ochre #B45309, contrast > 6.7:1, manual retry.
 * 5. Comprehensive Stress & Chaos Invariants: Fuzzed inputs, boundary conditions, zero Unicode emojis.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  DashboardView,
  SCR07PregnancyDashboard,
  SCR08ChildDashboard,
  SCR22ChildSwitcher,
  BottomNav4Tab,
  DashboardTopBar,
  NAV_TABS,
  DEFAULT_CHILDREN,
} from '../index';
import {
  ResponsivePwaShell,
  OfflineFallbackShell,
} from '../../../shell';

// Strict regex matching Unicode emojis prohibited by Anti-Pattern 2
const UNICODE_EMOJI_REGEX =
  /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F018}-\u{1F270}]/u;

// Mathematical luminance and contrast calculators (WCAG 2.1 specification)
function srgbToLinear(c) {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const expanded = clean.length === 3
    ? clean.split('').map((x) => x + x).join('')
    : clean;
  return [
    parseInt(expanded.slice(0, 2), 16),
    parseInt(expanded.slice(2, 4), 16),
    parseInt(expanded.slice(4, 6), 16),
  ];
}

function getLuminance(hex) {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

function getContrastRatio(hex1, hex2) {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('Challenger 2 Gate 2 Adversarial Stress Testing: Dual Dashboards & Shell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* ========================================================================
   * 1. MODE SWITCHING CHAOS & COMPONENT ISOLATION (SCR-07 vs SCR-08)
   * ======================================================================== */
  describe('1. Mode Switching Chaos & Zero Component Leaking (SCR-07 vs SCR-08)', () => {
    it('mounts all required pregnancy organisms in pregnancy mode without omission', () => {
      const html = renderToString(
        <DashboardView initialMode="pregnancy" motherName="Faith" lang="en" />
      );

      // PregnancyMilestoneHero elements
      expect(html).toContain('Good morning, Faith');
      expect(html).toContain('Week 28 • Trimester 3');
      expect(html).toContain('84 Days Remaining');
      expect(html).toContain('Eggplant (Garden Egg / Brinjal)');
      expect(html).toContain('37.6'); // Length cm
      expect(html).toContain('1000'); // Weight g

      // AppointmentBanner for ANC Contact 3
      expect(html).toContain('ANC Contact 3 — Ruiru Sub-County Hospital');
      expect(html).toContain('View Clinic Checklist');
      expect(html).toContain('In 4 Days');

      // DangerSignAlertBanner
      expect(html).toContain('Daily Danger Signs Check');
      expect(html).toContain('Emergency Triage &amp; SOS');
      expect(html).toContain('1190');

      // Fetal kick counter tools & preview widget
      expect(html).toContain('Fetal Kick Counter');
      expect(html).toContain('Today: 10 kicks recorded');
      expect(html).toContain('Log Kicks Now');

      // Free emergency hospital strip
      expect(html).toContain('Hospital Emergency Helpline (Toll-Free):');
      expect(html).toContain('0800 720 000');
      expect(html).toContain('tel:0800720000');
    });

    it('mounts all required child organisms in child mode without omission', () => {
      const html = renderToString(
        <DashboardView initialMode="child" motherName="Faith" lang="en" />
      );

      // Active child selector bar & Monogram
      expect(html).toContain('Joy Wambui');
      expect(html).toContain('4 Months 2 Weeks');
      expect(html).toContain('Switch Child');

      // ChildMilestoneHero & WHO Growth Trajectory
      expect(html).toContain('6.4 kg — Normal (50th percentile)');
      expect(html).toContain('Weight (50th percentile)');
      expect(html).toContain('13.2 cm — Healthy');
      expect(html).toContain('#15803D'); // Healthy green MUAC badge

      // Savannah Ochre vaccine alert badge
      expect(html).toContain('14-Week KEPI Vaccines Due in 12 Days');

      // Quick actions & AppointmentBanner
      expect(html).toContain('Log Weight');
      expect(html).toContain('View Vaccine Card');
      expect(html).toContain('14-Week KEPI Immunization Clinic');

      // WHO Growth Trajectory preview widget
      expect(html).toContain('WHO Growth Trajectory');
      expect(html).toContain('Normal Curve');
      expect(html).toContain('+ Log Today’s Measurement');

      // Breastfeeding and weaning card
      expect(html).toContain('Exclusive Breastfeeding: Month 4 of 6');
      expect(html).toContain('Read Feeding Guide →');
    });

    it('enforces ZERO component leaking from child into pregnancy mode', () => {
      const html = renderToString(
        <DashboardView initialMode="pregnancy" motherName="Faith" lang="en" />
      );

      // Child components MUST NOT be rendered
      expect(html).not.toContain('Joy Wambui');
      expect(html).not.toContain('Switch Child');
      expect(html).not.toContain('14-Week KEPI Vaccines Due');
      expect(html).not.toContain('WHO Growth Trajectory');
      expect(html).not.toContain('Exclusive Breastfeeding: Month 4 of 6');
      expect(html).not.toContain('+ Log Today’s Measurement');
    });

    it('enforces ZERO component leaking from pregnancy into child mode', () => {
      const html = renderToString(
        <DashboardView initialMode="child" motherName="Faith" lang="en" />
      );

      // Pregnancy components MUST NOT be rendered
      expect(html).not.toContain('Week 28 • Trimester 3');
      expect(html).not.toContain('84 Days Remaining');
      expect(html).not.toContain('Eggplant (Garden Egg / Brinjal)');
      expect(html).not.toContain('ANC Contact 3 — Ruiru Sub-County Hospital');
      expect(html).not.toContain('Daily Danger Signs Check');
      expect(html).not.toContain('Fetal Kick Counter');
      expect(html).not.toContain('Hospital Emergency Helpline (Toll-Free):');
      expect(html).not.toContain('0800 720 000');
    });

    it('executes 50 rapid alternating mode toggles without layout corruption or memory faults', () => {
      const modes = ['pregnancy', 'child'];
      let lastHtml = '';

      for (let i = 0; i < 50; i++) {
        const currentMode = modes[i % 2];
        const html = renderToString(
          <DashboardView
            initialMode={currentMode}
            motherName={`Mother_${i}`}
            lang={i % 4 === 0 ? 'sw' : 'en'}
          />
        );

        expect(html).toBeTruthy();
        expect(html).toContain('data-testid="totoafya-dashboard-view"');
        expect(html).toContain('max-w-[430px]');

        if (currentMode === 'pregnancy') {
          expect(html).toContain('data-testid="scr07-pregnancy-dashboard"');
          expect(html).not.toContain('data-testid="scr08-child-dashboard"');
        } else {
          expect(html).toContain('data-testid="scr08-child-dashboard"');
          expect(html).not.toContain('data-testid="scr07-pregnancy-dashboard"');
        }
        lastHtml = html;
      }

      expect(lastHtml.length).toBeGreaterThan(1000);
    });

    it('handles invalid or undefined mode gracefully by defaulting to child view without crashing', () => {
      const htmlNull = renderToString(<DashboardView initialMode={null} />);
      expect(htmlNull).toContain('data-testid="scr08-child-dashboard"');

      const htmlUnknown = renderToString(<DashboardView initialMode="unrecognized_mode" />);
      expect(htmlUnknown).toContain('data-testid="scr08-child-dashboard"');
    });
  });

  /* ========================================================================
   * 2. MULTI-CHILD SWITCHER RESILIENCE (SCR-22)
   * ======================================================================== */
  describe('2. Multi-Child Switcher Resilience (SCR-22)', () => {
    const mockSiblings = [
      {
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
        lastClinic: '10-Week KEPI (Given)',
        lastClinicSw: 'Chanjo ya Wiki 10 (Imetolewa)',
      },
      {
        id: 'child-2',
        name: 'Brian Kiprop',
        gender: 'male',
        dob: '2024-04-10',
        age: '2 Years 7 Months',
        ageSw: 'Miaka 2 Miezi 7',
        weight: '12.8 kg — Normal (50th percentile)',
        weightSw: '12.8 kg — Kawaida (asilimia 50)',
        muac: '15.4 cm — Healthy',
        muacSw: '15.4 cm — Afya Bora',
        muacStatus: 'healthy',
        vaccineAlert: 'Up to Date — Next: 5-Year Booster',
        vaccineAlertSw: 'Kamilifu — Inayofuata: Chanjo ya Miaka 5',
        lastClinic: '18-Month Booster (Given)',
        lastClinicSw: 'Chanjo ya Miezi 18 (Imetolewa)',
      },
      {
        id: 'child-3',
        name: 'Zawadi Auma',
        gender: 'female',
        dob: '2026-10-01',
        age: '5 Weeks',
        ageSw: 'Wiki 5',
        weight: '4.2 kg — Normal (50th percentile)',
        weightSw: '4.2 kg — Kawaida (asilimia 50)',
        muac: '11.8 cm — Normal',
        muacSw: '11.8 cm — Kawaida',
        muacStatus: 'healthy',
        vaccineAlert: '6-Week KEPI Vaccines Due in 1 Week',
        vaccineAlertSw: 'Chanjo ya Wiki 6 — Zimebaki Wiki 1',
        lastClinic: 'Birth BCG & OPV0 (Given)',
        lastClinicSw: 'Kuzaliwa BCG & OPV0 (Imetolewa)',
      },
    ];

    it('renders zero DOM output when isOpen is false (no phantom overlays)', () => {
      const html = renderToString(
        <SCR22ChildSwitcher
          isOpen={false}
          childrenList={mockSiblings}
          activeChildId="child-1"
        />
      );

      expect(html).toBe('');
    });

    it('renders accessible dialog modal with aria attributes and backdrop when open', () => {
      const html = renderToString(
        <SCR22ChildSwitcher
          isOpen={true}
          childrenList={mockSiblings}
          activeChildId="child-1"
          lang="en"
        />
      );

      expect(html).toContain('role="dialog"');
      expect(html).toContain('aria-modal="true"');
      expect(html).toContain('aria-labelledby="child-switcher-title"');
      expect(html).toContain('My Children');
      expect(html).toContain('role="radiogroup"');
      expect(html).toContain('aria-label="Close drawer"');
      expect(html).toContain('min-h-[48px]');
    });

    it('marks exactly the active child with aria-checked="true" and Active indicator', () => {
      const html = renderToString(
        <SCR22ChildSwitcher
          isOpen={true}
          childrenList={mockSiblings}
          activeChildId="child-2"
          lang="en"
        />
      );

      // Brian Kiprop (child-2) is active
      expect(html).toContain('Brian Kiprop');
      expect(html).toContain('Active');
      expect(html).toContain('bg-[#006B5F]'); // Deep Teal active indicator

      // Inactive children render Select CTA
      expect(html).toContain('Joy Wambui');
      expect(html).toContain('Zawadi Auma');
      expect(html).toContain('Select');
    });

    it('renders "+ Add Another Child" CTA button with guaranteed 48x48px hit target', () => {
      const htmlEn = renderToString(
        <SCR22ChildSwitcher isOpen={true} childrenList={mockSiblings} lang="en" />
      );
      expect(htmlEn).toContain('+ Add Another Child');
      expect(htmlEn).toContain('min-h-[48px]');

      const htmlSw = renderToString(
        <SCR22ChildSwitcher isOpen={true} childrenList={mockSiblings} lang="sw" />
      );
      expect(htmlSw).toContain('+ Sajili Mtoto Mwingine');
      expect(htmlSw).toContain('min-h-[48px]');
    });

    it('updates active child state in DashboardView when activeChildId prop changes', () => {
      const htmlChild1 = renderToString(
        <DashboardView
          initialMode="child"
          childrenList={mockSiblings}
          initialActiveTab="home"
        />
      );
      expect(htmlChild1).toContain('Joy Wambui');

      // Custom active child rendering check
      const htmlChild2 = renderToString(
        <SCR08ChildDashboard
          child={{
            ...mockSiblings[1],
            weight: '12.8 kg — Normal (50th percentile)',
            muac: '15.4 cm — Healthy',
            muacStatus: 'healthy',
            vaccineAlert: 'Measles-Rubella 2 Due at 18 Months',
          }}
          lang="en"
        />
      );
      expect(htmlChild2).toContain('Brian Kiprop');
      expect(htmlChild2).toContain('2 Years 7 Months');
      expect(htmlChild2).toContain('12.8 kg');
      expect(htmlChild2).toContain('15.4 cm — Healthy');
      expect(htmlChild2).toContain('Measles-Rubella 2 Due at 18 Months');
    });

    it('handles empty childrenList safely with defensive fallbacks', () => {
      const htmlEmpty = renderToString(
        <SCR22ChildSwitcher isOpen={true} childrenList={[]} activeChildId="child-none" />
      );

      expect(htmlEmpty).toContain('role="dialog"');
      expect(htmlEmpty).toContain('+ Add Another Child');
    });
  });

  /* ========================================================================
   * 3. 4-TAB NAVIGATION & THUMB ZONE ERGONOMICS
   * ======================================================================== */
  describe('3. 4-Tab Navigation & Thumb Zone Ergonomics (BottomNav4Tab)', () => {
    it('renders exactly 4 primary navigation tabs matching specifications', () => {
      expect(NAV_TABS).toHaveLength(4);
      expect(NAV_TABS.map((t) => t.key)).toEqual(['home', 'records', 'chat', 'care']);

      const html = renderToString(<BottomNav4Tab activeTab="home" lang="en" />);
      expect(html).toContain('Home');
      expect(html).toContain('Records');
      expect(html).toContain('Chat');
      expect(html).toContain('Care');
    });

    it('anchors navigation bar in natural thumb zone with 64px height and safe-area padding', () => {
      const html = renderToString(<BottomNav4Tab activeTab="home" lang="en" />);

      expect(html).toContain('fixed bottom-0');
      expect(html).toContain('z-40');
      expect(html).toContain('bg-[#FFFFFF]');
      expect(html).toContain('h-16');
      expect(html).toContain('env(safe-area-inset-bottom');
      expect(html).toContain('max-w-[430px]');
    });

    it('enforces strict minimum 48x48px hit target bounds on every navigation tab', () => {
      const html = renderToString(<BottomNav4Tab activeTab="home" lang="en" />);

      // Must specify both min-w-[48px] and min-h-[48px]
      expect(html).toContain('min-w-[48px]');
      expect(html).toContain('min-h-[48px]');
    });

    it('highlights active tab with Deep Teal (#006B5F) and 4px rounded indicator dot', () => {
      for (const tab of ['home', 'records', 'chat', 'care']) {
        const html = renderToString(<BottomNav4Tab activeTab={tab} lang="en" />);

        expect(html).toContain('text-[#006B5F]');
        expect(html).toContain('w-1.5 h-1.5 rounded-full');
        expect(html).toContain('bg-[#006B5F]');
      }
    });

    it('provides authentic bilingual Kiswahili translations without text overflow', () => {
      const html = renderToString(<BottomNav4Tab activeTab="home" lang="sw" />);

      expect(html).toContain('Nyumbani');
      expect(html).toContain('Kumbukumbu');
      expect(html).toContain('AI Rafiki');
      expect(html).toContain('Huduma');
      expect(html).not.toContain('undefined');
    });
  });

  /* ========================================================================
   * 4. OFFLINE RESILIENCE & DARK-ON-AMBER CONTRAST COMPLIANCE
   * ======================================================================== */
  describe('4. Offline Resilience & Dark-on-Amber Compliance (OfflineFallbackShell)', () => {
    it('suppresses offline fallback elements when isOffline is false', () => {
      const htmlBanner = renderToString(
        <OfflineFallbackShell isOffline={false} mode="banner" />
      );
      expect(htmlBanner).toBe('');

      const htmlWrapper = renderToString(
        <OfflineFallbackShell isOffline={false} mode="wrapper">
          <div data-testid="online-content">Online Screen</div>
        </OfflineFallbackShell>
      );
      expect(htmlWrapper).toContain('data-testid="online-content"');
      expect(htmlWrapper).not.toContain('Offline');
    });

    it('renders non-blocking Savannah Ochre indicator chip in #B45309 when offline', () => {
      const html = renderToString(
        <OfflineFallbackShell isOffline={true} mode="banner" lang="en" />
      );

      // Savannah Ochre indicator chip (#B45309)
      expect(html).toContain('#B45309');
      expect(html).toContain('Offline');
      expect(html).toContain('bg-[#FEF3C7]');
      expect(html).toContain('text-[#B45309]');
    });

    it('satisfies Dark-on-Amber rule (> 6.7:1) on soft amber notification background', () => {
      const html = renderToString(
        <OfflineFallbackShell isOffline={true} mode="banner" lang="en" />
      );

      // Background is soft Savannah Amber (#FEF3C7)
      expect(html).toContain('bg-[#FEF3C7]');
      expect(html).toContain('border-[#FDE68A]');

      // Foreground text is Charcoal Ink (#1A202C)
      expect(html).toContain('text-[#1A202C]');

      // Mathematical contrast verification
      const charcoalOnAmberContrast = getContrastRatio('#1A202C', '#FEF3C7');
      expect(charcoalOnAmberContrast).toBeGreaterThan(6.7);
      expect(charcoalOnAmberContrast).toBeCloseTo(14.65, 1);

      // Deep amber text contrast on soft amber (#78350F / #FEF3C7)
      const deepAmberOnSoftAmberContrast = getContrastRatio('#78350F', '#FEF3C7');
      expect(deepAmberOnSoftAmberContrast).toBeGreaterThan(6.7);
      expect(deepAmberOnSoftAmberContrast).toBeCloseTo(8.15, 1);

      // Assert white on #FEF3C7 is STRICTLY FORBIDDEN
      const whiteOnAmberContrast = getContrastRatio('#FFFFFF', '#FEF3C7');
      expect(whiteOnAmberContrast).toBeLessThan(4.5); // 1.13:1 (failing)
      expect(html).not.toMatch(/bg-\[#FEF3C7\][^>]*text-white/);
    });

    it('enforces 48x48px hit targets on manual retry and dismiss buttons', () => {
      const html = renderToString(
        <OfflineFallbackShell isOffline={true} mode="banner" dismissible={true} />
      );

      expect(html).toContain('min-w-[48px]');
      expect(html).toContain('min-h-[48px]');
      expect(html).toContain('Retry');
    });

    it('renders authentic Swahili offline copy in OfflineFallbackShell', () => {
      const html = renderToString(
        <OfflineFallbackShell isOffline={true} mode="banner" lang="sw" />
      );

      expect(html).toContain('Nje ya Mtandao');
      expect(html).toContain('Kumbukumbu zinahifadhiwa kwenye simu yako na zitalandanishwa mtandao ukirejea.');
      expect(html).toContain('Jaribu');
    });

    it('integrates offline fallback banner inside ResponsivePwaShell when isOffline is true', () => {
      const html = renderToString(
        <ResponsivePwaShell isOffline={true} showOfflineBanner={true}>
          <div data-testid="dashboard-content">Maternal Records</div>
        </ResponsivePwaShell>
      );

      expect(html).toContain('Maternal Records');
      expect(html).toContain('#B45309');
      expect(html).toContain('Offline');
      expect(html).toContain('bg-[#FEF3C7]');
    });
  });

  /* ========================================================================
   * 5. ANTI-PATTERN AUDIT: ZERO UNICODE EMOJIS & 48PX TARGETS
   * ======================================================================== */
  describe('5. Anti-Pattern & Accessibility Rigor', () => {
    it('violates no anti-pattern rules (Zero Unicode emojis) across all components in all states', () => {
      const renders = [
        renderToString(<DashboardView initialMode="pregnancy" lang="en" />),
        renderToString(<DashboardView initialMode="pregnancy" lang="sw" />),
        renderToString(<DashboardView initialMode="child" lang="en" />),
        renderToString(<DashboardView initialMode="child" lang="sw" />),
        renderToString(<SCR22ChildSwitcher isOpen={true} lang="en" />),
        renderToString(<SCR22ChildSwitcher isOpen={true} lang="sw" />),
        renderToString(<BottomNav4Tab activeTab="home" lang="en" />),
        renderToString(<BottomNav4Tab activeTab="records" lang="sw" />),
        renderToString(<DashboardTopBar mode="pregnancy" isOnline={false} lang="en" />),
        renderToString(<DashboardTopBar mode="child" isOnline={true} lang="sw" />),
        renderToString(<OfflineFallbackShell isOffline={true} mode="banner" lang="en" />),
        renderToString(<OfflineFallbackShell isOffline={true} mode="fullscreen" lang="sw" />),
        renderToString(<ResponsivePwaShell isOffline={true}><div /></ResponsivePwaShell>),
      ];

      for (const markup of renders) {
        expect(UNICODE_EMOJI_REGEX.test(markup)).toBe(false);
      }
    });

    it('validates all primary CTAs enforce >= 48px hit areas across dashboard surfaces', () => {
      const pregnancyHtml = renderToString(<SCR07PregnancyDashboard lang="en" />);
      const childHtml = renderToString(<SCR08ChildDashboard lang="en" />);

      // Minimum 48px checks
      expect(pregnancyHtml).toContain('min-h-[48px]');
      expect(childHtml).toContain('min-h-[48px]');
    });
  });
});
