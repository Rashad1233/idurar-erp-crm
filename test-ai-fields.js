const axios = require('axios');

const testAIGeneration = async () => {
  try {
    console.log('🧪 Testing AI item generation...');
    
    const testRequest = {
      shortDescription: 'High Pressure Pump',
      manufacturer: 'Grundfos',
      category: 'PUMP'
    };
    
    console.log('📤 Request payload:', testRequest);
    
    const response = await axios.post('http://localhost:3000/api/ai/generate-complete-item', testRequest, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response data:', JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.data) {
      const aiData = response.data.data;
      
      console.log('\n✅ AI Generated Fields:');
      console.log('- shortDescription:', aiData.shortDescription);
      console.log('- longDescription:', aiData.longDescription);
      console.log('- standardDescription:', aiData.standardDescription);
      console.log('- technicalDescription:', aiData.technicalDescription);
      console.log('- manufacturerName:', aiData.manufacturerName);
      console.log('- manufacturerPartNumber:', aiData.manufacturerPartNumber);
      console.log('- equipmentCategory:', aiData.equipmentCategory);
      console.log('- equipmentSubCategory:', aiData.equipmentSubCategory);
      console.log('- unitOfMeasure:', aiData.unitOfMeasure);
      console.log('- unspscCode:', aiData.unspscCode);
      console.log('- unspscTitle:', aiData.unspscTitle);
      console.log('- stockItem:', aiData.stockItem);
      console.log('- criticality:', aiData.criticality);
      console.log('- serialNumber:', aiData.serialNumber);
      console.log('- estimatedPrice:', aiData.estimatedPrice);
      console.log('- supplierName:', aiData.supplierName);
      
      const missingFields = [];
      const requiredFields = ['shortDescription', 'longDescription', 'standardDescription', 'technicalDescription', 
                            'manufacturerName', 'equipmentCategory', 'equipmentSubCategory', 'unitOfMeasure', 
                            'unspscCode', 'criticality', 'stockItem', 'serialNumber'];
      
      requiredFields.forEach(field => {
        if (!aiData[field] || aiData[field] === 'TBD') {
          missingFields.push(field);
        }
      });
      
      if (missingFields.length > 0) {
        console.log('\n⚠️ Missing or TBD fields:', missingFields);
      } else {
        console.log('\n✅ All required fields generated successfully!');
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing AI generation:', error.message);
    if (error.response) {
      console.log('Error response:', error.response.data);
    }
  }
};

testAIGeneration();
