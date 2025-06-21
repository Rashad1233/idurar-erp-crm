const express = require('express');
const router = express.Router();
const { sequelize } = require('../models/sequelize');
const { v4: uuidv4 } = require('uuid');
const OpenAIService = require('../services/openAIService');

// Helper functions to provide meaningful titles for UNSPSC hierarchy levels
function getSegmentTitle(segmentCode) {
  const segmentTitles = {
    '10': 'Live Plant and Animal Material and Accessories and Supplies',
    '11': 'Mineral and Textile and Inedible Plant and Animal Materials',
    '12': 'Chemicals including Bio Chemicals and Gas Materials',
    '13': 'Resin and Rosin and Rubber and Foam and Film and Elastomeric Materials',
    '14': 'Paper Materials and Products',
    '15': 'Fuels and Fuel Additives and Lubricants and Anti corrosive Materials',
    '20': 'Mining and Well Drilling Machinery and Accessories',
    '21': 'Farming and Fishing and Forestry and Wildlife Machinery and Accessories',
    '22': 'Building and Construction and Maintenance Machinery and Accessories',
    '23': 'Material Handling and Conditioning and Storage Machinery and Accessories',
    '24': 'Commercial and Military and Private Vehicles and their Accessories and Components',
    '25': 'Tools and General Machinery',
    '26': 'Power Generation and Distribution Machinery and Accessories',
    '27': 'Tools and General Machinery',
    '30': 'Structures and Building and Construction and Manufacturing Components and Supplies',
    '31': 'Manufacturing Components and Supplies',
    '32': 'Electronic Components and Supplies',
    '39': 'Electrical Systems and Lighting and Components and Accessories and Supplies',
    '40': 'Distribution and Conditioning Systems and Equipment and Components',
    '41': 'Laboratory and Measuring and Observing and Testing Equipment',
    '42': 'Medical Equipment and Accessories and Supplies',
    '43': 'Information Technology Broadcasting and Telecommunications',
    '44': 'Office Equipment and Accessories and Supplies',
    '45': 'Printing and Photographic and Audio and Visual Equipment and Supplies',
    '46': 'Musical Instruments and Games and Toys and Arts and Crafts and Educational Equipment and Materials and Accessories and Supplies',
    '47': 'Cleaning Equipment and Supplies',
    '48': 'Service Industry Machinery and Equipment and Supplies',
    '49': 'Sports and Recreational Equipment and Supplies and Accessories',
    '50': 'Food Beverage and Tobacco Products',
    '51': 'Drugs and Pharmaceutical Products',
    '52': 'Personal Care and Domestic Products',
    '53': 'Durable goods, nonfood',
    '54': 'Timepieces and Jewelry and Gemstone Products',
    '55': 'Published Products',
    '56': 'Furniture and Furnishings',
    '60': 'Musical Instruments and Games and Toys and Arts and Crafts and Educational Equipment and Materials and Accessories and Supplies',
    '70': 'Farming and Fishing and Forestry and Wildlife Contracting Services',
    '71': 'Mining and oil and gas services',
    '72': 'Building and Construction and Maintenance Services',
    '73': 'Industrial Production and Manufacturing Services',
    '76': 'Administrative and Support Services',
    '77': 'News and Entertainment and Education and Information Services',
    '78': 'Travel and Food and Lodging and Entertainment Services',
    '80': 'Management and Business Professionals and Administrative Services',
    '81': 'Engineering and Research and Technology Based Services',
    '82': 'Editorial and Design and Graphic and Fine Art Services',
    '83': 'Public Utilities and Public Sector Related Services',
    '84': 'Financial and Insurance Services',
    '85': 'Healthcare Services',
    '86': 'Military and Security and Civil Defense Services'
  };
  
  return segmentTitles[segmentCode] || `Segment ${segmentCode}`;
}

function getFamilyTitle(familyCode) {
  const families = {
    '4321': 'Computer Equipment and Accessories',
    '4322': 'Telecommunications Equipment and Accessories',
    '4323': 'Audio and Visual Equipment',
    '4324': 'Broadcasting Equipment',
    '4325': 'Point of Sale Equipment',
    '4326': 'Bar Coding Equipment',
    '4327': 'Scanners',
    '4328': 'Input Devices',
    '4329': 'Storage Devices',
    '4410': 'Computers and Computer Peripherals',
    '5312': 'Containers and packaging',
    '5313': 'Apparel and Luggage and Personal Care Products',
    '2411': 'Bottled water'
  };
  
  return families[familyCode] || `Family ${familyCode}`;
}

function getClassTitle(classCode) {
  const classes = {
    '432115': 'Computers',
    '432116': 'Computer Accessories',
    '432117': 'Computer Components',
    '432118': 'Computer Storage',
    '432119': 'Networking Equipment',
    '441015': 'Printers',
    '531217': 'Bottles, jars and containers',
    '241124': 'Bottled water'
  };
  
  return classes[classCode] || `Class ${classCode}`;
}

// Initialize OpenAI service with API key from environment variables
// This key needs to be updated with a valid OpenAI API key
const API_KEY = process.env.OPENAI_API_KEY || 'your-openai-api-key-here';
console.log('Using OpenAI API key:', API_KEY.substring(0, 5) + '...' + API_KEY.substring(API_KEY.length - 4));
const openAIService = new OpenAIService(API_KEY);

// Search UNSPSC codes using AI
router.post('/unspsc/search', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
        results: []
      });
    }    
    console.log(`🔍 AI-powered UNSPSC search for: "${query}"`);
    
    // Call OpenAI service to search for UNSPSC codes
    const results = await openAIService.searchUnspscCodes(query);
    
    // Cache the search results in the database to preserve the original context
    for (const result of results) {
      try {
        // Check if this code already exists in the database
        const [existingCode] = await sequelize.query(
          `SELECT id FROM "UnspscCodes" WHERE code = :code LIMIT 1`,
          {
            replacements: { code: result.unspscCode },
            type: sequelize.QueryTypes.SELECT
          }
        );

        if (!existingCode) {
          // Store the original search result context in the database
          const insertQuery = `
            INSERT INTO "UnspscCodes" (
              "id",
              "code",
              "segment",
              "family",
              "class", 
              "commodity",
              "title",
              "definition",
              "level",
              "isActive",
              "createdAt",
              "updatedAt",
              "created_at",
              "updated_at",
              "is_active"
            ) VALUES (
              :id,
              :code,
              :segment,
              :family,
              :class,
              :commodity,
              :title,
              :definition,
              'COMMODITY',
              true,
              NOW(),
              NOW(),
              NOW(),
              NOW(),
              true
            )`;
          
          await sequelize.query(insertQuery, {
            replacements: {
              id: uuidv4(),
              code: result.unspscCode,
              segment: result.segment.code,
              family: result.family.code.substring(2, 4),
              class: result.class.code.substring(4, 6),
              commodity: result.commodity.code.substring(6, 8),
              title: result.fullTitle,
              definition: result.explanation || 'No description provided'
            },
            type: sequelize.QueryTypes.INSERT
          });
          
          console.log(`✅ Cached search result for code: ${result.unspscCode} - ${result.fullTitle}`);
        }
      } catch (cacheError) {
        console.error(`Warning: Failed to cache search result for ${result.unspscCode}:`, cacheError);
        // Continue with other results even if one fails
      }
    }
    
    return res.status(200).json({
      success: true,
      message: `Found ${results.length} UNSPSC codes matching your search`,
      results
    });
  } catch (error) {
    console.error('Error searching UNSPSC codes:', error);
    return res.status(500).json({
      success: false,
      message: 'Error searching UNSPSC codes: ' + (error.message || 'Unknown error'),
      error: error.message,
      // Include demo results when API fails
      results: openAIService.getMockUnspscResults(req.body.query || '')
    });
  }
});

// Get detailed information about a specific UNSPSC code
router.get('/unspsc/details/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    if (!code || !/^\d{8}$/.test(code)) {
      return res.status(400).json({
        success: false,
        message: 'Valid 8-digit UNSPSC code is required'
      });
    }
    
    console.log(`🔍 Getting detailed information for UNSPSC code: ${code}`);
    
    // First check the database for cached details
    const cachedQuery = `
      SELECT * FROM "UnspscCodes"
      WHERE "code" = :code
      LIMIT 1;
    `;
    
    const cachedResults = await sequelize.query(cachedQuery, {
      replacements: { code },
      type: sequelize.QueryTypes.SELECT
    });      // If we have the code in the database, return it - prioritize database version
    if (cachedResults.length > 0) {
      console.log(`✅ Found cached details for UNSPSC code: ${code}`);
      
      const dbRecord = cachedResults[0];
      
      // Generate meaningful hierarchical information based on the original context
      const segmentCode = dbRecord.code.substring(0, 2);
      const familyCode = dbRecord.code.substring(0, 4);
      const classCode = dbRecord.code.substring(0, 6);
      
      // Use the stored title and definition for context
      const baseDescription = dbRecord.definition || dbRecord.title || 'No description available';        // Format the database results to match the expected response format
      const result = {
        unspscCode: dbRecord.code,
        segment: {
          code: segmentCode,
          title: getSegmentTitle(segmentCode)
        },
        family: {
          code: familyCode,
          title: getFamilyTitle(familyCode)
        },
        class: {
          code: classCode,
          title: getClassTitle(classCode)
        },
        commodity: {
          code: dbRecord.code,
          title: dbRecord.title || 'Unknown Commodity'
        },
        fullTitle: dbRecord.title || 'Unknown',
        description: baseDescription,
        examples: [] // We don't store examples in the current schema
      };
      
      return res.status(200).json({
        success: true,
        message: 'Retrieved UNSPSC code details from database',
        result
      });
    }    
    // If not found in database or incomplete, get details from OpenAI
    const details = await openAIService.getUnspscDetails(code);
    
    // Cache the results in the database for future use
    try {
      // Check if the code already exists
      if (cachedResults.length > 0) {
        // Update existing record
        const updateQuery = `
          UPDATE "UnspscCodes"
          SET 
            "title" = :title,
            "definition" = :definition,
            "updatedAt" = NOW(),
            "updated_at" = NOW()
          WHERE "code" = :code
          RETURNING *;
        `;
        
        await sequelize.query(updateQuery, {
          replacements: {
            code: details.unspscCode,
            title: details.fullTitle || details.commodity?.title || 'Unknown',
            definition: details.description || ''
          },
          type: sequelize.QueryTypes.UPDATE
        });
      } else {
        // Insert new record with appropriate fields
        const insertQuery = `
          INSERT INTO "UnspscCodes" (
            "id",
            "code",
            "segment",
            "family",
            "class", 
            "commodity",
            "title",
            "definition",
            "level",
            "isActive",
            "createdAt",
            "updatedAt",
            "created_at",
            "updated_at",
            "is_active"
          ) VALUES (
            :id,
            :code,
            :segment,
            :family,
            :class,
            :commodity,
            :title,
            :definition,
            'COMMODITY',
            true,
            NOW(),
            NOW(),
            NOW(),
            NOW(),
            true
          ) RETURNING *;
        `;
        
        await sequelize.query(insertQuery, {
          replacements: {
            id: uuidv4(),
            code: details.unspscCode,
            segment: details.segment.code,
            family: details.family.code.substring(2, 4),
            class: details.class.code.substring(4, 6),
            commodity: details.commodity.code.substring(6, 8),
            title: details.fullTitle || details.commodity?.title || 'Unknown',
            definition: details.description || ''
          },
          type: sequelize.QueryTypes.INSERT
        });      }
      
      console.log(`✅ Cached UNSPSC code details in database: ${code}`);
    } catch (cacheError) {
      console.error('Warning: Failed to cache UNSPSC details in database:', cacheError);
      // Continue with the request even if caching fails
    }
    
    return res.status(200).json({
      success: true,
      message: 'Retrieved UNSPSC code details',
      result: details
    });  } catch (error) {
    console.error('Error getting UNSPSC code details:', error);
    return res.status(500).json({
      success: false,
      message: 'Error getting UNSPSC code details: ' + (error.message || 'Unknown error'),
      error: error.message,
      // Include demo results when API fails
      result: openAIService.getMockUnspscDetails(req.params.code || '')
    });
  }
});

// Add UNSPSC code to favorites
router.post('/unspsc/favorites', async (req, res) => {
  try {
    const { userId, unspscCode, title, description } = req.body;
    
    if (!unspscCode || !/^\d{8}$/.test(unspscCode)) {
      return res.status(400).json({
        success: false,
        message: 'Valid 8-digit UNSPSC code is required'
      });
    }
    
    // Generate a UUID for the new favorite
    const favoriteId = uuidv4();
    // Use the current timestamp
    const now = new Date();
    
    // Insert the favorite into the database
    const query = `
      INSERT INTO "UserUnspscFavorites" (
        "id",
        "userId",
        "unspscCode",
        "title",
        "description",
        "createdAt",
        "updatedAt"
      ) VALUES (
        :id,
        :userId,
        :unspscCode,
        :title,
        :description,
        :createdAt,
        :updatedAt
      ) RETURNING *;
    `;
    
    const result = await sequelize.query(query, {
      replacements: {
        id: favoriteId,
        userId: userId || '11111111-1111-1111-1111-111111111111', // Default user ID if not provided
        unspscCode,
        title: title || 'Unknown',
        description: description || '',
        createdAt: now,
        updatedAt: now
      },
      type: sequelize.QueryTypes.INSERT
    });
    
    console.log(`✅ Added UNSPSC code ${unspscCode} to favorites`);
    
    return res.status(201).json({
      success: true,
      message: 'Added UNSPSC code to favorites',
      favorite: result[0][0]
    });
  } catch (error) {
    console.error('Error adding UNSPSC code to favorites:', error);
    return res.status(500).json({
      success: false,
      message: 'Error adding UNSPSC code to favorites',
      error: error.message
    });
  }
});

// Get all UNSPSC code favorites
router.get('/unspsc/favorites', async (req, res) => {
  try {
    const { userId } = req.query;
    
    let query = `
      SELECT * FROM "UserUnspscFavorites"
    `;
    
    // Add userId filter if provided
    if (userId) {
      query += ` WHERE "userId" = :userId`;
    }
    
    query += ` ORDER BY "createdAt" DESC;`;
    
    const favorites = await sequelize.query(query, {
      replacements: { userId },
      type: sequelize.QueryTypes.SELECT
    });
    
    console.log(`✅ Retrieved ${favorites.length} UNSPSC favorites`);
    
    return res.status(200).json({
      success: true,
      message: 'Retrieved UNSPSC favorites',
      favorites
    });
  } catch (error) {
    console.error('Error getting UNSPSC favorites:', error);
    return res.status(500).json({
      success: false,
      message: 'Error getting UNSPSC favorites',
      error: error.message
    });
  }
});

// Delete a UNSPSC code favorite
router.delete('/unspsc/favorites/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Favorite ID is required'
      });
    }
    
    const query = `
      DELETE FROM "UserUnspscFavorites"
      WHERE "id" = :id
      RETURNING *;
    `;
    
    const result = await sequelize.query(query, {
      replacements: { id },
      type: sequelize.QueryTypes.DELETE
    });
    
    if (!result[0] || result[0].length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found'
      });
    }
    
    console.log(`✅ Removed UNSPSC favorite with ID: ${id}`);
    
    return res.status(200).json({
      success: true,
      message: 'Removed UNSPSC code from favorites'
    });
  } catch (error) {
    console.error('Error removing UNSPSC favorite:', error);
    return res.status(500).json({
      success: false,
      message: 'Error removing UNSPSC favorite',
      error: error.message
    });
  }
});

// Generate item descriptions using AI
router.post('/unspsc/generate-descriptions', async (req, res) => {
  try {
    const { 
      manufacturer, 
      partNumber, 
      category, 
      subCategory, 
      unspscCode, 
      unspscTitle, 
      specifications 
    } = req.body;
    
    console.log(`🔍 Generating descriptions for item with manufacturer: ${manufacturer}, part: ${partNumber}`);
    
    const itemParams = {
      manufacturer,
      partNumber,
      category,
      subCategory,
      unspscCode,
      unspscTitle,
      specifications
    };
    
    // Generate descriptions using OpenAI service
    const descriptions = await openAIService.generateItemDescriptions(itemParams);
    
    res.status(200).json({
      success: true,
      message: 'Item descriptions generated successfully',
      descriptions
    });
  } catch (error) {
    console.error('Error generating descriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate descriptions',
      error: error.message
    });
  }
});

// Generate comprehensive item details using AI
router.post('/ai/generate-comprehensive-details', async (req, res) => {
  try {
    const { itemDescription, additionalInfo } = req.body;
    
    if (!itemDescription || itemDescription.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Item description is required'
      });
    }
    
    console.log(`🤖 Generating comprehensive details for: "${itemDescription}"`);
    
    const details = await openAIService.generateComprehensiveItemDetails(itemDescription, additionalInfo);
    
    return res.status(200).json({
      success: true,
      message: 'Generated comprehensive item details successfully',
      data: details
    });
  } catch (error) {
    console.error('Error generating comprehensive item details:', error);
    return res.status(500).json({
      success: false,
      message: 'Error generating comprehensive item details',
      error: error.message
    });
  }
});

// Generate supplier procurement email using AI
router.post('/ai/generate-supplier-email', async (req, res) => {
  try {
    const { itemData, requestDetails } = req.body;
    
    if (!itemData || !itemData.shortDescription) {
      return res.status(400).json({
        success: false,
        message: 'Item data with short description is required'
      });
    }
    
    console.log(`📧 Generating supplier email for: "${itemData.shortDescription}"`);
    
    const emailTemplate = await openAIService.generateSupplierEmail(itemData, requestDetails);
    
    return res.status(200).json({
      success: true,
      message: 'Generated supplier email successfully',
      data: emailTemplate
    });
  } catch (error) {
    console.error('Error generating supplier email:', error);
    return res.status(500).json({
      success: false,
      message: 'Error generating supplier email',
      error: error.message
    });
  }
});

module.exports = router;
