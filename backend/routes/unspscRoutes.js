const express = require('express');
const { UnspscCode } = require('../models/sequelize');
const { Op } = require('sequelize');
const router = express.Router();

// Get all UNSPSC codes
router.get('/', async (req, res) => {
  try {
    console.log('Fetching UNSPSC codes...');
    const unspscCodes = await UnspscCode.findAll({
      attributes: ['id', 'code', 'segment', 'family', 'class', 'commodity', 'title', 'level'],
      order: [['code', 'ASC']],
    });
    
    console.log(`Found ${unspscCodes.length} UNSPSC codes`);
    res.json(unspscCodes);
  } catch (error) {
    console.error('Error fetching UNSPSC codes:', error);
    res.status(500).json({ message: 'Failed to fetch UNSPSC codes', error: error.message });
  }
});

// Get UNSPSC codes by level (segment, family, class, commodity)
router.get('/level/:level', async (req, res) => {
  try {
    const { level } = req.params;
    const validLevels = ['SEGMENT', 'FAMILY', 'CLASS', 'COMMODITY'];
    
    if (!validLevels.includes(level.toUpperCase())) {
      return res.status(400).json({ message: 'Invalid level. Must be one of: SEGMENT, FAMILY, CLASS, COMMODITY' });
    }
    
    const unspscCodes = await UnspscCode.findAll({
      where: { level: level.toUpperCase() },
      attributes: ['id', 'code', 'segment', 'family', 'class', 'commodity', 'title'],
      order: [['code', 'ASC']],
    });
    
    res.json(unspscCodes);
  } catch (error) {
    console.error(`Error fetching ${req.params.level} UNSPSC codes:`, error);
    res.status(500).json({ message: `Failed to fetch ${req.params.level} UNSPSC codes`, error: error.message });
  }
});

// Get UNSPSC family codes for a specific segment
router.get('/families/:segment', async (req, res) => {
  try {
    const { segment } = req.params;
    
    const families = await UnspscCode.findAll({
      where: { 
        segment,
        family: { [Op.ne]: '00' },
        class: '00',
        commodity: '00'
      },
      attributes: ['id', 'code', 'segment', 'family', 'title'],
      order: [['family', 'ASC']],
    });
    
    res.json(families);
  } catch (error) {
    console.error(`Error fetching families for segment ${req.params.segment}:`, error);
    res.status(500).json({ message: 'Failed to fetch families', error: error.message });
  }
});

// Get UNSPSC class codes for a specific segment and family
router.get('/classes/:segment/:family', async (req, res) => {
  try {
    const { segment, family } = req.params;
    
    const classes = await UnspscCode.findAll({
      where: { 
        segment,
        family,
        class: { [Op.ne]: '00' },
        commodity: '00'
      },
      attributes: ['id', 'code', 'segment', 'family', 'class', 'title'],
      order: [['class', 'ASC']],
    });
    
    res.json(classes);
  } catch (error) {
    console.error(`Error fetching classes for segment ${req.params.segment} and family ${req.params.family}:`, error);
    res.status(500).json({ message: 'Failed to fetch classes', error: error.message });
  }
});

// Get UNSPSC commodity codes for a specific segment, family, and class
router.get('/commodities/:segment/:family/:class', async (req, res) => {
  try {
    const { segment, family, class: classCode } = req.params;
    
    const commodities = await UnspscCode.findAll({
      where: { 
        segment,
        family,
        class: classCode,
        commodity: { [Op.ne]: '00' }
      },
      attributes: ['id', 'code', 'segment', 'family', 'class', 'commodity', 'title'],
      order: [['commodity', 'ASC']],
    });
      res.json(commodities);
  } catch (error) {
    console.error(`Error fetching commodities:`, error);
    res.status(500).json({ message: 'Failed to fetch commodities', error: error.message });
  }
});

// Get UNSPSC by specific code
router.get('/code/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    const unspscCode = await UnspscCode.findOne({
      where: { code },
      attributes: ['id', 'code', 'segment', 'family', 'class', 'commodity', 'title', 'level'],
    });
    
    if (!unspscCode) {
      return res.status(404).json({ message: 'UNSPSC code not found' });
    }
    
    res.json(unspscCode);
  } catch (error) {
    console.error(`Error fetching UNSPSC code ${req.params.code}:`, error);
    res.status(500).json({ message: 'Failed to fetch UNSPSC code', error: error.message });
  }
});

// Get or create UNSPSC code from direct input (code or path)
router.post('/direct', async (req, res) => {
  try {
    const { input } = req.body;
    
    // Check if input is empty
    if (!input || typeof input !== 'string') {
      return res.status(400).json({ 
        success: false, 
        message: 'Input is required and must be a string' 
      });
    }
    
    let code;
    
    // Check if the input is a direct 8-digit code
    if (/^\d{8}$/.test(input)) {
      code = input;
    } 
    // Check if the input is a path format (e.g., 43/21/17/06)
    else if (/^\d{2}\/\d{2}\/\d{2}\/\d{2}$/.test(input)) {
      code = input.replace(/\//g, '');
    }
    // Check if the input is a path without slashes but with correct grouping (e.g., 43211706)
    else if (/^\d{2}\d{2}\d{2}\d{2}$/.test(input)) {
      code = input;
    }
    else {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid input format. Must be an 8-digit code or path (e.g., 43/21/17/06)' 
      });
    }
    
    console.log(`Processing UNSPSC direct input: ${input}, converted to code: ${code}`);
    
    // Check if the code already exists in the database
    let unspscCode = await UnspscCode.findOne({
      where: { code },
      attributes: ['id', 'code', 'segment', 'family', 'class', 'commodity', 'title', 'level'],
    });
    
    // If the code doesn't exist, create a simple entry
    if (!unspscCode) {
      console.log(`UNSPSC code ${code} not found, creating a new entry`);
      const segment = code.substring(0, 2);
      const family = code.substring(2, 4);
      const classCode = code.substring(4, 6);
      const commodity = code.substring(6, 8);
      
      // Create a new code with generic title
      unspscCode = await UnspscCode.create({
        code,
        segment,
        family,
        class: classCode,
        commodity,
        title: `Manual UNSPSC Code: ${segment}/${family}/${classCode}/${commodity}`,
        definition: `Manually entered UNSPSC code: ${code}`,
        level: 'COMMODITY', // Always treat direct input as commodity level
        isActive: true
      });
      
      console.log(`Created new UNSPSC code: ${code} with ID: ${unspscCode.id}`);
    } else {
      console.log(`Found existing UNSPSC code: ${code} with ID: ${unspscCode.id}`);
    }
    
    return res.json({
      success: true,
      data: unspscCode
    });
    
  } catch (error) {
    console.error('Error processing direct UNSPSC input:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to process UNSPSC input', 
      error: error.message 
    });
  }
});

module.exports = router;