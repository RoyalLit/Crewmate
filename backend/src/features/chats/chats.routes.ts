import { Router } from 'express';
import { chatsController } from './chats.controller';
import { requireAuth } from '../../middleware/auth';

const router = Router();

// Protect all chat routes
router.use(requireAuth);

router.get('/', chatsController.getMyChats);
router.get('/:rideId/:otherUserId', chatsController.getChatHistory);

export default router;
