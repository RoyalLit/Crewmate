/**
 * Root Expo Router layout.
 *
 * Responsibilities (in order):
 *   1. Load Plus Jakarta Sans fonts (DESIGN.md §3.1)
 *   2. Provide QueryClientProvider (TanStack Query)
 *   3. Provide ThemeProvider (Zustand + Appearance)
 *   4. Auth guard: redirect to (auth) or (tabs) based on stored token
 *
 * Auth guard is a structure stub — actual token validation logic
 * will be wired in the auth feature PR. The guard currently always
 * redirects to (tabs) in development.
 *
 * Per AGENT_RULES.md §8.7: "No data fetching in screen components."
 * The layout handles the auth check; screens render UI only.
 */

import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { QueryClientProvider } from '@tanstack/react-query';
import { SplashScreen, Stack, useRouter, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';

import { useAuthStore } from '../src/store/authStore';

import { ThemeProvider } from '../src/design/theme';
import { queryClient } from '../src/lib/queryClient';

import { BootScreen } from '../src/components/BootScreen';

// Prevent the splash screen from auto-hiding before fonts are loaded
SplashScreen.preventAutoHideAsync();

import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout(): React.JSX.Element | null {
  const [bootComplete, setBootComplete] = useState(false);
  const { isAuthenticated, login } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  // Simple fetch wrapper since we can't use React Query hooks at the root level before Provider mounts
  // Actually we CAN use hooks if we move logic to an inner component, but for simplicity we'll just use the raw apiClient here
  const checkToken = async () => {
    try {
      // The interceptor automatically attaches the token
      const { apiClient } = require('../src/api/client');
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      
      const token = await AsyncStorage.getItem('crewmute_token');
      if (token) {
        const response = await apiClient.get('/auth/me');
        if (response.data?.data?.user) {
          login(response.data.data.user);
        }
      }
    } catch (e) {
      console.log('Auto-login failed', e);
    } finally {
      // Hide the native splash screen once fonts are ready AND we checked token
      if (fontsLoaded || fontError) {
        SplashScreen.hideAsync();
      }
    }
  };

  useEffect(() => {
    if (fontsLoaded || fontError) {
      checkToken();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (!fontsLoaded || !bootComplete) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to the login page.
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to the tabs page.
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, fontsLoaded, bootComplete]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
          {!bootComplete && <BootScreen onAnimationDone={() => setBootComplete(true)} />}
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
