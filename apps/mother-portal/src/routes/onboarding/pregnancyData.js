/**
 * Cultural Kenyan Fetal Size Analogies & Agricultural Produce Mappings
 * Aligned with:
 * - design/mother-experience/04-art-direction/PHOTOGRAPHY_AND_ILLUSTRATION_GUIDE.md
 * - design/mother-experience/07-high-fidelity/HIGH_FIDELITY_SCREEN_DESIGNS.md
 */

export const KENYAN_FETAL_SIZE_ANALOGIES = {
  4: { en: 'Poppy Seed', sw: 'Mbegu ya Khaskhas', lengthCm: 0.1, weightG: 0.1 },
  5: { en: 'Sesame Seed', sw: 'Mbegu ya Ufuta', lengthCm: 0.2, weightG: 0.2 },
  6: { en: 'Lentil', sw: 'Dengu', lengthCm: 0.4, weightG: 0.5 },
  7: { en: 'Blueberry', sw: 'Kiberi cha Bluu', lengthCm: 1.0, weightG: 1.0 },
  8: { en: 'Baobab Seed', sw: 'Mbegu ya Ubuyu', lengthCm: 1.6, weightG: 1.0 },
  9: { en: 'Cherry', sw: 'Cheri', lengthCm: 2.3, weightG: 2.0 },
  10: { en: 'Strawberry', sw: 'Sitroberi', lengthCm: 3.1, weightG: 4.0 },
  11: { en: 'Lime', sw: 'Ndimu', lengthCm: 4.1, weightG: 7.0 },
  12: { en: 'Passion Fruit', sw: 'Pashoni (Tunda la Karanga)', lengthCm: 5.4, weightG: 14 },
  13: { en: 'Lemon', sw: 'Limau', lengthCm: 7.4, weightG: 23 },
  14: { en: 'Navel Orange', sw: 'Chungwa la Kitovu', lengthCm: 8.7, weightG: 43 },
  15: { en: 'Apple', sw: 'Tofaa', lengthCm: 10.1, weightG: 70 },
  16: { en: 'Ripe Hass Avocado', sw: 'Parachichi lililoiva', lengthCm: 11.6, weightG: 100 },
  17: { en: 'Pomegranate', sw: 'Komamanga', lengthCm: 13.0, weightG: 140 },
  18: { en: 'Sweet Bell Pepper', sw: 'Pilipili Hoho', lengthCm: 14.2, weightG: 190 },
  19: { en: 'Mango', sw: 'Embe Tamu', lengthCm: 15.3, weightG: 240 },
  20: { en: 'Ripe Sweet Banana', sw: 'Ndizi mbivu ya Kisukari', lengthCm: 25.6, weightG: 300 },
  21: { en: 'Carrot', sw: 'Karoti', lengthCm: 26.7, weightG: 360 },
  22: { en: 'Young Coconut', sw: 'Dafu / Nazi changa', lengthCm: 27.8, weightG: 430 },
  23: { en: 'Grapefruit', sw: 'Balungi', lengthCm: 28.9, weightG: 500 },
  24: { en: 'Fresh Maize Cob', sw: 'Gomba la Mahindi Mabichi', lengthCm: 30.0, weightG: 600 },
  25: { en: 'Rutabaga', sw: 'Mzizi Mtamu', lengthCm: 34.6, weightG: 660 },
  26: { en: 'Zucchini / Courgette', sw: 'Tango la Mboga', lengthCm: 35.6, weightG: 760 },
  27: { en: 'Cauliflower', sw: 'Koliflawa', lengthCm: 36.6, weightG: 875 },
  28: { en: 'African Garden Egg / Brinjal', sw: 'Biringanya', lengthCm: 37.6, weightG: 1000 },
  29: { en: 'Acorn Squash', sw: 'Boga Dogo', lengthCm: 38.6, weightG: 1150 },
  30: { en: 'Cabbage', sw: 'Kabeji', lengthCm: 39.9, weightG: 1320 },
  31: { en: 'Mature Coconut', sw: 'Nazi Iliyokomaa', lengthCm: 41.1, weightG: 1500 },
  32: { en: 'Butternut / Sweet Pumpkin', sw: 'Malenge / Boga Tamu', lengthCm: 42.4, weightG: 1700 },
  33: { en: 'Pineapple', sw: 'Nanasi', lengthCm: 43.7, weightG: 1900 },
  34: { en: 'Cantaloupe', sw: 'Tikiti Tamu', lengthCm: 45.0, weightG: 2150 },
  35: { en: 'Honeydew Melon', sw: 'Tikiti Asali', lengthCm: 46.2, weightG: 2380 },
  36: { en: 'Sweet Coastal Papaya', sw: 'Papai Tamu la Pwani', lengthCm: 47.4, weightG: 2600 },
  37: { en: 'Swiss Chard Bunch', sw: 'Fungu la Sukuma Wiki', lengthCm: 48.6, weightG: 2850 },
  38: { en: 'Winter Melon', sw: 'Tikiti Maji Dogo', lengthCm: 49.8, weightG: 3080 },
  39: { en: 'Medium Watermelon', sw: 'Tikiti Maji la Kati', lengthCm: 50.7, weightG: 3300 },
  40: { en: 'Full Round Watermelon', sw: 'Tikiti Maji Kamili', lengthCm: 51.2, weightG: 3500 },
};

export function getKenyanFetalSize(week) {
  const boundedWeek = Math.max(4, Math.min(40, Math.round(week || 4)));
  return KENYAN_FETAL_SIZE_ANALOGIES[boundedWeek] || KENYAN_FETAL_SIZE_ANALOGIES[28];
}

/**
 * Recommended ANC Contact Schedules per Kenya MoH 8-Contact Guidelines
 */
export const KENYA_MOH_ANC_CONTACTS = [
  { contact: 1, weekRange: 'Up to 12 weeks', weekRangeSw: 'Hadi wiki 12', title: 'Booking Visit (Contact 1)', titleSw: 'Ziara ya Kwanza ya Usajili' },
  { contact: 2, weekRange: '20 weeks', weekRangeSw: 'Wiki 20', title: 'Contact 2 (Quickening)', titleSw: 'Ziara ya 2 (Mchezo wa Kwanza)' },
  { contact: 3, weekRange: '26 weeks', weekRangeSw: 'Wiki 26', title: 'Contact 3 (Fetal Growth)', titleSw: 'Ziara ya 3 (Ukuaji wa Kijusi)' },
  { contact: 4, weekRange: '30 weeks', weekRangeSw: 'Wiki 30', title: 'Contact 4 (Maternal Vitals)', titleSw: 'Ziara ya 4 (Vipimo vya Mama)' },
  { contact: 5, weekRange: '34 weeks', weekRangeSw: 'Wiki 34', title: 'Contact 5 (Birth Preparedness)', titleSw: 'Ziara ya 5 (Maandalizi ya Kujifungua)' },
  { contact: 6, weekRange: '36 weeks', weekRangeSw: 'Wiki 36', title: 'Contact 6 (Presentation & Lie)', titleSw: 'Ziara ya 6 (Mkao wa Mtoto)' },
  { contact: 7, weekRange: '38 weeks', weekRangeSw: 'Wiki 38', title: 'Contact 7 (Pre-term Readiness)', titleSw: 'Ziara ya 7 (Utayari wa Kujifungua)' },
  { contact: 8, weekRange: '40 weeks', weekRangeSw: 'Wiki 40', title: 'Contact 8 (Term Evaluation)', titleSw: 'Ziara ya 8 (Kipindi Kamili)' },
];

export function getNextANCContact(gestationalWeeks) {
  const weeks = Math.max(0, Math.min(44, gestationalWeeks || 0));
  if (weeks < 16) return KENYA_MOH_ANC_CONTACTS[0];
  if (weeks < 22) return KENYA_MOH_ANC_CONTACTS[1];
  if (weeks < 28) return KENYA_MOH_ANC_CONTACTS[2];
  if (weeks < 32) return KENYA_MOH_ANC_CONTACTS[3];
  if (weeks < 35) return KENYA_MOH_ANC_CONTACTS[4];
  if (weeks < 37) return KENYA_MOH_ANC_CONTACTS[5];
  if (weeks < 39) return KENYA_MOH_ANC_CONTACTS[6];
  return KENYA_MOH_ANC_CONTACTS[7];
}
