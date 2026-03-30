import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import User from '../models/User';
import { verifyRefreshToken, setTokens, clearTokens } from '../utils/generateTokens';

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public
const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken || req.headers.authorization?.split(' ')[1];

  if (!refreshToken) {
    res.status(401);
    throw new Error('Refresh token not provided');
  }

  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      res.status(503);
      throw new Error('Database service unavailable. Please try again later.');
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    if (decoded.type !== 'refresh') {
      clearTokens(res);
      res.status(401);
      throw new Error('Invalid token type');
    }

    // Find user
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      clearTokens(res);
      res.status(401);
      throw new Error('User not found');
    }

    if (user.isBlocked) {
      clearTokens(res);
      res.status(401);
      throw new Error('User is blocked');
    }

    if (!user.isActive) {
      clearTokens(res);
      res.status(401);
      throw new Error('User account is not active');
    }

    // Generate new tokens
    const tokens = setTokens(res, user._id.toString());

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
  } catch (error: any) {
    clearTokens(res);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      res.status(401);
      throw new Error('Invalid or expired refresh token');
    }
    
    throw error;
  }
});

export { refreshToken };
