import { ReviewModel } from '../../db/models/Review';
import { RideModel } from '../../db/models/Ride';
import { RideRequestModel } from '../../db/models/RideRequest';
import { UserModel } from '../../db/models/User';
import { NotFoundError, AppError, ConflictError } from '../../shared/errors';
import type { UserResponseDTO } from '../auth/auth.types';
import { Types } from 'mongoose';

import { usersRepository } from './users.repository';
import type { UpdateProfileRequestDTO, PublicProfileResponseDTO, CreateReviewRequestDTO, ReviewResponseDTO } from './users.types';

export class UsersService {
  private formatUser(user: any): UserResponseDTO {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      college: user.college,
      homeCity: user.homeCity,
      profilePhotoUrl: user.profilePhotoUrl,
      gender: user.gender,
      isCollegeVerified: user.isCollegeVerified,
      averageRating: user.averageRating,
      totalReviews: user.totalReviews,
      isEmailVerified: user.isEmailVerified,
      status: user.status,
      createdAt: user.createdAt,
    };
  }

  formatPublicProfile(user: any): PublicProfileResponseDTO {
    return {
      id: user._id.toString(),
      name: user.name,
      college: user.college,
      homeCity: user.homeCity,
      profilePhotoUrl: user.profilePhotoUrl,
      gender: user.gender,
      isCollegeVerified: user.isCollegeVerified,
      averageRating: user.averageRating,
      totalReviews: user.totalReviews,
    };
  }

  async getUserById(userId: string): Promise<UserResponseDTO> {
    const user = await usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User', userId);
    }
    return this.formatUser(user);
  }

  async getPublicProfile(userId: string): Promise<PublicProfileResponseDTO> {
    const user = await usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User', userId);
    }
    return this.formatPublicProfile(user);
  }

  async updateProfile(userId: string, data: UpdateProfileRequestDTO): Promise<UserResponseDTO> {
    const updatedUser = await usersRepository.updateProfile(userId, data);
    if (!updatedUser) {
      throw new AppError('INTERNAL_ERROR', 'Failed to update profile', 500);
    }
    return this.formatUser(updatedUser);
  }

  async updateProfilePhoto(userId: string, photoUrl: string): Promise<UserResponseDTO> {
    const updatedUser = await usersRepository.updateProfile(userId, { profilePhotoUrl: photoUrl } as any);
    if (!updatedUser) {
      throw new AppError('INTERNAL_ERROR', 'Failed to update profile photo', 500);
    }
    return this.formatUser(updatedUser);
  }

  async updatePushToken(userId: string, pushToken: string): Promise<UserResponseDTO> {
    const updatedUser = await usersRepository.updateProfile(userId, { expoPushToken: pushToken } as any);
    if (!updatedUser) {
      throw new AppError('INTERNAL_ERROR', 'Failed to update push token', 500);
    }
    return this.formatUser(updatedUser);
  }

  async updateStudentIdPhoto(userId: string, photoUrl: string): Promise<UserResponseDTO> {
    const updatedUser = await usersRepository.updateProfile(userId, {
      studentIdPhotoUrl: photoUrl,
      status: 'pending_id',
    } as any);
    if (!updatedUser) {
      throw new AppError('INTERNAL_ERROR', 'Failed to upload student ID', 500);
    }
    return this.formatUser(updatedUser);
  }

  async createReview(reviewerId: string, revieweeId: string, data: CreateReviewRequestDTO): Promise<ReviewResponseDTO> {
    if (reviewerId === revieweeId) {
      throw new ConflictError('Cannot review yourself');
    }

    const ride = await RideModel.findById(data.rideId);
    if (!ride) throw new NotFoundError('Ride', data.rideId);

    if (new Date(ride.departureTime) > new Date()) {
      throw new ConflictError('Cannot review a ride that has not departed yet');
    }

    // Verify reviewer and reviewee were part of the ride (one is poster, one is accepted requester)
    const isPosterReviewer = ride.posterId.toString() === reviewerId;
    const isPosterReviewee = ride.posterId.toString() === revieweeId;
    
    const [reviewerRequest, revieweeRequest] = await Promise.all([
      isPosterReviewer ? null : RideRequestModel.findOne({ rideId: data.rideId, requesterId: reviewerId, status: 'accepted' }),
      isPosterReviewee ? null : RideRequestModel.findOne({ rideId: data.rideId, requesterId: revieweeId, status: 'accepted' })
    ]);

    if (!isPosterReviewer && !reviewerRequest) {
      throw new ConflictError('You were not an accepted passenger on this ride');
    }
    if (!isPosterReviewee && !revieweeRequest) {
      throw new ConflictError('The user you are reviewing was not an accepted passenger on this ride');
    }

    const revieweeExists = await UserModel.exists({ _id: revieweeId });
    if (!revieweeExists) throw new NotFoundError('User', revieweeId);

    const existingReview = await ReviewModel.findOne({ reviewerId, revieweeId, rideId: data.rideId });
    if (existingReview) {
      throw new ConflictError('You have already reviewed this user for this ride');
    }

    const review = await ReviewModel.create({
      reviewerId,
      revieweeId,
      rideId: data.rideId,
      rating: data.rating,
      comment: data.comment,
    });

    // Recalculate average rating
    const allReviews = await ReviewModel.find({ revieweeId });
    const totalReviews = allReviews.length;
    const averageRating = totalReviews > 0 ? allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0;

    await UserModel.findByIdAndUpdate(revieweeId, { totalReviews, averageRating });

    return {
      id: review._id.toString(),
      reviewerId: review.reviewerId.toString(),
      revieweeId: review.revieweeId.toString(),
      rideId: review.rideId.toString(),
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
    };
  }

  async getReviews(userId: string, page = 1, pageSize = 20): Promise<{ data: ReviewResponseDTO[], total: number }> {
    const skip = (page - 1) * pageSize;
    
    const [reviews, total] = await Promise.all([
      ReviewModel.find({ revieweeId: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .populate('reviewerId', 'name college homeCity profilePhotoUrl gender isCollegeVerified averageRating totalReviews')
        .lean(),
      ReviewModel.countDocuments({ revieweeId: userId })
    ]);

    const data = reviews.map((r: any) => ({
      id: r._id.toString(),
      reviewerId: r.reviewerId._id?.toString() || r.reviewerId.toString(),
      reviewer: r.reviewerId._id ? {
        id: r.reviewerId._id.toString(),
        name: r.reviewerId.name,
        college: r.reviewerId.college,
        homeCity: r.reviewerId.homeCity,
        profilePhotoUrl: r.reviewerId.profilePhotoUrl,
        gender: r.reviewerId.gender,
        isCollegeVerified: r.reviewerId.isCollegeVerified,
        averageRating: r.reviewerId.averageRating,
        totalReviews: r.reviewerId.totalReviews,
      } : undefined,
      revieweeId: r.revieweeId.toString(),
      rideId: r.rideId.toString(),
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
    }));

    return { data, total };
  }

  async getStats(userId: string): Promise<{ ridesGiven: number; ridesTaken: number }> {
    const objectId = new Types.ObjectId(userId);
    const [ridesGiven, ridesTaken] = await Promise.all([
      RideModel.countDocuments({ posterId: objectId, status: 'expired' }),
      RideRequestModel.countDocuments({ requesterId: objectId, status: 'accepted' }),
    ]);
    
    console.log(`[getStats] User ${userId} -> Given: ${ridesGiven}, Taken: ${ridesTaken}`);

    return { ridesGiven, ridesTaken };
  }
}

export const usersService = new UsersService();
