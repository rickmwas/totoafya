/**
 * TotoAfya Digital - Canonical Design Tokens
 * "The Sunlit Botanical Editorial" Theme
 *
 * Culturally grounded, clinically authoritative design primitives for maternal,
 * newborn, and child health in Kenya spanning the full 5-year continuum.
 * Standardized across Web (TailwindCSS) and Native (NativeWind / React Native).
 *
 * Governing Specifications:
 * - design/mother-experience/04-art-direction/COLOR_AND_CONTRAST_STUDY.md
 * - design/mother-experience/04-art-direction/TYPOGRAPHY_STUDY.md
 * - design/mother-experience/04-art-direction/RECOMMENDED_ART_DIRECTION.md
 * - design/mother-experience/05-design-system/DESIGN_SYSTEM_SPECIFICATION.md
 * - design/mother-experience/10-handoff/DEVELOPER_HANDOFF_SPECIFICATIONS.md
 * - design/mother-experience/01-research/UX_WRITING_GUIDE.md
 */

// ============================================================================
// 1. COLOR TOKENS & MASTER PALETTE
// ============================================================================

export const colors = {
  // Brand Foundation - "The Sunlit Botanical Editorial"
  brand: {
    teal: {
      deep: '#004D44',     // Deep highland botanical green
      primary: '#006B5F',  // Signature Medical Teal (WCAG 5.45:1 on white)
      medium: '#2E8A74',   // Mid-tone botanical teal
      soft: '#E6F4F1',     // Calming teal wash for badge surfaces & active chips
    },
    amber: {
      deep: '#B45309',     // Warm Amber/Ochre (High contrast 5.22:1 on soft amber)
      primary: '#E68A00',  // Savannah Sunrise Amber (Dark text #1A202C mandatory: 6.71:1)
      soft: '#FEF3C7',     // Warm amber wash
      subtle: '#FFFBEB',   // Soft honey surface for amber cards and badges
    },
    crimson: {
      primary: '#DC2626',  // Urgent Red (Critical alert, emergency, danger sign)
      soft: '#FEE2E2',     // Soft danger red wash
      subtle: '#FEF2F2',   // Soft crimson card surface
    },
    // Backwards-compatible aliases
    gold: '#E68A00',
    goldHover: '#B45309',
    goldSubtle: '#FEF3C7',
    pine: '#004D44',
  },

  // Primary Semantic Aliases
  primary: '#006B5F',
  primaryHover: '#004D44',
  primarySubtle: '#E6F4F1',
  secondary: '#E68A00',
  secondaryHover: '#B45309',
  secondarySubtle: '#FEF3C7',
  accent: '#E68A00',

  // Canvas & Surfaces (Sunlight Glare & Nighttime Vision Optimized)
  canvas: {
    stone: '#F9F8F5',     // Warm sunlit stone global canvas (14.85:1 with primary ink)
    card: '#FFFFFF',      // Pure white for elevated cards and sheets (16.10:1 with primary ink)
    subtle: '#F1EFEA',    // Slightly darker stone neutral for unselected inputs/dividers
    muted: '#F1EFEA',     // Secondary surface neutral
    border: '#E2E8F0',    // Crisp 1px structural separator
    borderFocus: '#006B5F', // 2px solid Deep Teal focus ring
  },

  // Surface aliases for backward compatibility
  background: '#F9F8F5',
  surface: '#FFFFFF',
  surfaceSubtle: '#F1EFEA',
  surfaceMuted: '#F1EFEA',
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',

  // High-Contrast Accessible Text Ink (WCAG 2.1 / 2.2 AA & AAA Compliant)
  ink: {
    primary: '#1A202C',   // Deep charcoal ink (14.85:1 on stone, 16.10:1 on white, 6.71:1 on amber)
    secondary: '#4A5568', // Balanced slate grey (6.82:1 on stone, 7.40:1 on white)
    muted: '#718096',     // Muted stone for inactive placeholders (4.52:1 on stone - AA pass)
    inverse: '#FFFFFF',   // Pure white on primary teal and critical red
  },

  // Text aliases for backward compatibility
  text: {
    primary: '#1A202C',
    secondary: '#4A5568',
    clinical: '#1A202C',
    muted: '#718096',
    inverse: '#FFFFFF',
  },

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

  // Semantic Clinical Status Indicators
  status: {
    healthy: {
      fg: '#15803D',      // Forest Green (5.14:1 on #F0FDF4)
      bg: '#F0FDF4',      // Soft Mint
      border: '#A3E0BF',
    },
    warning: {
      fg: '#B45309',      // Warm Amber/Ochre (5.22:1 on #FFFBEB)
      bg: '#FFFBEB',      // Soft Honey
      border: '#FDE68A',
    },
    critical: {
      fg: '#DC2626',      // Urgent Red (4.80:1 on #FEF2F2)
      bg: '#FEF2F2',      // Soft Crimson
      soft: '#FEE2E2',    // Soft Danger
      border: '#FCA5A5',
    },
    info: {
      fg: '#1D4ED8',      // Clinical Cobalt (5.60:1 on #EFF6FF)
      bg: '#EFF6FF',      // Soft Sky
      border: '#93C5FD',
    },
    scheduled: {
      fg: '#006B5F',      // Primary Teal
      bg: '#E6F4F1',      // Soft Teal
      border: '#99D5CE',
    },
    upcoming: {
      fg: '#4A5568',      // Slate Gray
      bg: '#F1EFEA',      // Subtle Stone
      border: '#E2E8F0',
    },
    // Aliases matching legacy keys
    given: '#15803D',
    normal: '#15803D',
    due: '#B45309',
    monitor: '#B45309',
    mam: '#B45309',
    overdue: '#DC2626',
    sam: '#DC2626',
    at_risk: '#DC2626',
    high_risk_anc: '#DC2626',
    missed: '#DC2626',
  },

  statusBg: {
    healthy: '#F0FDF4',
    given: '#F0FDF4',
    normal: '#F0FDF4',
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
    upcoming: '#F1EFEA',
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
    upcoming: '#E2E8F0',
  },
} as const;

// ============================================================================
// 2. 8-POINT SPATIAL GRID & SPACING SCALE (2px to 48px)
// ============================================================================

export const spacing = {
  // Numeric pixel values
  0: 0,
  '2xs': 2,   // 2px: Status dot offsets, hairline divider padding
  xs: 4,      // 4px: Badge internal icon gaps, chip offsets
  sm: 8,      // 8px: Microcard padding, list item gaps
  md: 12,     // 12px: Standard card internal gaps, input padding
  base: 16,   // 16px: Standard card padding, outer mobile horizontal gutter
  lg: 24,     // 24px: Section separation margins, modal padding
  xl: 32,     // 32px: Hero container vertical margins, onboarding gaps
  '2xl': 48,  // 48px: Bottom clearance above fixed navigation bar
  '3xl': 64,  // 64px: Desktop outer padding

  // Aliases for layout compatibility
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  6: 24,
  8: 32,
  12: 48,
  16: 64,
  xxl: 40,
  '4xl': 64,

  // Swahili clearance token (+20px / px-5 button padding)
  'swahili-button': 20,
} as const;

// ============================================================================
// 3. TYPOGRAPHY SYSTEM (Merriweather & Plus Jakarta Sans)
// ============================================================================

export const typography = {
  fontFamily: {
    // Editorial & Display Headlines: Maternal warmth and literary dignity
    display: 'Merriweather, Georgia, serif',
    serif: 'Merriweather, Georgia, serif',
    // Interface & Numeric Clinical Precision
    sans: '"Plus Jakarta Sans", Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"JetBrains Mono", "SF Mono", Consolas, monospace',
  },

  // Base font size scale in pixels
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

  // Proportional 1.250 Major Third Modular Typographic Scale
  modularScale: {
    'display-hero': {
      fontSize: 32,
      lineHeight: 40,
      fontWeight: '700',
      letterSpacing: '-0.02em',
      fontFamily: 'Merriweather',
      usage: 'Hero pregnancy week greeting ("Wiki 28")',
    },
    'title-large': {
      fontSize: 24,
      lineHeight: 32,
      fontWeight: '700',
      letterSpacing: '-0.01em',
      fontFamily: 'Merriweather',
      usage: 'Page header ("Ratiba ya Chanjo")',
    },
    'title-medium': {
      fontSize: 18,
      lineHeight: 26,
      fontWeight: '600',
      letterSpacing: '-0.01em',
      fontFamily: 'Plus Jakarta Sans',
      usage: 'Card header ("Antenatal Clinic Contact 3")',
    },
    'body-large': {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '400',
      letterSpacing: '0.00em',
      fontFamily: 'Plus Jakarta Sans',
      usage: 'Primary article paragraphs, clinical advice',
    },
    'body-medium': {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '400',
      letterSpacing: '0.00em',
      fontFamily: 'Plus Jakarta Sans',
      usage: 'Default interface copy, input text, table rows',
    },
    'label-action': {
      fontSize: 14,
      lineHeight: 18,
      fontWeight: '600',
      letterSpacing: '+0.01em',
      fontFamily: 'Plus Jakarta Sans',
      usage: 'Button labels ("Hifadhi Taarifa", "Log Kick")',
    },
    caption: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '500',
      letterSpacing: '+0.01em',
      fontFamily: 'Plus Jakarta Sans',
      usage: 'Timestamps, status badges, helper microcopy',
    },
    'data-metric': {
      fontSize: 22,
      lineHeight: 28,
      fontWeight: '700',
      letterSpacing: '-0.02em',
      fontFamily: 'Plus Jakarta Sans',
      usage: 'Numeric displays ("120/80 mmHg", "6.4 kg") with tabular-nums',
    },
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
  },

  // OpenType font features for clinical alignment
  features: {
    tabularNums: {
      fontVariantNumeric: 'tabular-nums',
      fontFeatureSettings: '"tnum" 1',
    },
  },
} as const;

// ============================================================================
// 4. RADII, ELEVATION & SHADOWS
// ============================================================================

export const radii = {
  none: 0,
  sm: 6,       // 6px: Status badges, micro chips
  md: 12,      // 12px: Inputs, dropdowns, secondary action buttons
  lg: 16,      // 16px: Standard cards, alert containers
  xl: 24,      // 24px: Hero milestone cards, bottom sheet top corners
  '2xl': 24,
  full: 9999,  // 9999px: Primary action buttons, mode switcher pills, avatars
  // Card-specific aliases
  'card-sm': 12,
  'card-md': 16,
  'card-lg': 24,
} as const;

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  card: '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
  sheet: '0 -4px 20px rgba(0, 0, 0, 0.08)',
  button: '0 4px 14px rgba(0, 107, 95, 0.25)',
  tealGlow: '0 8px 24px rgba(0, 107, 95, 0.22)',
  amberGlow: '0 8px 24px rgba(230, 138, 0, 0.22)',
  crimsonGlow: '0 8px 24px rgba(220, 38, 38, 0.22)',
  subtle: '0 1px 3px rgba(0, 0, 0, 0.05)',
  hover: '0 4px 16px rgba(0, 0, 0, 0.08)',
  elevated: '0 20px 50px rgba(0, 0, 0, 0.12)',
} as const;

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  modal: 30,
  popover: 40,
  toast: 50,
} as const;

// ============================================================================
// 5. TOUCH TARGETS & ACCESSIBILITY (WCAG 2.1 / 2.2 Level AA)
// ============================================================================

export const touchTarget = {
  minSize: 48,   // 48px minimum touch target for mobile/tablet ergonomics
  clearance: 8,  // 8px minimum clearance between adjacent touch targets
} as const;

export const focusRing = {
  width: 2,
  offset: 2,
  color: '#006B5F',
  tailwindClass: 'ring-2 ring-[#006B5F] ring-offset-2',
} as const;

// Safe Area Insets for Native and Mobile Web
export const safeArea = {
  top: 'env(safe-area-inset-top, 0px)',
  bottom: 'env(safe-area-inset-bottom, 0px)',
  left: 'env(safe-area-inset-left, 0px)',
  right: 'env(safe-area-inset-right, 0px)',
} as const;

// ============================================================================
// 6. CSS CUSTOM PROPERTIES STRING & OBJECT DEFINITIONS
// ============================================================================

export const cssCustomProperties = {
  // Brand
  '--toto-teal-deep': '#004D44',
  '--toto-teal-primary': '#006B5F',
  '--toto-teal-medium': '#2E8A74',
  '--toto-teal-soft': '#E6F4F1',
  '--toto-amber-deep': '#B45309',
  '--toto-amber-primary': '#E68A00',
  '--toto-amber-soft': '#FEF3C7',
  '--toto-amber-subtle': '#FFFBEB',

  // Surfaces & Canvas
  '--toto-canvas-stone': '#F9F8F5',
  '--toto-surface-card': '#FFFFFF',
  '--toto-surface-subtle': '#F1EFEA',
  '--toto-surface-muted': '#F1EFEA',
  '--toto-border-subtle': '#E2E8F0',
  '--toto-border-focus': '#006B5F',

  // Typography Ink
  '--toto-ink-primary': '#1A202C',
  '--toto-ink-secondary': '#4A5568',
  '--toto-ink-muted': '#718096',
  '--toto-ink-inverse': '#FFFFFF',

  // Semantic Status
  '--toto-status-healthy-fg': '#15803D',
  '--toto-status-healthy-bg': '#F0FDF4',
  '--toto-status-healthy-border': '#A3E0BF',
  '--toto-status-warning-fg': '#B45309',
  '--toto-status-warning-bg': '#FFFBEB',
  '--toto-status-warning-border': '#FDE68A',
  '--toto-status-critical-fg': '#DC2626',
  '--toto-status-critical-bg': '#FEF2F2',
  '--toto-status-critical-soft': '#FEE2E2',
  '--toto-status-critical-border': '#FCA5A5',
  '--toto-status-info-fg': '#1D4ED8',
  '--toto-status-info-bg': '#EFF6FF',
  '--toto-status-info-border': '#93C5FD',

  // Spacing (8pt Grid)
  '--toto-space-2xs': '2px',
  '--toto-space-xs': '4px',
  '--toto-space-sm': '8px',
  '--toto-space-md': '12px',
  '--toto-space-base': '16px',
  '--toto-space-lg': '24px',
  '--toto-space-xl': '32px',
  '--toto-space-2xl': '48px',
  '--toto-space-3xl': '64px',

  // Radii
  '--toto-radius-sm': '6px',
  '--toto-radius-md': '12px',
  '--toto-radius-lg': '16px',
  '--toto-radius-xl': '24px',
  '--toto-radius-full': '9999px',

  // Shadows
  '--toto-shadow-card': '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
  '--toto-shadow-sheet': '0 -4px 20px rgba(0, 0, 0, 0.08)',
  '--toto-shadow-button': '0 4px 14px rgba(0, 107, 95, 0.25)',

  // Fonts
  '--toto-font-serif': 'Merriweather, Georgia, serif',
  '--toto-font-sans': '"Plus Jakarta Sans", Inter, system-ui, sans-serif',

  // Safe Area Insets
  '--toto-safe-top': 'env(safe-area-inset-top, 0px)',
  '--toto-safe-bottom': 'env(safe-area-inset-bottom, 0px)',
  '--toto-safe-left': 'env(safe-area-inset-left, 0px)',
  '--toto-safe-right': 'env(safe-area-inset-right, 0px)',
} as const;

/**
 * Returns the CSS custom properties formatted as a valid CSS `:root` block.
 */
export function getCssCustomPropertiesString(): string {
  const lines = Object.entries(cssCustomProperties).map(
    ([prop, value]) => `  ${prop}: ${value};`
  );
  return `:root {\n${lines.join('\n')}\n}`;
}

// ============================================================================
// 7. BILINGUAL TRANSLATION DICTIONARY & CLINICAL GLOSSARY
// ============================================================================

export const translations = {
  en: {
    // Navigation & Primary Tabs
    nav_home: 'Home',
    nav_records: 'Records',
    nav_chat: 'Chat',
    nav_care: 'Care',
    nav_children: 'Children',
    nav_vaccines: 'Vaccines',
    nav_growth: 'Growth',
    nav_learn: 'Learn',
    nav_anc: 'ANC',
    nav_settings: 'Settings',
    nav_ai_assistant: 'AI Health Companion',

    // Maternal & Pregnancy
    antenatal_care: 'Antenatal Care (ANC)',
    postnatal_care: 'Postnatal Care (PNC)',
    estimated_due_date: 'Estimated Due Date (EDD)',
    last_menstrual_period: 'Last Menstrual Period (LMP)',
    gestational_age: 'Gestational Age',
    weeks_pregnant: 'weeks pregnant',
    due_in: 'Due in',
    days: 'days',
    weeks: 'weeks',
    next_anc: 'Next ANC Visit',
    anc_visits: 'ANC Visits',
    visit_number: 'Visit',
    fetal_movement: 'Fetal Movement',
    kick_counter: 'Kick Counter',
    log_baby_kick: 'Log Baby Kick',
    kicks_counted: 'Kicks counted in 2 hours',
    birth_plan: 'Birth Preparedness Plan',
    blood_pressure: 'Blood Pressure',
    systolic_diastolic: 'Systolic / Diastolic',

    // Emergency & Danger Signs (Obstetric Red Flags)
    danger_signs: 'Danger Signs',
    danger_alert_urgent: 'URGENT: This requires immediate hospital care',
    danger_bleeding_warning:
      'Bleeding during pregnancy is a critical danger sign. Do not wait for your regular appointment. Go to the nearest hospital maternity emergency department immediately.',
    emergency_call_action: 'Call Emergency Facility / Transport',
    emergency_items_checklist: 'View What to Carry to Hospital',
    severe_headache: 'Severe Headache',
    blurred_vision: 'Blurred Vision',
    vaginal_bleeding: 'Vaginal Bleeding',
    convulsions_fits: 'Fits / Convulsions',
    reduced_fetal_movement: 'Reduced Baby Movement',
    high_fever: 'High Fever & Chills',
    severe_epigastric_pain: 'Severe Upper Belly Pain',

    // Child Immunization (KEPI Cascade)
    vaccination_schedule: 'Vaccination Schedule',
    vaccine_name: 'Vaccine',
    given: 'Administered',
    due_soon: 'Due Soon',
    overdue: 'Catch-up Due',
    upcoming: 'Upcoming',
    scheduled: 'Scheduled',
    date: 'Date',
    batch_number: 'Batch Number',
    catch_up_care_title: 'Catch-up Care',
    catch_up_care_body:
      'Even if the scheduled clinic date has passed, healthcare workers are ready to protect your baby today. Every single dose counts.',
    find_nearest_clinic: 'Find Nearest Clinic',
    view_vaccine_details: 'View Vaccine Details',

    // WHO Growth & Nutrition
    growth_tracker: 'Growth Tracker',
    weight: 'Weight',
    height: 'Height',
    muac: 'Mid-Upper Arm Circumference (MUAC)',
    muac_screening: 'Arm Screening (MUAC)',
    who_standard: 'WHO Growth Standard',
    add_measurement: 'Add Measurement',
    weight_for_age: 'Weight-for-Age',
    exclusive_breastfeeding: 'Exclusive Breastfeeding (0–6 Months)',
    complementary_feeding: 'Complementary Feeding (6+ Months)',
    stunting: 'Stunting',
    wasting: 'Wasting / Malnutrition',
    normal_nutrition: 'Normal Nutrition',
    mam: 'MAM (Moderate Acute Malnutrition)',
    sam: 'SAM (Severe Acute Malnutrition)',

    // Bereavement Protocol
    bereavement_title: 'We are holding you in our hearts',
    bereavement_body:
      'We are deeply sorry for your loss. Please take gentle care of your body and mind during this time. TotoAfya has paused all pregnancy reminders. Compassionate support and postnatal recovery guidance are here whenever you feel ready.',
    bereavement_talk_counselor: 'Speak with a Maternal Counselor',
    bereavement_postnatal_recovery: 'Gentle Postnatal Recovery Guide',

    // Connectivity & Offline Sync
    offline_mode: 'Offline Mode (Local Storage)',
    syncing_records: 'Syncing records to cloud...',
    records_saved_locally: 'Your records are safely stored on this phone and will synchronize when network connects.',
    synced: 'All records synced',

    // Common Interface Actions
    save: 'Save Changes',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    view_all: 'View All',
    loading: 'Loading...',
    search: 'Search...',
    welcome: 'Welcome to TotoAfya',
    welcome_sub: 'Your trusted maternal and child health companion',
    get_started: 'Get Started',
    pin_setup_title: 'Set 4-Digit Security PIN',
    pin_setup_sub: 'Protects your personal health records on shared phones',
    private_mode: 'Private Mode',
    language: 'Language',
    english: 'English',
    swahili: 'Kiswahili',
  },

  sw: {
    // Navigation & Primary Tabs
    nav_home: 'Nyumbani',
    nav_records: 'Kumbukumbu',
    nav_chat: 'Ujumbe',
    nav_care: 'Huduma',
    nav_children: 'Watoto',
    nav_vaccines: 'Chanjo',
    nav_growth: 'Makuzi',
    nav_learn: 'Jifunza',
    nav_anc: 'Kliniki ya Ujauzito',
    nav_settings: 'Mipangilio',
    nav_ai_assistant: 'Msaidizi wa Afya AI',

    // Maternal & Pregnancy
    antenatal_care: 'Kliniki ya Ujauzito (ANC)',
    postnatal_care: 'Kliniki ya Baada ya Kujifungua (PNC)',
    estimated_due_date: 'Tarehe ya Kujifungua',
    last_menstrual_period: 'Siku ya Kwanza ya Hedhi ya Mwisho',
    gestational_age: 'Umri wa Ujauzito',
    weeks_pregnant: 'wiki za ujauzito',
    due_in: 'Utazaa baada ya',
    days: 'siku',
    weeks: 'wiki',
    next_anc: 'Ziara Ijayo ya Kliniki',
    anc_visits: 'Ziara za Kliniki',
    visit_number: 'Ziara',
    fetal_movement: 'Mchezo wa Mtoto Tumboni',
    kick_counter: 'Kipima Mchezo wa Mtoto',
    log_baby_kick: 'Rekodi Mchezo wa Mtoto',
    kicks_counted: 'Mchezo uliorekodiwa ndani ya saa 2',
    birth_plan: 'Mpango wa Kujifungua Salama',
    blood_pressure: 'Shinikizo la Damu',
    systolic_diastolic: 'Juu / Chini',

    // Emergency & Danger Signs (Obstetric Red Flags)
    danger_signs: 'Dalili za Hatari',
    danger_alert_urgent: 'DHARURA: Unahitaji kwenda hospitalini mara moja',
    danger_bleeding_warning:
      'Kutokwa na damu wakati wa ujauzito ni dalili hatari sana. Usisubiri siku ya kliniki. Nenda kwenye kituo cha afya au hospitali iliyo karibu nawe sasa hivi.',
    emergency_call_action: 'Piga Simu ya Dharura / Hospitali',
    emergency_items_checklist: 'Vitu Muhimu vya Kubeba Hospitalini',
    severe_headache: 'Kuumwa Kichwa Kikali',
    blurred_vision: 'Macho Kuona Ukungu',
    vaginal_bleeding: 'Kutokwa na Damu Ukeni',
    convulsions_fits: 'Kifafa cha Mimba',
    reduced_fetal_movement: 'Mtoto Kupunguza Mchezo',
    high_fever: 'Homa Kali na Kutetemeka',
    severe_epigastric_pain: 'Maumivu Makali Juu ya Tumbo',

    // Child Immunization (KEPI Cascade)
    vaccination_schedule: 'Ratiba Kamili ya Chanjo',
    vaccine_name: 'Chanjo',
    given: 'Imetolewa',
    due_soon: 'Karibu Kupata',
    overdue: 'Fursa ya Kupata Chanjo',
    upcoming: 'Ijayo',
    scheduled: 'Imepangwa',
    date: 'Tarehe',
    batch_number: 'Nambari ya Kundi',
    catch_up_care_title: 'Fursa ya Kupata Chanjo',
    catch_up_care_body:
      'Hata kama tarehe imepita, watoa huduma wa afya wako tayari kumsaidia mtoto wako leo. Kila chanjo ni muhimu kwa afya yake.',
    find_nearest_clinic: 'Tafuta Kituo cha Afya',
    view_vaccine_details: 'Tazama Maelezo ya Chanjo',

    // WHO Growth & Nutrition
    growth_tracker: 'Ufuatiliaji wa Makuzi',
    weight: 'Uzito',
    height: 'Urefu',
    muac: 'Kipimo cha Mkono (MUAC)',
    muac_screening: 'Kipimo cha Lishe (MUAC)',
    who_standard: 'Kiwango cha Kimataifa cha WHO',
    add_measurement: 'Ongeza Kipimo cha Leo',
    weight_for_age: 'Uzito kulingana na Umri',
    exclusive_breastfeeding: 'Kunyonyesha Pekee (Miezi 0–6)',
    complementary_feeding: 'Chakula cha Nyongeza (Miezi 6+)',
    stunting: 'Kudumaa',
    wasting: 'Utapiamlo',
    normal_nutrition: 'Lishe ya Kawaida',
    mam: 'MAM (Utapiamlo wa Wastani)',
    sam: 'SAM (Utapiamlo Mkali)',

    // Bereavement Protocol
    bereavement_title: 'Tuko pamoja nawe katika kipindi hiki kigumu',
    bereavement_body:
      'Tunakupa pole sana kwa kufiwa na mtoto wako. Tafadhali jitunze kwa upendo na utulivu. TotoAfya imesimamisha taarifa zote za ujauzito. Tuko hapa kukusaidia katika afya na uponyaji wako wakati wowote utakapokuwa tayari.',
    bereavement_talk_counselor: 'Ongea na Mshauri wa Afya ya Uzazi',
    bereavement_postnatal_recovery: 'Mwongozo wa Afya Baada ya Kujifungua',

    // Connectivity & Offline Sync
    offline_mode: 'Hali ya Nje ya Mtandao',
    syncing_records: 'Kuhifadhi taarifa kwenye mtandao...',
    records_saved_locally: 'Taarifa zako zimehifadhiwa salama kwenye simu na zitasawazishwa pindi mtandao utakapopatikana.',
    synced: 'Taarifa zote zimesawazishwa',

    // Common Interface Actions
    save: 'Hifadhi Mabadiliko',
    cancel: 'Ghairi',
    edit: 'Hariri',
    delete: 'Futa',
    view_all: 'Ona Zote',
    loading: 'Inapakia...',
    search: 'Tafuta...',
    welcome: 'Karibu TotoAfya',
    welcome_sub: 'Msaidizi wako mwaminifu wa afya ya mama na mtoto',
    get_started: 'Anza Sasa',
    pin_setup_title: 'Weka PIN ya Usalama ya Namba 4',
    pin_setup_sub: 'Hulinda taarifa zako za siri endapo unashiriki simu na wengine',
    private_mode: 'Hali ya Usiri',
    language: 'Lugha',
    english: 'English',
    swahili: 'Kiswahili',
  },
} as const;

// ============================================================================
// 8. SENSITIVE UX WRITING PROTOCOLS
// ============================================================================

export const uxWritingProtocols = {
  overdueCatchUpCare: {
    en: {
      headline: 'Catch-up Care',
      body: 'Every dose counts. Health workers are ready to protect your baby today.',
      cta: 'Find Nearest Clinic',
    },
    sw: {
      headline: 'Fursa ya Kupata Chanjo',
      body: 'Kila chanjo ni muhimu. Watoa huduma wako tayari kumsaidia mtoto wako leo.',
      cta: 'Tafuta Kituo cha Afya',
    },
  },
  obstetricDangerSign: {
    en: {
      headline: 'URGENT: Immediate hospital care required',
      body: 'Do not wait for your scheduled clinic day. Go to the nearest maternity hospital immediately.',
      cta: 'Call Emergency Facility',
    },
    sw: {
      headline: 'DHARURA: Unahitaji kwenda hospitalini mara moja',
      body: 'Usisubiri siku ya kliniki. Nenda kwenye kituo cha afya au hospitali mara moja.',
      cta: 'Piga Simu ya Dharura',
    },
  },
  bereavementSupport: {
    en: {
      headline: 'We are holding you in our hearts',
      body: 'We are deeply sorry for your loss. Reminders are paused. Gentle recovery support is here whenever you are ready.',
      cta: 'Speak with a Counselor',
    },
    sw: {
      headline: 'Tuko pamoja nawe katika kipindi hiki kigumu',
      body: 'Tunakupa pole sana. Mawaidha yamesimamishwa. Tuko hapa kukusaidia wakati wowote utakapokuwa tayari.',
      cta: 'Ongea na Mshauri',
    },
  },
} as const;
