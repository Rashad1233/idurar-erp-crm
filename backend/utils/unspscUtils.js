const { UnspscCode } = require('../models/sequelize');

// Helper function to ensure a UNSPSC code exists in the database before using it
async function ensureUnspscCodeExists(unspscCode, hierarchyTitles) {
  if (!unspscCode || unspscCode.length !== 8) {
    console.log('Invalid UNSPSC code format, skipping database creation');
    return;
  }

  const segment = unspscCode.substring(0, 2);
  const family = unspscCode.substring(2, 4);
  const classCode = unspscCode.substring(4, 6);
  const commodity = unspscCode.substring(6, 8);

  // Generate the commodity code (full 8-digit code)
  const commodityCode = unspscCode;

  try {
    // Check if the commodity code already exists
    const existingCommodity = await UnspscCode.findOne({
      where: { code: commodityCode, level: 'COMMODITY' }
    });

    if (existingCommodity) {
      console.log(`UNSPSC code ${commodityCode} already exists in database`);
      return existingCommodity.id; // Return the UUID of the existing code
    }

    console.log(`UNSPSC code ${commodityCode} not found in database, creating it...`);

    // Simplified approach: Just create the commodity code directly with available title
    // Without requiring the full hierarchy
    let commodityTitle = 'Manual UNSPSC Code';
    
    // Use AI-generated titles if available
    if (hierarchyTitles && hierarchyTitles.commodityTitle) {
      commodityTitle = hierarchyTitles.commodityTitle;
    }
    
    // Create the commodity code entry
    const commodityRecord = await UnspscCode.create({
      code: commodityCode,
      segment,
      family,
      class: classCode,
      commodity,
      title: commodityTitle,
      definition: `Manual UNSPSC code: ${commodityCode}`,
      level: 'COMMODITY',
      isActive: true
    });
    
    console.log(`Created commodity: ${commodityCode} - ${commodityTitle}`);
    
    console.log(`Successfully created UNSPSC code ${unspscCode} in the database`);
    return commodityRecord?.id; // Return the UUID of the new commodity code

    console.log(`Successfully created hierarchy codes for ${unspscCode} in the database`);
    return commodityRecord?.id; // Return the UUID of the new commodity code
  } catch (error) {    console.error(`Error ensuring UNSPSC code ${unspscCode} exists:`, error);
    return null;
  }
}

module.exports = {
  ensureUnspscCodeExists
};
