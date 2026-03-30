import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import User from '../models/User';
import crypto from 'crypto';
const passwordResetTokens = new Map();
const generateResetToken = () => {
    return crypto.randomBytes(32).toString('hex');
};
const storeResetToken = (email, token) => {
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // Token expires in 1 hour
    passwordResetTokens.set(email.toLowerCase(), {
        token,
        expires
    });
};
const validateResetToken = (email, token) => {
    const storedData = passwordResetTokens.get(email.toLowerCase());
    if (!storedData) {
        return false;
    }
    if (storedData.token !== token) {
        return false;
    }
    if (storedData.expires < new Date()) {
        passwordResetTokens.delete(email.toLowerCase());
        return false;
    }
    return true;
};
const clearResetToken = (email) => {
    passwordResetTokens.delete(email.toLowerCase());
};
// Clean up expired tokens every hour
setInterval(() => {
    const now = new Date();
    for (const [email, data] of passwordResetTokens.entries()) {
        if (data.expires < now) {
            passwordResetTokens.delete(email);
        }
    }
}, 60 * 60 * 1000);
// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
const requestPasswordReset = asyncHandler(async (req, res) => {
    const { email } = req.body;
    try {
        // Check if database is connected
        if (mongoose.connection.readyState !== 1) {
            res.status(503);
            throw new Error('Database service unavailable. Please try again later.');
        }
        if (!email) {
            res.status(400);
            throw new Error('Email is required');
        }
        const user = await User.findOne({ email });
        // Always return success to prevent email enumeration attacks
        if (!user) {
            res.status(200).json({
                success: true,
                message: 'If an account with that email exists, a password reset link has been sent.'
            });
            return;
        }
        // Generate reset token
        const resetToken = generateResetToken();
        storeResetToken(email, resetToken);
        // In a real application, you would send an email here
        // For now, we'll return the token in development mode
        const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&email=${email}`;
        if (process.env.NODE_ENV === 'development') {
            console.log(`Password reset link for ${email}: ${resetUrl}`);
            res.status(200).json({
                success: true,
                message: 'Password reset link generated (development mode)',
                resetToken,
                resetUrl
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'If an account with that email exists, a password reset link has been sent.'
        });
    }
    catch (error) {
        throw error;
    }
});
// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
    const { email, token, newPassword } = req.body;
    try {
        // Check if database is connected
        if (mongoose.connection.readyState !== 1) {
            res.status(503);
            throw new Error('Database service unavailable. Please try again later.');
        }
        if (!email || !token || !newPassword) {
            res.status(400);
            throw new Error('Email, token, and new password are required');
        }
        // Validate reset token
        if (!validateResetToken(email, token)) {
            res.status(400);
            throw new Error('Invalid or expired reset token');
        }
        const user = await User.findOne({ email });
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }
        // Validate new password
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            res.status(400);
            throw new Error(passwordValidation.errors.join(', '));
        }
        // Update password
        user.password = newPassword;
        await user.save();
        // Clear the reset token
        clearResetToken(email);
        res.status(200).json({
            success: true,
            message: 'Password has been reset successfully'
        });
    }
    catch (error) {
        throw error;
    }
});
// @desc    Verify reset token
// @route   POST /api/auth/verify-reset-token
// @access  Public
const verifyResetToken = asyncHandler(async (req, res) => {
    const { email, token } = req.body;
    try {
        if (!email || !token) {
            res.status(400);
            throw new Error('Email and token are required');
        }
        const isValid = validateResetToken(email, token);
        res.status(200).json({
            success: true,
            isValid
        });
    }
    catch (error) {
        throw error;
    }
});
const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    if (password.length > 100) {
        errors.push('Password must be less than 100 characters long');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }
    return {
        isValid: errors.length === 0,
        errors
    };
};
export { requestPasswordReset, resetPassword, verifyResetToken };
