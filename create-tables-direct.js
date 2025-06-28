const sequelize = require('./backend/config/postgresql');
const { DataTypes } = require('sequelize');

async function createTables() {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Create Items table
    const Items = sequelize.define('Items', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      description: DataTypes.TEXT,
      sku: {
        type: DataTypes.STRING(100),
        unique: true
      },
      barcode: DataTypes.STRING(100),
      category: DataTypes.STRING(100),
      unit: DataTypes.STRING(50),
      price: DataTypes.DECIMAL(15, 2),
      cost: DataTypes.DECIMAL(15, 2),
      stock_quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      min_stock_level: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    }, {
      tableName: 'items',
      timestamps: true,
      underscored: true
    });

    // Create Customers table
    const Customers = sequelize.define('Customers', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      email: DataTypes.STRING(255),
      phone: DataTypes.STRING(50),
      address: DataTypes.TEXT,
      city: DataTypes.STRING(100),
      state: DataTypes.STRING(100),
      postal_code: DataTypes.STRING(20),
      country: DataTypes.STRING(100),
      contact_person: DataTypes.STRING(255),
      tax_id: DataTypes.STRING(100),
      payment_terms: DataTypes.STRING(100),
      credit_limit: DataTypes.DECIMAL(15, 2),
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    }, {
      tableName: 'customers',
      timestamps: true,
      underscored: true
    });

    // Create Sales Orders table
    const SalesOrders = sequelize.define('SalesOrders', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      order_number: {
        type: DataTypes.STRING(100),
        unique: true
      },
      customer_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'customers',
          key: 'id'
        }
      },
      order_date: DataTypes.DATE,
      delivery_date: DataTypes.DATE,
      status: {
        type: DataTypes.STRING(50),
        defaultValue: 'draft'
      },
      subtotal: DataTypes.DECIMAL(15, 2),
      tax_amount: DataTypes.DECIMAL(15, 2),
      total_amount: DataTypes.DECIMAL(15, 2),
      currency: {
        type: DataTypes.STRING(10),
        defaultValue: 'USD'
      },
      notes: DataTypes.TEXT,
      created_by: {
        type: DataTypes.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        }
      }
    }, {
      tableName: 'sales_orders',
      timestamps: true,
      underscored: true
    });

    // Create Sales Order Items table
    const SalesOrderItems = sequelize.define('SalesOrderItems', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      sales_order_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'sales_orders',
          key: 'id'
        }
      },
      item_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'items',
          key: 'id'
        }
      },
      description: DataTypes.TEXT,
      quantity: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false
      },
      unit_price: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
      },
      total_price: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
      }
    }, {
      tableName: 'sales_order_items',
      timestamps: true,
      underscored: true
    });

    // Sync tables
    console.log('🏗️ Creating tables...');
    await Items.sync({ force: false });
    console.log('✅ Items table created');
    
    await Customers.sync({ force: false });
    console.log('✅ Customers table created');
    
    await SalesOrders.sync({ force: false });
    console.log('✅ Sales Orders table created');
    
    await SalesOrderItems.sync({ force: false });
    console.log('✅ Sales Order Items table created');

    // Add sample data
    console.log('📝 Adding sample data...');
    
    // Sample items
    await Items.bulkCreate([
      {
        name: 'Laptop Computer',
        description: 'Dell Latitude 5520',
        sku: 'LAP-001',
        barcode: '1234567890123',
        category: 'Electronics',
        unit: 'piece',
        price: 1200.00,
        cost: 900.00,
        stock_quantity: 10
      },
      {
        name: 'Office Chair',
        description: 'Ergonomic office chair',
        sku: 'CHR-001',
        barcode: '1234567890124',
        category: 'Furniture',
        unit: 'piece',
        price: 250.00,
        cost: 180.00,
        stock_quantity: 5
      },
      {
        name: 'Printer Paper',
        description: 'A4 white paper 500 sheets',
        sku: 'PPR-001',
        barcode: '1234567890125',
        category: 'Office Supplies',
        unit: 'ream',
        price: 15.00,
        cost: 12.00,
        stock_quantity: 50
      }
    ], { ignoreDuplicates: true });

    // Sample customers
    await Customers.bulkCreate([
      {
        name: 'ABC Corporation',
        email: 'contact@abc-corp.com',
        phone: '+1-555-0123',
        address: '123 Business Ave',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        contact_person: 'John Smith'
      },
      {
        name: 'XYZ Ltd',
        email: 'info@xyz-ltd.com',
        phone: '+1-555-0124',
        address: '456 Commerce St',
        city: 'Los Angeles',
        state: 'CA',
        country: 'USA',
        contact_person: 'Jane Doe'
      },
      {
        name: 'Global Tech Solutions',
        email: 'sales@globaltech.com',
        phone: '+1-555-0125',
        address: '789 Tech Blvd',
        city: 'Austin',
        state: 'TX',
        country: 'USA',
        contact_person: 'Mike Johnson'
      }
    ], { ignoreDuplicates: true });

    console.log('✅ Sample data added successfully');
    console.log('🎉 All tables created and populated!');

  } catch (error) {
    console.error('❌ Error creating tables:', error);
  } finally {
    await sequelize.close();
  }
}

createTables();
