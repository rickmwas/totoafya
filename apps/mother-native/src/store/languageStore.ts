import { create } from 'zustand';
import { MMKV } from 'react-native-mmkv';
import { translations } from '@totoafya/design-system/src/tokens';

const storage = new MMKV();
const LANGUAGE_KEY = 'app_language';

type Language = 'en' | 'sw';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: (storage.getString(LANGUAGE_KEY) as Language) || 'en',
  setLanguage: (lang: Language) => {
    storage.set(LANGUAGE_KEY, lang);
    set({ language: lang });
  },
  t: (key: string) => {
    const lang = get().language;
    const dict = (translations as any)[lang] || (translations as any)['en'];
    return dict[key] || key;
  },
}));
