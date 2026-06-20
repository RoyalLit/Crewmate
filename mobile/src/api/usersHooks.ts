import { useMutation, useQueryClient } from '@tanstack/react-query';
import client from './client';
import { useAuthStore } from '../store/authStore';

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();
  const updateProfileState = useAuthStore(state => state.updateProfile);

  return useMutation({
    mutationFn: async (data: { name?: string; college?: string; homeCity?: string }) => {
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
