import { Router } from 'express';
import { authController } from './auth.controller';
import { 
  registerValidator, 
  verifyOtpValidator, 
  resendOtpValidator,
  loginValidator 
} from './auth.validators';
import validate from '../../middleware/validate';
import { requireAuth } from '../../middleware/auth';

const router = Router();

// Public routes
router.post('/register', registerValidator, validate, authController.register);
router.post('/verify-otp', verifyOtpValidator, validate, authController.verifyOTP);
router.post('/resend-otp', resendOtpValidator, validate, authController.resendOTP);
router.post('/login', loginValidator, validate, authController.login);
router.post('/refresh', authController.refreshToken); // Payload is validated inline in controller

// Protected routes
router.get('/me', requireAuth, authController.getMe);
router.post('/logout', requireAuth, authController.logoutGlobal);

export default router;
