const { RequestForQuotation } = require('./backend/models/sequelize');

console.log('Current RFQ status enum values:');
console.log(RequestForQuotation.rawAttributes.status.values);
