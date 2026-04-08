"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notificationController_1 = require("../controllers/notificationController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// All notification routes are protected
router.use(authMiddleware_1.protect);
// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
router.get('/', notificationController_1.getNotifications);
// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
router.get('/unread-count', notificationController_1.getUnreadCount);
// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
router.put('/:id/read', notificationController_1.markAsRead);
// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
router.put('/mark-all-read', notificationController_1.markAllAsRead);
// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
router.delete('/:id', notificationController_1.deleteNotification);
// @desc    Clear all notifications
// @route   DELETE /api/notifications/clear-all
// @access  Private
router.delete('/clear-all', notificationController_1.clearAllNotifications);
exports.default = router;
