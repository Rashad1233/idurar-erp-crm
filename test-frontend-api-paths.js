// Test script to verify frontend API paths work correctly
const axios = require('axios');

const API_BASE_URL = 'http://localhost:8888/api';

async function testFrontendAPIPaths() {
  try {
    console.log('🧪 Testing Frontend API Paths...');
    
    // Test item creation endpoint (what frontend uses)
    console.log('📤 Testing POST /api/item (frontend path)');
    const itemData = {
      shortDescription: 'Test Item Frontend Path',
      uom: 'EA'
    };
    
    const itemResponse = await axios.post(`${API_BASE_URL}/item`, itemData, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('✅ Item creation success!');
    console.log('Response structure:', {
      success: itemResponse.data.success,
      hasData: !!itemResponse.data.data,
      itemId: itemResponse.data.data?.id,
      itemNumber: itemResponse.data.data?.itemNumber
    });
    
    // Test AI endpoint (what frontend uses)
    console.log('\n📤 Testing POST /api/ai/generate-complete-item (frontend path)');
    const aiData = {
      shortDescription: 'laptop computer',
      manufacturer: '',
      category: ''
    };
    
    const aiResponse = await axios.post(`${API_BASE_URL}/ai/generate-complete-item`, aiData, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('✅ AI generation success!');
    console.log('AI Response structure:', {
      success: aiResponse.data.success,
      hasData: !!aiResponse.data.data,
      hasShortDescription: !!aiResponse.data.data?.shortDescription,
      hasUnitOfMeasure: !!aiResponse.data.data?.unitOfMeasure
    });
    
  } catch (error) {
    console.log('❌ Error:');
    console.log('URL:', error.config?.url);
    console.log('Status:', error.response?.status);
    console.log('Message:', error.response?.data?.message || error.message);
    console.log('Full error data:', error.response?.data);
  }
}

testFrontendAPIPaths();
