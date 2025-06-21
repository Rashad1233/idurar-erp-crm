const axios = require('axios');

const testShortDescriptionGeneration = async () => {
  try {
    console.log('🧪 Testing Short Description AI Generation...\n');
    
    const testCases = [
      {
        input: 'High Pressure Pump',
        manufacturer: 'Grundfos',
        category: 'PUMP'
      },
      {
        input: 'Mouse, Ergonomic USB Wired',
        manufacturer: 'Logitech',
        category: 'ELECTRICAL'
      },
      {
        input: 'Ball Valve',
        manufacturer: 'Emerson',
        category: 'VALVE'
      }
    ];
    
    for (const testCase of testCases) {
      console.log(`📤 Testing: "${testCase.input}"`);
      
      const response = await axios.post('http://localhost:3000/api/ai/generate-complete-item', testCase, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.data && response.data.data) {
        const aiData = response.data.data;
        
        console.log(`  ✅ Original: "${testCase.input}" (${testCase.input.length} chars)`);
        console.log(`  🤖 AI Generated: "${aiData.shortDescription}" (${aiData.shortDescription.length} chars)`);
        console.log(`  📏 Within limit: ${aiData.shortDescription.length <= 44 ? '✅' : '❌'}`);
        console.log(`  🔄 Different: ${aiData.shortDescription !== testCase.input ? '✅ Improved' : '❌ Same'}`);
        
        // Check if it would be applied based on our logic
        const wouldApply = aiData.shortDescription !== undefined && 
                          aiData.shortDescription !== null && 
                          aiData.shortDescription !== '' && 
                          aiData.shortDescription !== 'TBD';
        
        console.log(`  📝 Would Apply: ${wouldApply ? '✅' : '❌'}`);
        console.log(`  📋 Also Generated: ${Object.keys(aiData).filter(k => k !== 'shortDescription' && aiData[k] && aiData[k] !== 'TBD').length} other fields\n`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

testShortDescriptionGeneration();
