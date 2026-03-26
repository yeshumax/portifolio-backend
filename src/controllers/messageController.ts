import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Message from '../models/Message';

const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const messages = await Message.find({}).populate('userId', 'name email');
  res.status(200).json(messages);
});

const createMessage = asyncHandler(async (req: Request, res: Response) => {
  const { message, type } = req.body;

  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const newMessage = new Message({
    userId: req.user._id,
    message,
    type,
    status: 'pending',
    isReadByAdmin: false,
    isReadByUser: true,
  });

  const createdMessage = await newMessage.save();
  res.status(201).json(createdMessage);
});

const getMyMessages = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const messages = await Message.find({ userId: req.user._id });
  res.status(200).json(messages);
});

const respondToMessage = asyncHandler(async (req: Request, res: Response) => {
  const { adminResponse, status } = req.body;
  const message = await Message.findById(req.params.id);

  if (message) {
    message.adminResponse = adminResponse !== undefined ? adminResponse : message.adminResponse;
    message.status = status || message.status;
    message.isReadByUser = false; // Mark unread for user when admin responds
    message.isReadByAdmin = true; // Admin has read it if they are responding
    const updatedMessage = await message.save();
    res.status(200).json(updatedMessage);
  } else {
    res.status(404);
    throw new Error('Message not found');
  }
});

const getUnhandledCount = asyncHandler(async (req: Request, res: Response) => {
  const count = await Message.countDocuments({ isReadByAdmin: false });
  res.status(200).json({ count });
});

const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const message = await Message.findById(req.params.id);
  if (message) {
    if (req.user?.role === 'admin') {
      message.isReadByAdmin = true;
    } else {
      message.isReadByUser = true;
    }
    await message.save();
    res.status(200).json({ message: 'Marked as read' });
  } else {
    res.status(404);
    throw new Error('Message not found');
  }
});

const getUnreadMessages = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  let query = {};
  if (req.user.role === 'admin') {
    query = { isReadByAdmin: false };
  } else {
    query = { userId: req.user._id, isReadByUser: false };
  }

  const messages = await Message.find(query).sort({ createdAt: -1 }).limit(10).populate('userId', 'name profileImage');
  res.status(200).json(messages);
});

export { getMessages, createMessage, getMyMessages, respondToMessage, getUnhandledCount, markAsRead, getUnreadMessages };
