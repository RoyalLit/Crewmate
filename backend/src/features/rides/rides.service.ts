import { RideRequestModel } from '../../db/models/RideRequest';
import { NotFoundError, ForbiddenError, AppError } from '../../shared/errors';
import logger from '../../shared/logger';
import type { PaginatedResult } from '../../shared/types';
import { notificationsService } from '../notifications/notifications.service';
import { requestsRepository } from '../requests/requests.repository';
import { usersRepository } from '../users/users.repository';
import { usersService } from '../users/users.service';

import { ridesRepository } from './rides.repository';
import type { CreateRideRequestDTO, UpdateRideRequestDTO, RideFilterQuery, RideResponseDTO } from './rides.types';


export class RidesService {
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

  async createRide(posterId: string, data: CreateRideRequestDTO): Promise<RideResponseDTO> {
    const poster = await usersRepository.findById(posterId);
    if (!poster) throw new NotFoundError('User', posterId);

    const ride = await ridesRepository.createRide(posterId, {
      ...data,
      posterGender: poster.gender,
      genderPreference: data.genderPreference || 'ANY',
    } as any);
    return this.formatRide(ride);
  }

  async getRideDetails(id: string): Promise<RideResponseDTO> {
    const ride = await ridesRepository.findById(id);
    if (!ride) {
      throw new NotFoundError('Ride', id);
    }

    const formattedRide = this.formatRide(ride);
    
    // Fetch poster profile and passengers
    try {
      const [poster, acceptedRequests] = await Promise.all([
        usersService.getPublicProfile(formattedRide.posterId),
        requestsRepository.findByRideIdAndStatus(id, 'accepted')
      ]);
      
      formattedRide.poster = poster;
      
      if (acceptedRequests.length > 0) {
        const passengerIds = acceptedRequests.map(req => req.requesterId.toString());
        const passengers = await usersRepository.findByIds(passengerIds);
        formattedRide.passengers = passengers.map(p => usersService.formatPublicProfile(p));
      } else {
        formattedRide.passengers = [];
      }
    } catch (error) {
      logger.warn({ error }, 'Failed to fetch poster or passengers for ride details');
    }

    return formattedRide;
  }

  async browseRides(query: RideFilterQuery): Promise<PaginatedResult<RideResponseDTO>> {
    if (query.requesterId) {
      try {
        const requester = await usersRepository.findById(query.requesterId);
        if (requester?.gender) {
          query.requesterGender = requester.gender;
        }
      } catch (error) {
        logger.warn({ error }, 'Failed to fetch requester for gender filtering');
      }
    }

    const result = await ridesRepository.findRides(query);

    // Batch-fetch all unique poster profiles (fixes N+1)
    const uniquePosterIds = [...new Set(result.data.map(r => r.posterId.toString()))];
    const posters = await usersRepository.findByIds(uniquePosterIds);
    const posterMap = new Map(posters.map(p => [p._id.toString(), usersService.formatPublicProfile(p)]));

    const formattedData = result.data.map(ride => {
      const formattedRide = this.formatRide(ride);
      formattedRide.poster = posterMap.get(formattedRide.posterId);
      return formattedRide;
    });

    return {
      ...result,
      data: formattedData,
    };
  }

  async getMyRides(userId: string, page = 1, pageSize = 20, status?: string): Promise<PaginatedResult<RideResponseDTO>> {
    const result = await ridesRepository.findRidesByPoster(userId, page, pageSize, status);

    const uniquePosterIds = [...new Set(result.data.map(r => r.posterId.toString()))];
    const posters = await usersRepository.findByIds(uniquePosterIds);
    const posterMap = new Map(posters.map(p => [p._id.toString(), usersService.formatPublicProfile(p)]));

    const formattedData = result.data.map(ride => {
      const formattedRide = this.formatRide(ride);
      formattedRide.poster = posterMap.get(formattedRide.posterId);
      return formattedRide;
    });

    return { ...result, data: formattedData };
  }

  async updateRide(id: string, userId: string, data: UpdateRideRequestDTO): Promise<RideResponseDTO> {
    const ride = await ridesRepository.findById(id);
    if (!ride) {
      throw new NotFoundError('Ride', id);
    }

    if (ride.posterId.toString() !== userId) {
      throw new ForbiddenError('edit this ride');
    }

    const hasRequests = await RideRequestModel.exists({ rideId: id });

    const restrictedFields = ['totalSeats', 'farePerSeat'];
    if (hasRequests) {
      for (const field of restrictedFields) {
        if (field in data) {
          throw new AppError('FORBIDDEN', `Cannot edit ${field} after requests have been made.`, 403);
        }
      }
    }

    const updates: any = { ...data };
    
    if (data.totalSeats !== undefined) {
      const difference = data.totalSeats - ride.totalSeats;
      updates.availableSeats = ride.availableSeats + difference;
      
      if (updates.availableSeats < 0) {
        throw new AppError('BAD_REQUEST', 'Cannot reduce total seats below currently accepted seats.', 400);
      }
    }

    const updatedRide = await ridesRepository.updateRide(id, updates);
    if (!updatedRide) {
      throw new AppError('INTERNAL_ERROR', 'Failed to update ride', 500);
    }

    return this.formatRide(updatedRide);
  }

  async cancelRide(id: string, userId: string): Promise<void> {
    const ride = await ridesRepository.findById(id);
    if (!ride) {
      throw new NotFoundError('Ride', id);
    }

    if (ride.posterId.toString() !== userId) {
      throw new ForbiddenError('cancel this ride');
    }

    await ridesRepository.updateRide(id, { status: 'cancelled' });

    // Notify accepted requesters
    try {
      const acceptedRequests = await requestsRepository.findByRideIdAndStatus(id, 'accepted');
      const poster = await usersService.getPublicProfile(userId);
      for (const req of acceptedRequests) {
        const requester = await usersRepository.findById(req.requesterId.toString());
        if (requester?.expoPushToken) {
          notificationsService.notifyRideCancelled(requester.expoPushToken, ride.toCity, poster.name);
        }
      }
    } catch (error) {
      // Non-critical — notification failure shouldn't block cancellation
    }
  }
}

export const ridesService = new RidesService();
