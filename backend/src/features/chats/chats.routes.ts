import { Router } from 'express';

import { requireAuth } from '../../middleware/auth';
import { asyncHandler } from '../../shared/asyncHandler';

import { chatsController } from './chats.controller';

const router = Router();

// Protect all chat routes
router.use(requireAuth);

router.get('/', asyncHandler(chatsController.getMyChats.bind(chatsController)));
router.get('/:rideId/:otherUserId', asyncHandler(chatsController.getChatHistory.bind(chatsController)));

export default router;
