import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { successResponse } from '../../shared/response';
import { ValidationError, UnauthorizedError } from '../../shared/errors';
import { usersService } from '../users/users.service';

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

  async resendOTP(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.resendOTP(req.body);
      res.status(200).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.forgotPassword(req.body);
      res.status(200).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.resetPassword(req.body);
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
        throw new ValidationError('Refresh token is required');
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
        throw new UnauthorizedError();
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
        throw new UnauthorizedError();
      }

      const user = await authService.getMe(userId);
      res.status(200).json(successResponse({ user }));
    } catch (error) {
      next(error);
    }
  }

  async uploadStudentId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const file = req.file;
      if (!file) {
        res.status(400).json({ success: false, error: { message: 'No image file provided' } });
        return;
      }

      const photoUrl = file.path;
      const user = await usersService.updateStudentIdPhoto(userId, photoUrl);
      res.status(200).json(successResponse(user));
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
