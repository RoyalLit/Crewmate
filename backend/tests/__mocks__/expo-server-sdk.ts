export class Expo {
  static isExpoPushToken(_token: string): boolean {
    return true;
  }

  chunkPushNotifications(messages: any[]): any[][] {
    return [messages];
  }

  async sendPushNotificationsAsync(_chunk: any[]): Promise<any[]> {
    return [{ status: 'ok', id: 'mock-ticket-id' }];
  }
}

export type ExpoPushMessage = {
  to: string;
  sound?: string;
  title?: string;
  body?: string;
  data?: Record<string, unknown>;
};
