import type { Request, Response, NextFunction } from 'express';

import type { JwtPayload } from '../auth/auth.types';

import { chatsService } from './chats.service';

export class ChatsController {
  async getMyChats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as JwtPayload;
      const chats = await chatsService.getUserChats(user.userId);
      res.status(200).json({ success: true, data: chats });
    } catch (error) {
      next(error);
    }
  }

  async getChatHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as JwtPayload;
      const { rideId, otherUserId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const skip = req.query.skip ? parseInt(req.query.skip as string) : 0;

      const history = await chatsService.getChatHistory(user.userId, rideId, otherUserId, limit, skip);
      res.status(200).json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  }
}

export const chatsController = new ChatsController();
