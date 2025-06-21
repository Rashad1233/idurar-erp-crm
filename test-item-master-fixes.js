// Test script to verify Item Master fixes
const axios = require('axios');

async function testItemMasterFixes() {
  const baseURL = 'http://localhost:3000/api';
  
  console.log('🧪 Testing Item Master Enhancement Fixes...\n');

  try {
    // Test 1: AI Generation (should create suggestions, not auto-apply)
    console.log('1. Testing AI suggestion generation...');
    const aiResponse = await axios.post(`${baseURL}/ai/generate-complete-item`, {
      shortDescription: 'gate valve 12 inch',
      manufacturer: '',
      category: 'VALVE'
    });
    
    if (aiResponse.data.success && aiResponse.data.data.technicalDescription) {
      console.log('✅ AI generates suggestions with technical description');
      console.log(`   Technical Description: ${aiResponse.data.data.technicalDescription.substring(0, 50)}...`);
    } else {
      console.log('❌ AI suggestion generation failed');
    }

    // Test 2: Item Creation (should generate temporary number)
    console.log('\n2. Testing item creation with temporary number...');
    const createResponse = await axios.post(`${baseURL}/item`, {
      shortDescription: 'Test Gate Valve 12 Inch',
      longDescription: 'Industrial gate valve for testing',
      technicalDescription: 'Material: Stainless Steel, Pressure: 300 PSI, Temperature: -20°C to 200°C',
      standardDescription: 'VALVE, GATE: 12IN, CLASS 300, STAINLESS STEEL',
      manufacturerName: 'Test Valve Co',
      manufacturerPartNumber: 'TV-GV-12-300',
      equipmentCategory: 'VALVE',
      equipmentSubCategory: 'GATE',
      uom: 'EA',
      stockItem: 'Y',
      plannedStock: 'N',
      criticality: 'MEDIUM'
    }, {
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });

    if (createResponse.data.success && createResponse.data.result.itemNumber.startsWith('TEMP-')) {
      console.log('✅ Item created with temporary number');
      console.log(`   Temporary Number: ${createResponse.data.result.itemNumber}`);
      console.log(`   Status: ${createResponse.data.result.status}`);
      
      const itemId = createResponse.data.result.id;

      // Test 3: Review and Approval (should assign final number and stock code)
      console.log('\n3. Testing review and approval process...');
      const reviewResponse = await axios.put(`${baseURL}/item/${itemId}/review`, {
        action: 'approve',
        comments: 'Approved for testing',
        stockCode: 'ST1' // Or let it auto-determine
      }, {
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });

      if (reviewResponse.data.success && !reviewResponse.data.result.itemNumber.startsWith('TEMP-')) {
        console.log('✅ Item approved with final number and stock code');
        console.log(`   Final Number: ${reviewResponse.data.result.itemNumber}`);
        console.log(`   Stock Code: ${reviewResponse.data.result.stockCode}`);
      } else {
        console.log('❌ Review/approval process failed');
      }

    } else {
      console.log('❌ Item creation with temporary number failed');
    }

    // Test 4: Pending Review Items
    console.log('\n4. Testing pending review endpoint...');
    const pendingResponse = await axios.get(`${baseURL}/item/pending-review`, {
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });

    if (pendingResponse.data.success) {
      console.log('✅ Pending review endpoint working');
      console.log(`   Found ${pendingResponse.data.result.length} items pending review`);
    } else {
      console.log('❌ Pending review endpoint failed');
    }

  } catch (error) {
    console.log('❌ Test failed with error:', error.response?.data?.message || error.message);
    console.log('   This is expected if server is not running or auth is required');
  }

  console.log('\n📋 Test Summary:');
  console.log('   - AI suggestions (not auto-apply): Check frontend manually');
  console.log('   - Technical description field: Check frontend form');
  console.log('   - Temporary number generation: Test above');
  console.log('   - Review workflow: Test above');
  console.log('   - Stock code logic: Applied during approval');
  
  console.log('\n🎯 Next Steps:');
  console.log('   1. Start the backend server');
  console.log('   2. Open frontend and test AI suggestion menu');
  console.log('   3. Test technical description field entry');
  console.log('   4. Verify no auto-generation while typing');
  console.log('   5. Test complete workflow: create → review → approve');
}

if (require.main === module) {
  testItemMasterFixes();
}

module.exports = { testItemMasterFixes };
