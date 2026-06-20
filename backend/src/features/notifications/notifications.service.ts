import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import logger from '../../shared/logger';

class NotificationsService {
  private expo: Expo;

  constructor() {
    this.expo = new Expo();
  }

  async sendPushNotification(pushToken: string, title: string, body: string, data?: Record<string, unknown>): Promise<void> {
    if (!Expo.isExpoPushToken(pushToken)) {
      logger.warn(`Push token ${String(pushToken)} is not a valid Expo push token`);
      return;
    }

    const message: ExpoPushMessage = {
      to: pushToken,
      sound: 'default',
      title,
      body,
      data: data || {},
    };

    try {
      const chunks = this.expo.chunkPushNotifications([message]);
      for (const chunk of chunks) {
        const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
        logger.info(`Push notification sent: ${JSON.stringify(ticketChunk)}`);
      }
    } catch (error) {
      logger.error(`Error sending push notification: ${String(error)}`);
    }
  }

  // Domain-specific notification wrappers
  async notifyRequestReceived(pushToken: string, requesterName: string, rideDestination: string) {
    await this.sendPushNotification(
      pushToken,
      'New Ride Request',
      `${requesterName} has requested a seat for your ride to ${rideDestination}.`,
      { type: 'REQUEST_RECEIVED' }
    );
  }

  async notifyRequestAccepted(pushToken: string, posterName: string, rideDestination: string) {
    await this.sendPushNotification(
      pushToken,
      'Request Accepted!',
      `${posterName} accepted your request for the ride to ${rideDestination}.`,
      { type: 'REQUEST_ACCEPTED' }
    );
  }

  async notifyNewMessage(pushToken: string, senderName: string) {
    await this.sendPushNotification(
      pushToken,
      'New Message',
      `${senderName} sent you a message.`,
      { type: 'NEW_MESSAGE' }
    );
  }

  async notifyRideCancelled(pushToken: string, rideDestination: string, posterName: string) {
    await this.sendPushNotification(
      pushToken,
      'Ride Cancelled',
      `${posterName} cancelled the ride to ${rideDestination}.`,
      { type: 'RIDE_CANCELLED' }
    );
  }
}

export const notificationsService = new NotificationsService();
