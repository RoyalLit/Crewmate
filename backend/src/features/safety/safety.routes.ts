import { Router } from 'express';

import { requireAuth } from '../../middleware/auth';
import { asyncHandler } from '../../shared/asyncHandler';

import { safetyController } from './safety.controller';

const router = Router();

// All safety routes require authentication
router.use(requireAuth);

router.post('/report', asyncHandler(safetyController.reportUser.bind(safetyController)));
router.post('/block', asyncHandler(safetyController.blockUser.bind(safetyController)));
router.get('/block-status/:id', asyncHandler(safetyController.checkBlockStatus.bind(safetyController)));

export { router as safetyRoutes };
