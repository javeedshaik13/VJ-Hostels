// Simple test script to verify the API endpoint
const axios = require('axios');

async function testLogin() {
    try {
        // Test login first
        const loginResponse = await axios.post('http://localhost:4000/student-api/login', {
            rollNumber: '23071a7251', // Using the roll number from the logs
            password: 'test123' // You'll need to know the actual password
        });
        
        console.log('Login successful:', loginResponse.data);
        
        // Test profile endpoint with the token
        const token = loginResponse.data.token;
        const profileResponse = await axios.get('http://localhost:4000/student-api/profile', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        
        console.log('Profile data:', profileResponse.data);
        
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

testLogin();
