const express = require('express');
const cors = require('cors');
const { Supplier } = require('./backend/models/sequelize');

const app = express();

app.use(cors());
app.use(express.json());

// Simple supplier route for testing
app.get('/api/supplier/list', async (req, res) => {
  try {
    console.log('🔍 Direct supplier fetch with query:', req.query);
    
    const whereClause = {};
    if (req.query.status) {
      whereClause.status = req.query.status;
    }
    
    const suppliers = await Supplier.findAll({
      where: whereClause,
      attributes: [
        'id', 
        'legalName', 
        'tradeName', 
        'contactEmail', 
        'contactPhone', 
        'status',
        'supplierType',
        'address',
        'city',
        'country'
      ],
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`✅ Found ${suppliers.length} suppliers`);
    
    const formattedSuppliers = suppliers.map(supplier => ({
      _id: supplier.id,
      id: supplier.id,
      name: supplier.legalName,
      legalName: supplier.legalName,
      tradeName: supplier.tradeName,
      email: supplier.contactEmail,
      phone: supplier.contactPhone,
      status: supplier.status,
      supplierType: supplier.supplierType,
      address: supplier.address,
      city: supplier.city,
      country: supplier.country
    }));
    
    res.status(200).json({
      success: true,
      result: formattedSuppliers,
      data: formattedSuppliers,
      count: formattedSuppliers.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching suppliers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch suppliers',
      error: error.message
    });
  }
});

app.listen(8889, () => {
  console.log('Test supplier API running on port 8889');
});