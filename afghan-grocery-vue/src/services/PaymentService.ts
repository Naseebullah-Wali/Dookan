/// <reference types="vite/client" />
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Helper to get CSRF token
async function getCsrfToken(): Promise<string> {
    const response = await fetch(`${API_URL}/csrf-token`, { credentials: 'include' });
    const data = await response.json();
    return data.csrfToken;
}

export const PaymentService = {
    // PayPal
    async createPayPalOrder(amount: number, currency: string = 'USD') {
        const csrfToken = await getCsrfToken();
        const response = await axios.post(`${API_URL}/payments/paypal/create-order`, { amount, currency }, {
            withCredentials: true,
            headers: { 'X-CSRF-Token': csrfToken }
        });
        return response.data;
    },

    async capturePayPalOrder(orderId: string) {
        const csrfToken = await getCsrfToken();
        const response = await axios.post(`${API_URL}/payments/paypal/capture-order`, { orderID: orderId }, {
            withCredentials: true,
            headers: { 'X-CSRF-Token': csrfToken }
        });
        return response.data;
    },

    // Crypto
    async verifyCryptoPayment(type: 'TRC20' | 'ARBITRUM', txHash: string, amount?: number) {
        const csrfToken = await getCsrfToken();
        const response = await axios.post(`${API_URL}/payments/verify-crypto`, { type, txHash, amount }, {
            withCredentials: true,
            headers: { 'X-CSRF-Token': csrfToken }
        });
        return response.data;
    },

    // WhatsApp
    async getWhatsAppLink(orderId: string, total: number, items: any[], options: any = {}) {
        const csrfToken = await getCsrfToken();
        const response = await axios.post(`${API_URL}/payments/whatsapp/link`, { orderId, total, items, options }, {
            withCredentials: true,
            headers: { 'X-CSRF-Token': csrfToken }
        });
        return response.data;
    }
};
