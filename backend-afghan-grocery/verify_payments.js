const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1'; // Adjust API version if needed

async function checkEndpoint(name, url, method = 'POST', data = {}) {
    try {
        await axios({ method, url, data });
        console.log(`✅ ${name}: Success (200 OK)`);
    } catch (error) {
        if (error.response) {
            console.log(`✅ ${name}: Reachable (Status: ${error.response.status}) - ${error.response.data.message || 'No message'}`);
            // We expect 400/500 because keys are missing, which means the code IS running.
            // A 404 would be a failure.
            if (error.response.status === 404) {
                console.error(`❌ ${name}: Failed (404 Not Found) - Route not registered?`);
            }
        } else {
            console.error(`❌ ${name}: Failed (Network Error) - Server might be down`);
        }
    }
}

async function run() {
    console.log("Checking Payment Endpoints...");

    // Check Crypto Verify
    await checkEndpoint('Crypto Verify', `${BASE_URL}/payments/verify-crypto`, 'POST', { type: 'TRC20', txHash: 'test', amount: 100 });

    // Check PayPal Create
    await checkEndpoint('PayPal Create', `${BASE_URL}/payments/paypal/create-order`, 'POST', { amount: 100 });

    // Check WhatsApp Link
    await checkEndpoint('WhatsApp Link', `${BASE_URL}/payments/whatsapp/link`, 'POST', { orderId: '123', total: 100, items: [] });
}

run();
