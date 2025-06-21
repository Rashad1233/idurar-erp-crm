const { User, StorageLocation, BinLocation, Inventory } = require('../models/sequelize');
const jwt = require('jsonwebtoken');

/**
 * Comprehensive Warehouse API Debugger
 * This utility helps identify exactly where errors occur in the warehouse management system
 */
class WarehouseDebugger {
  constructor() {
    this.debugLogs = [];
    this.startTime = Date.now();
  }

  log(level, message, data = null) {
    const timestamp = Date.now() - this.startTime;
    const logEntry = {
      timestamp,
      level,
      message,
      data: data ? JSON.stringify(data, null, 2) : null,
      time: new Date().toISOString()
    };
    
    this.debugLogs.push(logEntry);
    console.log(`[${level.toUpperCase()}] [+${timestamp}ms] ${message}`, data || '');
  }

  async testDatabaseConnection() {
    this.log('info', 'Testing database connection...');
    try {
      const { sequelize } = require('../models/sequelize');
      await sequelize.authenticate();
      this.log('success', 'Database connection successful');
      return true;
    } catch (error) {
      this.log('error', 'Database connection failed', { error: error.message });
      return false;
    }
  }

  async testModelDefinitions() {
    this.log('info', 'Testing model definitions...');
    try {
      // Test if models are properly defined
      const models = [
        { name: 'User', model: User },
        { name: 'StorageLocation', model: StorageLocation },
        { name: 'BinLocation', model: BinLocation },
        { name: 'Inventory', model: Inventory }
      ];

      for (const { name, model } of models) {
        if (!model) {
          this.log('error', `Model ${name} is not defined`);
          return false;
        }
        
        // Test basic model operations
        try {
          await model.findAll({ limit: 1 });
          this.log('success', `Model ${name} is working correctly`);
        } catch (error) {
          this.log('error', `Model ${name} failed basic query`, { error: error.message });
          return false;
        }
      }
      
      return true;
    } catch (error) {
      this.log('error', 'Model definitions test failed', { error: error.message });
      return false;
    }
  }

  async testModelAssociations() {
    this.log('info', 'Testing model associations...');
    try {
      // Test BinLocation associations
      const binLocationWithAssociations = await BinLocation.findOne({
        include: [
          {
            model: StorageLocation,
            as: 'storageLocation',
            required: false
          },
          {
            model: User,
            as: 'createdBy',
            required: false
          }
        ],
        limit: 1
      });
      
      this.log('success', 'BinLocation associations are working', {
        hasStorageLocation: !!binLocationWithAssociations?.storageLocation,
        hasCreatedBy: !!binLocationWithAssociations?.createdBy
      });
      
      return true;
    } catch (error) {
      this.log('error', 'Model associations test failed', { error: error.message });
      return false;
    }
  }

  async testAuthenticationToken(token) {
    this.log('info', 'Testing authentication token...');
    try {
      if (!token) {
        this.log('error', 'No token provided');
        return { valid: false, reason: 'No token provided' };
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      this.log('success', 'Token verification successful', { userId: decoded.id });

      // Check if user exists
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        this.log('error', 'User not found for token');
        return { valid: false, reason: 'User not found' };
      }

      this.log('success', 'User found for token', { 
        userId: user.id, 
        userEmail: user.email 
      });
      
      return { valid: true, user };
    } catch (error) {
      this.log('error', 'Token validation failed', { error: error.message });
      return { valid: false, reason: error.message };
    }
  }

  async testBinLocationEndpoint(token = null, storageLocationId = null) {
    this.log('info', 'Testing bin location endpoint logic...');
    
    try {
      // Simulate the controller logic step by step
      this.log('info', 'Step 1: Checking query parameters', { storageLocationId });
      
      // Validate storageLocationId if provided
      if (storageLocationId) {
        this.log('info', 'Step 2: Validating storage location ID');
        const storageLocation = await StorageLocation.findByPk(storageLocationId);
        if (!storageLocation) {
          this.log('error', 'Storage location not found', { storageLocationId });
          return { success: false, error: 'Storage location not found' };
        }
        this.log('success', 'Storage location found', { 
          id: storageLocation.id, 
          code: storageLocation.code 
        });
      }

      // Build where clause
      const whereClause = {};
      if (storageLocationId) {
        whereClause.storageLocationId = storageLocationId;
      }
      this.log('info', 'Step 3: Building where clause', { whereClause });

      // Test the actual query
      this.log('info', 'Step 4: Executing bin locations query');
      const bins = await BinLocation.findAll({
        where: whereClause,
        include: [
          {
            model: StorageLocation,
            as: 'storageLocation',
            attributes: ['id', 'code', 'description']
          },          {
            model: User,
            as: 'createdBy',
            attributes: ['id', 'name', 'email']
          }
        ],
        order: [['binCode', 'ASC']]
      });

      this.log('success', 'Bin locations query successful', { 
        count: bins.length,
        firstBin: bins[0] ? {
          id: bins[0].id,
          binCode: bins[0].binCode,
          hasStorageLocation: !!bins[0].storageLocation,
          hasCreatedBy: !!bins[0].createdBy
        } : null
      });

      return { success: true, data: bins, count: bins.length };
    } catch (error) {
      this.log('error', 'Bin location endpoint test failed', { 
        error: error.message,
        stack: error.stack 
      });
      return { success: false, error: error.message };
    }
  }

  async runFullDiagnostic(token = null, storageLocationId = null) {
    this.log('info', '=== Starting Full Warehouse Diagnostic ===');
    
    const results = {
      databaseConnection: false,
      modelDefinitions: false,
      modelAssociations: false,
      authentication: null,
      binLocationEndpoint: null,
      summary: {
        passed: 0,
        failed: 0,
        issues: []
      }
    };

    // Test database connection
    results.databaseConnection = await this.testDatabaseConnection();
    if (results.databaseConnection) {
      results.summary.passed++;
    } else {
      results.summary.failed++;
      results.summary.issues.push('Database connection failed');
    }

    // Test model definitions
    if (results.databaseConnection) {
      results.modelDefinitions = await this.testModelDefinitions();
      if (results.modelDefinitions) {
        results.summary.passed++;
      } else {
        results.summary.failed++;
        results.summary.issues.push('Model definitions failed');
      }
    }

    // Test model associations
    if (results.modelDefinitions) {
      results.modelAssociations = await this.testModelAssociations();
      if (results.modelAssociations) {
        results.summary.passed++;
      } else {
        results.summary.failed++;
        results.summary.issues.push('Model associations failed');
      }
    }

    // Test authentication if token provided
    if (token) {
      results.authentication = await this.testAuthenticationToken(token);
      if (results.authentication.valid) {
        results.summary.passed++;
      } else {
        results.summary.failed++;
        results.summary.issues.push(`Authentication failed: ${results.authentication.reason}`);
      }
    }

    // Test bin location endpoint
    if (results.modelAssociations) {
      results.binLocationEndpoint = await this.testBinLocationEndpoint(token, storageLocationId);
      if (results.binLocationEndpoint.success) {
        results.summary.passed++;
      } else {
        results.summary.failed++;
        results.summary.issues.push(`Bin location endpoint failed: ${results.binLocationEndpoint.error}`);
      }
    }

    this.log('info', '=== Diagnostic Complete ===', {
      passed: results.summary.passed,
      failed: results.summary.failed,
      issues: results.summary.issues
    });

    return {
      results,
      logs: this.debugLogs,
      duration: Date.now() - this.startTime
    };
  }

  generateReport(diagnosticResults) {
    const { results, logs, duration } = diagnosticResults;
    
    let report = '\n=== WAREHOUSE DIAGNOSTIC REPORT ===\n';
    report += `Duration: ${duration}ms\n`;
    report += `Tests Passed: ${results.summary.passed}\n`;
    report += `Tests Failed: ${results.summary.failed}\n\n`;

    if (results.summary.issues.length > 0) {
      report += 'ISSUES FOUND:\n';
      results.summary.issues.forEach((issue, index) => {
        report += `${index + 1}. ${issue}\n`;
      });
      report += '\n';
    }

    report += 'DETAILED RESULTS:\n';
    report += `✓ Database Connection: ${results.databaseConnection ? 'PASS' : 'FAIL'}\n`;
    report += `✓ Model Definitions: ${results.modelDefinitions ? 'PASS' : 'FAIL'}\n`;
    report += `✓ Model Associations: ${results.modelAssociations ? 'PASS' : 'FAIL'}\n`;
    
    if (results.authentication) {
      report += `✓ Authentication: ${results.authentication.valid ? 'PASS' : 'FAIL'}\n`;
    }
    
    if (results.binLocationEndpoint) {
      report += `✓ Bin Location Endpoint: ${results.binLocationEndpoint.success ? 'PASS' : 'FAIL'}\n`;
    }

    report += '\n=== DETAILED LOGS ===\n';
    logs.forEach(log => {
      report += `[${log.level.toUpperCase()}] [+${log.timestamp}ms] ${log.message}\n`;
      if (log.data) {
        report += `${log.data}\n`;
      }
    });

    return report;
  }
}

module.exports = WarehouseDebugger;
