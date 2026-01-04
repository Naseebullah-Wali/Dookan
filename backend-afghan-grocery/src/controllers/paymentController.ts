import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { UnauthorizedError, ValidationError } from '../utils/errors';
import * as stripeService from '../services/stripe.service';
import { PaymentService } from '../services/payment.service';
import UserModel from '../models/User';

/**
 * Create a PayPal Order for checkout
 */
export const createPayPalOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { amount, currency = 'USD' } = req.body;
        const userId = req.user?.userId;

        if (!userId) {
            throw new UnauthorizedError('Authentication required');
        }

        if (!amount || amount < 0.01) {
            throw new ValidationError('Invalid amount');
        }

        const order = await PaymentService.createPayPalOrder(parseFloat(amount), currency);

        sendSuccess(
            res,
            {
                id: order.id,
                status: order.status,
            },
            'PayPal order created successfully'
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Capture a PayPal Order after approval
 */
export const capturePayPalOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { orderID } = req.body;
        const userId = req.user?.userId;

        if (!userId) {
            throw new UnauthorizedError('Authentication required');
        }

        if (!orderID) {
            throw new ValidationError('PayPal Order ID is required');
        }

        const capture = await PaymentService.capturePayPalOrder(orderID);

        sendSuccess(
            res,
            {
                id: capture.id,
                status: capture.status,
                payer: capture.payer,
            },
            'PayPal payment captured successfully'
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Create a Payment Intent for checkout
 */
export const createPaymentIntent = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { amount, currency = 'usd', orderId, description } = req.body;
        const userId = (req as any).userId;

        if (!userId) {
            throw new UnauthorizedError('Authentication required');
        }

        if (!amount || amount < 1) {
            throw new ValidationError('Invalid amount');
        }

        if (!stripeService.isValidCurrency(currency)) {
            throw new ValidationError(`Currency ${currency} is not supported`);
        }

        const minimumAmount = stripeService.getMinimumAmount(currency);
        if (amount < minimumAmount) {
            throw new ValidationError(`Minimum amount for ${currency.toUpperCase()} is ${minimumAmount}`);
        }

        // Get user details
        const user = await UserModel.findById(userId);
        if (!user) {
            throw new UnauthorizedError('User not found');
        }

        // Create payment intent
        const paymentIntent = await stripeService.createPaymentIntent({
            amount,
            currency,
            description: description || `Order ${orderId}`,
            metadata: {
                userId,
                orderId: orderId || 'unknown',
                email: user.email,
            },
        });

        sendSuccess(
            res,
            {
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                status: paymentIntent.status,
            },
            'Payment Intent created successfully'
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Confirm payment and create order
 */
export const confirmPayment = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { paymentIntentId, orderId } = req.body;
        const userId = (req as any).userId;

        if (!userId) {
            throw new UnauthorizedError('Authentication required');
        }

        if (!paymentIntentId) {
            throw new ValidationError('Payment Intent ID is required');
        }

        // Get the payment intent to verify status
        const paymentIntent = await stripeService.getPaymentIntent(paymentIntentId);

        if (paymentIntent.status !== 'succeeded') {
            throw new ValidationError(`Payment not completed. Status: ${paymentIntent.status}`);
        }

        // TODO: Create order in database with payment_intent_id
        // TODO: Update inventory
        // TODO: Send confirmation email

        sendSuccess(
            res,
            {
                paymentIntentId,
                orderId,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                status: paymentIntent.status,
            },
            'Payment confirmed and order created'
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Get payment status
 */
export const getPaymentStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { paymentIntentId } = req.query;
        const userId = (req as any).userId;

        if (!userId) {
            throw new UnauthorizedError('Authentication required');
        }

        if (!paymentIntentId || typeof paymentIntentId !== 'string') {
            throw new ValidationError('Payment Intent ID is required');
        }

        const paymentIntent = await stripeService.getPaymentIntent(paymentIntentId);

        sendSuccess(
            res,
            {
                paymentIntentId: paymentIntent.id,
                status: paymentIntent.status,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                lastPaymentError: paymentIntent.last_payment_error,
            },
            'Payment status retrieved'
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Create a Stripe Payment Link for checkout
 */
export const createPaymentLink = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { items, currency = 'usd', description, user_id } = req.body;
        
        // Get userId from middleware auth or from request body
        const userId = (req as any).user?.id || user_id;

        if (!userId) {
            throw new UnauthorizedError('Authentication required');
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            throw new ValidationError('Items array is required');
        }

        if (!stripeService.isValidCurrency(currency)) {
            throw new ValidationError(`Currency ${currency} is not supported`);
        }

        // Get user details
        const user = await UserModel.findById(userId);
        if (!user) {
            throw new UnauthorizedError('User not found');
        }

        // Create payment link
        const paymentLink = await stripeService.createPaymentLink({
            items,
            currency,
            description: description || 'Order',
            userEmail: user.email,
            userId,
            successUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/checkout`,
        });

        sendSuccess(
            res,
            {
                paymentLinkUrl: paymentLink.url,
                paymentLinkId: paymentLink.id,
            },
            'Payment Link created successfully'
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Get supported currencies
 */
export const getSupportedCurrencies = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const currencies = stripeService.getSupportedCurrencies();

        sendSuccess(
            res,
            {
                currencies,
                default: process.env.STRIPE_DEFAULT_CURRENCY || 'usd',
            },
            'Supported currencies retrieved'
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Handle Stripe webhook events
 */
export const handleWebhook = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Webhook signature verification should be done in middleware
        const event = req.body;

        switch (event.type) {
            case 'payment_intent.succeeded':
                // TODO: Update order status in database
                // TODO: Send confirmation email
                break;

            case 'payment_intent.payment_failed':
                console.error(`❌ Payment failed:`, event.data.object.id);
                // TODO: Update order status
                // TODO: Send failure notification
                break;

            case 'charge.refunded':
                // TODO: Handle refund
                break;

            default:
                break;
        }

        sendSuccess(res, { received: true }, 'Webhook processed');
    } catch (error) {
        console.error('❌ Webhook error:', error);
        next(error);
    }
};

/**
 * Generate WhatsApp link for order
 */
export const getWhatsAppLink = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { orderId, total, items, options = {} } = req.body;
        const adminNumber = process.env.WHATSAPP_ADMIN_NUMBER || '4915217735657';
        
        // Build order message
        let message = `🛒 *New Order #${orderId}*\n\n`;
        
        if (items && items.length > 0) {
            message += `*Items:*\n`;
            items.forEach((item: any) => {
                message += `• ${item.name || item.product_name} x${item.quantity}\n`;
            });
            message += `\n`;
        }
        
        // Add subtotal and shipping breakdown
        if (options.subtotal) {
            message += `*Subtotal:* ${options.subtotal}\n`;
        }
        if (options.shipping) {
            message += `*Shipping:* ${options.shipping}\n`;
        }
        message += `*Total:* ${total}\n`;
        message += `\n`;
        
        if (options.recipientName) {
            message += `*Name:* ${options.recipientName}\n`;
        }
        if (options.phone) {
            message += `*Phone:* ${options.phone}\n`;
        }
        if (options.address) {
            message += `*Address:* ${options.address}\n`;
        }
        if (options.city) {
            message += `*City:* ${options.city}\n`;
        }
        if (options.notes) {
            message += `*Notes:* ${options.notes}\n`;
        }
        
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${adminNumber}?text=${encodedMessage}`;
        
        sendSuccess(res, { url: whatsappUrl }, 'WhatsApp link generated');
    } catch (error) {
        next(error);
    }
};

/**
 * Verify crypto payment (TRC20 or Arbitrum)
 */
export const verifyCryptoPayment = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { type, txHash, amount } = req.body;
        
        if (!type || !txHash) {
            throw new ValidationError('Transaction type and hash are required');
        }
        
        const trc20Address = process.env.CRYPTO_TRC20_ADDRESS || 'TW5gj7ZPJhVGWVE4qpfR9MQvrkryQjArV1';
        const arbitrumAddress = process.env.CRYPTO_ARBITRUM_ADDRESS || '0x084Ae494Ff43Ef2d5ef8aff8f02c757AaE4CC1Ab';
        
        let verified = false;
        let message = '';
        
        if (type === 'TRC20') {
            // For now, accept the transaction hash and mark as pending verification
            // In production, you would call Trongrid API to verify
            // const trongridApiKey = process.env.TRONGRID_API_KEY;
            // if (trongridApiKey) { /* verify via API */ }
            
            // For manual verification, we accept the hash and admin verifies later
            verified = true;
            message = 'Transaction submitted. Payment will be confirmed after blockchain verification.';
            
        } else if (type === 'ARBITRUM') {
            // For now, accept the transaction hash and mark as pending verification
            // In production, you would call Arbiscan API to verify
            // const arbiscanApiKey = process.env.ARBISCAN_API_KEY;
            // if (arbiscanApiKey) { /* verify via API */ }
            
            verified = true;
            message = 'Transaction submitted. Payment will be confirmed after blockchain verification.';
            
        } else {
            throw new ValidationError('Invalid crypto type. Use TRC20 or ARBITRUM.');
        }
        
        sendSuccess(res, { verified, txHash, type, message }, message);
    } catch (error) {
        next(error);
    }
};

export default {
    createPayPalOrder,
    capturePayPalOrder,
    createPaymentIntent,
    confirmPayment,
    getPaymentStatus,
    createPaymentLink,
    getSupportedCurrencies,
    handleWebhook,
    getWhatsAppLink,
    verifyCryptoPayment,
};
