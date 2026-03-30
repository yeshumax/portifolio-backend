import express from 'express';
import { loginUser, registerUser, logoutUser, getUserProfile, updateUserProfile, } from '../controllers/authController';
import { requestPasswordReset, resetPassword, verifyResetToken } from '../controllers/passwordResetController';
import { refreshToken } from '../controllers/refreshTokenController';
import { sendEmailVerification, verifyEmail, resendEmailVerification } from '../controllers/emailVerificationController';
import { protect } from '../middleware/authMiddleware';
import { validateLogin, validateRegister, validateUpdateProfile } from '../middleware/validationMiddleware';
import { validateForgotPassword, validateResetPassword, validateVerifyResetToken } from '../middleware/passwordResetValidation';
import { validateVerifyEmail, validateResendVerification } from '../middleware/emailVerificationValidation';
import { authRateLimit, registerRateLimit } from '../middleware/rateLimitMiddleware';
import { trackLoginAttempt } from '../middleware/loginAttemptMiddleware';
const router = express.Router();
router.post('/register', registerRateLimit, validateRegister, registerUser);
router.post('/login', authRateLimit, trackLoginAttempt, validateLogin, loginUser);
router.post('/logout', logoutUser);
router.post('/refresh-token', refreshToken);
router.post('/send-verification', protect, sendEmailVerification);
router.post('/verify-email', validateVerifyEmail, verifyEmail);
router.post('/resend-verification', authRateLimit, validateResendVerification, resendEmailVerification);
router.post('/forgot-password', authRateLimit, validateForgotPassword, requestPasswordReset);
router.post('/reset-password', authRateLimit, validateResetPassword, resetPassword);
router.post('/verify-reset-token', validateVerifyResetToken, verifyResetToken);
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, validateUpdateProfile, updateUserProfile);
export default router;
