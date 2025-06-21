const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const aiUsageController = require('../controllers/aiUsageController');

// Route to analyze item image
router.post('/analyze-item-image', 
  aiController.uploadMiddleware,
  aiController.analyzeItemImage
);

// Route to generate item description
router.post('/generate-description', aiController.generateDescription);

// Route for smart search with natural language
router.post('/smart-search', aiController.smartSearch);

// Route to get AI usage statistics
router.get('/usage-stats', aiUsageController.getUsageStats);

// Route to generate PR comments/purpose
router.post('/generate-pr-comments', aiController.generatePRComments);

// Route to generate supplier recommendations
router.post('/generate-supplier-recommendations', aiController.generateSupplierRecommendations);

// Route to enhance item description with AI
router.post('/enhance-item-description', aiController.enhanceItemDescription);

// Route to generate complete item master data with AI
router.post('/generate-complete-item', aiController.generateCompleteItemData);

// Route to generate item content (descriptions and suggestions)
router.post('/generate-item-content', aiController.generateItemContent);

// Route to analyze UNSPSC codes
router.post('/analyze-unspsc', aiController.analyzeUNSPSC);

module.exports = router;
