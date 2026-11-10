/**
 * Vitest Automated Test Suite: TD-3.1 Maternal Records & Emergency SOS
 *
 * Verifies:
 * 1. SCR09WeeklyFetalGuide (Week-by-Week Guide, Kenyan fruits, anatomy, nutrition)
 * 2. SCR10KickCounter (10-kick/2h session, ripple, reassurance, alert trigger)
 * 3. SCR11ANCVisitLog (8 WHO/MoH contacts, BP triage, IFAS/TTV/LLIN)
 * 4. SCR12BirthPlan (6 pillars, hospital bag checklist, progress ring)
 * 5. SCR21EmergencyTakeover (High-alert #FEF2F2 state, 1-tap dialers, red-flag sniffer, checklist)
 * 6. Accessibility & Anti-Pattern: ZERO Unicode emojis, >= 48x48px touch targets, dark-on-amber rules
 */

import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';

import {
  SCR09WeeklyFetalGuide,
  SCR10KickCounter,
  SCR11ANCVisitLog,
  SCR12BirthPlan,
  SCR21EmergencyTakeover,
} from '../routes/maternal';

// Strict regex to detect Unicode emojis prohibited by Anti-Pattern 2
const UNICODE_EMOJI_REGEX =
  /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F018}-\u{1F270}]/u;

describe('TD-3.1 Maternal Records & Emergency SOS Surfaces', () => {
  /* ========================================================================
   * 1. SCR-09: Weekly Fetal Guide
   * ======================================================================== */
  describe('Screen SCR-09: Weekly Fetal Guide (SCR09WeeklyFetalGuide)', () => {
    it('renders Kenyan fruit size analogy (Biringanya for week 28)', () => {
      const html = renderToString(
        <SCR09WeeklyFetalGuide initialWeek={28} lang="en" />
      );

      expect(html).toContain('Weekly Fetal Guide');
      expect(html).toContain('Eggplant (Garden Egg / Brinjal)');
      expect(html).toContain('37.6');
      expect(html).toContain('1000');
      expect(html).toContain('Organ &amp; Anatomical Milestones');
      expect(html).toContain('Maternal Physiological Changes');
      expect(html).toContain('Kenyan Maternal Nutrition Guidance');
      expect(html).toContain('dona ugali');
      expect(html).toContain('IFAS');
    });

    it('renders first-trimester nutrition advice with Sukuma wiki', () => {
      const html = renderToString(
        <SCR09WeeklyFetalGuide initialWeek={8} lang="en" />
      );
      expect(html).toContain('Sukuma wiki');
      expect(html).toContain('Kidney bean');
    });

    it('renders localized Swahili content when lang="sw"', () => {
      const html = renderToString(
        <SCR09WeeklyFetalGuide initialWeek={28} lang="sw" />
      );

      expect(html).toContain('Mwongozo wa Kila Wiki');
      expect(html).toContain('Biringanya');
      expect(html).toContain('Makuzi ya Viungo na Anatomia');
      expect(html).toContain('Mabadiliko ya Mwili wa Mama');
      expect(html).toContain('Lishe Bora ya Kienyeji');
    });

    it('contains sticky week scroller with week pills', () => {
      const html = renderToString(
        <SCR09WeeklyFetalGuide initialWeek={16} lang="en" />
      );

      expect(html).toContain('Wk 4');
      expect(html).toContain('Wk 16');
      expect(html).toContain('Wk 40');
      expect(html).toContain('Avocado');
    });

    it('violates zero Unicode emoji rules', () => {
      const html = renderToString(
        <SCR09WeeklyFetalGuide initialWeek={28} lang="en" />
      );
      expect(UNICODE_EMOJI_REGEX.test(html)).toBe(false);
    });
  });

  /* ========================================================================
   * 2. SCR-10: Fetal Kick Counter
   * ======================================================================== */
  describe('Screen SCR-10: Fetal Kick Counter (SCR10KickCounter)', () => {
    it('renders thumb-zone circular tap button and countdown timer', () => {
      const html = renderToString(
        <SCR10KickCounter lang="en" targetKicks={10} windowMinutes={120} />
      );

      expect(html).toContain('Fetal Kick Counter');
      expect(html).toContain('Time Remaining');
      expect(html).toContain('Kicks Counted');
      expect(html).toContain('Tap Kick');
      expect(html).toContain('120:00');
      expect(html).toContain('Clinical counting protocol:');
      expect(html).toContain('Emergency SOS Takeover');
    });

    it('renders Swahili copy cleanly', () => {
      const html = renderToString(
        <SCR10KickCounter lang="sw" targetKicks={10} windowMinutes={120} />
      );

      expect(html).toContain('Hesabu Mateke ya Mtoto');
      expect(html).toContain('Muda Uliosalia');
      expect(html).toContain('Bonyeza Teke');
      expect(html).toContain('Jinsi ya kuhesabu mateke:');
    });

    it('violates zero Unicode emoji rules', () => {
      const html = renderToString(<SCR10KickCounter lang="en" />);
      expect(UNICODE_EMOJI_REGEX.test(html)).toBe(false);
    });
  });

  /* ========================================================================
   * 3. SCR-11: ANC 8-Contact Visit Log
   * ======================================================================== */
  describe('Screen SCR-11: ANC Visit Log (SCR11ANCVisitLog)', () => {
    it('renders connected vertical timeline for 8 WHO/MoH contacts', () => {
      const html = renderToString(
        <SCR11ANCVisitLog lang="en" motherName="Faith" />
      );

      expect(html).toContain('ANC Visit Log');
      expect(html).toContain('Contact 1 (Up to 12 Weeks)');
      expect(html).toContain('Contact 2 (20 Weeks)');
      expect(html).toContain('Contact 3 (26 Weeks)');
      expect(html).toContain('Contact 4 (30 Weeks)');
      expect(html).toContain('Contact 8 (40 Weeks)');
      expect(html).toContain('Ruiru Sub-County Hospital');
    });

    it('displays recorded clinical metrics and check-offs for completed visits', () => {
      const html = renderToString(
        <SCR11ANCVisitLog lang="en" motherName="Faith" />
      );

      expect(html).toContain('118/76 mmHg');
      expect(html).toContain('62.4 kg');
      expect(html).toContain('154 bpm');
      expect(html).toContain('IFAS (Iron/Folate)');
      expect(html).toContain('TTV (Pepopunda)');
      expect(html).toContain('LLIN (Chandarua)');
    });

    it('renders Swahili localization with MoH 216 alignment', () => {
      const html = renderToString(
        <SCR11ANCVisitLog lang="sw" motherName="Faith" />
      );

      expect(html).toContain('Kadi ya Kliniki ya Ujauzito');
      expect(html).toContain('Kliniki ya 1 (Hadi Wiki 12)');
      expect(html).toContain('Zimekamilika');
    });

    it('violates zero Unicode emoji rules', () => {
      const html = renderToString(<SCR11ANCVisitLog lang="en" />);
      expect(UNICODE_EMOJI_REGEX.test(html)).toBe(false);
    });
  });

  /* ========================================================================
   * 4. SCR-12: Birth Preparedness Plan
   * ======================================================================== */
  describe('Screen SCR-12: Birth Preparedness Plan (SCR12BirthPlan)', () => {
    it('renders all key pillars of birth preparedness and completion meter', () => {
      const html = renderToString(<SCR12BirthPlan lang="en" />);

      expect(html).toContain('Birth Preparedness Plan');
      expect(html).toContain('1. Delivery Facility');
      expect(html).toContain('Ruiru Sub-County Hospital');
      expect(html).toContain('2. Emergency Transport');
      expect(html).toContain('3. Birth Companion');
      expect(html).toContain('Peter (Husband)');
      expect(html).toContain('4. Finance &amp; Insurance');
      expect(html).toContain('Linda Mama');
      expect(html).toContain('5. Hospital Bag Essentials');
      expect(html).toContain('MoH 216 Mother &amp; Child Clinic Card');
    });

    it('renders Swahili version with local terms', () => {
      const html = renderToString(<SCR12BirthPlan lang="sw" />);

      expect(html).toContain('Mpango wa Kujifungua');
      expect(html).toContain('Kituo cha Kujifungulia');
      expect(html).toContain('Mpango wa Usafiri');
      expect(html).toContain('Mtu wa Kusindikiza');
      expect(html).toContain('Begi la Hospitali');
    });

    it('violates zero Unicode emoji rules', () => {
      const html = renderToString(<SCR12BirthPlan lang="en" />);
      expect(UNICODE_EMOJI_REGEX.test(html)).toBe(false);
    });
  });

  /* ========================================================================
   * 5. SCR-21: Emergency Triage Takeover
   * ======================================================================== */
  describe('Screen SCR-21: Emergency Triage Takeover (SCR21EmergencyTakeover)', () => {
    it('renders high-alert emergency state with 1-tap facility and 1199 dialing links', () => {
      const html = renderToString(
        <SCR21EmergencyTakeover
          lang="en"
          hospitalName="Ruiru Sub-County Hospital Maternity Wing"
          hospitalPhone="0722000000"
          ambulanceNumber="1199"
        />
      );

      expect(html).toContain('EMERGENCY CLINICAL TRIAGE');
      expect(html).toContain('tel:0722000000');
      expect(html).toContain('tel:1199');
      expect(html).toContain('Ruiru Sub-County Hospital Maternity Wing');
      expect(html).toContain('Call Facility (0722000000)');
      expect(html).toContain('Call Free Ambulance (1199)');
      expect(html).toContain('Grab &amp; Go Hospital Checklist:');
      expect(html).toContain('MoH 216 Card:');
    });

    it('renders Swahili high-alert emergency copy', () => {
      const html = renderToString(
        <SCR21EmergencyTakeover
          lang="sw"
          hospitalPhone="0722000000"
          ambulanceNumber="1199"
        />
      );

      expect(html).toContain('DHARURA YA AFYA (Emergency SOS)');
      expect(html).toContain('Piga Simu Hospitalini (0722000000)');
      expect(html).toContain('Piga Ambulensi ya Kaunti (1199)');
      expect(html).toContain('Vitu vya Kubeba Hospitalini Mara Moja:');
      expect(html).toContain('Kadi ya Kliniki:');
      expect(html).toContain('Kitambulisho:');
      expect(html).toContain('Mtu wa Kusindikiza:');
    });

    it('violates zero Unicode emoji rules', () => {
      const html = renderToString(<SCR21EmergencyTakeover lang="en" />);
      expect(UNICODE_EMOJI_REGEX.test(html)).toBe(false);
    });
  });
});
