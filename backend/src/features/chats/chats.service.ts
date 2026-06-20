import mongoose from 'mongoose';

import { MessageModel } from '../../db/models/Message';

import type { ChatListResponseDTO, MessageResponseDTO } from './chats.types';

export class ChatsService {
  async getUserChats(userId: string): Promise<ChatListResponseDTO[]> {
    const objectId = new mongoose.Types.ObjectId(userId);

    const pipeline = [
      {
        $match: {
          $or: [{ senderId: objectId }, { receiverId: objectId }],
        },
      },
      {
        $sort: { createdAt: -1 }, // Sort messages newest first
      },
      {
        $group: {
          _id: {
            rideId: '$rideId',
            otherUser: {
              $cond: [{ $eq: ['$senderId', objectId] }, '$receiverId', '$senderId'],
            },
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [{ $and: [{ $eq: ['$receiverId', objectId] }, { $eq: ['$readStatus', false] }] }, 1, 0],
            },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id.otherUser',
          foreignField: '_id',
          as: 'otherUserDetails',
        },
      },
      {
        $unwind: '$otherUserDetails',
      },
      {
        $lookup: {
          from: 'rides',
          localField: '_id.rideId',
          foreignField: '_id',
          as: 'rideDetails',
        },
      },
      {
        $unwind: '$rideDetails',
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }, // Sort groups by newest last message
      },
    ];

    const results = await MessageModel.aggregate(pipeline as any);

    return results.map((result) => ({
      id: `${result._id.rideId}_${result._id.otherUser}`,
      rideId: result._id.rideId.toString(),
      rideDetails: {
        fromCity: result.rideDetails.fromCity,
        toCity: result.rideDetails.toCity,
        departureDate: result.rideDetails.departureDate,
      },
      otherUser: {
        id: result.otherUserDetails._id.toString(),
        name: result.otherUserDetails.name,
        profilePhotoUrl: result.otherUserDetails.profilePhotoUrl,
      },
      lastMessage: result.lastMessage.content,
      time: result.lastMessage.createdAt.toISOString(),
      unreadCount: result.unreadCount,
    }));
  }

  async getChatHistory(userId: string, rideId: string, otherUserId: string, limit = 50, skip = 0): Promise<MessageResponseDTO[]> {
    const userObjId = new mongoose.Types.ObjectId(userId);
    const rideObjId = new mongoose.Types.ObjectId(rideId);
    const otherUserObjId = new mongoose.Types.ObjectId(otherUserId);

    const messages = await MessageModel.find({
      rideId: rideObjId,
      $or: [
        { senderId: userObjId, receiverId: otherUserObjId },
        { senderId: otherUserObjId, receiverId: userObjId },
      ],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return messages.map((msg) => ({
      id: msg._id.toString(),
      rideId: msg.rideId.toString(),
      senderId: msg.senderId.toString(),
      receiverId: msg.receiverId.toString(),
      content: msg.content,
      readStatus: msg.readStatus,
      createdAt: msg.createdAt.toISOString(),
    }));
  }
}

export const chatsService = new ChatsService();
