
import type { Server as HttpServer } from 'http';

import * as jwt from 'jsonwebtoken';
import { Server as SocketIOServer } from 'socket.io';
import type { Socket } from 'socket.io';

import { MESSAGE } from '../../config/constants';
import env from '../../config/env';
import { MessageModel } from '../../db/models/Message';
import logger from '../../shared/logger';
import type { JwtPayload } from '../auth/auth.types';

let io: SocketIOServer;

export function getIO(): SocketIOServer {
  return io;
}

export function initializeSockets(server: HttpServer): void {
  io = new SocketIOServer(server, {
    cors: {
      origin: env.clientUrl,
      methods: ['GET', 'POST'],
    },
  });

  // Authentication Middleware
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication token missing'));
    }

    try {
      const decoded = jwt.verify(token, env.accessTokenSecret) as JwtPayload;
      // Attach user info to socket
      (socket as any).user = decoded;
      next();
    } catch (err) {
      return next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user as JwtPayload;
    logger.info(`User ${user.userId} connected to sockets`);

    // Users join a room representing their own ID to receive direct messages
    void socket.join(user.userId);

    // Join a specific ride chat room — only poster or accepted passenger may join
    socket.on('join_ride', async (rideId: string) => {
      try {
        if (!rideId || typeof rideId !== 'string') {
          socket.emit('error', { message: 'Invalid rideId.' });
          return;
        }

        const { ridesRepository } = await import('../rides/rides.repository');
        const { requestsRepository } = await import('../requests/requests.repository');

        const [ride, isPassenger] = await Promise.all([
          ridesRepository.findById(rideId),
          requestsRepository.isAcceptedPassenger(rideId, user.userId),
        ]);

        const isPoster = ride?.posterId?.toString() === user.userId;

        if (!isPoster && !isPassenger) {
          socket.emit('error', { message: 'Not authorized to join this ride room.' });
          logger.warn(`Unauthorized join_ride attempt by ${user.userId} for ride ${rideId}`);
          return;
        }

        void socket.join(`ride_${rideId}`);
        logger.info(`User ${user.userId} joined ride room ride_${rideId}`);
      } catch (err) {
        logger.error(`Error in join_ride handler: ${String(err)}`);
      }
    });

    socket.on('send_message', async (data: { rideId: string, receiverId: string, content: string }) => {
      try {
        if (!data.content || data.content.length > MESSAGE.CONTENT_MAX_LENGTH) {
          socket.emit('message_error', { message: `Message must be between 1 and ${MESSAGE.CONTENT_MAX_LENGTH} characters.` });
          return;
        }

        // Check if either user has blocked the other
        const { safetyService } = await import('../safety/safety.service');
        const [isSenderBlocked, isReceiverBlocked] = await Promise.all([
          safetyService.checkIfBlocked(data.receiverId, user.userId), // Has the receiver blocked the sender?
          safetyService.checkIfBlocked(user.userId, data.receiverId)  // Has the sender blocked the receiver?
        ]);

        if (isSenderBlocked || isReceiverBlocked) {
          // Send an error event back to the sender
          socket.emit('message_error', { message: 'Cannot send message to this user.' });
          return;
        }

        const message = await MessageModel.create({
          rideId: data.rideId,
          senderId: user.userId,
          receiverId: data.receiverId,
          content: data.content,
        });

        const messageDTO = {
          id: message._id.toString(),
          rideId: message.rideId.toString(),
          senderId: message.senderId.toString(),
          receiverId: message.receiverId.toString(),
          content: message.content,
          readStatus: message.readStatus,
          createdAt: message.createdAt.toISOString(),
        };

        // Emit to the specific receiver
        io.to(data.receiverId).emit('receive_message', messageDTO);
        
        // Also emit back to the sender so they can update their UI if they are on multiple devices
        io.to(user.userId).emit('receive_message', messageDTO);

        // Notify receiver
        try {
          const { usersRepository } = await import('../users/users.repository');
          const { notificationsService } = await import('../notifications/notifications.service');
          
          const [receiver, sender] = await Promise.all([
            usersRepository.findById(data.receiverId),
            usersRepository.findById(user.userId)
          ]);
          
          if (receiver?.expoPushToken && sender) {
            notificationsService.notifyNewMessage(receiver.expoPushToken, sender.name);
          }
        } catch (pushErr) {
          logger.error(`Error sending push notification: ${String(pushErr)}`);
        }

      } catch (error) {
        logger.error(`Error saving message: ${String(error)}`);
        return;
      }
    });

    socket.on('mark_read', async (messageId: string) => {
      try {
        await MessageModel.findByIdAndUpdate(messageId, { readStatus: true });
        // Emit read receipt back to the sender
        // To do this properly, we need the message document to know the sender
        const msg = await MessageModel.findById(messageId);
        if (msg) {
          io.to(msg.senderId.toString()).emit('message_read', { messageId, rideId: msg.rideId });
        }
      } catch (error) {
        logger.error(`Error marking message read: ${String(error)}`);
      }
    });

    socket.on('disconnect', () => {
      logger.info(`User ${user.userId} disconnected`);
    });
  });
}
