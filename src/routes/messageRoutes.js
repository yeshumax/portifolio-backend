import express from 'express';
import { getMessages, createMessage, getMyMessages, respondToMessage, getUnhandledCount, markAsRead, getUnreadMessages, } from '../controllers/messageController';
import { protect, admin } from '../middleware/authMiddleware';
const router = express.Router();
// Public route - anyone can create a message
router.route('/').post(createMessage);
// Protected routes
router.route('/').get(protect, admin, getMessages);
router.route('/unread').get(protect, getUnreadMessages);
router.route('/my-messages').get(protect, getMyMessages);
router.route('/unhandled-count').get(protect, admin, getUnhandledCount);
router.route('/:id/respond').put(protect, admin, respondToMessage);
router.route('/:id/mark-as-read').put(protect, markAsRead);
export default router;
