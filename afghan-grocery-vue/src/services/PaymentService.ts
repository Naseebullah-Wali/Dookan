/// <reference types="vite/client" />
import api from './api';

export const PaymentService = {
    // PayPal
    async createPayPalOrder(amount: number, currency: string = 'USD') {
        const response = await api.post('/payments/paypal/create-order', { amount, currency });
        return response;
    },

    async capturePayPalOrder(orderId: string) {
        const response = await api.post('/payments/paypal/capture-order', { orderID: orderId });
        return response;
    },

    // Crypto
    async verifyCryptoPayment(type: 'TRC20' | 'ARBITRUM', txHash: string, amount?: number) {
        const response = await api.post('/payments/verify-crypto', { type, txHash, amount });
        return response;
    },

    // WhatsApp
    async getWhatsAppLink(orderId: string, total: number, items: any[], options: any = {}) {
        const response = await api.post('/payments/whatsapp/link', { orderId, total, items, options });
        return response;
    }
};
