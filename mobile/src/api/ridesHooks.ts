import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import analytics from '@react-native-firebase/analytics';

export interface CreateRideData {
  fromCity: string;
  toCity: string;
  departureDate: string; // YYYY-MM-DD
  departureTime: string; // HH:mm
  totalSeats: number;
  farePerSeat: number;
  cabType: 'Uber Go' | 'Uber XL' | 'Ola Mini' | 'Ola Prime Sedan' | 'Other';
  genderPreference?: 'ANY' | 'SAME_GENDER';
  arrivalTime?: string;
  stops?: string[];
}

export interface RideFilterData {
  fromCity?: string;
  toCity?: string;
  date?: string;
  page?: number;
  limit?: number;
  sortBy?: 'earliest' | 'cheapest';
  onlyAvailableSeats?: boolean;
}

export function useCreateRideMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRideData) => {
      return await apiClient.post('/rides', data);
    },
    onSuccess: (_, variables) => {
      // Track analytics
      analytics().logEvent('ride_posted', {
        fromCity: variables.fromCity,
        toCity: variables.toCity,
        fare: variables.farePerSeat,
        seats: variables.totalSeats
      });

      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['rides'] });
      queryClient.invalidateQueries({ queryKey: ['myRides'] });
    },
  });
}

export function useBrowseRidesQuery(filters: RideFilterData) {
  return useQuery({
    queryKey: ['rides', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.fromCity) params.append('fromCity', filters.fromCity);
      if (filters.toCity) params.append('toCity', filters.toCity);
      if (filters.date) params.append('date', filters.date);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.onlyAvailableSeats) params.append('onlyAvailableSeats', 'true');

      const response = await apiClient.get(`/rides?${params.toString()}`);
      return response.data;
    },
    refetchInterval: 30000,
    staleTime: 20000,
  });
}

export function useMyRidesQuery() {
  return useQuery({
    queryKey: ['myRides'],
    queryFn: async () => {
      const response = await apiClient.get('/rides/me');
      return response.data;
    },
    refetchInterval: 30000,
    staleTime: 20000,
  });
}

export function useRideDetailsQuery(id: string) {
  return useQuery({
    queryKey: ['ride', id],
    queryFn: async () => {
      const response = await apiClient.get(`/rides/${id}`);
      return response.data;
    },
    enabled: !!id,
    refetchInterval: 30000,
    staleTime: 20000,
  });
}

export function useCancelRideMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.delete(`/rides/${id}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rides'] });
      queryClient.invalidateQueries({ queryKey: ['myRides'] });
      queryClient.invalidateQueries({ queryKey: ['ride', variables] });
    },
  });
}
