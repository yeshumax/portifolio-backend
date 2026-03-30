"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendEmailVerification = exports.verifyEmail = exports.sendEmailVerification = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../models/User"));
const crypto_1 = __importDefault(require("crypto"));
const emailVerificationTokens = new Map();
const generateVerificationToken = () => {
    return crypto_1.default.randomBytes(32).toString('hex');
};
const storeVerificationToken = (email, token) => {
    const expires = new Date();
    expires.setHours(expires.getHours() + 24); // Token expires in 24 hours
    emailVerificationTokens.set(email.toLowerCase(), {
        token,
        expires
    });
};
const validateVerificationToken = (email, token) => {
    const storedData = emailVerificationTokens.get(email.toLowerCase());
    if (!storedData) {
        return false;
    }
    if (storedData.token !== token) {
        return false;
    }
    if (storedData.expires < new Date()) {
        emailVerificationTokens.delete(email.toLowerCase());
        return false;
    }
    return true;
};
const clearVerificationToken = (email) => {
    emailVerificationTokens.delete(email.toLowerCase());
};
// Clean up expired tokens every hour
setInterval(() => {
    const now = new Date();
    for (const [email, data] of emailVerificationTokens.entries()) {
        if (data.expires < now) {
            emailVerificationTokens.delete(email);
        }
    }
}, 60 * 60 * 1000);
// @desc    Send email verification
// @route   POST /api/auth/send-verification
// @access  Private
const sendEmailVerification = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        // Check if database is connected
        if (mongoose_1.default.connection.readyState !== 1) {
            res.status(503);
            throw new Error('Database service unavailable. Please try again later.');
        }
        if (!req.user) {
            res.status(401);
            throw new Error('Not authorized');
        }
        const user = await User_1.default.findById(req.user._id);
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }
        if (user.isActive) {
            res.status(400).json({
                success: false,
                message: 'Account is already verified'
            });
            return;
        }
        // Generate verification token
        const verificationToken = generateVerificationToken();
        storeVerificationToken(user.email, verificationToken);
        // In a real application, you would send an email here
        // For now, we'll return the token in development mode
        const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}&email=${user.email}`;
        if (process.env.NODE_ENV === 'development') {
            console.log(`Email verification link for ${user.email}: ${verificationUrl}`);
            res.status(200).json({
                success: true,
                message: 'Verification email sent (development mode)',
                verificationToken,
                verificationUrl
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Verification email sent'
        });
    }
    catch (error) {
        throw error;
    }
});
exports.sendEmailVerification = sendEmailVerification;
// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = (0, express_async_handler_1.default)(async (req, res) => {
    const { email, token } = req.body;
    try {
        // Check if database is connected
        if (mongoose_1.default.connection.readyState !== 1) {
            res.status(503);
            throw new Error('Database service unavailable. Please try again later.');
        }
        if (!email || !token) {
            res.status(400);
            throw new Error('Email and verification token are required');
        }
        // Validate verification token
        if (!validateVerificationToken(email, token)) {
            res.status(400);
            throw new Error('Invalid or expired verification token');
        }
        const user = await User_1.default.findOne({ email });
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }
        if (user.isActive) {
            res.status(400).json({
                success: false,
                message: 'Account is already verified'
            });
            return;
        }
        // Activate user account
        user.isActive = true;
        await user.save();
        // Clear the verification token
        clearVerificationToken(email);
        res.status(200).json({
            success: true,
            message: 'Email verified successfully. You can now login to your account.'
        });
    }
    catch (error) {
        throw error;
    }
});
exports.verifyEmail = verifyEmail;
// @desc    Resend email verification
// @route   POST /api/auth/resend-verification
// @access  Public
const resendEmailVerification = (0, express_async_handler_1.default)(async (req, res) => {
    const { email } = req.body;
    try {
        // Check if database is connected
        if (mongoose_1.default.connection.readyState !== 1) {
            res.status(503);
            throw new Error('Database service unavailable. Please try again later.');
        }
        if (!email) {
            res.status(400);
            throw new Error('Email is required');
        }
        const user = await User_1.default.findOne({ email });
        if (!user) {
            // Always return success to prevent email enumeration attacks
            res.status(200).json({
                success: true,
                message: 'If an account with that email exists, a verification email has been sent.'
            });
            return;
        }
        if (user.isActive) {
            res.status(400).json({
                success: false,
                message: 'Account is already verified'
            });
            return;
        }
        // Generate verification token
        const verificationToken = generateVerificationToken();
        storeVerificationToken(email, verificationToken);
        // In a real application, you would send an email here
        const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}&email=${email}`;
        if (process.env.NODE_ENV === 'development') {
            console.log(`Email verification link for ${email}: ${verificationUrl}`);
            res.status(200).json({
                success: true,
                message: 'Verification email sent (development mode)',
                verificationToken,
                verificationUrl
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'If an account with that email exists, a verification email has been sent.'
        });
    }
    catch (error) {
        throw error;
    }
});
exports.resendEmailVerification = resendEmailVerification;
