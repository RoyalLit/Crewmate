import { Router } from 'express';

import { requireAuth } from '../../middleware/auth';
import validate from '../../middleware/validate';
import { asyncHandler } from '../../shared/asyncHandler';

import { ridesController } from './rides.controller';
import { createRideValidator, updateRideValidator, rideFilterValidator } from './rides.validators';

const router = Router();

router.use(requireAuth); // All ride endpoints require authentication

router.post('/', createRideValidator, validate, asyncHandler(ridesController.createRide.bind(ridesController)));
router.get('/', rideFilterValidator, validate, asyncHandler(ridesController.browseRides.bind(ridesController)));
router.get('/me', asyncHandler(ridesController.getMyRides.bind(ridesController)));
router.get('/:id', asyncHandler(ridesController.getRideDetails.bind(ridesController)));
router.patch('/:id', updateRideValidator, validate, asyncHandler(ridesController.updateRide.bind(ridesController)));
router.delete('/:id', asyncHandler(ridesController.cancelRide.bind(ridesController)));

export default router;
