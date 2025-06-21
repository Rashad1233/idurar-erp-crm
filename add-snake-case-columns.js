const { Sequelize } = require('sequelize');

async function addSnakeCaseColumns() {
  try {
    // Create a connection to the database
    const sequelize = new Sequelize(
      'erpdb',
      'postgres',
      'UHm8g167',
      {
        host: 'localhost',
        port: 5432,
        dialect: 'postgres',
        logging: console.log
      }
    );

    // Test the connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Add snake_case columns if they don't exist
    console.log('Adding snake_case columns...');
    
    // Check if first_name column exists
    const [firstNameCheck] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'Users'
        AND table_schema = 'public'
        AND column_name = 'first_name'
      );
    `);
    
    if (!firstNameCheck[0].exists) {
      console.log('Adding first_name column...');
      await sequelize.query(`
        ALTER TABLE "Users" 
        ADD COLUMN first_name VARCHAR(255);
      `);
      
      // Copy data from firstName to first_name
      console.log('Copying data from firstName to first_name...');
      await sequelize.query(`
        UPDATE "Users" 
        SET first_name = "firstName";
      `);
    } else {
      console.log('first_name column already exists.');
    }
    
    // Check if last_name column exists
    const [lastNameCheck] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'Users'
        AND table_schema = 'public'
        AND column_name = 'last_name'
      );
    `);
    
    if (!lastNameCheck[0].exists) {
      console.log('Adding last_name column...');
      await sequelize.query(`
        ALTER TABLE "Users" 
        ADD COLUMN last_name VARCHAR(255);
      `);
      
      // Copy data from lastName to last_name
      console.log('Copying data from lastName to last_name...');
      await sequelize.query(`
        UPDATE "Users" 
        SET last_name = "lastName";
      `);
    } else {
      console.log('last_name column already exists.');
    }
    
    // Check for any null values in first_name/last_name and fill from name if available
    console.log('Checking for null values in first_name/last_name...');
    await sequelize.query(`
      UPDATE "Users"
      SET 
        first_name = SPLIT_PART(name, ' ', 1),
        last_name = SUBSTRING(name FROM POSITION(' ' IN name) + 1)
      WHERE (first_name IS NULL OR last_name IS NULL) AND name IS NOT NULL;
    `);
    
    console.log('Creating triggers to keep columns in sync...');
    
    // Create trigger function
    await sequelize.query(`
      CREATE OR REPLACE FUNCTION sync_user_name_columns()
      RETURNS TRIGGER AS $$
      BEGIN
        IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
          -- When firstName/lastName are updated, update first_name/last_name
          IF NEW."firstName" IS NOT NULL THEN
            NEW.first_name := NEW."firstName";
          END IF;
          
          IF NEW."lastName" IS NOT NULL THEN
            NEW.last_name := NEW."lastName";
          END IF;
          
          -- When first_name/last_name are updated, update firstName/lastName
          IF NEW.first_name IS NOT NULL AND (NEW."firstName" IS NULL OR NEW.first_name <> NEW."firstName") THEN
            NEW."firstName" := NEW.first_name;
          END IF;
          
          IF NEW.last_name IS NOT NULL AND (NEW."lastName" IS NULL OR NEW.last_name <> NEW."lastName") THEN
            NEW."lastName" := NEW.last_name;
          END IF;
        END IF;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    // Create trigger if not exists
    await sequelize.query(`
      DROP TRIGGER IF EXISTS user_name_sync_trigger ON "Users";
      CREATE TRIGGER user_name_sync_trigger
      BEFORE INSERT OR UPDATE ON "Users"
      FOR EACH ROW
      EXECUTE FUNCTION sync_user_name_columns();
    `);
    
    console.log('Snake case columns added and data synced successfully!');
    
  } catch (error) {
    console.error('Error adding snake_case columns:', error);
  }
}

addSnakeCaseColumns();
