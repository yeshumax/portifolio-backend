import express from 'express';
import {
  getUsers,
  updateUser,
  deleteUser,
  approveAdmin,
  getPendingAdmins,
  getAllUsersForAdmin,
  getCurrentAdmin,
} from '../controllers/userController';
import { registerUser } from '../controllers/authController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').get(protect, admin, getAllUsersForAdmin);
router.post('/register', protect, admin, registerUser);
router.get('/current-admin', protect, admin, getCurrentAdmin);
router.get('/pending-admins', protect, admin, getPendingAdmins);
router
  .route('/:id')
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);
router.put('/:id/approve-admin', protect, admin, approveAdmin);

export default router;
