import db from '@/api/totoafyaClient';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Clock, 
  BookOpen, 
  Star, 
  Headphones, 
  FileText, 
  Image as ImageIcon, 
  Award, 
  CheckCircle2, 
  XCircle, 
  Download, 
  Check, 
  ArrowRight, 
  ChevronRight, 
  X, 
  Volume2, 
  Search,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  RotateCcw,
  Sparkle
} from 'lucide-react';

import { useLang } from '@/context/LanguageContext';
import AppShell from '@/components/layout/AppShell';
import { cn } from '@/lib/utils';

// Category Configuration with Premium Branding Colors
const CATEGORY_CONFIG = {
  breastfeeding: { icon: '🤱', color: '#E91E8C', bg: '#FFF0F6', en: 'Breastfeeding', sw: 'Kunyonyesha' },
  nutrition:     { icon: '🥗', color: '#2E7A5D', bg: '#F0FBF6', en: 'Nutrition', sw: 'Lishe' },
  immunization:  { icon: '💉', color: '#1B6B5A', bg: '#E6F4F1', en: 'Immunization', sw: 'Chanjo' },
  hygiene:       { icon: '🧼', color: '#0099CC', bg: '#EEF9FF', en: 'Hygiene', sw: 'Usafi' },
  development:   { icon: '🌱', color: '#7C3AED', bg: '#F5F0FF', en: 'Development', sw: 'Maendeleo' },
  pregnancy:     { icon: '🤰', color: '#F9A825', bg: '#FFF8E1', en: 'Pregnancy', sw: 'Ujauzito' },
  danger_signs:  { icon: '⚠️', color: '#E51010', bg: '#FFF0F0', en: 'Danger Signs', sw: 'Dalili za Hatari' },
  family_planning: { icon: '👪', color: '#666666', bg: '#F7F5F0', en: 'Family Planning', sw: 'Uzazi wa Mpango' },
};

// Rich Sample Content with Multimodal formats and interactive quizzes
const SAMPLE_CONTENT = [
  { 
    id: 'lc1', 
    title: 'How to Breastfeed Your Newborn', 
    title_sw: 'Jinsi ya Kunyonyesha Mtoto Mchanga', 
    category: 'breastfeeding', 
    content_type: 'video', 
    video_url: 'https://www.youtube.com/watch?v=k-a8H9u9k5c',
    duration_seconds: 480, 
    is_featured: true, 
    thumbnail_url: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&h=350&fit=crop', 
    target_audience: 'newborn',
    age_min_weeks: 0,
    age_max_weeks: 4,
    description: 'Learn the correct latch techniques and comfortable positions for breastfeeding your newborn baby.',
    description_sw: 'Jifunze mbinu sahihi za kumfanya mtoto anyonye vizuri na nafasi nzuri za kunyonyesha mtoto wako mchanga.',
    quiz_questions: [
      {
        question: 'How long is exclusive breastfeeding recommended for a newborn baby?',
        question_sw: 'Kunyonyesha maziwa ya mama pekee kunapendekezwa kwa muda gani kwa mtoto mchanga?',
        options: ['2 Weeks', '2 Months', '6 Months', '12 Months'],
        options_sw: ['Wiki 2', 'Miezi 2', 'Miezi 6', 'Miezi 12'],
        correct_answer_index: 2,
        explanation: 'Exclusive breastfeeding is recommended for the first 6 months of life as breastmilk contains all essential nutrients and water.',
        explanation_sw: 'Kunyonyesha maziwa ya mama pekee kunapendekezwa kwa miezi 6 ya kwanza kwa sababu maziwa yana virutubisho vyote na maji ya kutosha.'
      },
      {
        question: 'What is the key indicator of a good latch during breastfeeding?',
        question_sw: 'Ni nini kiashiria kikuu cha mtoto kushika ziwa vizuri wakati wa kunyonyesha?',
        options: ['Only the nipple is in the baby\'s mouth', 'Most of the dark area (areola) is in the baby\'s mouth', 'Breastfeeding is very painful', 'The baby makes clicking sounds'],
        options_sw: ['Chuchu pekee iko mdomoni mwa mtoto', 'Sehemu kubwa ya eneo jeusi (areola) iko mdomoni mwa mtoto', 'Kunyonyesha kunaumiza sana', 'Mtoto anatoa sauti za kugongana mdomoni'],
        correct_answer_index: 1,
        explanation: 'A good latch occurs when the baby takes a large mouthful of the breast, covering most of the areola below the nipple.',
        explanation_sw: 'Mshiko mzuri hutokea wakati mdomo wa mtoto unapojaa ziwa, ukifunika sehemu kubwa ya eneo jeusi lililo chini ya chuchu.'
      }
    ]
  },
  { 
    id: 'lc2', 
    title: 'Danger Signs in Pregnancy', 
    title_sw: 'Dalili za Hatari Wakati wa Uja Uzito', 
    category: 'danger_signs', 
    content_type: 'video', 
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-doctor-explaining-something-to-a-pregnant-woman-41846-large.mp4',
    duration_seconds: 300, 
    thumbnail_url: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=600&h=350&fit=crop', 
    target_audience: 'pregnant',
    age_min_weeks: 0,
    age_max_weeks: 40,
    description: 'Crucial visual guide highlighting warning signs during pregnancy that require immediate hospital attention.',
    description_sw: 'Mwongozo muhimu unaoonyesha dalili za hatari wakati wa ujauzito zinazohitaji matibabu ya haraka hospitalini.',
    quiz_questions: [
      {
        question: 'Which of the following is a critical danger sign that requires immediate clinical assessment?',
        question_sw: 'Ni ipi kati ya zifuatazo ni dalili hatari inayohitaji uchunguzi wa haraka wa kliniki?',
        options: ['Mild morning fatigue', 'Vaginal bleeding', 'Increased appetite', 'Mild swelling of feet in evening'],
        options_sw: ['Uchovu kidogo asubuhi', 'Kutokwa na damu ukeni', 'Kuongezeka kwa hamu ya kula', 'Kuvimba kidogo kwa miguu jioni'],
        correct_answer_index: 1,
        explanation: 'Vaginal bleeding during pregnancy is never normal and can indicate miscarriage, placental abruption, or labor complications.',
        explanation_sw: 'Kutokwa na damu ukeni wakati wa ujauzito sio kawaida na kunaweza kuashiria kuharibika kwa mimba au matatizo ya placenta.'
      }
    ]
  },
  { 
    id: 'lc3', 
    title: 'Nutritional Guidelines for Pregnant Mothers', 
    title_sw: 'Mwongozo wa Lishe Bora kwa Wajawazito', 
    category: 'nutrition', 
    content_type: 'article', 
    reading_time_minutes: 5,
    thumbnail_url: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=600&h=350&fit=crop', 
    target_audience: 'pregnant',
    age_min_weeks: 0,
    age_max_weeks: 40,
    description: 'A comprehensive guide on critical vitamins, minerals, and healthy food groups to support maternal health and fetal development.',
    description_sw: 'Mwongozo kamili wa vitamini, madini muhimu, na makundi ya vyakula bora kusaidia afya ya mama na ukuaji wa mtoto.',
    rich_text_content: `<h3>Key Nutrients You Need During Pregnancy</h3>
    <p>Eating well is one of the best things you can do to support your baby's growth and maintain your own strength. Here are the core pillars of pregnancy nutrition:</p>
    
    <h4>1. Iron and Folic Acid Supplementation (IFAS)</h4>
    <p>Folic acid prevents neural tube defects (serious birth defects of the spinal cord and brain). Iron builds red blood cells and prevents anemia. Take your daily IFAS tablet with clean water, preferably alongside vitamin-C rich foods (like oranges) to increase iron absorption.</p>
    
    <h4>2. Essential Protein for Baby Growth</h4>
    <p>Protein is critical for building your baby's muscles, tissues, and brain development. Aim to include healthy sources such as eggs, fresh fish, chicken, beans, lentils, and nuts in your daily meals.</p>
    
    <h4>3. Calcium & Vitamin D for Strong Bones</h4>
    <p>If you don't consume enough calcium, your baby will draw it from your own bones. Consume milk, unsweetened yogurt, cheese, and dark green leafy vegetables (like kale or spinach) regularly.</p>`,
    rich_text_content_sw: `<h3>Virutubisho Muhimu Unavyohitaji Wakati wa Uja Uzito</h3>
    <p>Kula vizuri ni moja ya mambo bora unayoweza kufanya ili kusaidia ukuaji wa mtoto wako na kulinda nguvu zako mwenyewe. Hapa kuna nguzo kuu za lishe ya ujauzito:</p>
    
    <h4>1. Vidonge vya Madini ya Chuma na Folic Acid (IFAS)</h4>
    <p>Folic Acid huzuia ulemavu wa mfumo wa neva na ubongo wa mtoto. Madini ya Chuma hujenga seli nyekundu za damu na kuzuia upungufu wa damu (anemia). Kunywa kidonge chako cha kila siku cha IFAS na maji safi.</p>
    
    <h4>2. Protini kwa Ukuaji wa Mtoto</h4>
    <p>Protini ni muhimu kwa ajili ya kujenga misuli, tishu, na ukuaji wa ubongo wa mtoto. Jitahidi kula mayai, samaki wabichi, kuku, maharagwe na dengu katika milo yako ya kila siku.</p>
    
    <h4>3. Kalsiamu kwa Mifupa Imara</h4>
    <p>Kama usipopata kalsiamu ya kutosha, mtoto atachukua kalsiamu kutoka kwenye mifupa yako. Kula maziwa, mtindi, na mboga za majani zenye rangi ya kijani kibichi (kama sukumawiki au mchicha) mara kwa mara.</p>`,
    quiz_questions: [
      {
        question: 'Why is taking daily Iron and Folic Acid (IFAS) tablets highly recommended during pregnancy?',
        question_sw: 'Kwa nini kumeza vidonge vya kila siku vya Madini ya Chuma na Folic Acid (IFAS) kunapendekezwa sana?',
        options: ['It gives you instant physical energy', 'It prevents anemia and brain/spinal birth defects', 'It determines the gender of your child', 'It completely eliminates morning sickness'],
        options_sw: ['Inakupa nguvu ya mwili papo hapo', 'Inazuia anemia na kasoro za ubongo/uti wa mgongo kwa mtoto', 'Inaamua jinsia ya mtoto wako', 'Inaondoa kabisa kichefuchefu cha asubuhi'],
        correct_answer_index: 1,
        explanation: 'Folic acid helps form the neural tube and prevents brain and spinal abnormalities, while iron prevents maternal anemia.',
        explanation_sw: 'Folic acid husaidia kuunda mfumo wa neva na kuzuia ulemavu wa ubongo na uti wa mgongo, wakati madini ya chuma yanazuia anemia kwa mama.'
      }
    ]
  },
  { 
    id: 'lc4', 
    title: 'Understanding Baby\'s Wiki 6 Immunization', 
    title_sw: 'Kuelewa Chanjo za Mtoto Wako za Wiki 6', 
    category: 'immunization', 
    content_type: 'audio', 
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration_seconds: 240, 
    thumbnail_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=350&fit=crop', 
    target_audience: 'infant',
    age_min_weeks: 4,
    age_max_weeks: 8,
    description: 'Listen to a community midwife explain what vaccines your baby receives at 6 weeks and how to manage minor side effects.',
    description_sw: 'Sikiliza mkunga wa jamii akieleza chanjo ambazo mtoto wako anapata akiwa na wiki 6 na jinsi ya kudhibiti athari ndogo za chanjo.',
    quiz_questions: [
      {
        question: 'Which of the following vaccines is given orally at 6 weeks in Kenya to protect against severe diarrhea?',
        question_sw: 'Ni ipi kati ya chanjo zifuatazo hutolewa kwa njia ya mdomo katika wiki ya 6 nchini Kenya ili kuzuia kuhara kali?',
        options: ['BCG Vaccine', 'Rotavirus Vaccine', 'Pentavalent Vaccine', 'PCV (Pneumococcal Conjugate)'],
        options_sw: ['Chanjo ya BCG', 'Chanjo ya Rotavirus', 'Chanjo ya Pentavalent', 'Chanjo ya PCV'],
        correct_answer_index: 1,
        explanation: 'Rotavirus vaccine is given as drops in the baby\'s mouth to protect against severe rotavirus gastroenteritis and diarrhea.',
        explanation_sw: 'Chanjo ya Rotavirus hutolewa kama matone mdomoni mwa mtoto ili kumlinda dhidi ya ugonjwa mkali wa kuhara wa Rotavirus.'
      }
    ]
  },
  { 
    id: 'lc5', 
    title: 'Handwashing & Hygiene for Newborn Care', 
    title_sw: 'Kunawa Mikono na Usafi kwa Malezi ya Mtoto', 
    category: 'hygiene', 
    content_type: 'infographic', 
    thumbnail_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&h=350&fit=crop', 
    target_audience: 'newborn',
    age_min_weeks: 0,
    age_max_weeks: 12,
    description: 'Visual step-by-step checklist on proper handwashing timings and sanitizing actions before handling a newborn.',
    description_sw: 'Orodha ya picha inayonyesha hatua kwa hatua nyakati sahihi za kunawa mikono na kusafisha kabla ya kumshika mtoto mchanga.',
    rich_text_content: `<div class="text-center mb-6">
      <img src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&h=1200&fit=crop" class="max-w-full h-auto rounded-[20px] shadow-md border mx-auto" alt="Hygiene infographic"/>
    </div>
    <h3>Step-by-Step Clean Care Checklist</h3>
    <ol>
      <li><strong>Wash hands with soap:</strong> Always wash before preparing food, feeding, or carrying your baby, and immediately after changing diapers.</li>
      <li><strong>Newborn cord hygiene:</strong> Keep the baby's umbilical cord stump clean and dry. Avoid applying mud, cow dung, or unapproved powders.</li>
      <li><strong>Breast cleaning:</strong> Wipe breasts with a damp cloth if necessary, but avoid heavy perfumed soaps which can dry out nipples or deter the infant.</li>
    </ol>`,
    rich_text_content_sw: `<div class="text-center mb-6">
      <img src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&h=1200&fit=crop" class="max-w-full h-auto rounded-[20px] shadow-md border mx-auto" alt="Usafi picha"/>
    </div>
    <h3>Hatua kwa Hatua za Usafi kwa Mtoto</h3>
    <ol>
      <li><strong>Nawa mikono kwa sabuni:</strong> Nawa mikono yako vizuri kabla ya kuandaa chakula, kunyonyesha, au kumbeba mtoto, na mara baada ya kubadilisha nepi.</li>
      <li><strong>Usafi wa kitovu cha mtoto:</strong> Weka kitovu cha mtoto kikiwa safi na kikavu. Epuka kuweka udongo, samadi au poda ambazo hazijapitishwa na daktari.</li>
      <li><strong>Kusafisha matiti:</strong> Futa matiti kwa kitambaa safi chenye maji ya uvuguvugu kama ni lazima. Epuka sabuni zenye manukato makali.</li>
    </ol>`,
    quiz_questions: [
      {
        question: 'What is the safest way to care for a newborn baby\'s umbilical cord stump?',
        question_sw: 'Ni ipi njia salama zaidi ya kutunza kitovu cha mtoto mchanga?',
        options: ['Keep it clean and completely dry', 'Apply local oils or cow dung to heal it', 'Cover it tightly with thick plaster', 'Keep it wet with regular washing'],
        options_sw: ['Kuweka safi na kavu kabisa', 'Kupaka mafuta ya kienyeji au samadi ya ng\'ombe ili kipone', 'Kufunika kwa nguvu na plasta nzito', 'Kuweka unyevunyevu kwa kuosha mara kwa mara'],
        correct_answer_index: 0,
        explanation: 'Keeping the umbilical cord clean and dry is the safest way to prevent dangerous infections like neonatal tetanus.',
        explanation_sw: 'Kuweka kitovu kikiwa safi na kikavu ni njia salama zaidi ya kuzuia maambukizi hatari kama vile pepopunda ya watoto wachanga.'
      }
    ]
  },
  { 
    id: 'lc6', 
    title: 'Complementary Feeding Starting at 6 Months', 
    title_sw: 'Chakula cha Ziada Kuanzia Miezi 6', 
    category: 'nutrition', 
    content_type: 'article', 
    reading_time_minutes: 4,
    thumbnail_url: 'https://images.unsplash.com/photo-1528820530954-4dac0c890527?w=600&h=350&fit=crop', 
    target_audience: 'infant',
    age_min_weeks: 24,
    age_max_weeks: 48,
    description: 'Learn how to safely introduce solid foods alongside continued breastfeeding as your baby reaches 6 months of age.',
    description_sw: 'Jifunze jinsi ya kuanzisha chakula cha kulisha mtoto kwa usalama pamoja na kuendelea kunyonyesha anapofikisha miezi 6.',
    rich_text_content: `<h3>Starting Solid Foods Safely</h3>
    <p>At 6 months (26 weeks) of age, a baby's nutritional needs begin to exceed what breast milk alone can provide. This is the time to start complementary feeding.</p>
    
    <h4>1. Start Small & Patiently</h4>
    <p>Begin with 2 to 3 spoonfuls of soft porridge (uji) or pureed fruits (mashed banana, avocado, or papaya) twice a day. Keep the food smooth and easy to swallow.</p>
    
    <h4>2. Keep Breastfeeding</h4>
    <p>Complementary feeding is meant to *add to* breast milk, not replace it. Continue to breastfeed your baby on demand up to 2 years or beyond.</p>
    
    <h4>3. Food Variety and Nutrients</h4>
    <p>As the baby tolerates foods, introduce mashed vegetables, potatoes, eggs, and cooked beans to ensure they get vitamins, iron, and proteins.</p>`,
    rich_text_content_sw: `<h3>Kuanzisha Chakula cha Ziada kwa Usalama</h3>
    <p>Katika umri wa miezi 6 (wiki 26), mahitaji ya mtoto ya lishe yanaanza kuzidi yale yanayotolewa na maziwa ya mama pekee. Huu ndio wakati wa kuanza kumpa chakula cha ziada.</p>
    
    <h4>1. Anza Kidogo Kidogo</h4>
    <p>Anza na vijiko 2 hadi 3 vya uji laini au matunda yaliyopondwa (ndizi, parachichi, au papai) mara mbili kwa siku. Hakikisha chakula ni laini na rahisi kumeza.</p>
    
    <h4>2. Endelea Kunyonyesha</h4>
    <p>Chakula cha ziada kinakusudiwa *kuongeza* nguvu, si kuchukua nafasi ya maziwa. Endelea kunyonyesha mtoto wako anapotaka hadi miaka 2 au zaidi.</p>
    
    <h4>3. Aina za Vyakula na Virutubisho</h4>
    <p>Mtoto anapozoea vyakula, anza kuweka mboga za majani zilizopondwa, viazi, mayai, na maharagwe yaliyoiva vizuri ili apate vitamini na protini.</p>`,
    quiz_questions: [
      {
        question: 'At what age should solid foods be introduced to a baby\'s diet?',
        question_sw: 'Vyakula vya ziada (vya kulisha) vinapaswa kuanzishwa akiwa na umri gani?',
        options: ['3 Months', '4 Months', '6 Months', '9 Months'],
        options_sw: ['Miezi 3', 'Miezi 4', 'Miezi 6', 'Miezi 9'],
        correct_answer_index: 2,
        explanation: 'At 6 months, exclusive breastfeeding is no longer enough to meet all nutritional requirements, but breastfeeding should continue.',
        explanation_sw: 'Katika miezi 6, kunyonyesha maziwa pekee hakutoshi kukidhi mahitaji yote ya lishe ya mtoto, lakini unyonyeshaji unapaswa kuendelea.'
      }
    ]
  }
];

function calculateGestationalAgeInWeeks(lmpString, referenceDate = new Date()) {
  const lmp = new Date(lmpString);
  if (isNaN(lmp.getTime())) return 0;
  
  const diffTime = referenceDate.getTime() - lmp.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.floor(diffDays / 7));
}

// Personalization Scoring algorithm
function calculateRelevanceScore(item, mother, children = [], activeAlerts = []) {
  let score = 0;
  let reasonEn = '';
  let reasonSw = '';

  // 1. Active Danger Alerts Match (+100)
  if (activeAlerts.length > 0) {
    const hasCriticalDanger = activeAlerts.some(a => a.severity === 'critical' || a.alert_type === 'danger_sign');
    if (hasCriticalDanger && item.category === 'danger_signs') {
      score += 100;
      reasonEn = 'High Priority: Matches active emergency flags';
      reasonSw = 'Kipaumbele cha Juu: Inalingana na tahadhari ya hatari';
    }
  }

  // 2. Pregnancy & Trimester Logic
  if (mother && mother.pregnancy_status === 'pregnant' && mother.lmp) {
    const gaWeeks = calculateGestationalAgeInWeeks(mother.lmp);
    
    if (item.target_audience === 'pregnant') {
      score += 40;
    }

    if (gaWeeks <= 13) {
      if (item.category === 'pregnancy' || item.category === 'nutrition') {
        score += 60;
        reasonEn = `Trimester 1: Week ${gaWeeks} essentials`;
        reasonSw = `Kipindi cha 1: Muhimu kwa Wiki ya ${gaWeeks}`;
      }
    } else if (gaWeeks <= 26) {
      if (item.category === 'development' || item.category === 'nutrition') {
        score += 60;
        reasonEn = `Trimester 2: Week ${gaWeeks} guidelines`;
        reasonSw = `Kipindi cha 2: Miongozo ya Wiki ya ${gaWeeks}`;
      }
    } else {
      if (item.category === 'danger_signs' || item.category === 'breastfeeding' || item.category === 'pregnancy') {
        score += 60;
        reasonEn = `Trimester 3: Week ${gaWeeks} preparations`;
        reasonSw = `Kipindi cha 3: Maandalizi ya Wiki ya ${gaWeeks}`;
      }
    }
  }

  // 3. Child Age & Milestone Matching
  if (children.length > 0) {
    const agesInWeeks = children.map(child => {
      const diffTime = new Date() - new Date(child.date_of_birth);
      return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7)));
    });
    
    const youngestWeeks = Math.min(...agesInWeeks);

    // Direct age bounds check (+80)
    if (item.age_min_weeks !== undefined && item.age_max_weeks !== undefined) {
      const isWithinBounds = agesInWeeks.some(age => age >= item.age_min_weeks && age <= item.age_max_weeks);
      if (isWithinBounds) {
        score += 80;
        const youngestMonths = Math.floor(youngestWeeks / 4.3);
        reasonEn = youngestMonths > 0 ? `Matches age of your ${youngestMonths}-month-old` : `For your newborn baby`;
        reasonSw = youngestMonths > 0 ? `Inalingana na umri wa mtoto wako wa miezi ${youngestMonths}` : `Kwa mtoto wako mchanga`;
      }
    }

    if (youngestWeeks <= 4) {
      if (item.target_audience === 'newborn') score += 40;
      if (item.category === 'breastfeeding' || item.category === 'hygiene') score += 20;
    } else if (youngestWeeks <= 52) {
      if (item.target_audience === 'infant') score += 40;
      if (item.category === 'immunization' || item.category === 'nutrition') score += 20;
    } else {
      if (item.target_audience === 'toddler') score += 40;
      if (item.category === 'development' || item.category === 'nutrition') score += 20;
    }
  }

  if (item.is_featured) {
    score += 15;
  }

  return { score, reasonEn, reasonSw };
}

// Youtube URL parser helper
function getYoutubeEmbedUrl(url) {
  if (!url) return '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}?autoplay=1&rel=0`;
  }
  return null;
}

export default function Learn() {
  const { t, lang } = useLang();
  
  // Context states
  const [mother, setMother] = useState(null);
  const [children, setChildren] = useState([]);
  const [alerts, setAlerts] = useState([]);
  
  // Interactive Hub States
  const [content, setContent] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [playing, setPlaying] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Quiz Module States
  const [quizActive, setQuizActive] = useState(false);
  const [currentQuizQuestionIndex, setCurrentQuizQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  
  // Offline Caching State
  const [downloadedIds, setDownloadedIds] = useState([]);
  
  // Custom Audio Controller References and States
  const audioRef = useRef(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioSpeed, setAudioSpeed] = useState(1);
  const [audioVolume, setAudioVolume] = useState(0.8);

  useEffect(() => {
    loadData();
    // Load offline content configuration
    try {
      const stored = localStorage.getItem('db_DownloadedContent');
      if (stored) setDownloadedIds(JSON.parse(stored));
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Sync data
  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch user context
      const currentUser = await db.auth.me();
      let mothers = [];
      let kids = [];
      let alertList = [];
      
      if (currentUser) {
        [mothers, kids, alertList] = await Promise.all([
          db.entities.Mother.list('-created_date', 1),
          db.entities.Child.list('-created_date', 20),
          db.entities.AIAlert.filter({ is_resolved: false }, '-created_date', 10).catch(() => []),
        ]);
      }
      
      const m = mothers[0] || null;
      setMother(m);
      setChildren(kids);
      setAlerts(alertList);

      // 2. Fetch learning content from database (or fall back to sample content)
      const items = await db.entities.LearningContent.list('-view_count', 100);
      let contentList = items.length > 0 ? items : SAMPLE_CONTENT;

      // Seed content to localStorage if empty
      if (items.length === 0) {
        for (const item of SAMPLE_CONTENT) {
          try {
            await db.entities.LearningContent.create(item);
          } catch(err) {}
        }
      }

      // Calculate personalization relevance for each item
      const scoredContent = contentList.map(item => {
        const { score, reasonEn, reasonSw } = calculateRelevanceScore(item, m, kids, alertList);
        return {
          ...item,
          relevance_score: score,
          relevance_reason_en: reasonEn,
          relevance_reason_sw: reasonSw
        };
      });

      setContent(scoredContent);
    } catch (e) {
      console.error(e);
      // Fallback
      setContent(SAMPLE_CONTENT.map(item => ({ ...item, relevance_score: 0 })));
    } finally {
      setLoading(false);
    }
  };

  // Audio effect controller syncing
  useEffect(() => {
    if (playing && playing.content_type === 'audio' && audioRef.current) {
      // Reset play state
      setIsPlayingAudio(false);
      setAudioProgress(0);
      setAudioSpeed(1);
    }
  }, [playing]);

  // Format second duration into string
  const formatDuration = (secs) => {
    if (!secs) return '0 min';
    const m = Math.floor(secs / 60);
    return `${m} min`;
  };

  // Toggle saving offline content ID
  const toggleOfflineDownload = (e, contentId) => {
    e.stopPropagation();
    let updated;
    if (downloadedIds.includes(contentId)) {
      updated = downloadedIds.filter(id => id !== contentId);
    } else {
      updated = [...downloadedIds, contentId];
    }
    setDownloadedIds(updated);
    localStorage.setItem('db_DownloadedContent', JSON.stringify(updated));
  };

  // Custom Audio Controller Functions
  const handlePlayPauseAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  const handleAudioTimeUpdate = () => {
    if (!audioRef.current) return;
    setAudioProgress(audioRef.current.currentTime);
  };

  const handleAudioLoadedMetadata = () => {
    if (!audioRef.current) return;
    setAudioDuration(audioRef.current.duration);
  };

  const handleAudioSpeedChange = () => {
    if (!audioRef.current) return;
    let nextSpeed = 1;
    if (audioSpeed === 1) nextSpeed = 1.5;
    else if (audioSpeed === 1.5) nextSpeed = 2;
    else nextSpeed = 1;
    audioRef.current.playbackRate = nextSpeed;
    setAudioSpeed(nextSpeed);
  };

  const handleAudioScrubChange = (e) => {
    const val = parseFloat(e.target.value);
    setAudioProgress(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  // Quiz Interaction Handlers
  const handleStartQuiz = () => {
    setQuizActive(true);
    setCurrentQuizQuestionIndex(0);
    setSelectedOptionIndex(null);
    setShowExplanation(false);
    setQuizScore(0);
    setQuizFinished(false);
  };

  const handleOptionSelect = (optionIndex) => {
    if (showExplanation) return; // Prevent double clicking
    setSelectedOptionIndex(optionIndex);
    setShowExplanation(true);
    
    const currentQuestion = playing.quiz_questions[currentQuizQuestionIndex];
    if (optionIndex === currentQuestion.correct_answer_index) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleNextQuizQuestion = () => {
    const nextIndex = currentQuizQuestionIndex + 1;
    if (nextIndex < playing.quiz_questions.length) {
      setCurrentQuizQuestionIndex(nextIndex);
      setSelectedOptionIndex(null);
      setShowExplanation(false);
    } else {
      setQuizFinished(true);
    }
  };

  const getQuizBadge = (score, total) => {
    const pct = score / total;
    if (pct === 1) return { en: 'Super Star Student 🌟', sw: 'Mwanafunzi Shujaa 🌟', bg: 'bg-[#FFF8E1] border-[#F9A825]' };
    if (pct >= 0.5) return { en: 'Knowledge Builder 🌱', sw: 'Mjenzi wa Maarifa 🌱', bg: 'bg-[#F0FBF6] border-[#2E7A5D]' };
    return { en: 'Curious Learner 📚', sw: 'Msomaji Mdadisi 📚', bg: 'bg-[#EEF9FF] border-[#0099CC]' };
  };

  // Searching & Category Filters
  const categories = ['all', ...Object.keys(CATEGORY_CONFIG)];
  
  const searchFiltered = content.filter(item => {
    const titleMatch = (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                       (item.title_sw || '').toLowerCase().includes(searchQuery.toLowerCase());
    const descMatch = (item.description || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                      (item.description_sw || '').toLowerCase().includes(searchQuery.toLowerCase());
    return titleMatch || descMatch;
  });

  const filtered = activeCategory === 'all' 
    ? searchFiltered 
    : searchFiltered.filter(c => c.category === activeCategory);

  // Sorting: Highest Personalized Relevance score first, then featured items
  const sortedFiltered = [...filtered].sort((a, b) => {
    // If scores differ, highest first
    if ((b.relevance_score || 0) !== (a.relevance_score || 0)) {
      return (b.relevance_score || 0) - (a.relevance_score || 0);
    }
    // Else featured first
    if (b.is_featured !== a.is_featured) {
      return b.is_featured ? 1 : -1;
    }
    return (b.view_count || 0) - (a.view_count || 0);
  });

  // Featured shelf: Items where relevance is high or they are marked featured
  const featured = content.filter(c => c.is_featured).slice(0, 4);

  // Personalized shelf (relevance score > 40)
  const personalizedRecommendations = content
    .filter(c => (c.relevance_score || 0) >= 40)
    .sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0))
    .slice(0, 3);

  return (
    <AppShell>
      <div className="animate-fade-in pb-16 bg-[#FAFAFA] min-h-screen">
        
        {/* Banner with modern soft gradients */}
        <div className="relative px-4 pt-14 pb-8 overflow-hidden bg-gradient-to-b from-[#7C3AED]/5 to-transparent">
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#7C3AED] opacity-[0.08] blur-3xl pointer-events-none" />
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-72 h-32 rounded-full bg-[#1B6B5A] opacity-[0.04] blur-2xl pointer-events-none" />
          
          <p className="text-[10px] tracking-[0.25em] font-extrabold uppercase text-[#7C3AED] mb-1.5 flex items-center gap-1">
            <Sparkle size={10} className="fill-[#7C3AED]" />
            {lang === 'sw' ? 'ELIMU YA AFYA' : 'HEALTH EDUCATION'}
          </p>
          <h1 className="font-extrabold leading-tight text-[#111111] text-[34px] tracking-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            {t('learning_hub') || (lang === 'sw' ? 'Kituo cha Maarifa' : 'Learning Hub')}
          </h1>
          <p className="text-[13px] text-[#777777] mt-1">
            {lang === 'sw' ? 'Pata masomo yaliyochaguliwa kwa ajili ya safari yako ya afya' : 'Get guides tailored specifically to your health journey'}
          </p>
          
          {/* Search bar inside header */}
          <div className="relative mt-6 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9A9A]" size={16} />
            <input
              type="text"
              placeholder={lang === 'sw' ? 'Tafuta masomo, miongozo, video...' : 'Search articles, videos, guides...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-11 pr-4 rounded-2xl bg-white border border-[#EBEBEB] text-[13px] text-[#0A0A0A] placeholder-[#9A9A9A] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all shadow-card"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#F5F5F7] flex items-center justify-center text-[#777777] hover:text-[#0A0A0A]"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <div className="w-8 h-8 border-3 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
            <p className="text-[12px] text-[#888]">{lang === 'sw' ? 'Inapakia maarifa...' : 'Loading resources...'}</p>
          </div>
        ) : (
          <>
            {/* Recommendation Shelf based on Personalized Algorithm */}
            {personalizedRecommendations.length > 0 && !searchQuery && activeCategory === 'all' && (
              <div className="mb-6 px-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <Sparkles size={14} className="text-[#7C3AED] fill-[#7C3AED]" />
                  <p className="text-[11px] tracking-[0.18em] uppercase font-extrabold text-[#7C3AED]">
                    {lang === 'sw' ? 'KWA AJILI YAKO' : 'RECOMMENDED FOR YOU'}
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  {personalizedRecommendations.map(item => {
                    const cat = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.nutrition;
                    const isDownloaded = downloadedIds.includes(item.id);
                    return (
                      <div
                        key={`rec-${item.id}`}
                        className="bg-white rounded-3xl overflow-hidden border border-[#EBEBEB] shadow-card flex relative hover:border-[#7C3AED]/20 active:scale-[0.99] transition-all cursor-pointer"
                        onClick={() => {
                          setPlaying(item);
                          // Track view count
                          db.entities.LearningContent.update(item.id, { view_count: (item.view_count || 0) + 1 }).catch(() => {});
                        }}
                      >
                        {/* Thumbnail overlay playing */}
                        <div className="relative w-28 flex-shrink-0">
                          <img
                            src={item.thumbnail_url}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={e => { e.target.style.backgroundColor = cat.bg; e.target.style.display = 'none'; }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md bg-white/95 shadow-md">
                              {item.content_type === 'audio' ? (
                                <Headphones size={15} className="text-[#7C3AED]" />
                              ) : item.content_type === 'article' ? (
                                <FileText size={15} className="text-[#2E7A5D]" />
                              ) : item.content_type === 'infographic' ? (
                                <ImageIcon size={15} className="text-[#0099CC]" />
                              ) : (
                                <Play size={15} className="text-[#E91E8C] ml-0.5" fill="currentColor" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Recommendation contents */}
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[9px] tracking-[0.1em] uppercase font-extrabold px-2 py-0.5 rounded-full" style={{ color: cat.color, backgroundColor: cat.bg }}>
                                {lang === 'sw' ? cat.sw : cat.en}
                              </span>
                              
                              {/* Offline Download Trigger */}
                              <button 
                                onClick={(e) => toggleOfflineDownload(e, item.id)}
                                className={cn(
                                  "w-6 h-6 rounded-full flex items-center justify-center transition-all",
                                  isDownloaded ? "bg-[#2E7A5D]/10 text-[#2E7A5D]" : "bg-transparent text-[#9A9A9A] hover:bg-[#F5F5F7] hover:text-[#0A0A0A]"
                                )}
                              >
                                {isDownloaded ? <Check size={12} strokeWidth={3} /> : <Download size={12} />}
                              </button>
                            </div>
                            <h3 className="text-[13px] font-bold text-[#111111] leading-snug line-clamp-2 pr-4">
                              {lang === 'sw' && item.title_sw ? item.title_sw : item.title}
                            </h3>
                          </div>
                          
                          {/* Reason tag from algorithm */}
                          <div className="mt-2.5 pt-2 border-t border-[#F5F5F7] flex items-center justify-between">
                            <span className="text-[9px] font-semibold text-[#7C3AED] flex items-center gap-1 bg-[#7C3AED]/5 px-2 py-0.5 rounded-md">
                              <Sparkles size={9} className="fill-[#7C3AED]" />
                              {lang === 'sw' ? item.relevance_reason_sw : item.relevance_reason_en}
                            </span>
                            <div className="flex items-center gap-1 text-[#A0A0A0]">
                              <Clock size={10} />
                              <span className="text-[9px] font-medium">
                                {item.content_type === 'article' ? `${item.reading_time_minutes} min read` : formatDuration(item.duration_seconds)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Featured Horizontal Scroller */}
            {featured.length > 0 && !searchQuery && activeCategory === 'all' && (
              <div className="mb-6">
                <p className="text-[10px] tracking-[0.2em] uppercase font-extrabold text-[#A0A0A0] px-4 mb-3">
                  {lang === 'sw' ? 'MAZINGIRA MAALUM' : 'FEATURED CONTENT'}
                </p>
                <div className="flex gap-4.5 px-4 overflow-x-auto pb-2.5 no-scrollbar">
                  {featured.map(item => {
                    const cat = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.nutrition;
                    return (
                      <div
                        key={`featured-${item.id}`}
                        className="flex-shrink-0 w-64 rounded-3xl overflow-hidden border border-[#EBEBEB] bg-white shadow-card active:scale-[0.98] transition-all cursor-pointer group"
                        onClick={() => {
                          setPlaying(item);
                          db.entities.LearningContent.update(item.id, { view_count: (item.view_count || 0) + 1 }).catch(() => {});
                        }}
                      >
                        <div className="relative h-36 overflow-hidden">
                          <img
                            src={item.thumbnail_url}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={e => { e.target.style.display = 'none'; }}
                          />
                          <div className="absolute inset-0 bg-black/15 flex items-center justify-center">
                            <div className="w-12 h-12 bg-white/95 rounded-full flex items-center justify-center shadow-float active:scale-90 transition-transform">
                              {item.content_type === 'audio' ? (
                                <Headphones size={18} className="text-[#7C3AED]" />
                              ) : item.content_type === 'article' ? (
                                <FileText size={18} className="text-[#2E7A5D]" />
                              ) : item.content_type === 'infographic' ? (
                                <ImageIcon size={18} className="text-[#0099CC]" />
                              ) : (
                                <Play size={18} className="text-[#0A0A0A] ml-0.5" fill="#0A0A0A" />
                              )}
                            </div>
                          </div>
                          <div className="absolute top-3 left-3">
                            <span className="text-[9px] tracking-[0.1em] uppercase font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: cat.color }}>
                              {cat.icon} {lang === 'sw' ? cat.sw : cat.en}
                            </span>
                          </div>
                          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/60 rounded-full px-2.5 py-0.5 backdrop-blur-sm">
                            <Clock size={10} className="text-white" />
                            <span className="text-[9px] text-white font-medium">
                              {item.content_type === 'article' ? `${item.reading_time_minutes} min read` : formatDuration(item.duration_seconds)}
                            </span>
                          </div>
                        </div>
                        <div className="p-4 bg-white">
                          <p className="text-[13px] font-bold text-[#111111] leading-snug line-clamp-2 group-hover:text-[#7C3AED] transition-colors">
                            {lang === 'sw' && item.title_sw ? item.title_sw : item.title}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Category selection bar */}
            <div className="flex gap-2 px-4 overflow-x-auto pb-2 no-scrollbar mb-4">
              {categories.map(cat => {
                const config = CATEGORY_CONFIG[cat];
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={`cat-${cat}`}
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      'flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[12px] font-bold transition-all active:scale-[0.95] shadow-sm',
                      isActive
                        ? 'bg-[#111111] text-white ring-2 ring-[#111111]/10'
                        : 'bg-white border border-[#EBEBEB] text-[#666666] hover:bg-[#F5F5F7]'
                    )}
                  >
                    {config && <span>{config.icon}</span>}
                    {cat === 'all'
                      ? (lang === 'sw' ? 'Zote' : 'All')
                      : (lang === 'sw' ? config?.sw : config?.en) || cat}
                  </button>
                );
              })}
            </div>

            {/* Core learning assets list */}
            <div className="px-4 flex flex-col gap-3 pb-6">
              <p className="text-[10px] tracking-[0.2em] uppercase font-extrabold text-[#A0A0A0] mt-2 mb-1">
                {lang === 'sw' ? 'MADA ZOTE' : 'ALL TOPICS'}
              </p>
              {sortedFiltered.length === 0 ? (
                <div className="bg-white rounded-3xl border border-[#EBEBEB] p-8 text-center shadow-card">
                  <AlertTriangle className="mx-auto text-[#A0A0A0] mb-2" size={24} />
                  <p className="text-[13px] font-bold text-[#111111] mb-1">
                    {lang === 'sw' ? 'Hakuna mafunzo yaliyopatikana' : 'No lessons found'}
                  </p>
                  <p className="text-[11px] text-[#A0A0A0]">
                    {lang === 'sw' ? 'Jaribu kubadilisha maneno ya kutafuta' : 'Try modifying your search queries'}
                  </p>
                </div>
              ) : (
                sortedFiltered.map(item => {
                  const cat = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.nutrition;
                  const isDownloaded = downloadedIds.includes(item.id);
                  return (
                    <div
                      key={`list-${item.id}`}
                      className="bg-white rounded-3xl overflow-hidden border border-[#EBEBEB] shadow-card flex active:scale-[0.99] hover:border-[#7C3AED]/15 transition-all cursor-pointer relative"
                      onClick={() => {
                        setPlaying(item);
                        db.entities.LearningContent.update(item.id, { view_count: (item.view_count || 0) + 1 }).catch(() => {});
                      }}
                    >
                      {/* Left icon badge box */}
                      <div className="relative w-28 flex-shrink-0">
                        <img
                          src={item.thumbnail_url}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={e => { e.target.style.backgroundColor = cat.bg; e.target.style.display = 'none'; }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md bg-white/95 shadow-md">
                            {item.content_type === 'audio' ? (
                              <Headphones size={15} className="text-[#7C3AED]" />
                            ) : item.content_type === 'article' ? (
                              <FileText size={15} className="text-[#2E7A5D]" />
                            ) : item.content_type === 'infographic' ? (
                              <ImageIcon size={15} className="text-[#0099CC]" />
                            ) : (
                              <Play size={15} className="text-[#E91E8C] ml-0.5" fill="currentColor" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Main text block */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[9px] tracking-[0.1em] uppercase font-extrabold px-2 py-0.5 rounded-full" style={{ color: cat.color, backgroundColor: cat.bg }}>
                              {lang === 'sw' ? cat.sw : cat.en}
                            </span>
                            
                            <button 
                              onClick={(e) => toggleOfflineDownload(e, item.id)}
                              className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center transition-all",
                                isDownloaded ? "bg-[#2E7A5D]/10 text-[#2E7A5D]" : "bg-transparent text-[#9A9A9A] hover:bg-[#F5F5F7]"
                              )}
                            >
                              {isDownloaded ? <Check size={12} strokeWidth={3} /> : <Download size={12} />}
                            </button>
                          </div>
                          <p className="text-[13px] font-bold text-[#111111] leading-snug line-clamp-2 pr-4">
                            {lang === 'sw' && item.title_sw ? item.title_sw : item.title}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2.5">
                          <span className="text-[10px] text-[#888888] font-medium">
                            {item.target_audience === 'pregnant' ? (lang === 'sw' ? 'Wajawazito' : 'Pregnant') :
                             item.target_audience === 'newborn' ? (lang === 'sw' ? 'Watoto Wachanga' : 'Newborns') :
                             item.target_audience === 'infant' ? (lang === 'sw' ? 'Watoto < Mwaka 1' : 'Infants') :
                             (lang === 'sw' ? 'Kila Mtu' : 'All caregivers')}
                          </span>
                          <div className="flex items-center gap-1 text-[#A0A0A0]">
                            <Clock size={11} />
                            <span className="text-[11px] font-medium">
                              {item.content_type === 'article' ? `${item.reading_time_minutes} min read` : formatDuration(item.duration_seconds)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* ── Multi-Format Unified Modal Viewer (Videos, Audios, Articles, Infographics) ── */}
        {playing && !quizActive && (
          <div
            className="fixed inset-0 z-50 bg-[#0F0F0F]/80 flex flex-col items-center justify-center p-4 backdrop-blur-md animate-fade-in"
            onClick={() => setPlaying(null)}
          >
            <div
              className="bg-white rounded-3xl overflow-hidden w-full max-w-lg shadow-float flex flex-col max-h-[85vh] animate-bounce-in"
              onClick={e => e.stopPropagation()}
            >
              
              {/* Header bar */}
              <div className="p-4 border-b border-[#F5F5F7] flex items-center justify-between">
                <span className="text-[10px] tracking-[0.15em] uppercase font-bold text-[#888888] bg-[#F5F5F7] px-3 py-1 rounded-full">
                  {playing.content_type === 'audio' ? (lang === 'sw' ? 'Podcast / Sauti' : 'Audio Lesson') :
                   playing.content_type === 'article' ? (lang === 'sw' ? 'Makala / Mwongozo' : 'Article') :
                   playing.content_type === 'infographic' ? (lang === 'sw' ? 'Picha / Infografia' : 'Infographic') :
                   (lang === 'sw' ? 'Video ya Mafunzo' : 'Video Lesson')}
                </span>
                <button 
                  onClick={() => setPlaying(null)}
                  className="w-8 h-8 rounded-full bg-[#F5F5F7] flex items-center justify-center text-[#555555] active:scale-90 transition-transform"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Media Player Rendering Frame */}
              <div className="flex-1 overflow-y-auto">
                
                {/* 1. Video Player Container */}
                {playing.content_type === 'video' && (
                  <div className="relative bg-black aspect-video w-full flex items-center justify-center">
                    {getYoutubeEmbedUrl(playing.video_url) ? (
                      <iframe
                        src={getYoutubeEmbedUrl(playing.video_url)}
                        title={playing.title}
                        className="w-full h-full border-none"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : playing.video_url ? (
                      <video src={playing.video_url} controls className="w-full h-full" autoPlay />
                    ) : (
                      <div className="flex flex-col items-center gap-2 p-6 text-center text-white">
                        <AlertTriangle className="text-[#E91E8C]" size={36} />
                        <p className="text-[13px]">
                          {lang === 'sw' ? 'Video hii haipatikani bila mtandao' : 'Video resource unavailable offline'}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Custom Podcasts / Audio Controller */}
                {playing.content_type === 'audio' && (
                  <div className="p-6 flex flex-col items-center text-center bg-gradient-to-b from-[#7C3AED]/5 to-transparent">
                    
                    {/* Disc cover art */}
                    <div className="relative w-28 h-28 rounded-full overflow-hidden shadow-teal-glow mb-4 border-2 border-white bg-white flex items-center justify-center">
                      <img 
                        src={playing.thumbnail_url} 
                        className={cn("w-full h-full object-cover absolute", isPlayingAudio && "animate-spin [animation-duration:20s]")} 
                        alt="" 
                      />
                      <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] flex items-center justify-center">
                        <Headphones size={24} className="text-white drop-shadow" />
                      </div>
                    </div>

                    <audio 
                      ref={audioRef} 
                      src={playing.audio_url}
                      onTimeUpdate={handleAudioTimeUpdate}
                      onLoadedMetadata={handleAudioLoadedMetadata}
                      onEnded={() => setIsPlayingAudio(false)}
                    />

                    {/* Progress scrubber bar */}
                    <div className="w-full px-2 mt-2">
                      <input 
                        type="range" 
                        min={0}
                        max={audioDuration || 100}
                        value={audioProgress}
                        onChange={handleAudioScrubChange}
                        className="w-full h-1.5 bg-[#EBEBEB] rounded-lg appearance-none cursor-pointer accent-[#7C3AED]"
                      />
                      <div className="flex justify-between text-[10px] text-[#A0A0A0] mt-1 font-semibold">
                        <span>{Math.floor(audioProgress / 60)}:{(Math.floor(audioProgress % 60)).toString().padStart(2, '0')}</span>
                        <span>{Math.floor(audioDuration / 60)}:{(Math.floor(audioDuration % 60)).toString().padStart(2, '0')}</span>
                      </div>
                    </div>

                    {/* Audio operations panel */}
                    <div className="flex items-center gap-6 mt-4">
                      {/* Playback speed toggle */}
                      <button 
                        onClick={handleAudioSpeedChange}
                        className="text-[10px] font-bold text-[#7C3AED] bg-[#7C3AED]/10 px-2.5 py-1 rounded-full active:scale-95"
                      >
                        {audioSpeed}x
                      </button>

                      {/* Core Play Button */}
                      <button 
                        onClick={handlePlayPauseAudio}
                        className="w-14 h-14 rounded-full bg-[#7C3AED] text-white flex items-center justify-center active:scale-[0.92] transition-transform shadow-teal-glow"
                      >
                        {isPlayingAudio ? (
                          <div className="flex items-center gap-1 justify-center">
                            <span className="w-1.5 h-5 bg-white rounded-full animate-pulse" />
                            <span className="w-1.5 h-5 bg-white rounded-full animate-pulse [animation-delay:0.2s]" />
                          </div>
                        ) : (
                          <Play size={20} className="ml-1 fill-white" />
                        )}
                      </button>

                      {/* Volume display toggle */}
                      <button className="text-[#777777] hover:text-[#0A0A0A] active:scale-95">
                        <Volume2 size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* 3 & 4. Article and Infographic Reader Screen */}
                {(playing.content_type === 'article' || playing.content_type === 'infographic') && (
                  <div className="p-6">
                    <h2 className="text-[22px] font-bold text-[#111111] leading-tight mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                      {lang === 'sw' && playing.title_sw ? playing.title_sw : playing.title}
                    </h2>
                    
                    {/* Rich description */}
                    <p className="text-[13px] font-semibold text-[#888888] italic mb-6 border-l-2 border-[#7C3AED] pl-3">
                      {lang === 'sw' ? playing.description_sw : playing.description}
                    </p>

                    {/* Scrollable text markup rendered directly */}
                    <div 
                      className="prose prose-sm max-w-none text-[13.5px] leading-relaxed text-[#333333] space-y-4 article-body"
                      dangerouslySetInnerHTML={{ __html: lang === 'sw' ? playing.rich_text_content_sw : playing.rich_text_content }}
                    />
                  </div>
                )}

                {/* Description panel for Audio/Video */}
                {(playing.content_type === 'video' || playing.content_type === 'audio') && (
                  <div className="p-6 border-t border-[#F5F5F7]">
                    <h3 className="text-[16px] font-bold text-[#111111] leading-snug mb-2">
                      {lang === 'sw' && playing.title_sw ? playing.title_sw : playing.title}
                    </h3>
                    <p className="text-[13px] text-[#555555] leading-relaxed">
                      {lang === 'sw' ? playing.description_sw : playing.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer bar with check-your-knowledge trigger */}
              <div className="p-5 border-t border-[#F5F5F7] bg-[#FAFAFA]">
                {playing.quiz_questions && playing.quiz_questions.length > 0 ? (
                  <button
                    onClick={handleStartQuiz}
                    className="w-full h-12 rounded-full bg-[#7C3AED] text-white text-[13px] font-bold flex items-center justify-center gap-2 active:scale-[0.97] transition-transform shadow-md"
                  >
                    <Award size={15} />
                    {lang === 'sw' ? 'Jaribu Maswali ya Maarifa' : 'Take Knowledge Quiz'}
                  </button>
                ) : (
                  <button
                    onClick={() => setPlaying(null)}
                    className="w-full h-12 rounded-full bg-[#111111] text-white text-[13px] font-bold active:scale-[0.97] transition-transform"
                  >
                    {lang === 'sw' ? 'Funga' : 'Close'}
                  </button>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ── Interactive Quiz Overlay Screen (Gamified Badges & Translations) ── */}
        {quizActive && playing && (
          <div className="fixed inset-0 z-50 bg-[#0F0F0F]/85 flex items-center justify-center p-4 backdrop-blur-md">
            <div className="bg-white rounded-3xl overflow-hidden w-full max-w-md shadow-float flex flex-col animate-bounce-in max-h-[90vh]">
              
              {/* Header progress panel */}
              <div className="p-4 border-b border-[#F5F5F7] bg-[#FAFAFA] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="text-[#7C3AED]" size={18} />
                  <span className="text-[12px] font-extrabold text-[#0A0A0A]">
                    {lang === 'sw' ? 'Zoezi la Maarifa' : 'Comprehension Check'}
                  </span>
                </div>
                {!quizFinished && (
                  <span className="text-[10px] font-bold bg-[#7C3AED]/10 text-[#7C3AED] px-3 py-1 rounded-full">
                    {lang === 'sw' ? `Swali la ${currentQuizQuestionIndex + 1} kati ya ${playing.quiz_questions.length}` : `Question ${currentQuizQuestionIndex + 1} of ${playing.quiz_questions.length}`}
                  </span>
                )}
                <button
                  onClick={() => { setQuizActive(false); setQuizFinished(false); }}
                  className="text-[#9A9A9A] hover:text-[#0A0A0A] active:scale-90"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {!quizFinished ? (
                  <div>
                    {/* Active Question Title */}
                    <h3 className="text-[16px] font-bold text-[#111111] leading-snug mb-5">
                      {lang === 'sw' && playing.quiz_questions[currentQuizQuestionIndex].question_sw
                        ? playing.quiz_questions[currentQuizQuestionIndex].question_sw
                        : playing.quiz_questions[currentQuizQuestionIndex].question}
                    </h3>

                    {/* Options list cards */}
                    <div className="flex flex-col gap-3">
                      {(lang === 'sw' && playing.quiz_questions[currentQuizQuestionIndex].options_sw 
                        ? playing.quiz_questions[currentQuizQuestionIndex].options_sw 
                        : playing.quiz_questions[currentQuizQuestionIndex].options
                      ).map((option, idx) => {
                        const isSelected = selectedOptionIndex === idx;
                        const isCorrect = idx === playing.quiz_questions[currentQuizQuestionIndex].correct_answer_index;
                        
                        return (
                          <button
                            key={`opt-${idx}`}
                            onClick={() => handleOptionSelect(idx)}
                            disabled={showExplanation}
                            className={cn(
                              "p-4 rounded-2xl text-[13px] font-semibold text-left border flex items-center justify-between transition-all active:scale-[0.98]",
                              !showExplanation 
                                ? "bg-white border-[#EBEBEB] text-[#333333] hover:bg-[#F5F5F7] hover:border-[#7C3AED]/30"
                                : isSelected
                                  ? isCorrect 
                                    ? "bg-[#2E7A5D]/10 border-[#2E7A5D] text-[#2E7A5D]"
                                    : "bg-[#E51010]/10 border-[#E51010] text-[#E51010]"
                                  : isCorrect 
                                    ? "bg-[#2E7A5D]/10 border-[#2E7A5D] text-[#2E7A5D]" 
                                    : "bg-white border-[#EBEBEB] opacity-50"
                            )}
                          >
                            <span className="flex-1 pr-3">{option}</span>
                            {showExplanation && (
                              isCorrect ? (
                                <CheckCircle2 size={16} className="text-[#2E7A5D] flex-shrink-0" />
                              ) : isSelected ? (
                                <XCircle size={16} className="text-[#E51010] flex-shrink-0" />
                              ) : null
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Answer Explanation Box */}
                    {showExplanation && (
                      <div className="mt-5 p-4 rounded-2xl bg-[#FAFAFA] border border-[#EBEBEB] animate-fade-in">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <HelpCircle size={14} className="text-[#7C3AED]" />
                          <span className="text-[10px] font-bold text-[#888888] uppercase tracking-wider">
                            {lang === 'sw' ? 'UFAFANUZI' : 'EXPLANATION'}
                          </span>
                        </div>
                        <p className="text-[12.5px] leading-relaxed text-[#555555]">
                          {lang === 'sw' && playing.quiz_questions[currentQuizQuestionIndex].explanation_sw
                            ? playing.quiz_questions[currentQuizQuestionIndex].explanation_sw
                            : playing.quiz_questions[currentQuizQuestionIndex].explanation}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Quiz finished rewards screen */
                  <div className="text-center py-6 flex flex-col items-center">
                    
                    {/* Badge Icon Display */}
                    <div className={cn(
                      "w-24 h-24 rounded-full border-2 flex items-center justify-center shadow-md mb-4 relative",
                      getQuizBadge(quizScore, playing.quiz_questions.length).bg
                    )}>
                      <Award size={44} className="text-[#F9A825]" />
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#7C3AED] rounded-full flex items-center justify-center">
                        <Check size={12} className="text-white" strokeWidth={3} />
                      </div>
                    </div>

                    <h3 className="text-[20px] font-extrabold text-[#111111] mb-1">
                      {lang === 'sw' ? 'Zoezi Limekamilika!' : 'Quiz Completed!'}
                    </h3>
                    
                    <p className="text-[14px] font-bold text-[#7C3AED] px-4 py-1 bg-[#7C3AED]/5 rounded-full inline-block mt-1">
                      {lang === 'sw' 
                        ? getQuizBadge(quizScore, playing.quiz_questions.length).sw 
                        : getQuizBadge(quizScore, playing.quiz_questions.length).en
                      }
                    </p>

                    <div className="mt-6 w-full max-w-xs bg-[#FAFAFA] rounded-2xl p-4 border text-[13px]">
                      <div className="flex justify-between mb-2">
                        <span className="text-[#777777] font-semibold">{lang === 'sw' ? 'Alama zako:' : 'Correct Answers:'}</span>
                        <span className="font-extrabold text-[#0A0A0A]">{quizScore} / {playing.quiz_questions.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#777777] font-semibold">{lang === 'sw' ? 'Zawadi za elimu:' : 'Knowledge Score:'}</span>
                        <span className="font-extrabold text-[#2E7A5D] flex items-center gap-1">
                          +{quizScore * 10} XP
                          <Sparkle size={10} className="fill-[#2E7A5D]" />
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom modal navigation */}
              <div className="p-4 border-t border-[#F5F5F7] bg-[#FAFAFA]">
                {!quizFinished ? (
                  showExplanation ? (
                    <button
                      onClick={handleNextQuizQuestion}
                      className="w-full h-12 rounded-full bg-[#111111] text-white text-[13px] font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                    >
                      {lang === 'sw' ? 'Swali Linalofuata' : 'Next Question'}
                      <ArrowRight size={14} />
                    </button>
                  ) : (
                    <p className="text-center text-[11px] text-[#A0A0A0] py-2">
                      {lang === 'sw' ? 'Chagua jibu ili kuona ufafanuzi' : 'Select an answer to reveal explanation'}
                    </p>
                  )
                ) : (
                  <button
                    onClick={() => { setQuizActive(false); setQuizFinished(false); setPlaying(null); }}
                    className="w-full h-12 rounded-full bg-[#2E7A5D] text-white text-[13px] font-bold active:scale-95 transition-transform"
                  >
                    {lang === 'sw' ? 'Kamilisha' : 'Finish & Continue'}
                  </button>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}
