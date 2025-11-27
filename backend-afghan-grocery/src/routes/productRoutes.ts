import { Router } from 'express';
import { body } from 'express-validator';
import * as productController from '../controllers/productController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validator';

const router = Router();

// Validation rules
const createProductValidation = [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category_id').isInt({ min: 1 }).withMessage('Valid category ID is required'),
    body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    body('unit').optional().trim(),
    body('weight').optional().isFloat({ min: 0 }),
];

const updateProductValidation = [
    body('name').optional().trim().notEmpty().withMessage('Product name cannot be empty'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category_id').optional().isInt({ min: 1 }).withMessage('Valid category ID is required'),
    body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
];

// Public routes
router.get('/', productController.getAllProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/:id', productController.getProductById);

// Admin routes
router.post(
    '/',
    authenticate,
    authorize('admin'),
    validate(createProductValidation),
    productController.createProduct
);

router.put(
    '/:id',
    authenticate,
    authorize('admin'),
    validate(updateProductValidation),
    productController.updateProduct
);

router.delete(
    '/:id',
    authenticate,
    authorize('admin'),
    productController.deleteProduct
);

export default router;
