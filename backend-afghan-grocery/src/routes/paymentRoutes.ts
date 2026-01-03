import { Router } from 'express';
import PaymentController from '../controllers/paymentController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Stripe Routes (Preferred Payment Method)
router.post('/stripe/create-intent', authenticate, PaymentController.createPaymentIntent); // @ts-ignore
router.post('/stripe/payment-link', authenticate, PaymentController.createPaymentLink); // @ts-ignore - Note: This endpoint requires authentication
router.post('/stripe/confirm', authenticate, PaymentController.confirmPayment); // @ts-ignore
router.get('/stripe/status/:paymentIntentId', authenticate, PaymentController.getPaymentStatus); // @ts-ignore
router.get('/stripe/currencies', PaymentController.getSupportedCurrencies); // @ts-ignore
router.post('/stripe/webhook', PaymentController.handleWebhook); // @ts-ignore

// WhatsApp Route
router.post('/whatsapp/link', authenticate, PaymentController.getWhatsAppLink); // @ts-ignore

// Crypto Routes
router.post('/verify-crypto', authenticate, PaymentController.verifyCryptoPayment); // @ts-ignore

export default router;
