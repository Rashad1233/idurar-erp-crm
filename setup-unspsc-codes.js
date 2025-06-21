// This script adds basic UNSPSC codes to the database
const { sequelize, UnspscCode } = require('./backend/models/sequelize');

// Basic UNSPSC codes for common items
const basicUnspscCodes = [
  {
    code: '14000000',
    segment: '14', 
    family: '00',
    class: '00',
    commodity: '00',
    title: 'Paper Materials and Products',
    level: 'SEGMENT',
    definition: 'The segment Paper Materials and Products includes paper materials and paper products.'
  },
  {
    code: '14160000',
    segment: '14', 
    family: '16',
    class: '00',
    commodity: '00',
    title: 'Office supplies',
    level: 'FAMILY',
    definition: 'The family Office supplies includes office materials and accessories.'
  },
  {
    code: '14160700',
    segment: '14', 
    family: '16',
    class: '07',
    commodity: '00',
    title: 'Office machine supplies',
    level: 'CLASS',
    definition: 'The class Office machine supplies includes printer, fax and photocopier supplies.'
  },
  {
    code: '14160704',
    segment: '14', 
    family: '16',
    class: '07',
    commodity: '04',
    title: 'Printer or photocopier toner',
    level: 'COMMODITY',
    definition: 'Toner for printers or photocopiers.'
  },
  {
    code: '31000000',
    segment: '31', 
    family: '00',
    class: '00',
    commodity: '00',
    title: 'Manufacturing Components and Supplies',
    level: 'SEGMENT',
    definition: 'The segment Manufacturing Components and Supplies includes components and supplies for manufacturing.'
  },
  {
    code: '31160000',
    segment: '31', 
    family: '16',
    class: '00',
    commodity: '00',
    title: 'Hardware',
    level: 'FAMILY',
    definition: 'The family Hardware includes items such as nuts, bolts, screws, and other types of fasteners.'
  },
  {
    code: '31161500',
    segment: '31', 
    family: '16',
    class: '15',
    commodity: '00',
    title: 'Bearings',
    level: 'CLASS',
    definition: 'The class Bearings includes roller, ball, and other types of bearings.'
  },
  {
    code: '31161501',
    segment: '31', 
    family: '16',
    class: '15',
    commodity: '01',
    title: 'Ball bearings',
    level: 'COMMODITY',
    definition: 'A type of rolling-element bearing that uses balls to maintain the separation between the bearing races.'
  }
];

async function setupUnspscCodes() {
  try {
    console.log('Starting UNSPSC code setup...');
    
    // Create each code, ignoring duplicates
    for (const code of basicUnspscCodes) {
      try {
        const [unspsc, created] = await UnspscCode.findOrCreate({
          where: { code: code.code },
          defaults: code
        });
        
        if (created) {
          console.log(`Created UNSPSC code: ${code.code} - ${code.title}`);
        } else {
          console.log(`UNSPSC code already exists: ${code.code} - ${code.title}`);
        }
      } catch (error) {
        console.error(`Error creating UNSPSC code ${code.code}:`, error);
      }
    }
    
    console.log('UNSPSC code setup complete!');
  } catch (error) {
    console.error('Error in setup:', error);
  } finally {
    await sequelize.close();
  }
}

setupUnspscCodes();
