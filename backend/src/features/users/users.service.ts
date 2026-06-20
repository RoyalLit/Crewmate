import { usersRepository } from './users.repository';
import { UpdateProfileRequestDTO, PublicProfileResponseDTO } from './users.types';
import { UserResponseDTO } from '../auth/auth.types';
import { NotFoundError, AppError } from '../../shared/errors';

export class UsersService {
  private formatUser(user: any): UserResponseDTO {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      college: user.college,
      homeCity: user.homeCity,
      profilePhotoUrl: user.profilePhotoUrl,
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
}

export const usersService = new UsersService();
