import type { FilterQuery, ClientSession } from 'mongoose';

import type { IRide } from '../../db/models/Ride';
import { RideModel } from '../../db/models/Ride';
import type { PaginatedResult } from '../../shared/types';

import type { CreateRideRequestDTO, RideFilterQuery } from './rides.types';

export class RidesRepository {
  async createRide(posterId: string, data: CreateRideRequestDTO): Promise<IRide> {
    const ride = await RideModel.create({
      ...data,
      posterId,
      availableSeats: data.totalSeats, // Initially all seats are available
      status: 'active',
    });
    return ride.toObject() as unknown as IRide;
  }

  async findById(id: string): Promise<IRide | null> {
    const ride = await RideModel.findById(id).lean();
    return ride ? (ride as unknown as IRide) : null;
  }

  async findRides(query: RideFilterQuery): Promise<PaginatedResult<IRide>> {
    const { page = 1, pageSize = 20, fromCity, toCity, date, requesterGender, sortBy = 'earliest', onlyAvailableSeats } = query;
    const skip = (page - 1) * pageSize;

    const filter: FilterQuery<IRide> = { status: 'active' };
    
    if (onlyAvailableSeats === 'true') {
      filter.availableSeats = { $gt: 0 };
    }

    // Calculate IST threshold (current time - 10 minutes)
    const threshold = new Date(Date.now() - 10 * 60 * 1000);
    const istTime = new Date(threshold.getTime() + 5.5 * 60 * 60 * 1000);
    const thresholdDateStr = istTime.toISOString().split('T')[0];
    const thresholdTimeStr = istTime.toISOString().split('T')[1].slice(0, 5);

    const conditions: FilterQuery<IRide>[] = [];

    if (date) {
      filter.departureDate = date;
      if (date === thresholdDateStr) {
        filter.departureTime = { $gte: thresholdTimeStr };
      }
    } else {
      conditions.push({
        $or: [
          { departureDate: { $gt: thresholdDateStr } },
          { departureDate: thresholdDateStr, departureTime: { $gte: thresholdTimeStr } },
        ],
      });
    }

    if (query.excludePosterId) {
      filter.posterId = { $ne: query.excludePosterId };
    }

    // Gender preference filtering
    if (requesterGender) {
      conditions.push({
        $or: [
          { genderPreference: 'ANY' },
          { genderPreference: 'SAME_GENDER', posterGender: requesterGender }
        ]
      });
    } else {
      // If requester has no gender set, they can only see ANY gender rides
      filter.genderPreference = 'ANY';
    }

    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    if (fromCity) {
      filter.fromCity = new RegExp(`^${escapeRegex(fromCity)}$`, 'i');
    }
    if (toCity) {
      conditions.push({
        $or: [
          { toCity: new RegExp(`^${escapeRegex(toCity)}$`, 'i') },
          { stops: new RegExp(`^${escapeRegex(toCity)}$`, 'i') },
        ],
      });
    }

    if (conditions.length > 0) {
      filter.$and = conditions;
    }

    const sortObj: any = sortBy === 'cheapest' 
      ? { farePerSeat: 1, departureDate: 1, departureTime: 1 } 
      : { departureDate: 1, departureTime: 1 };

    const [data, total] = await Promise.all([
      RideModel.find(filter)
        .select('posterId posterGender genderPreference fromCity toCity departureDate departureTime arrivalTime stops totalSeats availableSeats farePerSeat cabType status')
        .sort(sortObj).skip(skip).limit(pageSize).lean(),
      RideModel.countDocuments(filter),
    ]);

    return {
      data: data as unknown as IRide[],
      total,
      page,
      pageSize,
    };
  }

  async findRidesByPoster(posterId: string, page = 1, pageSize = 20, status?: string): Promise<PaginatedResult<IRide>> {
    const skip = (page - 1) * pageSize;
    const filter: FilterQuery<IRide> = { posterId };
    if (status) {
      filter.status = status;
    }
    const [data, total] = await Promise.all([
      RideModel.find(filter)
        .select('posterId posterGender genderPreference fromCity toCity departureDate departureTime arrivalTime stops totalSeats availableSeats farePerSeat cabType status createdAt')
        .sort({ departureDate: -1 }).skip(skip).limit(pageSize).lean(),
      RideModel.countDocuments(filter),
    ]);
    return { data: data as unknown as IRide[], total, page, pageSize };
  }

  async updateRide(id: string, updates: Partial<IRide>, options?: { session?: ClientSession }): Promise<IRide | null> {
    const ride = await RideModel.findByIdAndUpdate(id, updates, { new: true, session: options?.session }).lean();
    return ride ? (ride as unknown as IRide) : null;
  }

  async findByIds(ids: string[]): Promise<IRide[]> {
    const rides = await RideModel.find({ _id: { $in: ids } }).lean();
    return rides as unknown as IRide[];
  }

  async deleteRide(id: string): Promise<void> {
    await RideModel.findByIdAndDelete(id);
  }
}

export const ridesRepository = new RidesRepository();
