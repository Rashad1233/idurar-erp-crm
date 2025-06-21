console.log('Starting script...');

try {
  console.log('Loading models...');
  const { UnspscCode } = require('./models/sequelize');
  console.log('Models loaded successfully');

  async function fixUnspscIdIssue() {
    console.log('=== FIXING UNSPSC ID MISMATCH ===');
    
    const code = '40141800';
    
    try {
      console.log('Querying database...');
      // Check what exists in database
      const existing = await UnspscCode.findOne({ where: { code } });
      console.log('1. Existing code in database:', existing ? {
        id: existing.id,
        code: existing.code,
        title: existing.title,
        level: existing.level
      } : 'NOT FOUND');
      
      // Check if there are duplicates
      const allWithCode = await UnspscCode.findAll({ where: { code } });
      console.log(`2. Total records with code ${code}:`, allWithCode.length);
      
      if (allWithCode.length > 1) {
        console.log('3. DUPLICATE CODES FOUND:');
        allWithCode.forEach((record, index) => {
          console.log(`   ${index + 1}. ID: ${record.id}, Title: ${record.title}, Level: ${record.level}`);
        });
        
        // Keep the first one, delete duplicates
        const toKeep = allWithCode[0];
        const toDelete = allWithCode.slice(1);
        
        console.log('4. Cleaning up duplicates...');
        for (const duplicate of toDelete) {
          await duplicate.destroy();
          console.log(`   Deleted duplicate: ${duplicate.id}`);
        }
        
        console.log(`5. Kept original: ${toKeep.id}`);
      }
      
      // Final check
      const final = await UnspscCode.findOne({ where: { code } });
      console.log('6. Final state:', final ? {
        id: final.id,
        code: final.code,
        title: final.title,
        level: final.level
      } : 'NOT FOUND');
      
    } catch (error) {
      console.error('Error in function:', error);
    }
    
    process.exit(0);
  }

  fixUnspscIdIssue();
  
} catch (error) {
  console.error('Error loading models:', error);
  process.exit(1);
}
