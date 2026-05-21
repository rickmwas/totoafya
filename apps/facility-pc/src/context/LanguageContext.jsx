import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
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
    monitor: 'Monitor',
    at_risk: 'At Risk',
    critical: 'Critical',
    // Vaccines
    vaccination_schedule: 'Vaccination Schedule',
    given: 'Given',
    due_soon: 'Due Soon',
    overdue: 'Overdue',
    upcoming: 'Upcoming',
    scheduled: 'Scheduled',
    vaccine_name: 'Vaccine',
    date: 'Date',
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
    monitor: 'Angalia',
    at_risk: 'Hatarini',
    critical: 'Muhimu',
    // Vaccines
    vaccination_schedule: 'Ratiba ya Chanjo',
    given: 'Imepewa',
    due_soon: 'Karibu',
    overdue: 'Imechelewa',
    upcoming: 'Ijayo',
    scheduled: 'Imepangwa',
    vaccine_name: 'Chanjo',
    date: 'Tarehe',
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

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('toto_lang') || 'en');

  const toggleLang = () => {
    const next = lang === 'en' ? 'sw' : 'en';
    setLang(next);
    localStorage.setItem('toto_lang', next);
  };

  const setLanguage = (l) => {
    setLang(l);
    localStorage.setItem('toto_lang', l);
  };

  const t = (key) => translations[lang][key] || translations['en'][key] || key;

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLang, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used within LanguageProvider');
  return ctx;
}