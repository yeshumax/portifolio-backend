"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentAdmin = exports.getAllUsersForAdmin = exports.getPendingAdmins = exports.approveAdmin = exports.deleteUser = exports.updateUser = exports.getUsers = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const User_1 = __importDefault(require("../models/User"));
const getUsers = (0, express_async_handler_1.default)(async (req, res) => {
    const users = await User_1.default.find({}).select('-password');
    res.status(200).json(users);
});
exports.getUsers = getUsers;
const updateUser = (0, express_async_handler_1.default)(async (req, res) => {
    const user = await User_1.default.findById(req.params.id);
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
    }
    else {
        res.status(404);
        throw new Error('User not found');
    }
});
exports.updateUser = updateUser;
const deleteUser = (0, express_async_handler_1.default)(async (req, res) => {
    const user = await User_1.default.findById(req.params.id);
    if (user) {
        if (user.role === 'admin') {
            res.status(400);
            throw new Error('Cannot delete an admin user');
        }
        await User_1.default.deleteOne({ _id: user._id });
        res.status(200).json({ message: 'User removed' });
    }
    else {
        res.status(404);
        throw new Error('User not found');
    }
});
exports.deleteUser = deleteUser;
const approveAdmin = (0, express_async_handler_1.default)(async (req, res) => {
    const user = await User_1.default.findById(req.params.id);
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
exports.approveAdmin = approveAdmin;
const getPendingAdmins = (0, express_async_handler_1.default)(async (req, res) => {
    const pendingAdmins = await User_1.default.find({
        role: 'admin',
        isActive: false
    }).select('-password');
    res.status(200).json(pendingAdmins);
});
exports.getPendingAdmins = getPendingAdmins;
const getAllUsersForAdmin = (0, express_async_handler_1.default)(async (req, res) => {
    const users = await User_1.default.find({}).select('-password');
    res.status(200).json(users);
});
exports.getAllUsersForAdmin = getAllUsersForAdmin;
const getCurrentAdmin = (0, express_async_handler_1.default)(async (req, res) => {
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
exports.getCurrentAdmin = getCurrentAdmin;
