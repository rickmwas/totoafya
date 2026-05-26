export const DANGER_SIGNS_EN = [
  'Severe headache or blurred vision',
  'Vaginal bleeding',
  'Convulsions or fits',
  'High fever',
  'Baby stops moving or moves less',
  'Severe abdominal pain',
  'Swelling of face and hands',
];

export const DANGER_SIGNS_SW = [
  'Kuumwa na kichwa sana au kutoona vizuri',
  'Kutokwa na damu ukeni',
  'Kifafa cha mimba',
  'Homa kali',
  'Mtoto kuacha kucheza au kucheza kwa nadra',
  'Maumivu makali ya tumbo',
  'Kuvimba uso na mikono',
];

export function calculateGestationalAgeInWeeks(lmpString: string, referenceDate: Date = new Date()): number {
  const lmp = new Date(lmpString);
  if (isNaN(lmp.getTime())) return 0;
  
  const diffTime = referenceDate.getTime() - lmp.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.floor(diffDays / 7));
}

export function calculateEdd(lmpString: string): string {
  const lmp = new Date(lmpString);
  if (isNaN(lmp.getTime())) return '';
  
  // Naegele's rule: LMP + 280 days (40 weeks)
  const edd = new Date(lmp.getTime() + 280 * 24 * 60 * 60 * 1000);
  return edd.toISOString().split('T')[0];
}
