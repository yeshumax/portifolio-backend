import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import User from '../models/User';
import { setTokens, clearTokens } from '../utils/generateTokens';
import { resetLoginAttempts } from '../middleware/loginAttemptMiddleware';

// @desc    Auth user / set token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      res.status(503);
      throw new Error('Database service unavailable. Please try again later.');
    }

    const user = await User.findOne({ email });

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
      resetLoginAttempts(email);
      
      setTokens(res, user._id.toString());
      res.status(200).json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error: any) {
    // Re-throw the error to be handled by error middleware
    throw error;
  }
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      res.status(503);
      throw new Error('Database service unavailable. Please try again later.');
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    // Check if user needs approval
    let isActive = true; // Default to true for all users
    let isEmailVerified = true; // Default to true for simplicity
    
    // Only require admin approval if there's already an admin and this is a new admin
    if (role === 'admin') {
      const existingAdmin = await User.findOne({ role: 'admin' });
      if (existingAdmin) {
        isActive = false; // New admins need approval from existing admin
        isEmailVerified = false;
      }
      // First admin is automatically approved
    }

    const user = await User.create({
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
          success: false,
          message,
          requiresApproval: true,
          _id: user._id,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
          isEmailVerified: user.isEmailVerified,
        });
        return;
      }

      setTokens(res, user._id.toString());
      res.status(201).json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error: any) {
    throw error;
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  clearTokens(res);
  res.status(200).json({ message: 'User logged out' });
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
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
  } catch (error: any) {
    // Re-throw the error to be handled by error middleware
    throw error;
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req: Request, res: Response) => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      res.status(503);
      throw new Error('Database service unavailable. Please try again later.');
    }

    const user = await User.findById(req.user?._id);

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
  } catch (error: any) {
    // Re-throw the error to be handled by error middleware
    throw error;
  }
});

export { loginUser, registerUser, logoutUser, getUserProfile, updateUserProfile };
