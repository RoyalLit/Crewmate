import mongoose from 'mongoose';

import { NotFoundError, ForbiddenError, AppError, ConflictError } from '../../shared/errors';
import logger from '../../shared/logger';
import type { PaginatedResult } from '../../shared/types';
import { getIO } from '../chats/socket';
import { notificationsService } from '../notifications/notifications.service';
import { ridesRepository } from '../rides/rides.repository';
import type { RideResponseDTO } from '../rides/rides.types';
import { usersRepository } from '../users/users.repository';
import type { PublicProfileResponseDTO } from '../users/users.types';

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

  private formatRide(ride: any): RideResponseDTO {
    return {
      id: ride._id.toString(),
      posterId: ride.posterId.toString(),
      fromCity: ride.fromCity,
      toCity: ride.toCity,
      departureDate: ride.departureDate,
      departureTime: ride.departureTime,
      arrivalTime: ride.arrivalTime,
      stops: ride.stops || [],
      totalSeats: ride.totalSeats,
      availableSeats: ride.availableSeats,
      farePerSeat: ride.farePerSeat,
      cabType: ride.cabType,
      genderPreference: ride.genderPreference,
      status: ride.status,
      createdAt: ride.createdAt,
    };
  }

  private formatPublicProfile(user: any): PublicProfileResponseDTO {
    return {
      id: user._id.toString(),
      name: user.name,
      college: user.college,
      homeCity: user.homeCity,
      profilePhotoUrl: user.profilePhotoUrl,
      gender: user.gender,
      isCollegeVerified: user.isCollegeVerified,
      averageRating: user.averageRating,
      totalReviews: user.totalReviews,
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
          notificationsService.notifyRequestReceived(poster.expoPushToken, requester.name, ride.toCity, ride._id.toString());
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

    const rideIds = [...new Set(result.data.map(r => r.rideId.toString()))];
    const rides = rideIds.length ? await ridesRepository.findByIds(rideIds) : [];
    const rideMap = new Map(rides.map(r => [r._id.toString(), this.formatRide(r)]));

    const formattedData = result.data.map(req => {
      const formatted = this.formatRequest(req);
      const ride = rideMap.get(formatted.rideId);
      if (ride) formatted.ride = ride;
      return formatted;
    });

    return { ...result, data: formattedData };
  }

  async getIncomingRequests(userId: string, page = 1, pageSize = 20): Promise<PaginatedResult<RideRequestResponseDTO>> {
    const result = await requestsRepository.findByPoster(userId, page, pageSize);

    const rideIds = [...new Set(result.data.map(r => r.rideId.toString()))];
    const requesterIds = [...new Set(result.data.map(r => r.requesterId.toString()))];

    const [rides, users] = await Promise.all([
      rideIds.length ? ridesRepository.findByIds(rideIds) : Promise.resolve([]),
      requesterIds.length ? usersRepository.findByIds(requesterIds) : Promise.resolve([]),
    ]);

    const rideMap = new Map(rides.map(r => [r._id.toString(), this.formatRide(r)]));
    const userMap = new Map(users.map(u => [u._id.toString(), this.formatPublicProfile(u)]));

    const formattedData = result.data.map(req => {
      const formatted = this.formatRequest(req);
      const ride = rideMap.get(formatted.rideId);
      if (ride) formatted.ride = ride;
      const requester = userMap.get(formatted.requesterId);
      if (requester) formatted.requester = requester;
      return formatted;
    });

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
          notificationsService.notifyRequestAccepted(requester.expoPushToken, poster.name, ride.toCity, ride._id.toString(), poster._id.toString());
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
