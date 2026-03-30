"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const messageController_1 = require("../controllers/messageController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Public route - anyone can create a message
router.route('/').post(messageController_1.createMessage);
// Protected routes
router.route('/').get(authMiddleware_1.protect, authMiddleware_1.admin, messageController_1.getMessages);
router.route('/unread').get(authMiddleware_1.protect, messageController_1.getUnreadMessages);
router.route('/my-messages').get(authMiddleware_1.protect, messageController_1.getMyMessages);
router.route('/unhandled-count').get(authMiddleware_1.protect, authMiddleware_1.admin, messageController_1.getUnhandledCount);
router.route('/:id/respond').put(authMiddleware_1.protect, authMiddleware_1.admin, messageController_1.respondToMessage);
router.route('/:id/mark-as-read').put(authMiddleware_1.protect, messageController_1.markAsRead);
exports.default = router;
