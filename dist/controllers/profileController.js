"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAccount = exports.uploadProfileImage = exports.updateUserProfile = exports.getUserProfile = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../models/User"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// @desc    Get user profile
// @route   GET /api/profile
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
        const user = await User_1.default.findById(req.user._id).select('-password');
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }
        res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage,
                isActive: user.isActive,
                isEmailVerified: user.isEmailVerified,
                lastLoginAt: user.lastLoginAt,
                createdAt: user.get('createdAt'),
                updatedAt: user.get('updatedAt'),
            }
        });
    }
    catch (error) {
        throw error;
    }
});
exports.getUserProfile = getUserProfile;
// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
const updateUserProfile = (0, express_async_handler_1.default)(async (req, res) => {
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
        const { name, email, currentPassword, newPassword, confirmNewPassword } = req.body;
        // Update name
        if (name !== undefined) {
            if (!name || name.trim().length < 3) {
                res.status(400);
                throw new Error('Name must be at least 3 characters long');
            }
            if (name.trim().length > 50) {
                res.status(400);
                throw new Error('Name must be less than 50 characters long');
            }
            if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
                res.status(400);
                throw new Error('Name can only contain letters and spaces');
            }
            user.name = name.trim();
        }
        // Update email (requires verification)
        if (email !== undefined && email !== user.email) {
            if (!email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
                res.status(400);
                throw new Error('Please enter a valid email address');
            }
            if (email.length > 100) {
                res.status(400);
                throw new Error('Email must be less than 100 characters');
            }
            const existingUser = await User_1.default.findOne({ email });
            if (existingUser) {
                res.status(400);
                throw new Error('Email is already in use');
            }
            user.email = email;
            user.isEmailVerified = false; // Reset email verification when email changes
        }
        // Update password
        if (newPassword) {
            if (!currentPassword) {
                res.status(400);
                throw new Error('Current password is required to change password');
            }
            if (!(await user.matchPassword(currentPassword))) {
                res.status(400);
                throw new Error('Current password is incorrect');
            }
            if (newPassword !== confirmNewPassword) {
                res.status(400);
                throw new Error('New passwords do not match');
            }
            // Validate new password strength
            if (newPassword.length < 8) {
                res.status(400);
                throw new Error('Password must be at least 8 characters long');
            }
            if (newPassword.length > 100) {
                res.status(400);
                throw new Error('Password must be less than 100 characters long');
            }
            if (!/[A-Z]/.test(newPassword)) {
                res.status(400);
                throw new Error('Password must contain at least one uppercase letter');
            }
            if (!/[a-z]/.test(newPassword)) {
                res.status(400);
                throw new Error('Password must contain at least one lowercase letter');
            }
            if (!/\d/.test(newPassword)) {
                res.status(400);
                throw new Error('Password must contain at least one number');
            }
            if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword)) {
                res.status(400);
                throw new Error('Password must contain at least one special character');
            }
            user.password = newPassword;
        }
        const updatedUser = await user.save();
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                profileImage: updatedUser.profileImage,
                isActive: updatedUser.isActive,
                isEmailVerified: updatedUser.isEmailVerified,
                lastLoginAt: updatedUser.lastLoginAt,
                updatedAt: updatedUser.get('updatedAt'),
            }
        });
    }
    catch (error) {
        throw error;
    }
});
exports.updateUserProfile = updateUserProfile;
// @desc    Upload profile image
// @route   POST /api/profile/upload-image
// @access  Private
const uploadProfileImage = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        if (!req.user) {
            res.status(401);
            throw new Error('Not authorized');
        }
        if (!req.file) {
            res.status(400);
            throw new Error('No image file provided');
        }
        const user = await User_1.default.findById(req.user._id);
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }
        // Delete old profile image if exists
        if (user.profileImage) {
            const oldImagePath = path_1.default.join(__dirname, '../../uploads', user.profileImage);
            if (fs_1.default.existsSync(oldImagePath)) {
                fs_1.default.unlinkSync(oldImagePath);
            }
        }
        // Update user with new image filename
        user.profileImage = req.file.filename;
        await user.save();
        res.status(200).json({
            success: true,
            message: 'Profile image uploaded successfully',
            profileImage: req.file.filename
        });
    }
    catch (error) {
        throw error;
    }
});
exports.uploadProfileImage = uploadProfileImage;
// @desc    Delete user account
// @route   DELETE /api/profile
// @access  Private
const deleteAccount = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        if (!req.user) {
            res.status(401);
            throw new Error('Not authorized');
        }
        const { password, confirmation } = req.body;
        if (!password) {
            res.status(400);
            throw new Error('Password is required to delete account');
        }
        if (confirmation !== 'DELETE') {
            res.status(400);
            throw new Error('Please type DELETE to confirm account deletion');
        }
        const user = await User_1.default.findById(req.user._id);
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }
        if (!(await user.matchPassword(password))) {
            res.status(400);
            throw new Error('Password is incorrect');
        }
        // Delete profile image if exists
        if (user.profileImage) {
            const imagePath = path_1.default.join(__dirname, '../../uploads', user.profileImage);
            if (fs_1.default.existsSync(imagePath)) {
                fs_1.default.unlinkSync(imagePath);
            }
        }
        await User_1.default.findByIdAndDelete(req.user._id);
        res.status(200).json({
            success: true,
            message: 'Account deleted successfully'
        });
    }
    catch (error) {
        throw error;
    }
});
exports.deleteAccount = deleteAccount;
