import { ridesRepository } from './rides.repository';
import { usersService } from '../users/users.service';
import { CreateRideRequestDTO, UpdateRideRequestDTO, RideFilterQuery, RideResponseDTO } from './rides.types';
import { PaginatedResult } from '../../shared/types';
import { NotFoundError, ForbiddenError, AppError } from '../../shared/errors';

export class RidesService {
  private formatRide(ride: any): RideResponseDTO {
    return {
      id: ride._id.toString(),
      posterId: ride.posterId.toString(),
      fromCity: ride.fromCity,
      toCity: ride.toCity,
      departureDate: ride.departureDate,
      departureTime: ride.departureTime,
      totalSeats: ride.totalSeats,
      availableSeats: ride.availableSeats,
      farePerSeat: ride.farePerSeat,
      cabType: ride.cabType,
      status: ride.status,
      createdAt: ride.createdAt,
    };
  }

  async createRide(posterId: string, data: CreateRideRequestDTO): Promise<RideResponseDTO> {
    const ride = await ridesRepository.createRide(posterId, data);
    return this.formatRide(ride);
  }

  async getRideDetails(id: string): Promise<RideResponseDTO> {
    const ride = await ridesRepository.findById(id);
    if (!ride) {
      throw new NotFoundError('Ride', id);
    }

    const formattedRide = this.formatRide(ride);
    
    // Fetch poster profile
    try {
      const poster = await usersService.getPublicProfile(formattedRide.posterId);
      formattedRide.poster = poster;
    } catch (error) {
      // If poster doesn't exist anymore, just ignore or handle accordingly
    }

    return formattedRide;
  }

  async browseRides(query: RideFilterQuery): Promise<PaginatedResult<RideResponseDTO>> {
    const result = await ridesRepository.findRides(query);
    
    // Format all rides and populate poster
    const formattedData = await Promise.all(result.data.map(async ride => {
      const formattedRide = this.formatRide(ride);
      try {
        formattedRide.poster = await usersService.getPublicProfile(formattedRide.posterId);
      } catch (error) {}
      return formattedRide;
    }));
    
    return {
      ...result,
      data: formattedData,
    };
  }

  async getMyRides(userId: string): Promise<RideResponseDTO[]> {
    const rides = await ridesRepository.findRidesByPoster(userId);
    return Promise.all(rides.map(async ride => {
      const formattedRide = this.formatRide(ride);
      try {
        formattedRide.poster = await usersService.getPublicProfile(formattedRide.posterId);
      } catch (error) {}
      return formattedRide;
    }));
  }

  async updateRide(id: string, userId: string, data: UpdateRideRequestDTO): Promise<RideResponseDTO> {
    const ride = await ridesRepository.findById(id);
    if (!ride) {
      throw new NotFoundError('Ride', id);
    }

    if (ride.posterId.toString() !== userId) {
      throw new ForbiddenError('edit this ride');
    }

    // TODO: Verify if there are accepted requests. If so, restrict editing certain fields.

    // If totalSeats changes, ensure it doesn't drop below requested/accepted seats.
    // For MVP, we'll just apply the update and availableSeats adjustment.
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
    
    // TODO: Notify accepted requesters
  }
}

export const ridesService = new RidesService();
