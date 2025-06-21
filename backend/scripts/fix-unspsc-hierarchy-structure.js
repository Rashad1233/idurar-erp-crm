const { sequelize, UnspscCode, UserUnspscFavorite } = require('../models/sequelize');
const { ensureUnspscCodeExists } = require('../utils/unspscUtils');
require('dotenv').config();

// Helper function to check if a title appears to be just a code
function isTitleJustCode(title, code) {
  if (!title) return true;
  if (title === code) return true;
  // Check if title only contains numbers
  if (/^\d+$/.test(title)) return true;
  return false;
}

// Fix all UNSPSC codes in the database
async function fixHierarchyStructure() {
  try {
    console.log('=== Fixing UNSPSC Hierarchy Structure ===');
    
    // 1. Get all UNSPSC codes with potential issues
    const codesWithIssues = await UnspscCode.findAll({
      where: sequelize.literal(`
        (title IS NULL OR title = code OR title ~ '^[0-9]+$')
      `)
    });
    
    console.log(`\nFound ${codesWithIssues.length} UNSPSC codes with potential title issues`);
    
    // Group issues by segment for better reporting
    const issuesBySegment = {};
    codesWithIssues.forEach(code => {
      const segment = code.code.substring(0, 2);
      if (!issuesBySegment[segment]) {
        issuesBySegment[segment] = [];
      }
      issuesBySegment[segment].push(code);
    });
    
    console.log('\nIssues by segment:');
    for (const segment in issuesBySegment) {
      console.log(`- Segment ${segment}: ${issuesBySegment[segment].length} issues`);
    }
    
    // 2. Fix issues by looking up corresponding favorites
    console.log('\nFixing issues using favorites data...');
    
    for (const segment in issuesBySegment) {
      console.log(`\nProcessing segment ${segment}...`);
      
      // Find all favorites in this segment
      const favorites = await UserUnspscFavorite.findAll({
        where: {
          unspscCode: {
            [sequelize.Sequelize.Op.like]: `${segment}%`
          },
          segmentTitle: {
            [sequelize.Sequelize.Op.not]: null
          }
        }
      });
      
      console.log(`Found ${favorites.length} favorites with segment ${segment} that have titles`);
      
      // Process each favorite to ensure its hierarchy exists
      for (const favorite of favorites) {
        // Extract hierarchy titles from the favorite
        const hierarchyTitles = {
          segmentTitle: favorite.segmentTitle || `Segment ${segment}`,
          familyTitle: favorite.familyTitle || `Family ${favorite.family}`,
          classTitle: favorite.classTitle || `Class ${favorite.class}`,
          commodityTitle: favorite.commodityTitle || `Commodity ${favorite.commodity}`
        };
        
        // Ensure this code exists with proper titles
        console.log(`Ensuring code ${favorite.unspscCode} exists with proper titles...`);
        await ensureUnspscCodeExists(favorite.unspscCode, hierarchyTitles);
      }
    }
    
    // 3. Final check to see if we fixed the issues
    const remainingIssues = await UnspscCode.findAll({
      where: sequelize.literal(`
        (title IS NULL OR title = code OR title ~ '^[0-9]+$')
      `)
    });
    
    console.log(`\nAfter fixes, ${remainingIssues.length} codes still have title issues`);
    
    console.log('\n=== Hierarchy Structure Fix Completed ===');
    
  } catch (error) {
    console.error('Error fixing hierarchy structure:', error);
  } finally {
    await sequelize.close();
    console.log('Database connection closed');
  }
}

// Run the fix
fixHierarchyStructure();
