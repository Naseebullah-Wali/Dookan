import { Router } from 'express';
import { body } from 'express-validator';
import * as reviewController from '../controllers/reviewController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

const createReviewValidation = [
    body('product_id').isInt().withMessage('Valid product ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().trim(),
    body('order_id').optional().isInt(),
];

// Get reviews for a product (public)
router.get('/product/:productId', asyncHandler(reviewController.getProductReviews));

// Get user's reviews (authenticated)
router.get('/user', authenticate, asyncHandler(reviewController.getUserReviews));

// Create review (authenticated)
router.post('/', authenticate, validate(createReviewValidation), asyncHandler(reviewController.createReview));

// Delete review (authenticated)
router.delete('/:id', authenticate, asyncHandler(reviewController.deleteReview));

export default router;
