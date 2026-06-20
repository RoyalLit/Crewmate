import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import logger from './logger';

let Notifications: any = null;

try {
  // expo-notifications was removed from Expo Go on Android in SDK 53+
  if (!(Platform.OS === 'android' && Constants.appOwnership === 'expo')) {
    Notifications = require('expo-notifications');
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
      logger.error('Error getting expo push token', e);
    }
  } else {
    logger.log('Must use physical device for Push Notifications');
  }

  return token;
}
