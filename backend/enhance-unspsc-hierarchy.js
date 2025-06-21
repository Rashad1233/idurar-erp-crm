/**
 * Script to enhance UNSPSC codes with proper hierarchical information
 * This will add descriptive titles and definitions for each level
 */

const { sequelize } = require('./models/sequelize');

async function enhanceUnspscHierarchy() {
  try {
    console.log('🔍 Enhancing UNSPSC codes with hierarchical information...');
    
    // Get all UNSPSC codes from the database
    const [codes] = await sequelize.query(`
      SELECT * FROM "UnspscCodes" ORDER BY code
    `);
    
    console.log(`Found ${codes.length} UNSPSC codes to enhance`);
    
    // Common UNSPSC segment descriptions (based on UN SPSC standard)
    const segmentDescriptions = {
      '10': 'Live Animals and Animal Products',
      '11': 'Live Plant and Animal Materials and Accessories and Supplies',
      '12': 'Chemicals including Bio Chemicals and Gas Materials',
      '13': 'Resin and Rosin and Rubber and Foam and Film and Elastomeric Materials',
      '14': 'Paper Materials and Products',
      '15': 'Fuels and Fuel Additives and Lubricants and Anti corrosive Materials',
      '20': 'Mining and Well Drilling Machinery and Accessories',
      '21': 'Farming and Fishing and Forestry and Wildlife Machinery and Accessories',
      '22': 'Building and Construction and Maintenance Machinery and Accessories',
      '23': 'Material Handling and Conditioning and Storage Machinery and their Accessories and Supplies',
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
      '49': 'Transportation and Storage and Mail Services',
      '50': 'Food Beverage and Tobacco Products',
      '51': 'Drugs and Pharmaceutical Products',
      '52': 'Domestic Appliances and Supplies and Consumer Electronic Products',
      '53': 'Apparel and Luggage and Personal Care Products',
      '54': 'Personal Safety and Protection',
      '55': 'Printed Media',
      '56': 'Furniture and Furnishings',
      '60': 'Musical Recording',
      '70': 'Farming and Fishing and Forestry and Wildlife Contracting Services',
      '71': 'Mining and oil and gas services',
      '72': 'Building and Construction and Maintenance Services',
      '73': 'Industrial Production and Manufacturing Services',
      '76': 'Industrial Cleaning Services',
      '77': 'Environmental Services',
      '78': 'Transportation and Storage and Mail Services',
      '80': 'Management and Business Professionals and Administrative Services',
      '81': 'Engineering and Research and Technology Based Services',
      '82': 'Editorial and Design and Graphic and Fine Art Services',
      '83': 'Public Utilities and Public Sector Related Services',
      '84': 'Financial and Insurance Services',
      '85': 'Healthcare Services',
      '86': 'Education and Training Services',
      '90': 'Travel and Food and Lodging and Entertainment Services',
      '91': 'Personal and Domestic Services',
      '92': 'National Defense and Public Order and Security and Safety Services',
      '93': 'Politics and Civic Affairs Services',
      '94': 'Organizations and Clubs',
      '95': 'Land and Buildings and Structures and Facilities'
    };

    // Process each code
    for (const code of codes) {
      const segmentCode = code.code.substring(0, 2);
      const familyCode = code.code.substring(0, 4);
      const classCode = code.code.substring(0, 6);
      
      // Create enhanced description based on hierarchy
      let enhancedDescription = code.definition || '';
      
      // If we have a segment description, add hierarchical context
      if (segmentDescriptions[segmentCode]) {
        const segmentDesc = segmentDescriptions[segmentCode];
        enhancedDescription = `${code.title || 'Unknown Item'} - Part of ${segmentDesc}. ${enhancedDescription}`;
      } else {
        enhancedDescription = `${code.title || 'Unknown Item'} - UNSPSC code ${code.code}. ${enhancedDescription}`;
      }
      
      // Ensure description is not too long (keep it under 300 characters for efficiency)
      if (enhancedDescription.length > 300) {
        enhancedDescription = enhancedDescription.substring(0, 297) + '...';
      }
      
      // Update the record with enhanced description
      await sequelize.query(`
        UPDATE "UnspscCodes"
        SET 
          definition = :definition,
          "updatedAt" = NOW(),
          updated_at = NOW()
        WHERE code = :code
      `, {
        replacements: {
          code: code.code,
          definition: enhancedDescription
        },
        type: sequelize.QueryTypes.UPDATE
      });
      
      console.log(`✅ Enhanced code ${code.code}: ${code.title}`);
    }
    
    console.log('✅ Successfully enhanced all UNSPSC codes with hierarchical information');
    
  } catch (error) {
    console.error('❌ Error enhancing UNSPSC codes:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the enhancement
enhanceUnspscHierarchy();
