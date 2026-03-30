import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import User from '../models/User';
import fs from 'fs';
import path from 'path';
// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    try {
        // Check if database is connected
        if (mongoose.connection.readyState !== 1) {
            res.status(503);
            throw new Error('Database service unavailable. Please try again later.');
        }
        if (!req.user) {
            res.status(401);
            throw new Error('Not authorized');
        }
        const user = await User.findById(req.user._id).select('-password');
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
// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    try {
        // Check if database is connected
        if (mongoose.connection.readyState !== 1) {
            res.status(503);
            throw new Error('Database service unavailable. Please try again later.');
        }
        if (!req.user) {
            res.status(401);
            throw new Error('Not authorized');
        }
        const user = await User.findById(req.user._id);
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
            const existingUser = await User.findOne({ email });
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
// @desc    Upload profile image
// @route   POST /api/profile/upload-image
// @access  Private
const uploadProfileImage = asyncHandler(async (req, res) => {
    try {
        if (!req.user) {
            res.status(401);
            throw new Error('Not authorized');
        }
        if (!req.file) {
            res.status(400);
            throw new Error('No image file provided');
        }
        const user = await User.findById(req.user._id);
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }
        // Delete old profile image if exists
        if (user.profileImage) {
            const oldImagePath = path.join(__dirname, '../../uploads', user.profileImage);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
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
// @desc    Delete user account
// @route   DELETE /api/profile
// @access  Private
const deleteAccount = asyncHandler(async (req, res) => {
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
        const user = await User.findById(req.user._id);
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
            const imagePath = path.join(__dirname, '../../uploads', user.profileImage);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        await User.findByIdAndDelete(req.user._id);
        res.status(200).json({
            success: true,
            message: 'Account deleted successfully'
        });
    }
    catch (error) {
        throw error;
    }
});
export { getUserProfile, updateUserProfile, uploadProfileImage, deleteAccount };
