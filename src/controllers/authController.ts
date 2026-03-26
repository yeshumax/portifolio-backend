import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User';
import generateToken from '../utils/generateToken';

// @desc    Auth user / set token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

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
    generateToken(res, user._id.toString());
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      isActive: user.isActive,
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  let isActive = req.body.isActive !== undefined ? req.body.isActive : true;
  if (role === 'admin' && req.body.isActive === undefined) {
    const existingAdmin = await User.findOne({ role: 'admin', isActive: true });
    if (existingAdmin) {
      isActive = false; // requires approval for public registration
    }
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role === 'admin' ? 'admin' : 'user',
    isActive,
  });

  if (user) {
    if (!user.isActive) {
      res.status(201).json({
        message: 'Admin account created successfully. Please wait for an existing admin to approve your request.',
        _id: user._id,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
      });
      return;
    }

    generateToken(res, user._id.toString());
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      isActive: user.isActive,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'User logged out' });
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const user = {
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    profileImage: req.user.profileImage,
  };

  res.status(200).json(user);
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user._id);

  if (user) {
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
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

export { loginUser, registerUser, logoutUser, getUserProfile, updateUserProfile };
