import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';

export interface CreateRideData {
  fromCity: string;
  toCity: string;
  departureDate: string; // YYYY-MM-DD
  departureTime: string; // HH:mm
  totalSeats: number;
  farePerSeat: number;
  cabType: 'Uber Go' | 'Uber XL' | 'Ola Mini' | 'Ola Prime Sedan' | 'Other';
}

export interface RideFilterData {
  fromCity?: string;
  toCity?: string;
  date?: string;
  page?: number;
  limit?: number;
}

export function useCreateRideMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRideData) => {
      return await apiClient.post('/rides', data);
    },
    onSuccess: () => {
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

      const response = await apiClient.get(`/rides?${params.toString()}`);
      return response.data;
    },
    refetchInterval: 10000,
  });
}

export function useMyRidesQuery() {
  return useQuery({
    queryKey: ['myRides'],
    queryFn: async () => {
      const response = await apiClient.get('/rides/me');
      return response.data;
    },
    refetchInterval: 10000,
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
    refetchInterval: 10000,
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
