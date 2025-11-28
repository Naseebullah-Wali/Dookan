import express from 'express';
import * as addressController from '../controllers/addressController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { body } from 'express-validator';

const router = express.Router();

// Validation rules
const addressValidation = [
    body('recipient_name').notEmpty().withMessage('Recipient name is required'),
    body('phone').notEmpty().withMessage('Phone number is required'),
    body('province').notEmpty().withMessage('Province is required'),
    body('city').notEmpty().withMessage('City is required'),
    body('street').notEmpty().withMessage('Street address is required'),
    body('is_default').optional().isBoolean()
];

// All routes require authentication
router.use(authenticate);

router.get('/', addressController.getMyAddresses);
router.post('/', validate(addressValidation), addressController.createAddress);
router.put('/:id', validate(addressValidation), addressController.updateAddress);
router.delete('/:id', addressController.deleteAddress);

export default router;
