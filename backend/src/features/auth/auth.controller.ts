import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { successResponse } from '../../shared/response';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async verifyOTP(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.verifyOTP(req.body);
      res.status(200).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body);
      res.status(200).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(400).json({ success: false, error: { message: 'Refresh token is required' } });
        return;
      }

      const tokens = await authService.refreshToken(refreshToken);
      res.status(200).json(successResponse(tokens));
    } catch (error) {
      next(error);
    }
  }

  async logoutGlobal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // The user is attached to req by the auth middleware
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      await authService.logoutGlobal(userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const user = await authService.getMe(userId);
      res.status(200).json(successResponse({ user }));
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
