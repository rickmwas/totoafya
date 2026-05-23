import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { MMKV } from 'react-native-mmkv';
import { UserProfile } from '@totoafya/auth';

const storage = new MMKV();
const ACTIVE_CHILD_KEY = 'active_child_id';
const USER_SESSION_KEY = 'user_session';

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

const PIN_STORE_KEY = 'mother_auth_pin';
const LOCK_STATE_KEY = 'app_session_locked';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  activeChildId: null,
  isLocked: false,
  isLoading: true,

  login: async (userProfile, pin) => {
    try {
      await SecureStore.setItemAsync(USER_SESSION_KEY, JSON.stringify(userProfile));
      if (pin) {
        await SecureStore.setItemAsync(PIN_STORE_KEY, pin);
      }
      set({ user: userProfile, isLocked: false });
      storage.set(LOCK_STATE_KEY, 'false');
    } catch (e) {
      console.error('Failed to save session:', e);
    }
  },

  logout: async () => {
    try {
      await SecureStore.deleteItemAsync(USER_SESSION_KEY);
      await SecureStore.deleteItemAsync(PIN_STORE_KEY);
      storage.delete(ACTIVE_CHILD_KEY);
      storage.delete(LOCK_STATE_KEY);
      set({ user: null, activeChildId: null, isLocked: false });
    } catch (e) {
      console.error('Failed to delete session:', e);
    }
  },

  lockSession: () => {
    set({ isLocked: true });
    storage.set(LOCK_STATE_KEY, 'true');
  },

  unlockSession: async (pin) => {
    try {
      const storedPin = await SecureStore.getItemAsync(PIN_STORE_KEY);
      if (storedPin && storedPin.trim() === pin.trim()) {
        set({ isLocked: false });
        storage.set(LOCK_STATE_KEY, 'false');
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
      storage.set(ACTIVE_CHILD_KEY, childId);
    } else {
      storage.delete(ACTIVE_CHILD_KEY);
    }
    set({ activeChildId: childId });
  },

  updateUserProfile: async (profile) => {
    const currentUser = get().user;
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...profile };
    try {
      await SecureStore.setItemAsync(USER_SESSION_KEY, JSON.stringify(updatedUser));
      set({ user: updatedUser });
    } catch (e) {
      console.error('Failed to update user profile:', e);
    }
  },

  initialize: async () => {
    set({ isLoading: true });
    try {
      const rawSession = await SecureStore.getItemAsync(USER_SESSION_KEY);
      const activeChild = storage.getString(ACTIVE_CHILD_KEY) || null;
      const wasLocked = storage.getString(LOCK_STATE_KEY) === 'true';

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
