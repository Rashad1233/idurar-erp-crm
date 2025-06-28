const { Supplier } = require('../models/sequelize');

// Simple supplier controller that bypasses association issues
exports.getSuppliers = async (req, res) => {
  try {
    console.log('🔍 Simple supplier fetch with query:', req.query);
    
    const whereClause = {};
    
    // Handle status filter
    if (req.query.status) {
      whereClause.status = req.query.status;
    }
    
    // Handle supplier type filter
    if (req.query.supplierType) {
      whereClause.supplierType = req.query.supplierType;
    }
    
    const suppliers = await Supplier.findAll({
      where: whereClause,
      attributes: [
        'id', 
        'supplierNumber',
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
    
    // Format response to match expected structure
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
};