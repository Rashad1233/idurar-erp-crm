const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Comprehensive Delete Functionality Debugger
class DeleteFunctionalityDebugger {
    constructor() {
        this.baseURL = 'http://localhost:8888';
        this.frontendURL = 'http://localhost:3000';
        this.debugLog = [];
        this.testResults = {
            backend: {},
            frontend: {},
            routes: {},
            authentication: {},
            database: {}
        };
    }

    log(message, type = 'INFO') {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [${type}] ${message}`;
        console.log(logEntry);
        this.debugLog.push(logEntry);
    }

    async testBackendServer() {
        this.log('=== TESTING BACKEND SERVER ===', 'HEADER');
        
        try {
            const response = await axios.get(`${this.baseURL}/api/health`);
            this.log(`✅ Backend server is running on port 8888`);
            this.testResults.backend.serverRunning = true;
        } catch (error) {
            this.log(`❌ Backend server is not responding: ${error.message}`, 'ERROR');
            this.testResults.backend.serverRunning = false;
            
            // Try alternative health check
            try {
                const altResponse = await axios.get(`${this.baseURL}/`);
                this.log(`✅ Backend server responding on root endpoint`);
                this.testResults.backend.serverRunning = true;
            } catch (altError) {
                this.log(`❌ Backend server completely unreachable`, 'ERROR');
            }
        }
    }

    async testRouteRegistration() {
        this.log('=== TESTING ROUTE REGISTRATION ===', 'HEADER');
        
        // Check if inventory routes are registered
        const routesToTest = [
            { method: 'GET', path: '/api/inventory', description: 'Get all inventory items' },
            { method: 'POST', path: '/api/inventory', description: 'Create inventory item' },
            { method: 'GET', path: '/api/inventory/test-id', description: 'Get specific inventory item' },
            { method: 'PUT', path: '/api/inventory/test-id', description: 'Update inventory item' },
            { method: 'DELETE', path: '/api/inventory/test-id', description: 'Delete inventory item' }
        ];

        for (const route of routesToTest) {
            try {
                const config = {
                    method: route.method.toLowerCase(),
                    url: `${this.baseURL}${route.path}`,
                    timeout: 5000,
                    validateStatus: function (status) {
                        // Accept any status code except 404 (route not found)
                        return status !== 404;
                    }
                };

                const response = await axios(config);
                this.log(`✅ Route ${route.method} ${route.path} is registered (Status: ${response.status})`);
                this.testResults.routes[`${route.method}_${route.path}`] = {
                    registered: true,
                    status: response.status
                };
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    this.log(`❌ Route ${route.method} ${route.path} NOT FOUND (404)`, 'ERROR');
                    this.testResults.routes[`${route.method}_${route.path}`] = {
                        registered: false,
                        status: 404
                    };
                } else {
                    this.log(`⚠️  Route ${route.method} ${route.path} exists but returned error: ${error.message}`, 'WARN');
                    this.testResults.routes[`${route.method}_${route.path}`] = {
                        registered: true,
                        status: error.response?.status || 'unknown',
                        error: error.message
                    };
                }
            }
        }
    }

    async testAuthentication() {
        this.log('=== TESTING AUTHENTICATION ===', 'HEADER');
        
        try {
            // Try to access a protected route without authentication
            const response = await axios.get(`${this.baseURL}/api/inventory`);
            this.log(`⚠️  Inventory route accessible without authentication (Status: ${response.status})`, 'WARN');
            this.testResults.authentication.required = false;
        } catch (error) {
            if (error.response && error.response.status === 401) {
                this.log(`✅ Authentication is properly enforced (401 Unauthorized)`);
                this.testResults.authentication.required = true;
            } else {
                this.log(`❌ Unexpected error testing authentication: ${error.message}`, 'ERROR');
                this.testResults.authentication.error = error.message;
            }
        }

        // Test login endpoint
        try {
            const loginResponse = await axios.post(`${this.baseURL}/api/auth/login`, {
                email: 'test@example.com',
                password: 'testpassword'
            });
            this.log(`✅ Login endpoint is accessible`);
            this.testResults.authentication.loginEndpoint = true;
        } catch (error) {
            this.log(`⚠️  Login endpoint test: ${error.response?.status || error.message}`, 'WARN');
            this.testResults.authentication.loginEndpoint = false;
        }
    }

    async testFrontendServer() {
        this.log('=== TESTING FRONTEND SERVER ===', 'HEADER');
        
        try {
            const response = await axios.get(this.frontendURL, { timeout: 5000 });
            this.log(`✅ Frontend server is running on port 3000`);
            this.testResults.frontend.serverRunning = true;
        } catch (error) {
            this.log(`❌ Frontend server is not responding: ${error.message}`, 'ERROR');
            this.testResults.frontend.serverRunning = false;
        }
    }

    async analyzeBackendFiles() {
        this.log('=== ANALYZING BACKEND FILES ===', 'HEADER');
        
        const filesToCheck = [
            {
                path: 'backend/controllers/inventoryController.js',
                checkFor: ['deleteInventory', 'exports.deleteInventory'],
                description: 'Inventory Controller'
            },
            {
                path: 'backend/routes/inventoryRoutes.js',
                checkFor: ['deleteInventory', '.delete(', 'DELETE'],
                description: 'Inventory Routes'
            },
            {
                path: 'backend/src/index.js',
                checkFor: ['/api/inventory', 'inventoryRoutes'],
                description: 'Main Server File'
            }
        ];

        for (const file of filesToCheck) {
            try {
                const fullPath = path.join('c:\\Users\\rasha\\Desktop\\test erp', file.path);
                
                if (fs.existsSync(fullPath)) {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    this.log(`✅ File exists: ${file.path}`);
                    
                    const foundItems = [];
                    for (const searchTerm of file.checkFor) {
                        if (content.includes(searchTerm)) {
                            foundItems.push(searchTerm);
                        }
                    }
                    
                    if (foundItems.length > 0) {
                        this.log(`✅ ${file.description} contains: ${foundItems.join(', ')}`);
                        this.testResults.backend[file.description] = {
                            exists: true,
                            hasRequiredContent: true,
                            foundItems
                        };
                    } else {
                        this.log(`❌ ${file.description} missing required content: ${file.checkFor.join(', ')}`, 'ERROR');
                        this.testResults.backend[file.description] = {
                            exists: true,
                            hasRequiredContent: false,
                            missingItems: file.checkFor
                        };
                    }
                } else {
                    this.log(`❌ File not found: ${file.path}`, 'ERROR');
                    this.testResults.backend[file.description] = {
                        exists: false
                    };
                }
            } catch (error) {
                this.log(`❌ Error reading ${file.path}: ${error.message}`, 'ERROR');
            }
        }
    }

    async analyzeFrontendFiles() {
        this.log('=== ANALYZING FRONTEND FILES ===', 'HEADER');
        
        const filesToCheck = [
            {
                path: 'frontend/src/services/inventoryService.js',
                checkFor: ['deleteInventory', 'DELETE', '/inventory/'],
                description: 'Inventory Service'
            },
            {
                path: 'frontend/src/pages/Inventory/index.jsx',
                checkFor: ['DeleteOutlined', 'deleteInventory', 'delete'],
                description: 'Inventory Page'
            }
        ];

        for (const file of filesToCheck) {
            try {
                const fullPath = path.join('c:\\Users\\rasha\\Desktop\\test erp', file.path);
                
                if (fs.existsSync(fullPath)) {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    this.log(`✅ File exists: ${file.path}`);
                    
                    const foundItems = [];
                    for (const searchTerm of file.checkFor) {
                        if (content.includes(searchTerm)) {
                            foundItems.push(searchTerm);
                        }
                    }
                    
                    if (foundItems.length > 0) {
                        this.log(`✅ ${file.description} contains: ${foundItems.join(', ')}`);
                        this.testResults.frontend[file.description] = {
                            exists: true,
                            hasRequiredContent: true,
                            foundItems
                        };
                    } else {
                        this.log(`❌ ${file.description} missing required content: ${file.checkFor.join(', ')}`, 'ERROR');
                        this.testResults.frontend[file.description] = {
                            exists: true,
                            hasRequiredContent: false,
                            missingItems: file.checkFor
                        };
                    }
                } else {
                    this.log(`❌ File not found: ${file.path}`, 'ERROR');
                    this.testResults.frontend[file.description] = {
                        exists: false
                    };
                }
            } catch (error) {
                this.log(`❌ Error reading ${file.path}: ${error.message}`, 'ERROR');
            }
        }
    }

    async testWithSampleData() {
        this.log('=== TESTING WITH SAMPLE DATA ===', 'HEADER');
        
        // This would require authentication, so we'll simulate the test
        this.log('⚠️  Sample data testing requires authentication - skipping for now', 'WARN');
        this.log('📝 To test with real data:');
        this.log('   1. Login to the frontend application');
        this.log('   2. Navigate to inventory page');
        this.log('   3. Try to delete an inventory item');
        this.log('   4. Check browser console for errors');
        this.log('   5. Check backend server logs for requests');
    }

    generateReport() {
        this.log('=== GENERATING DIAGNOSTIC REPORT ===', 'HEADER');
        
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                backendServer: this.testResults.backend.serverRunning ? '✅ Running' : '❌ Not Running',
                frontendServer: this.testResults.frontend.serverRunning ? '✅ Running' : '❌ Not Running',
                routesRegistered: Object.values(this.testResults.routes).some(r => r.registered) ? '✅ Some Routes Found' : '❌ No Routes Found',
                authenticationEnabled: this.testResults.authentication.required ? '✅ Enabled' : '⚠️  Disabled/Unknown'
            },
            details: this.testResults,
            logs: this.debugLog,
            recommendations: this.generateRecommendations()
        };

        // Save report to file
        const reportPath = path.join('c:\\Users\\rasha\\Desktop\\test erp', 'delete-functionality-debug-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        this.log(`📄 Full report saved to: ${reportPath}`);

        return report;
    }

    generateRecommendations() {
        const recommendations = [];

        // Check backend server
        if (!this.testResults.backend.serverRunning) {
            recommendations.push({
                priority: 'HIGH',
                issue: 'Backend server not running',
                solution: 'Start the backend server using: cd backend && npm start'
            });
        }

        // Check DELETE route registration
        const deleteRouteKey = Object.keys(this.testResults.routes).find(key => key.includes('DELETE'));
        if (deleteRouteKey && !this.testResults.routes[deleteRouteKey].registered) {
            recommendations.push({
                priority: 'HIGH',
                issue: 'DELETE route not registered',
                solution: 'Check inventoryRoutes.js - ensure DELETE route is properly defined and imported'
            });
        }

        // Check file existence
        Object.entries(this.testResults.backend).forEach(([key, value]) => {
            if (typeof value === 'object' && !value.exists) {
                recommendations.push({
                    priority: 'HIGH',
                    issue: `Missing file: ${key}`,
                    solution: 'Ensure all required backend files exist'
                });
            }
        });

        return recommendations;
    }

    async runFullDiagnostic() {
        this.log('🔍 STARTING COMPREHENSIVE DELETE FUNCTIONALITY DIAGNOSTIC', 'HEADER');
        this.log('='.repeat(60), 'HEADER');

        await this.testBackendServer();
        await this.testFrontendServer();
        await this.analyzeBackendFiles();
        await this.analyzeFrontendFiles();
        await this.testRouteRegistration();
        await this.testAuthentication();
        await this.testWithSampleData();

        const report = this.generateReport();

        this.log('='.repeat(60), 'HEADER');
        this.log('📊 DIAGNOSTIC SUMMARY', 'HEADER');
        this.log('='.repeat(60), 'HEADER');
        
        Object.entries(report.summary).forEach(([key, value]) => {
            this.log(`${key}: ${value}`);
        });

        this.log('\n📋 RECOMMENDATIONS:', 'HEADER');
        report.recommendations.forEach((rec, index) => {
            this.log(`${index + 1}. [${rec.priority}] ${rec.issue}`);
            this.log(`   Solution: ${rec.solution}`);
        });

        return report;
    }
}

// Run the diagnostic
async function main() {
    const diagnostic = new DeleteFunctionalityDebugger();
    try {
        await diagnostic.runFullDiagnostic();
    } catch (error) {
        console.error('Diagnostic failed:', error);
    }
}

if (require.main === module) {
    main();
}

module.exports = DeleteFunctionalityDebugger;
