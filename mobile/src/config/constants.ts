/**
 * Application-wide named constants for the mobile app.
 *
 * All magic numbers in the mobile app must reference these constants.
 * Per AGENT_RULES.md §3.4.
 */

import { TAB_BAR_HEIGHT } from '../design/tokens';

// Re-export from tokens so consumers can import from one place
export { TAB_BAR_HEIGHT };

export const API = {
  // Timeout in milliseconds for all API requests
  REQUEST_TIMEOUT_MS: 10_000,
  // Default pagination per AGENT_RULES.md §11.4
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN:  'crewmute_access_token',
  REFRESH_TOKEN: 'crewmute_refresh_token',
  USER_ID:       'crewmute_user_id',
  THEME:         'crewmute_theme', // Must match themeStore persist key
} as const;

export const ANIMATION = {
  // Duration constants from DESIGN.md §7.1
  MICRO_MS:      100, // Button press
  FAST_MS:       150, // Card tap, OTP box focus, tab bar blur
  DEFAULT_MS:    200, // Tab switch, request accept/reject
  MODAL_OPEN_MS: 300, // Bottom sheet open, screen transition
  MODAL_CLOSE_MS:250, // Bottom sheet close
  SKELETON_MS:  1200, // Shimmer animation
  TOAST_MS:      300, // Toast in/out
  TOAST_HOLD_MS: 3000,// Toast auto-dismiss hold
} as const;

export const LIMITS = {
  RIDE_NOTES_MAX:    200,
  REQUEST_MSG_MAX:   100,
  MESSAGE_CONTENT_MAX: 1000,
  RIDE_MIN_SEATS: 1,
  RIDE_MAX_SEATS: 6,
} as const;
