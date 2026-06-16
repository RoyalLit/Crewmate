import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from './client';

export interface ChatListResponseDTO {
  id: string;
  rideId: string;
  rideDetails: {
    fromCity: string;
    toCity: string;
    departureDate: string;
  };
  otherUser: {
    id: string;
    name: string;
    profilePhotoUrl?: string;
  };
  lastMessage: string;
  time: string;
  unreadCount: number;
}

export interface MessageResponseDTO {
  id: string;
  rideId: string;
  senderId: string;
  receiverId: string;
  content: string;
  readStatus: boolean;
  createdAt: string;
}

export const useChatsList = () => {
  return useQuery({
    queryKey: ['chats'],
    queryFn: async (): Promise<ChatListResponseDTO[]> => {
      const { data } = await apiClient.get('/chats');
      return data.data;
    },
  });
};

export const useChatHistory = (rideId: string, otherUserId: string) => {
  return useInfiniteQuery({
    queryKey: ['chat', rideId, otherUserId],
    queryFn: async ({ pageParam = 0 }): Promise<MessageResponseDTO[]> => {
      const { data } = await apiClient.get(`/chats/${rideId}/${otherUserId}?skip=${pageParam}&limit=20`);
      return data.data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 20 ? allPages.length * 20 : undefined;
    },
  });
};
