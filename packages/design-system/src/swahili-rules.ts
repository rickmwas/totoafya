/**
 * TotoAfya Digital - Swahili Localization & Layout Clearance Rules
 *
 * Implements layout expansion rules to prevent text clipping and truncation
 * when rendering agglutinative Kiswahili copy (+15% to +25% average string expansion,
 * up to +69% on short action chips).
 *
 * References:
 * - design/mother-experience/04-art-direction/TYPOGRAPHY_STUDY.md (Section 4)
 * - design/mother-experience/01-research/UX_WRITING_GUIDE.md
 */

export interface SwahiliLayoutRuleConfig {
  expansionRatio: number;
  minButtonPaddingPx: number;
  maxHeaderLines: number;
  allowClinicalEllipsis: boolean;
}

export const SWAHILI_LAYOUT_RULES: SwahiliLayoutRuleConfig = {
  /**
   * Kiswahili text expands by 1.25x (25%) on average relative to English.
   * UI components must allocate this space to avoid clipping.
   */
  expansionRatio: 1.25,

  /**
   * Action buttons must never have fixed widths.
   * On mobile cards, buttons must either take 100% width or provide at least
   * 20px (px-5) horizontal padding to accommodate longer Swahili phrases.
   */
  minButtonPaddingPx: 20,

  /**
   * Page headers, card titles, and section headlines must allocate vertical
   * clearance for at least 2 wrapped lines without colliding with trailing icons.
   */
  maxHeaderLines: 2,

  /**
   * Strictly forbid text-overflow: ellipsis on clinical data (dates, vaccines, vitals, red flags).
   */
  allowClinicalEllipsis: false,
};

/**
 * List of sensitive clinical fields that MUST NEVER be truncated with an ellipsis.
 */
export const CLINICAL_FIELDS_REQUIRING_FULL_DISPLAY = [
  'vaccine_name',
  'antigen_name',
  'appointment_date',
  'danger_sign',
  'dosage_instruction',
  'fetal_movement_alert',
  'blood_pressure_reading',
  'muac_classification',
  'emergency_contact',
  'bereavement_support',
] as const;

export type ClinicalFieldKey = (typeof CLINICAL_FIELDS_REQUIRING_FULL_DISPLAY)[number];

/**
 * Verifies that a given UI property or class set does not truncate clinical data.
 * Throws an error or returns false if ellipsis / nowrap is detected on clinical fields.
 */
export function validateClinicalDataDisplay(
  fieldKey: string,
  styles: { overflow?: string; textOverflow?: string; whiteSpace?: string; className?: string }
): { compliant: boolean; violation?: string } {
  const isClinical = CLINICAL_FIELDS_REQUIRING_FULL_DISPLAY.includes(fieldKey as ClinicalFieldKey);

  if (isClinical) {
    if (styles.textOverflow === 'ellipsis' || styles.className?.includes('truncate')) {
      return {
        compliant: false,
        violation: `[Swahili Rule Violation] Field "${fieldKey}" is clinical data and must never be truncated with ellipsis.`,
      };
    }
    if (styles.whiteSpace === 'nowrap' && !styles.className?.includes('overflow-x-auto')) {
      return {
        compliant: false,
        violation: `[Swahili Rule Violation] Field "${fieldKey}" must allow text wrapping to at least 2 lines.`,
      };
    }
  }

  return { compliant: true };
}

/**
 * Estimates the pixel width or character capacity required when translating
 * an English string to Kiswahili.
 */
export function estimateSwahiliWidth(englishWidthOrCharCount: number): number {
  return Math.ceil(englishWidthOrCharCount * SWAHILI_LAYOUT_RULES.expansionRatio);
}

/**
 * Returns recommended Tailwind CSS utility class combinations that adhere to
 * Swahili +25% padding and header wrapping requirements.
 */
export const swahiliLayoutUtilities = {
  // Mobile button clearance (+20px / px-5 horizontal padding)
  buttonFlex: 'w-full sm:w-auto px-5 py-3 min-h-[48px] justify-center items-center',
  // Section header wrapping clearance
  headerTwoLine: 'min-h-[3rem] leading-tight break-words line-clamp-2',
  // Non-truncated clinical data container
  clinicalDataContainer: 'whitespace-normal break-words overflow-visible',
  // Pill chip padding for extended Swahili nouns
  chipClearance: 'px-3.5 py-1.5 min-h-[32px] inline-flex items-center gap-1.5',
} as const;
