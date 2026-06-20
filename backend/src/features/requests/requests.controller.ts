import { Request, Response, NextFunction } from 'express';
import { requestsService } from './requests.service';
import { successResponse } from '../../shared/response';

export class RequestsController {
  async createRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const request = await requestsService.createRequest(req.user!.userId, req.body);
      res.status(201).json(successResponse(request));
    } catch (error) {
      next(error);
    }
  }

  async getMyRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const pageSize = parseInt(req.query.pageSize as string, 10) || 20;
      const requests = await requestsService.getMyRequests(req.user!.userId, page, pageSize);
      res.status(200).json(successResponse(requests));
    } catch (error) {
      next(error);
    }
  }

  async getIncomingRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const pageSize = parseInt(req.query.pageSize as string, 10) || 20;
      const requests = await requestsService.getIncomingRequests(req.user!.userId, page, pageSize);
      res.status(200).json(successResponse(requests));
    } catch (error) {
      next(error);
    }
  }

  async acceptRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const request = await requestsService.acceptRequest(req.params.id, req.user!.userId);
      res.status(200).json(successResponse(request));
    } catch (error) {
      next(error);
    }
  }

  async rejectRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const request = await requestsService.rejectRequest(req.params.id, req.user!.userId);
      res.status(200).json(successResponse(request));
    } catch (error) {
      next(error);
    }
  }

  async withdrawRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const request = await requestsService.withdrawRequest(req.params.id, req.user!.userId);
      res.status(200).json(successResponse(request));
    } catch (error) {
      next(error);
    }
  }

  async removePassenger(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const request = await requestsService.removePassenger(req.params.id, req.user!.userId);
      res.status(200).json(successResponse(request));
    } catch (error) {
      next(error);
    }
  }
}

export const requestsController = new RequestsController();
