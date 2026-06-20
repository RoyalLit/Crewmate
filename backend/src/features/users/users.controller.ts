import type { Request, Response, NextFunction } from 'express';

import { successResponse } from '../../shared/response';

import { usersService } from './users.service';

export class UsersController {
  async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await usersService.getUserById(req.user!.userId);
      res.status(200).json(successResponse(user));
    } catch (error) {
      next(error);
    }
  }

  async getPublicProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const profile = await usersService.getPublicProfile(id);
      res.status(200).json(successResponse(profile));
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await usersService.updateProfile(req.user!.userId, req.body);
      res.status(200).json(successResponse(user));
    } catch (error) {
      next(error);
    }
  }

  async uploadPhoto(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Multer processes the file and attaches the Cloudinary URL to req.file.path
      const file = req.file;
      if (!file) {
        res.status(400).json({ success: false, error: { message: 'No image file provided' } });
        return;
      }

      const photoUrl = file.path;
      const user = await usersService.updateProfilePhoto(req.user!.userId, photoUrl);
      res.status(200).json(successResponse(user));
    } catch (error) {
      next(error);
    }
  }

  async updatePushToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { pushToken } = req.body;
      const user = await usersService.updatePushToken(req.user!.userId, pushToken);
      res.status(200).json(successResponse(user));
    } catch (error) {
      next(error);
    }
  }
}

export const usersController = new UsersController();
