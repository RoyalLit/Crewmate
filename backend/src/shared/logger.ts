/**
 * Structured Pino logger singleton.
 *
 * Per AGENT_RULES.md §20.3: console.log, console.error, and console.warn
 * are forbidden in application code. Import and use this logger instead.
 *
 * Log levels:
 *   error — failures requiring immediate attention (bugs, infrastructure down)
 *   warn  — degraded or unexpected-but-handled states
 *   info  — significant system events (startup, shutdown, connections)
 *   debug — development-only detail (never emitted in production)
 *
 * Every log entry should include relevant context (requestId, userId, resourceId).
 * Never log: passwords, tokens, session data, or PII (AGENT_RULES.md §20.3).
 */

import pino from 'pino';

import env from '../config/env';
import { getRequestContext } from '../middleware/requestContext';

const logger = pino({
  level: env.nodeEnv === 'production' ? 'info' : 'debug',
  // In development, use pino-pretty for human-readable output.
  // In production, emit raw JSON for log aggregation (Railway, Datadog, etc.).
  transport:
    env.nodeEnv === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  // Base fields included in every log entry
  base: {
    env: env.nodeEnv,
  },
  // Redact sensitive fields if they accidentally appear in log objects.
  // This is a safety net — never log these fields intentionally.
  redact: {
    paths: ['password', 'token', 'accessToken', 'refreshToken', 'otp', 'secret'],
    censor: '[REDACTED]',
  },
  // Automatically attach requestId from AsyncLocalStorage to every log entry
  mixin() {
    const ctx = getRequestContext();
    if (!ctx) return {};
    return { requestId: ctx.requestId };
  },
});

export default logger;
