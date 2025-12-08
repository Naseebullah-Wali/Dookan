import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiting for payment verification to prevent spam checks
const verificationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 20, // Limit each IP to 20 verification requests per windowMs
    message: 'Too many verification attempts, please try again later'
});

// PayPal Routes
router.post('/paypal/create-order', PaymentController.createPayPalOrder); // @ts-ignore
router.post('/paypal/capture-order', PaymentController.capturePayPalOrder);

// Crypto Routes
router.post('/verify-crypto', verificationLimiter, PaymentController.verifyCryptoTransaction); // @ts-ignore

// WhatsApp Route
router.post('/whatsapp/link', PaymentController.getWhatsAppLink); // @ts-ignore

export default router;
