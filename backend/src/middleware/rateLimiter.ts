import rateLimit from 'express-rate-limit';
import { RATE_LIMIT } from '../config/constants';

export const authLimiter = rateLimit({
  windowMs: RATE_LIMIT.AUTH_WINDOW_MS,
  max: RATE_LIMIT.AUTH_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMIT',
      message: 'Too many requests. Please try again later.',
    },
  },
});

export const generalLimiter = rateLimit({
  windowMs: RATE_LIMIT.GENERAL_WINDOW_MS,
  max: RATE_LIMIT.GENERAL_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMIT',
      message: 'Too many requests. Please try again later.',
    },
  },
});
