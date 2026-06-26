import { Router } from 'express';
import rateLimit from 'express-rate-limit';

import { requireAuth } from '../../middleware/auth';
import validate from '../../middleware/validate';
import { asyncHandler } from '../../shared/asyncHandler';
import { uploadMiddleware } from '../users/upload.middleware';

import { authController } from './auth.controller';
import { 
  registerValidator, 
  verifyOtpValidator, 
  resendOtpValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator
} from './auth.validators';

const router = Router();

// Login-specific rate limiter: tighter than the global auth limiter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMIT',
      message: 'Too many login attempts. Please try again later.',
    },
  },
});

// Public routes
router.post('/register', registerValidator, validate, asyncHandler(authController.register.bind(authController)));
router.post('/verify-otp', verifyOtpValidator, validate, asyncHandler(authController.verifyOTP.bind(authController)));
router.post('/resend-otp', resendOtpValidator, validate, asyncHandler(authController.resendOTP.bind(authController)));
router.post('/forgot-password', forgotPasswordValidator, validate, asyncHandler(authController.forgotPassword.bind(authController)));
router.post('/reset-password', resetPasswordValidator, validate, asyncHandler(authController.resetPassword.bind(authController)));
router.post('/login', loginLimiter, loginValidator, validate, asyncHandler(authController.login.bind(authController)));
router.post('/refresh', asyncHandler(authController.refreshToken.bind(authController))); // Payload is validated inline in controller

// Protected routes
router.get('/me', requireAuth, asyncHandler(authController.getMe.bind(authController)));
router.post('/logout', requireAuth, asyncHandler(authController.logoutGlobal.bind(authController)));
router.post('/upload-student-id', requireAuth, uploadMiddleware.single('photo'), asyncHandler(authController.uploadStudentId.bind(authController)));

export default router;
