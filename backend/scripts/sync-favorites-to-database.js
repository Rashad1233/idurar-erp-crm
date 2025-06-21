const { sequelize, UserUnspscFavorite, UnspscCode } = require('../models/sequelize');
const axios = require('axios');
require('dotenv').config();

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

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

  console.log(`Generating AI hierarchy titles for code: ${unspscCode}`);
  console.log(`Segment: ${segment}, Family: ${family}, Class: ${classCode}, Commodity: ${commodity}`);

  try {
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

// Helper function to create UNSPSC code in database if it doesn't exist
async function createUnspscCodesFromHierarchy(unspscCode, hierarchyTitles) {
  if (!unspscCode || unspscCode.length !== 8) {
    console.log('Invalid UNSPSC code format, skipping database creation');
    return;
  }

  const segment = unspscCode.substring(0, 2);
  const family = unspscCode.substring(2, 4);
  const classCode = unspscCode.substring(4, 6);
  const commodity = unspscCode.substring(6, 8);

  // Generate codes for each level
  const segmentCode = segment + '000000';
  const familyCode = segment + family + '0000';
  const classCodeFull = segment + family + classCode + '00';
  const commodityCode = unspscCode;

  try {
    // Create segment if it doesn't exist
    const [segmentExists] = await Promise.all([
      UnspscCode.findOne({ where: { code: segmentCode } }),
    ]);

    if (!segmentExists && hierarchyTitles.segmentTitle) {
      console.log(`Creating segment: ${segmentCode} - ${hierarchyTitles.segmentTitle}`);
      await UnspscCode.create({
        code: segmentCode,
        segment,
        family: '00',
        class: '00',
        commodity: '00',
        title: hierarchyTitles.segmentTitle,
        definition: `AI-generated segment: ${hierarchyTitles.segmentTitle}`,
        level: 'SEGMENT',
        isActive: true
      });
    }

    // Create family if it doesn't exist
    const [familyExists] = await Promise.all([
      UnspscCode.findOne({ where: { code: familyCode } }),
    ]);

    if (!familyExists && hierarchyTitles.familyTitle) {
      console.log(`Creating family: ${familyCode} - ${hierarchyTitles.familyTitle}`);
      await UnspscCode.create({
        code: familyCode,
        segment,
        family,
        class: '00',
        commodity: '00',
        title: hierarchyTitles.familyTitle,
        definition: `AI-generated family: ${hierarchyTitles.familyTitle}`,
        level: 'FAMILY',
        isActive: true
      });
    }

    // Create class if it doesn't exist
    const [classExists] = await Promise.all([
      UnspscCode.findOne({ where: { code: classCodeFull } }),
    ]);

    if (!classExists && hierarchyTitles.classTitle) {
      console.log(`Creating class: ${classCodeFull} - ${hierarchyTitles.classTitle}`);
      await UnspscCode.create({
        code: classCodeFull,
        segment,
        family,
        class: classCode,
        commodity: '00',
        title: hierarchyTitles.classTitle,
        definition: `AI-generated class: ${hierarchyTitles.classTitle}`,
        level: 'CLASS',
        isActive: true
      });
    }

    // Create commodity if it doesn't exist
    const [commodityExists] = await Promise.all([
      UnspscCode.findOne({ where: { code: commodityCode } }),
    ]);

    if (!commodityExists && hierarchyTitles.commodityTitle) {
      console.log(`Creating commodity: ${commodityCode} - ${hierarchyTitles.commodityTitle}`);
      await UnspscCode.create({
        code: commodityCode,
        segment,
        family,
        class: classCode,
        commodity,
        title: hierarchyTitles.commodityTitle,
        definition: `AI-generated commodity: ${hierarchyTitles.commodityTitle}`,
        level: 'COMMODITY',
        isActive: true
      });
    }

    console.log(`Successfully created hierarchy codes for ${unspscCode} in the database`);
    return true;
  } catch (error) {
    console.error(`Error creating UNSPSC codes for ${unspscCode}:`, error);
    return false;
  }
}

// Main function to update favorites and add to database
async function syncFavoritesToDatabase() {
  try {
    console.log('Starting sync of favorites to database...');
    
    // Get all favorites
    const favorites = await UserUnspscFavorite.findAll();
    console.log(`Found ${favorites.length} favorites to process`);
    
    // Process each favorite
    for (const favorite of favorites) {
      console.log(`\nProcessing: ${favorite.name} (${favorite.unspscCode})`);
      
      // First check if the code exists in the database
      const codeExists = await UnspscCode.findOne({ where: { code: favorite.unspscCode } });
      
      if (codeExists) {
        console.log(`UNSPSC code ${favorite.unspscCode} already exists in database, skipping creation`);
        
        // Still update the favorite with hierarchy titles if needed
        if (!favorite.segmentTitle || !favorite.familyTitle || !favorite.classTitle || !favorite.commodityTitle) {
          console.log('Updating favorite with hierarchy titles from database...');
          
          // Get the titles from the database
          const segmentCode = favorite.unspscCode.substring(0, 2) + '000000';
          const familyCode = favorite.unspscCode.substring(0, 4) + '0000';
          const classCode = favorite.unspscCode.substring(0, 6) + '00';
          
          const [segment, family, classLevel, commodity] = await Promise.all([
            UnspscCode.findOne({ where: { code: segmentCode, level: 'SEGMENT' } }),
            UnspscCode.findOne({ where: { code: familyCode, level: 'FAMILY' } }),
            UnspscCode.findOne({ where: { code: classCode, level: 'CLASS' } }),
            UnspscCode.findOne({ where: { code: favorite.unspscCode, level: 'COMMODITY' } })
          ]);
          
          await favorite.update({
            segmentTitle: segment?.title || favorite.segmentTitle,
            familyTitle: family?.title || favorite.familyTitle,
            classTitle: classLevel?.title || favorite.classTitle,
            commodityTitle: commodity?.title || favorite.commodityTitle
          });
          
          console.log('Updated favorite with database hierarchy titles');
        }
      } else {
        console.log(`UNSPSC code ${favorite.unspscCode} not found in database, will generate with AI and create`);
        
        // Generate hierarchy titles with AI
        const hierarchyTitles = await generateHierarchyTitlesWithAI(favorite.unspscCode);
        
        if (hierarchyTitles && (hierarchyTitles.segmentTitle || hierarchyTitles.familyTitle || 
            hierarchyTitles.classTitle || hierarchyTitles.commodityTitle)) {
          
          // First create the UNSPSC codes in the database
          console.log('Adding generated UNSPSC hierarchy to database...');
          await createUnspscCodesFromHierarchy(favorite.unspscCode, hierarchyTitles);
          
          // Then update the favorite
          await favorite.update({
            segmentTitle: hierarchyTitles.segmentTitle || favorite.segmentTitle,
            familyTitle: hierarchyTitles.familyTitle || favorite.familyTitle,
            classTitle: hierarchyTitles.classTitle || favorite.classTitle,
            commodityTitle: hierarchyTitles.commodityTitle || favorite.commodityTitle
          });
          
          console.log(`Successfully updated favorite and added to database: ${favorite.name} (${favorite.unspscCode})`);
        } else {
          console.log(`Failed to generate hierarchy titles for ${favorite.unspscCode}, skipping`);
        }
      }
    }
    
    console.log('\nSynchronization completed successfully!');
    
  } catch (error) {
    console.error('Error during synchronization:', error);
  } finally {
    await sequelize.close();
    console.log('Database connection closed');
  }
}

// Run the sync
syncFavoritesToDatabase();
