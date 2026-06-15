import { PaginationQuery } from '../../shared/types';
import { PublicProfileResponseDTO } from '../users/users.types';

export interface CreateRideRequestDTO {
  fromCity: string;
  toCity: string;
  departureDate: string; // YYYY-MM-DD
  departureTime: string; // HH:mm
  totalSeats: number;
  farePerSeat: number;
  cabType: 'Uber Go' | 'Uber XL' | 'Ola Mini' | 'Ola Prime Sedan' | 'Other';
}

export interface UpdateRideRequestDTO {
  departureDate?: string;
  departureTime?: string;
  totalSeats?: number;
  farePerSeat?: number;
  cabType?: 'Uber Go' | 'Uber XL' | 'Ola Mini' | 'Ola Prime Sedan' | 'Other';
}

export interface RideFilterQuery extends PaginationQuery {
  fromCity?: string;
  toCity?: string;
  date?: string;
  excludePosterId?: string;
}

export interface RideResponseDTO {
  id: string;
  posterId: string;
  poster?: PublicProfileResponseDTO; // Populated when fetching ride details
  fromCity: string;
  toCity: string;
  departureDate: string;
  departureTime: string;
  totalSeats: number;
  availableSeats: number;
  farePerSeat: number;
  cabType: string;
  status: string;
  createdAt: Date;
}
