import express from 'express';
import { getUserProfile, updateUserProfile, uploadProfileImage, deleteAccount } from '../controllers/profileController';
import { protect } from '../middleware/authMiddleware';
import { validateProfileUpdate, validateAccountDeletion } from '../middleware/profileValidation';
import multer from 'multer';
import path from 'path';
// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + req.user?._id + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const fileFilter = (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    else {
        cb(new Error('Only image files are allowed'));
    }
};
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    }
});
const router = express.Router();
// All profile routes are protected
router.use(protect);
router.get('/', getUserProfile);
router.put('/', validateProfileUpdate, updateUserProfile);
router.post('/upload-image', upload.single('profileImage'), uploadProfileImage);
router.delete('/', validateAccountDeletion, deleteAccount);
export default router;
