import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { UserProfile } from '@totoafya/auth';

// Lazy initialize MMKV only on Native
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

const getSecureStore = () => {
  if (Platform.OS === 'web') {
    return {
      getItemAsync: async (key: string) => {
        if (typeof window === 'undefined' || !window.localStorage) return null;
        return window.localStorage.getItem(key);
      },
      setItemAsync: async (key: string, value: string) => {
        if (typeof window === 'undefined' || !window.localStorage) return;
        window.localStorage.setItem(key, value);
      },
      deleteItemAsync: async (key: string) => {
        if (typeof window === 'undefined' || !window.localStorage) return;
        window.localStorage.removeItem(key);
      }
    };
  }
  return SecureStore;
};


const ACTIVE_CHILD_KEY = 'active_child_id';
const USER_SESSION_KEY = 'user_session';
const PIN_STORE_KEY = 'mother_auth_pin';
const LOCK_STATE_KEY = 'app_session_locked';

interface AuthState {
  user: UserProfile | null;
  activeChildId: string | null;
  isLocked: boolean;
  isLoading: boolean;
  login: (userProfile: UserProfile, pin?: string) => Promise<void>;
  logout: () => Promise<void>;
  lockSession: () => void;
  unlockSession: (pin: string) => Promise<boolean>;
  setActiveChildId: (childId: string | null) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  activeChildId: null,
  isLocked: false,
  isLoading: true,

  login: async (userProfile, pin) => {
    try {
      await getSecureStore().setItemAsync(USER_SESSION_KEY, JSON.stringify(userProfile));
      if (pin) {
        await getSecureStore().setItemAsync(PIN_STORE_KEY, pin);
      }
      set({ user: userProfile, isLocked: false });
      getStorage()?.set(LOCK_STATE_KEY, 'false');
    } catch (e) {
      console.error('Failed to save session:', e);
    }
  },

  logout: async () => {
    try {
      await getSecureStore().deleteItemAsync(USER_SESSION_KEY);
      await getSecureStore().deleteItemAsync(PIN_STORE_KEY);
      getStorage()?.delete(ACTIVE_CHILD_KEY);
      getStorage()?.delete(LOCK_STATE_KEY);
      set({ user: null, activeChildId: null, isLocked: false });
    } catch (e) {
      console.error('Failed to delete session:', e);
    }
  },

  lockSession: () => {
    set({ isLocked: true });
    getStorage()?.set(LOCK_STATE_KEY, 'true');
  },

  unlockSession: async (pin) => {
    try {
      const storedPin = await getSecureStore().getItemAsync(PIN_STORE_KEY);
      if (storedPin && storedPin.trim() === pin.trim()) {
        set({ isLocked: false });
        getStorage()?.set(LOCK_STATE_KEY, 'false');
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to unlock session:', e);
      return false;
    }
  },

  setActiveChildId: (childId) => {
    if (childId) {
      getStorage()?.set(ACTIVE_CHILD_KEY, childId);
    } else {
      getStorage()?.delete(ACTIVE_CHILD_KEY);
    }
    set({ activeChildId: childId });
  },

  updateUserProfile: async (profile) => {
    const currentUser = get().user;
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...profile };
    try {
      await getSecureStore().setItemAsync(USER_SESSION_KEY, JSON.stringify(updatedUser));
      set({ user: updatedUser });
    } catch (e) {
      console.error('Failed to update user profile:', e);
    }
  },

  initialize: async () => {
    // Skip only during Web SSR
    if (Platform.OS === 'web' && typeof window === 'undefined') return;

    set({ isLoading: true });
    try {
      const rawSession = await getSecureStore().getItemAsync(USER_SESSION_KEY);
      const activeChild = getStorage()?.getString(ACTIVE_CHILD_KEY) || null;
      const wasLocked = getStorage()?.getString(LOCK_STATE_KEY) === 'true';

      if (rawSession) {
        const parsedUser = JSON.parse(rawSession) as UserProfile;
        set({ user: parsedUser, activeChildId: activeChild, isLocked: wasLocked });
      } else {
        set({ user: null, activeChildId: null, isLocked: false });
      }
    } catch (e) {
      console.error('Failed to initialize session:', e);
    } finally {
      set({ isLoading: false });
    }
  },
}));
