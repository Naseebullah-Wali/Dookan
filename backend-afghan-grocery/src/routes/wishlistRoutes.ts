import { Router } from 'express';
import { body } from 'express-validator';
import * as wishlistController from '../controllers/wishlistController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';

const router = Router();

const addToWishlistValidation = [
    body('product_id').isInt().withMessage('Valid product ID is required'),
];

// All wishlist routes require authentication
router.get('/', authenticate, wishlistController.getUserWishlist);
router.post('/', authenticate, validate(addToWishlistValidation), wishlistController.addToWishlist);
router.delete('/:id', authenticate, wishlistController.removeFromWishlist);
router.delete('/', authenticate, wishlistController.clearWishlist);

export default router;
