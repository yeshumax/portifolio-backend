"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnreadMessages = exports.markAsRead = exports.getUnhandledCount = exports.respondToMessage = exports.getMyMessages = exports.getMessages = exports.createMessage = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Message_1 = __importDefault(require("../models/Message"));
// @desc    Create a new message (public - accessible without authentication)
// @route   POST /api/messages
// @access  Public
exports.createMessage = (0, express_async_handler_1.default)(async (req, res) => {
    const { message, type, name, email } = req.body;
    // Validate required fields
    if (!message || !type) {
        res.status(400);
        throw new Error('Please provide message and type');
    }
    // Create message data
    const messageData = {
        message,
        type,
        status: 'pending',
        read: false,
        isReadByAdmin: false,
        isReadByUser: true,
    };
    // If user is authenticated, attach userId
    if (req.user) {
        messageData.userId = req.user._id;
        messageData.name = req.user.name;
        messageData.email = req.user.email;
    }
    // If not authenticated, require name and email
    else {
        if (!name || !email) {
            res.status(400);
            throw new Error('Please provide your name and email address');
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400);
            throw new Error('Please provide a valid email address');
        }
        messageData.name = name;
        messageData.email = email;
    }
    const newMessage = await Message_1.default.create(messageData);
    res.status(201).json({
        message: 'Message sent successfully',
        data: {
            _id: newMessage._id,
            type: newMessage.type,
            status: newMessage.status,
            createdAt: newMessage.createdAt,
        },
    });
});
// @desc    Get all messages (admin only)
// @route   GET /api/messages
// @access  Private/Admin
exports.getMessages = (0, express_async_handler_1.default)(async (req, res) => {
    const messages = await Message_1.default.find({})
        .populate('userId', 'name email')
        .sort({ createdAt: -1 });
    res.status(200).json(messages);
});
// @desc    Get messages for authenticated user
// @route   GET /api/messages/my-messages
// @access  Private
exports.getMyMessages = (0, express_async_handler_1.default)(async (req, res) => {
    if (!req.user) {
        res.status(401);
        throw new Error('Not authorized');
    }
    const messages = await Message_1.default.find({ userId: req.user._id })
        .sort({ createdAt: -1 });
    res.status(200).json(messages);
});
// @desc    Respond to a message (admin only)
// @route   PUT /api/messages/:id/respond
// @access  Private/Admin
exports.respondToMessage = (0, express_async_handler_1.default)(async (req, res) => {
    const { adminResponse, status } = req.body;
    const message = await Message_1.default.findById(req.params.id);
    if (!message) {
        res.status(404);
        throw new Error('Message not found');
    }
    if (adminResponse !== undefined) {
        message.adminResponse = adminResponse;
    }
    if (status) {
        message.status = status;
    }
    message.isReadByUser = false; // Mark unread for user when admin responds
    message.isReadByAdmin = true; // Admin has read it if they are responding
    const updatedMessage = await message.save();
    res.status(200).json(updatedMessage);
});
// @desc    Get unhandled messages count (admin only)
// @route   GET /api/messages/unhandled-count
// @access  Private/Admin
exports.getUnhandledCount = (0, express_async_handler_1.default)(async (req, res) => {
    const count = await Message_1.default.countDocuments({
        status: { $in: ['pending', 'in-progress'] },
    });
    res.status(200).json({ count });
});
// @desc    Mark message as read
// @route   PUT /api/messages/:id/mark-as-read
// @access  Private
exports.markAsRead = (0, express_async_handler_1.default)(async (req, res) => {
    const message = await Message_1.default.findById(req.params.id);
    if (!message) {
        res.status(404);
        throw new Error('Message not found');
    }
    if (req.user?.role === 'admin') {
        message.isReadByAdmin = true;
    }
    else {
        // Check if user owns this message
        if (message.userId?.toString() !== req.user?._id?.toString()) {
            res.status(403);
            throw new Error('Not authorized');
        }
        message.isReadByUser = true;
    }
    await message.save();
    res.status(200).json({ message: 'Marked as read' });
});
// @desc    Get unread messages
// @route   GET /api/messages/unread
// @access  Private
exports.getUnreadMessages = (0, express_async_handler_1.default)(async (req, res) => {
    if (!req.user) {
        res.status(401);
        throw new Error('Not authorized');
    }
    let query = {};
    if (req.user.role === 'admin') {
        query = { isReadByAdmin: false };
    }
    else {
        query = { userId: req.user._id, isReadByUser: false };
    }
    const messages = await Message_1.default.find(query)
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('userId', 'name profileImage');
    res.status(200).json(messages);
});
