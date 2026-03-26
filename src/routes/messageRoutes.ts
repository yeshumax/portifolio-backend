import express from 'express';
import {
  getMessages,
  createMessage,
  getMyMessages,
  respondToMessage,
  getUnhandledCount,
  markAsRead,
  getUnreadMessages,
} from '../controllers/messageController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').get(protect, admin, getMessages).post(protect, createMessage);
router.route('/unread').get(protect, getUnreadMessages);
router.route('/my-messages').get(protect, getMyMessages);
router.route('/:id/respond').put(protect, admin, respondToMessage);
router.route('/:id/mark-as-read').put(protect, markAsRead);

export default router;
