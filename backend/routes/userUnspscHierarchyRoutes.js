const express = require('express');
const { UserUnspscHierarchy, UnspscCode } = require('../models/sequelize');
const { Op } = require('sequelize');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Helper function to fetch hierarchy titles
async function fetchHierarchyTitles(unspscCode) {
  try {
    const segmentCode = unspscCode.substring(0, 2) + '000000';
    const familyCode = unspscCode.substring(0, 4) + '0000';
    const classCode = unspscCode.substring(0, 6) + '00';
    const commodityCode = unspscCode;

    const [segment, family, classLevel, commodity] = await Promise.all([
      UnspscCode.findOne({ where: { code: segmentCode, level: 'SEGMENT' } }),
      UnspscCode.findOne({ where: { code: familyCode, level: 'FAMILY' } }),
      UnspscCode.findOne({ where: { code: classCode, level: 'CLASS' } }),
      UnspscCode.findOne({ where: { code: commodityCode, level: 'COMMODITY' } })
    ]);

    return {
      segmentTitle: segment?.title || null,
      familyTitle: family?.title || null,
      classTitle: classLevel?.title || null,
      commodityTitle: commodity?.title || null
    };
  } catch (error) {
    console.error('Error fetching hierarchy titles for', unspscCode, ':', error);
    return {
      segmentTitle: null,
      familyTitle: null,
      classTitle: null,
      commodityTitle: null
    };
  }
}

// Get user's UNSPSC hierarchy entries by level
router.get('/by-level/:level', protect, async (req, res) => {
  try {
    const { level } = req.params;
    
    if (!['SEGMENT', 'FAMILY', 'CLASS', 'COMMODITY'].includes(level)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid level. Must be one of SEGMENT, FAMILY, CLASS, COMMODITY'
      });
    }
    
    const hierarchyEntries = await UserUnspscHierarchy.findAll({
      where: { 
        userId: req.user.id,
        level: level
      },
      order: [
        ['useFrequency', 'DESC'], 
        ['lastUsed', 'DESC']
      ],
      limit: 100
    });
    
    res.json({
      success: true,
      data: hierarchyEntries
    });
  } catch (error) {
    console.error('Error fetching user UNSPSC hierarchy by level:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hierarchy entries',
      error: error.message
    });
  }
});

// Get user's UNSPSC hierarchy entries by parent code
router.get('/children/:parentCode/:level', protect, async (req, res) => {
  try {
    const { parentCode, level } = req.params;
    let whereClause = { userId: req.user.id };
    
    // Determine what we're filtering by based on the requested level
    switch (level) {
      case 'FAMILY':
        whereClause.segment = parentCode.substring(0, 2);
        whereClause.level = 'FAMILY';
        break;
      case 'CLASS':
        whereClause.family = parentCode.substring(0, 4);
        whereClause.level = 'CLASS';
        break;
      case 'COMMODITY':
        whereClause.class = parentCode.substring(0, 6);
        whereClause.level = 'COMMODITY';
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid level. Must be one of FAMILY, CLASS, COMMODITY'
        });
    }
    
    const hierarchyEntries = await UserUnspscHierarchy.findAll({
      where: whereClause,
      order: [
        ['useFrequency', 'DESC'], 
        ['lastUsed', 'DESC']
      ],
      limit: 100
    });
    
    // If user doesn't have any entries for this parent, get some from the global UNSPSC codes
    if (hierarchyEntries.length === 0) {
      let unspscWhereClause = {};
        switch (level) {
        case 'FAMILY':
          unspscWhereClause = {
            code: { [Op.like]: `${parentCode.substring(0, 2)}__0000` },
            level: 'FAMILY'
          };
          break;
        case 'CLASS':
          unspscWhereClause = {
            code: { [Op.like]: `${parentCode.substring(0, 4)}__00` },
            level: 'CLASS'
          };
          break;
        case 'COMMODITY':
          unspscWhereClause = {
            code: { [Op.like]: `${parentCode.substring(0, 6)}__` },
            level: 'COMMODITY'
          };
          break;
      }
      
      const unspscCodes = await UnspscCode.findAll({
        where: unspscWhereClause,
        limit: 20
      });
      
      return res.json({
        success: true,
        source: 'global',
        data: unspscCodes.map(code => ({
          unspscCode: code.code,
          level: code.level,
          title: code.title,
          segment: code.segment,
          family: code.family,
          class: code.class,
          commodity: code.commodity
        }))
      });
    }
    
    res.json({
      success: true,
      source: 'user',
      data: hierarchyEntries
    });
  } catch (error) {
    console.error('Error fetching user UNSPSC hierarchy children:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hierarchy entries',
      error: error.message
    });
  }
});

// Add or update a UNSPSC code to user's hierarchy
router.post('/', protect, async (req, res) => {
  try {
    const { unspscCode, level, title, segment, family, class: classCode, commodity } = req.body;
    
    if (!unspscCode || !level || !title) {
      return res.status(400).json({
        success: false,
        message: 'UNSPSC code, level, and title are required'
      });
    }
    
    // Fetch hierarchy titles
    const hierarchyTitles = await fetchHierarchyTitles(unspscCode);
    
    // Check if this code already exists for the user
    const [hierarchyEntry, created] = await UserUnspscHierarchy.findOrCreate({
      where: {
        userId: req.user.id,
        unspscCode
      },
      defaults: {
        userId: req.user.id,
        unspscCode,
        level,
        title,
        segment,
        segmentTitle: hierarchyTitles.segmentTitle,
        family,
        familyTitle: hierarchyTitles.familyTitle,
        class: classCode,
        classTitle: hierarchyTitles.classTitle,
        commodity,
        commodityTitle: hierarchyTitles.commodityTitle,
        useFrequency: 1,
        lastUsed: new Date()
      }
    });
    
    if (!created) {
      // Update frequency and last used date
      await hierarchyEntry.update({
        useFrequency: hierarchyEntry.useFrequency + 1,
        lastUsed: new Date()
      });
    }
    
    res.json({
      success: true,
      message: created ? 'UNSPSC code added to user hierarchy' : 'UNSPSC code usage updated',
      data: hierarchyEntry
    });
  } catch (error) {
    console.error('Error adding to user UNSPSC hierarchy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add UNSPSC code to hierarchy',
      error: error.message
    });
  }
});

// Delete a UNSPSC code from user's hierarchy
router.delete('/:id', protect, async (req, res) => {
  try {
    const hierarchyEntry = await UserUnspscHierarchy.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!hierarchyEntry) {
      return res.status(404).json({
        success: false,
        message: 'Hierarchy entry not found'
      });
    }
    
    await hierarchyEntry.destroy();
    
    res.json({
      success: true,
      message: 'UNSPSC code removed from hierarchy',
      data: { id: req.params.id }
    });
  } catch (error) {
    console.error('Error deleting from user UNSPSC hierarchy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove UNSPSC code from hierarchy',
      error: error.message
    });
  }
});

// Clear user's hierarchy entries
router.delete('/clear/:level', protect, async (req, res) => {
  try {
    const { level } = req.params;
    let whereClause = { userId: req.user.id };
    
    if (level && level !== 'ALL') {
      if (!['SEGMENT', 'FAMILY', 'CLASS', 'COMMODITY'].includes(level)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid level. Must be one of SEGMENT, FAMILY, CLASS, COMMODITY, or ALL'
        });
      }
      whereClause.level = level;
    }
    
    const deletedCount = await UserUnspscHierarchy.destroy({
      where: whereClause
    });
    
    res.json({
      success: true,
      message: `Removed ${deletedCount} entries from user's UNSPSC hierarchy`,
      data: { count: deletedCount }
    });
  } catch (error) {
    console.error('Error clearing user UNSPSC hierarchy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear hierarchy entries',
      error: error.message
    });
  }
});

module.exports = router;
