import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import type { Router, Href } from 'expo-router';
import type * as ExpoNotifications from 'expo-notifications';
import logger from './logger';

let Notifications: typeof ExpoNotifications | null = null;

try {
  // expo-notifications was removed from Expo Go on Android in SDK 53+
  if (!(Platform.OS === 'android' && Constants.appOwnership === 'expo')) {
    Notifications = require('expo-notifications');
    if (Notifications) {
      Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    }
  }
} catch (e) {
  logger.log('expo-notifications not available', e);
}

export async function registerForPushNotificationsAsync() {
  let token;

  if (!Notifications) {
    logger.log('Notifications module not loaded, skipping push registration.');
    return undefined;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      logger.log('Failed to get push token for push notification!');
      return undefined;
    }
    let projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    
    if (projectId === 'REPLACE_WITH_EAS_PROJECT_ID') {
      projectId = undefined;
    }

    if (!projectId) {
      logger.log('Project ID not found, attempting to fetch token without it.');
    }
    try {
      token = (
        await Notifications.getExpoPushTokenAsync(
          projectId ? { projectId } : undefined
        )
      ).data;
      logger.log('Expo Push Token:', token);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      logger.log('Push tokens disabled (no entitlements)', msg);
    }
  } else {
    logger.log('Must use physical device for Push Notifications');
  }

  return token;
}

interface NotificationData {
  route?: string;
  rideId?: string;
  otherUserId?: string;
}

/**
 * Navigate based on notification data payload.
 * Called when user taps a notification or app opens from cold start via notification.
 */
export function navigateFromNotification(
  data: NotificationData | undefined,
  router: Router
): void {
  if (!data?.route) {
    return;
  }

  try {
    // Slight delay to ensure auth routing (like replacing to /(tabs)) has settled 
    // before we push the deep link on top of the stack.
    setTimeout(() => {
      router.push(data.route as Href);
    }, 150);
  } catch (e) {
    logger.log('Failed to navigate from notification:', e);
  }
}

/**
 * Register a listener for notification taps (foreground + background).
 * Returns an unsubscribe function.
 */
export function onNotificationResponse(
  router: Router
): (() => void) | undefined {
  if (!Notifications) {
    return undefined;
  }

  const subscription = Notifications.addNotificationResponseReceivedListener(
    (response: ExpoNotifications.NotificationResponse) => {
      const data = response?.notification?.request?.content?.data as NotificationData | undefined;
      navigateFromNotification(data, router);
    }
  );

  return () => subscription.remove();
}

/**
 * Check if the app was opened from a notification tap (cold start).
 * Returns a cleanup function.
 */
export async function checkInitialNotificationResponse(
  router: Router
): Promise<(() => void) | undefined> {
  if (!Notifications) {
    return undefined;
  }

  try {
    const response = await Notifications.getLastNotificationResponseAsync();
    if (response) {
      const data = response?.notification?.request?.content?.data as NotificationData | undefined;
      navigateFromNotification(data, router);
    }
  } catch (e) {
    logger.log('Failed to check initial notification response:', e);
  }

  return undefined;
}
