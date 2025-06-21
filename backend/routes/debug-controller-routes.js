const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Route to test controllers directly
router.get('/debug/controller/:controller/:method', async (req, res) => {
  try {
    const { controller, method } = req.params;
    const controllerPath = path.join(__dirname, '..', 'controllers', `${controller}.js`);

    // Check if controller file exists
    if (!fs.existsSync(controllerPath)) {
      return res.status(404).json({
        success: false,
        message: `Controller '${controller}' not found`
      });
    }

    // Load the controller
    const controllerModule = require(controllerPath);

    // Check if the method exists on the controller
    if (!controllerModule[method]) {
      return res.status(404).json({
        success: false,
        message: `Method '${method}' not found on controller '${controller}'`
      });
    }

    // Add mock user for authentication if needed
    req.user = req.user || { 
      id: process.env.DEBUG_USER_ID || '0b4afa3e-8582-452b-833c-f8bf695c4d60', 
      role: 'admin',
      email: 'admin@erp.com'
    };

    // Create a mock response to capture the output
    const mockRes = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.responseData = data;
        return this;
      },
      send: function(data) {
        this.responseData = data;
        return this;
      }
    };

    // Call the controller method
    await controllerModule[method](req, mockRes);

    // Return the captured response
    return res.status(mockRes.statusCode || 200).json({
      success: true,
      controllerResponse: mockRes.responseData,
      statusCode: mockRes.statusCode
    });
  } catch (error) {
    console.error(`❌ Error in debug controller route:`, error);
    return res.status(500).json({
      success: false,
      message: 'Error executing controller method',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;