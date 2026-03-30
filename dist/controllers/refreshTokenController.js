"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../models/User"));
const generateTokens_1 = require("../utils/generateTokens");
// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public
const refreshToken = (0, express_async_handler_1.default)(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken || req.headers.authorization?.split(' ')[1];
    if (!refreshToken) {
        res.status(401);
        throw new Error('Refresh token not provided');
    }
    try {
        // Check if database is connected
        if (mongoose_1.default.connection.readyState !== 1) {
            res.status(503);
            throw new Error('Database service unavailable. Please try again later.');
        }
        // Verify refresh token
        const decoded = (0, generateTokens_1.verifyRefreshToken)(refreshToken);
        if (decoded.type !== 'refresh') {
            (0, generateTokens_1.clearTokens)(res);
            res.status(401);
            throw new Error('Invalid token type');
        }
        // Find user
        const user = await User_1.default.findById(decoded.userId).select('-password');
        if (!user) {
            (0, generateTokens_1.clearTokens)(res);
            res.status(401);
            throw new Error('User not found');
        }
        if (user.isBlocked) {
            (0, generateTokens_1.clearTokens)(res);
            res.status(401);
            throw new Error('User is blocked');
        }
        if (!user.isActive) {
            (0, generateTokens_1.clearTokens)(res);
            res.status(401);
            throw new Error('User account is not active');
        }
        // Generate new tokens
        const tokens = (0, generateTokens_1.setTokens)(res, user._id.toString());
        res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            accessToken: tokens.accessToken,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage,
                isActive: user.isActive,
            }
        });
    }
    catch (error) {
        (0, generateTokens_1.clearTokens)(res);
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            res.status(401);
            throw new Error('Invalid or expired refresh token');
        }
        throw error;
    }
});
exports.refreshToken = refreshToken;
