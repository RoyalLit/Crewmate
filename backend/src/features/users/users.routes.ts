import { Router } from 'express';
import { body } from 'express-validator';

import { requireAuth } from '../../middleware/auth';
import validate from '../../middleware/validate';
import { asyncHandler } from '../../shared/asyncHandler';

import { uploadMiddleware } from './upload.middleware';
import { usersController } from './users.controller';
import { validateUpdateProfile } from './users.validators';

const router = Router();

router.use(requireAuth);

router.get('/me', asyncHandler(usersController.getCurrentUser.bind(usersController)));
router.get('/me/stats', asyncHandler(usersController.getStats.bind(usersController)));
router.patch('/me', validateUpdateProfile, asyncHandler(usersController.updateProfile.bind(usersController)));
router.post('/me/photo', uploadMiddleware.single('photo'), asyncHandler(usersController.uploadPhoto.bind(usersController)));
router.put('/push-token', [
  body('pushToken').isString().isLength({ max: 255 }).withMessage('Invalid push token'),
  validate,
], asyncHandler(usersController.updatePushToken.bind(usersController)));
router.get('/:id', asyncHandler(usersController.getPublicProfile.bind(usersController)));
router.post('/:id/reviews', asyncHandler(usersController.createReview.bind(usersController)));
router.get('/:id/reviews', asyncHandler(usersController.getReviews.bind(usersController)));

export default router;
