import type { UserResponseDTO } from '../auth/auth.types';

export interface UpdateProfileRequestDTO {
  name?: string;
  college?: string;
  homeCity?: string;
}

// Reuse UserResponseDTO for sending user profiles out
export type PublicProfileResponseDTO = Pick<UserResponseDTO, 'id' | 'name' | 'college' | 'homeCity' | 'profilePhotoUrl'>;
