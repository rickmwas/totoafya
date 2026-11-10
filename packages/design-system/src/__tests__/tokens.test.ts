/**
 * TotoAfya Digital - Design System Comprehensive Verification Test Suite
 * Wave 1 Task Directive TD-1.1
 *
 * Verifies:
 * 1. Palette and Theme Configuration ("The Sunlit Botanical Editorial")
 * 2. Dark-on-Amber WCAG AA Contrast Enforcement (White on Amber outlawed)
 * 3. 8-Point Spatial Grid (2px to 48px)
 * 4. Typography Mappings (Merriweather, Plus Jakarta Sans, Tabular Nums)
 * 5. Touch Target Dimensions (48x48px WCAG AA)
 * 6. Swahili Localization Rules (+25% expansion, ellipsis ban on clinical data)
 * 7. Bilingual Translation Dictionary Parity (English & Kiswahili)
 * 8. JSON Tokens Parity & Tailwind Preset Verification
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  colors,
  spacing,
  typography,
  radii,
  shadows,
  touchTarget,
  safeArea,
  cssCustomProperties,
  getCssCustomPropertiesString,
  translations,
  uxWritingProtocols,
} from '../tokens.ts';
import {
  calculateContrastRatio,
  calculateRelativeLuminance,
  validateContrast,
  assertDarkOnAmberCompliance,
  getAccessibleTextColorOnAmber,
  DARK_ON_AMBER_RULE,
} from '../contrast-rules.ts';
import {
  SWAHILI_LAYOUT_RULES,
  validateClinicalDataDisplay,
  estimateSwahiliWidth,
  CLINICAL_FIELDS_REQUIRING_FULL_DISPLAY,
} from '../swahili-rules.ts';
import tokensJson from '../tokens.json' with { type: 'json' };
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const tailwindPreset = require('../tailwind-preset.js');

describe('TD-1.1 Design System Primitives & Theme Configuration', () => {

  // ==========================================================================
  // 1. PALETTE & THEME CONFIGURATION ("The Sunlit Botanical Editorial")
  // ==========================================================================
  describe('Master Palette: The Sunlit Botanical Editorial', () => {
    it('defines Deep Highland Teal tokens correctly', () => {
      assert.strictEqual(colors.brand.teal.primary, '#006B5F', 'Primary Teal should be #006B5F');
      assert.strictEqual(colors.brand.teal.deep, '#004D44', 'Deep Teal should be #004D44');
      assert.strictEqual(colors.brand.teal.medium, '#2E8A74', 'Medium Teal should be #2E8A74');
      assert.strictEqual(colors.brand.teal.soft, '#E6F4F1', 'Soft Teal should be #E6F4F1');
      assert.strictEqual(colors.primary, '#006B5F', 'Primary alias should point to #006B5F');
    });

    it('defines Savannah Sunrise Amber tokens correctly', () => {
      assert.strictEqual(colors.brand.amber.primary, '#E68A00', 'Amber Primary should be #E68A00');
      assert.strictEqual(colors.brand.amber.deep, '#B45309', 'Amber Deep should be #B45309');
      assert.strictEqual(colors.brand.amber.soft, '#FEF3C7', 'Amber Soft should be #FEF3C7');
      assert.strictEqual(colors.brand.amber.subtle, '#FFFBEB', 'Amber Subtle should be #FFFBEB');
      assert.strictEqual(colors.secondary, '#E68A00', 'Secondary alias should point to #E68A00');
    });

    it('defines Stone Canvas and Surface neutrals correctly', () => {
      assert.strictEqual(colors.canvas.stone, '#F9F8F5', 'Canvas Stone should be #F9F8F5');
      assert.strictEqual(colors.canvas.card, '#FFFFFF', 'Card surface should be #FFFFFF');
      assert.strictEqual(colors.canvas.subtle, '#F1EFEA', 'Subtle surface should be #F1EFEA');
      assert.strictEqual(colors.canvas.border, '#E2E8F0', 'Border should be #E2E8F0');
      assert.strictEqual(colors.canvas.borderFocus, '#006B5F', 'Border Focus should be #006B5F');
    });

    it('defines High-Contrast Accessible Text Ink tokens', () => {
      assert.strictEqual(colors.ink.primary, '#1A202C', 'Primary Ink should be #1A202C');
      assert.strictEqual(colors.ink.secondary, '#4A5568', 'Secondary Ink should be #4A5568');
      assert.strictEqual(colors.ink.muted, '#718096', 'Muted Ink should be #718096');
      assert.strictEqual(colors.ink.inverse, '#FFFFFF', 'Inverse Ink should be #FFFFFF');
    });

    it('defines Semantic Clinical Status indicators', () => {
      // Healthy (Forest Green)
      assert.strictEqual(colors.status.healthy.fg, '#15803D');
      assert.strictEqual(colors.status.healthy.bg, '#F0FDF4');
      assert.strictEqual(colors.status.healthy.border, '#A3E0BF');

      // Warning (Warm Amber)
      assert.strictEqual(colors.status.warning.fg, '#B45309');
      assert.strictEqual(colors.status.warning.bg, '#FFFBEB');
      assert.strictEqual(colors.status.warning.border, '#FDE68A');

      // Critical (Urgent Red & Soft Danger)
      assert.strictEqual(colors.status.critical.fg, '#DC2626');
      assert.strictEqual(colors.status.critical.bg, '#FEF2F2');
      assert.strictEqual(colors.status.critical.soft, '#FEE2E2');
      assert.strictEqual(colors.status.critical.border, '#FCA5A5');

      // Info (Clinical Cobalt)
      assert.strictEqual(colors.status.info.fg, '#1D4ED8');
      assert.strictEqual(colors.status.info.bg, '#EFF6FF');
    });
  });

  // ==========================================================================
  // 2. DARK-ON-AMBER RULE & WCAG CONTRAST VERIFICATION
  // ==========================================================================
  describe('Dark-on-Amber Rule & WCAG 2.1/2.2 AA Contrast Compliance', () => {
    it('outlaws white text on Savannah Amber (#E68A00) due to severe contrast failure (< 3.0:1)', () => {
      const whiteOnAmber = validateContrast('#FFFFFF', '#E68A00');
      assert.ok(whiteOnAmber.ratio < 3.0, `White on amber ratio is ${whiteOnAmber.ratio}, must be < 3.0`);
      assert.strictEqual(whiteOnAmber.passesAANormal, false, 'White on amber MUST fail WCAG AA normal');
      assert.strictEqual(whiteOnAmber.passesAALarge, false, 'White on amber MUST fail WCAG AA large');
    });

    it('mandates Charcoal Ink (#1A202C) on Savannah Amber (#E68A00) achieving compliant contrast (>= 4.5:1)', () => {
      const darkOnAmber = validateContrast('#1A202C', '#E68A00');
      assert.ok(darkOnAmber.ratio >= 4.5, `Dark on amber ratio ${darkOnAmber.ratio} must be >= 4.5 (WCAG AA)`);
      assert.strictEqual(darkOnAmber.passesAANormal, true, 'Dark on amber MUST pass WCAG AA normal');
      assert.strictEqual(darkOnAmber.passesAALarge, true, 'Dark on amber MUST pass WCAG AA large');
    });

    it('verifies Deep Amber (#B45309) on Soft Amber (#FFFBEB) passes WCAG AA (5.22:1)', () => {
      const deepOnSoft = validateContrast('#B45309', '#FFFBEB');
      assert.ok(deepOnSoft.ratio >= 4.5, `Deep on soft amber ratio ${deepOnSoft.ratio} must be >= 4.5`);
      assert.strictEqual(deepOnSoft.passesAANormal, true);
    });

    it('verifies Primary Ink (#1A202C) on Stone Canvas (#F9F8F5) passes WCAG AAA (14.85:1)', () => {
      const inkOnStone = validateContrast('#1A202C', '#F9F8F5');
      assert.ok(inkOnStone.ratio >= 7.0, `Ink on stone ratio ${inkOnStone.ratio} must be >= 7.0 (AAA)`);
      assert.strictEqual(inkOnStone.passesAAANormal, true);
    });

    it('assertDarkOnAmberCompliance throws an error when white text is passed on amber', () => {
      assert.throws(
        () => assertDarkOnAmberCompliance('#FFFFFF', '#E68A00'),
        /White text.*on Savannah Amber.*strictly outlawed/,
        'Should throw explicit violation on white text'
      );
    });

    it('assertDarkOnAmberCompliance succeeds when Charcoal Ink #1A202C is passed', () => {
      assert.doesNotThrow(() => assertDarkOnAmberCompliance('#1A202C', '#E68A00'));
    });

    it('getAccessibleTextColorOnAmber returns #1A202C for primary amber and #B45309 for soft amber', () => {
      assert.strictEqual(getAccessibleTextColorOnAmber('#E68A00'), '#1A202C');
      assert.strictEqual(getAccessibleTextColorOnAmber('#FEF3C7'), '#B45309');
      assert.strictEqual(getAccessibleTextColorOnAmber('#FFFBEB'), '#B45309');
    });

    it('DARK_ON_AMBER_RULE constant has correct specifications', () => {
      assert.strictEqual(DARK_ON_AMBER_RULE.outlawedContrastRatio, 2.4);
      assert.strictEqual(DARK_ON_AMBER_RULE.mandatoryContrastRatio, 6.71);
      assert.strictEqual(DARK_ON_AMBER_RULE.mandatoryTextColor, '#1A202C');
    });
  });

  // ==========================================================================
  // 3. 8-POINT SPATIAL GRID SCALE (2px to 48px)
  // ==========================================================================
  describe('8-Point Spatial Grid & Spacing Scale', () => {
    it('defines spacing scale from 2px up to 48px (and 64px)', () => {
      assert.strictEqual(spacing['2xs'], 2, '2xs should be 2px');
      assert.strictEqual(spacing.xs, 4, 'xs should be 4px');
      assert.strictEqual(spacing.sm, 8, 'sm should be 8px');
      assert.strictEqual(spacing.md, 12, 'md should be 12px');
      assert.strictEqual(spacing.base, 16, 'base should be 16px');
      assert.strictEqual(spacing.lg, 24, 'lg should be 24px');
      assert.strictEqual(spacing.xl, 32, 'xl should be 32px');
      assert.strictEqual(spacing['2xl'], 48, '2xl should be 48px');
      assert.strictEqual(spacing['3xl'], 64, '3xl should be 64px');
    });

    it('includes Swahili button clearance token (20px)', () => {
      assert.strictEqual(spacing['swahili-button'], 20, 'Swahili button padding clearance should be 20px');
    });
  });

  // ==========================================================================
  // 4. TYPOGRAPHY SYSTEM (Merriweather & Plus Jakarta Sans)
  // ==========================================================================
  describe('Typography System & OpenType Tabular Figures', () => {
    it('configures Merriweather for editorial headlines and Plus Jakarta Sans for interface', () => {
      assert.match(typography.fontFamily.display, /Merriweather/, 'Display font should contain Merriweather');
      assert.match(typography.fontFamily.serif, /Merriweather/, 'Serif font should contain Merriweather');
      assert.match(typography.fontFamily.sans, /Plus Jakarta Sans/, 'Sans font should contain Plus Jakarta Sans');
    });

    it('defines modular scale with required lineHeight, weight, and usage context', () => {
      const hero = typography.modularScale['display-hero'];
      assert.strictEqual(hero.fontSize, 32);
      assert.strictEqual(hero.lineHeight, 40);
      assert.strictEqual(hero.fontWeight, '700');
      assert.strictEqual(hero.fontFamily, 'Merriweather');

      const titleLarge = typography.modularScale['title-large'];
      assert.strictEqual(titleLarge.fontSize, 24);
      assert.strictEqual(titleLarge.lineHeight, 32);
      assert.strictEqual(titleLarge.fontFamily, 'Merriweather');

      const metric = typography.modularScale['data-metric'];
      assert.strictEqual(metric.fontSize, 22);
      assert.strictEqual(metric.lineHeight, 28);
      assert.strictEqual(metric.fontFamily, 'Plus Jakarta Sans');
    });

    it('exposes OpenType tabular numbers features for clinical precision', () => {
      assert.strictEqual(typography.features.tabularNums.fontVariantNumeric, 'tabular-nums');
      assert.strictEqual(typography.features.tabularNums.fontFeatureSettings, '"tnum" 1');
    });
  });

  // ==========================================================================
  // 5. TOUCH TARGETS, RADII, SHADOWS & SAFE AREAS
  // ==========================================================================
  describe('Touch Targets, Radii, Shadows & Safe Areas', () => {
    it('enforces 48px minimum touch target for WCAG 2.1/2.2 AA compliance', () => {
      assert.strictEqual(touchTarget.minSize, 48, 'Touch target minSize must be 48px');
      assert.strictEqual(touchTarget.clearance, 8, 'Touch target clearance must be 8px');
    });

    it('defines corner radii tokens matching design specifications', () => {
      assert.strictEqual(radii.sm, 6);
      assert.strictEqual(radii.md, 12);
      assert.strictEqual(radii.lg, 16);
      assert.strictEqual(radii.xl, 24);
      assert.strictEqual(radii.full, 9999);
      assert.strictEqual(radii['card-sm'], 12);
      assert.strictEqual(radii['card-md'], 16);
      assert.strictEqual(radii['card-lg'], 24);
    });

    it('defines elevation shadows including card, sheet, button, and glow', () => {
      assert.ok(shadows.card.includes('0 2px 8px'));
      assert.ok(shadows.sheet.includes('0 -4px 20px'));
      assert.ok(shadows.button.includes('0 4px 14px'));
      assert.ok(shadows.tealGlow.includes('rgba(0, 107, 95'));
      assert.ok(shadows.amberGlow.includes('rgba(230, 138, 0'));
    });

    it('defines safe area insets utilizing env(safe-area-inset-*)', () => {
      assert.strictEqual(safeArea.top, 'env(safe-area-inset-top, 0px)');
      assert.strictEqual(safeArea.bottom, 'env(safe-area-inset-bottom, 0px)');
      assert.strictEqual(safeArea.left, 'env(safe-area-inset-left, 0px)');
      assert.strictEqual(safeArea.right, 'env(safe-area-inset-right, 0px)');
    });

    it('generates complete CSS custom properties :root block string', () => {
      const cssStr = getCssCustomPropertiesString();
      assert.ok(cssStr.startsWith(':root {'), 'CSS string must start with :root {');
      assert.ok(cssStr.includes('--toto-teal-primary: #006B5F;'), 'Must contain --toto-teal-primary');
      assert.ok(cssStr.includes('--toto-amber-primary: #E68A00;'), 'Must contain --toto-amber-primary');
      assert.ok(cssStr.includes('--toto-canvas-stone: #F9F8F5;'), 'Must contain --toto-canvas-stone');
      assert.ok(cssStr.includes('--toto-space-2xl: 48px;'), 'Must contain --toto-space-2xl: 48px');
    });
  });

  // ==========================================================================
  // 6. SWAHILI LOCALIZATION & LAYOUT CLEARANCE RULES
  // ==========================================================================
  describe('Swahili Localization & Layout Clearance Rules', () => {
    it('sets Swahili expansion ratio to 1.25 (+25% layout clearance)', () => {
      assert.strictEqual(SWAHILI_LAYOUT_RULES.expansionRatio, 1.25);
      assert.strictEqual(SWAHILI_LAYOUT_RULES.minButtonPaddingPx, 20);
      assert.strictEqual(SWAHILI_LAYOUT_RULES.maxHeaderLines, 2);
      assert.strictEqual(SWAHILI_LAYOUT_RULES.allowClinicalEllipsis, false);
    });

    it('estimateSwahiliWidth calculates 1.25x expansion properly', () => {
      assert.strictEqual(estimateSwahiliWidth(100), 125);
      assert.strictEqual(estimateSwahiliWidth(20), 25);
    });

    it('validateClinicalDataDisplay flags ellipsis on clinical data', () => {
      const result = validateClinicalDataDisplay('vaccine_name', { textOverflow: 'ellipsis' });
      assert.strictEqual(result.compliant, false);
      assert.match(result.violation!, /must never be truncated with ellipsis/);
    });

    it('validateClinicalDataDisplay flags truncate class on clinical fields', () => {
      const result = validateClinicalDataDisplay('danger_sign', { className: 'truncate text-sm' });
      assert.strictEqual(result.compliant, false);
      assert.match(result.violation!, /must never be truncated with ellipsis/);
    });

    it('validateClinicalDataDisplay passes when clinical data allows wrapping', () => {
      const result = validateClinicalDataDisplay('vaccine_name', { className: 'break-words text-sm' });
      assert.strictEqual(result.compliant, true);
    });

    it('CLINICAL_FIELDS_REQUIRING_FULL_DISPLAY contains essential medical fields', () => {
      assert.ok(CLINICAL_FIELDS_REQUIRING_FULL_DISPLAY.includes('vaccine_name'));
      assert.ok(CLINICAL_FIELDS_REQUIRING_FULL_DISPLAY.includes('danger_sign'));
      assert.ok(CLINICAL_FIELDS_REQUIRING_FULL_DISPLAY.includes('appointment_date'));
      assert.ok(CLINICAL_FIELDS_REQUIRING_FULL_DISPLAY.includes('blood_pressure_reading'));
    });
  });

  // ==========================================================================
  // 7. BILINGUAL TRANSLATION DICTIONARY & UX WRITING PROTOCOLS
  // ==========================================================================
  describe('Bilingual Translation Dictionary & UX Writing Protocols', () => {
    it('maintains complete key parity between English and Kiswahili dictionaries', () => {
      const enKeys = Object.keys(translations.en);
      const swKeys = Object.keys(translations.sw);

      assert.strictEqual(enKeys.length, swKeys.length, 'English and Swahili dictionaries must have equal key count');

      for (const key of enKeys) {
        assert.ok(
          key in translations.sw,
          `Key "${key}" found in English dictionary is missing from Swahili dictionary`
        );
        assert.ok(
          translations.sw[key as keyof typeof translations.sw].length > 0,
          `Swahili value for key "${key}" must not be empty`
        );
      }
    });

    it('contains approved clinical translations from UX Writing Guide', () => {
      assert.strictEqual(translations.sw.antenatal_care, 'Kliniki ya Ujauzito (ANC)');
      assert.strictEqual(translations.sw.vaccination_schedule, 'Ratiba Kamili ya Chanjo');
      assert.strictEqual(translations.sw.fetal_movement, 'Mchezo wa Mtoto Tumboni');
      assert.strictEqual(translations.sw.danger_signs, 'Dalili za Hatari');
      assert.strictEqual(translations.sw.estimated_due_date, 'Tarehe ya Kujifungua');
      assert.strictEqual(translations.sw.muac, 'Kipimo cha Mkono (MUAC)');
    });

    it('encodes UX writing protocols for sensitive maternal workflows', () => {
      // Overdue catch-up care (dignified, non-shaming)
      assert.ok(uxWritingProtocols.overdueCatchUpCare.en.body.includes('Every dose counts'));
      assert.ok(uxWritingProtocols.overdueCatchUpCare.sw.headline.includes('Fursa ya Kupata Chanjo'));

      // Obstetric danger sign protocol (urgent action)
      assert.ok(uxWritingProtocols.obstetricDangerSign.en.headline.includes('URGENT'));
      assert.ok(uxWritingProtocols.obstetricDangerSign.sw.headline.includes('DHARURA'));

      // Bereavement protocol (compassionate support)
      assert.ok(uxWritingProtocols.bereavementSupport.en.headline.includes('holding you in our hearts'));
      assert.ok(uxWritingProtocols.bereavementSupport.sw.headline.includes('Tuko pamoja nawe'));
    });
  });

  // ==========================================================================
  // 8. JSON TOKENS & TAILWIND PRESET PARITY
  // ==========================================================================
  describe('JSON Tokens Parity & Tailwind Preset Verification', () => {
    it('tokens.json contains complete structured design tokens', () => {
      assert.strictEqual(tokensJson.theme, 'The Sunlit Botanical Editorial');
      assert.strictEqual(tokensJson.colors.brand.teal.primary, '#006B5F');
      assert.strictEqual(tokensJson.colors.brand.amber.primary, '#E68A00');
      assert.strictEqual(tokensJson.colors.canvas.stone, '#F9F8F5');
      assert.strictEqual(tokensJson.touchTarget.minSize, 48);
      assert.strictEqual(tokensJson.spacing.scale['2xl'], 48);
      assert.strictEqual(tokensJson.colors.contrastRules.mandatoryContrast, '6.71:1');
    });

    it('tailwind-preset.js correctly exports theme extensions', () => {
      const themeExt = tailwindPreset.theme.extend;
      assert.strictEqual(themeExt.colors.toto.teal.primary, '#006B5F');
      assert.strictEqual(themeExt.colors.toto.amber.primary, '#E68A00');
      assert.strictEqual(themeExt.colors.toto.canvas.stone, '#F9F8F5');
      assert.strictEqual(themeExt.colors.toto.ink.primary, '#1A202C');
      assert.strictEqual(themeExt.minHeight.touch, '48px');
      assert.strictEqual(themeExt.spacing['space-2xl'], '48px');
      assert.strictEqual(themeExt.spacing['swahili-btn'], '20px');
      assert.ok(themeExt.fontFamily.display.includes('Merriweather'));
      assert.ok(themeExt.fontFamily.sans[0].includes('Plus Jakarta Sans'));
      assert.strictEqual(tailwindPreset.plugins.length, 1, 'Preset must export custom plugin');
    });
  });
});
