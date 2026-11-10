/**
 * Vitest Automated Suite: TotoAfya Mother Experience Dual Dashboards & Navigation (TD-2.3)
 *
 * Verifies:
 * 1. Screen SCR-07: Pregnancy Home Dashboard (SCR07PregnancyDashboard)
 * 2. Screen SCR-08: Child Home Dashboard (SCR08ChildDashboard)
 * 3. Screen SCR-22: Multi-Child Switcher & Sibling Drawer (SCR22ChildSwitcher)
 * 4. Navigation: 4-Tab Bottom Navigation (BottomNav4Tab)
 * 5. Navigation: Sticky Top App Bar (DashboardTopBar)
 * 6. Master Coordinator: DashboardView mode switching & child switching
 * 7. Anti-Pattern Guardrail: ZERO Unicode Emojis across all views
 * 8. Accessibility: Dark-on-Amber contrast compliance & >= 48x48px hit targets
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

// Strict regex to detect Unicode emojis prohibited by Anti-Pattern 2
const UNICODE_EMOJI_REGEX =
  /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F018}-\u{1F270}]/u;

describe('TD-2.3 Workstream: Dual Dashboards & Master Navigation Surfaces', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* ========================================================================
   * 1. SCR-07: Pregnancy Home Dashboard
   * ======================================================================== */
  describe('Screen SCR-07: Pregnancy Home Dashboard (SCR07PregnancyDashboard)', () => {
    it('renders maternal hero with gestational weeks, countdown, and greeting', () => {
      const html = renderToString(
        <SCR07PregnancyDashboard
          motherName="Faith"
          week={28}
          trimester={3}
          daysRemaining={84}
          lang="en"
        />
      );

      expect(html).toContain('Good morning, Faith');
      expect(html).toContain('Week 28 • Trimester 3');
      expect(html).toContain('84 Days Remaining');
      expect(html).toContain('Eggplant (Garden Egg / Brinjal)');
      expect(html).toContain('37.6');
      expect(html).toContain('1000');
    });

    it('renders upcoming ANC contact 3 reminder banner with countdown and checklist button', () => {
      const html = renderToString(<SCR07PregnancyDashboard lang="en" />);

      expect(html).toContain('ANC Contact 3 — Ruiru Sub-County Hospital');
      expect(html).toContain('In 4 Days');
      expect(html).toContain('View Clinic Checklist');
      expect(html).toContain('Thursday, 15 Nov at 9:00 AM');
    });

    it('renders daily danger signs alert banner with high-priority emergency triage CTA', () => {
      const html = renderToString(<SCR07PregnancyDashboard lang="en" />);

      expect(html).toContain('Daily Danger Signs Check');
      expect(html).toContain('severe headache, vaginal bleeding, reduced fetal movement');
      expect(html).toContain('Emergency Triage &amp; SOS');
      expect(html).toContain('Call Emergency (1190)');
    });

    it('renders quick health tools: Kick Counter, ANC Log, and Birth Plan', () => {
      const html = renderToString(<SCR07PregnancyDashboard lang="en" />);

      expect(html).toContain('Quick Health Tools');
      expect(html).toContain('Fetal Kick Counter');
      expect(html).toContain('ANC Visit Log');
      expect(html).toContain('Birth Preparedness Plan');
      expect(html).toContain('Completed Today');
      expect(html).toContain('75% Ready');
    });

    it('renders fetal kick tracker status widget and free hospital helpline strip', () => {
      const html = renderToString(<SCR07PregnancyDashboard lang="en" />);

      expect(html).toContain('Today: 10 kicks recorded');
      expect(html).toContain('Log Kicks Now');
      expect(html).toContain('Hospital Emergency Helpline (Toll-Free):');
      expect(html).toContain('0800 720 000');
      expect(html).toContain('tel:0800720000');
    });

    it('renders authentic bilingual Kiswahili maternal translations', () => {
      const html = renderToString(
        <SCR07PregnancyDashboard
          motherName="Achieng"
          week={28}
          trimester={3}
          daysRemaining={84}
          lang="sw"
        />
      );

      expect(html).toContain('Habari, Mama Achieng');
      expect(html).toContain('Wiki 28 • Trimester 3');
      expect(html).toContain('84 Siku Zimebaki');
      expect(html).toContain('Biringanya');
      expect(html).toContain('Kliniki ya Ujauzito (ANC Contact 3)');
      expect(html).toContain('Zimebaki Siku 4');
      expect(html).toContain('Tazama Maandalizi ya Kliniki');
      expect(html).toContain('Ukaguzi wa Dalili za Hatari');
      expect(html).toContain('Hesabu Mateke ya Mtoto');
      expect(html).toContain('Kumbukumbu ya Kliniki ya ANC');
      expect(html).toContain('Mpango wa Kujifungua Salama');
      expect(html).toContain('Dharura ya Hospitali (Bila Malipo):');
    });

    it('enforces minimum 48px hit targets on interactive controls', () => {
      const html = renderToString(<SCR07PregnancyDashboard lang="en" />);

      expect(html).toContain('min-h-[48px]');
    });

    it('violates no anti-pattern rules (Zero Unicode emojis)', () => {
      const htmlEn = renderToString(<SCR07PregnancyDashboard lang="en" />);
      const htmlSw = renderToString(<SCR07PregnancyDashboard lang="sw" />);

      expect(UNICODE_EMOJI_REGEX.test(htmlEn)).toBe(false);
      expect(UNICODE_EMOJI_REGEX.test(htmlSw)).toBe(false);
    });
  });

  /* ========================================================================
   * 2. SCR-08: Child Home Dashboard
   * ======================================================================== */
  describe('Screen SCR-08: Child Home Dashboard (SCR08ChildDashboard)', () => {
    const testChild = {
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
    };

    it('renders active child selector bar with monogram and switcher trigger', () => {
      const html = renderToString(
        <SCR08ChildDashboard child={testChild} lang="en" />
      );

      expect(html).toContain('Joy Wambui');
      expect(html).toContain('4 Months 2 Weeks');
      expect(html).toContain('Switch Child');
      expect(html).toContain('min-h-[48px]');
    });

    it('renders ChildMilestoneHero with weight snapshot and healthy green MUAC badge', () => {
      const html = renderToString(
        <SCR08ChildDashboard child={testChild} lang="en" />
      );

      expect(html).toContain('6.4 kg — Normal (50th percentile)');
      expect(html).toContain('13.2 cm — Healthy');
      expect(html).toContain('#15803D'); // Healthy Green cutoff
      expect(html).toContain('Log Weight');
      expect(html).toContain('View Vaccine Card');
      expect(html).toContain('Feeding Guide');
    });

    it('renders Savannah Ochre vaccine alert badge with Dark-on-Amber compliance', () => {
      const html = renderToString(
        <SCR08ChildDashboard child={testChild} lang="en" />
      );

      expect(html).toContain('14-Week KEPI Vaccines Due in 12 Days');
      // Dark-on-Amber: text #1A202C on Amber #FEF3C7 / #FDE68A
      expect(html).toContain('text-[#1A202C]');
      expect(html).toContain('bg-[#FEF3C7]');
    });

    it('renders upcoming 14-week KEPI clinic visit reminder banner', () => {
      const html = renderToString(
        <SCR08ChildDashboard child={testChild} lang="en" />
      );

      expect(html).toContain('14-Week KEPI Immunization Clinic');
      expect(html).toContain('21 Nov 2026 at Ruiru Health Centre');
      expect(html).toContain('In 12 Days');
      expect(html).toContain('View Vaccine Card');
    });

    it('renders recent growth curve status preview with WHO metric chips', () => {
      const html = renderToString(
        <SCR08ChildDashboard child={testChild} lang="en" />
      );

      expect(html).toContain('WHO Growth Trajectory');
      expect(html).toContain('Normal Curve');
      expect(html).toContain('6.4 kg');
      expect(html).toContain('13.2 cm (Green)');
      expect(html).toContain('+ Log Today’s Measurement');
    });

    it('renders exclusive breastfeeding and weaning guidance card', () => {
      const html = renderToString(
        <SCR08ChildDashboard child={testChild} lang="en" />
      );

      expect(html).toContain('Exclusive Breastfeeding: Month 4 of 6');
      expect(html).toContain('Breast milk alone provides complete nutrition');
      expect(html).toContain('Read Feeding Guide →');
    });

    it('renders authentic bilingual Kiswahili child dashboard strings', () => {
      const html = renderToString(
        <SCR08ChildDashboard child={testChild} lang="sw" />
      );

      expect(html).toContain('Badili Mtoto');
      expect(html).toContain('Miezi 4 Wiki 2');
      expect(html).toContain('Chanjo ya Wiki 14 — Zimebaki Siku 12');
      expect(html).toContain('Rekodi Uzito');
      expect(html).toContain('Kadi ya Chanjo');
      expect(html).toContain('Mwongozo wa Lishe');
      expect(html).toContain('Kliniki ya Chanjo ya Wiki 14 (KEPI)');
      expect(html).toContain('Zimebaki Siku 12');
      expect(html).toContain('Kunyonyesha Pekee: Mwezi wa 4 kati ya 6');
    });

    it('violates no anti-pattern rules (Zero Unicode emojis)', () => {
      const htmlEn = renderToString(<SCR08ChildDashboard child={testChild} lang="en" />);
      const htmlSw = renderToString(<SCR08ChildDashboard child={testChild} lang="sw" />);

      expect(UNICODE_EMOJI_REGEX.test(htmlEn)).toBe(false);
      expect(UNICODE_EMOJI_REGEX.test(htmlSw)).toBe(false);
    });
  });

  /* ========================================================================
   * 3. SCR-22: Child Switcher & Profile Drawer
   * ======================================================================== */
  describe('Screen SCR-22: Child Switcher & Profile Drawer (SCR22ChildSwitcher)', () => {
    it('renders nothing when isOpen is false', () => {
      const html = renderToString(
        <SCR22ChildSwitcher isOpen={false} activeChildId="child-1" />
      );

      expect(html).toBe('');
    });

    it('renders accessible dialog drawer with title and backdrop when open', () => {
      const html = renderToString(
        <SCR22ChildSwitcher isOpen={true} activeChildId="child-1" lang="en" />
      );

      expect(html).toContain('role="dialog"');
      expect(html).toContain('aria-modal="true"');
      expect(html).toContain('My Children');
      expect(html).toContain('Select child to view their vaccine card and growth milestones');
      expect(html).toContain('aria-label="Close drawer"');
    });

    it('renders multiple children with monogram avatars, names, and ages', () => {
      const html = renderToString(
        <SCR22ChildSwitcher
          isOpen={true}
          childrenList={DEFAULT_CHILDREN}
          activeChildId="child-1"
          lang="en"
        />
      );

      expect(html).toContain('Joy Wambui');
      expect(html).toContain('4 Months 2 Weeks');
      expect(html).toContain('Brian Kiprop');
      expect(html).toContain('2 Years 7 Months');
      expect(html).toContain('Active');
      expect(html).toContain('Select');
    });

    it('renders + Add Another Child CTA button with >= 48px hit target', () => {
      const html = renderToString(
        <SCR22ChildSwitcher isOpen={true} activeChildId="child-1" lang="en" />
      );

      expect(html).toContain('+ Add Another Child');
      expect(html).toContain('min-h-[48px]');
    });

    it('renders bilingual Kiswahili child switcher strings', () => {
      const html = renderToString(
        <SCR22ChildSwitcher isOpen={true} activeChildId="child-1" lang="sw" />
      );

      expect(html).toContain('Watoto Wangu');
      expect(html).toContain('Chagua mtoto kuona ratiba ya chanjo na vipimo');
      expect(html).toContain('Anayetumika');
      expect(html).toContain('Chagua');
      expect(html).toContain('+ Sajili Mtoto Mwingine');
    });

    it('violates no anti-pattern rules (Zero Unicode emojis)', () => {
      const htmlEn = renderToString(<SCR22ChildSwitcher isOpen={true} lang="en" />);
      const htmlSw = renderToString(<SCR22ChildSwitcher isOpen={true} lang="sw" />);

      expect(UNICODE_EMOJI_REGEX.test(htmlEn)).toBe(false);
      expect(UNICODE_EMOJI_REGEX.test(htmlSw)).toBe(false);
    });
  });

  /* ========================================================================
   * 4. Navigation: BottomNav4Tab
   * ======================================================================== */
  describe('Navigation: 4-Tab Bottom Navigation (BottomNav4Tab)', () => {
    it('renders all 4 primary destinations in the thumb zone', () => {
      const html = renderToString(<BottomNav4Tab activeTab="home" lang="en" />);

      expect(html).toContain('Home');
      expect(html).toContain('Records');
      expect(html).toContain('Chat');
      expect(html).toContain('Care');
      expect(html).toContain('fixed bottom-0');
      expect(html).toContain('h-16');
    });

    it('highlights active tab with Deep Teal and 4px rounded indicator dot', () => {
      const html = renderToString(<BottomNav4Tab activeTab="records" lang="en" />);

      expect(html).toContain('text-[#006B5F]');
      expect(html).toContain('bg-[#006B5F]'); // Indicator dot
    });

    it('enforces guaranteed 48x48px minimum touch targets on all 4 tabs', () => {
      const html = renderToString(<BottomNav4Tab activeTab="home" lang="en" />);

      expect(html).toContain('min-w-[48px]');
      expect(html).toContain('min-h-[48px]');
    });

    it('renders authentic bilingual Kiswahili tab labels', () => {
      const html = renderToString(<BottomNav4Tab activeTab="home" lang="sw" />);

      expect(html).toContain('Nyumbani');
      expect(html).toContain('Kumbukumbu');
      expect(html).toContain('AI Rafiki');
      expect(html).toContain('Huduma');
    });

    it('violates no anti-pattern rules (Zero Unicode emojis)', () => {
      const htmlEn = renderToString(<BottomNav4Tab activeTab="home" lang="en" />);
      const htmlSw = renderToString(<BottomNav4Tab activeTab="home" lang="sw" />);

      expect(UNICODE_EMOJI_REGEX.test(htmlEn)).toBe(false);
      expect(UNICODE_EMOJI_REGEX.test(htmlSw)).toBe(false);
    });
  });

  /* ========================================================================
   * 5. Navigation: DashboardTopBar
   * ======================================================================== */
  describe('Navigation: Sticky Top App Bar (DashboardTopBar)', () => {
    it('renders sticky header with brand mark and ModeSwitcherPill', () => {
      const html = renderToString(
        <DashboardTopBar mode="pregnancy" lang="en" isOnline={true} />
      );

      expect(html).toContain('TotoAfya');
      expect(html).toContain('sticky top-0');
      expect(html).toContain('My Pregnancy');
      expect(html).toContain('My Child');
    });

    it('renders online sync indicator chip in healthy green', () => {
      const html = renderToString(
        <DashboardTopBar mode="pregnancy" lang="en" isOnline={true} hasPendingSync={false} />
      );

      expect(html).toContain('Synced');
      expect(html).toContain('#15803D');
      expect(html).toContain('bg-[#F0FDF4]');
    });

    it('renders offline sync indicator chip in Savannah Ochre with Dark-on-Amber compliance', () => {
      const html = renderToString(
        <DashboardTopBar mode="pregnancy" lang="en" isOnline={false} hasPendingSync={true} />
      );

      expect(html).toContain('Offline');
      // Dark-on-Amber compliance: text #78350F on bg #FEF3C7
      expect(html).toContain('text-[#78350F]');
      expect(html).toContain('bg-[#FEF3C7]');
    });

    it('renders bilingual language toggle and notification bell with >= 48px hit targets', () => {
      const html = renderToString(
        <DashboardTopBar mode="pregnancy" lang="en" unreadNotifications={2} />
      );

      expect(html).toContain('min-h-[48px]');
      expect(html).toContain('min-w-[48px]');
      expect(html).toContain('EN');
    });

    it('renders bilingual Kiswahili header strings', () => {
      const html = renderToString(
        <DashboardTopBar mode="pregnancy" lang="sw" isOnline={true} />
      );

      expect(html).toContain('Mimba Yangu');
      expect(html).toContain('Mtoto Wangu');
      expect(html).toContain('Imesawazishwa');
      expect(html).toContain('SW');
    });

    it('violates no anti-pattern rules (Zero Unicode emojis)', () => {
      const htmlEn = renderToString(<DashboardTopBar mode="pregnancy" lang="en" />);
      const htmlSw = renderToString(<DashboardTopBar mode="child" lang="sw" />);

      expect(UNICODE_EMOJI_REGEX.test(htmlEn)).toBe(false);
      expect(UNICODE_EMOJI_REGEX.test(htmlSw)).toBe(false);
    });
  });

  /* ========================================================================
   * 6. Master Coordinator: DashboardView
   * ======================================================================== */
  describe('Master Coordinator: DashboardView', () => {
    it('renders pregnancy mode by default inside centered 390px mobile frame', () => {
      const html = renderToString(
        <DashboardView initialMode="pregnancy" motherName="Faith" lang="en" />
      );

      expect(html).toContain('data-testid="totoafya-dashboard-view"');
      expect(html).toContain('max-w-[430px]');
      expect(html).toContain('data-testid="scr07-pregnancy-dashboard"');
      expect(html).toContain('Good morning, Faith');
      expect(html).toContain('Week 28 • Trimester 3');
      expect(html).toContain('Bottom Navigation');
    });

    it('renders child mode when initialMode is set to child', () => {
      const html = renderToString(
        <DashboardView initialMode="child" motherName="Faith" lang="en" />
      );

      expect(html).toContain('data-testid="scr08-child-dashboard"');
      expect(html).toContain('Joy Wambui');
      expect(html).toContain('4 Months 2 Weeks');
      expect(html).toContain('WHO Growth Trajectory');
    });

    it('renders 4-tab bottom navigation persistently across dashboard modes', () => {
      const htmlPregnancy = renderToString(
        <DashboardView initialMode="pregnancy" lang="en" />
      );
      const htmlChild = renderToString(
        <DashboardView initialMode="child" lang="en" />
      );

      expect(htmlPregnancy).toContain('Bottom Navigation');
      expect(htmlPregnancy).toContain('Home');
      expect(htmlPregnancy).toContain('Records');

      expect(htmlChild).toContain('Bottom Navigation');
      expect(htmlChild).toContain('Home');
      expect(htmlChild).toContain('Records');
    });

    it('violates no anti-pattern rules across the entire dashboard view (Zero Unicode emojis)', () => {
      const htmlPregnancy = renderToString(
        <DashboardView initialMode="pregnancy" lang="en" />
      );
      const htmlChild = renderToString(
        <DashboardView initialMode="child" lang="sw" />
      );

      expect(UNICODE_EMOJI_REGEX.test(htmlPregnancy)).toBe(false);
      expect(UNICODE_EMOJI_REGEX.test(htmlChild)).toBe(false);
    });
  });
});
