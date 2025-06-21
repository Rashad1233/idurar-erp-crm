/**
 * Script to optimize UNSPSC code descriptions in the database
 * This updates the descriptions to simpler versions for better performance
 */

const { sequelize } = require('./backend/models/sequelize');
const { v4: uuidv4 } = require('uuid');

async function optimizeUnspscDescriptions() {
  try {
    console.log('🔍 Checking UNSPSC codes in database...');
    
    // First check if we have any UNSPSC codes with overly long definitions
    const longDescriptionsQuery = `
      SELECT code, 
             LENGTH(definition) as def_length,
             title
      FROM "UnspscCodes"
      WHERE LENGTH(definition) > 200 
      ORDER BY def_length DESC;
    `;
    
    const [longDescriptions] = await sequelize.query(longDescriptionsQuery);
    
    if (longDescriptions.length === 0) {
      console.log('✅ No UNSPSC codes with overly long descriptions found');
      return;
    }
    
    console.log(`⚠️ Found ${longDescriptions.length} UNSPSC codes with overly long descriptions`);
    console.log('Optimizing descriptions...');
    
    // Process each code with long descriptions
    for (const codeInfo of longDescriptions) {
      const code = codeInfo.code;
      console.log(`🔧 Optimizing definition for code: ${code} - ${codeInfo.title}`);
      
      // Get current data
      const [codeData] = await sequelize.query(`
        SELECT * FROM "UnspscCodes" WHERE code = :code LIMIT 1
      `, {
        replacements: { code },
        type: sequelize.QueryTypes.SELECT
      });
      
      if (!codeData) {
        console.log(`⚠️ Code ${code} not found in database, skipping`);
        continue;
      }
      
      // Truncate long definition
      const optimizedDef = truncateDescription(codeData.definition, 200);
      
      // Update the database with optimized definition
      await sequelize.query(`
        UPDATE "UnspscCodes"
        SET 
          definition = :definition,
          "updatedAt" = NOW(),
          updated_at = NOW()
        WHERE code = :code
      `, {
        replacements: {
          code,
          definition: optimizedDef
        },
        type: sequelize.QueryTypes.UPDATE
      });
      
      console.log(`✅ Optimized definition for code: ${code}`);
      console.log(`   Original length: ${codeData.definition?.length || 0}, New length: ${optimizedDef?.length || 0}`);
    }
    
    console.log('✅ Successfully optimized all UNSPSC code descriptions');
    
  } catch (error) {
    console.error('❌ Error optimizing UNSPSC descriptions:', error);
  } finally {
    await sequelize.close();
  }
}

// Helper function to truncate long descriptions
function truncateDescription(text, maxLength = 200) {
  if (!text || text.length <= maxLength) return text;
  
  // Try to find a sentence break near the maxLength
  const sentenceEnd = text.indexOf('. ', maxLength - 30);
  if (sentenceEnd > 0 && sentenceEnd < maxLength) {
    return text.substring(0, sentenceEnd + 1);
  }
  
  // Try to find a space near the maxLength
  const spacePos = text.lastIndexOf(' ', maxLength);
  if (spacePos > 0) {
    return text.substring(0, spacePos) + '...';
  }
  
  // Just truncate at maxLength if no good break point found
  return text.substring(0, maxLength) + '...';
}

// Run the optimization
optimizeUnspscDescriptions();
