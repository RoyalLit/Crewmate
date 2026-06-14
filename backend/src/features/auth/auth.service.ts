import bcrypt from 'bcrypt';
import { authRepository } from './auth.repository';
import { RegisterRequestDTO, LoginRequestDTO, VerifyOTPRequestDTO, AuthTokens, UserResponseDTO, JwtPayload } from './auth.types';
import { ConflictError, UnauthorizedError, AppError } from '../../shared/errors';
import env from '../../config/env';
import logger from '../../shared/logger';

// Node's native jsonwebtoken library is typically used for JWTs
import * as jwt from 'jsonwebtoken';

import { mailerService } from '../../shared/mailer';

export class AuthService {
  /**
   * Generates Access and Refresh Tokens
   */
  private generateTokens(userId: string, tokenVersion: number): AuthTokens {
    const payload: JwtPayload = { userId, tokenVersion };

    const accessToken = jwt.sign(payload, env.accessTokenSecret, {
      expiresIn: '15m',
    });

    const refreshToken = jwt.sign(payload, env.refreshTokenSecret, {
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  /**
   * Formats a user document into a safe DTO (removes password, etc.)
   */
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

  /**
   * Registers a new user. If OTP is enabled, sets it up.
   */
  async register(data: RegisterRequestDTO): Promise<{ user: UserResponseDTO; message: string }> {
    const existingUser = await authRepository.findByEmail(data.email);
    
    if (existingUser) {
      if (existingUser.isEmailVerified) {
        throw new ConflictError('User already exists with this email.');
      } else {
        // Allow re-registration if not verified
        // Delete the existing unverified user to prevent E11000 duplicate key error
        await authRepository.deleteUser(existingUser._id as string);
      }
    }

    const hashedPassword = data.password ? await bcrypt.hash(data.password, 12) : undefined;
    
    // Generate a 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins validity

    const newUser = await authRepository.createUser({
      ...data,
      password: hashedPassword,
      isEmailVerified: false,
      status: 'active',
      otpCode,
      otpExpiresAt,
      tokenVersion: 0,
    });

    // Send OTP via email using Nodemailer
    await mailerService.sendOTP(newUser.email, otpCode);
    logger.info(`OTP for ${newUser.email} is ${otpCode}`);

    return {
      user: this.formatUser(newUser),
      message: 'Registration successful. Please verify your email with the OTP sent.',
    };
  }

  /**
   * Verifies the OTP sent to the user's email.
   */
  async verifyOTP(data: VerifyOTPRequestDTO): Promise<{ user: UserResponseDTO; tokens: AuthTokens }> {
    const user = await authRepository.findByEmail(data.email);
    
    if (!user) {
      throw new UnauthorizedError('Invalid email or OTP.');
    }

    if (user.isEmailVerified) {
      throw new ConflictError('Email is already verified.');
    }

    if (user.otpCode !== data.otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      throw new UnauthorizedError('Invalid or expired OTP.');
    }

    // Mark as verified and clear OTP
    const updatedUser = await authRepository.updateUser((user as any)._id.toString(), {
      isEmailVerified: true,
      otpCode: undefined,
      otpExpiresAt: undefined,
    });

    if (!updatedUser) {
      throw new AppError('INTERNAL_ERROR', 'Failed to update user after OTP verification', 500);
    }

    const tokens = this.generateTokens((updatedUser as any)._id.toString(), updatedUser.tokenVersion);

    return {
      user: this.formatUser(updatedUser),
      tokens,
    };
  }

  /**
   * Logs in a user using email and password.
   */
  async login(data: LoginRequestDTO): Promise<{ user: UserResponseDTO; tokens: AuthTokens }> {
    const user = await authRepository.findByEmail(data.email);

    if (!user || !user.password || !data.password) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedError('Please verify your email before logging in.');
    }

    if (user.status === 'suspended') {
      throw new UnauthorizedError('Your account has been suspended.');
    }

    const tokens = this.generateTokens((user as any)._id.toString(), user.tokenVersion);

    return {
      user: this.formatUser(user),
      tokens,
    };
  }

  /**
   * Refreshes the access token using a valid refresh token.
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const decoded = jwt.verify(refreshToken, env.refreshTokenSecret) as JwtPayload;
      
      const user = await authRepository.findById(decoded.userId);
      
      if (!user) {
        throw new UnauthorizedError('User not found.');
      }

      // Token version check (allows global invalidation/logout)
      if (user.tokenVersion !== decoded.tokenVersion) {
        throw new UnauthorizedError('Refresh token has been invalidated.');
      }

      if (user.status === 'suspended') {
        throw new UnauthorizedError('Your account has been suspended.');
      }

      return this.generateTokens((user as any)._id.toString(), user.tokenVersion);
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired refresh token.');
    }
  }

  /**
   * Logs out a user globally by incrementing the token version.
   */
  async logoutGlobal(userId: string): Promise<void> {
    await authRepository.incrementTokenVersion(userId);
  }

  /**
   * Get the current user
   */
  async getMe(userId: string): Promise<UserResponseDTO> {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found.');
    }
    return this.formatUser(user);
  }
}

export const authService = new AuthService();
