import asyncHandler from 'express-async-handler';
import User from '../models/User';
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password');
    res.status(200).json(users);
});
const updateUser = asyncHandler(async (req, res) => {
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
    }
    else {
        res.status(404);
        throw new Error('User not found');
    }
});
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
        if (user.role === 'admin') {
            res.status(400);
            throw new Error('Cannot delete an admin user');
        }
        await User.deleteOne({ _id: user._id });
        res.status(200).json({ message: 'User removed' });
    }
    else {
        res.status(404);
        throw new Error('User not found');
    }
});
export { getUsers, updateUser, deleteUser };
