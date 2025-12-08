import dotenv from 'dotenv';
dotenv.config();

export const paymentConfig = {
    crypto: {
        trc20: {
            walletAddress: process.env.TRC20_WALLET_ADDRESS,
            tronGridApiKey: process.env.TRONGRID_API_KEY,
        },
        arbitrum: {
            walletAddress: process.env.ARBITRUM_WALLET_ADDRESS,
            arbiscanApiKey: process.env.ARBISCAN_API_KEY,
        },
    },
    paypal: {
        clientId: process.env.PAYPAL_CLIENT_ID,
        clientSecret: process.env.PAYPAL_CLIENT_SECRET,
        mode: process.env.PAYPAL_MODE || 'sandbox',
    },
    whatsapp: {
        adminNumber: process.env.WHATSAPP_ADMIN_NUMBER,
        accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
        phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    },
};
