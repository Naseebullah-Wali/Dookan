import { Router } from 'express';
import * as uploadController from '../controllers/uploadController';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Only admins can upload images
router.post(
    '/',
    authenticate,
    authorize('admin'),
    upload.single('image'),
    uploadController.uploadImage
);

export default router;
