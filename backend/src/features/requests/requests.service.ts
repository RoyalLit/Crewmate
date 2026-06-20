import mongoose from 'mongoose';

import { NotFoundError, ForbiddenError, AppError, ConflictError } from '../../shared/errors';
import logger from '../../shared/logger';
import type { PaginatedResult } from '../../shared/types';
import { getIO } from '../chats/socket';
import { notificationsService } from '../notifications/notifications.service';
import { ridesRepository } from '../rides/rides.repository';
import { ridesService } from '../rides/rides.service';
import { usersRepository } from '../users/users.repository';
import { usersService } from '../users/users.service';

import { requestsRepository } from './requests.repository';
import type { CreateRequestDTO, RideRequestResponseDTO } from './requests.types';


export class RequestsService {
  private formatRequest(req: any): RideRequestResponseDTO {
    return {
      id: req._id.toString(),
      rideId: req.rideId.toString(),
      requesterId: req.requesterId.toString(),
      posterId: req.posterId.toString(),
      status: req.status,
      createdAt: req.createdAt,
    };
  }

  async createRequest(userId: string, data: CreateRequestDTO): Promise<RideRequestResponseDTO> {
    const ride = await ridesRepository.findById(data.rideId);
    if (!ride) {
      throw new NotFoundError('Ride', data.rideId);
    }

    if (ride.posterId.toString() === userId) {
      throw new ForbiddenError('request a seat on your own ride');
    }

    if (ride.status !== 'active' || ride.availableSeats <= 0) {
      throw new ConflictError('This ride is no longer available.');
    }

    try {
      const request = await requestsRepository.createRequest(data.rideId, userId, ride.posterId.toString());
      
      // Notify poster
      Promise.all([
        usersRepository.findById(ride.posterId.toString()),
        usersRepository.findById(userId)
      ]).then(([poster, requester]) => {
        if (poster?.expoPushToken && requester) {
          notificationsService.notifyRequestReceived(poster.expoPushToken, requester.name, ride.toCity);
        }
      }).catch(err => logger.error({ err }, 'Failed to send push notification'));

      return this.formatRequest(request);
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictError('You have already requested a seat on this ride.');
      }
      throw new AppError('INTERNAL_ERROR', 'Failed to create request', 500);
    }
  }

  async getMyRequests(userId: string, page = 1, pageSize = 20): Promise<PaginatedResult<RideRequestResponseDTO>> {
    const result = await requestsRepository.findByRequester(userId, page, pageSize);

    const formattedData = await Promise.all(
      result.data.map(async (req) => {
        const formatted = this.formatRequest(req);
        try {
          formatted.ride = await ridesService.getRideDetails(formatted.rideId);
        } catch {
          logger.warn('Failed to fetch ride details for request');
        }
        return formatted;
      })
    );

    return { ...result, data: formattedData };
  }

  async getIncomingRequests(userId: string, page = 1, pageSize = 20): Promise<PaginatedResult<RideRequestResponseDTO>> {
    const result = await requestsRepository.findByPoster(userId, page, pageSize);

    const formattedData = await Promise.all(
      result.data.map(async (req) => {
        const formatted = this.formatRequest(req);
        try {
          formatted.requester = await usersService.getPublicProfile(formatted.requesterId);
          formatted.ride = await ridesService.getRideDetails(formatted.rideId);
        } catch {
          logger.warn('Failed to fetch requester or ride details for incoming request');
        }
        return formatted;
      })
    );

    return { ...result, data: formattedData };
  }

  async acceptRequest(id: string, userId: string): Promise<RideRequestResponseDTO> {
    const request = await requestsRepository.findById(id);
    if (!request) throw new NotFoundError('RideRequest', id);
    if (request.posterId.toString() !== userId) throw new ForbiddenError('accept this request');
    if (request.status !== 'pending') throw new ConflictError(`Cannot accept a ${request.status} request.`);

    const ride = await ridesRepository.findById(request.rideId.toString());
    if (!ride || ride.availableSeats <= 0) {
      throw new ConflictError('No available seats left on this ride.');
    }

    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      const updatedRide = await ridesRepository.updateRide((ride as any)._id.toString(), { availableSeats: ride.availableSeats - 1 }, { session });
      if (!updatedRide) throw new AppError('INTERNAL_ERROR', 'Failed to update ride seats', 500);

      const updatedRequest = await requestsRepository.updateStatus(id, 'accepted', { session });

      if (updatedRide.availableSeats === 0) {
        await ridesRepository.updateRide((ride as any)._id.toString(), { status: 'full' }, { session });
      }

      await session.commitTransaction();

      // Emit seat counter update to ride room
      getIO().to(`ride_${request.rideId}`).emit('seats:updated', {
        rideId: request.rideId.toString(),
        availableSeats: updatedRide.availableSeats - 1,
      });

      // Notify requester (outside transaction — non-critical)
      Promise.all([
        usersRepository.findById(request.requesterId.toString()),
        usersRepository.findById(userId)
      ]).then(([requester, poster]) => {
        if (requester?.expoPushToken && poster) {
          notificationsService.notifyRequestAccepted(requester.expoPushToken, poster.name, ride.toCity);
        }
      }).catch(err => logger.error({ err }, 'Failed to send push notification'));

      return this.formatRequest(updatedRequest);
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof AppError || error instanceof ConflictError || error instanceof NotFoundError || error instanceof ForbiddenError) {
        throw error;
      }
      throw new AppError('INTERNAL_ERROR', 'Failed to accept request', 500);
    } finally {
      session.endSession();
    }
  }

  async rejectRequest(id: string, userId: string): Promise<RideRequestResponseDTO> {
    const request = await requestsRepository.findById(id);
    if (!request) throw new NotFoundError('RideRequest', id);
    if (request.posterId.toString() !== userId) throw new ForbiddenError('reject this request');
    if (request.status !== 'pending') throw new ConflictError(`Cannot reject a ${request.status} request.`);

    const updatedRequest = await requestsRepository.updateStatus(id, 'rejected');
    return this.formatRequest(updatedRequest);
  }

  async withdrawRequest(id: string, userId: string): Promise<RideRequestResponseDTO> {
    const request = await requestsRepository.findById(id);
    if (!request) throw new NotFoundError('RideRequest', id);
    if (request.requesterId.toString() !== userId) throw new ForbiddenError('withdraw this request');
    
    if (request.status === 'accepted') {
      const ride = await ridesRepository.findById(request.rideId.toString());
      if (ride) {
        const updatedRide = await ridesRepository.updateRide((ride as any)._id.toString(), { availableSeats: ride.availableSeats + 1 });
        if (updatedRide) {
          getIO().to(`ride_${request.rideId}`).emit('seats:updated', {
            rideId: request.rideId.toString(),
            availableSeats: updatedRide.availableSeats,
          });
        }
      }
    }

    const updatedRequest = await requestsRepository.updateStatus(id, 'withdrawn');
    return this.formatRequest(updatedRequest);
  }

  async removePassenger(id: string, userId: string): Promise<RideRequestResponseDTO> {
    const request = await requestsRepository.findById(id);
    if (!request) throw new NotFoundError('RideRequest', id);
    if (request.posterId.toString() !== userId) throw new ForbiddenError('remove a passenger from this ride');
    
    if (request.status === 'accepted') {
      const ride = await ridesRepository.findById(request.rideId.toString());
      if (ride) {
        const updatedRide = await ridesRepository.updateRide((ride as any)._id.toString(), { availableSeats: ride.availableSeats + 1 });
        if (updatedRide) {
          getIO().to(`ride_${request.rideId}`).emit('seats:updated', {
            rideId: request.rideId.toString(),
            availableSeats: updatedRide.availableSeats,
          });
        }
      }
    } else {
      throw new ConflictError('Cannot remove a passenger whose request is not accepted');
    }

    const updatedRequest = await requestsRepository.updateStatus(id, 'rejected');
    return this.formatRequest(updatedRequest);
  }
}

export const requestsService = new RequestsService();
