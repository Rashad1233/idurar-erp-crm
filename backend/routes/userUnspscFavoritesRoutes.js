// This is a temporary fixed version with duplicate function removed
const express = require('express');
const { UserUnspscFavorite, UnspscCode } = require('../models/sequelize');
const { Op } = require('sequelize');
const { protect } = require('../middleware/authMiddleware');
const { ensureUnspscCodeExists } = require('../utils/unspscUtils');
const router = express.Router();

// Helper function to generate hierarchy titles using AI
async function generateHierarchyTitlesWithAI(unspscCode) {
  if (!unspscCode || unspscCode.length !== 8) {
    return {
      segmentTitle: null,
      familyTitle: null,
      classTitle: null,
      commodityTitle: null
    };
  }

  // Extract the components from the UNSPSC code
  const segment = unspscCode.substring(0, 2);
  const family = unspscCode.substring(2, 4);
  const classCode = unspscCode.substring(4, 6);
  const commodity = unspscCode.substring(6, 8);

  try {
    // Call DeepSeek API
    const axios = require('axios');
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are an AI expert in UNSPSC (United Nations Standard Products and Services Code) classification. Your task is to provide accurate hierarchy titles for UNSPSC codes that may not be in the standard database.'
          },
          {
            role: 'user',
            content: `Please generate hierarchy titles for the following UNSPSC code: ${unspscCode}

The code breaks down into:
- Segment: ${segment}
- Family: ${family}
- Class: ${classCode}
- Commodity: ${commodity}

Return the hierarchy titles in JSON format:
{
  "segmentTitle": "...",
  "familyTitle": "...",
  "classTitle": "...",
  "commodityTitle": "..."
}

If you're uncertain about any level, make your best educated guess based on the UNSPSC structure and the code itself.`
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        }
      }
    );

    // Extract JSON from the response
    try {
      const responseContent = response.data.choices[0]?.message?.content;
      const hierarchyTitles = JSON.parse(responseContent);
      
      console.log('Generated hierarchy titles with AI:');
      console.log(`- Segment: ${hierarchyTitles.segmentTitle}`);
      console.log(`- Family: ${hierarchyTitles.familyTitle}`);
      console.log(`- Class: ${hierarchyTitles.classTitle}`);
      console.log(`- Commodity: ${hierarchyTitles.commodityTitle}`);
      
      return hierarchyTitles;
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      return {
        segmentTitle: null,
        familyTitle: null,
        classTitle: null,
        commodityTitle: null
      };
    }
  } catch (error) {
    console.error('Error calling DeepSeek API:', error.message);
    return {
      segmentTitle: null,
      familyTitle: null,
      classTitle: null,
      commodityTitle: null
    };
  }
}

// Helper function to fetch hierarchy titles
async function fetchHierarchyTitles(unspscCode) {
  if (!unspscCode || unspscCode.length !== 8) {
    return {
      segmentTitle: null,
      familyTitle: null,
      classTitle: null,
      commodityTitle: null
    };
  }

  const segmentCode = unspscCode.substring(0, 2) + '000000';
  const familyCode = unspscCode.substring(0, 4) + '0000';
  const classCode = unspscCode.substring(0, 6) + '00';
  const commodityCode = unspscCode;

  try {
    // Fetch all hierarchy levels
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
    console.error('Error fetching hierarchy titles:', error);
    return {
      segmentTitle: null,
      familyTitle: null,
      classTitle: null,
      commodityTitle: null
    };
  }
}

// Get all favorites for the current user
router.get('/', protect, async (req, res) => {
  try {
    const favorites = await UserUnspscFavorite.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    
    // Check for favorites that need hierarchy generation
    const favoritesNeedingHierarchy = favorites.filter(favorite => 
      !favorite.segmentTitle || !favorite.familyTitle || 
      !favorite.classTitle || !favorite.commodityTitle
    );
      // If there are favorites needing hierarchy titles, generate them in the background
    if (favoritesNeedingHierarchy.length > 0) {
      console.log(`Found ${favoritesNeedingHierarchy.length} favorites missing hierarchy titles. Will generate in background...`);
      
      // Process in background (don't await)
      (async () => {
        for (const favorite of favoritesNeedingHierarchy) {
          try {
            console.log(`Generating hierarchy for ${favorite.name} (${favorite.unspscCode})...`);
            const aiTitles = await generateHierarchyTitlesWithAI(favorite.unspscCode);
            
            if (aiTitles) {
              await favorite.update({
                segmentTitle: aiTitles.segmentTitle || favorite.segmentTitle,
                familyTitle: aiTitles.familyTitle || favorite.familyTitle,
                classTitle: aiTitles.classTitle || favorite.classTitle,
                commodityTitle: aiTitles.commodityTitle || favorite.commodityTitle
              });
              
              // Ensure code exists in database for hierarchy selection
              console.log(`Ensuring UNSPSC code ${favorite.unspscCode} exists in database...`);
              await ensureUnspscCodeExists(favorite.unspscCode, aiTitles);
              
              console.log(`Updated hierarchy for ${favorite.name} (${favorite.unspscCode})`);
            }
          } catch (err) {
            console.error(`Error generating hierarchy for ${favorite.name}:`, err);
          }
        }
      })();
    }
    
    // Return the favorites immediately, even if hierarchy generation is in progress
    res.json({
      success: true,
      data: favorites
    });
  } catch (error) {
    console.error('Error fetching user UNSPSC favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch favorites',
      error: error.message
    });
  }
});

// Save a new favorite
router.post('/', protect, async (req, res) => {
  try {
    const { name, description, unspscCode, level, title, segment, family, class: classCode, commodity, isDefault } = req.body;
    
    // Validate required fields
    if (!name || !unspscCode || !level || !title) {
      return res.status(400).json({
        success: false,
        message: 'Name, UNSPSC code, level, and title are required'
      });
    }

    // Fetch hierarchy titles from the database
    const hierarchyTitles = await fetchHierarchyTitles(unspscCode);
    
    // If titles not found, fall back to AI generation
    if (!hierarchyTitles.segmentTitle || !hierarchyTitles.familyTitle || !hierarchyTitles.classTitle || !hierarchyTitles.commodityTitle) {
      console.log('Hierarchy titles not found in database, generating with AI...');
      const aiHierarchyTitles = await generateHierarchyTitlesWithAI(unspscCode);
      
      // Use AI-generated titles
      hierarchyTitles.segmentTitle = hierarchyTitles.segmentTitle || aiHierarchyTitles.segmentTitle;
      hierarchyTitles.familyTitle = hierarchyTitles.familyTitle || aiHierarchyTitles.familyTitle;
      hierarchyTitles.classTitle = hierarchyTitles.classTitle || aiHierarchyTitles.classTitle;
      hierarchyTitles.commodityTitle = hierarchyTitles.commodityTitle || aiHierarchyTitles.commodityTitle;
      
      // Ensure the code exists in the database for hierarchy selection
      console.log(`Ensuring UNSPSC code ${unspscCode} exists in database with AI-generated titles...`);
      await ensureUnspscCodeExists(unspscCode, hierarchyTitles);
    } else {
      // Even if we have hierarchy titles from the database, ensure all hierarchy levels exist
      console.log(`Ensuring UNSPSC code ${unspscCode} exists in database with existing titles...`);
      await ensureUnspscCodeExists(unspscCode, hierarchyTitles);
    }
    
    // Create the favorite with hierarchy titles
    const favorite = await UserUnspscFavorite.create({
      userId: req.user.id,
      name,
      description,
      unspscCode,
      level,
      title,
      segment,
      segmentTitle: hierarchyTitles.segmentTitle,
      family,
      familyTitle: hierarchyTitles.familyTitle,
      class: classCode, // 'class' is a reserved keyword in JavaScript
      classTitle: hierarchyTitles.classTitle,
      commodity,
      commodityTitle: hierarchyTitles.commodityTitle,
      isDefault: isDefault || false
    });
    
    res.status(201).json({
      success: true,
      message: 'Favorite saved successfully',
      data: favorite
    });
  } catch (error) {
    console.error('Error saving UNSPSC favorite:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save favorite',
      error: error.message
    });
  }
});

// The utility function is already imported at the top

// Get a specific favorite by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const favorite = await UserUnspscFavorite.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found'
      });
    }
    
    // Check if we need to generate hierarchy titles using AI
    const needsHierarchyGeneration = !favorite.segmentTitle || !favorite.familyTitle || 
                                   !favorite.classTitle || !favorite.commodityTitle;
                                   
    if (needsHierarchyGeneration) {
      console.log(`Favorite ${favorite.name} (${favorite.unspscCode}) is missing hierarchy titles. Generating with AI...`);
      
      // Generate hierarchy titles with AI
      const aiTitles = await generateHierarchyTitlesWithAI(favorite.unspscCode);
      
      if (aiTitles) {
        // Update the favorite with AI-generated titles
        await favorite.update({
          segmentTitle: aiTitles.segmentTitle || favorite.segmentTitle,
          familyTitle: aiTitles.familyTitle || favorite.familyTitle,
          classTitle: aiTitles.classTitle || favorite.classTitle,
          commodityTitle: aiTitles.commodityTitle || favorite.commodityTitle
        });
        
        console.log('Updated favorite with AI-generated hierarchy titles');
        
        // Also ensure the code exists in the database for hierarchy selection
        console.log(`Ensuring UNSPSC code ${favorite.unspscCode} exists in database...`);
        const codeUuid = await ensureUnspscCodeExists(favorite.unspscCode, aiTitles);
        if (codeUuid) {
          console.log(`UNSPSC code ${favorite.unspscCode} is now available in the database with UUID: ${codeUuid}`);
        }
      }
    } else {
      // Even if we have hierarchy titles, still ensure the code exists in database
      // This enables the hierarchy selection in the form
      const existingHierarchy = {
        segmentTitle: favorite.segmentTitle,
        familyTitle: favorite.familyTitle,
        classTitle: favorite.classTitle,
        commodityTitle: favorite.commodityTitle
      };
      
      await ensureUnspscCodeExists(favorite.unspscCode, existingHierarchy);
    }
    
    res.json({
      success: true,
      data: favorite
    });
  } catch (error) {
    console.error('Error fetching UNSPSC favorite:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch favorite',
      error: error.message
    });
  }
});

// Update a favorite
router.put('/:id', protect, async (req, res) => {
  try {
    const { name, description, isDefault } = req.body;
    
    // Find the favorite
    const favorite = await UserUnspscFavorite.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found'
      });
    }
    
    // Update the favorite
    await favorite.update({
      name: name || favorite.name,
      description: description !== undefined ? description : favorite.description,
      isDefault: isDefault !== undefined ? isDefault : favorite.isDefault
    });
      // If setting this as default, unset other defaults
    if (isDefault) {
      await UserUnspscFavorite.update(
        { isDefault: false },
        {
          where: {
            userId: req.user.id,
            id: { [Op.ne]: req.params.id }
          }
        }
      );
    }
    
    res.json({
      success: true,
      message: 'Favorite updated successfully',      data: favorite
    });
  } catch (error) {
    console.error('Error updating UNSPSC favorite:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update favorite',
      error: error.message
    });
  }
});

// Delete a favorite
router.delete('/:id', protect, async (req, res) => {
  try {
    const result = await UserUnspscFavorite.destroy({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (result === 0) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found'
      });
    }    
    res.json({
      success: true,
      message: 'Favorite deleted successfully',
      data: { id: req.params.id }
    });
  } catch (error) {
    console.error('Error deleting UNSPSC favorite:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete favorite',
      error: error.message
    });
  }
});

module.exports = router;
