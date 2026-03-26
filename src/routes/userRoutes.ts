import express from 'express';
import {
  getUsers,
  updateUser,
  deleteUser,
} from '../controllers/userController';
import { registerUser } from '../controllers/authController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').get(protect, admin, getUsers);
router.post('/register', protect, admin, registerUser);
router
  .route('/:id')
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

export default router;
