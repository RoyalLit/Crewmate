import type { Request, Response, NextFunction } from 'express';

import { UnauthorizedError } from '../../shared/errors';
import { successResponse } from '../../shared/response';

import { safetyService } from './safety.service';
import { validateReportRequest, validateBlockRequest } from './safety.validators';

export class SafetyController {
  async reportUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new UnauthorizedError();
      }
      
      const dto = validateReportRequest(req.body);
      const result = await safetyService.reportUser(req.user.userId, dto);
      
      res.status(201).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async blockUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new UnauthorizedError();
      }
      
      const dto = validateBlockRequest(req.body);
      await safetyService.blockUser(req.user.userId, dto);
      
      res.status(200).json(successResponse({ success: true }));
    } catch (error) {
      next(error);
    }
  }

  async checkBlockStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new UnauthorizedError();
      }
      
      const isBlocked = await safetyService.checkIfBlocked(req.user.userId, req.params.id);
      const isBlockingMe = await safetyService.checkIfBlocked(req.params.id, req.user.userId);
      
      res.status(200).json(successResponse({ isBlocked: isBlocked || isBlockingMe }));
    } catch (error) {
      next(error);
    }
  }
}

export const safetyController = new SafetyController();
