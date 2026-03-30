"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserProfile = exports.getUserProfile = exports.logoutUser = exports.registerUser = exports.loginUser = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../models/User"));
const generateTokens_1 = require("../utils/generateTokens");
const loginAttemptMiddleware_1 = require("../middleware/loginAttemptMiddleware");
// @desc    Auth user / set token
// @route   POST /api/auth/login
// @access  Public
const loginUser = (0, express_async_handler_1.default)(async (req, res) => {
    const { email, password } = req.body;
    try {
        // Check if database is connected
        if (mongoose_1.default.connection.readyState !== 1) {
            res.status(503);
            throw new Error('Database service unavailable. Please try again later.');
        }
        const user = await User_1.default.findOne({ email });
        if (user && (await user.matchPassword(password))) {
            if (user.isBlocked) {
                res.status(403);
                throw new Error('Your account is blocked.');
            }
            if (!user.isActive) {
                res.status(403);
                throw new Error('Your account is pending admin approval.');
            }
            if (!user.isEmailVerified) {
                res.status(403);
                throw new Error('Please verify your email address before logging in.');
            }
            // Update last login
            user.lastLoginAt = new Date();
            await user.save();
            // Reset login attempts on successful login
            (0, loginAttemptMiddleware_1.resetLoginAttempts)(email);
            (0, generateTokens_1.setTokens)(res, user._id.toString());
            res.status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage,
                isActive: user.isActive,
                isEmailVerified: user.isEmailVerified,
            });
        }
        else {
            res.status(401);
            throw new Error('Invalid email or password');
        }
    }
    catch (error) {
        // Re-throw the error to be handled by error middleware
        throw error;
    }
});
exports.loginUser = loginUser;
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = (0, express_async_handler_1.default)(async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        // Check if database is connected
        if (mongoose_1.default.connection.readyState !== 1) {
            res.status(503);
            throw new Error('Database service unavailable. Please try again later.');
        }
        const userExists = await User_1.default.findOne({ email });
        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }
        let isActive = false; // Default to false for email verification
        let isEmailVerified = false; // Default to false for email verification
        if (role === 'admin') {
            const existingAdmin = await User_1.default.findOne({ role: 'admin' });
            if (!existingAdmin) {
                isActive = true; // First admin can be active without verification
                isEmailVerified = true; // First admin doesn't need email verification
            }
        }
        else {
            // Regular users don't need admin approval
            isActive = true;
            isEmailVerified = true; // Skip email verification for simplicity
        }
        const user = await User_1.default.create({
            name,
            email,
            password,
            role: role === 'admin' ? 'admin' : 'user',
            isActive,
            isEmailVerified,
        });
        if (user) {
            if (!user.isActive) {
                const message = role === 'admin'
                    ? 'Admin account created successfully. Please wait for an existing admin to approve your request.'
                    : 'Account created successfully. Please check your email to verify your account.';
                res.status(201).json({
                    message,
                    _id: user._id,
                    name: user.name,
                    role: user.role,
                    isActive: user.isActive,
                    isEmailVerified: user.isEmailVerified,
                });
                return;
            }
            (0, generateTokens_1.setTokens)(res, user._id.toString());
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage,
                isActive: user.isActive,
                isEmailVerified: user.isEmailVerified,
            });
        }
        else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    }
    catch (error) {
        // Re-throw the error to be handled by error middleware
        throw error;
    }
});
exports.registerUser = registerUser;
// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = (0, express_async_handler_1.default)(async (req, res) => {
    (0, generateTokens_1.clearTokens)(res);
    res.status(200).json({ message: 'User logged out' });
});
exports.logoutUser = logoutUser;
// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = (0, express_async_handler_1.default)(async (req, res) => {
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
        const userProfile = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profileImage: user.profileImage,
            isActive: user.isActive,
            lastLoginAt: user.lastLoginAt,
        };
        res.status(200).json(userProfile);
    }
    catch (error) {
        // Re-throw the error to be handled by error middleware
        throw error;
    }
});
exports.getUserProfile = getUserProfile;
// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        // Check if database is connected
        if (mongoose_1.default.connection.readyState !== 1) {
            res.status(503);
            throw new Error('Database service unavailable. Please try again later.');
        }
        const user = await User_1.default.findById(req.user?._id);
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        if (req.body.profileImage !== undefined) {
            user.profileImage = req.body.profileImage;
        }
        if (req.body.password) {
            user.password = req.body.password;
        }
        const updatedUser = await user.save();
        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            profileImage: updatedUser.profileImage,
            isActive: updatedUser.isActive,
            lastLoginAt: updatedUser.lastLoginAt,
        });
    }
    catch (error) {
        // Re-throw the error to be handled by error middleware
        throw error;
    }
});
exports.updateUserProfile = updateUserProfile;
