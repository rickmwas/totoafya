/**
 * @totoafya/business-logic - Antenatal Care (ANC) & Maternal Clinical Algorithms
 * 
 * Clinical references:
 * - Kenya National Guidelines for Quality Obstetrics and Perinatal Care (MoH Kenya)
 * - WHO Antenatal Care for a Positive Pregnancy Experience Guidelines
 * - KDPA 2019 / Digital Health Safety Standards
 */

export const DANGER_SIGNS_EN = [
  'Severe headache or blurred vision',
  'Vaginal bleeding',
  'Convulsions or fits',
  'High fever',
  'Baby stops moving or moves less',
  'Severe abdominal pain',
  'Swelling of face and hands',
  'Leaking fluid / water broke early',
  'Severe chest pain or difficulty breathing',
  'Loss of consciousness or fainting',
] as const;

export const DANGER_SIGNS_SW = [
  'Kuumwa na kichwa sana au kutoona vizuri',
  'Kutokwa na damu ukeni',
  'Kifafa cha mimba au degedege',
  'Homa kali au kutetemeka',
  'Mtoto kuacha kucheza au kucheza kwa nadra',
  'Maumivu makali ya tumbo',
  'Kuvimba uso na mikono',
  'Maji kuvunjika kabla ya wakati',
  'Maumivu makali ya kifua au kupumua kwa shida',
  'Kupoteza fahamu au kuzirai',
] as const;

export interface EDDResult {
  edd: string; // ISO date YYYY-MM-DD
  gestationalWeeks: number;
  gestationalDays: number;
  trimester: 1 | 2 | 3;
  source: 'lmp_naegele' | 'ultrasound' | 'guided_estimate';
  clinicalDisclaimer?: string;
  isPostTerm?: boolean;
}

export type FundalHeightLandmark = 'below_navel' | 'at_navel' | 'above_navel';

export interface DangerSignsEvaluation {
  isEmergency: boolean;
  redFlags: string[];
  action: 'emergency_triage' | 'routine_care';
  recommendationEn: string;
  recommendationSw: string;
}

export interface BPTriageResult {
  isValid: boolean;
  systolic: number;
  diastolic: number;
  category:
    | 'NORMAL'
    | 'ELEVATED'
    | 'STAGE_1_HYPERTENSION'
    | 'PRE_ECLAMPSIA_SUSPECTED'
    | 'SEVERE_HYPERTENSION_EMERGENCY'
    | 'INVALID_READING';
  isEmergency: boolean;
  alertRequired: boolean;
  clinicalAlert?: string;
  clinicalAlertSw?: string;
  validationError?: string;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Parses date inputs into a deterministic UTC midnight Date object.
 * Supports ISO date strings (YYYY-MM-DD), Date instances, and standard date strings.
 */
export function parseISODate(dateInput: string | Date): Date {
  if (dateInput instanceof Date) {
    if (isNaN(dateInput.getTime())) {
      throw new Error('Invalid Date object provided');
    }
    return new Date(Date.UTC(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate()));
  }

  if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();
    if (!trimmed) {
      throw new Error('Empty date string provided');
    }

    const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const day = parseInt(match[3], 10);
      const d = new Date(Date.UTC(year, month, day));
      if (d.getUTCFullYear() === year && d.getUTCMonth() === month && d.getUTCDate() === day) {
        return d;
      }
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return new Date(Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()));
    }
  }

  throw new Error(`Invalid date format provided: ${String(dateInput)}`);
}

/**
 * Formats a Date to ISO date string (YYYY-MM-DD) in UTC.
 */
export function formatISODate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Naegele's Rule EDD Calculation:
 * EDD = LMP + 280 days (40 completed weeks).
 * 
 * Correctly accounts for leap years, month rollovers, and gestational age calculation.
 * Gestational age is bounded between 1 and 44 weeks for active pregnancy.
 */
export function calculateEDDFromLMP(lmpDate: string | Date, referenceDate?: Date): EDDResult {
  const lmpParsed = parseISODate(lmpDate);
  const refParsed = referenceDate ? parseISODate(referenceDate) : parseISODate(new Date());

  // Naegele's rule: LMP + 280 days
  const eddDate = new Date(lmpParsed.getTime() + 280 * MS_PER_DAY);
  const eddIso = formatISODate(eddDate);

  const diffTime = refParsed.getTime() - lmpParsed.getTime();
  const totalDays = Math.max(0, Math.floor(diffTime / MS_PER_DAY));
  const rawWeeks = Math.floor(totalDays / 7);

  // Bounded between 1 and 44 weeks for clinically active pregnancy
  const gestationalWeeks = Math.min(44, Math.max(0, rawWeeks));
  const gestationalDays = totalDays % 7;

  let trimester: 1 | 2 | 3;
  if (gestationalWeeks <= 13) {
    trimester = 1;
  } else if (gestationalWeeks <= 27) {
    trimester = 2;
  } else {
    trimester = 3;
  }

  return {
    edd: eddIso,
    gestationalWeeks,
    gestationalDays,
    trimester,
    source: 'lmp_naegele',
    isPostTerm: rawWeeks > 41,
  };
}

/**
 * Calculates gestational age in completed weeks between reference date and LMP date.
 */
export function calculateGestationalAge(referenceDate: Date, lmpDate: Date): number {
  try {
    const refParsed = parseISODate(referenceDate);
    const lmpParsed = parseISODate(lmpDate);
    const diffTime = refParsed.getTime() - lmpParsed.getTime();
    if (diffTime < 0) return 0;
    return Math.floor(diffTime / (7 * MS_PER_DAY));
  } catch {
    return 0;
  }
}

/**
 * Backwards-compatible gestational age function.
 */
export function calculateGestationalAgeInWeeks(lmpString: string, referenceDate: Date = new Date()): number {
  try {
    const lmp = parseISODate(lmpString);
    const ref = parseISODate(referenceDate);
    const diffTime = ref.getTime() - lmp.getTime();
    if (diffTime < 0) return 0;
    return Math.floor(diffTime / (7 * MS_PER_DAY));
  } catch {
    return 0;
  }
}

/**
 * Backwards-compatible calculateEdd function.
 */
export function calculateEdd(lmpString: string): string {
  try {
    return calculateEDDFromLMP(lmpString).edd;
  } catch {
    return '';
  }
}

/**
 * Guided Trimester Estimator:
 * For mothers who do not know their exact LMP date.
 * Estimates gestational age and EDD from fundal height anatomical landmarks or approx months.
 * 
 * Landmarks:
 * - below_navel (< 20 weeks): fundus palpable below umbilicus (approx 14 weeks, Trimester 2)
 * - at_navel (~ 20 weeks): fundus at umbilicus (approx 20 weeks, Trimester 2)
 * - above_navel (> 20 weeks): fundus above umbilicus (approx 30 weeks, Trimester 3)
 */
export function estimateTrimesterAndEDD(options: {
  landmark?: FundalHeightLandmark;
  approximateMonthsAgo?: number;
  referenceDate?: Date;
}): EDDResult {
  const refParsed = options.referenceDate ? parseISODate(options.referenceDate) : parseISODate(new Date());

  let estimatedWeeks = 20;

  if (options.landmark === 'below_navel') {
    estimatedWeeks = 14;
  } else if (options.landmark === 'at_navel') {
    estimatedWeeks = 20;
  } else if (options.landmark === 'above_navel') {
    estimatedWeeks = 30;
  } else if (typeof options.approximateMonthsAgo === 'number' && !isNaN(options.approximateMonthsAgo)) {
    const clampedMonths = Math.max(1, Math.min(9, options.approximateMonthsAgo));
    estimatedWeeks = Math.round(clampedMonths * 4.33);
  }

  estimatedWeeks = Math.min(44, Math.max(1, estimatedWeeks));

  let trimester: 1 | 2 | 3;
  if (estimatedWeeks <= 13) {
    trimester = 1;
  } else if (estimatedWeeks <= 27) {
    trimester = 2;
  } else {
    trimester = 3;
  }

  // Estimated EDD = Reference Date + (40 - estimatedWeeks) weeks
  const remainingWeeks = 40 - estimatedWeeks;
  const eddDate = new Date(refParsed.getTime() + remainingWeeks * 7 * MS_PER_DAY);

  return {
    edd: formatISODate(eddDate),
    gestationalWeeks: estimatedWeeks,
    gestationalDays: 0,
    trimester,
    source: 'guided_estimate',
    clinicalDisclaimer:
      'Provisional estimate based on fundal height landmarks. Your nurse or midwife at the next ANC visit must verify your exact due date.',
  };
}

/**
 * Danger Signs Emergency Interception:
 * Zero-dependency, pure regex emergency sniffer matching critical Kenyan maternal/neonatal red-flag symptoms.
 * 
 * Swahili and English keywords:
 * - Bleeding / Damu: damu, bleeding, haemorrhage, kutokwa na damu
 * - Fits / Kifafa: kifafa, convulsions, seizures, degedege, fits, eclampsia
 * - Severe Headache / Vision: headache, kichwa kinauma, blurred vision, kutoona vizuri
 * - Fetal Movement: haisikiki, baby stops moving, mtoto kuacha kucheza, mtoto hachezi, reduced movement
 * - Severe Pain / Chest: severe abdominal pain, chest pain, maumivu makali ya kifua, maumivu makali ya tumbo
 * - Consciousness: unconsciousness, unconscious, kupoteza fahamu, kuzirai, fainting
 * - Fever / Chills: high fever, homa kali, chills, kutetemeka
 * - Swelling: swelling face, kuvimba uso, kuvimba mikono
 * - Leaking fluid: water broke, maji kuvunjika, leaking amniotic
 */
const EMERGENCY_REGEX_PATTERNS = [
  { pattern: /\b(damu|bleeding|haemorrhage|spotting|(\w*tokwa\s+na\s+damu)|\w*toka\s+damu)\b/i, label: 'Vaginal Bleeding (Kutokwa na Damu)' },
  { pattern: /\b(kifafa|convulsions?|fits?|seizures?|degedege|eclampsia|\w*kakamaa)\b/i, label: 'Convulsions / Fits (Kifafa cha Mimba)' },
  { pattern: /\b(severe\s+headache|headache|(\w*umwa\s+na\s+kichwa(\s+sana)?)|(kichwa\s+\w*uma(\s+sana)?))\b/i, label: 'Severe Headache (Kuumwa na Kichwa Sana)' },
  { pattern: /\b(blurred\s+vision|vision\s+loss|(kutoona|haoni|sioni)\s+vizuri|macho\s+(hayaoni|kutoona\s+vizuri))\b/i, label: 'Blurred Vision (Kutoona Vizuri)' },
  { pattern: /\b(haisikiki|hasikiki|baby\s+stops?\s+moving|moves?\s+less|\w*acha\s+kucheza|hachezi|reduced\s+fetal\s+movement)\b/i, label: 'Reduced/Absent Fetal Movement (Mtoto Haisikiki)' },
  { pattern: /\b(unconscious(ness)?|(\w*poteza\s+fahamu)|\w*zirai|\w*zimia|fainting|collapse)\b/i, label: 'Loss of Consciousness (Kupoteza Fahamu)' },
  { pattern: /\b(severe\s+chest\s+pain|chest\s+pain|maumivu\s+(makali\s+ya\s+)?kifua|kifua\s+\w*uma(\s+sana)?)\b/i, label: 'Severe Chest Pain (Maumivu Makali ya Kifua)' },
  { pattern: /\b(high\s+fever|homa\s+kali|homa\s+ya\s+juu|chills|\w*tetemeka)\b/i, label: 'High Fever / Chills (Homa Kali)' },
  { pattern: /\b(severe\s+abdominal\s+pain|maumivu\s+makali\s+ya\s+tumbo|tumbo\s+\w*uma\s+sana)\b/i, label: 'Severe Abdominal Pain (Maumivu Makali ya Tumbo)' },
  { pattern: /\b(water\s+broke|maji\s+(\w*vunjika|\w*toka|\w*mwagika)|leaking\s+fluid|ruptured\s+membranes)\b/i, label: 'Leaking Fluid / Water Broke (Maji Kuvunjika)' },
  { pattern: /\b((\w*vimba\s+(uso|mikono))|((uso|mikono)\s+\w*vimba)|swelling\s+of\s+(face|hands)|facial\s+(edema|swelling))\b/i, label: 'Facial/Hand Swelling (Kuvimba Uso na Mikono)' },
  { pattern: /\b(difficulty\s+breathing|\w*pumua\s+kwa\s+shida|shindwa\s+kupumua|\w*shindwa\s+kupumua|shortness\s+of\s+breath)\b/i, label: 'Difficulty Breathing (Kupumua kwa Shida)' },
];

export function evaluateDangerSigns(input: string | string[]): DangerSignsEvaluation {
  const textToScan = Array.isArray(input) ? input.join(' ') : input;
  const detectedFlags: string[] = [];

  for (const { pattern, label } of EMERGENCY_REGEX_PATTERNS) {
    if (pattern.test(textToScan)) {
      detectedFlags.push(label);
    }
  }

  const isEmergency = detectedFlags.length > 0;

  return {
    isEmergency,
    redFlags: detectedFlags,
    action: isEmergency ? 'emergency_triage' : 'routine_care',
    recommendationEn: isEmergency
      ? 'EMERGENCY: Obstetric or neonatal danger signs detected. Immediately proceed to the nearest emergency health facility.'
      : 'No emergency red-flag symptoms detected. Continue routine antenatal care.',
    recommendationSw: isEmergency
      ? 'DHARURA: Dalili za hatari za uzazi zimegunduliwa. Nenda mara moja kwenye kituo cha afya au hospitali iliyo karibu.'
      : 'Hakuna dalili za dharura zilizogunduliwa. Endelea na huduma ya kawaida ya kliniki.',
  };
}

/**
 * Blood Pressure Triage & Plausibility Validation:
 * Validates clinical plausibility and screens for pre-eclampsia / hypertensive crisis.
 * 
 * Plausibility rules:
 * - Reject non-numbers / NaN
 * - Reject Systolic <= Diastolic
 * - Reject out-of-bounds: Systolic < 50 or > 300; Diastolic < 30 or > 200
 * 
 * Triage thresholds (MoH Kenya Guidelines for Quality Obstetrics & Perinatal Care):
 * - Systolic >= 160 OR Diastolic >= 110: SEVERE_HYPERTENSION_EMERGENCY (Suspected severe pre-eclampsia)
 * - Systolic >= 140 OR Diastolic >= 90: PRE_ECLAMPSIA_SUSPECTED
 * - Systolic >= 130 OR Diastolic >= 85: STAGE_1_HYPERTENSION
 * - Systolic >= 120 AND Diastolic < 80: ELEVATED
 * - Systolic < 120 AND Diastolic < 80: NORMAL
 */
export function triageBloodPressure(systolic: number, diastolic: number): BPTriageResult {
  if (
    typeof systolic !== 'number' ||
    typeof diastolic !== 'number' ||
    isNaN(systolic) ||
    isNaN(diastolic)
  ) {
    return {
      isValid: false,
      systolic,
      diastolic,
      category: 'INVALID_READING',
      isEmergency: false,
      alertRequired: true,
      validationError: 'Blood pressure readings must be valid numeric values.',
    };
  }

  if (systolic <= diastolic) {
    return {
      isValid: false,
      systolic,
      diastolic,
      category: 'INVALID_READING',
      isEmergency: false,
      alertRequired: true,
      validationError: 'Systolic blood pressure must be strictly greater than diastolic blood pressure.',
    };
  }

  if (systolic < 50 || systolic > 300) {
    return {
      isValid: false,
      systolic,
      diastolic,
      category: 'INVALID_READING',
      isEmergency: false,
      alertRequired: true,
      validationError: `Systolic value ${systolic} mmHg is outside plausible physiological bounds (50-300 mmHg).`,
    };
  }

  if (diastolic < 30 || diastolic > 200) {
    return {
      isValid: false,
      systolic,
      diastolic,
      category: 'INVALID_READING',
      isEmergency: false,
      alertRequired: true,
      validationError: `Diastolic value ${diastolic} mmHg is outside plausible physiological bounds (30-200 mmHg).`,
    };
  }

  // Severe Hypertension Emergency (Impending eclampsia / hypertensive crisis)
  if (systolic >= 160 || diastolic >= 110) {
    return {
      isValid: true,
      systolic,
      diastolic,
      category: 'SEVERE_HYPERTENSION_EMERGENCY',
      isEmergency: true,
      alertRequired: true,
      clinicalAlert: 'CRITICAL: Severe hypertension (BP >= 160/110 mmHg). High risk of eclampsia. Immediate facility referral required.',
      clinicalAlertSw: 'HATARI KUBWA: Shinikizo la damu liko juu sana (BP >= 160/110 mmHg). Hatari ya kifafa cha mimba. Nenda hospitalini mara moja.',
    };
  }

  // Pre-eclampsia suspected
  if (systolic >= 140 || diastolic >= 90) {
    return {
      isValid: true,
      systolic,
      diastolic,
      category: 'PRE_ECLAMPSIA_SUSPECTED',
      isEmergency: true,
      alertRequired: true,
      clinicalAlert: 'ALERT: Suspected pre-eclampsia (BP >= 140/90 mmHg). Urgent clinical evaluation and proteinuria assessment required.',
      clinicalAlertSw: 'TAHADHARI: Dalili za shinikizo la damu la ujauzito (BP >= 140/90 mmHg). Inahitaji uchunguzi wa haraka kliniki.',
    };
  }

  if (systolic >= 130 || diastolic >= 85) {
    return {
      isValid: true,
      systolic,
      diastolic,
      category: 'STAGE_1_HYPERTENSION',
      isEmergency: false,
      alertRequired: false,
      clinicalAlert: 'Mildly elevated blood pressure. Continue routine monitoring at ANC visits.',
      clinicalAlertSw: 'Shinikizo la damu limepanda kidogo. Endelea na ufuatiliaji katika kliniki.',
    };
  }

  if (systolic >= 120 && diastolic < 80) {
    return {
      isValid: true,
      systolic,
      diastolic,
      category: 'ELEVATED',
      isEmergency: false,
      alertRequired: false,
    };
  }

  return {
    isValid: true,
    systolic,
    diastolic,
    category: 'NORMAL',
    isEmergency: false,
    alertRequired: false,
  };
}

// ============================================================================
// FETAL KICK COUNTING MONITORING PROTOCOL
// ============================================================================

export interface KickCountSessionInput {
  kickTimestamps?: Array<number | Date | string>;
  windowMinutes?: number;
  targetKicks?: number;
  sessionStartTime?: number | Date | string;
  currentTime?: number | Date | string;
}

export interface KickCountSessionResult {
  count: number;
  isComplete: boolean;
  elapsedMinutes: number;
  alertTriggered: boolean;
  action: 'emergency_triage' | 'reassurance' | 'continue_monitoring';
  messageEn: string;
  messageSw: string;
}

/**
 * Evaluates a fetal kick counter session according to standard clinical protocol
 * (10 kicks within a 2-hour / 120-minute window).
 *
 * If < 10 kicks are detected within 2 hours, triggers an emergency triage alert.
 * If 10 kicks are reached within the window, provides clinical reassurance.
 */
export function evaluateKickCountSession(input: KickCountSessionInput): KickCountSessionResult {
  const {
    kickTimestamps = [],
    windowMinutes = 120,
    targetKicks = 10,
    sessionStartTime,
    currentTime,
  } = input || {};

  // Parse and normalize kick timestamps (milliseconds)
  const parsedTimestamps: number[] = [];
  for (const item of kickTimestamps) {
    if (item instanceof Date && !isNaN(item.getTime())) {
      parsedTimestamps.push(item.getTime());
    } else if (typeof item === 'number' && !isNaN(item) && isFinite(item)) {
      parsedTimestamps.push(item);
    } else if (typeof item === 'string') {
      const parsed = Date.parse(item);
      if (!isNaN(parsed)) {
        parsedTimestamps.push(parsed);
      }
    }
  }

  // Sort chronologically ascending
  parsedTimestamps.sort((a, b) => a - b);
  const count = parsedTimestamps.length;
  const isComplete = count >= targetKicks;

  // Resolve session start time
  let startMs: number;
  if (sessionStartTime instanceof Date && !isNaN(sessionStartTime.getTime())) {
    startMs = sessionStartTime.getTime();
  } else if (typeof sessionStartTime === 'number' && !isNaN(sessionStartTime)) {
    startMs = sessionStartTime;
  } else if (typeof sessionStartTime === 'string' && !isNaN(Date.parse(sessionStartTime))) {
    startMs = Date.parse(sessionStartTime);
  } else if (parsedTimestamps.length > 0) {
    startMs = parsedTimestamps[0];
  } else {
    startMs = Date.now();
  }

  // Resolve reference current time
  let currentMs: number;
  if (currentTime instanceof Date && !isNaN(currentTime.getTime())) {
    currentMs = currentTime.getTime();
  } else if (typeof currentTime === 'number' && !isNaN(currentTime)) {
    currentMs = currentTime;
  } else if (typeof currentTime === 'string' && !isNaN(Date.parse(currentTime))) {
    currentMs = Date.parse(currentTime);
  } else if (isComplete && parsedTimestamps.length >= targetKicks) {
    currentMs = parsedTimestamps[targetKicks - 1];
  } else if (parsedTimestamps.length > 0) {
    currentMs = parsedTimestamps[parsedTimestamps.length - 1];
  } else {
    currentMs = startMs;
  }

  // Calculate elapsed minutes (bounded >= 0, rounded to 1 decimal)
  const diffMs = Math.max(0, currentMs - startMs);
  const elapsedMinutes = Math.round((diffMs / (60 * 1000)) * 10) / 10;

  // An alert is triggered if:
  // 1. Elapsed time has reached or exceeded the monitoring window (>= windowMinutes) and kicks < targetKicks
  // 2. Or explicit timeout with fewer than target kicks
  const alertTriggered = !isComplete && elapsedMinutes >= windowMinutes;

  let action: 'emergency_triage' | 'reassurance' | 'continue_monitoring';
  let messageEn: string;
  let messageSw: string;

  if (alertTriggered) {
    action = 'emergency_triage';
    messageEn = `Movement alert: Only ${count} of ${targetKicks} kicks detected within ${windowMinutes} minutes. Baby may be resting or in distress. Seek immediate clinical assessment.`;
    messageSw = `Tahadhari ya mtoto: Mateke ${count} pekee kati ya ${targetKicks} yamerekodiwa ndani ya dakika ${windowMinutes}. Nenda hospitalini au zungumza na mhudumu wa afya mara moja.`;
  } else if (isComplete) {
    action = 'reassurance';
    messageEn = `Reassurance: ${count} kicks reached in ${elapsedMinutes} minutes. Fetal movement is active and healthy.`;
    messageSw = `Uthibitisho: Mateke ${count} yamefikiwa ndani ya dakika ${elapsedMinutes}. Mtoto anacheza vizuri na yuko salama.`;
  } else {
    action = 'continue_monitoring';
    const remainingMins = Math.max(0, Math.round(windowMinutes - elapsedMinutes));
    messageEn = `Monitoring active: ${count} of ${targetKicks} kicks recorded. Continue resting on your left side (${remainingMins} minutes left in this session).`;
    messageSw = `Ufuatiliaji unaendelea: Mateke ${count} kati ya ${targetKicks} yamerekodiwa. Endelea kupumzika kwa upande wa kushoto (zimesalia dakika ${remainingMins}).`;
  }

  return {
    count,
    isComplete,
    elapsedMinutes,
    alertTriggered,
    action,
    messageEn,
    messageSw,
  };
}

