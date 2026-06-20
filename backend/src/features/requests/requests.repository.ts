import { RideRequestModel, IRideRequest } from '../../db/models/RideRequest';
import { PaginatedResult } from '../../shared/types';
import { ClientSession } from 'mongoose';

export class RequestsRepository {
  async createRequest(rideId: string, requesterId: string, posterId: string): Promise<IRideRequest> {
    const request = await RideRequestModel.create({
      rideId,
      requesterId,
      posterId,
      status: 'pending',
    });
    return request.toObject() as unknown as IRideRequest;
  }

  async findById(id: string): Promise<IRideRequest | null> {
    const request = await RideRequestModel.findById(id).lean();
    return request ? (request as unknown as IRideRequest) : null;
  }

  async findByRequester(requesterId: string, page = 1, pageSize = 20): Promise<PaginatedResult<IRideRequest>> {
    const skip = (page - 1) * pageSize;
    const filter = { requesterId };
    const [data, total] = await Promise.all([
      RideRequestModel.find(filter)
        .select('rideId requesterId posterId status createdAt')
        .sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
      RideRequestModel.countDocuments(filter),
    ]);
    return { data: data as unknown as IRideRequest[], total, page, pageSize };
  }

  async findByPoster(posterId: string, page = 1, pageSize = 20): Promise<PaginatedResult<IRideRequest>> {
    const skip = (page - 1) * pageSize;
    const filter = { posterId };
    const [data, total] = await Promise.all([
      RideRequestModel.find(filter)
        .select('rideId requesterId posterId status createdAt')
        .sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
      RideRequestModel.countDocuments(filter),
    ]);
    return { data: data as unknown as IRideRequest[], total, page, pageSize };
  }

  async findByRideIdAndStatus(rideId: string, status: string): Promise<IRideRequest[]> {
    const requests = await RideRequestModel.find({ rideId, status }).lean();
    return requests as unknown as IRideRequest[];
  }

  async updateStatus(id: string, status: 'accepted' | 'rejected' | 'withdrawn', options?: { session?: ClientSession }): Promise<IRideRequest | null> {
    const request = await RideRequestModel.findByIdAndUpdate(id, { status }, { new: true, session: options?.session }).lean();
    return request ? (request as unknown as IRideRequest) : null;
  }

  /**
   * Returns true if userId is an accepted passenger on the given ride.
   * Used for WebSocket join_ride authorization.
   */
  async isAcceptedPassenger(rideId: string, userId: string): Promise<boolean> {
    const count = await RideRequestModel.countDocuments({ rideId, requesterId: userId, status: 'accepted' });
    return count > 0;
  }
}

export const requestsRepository = new RequestsRepository();
