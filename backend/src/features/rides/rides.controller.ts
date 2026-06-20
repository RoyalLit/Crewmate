import { Request, Response, NextFunction } from 'express';
import { ridesService } from './rides.service';
import { successResponse } from '../../shared/response';

export class RidesController {
  async createRide(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ride = await ridesService.createRide(req.user!.userId, req.body);
      res.status(201).json(successResponse(ride));
    } catch (error) {
      next(error);
    }
  }

  async browseRides(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as any;
      if (req.user?.userId) {
        query.excludePosterId = req.user.userId;
      }
      const rides = await ridesService.browseRides(query);
      res.status(200).json(successResponse(rides));
    } catch (error) {
      next(error);
    }
  }

  async getMyRides(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const pageSize = parseInt(req.query.pageSize as string, 10) || 20;
      const rides = await ridesService.getMyRides(req.user!.userId, page, pageSize);
      res.status(200).json(successResponse(rides));
    } catch (error) {
      next(error);
    }
  }

  async getRideDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ride = await ridesService.getRideDetails(req.params.id);
      res.status(200).json(successResponse(ride));
    } catch (error) {
      next(error);
    }
  }

  async updateRide(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ride = await ridesService.updateRide(req.params.id, req.user!.userId, req.body);
      res.status(200).json(successResponse(ride));
    } catch (error) {
      next(error);
    }
  }

  async cancelRide(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await ridesService.cancelRide(req.params.id, req.user!.userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const ridesController = new RidesController();
