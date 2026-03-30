import express from 'express';
import { getProjects, createProject, updateProject, deleteProject, } from '../controllers/projectController';
import { protect, admin } from '../middleware/authMiddleware';
import upload from '../middleware/upload';
const router = express.Router();
router.route('/').get(getProjects).post(protect, admin, upload.single('image'), createProject);
router
    .route('/:id')
    .put(protect, admin, upload.single('image'), updateProject)
    .delete(protect, admin, deleteProject);
export default router;
