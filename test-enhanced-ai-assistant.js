#!/usr/bin/env node

/**
 * Enhanced AI Assistant Test Script
 * Tests the comprehensive AI generation with all new features
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:8888/api';

async function testComprehensiveAIGeneration() {
  console.log('🤖 Testing Enhanced AI Assistant - Comprehensive Item Generation');
  console.log('=' .repeat(70));

  // Test cases for different types of items
  const testCases = [
    {
      name: 'Industrial Pump',
      description: 'Centrifugal pump for water transfer in industrial applications',
      expectedCategory: 'PUMP'
    },
    {
      name: 'Ball Valve',
      description: 'Stainless steel ball valve for pipeline control',
      expectedCategory: 'VALVE'
    },
    {
      name: 'Electric Motor',
      description: 'AC motor 5HP for industrial equipment',
      expectedCategory: 'MOTOR'
    },
    {
      name: 'Office Printer',
      description: 'Laser printer for office document printing',
      expectedCategory: 'OTHER'
    },
    {
      name: 'Safety Tool',
      description: 'Industrial drill for maintenance work',
      expectedCategory: 'TOOLS'
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📝 Testing: ${testCase.name}`);
    console.log(`Description: ${testCase.description}`);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/ai/generate-comprehensive-details`, {
        itemDescription: testCase.description,
        additionalInfo: {
          manufacturer: '',
          category: '',
          specifications: ''
        }
      });

      if (response.data && response.data.success) {
        const data = response.data.data;
        
        console.log(`✅ Generation successful for ${testCase.name}`);
        console.log(`📋 Short Description: ${data.shortDescription}`);
        console.log(`🏭 Equipment Category: ${data.equipmentCategory}`);
        console.log(`🔧 Sub-Category: ${data.equipmentSubCategory}`);
        console.log(`🔍 UNSPSC Code: ${data.unspscSuggestion?.code}`);
        console.log(`🏭 Manufacturers: ${data.manufacturerSuggestions?.join(', ')}`);
        console.log(`📦 Recommended UOM: ${data.recommendedUOM}`);
        console.log(`⚠️ Criticality: ${data.criticalityLevel}`);
        console.log(`🏬 Suppliers: ${data.supplierSuggestions?.join(', ')}`);
        
        // Verify expected category
        if (data.equipmentCategory === testCase.expectedCategory) {
          console.log(`✅ Category match confirmed: ${data.equipmentCategory}`);
        } else {
          console.log(`⚠️ Category mismatch. Expected: ${testCase.expectedCategory}, Got: ${data.equipmentCategory}`);
        }

      } else {
        console.log(`❌ Failed to generate for ${testCase.name}: ${response.data?.message}`);
      }
    } catch (error) {
      console.error(`❌ Error testing ${testCase.name}:`, error.message);
    }
  }
}

async function testSupplierEmailGeneration() {
  console.log('\n\n📧 Testing Supplier Email Generation');
  console.log('=' .repeat(70));

  const itemData = {
    shortDescription: 'PUMP, CENTRIFUGAL: Industrial water transfer',
    longDescription: 'High-efficiency centrifugal pump designed for industrial water transfer applications. Features corrosion-resistant materials and variable speed capability.',
    unspscCode: '40101702',
    manufacturerName: 'Grundfos'
  };

  try {
    const response = await axios.post(`${API_BASE_URL}/ai/generate-supplier-email`, {
      itemData,
      requestDetails: {
        quantity: '5 units',
        urgency: 'Standard',
        specialRequirements: 'Explosion-proof rating required'
      }
    });

    if (response.data && response.data.success) {
      const emailData = response.data.data;
      
      console.log('✅ Email generation successful');
      console.log(`📧 Subject: ${emailData.subject}`);
      console.log(`📝 Body preview: ${emailData.body.substring(0, 200)}...`);
      console.log(`📎 Attachment requests: ${emailData.attachmentRequests?.join(', ')}`);
    } else {
      console.log(`❌ Failed to generate email: ${response.data?.message}`);
    }
  } catch (error) {
    console.error('❌ Error generating email:', error.message);
  }
}

async function testUNSPSCSearch() {
  console.log('\n\n🔍 Testing Enhanced UNSPSC Search');
  console.log('=' .repeat(70));

  const searchQueries = [
    'industrial pump',
    'ball valve',
    'electric motor',
    'office printer'
  ];

  for (const query of searchQueries) {
    console.log(`\n🔍 Searching for: ${query}`);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/unspsc/search`, {
        query: query
      });

      if (response.data && response.data.success) {
        const results = response.data.results;
        console.log(`✅ Found ${results.length} results`);
        
        results.slice(0, 2).forEach((result, index) => {
          console.log(`  ${index + 1}. ${result.unspscCode} - ${result.fullTitle}`);
          console.log(`     Confidence: ${Math.round(result.confidence * 100)}%`);
        });
      } else {
        console.log(`❌ Search failed: ${response.data?.message}`);
      }
    } catch (error) {
      console.error(`❌ Error searching for ${query}:`, error.message);
    }
  }
}

async function runAllTests() {
  console.log('🚀 Starting Enhanced AI Assistant Tests');
  console.log('Testing backend at:', API_BASE_URL);
  console.log('');

  await testComprehensiveAIGeneration();
  await testSupplierEmailGeneration();
  await testUNSPSCSearch();

  console.log('\n\n🎉 All tests completed!');
  console.log('=' .repeat(70));
}

// Run tests
runAllTests().catch(error => {
  console.error('❌ Test suite failed:', error.message);
  process.exit(1);
});
