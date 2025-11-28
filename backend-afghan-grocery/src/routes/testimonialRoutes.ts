import { Router } from 'express';
import {
    getAllTestimonials,
    getTestimonialById,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial
} from '../controllers/testimonialController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getAllTestimonials);
router.get('/:id', getTestimonialById);

// Admin routes
router.post('/', authenticate, authorize('admin'), createTestimonial);
router.put('/:id', authenticate, authorize('admin'), updateTestimonial);
router.delete('/:id', authenticate, authorize('admin'), deleteTestimonial);

export default router;
