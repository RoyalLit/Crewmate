/**
 * Shared TypeScript types used across the backend.
 *
 * Feature-specific types live in features/<name>/<feature>.types.ts.
 * Only types that are genuinely cross-cutting belong here.
 */



/**
 * Authenticated user payload attached to the request by auth middleware.
 * Services and controllers reference req.user as this type.
 */
import type { JwtPayload } from '../features/auth/auth.types';

import 'express';

declare module 'express' {
  interface Request {
    user?: JwtPayload;
  }
}

/**
 * Authenticated user payload attached to the request by auth middleware.
 * Services and controllers reference req.user as this type.
 */
export interface RequestUser {
  userId: string;
  tokenVersion: number;
}

/**
 * Generic paginated result returned from repositories.
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Query parameters common to all paginated list endpoints.
 * Per AGENT_RULES.md §11.4.
 */
export interface PaginationQuery {
  page: number;
  pageSize: number;
}
