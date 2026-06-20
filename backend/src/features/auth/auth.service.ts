import crypto from 'crypto';

import bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

import { TOKEN, AUTH as AUTH_CONST } from '../../config/constants';
import env from '../../config/env';
import { ConflictError, UnauthorizedError, AppError } from '../../shared/errors';
import logger from '../../shared/logger';
import { mailerService } from '../../shared/mailer';

import { authRepository } from './auth.repository';
import type { RegisterRequestDTO, LoginRequestDTO, VerifyOTPRequestDTO, ResendOTPRequestDTO, AuthTokens, UserResponseDTO, JwtPayload } from './auth.types';


// Node's native jsonwebtoken library is typically used for JWTs


function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export class AuthService {
  /**
   * Generates Access and Refresh Tokens, stores refresh token hash.
   */
  private async generateTokens(userId: string, tokenVersion: number): Promise<AuthTokens> {
    const payload: JwtPayload = { userId, tokenVersion };

    const accessToken = jwt.sign(payload, env.accessTokenSecret, {
      expiresIn: TOKEN.ACCESS_EXPIRY,
    });

    const refreshToken = jwt.sign(payload, env.refreshTokenSecret, {
      expiresIn: TOKEN.REFRESH_EXPIRY,
    });

    // Store SHA-256 hash of refresh token for rotation validation
    const tokenHash = hashToken(refreshToken);
    await authRepository.pushRefreshTokenHash(userId, tokenHash);

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
        await authRepository.deleteUser(String((existingUser as any)._id));
      }
    }

    const hashedPassword = data.password ? await bcrypt.hash(data.password, 12) : undefined;
    
    // Generate a 6-digit OTP and hash it before storing
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otpCode, AUTH_CONST.BCRYPT_SALT_ROUNDS);
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins validity

    const newUser = await authRepository.createUser({
      ...data,
      password: hashedPassword,
      isEmailVerified: false,
      status: 'active',
      otpCode: hashedOtp,
      otpExpiresAt,
      tokenVersion: 0,
    });

    // Send OTP via email using Nodemailer asynchronously
    mailerService.sendOTP(newUser.email, otpCode).catch((e) => {
      logger.error(`Background OTP sending failed: ${e.message}`);
    });
    if (env.nodeEnv === 'development') {
      logger.info(`OTP for ${newUser.email} is ${otpCode}`);
    }

    return {
      user: this.formatUser(newUser),
      message: 'Registration successful. Please verify your email with the OTP sent.',
    };
  }

  /**
   * Resends a new OTP to an unverified user's email.
   */
  async resendOTP(data: ResendOTPRequestDTO): Promise<{ message: string }> {
    const user = await authRepository.findByEmail(data.email);

    if (!user) {
      throw new UnauthorizedError('No account found with this email.');
    }

    if (user.isEmailVerified) {
      throw new ConflictError('Email is already verified.');
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otpCode, AUTH_CONST.BCRYPT_SALT_ROUNDS);
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await authRepository.updateUser((user as any)._id.toString(), {
      otpCode: hashedOtp,
      otpExpiresAt,
    });

    mailerService.sendOTP(user.email, otpCode).catch((e) => {
      logger.error(`Background OTP resend failed: ${e.message}`);
    });

    if (env.nodeEnv === 'development') {
      logger.info(`Resent OTP for ${user.email} is ${otpCode}`);
    }

    return { message: 'OTP resent successfully.' };
  }

  /**
   * Initiates the forgot password flow by sending an OTP to the user's email.
   */
  async forgotPassword(data: ResendOTPRequestDTO): Promise<{ message: string }> {
    const user = await authRepository.findByEmail(data.email);

    // We still return success even if user doesn't exist to prevent email enumeration
    if (!user) {
      return { message: 'If an account exists with this email, an OTP has been sent.' };
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otpCode, AUTH_CONST.BCRYPT_SALT_ROUNDS);
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await authRepository.updateUser((user as any)._id.toString(), {
      otpCode: hashedOtp,
      otpExpiresAt,
    });

    mailerService.sendOTP(user.email, otpCode).catch((e) => {
      logger.error(`Background OTP forgot-password failed: ${e.message}`);
    });

    if (env.nodeEnv === 'development') {
      logger.info(`Forgot Password OTP for ${user.email} is ${otpCode}`);
    }

    return { message: 'If an account exists with this email, an OTP has been sent.' };
  }

  /**
   * Verifies the OTP and resets the user's password.
   */
  async resetPassword(data: import('./auth.types').ResetPasswordRequestDTO): Promise<{ message: string }> {
    const user = await authRepository.findByEmail(data.email);
    
    if (!user) {
      throw new UnauthorizedError('Invalid email or OTP.');
    }

    const isMagicOtp = env.nodeEnv === 'development' && data.otp === '123456';

    const isOtpValid = user.otpCode
      ? await bcrypt.compare(data.otp, user.otpCode)
      : false;

    if (!isMagicOtp && (!isOtpValid || !user.otpExpiresAt || user.otpExpiresAt < new Date())) {
      throw new UnauthorizedError('Invalid or expired OTP.');
    }

    if (!data.newPassword) {
      throw new AppError('BAD_REQUEST', 'New password is required', 400);
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 12);

    // Update password, clear OTP, and increment token version to log out all devices
    await authRepository.updateUser((user as any)._id.toString(), {
      password: hashedPassword,
      otpCode: undefined,
      otpExpiresAt: undefined,
    });
    
    // Invalidate existing sessions
    await authRepository.incrementTokenVersion((user as any)._id.toString());

    return { message: 'Password has been successfully reset. You can now log in.' };
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

    const isMagicOtp = env.nodeEnv === 'development' && data.otp === '123456';

    const isOtpValid = user.otpCode
      ? await bcrypt.compare(data.otp, user.otpCode)
      : false;

    if (!isMagicOtp && (!isOtpValid || !user.otpExpiresAt || user.otpExpiresAt < new Date())) {
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

    const tokens = await this.generateTokens((updatedUser as any)._id.toString(), updatedUser.tokenVersion);

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

    const tokens = await this.generateTokens((user as any)._id.toString(), user.tokenVersion);

    return {
      user: this.formatUser(user),
      tokens,
    };
  }

  /**
   * Refreshes the access token using a valid refresh token with rotation.
   * The old refresh token is invalidated and a new pair is issued.
   */
  async refreshToken(oldRefreshToken: string): Promise<AuthTokens> {
    try {
      const decoded = jwt.verify(oldRefreshToken, env.refreshTokenSecret) as JwtPayload;
      
      const user = await authRepository.findById(decoded.userId);
      
      if (!user) {
        throw new UnauthorizedError('User not found.');
      }

      if (user.tokenVersion !== decoded.tokenVersion) {
        throw new UnauthorizedError('Refresh token has been invalidated.');
      }

      if (user.status === 'suspended') {
        throw new UnauthorizedError('Your account has been suspended.');
      }

      // Verify this specific refresh token against stored hashes (rotation check)
      const tokenHash = hashToken(oldRefreshToken);
      const hashIndex = (user.refreshTokenHashes || []).findIndex(h => h === tokenHash);

      if (hashIndex === -1) {
        throw new UnauthorizedError('Refresh token has already been used or is invalid.');
      }

      // Remove the used token hash and generate a new pair
      await authRepository.removeRefreshTokenHash(decoded.userId, hashIndex);
      
      return this.generateTokens(decoded.userId, user.tokenVersion);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      throw new UnauthorizedError('Invalid or expired refresh token.');
    }
  }

  /**
   * Logs out a user globally by incrementing the token version and clearing all refresh token hashes.
   */
  async logoutGlobal(userId: string): Promise<void> {
    await authRepository.incrementTokenVersion(userId);
    await authRepository.clearRefreshTokenHashes(userId);
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
