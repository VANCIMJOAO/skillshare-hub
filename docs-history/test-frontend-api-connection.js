// Test script para verificar a conexão Frontend-Backend
const API_URL = 'http://localhost:3004';

async function testConnection() {
    console.log('🧪 Testing Frontend-Backend Connection...\n');
    
    try {
        // Test 1: Health check
        console.log('1. Testing health endpoint...');
        const healthResponse = await fetch(`${API_URL}/health`);
        const healthData = await healthResponse.json();
        console.log('✅ Health:', healthData.status);
        
        // Test 2: Workshops endpoint
        console.log('\n2. Testing workshops endpoint...');
        const workshopsResponse = await fetch(`${API_URL}/workshops`);
        const workshopsData = await workshopsResponse.json();
        console.log('✅ Workshops:', workshopsData.data?.length || 0, 'workshops found');
        
        // Test 3: CORS check
        console.log('\n3. Testing CORS headers...');
        const corsHeaders = workshopsResponse.headers;
        console.log('Access-Control-Allow-Origin:', corsHeaders.get('access-control-allow-origin') || 'NOT SET');
        
        // Test 4: Auth endpoints
        console.log('\n4. Testing auth endpoints...');
        const authResponse = await fetch(`${API_URL}/auth/profile`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer invalid-token'
            }
        });
        console.log('Auth endpoint status:', authResponse.status, authResponse.status === 401 ? '✅ Protected' : '❌ Issue');
        
        console.log('\n🎉 Connection tests completed!');
        
    } catch (error) {
        console.error('❌ Connection error:', error.message);
        
        if (error.message.includes('ECONNREFUSED')) {
            console.log('🚨 Backend não está rodando na porta 3004');
        } else if (error.message.includes('CORS')) {
            console.log('🚨 CORS error - backend needs to allow frontend origin');
        } else if (error.message.includes('fetch')) {
            console.log('🚨 Network error - check if both servers are running');
        }
    }
}

// Execute if running directly
if (typeof window === 'undefined') {
    // Node.js environment
    const fetch = require('node-fetch');
    testConnection();
} else {
    // Browser environment
    testConnection();
}
