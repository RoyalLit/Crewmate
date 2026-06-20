import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';

export interface RequestPayload {
  rideId: string;
}

export function useCreateRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RequestPayload) => {
      return await apiClient.post('/requests', data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['myRequests'] });
      queryClient.invalidateQueries({ queryKey: ['ride', variables.rideId] });
      // Invalidate rides so seat counts might update if needed
      queryClient.invalidateQueries({ queryKey: ['rides'] });
    },
  });
}

export function useMyRequestsQuery() {
  return useQuery({
    queryKey: ['myRequests'],
    queryFn: async () => {
      const response = await apiClient.get('/requests/my-requests');
      return response.data;
    },
    refetchInterval: 30000,
    staleTime: 20000,
  });
}

export function useIncomingRequestsQuery() {
  return useQuery({
    queryKey: ['incomingRequests'],
    queryFn: async () => {
      const response = await apiClient.get('/requests/incoming');
      return response.data;
    },
    refetchInterval: 30000,
    staleTime: 20000,
  });
}

export function useAcceptRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      return await apiClient.post(`/requests/${requestId}/accept`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomingRequests'] });
      queryClient.invalidateQueries({ queryKey: ['rides'] });
      queryClient.invalidateQueries({ queryKey: ['myRides'] });
    },
  });
}

export function useRejectRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      return await apiClient.post(`/requests/${requestId}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomingRequests'] });
    },
  });
}

export function useWithdrawRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      return await apiClient.post(`/requests/${requestId}/withdraw`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myRequests'] });
      queryClient.invalidateQueries({ queryKey: ['rides'] });
      // We don't have the rideId easily accessible here unless passed,
      // so invalidate all ride details globally to be safe.
      queryClient.invalidateQueries({ queryKey: ['ride'] });
    },
  });
}

export function useRemovePassengerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      return await apiClient.post(`/requests/${requestId}/remove-passenger`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomingRequests'] });
      queryClient.invalidateQueries({ queryKey: ['rides'] });
      queryClient.invalidateQueries({ queryKey: ['ride'] });
    },
  });
}
