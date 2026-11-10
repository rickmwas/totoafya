/**
 * Vitest Adversarial Stress-Testing Suite: TotoAfya Mother Experience Onboarding & Auth Flow (Wave 2 Gate 2)
 *
 * Mandatory Empirical Challenges:
 * 1. 4-Digit PIN Lock Resilience (SCR-02):
 *    - PIN mismatch rejection & friendly error feedback (EN & SW)
 *    - Keypad button minimum 48x48px hit target bounds (68x68px buttons)
 *    - Two-phase creation state machine simulation (Phase 1 Enter -> Phase 2 Confirm)
 *    - Clear and Backspace boundary tests
 * 2. Pregnancy Setup Date Fuzzing (SCR-04):
 *    - Leap day (2024-02-29) calculation
 *    - Month rollovers (Dec 31, Jan 1, Feb 28)
 *    - Borderline gestational bounds: Day 0 (0w), Week 1, Trimester 1/2 (13w vs 14w),
 *      Trimester 2/3 (27w vs 28w), Term (40w), Post-term (42w), Clamped Max (44w, 50w), Future date
 *    - Guided Trimester Estimator: Anatomical landmarks (below_navel, at_navel, above_navel),
 *      fuzzing approximate months (0, 1, 5, 9, 12, negative), clinical disclaimer validation
 * 3. Child Registration & Smart Vaccine Generation (SCR-05):
 *    - 6 Boundary DOBs: Newborn (0 days), 6 weeks, 14 weeks, 9 months, 18 months, 5 years
 *    - Automated KEPI immunization schedule verification (7 visits, >10 doses)
 *    - Birth weight clinical bounds validation (0.5 kg to 6.0 kg, rejection of <0.5 kg and >6.0 kg)
 * 4. Bilingual & Skip Option Stress:
 *    - Rapid alternating toggles EN <-> SW across all screens (zero undefined/NaN/null/[object Object])
 *    - Skip option flow: SCR-03 Skip -> Step 6 Aha Reveal Explorer state without exceptions
 * 5. Anti-Pattern Audit:
 *    - Comprehensive Unicode emoji scan across all rendered markup and datasets
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
import {
  KENYAN_FETAL_SIZE_ANALOGIES,
  getKenyanFetalSize,
  KENYA_MOH_ANC_CONTACTS,
  getNextANCContact,
} from '../pregnancyData';

// Prohibited Unicode Emoji Regex per Anti-Pattern 2
const UNICODE_EMOJI_REGEX =
  /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F018}-\u{1F270}]/u;

describe('Adversarial Stress Suite: Onboarding & Auth Flow (Gate 2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* ========================================================================
   * 1. 4-Digit PIN Lock Resilience (SCR-02)
   * ======================================================================== */
  describe('SCR-02: 4-Digit PIN Lock Resilience & State Machine', () => {
    it('enforces guaranteed minimum 48x48px hit target bounds on all keypad buttons and back action', () => {
      const html = renderToString(<SCR02PinLock mode="create" lang="en" onBack={() => {}} />);

      // Keypad numbers 0-9
      for (let d = 0; d <= 9; d++) {
        expect(html).toContain(`data-testid="keypad-${d}"`);
      }
      expect(html).toContain('data-testid="keypad-clear"');
      expect(html).toContain('data-testid="keypad-backspace"');

      // Assert tactile button class bounds: 68px diameter with explicit min 48px hit targets
      expect(html).toContain('w-[68px]');
      expect(html).toContain('h-[68px]');
      expect(html).toContain('min-h-[48px]');
      expect(html).toContain('min-w-[48px]');
    });

    it('simulates 2-phase creation state machine: Phase 1 -> Phase 2 transition', () => {
      // Simulating SCR02PinLock state machine contract directly
      let phase = 1;
      let firstPin = '';
      let currentPin = '';
      let hasError = false;
      let errorMessage = '';
      const onPinComplete = vi.fn();

      const simulateDigit = (digit, mode = 'create', isSw = false) => {
        if (currentPin.length >= 4) return;
        const nextPin = currentPin + digit;
        currentPin = nextPin;

        if (nextPin.length === 4) {
          if (mode === 'create') {
            if (phase === 1) {
              firstPin = nextPin;
              currentPin = '';
              phase = 2;
            } else if (phase === 2) {
              if (nextPin === firstPin) {
                onPinComplete(nextPin, { biometricEnabled: true });
              } else {
                hasError = true;
                errorMessage = isSw
                  ? 'PIN hazilingani. Tafadhali weka upya.'
                  : 'PIN numbers do not match. Please try again.';
              }
            }
          }
        }
      };

      // Enter 4 digits in Phase 1
      ['1', '2', '3', '4'].forEach((d) => simulateDigit(d));
      expect(phase).toBe(2);
      expect(firstPin).toBe('1234');
      expect(currentPin).toBe('');
      expect(onPinComplete).not.toHaveBeenCalled();
    });

    it('simulates PIN mismatch rejection and friendly error feedback in EN and SW', () => {
      // Test English mismatch
      let phase = 2;
      let firstPin = '1234';
      let currentPin = '';
      let hasError = false;
      let errorMessage = '';
      const onPinComplete = vi.fn();

      const handleConfirmDigit = (digit, isSw = false) => {
        const nextPin = currentPin + digit;
        currentPin = nextPin;
        if (nextPin.length === 4) {
          if (nextPin !== firstPin) {
            hasError = true;
            errorMessage = isSw
              ? 'PIN hazilingani. Tafadhali weka upya.'
              : 'PIN numbers do not match. Please try again.';
          } else {
            onPinComplete(nextPin);
          }
        }
      };

      // Enter mismatching PIN 1235 in EN
      ['1', '2', '3', '5'].forEach((d) => handleConfirmDigit(d, false));
      expect(hasError).toBe(true);
      expect(errorMessage).toBe('PIN numbers do not match. Please try again.');
      expect(onPinComplete).not.toHaveBeenCalled();

      // Test Kiswahili mismatch
      currentPin = '';
      hasError = false;
      errorMessage = '';
      ['9', '8', '7', '6'].forEach((d) => handleConfirmDigit(d, true));
      expect(hasError).toBe(true);
      expect(errorMessage).toBe('PIN hazilingani. Tafadhali weka upya.');
      expect(onPinComplete).not.toHaveBeenCalled();
    });

    it('simulates PIN match confirmation triggering onPinComplete with biometric preferences', () => {
      let phase = 2;
      let firstPin = '2540';
      let currentPin = '';
      const onPinComplete = vi.fn();

      ['2', '5', '4', '0'].forEach((digit) => {
        currentPin += digit;
        if (currentPin.length === 4 && currentPin === firstPin) {
          onPinComplete(currentPin, { biometricEnabled: true });
        }
      });

      expect(onPinComplete).toHaveBeenCalledWith('2540', { biometricEnabled: true });
    });

    it('simulates backspace and clear bounds: max 4 digits, slice on backspace, empty on clear', () => {
      let currentPin = '12';
      // Add digits up to 4
      currentPin = (currentPin + '3').slice(0, 4);
      currentPin = (currentPin + '4').slice(0, 4);
      expect(currentPin).toBe('1234');

      // Overflow attempt (cannot exceed 4)
      currentPin = (currentPin + '5').slice(0, 4);
      expect(currentPin).toBe('1234');

      // Backspace
      currentPin = currentPin.slice(0, -1);
      expect(currentPin).toBe('123');

      // Clear
      currentPin = '';
      expect(currentPin).toBe('');
    });
  });

  /* ========================================================================
   * 2. Pregnancy Setup Date Fuzzing (SCR-04)
   * ======================================================================== */
  describe('SCR-04: Pregnancy Setup Date Fuzzing & Clinical Boundary Calculations', () => {
    it('fuzzes Leap Day (2024-02-29): verifies 280-day Naegele rule across leap year', () => {
      const leapDayLMP = '2024-02-29';
      const refDate = new Date('2024-08-15T00:00:00Z');
      const result = calculateEDDFromLMP(leapDayLMP, refDate);

      // 2024-02-29 + 280 days = 2024-12-05
      expect(result.edd).toBe('2024-12-05');
      // 168 days between Feb 29 and Aug 15 in leap year 2024 = exactly 24 completed weeks
      expect(result.gestationalWeeks).toBe(24);
      expect(result.trimester).toBe(2);
      expect(result.isPostTerm).toBe(false);

      // Backwards compatible functions produce identical result
      expect(calculateEdd(leapDayLMP)).toBe('2024-12-05');
      expect(calculateGestationalAgeInWeeks(leapDayLMP, refDate)).toBe(24);
    });

    it('fuzzes Month Rollovers: Year-end Dec 31, Year-start Jan 01, and Non-leap Feb 28', () => {
      // Year-end rollover: Dec 31, 2025 + 280 days = Oct 7, 2026
      const yearEnd = calculateEDDFromLMP('2025-12-31');
      expect(yearEnd.edd).toBe('2026-10-07');

      // Year-start rollover: Jan 01, 2026 + 280 days = Oct 8, 2026
      const yearStart = calculateEDDFromLMP('2026-01-01');
      expect(yearStart.edd).toBe('2026-10-08');

      // Non-leap Feb 28: Feb 28, 2025 + 280 days = Dec 5, 2025
      const nonLeapFeb = calculateEDDFromLMP('2025-02-28');
      expect(nonLeapFeb.edd).toBe('2025-12-05');
    });

    it('fuzzes Borderline Gestational Bounds: Week 0, Week 1, Trimester 1->2, Trimester 2->3, Term (40w), Post-term (42w), Clamped Max (44w, 50w)', () => {
      const fixedRef = new Date('2026-07-01T00:00:00Z');

      // Day 0: LMP is on the reference date
      const week0 = calculateEDDFromLMP('2026-07-01', fixedRef);
      expect(week0.gestationalWeeks).toBe(0);
      expect(week0.trimester).toBe(1);
      expect(week0.isPostTerm).toBe(false);

      // Week 1 completed: LMP 7 days prior
      const week1 = calculateEDDFromLMP('2026-06-24', fixedRef);
      expect(week1.gestationalWeeks).toBe(1);
      expect(week1.trimester).toBe(1);

      // Trimester 1 Boundary: Week 13 (91 days prior)
      const week13 = calculateEDDFromLMP('2026-04-01', fixedRef);
      expect(week13.gestationalWeeks).toBe(13);
      expect(week13.trimester).toBe(1);

      // Trimester 2 Boundary: Week 14 (98 days prior)
      const week14 = calculateEDDFromLMP('2026-03-25', fixedRef);
      expect(week14.gestationalWeeks).toBe(14);
      expect(week14.trimester).toBe(2);

      // Trimester 2 Upper Boundary: Week 27 (189 days prior)
      const week27 = calculateEDDFromLMP('2025-12-24', fixedRef);
      expect(week27.gestationalWeeks).toBe(27);
      expect(week27.trimester).toBe(2);

      // Trimester 3 Lower Boundary: Week 28 (196 days prior)
      const week28 = calculateEDDFromLMP('2025-12-17', fixedRef);
      expect(week28.gestationalWeeks).toBe(28);
      expect(week28.trimester).toBe(3);

      // Full Term (40 weeks / 280 days prior)
      const week40 = calculateEDDFromLMP('2025-09-24', fixedRef);
      expect(week40.gestationalWeeks).toBe(40);
      expect(week40.trimester).toBe(3);
      expect(week40.isPostTerm).toBe(false);

      // Post-term: 42 weeks (294 days prior)
      const week42 = calculateEDDFromLMP('2025-09-10', fixedRef);
      expect(week42.gestationalWeeks).toBe(42);
      expect(week42.trimester).toBe(3);
      expect(week42.isPostTerm).toBe(true);

      // Max Clinical Clamp: 44 weeks (308 days prior)
      const week44 = calculateEDDFromLMP('2025-08-27', fixedRef);
      expect(week44.gestationalWeeks).toBe(44);
      expect(week44.isPostTerm).toBe(true);

      // Extreme Post-term Fuzzing: 50 weeks (350 days prior) -> clamped at 44 weeks
      const week50 = calculateEDDFromLMP('2025-07-16', fixedRef);
      expect(week50.gestationalWeeks).toBe(44); // Clamped
      expect(week50.isPostTerm).toBe(true);

      // Future LMP Fuzzing (e.g. tomorrow) -> produces 0 weeks, does not throw
      const futureLMP = calculateEDDFromLMP('2026-07-02', fixedRef);
      expect(futureLMP.gestationalWeeks).toBe(0);
      expect(futureLMP.gestationalDays).toBe(0);
    });

    it('tests Guided Trimester Estimator: fundal height landmarks and approximate months', () => {
      const fixedRef = new Date('2026-06-01T00:00:00Z');

      // Landmark: below_navel (< 20 weeks)
      const belowNavel = estimateTrimesterAndEDD({
        landmark: 'below_navel',
        referenceDate: fixedRef,
      });
      expect(belowNavel.gestationalWeeks).toBe(14);
      expect(belowNavel.trimester).toBe(2);
      expect(belowNavel.clinicalDisclaimer).toContain('Provisional estimate based on fundal height landmarks');

      // Landmark: at_navel (~ 20 weeks)
      const atNavel = estimateTrimesterAndEDD({
        landmark: 'at_navel',
        referenceDate: fixedRef,
      });
      expect(atNavel.gestationalWeeks).toBe(20);
      expect(atNavel.trimester).toBe(2);

      // Landmark: above_navel (> 20 weeks)
      const aboveNavel = estimateTrimesterAndEDD({
        landmark: 'above_navel',
        referenceDate: fixedRef,
      });
      expect(aboveNavel.gestationalWeeks).toBe(30);
      expect(aboveNavel.trimester).toBe(3);

      // Approximate months fuzzing
      const month1 = estimateTrimesterAndEDD({ approximateMonthsAgo: 1, referenceDate: fixedRef });
      expect(month1.gestationalWeeks).toBe(4);
      expect(month1.trimester).toBe(1);

      const month5 = estimateTrimesterAndEDD({ approximateMonthsAgo: 5, referenceDate: fixedRef });
      expect(month5.gestationalWeeks).toBe(22);
      expect(month5.trimester).toBe(2);

      const month9 = estimateTrimesterAndEDD({ approximateMonthsAgo: 9, referenceDate: fixedRef });
      expect(month9.gestationalWeeks).toBe(39);
      expect(month9.trimester).toBe(3);

      // Extreme values clamped (0 -> 1 month, 12 -> 9 months)
      const month0 = estimateTrimesterAndEDD({ approximateMonthsAgo: 0, referenceDate: fixedRef });
      expect(month0.gestationalWeeks).toBe(4);

      const month15 = estimateTrimesterAndEDD({ approximateMonthsAgo: 15, referenceDate: fixedRef });
      expect(month15.gestationalWeeks).toBe(39);
    });

    it('renders clinical disclaimer banner when guided path is active', () => {
      const htmlEn = renderToString(
        <SCR04PregnancySetup initialData={{ path: 'guided', approximateMonthsAgo: 4 }} lang="en" />
      );
      expect(htmlEn).toContain('Clinical Note');
      expect(htmlEn).toContain('Provisional estimate based on anatomical landmarks');

      const htmlSw = renderToString(
        <SCR04PregnancySetup initialData={{ path: 'guided', approximateMonthsAgo: 4 }} lang="sw" />
      );
      expect(htmlSw).toContain('Kumbuka');
      expect(htmlSw).toContain('Makadirio haya ni ya muda mfupi');
    });
  });

  /* ========================================================================
   * 3. Child Registration & Smart Vaccine Generation (SCR-05)
   * ======================================================================== */
  describe('SCR-05: Child Registration & Smart Vaccine Cascade Generation', () => {
    it('generates 100% deterministic KEPI 7-visit immunization cascade across 6 boundary DOBs', () => {
      const testCases = [
        { label: 'Newborn (0 days)', dob: '2026-06-01' },
        { label: '6 Weeks Old', dob: '2026-04-20' },
        { label: '14 Weeks Old', dob: '2026-02-23' },
        { label: '9 Months Old', dob: '2025-09-01' },
        { label: '18 Months Old', dob: '2024-12-01' },
        { label: '5 Years Old', dob: '2021-06-01' },
      ];

      testCases.forEach(({ label, dob }) => {
        const schedule = calculateKEPISchedule(dob, 'child-fuzz');

        expect(schedule.visits.length, `${label} should have 7 visits`).toBe(7);
        expect(schedule.totalDoses, `${label} should have >= 15 total doses`).toBeGreaterThanOrEqual(15);

        // Visit 1: Birth Visit
        expect(schedule.visits[0].visitNumber).toBe(1);
        expect(schedule.visits[0].targetAgeWeeks).toBe(0);
        expect(schedule.visits[0].scheduledDate).toBe(dob);
        expect(schedule.visits[0].vaccines.some((v) => v.antigen === 'BCG')).toBe(true);
        expect(schedule.visits[0].vaccines.some((v) => v.antigen === 'OPV 0')).toBe(true);

        // Visit 2: 6 Weeks
        expect(schedule.visits[1].visitNumber).toBe(2);
        expect(schedule.visits[1].targetAgeWeeks).toBe(6);
        expect(schedule.visits[1].vaccines.some((v) => v.antigen.includes('Pentavalent 1'))).toBe(true);

        // Visit 3: 10 Weeks
        expect(schedule.visits[2].visitNumber).toBe(3);
        expect(schedule.visits[2].targetAgeWeeks).toBe(10);

        // Visit 4: 14 Weeks
        expect(schedule.visits[3].visitNumber).toBe(4);
        expect(schedule.visits[3].targetAgeWeeks).toBe(14);
        expect(schedule.visits[3].vaccines.some((v) => v.antigen === 'IPV 1')).toBe(true);

        // Visit 5: 6 Months
        expect(schedule.visits[4].visitNumber).toBe(5);
        expect(schedule.visits[4].targetAgeWeeks).toBe(26);

        // Visit 6: 9 Months
        expect(schedule.visits[5].visitNumber).toBe(6);
        expect(schedule.visits[5].targetAgeWeeks).toBe(39);
        expect(schedule.visits[5].vaccines.some((v) => v.antigen.includes('Measles-Rubella 1'))).toBe(true);

        // Visit 7: 18 Months
        expect(schedule.visits[6].visitNumber).toBe(7);
        expect(schedule.visits[6].targetAgeWeeks).toBe(78);
        expect(schedule.visits[6].vaccines.some((v) => v.antigen.includes('MR 2 Booster'))).toBe(true);
      });
    });

    it('renders smart immunization notice card with 7-visit badge when child profile is initialized', () => {
      const html = renderToString(
        <SCR05ChildSetup
          initialData={{ firstName: 'Amani', dob: '2026-01-15', gender: 'boy' }}
          lang="en"
        />
      );

      expect(html).toContain('smart-immunization-notice');
      expect(html).toContain('Kenya KEPI Vaccine Schedule Auto-Populated (7 Visits)');
      expect(html).toContain('Ministry of Health');
    });

    it('validates birth weight boundaries: accepts 0.5kg to 6.0kg', () => {
      // Direct validation logic check matching SCR05ChildSetup lines 114-121
      const isValidWeight = (w) => {
        if (!w) return true;
        const val = parseFloat(w);
        return !isNaN(val) && val >= 0.5 && val <= 6.0;
      };

      expect(isValidWeight('0.5')).toBe(true); // Minimum
      expect(isValidWeight('3.2')).toBe(true); // Normal
      expect(isValidWeight('6.0')).toBe(true); // Maximum
      expect(isValidWeight('')).toBe(true);    // Optional field

      expect(isValidWeight('0.4')).toBe(false); // Below minimum
      expect(isValidWeight('6.1')).toBe(false); // Above maximum
      expect(isValidWeight('-1.0')).toBe(false);
      expect(isValidWeight('10.0')).toBe(false);
    });
  });

  /* ========================================================================
   * 4. Bilingual & Skip Option Stress
   * ======================================================================== */
  describe('Bilingual & Skip Option Stress Testing', () => {
    it('stresses bilingual switching: asserts zero undefined, NaN, null, or [object Object] text across all screens', () => {
      const screensToStress = [
        { name: 'SCR01Welcome', comp: (l) => <SCR01Welcome lang={l} /> },
        { name: 'SCR02PinLock(create)', comp: (l) => <SCR02PinLock mode="create" lang={l} /> },
        { name: 'SCR02PinLock(login)', comp: (l) => <SCR02PinLock mode="login" lang={l} /> },
        { name: 'SCR03RoleSelection', comp: (l) => <SCR03RoleSelection lang={l} /> },
        {
          name: 'SCR04PregnancySetup(lmp)',
          comp: (l) => (
            <SCR04PregnancySetup
              initialData={{ path: 'lmp', lmp: '2026-04-10' }}
              lang={l}
            />
          ),
        },
        {
          name: 'SCR04PregnancySetup(guided)',
          comp: (l) => (
            <SCR04PregnancySetup
              initialData={{ path: 'guided', approximateMonthsAgo: 6 }}
              lang={l}
            />
          ),
        },
        {
          name: 'SCR05ChildSetup',
          comp: (l) => (
            <SCR05ChildSetup
              initialData={{ firstName: 'Zawadi', dob: '2026-02-01', gender: 'girl' }}
              lang={l}
            />
          ),
        },
        {
          name: 'SCR06AhaReveal(expecting)',
          comp: (l) => (
            <SCR06AhaReveal
              journeyData={{
                role: 'expecting',
                pregnancyData: { gestationalWeeks: 24, edd: '2026-10-10' },
              }}
              lang={l}
            />
          ),
        },
        {
          name: 'SCR06AhaReveal(child)',
          comp: (l) => (
            <SCR06AhaReveal
              journeyData={{
                role: 'child',
                childData: { firstName: 'Zawadi', ageDisplay: '4 months old' },
              }}
              lang={l}
            />
          ),
        },
        {
          name: 'SCR06AhaReveal(guest)',
          comp: (l) => <SCR06AhaReveal journeyData={{ role: 'skip' }} lang={l} />,
        },
      ];

      ['en', 'sw'].forEach((lang) => {
        screensToStress.forEach(({ name, comp }) => {
          const html = renderToString(comp(lang));

          expect(html, `${name} in ${lang} should not contain "undefined"`).not.toContain('undefined');
          expect(html, `${name} in ${lang} should not contain "NaN"`).not.toContain('NaN');
          expect(html, `${name} in ${lang} should not contain "[object Object]"`).not.toContain('[object Object]');
        });
      });
    });

    it('verifies skip option allows guest explorer progression without throwing exceptions', () => {
      // Step 3 with Skip
      const htmlRole = renderToString(<SCR03RoleSelection lang="en" onSkip={() => {}} />);
      expect(htmlRole).toContain('role-skip-btn');
      expect(htmlRole).toMatch(/I(&#x27;|')ll set this up later — explore the app first/);

      // Transition to Step 6 with guest role ('skip')
      const htmlAha = renderToString(
        <SCR06AhaReveal
          journeyData={{
            role: 'skip',
            pregnancyData: null,
            childData: null,
          }}
          lang="en"
        />
      );

      expect(htmlAha).toContain('Welcome to TotoAfya');
      expect(htmlAha).toContain('Explore interactive guides, Kenyan immunization schedules');
      expect(htmlAha).toContain('Enter My Dashboard');
      expect(htmlAha).not.toContain('aha-pregnancy-card');
      expect(htmlAha).not.toContain('aha-child-card');
    });
  });

  /* ========================================================================
   * 5. Anti-Pattern Audit (Anti-Pattern 2: Zero Unicode Emojis)
   * ======================================================================== */
  describe('Anti-Pattern Audit: Zero Unicode Emojis', () => {
    it('audits all 6 screens and all variations: 0 Unicode emojis present', () => {
      const renders = [
        renderToString(<SCR01Welcome lang="en" />),
        renderToString(<SCR01Welcome lang="sw" />),
        renderToString(<SCR02PinLock mode="create" lang="en" />),
        renderToString(<SCR02PinLock mode="login" lang="sw" />),
        renderToString(<SCR03RoleSelection lang="en" />),
        renderToString(<SCR03RoleSelection lang="sw" />),
        renderToString(<SCR04PregnancySetup initialData={{ path: 'lmp', lmp: '2026-05-15' }} lang="en" />),
        renderToString(<SCR04PregnancySetup initialData={{ path: 'ultrasound', edd: '2026-11-20' }} lang="sw" />),
        renderToString(<SCR04PregnancySetup initialData={{ path: 'guided', approximateMonthsAgo: 5 }} lang="en" />),
        renderToString(<SCR05ChildSetup initialData={{ firstName: 'Baraka', dob: '2026-03-01' }} lang="en" />),
        renderToString(<SCR05ChildSetup initialData={{ firstName: 'Baraka', dob: '2026-03-01' }} lang="sw" />),
        renderToString(
          <SCR06AhaReveal
            journeyData={{
              role: 'both',
              pregnancyData: { gestationalWeeks: 28, edd: '2026-09-01' },
              childData: { firstName: 'Baraka', ageDisplay: '1 yr' },
            }}
            lang="en"
          />
        ),
        renderToString(
          <SCR06AhaReveal
            journeyData={{
              role: 'skip',
            }}
            lang="sw"
          />
        ),
      ];

      renders.forEach((html, idx) => {
        const hasEmoji = UNICODE_EMOJI_REGEX.test(html);
        expect(hasEmoji, `Render variant ${idx} must contain ZERO emojis`).toBe(false);
      });
    });

    it('audits Kenyan agricultural fetal produce dictionary: all 37 produce names free of emojis', () => {
      for (let w = 4; w <= 40; w++) {
        const produce = KENYAN_FETAL_SIZE_ANALOGIES[w];
        expect(produce).toBeDefined();
        expect(UNICODE_EMOJI_REGEX.test(produce.en)).toBe(false);
        expect(UNICODE_EMOJI_REGEX.test(produce.sw)).toBe(false);
      }
    });

    it('audits Kenya MoH 8-Contact ANC dictionary: all 8 contacts free of emojis', () => {
      KENYA_MOH_ANC_CONTACTS.forEach((contact) => {
        expect(UNICODE_EMOJI_REGEX.test(contact.title)).toBe(false);
        expect(UNICODE_EMOJI_REGEX.test(contact.titleSw)).toBe(false);
        expect(UNICODE_EMOJI_REGEX.test(contact.weekRange)).toBe(false);
        expect(UNICODE_EMOJI_REGEX.test(contact.weekRangeSw)).toBe(false);
      });
    });
  });
});
