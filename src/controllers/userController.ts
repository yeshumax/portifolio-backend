import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User';

const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await User.find({}).select('-password');
  res.status(200).json(users);
});

const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    if (req.body.password) {
      user.password = req.body.password;
    }
    if (req.body.isBlocked !== undefined) {
      user.isBlocked = req.body.isBlocked;
    }
    if (req.body.isActive !== undefined) {
      user.isActive = req.body.isActive;
    }
    const updatedUser = await user.save();
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      isBlocked: updatedUser.isBlocked,
      isActive: updatedUser.isActive,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (user.role === 'admin') {
      res.status(400);
      throw new Error('Cannot delete an admin user');
    }
    await User.deleteOne({ _id: user._id });
    res.status(200).json({ message: 'User removed' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

const approveAdmin = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.role !== 'admin') {
    res.status(400);
    throw new Error('User is not an admin');
  }

  if (user.isActive) {
    res.status(400);
    throw new Error('Admin is already active');
  }

  user.isActive = true;
  user.isEmailVerified = true;
  
  const updatedUser = await user.save();
  
  res.status(200).json({
    message: 'Admin approved successfully',
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    isActive: updatedUser.isActive,
    isEmailVerified: updatedUser.isEmailVerified,
  });
});

const getPendingAdmins = asyncHandler(async (req: Request, res: Response) => {
  const pendingAdmins = await User.find({ 
    role: 'admin', 
    isActive: false 
  }).select('-password');
  
  res.status(200).json(pendingAdmins);
});

const getAllUsersForAdmin = asyncHandler(async (req: Request, res: Response) => {
  const users = await User.find({}).select('-password');
  res.status(200).json(users);
});

const getCurrentAdmin = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  if (req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized as admin');
  }

  res.status(200).json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    profileImage: req.user.profileImage,
    isActive: req.user.isActive,
    isEmailVerified: req.user.isEmailVerified,
  });
});

export { getUsers, updateUser, deleteUser, approveAdmin, getPendingAdmins, getAllUsersForAdmin, getCurrentAdmin };
