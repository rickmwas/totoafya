import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { setupOfflinePersistence } from '../utils/offlineManager';
import '../global.css';

// Shim localStorage using MMKV for @totoafya/api-client before it gets loaded
import { MMKV } from 'react-native-mmkv';
const storage = new MMKV();
if (typeof localStorage === 'undefined') {
  (globalThis as any).localStorage = {
    getItem: (key: string) => storage.getString(key) || null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
    clear: () => storage.clearAll(),
    key: (index: number) => null,
    length: 0,
  } as any;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

setupOfflinePersistence(queryClient);

import { AppState } from 'react-native';
import LockScreen from '../components/LockScreen';

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading, initialize, isLocked, lockSession } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background' && user) {
        lockSession();
      }
    });
    return () => {
      subscription.remove();
    };
  }, [user]);

  useEffect(() => {
    if (isLoading) return;
    if (isLocked) return; // Don't redirect while locked

    const inAuthGroup = segments[0] === '(tabs)' || segments[0] === 'add-child';
    const inOnboarding = segments[0] === 'onboarding';

    if (!user) {
      if (inAuthGroup || inOnboarding || segments[0] === undefined || (segments.length as number) === 0) {
        router.replace('/login');
      }
    } else if (!user.profile_complete) {
      if (segments[0] !== 'onboarding') {
        router.replace('/onboarding');
      }
    } else {
      if (segments[0] === 'login' || segments[0] === 'onboarding' || (segments.length as number) === 0 || segments[0] === undefined) {
        router.replace('/(tabs)/home');
      }
    }
  }, [user, isLoading, segments, isLocked]);

  if (isLocked) {
    return <LockScreen />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGate>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="login" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="add-child" options={{ presentation: 'modal', headerShown: true, title: 'Add a Child', headerStyle: { backgroundColor: '#1B6B5A' }, headerTintColor: '#FFFFFF' }} />
        </Stack>
      </AuthGate>
    </QueryClientProvider>
  );
}
