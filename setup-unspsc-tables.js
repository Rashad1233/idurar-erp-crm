const { sequelize } = require('./backend/models/sequelize');

async function createUnspscTables() {
  try {
    console.log('Creating or updating UNSPSC related tables...');
    
    // Create UnspscCodes table if it doesn't exist
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "UnspscCodes" (
        "id" UUID PRIMARY KEY,
        "code" VARCHAR(8) NOT NULL UNIQUE,
        "title" VARCHAR(255),
        "description" TEXT,
        "segmentTitle" VARCHAR(255),
        "segmentDescription" TEXT,
        "familyTitle" VARCHAR(255),
        "familyDescription" TEXT,
        "classTitle" VARCHAR(255),
        "classDescription" TEXT,
        "commodityTitle" VARCHAR(255),
        "commodityDescription" TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
      );
    `);
    
    // Create UserUnspscFavorites table if it doesn't exist
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "UserUnspscFavorites" (
        "id" UUID PRIMARY KEY,
        "userId" UUID NOT NULL,
        "unspscCode" VARCHAR(8) NOT NULL,
        "title" VARCHAR(255),
        "description" TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
      );
    `);
    
    // Create index on unspscCode for faster lookups
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS "idx_UserUnspscFavorites_unspscCode"
      ON "UserUnspscFavorites" ("unspscCode");
    `);
    
    // Create index on userId for faster lookups
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS "idx_UserUnspscFavorites_userId"
      ON "UserUnspscFavorites" ("userId");
    `);
    
    console.log('✅ UNSPSC tables created or updated successfully');
  } catch (error) {
    console.error('Error creating UNSPSC tables:', error);
    throw error;
  }
}

// Run the function
createUnspscTables()
  .then(() => {
    console.log('✅ UNSPSC schema setup complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ UNSPSC schema setup failed:', error);
    process.exit(1);
  });
