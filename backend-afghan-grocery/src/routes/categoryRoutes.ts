import { Router } from 'express';
import { body } from 'express-validator';
import * as categoryController from '../controllers/categoryController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validator';

const router = Router();

// Validation rules
const createCategoryValidation = [
    body('name').trim().notEmpty().withMessage('Category name is required'),
    body('parent_id').optional().isInt().withMessage('Parent ID must be an integer'),
];

const updateCategoryValidation = [
    body('name').optional().trim().notEmpty().withMessage('Category name cannot be empty'),
    body('parent_id').optional().isInt().withMessage('Parent ID must be an integer'),
];

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/with-counts', categoryController.getCategoriesWithProductCount);
router.get('/:id', categoryController.getCategoryById);

// Admin routes
router.post(
    '/',
    authenticate,
    authorize('admin'),
    validate(createCategoryValidation),
    categoryController.createCategory
);

router.put(
    '/:id',
    authenticate,
    authorize('admin'),
    validate(updateCategoryValidation),
    categoryController.updateCategory
);

router.delete(
    '/:id',
    authenticate,
    authorize('admin'),
    categoryController.deleteCategory
);

export default router;
