console.log('=== Starting UNSPSC Debug ===');

try {
  const { UnspscCode } = require('./models/sequelize');
  console.log('Models loaded successfully');
  
  async function debugUnspscIssue() {
    console.log('=== DEBUG: UNSPSC Foreign Key Issue ===');
    
    try {
      // Check if the specific ID exists
      const problematicId = 'bdccd804-148c-4dda-adbd-53ce81b1a2ad';
      const codeById = await UnspscCode.findByPk(problematicId);
      console.log(`1. Code with ID ${problematicId}:`, codeById ? codeById.toJSON() : 'NOT FOUND');
      
      // Check if code 40141800 exists
      const code = '40141800';
      const codeByCode = await UnspscCode.findOne({ where: { code } });
      console.log(`2. Code with value ${code}:`, codeByCode ? codeByCode.toJSON() : 'NOT FOUND');
      
      // Get total count
      const totalCount = await UnspscCode.count();
      console.log(`3. Total UNSPSC codes in database: ${totalCount}`);
      
      // Get sample codes
      const sampleCodes = await UnspscCode.findAll({ 
        limit: 5,
        attributes: ['id', 'code', 'title', 'level']
      });
      console.log('4. Sample UNSPSC codes:');
      sampleCodes.forEach(c => console.log(`   - ${c.code} (${c.level}): ${c.title} [ID: ${c.id}]`));
      
    } catch (error) {
      console.error('Error in debug function:', error);
    }
    
    process.exit(0);
  }
  
  debugUnspscIssue();
  
} catch (error) {
  console.error('Error loading models:', error);
  process.exit(1);
}
