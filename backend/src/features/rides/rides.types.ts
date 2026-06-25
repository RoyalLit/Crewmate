import type { PaginationQuery } from '../../shared/types';
import type { PublicProfileResponseDTO } from '../users/users.types';

export interface CreateRideRequestDTO {
  fromCity: string;
  toCity: string;
  departureDate: string; // YYYY-MM-DD
  departureTime: string; // HH:mm
  arrivalTime: string; // HH:mm
  stops?: string[];
  totalSeats: number;
  farePerSeat: number;
  cabType: 'Hatchback' | 'Sedan' | 'SUV' | 'MUV' | 'Any' | 'Other';
  genderPreference?: 'ANY' | 'SAME_GENDER';
}

export interface UpdateRideRequestDTO {
  departureDate?: string;
  departureTime?: string;
  arrivalTime?: string;
  stops?: string[];
  totalSeats?: number;
  farePerSeat?: number;
  cabType?: 'Hatchback' | 'Sedan' | 'SUV' | 'MUV' | 'Any' | 'Other';
  genderPreference?: 'ANY' | 'SAME_GENDER';
}

export interface RideFilterQuery extends PaginationQuery {
  fromCity?: string;
  toCity?: string;
  date?: string;
  excludePosterId?: string;
  requesterId?: string;
  requesterGender?: 'MALE' | 'FEMALE' | 'OTHER';
}

export interface RideResponseDTO {
  id: string;
  posterId: string;
  poster?: PublicProfileResponseDTO; // Populated when fetching ride details
  passengers?: PublicProfileResponseDTO[]; // Populated when fetching ride details
  fromCity: string;
  toCity: string;
  departureDate: string;
  departureTime: string;
  arrivalTime: string;
  stops: string[];
  totalSeats: number;
  availableSeats: number;
  farePerSeat: number;
  cabType: string;
  genderPreference: string;
  status: string;
  createdAt: Date;
}
