const { sequelize, UserUnspscFavorite } = require('../models/sequelize');
const axios = require('axios');
require('dotenv').config();

// DeepSeek API key from environment variables
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

/**
 * Uses DeepSeek AI API to generate UNSPSC hierarchy titles for a given code
 * 
 * @param {string} unspscCode - The 8-digit UNSPSC code
 * @returns {Object} - Object containing hierarchy titles
 */
async function generateHierarchyTitlesWithAI(unspscCode) {
  if (!unspscCode || unspscCode.length !== 8) {
    console.error(`Invalid UNSPSC code: ${unspscCode}`);
    return null;
  }

  // Extract the components from the UNSPSC code
  const segment = unspscCode.substring(0, 2);
  const family = unspscCode.substring(2, 4);
  const classCode = unspscCode.substring(4, 6);
  const commodity = unspscCode.substring(6, 8);

  console.log(`Generating hierarchy titles for UNSPSC code: ${segment}-${family}-${classCode}-${commodity}`);

  try {
    // Call DeepSeek API
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
    let hierarchyTitles;
    try {
      const responseContent = response.data.choices[0]?.message?.content;
      hierarchyTitles = JSON.parse(responseContent);
      
      console.log('Generated hierarchy titles:');
      console.log(`- Segment: ${hierarchyTitles.segmentTitle}`);
      console.log(`- Family: ${hierarchyTitles.familyTitle}`);
      console.log(`- Class: ${hierarchyTitles.classTitle}`);
      console.log(`- Commodity: ${hierarchyTitles.commodityTitle}`);
      
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      return null;
    }

    return hierarchyTitles;
  } catch (error) {
    console.error('Error calling DeepSeek API:', error.message);
    return null;
  }
}

/**
 * Updates all favorites in the database with AI-generated hierarchy titles
 * where the titles are missing
 */
async function updateFavoritesWithAIHierarchy() {
  try {
    console.log('Starting update of favorites with AI-generated hierarchy titles...');
    
    // Get all favorites
    const favorites = await UserUnspscFavorite.findAll();
    console.log(`Found ${favorites.length} favorites to check...`);
    
    // Process each favorite
    for (const favorite of favorites) {
      console.log(`\n----- Processing favorite: ${favorite.name} (${favorite.unspscCode}) -----`);
      
      // Check if hierarchy titles are missing
      const missingHierarchy = !favorite.segmentTitle || !favorite.familyTitle || 
                              !favorite.classTitle || !favorite.commodityTitle;
      
      if (missingHierarchy) {
        console.log('Missing hierarchy titles detected. Generating with AI...');
        
        // Generate hierarchy titles with AI
        const aiTitles = await generateHierarchyTitlesWithAI(favorite.unspscCode);
        
        if (aiTitles) {
          // Extract segment, family, class and commodity codes from UNSPSC code
          const segment = favorite.unspscCode.substring(0, 2);
          const family = favorite.unspscCode.substring(2, 4);
          const classCode = favorite.unspscCode.substring(4, 6);
          const commodity = favorite.unspscCode.substring(6, 8);
          
          // Update the favorite with AI-generated titles
          await favorite.update({
            segment,
            segmentTitle: aiTitles.segmentTitle || favorite.segmentTitle,
            family,
            familyTitle: aiTitles.familyTitle || favorite.familyTitle,
            class: classCode,
            classTitle: aiTitles.classTitle || favorite.classTitle,
            commodity,
            commodityTitle: aiTitles.commodityTitle || favorite.commodityTitle
          });
          
          console.log('✓ Updated favorite with AI-generated hierarchy titles');
        } else {
          console.log('✗ Failed to generate hierarchy titles with AI');
        }
      } else {
        console.log('✓ This favorite already has complete hierarchy titles');
      }
    }
    
    console.log('\nAll favorites have been processed!');
  } catch (error) {
    console.error('Error updating favorites:', error);
  } finally {
    // Close the database connection
    await sequelize.close();
    console.log('Database connection closed');
  }
}

// Run the update
updateFavoritesWithAIHierarchy();
