/**
 * TotoAfya Digital - Canonical Design Tokens
 * 
 * Strict clinical and cultural design primitives for maternal, newborn, and child health in Kenya.
 * Standardized across Web (Tailwind) and Native (NativeWind).
 */

export const colors = {
  // Canonical Brand Colors
  brand: {
    teal: '#006B5F', // TotoAfya Teal: Primary clinical, trust, calming
    tealHover: '#00544B',
    tealSubtle: '#E6F4F1',
    gold: '#C98A2C', // Savannah Gold: High-contrast warmth, secondary actions
    goldHover: '#B27823',
    goldSubtle: '#FDF6EB',
    pine: '#0A2E2B', // Deep Pine: High-contrast dark backgrounds and text
    amber: '#D97706', // Alert Amber: Warning, due soon, MAM classification
    amberSubtle: '#FFFBEB',
    crimson: '#DC2626', // Crimson Red: Emergency, overdue, SAM, high-risk ANC
    crimsonSubtle: '#FEF2F2',
  },

  // Primary semantic aliases
  primary: '#006B5F', // TotoAfya Teal
  primaryHover: '#00544B',
  primarySubtle: '#E6F4F1',
  secondary: '#C98A2C', // Savannah Gold
  secondaryHover: '#B27823',
  secondarySubtle: '#FDF6EB',
  accent: '#C98A2C',

  // Canvas & Structure
  background: '#F7F5F0', // Warm Off-white canvas
  surface: '#FFFFFF', // Pure White for cards, sheets, tables
  surfaceSubtle: '#FAFAFA',
  border: '#E5E5E5', // Soft dividers
  borderStrong: '#D1D5DB', // Form input borders

  // Neutral Slate & Gray Scales
  slate: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    950: '#020617',
  },

  // High-Contrast Accessible Text Colors (WCAG 2.1 AA Compliant)
  text: {
    primary: '#0A0A0A', // Body & headlines (19.8:1 on white)
    secondary: '#4A4A4A', // Descriptive labels (9.6:1 on white)
    clinical: '#2B3441', // Laboratory notes & clinical vitals (12.4:1 on white)
    muted: '#6B7280', // Timestamps & placeholders (4.9:1 on white - AA PASS)
    inverse: '#FFFFFF', // Text on primary/crimson badges
  },

  // Semantic Clinical Status Indicators
  status: {
    healthy: '#0E6835', // Success Green
    given: '#0E6835',
    normal: '#0E6835',
    due: '#8F5B00', // Warning Amber (Accessible 5.1:1 on amber background)
    monitor: '#8F5B00',
    mam: '#8F5B00',
    overdue: '#DC2626', // Crimson Red
    critical: '#DC2626',
    sam: '#DC2626',
    at_risk: '#DC2626',
    high_risk_anc: '#DC2626',
    missed: '#DC2626',
    scheduled: '#006B5F', // Primary Teal
    upcoming: '#4B5563', // Neutral Gray
  },

  statusBg: {
    healthy: '#F0FAF5',
    given: '#F0FAF5',
    normal: '#F0FAF5',
    due: '#FFFBEB',
    monitor: '#FFFBEB',
    mam: '#FFFBEB',
    overdue: '#FEF2F2',
    critical: '#FEF2F2',
    sam: '#FEF2F2',
    at_risk: '#FEF2F2',
    high_risk_anc: '#FEF2F2',
    missed: '#FEF2F2',
    scheduled: '#E6F4F1',
    upcoming: '#F3F4F6',
  },

  statusBorder: {
    healthy: '#A3E0BF',
    given: '#A3E0BF',
    normal: '#A3E0BF',
    due: '#FDE68A',
    monitor: '#FDE68A',
    mam: '#FDE68A',
    overdue: '#FCA5A5',
    critical: '#FCA5A5',
    sam: '#FCA5A5',
    at_risk: '#FCA5A5',
    high_risk_anc: '#FCA5A5',
    missed: '#FCA5A5',
    scheduled: '#99D5CE',
    upcoming: '#E5E7EB',
  }
};

// 8-Point Spatial Grid
export const spacing = {
  0: 0,
  1: 4,   // 4px micro-spacing
  2: 8,   // 8px tight gap
  3: 12,  // 12px compact table gap
  4: 16,  // 16px standard card padding / input margin
  6: 24,  // 24px section margins
  8: 32,  // 32px panel spacing
  12: 48, // 48px major view gap
  16: 64, // 64px desktop outer padding
  // Named aliases
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  '3xl': 48,
  '4xl': 64,
};

export const typography = {
  fontFamily: {
    sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    serif: 'Merriweather, Georgia, Cambria, serif',
    mono: '"JetBrains Mono", "SF Mono", Consolas, monospace',
  },
  fontSize: {
    xs: 10,
    sm: 12,
    base: 14,
    lg: 16,
    xl: 18,
    xxl: 22,
    '3xl': 28,
    h1: 32,
    display: 40,
  },
  lineHeight: {
    tight: 1.2,
    snug: 1.33,
    normal: 1.45,
    relaxed: 1.6,
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    black: '800',
  }
};

export const radii = {
  none: 0,
  sm: 4,     // Micro-badges
  md: 8,     // Standard inputs & select controls
  lg: 12,    // Cards & table containers
  xl: 16,    // Large panels & dialogs
  '2xl': 24, // Hero containers & bottom sheets
  full: 9999,// Pill buttons, avatar rings, status dots
};

export const shadows = {
  subtle: '0 1px 3px rgba(0, 0, 0, 0.05)',
  card: '0 2px 8px rgba(0, 0, 0, 0.06)',
  hover: '0 4px 16px rgba(0, 0, 0, 0.08)',
  elevated: '0 20px 50px rgba(0, 0, 0, 0.12)',
  tealGlow: '0 8px 24px rgba(0, 107, 95, 0.22)',
  goldGlow: '0 8px 24px rgba(201, 138, 44, 0.22)',
  crimsonGlow: '0 8px 24px rgba(220, 38, 38, 0.22)',
};

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  modal: 30,
  popover: 40,
  toast: 50,
};

export const touchTarget = {
  minSize: 44, // 44px minimum touch target for mobile/tablet ergonomics
};

export const translations = {
  en: {
    // Nav
    home: 'Home',
    children: 'Children',
    vaccines: 'Vaccines',
    growth: 'Growth',
    learn: 'Learn',
    anc: 'ANC',
    settings: 'Settings',
    ai_assistant: 'AI Health',
    // Home
    good_morning: 'Good morning',
    good_afternoon: 'Good afternoon',
    good_evening: 'Good evening',
    health_summary: 'Health Summary',
    my_children: 'My Children',
    add_child: 'Add Child',
    weeks_pregnant: 'weeks pregnant',
    due_in: 'Due in',
    days: 'days',
    weeks: 'weeks',
    next_anc: 'Next ANC Visit',
    // Status
    healthy: 'Healthy',
    normal: 'Normal',
    monitor: 'Monitor',
    mam: 'MAM (Moderate Malnutrition)',
    sam: 'SAM (Severe Malnutrition)',
    at_risk: 'At Risk',
    critical: 'Critical',
    high_risk_anc: 'High-Risk ANC',
    // Vaccines
    vaccination_schedule: 'Vaccination Schedule',
    given: 'Given',
    due_soon: 'Due Soon',
    overdue: 'Overdue',
    upcoming: 'Upcoming',
    scheduled: 'Scheduled',
    vaccine_name: 'Vaccine',
    date: 'Date',
    batch_number: 'Batch Number',
    // Growth
    growth_tracker: 'Growth Tracker',
    weight: 'Weight',
    height: 'Height',
    muac: 'MUAC',
    add_measurement: 'Add Measurement',
    who_standard: 'WHO Standard',
    // ANC
    anc_visits: 'ANC Visits',
    visit_number: 'Visit',
    blood_pressure: 'Blood Pressure',
    danger_signs: 'Danger Signs',
    next_visit: 'Next Visit',
    add_visit: 'Add Visit',
    // Learn
    learning_hub: 'Learning Hub',
    breastfeeding: 'Breastfeeding',
    nutrition: 'Nutrition',
    development: 'Development',
    hygiene: 'Hygiene',
    immunization: 'Immunization',
    // AI
    ai_health_analysis: 'AI Health Analysis',
    risk_score: 'Risk Score',
    alerts: 'Alerts',
    recommendations: 'Recommendations',
    analyzing: 'Analyzing your health data...',
    // Common
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    view_all: 'View All',
    years_old: 'years old',
    months_old: 'months old',
    weeks_old: 'weeks old',
    born: 'Born',
    loading: 'Loading...',
    no_data: 'No data yet',
    add: 'Add',
    done: 'Done',
    search: 'Search...',
    syncing: 'Syncing records...',
    online: 'Online',
    offline: 'Offline (Local)',
    live_database: 'Live Database',
    mock_database: 'Mock Database',
    // Onboarding
    welcome: 'Welcome to TotoAfya',
    welcome_sub: 'Your family health companion',
    get_started: 'Get Started',
    enter_anc: 'Enter ANC Number',
    enter_national_id: 'Enter National ID',
    full_name: 'Full Name',
    phone_number: 'Phone Number',
    county: 'County',
    register: 'Create Profile',
    // Settings
    language: 'Language',
    profile: 'My Profile',
    notifications: 'Notifications',
    about: 'About TotoAfya',
    logout: 'Sign Out',
    english: 'English',
    swahili: 'Kiswahili',
  },
  sw: {
    // Nav
    home: 'Nyumbani',
    children: 'Watoto',
    vaccines: 'Chanjo',
    growth: 'Ukuaji',
    learn: 'Jifunza',
    anc: 'ANC',
    settings: 'Mipangilio',
    ai_assistant: 'Afya AI',
    // Home
    good_morning: 'Habari za asubuhi',
    good_afternoon: 'Habari za mchana',
    good_evening: 'Habari za jioni',
    health_summary: 'Muhtasari wa Afya',
    my_children: 'Watoto Wangu',
    add_child: 'Ongeza Mtoto',
    weeks_pregnant: 'wiki za ujauzito',
    due_in: 'Utazaa baada ya',
    days: 'siku',
    weeks: 'wiki',
    next_anc: 'Ziara Ijayo ya ANC',
    // Status
    healthy: 'Mzima',
    normal: 'Kawaida',
    monitor: 'Angalia',
    mam: 'MAM (Utapiamlo wa Wastani)',
    sam: 'SAM (Utapiamlo Mkali)',
    at_risk: 'Hatarini',
    critical: 'Muhimu',
    high_risk_anc: 'ANC ya Hatari Kubwa',
    // Vaccines
    vaccination_schedule: 'Ratiba ya Chanjo',
    given: 'Imepewa',
    due_soon: 'Karibu',
    overdue: 'Imechelewa',
    upcoming: 'Ijayo',
    scheduled: 'Imepangwa',
    vaccine_name: 'Chanjo',
    date: 'Tarehe',
    batch_number: 'Nambari ya Kundi',
    // Growth
    growth_tracker: 'Mfuatiliaji wa Ukuaji',
    weight: 'Uzito',
    height: 'Urefu',
    muac: 'MUAC',
    add_measurement: 'Ongeza Kipimo',
    who_standard: 'Kiwango cha WHO',
    // ANC
    anc_visits: 'Ziara za ANC',
    visit_number: 'Ziara',
    blood_pressure: 'Shinikizo la Damu',
    danger_signs: 'Dalili za Hatari',
    next_visit: 'Ziara Ijayo',
    add_visit: 'Ongeza Ziara',
    // Learn
    learning_hub: 'Kituo cha Kujifunza',
    breastfeeding: 'Kunyonyesha',
    nutrition: 'Lishe',
    development: 'Maendeleo',
    hygiene: 'Usafi',
    immunization: 'Chanjo',
    // AI
    ai_health_analysis: 'Uchambuzi wa Afya AI',
    risk_score: 'Alama ya Hatari',
    alerts: 'Arifa',
    recommendations: 'Mapendekezo',
    analyzing: 'Inachambua data yako ya afya...',
    // Common
    save: 'Hifadhi',
    cancel: 'Ghairi',
    edit: 'Hariri',
    delete: 'Futa',
    view_all: 'Ona Zote',
    years_old: 'miaka',
    months_old: 'miezi',
    weeks_old: 'wiki',
    born: 'Alizaliwa',
    loading: 'Inapakia...',
    no_data: 'Hakuna data bado',
    add: 'Ongeza',
    done: 'Imekamilika',
    search: 'Tafuta...',
    syncing: 'Inalandanisha data...',
    online: 'Mtandaoni',
    offline: 'Nje ya Mtandao (Kwenye Kifaa)',
    live_database: 'Hifadhidata Moja kwa Moja',
    mock_database: 'Hifadhidata ya Majaribio',
    // Onboarding
    welcome: 'Karibu TotoAfya',
    welcome_sub: 'Msaidizi wako wa afya ya familia',
    get_started: 'Anza',
    enter_anc: 'Weka Nambari ya ANC',
    enter_national_id: 'Weka Kitambulisho cha Taifa',
    full_name: 'Jina Kamili',
    phone_number: 'Nambari ya Simu',
    county: 'Kaunti',
    register: 'Tengeneza Wasifu',
    // Settings
    language: 'Lugha',
    profile: 'Wasifu Wangu',
    notifications: 'Arifa',
    about: 'Kuhusu TotoAfya',
    logout: 'Toka',
    english: 'English',
    swahili: 'Kiswahili',
  }
};
