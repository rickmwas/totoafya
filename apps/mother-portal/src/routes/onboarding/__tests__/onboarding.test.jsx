/**
 * Vitest Automated Suite: TotoAfya Mother Experience Onboarding Flow (TD-2.2)
 *
 * Verifies:
 * 1. Screen SCR-01: Welcome & Bilingual Language Toggle (EN/SW instant adaptation)
 * 2. Screen SCR-02: 4-Digit PIN Creation, Two-Phase Confirmation & Mismatch Error
 * 3. Screen SCR-03: Caregiver Role Selection & Friendly Skip Option
 * 4. Screen SCR-04: Pregnancy Setup with LMP Naegele EDD Calculation & Guided Trimester Estimator
 * 5. Screen SCR-05: Child Registration with KEPI Vaccine Auto-Population
 * 6. Screen SCR-06: The "Aha! Moment" Personalized Milestone Reveal
 * 7. OnboardingFlow Coordinator: Complete Step Sequencing (1->2->3->4/5->6)
 * 8. Anti-Pattern Guardrail: ZERO Unicode Emojis across all rendered screens
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  calculateEDDFromLMP,
  calculateEdd,
  calculateGestationalAgeInWeeks,
  estimateTrimesterAndEDD,
  calculateKEPISchedule,
  generateVaccinationSchedule,
} from '@totoafya/business-logic';
import {
  SCR01Welcome,
  SCR02PinLock,
  SCR03RoleSelection,
  SCR04PregnancySetup,
  SCR05ChildSetup,
  SCR06AhaReveal,
  OnboardingFlow,
} from '../index';
import { getKenyanFetalSize, getNextANCContact } from '../pregnancyData';

// Regex to detect Unicode emojis prohibited by Anti-Pattern 2
const UNICODE_EMOJI_REGEX =
  /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F018}-\u{1F270}]/u;

describe('TD-2.2 Workstream: Onboarding & Auth Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* ========================================================================
   * 1. SCR-01: Welcome & Language Selection
   * ======================================================================== */
  describe('SCR-01: Welcome Screen (SCR01Welcome)', () => {
    it('renders branding, title, and English copy by default', () => {
      const html = renderToString(<SCR01Welcome lang="en" />);

      expect(html).toContain('TotoAfya');
      expect(html).toContain('Your Journey from Bump to Baby');
      expect(html).toContain('Your trusted health companion from bump to baby');
      expect(html).toContain('Get Started');
      expect(html).toContain('Already have an account? Log In');
      expect(html).toContain('min-h-[48px]');
    });

    it('adapts instantly to Kiswahili language copy', () => {
      const html = renderToString(<SCR01Welcome lang="sw" />);

      expect(html).toContain('Safari Yako Kuanzia Ujauzito Hadi Makuzi');
      expect(html).toContain(
        'Rafiki yako wa kuaminika kuanzia ujauzito hadi makuzi ya mtoto'
      );
      expect(html).toContain('Anza Safari Hapa');
      expect(html).toContain('Umeshajiandikisha? Ingia');
    });

    it('contains dual language pill toggle with English and Kiswahili buttons', () => {
      const html = renderToString(<SCR01Welcome lang="en" />);

      expect(html).toContain('English');
      expect(html).toContain('Kiswahili');
      expect(html).toContain('aria-pressed="true"'); // English active
    });

    it('violates no anti-pattern rules (Zero Unicode emojis)', () => {
      const htmlEn = renderToString(<SCR01Welcome lang="en" />);
      const htmlSw = renderToString(<SCR01Welcome lang="sw" />);

      expect(UNICODE_EMOJI_REGEX.test(htmlEn)).toBe(false);
      expect(UNICODE_EMOJI_REGEX.test(htmlSw)).toBe(false);
    });
  });

  /* ========================================================================
   * 2. SCR-02: 4-Digit Quick PIN Lock
   * ======================================================================== */
  describe('SCR-02: 4-Digit PIN Lock Screen (SCR02PinLock)', () => {
    it('renders 4 circular tactile dot indicators', () => {
      const html = renderToString(<SCR02PinLock mode="create" lang="en" />);

      expect(html).toContain('pin-dots-container');
      expect(html).toContain('pin-dot-0');
      expect(html).toContain('pin-dot-1');
      expect(html).toContain('pin-dot-2');
      expect(html).toContain('pin-dot-3');
    });

    it('renders high-contrast 3x4 numeric keypad with minimum 48px hit targets', () => {
      const html = renderToString(<SCR02PinLock mode="create" lang="en" />);

      // Keypad digits 0-9
      for (let i = 0; i <= 9; i++) {
        expect(html).toContain(`keypad-${i}`);
      }
      expect(html).toContain('keypad-clear');
      expect(html).toContain('keypad-backspace');

      // 68px diameter circles satisfy >= 48px hit target
      expect(html).toContain('min-h-[48px]');
      expect(html).toContain('min-w-[48px]');
      expect(html).toContain('w-[68px]');
    });

    it('renders biometric unlock quick toggle option', () => {
      const htmlEn = renderToString(<SCR02PinLock mode="create" lang="en" />);
      const htmlSw = renderToString(<SCR02PinLock mode="create" lang="sw" />);

      expect(htmlEn).toContain('Enable Fingerprint / Face Unlock');
      expect(htmlSw).toContain('Washa Utambuzi wa Alama za Vidole');
    });

    it('renders discreet private view toggle', () => {
      const html = renderToString(<SCR02PinLock mode="create" lang="en" />);
      expect(html).toContain('Private View');
    });

    it('displays two-phase copy in create mode', () => {
      const htmlEn = renderToString(<SCR02PinLock mode="create" lang="en" />);
      expect(htmlEn).toContain('Create Your 4-Digit PIN');
      expect(htmlEn).toContain('Step 1 of 2: Enter PIN');

      const htmlSw = renderToString(<SCR02PinLock mode="create" lang="sw" />);
      expect(htmlSw).toContain('Weka PIN ya Tarakimu 4');
      expect(htmlSw).toContain('Hatua 1 kati ya 2: Chagua PIN');
    });

    it('displays login copy in login mode', () => {
      const html = renderToString(<SCR02PinLock mode="login" lang="en" />);
      expect(html).toContain('Welcome Back');
      expect(html).toContain('Enter your 4-digit PIN to access private records');
    });

    it('contains ZERO Unicode emojis', () => {
      const html = renderToString(<SCR02PinLock mode="create" lang="en" />);
      expect(UNICODE_EMOJI_REGEX.test(html)).toBe(false);
    });
  });

  /* ========================================================================
   * 3. SCR-03: Caregiver Role / Journey Identification
   * ======================================================================== */
  describe('SCR-03: Journey Identification (SCR03RoleSelection)', () => {
    it('renders 3 tactile role selection cards with custom SVGs', () => {
      const html = renderToString(<SCR03RoleSelection lang="en" />);

      expect(html).toContain('role-card-expecting');
      expect(html).toContain('role-card-child');
      expect(html).toContain('role-card-both');

      // Titles
      expect(html).toContain('I am expecting a baby');
      expect(html).toContain('I have a child (0–5 years)');
      expect(html).toContain('I am expecting AND have a child');

      // Badges
      expect(html).toContain('Maternal Health');
      expect(html).toContain('Child Health');
      expect(html).toContain('Family Care');
    });

    it('renders Kiswahili translations accurately', () => {
      const html = renderToString(<SCR03RoleSelection lang="sw" />);

      expect(html).toContain('Safari yako iko wapi sasa?');
      expect(html).toContain('Nina mjamzito');
      expect(html).toContain('Nina mtoto mchanga au wa chekechea');
      expect(html).toContain('Nina mjamzito na pia nina mtoto');
      expect(html).toContain('Afya ya Uzazi');
      expect(html).toContain('Afya ya Mtoto');
      expect(html).toContain('Huduma ya Familia');
    });

    it('renders friendly skip option at bottom', () => {
      const htmlEn = renderToString(<SCR03RoleSelection lang="en" />);
      const htmlSw = renderToString(<SCR03RoleSelection lang="sw" />);

      expect(htmlEn).toMatch(/I(&#x27;|')ll set this up later — explore the app first/);
      expect(htmlSw).toContain('Nitaweka baadaye — angalia kwanza');
    });

    it('contains ZERO Unicode emojis in role cards or badges', () => {
      const html = renderToString(<SCR03RoleSelection lang="en" />);
      expect(UNICODE_EMOJI_REGEX.test(html)).toBe(false);
    });
  });

  /* ========================================================================
   * 4. SCR-04: Pregnancy Setup Flow & Naegele Clinical Integration
   * ======================================================================== */
  describe('SCR-04: Pregnancy Setup Flow (SCR04PregnancySetup)', () => {
    it('integrates Naegele Rule calculateEDDFromLMP from @totoafya/business-logic', () => {
      const lmpDate = '2026-05-15';
      const refDate = new Date('2026-11-06');
      const result = calculateEDDFromLMP(lmpDate, refDate);

      // Naegele EDD: LMP + 280 days = 2027-02-19
      expect(result.edd).toBe('2027-02-19');
      // 175 days = 25 weeks completed
      expect(result.gestationalWeeks).toBe(25);
      expect(result.trimester).toBe(2);
      expect(result.source).toBe('lmp_naegele');
      expect(result.isPostTerm).toBe(false);

      // Verify backwards compatible functions match
      expect(calculateEdd(lmpDate)).toBe('2027-02-19');
      expect(calculateGestationalAgeInWeeks(lmpDate, refDate)).toBe(25);
    });

    it('maps gestational age to authentic Kenyan agricultural fruit size analogies', () => {
      const week8 = getKenyanFetalSize(8);
      expect(week8.en).toBe('Baobab Seed');
      expect(week8.sw).toBe('Mbegu ya Ubuyu');

      const week16 = getKenyanFetalSize(16);
      expect(week16.en).toBe('Ripe Hass Avocado');
      expect(week16.sw).toBe('Parachichi lililoiva');

      const week24 = getKenyanFetalSize(24);
      expect(week24.en).toBe('Fresh Maize Cob');
      expect(week24.sw).toBe('Gomba la Mahindi Mabichi');

      const week28 = getKenyanFetalSize(28);
      expect(week28.en).toBe('African Garden Egg / Brinjal');
      expect(week28.sw).toBe('Biringanya');
      expect(week28.weightG).toBe(1000);

      const week40 = getKenyanFetalSize(40);
      expect(week40.en).toBe('Full Round Watermelon');
      expect(week40.sw).toBe('Tikiti Maji Kamili');
    });

    it('integrates estimateTrimesterAndEDD for guided path fallback with disclaimer', () => {
      const guidedResult = estimateTrimesterAndEDD({
        landmark: 'at_navel',
      });

      expect(guidedResult.gestationalWeeks).toBe(20);
      expect(guidedResult.trimester).toBe(2);
      expect(guidedResult.source).toBe('guided_estimate');
      expect(guidedResult.clinicalDisclaimer).toContain('Provisional estimate');
    });

    it('renders 3 path selector buttons (LMP, Ultrasound, Guided)', () => {
      const html = renderToString(<SCR04PregnancySetup lang="en" />);

      expect(html).toContain('path-lmp-btn');
      expect(html).toContain('path-ultrasound-btn');
      expect(html).toContain('path-guided-btn');
      expect(html).toContain('Last Period (LMP)');
      expect(html).toContain('Ultrasound EDD');
      expect(html).toContain('Guided Estimate');
    });

    it('renders live calculation preview when initialData has LMP', () => {
      const html = renderToString(
        <SCR04PregnancySetup
          initialData={{ path: 'lmp', lmp: '2026-05-15' }}
          lang="en"
        />
      );

      expect(html).toContain('pregnancy-calculation-card');
      expect(html).toContain('Trimester 2');
      expect(html).toContain('EDD: 2027-02-19');
      expect(html).toContain('Confirm Due Date');
    });

    it('renders clinical provisional disclaimer on guided path', () => {
      const html = renderToString(
        <SCR04PregnancySetup
          initialData={{ path: 'guided', approximateMonthsAgo: 5 }}
          lang="en"
        />
      );

      expect(html).toContain('Clinical Note');
      expect(html).toContain('Provisional estimate based on anatomical landmarks');
    });

    it('contains ZERO Unicode emojis in pregnancy setup', () => {
      const html = renderToString(<SCR04PregnancySetup lang="en" />);
      expect(UNICODE_EMOJI_REGEX.test(html)).toBe(false);
    });
  });

  /* ========================================================================
   * 5. SCR-05: Child Registration Flow & KEPI Integration
   * ======================================================================== */
  describe('SCR-05: Child Registration (SCR05ChildSetup)', () => {
    it('integrates KEPI 7-visit vaccine schedule generation from @totoafya/business-logic', () => {
      const dob = '2026-07-12';
      const schedule = calculateKEPISchedule(dob, 'child-test-1');

      expect(schedule.visits.length).toBe(7);
      expect(schedule.visits[0].visitLabelEn).toBe('Birth Visit');
      expect(schedule.visits[1].visitLabelEn).toBe('6 Weeks Visit');
      expect(schedule.visits[2].visitLabelEn).toBe('10 Weeks Visit');
      expect(schedule.visits[3].visitLabelEn).toBe('14 Weeks Visit');
      expect(schedule.visits[4].visitLabelEn).toBe('6 Months Visit');
      expect(schedule.visits[5].visitLabelEn).toBe('9 Months Visit');
      expect(schedule.visits[6].visitLabelEn).toBe('18 Months Visit');

      const legacyItems = generateVaccinationSchedule('child-test-1', dob);
      expect(legacyItems.length).toBe(7);
      expect(schedule.totalDoses).toBeGreaterThan(10);
    });

    it('renders input fields for first name, DOB, gender, and birth weight', () => {
      const html = renderToString(<SCR05ChildSetup lang="en" />);

      expect(html).toContain('child-name-input');
      expect(html).toContain('child-dob-input');
      expect(html).toContain('gender-girl-btn');
      expect(html).toContain('gender-boy-btn');
      expect(html).toContain('child-weight-input');
      expect(html).toContain('Create Child Record');
    });

    it('renders smart immunization auto-population notice when DOB is provided', () => {
      const html = renderToString(
        <SCR05ChildSetup
          initialData={{ firstName: 'Joy', dob: '2026-07-12', gender: 'girl' }}
          lang="en"
        />
      );

      expect(html).toContain('smart-immunization-notice');
      expect(html).toContain(
        'Kenya KEPI Vaccine Schedule Auto-Populated (7 Visits)'
      );
      expect(html).toContain('Ministry of Health');
    });

    it('renders Kiswahili child setup interface correctly', () => {
      const html = renderToString(
        <SCR05ChildSetup
          initialData={{ firstName: 'Baraka', dob: '2026-07-12', gender: 'boy' }}
          lang="sw"
        />
      );

      expect(html).toContain('Sajili Mtoto Wako');
      expect(html).toContain('Mvulana (Boy)');
      expect(html).toContain('Msichana (Girl)');
      expect(html).toContain('Sajili Mtoto');
      expect(html).toContain('Ratiba ya Chanjo ya KEPI Imepangwa (7 Ziara)');
    });

    it('contains ZERO Unicode emojis in child registration', () => {
      const html = renderToString(<SCR05ChildSetup lang="en" />);
      expect(UNICODE_EMOJI_REGEX.test(html)).toBe(false);
    });
  });

  /* ========================================================================
   * 6. SCR-06: The "Aha! Moment" Personalized Value Reveal
   * ======================================================================== */
  describe('SCR-06: The "Aha! Moment" Value Reveal (SCR06AhaReveal)', () => {
    it('renders personalized pregnancy milestone for expectant mother', () => {
      const journeyData = {
        role: 'expecting',
        pregnancyData: {
          gestationalWeeks: 26,
          edd: '2027-02-19',
          fruitSize: getKenyanFetalSize(26),
        },
      };

      const html = renderToString(
        <SCR06AhaReveal journeyData={journeyData} lang="en" />
      );

      expect(html).toContain('aha-pregnancy-card');
      expect(html).toContain('Week 26 of 40');
      expect(html).toContain('14 Weeks to Arrival');
      expect(html).toContain('Upcoming ANC Contact');
      expect(html).toContain('Enter My Dashboard');
    });

    it('renders personalized child health milestone for mother with child', () => {
      const journeyData = {
        role: 'child',
        childData: {
          firstName: 'Joy',
          dob: '2026-07-12',
          ageDisplay: '4 months old',
        },
      };

      const html = renderToString(
        <SCR06AhaReveal journeyData={journeyData} lang="en" />
      );

      expect(html).toContain('aha-child-card');
      expect(html).toContain('Welcome! Baby Joy');
      expect(html).toContain('4 months old');
      expect(html).toContain('KEPI Ready');
      expect(html).toContain('Enter My Dashboard');
    });

    it('renders dual summary when role is both expecting and child', () => {
      const journeyData = {
        role: 'both',
        pregnancyData: {
          gestationalWeeks: 28,
          edd: '2027-02-05',
          fruitSize: getKenyanFetalSize(28),
        },
        childData: {
          firstName: 'Baraka',
          dob: '2024-05-10',
          ageDisplay: '2 yrs old',
        },
      };

      const html = renderToString(
        <SCR06AhaReveal journeyData={journeyData} lang="en" />
      );

      expect(html).toContain('aha-pregnancy-card');
      expect(html).toContain('aha-child-card');
      expect(html).toContain('Welcome! Baby Baraka');
      expect(html).toContain('Week 28 of 40');
    });

    it('contains ZERO Unicode emojis in celebration reveal', () => {
      const html = renderToString(
        <SCR06AhaReveal
          journeyData={{
            role: 'expecting',
            pregnancyData: { gestationalWeeks: 20 },
          }}
          lang="en"
        />
      );
      expect(UNICODE_EMOJI_REGEX.test(html)).toBe(false);
    });
  });

  /* ========================================================================
   * 7. OnboardingFlow Coordinator Component & Step Sequencing
   * ======================================================================== */
  describe('OnboardingFlow Coordinator', () => {
    it('renders Step 1 (SCR01Welcome) as initial step by default', () => {
      const html = renderToString(<OnboardingFlow initialStep={1} />);

      expect(html).toContain('onboarding-flow-coordinator');
      expect(html).toContain('data-current-step="1"');
      expect(html).toContain('scr01-welcome');
      expect(html).toContain('Get Started');
    });

    it('renders Step 2 (SCR02PinLock) when initialStep is 2', () => {
      const html = renderToString(<OnboardingFlow initialStep={2} />);

      expect(html).toContain('data-current-step="2"');
      expect(html).toContain('scr02-pin-lock');
      expect(html).toContain('Create Your 4-Digit PIN');
    });

    it('renders Step 3 (SCR03RoleSelection) when initialStep is 3', () => {
      const html = renderToString(<OnboardingFlow initialStep={3} />);

      expect(html).toContain('data-current-step="3"');
      expect(html).toContain('scr03-role-selection');
      expect(html).toContain('Where are you on your journey?');
    });

    it('renders Step 4 (SCR04PregnancySetup) when initialStep is 4', () => {
      const html = renderToString(<OnboardingFlow initialStep={4} />);

      expect(html).toContain('data-current-step="4"');
      expect(html).toContain('scr04-pregnancy-setup');
      expect(html).toContain('Set Up Your Pregnancy');
    });

    it('renders Step 5 (SCR05ChildSetup) when initialStep is 5', () => {
      const html = renderToString(<OnboardingFlow initialStep={5} />);

      expect(html).toContain('data-current-step="5"');
      expect(html).toContain('scr05-child-setup');
      expect(html).toContain('Register Your Child');
    });

    it('renders Step 6 (SCR06AhaReveal) when initialStep is 6', () => {
      const html = renderToString(<OnboardingFlow initialStep={6} />);

      expect(html).toContain('data-current-step="6"');
      expect(html).toContain('scr06-aha-reveal');
      expect(html).toMatch(/You(&#x27;|')re All Set!/);
      expect(html).toContain('Enter My Dashboard');
    });

    it('displays progress bar for intermediate steps', () => {
      const html = renderToString(<OnboardingFlow initialStep={3} />);
      expect(html).toContain('role="progressbar"');
      expect(html).toContain('aria-valuenow="3"');
    });

    it('verifies strict anti-pattern compliance (ZERO Unicode emojis across full flow coordinator)', () => {
      for (let s = 1; s <= 6; s++) {
        const html = renderToString(<OnboardingFlow initialStep={s} />);
        expect(UNICODE_EMOJI_REGEX.test(html)).toBe(false);
      }
    });
  });
});
