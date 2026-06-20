import type { RideResponseDTO } from '../rides/rides.types';
import type { PublicProfileResponseDTO } from '../users/users.types';

export interface CreateRequestDTO {
  rideId: string;
}

export interface RideRequestResponseDTO {
  id: string;
  rideId: string;
  ride?: RideResponseDTO;
  requesterId: string;
  requester?: PublicProfileResponseDTO;
  posterId: string;
  status: string;
  createdAt: Date;
}
