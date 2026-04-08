"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdminResponseNotification = exports.createMessageNotification = exports.createNotification = exports.clearAllNotifications = exports.deleteNotification = exports.markAllAsRead = exports.markAsRead = exports.getUnreadCount = exports.getNotifications = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const mongoose_1 = __importDefault(require("mongoose"));
const Notification_1 = __importDefault(require("../models/Notification"));
const Message_1 = __importDefault(require("../models/Message"));
const User_1 = __importDefault(require("../models/User"));
// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        // Check if database is connected
        if (mongoose_1.default.connection.readyState !== 1) {
            res.status(503);
            throw new Error('Database service unavailable. Please try again later.');
        }
        const notifications = await Notification_1.default.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50);
        res.status(200).json(notifications);
    }
    catch (error) {
        res.status(500);
        throw new Error('Failed to fetch notifications');
    }
});
// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
exports.getUnreadCount = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        // Check if database is connected
        if (mongoose_1.default.connection.readyState !== 1) {
            res.status(503);
            throw new Error('Database service unavailable. Please try again later.');
        }
        const unreadCount = await Notification_1.default.countDocuments({
            userId: req.user._id,
            read: false,
        });
        res.status(200).json({ unreadCount });
    }
    catch (error) {
        res.status(500);
        throw new Error('Failed to fetch unread count');
    }
});
// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        // Check if database is connected
        if (mongoose_1.default.connection.readyState !== 1) {
            res.status(503);
            throw new Error('Database service unavailable. Please try again later.');
        }
        const notification = await Notification_1.default.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { read: true }, { new: true });
        if (!notification) {
            res.status(404);
            throw new Error('Notification not found');
        }
        res.status(200).json(notification);
    }
    catch (error) {
        if (error.message === 'Notification not found') {
            res.status(404);
            throw error;
        }
        res.status(500);
        throw new Error('Failed to mark notification as read');
    }
});
// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
exports.markAllAsRead = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        // Check if database is connected
        if (mongoose_1.default.connection.readyState !== 1) {
            res.status(503);
            throw new Error('Database service unavailable. Please try again later.');
        }
        await Notification_1.default.updateMany({ userId: req.user._id, read: false }, { read: true });
        res.status(200).json({ message: 'All notifications marked as read' });
    }
    catch (error) {
        res.status(500);
        throw new Error('Failed to mark all notifications as read');
    }
});
// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        // Check if database is connected
        if (mongoose_1.default.connection.readyState !== 1) {
            res.status(503);
            throw new Error('Database service unavailable. Please try again later.');
        }
        const notification = await Notification_1.default.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id,
        });
        if (!notification) {
            res.status(404);
            throw new Error('Notification not found');
        }
        res.status(200).json({ message: 'Notification deleted successfully' });
    }
    catch (error) {
        if (error.message === 'Notification not found') {
            res.status(404);
            throw error;
        }
        res.status(500);
        throw new Error('Failed to delete notification');
    }
});
// @desc    Clear all notifications
// @route   DELETE /api/notifications/clear-all
// @access  Private
exports.clearAllNotifications = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        // Check if database is connected
        if (mongoose_1.default.connection.readyState !== 1) {
            res.status(503);
            throw new Error('Database service unavailable. Please try again later.');
        }
        await Notification_1.default.deleteMany({ userId: req.user._id });
        res.status(200).json({ message: 'All notifications cleared successfully' });
    }
    catch (error) {
        res.status(500);
        throw new Error('Failed to clear notifications');
    }
});
// Helper function to create notifications (used by other controllers)
const createNotification = async (userId, type, title, message, options) => {
    try {
        const notification = await Notification_1.default.create({
            userId,
            type,
            title,
            message,
            ...options,
        });
        return notification;
    }
    catch (error) {
        console.error('Failed to create notification:', error);
    }
};
exports.createNotification = createNotification;
// @desc    Create notification when message is sent
const createMessageNotification = async (messageId, fromUserId) => {
    try {
        console.log('Creating message notification for message:', messageId);
        const message = await Message_1.default.findById(messageId).populate('userId');
        if (!message) {
            console.log('Message not found for notification creation');
            return;
        }
        // Notify all admins about new message
        const admins = await User_1.default.find({ role: 'admin', isActive: true });
        console.log(`Found ${admins.length} admins to notify`);
        for (const admin of admins) {
            let userName = 'Anonymous User';
            let userEmail = 'No email provided';
            let userType = 'Guest';
            let userRole = 'user';
            if (message.userId) {
                // Authenticated user
                userName = message.userId.name || 'Anonymous User';
                userEmail = message.userId.email || 'No email provided';
                userType = 'Registered';
                userRole = message.userId.role || 'user';
            }
            else if (message.name && message.email) {
                // Guest user
                userName = message.name;
                userEmail = message.email;
                // Check if this guest email matches a registered user
                const existingUser = await User_1.default.findOne({
                    email: message.email.toLowerCase().trim(),
                    isActive: true
                });
                if (existingUser) {
                    userType = 'Registered (Guest)';
                    userName = existingUser.name;
                    userEmail = existingUser.email;
                    userRole = existingUser.role || 'user';
                    console.log(`Guest message from registered user: ${existingUser.name} (${existingUser.email})`);
                }
            }
            // Truncate message for display
            const messagePreview = message.message.length > 50
                ? message.message.substring(0, 50) + '...'
                : message.message;
            const notificationData = {
                userId: admin._id.toString(),
                type: 'user_message',
                title: `New ${message.type.charAt(0).toUpperCase() + message.type.slice(1)} from ${userName}`,
                message: `${userName} (${userEmail}) sent: "${messagePreview}"`,
                actionUrl: `/admin?message=${messageId}`, // Navigate to specific message
                fromUser: {
                    name: userName,
                    email: userEmail,
                    type: userType,
                    role: userRole
                },
                toUser: {
                    name: admin.name,
                    email: admin.email,
                    role: 'admin'
                },
                relatedMessageId: messageId,
            };
            console.log('Creating notification for admin:', admin.name);
            console.log('Notification details:', notificationData);
            await (0, exports.createNotification)(notificationData.userId, notificationData.type, notificationData.title, notificationData.message, {
                actionUrl: notificationData.actionUrl,
                fromUser: notificationData.fromUser,
                toUser: notificationData.toUser,
                relatedMessageId: notificationData.relatedMessageId,
            });
            console.log(`Notification created successfully for admin: ${admin.name} about message from ${userName} (${userType})`);
        }
    }
    catch (error) {
        console.error('Failed to create message notification:', error);
    }
};
exports.createMessageNotification = createMessageNotification;
// @desc    Create notification when admin responds to message
const createAdminResponseNotification = async (messageId, adminId) => {
    try {
        const message = await Message_1.default.findById(messageId).populate('userId');
        const admin = await User_1.default.findById(adminId);
        if (!message || !admin)
            return;
        // Truncate admin response for display
        const responsePreview = message.adminResponse && message.adminResponse.length > 50
            ? message.adminResponse.substring(0, 50) + '...'
            : message.adminResponse || 'No response provided';
        // Handle both registered users and guest users
        if (message.userId) {
            // Registered user - create in-app notification with complete information
            await (0, exports.createNotification)(message.userId._id.toString(), 'admin_response', `Response to Your ${message.type.charAt(0).toUpperCase() + message.type.slice(1)}`, `Admin ${admin.name} (${admin.email}) responded to your ${message.type}: "${responsePreview}"`, {
                actionUrl: `/dashboard?message=${messageId}`,
                fromUser: {
                    name: admin.name,
                    email: admin.email,
                    role: 'admin'
                },
                toUser: {
                    name: message.userId.name,
                    email: message.userId.email,
                    role: message.userId.role || 'user'
                },
                relatedMessageId: messageId,
            });
            console.log(`Notification created for registered user: ${message.userId.name} from admin: ${admin.name} (${admin.email})`);
        }
        else if (message.email) {
            // Check if this guest email matches a registered user in the database
            const existingUser = await User_1.default.findOne({
                email: message.email.toLowerCase().trim(),
                isActive: true
            });
            if (existingUser) {
                // Email matches registered user - create in-app notification with admin details
                await (0, exports.createNotification)(existingUser._id.toString(), 'admin_response', `Response to Your ${message.type.charAt(0).toUpperCase() + message.type.slice(1)}`, `${admin.name} (${admin.email}) responded: "${responsePreview}"`, {
                    actionUrl: `/dashboard?message=${messageId}`, // Navigate to specific message
                    fromUser: {
                        name: admin.name,
                        email: admin.email,
                        role: 'admin'
                    },
                    toUser: {
                        name: existingUser.name,
                        email: existingUser.email,
                        role: existingUser.role || 'user'
                    },
                    relatedMessageId: messageId,
                });
                console.log(`Notification created for existing registered user: ${existingUser.name} (${existingUser.email}) from admin: ${admin.name} (${admin.email})`);
            }
            else {
                // Guest user - send email notification (in a real app, you'd use nodemailer)
                console.log(`Guest user notification to be sent to: ${message.email}`);
                console.log(`Message: ${admin.name} responded to your ${message.type}: "${responsePreview}"`);
                // In a production environment, you would send an actual email here:
                /*
                await sendEmail({
                  to: message.email,
                  subject: `Response to Your ${message.type}`,
                  text: `Hi ${message.name || 'there'},\n\n${admin.name} (${admin.email}) has responded to your ${message.type}:\n\n"${responsePreview}"\n\nYou can view the full response by logging into your account or contacting support.\n\nBest regards,\nYour Portfolio Team`
                });
                */
            }
        }
        else {
            console.log('Cannot create notification - no user ID or email found');
        }
    }
    catch (error) {
        console.error('Failed to create admin response notification:', error);
    }
};
exports.createAdminResponseNotification = createAdminResponseNotification;
