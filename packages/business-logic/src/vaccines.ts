/**
 * @totoafya/business-logic - Kenya Expanded Programme on Immunization (KEPI)
 * 
 * Clinical references:
 * - Kenya National Immunization Policy and Guidelines (MoH Kenya / NVIP)
 * - WHO Immunization in Practice (IIP) Guidelines
 * - Child Health Handbook (MoH 216 booklet)
 */

export interface VaccineDose {
  antigen: string;
  diseaseTarget: string;
  route: 'Intradermal' | 'Oral' | 'Intramuscular' | 'Subcutaneous';
  doseNumber: number;
  site?: string;
}

export interface KEPIClinicVisit {
  visitNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  visitLabelEn: string;
  visitLabelSw: string;
  targetAgeWeeks: number;
  targetAgeDescriptionEn: string;
  targetAgeDescriptionSw: string;
  scheduledDate: string; // ISO date YYYY-MM-DD
  vaccines: VaccineDose[];
  clinicalNotesEn: string;
  clinicalNotesSw: string;
}

export interface ImmunizationSchedule {
  dob: string; // ISO date YYYY-MM-DD
  childId?: string;
  visits: KEPIClinicVisit[];
  totalDoses: number;
}

export interface VaccineScheduleItem {
  name: string;
  age_weeks: number;
  description: string;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function parseDateUTC(dateInput: string | Date): Date {
  if (dateInput instanceof Date) {
    if (isNaN(dateInput.getTime())) throw new Error('Invalid Date object provided');
    return new Date(Date.UTC(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate()));
  }

  if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();
    if (!trimmed) throw new Error('Invalid birth date provided');

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

  throw new Error('Invalid birth date provided');
}

function formatDateUTC(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Canonical Kenya Expanded Programme on Immunization (KEPI) 7-Visit Cascade Definitions
 */
export const KEPI_7_VISIT_DEFINITIONS: Array<{
  visitNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  visitLabelEn: string;
  visitLabelSw: string;
  targetAgeWeeks: number;
  targetAgeDescriptionEn: string;
  targetAgeDescriptionSw: string;
  vaccines: VaccineDose[];
  clinicalNotesEn: string;
  clinicalNotesSw: string;
}> = [
  {
    visitNumber: 1,
    visitLabelEn: 'Birth Visit',
    visitLabelSw: 'Ziara ya Kuzaliwa',
    targetAgeWeeks: 0,
    targetAgeDescriptionEn: 'At Birth (within first 2 weeks)',
    targetAgeDescriptionSw: 'Wakati wa Kuzaliwa (ndani ya wiki 2 za kwanza)',
    vaccines: [
      {
        antigen: 'BCG',
        diseaseTarget: 'Tuberculosis (TB)',
        route: 'Intradermal',
        doseNumber: 1,
        site: 'Right Upper Arm',
      },
      {
        antigen: 'OPV 0',
        diseaseTarget: 'Poliomyelitis (Infantile Paralysis)',
        route: 'Oral',
        doseNumber: 0,
        site: 'Mouth (2 drops)',
      },
    ],
    clinicalNotesEn: 'Administer BCG and OPV 0 at birth or at first contact before 2 weeks of life.',
    clinicalNotesSw: 'Toa chanjo ya BCG na OPV 0 mtoto anapozaliwa au kabla ya wiki 2 za maisha.',
  },
  {
    visitNumber: 2,
    visitLabelEn: '6 Weeks Visit',
    visitLabelSw: 'Ziara ya Wiki 6',
    targetAgeWeeks: 6,
    targetAgeDescriptionEn: '6 Weeks of Age',
    targetAgeDescriptionSw: 'Wiki 6 za Umri',
    vaccines: [
      {
        antigen: 'OPV 1',
        diseaseTarget: 'Poliomyelitis',
        route: 'Oral',
        doseNumber: 1,
        site: 'Mouth (2 drops)',
      },
      {
        antigen: 'Pentavalent 1 (DTP-HepB-Hib 1)',
        diseaseTarget: 'Diphtheria, Tetanus, Pertussis, Hepatitis B, Haemophilus influenzae b',
        route: 'Intramuscular',
        doseNumber: 1,
        site: 'Left Anterolateral Thigh',
      },
      {
        antigen: 'PCV 1',
        diseaseTarget: 'Pneumococcal Pneumonia and Meningitis',
        route: 'Intramuscular',
        doseNumber: 1,
        site: 'Right Anterolateral Thigh',
      },
      {
        antigen: 'Rotavirus 1',
        diseaseTarget: 'Rotavirus Diarrhoea',
        route: 'Oral',
        doseNumber: 1,
        site: 'Mouth (1.5 mL)',
      },
    ],
    clinicalNotesEn: 'Ensure 6 completed weeks before administration of first multi-antigen cascade.',
    clinicalNotesSw: 'Hakikisha mtoto ametimiza wiki 6 kamili kabla ya kumpa chanjo za mwanzo.',
  },
  {
    visitNumber: 3,
    visitLabelEn: '10 Weeks Visit',
    visitLabelSw: 'Ziara ya Wiki 10',
    targetAgeWeeks: 10,
    targetAgeDescriptionEn: '10 Weeks of Age (4 weeks after dose 1)',
    targetAgeDescriptionSw: 'Wiki 10 za Umri (wiki 4 baada ya dozi 1)',
    vaccines: [
      {
        antigen: 'OPV 2',
        diseaseTarget: 'Poliomyelitis',
        route: 'Oral',
        doseNumber: 2,
        site: 'Mouth (2 drops)',
      },
      {
        antigen: 'Pentavalent 2 (DTP-HepB-Hib 2)',
        diseaseTarget: 'Diphtheria, Tetanus, Pertussis, Hepatitis B, Hib',
        route: 'Intramuscular',
        doseNumber: 2,
        site: 'Left Anterolateral Thigh',
      },
      {
        antigen: 'PCV 2',
        diseaseTarget: 'Pneumococcal Pneumonia and Meningitis',
        route: 'Intramuscular',
        doseNumber: 2,
        site: 'Right Anterolateral Thigh',
      },
      {
        antigen: 'Rotavirus 2',
        diseaseTarget: 'Rotavirus Diarrhoea',
        route: 'Oral',
        doseNumber: 2,
        site: 'Mouth (1.5 mL)',
      },
    ],
    clinicalNotesEn: 'Maintain minimum 4-week interval from previous Pentavalent/PCV/Rota dose.',
    clinicalNotesSw: 'Zingatia muda wa angalau wiki 4 tangu dozi ya kwanza ya Pentavalent/PCV/Rota.',
  },
  {
    visitNumber: 4,
    visitLabelEn: '14 Weeks Visit',
    visitLabelSw: 'Ziara ya Wiki 14',
    targetAgeWeeks: 14,
    targetAgeDescriptionEn: '14 Weeks of Age (4 weeks after dose 2)',
    targetAgeDescriptionSw: 'Wiki 14 za Umri (wiki 4 baada ya dozi 2)',
    vaccines: [
      {
        antigen: 'OPV 3',
        diseaseTarget: 'Poliomyelitis',
        route: 'Oral',
        doseNumber: 3,
        site: 'Mouth (2 drops)',
      },
      {
        antigen: 'Pentavalent 3 (DTP-HepB-Hib 3)',
        diseaseTarget: 'Diphtheria, Tetanus, Pertussis, Hepatitis B, Hib',
        route: 'Intramuscular',
        doseNumber: 3,
        site: 'Left Anterolateral Thigh',
      },
      {
        antigen: 'PCV 3',
        diseaseTarget: 'Pneumococcal Pneumonia and Meningitis',
        route: 'Intramuscular',
        doseNumber: 3,
        site: 'Right Anterolateral Thigh',
      },
      {
        antigen: 'IPV 1',
        diseaseTarget: 'Inactivated Polio (Types 1, 2, and 3)',
        route: 'Intramuscular',
        doseNumber: 1,
        site: 'Right Anterolateral Thigh (separate from PCV)',
      },
    ],
    clinicalNotesEn: 'IPV provides crucial supplemental humoral immunity against Polio type 2.',
    clinicalNotesSw: 'Chanjo ya IPV inaimarisha kinga dhidi ya virusi vya polio aina zote tatu.',
  },
  {
    visitNumber: 5,
    visitLabelEn: '6 Months Visit',
    visitLabelSw: 'Ziara ya Miezi 6',
    targetAgeWeeks: 26,
    targetAgeDescriptionEn: '6 Months of Age',
    targetAgeDescriptionSw: 'Miezi 6 ya Umri',
    vaccines: [
      {
        antigen: 'Vitamin A Capsule 1 (100,000 IU)',
        diseaseTarget: 'Vitamin A Deficiency & Immune Enhancement',
        route: 'Oral',
        doseNumber: 1,
        site: 'Mouth (Blue Capsule cut and squeezed)',
      },
    ],
    clinicalNotesEn: 'Initiate 6-monthly Vitamin A supplementation alongside complementary feeding assessment.',
    clinicalNotesSw: 'Anzisha kutoa matone ya Vitamini A kila baada ya miezi 6 pamoja na kuanza vyakula vya ziada.',
  },
  {
    visitNumber: 6,
    visitLabelEn: '9 Months Visit',
    visitLabelSw: 'Ziara ya Miezi 9',
    targetAgeWeeks: 39,
    targetAgeDescriptionEn: '9 Months of Age',
    targetAgeDescriptionSw: 'Miezi 9 ya Umri',
    vaccines: [
      {
        antigen: 'Measles-Rubella 1 (MR 1)',
        diseaseTarget: 'Measles and Congenital Rubella Syndrome',
        route: 'Subcutaneous',
        doseNumber: 1,
        site: 'Right Upper Arm',
      },
      {
        antigen: 'Yellow Fever',
        diseaseTarget: 'Yellow Fever Virus',
        route: 'Subcutaneous',
        doseNumber: 1,
        site: 'Left Upper Arm',
      },
    ],
    clinicalNotesEn: 'Yellow Fever vaccine administered in designated endemic counties (Rift Valley, Western, Nyanza).',
    clinicalNotesSw: 'Chanjo ya homa ya manjano hutolewa katika kaunti zilizoteuliwa nchini Kenya.',
  },
  {
    visitNumber: 7,
    visitLabelEn: '18 Months Visit',
    visitLabelSw: 'Ziara ya Miezi 18',
    targetAgeWeeks: 78,
    targetAgeDescriptionEn: '18 Months of Age',
    targetAgeDescriptionSw: 'Miezi 18 ya Umri',
    vaccines: [
      {
        antigen: 'Measles-Rubella 2 (MR 2 Booster)',
        diseaseTarget: 'Measles and Rubella Second Opportunity Booster',
        route: 'Subcutaneous',
        doseNumber: 2,
        site: 'Right Upper Arm',
      },
      {
        antigen: 'Vitamin A Capsule 3 (200,000 IU)',
        diseaseTarget: 'Vitamin A Deficiency & Childhood Immunity',
        route: 'Oral',
        doseNumber: 3,
        site: 'Mouth (Red Capsule)',
      },
    ],
    clinicalNotesEn: 'MR 2 booster ensures >95% long-term community immunity against measles resurgence.',
    clinicalNotesSw: 'Dozi ya pili ya ukambi inamkinga mtoto maishani dhidi ya ugonjwa hatari wa ukambi.',
  },
];

/**
 * 100% Deterministic KEPI 7-Visit Vaccine Cascade Generator based on Date of Birth.
 */
export function calculateKEPISchedule(dob: string | Date, childId?: string): ImmunizationSchedule {
  const dobParsed = parseDateUTC(dob);
  const dobIso = formatDateUTC(dobParsed);

  let totalDoses = 0;
  const visits: KEPIClinicVisit[] = KEPI_7_VISIT_DEFINITIONS.map(def => {
    totalDoses += def.vaccines.length;
    const scheduledTime = dobParsed.getTime() + def.targetAgeWeeks * 7 * MS_PER_DAY;
    const scheduledDate = formatDateUTC(new Date(scheduledTime));

    return {
      visitNumber: def.visitNumber,
      visitLabelEn: def.visitLabelEn,
      visitLabelSw: def.visitLabelSw,
      targetAgeWeeks: def.targetAgeWeeks,
      targetAgeDescriptionEn: def.targetAgeDescriptionEn,
      targetAgeDescriptionSw: def.targetAgeDescriptionSw,
      scheduledDate,
      vaccines: def.vaccines,
      clinicalNotesEn: def.clinicalNotesEn,
      clinicalNotesSw: def.clinicalNotesSw,
    };
  });

  return {
    dob: dobIso,
    childId,
    visits,
    totalDoses,
  };
}

/**
 * Calculates catch-up date enforcing the minimum KEPI interval (default 4 weeks / 28 days)
 * after a delayed dose.
 */
export function calculateCatchUpDate(lastDoseDate: string | Date, minIntervalWeeks: number = 4): string {
  const lastParsed = parseDateUTC(lastDoseDate);
  const nextEligibleTime = lastParsed.getTime() + minIntervalWeeks * 7 * MS_PER_DAY;
  return formatDateUTC(new Date(nextEligibleTime));
}

/**
 * Classifies immunization status for UI display without shame or punitive copy.
 */
export function classifyVaccineDueStatus(
  scheduledDate: string | Date,
  referenceDate: Date = new Date()
): 'upcoming' | 'due' | 'catch_up_due' {
  const scheduled = parseDateUTC(scheduledDate);
  const reference = parseDateUTC(referenceDate);

  const diffDays = Math.ceil((scheduled.getTime() - reference.getTime()) / MS_PER_DAY);

  if (diffDays > 14) {
    return 'upcoming';
  }
  if (diffDays >= -14) {
    return 'due';
  }
  return 'catch_up_due'; // Dignity guarantee: non-punitive Savannah Ochre "Catch-up Due"
}

// Backwards-compatible schedule item list
export const KENYA_VACCINE_SCHEDULE: VaccineScheduleItem[] = [
  { name: 'BCG', age_weeks: 0, description: 'Tuberculosis' },
  { name: 'OPV 0', age_weeks: 0, description: 'Polio (birth)' },
  { name: 'OPV 1 + Penta 1 + PCV 1 + Rota 1', age_weeks: 6, description: 'Polio, DPT-HepB-Hib, Pneumonia, Rotavirus' },
  { name: 'OPV 2 + Penta 2 + PCV 2 + Rota 2', age_weeks: 10, description: 'Second dose' },
  { name: 'OPV 3 + Penta 3 + PCV 3 + IPV', age_weeks: 14, description: 'Third dose + Inactivated Polio' },
  { name: 'Vitamin A + Measles 1', age_weeks: 26, description: '6 months: Vitamin A & 9 months Measles' },
  { name: 'Measles 2 + Vitamin A', age_weeks: 78, description: '18 months booster' },
];

/**
 * Backwards-compatible generateVaccinationSchedule function
 */
export function generateVaccinationSchedule(childId: string, dobString: string) {
  const dob = parseDateUTC(dobString);

  return KENYA_VACCINE_SCHEDULE.map(v => {
    const scheduledDate = new Date(dob.getTime() + v.age_weeks * 7 * MS_PER_DAY);
    return {
      child_id: childId,
      vaccine_name: v.name,
      age_weeks: v.age_weeks,
      scheduled_date: formatDateUTC(scheduledDate),
      status: 'scheduled' as const,
      dose_number: 1,
    };
  });
}

/**
 * Backwards-compatible calculateDaysDifference function
 */
export function calculateDaysDifference(scheduledDateString: string, referenceDate: Date = new Date()): number {
  try {
    const scheduled = parseDateUTC(scheduledDateString);
    const reference = parseDateUTC(referenceDate);
    const diffTime = scheduled.getTime() - reference.getTime();
    return Math.ceil(diffTime / MS_PER_DAY);
  } catch {
    return 0;
  }
}
