export interface VaccineScheduleItem {
  name: string;
  age_weeks: number;
  description: string;
}

export const KENYA_VACCINE_SCHEDULE: VaccineScheduleItem[] = [
  { name: 'BCG', age_weeks: 0, description: 'Tuberculosis' },
  { name: 'OPV 0', age_weeks: 0, description: 'Polio (birth)' },
  { name: 'OPV 1 + Penta 1 + PCV 1 + Rota 1', age_weeks: 6, description: 'Polio, DPT-HepB-Hib, Pneumonia, Rotavirus' },
  { name: 'OPV 2 + Penta 2 + PCV 2 + Rota 2', age_weeks: 10, description: 'Second dose' },
  { name: 'OPV 3 + Penta 3 + PCV 3 + IPV', age_weeks: 14, description: 'Third dose + Inactivated Polio' },
  { name: 'Vitamin A + Measles 1', age_weeks: 36, description: '9 months: Measles & Vitamin A' },
  { name: 'Measles 2 + Vitamin A', age_weeks: 74, description: '18 months booster' },
];

export function generateVaccinationSchedule(childId: string, dobString: string) {
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) {
    throw new Error('Invalid birth date provided');
  }

  return KENYA_VACCINE_SCHEDULE.map(v => {
    const scheduledDate = new Date(dob.getTime() + v.age_weeks * 7 * 24 * 60 * 60 * 1000);
    return {
      child_id: childId,
      vaccine_name: v.name,
      age_weeks: v.age_weeks,
      scheduled_date: scheduledDate.toISOString().split('T')[0],
      status: 'scheduled' as const,
      dose_number: 1,
    };
  });
}

export function calculateDaysDifference(scheduledDateString: string, referenceDate: Date = new Date()): number {
  const scheduled = new Date(scheduledDateString);
  scheduled.setHours(0, 0, 0, 0);
  const reference = new Date(referenceDate);
  reference.setHours(0, 0, 0, 0);
  
  const diffTime = scheduled.getTime() - reference.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
