import { useMutation } from '@tanstack/react-query';
import { apiClient } from './client';

export function useRegisterMutation() {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/auth/register', data);
      return response.data;
    },
  });
}

export function useVerifyOtpMutation() {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/auth/verify-otp', data);
      return response.data;
    },
  });
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/auth/login', data);
      return response.data;
    },
  });
}

export function useGetMe() {
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.get('/auth/me');
      return response.data;
    },
  });
}

export function useUpdateProfileMutation() {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.patch('/users/me', data);
      return response.data;
    },
  });
}
