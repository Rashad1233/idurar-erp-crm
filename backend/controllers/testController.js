// Simplified controller for testing

// Test model imports
let models;
try {
  console.log('Attempting to import models...');
  models = require('../models/sequelize');
  console.log('Models imported successfully:', Object.keys(models));
} catch (error) {
  console.error('Error importing models:', error);
}

// Simple function without model imports
exports.testFunction = async (req, res) => {
  console.log('🧪 TEST FUNCTION CALLED');
  try {
    res.status(200).json({
      success: true,
      message: 'Test function works',
      timestamp: new Date().toISOString(),
      modelsAvailable: models ? Object.keys(models) : 'Models not available'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error in test function',
      error: error.message
    });
  }
};
