import { create } from 'zustand';
import { Platform } from 'react-native';
import { translations } from '@totoafya/design-system';

// Lazy initialize storage based on platform
let storage: any = null;
const getStorage = () => {
  if (Platform.OS === 'web') {
    return {
      getString: (key: string) => {
        if (typeof window === 'undefined' || !window.localStorage) return null;
        return window.localStorage.getItem(key);
      },
      set: (key: string, value: string) => {
        if (typeof window === 'undefined' || !window.localStorage) return;
        window.localStorage.setItem(key, value);
      },
      delete: (key: string) => {
        if (typeof window === 'undefined' || !window.localStorage) return;
        window.localStorage.removeItem(key);
      }
    };
  }
  if (!storage) {
    try {
      const { MMKV } = require('react-native-mmkv');
      storage = new MMKV();
    } catch (e) {
      const mem = new Map<string, string>();
      storage = {
        getString: (k: string) => mem.get(k) || null,
        set: (k: string, v: string) => mem.set(k, v),
        delete: (k: string) => mem.delete(k),
      };
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
  // Determine initial language safely across Web & Native
  let initialLanguage: Language = 'en';
  if (Platform.OS !== 'web' || typeof window !== 'undefined') {
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
