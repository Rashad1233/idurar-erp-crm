// Debug RFQ Models Loading
(async () => {
  console.log('🔍 Starting RFQ Models Debug...');

  try {
    // Test database connection first
    const sequelize = require('./backend/config/postgresql');
    console.log('✅ Database config loaded');
    
    // Test full models loading
    console.log('🔍 Testing full models loading...');
    try {
      const db = require('./backend/models/sequelize');
      console.log('✅ Models index loaded');
      console.log('🔍 Available models:', Object.keys(db).filter(key => !['sequelize', 'Sequelize'].includes(key)));
      
      // Check specific RFQ models
      console.log('\n🔍 RFQ Models availability:');
      console.log('  - RequestForQuotation:', !!db.RequestForQuotation);
      console.log('  - RfqItem:', !!db.RfqItem);
      console.log('  - RfqSupplier:', !!db.RfqSupplier);
      console.log('  - RfqQuoteItem:', !!db.RfqQuoteItem);
      
      if (db.RequestForQuotation) {
        console.log('✅ RequestForQuotation model available');
        console.log('  - Name:', db.RequestForQuotation.name);
        console.log('  - Table:', db.RequestForQuotation.tableName);
      } else {
        console.error('❌ RequestForQuotation model NOT available');
      }
      
      if (db.RfqItem) {
        console.log('✅ RfqItem model available');
        console.log('  - Name:', db.RfqItem.name);
        console.log('  - Table:', db.RfqItem.tableName);
      } else {
        console.error('❌ RfqItem model NOT available');
      }
      
    } catch (error) {
      console.error('❌ Error loading models index:', error.message);
      console.error('❌ Stack:', error.stack);
    }
    
    // Test database tables existence
    console.log('\n🔍 Testing RFQ database tables...');
    try {
      await sequelize.authenticate();
      console.log('✅ Database connection successful');
      
      // Check if RFQ tables exist
      const [results] = await sequelize.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name ILIKE '%rfq%'
        ORDER BY table_name;
      `);
      
      console.log('🔍 RFQ related tables in database:', results.map(r => r.table_name));
      
      // Check RequestForQuotations table specifically
      const [rfqTables] = await sequelize.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND (table_name ILIKE '%requestforquotation%' OR table_name ILIKE '%rfq%')
        ORDER BY table_name;
      `);
      
      console.log('🔍 Request for Quotation tables:', rfqTables.map(t => t.table_name));
      
    } catch (error) {
      console.error('❌ Database connection error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Fatal error in RFQ models debug:', error.message);
    console.error('❌ Stack:', error.stack);
  }
})();