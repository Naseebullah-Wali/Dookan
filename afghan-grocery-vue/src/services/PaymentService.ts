import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const PaymentService = {
    // PayPal
    async createPayPalOrder(amount: number, currency: string = 'USD') {
        const response = await axios.post(`${API_URL}/payments/paypal/create-order`, { amount, currency });
        return response.data;
    },

    async capturePayPalOrder(orderId: string) {
        const response = await axios.post(`${API_URL}/payments/paypal/capture-order`, { orderID: orderId });
        return response.data;
    },

    // Crypto
    async verifyCryptoPayment(type: 'TRC20' | 'ARBITRUM', txHash: string, amount?: number) {
        const response = await axios.post(`${API_URL}/payments/verify-crypto`, { type, txHash, amount });
        return response.data;
    },

    // WhatsApp
    async getWhatsAppLink(orderId: string, total: number, items: any[]) {
        const response = await axios.post(`${API_URL}/payments/whatsapp/link`, { orderId, total, items });
        return response.data;
    }
};
