require('module-alias/register');
const path = require('path');
const { testDatabaseConnection } = require('../utils/database');

// Make sure we are running node 20+
const [major] = process.versions.node.split('.').map(parseFloat);
if (major < 20) {
  console.log('Please upgrade your node.js version to 20 or greater. 👌\n ');
  process.exit();
}

// import environmental variables
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

const app = require('./app');
app.set('port', process.env.PORT || 8888);

// Test database connection before starting the server
(async () => {
  try {
    const isConnected = await testDatabaseConnection();
    if (!isConnected) {
      console.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }

    const server = app.listen(app.get('port'), () => {
      console.log(`Express running → On PORT : ${server.address().port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();
