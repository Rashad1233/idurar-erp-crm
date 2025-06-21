// Create sample UNSPSC codes script
require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

// Create a direct connection to PostgreSQL
const sequelize = new Sequelize(
  process.env.POSTGRES_DB || 'erpdb',
  process.env.POSTGRES_USER || 'postgres',
  String(process.env.POSTGRES_PASSWORD || 'UHm8g167'),
  {
    host: process.env.POSTGRES_HOST || 'localhost',
    dialect: 'postgres',
    port: parseInt(process.env.POSTGRES_PORT) || 5432,
    logging: console.log
  }
);

// Define UnspscCode model
const UnspscCode = sequelize.define('UnspscCode', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  code: {
    type: DataTypes.STRING(8),
    allowNull: false,
    unique: true,
  },
  segment: {
    type: DataTypes.STRING(2),
    allowNull: false,
  },
  family: {
    type: DataTypes.STRING(2),
    allowNull: false,
  },
  class: {
    type: DataTypes.STRING(2),
    allowNull: false,
  },
  commodity: {
    type: DataTypes.STRING(2),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  definition: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  level: {
    type: DataTypes.ENUM('SEGMENT', 'FAMILY', 'CLASS', 'COMMODITY'),
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  }
}, {
  timestamps: true
});

// Function to create sample data
async function createSampleUnspscCodes() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connection established.');
    
    console.log('Syncing UnspscCode model...');
    await UnspscCode.sync({ alter: true });
    
    console.log('Creating sample UNSPSC codes...');    const samples = [
      // Segment level
      {
        code: '31000000',
        segment: '31',
        family: '00',
        class: '00',
        commodity: '00',
        title: 'Manufacturing Components and Supplies',
        definition: 'Components and supplies used in manufacturing and production',
        level: 'SEGMENT',
        isActive: true
      },
      {
        code: '43000000',
        segment: '43',
        family: '00',
        class: '00',
        commodity: '00',
        title: 'Information Technology Broadcasting and Telecommunications',
        definition: 'Equipment and services for IT, broadcasting, and telecommunications',
        level: 'SEGMENT',
        isActive: true
      },
      {
        code: '44000000',
        segment: '44',
        family: '00',
        class: '00',
        commodity: '00',
        title: 'Office Equipment and Accessories and Supplies',
        definition: 'Equipment, accessories, and supplies used in offices',
        level: 'SEGMENT',
        isActive: true
      },
      
      // Family level
      {
        code: '31150000',
        segment: '31',
        family: '15',
        class: '00',
        commodity: '00',
        title: 'Bearings and bushings and wheels and gears',
        definition: 'Industrial bearings, bushings, wheels, and gears used in machinery and equipment',
        level: 'FAMILY',
        isActive: true
      },
      {
        code: '43210000',
        segment: '43',
        family: '21',
        class: '00',
        commodity: '00',
        title: 'Computer Equipment and Accessories',
        definition: 'Computer hardware and peripherals',
        level: 'FAMILY',
        isActive: true
      },
      {
        code: '44120000',
        segment: '44',
        family: '12',
        class: '00',
        commodity: '00',
        title: 'Office Supplies',
        definition: 'Consumable office supplies used in daily operations',
        level: 'FAMILY',
        isActive: true
      },
      
      // Class level
      {
        code: '31151500',
        segment: '31',
        family: '15',
        class: '15',
        commodity: '00',
        title: 'Bearings',
        definition: 'Mechanical components that constrain relative motion and reduce friction between moving parts',
        level: 'CLASS',
        isActive: true
      },
      {
        code: '43211500',
        segment: '43',
        family: '21',
        class: '15',
        commodity: '00',
        title: 'Computers',
        definition: 'Computing devices for processing data',
        level: 'CLASS',
        isActive: true
      },
      {
        code: '44121700',
        segment: '44',
        family: '12',
        class: '17',
        commodity: '00',
        title: 'Writing instruments',
        definition: 'Pens, pencils, markers and other writing implements',
        level: 'CLASS',
        isActive: true
      },
      
      // Commodity level
      {
        code: '31151501',
        segment: '31',
        family: '15',
        class: '15',
        commodity: '01',
        title: 'Ball bearings',
        definition: 'Rolling-element bearings that use balls to maintain separation between bearing races',
        level: 'COMMODITY',
        isActive: true
      },
      {
        code: '43211501',
        segment: '43',
        family: '21',
        class: '15',
        commodity: '01',
        title: 'Desktop computers',
        definition: 'Personal computers designed to stay in a single location',
        level: 'COMMODITY',
        isActive: true
      },
      {
        code: '44121701',
        segment: '44',
        family: '12',
        class: '17',
        commodity: '01',
        title: 'Pens',
        definition: 'Writing instruments that use ink',
        level: 'COMMODITY',
        isActive: true
      }
    ];
    
    // Create in database
    const createdCodes = await UnspscCode.bulkCreate(samples, { 
      updateOnDuplicate: ['title', 'definition', 'isActive'] 
    });
    
    console.log(`Created ${createdCodes.length} sample UNSPSC codes`);
    
    // Get all codes to verify
    const allCodes = await UnspscCode.findAll({
      attributes: ['id', 'code', 'title']
    });
    
    console.log('All UNSPSC codes in database:');
    console.table(allCodes.map(code => ({
      id: code.id,
      code: code.code,
      title: code.title
    })));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    console.log('Closing database connection...');
    await sequelize.close();
    console.log('Done!');
  }
}

// Execute function
createSampleUnspscCodes();
