import { create } from 'zustand';
import { Platform } from 'react-native';
import { translations } from '@totoafya/design-system/src/tokens';

// Lazy initialize MMKV only on Native
let storage: any = null;
const getStorage = () => {
  if (Platform.OS === 'web' || typeof window === 'undefined') return null;
  if (!storage) {
    try {
      const { MMKV } = require('react-native-mmkv');
      storage = new MMKV();
    } catch (e) {
      return null;
    }
  }
  return storage;
};

const LANGUAGE_KEY = 'app_language';

type Language = 'en' | 'sw';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

export const useLanguageStore = create<LanguageState>((set, get) => {
  // Determine initial language safely
  let initialLanguage: Language = 'en';
  if (typeof window !== 'undefined') {
    const saved = getStorage()?.getString(LANGUAGE_KEY);
    if (saved === 'en' || saved === 'sw') {
      initialLanguage = saved;
    }
  }

  return {
    language: initialLanguage,
    setLanguage: (lang: Language) => {
      getStorage()?.set(LANGUAGE_KEY, lang);
      set({ language: lang });
    },
    t: (key: string) => {
      const lang = get().language;
      const dict = (translations as any)[lang] || (translations as any)['en'];
      return dict[key] || key;
    },
  };
});
