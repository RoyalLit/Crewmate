import { Router } from 'express';
import { usersController } from './users.controller';
import { uploadMiddleware } from './upload.middleware';
import { requireAuth } from '../../middleware/auth';
import { asyncHandler } from '../../shared/asyncHandler';
import { validateUpdateProfile } from './users.validators';

const router = Router();

router.use(requireAuth); // All user routes require authentication

router.get('/me', asyncHandler(usersController.getCurrentUser.bind(usersController)));
router.patch('/me', validateUpdateProfile, asyncHandler(usersController.updateProfile.bind(usersController)));
router.post('/me/photo', uploadMiddleware.single('photo'), asyncHandler(usersController.uploadPhoto.bind(usersController)));
router.put('/push-token', asyncHandler(usersController.updatePushToken.bind(usersController)));
router.get('/:id', asyncHandler(usersController.getPublicProfile.bind(usersController)));

export default router;
