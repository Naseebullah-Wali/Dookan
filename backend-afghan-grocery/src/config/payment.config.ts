import dotenv from 'dotenv';
dotenv.config();

export const paymentConfig = {
    // PayPal Configuration
    paypal: {
        clientId: process.env.PAYPAL_CLIENT_ID || '',
        clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
        mode: process.env.PAYPAL_MODE || 'sandbox', // 'sandbox' or 'live'
    },

    // Stripe Configuration
    stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY || '',
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
        defaultCurrency: process.env.STRIPE_DEFAULT_CURRENCY || 'usd',
    },

    // Crypto Wallets Configuration
    crypto: {
        trc20: {
            walletAddress: process.env.CRYPTO_TRC20_ADDRESS || 'TW5gj7ZPJhVGWVE4qpfR9MQvrkryQjArV1',
            tronGridApiKey: process.env.TRONGRID_API_KEY || '',
        },
        arbitrum: {
            walletAddress: process.env.CRYPTO_ARBITRUM_ADDRESS || '0x084Ae494Ff43Ef2d5ef8aff8f02c757AaE4CC1Ab',
            arbiscanApiKey: process.env.ARBISCAN_API_KEY || '',
        },
    },

    // WhatsApp Configuration
    whatsapp: {
        adminNumber: process.env.WHATSAPP_ADMIN_NUMBER || '4915217735657',
    },
};

// Validate PayPal configuration
export function isPayPalConfigured(): boolean {
    return !!(paymentConfig.paypal.clientId && paymentConfig.paypal.clientSecret);
}

// Validate Stripe configuration
export function isStripeConfigured(): boolean {
    return !!paymentConfig.stripe.secretKey;
}

export default paymentConfig;
