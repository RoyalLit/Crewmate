import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import client from './client';
import { useAuthStore } from '../store/authStore';

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();
  const updateProfileState = useAuthStore(state => state.updateProfile);

  return useMutation({
    mutationFn: async (data: { name?: string; college?: string; homeCity?: string; gender?: 'MALE' | 'FEMALE' | 'OTHER' }) => {
      const response = await client.patch('/users/me', data);
      return response.data;
    },
    onSuccess: (data) => {
      updateProfileState(data.data);
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
    },
  });
};

export const useUpdateAvatarMutation = () => {
  const queryClient = useQueryClient();
  const updateProfileState = useAuthStore(state => state.updateProfile);

  return useMutation({
    mutationFn: async (imageUri: string) => {
      const formData = new FormData();
      formData.append('photo', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'avatar.jpg',
      } as any);

      const response = await client.post('/users/me/photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      updateProfileState(data.data);
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
    },
  });
};

export const useCreateReviewMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { userId: string; rideId: string; rating: number; comment?: string }) => {
      const response = await client.post(`/users/${data.userId}/reviews`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users', variables.userId, 'reviews'] });
      queryClient.invalidateQueries({ queryKey: ['users', variables.userId] });
    },
  });
};

export const useUserReviewsQuery = (userId: string, page = 1) => {
  return useQuery({
    queryKey: ['users', userId, 'reviews', page],
    queryFn: async () => {
      const response = await client.get(`/users/${userId}/reviews`, { params: { page } });
      return response.data;
    },
    enabled: !!userId,
  });
};

export const useMyStatsQuery = () => {
  return useQuery({
    queryKey: ['users', 'me', 'stats'],
    queryFn: async () => {
      const response = await client.get('/users/me/stats');
      return response.data;
    },
  });
};

export const usePublicProfileQuery = (userId: string) => {
  return useQuery({
    queryKey: ['users', userId],
    queryFn: async () => {
      const response = await client.get(`/users/${userId}`);
      return response.data;
    },
    enabled: !!userId,
  });
};
