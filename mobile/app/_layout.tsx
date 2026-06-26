/**
 * Root Expo Router layout.
 *
 * Responsibilities (in order):
 *   1. Initialize Sentry error tracking (H13)
 *   2. Load Plus Jakarta Sans fonts (DESIGN.md §3.1)
 *   3. Provide QueryClientProvider (TanStack Query)
 *   4. Provide ThemeProvider (Zustand + Appearance)
 *   5. Auth guard: redirect to (auth) or (tabs) based on stored token
 *   6. Wire push notification deep linking (M13)
 *
 * Auth guard is a structure stub — actual token validation logic
 * will be wired in the auth feature PR. The guard currently always
 * redirects to (tabs) in development.
 *
 * Per "No data fetching in screen components."
 * The layout handles the auth check; screens render UI only.
 */

import 'react-native-gesture-handler';
import * as Sentry from 'sentry-expo';

// Initialize Sentry at module level (before any component code)
if (process.env.EXPO_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.2,
    enableInExpoDevelopment: false,
  });
}

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
import { AuthProvider } from '../src/context/AuthContext';
import { SocketProvider } from '../src/context/SocketContext';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GlobalAlert } from '../src/components/GlobalAlert';
import { ToastProvider } from '../src/components/Toast';
import ErrorBoundary from '../src/components/ErrorBoundary';
import OfflineNotice from '../src/components/OfflineNotice';

import { BootScreen } from '../src/components/BootScreen';

import {
  onNotificationResponse,
  checkInitialNotificationResponse,
} from '../src/utils/notifications';

import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Prevent the splash screen from auto-hiding before fonts are loaded
SplashScreen.preventAutoHideAsync();

export default function RootLayout(): React.JSX.Element | null {
  const [animationDone, setAnimationDone] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
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
      const { apiClient } = require('../src/api/client');
      const { storage } = require('../src/lib/storage');

      const token = await storage.getAccessToken();
      if (token) {
        const response = await apiClient.get('/auth/me');
        if (response.data?.data?.user) {
          login(response.data.data.user);
        }
      }

      const { Asset } = require('expo-asset');
      const { preloadChatAssets } = require('../src/utils/imageAssets');
      await Asset.loadAsync([
        require('../assets/images/onboarding/scene1.png'),
        require('../assets/images/onboarding/scene2.png'),
        require('../assets/images/onboarding/scene3.png'),
        require('../assets/images/onboarding/scene4.png'),
      ]);
      await preloadChatAssets();
    } catch (e) {
      console.log('Auto-login failed', e);
    } finally {
      setIsAuthChecked(true);
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
    if (!fontsLoaded || !isAuthChecked) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to the auth splash screen
      router.replace('/(auth)');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to the tabs page.
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, fontsLoaded, isAuthChecked]);

  // ── Push notification deep linking (M13) ─────────────────────────────────
  useEffect(() => {
    if (!isAuthChecked) return;

    checkInitialNotificationResponse(router);

    const unsubscribe = onNotificationResponse(router);
    return () => {
      unsubscribe?.();
    };
  }, [isAuthChecked]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <OfflineNotice />
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
          <SocketProvider>
            <ActionSheetProvider>
              <BottomSheetModalProvider>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="(auth)" />
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="ride/[id]" />
                </Stack>
                <GlobalAlert />
                {(!animationDone || !isAuthChecked) && <BootScreen onAnimationDone={() => setAnimationDone(true)} isReady={isAuthChecked} />}
              </BottomSheetModalProvider>
            </ActionSheetProvider>
            <ToastProvider />
          </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
