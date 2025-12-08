import { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';

export class PaymentController {

    // ==========================================
    // PAYPAL
    // ==========================================
    static async createPayPalOrder(req: Request, res: Response) {
        try {
            const { amount, currency } = req.body;
            if (!amount || amount <= 0) {
                return res.status(400).json({ message: 'Invalid amount' });
            }

            const order = await PaymentService.createPayPalOrder(amount, currency);
            res.json(order);
        } catch (error: any) {
            res.status(500).json({ message: error.message || 'Failed to create PayPal order' });
        }
    }

    static async capturePayPalOrder(req: Request, res: Response) {
        try {
            const { orderID } = req.body;
            if (!orderID) {
                return res.status(400).json({ message: 'Order ID is required' });
            }

            const capture = await PaymentService.capturePayPalOrder(orderID);
            res.json(capture);
        } catch (error: any) {
            res.status(500).json({ message: error.message || 'Failed to capture PayPal order' });
        }
    }

    // ==========================================
    // CRYPTO
    // ==========================================
    static async verifyCryptoTransaction(req: Request, res: Response) {
        try {
            const { type, txHash, amount } = req.body;

            if (!txHash) {
                return res.status(400).json({ message: 'Transaction Hash is required' });
            }

            if (type === 'TRC20') {
                const result = await PaymentService.verifyTronTransaction(txHash, amount);
                return res.json(result);
            } else if (type === 'ARBITRUM') {
                const result = await PaymentService.verifyArbitrumTransaction(txHash);
                return res.json(result);
            } else {
                return res.status(400).json({ message: 'Invalid crypto type' });
            }

        } catch (error: any) {
            console.error("Crypto Verification Error:", error);
            res.status(500).json({ message: error.message || 'Verification failed' });
        }
    }

    // ==========================================
    // WHATSAPP
    // ==========================================
    static getWhatsAppLink(req: Request, res: Response) {
        try {
            const { orderId, total, items } = req.body;
            const link = PaymentService.getWhatsAppLink(orderId, total, items);

            if (!link) {
                return res.status(400).json({ message: 'WhatsApp admin number not configured' });
            }

            res.json({ link });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}
