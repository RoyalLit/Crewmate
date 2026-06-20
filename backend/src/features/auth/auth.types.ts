export interface RegisterRequestDTO {
  name: string;
  email: string;
  password?: string;
  college?: string;
  homeCity?: string;
}

export interface VerifyOTPRequestDTO {
  email: string;
  otp: string;
}

export interface ResendOTPRequestDTO {
  email: string;
}

export interface LoginRequestDTO {
  email: string;
  password?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ResetPasswordRequestDTO {
  email: string;
  otp: string;
  newPassword?: string;
}

export interface UserResponseDTO {
  id: string;
  name: string;
  email: string;
  college?: string;
  homeCity?: string;
  profilePhotoUrl?: string;
  isEmailVerified: boolean;
  status: string;
  createdAt: Date;
}

export interface AuthResponseDTO {
  user: UserResponseDTO;
  tokens: AuthTokens;
}

export interface JwtPayload {
  userId: string;
  tokenVersion: number;
}
