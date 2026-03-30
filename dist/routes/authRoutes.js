"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const passwordResetController_1 = require("../controllers/passwordResetController");
const refreshTokenController_1 = require("../controllers/refreshTokenController");
const emailVerificationController_1 = require("../controllers/emailVerificationController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const validationMiddleware_1 = require("../middleware/validationMiddleware");
const passwordResetValidation_1 = require("../middleware/passwordResetValidation");
const emailVerificationValidation_1 = require("../middleware/emailVerificationValidation");
const rateLimitMiddleware_1 = require("../middleware/rateLimitMiddleware");
const loginAttemptMiddleware_1 = require("../middleware/loginAttemptMiddleware");
const router = express_1.default.Router();
router.post('/register', rateLimitMiddleware_1.registerRateLimit, validationMiddleware_1.validateRegister, authController_1.registerUser);
router.post('/login', rateLimitMiddleware_1.authRateLimit, loginAttemptMiddleware_1.trackLoginAttempt, validationMiddleware_1.validateLogin, authController_1.loginUser);
router.post('/logout', authController_1.logoutUser);
router.post('/refresh-token', refreshTokenController_1.refreshToken);
router.post('/send-verification', authMiddleware_1.protect, emailVerificationController_1.sendEmailVerification);
router.post('/verify-email', emailVerificationValidation_1.validateVerifyEmail, emailVerificationController_1.verifyEmail);
router.post('/resend-verification', rateLimitMiddleware_1.authRateLimit, emailVerificationValidation_1.validateResendVerification, emailVerificationController_1.resendEmailVerification);
router.post('/forgot-password', rateLimitMiddleware_1.authRateLimit, passwordResetValidation_1.validateForgotPassword, passwordResetController_1.requestPasswordReset);
router.post('/reset-password', rateLimitMiddleware_1.authRateLimit, passwordResetValidation_1.validateResetPassword, passwordResetController_1.resetPassword);
router.post('/verify-reset-token', passwordResetValidation_1.validateVerifyResetToken, passwordResetController_1.verifyResetToken);
router.route('/profile')
    .get(authMiddleware_1.protect, authController_1.getUserProfile)
    .put(authMiddleware_1.protect, validationMiddleware_1.validateUpdateProfile, authController_1.updateUserProfile);
exports.default = router;
