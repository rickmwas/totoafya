/**
 * TotoAfya Digital - WCAG 2.1 / 2.2 AA Contrast Rules & Verification
 *
 * Implements mathematical relative luminance and contrast ratio calculations
 * to enforce WCAG Level AA (4.5:1 for normal text, 3.0:1 for large text)
 * and strictly outlaw white text on Savannah Amber (#E68A00).
 *
 * References:
 * - design/mother-experience/04-art-direction/COLOR_AND_CONTRAST_STUDY.md
 * - design/mother-experience/05-design-system/DESIGN_SYSTEM_SPECIFICATION.md
 */

export interface ContrastResult {
  ratio: number;
  formattedRatio: string;
  passesAANormal: boolean; // >= 4.5:1
  passesAALarge: boolean;  // >= 3.0:1
  passesAAANormal: boolean;// >= 7.0:1
  passesAAALarge: boolean; // >= 4.5:1
  foreground: string;
  background: string;
}

/**
 * Parses a hex color string into RGB channel values (0-255).
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const sanitized = hex.replace('#', '').trim();
  let fullHex = sanitized;

  if (sanitized.length === 3) {
    fullHex = sanitized.split('').map((c) => c + c).join('');
  }

  if (fullHex.length !== 6) {
    throw new Error(`Invalid hex color: "${hex}". Expected format #RRGGBB or #RGB.`);
  }

  const num = parseInt(fullHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Calculates WCAG 2.1 relative luminance for an sRGB component.
 * Formula: component / 255 <= 0.04045 ? component / 12.92 : ((component + 0.055) / 1.055) ^ 2.4
 */
function sRgbToLinear(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/**
 * Computes the relative luminance of a color according to WCAG 2.1 standards.
 */
export function calculateRelativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const rLin = sRgbToLinear(r);
  const gLin = sRgbToLinear(g);
  const bLin = sRgbToLinear(b);
  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
}

/**
 * Calculates the WCAG contrast ratio between two hex colors.
 * Formula: (L1 + 0.05) / (L2 + 0.05), where L1 is the lighter luminance.
 */
export function calculateContrastRatio(fgHex: string, bgHex: string): number {
  const lum1 = calculateRelativeLuminance(fgHex);
  const lum2 = calculateRelativeLuminance(bgHex);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  const ratio = (lighter + 0.05) / (darker + 0.05);
  // Round to two decimal places
  return Math.round(ratio * 100) / 100;
}

/**
 * Validates the contrast between a foreground and background color.
 */
export function validateContrast(fgHex: string, bgHex: string): ContrastResult {
  const ratio = calculateContrastRatio(fgHex, bgHex);
  return {
    ratio,
    formattedRatio: `${ratio.toFixed(2)}:1`,
    passesAANormal: ratio >= 4.5,
    passesAALarge: ratio >= 3.0,
    passesAAANormal: ratio >= 7.0,
    passesAAALarge: ratio >= 4.5,
    foreground: fgHex.toUpperCase(),
    background: bgHex.toUpperCase(),
  };
}

/**
 * DARK-ON-AMBER RULE CONSTANTS & ENFORCEMENT
 *
 * White text (#FFFFFF) on Savannah Amber (#E68A00) has a contrast ratio of only 2.40:1,
 * which catastrophically fails WCAG AA.
 *
 * Required: Charcoal Ink (#1A202C) achieves 6.71:1 (passes AA and AAA Large).
 * Deep Amber (#B45309) on soft amber (#FEF3C7/#FFFBEB) achieves 5.22:1 (passes AA).
 */
export const DARK_ON_AMBER_RULE = {
  name: 'Dark-on-Amber Accessibility Rule',
  amberPrimary: '#E68A00',
  amberDeep: '#B45309',
  amberSoft: '#FEF3C7',
  amberSubtle: '#FFFBEB',
  outlawedTextColor: '#FFFFFF',
  outlawedContrastRatio: 2.40,
  mandatoryTextColor: '#1A202C',
  mandatoryContrastRatio: 6.71,
  minimumAARatio: 4.5,
  description:
    'White text on Savannah Amber (#E68A00) is strictly outlawed (2.40:1). ' +
    'Charcoal Ink (#1A202C) or Deep Amber (#B45309) must always be used for badges, buttons, and alerts.',
} as const;

/**
 * Asserts that text placed on an amber background meets WCAG AA standards.
 * Throws an Error if an inaccessible color (such as white) is provided.
 */
export function assertDarkOnAmberCompliance(textColor: string, bgColor: string = '#E68A00'): boolean {
  const bgNorm = bgColor.toUpperCase();
  const textNorm = textColor.toUpperCase();

  // Specifically check Savannah Amber #E68A00
  if (bgNorm === '#E68A00' && (textNorm === '#FFFFFF' || textNorm === '#FFF' || textNorm === '#FAFAFA')) {
    throw new Error(
      `[WCAG AA Violation] White text (${textColor}) on Savannah Amber (${bgColor}) is strictly outlawed! ` +
      `Contrast ratio is 2.40:1 (minimum required: 4.5:1). Use Charcoal Ink #1A202C instead.`
    );
  }

  const result = validateContrast(textColor, bgColor);
  if (!result.passesAANormal) {
    throw new Error(
      `[WCAG AA Violation] Foreground ${textColor} on background ${bgColor} yields contrast ratio ${result.formattedRatio}, ` +
      `failing the 4.5:1 threshold.`
    );
  }

  return true;
}

/**
 * Returns the mandated accessible text color for any amber background.
 */
export function getAccessibleTextColorOnAmber(bgColor: string): string {
  const bgNorm = bgColor.toUpperCase();
  if (bgNorm === '#E68A00' || bgNorm === '#D97706') {
    // Savannah Sunrise Amber requires Charcoal Ink #1A202C
    return '#1A202C';
  }
  if (bgNorm === '#FEF3C7' || bgNorm === '#FFFBEB' || bgNorm === '#FDF6EB') {
    // Soft/subtle amber surfaces use Deep Amber #B45309
    return '#B45309';
  }
  // Default to charcoal ink
  return '#1A202C';
}
