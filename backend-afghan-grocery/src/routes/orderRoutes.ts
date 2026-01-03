import { Router } from 'express';
import { body } from 'express-validator';
import * as orderController from '../controllers/orderController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validator';

const router = Router();

// Validation rules
const createOrderValidation = [
    // Either address_id or address object must be provided
    body('address_id').optional().isInt().withMessage('Valid address ID is required'),
    body('address').optional().isObject().withMessage('Address must be an object'),
    body('address.full_name').if(body('address').exists()).notEmpty().withMessage('Full name is required'),
    body('address.phone').if(body('address').exists()).notEmpty().withMessage('Phone is required'),
    body('address.city').if(body('address').exists()).notEmpty().withMessage('City is required'),
    body('address.street').if(body('address').exists()).notEmpty().withMessage('Street is required'),
    body('payment_method').isIn(['cod', 'card', 'bank_transfer', 'paypal', 'trc20', 'arbitrum', 'stripe', 'whatsapp']).withMessage('Invalid payment method'),
    body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
    body('items.*.product_id').isInt().withMessage('Valid product ID is required'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('items.*.price').isFloat({ min: 0 }).withMessage('Price must be non-negative'),
    body('subtotal').isFloat({ min: 0 }).withMessage('Subtotal must be non-negative'),
];

const updateOrderStatusValidation = [
    body('status').optional().isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
    body('payment_status').optional().isIn(['pending', 'paid', 'failed', 'refunded']),
    body('tracking_number').optional().trim(),
];

// Protected routes (Customer & Admin)
router.post(
    '/',
    authenticate,
    validate(createOrderValidation),
    orderController.createOrder
);

// Public lookup (by id or order_number)
router.get('/lookup', orderController.getPublicOrder);

router.get(
    '/',
    authenticate,
    (req, res, next) => {
        if (req.user?.role === 'admin') {
            return orderController.getAllOrders(req, res, next);
        }
        return orderController.getUserOrders(req, res, next);
    }
);

router.get('/:id', authenticate, orderController.getOrderById);

// Admin routes
router.put(
    '/:id',
    authenticate,
    authorize('admin'),
    validate(updateOrderStatusValidation),
    orderController.updateOrderStatus
);

export default router;
