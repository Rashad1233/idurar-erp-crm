/**
 * PROCUREMENT MODULE - FINAL VALIDATION TEST
 * 
 * This script tests the complete procurement workflow end-to-end
 * Run this after logging in to get a valid JWT token
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:8888/api';
const TEST_CONFIG = {
  // Replace with actual JWT token from frontend login
  JWT_TOKEN: 'YOUR_JWT_TOKEN_HERE',
  
  // Test data
  SUPPLIER_DATA: {
    supplierNumber: 'SUP001',
    legalName: 'Test Supplier Corp',
    tradeName: 'Test Supplier',
    email: 'supplier@test.com',
    phone: '+1234567890',
    address: '123 Test Street',
    city: 'Test City',
    country: 'Test Country',
    status: 'active'
  },
  
  PURCHASE_REQUISITION_DATA: {
    description: 'Test Purchase Requisition',
    costCenter: 'CC001',
    currency: 'USD',
    notes: 'This is a test PR created by validation script',
    items: [
      {
        description: 'Test Item 1',
        uom: 'PCS',
        quantity: 10,
        unitPrice: 100.00,
        comments: 'Test item for validation'
      },
      {
        description: 'Test Item 2', 
        uom: 'KG',
        quantity: 5,
        unitPrice: 200.00,
        comments: 'Second test item'
      }
    ]
  }
};

class ProcurementValidator {
  constructor() {
    this.setupAxios();
    this.testResults = {
      passed: 0,
      failed: 0,
      total: 0,
      details: []
    };
  }

  setupAxios() {
    axios.defaults.baseURL = API_BASE_URL;
    axios.defaults.headers.common['Authorization'] = `Bearer ${TEST_CONFIG.JWT_TOKEN}`;
    axios.defaults.headers.common['Content-Type'] = 'application/json';
  }

  async runTest(testName, testFunction) {
    this.testResults.total++;
    console.log(`\n🧪 Running Test: ${testName}`);
    console.log('─'.repeat(50));
    
    try {
      const result = await testFunction();
      this.testResults.passed++;
      this.testResults.details.push({
        name: testName,
        status: 'PASSED',
        result: result
      });
      console.log(`✅ PASSED: ${testName}`);
      return result;
    } catch (error) {
      this.testResults.failed++;
      this.testResults.details.push({
        name: testName,
        status: 'FAILED',
        error: error.response?.data || error.message
      });
      console.log(`❌ FAILED: ${testName}`);
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
      throw error;
    }
  }

  async validateServerHealth() {
    return this.runTest('Server Health Check', async () => {
      const response = await axios.get('/');
      if (response.data.message === 'ERP API is running') {
        return { status: 'healthy', version: response.data.version };
      }
      throw new Error('Server not responding correctly');
    });
  }

  async validateAuthentication() {
    return this.runTest('Authentication Check', async () => {
      const response = await axios.get('/procurement/purchase-requisition');
      // If we get data or proper auth error, auth is working
      return { authenticated: true, hasData: !!response.data.data };
    });
  }

  async validateSupplierCRUD() {
    let supplierId;
    
    // Create Supplier
    const createResult = await this.runTest('Create Supplier', async () => {
      const response = await axios.post('/procurement/supplier', TEST_CONFIG.SUPPLIER_DATA);
      if (!response.data.success) {
        throw new Error('Failed to create supplier');
      }
      supplierId = response.data.data.id;
      return { id: supplierId, supplier: response.data.data };
    });

    // Read Supplier
    await this.runTest('Read Supplier', async () => {
      const response = await axios.get(`/procurement/supplier/${supplierId}`);
      if (!response.data.success) {
        throw new Error('Failed to read supplier');
      }
      return { supplier: response.data.data };
    });

    // Update Supplier
    await this.runTest('Update Supplier', async () => {
      const updateData = { ...TEST_CONFIG.SUPPLIER_DATA, tradeName: 'Updated Test Supplier' };
      const response = await axios.put(`/procurement/supplier/${supplierId}`, updateData);
      if (!response.data.success) {
        throw new Error('Failed to update supplier');
      }
      return { updated: true };
    });

    return supplierId;
  }

  async validatePurchaseRequisitionWorkflow() {
    let prId;

    // Create Purchase Requisition
    const createResult = await this.runTest('Create Purchase Requisition', async () => {
      const response = await axios.post('/procurement/purchase-requisition', TEST_CONFIG.PURCHASE_REQUISITION_DATA);
      if (!response.data.success) {
        throw new Error('Failed to create purchase requisition');
      }
      prId = response.data.data.id;
      return { id: prId, pr: response.data.data };
    });

    // Read Purchase Requisition
    await this.runTest('Read Purchase Requisition', async () => {
      const response = await axios.get(`/procurement/purchase-requisition/${prId}`);
      if (!response.data.success) {
        throw new Error('Failed to read purchase requisition');
      }
      return { pr: response.data.data };
    });

    // Submit for Approval
    await this.runTest('Submit Purchase Requisition', async () => {
      const response = await axios.put(`/procurement/purchase-requisition/${prId}/submit`);
      if (!response.data.success) {
        throw new Error('Failed to submit purchase requisition');
      }
      return { submitted: true, status: response.data.data.status };
    });

    return prId;
  }

  async validateRFQWorkflow(prId) {
    // Create RFQ from PR
    return this.runTest('Create RFQ from Purchase Requisition', async () => {
      const rfqData = {
        title: 'Test RFQ from PR',
        description: 'RFQ created from test purchase requisition',
        bidSubmissionDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        suppliers: []
      };
      
      const response = await axios.post(`/procurement/rfq/from-pr/${prId}`, rfqData);
      if (!response.data.success) {
        throw new Error('Failed to create RFQ from PR');
      }
      return { rfqId: response.data.data.id, rfq: response.data.data };
    });
  }

  async printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 PROCUREMENT MODULE VALIDATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${this.testResults.total}`);
    console.log(`✅ Passed: ${this.testResults.passed}`);
    console.log(`❌ Failed: ${this.testResults.failed}`);
    console.log(`📊 Success Rate: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(1)}%`);
    
    if (this.testResults.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.testResults.details
        .filter(test => test.status === 'FAILED')
        .forEach(test => {
          console.log(`   • ${test.name}: ${test.error}`);
        });
    }
    
    console.log('\n🚀 NEXT STEPS:');
    if (this.testResults.failed === 0) {
      console.log('✅ All tests passed! Procurement module is ready for production.');
      console.log('✅ You can now test the frontend UI and complete workflows.');
    } else {
      console.log('❌ Some tests failed. Please check the errors above and fix issues.');
    }
    
    console.log('\n📋 TEST RESULTS SAVED TO: procurement-validation-results.json');
  }

  async saveResults() {
    const fs = require('fs');
    const results = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.testResults.total,
        passed: this.testResults.passed,
        failed: this.testResults.failed,
        successRate: ((this.testResults.passed / this.testResults.total) * 100).toFixed(1) + '%'
      },
      tests: this.testResults.details
    };
    
    fs.writeFileSync('procurement-validation-results.json', JSON.stringify(results, null, 2));
  }
}

async function main() {
  console.log('🚀 PROCUREMENT MODULE - FINAL VALIDATION TEST');
  console.log('============================================');
  
  if (TEST_CONFIG.JWT_TOKEN === 'YOUR_JWT_TOKEN_HERE') {
    console.log('❌ ERROR: Please update JWT_TOKEN in the script with a valid token from login');
    console.log('💡 Steps to get token:');
    console.log('   1. Start the frontend server');
    console.log('   2. Login to the application');
    console.log('   3. Check browser DevTools -> Application -> Local Storage');
    console.log('   4. Copy the JWT token and update this script');
    process.exit(1);
  }

  const validator = new ProcurementValidator();
  
  try {
    // Core validation tests
    await validator.validateServerHealth();
    await validator.validateAuthentication();
    
    // CRUD operations
    const supplierId = await validator.validateSupplierCRUD();
    const prId = await validator.validatePurchaseRequisitionWorkflow();
    
    // Advanced workflows
    await validator.validateRFQWorkflow(prId);
    
    // Cleanup (optional)
    console.log('\n🧹 Cleaning up test data...');
    try {
      await axios.delete(`/procurement/supplier/${supplierId}`);
      console.log('✅ Test supplier deleted');
    } catch (error) {
      console.log('⚠️ Could not delete test supplier (may require admin privileges)');
    }
    
  } catch (error) {
    console.log(`\n❌ Critical test failure: ${error.message}`);
  } finally {
    await validator.printSummary();
    await validator.saveResults();
  }
}

// Run the validation
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ProcurementValidator, TEST_CONFIG };
