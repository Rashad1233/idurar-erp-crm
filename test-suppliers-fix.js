const { exec } = require('child_process');
const path = require('path');

console.log('🚀 Testing Suppliers Table Fix...\n');

// Function to run backend server and capture output
function testBackendServer() {
    return new Promise((resolve, reject) => {
        console.log('📡 Starting backend server...');
        
        const backendPath = path.join(__dirname, 'backend');
        const serverProcess = exec('npm start', {
            cwd: backendPath,
            timeout: 30000 // 30 seconds timeout
        });

        let output = '';
        let errorOutput = '';
        let hasStarted = false;
        let hasFailed = false;

        serverProcess.stdout.on('data', (data) => {
            output += data;
            console.log(`📤 STDOUT: ${data}`);
            
            // Check for successful startup
            if (data.includes('Server running on port') || 
                data.includes('Database connection established') ||
                data.includes('listening on port')) {
                hasStarted = true;
                console.log('✅ Server started successfully!');
                setTimeout(() => {
                    serverProcess.kill();
                    resolve({ success: true, output, errorOutput });
                }, 2000);
            }
        });

        serverProcess.stderr.on('data', (data) => {
            errorOutput += data;
            console.log(`📥 STDERR: ${data}`);
            
            // Check for foreign key constraint errors
            if (data.includes('foreign key constraint') || 
                data.includes('incompatible types') ||
                data.includes('SequelizeDatabaseError')) {
                hasFailed = true;
                console.log('❌ Foreign key constraint error detected!');
                serverProcess.kill();
                resolve({ success: false, output, errorOutput, error: 'Foreign key constraint error' });
            }
        });

        serverProcess.on('close', (code) => {
            if (!hasStarted && !hasFailed) {
                console.log(`⚠️ Server process exited with code ${code}`);
                resolve({ success: false, output, errorOutput, error: `Process exited with code ${code}` });
            }
        });

        serverProcess.on('error', (error) => {
            console.log(`💥 Server process error: ${error.message}`);
            reject({ success: false, output, errorOutput, error: error.message });
        });
    });
}

// Function to check if Suppliers table exists with correct structure
async function checkSuppliersTable() {
    const { Sequelize } = require('./backend/node_modules/sequelize');
    require('dotenv').config({ path: './backend/.env' });

    const sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        logging: false
    });

    try {
        console.log('🔍 Checking Suppliers table structure...');
        
        const [results] = await sequelize.query(`
            SELECT 
                column_name,
                data_type,
                is_nullable,
                column_default,
                character_maximum_length
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
                AND table_name = 'Suppliers'
            ORDER BY ordinal_position;
        `);

        if (results.length === 0) {
            console.log('❌ Suppliers table does not exist!');
            return { exists: false };
        }

        console.log('📋 Suppliers table structure:');
        console.table(results);

        // Check if id column is UUID
        const idColumn = results.find(col => col.column_name === 'id');
        if (!idColumn) {
            console.log('❌ No id column found in Suppliers table!');
            return { exists: true, hasUuidId: false };
        }

        const hasUuidId = idColumn.data_type === 'uuid';
        console.log(`🔑 ID column type: ${idColumn.data_type} ${hasUuidId ? '✅' : '❌'}`);

        // Check foreign key constraints
        const [constraints] = await sequelize.query(`
            SELECT 
                tc.constraint_name,
                tc.table_name,
                kcu.column_name,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY' 
                AND tc.table_name = 'Suppliers';
        `);

        console.log('\n🔗 Foreign key constraints:');
        console.table(constraints);

        return { 
            exists: true, 
            hasUuidId, 
            columns: results, 
            constraints 
        };

    } catch (error) {
        console.error('💥 Error checking Suppliers table:', error.message);
        return { exists: false, error: error.message };
    } finally {
        await sequelize.close();
    }
}

// Main test function
async function runTest() {
    try {
        console.log('='.repeat(60));
        console.log('🧪 SUPPLIERS TABLE FIX TEST');
        console.log('='.repeat(60));

        // Step 1: Check Suppliers table structure
        const tableCheck = await checkSuppliersTable();
        
        if (!tableCheck.exists) {
            console.log('❌ TEST FAILED: Suppliers table does not exist!');
            console.log('📝 Please create the Suppliers table in pgAdmin first.');
            return;
        }

        if (!tableCheck.hasUuidId) {
            console.log('❌ TEST FAILED: Suppliers table id column is not UUID type!');
            console.log('📝 Please recreate the Suppliers table with UUID primary key.');
            return;
        }

        console.log('✅ Suppliers table exists with UUID primary key!');

        // Step 2: Test backend server startup
        console.log('\n' + '='.repeat(40));
        console.log('🚀 TESTING BACKEND SERVER STARTUP');
        console.log('='.repeat(40));

        const serverTest = await testBackendServer();

        console.log('\n' + '='.repeat(60));
        console.log('📊 TEST RESULTS');
        console.log('='.repeat(60));

        if (serverTest.success) {
            console.log('✅ SUCCESS: Backend server started without foreign key errors!');
            console.log('🎉 The Suppliers table UUID fix worked!');
            console.log('\n📝 Next steps:');
            console.log('1. ✅ Suppliers table created with UUID primary key');
            console.log('2. ✅ Backend server starts without constraint errors');
            console.log('3. 🔄 Test Purchase Requisition API endpoints');
            console.log('4. 🔄 Test Purchase Requisition frontend page');
        } else {
            console.log('❌ FAILED: Backend server failed to start');
            console.log('💥 Error:', serverTest.error);
            console.log('\n🔍 Error details:');
            console.log('STDOUT:', serverTest.output);
            console.log('STDERR:', serverTest.errorOutput);
        }

    } catch (error) {
        console.error('💥 Test failed with error:', error);
    }
}

// Run the test
runTest();
