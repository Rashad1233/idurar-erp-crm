// Test script to verify AI generation API endpoint
const axios = require('axios');

const API_BASE_URL = 'http://localhost:8888';

async function testAIGeneration() {
  try {
    console.log('🧪 Testing AI Generation API...');
    
    // Test data
    const aiData = {
      shortDescription: 'macbookm4',
      manufacturer: '',
      category: '',
      additionalInfo: ''
    };
    
    console.log('📤 Sending POST request to /api/ai/generate-complete-item');
    console.log('Data:', JSON.stringify(aiData, null, 2));
    
    const response = await axios.post(`${API_BASE_URL}/api/ai/generate-complete-item`, aiData, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('✅ Success! Response:', response.data);
    
  } catch (error) {
    console.log('❌ Error response:');
    console.log('Status:', error.response?.status);
    console.log('Message:', error.response?.data?.message);
    console.log('Full error:', error.response?.data);
    
    if (error.response?.status === 404) {
      console.log('❌ Route not found - check if AI routes are registered');
    }
  }
}

testAIGeneration();
