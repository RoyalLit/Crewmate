/**
 * Shared TypeScript types for the mobile app.
 *
 * These are cross-cutting types used across multiple features.
 * Feature-specific types live in features/<name>/types.ts.
 *
 * These mirror the backend response envelope ( )
 * so that API response parsing is consistent everywhere.
 */

// ── API Response Envelope ────────────────────────────────────────────────────

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiPaginatedResponse<T> {
  success: true;
  data: T[];
  meta: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ── Pagination ────────────────────────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

// ── User Reference ────────────────────────────────────────────────────────────
// Lightweight user info returned in embedded references (poster, requester)
export interface UserRef {
  id: string;
  name: string;
  college: string;
  homeCity: string;
  profilePhoto?: string;
  isVerified: boolean;
  averageRating?: number;
  totalReviews?: number;
}

// ── Reviews ───────────────────────────────────────────────────────────────────
export interface Review {
  id: string;
  reviewerId: string | UserRef;
  reviewer?: UserRef;
  revieweeId: string;
  rideId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}
