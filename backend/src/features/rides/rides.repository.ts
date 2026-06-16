import { RideModel, IRide } from '../../db/models/Ride';
import { CreateRideRequestDTO, RideFilterQuery } from './rides.types';
import { PaginatedResult } from '../../shared/types';
import { FilterQuery } from 'mongoose';

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
    const { page = 1, pageSize = 20, fromCity, toCity, date } = query;
    const skip = (page - 1) * pageSize;

    const filter: FilterQuery<IRide> = { status: 'active', availableSeats: { $gt: 0 } };

    if (query.excludePosterId) {
      filter.posterId = { $ne: query.excludePosterId };
    }

    if (fromCity) {
      filter.fromCity = new RegExp(`^${fromCity}$`, 'i'); // Case-insensitive exact match
    }
    if (toCity) {
      filter.$or = [
        { toCity: new RegExp(`^${toCity}$`, 'i') },
        { stops: new RegExp(`^${toCity}$`, 'i') }
      ];
    }
    if (date) {
      filter.departureDate = date;
    }

    const [data, total] = await Promise.all([
      RideModel.find(filter).sort({ departureDate: 1, departureTime: 1 }).skip(skip).limit(pageSize).lean(),
      RideModel.countDocuments(filter),
    ]);

    return {
      data: data as unknown as IRide[],
      total,
      page,
      pageSize,
    };
  }

  async findRidesByPoster(posterId: string): Promise<IRide[]> {
    const rides = await RideModel.find({ posterId }).sort({ departureDate: -1 }).lean();
    return rides as unknown as IRide[];
  }

  async updateRide(id: string, updates: Partial<IRide>): Promise<IRide | null> {
    const ride = await RideModel.findByIdAndUpdate(id, updates, { new: true }).lean();
    return ride ? (ride as unknown as IRide) : null;
  }

  async deleteRide(id: string): Promise<void> {
    await RideModel.findByIdAndDelete(id);
  }
}

export const ridesRepository = new RidesRepository();
