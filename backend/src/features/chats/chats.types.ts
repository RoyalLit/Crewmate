export interface ChatListResponseDTO {
  id: string; // Unique ID for the row, e.g. rideId_otherUserId
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
