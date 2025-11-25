// Test authentication with plain text passwords
const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function testLogin() {
    console.log('Testing login with test@gmail.com / test123...');

    try {
        const response = await axios.post(`${API_URL}/login`, {
            email: 'test@gmail.com',
            password: 'test123'
        });

        console.log('✅ Login successful!');
        console.log('User:', response.data.user);
        console.log('Token:', response.data.accessToken.substring(0, 20) + '...');
    } catch (error) {
        console.log('❌ Login failed:', error.response?.data || error.message);
    }

    console.log('\nTesting login with demo@afghangrocery.com / demo123...');

    try {
        const response = await axios.post(`${API_URL}/login`, {
            email: 'demo@afghangrocery.com',
            password: 'demo123'
        });

        console.log('✅ Login successful!');
        console.log('User:', response.data.user);
        console.log('Token:', response.data.accessToken.substring(0, 20) + '...');
    } catch (error) {
        console.log('❌ Login failed:', error.response?.data || error.message);
    }
}

// Run test
testLogin();
