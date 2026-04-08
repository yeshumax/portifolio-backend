"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const notificationSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['message', 'admin_response', 'user_message', 'system'],
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    read: {
        type: Boolean,
        default: false,
    },
    actionUrl: {
        type: String,
    },
    fromUser: {
        name: String,
        email: String,
        avatar: String,
    },
    relatedMessageId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Message',
    },
}, {
    timestamps: true,
});
// Index for efficient queries
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
const Notification = mongoose_1.default.models.Notification || mongoose_1.default.model('Notification', notificationSchema);
exports.default = Notification;
