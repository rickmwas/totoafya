/**
 * @totoafya/business-logic - Child Developmental Milestones Catalog & Triage
 *
 * Clinical references:
 * - Kenya Ministry of Health Mother and Child Health (MCH) Booklet (MoH 216)
 * - WHO Child Growth and Development Milestone Guidelines
 * - Integrated Management of Childhood Illness (IMCI) / Early Childhood Development (ECD)
 */

export type MilestoneCategory = 'motor' | 'cognitive' | 'language' | 'social' | 'feeding';

export type MilestoneAgeBand =
  | '0-3m'
  | '3-6m'
  | '6-9m'
  | '9-12m'
  | '12-18m'
  | '18-24m'
  | '2-3y'
  | '3-5y';

export interface ChildMilestone {
  id: string;
  category: MilestoneCategory;
  categoryEn: string;
  categorySw: string;
  ageBand: MilestoneAgeBand;
  ageBandLabelEn: string;
  ageBandLabelSw: string;
  minAgeMonths: number;
  maxAgeMonths: number;
  title: string;
  titleSw: string;
  description: string;
  descriptionSw: string;
  isRedFlagIfDelayed: boolean;
  redFlagWarningEn?: string;
  redFlagWarningSw?: string;
}

export const MILESTONE_CATEGORIES: Record<
  MilestoneCategory,
  { id: MilestoneCategory; labelEn: string; labelSw: string }
> = {
  motor: { id: 'motor', labelEn: 'Motor Skills', labelSw: 'Uwezo wa Mwili' },
  cognitive: { id: 'cognitive', labelEn: 'Cognitive', labelSw: 'Uelewa na Utambuzi' },
  language: { id: 'language', labelEn: 'Language & Speech', labelSw: 'Lugha na Mawasiliano' },
  social: { id: 'social', labelEn: 'Social & Emotional', labelSw: 'Mahusiano na Hisia' },
  feeding: { id: 'feeding', labelEn: 'Feeding & Nutrition', labelSw: 'Ulishaji na Lishe' },
};

export const MILESTONE_AGE_BANDS: Record<
  MilestoneAgeBand,
  { id: MilestoneAgeBand; labelEn: string; labelSw: string; minMonths: number; maxMonths: number }
> = {
  '0-3m': { id: '0-3m', labelEn: '0–3 Months', labelSw: 'Miezi 0–3', minMonths: 0, maxMonths: 3 },
  '3-6m': { id: '3-6m', labelEn: '3–6 Months', labelSw: 'Miezi 3–6', minMonths: 3, maxMonths: 6 },
  '6-9m': { id: '6-9m', labelEn: '6–9 Months', labelSw: 'Miezi 6–9', minMonths: 6, maxMonths: 9 },
  '9-12m': { id: '9-12m', labelEn: '9–12 Months', labelSw: 'Miezi 9–12', minMonths: 9, maxMonths: 12 },
  '12-18m': { id: '12-18m', labelEn: '12–18 Months', labelSw: 'Miezi 12–18', minMonths: 12, maxMonths: 18 },
  '18-24m': { id: '18-24m', labelEn: '18–24 Months', labelSw: 'Miezi 18–24', minMonths: 18, maxMonths: 24 },
  '2-3y': { id: '2-3y', labelEn: '2–3 Years', labelSw: 'Miaka 2–3', minMonths: 24, maxMonths: 36 },
  '3-5y': { id: '3-5y', labelEn: '3–5 Years', labelSw: 'Miaka 3–5', minMonths: 36, maxMonths: 60 },
};

export const CHILD_MILESTONES_CATALOG: ChildMilestone[] = [
  // ==========================================
  // AGE BAND 1: 0–3 MONTHS
  // ==========================================
  {
    id: 'm-0-3m-motor',
    category: 'motor',
    categoryEn: 'Motor Skills',
    categorySw: 'Uwezo wa Mwili',
    ageBand: '0-3m',
    ageBandLabelEn: '0–3 Months',
    ageBandLabelSw: 'Miezi 0–3',
    minAgeMonths: 0,
    maxAgeMonths: 3,
    title: 'Lifts head briefly while on tummy',
    titleSw: 'Hunyanyua kichwa akiwa amelala kwa tumbo',
    description: 'Baby can lift head and turn neck when placed on stomach during supervised tummy time.',
    descriptionSw: 'Mtoto anaweza kuinua kichwa na kugeuza shingo akiwa amelala kwa tumbo wakati wa mazoezi.',
    isRedFlagIfDelayed: true,
    redFlagWarningEn: 'If baby cannot support head at all by 3 months, consult your child health nurse.',
    redFlagWarningSw: 'Iwapo mtoto hawezi kabisa kushikilia kichwa akifikisha miezi 3, muone muuguzi wa afya ya mtoto.',
  },
  {
    id: 'm-0-3m-cognitive',
    category: 'cognitive',
    categoryEn: 'Cognitive',
    categorySw: 'Uelewa na Utambuzi',
    ageBand: '0-3m',
    ageBandLabelEn: '0–3 Months',
    ageBandLabelSw: 'Miezi 0–3',
    minAgeMonths: 0,
    maxAgeMonths: 3,
    title: 'Follows moving objects with eyes',
    titleSw: 'Hufuata vitu vinavyotembea kwa macho',
    description: 'Tracks faces and bright objects moving across their visual field up to 180 degrees.',
    descriptionSw: 'Hufuatilia nyuso na vitu vyenye rangi vinapopita mbele ya macho yake.',
    isRedFlagIfDelayed: false,
  },
  {
    id: 'm-0-3m-language',
    category: 'language',
    categoryEn: 'Language & Speech',
    categorySw: 'Lugha na Mawasiliano',
    ageBand: '0-3m',
    ageBandLabelEn: '0–3 Months',
    ageBandLabelSw: 'Miezi 0–3',
    minAgeMonths: 0,
    maxAgeMonths: 3,
    title: 'Coos and responds to familiar voices',
    titleSw: 'Hutoa sauti ndogo na kutambua sauti za wazazi',
    description: 'Produces gurgling and vowel sounds (oo, ah) when spoken to affectionately.',
    descriptionSw: 'Hutoa sauti za sauti (oo, ah) anapozungumzwa naye kwa upendo na wazazi.',
    isRedFlagIfDelayed: false,
  },
  {
    id: 'm-0-3m-social',
    category: 'social',
    categoryEn: 'Social & Emotional',
    categorySw: 'Mahusiano na Hisia',
    ageBand: '0-3m',
    ageBandLabelEn: '0–3 Months',
    ageBandLabelSw: 'Miezi 0–3',
    minAgeMonths: 0,
    maxAgeMonths: 3,
    title: 'Social smile in response to caregiver',
    titleSw: 'Hutabasamu anapoona uso wa mzazi',
    description: 'Smiles spontaneously and intentionally when a caregiver smiles or talks to them.',
    descriptionSw: 'Hutabasamu kwa hiari anapoona mama au mlezi akitabasamu au kumuongelesha.',
    isRedFlagIfDelayed: true,
    redFlagWarningEn: 'Absence of social smile by 12 weeks warrants clinical review for visual or social engagement.',
    redFlagWarningSw: 'Kutotabasamu akifikisha wiki 12 kunahitaji uchunguzi wa kliniki ya macho au maendeleo.',
  },
  {
    id: 'm-0-3m-feeding',
    category: 'feeding',
    categoryEn: 'Feeding & Nutrition',
    categorySw: 'Ulishaji na Lishe',
    ageBand: '0-3m',
    ageBandLabelEn: '0–3 Months',
    ageBandLabelSw: 'Miezi 0–3',
    minAgeMonths: 0,
    maxAgeMonths: 3,
    title: 'Latching and rhythmic exclusive breastfeeding',
    titleSw: 'Kushika titi vizuri na kunyonya maziwa ya mama pekee',
    description: 'Latches deeply onto breast with wide open mouth, swallows audibly, feeds 8–12 times per 24h with zero water or animal milk.',
    descriptionSw: 'Hushika chuchu vizuri mdomo ukiwa wazi, anameza kwa sauti, ananyonya mara 8-12 kwa siku bila maji wala chakula kingine.',
    isRedFlagIfDelayed: true,
    redFlagWarningEn: 'Poor latch, weak suckle, or fewer than 6 wet diapers per day requires urgent lactation assessment.',
    redFlagWarningSw: 'Ugumu wa kunyonya au kukojoa chini ya nepi 6 kwa siku unahitaji ushauri wa haraka kliniki.',
  },

  // ==========================================
  // AGE BAND 2: 3–6 MONTHS
  // ==========================================
  {
    id: 'm-3-6m-motor',
    category: 'motor',
    categoryEn: 'Motor Skills',
    categorySw: 'Uwezo wa Mwili',
    ageBand: '3-6m',
    ageBandLabelEn: '3–6 Months',
    ageBandLabelSw: 'Miezi 3–6',
    minAgeMonths: 3,
    maxAgeMonths: 6,
    title: 'Rolls over tummy-to-back and back-to-tummy',
    titleSw: 'Hujigeuza kutoka tumbo kwenda mgongoni na kinyume',
    description: 'Demonstrates core strength by rolling in at least one direction; holds steady head while supported.',
    descriptionSw: 'Ana nguvu za mwili kujigeuza na kushikilia kichwa imara bila kulegea anaposhikwa.',
    isRedFlagIfDelayed: false,
  },
  {
    id: 'm-3-6m-cognitive',
    category: 'cognitive',
    categoryEn: 'Cognitive',
    categorySw: 'Uelewa na Utambuzi',
    ageBand: '3-6m',
    ageBandLabelEn: '3–6 Months',
    ageBandLabelSw: 'Miezi 3–6',
    minAgeMonths: 3,
    maxAgeMonths: 6,
    title: 'Reaches out with both hands for toys',
    titleSw: 'Hunyosha mikono yote miwili kushika vitu vya kuchezea',
    description: 'Shows curiosity by reaching out purposefully for rattles and items held in front of them.',
    descriptionSw: 'Hunyosha mikono kwa makusudi kushika njuga au vitu vilivyowekwa mbele yake.',
    isRedFlagIfDelayed: false,
  },
  {
    id: 'm-3-6m-language',
    category: 'language',
    categoryEn: 'Language & Speech',
    categorySw: 'Lugha na Mawasiliano',
    ageBand: '3-6m',
    ageBandLabelEn: '3–6 Months',
    ageBandLabelSw: 'Miezi 3–6',
    minAgeMonths: 3,
    maxAgeMonths: 6,
    title: 'Babbles with consonants (ba-ba, ma-ma)',
    titleSw: 'Hutoa sauti za herufi (ba-ba, ma-ma)',
    description: 'Combines consonant and vowel sounds, vocalizes joy and displeasure clearly.',
    descriptionSw: 'Huunganisha sauti na kuonyesha furaha au kutoridhika kwa sauti zake.',
    isRedFlagIfDelayed: false,
  },
  {
    id: 'm-3-6m-social',
    category: 'social',
    categoryEn: 'Social & Emotional',
    categorySw: 'Mahusiano na Hisia',
    ageBand: '3-6m',
    ageBandLabelEn: '3–6 Months',
    ageBandLabelSw: 'Miezi 3–6',
    minAgeMonths: 3,
    maxAgeMonths: 6,
    title: 'Laughs out loud and enjoys peek-a-boo',
    titleSw: 'Hucheka kwa sauti na kufurahia michezo ya kujificha',
    description: 'Laughs aloud in response to tickling, funny sounds, or peek-a-boo face reveals.',
    descriptionSw: 'Hutoa kicheko kikubwa anapochekeshwa au kufanyiwa mchezo wa kujificha na kujitokeza.',
    isRedFlagIfDelayed: false,
  },
  {
    id: 'm-3-6m-feeding',
    category: 'feeding',
    categoryEn: 'Feeding & Nutrition',
    categorySw: 'Ulishaji na Lishe',
    ageBand: '3-6m',
    ageBandLabelEn: '3–6 Months',
    ageBandLabelSw: 'Miezi 3–6',
    minAgeMonths: 3,
    maxAgeMonths: 6,
    title: 'Maintains exclusive breastfeeding & readiness cues for complementary foods',
    titleSw: 'Kuendelea na unyonyeshaji wa maziwa ya mama pekee hadi miezi 6',
    description: 'Continues exclusive breastfeeding up to 6 months; shows interest in food at table (eyeing, opening mouth).',
    descriptionSw: 'Anaendelea kunyonya maziwa ya mama pekee; anaanza kuonyesha dalili za kutamani chakula watu wakila.',
    isRedFlagIfDelayed: false,
  },

  // ==========================================
  // AGE BAND 3: 6–9 MONTHS
  // ==========================================
  {
    id: 'm-6-9m-motor',
    category: 'motor',
    categoryEn: 'Motor Skills',
    categorySw: 'Uwezo wa Mwili',
    ageBand: '6-9m',
    ageBandLabelEn: '6–9 Months',
    ageBandLabelSw: 'Miezi 6–9',
    minAgeMonths: 6,
    maxAgeMonths: 9,
    title: 'Sits without support for several minutes',
    titleSw: 'Huketi peke yake bila kuegemea',
    description: 'Can sit upright unsupported on floor and manipulate objects with both hands.',
    descriptionSw: 'Anaweza kukaa wima sakafuni bila kushikiliwa huku akichezea vitu kwa mikono yote miwili.',
    isRedFlagIfDelayed: true,
    redFlagWarningEn: 'Unable to sit with support by 9 months requires developmental evaluation.',
    redFlagWarningSw: 'Kutoweza kukaa hata akitegemezwa akifikisha miezi 9 kunahitaji uchunguzi wa kimatibabu.',
  },
  {
    id: 'm-6-9m-cognitive',
    category: 'cognitive',
    categoryEn: 'Cognitive',
    categorySw: 'Uelewa na Utambuzi',
    ageBand: '6-9m',
    ageBandLabelEn: '6–9 Months',
    ageBandLabelSw: 'Miezi 6–9',
    minAgeMonths: 6,
    maxAgeMonths: 9,
    title: 'Object permanence (looks for dropped toys)',
    titleSw: 'Hutafuta kitu kilichoanguka au kufichwa kidogo',
    description: 'Searches visually for a dropped rattle or blanket under which a toy was partially hidden.',
    descriptionSw: 'Hutazama chini kile alichokiangusha au kufunua kitambaa kinachoficha mwanasesere wake.',
    isRedFlagIfDelayed: false,
  },
  {
    id: 'm-6-9m-language',
    category: 'language',
    categoryEn: 'Language & Speech',
    categorySw: 'Lugha na Mawasiliano',
    ageBand: '6-9m',
    ageBandLabelEn: '6–9 Months',
    ageBandLabelSw: 'Miezi 6–9',
    minAgeMonths: 6,
    maxAgeMonths: 9,
    title: 'Responds to own name and turns head',
    titleSw: 'Huitikia jina lake anapoitwa na kugeuka',
    description: 'Consistently turns head and looks when their name is called from across the room.',
    descriptionSw: 'Hugeuza kichwa na kutazama mara moja anapoitwa kwa jina lake na mlezi.',
    isRedFlagIfDelayed: true,
    redFlagWarningEn: 'No response to name or loud sounds may indicate hearing deficit; prompt audiometry review advised.',
    redFlagWarningSw: 'Kutoitikia anapoitwa au kusikia kelele kunaweza kuashiria tatizo la usikivu; pima kliniki.',
  },
  {
    id: 'm-6-9m-social',
    category: 'social',
    categoryEn: 'Social & Emotional',
    categorySw: 'Mahusiano na Hisia',
    ageBand: '6-9m',
    ageBandLabelEn: '6–9 Months',
    ageBandLabelSw: 'Miezi 6–9',
    minAgeMonths: 6,
    maxAgeMonths: 9,
    title: 'Stranger awareness & clinging to mother',
    titleSw: 'Hutambua wageni na kumng’ang’ania mama',
    description: 'Differentiates family from unfamiliar people; shows cautiousness around strangers.',
    descriptionSw: 'Hutofautisha watu wa nyumbani na wageni, anaonyesha aibu au kumkumbatia mama.',
    isRedFlagIfDelayed: false,
  },
  {
    id: 'm-6-9m-feeding',
    category: 'feeding',
    categoryEn: 'Feeding & Nutrition',
    categorySw: 'Ulishaji na Lishe',
    ageBand: '6-9m',
    ageBandLabelEn: '6–9 Months',
    ageBandLabelSw: 'Miezi 6–9',
    minAgeMonths: 6,
    maxAgeMonths: 9,
    title: 'Introduces enriched complementary porridge (uji)',
    titleSw: 'Kuanza uji mnene wenye virutubisho na chakula laini',
    description: 'Eats thick porridge enriched with groundnuts/milk and mashed avocado/eggs 2–3 times daily alongside frequent breastfeeding.',
    descriptionSw: 'Anakula uji mzito uliotiwa karanga au maziwa na matunda kama parachichi na yai mara 2-3 kwa siku huku akanyonya.',
    isRedFlagIfDelayed: false,
  },

  // ==========================================
  // AGE BAND 4: 9–12 MONTHS
  // ==========================================
  {
    id: 'm-9-12m-motor',
    category: 'motor',
    categoryEn: 'Motor Skills',
    categorySw: 'Uwezo wa Mwili',
    ageBand: '9-12m',
    ageBandLabelEn: '9–12 Months',
    ageBandLabelSw: 'Miezi 9–12',
    minAgeMonths: 9,
    maxAgeMonths: 12,
    title: 'Pulls to stand and cruises along furniture',
    titleSw: 'Hujivuta kusimama na kutembea akishikilia viti',
    description: 'Pulls themselves up to a standing position holding furniture; cruises around chairs.',
    descriptionSw: 'Hujivuta na kusimama kwa kushikilia viti au meza, anapiga hatua akishikilia ukuta.',
    isRedFlagIfDelayed: false,
  },
  {
    id: 'm-9-12m-cognitive',
    category: 'cognitive',
    categoryEn: 'Cognitive',
    categorySw: 'Uelewa na Utambuzi',
    ageBand: '9-12m',
    ageBandLabelEn: '9–12 Months',
    ageBandLabelSw: 'Miezi 9–12',
    minAgeMonths: 9,
    maxAgeMonths: 12,
    title: 'Fine pincer grasp (thumb and index finger)',
    titleSw: 'Hushika vitu vidogo kwa kidole gumba na cha shahada',
    description: 'Picks up small pieces of food or small objects neatly between thumb and index finger.',
    descriptionSw: 'Huokota chembe ndogo za chakula au vitu vidogo kwa kidole gumba na cha shahada.',
    isRedFlagIfDelayed: false,
  },
  {
    id: 'm-9-12m-language',
    category: 'language',
    categoryEn: 'Language & Speech',
    categorySw: 'Lugha na Mawasiliano',
    ageBand: '9-12m',
    ageBandLabelEn: '9–12 Months',
    ageBandLabelSw: 'Miezi 9–12',
    minAgeMonths: 9,
    maxAgeMonths: 12,
    title: 'First meaningful words (Mama, Baba, Dada)',
    titleSw: 'Husema maneno ya kwanza yenye maana (Mama, Baba)',
    description: 'Uses single words meaningfully to refer to specific caregivers or objects.',
    descriptionSw: 'Hutumia neno moja kumwita mtu maalum (kama Mama au Baba) kwa makusudi.',
    isRedFlagIfDelayed: false,
  },
  {
    id: 'm-9-12m-social',
    category: 'social',
    categoryEn: 'Social & Emotional',
    categorySw: 'Mahusiano na Hisia',
    ageBand: '9-12m',
    ageBandLabelEn: '9–12 Months',
    ageBandLabelSw: 'Miezi 9–12',
    minAgeMonths: 9,
    maxAgeMonths: 12,
    title: 'Waves bye-bye and claps hands (piga makofi)',
    titleSw: 'Hupunga mkono kusema kwaheri na kupiga makofi',
    description: 'Imitates social gestures including waving farewell and clapping hands happily.',
    descriptionSw: 'Huiga salamu za watu wakubwa, hupunga mkono na kupiga makofi kwa furaha.',
    isRedFlagIfDelayed: false,
  },
  {
    id: 'm-9-12m-feeding',
    category: 'feeding',
    categoryEn: 'Feeding & Nutrition',
    categorySw: 'Ulishaji na Lishe',
    ageBand: '9-12m',
    ageBandLabelEn: '9–12 Months',
    ageBandLabelSw: 'Miezi 9–12',
    minAgeMonths: 9,
    maxAgeMonths: 12,
    title: 'Self-feeding finger foods and drinking from cup',
    titleSw: 'Kujilisha vyakula vya kushika na kunywa kwenye kikombe',
    description: 'Picks up chopped ripe bananas, boiled sweet potato pieces, and sips water from an open cup with assistance.',
    descriptionSw: 'Anajilisha ndizi mbivu zilizokatwa au vipande vya viazi vitamu na kunywa kwenye kikombe akisaidiwa.',
    isRedFlagIfDelayed: false,
  },

  // ==========================================
  // AGE BAND 5: 12–18 MONTHS
  // ==========================================
  {
    id: 'm-12-18m-motor',
    category: 'motor',
    categoryEn: 'Motor Skills',
    categorySw: 'Uwezo wa Mwili',
    ageBand: '12-18m',
    ageBandLabelEn: '12–18 Months',
    ageBandLabelSw: 'Miezi 12–18',
    minAgeMonths: 12,
    maxAgeMonths: 18,
    title: 'Walks independently across the room',
    titleSw: 'Hutembea peke yake bila kushikilia chochote',
    description: 'Takes steady steps across a room without holding on to hands or furniture.',
    descriptionSw: 'Hupiga hatua thabiti peke yake bila kushikiliwa au kuegemea vitu.',
    isRedFlagIfDelayed: true,
    redFlagWarningEn: 'Not walking independently by 18 months requires paediatric review.',
    redFlagWarningSw: 'Kutotembea peke yake akifikisha miezi 18 kunahitaji uchunguzi wa daktari wa watoto.',
  },
  {
    id: 'm-12-18m-cognitive',
    category: 'cognitive',
    categoryEn: 'Cognitive',
    categorySw: 'Uelewa na Utambuzi',
    ageBand: '12-18m',
    ageBandLabelEn: '12–18 Months',
    ageBandLabelSw: 'Miezi 12–18',
    minAgeMonths: 12,
    maxAgeMonths: 18,
    title: 'Stacks 2–3 blocks and explores containers',
    titleSw: 'Hupanga vibao 2-3 juu ya vingine na kutoa vitu ndani ya kikapu',
    description: 'Places blocks on top of one another to build small towers and empties containers intentionally.',
    descriptionSw: 'Huunganisha vitu kwa kuweka kimoja juu ya kingine na kumwaga vitu ndani ya chombo kwa udadisi.',
    isRedFlagIfDelayed: false,
  },
  {
    id: 'm-12-18m-language',
    category: 'language',
    categoryEn: 'Language & Speech',
    categorySw: 'Lugha na Mawasiliano',
    ageBand: '12-18m',
    ageBandLabelEn: '12–18 Months',
    ageBandLabelSw: 'Miezi 12–18',
    minAgeMonths: 12,
    maxAgeMonths: 18,
    title: 'Uses 6–10 spoken words and points to ask for things',
    titleSw: 'Hutumia maneno 6-10 na kunyoosha kidole kuomba vitu',
    description: 'Points with index finger to show interest and speaks 6 to 10 distinct recognizable words.',
    descriptionSw: 'Hunyosha kidole akitaka kitu na anatamka wazi maneno yasiyopungua 6 hadi 10.',
    isRedFlagIfDelayed: false,
  },
  {
    id: 'm-12-18m-social',
    category: 'social',
    categoryEn: 'Social & Emotional',
    categorySw: 'Mahusiano na Hisia',
    ageBand: '12-18m',
    ageBandLabelEn: '12–18 Months',
    ageBandLabelSw: 'Miezi 12–18',
    minAgeMonths: 12,
    maxAgeMonths: 18,
    title: 'Imitates household chores (sweeping, wiping)',
    titleSw: 'Huiga kazi za nyumbani kama kufagia au kupangusa',
    description: 'Enjoys copying everyday caregiver actions such as sweeping with a broom or wiping a table.',
    descriptionSw: 'Hufurahia kuiga mama akifagia au kupangusa meza kwa kitambaa.',
    isRedFlagIfDelayed: false,
  },
  {
    id: 'm-12-18m-feeding',
    category: 'feeding',
    categoryEn: 'Feeding & Nutrition',
    categorySw: 'Ulishaji na Lishe',
    ageBand: '12-18m',
    ageBandLabelEn: '12–18 Months',
    ageBandLabelSw: 'Miezi 12–18',
    minAgeMonths: 12,
    maxAgeMonths: 18,
    title: 'Eats family diet with spoon & continued breastfeeding',
    titleSw: 'Hula chakula cha familia kwa kijiko na kuendelea kunyonya',
    description: 'Consumes diverse family meals (sukuma wiki, beans, fish, ugali) cut into soft pieces; attempts spoon feeding.',
    descriptionSw: 'Hula vyakula vya familia vilivyolainishwa (sukuma wiki, maharagwe, ugali) na kuanza kushika kijiko.',
    isRedFlagIfDelayed: false,
  },

  // ==========================================
  // AGE BAND 6: 18–24 MONTHS
  // ==========================================
  {
    id: 'm-18-24m-motor',
    category: 'motor',
    categoryEn: 'Motor Skills',
    categorySw: 'Uwezo wa Mwili',
    ageBand: '18-24m',
    ageBandLabelEn: '18–24 Months',
    ageBandLabelSw: 'Miezi 18–24',
    minAgeMonths: 18,
    maxAgeMonths: 24,
    title: 'Runs steadily and kicks a ball forward',
    titleSw: 'Hukimbia bila kuanguka mara kwa mara na kupiga mpira teke',
    description: 'Runs forward with balance, kicks a ball without losing balance, and climbs onto chairs.',
    descriptionSw: 'Hukimbia kwa wepesi, anapiga mpira teke bila kuanguka, na kupanda kwenye viti.',
    isRedFlagIfDelayed: false,
  },
  {
    id: 'm-18-24m-cognitive',
    category: 'cognitive',
    categoryEn: 'Cognitive',
    categorySw: 'Uelewa na Utambuzi',
    ageBand: '18-24m',
    ageBandLabelEn: '18–24 Months',
    ageBandLabelSw: 'Miezi 18–24',
    minAgeMonths: 18,
    maxAgeMonths: 24,
    title: 'Follows 2-step instructions and sorts basic shapes',
    titleSw: 'Hufuata maagizo ya hatua mbili na kutambua maumbo',
    description: 'Follows instructions such as "Pick up the ball and bring it to mama"; completes simple shape puzzles.',
    descriptionSw: 'Anaelewa maagizo kama "Chukua mpira ulete kwa mama" na kutambua tofauti ya maumbo.',
    isRedFlagIfDelayed: false,
  },
  {
    id: 'm-18-24m-language',
    category: 'language',
    categoryEn: 'Language & Speech',
    categorySw: 'Lugha na Mawasiliano',
    ageBand: '18-24m',
    ageBandLabelEn: '18–24 Months',
    ageBandLabelSw: 'Miezi 18–24',
    minAgeMonths: 18,
    maxAgeMonths: 24,
    title: 'Combines 2 words into phrases (Nataka maji / Want water)',
    titleSw: 'Huunganisha maneno mawili kuwa sentensi fupi',
    description: 'Speaks 50+ words and strings 2 words together to form simple sentences ("More uji", "Mama njoo").',
    descriptionSw: 'Anaelewa maneno zaidi ya 50 na huunganisha mawili kutoa ujumbe ("Nataka uji", "Mama njoo").',
    isRedFlagIfDelayed: true,
    redFlagWarningEn: 'Fewer than 6 words or no word combinations by 24 months warrants speech assessment.',
    redFlagWarningSw: 'Kutoweza kutamka maneno 6 au sentensi za maneno mawili akifikisha miaka 2 kunahitaji uchunguzi wa lugha.',
  },
  {
    id: 'm-18-24m-social',
    category: 'social',
    categoryEn: 'Social & Emotional',
    categorySw: 'Mahusiano na Hisia',
    ageBand: '18-24m',
    ageBandLabelEn: '18–24 Months',
    ageBandLabelSw: 'Miezi 18–24',
    minAgeMonths: 18,
    maxAgeMonths: 24,
    title: 'Plays alongside other children (parallel play)',
    titleSw: 'Hucheza sambamba na watoto wengine',
    description: 'Enjoys playing near peers and watches other children, beginning basic sharing with guidance.',
    descriptionSw: 'Hufurahia kucheza karibu na watoto wenzake huku akitazama na kuiga wanachofanya.',
    isRedFlagIfDelayed: false,
  },
  {
    id: 'm-18-24m-feeding',
    category: 'feeding',
    categoryEn: 'Feeding & Nutrition',
    categorySw: 'Ulishaji na Lishe',
    ageBand: '18-24m',
    ageBandLabelEn: '18–24 Months',
    ageBandLabelSw: 'Miezi 18–24',
    minAgeMonths: 18,
    maxAgeMonths: 24,
    title: 'Completes 2-year breastfeeding or gradual supportive weaning',
    titleSw: 'Kutimiza miaka miwili ya kunyonya na kula milo 5 kwa siku',
    description: 'Celebrates 2 completed years of breastfeeding per WHO guidelines, with 3 full meals plus 2 nutritious snacks daily.',
    descriptionSw: 'Hufikisha miaka miwili kamili ya kunyonya kwa mujibu wa WHO, akila milo kamili 3 na vitafunio 2 kila siku.',
    isRedFlagIfDelayed: false,
  },

  // ==========================================
  // AGE BAND 7: 2–3 YEARS
  // ==========================================
  {
    id: 'm-2-3y-motor',
    category: 'motor',
    categoryEn: 'Motor Skills',
    categorySw: 'Uwezo wa Mwili',
    ageBand: '2-3y',
    ageBandLabelEn: '2–3 Years',
    ageBandLabelSw: 'Miaka 2–3',
    minAgeMonths: 24,
    maxAgeMonths: 36,
    title: 'Jumps with both feet and climbs stairs alternating feet',
    titleSw: 'Humpa kwa miguu miwili na kupanda ngazi',
    description: 'Jumps off small steps landing on both feet; pedals a tricycle or runs agilely around obstacles.',
    descriptionSw: 'Huruka kwa miguu yote miwili na kupanda ngazi kwa urahisi bila kupoteza mwelekeo.',
    isRedFlagIfDelayed: false,
  },
  {
    id: 'm-2-3y-cognitive',
    category: 'cognitive',
    categoryEn: 'Cognitive',
    categorySw: 'Uelewa na Utambuzi',
    ageBand: '2-3y',
    ageBandLabelEn: '2–3 Years',
    ageBandLabelSw: 'Miaka 2–3',
    minAgeMonths: 24,
    maxAgeMonths: 36,
    title: 'Identifies common animals, body parts & colors',
    titleSw: 'Hutambua wanyama, viungo vya mwili na rangi',
    description: 'Correctly identifies eyes, nose, hands, and names familiar animals (ng’ombe, mbuzi, kuku).',
    descriptionSw: 'Hutaja kwa usahihi pua, macho, mdomo na kutambua wanyama wa nyumbani kama mbuzi, paka, na kuku.',
    isRedFlagIfDelayed: false,
  },
  {
    id: 'm-2-3y-language',
    category: 'language',
    categoryEn: 'Language & Speech',
    categorySw: 'Lugha na Mawasiliano',
    ageBand: '2-3y',
    ageBandLabelEn: '2–3 Years',
    ageBandLabelSw: 'Miaka 2–3',
    minAgeMonths: 24,
    maxAgeMonths: 36,
    title: 'Speaks in 3–4 word sentences understood by strangers',
    titleSw: 'Huongea sentensi za maneno 3-4 zinazoeleweka na wageni',
    description: 'Converses using 3 to 4 word sentences; asks questions like "Kwanini?" (Why?).',
    descriptionSw: 'Huzungumza kwa sentensi kamili za maneno 3 hadi 4 na kuanza kuuliza maswali kama "Kwanini?".',
    isRedFlagIfDelayed: false,
  },
  {
    id: 'm-2-3y-social',
    category: 'social',
    categoryEn: 'Social & Emotional',
    categorySw: 'Mahusiano na Hisia',
    ageBand: '2-3y',
    ageBandLabelEn: '2–3 Years',
    ageBandLabelSw: 'Miaka 2–3',
    minAgeMonths: 24,
    maxAgeMonths: 36,
    title: 'Shows empathy to crying peers & daytime toilet training progress',
    titleSw: 'Huwajali watoto wanaolia na kuanza kujifunza choo',
    description: 'Shows comfort when a peer cries; communicates need to use the potty during the day.',
    descriptionSw: 'Huonyesha hisia za huruma mtoto mwingine akilia; hutoa taarifa akitaka kwenda haja mchana.',
    isRedFlagIfDelayed: false,
  },
  {
    id: 'm-2-3y-feeding',
    category: 'feeding',
    categoryEn: 'Feeding & Nutrition',
    categorySw: 'Ulishaji na Lishe',
    ageBand: '2-3y',
    ageBandLabelEn: '2–3 Years',
    ageBandLabelSw: 'Miaka 2–3',
    minAgeMonths: 24,
    maxAgeMonths: 36,
    title: 'Feeds self independently without major spilling',
    titleSw: 'Hujilisha mwenyewe kwa kijiko bila kumwaga sana',
    description: 'Uses spoon and fork independently to finish meal; drinks from regular cup with one hand.',
    descriptionSw: 'Anakula chakula chote kwa kijiko peke yake na kunywa kwenye glasi bila kumwaga ovyo.',
    isRedFlagIfDelayed: false,
  },

  // ==========================================
  // AGE BAND 8: 3–5 YEARS
  // ==========================================
  {
    id: 'm-3-5y-motor',
    category: 'motor',
    categoryEn: 'Motor Skills',
    categorySw: 'Uwezo wa Mwili',
    ageBand: '3-5y',
    ageBandLabelEn: '3–5 Years',
    ageBandLabelSw: 'Miaka 3–5',
    minAgeMonths: 36,
    maxAgeMonths: 60,
    title: 'Hops on one foot, catches a bounced ball, and draws circles',
    titleSw: 'Hushika mpira unaodunda, kuruka kwa mguu mmoja, na kuchora duara',
    description: 'Hops on one foot for 5+ seconds, catches large balls, and draws simple human stick figures.',
    descriptionSw: 'Huruka kwa mguu mmoja, hushika mpira unaorushwa, na kuchora maumbo kama duara na mtu.',
    isRedFlagIfDelayed: false,
  },
  {
    id: 'm-3-5y-cognitive',
    category: 'cognitive',
    categoryEn: 'Cognitive',
    categorySw: 'Uelewa na Utambuzi',
    ageBand: '3-5y',
    ageBandLabelEn: '3–5 Years',
    ageBandLabelSw: 'Miaka 3–5',
    minAgeMonths: 36,
    maxAgeMonths: 60,
    title: 'Counts to 10 and understands concept of time (morning, night)',
    titleSw: 'Huhesabu namba 1 hadi 10 na kuelewa asubuhi na jioni',
    description: 'Recites numbers 1–10, identifies 4 primary colors, and anticipates daily routines.',
    descriptionSw: 'Huhesabu namba 1 hadi 10, anataja rangi 4 na kuelewa ratiba ya chakula, kulala na asubuhi.',
    isRedFlagIfDelayed: false,
  },
  {
    id: 'm-3-5y-language',
    category: 'language',
    categoryEn: 'Language & Speech',
    categorySw: 'Lugha na Mawasiliano',
    ageBand: '3-5y',
    ageBandLabelEn: '3–5 Years',
    ageBandLabelSw: 'Miaka 3–5',
    minAgeMonths: 36,
    maxAgeMonths: 60,
    title: 'Tells simple stories and recites childhood rhymes',
    titleSw: 'Hutoa hadithi fupi na kukariri mashairi ya watoto',
    description: 'Narrates real or imaginary events in coherent sentences; sings nursery songs in English and Swahili.',
    descriptionSw: 'Anaeleza kilichotokea mchana na kuimba nyimbo za watoto kwa Kiswahili na Kiingereza.',
    isRedFlagIfDelayed: false,
  },
  {
    id: 'm-3-5y-social',
    category: 'social',
    categoryEn: 'Social & Emotional',
    categorySw: 'Mahusiano na Hisia',
    ageBand: '3-5y',
    ageBandLabelEn: '3–5 Years',
    ageBandLabelSw: 'Miaka 3–5',
    minAgeMonths: 36,
    maxAgeMonths: 60,
    title: 'Cooperative play, turns-taking, and dresses self with minimal help',
    titleSw: 'Hucheza kwa ushirikiano, kupokezana, na kuvaa nguo mwenyewe',
    description: 'Plays games with rules, takes turns willingly with friends, and dresses/undresses with minimal assistance.',
    descriptionSw: 'Hucheza vizuri na watoto wenzake akipokezana vifaa vya kuchezea na kuvaa nguo peke yake.',
    isRedFlagIfDelayed: false,
  },
  {
    id: 'm-3-5y-feeding',
    category: 'feeding',
    categoryEn: 'Feeding & Nutrition',
    categorySw: 'Ulishaji na Lishe',
    ageBand: '3-5y',
    ageBandLabelEn: '3–5 Years',
    ageBandLabelSw: 'Miezi 3–5',
    minAgeMonths: 36,
    maxAgeMonths: 60,
    title: 'Eats varied nutritious foods & practices handwashing before meals',
    titleSw: 'Hula lishe bora na kunawa mikono kwa sabuni kabla ya kula',
    description: 'Enjoys a diverse balanced plate containing protein, greens, and grains; habitually washes hands with soap.',
    descriptionSw: 'Hula mchanganyiko mzuri wa protini, mboga za majani na nafaka, na huanza kwa kunawa mikono kwa sabuni.',
    isRedFlagIfDelayed: false,
  },
];

/**
 * Filter milestones by age band.
 */
export function getMilestonesByAgeBand(ageBand: MilestoneAgeBand): ChildMilestone[] {
  return CHILD_MILESTONES_CATALOG.filter((m) => m.ageBand === ageBand);
}

/**
 * Filter milestones by developmental category.
 */
export function getMilestonesByCategory(category: MilestoneCategory): ChildMilestone[] {
  return CHILD_MILESTONES_CATALOG.filter((m) => m.category === category);
}

/**
 * Get milestones appropriate for a child's age in months.
 */
export function getMilestonesForAgeMonths(ageMonths: number): ChildMilestone[] {
  const boundedMonths = Math.max(0, ageMonths);
  return CHILD_MILESTONES_CATALOG.filter(
    (m) => boundedMonths >= m.minAgeMonths && boundedMonths <= m.maxAgeMonths
  );
}

/**
 * Find nearest matching age band for a given child age in months.
 */
export function resolveAgeBandFromMonths(ageMonths: number): MilestoneAgeBand {
  if (ageMonths <= 3) return '0-3m';
  if (ageMonths <= 6) return '3-6m';
  if (ageMonths <= 9) return '6-9m';
  if (ageMonths <= 12) return '9-12m';
  if (ageMonths <= 18) return '12-18m';
  if (ageMonths <= 24) return '18-24m';
  if (ageMonths <= 36) return '2-3y';
  return '3-5y';
}
