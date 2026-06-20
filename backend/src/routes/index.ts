/**
 * Root Express router.
 *
 * Mounts:
 *   GET /health       — liveness probe (process is running)
 *   GET /health/ready — readiness probe (DB connected, ready for traffic)
 *
 * Feature routes are mounted here as they are added in subsequent PRs:
 *   router.use('/auth', authRoutes);
 *   router.use('/users', userRoutes);
 *   router.use('/rides', rideRoutes);
 *   etc.
 *
 * Health endpoints are exempt from auth middleware and rate limiting
 * per AGENT_RULES.md §21.2.
 */

import { Router } from 'express';


import authRoutes from '../features/auth/auth.routes';
import chatsRoutes from '../features/chats/chats.routes';
import { requestsRoutes } from '../features/requests/requests.routes';
import ridesRoutes from '../features/rides/rides.routes';
import { safetyRoutes } from '../features/safety/safety.routes';
import usersRoutes from '../features/users/users.routes';
import { authLimiter, generalLimiter } from '../middleware/rateLimiter';

const router = Router();

// Apply rate limiters to all feature routes
router.use('/auth', authLimiter, authRoutes);
router.use('/users', generalLimiter, usersRoutes);
router.use('/rides', generalLimiter, ridesRoutes);
router.use('/requests', generalLimiter, requestsRoutes);
router.use('/chats', generalLimiter, chatsRoutes);
router.use('/safety', generalLimiter, safetyRoutes);

export default router;
